import { MarketIndex, FundFlow, Sector, WatchlistStock, Strategy, Factor, Alert, PortfolioSummary, NewsItem, CommunityPost, MarketCard, ExploreCategory, CandleData, CalendarEvent, Broker, TrendMapping, ExecutionStrategy, AnomalyAlert, SelfImprovementLog, USSectorKey, CommunityUser, PostComment } from '@/types/market';

export const marketIndices: MarketIndex[] = [
  { id: '1', name: '上证指数', code: 'SH000001', value: 3342.68, change: 28.45, changePercent: 0.86 },
  { id: '2', name: '深证成指', code: 'SZ399001', value: 10856.32, change: -45.12, changePercent: -0.41 },
  { id: '3', name: '创业板指', code: 'SZ399006', value: 2156.78, change: 18.92, changePercent: 0.88 },
  { id: '4', name: '纳斯达克', code: 'IXIC', value: 18432.15, change: 156.78, changePercent: 0.86 },
  { id: '5', name: 'COMEX黄金', code: 'GC', value: 2648.30, change: 12.40, changePercent: 0.47 },
  { id: '6', name: '恒生指数', code: 'HSI', value: 18012.45, change: -89.23, changePercent: -0.49 },
];

export const fundFlows: FundFlow[] = [
  { label: '超大单', inflow: 182.5, outflow: -156.3 },
  { label: '大单', inflow: 245.8, outflow: -312.4 },
  { label: '中单', inflow: 168.2, outflow: -142.7 },
  { label: '小单', inflow: 356.1, outflow: -289.6 },
];

export const sectors: Sector[] = [
  { id: '1', name: '半导体', changePercent: 3.25, volume: '186亿' },
  { id: '2', name: '新能源', changePercent: 2.18, volume: '245亿' },
  { id: '3', name: '人工智能', changePercent: 4.56, volume: '312亿' },
  { id: '4', name: '医药生物', changePercent: -1.23, volume: '98亿' },
  { id: '5', name: '白酒', changePercent: -0.87, volume: '67亿' },
  { id: '6', name: '银行', changePercent: 0.45, volume: '156亿' },
  { id: '7', name: '券商', changePercent: 1.92, volume: '134亿' },
  { id: '8', name: '军工', changePercent: 2.78, volume: '89亿' },
  { id: '9', name: '地产', changePercent: -2.15, volume: '45亿' },
  { id: '10', name: '汽车', changePercent: 1.56, volume: '178亿' },
  { id: '11', name: '光伏', changePercent: 3.12, volume: '203亿' },
  { id: '12', name: '消费电子', changePercent: -0.34, volume: '92亿' },
];

export const watchlistStocks: WatchlistStock[] = [
  { id: 'idx-1', name: '上证综合指数', code: '000001', fullName: '上证综合指数', price: 4082.4740, change: -40.2020, changePercent: -0.98, volume: '3862亿', category: 'index', logoColor: '#1E3A5F', logoText: '沪', timeframe: 'D' },
  { id: 'idx-2', name: '深证综指', code: '399106', fullName: '深证综指', price: 2641.7895, change: -14.0213, changePercent: -0.53, volume: '4521亿', category: 'index', logoColor: '#2D5F9A', logoText: 'SZSE', timeframe: 'D' },
  { id: 'idx-3', name: '香港恒生指数', code: 'HSI', fullName: '香港恒生指数', price: 25249.49, change: -518.60, changePercent: -2.01, volume: '1823亿', category: 'index', logoColor: '#C41E3A', logoText: '恒', timeframe: 'D' },
  { id: 'idx-4', name: '标准普尔500指数', code: 'SPX', fullName: '标准普尔500指数', price: 6841.37, change: 24.74, changePercent: 0.36, volume: '—', category: 'index', logoColor: '#E8731A', logoText: '500', timeframe: 'D' },
  { id: 'idx-5', name: '美元指数', code: 'DXY', fullName: '美元指数', price: 98.957, change: -0.114, changePercent: -0.12, volume: '—', category: 'index', logoColor: '#2E7D32', logoText: '$', timeframe: 'D' },
  { id: 'stk-1', name: 'Tencent Holdings Ltd', code: '700', fullName: 'Tencent Holdings Ltd', price: 506.0, change: -4.5, changePercent: -0.88, volume: '1.8万手', category: 'stock', logoColor: '#00A3A3', logoText: 'T', timeframe: 'D' },
  { id: 'stk-2', name: 'Alibaba Group Holding Limit...', code: '9988', fullName: 'Alibaba Group Holding Limited', price: 129.9, change: -4.9, changePercent: -3.64, volume: '5.2万手', category: 'stock', logoColor: '#E85D1A', logoText: 'A', timeframe: 'D' },
  { id: 'stk-3', name: '贵州茅台', code: '600519', fullName: '贵州茅台', price: 1401.18, change: -25.01, changePercent: -1.75, volume: '2.3万手', category: 'stock', logoColor: '#B71C1C', logoText: '茅', timeframe: 'D' },
  { id: 'stk-4', name: 'Apple Inc', code: 'AAPL', fullName: 'Apple Inc', price: 262.71, change: -1.04, changePercent: -0.39, volume: '45.6M', category: 'stock', logoColor: '#1C1C1E', logoText: '', timeframe: 'D' },
  { id: 'stk-5', name: 'Tesla, Inc.', code: 'TSLA', fullName: 'Tesla, Inc.', price: 400.55, change: 8.12, changePercent: 2.07, volume: '78.3M', category: 'stock', logoColor: '#CC0000', logoText: 'T', timeframe: 'D' },
  { id: 'fut-1', name: 'COMEX黄金', code: 'GC', fullName: 'COMEX Gold Futures', price: 2648.30, change: 12.40, changePercent: 0.47, volume: '186K', category: 'futures', logoColor: '#C8902E', logoText: 'Au', timeframe: 'D' },
  { id: 'fut-2', name: 'WTI原油', code: 'CL', fullName: 'WTI Crude Oil Futures', price: 76.82, change: -1.23, changePercent: -1.58, volume: '342K', category: 'futures', logoColor: '#4A4A4A', logoText: 'CL', timeframe: 'D' },
  { id: 'fut-3', name: '白银', code: 'SI', fullName: 'COMEX Silver Futures', price: 31.45, change: 0.67, changePercent: 2.18, volume: '98K', category: 'futures', logoColor: '#9E9E9E', logoText: 'Ag', timeframe: 'D' },
];

export const etfStocks: WatchlistStock[] = [
  { id: 'etf-1', name: '沪深300ETF', code: '510300', fullName: '华泰柏瑞沪深300ETF', price: 3.892, change: -0.023, changePercent: -0.59, volume: '28.6亿', category: 'etf', logoColor: '#1A73E8', logoText: '300', timeframe: 'D' },
  { id: 'etf-2', name: '中证500ETF', code: '510500', fullName: '南方中证500ETF', price: 5.634, change: 0.045, changePercent: 0.80, volume: '12.3亿', category: 'etf', logoColor: '#E65100', logoText: '500', timeframe: 'D' },
  { id: 'etf-3', name: '创业板ETF', code: '159915', fullName: '易方达创业板ETF', price: 2.156, change: 0.018, changePercent: 0.84, volume: '9.8亿', category: 'etf', logoColor: '#7B1FA2', logoText: '创', timeframe: 'D' },
  { id: 'etf-4', name: '科创50ETF', code: '588000', fullName: '华夏科创50ETF', price: 0.876, change: -0.012, changePercent: -1.35, volume: '15.2亿', category: 'etf', logoColor: '#00695C', logoText: '科', timeframe: 'D' },
  { id: 'etf-5', name: '半导体ETF', code: '512480', fullName: '国联安半导体ETF', price: 1.245, change: 0.056, changePercent: 4.71, volume: '22.1亿', category: 'etf', logoColor: '#283593', logoText: '芯', timeframe: 'D' },
  { id: 'etf-6', name: '新能源ETF', code: '516160', fullName: '华夏新能源ETF', price: 0.632, change: -0.008, changePercent: -1.25, volume: '6.7亿', category: 'etf', logoColor: '#2E7D32', logoText: '新', timeframe: 'D' },
  { id: 'etf-7', name: '医药ETF', code: '512010', fullName: '易方达沪深300医药卫生ETF', price: 0.456, change: -0.003, changePercent: -0.65, volume: '4.5亿', category: 'etf', logoColor: '#C62828', logoText: '医', timeframe: 'D' },
  { id: 'etf-8', name: '军工ETF', code: '512660', fullName: '国泰中证军工ETF', price: 1.089, change: 0.032, changePercent: 3.03, volume: '8.9亿', category: 'etf', logoColor: '#37474F', logoText: '军', timeframe: 'D' },
  { id: 'etf-9', name: '黄金ETF', code: '518880', fullName: '华安黄金ETF', price: 6.234, change: 0.078, changePercent: 1.27, volume: '11.4亿', category: 'etf', logoColor: '#C8902E', logoText: 'Au', timeframe: 'D' },
  { id: 'etf-10', name: '纳指ETF', code: '513100', fullName: '国泰纳斯达克100ETF', price: 1.876, change: 0.015, changePercent: 0.81, volume: '7.2亿', category: 'etf', logoColor: '#1565C0', logoText: 'QQQ', timeframe: 'D' },
  { id: 'etf-11', name: '恒生ETF', code: '159920', fullName: '华夏恒生ETF', price: 1.342, change: -0.028, changePercent: -2.04, volume: '5.1亿', category: 'etf', logoColor: '#C41E3A', logoText: '恒', timeframe: 'D' },
  { id: 'etf-12', name: '证券ETF', code: '512880', fullName: '国泰中证全指证券公司ETF', price: 0.987, change: 0.021, changePercent: 2.17, volume: '18.6亿', category: 'etf', logoColor: '#AD1457', logoText: '券', timeframe: 'D' },
];

