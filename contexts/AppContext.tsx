import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  simulateGTRTick,
  simulateExecutionTick,
  simulateAnomalyTick,
  simulateTickerItems,
  simulateSectorCorrelations,
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
  dataSource: 'tushare',
  refreshInterval: 5,
  pushNotifications: true,
  priceAlerts: true,
  indicatorAlerts: true,
  fundFlowAlerts: true,
  newsAlerts: true,
};

function simulateMarketIndices(items: MarketIndex[]): MarketIndex[] {
  return items.map((item) => {
    const fluctuation = (Math.random() - 0.48) * item.value * 0.005;
    return {
      ...item,
      value: Math.round((item.value + fluctuation) * 100) / 100,
      change: Math.round(fluctuation * 100) / 100,
      changePercent: Math.round((fluctuation / item.value) * 10000) / 100,
    };
  });
}

function simulateWatchlist(items: WatchlistStock[]): WatchlistStock[] {
  return items.map((item) => {
    const fluctuation = (Math.random() - 0.48) * item.price * 0.005;
    return {
      ...item,
      price: Math.round((item.price + fluctuation) * 100) / 100,
      change: Math.round(fluctuation * 100) / 100,
      changePercent: Math.round((fluctuation / item.price) * 10000) / 100,
    };
  });
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();

  const [watchlist, setWatchlist] = useState<WatchlistStock[]>(initialWatchlist);
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [alertsList, setAlertsList] = useState<Alert[]>(initialAlerts);
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(initialPortfolio);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(initialIndices);
  const [fundFlows] = useState<FundFlow[]>(initialFundFlows);
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [factors] = useState<Factor[]>(initialFactors);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        return { ...a, intercepted: true, actionTaken: '\u5df2\u624b\u52a8\u62e6\u622a\uff0c\u76f8\u5173\u7b56\u7565\u5df2\u6682\u505c' };
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

  const tickMarketData = useCallback(() => {
    setMarketIndices((prev) => simulateMarketIndices(prev));
    setWatchlist((prev) => simulateWatchlist(prev));
    setSectors((prev) =>
      prev.map((s) => ({
        ...s,
        changePercent:
          Math.round((s.changePercent + (Math.random() - 0.48) * 0.3) * 100) / 100,
      }))
    );
    setPortfolio((prev) => {
      const dailyChange = Math.round((Math.random() - 0.4) * 5000 * 100) / 100;
      return {
        ...prev,
        dailyPnL: dailyChange,
        dailyPnLPercent: Math.round((dailyChange / prev.totalValue) * 10000) / 100,
        totalValue: Math.round((prev.totalValue + dailyChange) * 100) / 100,
      };
    });
    setGtrMappings((prev) => simulateGTRTick(prev));
    setGtrExecutions((prev) => simulateExecutionTick(prev));
    setGtrAnomalies((prev) => simulateAnomalyTick(prev));
    setGlobalTicker((prev) => simulateTickerItems(prev));
    setSectorCorrelations((prev) => simulateSectorCorrelations(prev));
  }, []);

  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    tickInterval.current = setInterval(() => {
      tickMarketData();
      console.log('[AppContext] Real-time tick');
    }, 3000);
    return () => {
      if (tickInterval.current) clearInterval(tickInterval.current);
    };
  }, [tickMarketData]);

  const refreshMarketData = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    tickMarketData();
    setIsRefreshing(false);
    console.log('[AppContext] Market data refreshed');
  }, [tickMarketData]);

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
  }), [
    watchlist, strategies, alertsList, portfolio, marketIndices, fundFlows,
    sectors, factors, settings, isSubscribed, isRefreshing,
    addToWatchlist, removeFromWatchlist, isInWatchlist,
    markAlertRead, markAllAlertsRead, deleteAlert, toggleStrategyStatus,
    updateSettings, subscribe, refreshMarketData,
    gtrMappings, gtrExecutions, gtrAnomalies, gtrSILogs,
    toggleGtrExecution, interceptAnomaly, dismissAnomaly, adjustBudgetRatio,
    globalTicker, sectorCorrelations,
  ]);
});
