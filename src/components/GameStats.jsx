import { BarChart2, TrendingUp, Target, Zap } from 'lucide-react';

export default function GameStats({ gamesPlayed, winRate, currentStreak, bestStreak }) {
  const stats = [
    { icon: <BarChart2 className="w-5 h-5" />, label: 'Games', value: gamesPlayed },
    { icon: <Target className="w-5 h-5" />, label: 'Win Rate', value: `${winRate}%` },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Streak', value: currentStreak },
    { icon: <Zap className="w-5 h-5" />, label: 'Best', value: bestStreak }
  ];

  return (
    <div className="mt-12 pt-8 border-t border-slate-800">
      <h3 className="text-center text-sm font-semibold text-slate-400 mb-4">CAREER STATS</h3>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="flex justify-center mb-2 text-blue-400">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}