export const strategies: Strategy[] = [
  {
    id: '1', name: '动量因子轮动', description: '基于多因子动量信号的行业轮动策略，月度调仓',
    annualReturn: 24.5, sharpeRatio: 1.82, maxDrawdown: -12.3, status: 'running',
    winRate: 62.5, tradeCount: 156, createdAt: '2024-03-15',
  },
  {
    id: '2', name: '均值回归Alpha', description: '利用价格偏离均值的统计特征进行配对交易',
    annualReturn: 18.2, sharpeRatio: 2.15, maxDrawdown: -8.7, status: 'running',
    winRate: 58.3, tradeCount: 243, createdAt: '2024-01-20',
  },
  {
    id: '3', name: 'CTA趋势跟踪', description: '基于移动平均线交叉的商品期货趋势策略',
    annualReturn: 31.8, sharpeRatio: 1.45, maxDrawdown: -18.6, status: 'paused',
    winRate: 45.2, tradeCount: 89, createdAt: '2023-11-08',
  },
  {
    id: '4', name: '市场中性对冲', description: '多空等量配置，对冲系统性风险获取Alpha收益',
    annualReturn: 12.6, sharpeRatio: 2.68, maxDrawdown: -4.2, status: 'running',
    winRate: 71.4, tradeCount: 312, createdAt: '2024-06-01',
  },
  {
    id: '5', name: '事件驱动套利', description: '捕捉财报发布、政策变动等事件驱动的短期机会',
    annualReturn: 36.4, sharpeRatio: 1.23, maxDrawdown: -22.1, status: 'completed',
    winRate: 52.8, tradeCount: 67, createdAt: '2024-02-14',
  },
];

export const factors: Factor[] = [
  { id: '1', name: 'PE估值因子', category: '价值', description: '基于市盈率的价值评估', performance: 8.5, icon: 'trending-down' },
  { id: '2', name: 'ROE质量因子', category: '质量', description: '净资产收益率衡量企业盈利能力', performance: 12.3, icon: 'award' },
  { id: '3', name: '动量因子', category: '动量', description: '近期价格动量趋势延续性', performance: 15.7, icon: 'zap' },
  { id: '4', name: '波动率因子', category: '风险', description: '低波动率异象下的风险溢价', performance: 6.2, icon: 'activity' },
  { id: '5', name: '换手率因子', category: '流动性', description: '交易活跃度与流动性溢价', performance: -2.1, icon: 'repeat' },
  { id: '6', name: '市值因子', category: '规模', description: '小市值溢价效应', performance: 9.8, icon: 'layers' },
];

export const alerts: Alert[] = [
  { id: '1', title: '中芯国际突破前高', description: '688981 股价突破 56.50 前高阻力位', type: 'price', timestamp: '2026-03-04 14:32', isRead: false, stockCode: '688981' },
  { id: '2', title: '半导体板块资金异动', description: '半导体板块30分钟内主力净流入超过15亿', type: 'fund_flow', timestamp: '2026-03-04 13:45', isRead: false },
  { id: '3', title: '比亚迪MACD金叉', description: '002594 日线MACD形成金叉信号', type: 'indicator', timestamp: '2026-03-04 11:30', isRead: true, stockCode: '002594' },
  { id: '4', title: '宁德时代跌破支撑', description: '300750 跌破200日均线支撑位', type: 'price', timestamp: '2026-03-04 10:15', isRead: true, stockCode: '300750' },
  { id: '5', title: '新能源政策利好', description: '国务院发布新能源产业发展规划，利好光伏、储能板块', type: 'news', timestamp: '2026-03-03 20:00', isRead: true },
];

export const portfolioSummary: PortfolioSummary = {
  totalValue: 1256780.45,
  dailyPnL: 8956.32,
  dailyPnLPercent: 0.72,
  totalReturn: 156780.45,
  totalReturnPercent: 14.25,
  positions: 12,
};

export const quickCommands = [
  { id: '1', label: '基本面分析', prompt: '请帮我分析一下当前A股市场的基本面情况' },
  { id: '2', label: '技术指标解读', prompt: '请解释一下MACD指标的含义和使用方法' },
  { id: '3', label: '夏普比率', prompt: '什么是夏普比率？如何用它评估投资组合的表现？' },
  { id: '4', label: '资金流向', prompt: '请分析今日两市主力资金流向及其对后市的影响' },
  { id: '5', label: '板块轮动', prompt: '当前市场热点板块有哪些？板块轮动趋势如何？' },
  { id: '6', label: '风险评估', prompt: '如何评估当前投资组合的风险水平？' },
];

export const newsItems: NewsItem[] = [
  { id: '1', time: '22:59', date: '3月4日', source: 'PANews', title: '白宫将审议商品期货交易委员会提出的新预测市场措施' },
  { id: '2', time: '22:56', date: '3月4日', source: 'Reuters', title: '前 HF Sinclair 首席执行官 戈 (Tim Go) 辞去塞拉尼斯董事职务' },
  { id: '3', time: '22:45', date: '3月4日', source: '财联社', title: 'A股三大指数集体收跌，半导体板块逆势走强' },
  { id: '4', time: '22:30', date: '3月4日', source: 'Bloomberg', title: '美联储官员暗示可能在今年晚些时候降息' },
  { id: '5', time: '22:15', date: '3月4日', source: '证券时报', title: '北向资金今日净买入超50亿元，连续三日净流入' },
  { id: '6', time: '21:58', date: '3月4日', source: 'CNBC', title: '特斯拉Q1交付量超预期，股价盘后上涨3%' },
  { id: '7', time: '21:40', date: '3月4日', source: '新浪财经', title: '黄金期货创历史新高，避险情绪持续升温' },
];

export const communityPosts: CommunityPost[] = [
  {
    id: '1', author: 'KakarottoGoku', avatarColor: '#E8731A', avatarText: 'K',
    date: '3月3日', symbol: 'BTCUSDT', symbolColor: '#F7931A', direction: 'down',
    title: '分形几何思维解读市场，结构也是分形',
    likes: 8, comments: 1, chartColors: { primary: '#12B76A', secondary: '#F04438' },
  },
  {
    id: '2', author: 'Angel-btctrader', avatarColor: '#9C27B0', avatarText: 'A',
    date: '11小时', symbol: 'EURUSD', symbolColor: '#1A73E8', direction: 'down',
    title: '欧元兑美元关键支撑位分析，三角形态即将突破',
    likes: 15, comments: 4, chartColors: { primary: '#F04438', secondary: '#12B76A' },
  },
  {
    id: '3', author: 'TraderWang88', avatarColor: '#1A73E8', avatarText: 'T',
    date: '6小时', symbol: '000001', symbolColor: '#C41E3A', direction: 'up',
    title: '上证指数周线级别支撑有效，反弹在即',
    likes: 23, comments: 7, chartColors: { primary: '#F04438', secondary: '#12B76A' },
  },
  {
    id: '4', author: 'QuantMaster', avatarColor: '#00897B', avatarText: 'Q',
    date: '2小时', symbol: 'AAPL', symbolColor: '#1C1C1E', direction: 'up',
    title: 'Apple 季度财报分析：服务收入增长强劲',
    likes: 45, comments: 12, chartColors: { primary: '#12B76A', secondary: '#F04438' },
  },
  {
    id: '5', author: 'CryptoNinja', avatarColor: '#FF6F00', avatarText: 'C',
    date: '1小时', symbol: 'ETHUSD', symbolColor: '#627EEA', direction: 'down',
    title: 'ETH 费用市场变化与 Layer2 生态影响',
    likes: 32, comments: 8, chartColors: { primary: '#627EEA', secondary: '#F04438' },
  },
];

