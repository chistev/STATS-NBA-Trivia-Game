import { Flame } from 'lucide-react';

export default function StreakCounter({ streak }) {
  if (streak === 0) return null;
  
  return (
    <div className="flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/50">
      <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
      <span className="font-bold text-orange-500">{streak} day streak!</span>
    </div>
  );
}