'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// ── Community seed data ───────────────────────────────────────────────────────
const SEED_POSTS = [
  { id: 1, author: 'Alex Chen', level: 'Pro', role: 'Expert', sentiment: 'Bullish', symbol: '$AAPL', price: '₹388.50', change: '+2.1%', up: true, time: '3h ago', title: 'Trade Idea: $AAPL Breakout', body: 'Analyzing $AAPL chart for potential upside. RSI showing oversold conditions with strong support at 380. Target: 410.', likes: 42, comments: 48, shares: 19 },
  { id: 2, author: 'Sarah Jensen', level: 'Advanced', role: 'Analyst', sentiment: 'Neutral', symbol: '$MSFT', price: '₹900.00', change: '+0.8%', up: true, time: '5h ago', title: 'Tech sector analysis on $MSFT', body: 'MSFT technicals look strong. Historical support holding well. Watch for breakout above 920.', likes: 28, comments: 15, shares: 7 },
  { id: 3, author: 'Priya Das', level: 'Pro', role: 'Expert', sentiment: 'Bearish', symbol: '$NVDA', price: '₹1,200', change: '-1.2%', up: false, time: '1h ago', title: 'NVDA correction incoming?', body: 'After a massive run-up, NVDA looks extended. Watch for a pullback to the 1100 support zone before re-entry.', likes: 67, comments: 31, shares: 22 },
  { id: 4, author: 'Rohan Sharma', level: 'Intermediate', role: 'Member', sentiment: 'Bullish', symbol: '$INFY', price: '₹1,645', change: '+0.4%', up: true, time: '2h ago', title: 'Infosys Q4 results — strong buy?', body: 'Q4 results beat estimates. Guidance looks positive. Accumulating at current levels for long term.', likes: 11, comments: 6, shares: 2 },
];

const LIVE_CHAT_SEED = [
  { user: 'Mike', msg: 'FED minutes soon, volatility spiking.', time: '2m' },
  { user: 'Sarah', msg: 'Agreed. $SPX showing weakness.', time: '3m' },
  { user: 'Arjun', msg: 'Buying the dip on NIFTY 50.', time: '5m' },
];

const TRENDING = [
  { tag: '$AAPL', change: '+2.1%', up: true },
  { tag: '$TSLA', change: '+1.5%', up: true },
  { tag: '$NVDA', change: '-1.2%', up: false },
  { tag: '$RELIANCE', change: '+0.9%', up: true },
];

const LEVEL_CFG = {
  Beginner: { color: 'text-n-4', bg: 'bg-gray-500/20', border: 'border-gray-500/40', icon: 'LVL 1' },
  Intermediate: { color: 'text-color-5', bg: 'bg-color-5/20', border: 'border-color-5/40', icon: 'LVL 2' },
  Advanced: { color: 'text-color-1', bg: 'bg-color-1/20', border: 'border-color-1/40', icon: 'LVL 3' },
  Pro: { color: 'text-color-2', bg: 'bg-color-2/20', border: 'border-color-2/40', icon: 'PRO' },
};

function LevelBadge({ level }) {
  const cfg = LEVEL_CFG[level] || LEVEL_CFG.Beginner;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold text-xs ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      {cfg.icon} {level}
    </span>
  );
}

function SentimentBadge({ s }) {
  if (s === 'Bullish') return <span className="text-xs px-2 py-0.5 rounded-full bg-color-4/20 text-color-4 border border-color-4/30 font-semibold">BULLISH</span>;
  if (s === 'Bearish') return <span className="text-xs px-2 py-0.5 rounded-full bg-color-3/20 text-color-3 border border-color-3/30 font-semibold">BEARISH</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-n-4 border border-gray-500/30 font-semibold">NEUTRAL</span>;
}

function Sparkline({ up }) {
  return (
    <svg width="48" height="20" viewBox="0 0 48 20">
      {up
        ? <polyline points="0,16 8,12 16,14 24,8 32,6 40,3 48,1" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
        : <polyline points="0,3 8,6 16,5 24,11 32,13 40,16 48,18" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
  );
}

function CAvatar({ name, size = 36 }) {
  const colors = ['from-color-4 to-teal-600', 'from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-orange-500 to-red-600', 'from-yellow-500 to-orange-600'];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {(name || 'U').charAt(0).toUpperCase()}
    </div>
  );
}

