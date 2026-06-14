import { useState, useEffect, useRef } from 'react';
import { players } from '../data/players';

export default function GuessInput({ onGuess, disabled, guessesLeft, showError, errorMessage }) {
  const [guess, setGuess] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const playerNames = players.map(p => p.name);

  useEffect(() => {
    if (guess.length > 1) {
      const filtered = playerNames.filter(name =>
        name.toLowerCase().includes(guess.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [guess]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.trim() && !disabled) {
      onGuess(guess.trim());
      setGuess('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setGuess(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="relative">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type a player name (e.g., LeBron James)"
              className={`guess-input w-full px-6 py-4 rounded-2xl text-lg focus:outline-none transition-all ${
                showError ? 'border-red-500 ring-2 ring-red-500/20' : ''
              }`}
              disabled={disabled}
              autoComplete="off"
            />
            {showSuggestions && !disabled && (
              <div className="absolute z-10 w-full mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-6 py-3 hover:bg-slate-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={disabled || !guess.trim()}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            GUESS 🏀
          </button>
        </div>
        {showError && (
          <p className="text-red-400 text-sm mt-2 animate-shake">
            {errorMessage}
          </p>
        )}
        <p className="text-center text-sm text-slate-400 mt-3">
          💡 {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} remaining • Be specific!
        </p>
      </div>
    </form>
  );
}