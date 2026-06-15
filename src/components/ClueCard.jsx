import { useState } from 'react';
import { Eye, EyeOff, Trophy, Award, Star, Lock } from 'lucide-react';

export default function ClueCard({ clue, index, revealed, onReveal, disabled }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getClueIcon = () => {
    if (index === 0) return <Trophy className="w-4 h-4" />;
    if (index === 1) return <Award className="w-4 h-4" />;
    if (index === 2) return <Star className="w-4 h-4" />;
    return null;
  };

  const getDifficultyBadge = () => {
    if (index === 0) return <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Easy</span>;
    if (index === 1) return <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Medium</span>;
    if (index === 2) return <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Hard</span>;
    return <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Expert</span>;
  };

  return (
    <div
      className={`clue-card p-5 rounded-2xl border transition-all duration-300 mb-3 ${
        !revealed && !disabled
          ? 'cursor-pointer hover:scale-[1.02] hover:border-blue-500 bg-slate-900/50 border-slate-700'
          : revealed
          ? 'revealed bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500 shadow-lg shadow-blue-500/10'
          : 'opacity-50 bg-slate-900/30 border-slate-700'
      }`}
      onClick={() => !revealed && !disabled && onReveal(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-all ${
          revealed 
            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg' 
            : 'bg-slate-700 text-slate-300'
        }`}>
          {revealed ? getClueIcon() || (index + 1) : <Lock className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {revealed && getDifficultyBadge()}
              <p className={`text-lg font-medium ${revealed ? 'text-white' : 'text-slate-300'}`}>
                {revealed ? clue : (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                    Clue #{index + 1} (Click to reveal)
                  </span>
                )}
              </p>
            </div>
            {revealed ? (
              <Eye className="text-blue-400 w-5 h-5" />
            ) : (
              <EyeOff className={`text-slate-500 w-5 h-5 transition-colors ${isHovered && !disabled ? 'text-blue-400' : ''}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}