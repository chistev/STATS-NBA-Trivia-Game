import { useState, useEffect } from 'react';
import ClueCard from './components/ClueCard';
import GuessInput from './components/GuessInput';
import PlayerCard from './components/PlayerCard';
import GameStats from './components/GameStats';
import ShareModal from './components/ShareModal';
import StreakCounter from './components/StreakCounter';
import KeyboardHints from './components/KeyboardHints';
import { getDailyPlayer, players } from './data/players';
import { saveGameState, loadGameState, updateStreak, getCareerStats } from './utils/gameUtils'

export default function App() {
  const [dailyPlayer, setDailyPlayer] = useState(null);
  const [revealedClues, setRevealedClues] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxGuesses, setMaxGuesses] = useState(5);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize game
  useEffect(() => {
    const player = getDailyPlayer();
    setDailyPlayer(player);
    
    const savedState = loadGameState();
    if (savedState && savedState.date === new Date().toDateString()) {
      setRevealedClues(savedState.revealedClues);
      setGuesses(savedState.guesses);
      setGameOver(savedState.gameOver);
      setGameWon(savedState.gameWon);
    } else {
      // Reset for new day
      setRevealedClues([false, false, false, false]);
      setGuesses([]);
      setGameOver(false);
      setGameWon(false);
    }
    
    setStreak(loadStreak());
  }, []);

  // Save game state
  useEffect(() => {
    if (dailyPlayer) {
      saveGameState({
        date: new Date().toDateString(),
        revealedClues,
        guesses,
        gameOver,
        gameWon,
        playerId: dailyPlayer.id
      });
    }
  }, [revealedClues, guesses, gameOver, gameWon, dailyPlayer]);

  const loadStreak = () => {
    const savedStreak = localStorage.getItem('stats-streak');
    return savedStreak ? parseInt(savedStreak) : 0;
  };

  const handleRevealClue = (index) => {
    if (!revealedClues[index] && !gameOver && !gameWon) {
      const newRevealed = [...revealedClues];
      newRevealed[index] = true;
      setRevealedClues(newRevealed);
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
      
      // Auto-reveal all clues on win
      setRevealedClues(revealedClues.map(() => true));
    } else if (newGuesses.length >= maxGuesses) {
      setGameOver(true);
      setGameWon(false);
      updateStreak(false);
      setStreak(0);
      // Reveal all clues on loss
      setRevealedClues(revealedClues.map(() => true));
    }
    
    setErrorMessage('');
    setShowError(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const resetGame = () => {
    const newPlayer = getDailyPlayer();
    setDailyPlayer(newPlayer);
    setRevealedClues([false, false, false, false]);
    setGuesses([]);
    setGameOver(false);
    setGameWon(false);
    setShowShareModal(false);
  };

  const getScore = () => {
    if (!gameWon) return 0;
    const cluesRevealed = revealedClues.filter(r => r).length;
    return Math.max(0, maxGuesses - guesses.length + (maxGuesses - cluesRevealed));
  };

  if (!dailyPlayer) return <div className="game-container">Loading...</div>;

  return (
    <div className="game-container">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="w-20"></div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            STATS
          </h1>
          <StreakCounter streak={streak} />
        </div>
        <p className="text-slate-400">Daily NBA Trivia • Guess the mystery player</p>
        <div className="h-1 w-20 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* Game Status */}
      {(gameOver || gameWon) && (
        <div className={`mb-6 p-4 rounded-2xl text-center ${
          gameWon ? 'bg-green-600/20 border border-green-500' : 'bg-red-600/20 border border-red-500'
        }`}>
          <p className="text-xl font-bold">
            {gameWon 
              ? `🎉 CORRECT! You got it in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}! 🎉`
              : `😔 Game Over! The player was ${dailyPlayer.name}. Better luck tomorrow! 😔`
            }
          </p>
          {gameWon && (
            <button
              onClick={handleShare}
              className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors"
            >
              Share Results 📤
            </button>
          )}
        </div>
      )}

      {/* Player Card (Hidden until game over) */}
      {(gameOver || gameWon) && (
        <div className="mb-6">
          <PlayerCard player={dailyPlayer} isRevealed={true} />
        </div>
      )}

      {/* Stats Preview (Shows when game is active) */}
      {!gameOver && !gameWon && guesses.length > 0 && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-xl text-sm">
          <p className="text-center text-slate-400">
            📊 Score: {getScore()} points • 🎯 {maxGuesses - guesses.length} guesses left
          </p>
        </div>
      )}

      {/* Clues Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🔍</span> Statistical Clues
          <span className="text-sm text-slate-400 font-normal">
            ({revealedClues.filter(r => r).length}/{revealedClues.length} revealed)
          </span>
        </h2>
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

      {/* Guess History */}
      {guesses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">GUESS HISTORY</h3>
          <div className="space-y-2">
            {guesses.map((guess, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl ${
                  guess.isCorrect 
                    ? 'bg-green-600/20 border border-green-500' 
                    : 'bg-red-600/10 border border-red-500/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{guess.text}</span>
                  <span className="text-sm">
                    {guess.isCorrect ? '✓ Correct!' : `✗ ${guess.remainingGuesses} guesses left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guess Input */}
      <GuessInput
        onGuess={handleGuess}
        disabled={gameOver || gameWon}
        guessesLeft={maxGuesses - guesses.length}
        showError={showError}
        errorMessage={errorMessage}
      />

      {/* Keyboard Hints */}
      <KeyboardHints />

      {/* Game Stats */}
      <GameStats
        gamesPlayed={getGamesPlayed()}
        winRate={getWinRate()}
        currentStreak={streak}
        bestStreak={getBestStreak()}
      />

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          guesses={guesses.length}
          maxGuesses={maxGuesses}
          cluesRevealed={revealedClues.filter(r => r).length}
          totalClues={revealedClues.length}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

// Helper functions (move to utils eventually)
function getGamesPlayed() {
  const games = localStorage.getItem('stats-games-played');
  return games ? parseInt(games) : 0;
}

function getWinRate() {
  const wins = localStorage.getItem('stats-wins');
  const played = getGamesPlayed();
  if (played === 0) return 0;
  return Math.round((wins / played) * 100);
}

function getBestStreak() {
  const best = localStorage.getItem('stats-best-streak');
  return best ? parseInt(best) : 0;
}