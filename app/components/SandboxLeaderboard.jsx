'use client';

import { useState, useEffect } from 'react';
import { Trophy, Users, Award, Loader2 } from 'lucide-react';
import { useRealtimeRefresh } from '@/app/context/RealtimeContext';

/**
 * SandboxLeaderboard Component
 * 
 * Shows:
 * - Global leaderboard
 * - College leaderboard
 * - User's rank and progress
 * - Level badges
 */

export default function SandboxLeaderboard({ userId, collegeName }) {
  const [leaderboardType, setLeaderboardType] = useState('global');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRank, setUserRank] = useState(null);
  const { refreshTrigger } = useRealtimeRefresh();

  useEffect(() => {
    fetchLeaderboard();

    // Auto-refresh leaderboard every 3 seconds for real-time updates
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, [leaderboardType, collegeName, refreshTrigger]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');

    try {
      let url;
      if (leaderboardType === 'global') {
        url = '/api/tradeverse/leaderboard/global';
      } else if (leaderboardType === 'college' && collegeName) {
        url = `/api/tradeverse/leaderboard/college/${encodeURIComponent(collegeName)}`;
      } else {
        setError('College information not available');
        setLoading(false);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();
      setEntries(data.entries || []);

      // Fetch user rank
      if (leaderboardType === 'global') {
        const rankResponse = await fetch(
          `/api/tradeverse/leaderboard/global/user-rank/${userId}`
        );
        if (rankResponse.ok) {
          const rankData = await rankResponse.json();
          setUserRank(rankData);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-yellow-100 text-yellow-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Pro':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Beginner':
        return '🌱';
      case 'Intermediate':
        return '📚';
      case 'Pro':
        return '🏆';
      default:
        return '📊';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-gray-600">
          Compete with fellow investors and climb the rankings
        </p>
      </div>

      {/* Leaderboard Type Selector */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setLeaderboardType('global')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            leaderboardType === 'global'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          🌍 Global
        </button>
        {collegeName && (
          <button
            onClick={() => setLeaderboardType('college')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              leaderboardType === 'college'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎓 {collegeName.substring(0, 20)}
          </button>
        )}
      </div>

      {/* User's Position Card (if available) */}
      {userRank && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border-4 border-indigo-600">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🎯 Your Position</h2>
            <p className="text-6xl font-bold text-indigo-600 mb-4">#{userRank.rank}</p>
            <p className="text-lg text-gray-600 mb-6">
              Score: <span className="font-bold text-gray-900">{userRank.entry.credit_score}</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Level</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {getLevelIcon(userRank.entry.level)} {userRank.entry.level}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Trades</p>
                <p className="text-2xl font-bold text-green-600">
                  {userRank.entry.trades_count}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Consistency</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(userRank.entry.consistency_score * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p className="font-semibold">{error}</p>
          </div>
        ) : entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Rank</th>
                  <th className="px-6 py-4 text-left font-bold">Trader</th>
                  <th className="px-6 py-4 text-left font-bold">Level</th>
                  <th className="px-6 py-4 text-right font-bold">Credit Score</th>
                  <th className="px-6 py-4 text-right font-bold">Consistency</th>
                  <th className="px-6 py-4 text-right font-bold">Trades</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map((entry, index) => (
                  <tr
                    key={entry.user_id}
                    className={`hover:bg-indigo-50 transition-colors ${
                      index < 3 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      {index >= 3 && (
                        <span className="font-bold text-lg text-gray-700">
                          #{entry.rank}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 truncate">
                          {entry.email?.split('@')[0] || `User ${entry.user_id}`}
                        </p>
                        {entry.college_name && (
                          <p className="text-xs text-gray-500">{entry.college_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(
                          entry.level
                        )}`}
                      >
                        {getLevelIcon(entry.level)} {entry.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900 text-lg">
                        {entry.credit_score.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                            style={{
                              width: `${Math.min(entry.consistency_score * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-10">
                          {(entry.consistency_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {entry.trades_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-600">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No traders yet</p>
          </div>
        )}
      </div>

      {/* Tips Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">💡 How to Climb the Leaderboard</h3>
        <ul className="space-y-2 text-blue-900 text-sm">
          <li>✅ Make good trades aligned with your goals (+25 to +50 points)</li>
          <li>✅ Trade consistently and avoid panic selling (-0 to -100 points for poor trades)</li>
          <li>✅ Improve your level: Beginner → Intermediate → Pro (2000+ points)</li>
          <li>✅ Build a diversified portfolio across asset classes</li>
        </ul>
      </div>
    </div>
  );
}
