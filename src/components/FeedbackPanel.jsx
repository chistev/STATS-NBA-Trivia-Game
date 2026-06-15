import { Info } from 'lucide-react';

export default function FeedbackPanel({ feedback }) {
  if (!feedback || feedback.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-slate-800/50 rounded-2xl border border-blue-500/30 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-semibold text-blue-400">STATS COMPARISON</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {feedback.map((item, idx) => (
          <div key={idx} className="text-sm">
            <div className="text-slate-500 text-xs">{item.label}</div>
            <div className={item.type === 'correct' ? 'text-green-400' : 'text-red-400'}>
              {item.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}