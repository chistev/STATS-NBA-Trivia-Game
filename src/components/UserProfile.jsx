import { useState, useEffect } from 'react';
import { User, Trophy, TrendingUp, Star, LogOut, Percent } from 'lucide-react';

export default function UserProfile({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [percentiles, setPercentiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    if (user && showStats) {
      fetchUserStats();
    }
  }, [user, showStats]);

  const fetchUserStats = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }

    // Fetch percentile rankings
    try {
      const response = await fetch(`${API_BASE_URL}/percentile-rank/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPercentiles(data);
    } catch (error) {
      console.error('Error fetching percentiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (!showStats) {
    return (
      <button
        onClick={() => setShowStats(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all"
      >
        <User className="w-4 h-4" />
        <span>{user?.username}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Player Profile
          </h2>
          <button onClick={() => setShowStats(false)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading stats...</div>
        ) : (
          <>
            {/* User Info */}
            <div className="mb-6 p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">{user.username}</span>
              </div>
              <p className="text-slate-400 text-sm">Member since {new Date(user.created_at).toLocaleDateString()}</p>
            </div>

            {/* Career Stats */}
            {stats && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Career Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{stats.profile.total_games_played}</div>
                    <div className="text-xs text-slate-400">Games Played</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{stats.profile.total_wins}</div>
                    <div className="text-xs text-slate-400">Wins</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{stats.profile.win_rate}%</div>
                    <div className="text-xs text-slate-400">Win Rate</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">{stats.profile.best_streak}</div>
                    <div className="text-xs text-slate-400">Best Streak</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{stats.profile.average_score}</div>
                    <div className="text-xs text-slate-400">Avg Score</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{stats.profile.current_streak}</div>
                    <div className="text-xs text-slate-400">Current Streak</div>
                  </div>
                </div>
              </div>
            )}

            {/* Percentile Rankings */}
            {percentiles && percentiles.percentiles && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-green-400" />
                  Percentile Rankings
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Average Score</span>
                      <span className="font-bold text-blue-400">{percentiles.percentiles.average_score}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${percentiles.percentiles.average_score}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Better than {percentiles.percentiles.average_score}% of players
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Win Rate</span>
                      <span className="font-bold text-green-400">{percentiles.percentiles.win_rate}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${percentiles.percentiles.win_rate}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Best Streak</span>
                      <span className="font-bold text-orange-400">{percentiles.percentiles.best_streak}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                        style={{ width: `${percentiles.percentiles.best_streak}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-slate-300">
                    📊 <span className="font-semibold">Global Stats:</span> Average score {percentiles.global_averages.average_score} | 
                    {percentiles.total_users} players tracked
                  </p>
                </div>
              </div>
            )}

            {/* Recent Games */}
            {stats && stats.recent_games && stats.recent_games.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Recent Games</h3>
                <div className="space-y-2">
                  {stats.recent_games.map((game, idx) => (
                    <div key={idx} className="p-3 bg-slate-800 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{game.player_name}</div>
                        <div className="text-xs text-slate-400">{new Date(game.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                          {game.won ? `+${game.score}` : 'Loss'}
                        </div>
                        <div className="text-xs text-slate-400">{game.guesses_count} guesses</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}