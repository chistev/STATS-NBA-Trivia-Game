export const saveGameState = (state) => {
  try {
    localStorage.setItem('stats-game-state', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const loadGameState = () => {
  try {
    const saved = localStorage.getItem('stats-game-state');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

export const updateStreak = (won) => {
  try {
    let currentStreak = parseInt(localStorage.getItem('stats-streak') || '0');
    let gamesPlayed = parseInt(localStorage.getItem('stats-games-played') || '0');
    let wins = parseInt(localStorage.getItem('stats-wins') || '0');
    let bestStreak = parseInt(localStorage.getItem('stats-best-streak') || '0');

    let newStreak = won ? currentStreak + 1 : 0;

    if (won) {
      wins += 1;
      if (newStreak > bestStreak) bestStreak = newStreak;
      localStorage.setItem('stats-wins', wins.toString());
    }

    localStorage.setItem('stats-streak', newStreak.toString());
    localStorage.setItem('stats-games-played', (gamesPlayed + 1).toString());
    localStorage.setItem('stats-best-streak', bestStreak.toString());

    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

export const getCareerStats = () => {
  try {
    const gamesPlayed = parseInt(localStorage.getItem('stats-games-played') || '0');
    const wins = parseInt(localStorage.getItem('stats-wins') || '0');
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

    return {
      gamesPlayed,
      winRate,
      currentStreak: parseInt(localStorage.getItem('stats-streak') || '0'),
      bestStreak: parseInt(localStorage.getItem('stats-best-streak') || '0')
    };
  } catch (error) {
    console.error('Error getting career stats:', error);
    return { gamesPlayed: 0, winRate: 0, currentStreak: 0, bestStreak: 0 };
  }
};