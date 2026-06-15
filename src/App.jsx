import { useState, useEffect } from 'react';
import ClueCard from './components/ClueCard';
import GuessInput from './components/GuessInput';
import PlayerCard from './components/PlayerCard';
import GameStats from './components/GameStats';
import ShareModal from './components/ShareModal';
import StreakCounter from './components/StreakCounter';
import KeyboardHints from './components/KeyboardHints';
import Confetti from './components/Confetti';
import FeedbackPanel from './components/FeedbackPanel';
import { getDailyPlayer, players } from './data/players'; // Import players directly
import { saveGameState, loadGameState, updateStreak, getCareerStats } from './utils/gameUtils';

export default function App() {
  const [dailyPlayer, setDailyPlayer] = useState(null);
  const [revealedClues, setRevealedClues] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxGuesses] = useState(6);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Initialize
  useEffect(() => {
    const player = getDailyPlayer();
    setDailyPlayer(player);

    const savedState = loadGameState();
    const today = new Date().toDateString();

    if (savedState && savedState.date === today) {
      setRevealedClues(savedState.revealedClues || new Array(player.clues.length).fill(false));
      setGuesses(savedState.guesses || []);
      setGameOver(savedState.gameOver || false);
      setGameWon(savedState.gameWon || false);
    } else {
      setRevealedClues(new Array(player.clues.length).fill(false));
      setGuesses([]);
      setGameOver(false);
      setGameWon(false);
    }

    setStreak(parseInt(localStorage.getItem('stats-streak') || '0'));
    calculateTimeRemaining();
  }, []);

  const calculateTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    setTimeRemaining(tomorrow - now);
  };

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => setTimeRemaining(prev => prev - 1000), 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Auto-save
  useEffect(() => {
    if (dailyPlayer) {
      saveGameState({
        date: new Date().toDateString(),
        revealedClues,
        guesses,
        gameOver,
        gameWon
      });
    }
  }, [revealedClues, guesses, gameOver, gameWon, dailyPlayer]);

  const formatTimeRemaining = () => {
    if (!timeRemaining) return '';
    const hours = Math.floor(timeRemaining / 3600000);
    const minutes = Math.floor((timeRemaining % 3600000) / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Generate stat-based feedback for wrong guesses
  const generateFeedback = (guessedPlayer, actualPlayer) => {
    const feedbackItems = [];
    
    // Team comparison
    if (guessedPlayer.team === actualPlayer.team) {
      feedbackItems.push({ type: 'correct', label: 'Team', value: guessedPlayer.team, message: '✅ Same team!' });
    } else {
      feedbackItems.push({ type: 'wrong', label: 'Team', value: guessedPlayer.team, message: `❌ Different team (Plays for ${actualPlayer.team})` });
    }
    
    // Position comparison
    if (guessedPlayer.position === actualPlayer.position) {
      feedbackItems.push({ type: 'correct', label: 'Position', value: guessedPlayer.position, message: '✅ Same position!' });
    } else {
      feedbackItems.push({ type: 'wrong', label: 'Position', value: guessedPlayer.position, message: `❌ Different position (${actualPlayer.position})` });
    }
    
    // Height comparison
    const guessedHeight = parseInt(guessedPlayer.height.replace(/[^0-9]/g, ''));
    const actualHeight = parseInt(actualPlayer.height.replace(/[^0-9]/g, ''));
    if (guessedHeight === actualHeight) {
      feedbackItems.push({ type: 'correct', label: 'Height', value: guessedPlayer.height, message: '✅ Same height!' });
    } else if (guessedHeight > actualHeight) {
      feedbackItems.push({ type: 'wrong', label: 'Height', value: guessedPlayer.height, message: `📏 Taller (Actual: ${actualPlayer.height})` });
    } else {
      feedbackItems.push({ type: 'wrong', label: 'Height', value: guessedPlayer.height, message: `📏 Shorter (Actual: ${actualPlayer.height})` });
    }
    
    // Points comparison
    const guessedPts = guessedPlayer.stats.points;
    const actualPts = actualPlayer.stats.points;
    const ptsDiff = Math.abs(guessedPts - actualPts);
    if (guessedPts === actualPts) {
      feedbackItems.push({ type: 'correct', label: 'PPG', value: guessedPts, message: '✅ Same PPG!' });
    } else if (guessedPts > actualPts) {
      feedbackItems.push({ type: 'wrong', label: 'PPG', value: guessedPts, message: `📊 PPG: ${guessedPts} (Actual: ${actualPts}) - ${ptsDiff.toFixed(1)} higher` });
    } else {
      feedbackItems.push({ type: 'wrong', label: 'PPG', value: guessedPts, message: `📊 PPG: ${guessedPts} (Actual: ${actualPts}) - ${ptsDiff.toFixed(1)} lower` });
    }
    
    return feedbackItems;
  };

  const handleRevealClue = (index) => {
    if (revealedClues[index] || gameOver || gameWon) return;

    const newRevealed = [...revealedClues];
    newRevealed[index] = true;
    setRevealedClues(newRevealed);
  };

  const handleGuess = (guessText) => {
    if (gameOver || gameWon || !dailyPlayer) return;

    const normalized = guessText.toLowerCase().trim();
    const isCorrect = normalized === dailyPlayer.name.toLowerCase();
    
    // Find guessed player object for feedback - use imported players array
    const guessedPlayerObj = players.find(p => p.name.toLowerCase() === normalized);

    const newGuessEntry = {
      text: guessText.trim(),
      isCorrect,
      timestamp: new Date(),
      feedback: !isCorrect && guessedPlayerObj ? generateFeedback(guessedPlayerObj, dailyPlayer) : null
    };

    const newGuesses = [...guesses, newGuessEntry];
    setGuesses(newGuesses);
    
    // Set feedback for display
    if (!isCorrect && guessedPlayerObj) {
      setFeedback(newGuessEntry.feedback);
      setTimeout(() => setFeedback(null), 5000);
    }

    if (isCorrect) {
      setGameWon(true);
      setGameOver(true);
      const newStreakVal = updateStreak(true);
      setStreak(newStreakVal);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4500);
      setRevealedClues(new Array(dailyPlayer.clues.length).fill(true));
    } else if (newGuesses.length >= maxGuesses) {
      setGameOver(true);
      updateStreak(false);
      setStreak(0);
      setRevealedClues(new Array(dailyPlayer.clues.length).fill(true));
      setErrorMessage(`💀 Out of guesses! The player was ${dailyPlayer.name}`);
      setShowError(true);
    } else {
      // Reveal a clue progressively with each wrong guess
      const nextUnrevealed = revealedClues.findIndex(r => !r);
      if (nextUnrevealed !== -1) {
        const newRevealed = [...revealedClues];
        newRevealed[nextUnrevealed] = true;
        setRevealedClues(newRevealed);
        setErrorMessage(`🔍 Clue ${nextUnrevealed + 1} revealed!`);
        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
      }
      
      if (newGuesses.length === maxGuesses - 1) {
        setErrorMessage("⚠️ Last chance! Make it count!");
        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
      }
    }
  };

  const cluesRevealedCount = revealedClues.filter(Boolean).length;
  const getScore = () => gameWon ? Math.max(0, maxGuesses - guesses.length) * 10 + Math.max(0, maxGuesses - cluesRevealedCount) * 5 : 0;

  const getDifficultyRating = () => {
    if (!gameWon) return "💪 TRY AGAIN";
    if (guesses.length === 1 && cluesRevealedCount === 0) return "🔥 LEGENDARY";
    if (guesses.length <= 2 && cluesRevealedCount <= 1) return "⭐ ELITE";
    if (guesses.length <= 4 && cluesRevealedCount <= 2) return "👍 GOOD";
    return "🎯 COMPLETED";
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || gameWon) return;
      if (e.key.toLowerCase() === 'r') {
        const nextUnrevealed = revealedClues.findIndex(r => !r);
        if (nextUnrevealed !== -1) handleRevealClue(nextUnrevealed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealedClues, gameOver, gameWon]);

  if (!dailyPlayer) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-16 w-16 border-b-2 border-blue-500 rounded-full"></div></div>;
  }

  return (
    <div className="game-container mx-auto max-w-2xl px-4 py-8 min-h-screen">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-between items-center mb-4">
          <div className="text-left text-sm">
            <div className="text-slate-500">NEXT</div>
            <div className="font-mono text-blue-400">{formatTimeRemaining()}</div>
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">STATS</h1>
          <StreakCounter streak={streak} />
        </div>
        <p className="text-slate-400">Daily NBA Player Trivia</p>
      </div>

      {/* Feedback Panel */}
      <FeedbackPanel feedback={feedback} />

      {/* Status */}
      {(gameOver || gameWon) && (
        <div className={`mb-8 p-8 rounded-3xl text-center border-2 ${gameWon ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
          <div className="text-5xl mb-3">{gameWon ? '🏆' : '💀'}</div>
          <p className="text-3xl font-bold mb-2">
            {gameWon ? `Solved in ${guesses.length} guesses!` : `The player was ${dailyPlayer.name}`}
          </p>
          {gameWon && (
            <>
              <p className="text-xl text-blue-400 mb-2">{getDifficultyRating()}</p>
              <p className="text-2xl font-bold text-white mb-6">Score: {getScore()} pts</p>
            </>
          )}
          <div className="flex gap-4 justify-center">
            {gameWon && <button onClick={() => setShowShareModal(true)} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl font-semibold transition-all">Share 📤</button>}
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-2xl font-semibold transition-all">Next Day 🔄</button>
          </div>
        </div>
      )}

      {(gameOver || gameWon) && <PlayerCard player={dailyPlayer} isRevealed={true} />}

      {/* Clues */}
      <div className="mb-10">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">🔍 Clues <span className="text-sm font-normal text-slate-400">({cluesRevealedCount}/{dailyPlayer.clues.length})</span></h2>
        </div>
        <div className="h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700" style={{width: `${(cluesRevealedCount / dailyPlayer.clues.length) * 100}%`}} />
        </div>

        {dailyPlayer.clues.map((clue, i) => (
          <ClueCard key={i} clue={clue} index={i} revealed={revealedClues[i]} onReveal={handleRevealClue} disabled={gameOver || gameWon} />
        ))}
      </div>

      {/* History */}
      {guesses.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-slate-400 mb-3">GUESS HISTORY ({guesses.length}/{maxGuesses})</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {guesses.map((g, i) => (
              <div key={i} className={`p-4 rounded-2xl ${g.isCorrect ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/20 border border-red-500/50'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{g.isCorrect ? '✅' : '❌'}</span>
                    <span className="font-medium">{g.text}</span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(g.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                {g.feedback && !g.isCorrect && (
                  <div className="mt-3 pt-3 border-t border-red-500/30 text-sm space-y-1">
                    {g.feedback.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-slate-400">{item.label}:</span>
                        <span className={item.type === 'correct' ? 'text-green-400' : 'text-red-400'}>
                          {item.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <GuessInput 
        onGuess={handleGuess} 
        disabled={gameOver || gameWon} 
        guessesLeft={maxGuesses - guesses.length} 
        showError={showError} 
        errorMessage={errorMessage}
      />

      <KeyboardHints />

      <GameStats {...getCareerStats()} />

      {showShareModal && (
        <ShareModal
          guesses={guesses.length}
          maxGuesses={maxGuesses}
          cluesRevealed={cluesRevealedCount}
          totalClues={dailyPlayer.clues.length}
          playerName={dailyPlayer.name}
          score={getScore()}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}