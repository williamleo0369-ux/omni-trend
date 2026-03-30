import { useState, useCallback, useEffect, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  watchlistStocks as initialWatchlist,
  strategies as initialStrategies,
  alerts as initialAlerts,
  portfolioSummary as initialPortfolio,
  marketIndices as initialIndices,
  fundFlows as initialFundFlows,
  sectors as initialSectors,
  factors as initialFactors,
  trendMappings as initialMappings,
  executionStrategies as initialExecStrategies,
  anomalyAlerts as initialAnomalyAlerts,
  selfImprovementLogs as initialSILogs,
  globalTickerItems as initialTickerItems,
  sectorCorrelations as initialCorrelations,
} from '@/mocks/market';
import {
  WatchlistStock,
  Strategy,
  Alert,
  PortfolioSummary,
  MarketIndex,
  FundFlow,
  Sector,
  Factor,
  TrendMapping,
  ExecutionStrategy,
  AnomalyAlert,
  SelfImprovementLog,
  GlobalTickerItem,
  SectorCorrelation,
} from '@/types/market';
import {
  fetchBatchQuotesFinnhub,
  fetchAlphaVantageQuote,
  normalizeAlphaVantageQuote,
  NormalizedQuote,
  FINNHUB_SYMBOLS,
} from '@/services/marketApi';
import { isUSMarketOpen, MarketStatus } from '@/components/MarketStatusBanner';

export interface AppSettings {
  apiStatus: 'connected' | 'disconnected' | 'error';
  dataSource: string;
  refreshInterval: number;
  pushNotifications: boolean;
  priceAlerts: boolean;
  indicatorAlerts: boolean;
  fundFlowAlerts: boolean;
  newsAlerts: boolean;
}

const defaultSettings: AppSettings = {
  apiStatus: 'connected',
  dataSource: 'finnhub+alphavantage',
  refreshInterval: 15,
  pushNotifications: true,
  priceAlerts: true,
  indicatorAlerts: true,
  fundFlowAlerts: true,
  newsAlerts: true,
};

const WATCHLIST_SYMBOL_MAP: Record<string, string> = {
  'SPX': 'SPY',
  'AAPL': 'AAPL',
  'TSLA': 'TSLA',
};

const TICKER_SYMBOL_MAP: Record<string, string> = {
  'QQQ': 'QQQ',
  'SPY': 'SPY',
  'DIA': 'DIA',
  'IWM': 'IWM',
};

const INDEX_SYMBOL_MAP: Record<string, string> = {
  'IXIC': 'QQQ',
};

function applyQuoteToWatchlist(
  items: WatchlistStock[],
  quotes: Map<string, NormalizedQuote>
): WatchlistStock[] {
  return items.map((item) => {
    const mappedSymbol = WATCHLIST_SYMBOL_MAP[item.code];
    const quote = mappedSymbol ? quotes.get(mappedSymbol) : quotes.get(item.code);
    if (!quote) return item;
    return {
      ...item,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
    };
  });
}

function applyQuoteToTicker(
  items: GlobalTickerItem[],
  quotes: Map<string, NormalizedQuote>
): GlobalTickerItem[] {
  return items.map((item) => {
    const mappedSymbol = TICKER_SYMBOL_MAP[item.code];
    const quote = mappedSymbol ? quotes.get(mappedSymbol) : quotes.get(item.code);
    if (!quote) return item;
    return {
      ...item,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
    };
  });
}

function applyQuoteToIndices(
  items: MarketIndex[],
  quotes: Map<string, NormalizedQuote>
): MarketIndex[] {
  return items.map((item) => {
    const mappedSymbol = INDEX_SYMBOL_MAP[item.code];
    const quote = mappedSymbol ? quotes.get(mappedSymbol) : quotes.get(item.code);
    if (!quote) return item;
    return {
      ...item,
      value: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
    };
  });
}

