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
    const currentStreak = parseInt(localStorage.getItem('stats-streak') || '0');
    const gamesPlayed = parseInt(localStorage.getItem('stats-games-played') || '0');
    const wins = parseInt(localStorage.getItem('stats-wins') || '0');
    const bestStreak = parseInt(localStorage.getItem('stats-best-streak') || '0');
    
    let newStreak = currentStreak;
    
    if (won) {
      newStreak = currentStreak + 1;
      localStorage.setItem('stats-wins', (wins + 1).toString());
      
      if (newStreak > bestStreak) {
        localStorage.setItem('stats-best-streak', newStreak.toString());
      }
    } else {
      newStreak = 0;
    }
    
    localStorage.setItem('stats-streak', newStreak.toString());
    localStorage.setItem('stats-games-played', (gamesPlayed + 1).toString());
    
    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

export const getCareerStats = () => {
  try {
    return {
      gamesPlayed: parseInt(localStorage.getItem('stats-games-played') || '0'),
      wins: parseInt(localStorage.getItem('stats-wins') || '0'),
      currentStreak: parseInt(localStorage.getItem('stats-streak') || '0'),
      bestStreak: parseInt(localStorage.getItem('stats-best-streak') || '0')
    };
  } catch (error) {
    console.error('Error getting career stats:', error);
    return {
      gamesPlayed: 0,
      wins: 0,
      currentStreak: 0,
      bestStreak: 0
    };
  }
};