export const communityUsers: CommunityUser[] = [
  {
    id: 'u1', name: 'KakarottoGoku', avatarColor: '#E8731A', avatarText: 'K',
    badge: 'PREMIUM', bio: 'discord: https://discord.com/users/1044898599974223902\ndiscord ID: jessietrading\n公众号：介喜 Jessie',
    postsCount: 32, followers: 2000, following: 0, isFollowed: false,
    socialLinks: [{ platform: 'X', handle: 'gokuoption' }, { platform: 'YouTube', handle: 'KakarottoGoku' }, { platform: 'Web', handle: 'mp.weixin.qq.com' }],
  },
  {
    id: 'u2', name: 'Angel-btctrader', avatarColor: '#9C27B0', avatarText: 'A',
    badge: 'PRO', bio: '专注BTC/ETH趋势分析\n5年加密货币交易经验\n擅长波段操作与趋势跟踪',
    postsCount: 18, followers: 856, following: 12, isFollowed: false,
    socialLinks: [{ platform: 'X', handle: 'angel_btc' }],
  },
  {
    id: 'u3', name: 'TraderWang88', avatarColor: '#1A73E8', avatarText: 'T',
    bio: 'A股技术分析师\n擅长周线级别趋势判断\n每日复盘分享',
    postsCount: 56, followers: 3200, following: 25, isFollowed: true,
    socialLinks: [{ platform: 'Web', handle: 'traderwang.com' }],
  },
  {
    id: 'u4', name: 'QuantMaster', avatarColor: '#00897B', avatarText: 'Q',
    badge: 'VIP', bio: '量化交易研究员\nCFA持证人\n专注美股基本面+量化模型',
    postsCount: 89, followers: 5600, following: 8, isFollowed: false,
    socialLinks: [{ platform: 'X', handle: 'quantmaster_pro' }, { platform: 'YouTube', handle: 'QuantMasterCN' }],
  },
  {
    id: 'u5', name: 'CryptoNinja', avatarColor: '#FF6F00', avatarText: 'C',
    bio: 'DeFi研究员 | Layer2生态深度参与者\n链上数据分析爱好者',
    postsCount: 41, followers: 1200, following: 34, isFollowed: false,
    socialLinks: [{ platform: 'X', handle: 'crypto_ninja_cn' }],
  },
];

export const postComments: PostComment[] = [
  { id: 'c1', postId: '1', userId: 'u2', userName: 'Angel-btctrader', avatarColor: '#9C27B0', avatarText: 'A', content: '分形理论确实很有意思，BTC的结构和传统市场有很多相似之处', date: '2小时前', likes: 3 },
  { id: 'c2', postId: '2', userId: 'u3', userName: 'TraderWang88', avatarColor: '#1A73E8', avatarText: 'T', content: '欧元这个位置确实关键，关注1.08支撑', date: '5小时前', likes: 7 },
  { id: 'c3', postId: '2', userId: 'u4', userName: 'QuantMaster', avatarColor: '#00897B', avatarText: 'Q', content: '从量化角度看，目前隐含波动率在扩大', date: '3小时前', likes: 5 },
  { id: 'c4', postId: '2', userId: 'u1', userName: 'KakarottoGoku', avatarColor: '#E8731A', avatarText: 'K', content: '同意，这个三角形态很经典', date: '1小时前', likes: 2 },
  { id: 'c5', postId: '2', userId: 'u5', userName: 'CryptoNinja', avatarColor: '#FF6F00', avatarText: 'C', content: '美元走强对欧元压力很大', date: '30分钟前', likes: 1 },
  { id: 'c6', postId: '3', userId: 'u1', userName: 'KakarottoGoku', avatarColor: '#E8731A', avatarText: 'K', content: '周线支撑确实有效，但注意量能配合', date: '4小时前', likes: 8 },
  { id: 'c7', postId: '3', userId: 'u2', userName: 'Angel-btctrader', avatarColor: '#9C27B0', avatarText: 'A', content: '大盘如果反弹，哪些板块会先启动？', date: '3小时前', likes: 4 },
  { id: 'c8', postId: '3', userId: 'u4', userName: 'QuantMaster', avatarColor: '#00897B', avatarText: 'Q', content: '从资金流向看，科技和新能源可能先动', date: '2小时前', likes: 6 },
  { id: 'c9', postId: '4', userId: 'u3', userName: 'TraderWang88', avatarColor: '#1A73E8', avatarText: 'T', content: 'Apple的服务收入占比越来越高，估值逻辑在变', date: '1小时前', likes: 12 },
  { id: 'c10', postId: '4', userId: 'u5', userName: 'CryptoNinja', avatarColor: '#FF6F00', avatarText: 'C', content: '看好长期，但短期估值偏高', date: '45分钟前', likes: 3 },
  { id: 'c11', postId: '5', userId: 'u1', userName: 'KakarottoGoku', avatarColor: '#E8731A', avatarText: 'K', content: 'L2的TVL增长确实在侵蚀主网费用', date: '2小时前', likes: 9 },
  { id: 'c12', postId: '5', userId: 'u4', userName: 'QuantMaster', avatarColor: '#00897B', avatarText: 'Q', content: 'Dencun升级后blob费用下降明显', date: '1小时前', likes: 5 },
];

export const exploreCategories: ExploreCategory[] = [
  { id: '1', label: '股票' },
  { id: '2', label: '加密' },
  { id: '3', label: '期货' },
  { id: '4', label: '外汇' },
  { id: '5', label: '债券' },
  { id: '6', label: 'ETF' },
  { id: '7', label: '经济' },
];

function generateSparkline(points: number, trend: 'up' | 'down' | 'flat'): number[] {
  const data: number[] = [];
  let value = 100;
  for (let i = 0; i < points; i++) {
    const bias = trend === 'up' ? 0.6 : trend === 'down' ? 0.4 : 0.5;
    value += (Math.random() - bias) * 3;
    data.push(Math.round(value * 100) / 100);
  }
  return data;
}

export const exploreMarketCards: MarketCard[] = [
  { id: '1', code: '上证综合...', name: '上证综合指数', price: 4082.4740, currency: 'CNY', changePercent: -0.98, chartData: generateSparkline(30, 'down'), logoColor: '#1E3A5F', logoText: '沪' },
  { id: '2', code: 'SZSE综...', name: 'SZSE综指', price: 2641.7895, currency: 'CNY', changePercent: -0.53, chartData: generateSparkline(30, 'down'), logoColor: '#2D5F9A', logoText: 'SZ' },
  { id: '3', code: 'FTSE A50', name: 'FTSE A50', price: 14496.0, currency: 'CNY', changePercent: -1.60, chartData: generateSparkline(30, 'down'), logoColor: '#7B1FA2', logoText: 'A50' },
  { id: '4', code: '深证成指', name: '深证成指', price: 13917.7520, currency: 'CNY', changePercent: -0.75, chartData: generateSparkline(30, 'down'), logoColor: '#1565C0', logoText: '深' },
  { id: '5', code: '中证1000', name: '中证1000', price: 8094.5183, currency: 'CNY', changePercent: -0.59, chartData: generateSparkline(30, 'flat'), logoColor: '#E65100', logoText: '1000' },
  { id: '6', code: '上证50', name: '上证50', price: 4280.90, currency: 'CNY', changePercent: -0.98, chartData: generateSparkline(30, 'down'), logoColor: '#1E3A5F', logoText: '50' },
];

