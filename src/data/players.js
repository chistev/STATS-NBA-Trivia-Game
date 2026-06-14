export const players = [
  {
    id: 1,
    name: "LeBron James",
    position: "Forward",
    team: "Los Angeles Lakers",
    height: "6'9\"",
    age: 41,
    clues: [
      "Averaged over 25 PPG in his career",
      "4x NBA Champion",
      "All-time leading scorer",
      "Played for Cleveland, Miami, LA"
    ],
    stats: {
      points: 27.1,
      rebounds: 7.5,
      assists: 7.4,
      fg: "49.5%"
    }
  },
  {
    id: 2,
    name: "Stephen Curry",
    position: "Guard",
    team: "Golden State Warriors",
    height: "6'2\"",
    age: 37,
    clues: [
      "Greatest 3-point shooter of all time",
      "2x MVP (unanimous once)",
      "4x NBA Champion",
      "Leads NBA in career 3PM"
    ],
    stats: {
      points: 24.8,
      rebounds: 4.7,
      assists: 6.4,
      fg: "47.3%"
    }
  },
  {
    id: 3,
    name: "Nikola Jokic",
    position: "Center",
    team: "Denver Nuggets",
    height: "6'11\"",
    age: 29,
    clues: [
      "Back-to-back-to-back MVP candidate",
      "2023 NBA Champion",
      "Elite passer for a big man",
      "Triple-double machine"
    ],
    stats: {
      points: 24.5,
      rebounds: 12.5,
      assists: 9.0,
      fg: "55.5%"
    }
  },
  {
    id: 4,
    name: "Giannis Antetokounmpo",
    position: "Forward",
    team: "Milwaukee Bucks",
    height: "6'11\"",
    age: 31,
    clues: [
      "Greek Freak",
      "2021 NBA Champion",
      "MVP + DPOY winner",
      "Explosive athleticism"
    ],
    stats: {
      points: 28.5,
      rebounds: 12.8,
      assists: 5.9,
      fg: "55.0%"
    }
  },
  {
    id: 5,
    name: "Jayson Tatum",
    position: "Forward",
    team: "Boston Celtics",
    height: "6'8\"",
    age: 28,
    clues: [
      "2024 NBA Champion",
      "All-NBA First Team",
      "Scoring leader for Celtics",
      "Elite playoff performer"
    ],
    stats: {
      points: 26.9,
      rebounds: 8.1,
      assists: 4.6,
      fg: "47.1%"
    }
  }
];

export const getDailyPlayer = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
  const index = dayOfYear % players.length;
  return players[index];
};