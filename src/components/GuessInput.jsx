import { useState, useEffect, useRef } from 'react';

export default function GuessInput({ onGuess, disabled, guessesLeft, showError, errorMessage, suggestions = [] }) {
  const [guess, setGuess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (guess.length > 1) {
      const filtered = suggestions.filter(name =>
        name.toLowerCase().includes(guess.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [guess, suggestions]);

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
        <div className="flex flex-col sm:flex-row gap-3">
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
              <div className="absolute z-10 w-full mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-in fade-in duration-200">
                {filteredSuggestions.map((suggestion, idx) => (
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
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
          >
            GUESS 🏀
          </button>
        </div>
        {showError && (
          <p className="text-red-400 text-sm mt-2 animate-shake text-center">
            {errorMessage}
          </p>
        )}
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm text-slate-400">
            💡 {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} remaining
          </p>
          <p className="text-xs text-slate-500">
            Each wrong guess reveals a clue!
          </p>
        </div>
      </div>
    </form>
  );
}