export const calendarEvents: CalendarEvent[] = [
  { id: 'cal-1', time: '11:35', title: '30-Year JGB Auction', country: '日本', countryFlag: '🇯🇵', importance: 'high', previous: '3.615%', status: 'upcoming' },
  { id: 'cal-2', time: '15:45', title: 'Industrial Production MoM', country: '法国', countryFlag: '🇫🇷', importance: 'medium', actual: '0.5%', forecast: '0.5%', previous: '-0.7%', status: 'released' },
  { id: 'cal-3', time: '16:00', title: 'Industrial Production YoY', country: '西班牙', countryFlag: '🇪🇸', importance: 'medium', actual: '1.7%', forecast: '1.7%', previous: '-0.3%', status: 'released' },
  { id: 'cal-4', time: '16:00', title: 'Unemployment Rate', country: '瑞士', countryFlag: '🇨🇭', importance: 'medium', previous: '3.2', status: 'upcoming' },
  { id: 'cal-5', time: '16:30', title: 'HCOB Construction PMI', country: '德国', countryFlag: '🇩🇪', importance: 'medium', previous: '44.7', status: 'upcoming' },
  { id: 'cal-6', time: '16:30', title: 'HCOB Construction PMI', country: '法国', countryFlag: '🇫🇷', importance: 'low', previous: '43.2', status: 'upcoming' },
  { id: 'cal-7', time: '17:00', title: 'Retail Sales MoM', country: '欧盟', countryFlag: '🇪🇺', importance: 'high', forecast: '0.3%', previous: '-0.2%', status: 'upcoming' },
  { id: 'cal-8', time: '20:15', title: 'ADP Employment Change', country: '美国', countryFlag: '🇺🇸', importance: 'high', forecast: '148K', previous: '183K', status: 'upcoming' },
  { id: 'cal-9', time: '21:30', title: 'Trade Balance', country: '美国', countryFlag: '🇺🇸', importance: 'medium', forecast: '-$68.2B', previous: '-$65.5B', status: 'upcoming' },
  { id: 'cal-10', time: '22:45', title: 'Services PMI', country: '美国', countryFlag: '🇺🇸', importance: 'high', forecast: '51.2', previous: '52.9', status: 'upcoming' },
];

export const brokers: Broker[] = [
  { id: 'b-1', name: 'FOREX.com', tier: 'PLATINUM', category: '外汇', rating: 4.5, reviews: '13.4K', users: '170.1K', maxLeverage: '50:1', logoColor: '#2E7D32', logoText: '€', featured: true },
  { id: 'b-2', name: 'OKX', tier: 'PLATINUM', category: '加密货币', rating: 4.9, reviews: '25.6K', users: '320.5K', maxLeverage: '100:1', logoColor: '#1C1C1E', logoText: 'X', featured: true },
  { id: 'b-3', name: 'Interactive Brokers', tier: 'PLATINUM', category: '股票', rating: 4.7, reviews: '18.2K', users: '250.3K', maxLeverage: '4:1', logoColor: '#C41E3A', logoText: 'IB', featured: true },
  { id: 'b-4', name: 'Binance', tier: 'GOLD', category: '加密货币', rating: 4.6, reviews: '42.1K', users: '890.2K', maxLeverage: '125:1', logoColor: '#F0B90B', logoText: 'B', featured: false },
  { id: 'b-5', name: 'Pepperstone', tier: 'GOLD', category: '外汇', rating: 4.4, reviews: '8.9K', users: '95.7K', maxLeverage: '30:1', logoColor: '#1A73E8', logoText: 'P', featured: false },
  { id: 'b-6', name: 'Futu (富途)', tier: 'GOLD', category: '股票', rating: 4.8, reviews: '15.3K', users: '180.4K', maxLeverage: '4:1', logoColor: '#E8731A', logoText: '富', featured: false },
  { id: 'b-7', name: 'eToro', tier: 'SILVER', category: '股票', rating: 4.2, reviews: '22.5K', users: '350.0K', maxLeverage: '30:1', logoColor: '#00897B', logoText: 'e', featured: false },
  { id: 'b-8', name: 'Bybit', tier: 'GOLD', category: '加密货币', rating: 4.5, reviews: '19.8K', users: '420.1K', maxLeverage: '100:1', logoColor: '#F7931A', logoText: 'By', featured: false },
  { id: 'b-9', name: 'XM', tier: 'SILVER', category: '外汇', rating: 4.3, reviews: '11.2K', users: '130.6K', maxLeverage: '30:1', logoColor: '#283593', logoText: 'XM', featured: false },
  { id: 'b-10', name: 'Tiger Brokers', tier: 'GOLD', category: '股票', rating: 4.6, reviews: '9.7K', users: '110.2K', maxLeverage: '4:1', logoColor: '#FF6F00', logoText: '虎', featured: false },
];

export const fullNewsItems: NewsItem[] = [
  { id: 'n-1', time: '09:45', date: '3月5日', source: 'Reuters', title: '《汇市简讯》美元兑人民币即期走软，人民币中间价创近三年新高' },
  { id: 'n-2', time: '09:42', date: '3月5日', source: 'PANews', title: '消息人士：英美在加密合作问题上存在分歧' },
  { id: 'n-3', time: '09:39', date: '3月5日', source: 'PANews', title: '美国 SOL 现货 ETF 单日总净流入 1906.37 万美元' },
  { id: 'n-4', time: '09:37', date: '3月5日', source: 'Reuters', title: '花旗将 0-3 个月铝合约目标价上调至每吨 3,600 美元' },
  { id: 'n-5', time: '09:34', date: '3月5日', source: 'Reuters', title: '中国股市：沪综指高开，今年经济增速目标下调至 4.5%-5% 区间' },
  { id: 'n-6', time: '09:34', date: '3月5日', source: 'PANews', title: 'Optimism 将于 5 月 31 日停止支持 op-geth 和 op-program' },
  { id: 'n-7', time: '09:31', date: '3月5日', source: 'Reuters', title: '中国汇市：路透测算的人民币汇率 CFETS 指数暂稳' },
  { id: 'n-8', time: '09:28', date: '3月5日', source: 'Bloomberg', title: '日本央行副行长暗示可能加速加息步伐' },
  { id: 'n-9', time: '09:25', date: '3月5日', source: '财联社', title: '两会聚焦科技创新，半导体板块开盘走强' },
  { id: 'n-10', time: '09:20', date: '3月5日', source: 'CNBC', title: '黄金价格再创新高，避险资金持续涌入' },
  { id: 'n-11', time: '09:15', date: '3月5日', source: '证券时报', title: 'A股三大指数高开，北向资金早盘净流入超20亿' },
  { id: 'n-12', time: '09:10', date: '3月5日', source: 'Reuters', title: '欧元区2月制造业PMI终值上修至47.6' },
];

export const US_SECTOR_LABELS: Record<USSectorKey, string> = {
  technology: '科技',
  healthcare: '医疗',
  financials: '金融',
  energy: '能源',
  consumer_disc: '可选消费',
  consumer_staples: '必需消费',
  industrials: '工业',
  materials: '材料',
  utilities: '公用事业',
  real_estate: '房地产',
  communication: '通信',
  semiconductor: '半导体',
  clean_energy: '清洁能源',
  cybersecurity: '网络安全',
  precious_metals: '贵金属',
  crypto: '加密货币',
  biotech: '生物科技',
  aerospace: '航空航天',
};

export const US_SECTOR_COLORS: Record<USSectorKey, string> = {
  technology: '#1A73E8',
  healthcare: '#E91E63',
  financials: '#FF9800',
  energy: '#795548',
  consumer_disc: '#9C27B0',
  consumer_staples: '#4CAF50',
  industrials: '#607D8B',
  materials: '#FF5722',
  utilities: '#00BCD4',
  real_estate: '#8D6E63',
  communication: '#3F51B5',
  semiconductor: '#283593',
  clean_energy: '#2E7D32',
  cybersecurity: '#D32F2F',
  precious_metals: '#C8902E',
  crypto: '#F7931A',
  biotech: '#AD1457',
  aerospace: '#37474F',
};

