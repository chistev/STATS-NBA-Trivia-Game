import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareModal({ guesses, maxGuesses, cluesRevealed, totalClues, onClose }) {
  const [copied, setCopied] = useState(false);
  
  const getShareText = () => {
    const score = maxGuesses - guesses + 1;
    const clueEmoji = '🔍'.repeat(cluesRevealed);
    const emptyClue = '⬜'.repeat(totalClues - cluesRevealed);
    
    return `STATS NBA Trivia - Daily Challenge\n\n` +
           `🎯 Solved in ${guesses} ${guesses === 1 ? 'guess' : 'guesses'}!\n` +
           `📊 Score: ${score}/${maxGuesses}\n` +
           `🔍 Clues: ${clueEmoji}${emptyClue}\n\n` +
           `Play daily at STATS.game 🏀`;
  };
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Share Results</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-xl mb-4">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {getShareText()}
          </pre>
        </div>
        
        <button
          onClick={handleCopy}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
}