// ── Market watch symbols ──────────────────────────────────────────────────────
const WATCHLIST = [
  { symbol: 'NIFTY50.NS', label: 'NIFTY 50' },
  { symbol: 'TCS.NS', label: 'TCS' },
  { symbol: 'RELIANCE.NS', label: 'RELIANCE' },
  { symbol: 'HDFCBANK.NS', label: 'HDFCBANK' },
  { symbol: 'INFY.NS', label: 'INFOSYS' },
  { symbol: 'SBIN.NS', label: 'SBI' },
  { symbol: 'ICICIBANK.NS', label: 'ICICIBANK' },
  { symbol: 'HINDUNILVR.NS', label: 'HINDUNILVR' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (n) => n == null ? '—' : `${n >= 0 ? '+' : ''}${Number(n).toFixed(2)}%`;
const VIRTUAL_BALANCE_KEY = 'wp_virtual_balance';
const HOLDINGS_KEY = 'wp_holdings';
const INITIAL_BALANCE = 1_000_000; // ₹10,00,000

function getBalance() { try { return JSON.parse(localStorage.getItem(VIRTUAL_BALANCE_KEY)) ?? INITIAL_BALANCE; } catch { return INITIAL_BALANCE; } }
function saveBalance(b) { localStorage.setItem(VIRTUAL_BALANCE_KEY, JSON.stringify(b)); }
function getHoldings() { try { return JSON.parse(localStorage.getItem(HOLDINGS_KEY)) ?? []; } catch { return []; } }
function saveHoldings(h) { localStorage.setItem(HOLDINGS_KEY, JSON.stringify(h)); }

// ── Live price hook ───────────────────────────────────────────────────────────
function useLivePrice(symbol) {
  const [data, setData] = useState(null);
  const fetch_ = useCallback(async () => {
    if (!symbol) return;
    try {
      const r = await fetch(`/api/stock/quote/${encodeURIComponent(symbol)}`);
      if (r.ok) setData(await r.json());
    } catch { }
  }, [symbol]);

  useEffect(() => { fetch_(); const t = setInterval(fetch_, 15000); return () => clearInterval(t); }, [fetch_]);
  return { data, refresh: fetch_ };
}

// ── Watchlist prices hook ─────────────────────────────────────────────────────
function useWatchlistPrices() {
  const [prices, setPrices] = useState({});
  const fetchAll = useCallback(async () => {
    const results = await Promise.allSettled(
      WATCHLIST.map(async (w) => {
        const r = await fetch(`/api/stock/quote/${encodeURIComponent(w.symbol)}`);
        if (r.ok) return { symbol: w.symbol, data: await r.json() };
        return { symbol: w.symbol, data: null };
      })
    );
    const map = {};
    results.forEach((res) => { if (res.status === 'fulfilled' && res.value.data) map[res.value.symbol] = res.value.data; });
    setPrices(map);
  }, []);
  useEffect(() => { fetchAll(); const t = setInterval(fetchAll, 15000); return () => clearInterval(t); }, [fetchAll]);
  return { prices, refresh: fetchAll };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SandboxTradingTerminal({ userId, userName, userEmail, collegeName }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('dashboard'); // dashboard | leaderboard
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [holdings, setHoldings] = useState([]);
  const [selectedSymbol, setSelected] = useState(WATCHLIST[1]);
  const [orderType, setOrderType] = useState('market');
  const [tradeType, setTradeType] = useState('buy');
  const [qty, setQty] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [tradeMsg, setTradeMsg] = useState(null);
  const [aiEval, setAiEval] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [marketStatus, setMarketStatus] = useState(null);
  const [holdingPrices, setHoldingPrices] = useState({});
  // ── Portfolio items from Portfolio page (with live prices) ─────────────────
  const [portfolioLive, setPortfolioLive] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [evalResultLoading, setEvalResultLoading] = useState(false);
  const [lastEvalTime, setLastEvalTime] = useState(null);

  // ── Community state ────────────────────────────────────────────────────────
  const [posts, setPosts] = useState(SEED_POSTS);
  const [chatMsgs, setChatMsgs] = useState(LIVE_CHAT_SEED);
  const [chatInput, setChatInput] = useState('');
  const [newPost, setNewPost] = useState('');
  const [newSentiment, setNewSentiment] = useState('Bullish');
  const [newSymbol, setNewSymbol] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [feedTab, setFeedTab] = useState('All Posts');
  const chatEndRef = useRef(null);

  const { prices: watchPrices, refresh: refreshWatch } = useWatchlistPrices();
  const { data: selectedQuote, refresh: refreshQuote } = useLivePrice(selectedSymbol?.symbol);

  // ── Init from localStorage ─────────────────────────────────────────────────
  useEffect(() => {
    const savedBalance = getBalance();
    const savedHoldings = getHoldings();
    setBalance(savedBalance);
    setHoldings(savedHoldings);
  }, []);

  // ── Fetch market status ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStatus = async () => {
      try { const r = await fetch('/api/tradeverse/market/status'); if (r.ok) setMarketStatus(await r.json()); } catch { }
    };
    fetchStatus(); const t = setInterval(fetchStatus, 30000); return () => clearInterval(t);
  }, []);

  // ── Fetch sandbox dashboard (AI profile, credit score, etc.) ──────────────
  const fetchDashboard = useCallback(async () => {
    if (!userId) return;
    try { const r = await fetch(`/api/tradeverse/dashboard/${encodeURIComponent(userId)}`); if (r.ok) setDashboard(await r.json()); } catch { }
  }, [userId]);
  useEffect(() => { fetchDashboard(); const t = setInterval(fetchDashboard, 10000); return () => clearInterval(t); }, [fetchDashboard]);

  // ── Fetch portfolio items with live prices (from Portfolio page) ───────────
  const fetchPortfolioLive = useCallback(async () => {
    if (!userId) return;
    setPortfolioLoading(true);
    try {
      const r = await fetch(`/api/tradeverse/portfolio/live/${encodeURIComponent(userId)}`);
      if (r.ok) { const d = await r.json(); setPortfolioLive(d.items || []); }
    } catch { } finally { setPortfolioLoading(false); }
  }, [userId]);
  useEffect(() => { fetchPortfolioLive(); const t = setInterval(fetchPortfolioLive, 30000); return () => clearInterval(t); }, [fetchPortfolioLive]);

  // ── Auto sandbox evaluate on load + every 60s ─────────────────────────────
  const runEvaluate = useCallback(async () => {
    if (!userId) return;
    setEvalResultLoading(true);
    try {
      const r = await fetch(`/api/tradeverse/portfolio/evaluate/${encodeURIComponent(userId)}`, { method: 'POST' });
      if (r.ok) { const d = await r.json(); setEvalResult(d); setLastEvalTime(new Date()); }
    } catch { } finally { setEvalResultLoading(false); }
  }, [userId]);
  useEffect(() => { runEvaluate(); const t = setInterval(runEvaluate, 60000); return () => clearInterval(t); }, [runEvaluate]);

  // ── Fetch leaderboard ──────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const r = await fetch('/api/tradeverse/leaderboard/global');
      if (r.ok) { const d = await r.json(); setLeaderboard(d.entries || []); }
    } catch { } finally { setLbLoading(false); }
  }, []);
  useEffect(() => { if (tab === 'leaderboard') fetchLeaderboard(); }, [tab, fetchLeaderboard]);

  // ── Community: auto-scroll chat + bot messages ─────────────────────────────
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);
  useEffect(() => {
    const bots = [
      { user: 'Vikram', msg: 'NIFTY breaking out of consolidation!' },
      { user: 'Ananya', msg: 'Watching HDFC Bank closely today.' },
      { user: 'Raj', msg: 'BTC above 47k — crypto pumping.' },
      { user: 'Meera', msg: 'Good entry on TCS at current levels?' },
    ];
    let i = 0;
    const t = setInterval(() => {
      const bot = bots[i % bots.length];
      setChatMsgs(prev => [...prev.slice(-20), { ...bot, time: 'now' }]);
      i++;
    }, 9000);
    return () => clearInterval(t);
  }, []);

  // ── Live P&L for holdings ──────────────────────────────────────────────────
  useEffect(() => {
    if (!holdings.length) return;
    const symbols = [...new Set(holdings.map(h => h.symbol))];
    const fetchPrices = async () => {
      const map = {};
      await Promise.allSettled(symbols.map(async (sym) => {
        try { const r = await fetch(`/api/stock/quote/${encodeURIComponent(sym)}`); if (r.ok) { const d = await r.json(); map[sym] = d.price; } } catch { }
      }));
      setHoldingPrices(map);
    };
    fetchPrices(); const t = setInterval(fetchPrices, 15000); return () => clearInterval(t);
  }, [holdings]);

  // ── Execute trade ──────────────────────────────────────────────────────────
  const executeTrade = async () => {
    const quantity = parseFloat(qty);
    if (!quantity || quantity <= 0) { setTradeMsg({ type: 'error', text: 'Enter a valid quantity' }); return; }

    const price = orderType === 'limit' ? parseFloat(limitPrice) : (selectedQuote?.price ?? 0);
    if (!price || price <= 0) { setTradeMsg({ type: 'error', text: 'Live price not available yet. Wait a moment.' }); return; }

    const total = price * quantity;

    // Always read fresh from localStorage to avoid stale closure
    const currentBalance = getBalance();
    const currentHoldings = getHoldings();

    if (tradeType === 'buy') {
      if (total > currentBalance) {
        setTradeMsg({ type: 'error', text: `Insufficient balance. Need ${fmt(total)}, have ${fmt(currentBalance)}` });
        return;
      }
      const newBalance = parseFloat((currentBalance - total).toFixed(2));
      const existing = currentHoldings.find(h => h.symbol === selectedSymbol.symbol);
      let newHoldings;
      if (existing) {
        const totalQty = existing.qty + quantity;
        const avgPrice = ((existing.avgPrice * existing.qty) + (price * quantity)) / totalQty;
        newHoldings = currentHoldings.map(h =>
          h.symbol === selectedSymbol.symbol ? { ...h, qty: totalQty, avgPrice: parseFloat(avgPrice.toFixed(2)) } : h
        );
      } else {
        newHoldings = [...currentHoldings, {
          symbol: selectedSymbol.symbol,
          label: selectedSymbol.label,
          qty: quantity,
          avgPrice: price,
          assetType: 'stock',
        }];
      }
      saveBalance(newBalance);
      saveHoldings(newHoldings);
      setBalance(newBalance);
      setHoldings(newHoldings);
      setTradeMsg({ type: 'success', text: `BOUGHT ${quantity} × ${selectedSymbol.label} @ ${fmt(price)} | Remaining: ${fmt(newBalance)}` });

      // Sync with main Portfolio
      try {
        await fetch(`/api/portfolio/add/${encodeURIComponent(userId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: selectedSymbol.symbol,
            item_type: 'stock',
            quantity: quantity,
            purchase_price: price,
            purchase_date: new Date().toISOString()
          })
        });
      } catch (err) {
        console.error("Portfolio sync failed", err);
      }

    } else {
      const holding = currentHoldings.find(h => h.symbol === selectedSymbol.symbol);
      if (!holding || holding.qty < quantity) {
        setTradeMsg({ type: 'error', text: `Not enough shares. You have ${holding?.qty ?? 0}` });
        return;
      }
      const newBalance = parseFloat((currentBalance + total).toFixed(2));
      const newQty = parseFloat((holding.qty - quantity).toFixed(4));
      const newHoldings = newQty > 0.0001
        ? currentHoldings.map(h => h.symbol === selectedSymbol.symbol ? { ...h, qty: newQty } : h)
        : currentHoldings.filter(h => h.symbol !== selectedSymbol.symbol);
      saveBalance(newBalance);
      saveHoldings(newHoldings);
      setBalance(newBalance);
      setHoldings(newHoldings);
      setTradeMsg({ type: 'success', text: `SOLD ${quantity} × ${selectedSymbol.label} @ ${fmt(price)} | Balance: ${fmt(newBalance)}` });
    }

    // AI evaluation via sandbox API
    setEvalLoading(true); setAiEval(null);
    try {
      const r = await fetch(`/api/tradeverse/trades/add/${encodeURIComponent(userId)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol.symbol, asset_type: 'stock', trade_type: tradeType, quantity, buy_price: price }),
      });
      if (r.ok) { const d = await r.json(); setAiEval(d.evaluation); fetchDashboard(); }
    } catch { } finally { setEvalLoading(false); }
    setQty(''); setLimitPrice('');
    setTimeout(() => setTradeMsg(null), 4000);
  };

  // ── Computed values ────────────────────────────────────────────────────────
  const holdingsValue = holdings.reduce((sum, h) => sum + h.qty * (holdingPrices[h.symbol] ?? h.avgPrice), 0);
  const totalValue = balance + holdingsValue;
  const totalPnL = totalValue - INITIAL_BALANCE;
  const totalPnLPct = ((totalPnL / INITIAL_BALANCE) * 100).toFixed(2);
  const execPrice = orderType === 'limit' ? parseFloat(limitPrice || 0) : (selectedQuote?.price ?? 0);
  const estValue = execPrice * (parseFloat(qty) || 0);
  const canAfford = tradeType === 'buy' ? estValue <= balance : true;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-b from-[#083344] via-[#155e75] to-[#083344] text-white">
      {/* ── Top Nav ── */}
      <nav className="bg-n-7 border-b border-n-6 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-color-4 font-bold text-lg uppercase tracking-tighter">NIVESHAI</span>
          <span className="text-n-3 text-sm hidden sm:block font-code uppercase tracking-widest">TRADEVERSE</span>
        </div>
        <div className="flex items-center gap-1 bg-n-6 rounded-lg p-1">
          {[['dashboard', 'DASHBOARD'], ['leaderboard', 'LEADERBOARD'], ['community', 'COMMUNITY']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${tab === id ? 'bg-color-4 text-white' : 'text-n-4 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {marketStatus && (
            <span className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${marketStatus.status === 'open' ? 'bg-color-4/10 text-color-4 border-color-4/30' : 'bg-color-3/10 text-color-3 border-color-3/30'}`}>
              {marketStatus.status === 'open' ? '● MARKET LIVE' : '● MARKET CLOSED'}
            </span>
          )}
          <button
            onClick={() => window.location.href = '/Portfolio'}
            className="text-[10px] font-bold uppercase tracking-wider text-n-4 hover:text-white transition-colors border border-n-6 px-3 py-1 rounded-lg hover:bg-n-6"
          >
            Exit Terminal
          </button>
          <div className="w-8 h-8 rounded-full bg-stroke-1 border border-n-6 flex items-center justify-center text-sm font-bold text-white uppercase">
            {(userName || userEmail || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {tab === 'dashboard' && (
        <div className="p-4 max-w-[1600px] mx-auto">
          {/* ── Virtual Balance Banner ── */}
          <div className="bg-gradient-to-r from-n-7 to-n-8 border border-color-4/20 rounded-2xl p-5 mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-n-4 text-sm mb-1">Virtual Portfolio Balance</p>
              <p className="text-4xl font-bold text-white">{fmt(totalValue)}</p>
              <p className="text-sm mt-1">
                <span className="text-n-4">VIRTUAL CREDITS</span>
                <span className={`ml-3 font-semibold ${totalPnL >= 0 ? 'text-color-4' : 'text-color-3'}`}>
                  {totalPnL >= 0 ? '+' : ''}{fmt(totalPnL)} ({totalPnLPct}%) Today
                </span>
                <span className="text-n-3 ml-2">| {fmt(balance)} Cash Available</span>
              </p>
            </div>
            <div className="flex gap-3">
              {dashboard && (
                <>
                  <div className="text-center bg-n-6 rounded-xl px-4 py-2">
                    <p className="text-2xl font-bold text-yellow-400">{dashboard.creditScore ?? dashboard.ai_profile?.credit_score ?? '—'}</p>
                    <p className="text-xs text-n-4">Credit Score</p>
                  </div>
                  <div className="text-center bg-n-6 rounded-xl px-4 py-2">
                    <p className="text-2xl font-bold text-blue-400">{dashboard.level ?? dashboard.ai_profile?.level ?? '—'}</p>
                    <p className="text-xs text-n-4">Level</p>
                  </div>
                  <div className="text-center bg-n-6 rounded-xl px-4 py-2">
                    <p className="text-2xl font-bold text-purple-400">{dashboard.winRate ?? '—'}%</p>
                    <p className="text-xs text-n-4">Win Rate</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Market Watch */}
              <div className="bg-n-7 border border-n-6 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-n-6">
                  <h3 className="font-semibold text-sm text-gray-300">Market Watch</h3>
                  <button onClick={refreshWatch} className="text-xs font-bold uppercase tracking-wider text-color-5 hover:text-white transition-colors">[REFRESH]</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-n-3 text-xs border-b border-stroke-1">
                      <th className="text-left px-4 py-2">Symbol</th>
                      <th className="text-right px-4 py-2">Price</th>
                      <th className="text-right px-4 py-2">Change</th>
                      <th className="text-right px-4 py-2">Volume</th>
                    </tr></thead>
                    <tbody>
                      {WATCHLIST.map((w) => {
                        const q = watchPrices[w.symbol];
                        const chg = q ? ((q.price - q.previousClose) / q.previousClose * 100) : null;
                        const isSelected = selectedSymbol?.symbol === w.symbol;
                        return (
                          <tr key={w.symbol} onClick={() => setSelected(w)}
                            className={`border-b border-stroke-1 cursor-pointer transition-colors ${isSelected ? 'bg-color-4/10' : 'hover:bg-n-6'}`}>
                            <td className="px-4 py-2.5">
                              <span className={`font-semibold ${isSelected ? 'text-color-4' : 'text-white'}`}>{w.label}</span>
                              <span className="text-n-3 text-xs ml-2">{w.symbol.replace('.NS', '')}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono">{q ? fmt(q.price) : <span className="text-gray-600">Loading…</span>}</td>
                            <td className={`px-4 py-2.5 text-right font-semibold ${chg == null ? 'text-gray-600' : chg >= 0 ? 'text-color-4' : 'text-color-3'}`}>
                              {chg == null ? '—' : fmtPct(chg)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-n-3">{q?.volume ? (q.volume / 1e5).toFixed(1) + 'L' : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Holdings */}
              <div className="bg-n-7 border border-n-6 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-n-6">
                  <h3 className="font-semibold text-sm text-gray-300">My Holdings</h3>
                </div>
                {holdings.length === 0 ? (
                  <p className="text-n-3 text-sm text-center py-8">No holdings yet. Place your first trade →</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-n-3 text-xs border-b border-stroke-1">
                        <th className="text-left px-4 py-2">Stock</th>
                        <th className="text-right px-4 py-2">Qty</th>
                        <th className="text-right px-4 py-2">Avg Price</th>
                        <th className="text-right px-4 py-2">LTP</th>
                        <th className="text-right px-4 py-2">P&L</th>
                        <th className="text-right px-4 py-2">Current Value</th>
                      </tr></thead>
                      <tbody>
                        {holdings.map((h) => {
                          const ltp = holdingPrices[h.symbol] ?? h.avgPrice;
                          const pnl = (ltp - h.avgPrice) * h.qty;
                          const pnlPct = ((ltp - h.avgPrice) / h.avgPrice * 100);
                          return (
                            <tr key={h.symbol} className="border-b border-stroke-1 hover:bg-n-6 cursor-pointer" onClick={() => setSelected(WATCHLIST.find(w => w.symbol === h.symbol) || { symbol: h.symbol, label: h.label })}>
                              <td className="px-4 py-2.5 font-semibold text-white">{h.label}</td>
                              <td className="px-4 py-2.5 text-right text-gray-300">{h.qty}</td>
                              <td className="px-4 py-2.5 text-right text-gray-300 font-mono">{fmt(h.avgPrice)}</td>
                              <td className="px-4 py-2.5 text-right font-mono">{fmt(ltp)}</td>
                              <td className={`px-4 py-2.5 text-right font-semibold ${pnl >= 0 ? 'text-color-4' : 'text-color-3'}`}>
                                {pnl >= 0 ? '+' : ''}{fmt(pnl)} <span className="text-xs">({fmtPct(pnlPct)})</span>
                              </td>
                              <td className="px-4 py-2.5 text-right text-white font-mono">{fmt(ltp * h.qty)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Portfolio Items (from Portfolio page) with live prices ── */}
              <div className="bg-n-7 border border-n-6 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-n-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-300">My Portfolio (Real-Time)</h3>
                    <span className="text-xs text-gray-600">from Portfolio page</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lastEvalTime && <span className="text-xs text-gray-600">Eval: {lastEvalTime.toLocaleTimeString()}</span>}
                    <button onClick={() => { fetchPortfolioLive(); runEvaluate(); }}
                      className="text-n-3 hover:text-white transition-colors">
                      <span className="text-xs font-bold uppercase tracking-wider text-color-5">[REFRESH]</span>
                    </button>
                  </div>
                </div>

                {portfolioLive.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-n-3 text-sm">No items in your Portfolio yet.</p>
                    <a href="/Portfolio" className="text-color-4 text-xs mt-1 block hover:underline">→ Go to Portfolio to add stocks</a>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-n-3 text-xs border-b border-stroke-1">
                          <th className="text-left px-4 py-2">Symbol</th>
                          <th className="text-left px-4 py-2">Name</th>
                          <th className="text-right px-4 py-2">Live Price</th>
                          <th className="text-right px-4 py-2">Type</th>
                          <th className="text-right px-4 py-2">AI Score</th>
                        </tr></thead>
                        <tbody>
                          {portfolioLive.map((item) => {
                            const evalItem = evalResult?.items?.find(e => e.symbol === item.symbol);
                            return (
                              <tr key={item.symbol}
                                className="border-b border-stroke-1 hover:bg-n-6 cursor-pointer"
                                onClick={() => setSelected({ symbol: item.symbol, label: item.name || item.symbol })}>
                                <td className="px-4 py-2.5 font-semibold text-white">{item.symbol}</td>
                                <td className="px-4 py-2.5 text-n-4 text-xs">{item.name}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-white">
                                  {item.live_price ? fmt(item.live_price) : <span className="text-gray-600 animate-pulse">Loading…</span>}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${item.item_type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
                                      item.item_type === 'crypto' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-purple-500/20 text-purple-400'
                                    }`}>{item.item_type?.replace('_', ' ')}</span>
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  {evalItem ? (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${evalItem.label === 'Excellent' ? 'bg-color-4/20 text-color-4' :
                                        evalItem.label === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                                          evalItem.label === 'Average' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-color-3/20 text-color-3'
                                      }`}>{evalItem.label} {evalItem.finalScore}/100</span>
                                  ) : evalResultLoading ? (
                                    <span className="text-gray-600 text-xs animate-pulse">Evaluating…</span>
                                  ) : <span className="text-gray-600 text-xs">—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Overall eval score */}
                    {evalResult && evalResult.items?.length > 0 && (
                      <div className="px-4 py-3 border-t border-n-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${evalResult.portfolio_alignment_score >= 70 ? 'text-color-4' :
                              evalResult.portfolio_alignment_score >= 50 ? 'text-yellow-400' :
                                evalResult.portfolio_alignment_score >= 30 ? 'text-orange-400' : 'text-color-3'
                            }`}>{evalResult.portfolio_alignment_score}</span>
                          <div>
                            <p className={`text-sm font-semibold ${evalResult.portfolio_rating === 'Excellent' ? 'text-color-4' :
                                evalResult.portfolio_rating === 'Good' ? 'text-yellow-400' :
                                  evalResult.portfolio_rating === 'Fair' ? 'text-orange-400' : 'text-color-3'
                              }`}>{evalResult.portfolio_rating}</p>
                            <p className="text-xs text-n-3 max-w-xs truncate">{evalResult.recommendation}</p>
                          </div>
                        </div>
                        <button onClick={runEvaluate} disabled={evalResultLoading}
                          className="text-xs text-color-4 hover:text-emerald-300 border border-color-4/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          {evalResultLoading ? 'Evaluating…' : 'Re-evaluate'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* AI Feedback */}
              {(aiEval || evalLoading) && (
                <div className="bg-n-7 border border-color-4/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-sm text-color-4">AI TRADE EVALUATION</h3>
                  </div>
                  {evalLoading ? (
                    <div className="flex items-center gap-2 text-n-4 text-sm">Evaluating your trade…</div>
                  ) : aiEval && (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-2xl font-bold ${aiEval.detailed_analysis?.finalScore >= 70 ? 'text-color-4' : aiEval.detailed_analysis?.finalScore >= 40 ? 'text-yellow-400' : 'text-color-3'}`}>
                          {aiEval.detailed_analysis?.finalScore ?? 0}/100
                        </span>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${aiEval.feedback === 'excellent' ? 'bg-color-4/20 text-color-4' :
                            aiEval.feedback === 'good' ? 'bg-blue-500/20 text-blue-400' :
                              aiEval.feedback === 'neutral' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-color-3/20 text-color-3'
                          }`}>{aiEval.detailed_analysis?.label ?? aiEval.feedback}</span>
                        <span className={`text-sm font-bold ${aiEval.points_awarded >= 0 ? 'text-color-4' : 'text-color-3'}`}>
                          {aiEval.points_awarded >= 0 ? '+' : ''}{aiEval.points_awarded} pts
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{aiEval.detailed_analysis?.summary}</p>
                      {aiEval.detailed_analysis?.improvements?.length > 0 && (
                        <div className="space-y-1">
                          {aiEval.detailed_analysis.improvements.map((imp, i) => (
                            <p key={i} className="text-xs text-color-4 flex gap-1.5"><span>→</span><span>{imp}</span></p>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN — Trade Panel */}
            <div className="space-y-4">
              {/* Selected stock quote */}
              <div className="bg-n-7 border border-n-6 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-white text-lg">{selectedSymbol?.label}</p>
                    <p className="text-n-3 text-xs">{selectedSymbol?.symbol}</p>
                  </div>
                  <button onClick={refreshQuote} className="text-xs font-bold uppercase tracking-wider text-color-5 hover:text-white transition-colors">[REFRESH]</button>
                </div>
                {selectedQuote ? (
                  <>
                    <p className="text-3xl font-bold text-white mb-1">{fmt(selectedQuote.price)}</p>
                    <div className="flex gap-4 text-sm text-n-4">
                      <span>H: {fmt(selectedQuote.dayHigh)}</span>
                      <span>L: {fmt(selectedQuote.dayLow)}</span>
                      <span>Prev: {fmt(selectedQuote.previousClose)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-n-3 text-sm">Loading live price…</p>
                )}
              </div>

              {/* Order Panel */}
              <div className="bg-n-7 border border-n-6 rounded-2xl p-4">
                <h3 className="font-semibold text-sm text-gray-300 mb-3">Trade Panel</h3>

                {/* Buy / Sell toggle */}
                <div className="flex rounded-lg overflow-hidden mb-3 border border-n-6">
                  <button onClick={() => setTradeType('buy')}
                    className={`flex-1 py-2 text-sm font-bold transition-colors ${tradeType === 'buy' ? 'bg-color-4 text-white' : 'text-n-4 hover:bg-n-6'}`}>
                    BUY
                  </button>
                  <button onClick={() => setTradeType('sell')}
                    className={`flex-1 py-2 text-sm font-bold transition-colors ${tradeType === 'sell' ? 'bg-color-3 text-white' : 'text-n-4 hover:bg-n-6'}`}>
                    SELL
                  </button>
                </div>

                {/* Order type */}
                <div className="flex gap-2 mb-3">
                  {['market', 'limit'].map(t => (
                    <button key={t} onClick={() => setOrderType(t)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${orderType === t ? 'border-color-4 text-color-4 bg-color-4/10' : 'border-n-6 text-n-4 hover:border-white/30'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <div className="mb-3">
                  <label className="text-xs text-n-3 mb-1 block">Quantity</label>
                  <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="0"
                    className="w-full bg-n-6 border border-n-6 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-color-4" />
                </div>

                {/* Limit price */}
                {orderType === 'limit' && (
                  <div className="mb-3">
                    <label className="text-xs text-n-3 mb-1 block">Limit Price (₹)</label>
                    <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} placeholder={selectedQuote?.price ?? '0'}
                      className="w-full bg-n-6 border border-n-6 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-color-4" />
                  </div>
                )}

                {/* Market price display */}
                {orderType === 'market' && (
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="text-n-3">Market Price</span>
                    <span className="text-white font-mono">{selectedQuote ? fmt(selectedQuote.price) : '—'}</span>
                  </div>
                )}

                {/* Est value */}
                <div className="flex justify-between text-sm mb-4 py-2 border-t border-n-6">
                  <span className="text-n-3">Est. Value</span>
                  <div className="text-right">
                    <span className={`font-semibold ${tradeType === 'buy' && estValue > balance ? 'text-color-3' : 'text-white'}`}>
                      {estValue > 0 ? fmt(estValue) : '—'}
                    </span>
                    {tradeType === 'buy' && estValue > 0 && (
                      <p className={`text-xs mt-0.5 ${estValue > balance ? 'text-color-3' : 'text-color-4'}`}>
                        {estValue > balance ? `⚠ Need ${fmt(estValue - balance)} more` : `✓ Affordable`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trade message */}
                {tradeMsg && (
                  <div className={`text-xs rounded-lg px-3 py-2 mb-3 ${tradeMsg.type === 'success' ? 'bg-color-4/20 text-color-4' : 'bg-color-3/20 text-color-3'}`}>
                    {tradeMsg.text}
                  </div>
                )}

                {/* Execute button */}
                <button onClick={executeTrade}
                  disabled={!selectedQuote?.price && orderType === 'market'}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${tradeType === 'buy'
                      ? canAfford ? 'bg-color-4 hover:bg-color-4/80 text-white' : 'bg-red-900/50 border border-color-3/50 text-color-3 cursor-not-allowed'
                      : 'bg-color-3 hover:bg-color-3/80 text-white'
                    }`}>
                  {tradeType === 'buy'
                    ? canAfford
                      ? `BUY ${selectedSymbol?.label}`
                      : `⚠ Insufficient Balance`
                    : `SELL ${selectedSymbol?.label}`}
                </button>
              </div>

              {/* Credit score card */}
              {dashboard && (
                <div className="bg-n-7 border border-n-6 rounded-2xl p-4">
                  <h3 className="font-semibold text-sm text-gray-300 mb-3 flex items-center gap-2">AI PROFILE STATS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-n-3">Credit Score</span><span className="text-yellow-400 font-bold">{dashboard.creditScore ?? dashboard.ai_profile?.credit_score}</span></div>
                    <div className="flex justify-between"><span className="text-n-3">Level</span><span className="text-blue-400 font-semibold">{dashboard.level ?? dashboard.ai_profile?.level}</span></div>
                    <div className="flex justify-between"><span className="text-n-3">Risk Score</span><span className="text-orange-400">{dashboard.riskScore ?? dashboard.ai_profile?.risk_score}/100</span></div>
                    <div className="flex justify-between"><span className="text-n-3">Total Trades</span><span className="text-white">{dashboard.totalTrades ?? dashboard.portfolio_metrics?.total_trades ?? 0}</span></div>
                    <div className="flex justify-between"><span className="text-n-3">Win Rate</span><span className="text-color-4">{dashboard.winRate ?? '—'}%</span></div>
                    {/* Progress bar */}
                    {dashboard.nextLevelProgress != null && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-n-3 mb-1">
                          <span>Next Level</span><span>{Math.round(dashboard.nextLevelProgress)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-color-4 to-teal-400 rounded-full transition-all" style={{ width: `${dashboard.nextLevelProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Leaderboard Tab ── */}
      {tab === 'leaderboard' && (
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-white">GLOBAL LEADERBOARD</h2>
            <button onClick={fetchLeaderboard} className="ml-auto text-xs font-bold uppercase tracking-wider text-color-5 hover:text-white transition-colors">[REFRESH]</button>
          </div>
          {lbLoading ? (
            <div className="text-center py-12 text-n-4">Loading…</div>
          ) : leaderboard.length === 0 ? (
            <p className="text-n-3 text-center py-12">No leaderboard data yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => {
                const isMe = entry.user_id === userId;
                const medal = i === 0 ? 'RANK 1' : i === 1 ? 'RANK 2' : i === 2 ? 'RANK 3' : `RANK ${i + 1}`;
                return (
                  <div key={entry.user_id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${isMe ? 'bg-color-4/10 border-color-4/30' : 'bg-n-6 border-n-6'}`}>
                    <span className="text-xl w-8 text-center">{medal}</span>
                    <div className="w-9 h-9 rounded-full bg-stroke-1 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white border border-n-6">
                      {(entry.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{entry.email?.split('@')[0] || 'Trader'} {isMe && <span className="text-color-4 text-xs">(You)</span>}</p>
                      {entry.college_name && <p className="text-xs text-n-3 truncate">{entry.college_name}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-yellow-400 font-bold">{entry.credit_score?.toLocaleString()}</p>
                      <p className="text-xs text-n-3">{entry.level}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Community Tab ── */}
      {tab === 'community' && (
        <div className="p-4 max-w-[1400px] mx-auto">
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full mb-3">● SOCIAL</span>
            <h2 className="text-2xl font-extrabold text-white mb-1">Community Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">for Investors</span></h2>
            <p className="text-n-3 text-sm">Share trade ideas, discuss markets, and level up together.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
            {/* Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 bg-n-6 rounded-xl p-1">
                  {['All Posts', 'Trending', 'Following'].map(t => (
                    <button key={t} onClick={() => setFeedTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${feedTab === t ? 'bg-color-4 text-white' : 'text-n-4 hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowCompose(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-color-4/20 hover:bg-color-4/30 border border-color-4/30 text-color-4 rounded-xl text-xs font-semibold transition-all">
                  + Share Insight
                </button>
              </div>

              {showCompose && (
                <div className="bg-n-7 border border-n-6 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <CAvatar name={userName || userEmail || 'You'} size={32} />
                    <input value={newSymbol} onChange={e => setNewSymbol(e.target.value)} placeholder="Symbol (e.g. TCS)"
                      className="bg-n-6 border border-n-6 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-color-4 w-28" />
                    <div className="flex gap-1">
                      {['Bullish', 'Bearish', 'Neutral'].map(s => (
                        <button key={s} onClick={() => setNewSentiment(s)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-all ${newSentiment === s
                            ? s === 'Bullish' ? 'bg-color-4/30 border-color-4 text-color-4'
                              : s === 'Bearish' ? 'bg-color-3/30 border-color-3 text-color-3'
                                : 'bg-gray-500/30 border-gray-500 text-n-4'
                            : 'border-n-6 text-n-3 hover:border-white/30'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
                    placeholder="Share a trade idea, market insight, or analysis…" rows={3}
                    className="w-full bg-n-6 border border-n-6 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-color-4 resize-none mb-3" />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowCompose(false)} className="px-3 py-1.5 text-xs text-n-4 hover:text-white">Cancel</button>
                    <button onClick={() => {
                      if (!newPost.trim()) return;
                      const name = userName || userEmail?.split('@')[0] || 'You';
                      setPosts(prev => [{
                        id: Date.now(), author: name,
                        level: dashboard?.level ?? dashboard?.ai_profile?.level ?? 'Beginner',
                        role: 'Member', sentiment: newSentiment,
                        symbol: newSymbol ? `$${newSymbol.toUpperCase()}` : '',
                        price: '—', change: '—', up: true, time: 'just now',
                        title: newSymbol ? `Trade idea on $${newSymbol.toUpperCase()}` : 'Market Insight',
                        body: newPost.trim(), likes: 0, comments: 0, shares: 0,
                      }, ...prev]);
                      setNewPost(''); setNewSymbol(''); setShowCompose(false);
                    }} className="px-4 py-1.5 bg-color-4 hover:bg-color-4/80 text-white rounded-xl text-xs font-semibold transition-all">Post</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="bg-n-7 border border-n-6 rounded-2xl p-4 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CAvatar name={post.author} size={36} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">{post.author}</span>
                            <LevelBadge level={post.level} />
                            {post.role !== 'Member' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-color-5/20 text-color-5 border border-color-5/30 font-semibold">{post.role.toUpperCase()}</span>
                            )}
                            <SentimentBadge s={post.sentiment} />
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{post.time}</p>
                        </div>
                      </div>
                      {post.symbol && post.price !== '—' && (
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs font-bold text-white">{post.symbol}</p>
                          <p className="text-xs text-n-3">{post.price}</p>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{post.title}</h3>
                    <p className="text-n-4 text-sm leading-relaxed mb-3">{post.body}</p>
                    {post.symbol && post.price !== '—' && (
                      <div className="flex items-center justify-between bg-n-6 rounded-xl px-3 py-2 mb-3">
                        <div>
                          <p className="text-xs text-n-3">{post.symbol}</p>
                          <p className="text-sm font-bold text-white">{post.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkline up={post.up} />
                          <span className={`text-sm font-bold ${post.up ? 'text-color-4' : 'text-color-3'}`}>{post.change}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-n-3 text-xs">
                      <button onClick={() => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p))}
                        className="flex items-center gap-1.5 hover:text-color-3 transition-colors uppercase tracking-wider font-bold">UPVOTE ({post.likes})</button>
                      <button className="flex items-center gap-1.5 hover:text-color-5 transition-colors uppercase tracking-wider font-bold">REPLY ({post.comments})</button>
                      <button className="flex items-center gap-1.5 hover:text-color-4 transition-colors uppercase tracking-wider font-bold">SHARE ({post.shares})</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Trending */}
              <div className="bg-n-7 border border-n-6 rounded-2xl p-4">
                <h3 className="font-semibold text-sm text-gray-300 mb-3">Trending Topics</h3>
                <div className="space-y-3">
                  {TRENDING.map((t, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{t.tag}</span>
                      <div className="flex items-center gap-2">
                        <Sparkline up={t.up} />
                        <span className={`text-sm font-bold ${t.up ? 'text-color-4' : 'text-color-3'}`}>{t.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Chat */}
              <div className="bg-n-7 border border-n-6 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-n-6">
                  <h3 className="font-semibold text-sm text-gray-300">Live Discussion</h3>
                  <span className="flex items-center gap-1.5 text-xs text-color-4 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                  </span>
                </div>
                <div className="h-48 overflow-y-auto px-3 py-3 space-y-2">
                  {chatMsgs.map((m, i) => (
                    <div key={i} className={`flex items-start gap-2 ${m.isMe ? 'flex-row-reverse' : ''}`}>
                      <CAvatar name={m.user} size={24} />
                      <div className={`max-w-[80%] flex flex-col ${m.isMe ? 'items-end' : ''}`}>
                        <div className={`rounded-xl px-2.5 py-1.5 text-xs ${m.isMe ? 'bg-color-4/20 text-emerald-300' : 'bg-n-6 text-gray-300'}`}>
                          {!m.isMe && <span className="font-semibold text-white block text-xs mb-0.5">{m.user}</span>}
                          {m.msg}
                        </div>
                        <span className="text-xs text-gray-600 mt-0.5 px-1">{m.time}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="px-3 py-2 border-t border-n-6 flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        const name = userName || userEmail?.split('@')[0] || 'You';
                        setChatMsgs(prev => [...prev.slice(-20), { user: name, msg: chatInput.trim(), time: 'now', isMe: true }]);
                        setChatInput('');
                      }
                    }}
                    placeholder="Type a message…"
                    className="flex-1 bg-n-6 border border-n-6 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-color-4" />
                  <button onClick={() => {
                    if (!chatInput.trim()) return;
                    const name = userName || userEmail?.split('@')[0] || 'You';
                    setChatMsgs(prev => [...prev.slice(-20), { user: name, msg: chatInput.trim(), time: 'now', isMe: true }]);
                    setChatInput('');
                  }} className="px-3 py-1.5 bg-color-4 hover:bg-color-4/80 text-white rounded-lg text-xs font-bold transition-colors">Send</button>
                </div>
              </div>

              {/* Level Guide — real-time highlight */}
              <div className="bg-n-7 border border-n-6 rounded-2xl p-4">
                <h3 className="font-semibold text-sm text-gray-300 mb-3">Level Guide</h3>
                <div className="space-y-2">
                  {Object.entries(LEVEL_CFG).map(([name, cfg]) => {
                    const thresholds = { Beginner: 0, Intermediate: 1200, Advanced: 1600, Pro: 2200 };
                    const currentLevel = dashboard?.level ?? dashboard?.ai_profile?.level;
                    const isCurrentLevel = currentLevel === name;
                    return (
                      <div key={name} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isCurrentLevel ? `${cfg.bg} ${cfg.border}` : 'bg-n-6 border-n-6'}`}>
                        <span className={`text-xs font-bold ${isCurrentLevel ? cfg.color : 'text-n-4'}`}>{cfg.icon} {name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-n-3">{thresholds[name]}+ pts</span>
                          {isCurrentLevel && <span className={`text-xs font-bold ${cfg.color} animate-pulse`}>← You</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {dashboard && (
                  <div className="mt-3 pt-3 border-t border-n-6">
                    <div className="flex justify-between text-xs text-n-3 mb-1">
                      <span>Credit Score</span>
                      <span className="text-yellow-400 font-bold">{dashboard.creditScore ?? dashboard.ai_profile?.credit_score}</span>
                    </div>
                    {(() => {
                      const score = dashboard.creditScore ?? dashboard.ai_profile?.credit_score ?? 0;
                      const order = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
                      const thresholds = { Beginner: 0, Intermediate: 1200, Advanced: 1600, Pro: 2200 };
                      const currentLevel = dashboard.level ?? dashboard.ai_profile?.level ?? 'Beginner';
                      const idx = order.indexOf(currentLevel);
                      const next = order[idx + 1];
                      if (!next) return <p className="text-xs text-color-2 text-center uppercase tracking-wider font-bold mt-2">MAX LEVEL REACHED</p>;
                      const pct = Math.min(100, ((score - thresholds[currentLevel]) / (thresholds[next] - thresholds[currentLevel])) * 100);
                      return (
                        <>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-color-4 to-teal-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{Math.round(pct)}% to {next}</p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