export const trendMappings: TrendMapping[] = [
  {
    id: 'tm-1', usSignal: '生物抗衰ETF异动', usCode: 'XBI', usChange: 4.82, usVolatility: 32.5, usSector: 'biotech',
    domesticSector: '医美/生物科技', domesticOpportunity: '爱美客、华熙生物等抗衰概念',
    lagHours: 18, confidence: 87, status: 'active', timestamp: '2026-03-07 06:30', hitRate: 78, totalTriggers: 45, successfulTriggers: 35,
  },
  {
    id: 'tm-2', usSignal: 'AI芯片板块资金涌入', usCode: 'SOXX', usChange: 3.14, usVolatility: 28.7, usSector: 'semiconductor',
    domesticSector: '半导体/AI算力', domesticOpportunity: '中芯国际、寒武纪、海光信息',
    lagHours: 14, confidence: 92, status: 'triggered', timestamp: '2026-03-07 05:15', hitRate: 85, totalTriggers: 62, successfulTriggers: 53,
  },
  {
    id: 'tm-3', usSignal: '清洁能源ETF突破前高', usCode: 'ICLN', usChange: 2.67, usVolatility: 21.3, usSector: 'clean_energy',
    domesticSector: '光伏/储能', domesticOpportunity: '隆基绿能、宁德时代、阳光电源',
    lagHours: 22, confidence: 74, status: 'active', timestamp: '2026-03-07 04:45', hitRate: 68, totalTriggers: 38, successfulTriggers: 26,
  },
  {
    id: 'tm-4', usSignal: '网络安全ETF放量上行', usCode: 'HACK', usChange: 1.95, usVolatility: 19.8, usSector: 'cybersecurity',
    domesticSector: '信创/网安', domesticOpportunity: '奇安信、深信服、启明星辰',
    lagHours: 16, confidence: 81, status: 'active', timestamp: '2026-03-07 03:20', hitRate: 72, totalTriggers: 29, successfulTriggers: 21,
  },
  {
    id: 'tm-5', usSignal: '黄金矿业股集体走强', usCode: 'GDX', usChange: 5.12, usVolatility: 35.2, usSector: 'precious_metals',
    domesticSector: '贵金属/避险', domesticOpportunity: '山东黄金、紫金矿业、中金黄金',
    lagHours: 8, confidence: 95, status: 'triggered', timestamp: '2026-03-07 02:10', hitRate: 91, totalTriggers: 55, successfulTriggers: 50,
  },
  {
    id: 'tm-6', usSignal: 'XLK科技板块突破关键位', usCode: 'XLK', usChange: 2.38, usVolatility: 24.1, usSector: 'technology',
    domesticSector: '科技/软件', domesticOpportunity: '金山办公、用友网络、科大讯飞',
    lagHours: 16, confidence: 88, status: 'active', timestamp: '2026-03-07 06:00', hitRate: 82, totalTriggers: 71, successfulTriggers: 58,
  },
  {
    id: 'tm-7', usSignal: 'XLF金融板块资金回流', usCode: 'XLF', usChange: 1.76, usVolatility: 16.5, usSector: 'financials',
    domesticSector: '银行/保险', domesticOpportunity: '招商银行、中国平安、兴业银行',
    lagHours: 20, confidence: 79, status: 'active', timestamp: '2026-03-07 05:45', hitRate: 74, totalTriggers: 48, successfulTriggers: 36,
  },
  {
    id: 'tm-8', usSignal: 'XLE能源板块放量大涨', usCode: 'XLE', usChange: 3.85, usVolatility: 30.2, usSector: 'energy',
    domesticSector: '石油/煤炭', domesticOpportunity: '中国石油、中国神华、中海油',
    lagHours: 12, confidence: 90, status: 'triggered', timestamp: '2026-03-07 04:30', hitRate: 86, totalTriggers: 42, successfulTriggers: 36,
  },
  {
    id: 'tm-9', usSignal: 'XLY可选消费强势反弹', usCode: 'XLY', usChange: 2.15, usVolatility: 22.8, usSector: 'consumer_disc',
    domesticSector: '消费电子/零售', domesticOpportunity: '美的集团、格力电器、海尔智家',
    lagHours: 18, confidence: 76, status: 'active', timestamp: '2026-03-07 03:50', hitRate: 70, totalTriggers: 33, successfulTriggers: 23,
  },
  {
    id: 'tm-10', usSignal: 'XLP必需消费防御性走强', usCode: 'XLP', usChange: 1.42, usVolatility: 12.3, usSector: 'consumer_staples',
    domesticSector: '食品饮料/日用', domesticOpportunity: '贵州茅台、伊利股份、海天味业',
    lagHours: 24, confidence: 72, status: 'active', timestamp: '2026-03-07 03:00', hitRate: 67, totalTriggers: 51, successfulTriggers: 34,
  },
  {
    id: 'tm-11', usSignal: 'XLI工业板块景气上行', usCode: 'XLI', usChange: 1.88, usVolatility: 18.6, usSector: 'industrials',
    domesticSector: '机械/工程', domesticOpportunity: '三一重工、中联重科、徐工机械',
    lagHours: 20, confidence: 77, status: 'active', timestamp: '2026-03-07 02:45', hitRate: 71, totalTriggers: 37, successfulTriggers: 26,
  },
  {
    id: 'tm-12', usSignal: 'XLB材料板块周期反转', usCode: 'XLB', usChange: 2.54, usVolatility: 26.4, usSector: 'materials',
    domesticSector: '有色/化工', domesticOpportunity: '北方稀土、万华化学、赣锋锂业',
    lagHours: 14, confidence: 83, status: 'triggered', timestamp: '2026-03-07 02:30', hitRate: 79, totalTriggers: 44, successfulTriggers: 35,
  },
  {
    id: 'tm-13', usSignal: 'XLC通信服务板块异动', usCode: 'XLC', usChange: 1.65, usVolatility: 20.1, usSector: 'communication',
    domesticSector: '传媒/游戏', domesticOpportunity: '腾讯、网易、芒果超媒',
    lagHours: 16, confidence: 75, status: 'active', timestamp: '2026-03-07 05:00', hitRate: 69, totalTriggers: 31, successfulTriggers: 21,
  },
  {
    id: 'tm-14', usSignal: 'XLU公用事业避险资金涌入', usCode: 'XLU', usChange: 1.23, usVolatility: 10.8, usSector: 'utilities',
    domesticSector: '电力/水务', domesticOpportunity: '长江电力、华能国际、国投电力',
    lagHours: 24, confidence: 68, status: 'expired', timestamp: '2026-03-06 22:00', hitRate: 63, totalTriggers: 28, successfulTriggers: 18,
  },
  {
    id: 'tm-15', usSignal: 'XLRE房地产信托反弹', usCode: 'XLRE', usChange: 1.95, usVolatility: 19.4, usSector: 'real_estate',
    domesticSector: '房地产/物业', domesticOpportunity: '万科A、保利发展、招商蛇口',
    lagHours: 22, confidence: 65, status: 'expired', timestamp: '2026-03-06 21:30', hitRate: 58, totalTriggers: 25, successfulTriggers: 15,
  },
  {
    id: 'tm-16', usSignal: 'ITA航空航天ETF突破', usCode: 'ITA', usChange: 2.78, usVolatility: 23.5, usSector: 'aerospace',
    domesticSector: '军工/航空', domesticOpportunity: '中航沈飞、航发动力、中航光电',
    lagHours: 18, confidence: 84, status: 'active', timestamp: '2026-03-07 04:15', hitRate: 80, totalTriggers: 36, successfulTriggers: 29,
  },
  {
    id: 'tm-17', usSignal: 'XHE医疗保健设备走强', usCode: 'XHE', usChange: 2.33, usVolatility: 25.7, usSector: 'healthcare',
    domesticSector: '医疗器械', domesticOpportunity: '迈瑞医疗、联影医疗、微创医疗',
    lagHours: 16, confidence: 82, status: 'active', timestamp: '2026-03-07 05:30', hitRate: 76, totalTriggers: 40, successfulTriggers: 30,
  },
  {
    id: 'tm-18', usSignal: 'BITO加密货币ETF放量', usCode: 'BITO', usChange: 6.45, usVolatility: 45.2, usSector: 'crypto',
    domesticSector: '区块链/数字货币', domesticOpportunity: '数字货币概念、区块链技术',
    lagHours: 6, confidence: 71, status: 'triggered', timestamp: '2026-03-07 01:00', hitRate: 62, totalTriggers: 58, successfulTriggers: 36,
  },
];

