import { useState, useEffect } from 'react';
import { Trophy, Medal, Calendar, TrendingUp, Crown, User } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('all_time');
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard/${period}/`);
      const data = await response.json();
      setLeaderboard(data.leaderboard);
      setUserRank(data.user_rank);
      setTotalPlayers(data.total_players);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-slate-500">#{rank}</span>;
  };

  const getPeriodIcon = () => {
    switch(period) {
      case 'all_time': return <Trophy className="w-5 h-5" />;
      case 'monthly': return <Calendar className="w-5 h-5" />;
      case 'weekly': return <TrendingUp className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getPeriodTitle = () => {
    switch(period) {
      case 'all_time': return 'All-Time Rankings';
      case 'monthly': return 'Monthly Rankings';
      case 'weekly': return 'Weekly Rankings';
      default: return 'Leaderboard';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {getPeriodIcon()}
            {getPeriodTitle()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('all_time')}
              className={`px-4 py-2 rounded-lg transition-all ${
                period === 'all_time' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-lg transition-all ${
                period === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-lg transition-all ${
                period === 'weekly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          🏆 Total players: {totalPlayers} | Showing top {leaderboard.length} players
        </p>
      </div>

      {/* Leaderboard List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {leaderboard.map((player, idx) => (
              <div
                key={idx}
                className={`p-4 hover:bg-slate-800/50 transition-colors ${
                  player.rank === userRank ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center">
                      {getRankIcon(player.rank)}
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {player.username}
                        {player.rank === userRank && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {player.games_played} games played • {player.win_rate}% win rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{player.score}</div>
                    <div className="text-xs text-slate-500">total points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Rank Card (if logged in and not in top list) */}
      {userRank && userRank > 100 && (
        <div className="p-4 border-t border-slate-700 bg-blue-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 text-center">
                <span className="text-lg font-bold text-blue-400">#{userRank}</span>
              </div>
              <div>
                <div className="font-semibold text-white">Your Rank</div>
                <div className="text-xs text-slate-400">
                  Keep playing to climb the leaderboard!
                </div>
              </div>
            </div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Play More →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}