function getAllFetchableSymbols(
  watchlist: WatchlistStock[],
  ticker: GlobalTickerItem[],
  indices: MarketIndex[]
): string[] {
  const symbols = new Set<string>();

  watchlist.forEach((s) => {
    const mapped = WATCHLIST_SYMBOL_MAP[s.code];
    if (mapped) symbols.add(mapped);
    else if ((FINNHUB_SYMBOLS as readonly string[]).includes(s.code)) symbols.add(s.code);
  });

  ticker.forEach((t) => {
    const mapped = TICKER_SYMBOL_MAP[t.code];
    if (mapped) symbols.add(mapped);
    else if ((FINNHUB_SYMBOLS as readonly string[]).includes(t.code)) symbols.add(t.code);
  });

  indices.forEach((idx) => {
    const mapped = INDEX_SYMBOL_MAP[idx.code];
    if (mapped) symbols.add(mapped);
  });

  (FINNHUB_SYMBOLS as readonly string[]).forEach((s) => symbols.add(s));

  return Array.from(symbols);
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();

  const [watchlist, setWatchlist] = useState<WatchlistStock[]>(initialWatchlist);
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [alertsList, setAlertsList] = useState<Alert[]>(initialAlerts);
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(initialPortfolio);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(initialIndices);
  const [fundFlows] = useState<FundFlow[]>(initialFundFlows);
  const [sectors] = useState<Sector[]>(initialSectors);
  const [factors] = useState<Factor[]>(initialFactors);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(() => {
    return isUSMarketOpen() ? 'loading' : 'closed';
  });

  const [gtrMappings, setGtrMappings] = useState<TrendMapping[]>(initialMappings);
  const [gtrExecutions, setGtrExecutions] = useState<ExecutionStrategy[]>(initialExecStrategies);
  const [gtrAnomalies, setGtrAnomalies] = useState<AnomalyAlert[]>(initialAnomalyAlerts);
  const [gtrSILogs, _setGtrSILogs] = useState<SelfImprovementLog[]>(initialSILogs);

  const [globalTicker, setGlobalTicker] = useState<GlobalTickerItem[]>(initialTickerItems);
  const [sectorCorrelations, setSectorCorrelations] = useState<SectorCorrelation[]>(initialCorrelations);

  const settingsQuery = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('app-settings');
      return stored ? JSON.parse(stored) as AppSettings : defaultSettings;
    },
  });

  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('subscription');
      return stored === 'true';
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    if (subscriptionQuery.data !== undefined) {
      setIsSubscribed(subscriptionQuery.data);
    }
  }, [subscriptionQuery.data]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: AppSettings) => {
      await AsyncStorage.setItem('app-settings', JSON.stringify(newSettings));
      return newSettings;
    },
    onSuccess: (data) => {
      setSettings(data);
      void queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });
  const { mutate: mutateSaveSettings } = saveSettingsMutation;

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.setItem('subscription', 'true');
      return true;
    },
    onSuccess: () => {
      setIsSubscribed(true);
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
  const { mutate: mutateSubscribe } = subscribeMutation;

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...partial };
    mutateSaveSettings(newSettings);
  }, [settings, mutateSaveSettings]);

  const subscribe = useCallback(() => {
    mutateSubscribe();
  }, [mutateSubscribe]);

  const addToWatchlist = useCallback((stock: WatchlistStock) => {
    setWatchlist((prev) => {
      if (prev.find((s) => s.id === stock.id)) return prev;
      const updated = [...prev, stock];
      void AsyncStorage.setItem('watchlist-ids', JSON.stringify(updated.map((s) => s.id)));
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((stockId: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((s) => s.id !== stockId);
      void AsyncStorage.setItem('watchlist-ids', JSON.stringify(updated.map((s) => s.id)));
      return updated;
    });
  }, []);

  const isInWatchlist = useCallback((stockId: string) => {
    return watchlist.some((s) => s.id === stockId);
  }, [watchlist]);

  const markAlertRead = useCallback((alertId: string) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlertsList((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }, []);

  const deleteAlert = useCallback((alertId: string) => {
    setAlertsList((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const toggleStrategyStatus = useCallback((strategyId: string) => {
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id !== strategyId) return s;
        const nextStatus: Record<Strategy['status'], Strategy['status']> = {
          running: 'paused',
          paused: 'running',
          completed: 'completed',
        };
        return { ...s, status: nextStatus[s.status] };
      })
    );
  }, []);

  const toggleGtrExecution = useCallback((id: string) => {
    setGtrExecutions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newEnabled = !s.enabled;
        const newStatus: ExecutionStrategy['status'] = newEnabled ? (s.status === 'paused' ? 'pending' : s.status) : 'paused';
        return { ...s, enabled: newEnabled, status: newStatus };
      })
    );
    console.log(`[GTR] Toggled execution: ${id}`);
  }, []);

  const interceptAnomaly = useCallback((id: string) => {
    setGtrAnomalies((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        return { ...a, intercepted: true, actionTaken: '已手动拦截，相关策略已暂停' };
      })
    );
    console.log(`[GTR] Intercepted anomaly: ${id}`);
  }, []);

  const dismissAnomaly = useCallback((id: string) => {
    setGtrAnomalies((prev) => prev.filter((a) => a.id !== id));
    console.log(`[GTR] Dismissed anomaly: ${id}`);
  }, []);

  const adjustBudgetRatio = useCallback((id: string, delta: number) => {
    setGtrExecutions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newRatio = Math.max(0, Math.min(100, s.budgetRatio + delta));
        return { ...s, budgetRatio: newRatio };
      })
    );
    console.log(`[GTR] Adjusted budget for ${id}: ${delta > 0 ? '+' : ''}${delta}%`);
  }, []);

  const marketQuotesQuery = useQuery({
    queryKey: ['market-quotes-finnhub'],
    queryFn: async () => {
      const symbols = getAllFetchableSymbols(watchlist, globalTicker, marketIndices);
      console.log(`[AppContext] Fetching ${symbols.length} symbols from Finnhub...`);
      const quotes = await fetchBatchQuotesFinnhub(symbols);
      return quotes;
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const alphaVantageQuery = useQuery({
    queryKey: ['market-quotes-alphavantage'],
    queryFn: async () => {
      console.log('[AppContext] Fetching SPY from Alpha Vantage...');
      const spyQuote = await fetchAlphaVantageQuote('SPY');
      if (spyQuote) {
        return normalizeAlphaVantageQuote(spyQuote);
      }
      return null;
    },
    refetchInterval: 60000,
    staleTime: 55000,
  });

  useEffect(() => {
    const quotes = marketQuotesQuery.data;
    if (!quotes || quotes.size === 0) return;

    console.log(`[AppContext] Applying ${quotes.size} Finnhub quotes to state`);

    setWatchlist((prev) => applyQuoteToWatchlist(prev, quotes));
    setGlobalTicker((prev) => applyQuoteToTicker(prev, quotes));
    setMarketIndices((prev) => applyQuoteToIndices(prev, quotes));

    setPortfolio((prev) => {
      const spyQuote = quotes.get('SPY');
      if (spyQuote) {
        const dailyChange = Math.round(spyQuote.changePercent * prev.totalValue / 100);
        return {
          ...prev,
          dailyPnL: dailyChange,
          dailyPnLPercent: spyQuote.changePercent,
          totalValue: Math.round((prev.totalValue + dailyChange) * 100) / 100,
        };
      }
      return prev;
    });

    setSectorCorrelations((prev) =>
      prev.map((item) => {
        const usQuote = quotes.get(item.usEtf);
        if (!usQuote) return item;
        const newUsChange = usQuote.changePercent;
        const newDivergence = Math.round((newUsChange - item.cnChange) * 100) / 100;
        let newSignal: SectorCorrelation['signal'] = item.signal;
        if (Math.abs(newDivergence) < 1) newSignal = 'aligned';
        else if (newDivergence > 3) newSignal = 'leading';
        else if (newDivergence < -1) newSignal = 'lagging';
        else newSignal = 'diverging';
        return { ...item, usChange: newUsChange, divergence: newDivergence, signal: newSignal, correlation: Math.max(0.1, Math.min(0.99, item.correlation)) };
      })
    );

    setGtrMappings((prev) =>
      prev.map((m) => {
        const usQuote = quotes.get(m.usCode);
        if (!usQuote) return m;
        return { ...m, usChange: usQuote.changePercent };
      })
    );

    setSettings((prev) => {
      if (prev.apiStatus !== 'connected') {
        return { ...prev, apiStatus: 'connected' };
      }
      return prev;
    });

    setMarketStatus(isUSMarketOpen() ? 'open' : 'closed');
  }, [marketQuotesQuery.data]);

  useEffect(() => {
    const avQuote = alphaVantageQuery.data;
    if (!avQuote) return;
    console.log(`[AppContext] Alpha Vantage SPY data applied: price=${avQuote.price}`);
  }, [alphaVantageQuery.data]);

  useEffect(() => {
    if (marketQuotesQuery.isError) {
      console.log('[AppContext] Finnhub query error, marking API as error');
      setSettings((prev) => ({ ...prev, apiStatus: 'error' }));
      setMarketStatus('error');
    }
  }, [marketQuotesQuery.isError]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (marketStatus !== 'error') {
        const newStatus = isUSMarketOpen() ? 'open' : 'closed';
        setMarketStatus(newStatus);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [marketStatus]);

  const refreshMarketData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['market-quotes-finnhub'] });
      await queryClient.invalidateQueries({ queryKey: ['market-quotes-alphavantage'] });
      console.log('[AppContext] Market data refreshed via API');
    } catch (err) {
      console.log('[AppContext] Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return useMemo(() => ({
    watchlist,
    strategies,
    alertsList,
    portfolio,
    marketIndices,
    fundFlows,
    sectors,
    factors,
    settings,
    isSubscribed,
    isRefreshing,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    markAlertRead,
    markAllAlertsRead,
    deleteAlert,
    toggleStrategyStatus,
    updateSettings,
    subscribe,
    refreshMarketData,
    gtrMappings,
    gtrExecutions,
    gtrAnomalies,
    gtrSILogs,
    toggleGtrExecution,
    interceptAnomaly,
    dismissAnomaly,
    adjustBudgetRatio,
    globalTicker,
    sectorCorrelations,
    marketStatus,
  }), [
    watchlist, strategies, alertsList, portfolio, marketIndices, fundFlows,
    sectors, factors, settings, isSubscribed, isRefreshing,
    addToWatchlist, removeFromWatchlist, isInWatchlist,
    markAlertRead, markAllAlertsRead, deleteAlert, toggleStrategyStatus,
    updateSettings, subscribe, refreshMarketData,
    gtrMappings, gtrExecutions, gtrAnomalies, gtrSILogs,
    toggleGtrExecution, interceptAnomaly, dismissAnomaly, adjustBudgetRatio,
    globalTicker, sectorCorrelations, marketStatus,
  ]);
});
