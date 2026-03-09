export interface MarketIndex {
  id: string;
  name: string;
  code: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface FundFlow {
  label: string;
  inflow: number;
  outflow: number;
}

export interface Sector {
  id: string;
  name: string;
  changePercent: number;
  volume: string;
}

export interface WatchlistStock {
  id: string;
  name: string;
  code: string;
  fullName?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  category?: 'index' | 'stock' | 'futures' | 'crypto' | 'forex' | 'etf';
  logoColor?: string;
  logoText?: string;
  timeframe?: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  annualReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  status: 'running' | 'paused' | 'completed';
  winRate: number;
  tradeCount: number;
  createdAt: string;
}

export interface Factor {
  id: string;
  name: string;
  category: string;
  description: string;
  performance: number;
  icon: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'price' | 'indicator' | 'fund_flow' | 'news';
  timestamp: string;
  isRead: boolean;
  stockCode?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  positions: number;
}

export interface CandleData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  time: string;
  date: string;
  source: string;
  title: string;
  sourceIcon?: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatarColor: string;
  avatarText: string;
  date: string;
  symbol: string;
  symbolColor: string;
  direction: 'up' | 'down';
  title: string;
  likes: number;
  comments: number;
  chartColors: { primary: string; secondary: string };
}

export interface MarketCard {
  id: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  changePercent: number;
  chartData: number[];
  logoColor: string;
  logoText: string;
}

export interface ExploreCategory {
  id: string;
  label: string;
}

export interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  country: string;
  countryFlag: string;
  importance: 'low' | 'medium' | 'high';
  actual?: string;
  forecast?: string;
  previous: string;
  status: 'upcoming' | 'released';
}

export interface Broker {
  id: string;
  name: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER';
  category: string;
  rating: number;
  reviews: string;
  users: string;
  maxLeverage: string;
  logoColor: string;
  logoText: string;
  featured: boolean;
}

export type USSectorKey = 'technology' | 'healthcare' | 'financials' | 'energy' | 'consumer_disc' | 'consumer_staples' | 'industrials' | 'materials' | 'utilities' | 'real_estate' | 'communication' | 'semiconductor' | 'clean_energy' | 'cybersecurity' | 'precious_metals' | 'crypto' | 'biotech' | 'aerospace';

export interface TrendMapping {
  id: string;
  usSignal: string;
  usCode: string;
  usChange: number;
  usVolatility: number;
  usSector: USSectorKey;
  domesticSector: string;
  domesticOpportunity: string;
  lagHours: number;
  confidence: number;
  status: 'active' | 'triggered' | 'expired';
  timestamp: string;
  hitRate: number;
  totalTriggers: number;
  successfulTriggers: number;
}

export interface ExecutionStrategy {
  id: string;
  name: string;
  trigger: string;
  action: string;
  budgetRatio: number;
  budgetDelta: number;
  certainty: number;
  status: 'executing' | 'pending' | 'hedged' | 'paused';
  enabled: boolean;
  sectorKey: USSectorKey;
  lastExecuted?: string;
  executionCount: number;
}

export interface AnomalyAlert {
  id: string;
  type: 'divergence' | 'irrational' | 'blackswan';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  anchorData: string;
  timestamp: string;
  intercepted: boolean;
  sectorKey: USSectorKey;
  actionTaken?: string;
}

export interface SelfImprovementLog {
  id: string;
  timestamp: string;
  type: 'accuracy_update' | 'model_retrain' | 'threshold_adjust' | 'new_pattern';
  description: string;
  before: number;
  after: number;
  sectorKey: USSectorKey;
}

export interface GlobalTickerItem {
  id: string;
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: 'index' | 'crypto' | 'futures' | 'forex';
}

export interface SectorCorrelation {
  id: string;
  usEtf: string;
  usName: string;
  usSector: USSectorKey;
  usChange: number;
  cnSector: string;
  cnEtf: string;
  cnName: string;
  cnChange: number;
  correlation: number;
  divergence: number;
  signal: 'aligned' | 'diverging' | 'leading' | 'lagging';
}

export interface GlobalAssetCategory {
  id: string;
  category: string;
  assets: GlobalAssetItem[];
}

export interface GlobalAssetItem {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'index' | 'etf' | 'currency' | 'bond' | 'crypto' | 'futures' | 'options';
}

export interface CommunityUser {
  id: string;
  name: string;
  avatarColor: string;
  avatarText: string;
  badge?: 'PREMIUM' | 'PRO' | 'VIP';
  bio: string;
  postsCount: number;
  followers: number;
  following: number;
  isFollowed: boolean;
  socialLinks: { platform: string; handle: string }[];
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  avatarColor: string;
  avatarText: string;
  content: string;
  date: string;
  likes: number;
}
