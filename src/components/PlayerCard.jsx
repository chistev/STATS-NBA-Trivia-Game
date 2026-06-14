export default function PlayerCard({ player, isRevealed }) {
  if (!player) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-center border border-slate-700">
      <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-slate-700 flex items-center justify-center overflow-hidden">
        {isRevealed ? (
          <div className="text-6xl">🏀</div>
        ) : (
          <div className="text-7xl opacity-30">❓</div>
        )}
      </div>

      <h2 className="text-4xl font-bold mb-2 tracking-tight">
        {isRevealed ? player.name : "???"}
      </h2>
      
      {isRevealed && (
        <div className="space-y-3 text-left max-w-xs mx-auto mt-8">
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="text-slate-400">Position</span>
            <span>{player.position}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="text-slate-400">Team</span>
            <span>{player.team}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="text-slate-400">Height</span>
            <span>{player.height}</span>
          </div>
          <div className="pt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">{player.stats.points}</div>
              <div className="text-xs text-slate-400">PPG</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">{player.stats.rebounds}</div>
              <div className="text-xs text-slate-400">RPG</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}