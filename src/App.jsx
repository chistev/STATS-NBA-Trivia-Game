import { useState, useEffect, useCallback } from 'react';
import ClueCard from './components/ClueCard';
import GuessInput from './components/GuessInput';
import PlayerCard from './components/PlayerCard';
import GameStats from './components/GameStats';
import ShareModal from './components/ShareModal';
import StreakCounter from './components/StreakCounter';
import KeyboardHints from './components/KeyboardHints';
import Confetti from './components/Confetti';
import { getDailyPlayer } from './data/players';
import { saveGameState, loadGameState, updateStreak, getCareerStats } from './utils/gameUtils';

export default function App() {
  const [dailyPlayer, setDailyPlayer] = useState(null);
  const [revealedClues, setRevealedClues] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxGuesses, setMaxGuesses] = useState(6); // Increased to 6 for better gameplay
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Initialize game
  useEffect(() => {
    const player = getDailyPlayer();
    setDailyPlayer(player);
    
    const savedState = loadGameState();
    const today = new Date().toDateString();
    
    if (savedState && savedState.date === today) {
      setRevealedClues(savedState.revealedClues);
      setGuesses(savedState.guesses);
      setGameOver(savedState.gameOver);
      setGameWon(savedState.gameWon);
    } else {
      // Reset for new day
      setRevealedClues(new Array(player.clues.length).fill(false));
      setGuesses([]);
      setGameOver(false);
      setGameWon(false);
    }
    
    setStreak(loadStreak());
    calculateTimeRemaining();
  }, []);

  const calculateTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;
    setTimeRemaining(diff);
  };

  useEffect(() => {
    if (timeRemaining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1000);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const formatTimeRemaining = () => {
    if (!timeRemaining) return '';
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const loadStreak = () => {
    const savedStreak = localStorage.getItem('stats-streak');
    return savedStreak ? parseInt(savedStreak) : 0;
  };

  const handleRevealClue = (index) => {
    if (!revealedClues[index] && !gameOver && !gameWon) {
      const newRevealed = [...revealedClues];
      newRevealed[index] = true;
      setRevealedClues(newRevealed);
      
      // Auto-reveal next clue after 0.5s for better flow (optional)
      if (index < revealedClues.length - 1 && !newRevealed[index + 1]) {
        setTimeout(() => {
          if (!gameOver && !gameWon && !newRevealed[index + 1]) {
            const autoReveal = [...newRevealed];
            autoReveal[index + 1] = true;
            setRevealedClues(autoReveal);
          }
        }, 800);
      }
    }
  };

  const handleGuess = (guess) => {
    if (gameOver || gameWon) return;
    
    const normalizedGuess = guess.toLowerCase().trim();
    const isCorrect = normalizedGuess === dailyPlayer.name.toLowerCase();
    
    const newGuess = {
      text: guess,
      isCorrect,
      timestamp: new Date(),
      remainingGuesses: maxGuesses - guesses.length - 1
    };
    
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    
    if (isCorrect) {
      setGameWon(true);
      setGameOver(true);
      const newStreak = updateStreak(true);
      setStreak(newStreak);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Auto-reveal all clues on win
      setRevealedClues(revealedClues.map(() => true));
    } else if (newGuesses.length >= maxGuesses) {
      setGameOver(true);
      setGameWon(false);
      updateStreak(false);
      setStreak(0);
      // Reveal all clues on loss
      setRevealedClues(revealedClues.map(() => true));
    } else {
      // Show hint after 2 wrong guesses
      if (newGuesses.length === 2 && !revealedClues[1]) {
        setTimeout(() => {
          setErrorMessage("💡 Tip: Try revealing more clues!");
          setShowError(true);
          setTimeout(() => setShowError(false), 3000);
        }, 500);
      }
    }
    
    setErrorMessage('');
    setShowError(false);
  };

  const getScore = () => {
    if (!gameWon) return 0;
    const cluesRevealed = revealedClues.filter(r => r).length;
    const guessBonus = Math.max(0, maxGuesses - guesses.length);
    const cluePenalty = Math.max(0, maxGuesses - cluesRevealed);
    return guessBonus + cluePenalty;
  };

  const getDifficultyRating = () => {
    const cluesRevealed = revealedClues.filter(r => r).length;
    if (guesses.length === 1 && cluesRevealed === 0) return "🔥 LEGENDARY";
    if (guesses.length <= 2 && cluesRevealed <= 1) return "⭐ ELITE";
    if (guesses.length <= 4 && cluesRevealed <= 2) return "👍 GOOD";
    if (gameWon) return "🎯 COMPLETED";
    return "💪 TRY AGAIN";
  };

  if (!dailyPlayer) return (
    <div className="game-container flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-400">Loading today's challenge...</p>
      </div>
    </div>
  );

  return (
    <div className="game-container">
      {showConfetti && <Confetti />}
      
      {/* Header with Timer */}
      <div className="text-center mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-left">
            <div className="text-xs text-slate-500">NEXT CHALLENGE</div>
            <div className="text-sm font-mono text-blue-400">{formatTimeRemaining()}</div>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            STATS
          </h1>
          <StreakCounter streak={streak} />
        </div>
        <p className="text-slate-400">Daily NBA Trivia • Guess the mystery player</p>
        <div className="h-1 w-20 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* Game Status with Enhanced UI */}
      {(gameOver || gameWon) && (
        <div className={`mb-6 p-6 rounded-2xl text-center animate-slide-down ${
          gameWon ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500' 
                  : 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border-2 border-red-500'
        }`}>
          <div className="text-4xl mb-2">{gameWon ? '🏆' : '💀'}</div>
          <p className="text-2xl font-bold mb-2">
            {gameWon 
              ? `Correct! You got it in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}!`
              : `Game Over! The player was ${dailyPlayer.name}`
            }
          </p>
          {gameWon && (
            <>
              <p className="text-lg text-blue-400 mb-3">{getDifficultyRating()}</p>
              <p className="text-sm text-slate-400 mb-4">Score: {getScore()} points</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all transform hover:scale-105"
                >
                  Share Results 📤
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all"
                >
                  New Game 🔄
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Player Card with Animation */}
      {(gameOver || gameWon) && (
        <div className="mb-6 animate-fade-in">
          <PlayerCard player={dailyPlayer} isRevealed={true} />
        </div>
      )}

      {/* Stats Preview */}
      {!gameOver && !gameWon && guesses.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-400">CURRENT SCORE</span>
              <div className="text-2xl font-bold text-blue-400">{getScore()}</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">GUESSES LEFT</span>
              <div className="text-2xl font-bold text-purple-400">{maxGuesses - guesses.length}</div>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-400">ACCURACY</span>
              <div className="text-2xl font-bold text-green-400">
                {Math.round((guesses.filter(g => g.isCorrect).length / guesses.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clues Section with Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🔍</span> Statistical Clues
          </h2>
          <div className="text-sm text-slate-400">
            {revealedClues.filter(r => r).length}/{revealedClues.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(revealedClues.filter(r => r).length / revealedClues.length) * 100}%` }}
          />
        </div>
        
        {dailyPlayer.clues.map((clue, index) => (
          <ClueCard
            key={index}
            clue={clue}
            index={index}
            revealed={revealedClues[index]}
            onReveal={handleRevealClue}
            disabled={gameOver || gameWon}
          />
        ))}
      </div>

      {/* Guess History with Better Visuals */}
      {guesses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
            <span>📝</span> GUESS HISTORY
            <span className="text-xs text-slate-500">({guesses.length}/{maxGuesses})</span>
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {guesses.map((guess, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl transform transition-all hover:scale-[1.02] ${
                  guess.isCorrect 
                    ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500 animate-pulse' 
                    : 'bg-red-600/10 border border-red-500/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{guess.isCorrect ? '✅' : '❌'}</span>
                    <span className="font-medium">{guess.text}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {!guess.isCorrect && (
                      <span className="text-xs text-orange-400">
                        {guess.remainingGuesses} left
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(guess.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guess Input with Enhanced UX */}
      <GuessInput
        onGuess={handleGuess}
        disabled={gameOver || gameWon}
        guessesLeft={maxGuesses - guesses.length}
        showError={showError}
        errorMessage={errorMessage}
      />

      {/* Quick Tips */}
      {!gameOver && !gameWon && guesses.length === 0 && (
        <div className="mt-4 p-3 bg-blue-900/20 rounded-xl border border-blue-500/30">
          <p className="text-sm text-center text-blue-300">
            💡 Pro tip: Reveal clues strategically to maximize your score!
          </p>
        </div>
      )}

      {/* Keyboard Hints */}
      <KeyboardHints />

      {/* Enhanced Game Stats */}
      <GameStats {...getCareerStats()} />

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          guesses={guesses.length}
          maxGuesses={maxGuesses}
          cluesRevealed={revealedClues.filter(r => r).length}
          totalClues={revealedClues.length}
          playerName={dailyPlayer.name}
          score={getScore()}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}