export const executionStrategies: ExecutionStrategy[] = [
  {
    id: 'es-1', name: '生物抗衰关键词重构', trigger: 'XBI波动率>30% & 涨幅>3%',
    action: 'AI内容工厂词云更新：抗衰、再生医学、NAD+',
    budgetRatio: 15, budgetDelta: 12, certainty: 87, status: 'executing', enabled: true, sectorKey: 'biotech', lastExecuted: '2026-03-07 06:35', executionCount: 12,
  },
  {
    id: 'es-2', name: 'AI算力投放加码', trigger: 'SOXX资金净流入>$2B',
    action: '上调AI算力相关投放预算15%',
    budgetRatio: 12, budgetDelta: 15, certainty: 92, status: 'executing', enabled: true, sectorKey: 'semiconductor', lastExecuted: '2026-03-07 05:20', executionCount: 18,
  },
  {
    id: 'es-3', name: '清洁能源内容布防', trigger: 'ICLN突破200日均线',
    action: '预制光伏/储能内容素材库',
    budgetRatio: 8, budgetDelta: 5, certainty: 74, status: 'pending', enabled: true, sectorKey: 'clean_energy', executionCount: 7,
  },
  {
    id: 'es-4', name: '避险情绪对冲', trigger: 'GDX单日涨幅>5%',
    action: '缩减消费类投放，转向避险资产内容',
    budgetRatio: 10, budgetDelta: -8, certainty: 95, status: 'hedged', enabled: true, sectorKey: 'precious_metals', lastExecuted: '2026-03-07 02:15', executionCount: 9,
  },
  {
    id: 'es-5', name: '科技板块动态跟踪', trigger: 'XLK突破关键阻力位 & RSI<70',
    action: '加大科技股内容覆盖，更新相关ETF推荐',
    budgetRatio: 10, budgetDelta: 8, certainty: 88, status: 'executing', enabled: true, sectorKey: 'technology', lastExecuted: '2026-03-07 06:05', executionCount: 22,
  },
  {
    id: 'es-6', name: '能源板块套利捕捉', trigger: 'XLE涨幅>3% & 原油期货同步确认',
    action: '触发能源板块映射，布局石油化工关键词',
    budgetRatio: 8, budgetDelta: 10, certainty: 90, status: 'executing', enabled: true, sectorKey: 'energy', lastExecuted: '2026-03-07 04:35', executionCount: 15,
  },
  {
    id: 'es-7', name: '金融板块防御配置', trigger: 'XLF资金流入>$1B & VIX<20',
    action: '上调金融板块内容比重，关注银行股季报',
    budgetRatio: 7, budgetDelta: 3, certainty: 79, status: 'pending', enabled: true, sectorKey: 'financials', executionCount: 8,
  },
  {
    id: 'es-8', name: '消费板块趋势捕捉', trigger: 'XLY连续3日上涨 & 消费者信心指数上升',
    action: '增加消费电子、零售内容投放',
    budgetRatio: 6, budgetDelta: 4, certainty: 76, status: 'pending', enabled: true, sectorKey: 'consumer_disc', executionCount: 5,
  },
  {
    id: 'es-9', name: '材料周期反转布局', trigger: 'XLB突破60日均线 & 铜价确认',
    action: '启动有色金属、化工板块内容预制',
    budgetRatio: 6, budgetDelta: 6, certainty: 83, status: 'executing', enabled: true, sectorKey: 'materials', lastExecuted: '2026-03-07 02:35', executionCount: 11,
  },
  {
    id: 'es-10', name: '加密货币情绪放大', trigger: 'BITO单日涨幅>5% & BTC突破关键位',
    action: '加大区块链、Web3内容覆盖',
    budgetRatio: 5, budgetDelta: 18, certainty: 71, status: 'executing', enabled: true, sectorKey: 'crypto', lastExecuted: '2026-03-07 01:05', executionCount: 20,
  },
  {
    id: 'es-11', name: '军工航天事件驱动', trigger: 'ITA涨幅>2% & 地缘政治事件触发',
    action: '启动军工板块专题内容，更新防务股推荐',
    budgetRatio: 5, budgetDelta: 7, certainty: 84, status: 'pending', enabled: true, sectorKey: 'aerospace', executionCount: 6,
  },
  {
    id: 'es-12', name: '网络安全危机响应', trigger: 'HACK异常放量 & 安全事件新闻触发',
    action: '紧急更新信创安全内容，调整投放优先级',
    budgetRatio: 4, budgetDelta: 12, certainty: 81, status: 'paused', enabled: false, sectorKey: 'cybersecurity', executionCount: 4,
  },
  {
    id: 'es-13', name: '医疗设备赛道关注', trigger: 'XHE连续上涨 & FDA审批利好',
    action: '布局医疗器械内容，关注集采政策',
    budgetRatio: 4, budgetDelta: 2, certainty: 82, status: 'pending', enabled: true, sectorKey: 'healthcare', executionCount: 3,
  },
];

export const anomalyAlerts: AnomalyAlert[] = [
  {
    id: 'aa-1', type: 'divergence', title: 'A股半导体与费城半导体背离',
    description: '美股SOXX连续3日上涨，但A股半导体板块走弱，存在逻辑断裂风险',
    severity: 'high', anchorData: 'SOXX +8.2% vs 半导体ETF -1.3%（3日）',
    timestamp: '2026-03-07 09:15', intercepted: true, sectorKey: 'semiconductor', actionTaken: '已暂停半导体相关执行策略',
  },
  {
    id: 'aa-2', type: 'irrational', title: '新能源板块情绪过热',
    description: '国内新能源板块换手率飙升但美股ICLN未同步确认，疑似跟风炒作',
    severity: 'medium', anchorData: '换手率12.3% vs 均值4.5%',
    timestamp: '2026-03-07 10:30', intercepted: false, sectorKey: 'clean_energy',
  },
  {
    id: 'aa-3', type: 'blackswan', title: '美债收益率倒挂加深',
    description: '2Y-10Y利差扩大至-45bp，历史极端水平，全球风险资产承压',
    severity: 'critical', anchorData: '2Y: 4.85% / 10Y: 4.40%',
    timestamp: '2026-03-07 08:00', intercepted: true, sectorKey: 'financials', actionTaken: '已全面缩减风险敞口',
  },
  {
    id: 'aa-4', type: 'divergence', title: '科技板块中美走势分化',
    description: 'XLK连续上涨但A股科技股未跟随，需关注政策风险',
    severity: 'medium', anchorData: 'XLK +5.1% vs 科创50 -0.8%（5日）',
    timestamp: '2026-03-07 07:45', intercepted: false, sectorKey: 'technology',
  },
  {
    id: 'aa-5', type: 'irrational', title: '能源板块过度反应',
    description: '原油价格小幅波动但国内能源股大幅异动，疑似情绪放大',
    severity: 'high', anchorData: 'WTI +0.8% vs 中国石油 +4.2%',
    timestamp: '2026-03-07 11:00', intercepted: true, sectorKey: 'energy', actionTaken: '已降低能源板块执行预算',
  },
  {
    id: 'aa-6', type: 'blackswan', title: '加密市场闪崩预警',
    description: 'BTC 1小时内跌幅超5%，链上大额转账激增，疑似鲸鱼抛售',
    severity: 'critical', anchorData: 'BTC -5.3% / 链上转出 $2.1B',
    timestamp: '2026-03-07 01:30', intercepted: true, sectorKey: 'crypto', actionTaken: '已暂停加密相关策略执行',
  },
  {
    id: 'aa-7', type: 'divergence', title: '消费板块信号矛盾',
    description: '美股XLY走强但国内消费者信心指数下滑，映射逻辑需重新校准',
    severity: 'low', anchorData: 'XLY +3.2% vs 消费信心指数 96.5（前值98.2）',
    timestamp: '2026-03-07 06:15', intercepted: false, sectorKey: 'consumer_disc',
  },
];

export const selfImprovementLogs: SelfImprovementLog[] = [
  {
    id: 'si-1', timestamp: '2026-03-07 08:00', type: 'accuracy_update',
    description: '半导体板块映射模型精度提升：新增ASML权重因子',
    before: 82, after: 85, sectorKey: 'semiconductor',
  },
  {
    id: 'si-2', timestamp: '2026-03-07 06:30', type: 'threshold_adjust',
    description: '能源板块触发阈值下调：原油期货相关性增强',
    before: 3.5, after: 3.0, sectorKey: 'energy',
  },
  {
    id: 'si-3', timestamp: '2026-03-07 04:15', type: 'model_retrain',
    description: '贵金属映射模型重训练：纳入地缘政治因子',
    before: 88, after: 91, sectorKey: 'precious_metals',
  },
  {
    id: 'si-4', timestamp: '2026-03-07 02:00', type: 'new_pattern',
    description: '发现科技-通信板块联动新模式，已加入监控',
    before: 0, after: 1, sectorKey: 'technology',
  },
  {
    id: 'si-5', timestamp: '2026-03-06 22:00', type: 'accuracy_update',
    description: '金融板块映射准确率提升：VIX指数权重优化',
    before: 71, after: 74, sectorKey: 'financials',
  },
  {
    id: 'si-6', timestamp: '2026-03-06 18:30', type: 'threshold_adjust',
    description: '加密货币板块波动率阈值上调：减少噪音信号',
    before: 40, after: 45, sectorKey: 'crypto',
  },
  {
    id: 'si-7', timestamp: '2026-03-06 15:00', type: 'model_retrain',
    description: '消费板块跨市场模型更新：引入CPI数据关联',
    before: 66, after: 70, sectorKey: 'consumer_disc',
  },
  {
    id: 'si-8', timestamp: '2026-03-06 12:00', type: 'new_pattern',
    description: '材料板块-铜价联动确认，新增自动触发规则',
    before: 0, after: 1, sectorKey: 'materials',
  },
];

export function simulateGTRTick(mappings: TrendMapping[]): TrendMapping[] {
  return mappings.map((m) => {
    if (m.status === 'expired') return m;
    const changeDelta = (Math.random() - 0.45) * 0.5;
    const volDelta = (Math.random() - 0.5) * 1.5;
    const confDelta = (Math.random() - 0.5) * 2;
    const newChange = Math.round((m.usChange + changeDelta) * 100) / 100;
    const newVol = Math.max(5, Math.round((m.usVolatility + volDelta) * 10) / 10);
    const newConf = Math.max(30, Math.min(99, Math.round(m.confidence + confDelta)));
    let newStatus: TrendMapping['status'] = m.status;
    if (newConf >= 90 && m.status === 'active') newStatus = 'triggered';
    if (newConf < 60 && m.status === 'active') newStatus = 'expired';
    return { ...m, usChange: newChange, usVolatility: newVol, confidence: newConf, status: newStatus };
  });
}

export function simulateExecutionTick(strategies: ExecutionStrategy[]): ExecutionStrategy[] {
  return strategies.map((s) => {
    if (!s.enabled) return s;
    const budgetDelta = (Math.random() - 0.5) * 2;
    const certDelta = (Math.random() - 0.5) * 1.5;
    return {
      ...s,
      budgetDelta: Math.round((s.budgetDelta + budgetDelta) * 10) / 10,
      certainty: Math.max(30, Math.min(99, Math.round(s.certainty + certDelta))),
    };
  });
}

export function simulateAnomalyTick(alerts: AnomalyAlert[]): AnomalyAlert[] {
  if (Math.random() > 0.95) {
    const sectors: USSectorKey[] = ['technology', 'healthcare', 'financials', 'energy', 'semiconductor', 'crypto'];
    const types: AnomalyAlert['type'][] = ['divergence', 'irrational', 'blackswan'];
    const severities: AnomalyAlert['severity'][] = ['low', 'medium', 'high'];
    const newAlert: AnomalyAlert = {
      id: `aa-new-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      title: '新异常信号检测中...',
      description: '系统正在验证跨市场信号一致性',
      severity: severities[Math.floor(Math.random() * severities.length)],
      anchorData: '数据验证中',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      intercepted: false,
      sectorKey: sectors[Math.floor(Math.random() * sectors.length)],
    };
    return [newAlert, ...alerts.slice(0, 9)];
  }
  return alerts;
}

import { GlobalTickerItem, SectorCorrelation, GlobalAssetCategory } from '@/types/market';

export const globalTickerItems: GlobalTickerItem[] = [
  { id: 'gt-1', code: 'DXY', name: '美元指数', price: 98.957, change: -0.114, changePercent: -0.12, category: 'forex' },
  { id: 'gt-2', code: 'BTC', name: '比特币', price: 87432.50, change: 1256.80, changePercent: 1.46, category: 'crypto' },
  { id: 'gt-3', code: 'A50', name: '富时A50', price: 14496.0, change: -235.20, changePercent: -1.60, category: 'futures' },
  { id: 'gt-4', code: 'QQQ', name: '纳指100ETF', price: 498.23, change: 4.56, changePercent: 0.92, category: 'index' },
  { id: 'gt-5', code: 'SPY', name: '标普500ETF', price: 584.12, change: 2.18, changePercent: 0.37, category: 'index' },
  { id: 'gt-6', code: 'ETH', name: '以太坊', price: 3245.60, change: -78.40, changePercent: -2.36, category: 'crypto' },
  { id: 'gt-7', code: 'TNX', name: '美债10Y', price: 4.402, change: -0.032, changePercent: -0.72, category: 'index' },
  { id: 'gt-8', code: 'VIX', name: '恐慌指数', price: 18.65, change: 1.23, changePercent: 7.06, category: 'index' },
  { id: 'gt-9', code: 'GC', name: 'COMEX黄金', price: 2648.30, change: 12.40, changePercent: 0.47, category: 'futures' },
  { id: 'gt-10', code: 'CL', name: 'WTI原油', price: 76.82, change: -1.23, changePercent: -1.58, category: 'futures' },
  { id: 'gt-11', code: 'DIA', name: '道指ETF', price: 428.56, change: 1.34, changePercent: 0.31, category: 'index' },
  { id: 'gt-12', code: 'IWM', name: '罗素2000', price: 215.78, change: -2.45, changePercent: -1.12, category: 'index' },
];

export const sectorCorrelations: SectorCorrelation[] = [
  { id: 'sc-1', usEtf: 'SOXX', usName: '费城半导体', usSector: 'semiconductor', usChange: 3.14, cnSector: '半导体', cnEtf: '512480', cnName: '半导体ETF', cnChange: -1.30, correlation: 0.72, divergence: 4.44, signal: 'diverging' },
  { id: 'sc-2', usEtf: 'XLK', usName: '科技精选', usSector: 'technology', usChange: 2.38, cnSector: '科技', cnEtf: '515000', cnName: '科技ETF', cnChange: 1.85, correlation: 0.81, divergence: 0.53, signal: 'aligned' },
  { id: 'sc-3', usEtf: 'XBI', usName: '生物科技', usSector: 'biotech', usChange: 4.82, cnSector: '医药生物', cnEtf: '512010', cnName: '医药ETF', cnChange: 0.42, correlation: 0.45, divergence: 4.40, signal: 'leading' },
  { id: 'sc-4', usEtf: 'XLE', usName: '能源精选', usSector: 'energy', usChange: 3.85, cnSector: '石油石化', cnEtf: '515220', cnName: '煤炭ETF', cnChange: 4.20, correlation: 0.88, divergence: -0.35, signal: 'aligned' },
  { id: 'sc-5', usEtf: 'XLF', usName: '金融精选', usSector: 'financials', usChange: 1.76, cnSector: '银行保险', cnEtf: '512800', cnName: '银行ETF', cnChange: 0.65, correlation: 0.62, divergence: 1.11, signal: 'lagging' },
  { id: 'sc-6', usEtf: 'GDX', usName: '黄金矿业', usSector: 'precious_metals', usChange: 5.12, cnSector: '贵金属', cnEtf: '518880', cnName: '黄金ETF', cnChange: 1.27, correlation: 0.91, divergence: 3.85, signal: 'leading' },
  { id: 'sc-7', usEtf: 'ICLN', usName: '清洁能源', usSector: 'clean_energy', usChange: 2.67, cnSector: '光伏储能', cnEtf: '516160', cnName: '新能源ETF', cnChange: -1.25, correlation: 0.55, divergence: 3.92, signal: 'diverging' },
  { id: 'sc-8', usEtf: 'HACK', usName: '网络安全', usSector: 'cybersecurity', usChange: 1.95, cnSector: '信创安全', cnEtf: '562030', cnName: '信创ETF', cnChange: 2.10, correlation: 0.68, divergence: -0.15, signal: 'aligned' },
  { id: 'sc-9', usEtf: 'XLY', usName: '可选消费', usSector: 'consumer_disc', usChange: 2.15, cnSector: '消费电子', cnEtf: '159928', cnName: '消费ETF', cnChange: -0.32, correlation: 0.48, divergence: 2.47, signal: 'diverging' },
  { id: 'sc-10', usEtf: 'XLP', usName: '必需消费', usSector: 'consumer_staples', usChange: 1.42, cnSector: '食品饮料', cnEtf: '515170', cnName: '食品ETF', cnChange: 0.88, correlation: 0.59, divergence: 0.54, signal: 'aligned' },
  { id: 'sc-11', usEtf: 'XLI', usName: '工业精选', usSector: 'industrials', usChange: 1.88, cnSector: '高端装备', cnEtf: '516510', cnName: '机械ETF', cnChange: 1.56, correlation: 0.65, divergence: 0.32, signal: 'aligned' },
  { id: 'sc-12', usEtf: 'XLB', usName: '材料精选', usSector: 'materials', usChange: 2.54, cnSector: '有色化工', cnEtf: '512400', cnName: '有色ETF', cnChange: 3.12, correlation: 0.78, divergence: -0.58, signal: 'aligned' },
  { id: 'sc-13', usEtf: 'XLC', usName: '通信服务', usSector: 'communication', usChange: 1.65, cnSector: '传媒游戏', cnEtf: '516850', cnName: '传媒ETF', cnChange: 0.45, correlation: 0.42, divergence: 1.20, signal: 'lagging' },
  { id: 'sc-14', usEtf: 'XHE', usName: '医疗设备', usSector: 'healthcare', usChange: 2.33, cnSector: '医疗器械', cnEtf: '159883', cnName: '医疗ETF', cnChange: 1.10, correlation: 0.56, divergence: 1.23, signal: 'lagging' },
  { id: 'sc-15', usEtf: 'ITA', usName: '航空航天', usSector: 'aerospace', usChange: 2.78, cnSector: '军工航天', cnEtf: '512660', cnName: '军工ETF', cnChange: 3.03, correlation: 0.71, divergence: -0.25, signal: 'aligned' },
  { id: 'sc-16', usEtf: 'BITO', usName: '加密货币', usSector: 'crypto', usChange: 6.45, cnSector: '区块链', cnEtf: '—', cnName: '区块链概念', cnChange: 1.80, correlation: 0.38, divergence: 4.65, signal: 'leading' },
  { id: 'sc-17', usEtf: 'XLU', usName: '公用事业', usSector: 'utilities', usChange: 1.23, cnSector: '电力水务', cnEtf: '159611', cnName: '电力ETF', cnChange: 0.95, correlation: 0.52, divergence: 0.28, signal: 'aligned' },
  { id: 'sc-18', usEtf: 'XLRE', usName: '房地产信托', usSector: 'real_estate', usChange: 1.95, cnSector: '房地产', cnEtf: '512200', cnName: '房地产ETF', cnChange: -2.10, correlation: 0.35, divergence: 4.05, signal: 'diverging' },
];

export const globalAssetCategories: GlobalAssetCategory[] = [
  {
    id: 'gac-1',
    category: '全球指数/ETF',
    assets: [
      { code: 'QQQ', name: '纳指100 ETF', price: 498.23, change: 4.56, changePercent: 0.92, type: 'etf' },
      { code: 'SPY', name: '标普500 ETF', price: 584.12, change: 2.18, changePercent: 0.37, type: 'etf' },
      { code: 'DIA', name: '道指 ETF', price: 428.56, change: 1.34, changePercent: 0.31, type: 'etf' },
      { code: 'IWM', name: '罗素2000 ETF', price: 215.78, change: -2.45, changePercent: -1.12, type: 'etf' },
      { code: 'SOXX', name: '芯片 ETF', price: 245.67, change: 7.52, changePercent: 3.14, type: 'etf' },
      { code: 'IBB', name: '生物 ETF', price: 134.89, change: 6.23, changePercent: 4.82, type: 'etf' },
      { code: 'XLE', name: '能源 ETF', price: 89.45, change: 3.32, changePercent: 3.85, type: 'etf' },
      { code: 'XLY', name: '消费 ETF', price: 198.23, change: 4.18, changePercent: 2.15, type: 'etf' },
      { code: 'XLF', name: '金融 ETF', price: 42.56, change: 0.74, changePercent: 1.76, type: 'etf' },
      { code: 'XLK', name: '科技 ETF', price: 212.34, change: 4.94, changePercent: 2.38, type: 'etf' },
      { code: 'XLV', name: '医疗 ETF', price: 145.67, change: 1.89, changePercent: 1.32, type: 'etf' },
    ],
  },
  {
    id: 'gac-2',
    category: '货币/债券/贵金属',
    assets: [
      { code: 'DXY', name: '美元指数', price: 98.957, change: -0.114, changePercent: -0.12, type: 'currency' },
      { code: 'TNX', name: '美债10Y收益率', price: 4.402, change: -0.032, changePercent: -0.72, type: 'bond' },
      { code: 'GC', name: 'COMEX黄金', price: 2648.30, change: 12.40, changePercent: 0.47, type: 'futures' },
      { code: 'SI', name: 'COMEX白银', price: 31.45, change: 0.67, changePercent: 2.18, type: 'futures' },
      { code: 'HG', name: 'COMEX铜', price: 4.256, change: 0.045, changePercent: 1.07, type: 'futures' },
    ],
  },
  {
    id: 'gac-3',
    category: '加密货币',
    assets: [
      { code: 'BTC', name: '比特币', price: 87432.50, change: 1256.80, changePercent: 1.46, type: 'crypto' },
      { code: 'ETH', name: '以太坊', price: 3245.60, change: -78.40, changePercent: -2.36, type: 'crypto' },
      { code: 'SOL', name: 'Solana', price: 178.34, change: 5.67, changePercent: 3.28, type: 'crypto' },
    ],
  },
  {
    id: 'gac-4',
    category: '期货/衍生品',
    assets: [
      { code: 'A50', name: '富时A50期货', price: 14496.0, change: -235.20, changePercent: -1.60, type: 'futures' },
      { code: 'HSI', name: '恒指期货', price: 25249.49, change: -518.60, changePercent: -2.01, type: 'futures' },
      { code: 'CL', name: 'WTI原油', price: 76.82, change: -1.23, changePercent: -1.58, type: 'futures' },
      { code: 'VIX', name: '恐慌指数', price: 18.65, change: 1.23, changePercent: 7.06, type: 'options' },
    ],
  },
  {
    id: 'gac-5',
    category: '国内市场',
    assets: [
      { code: '510300', name: '沪深300ETF', price: 3.892, change: -0.023, changePercent: -0.59, type: 'etf' },
      { code: '512100', name: '中证1000ETF', price: 1.234, change: -0.008, changePercent: -0.64, type: 'etf' },
      { code: '510050', name: '上证50ETF', price: 2.876, change: -0.031, changePercent: -1.07, type: 'etf' },
      { code: '159920', name: '恒生ETF', price: 1.342, change: -0.028, changePercent: -2.04, type: 'etf' },
    ],
  },
];

export function simulateTickerItems(items: GlobalTickerItem[]): GlobalTickerItem[] {
  return items.map((item) => {
    const fluctuation = (Math.random() - 0.48) * item.price * 0.003;
    const newPrice = Math.round((item.price + fluctuation) * 100) / 100;
    return {
      ...item,
      price: newPrice,
      change: Math.round(fluctuation * 100) / 100,
      changePercent: Math.round((fluctuation / item.price) * 10000) / 100,
    };
  });
}

export function simulateSectorCorrelations(items: SectorCorrelation[]): SectorCorrelation[] {
  return items.map((item) => {
    const usDelta = (Math.random() - 0.48) * 0.4;
    const cnDelta = (Math.random() - 0.48) * 0.4;
    const newUsChange = Math.round((item.usChange + usDelta) * 100) / 100;
    const newCnChange = Math.round((item.cnChange + cnDelta) * 100) / 100;
    const newDivergence = Math.round((newUsChange - newCnChange) * 100) / 100;
    const corrDelta = (Math.random() - 0.5) * 0.02;
    const newCorrelation = Math.max(0.1, Math.min(0.99, Math.round((item.correlation + corrDelta) * 100) / 100));
    let newSignal: SectorCorrelation['signal'] = item.signal;
    if (Math.abs(newDivergence) < 1) newSignal = 'aligned';
    else if (newDivergence > 3) newSignal = 'leading';
    else if (newDivergence < -1) newSignal = 'lagging';
    else newSignal = 'diverging';
    return { ...item, usChange: newUsChange, cnChange: newCnChange, divergence: newDivergence, correlation: newCorrelation, signal: newSignal };
  });
}

export function generateCandleData(days: number, basePrice: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    const open = price;
    const change = (Math.random() - 0.48) * price * 0.03;
    const close = Math.round((open + change) * 100) / 100;
    const highExtra = Math.abs(change) * (0.5 + Math.random());
    const lowExtra = Math.abs(change) * (0.5 + Math.random());
    const high = Math.round((Math.max(open, close) + highExtra) * 100) / 100;
    const low = Math.round((Math.min(open, close) - lowExtra) * 100) / 100;
    const volume = Math.round(50000 + Math.random() * 200000);

    candles.push({ date: dateStr, open, close, high, low, volume });
    price = close;
  }

  return candles;
}
