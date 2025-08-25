import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState({ coins: [], tiles: [] });
  const functions = getFunctions();
  const getLeaderboards = httpsCallable(functions, 'getLeaderboards');

  useEffect(() => {
    getLeaderboards().then(({ data }) => {
      setLeaderboards({
        coins: data.coins.sort((a, b) => b.coins - a.coins),
        tiles: data.tiles.sort((a, b) => b.maxTile - a.maxTile),
      });
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Leaderboards</h2>
      <h3 className="text-lg mb-2">Top by Coins</h3>
      <ul className="mb-4">
        {leaderboards.coins.map(({ id, username, coins }) => (
          <li key={id}>{username || id}: {coins} coins</li>
        ))}
      </ul>
      <h3 className="text-lg mb-2">Top by Max Tile</h3>
      <ul>
        {leaderboards.tiles.map(({ id, username, maxTile }) => (
          <li key={id}>{username || id}: {maxTile}</li>
        ))}
      </ul>
    </div>
  );
}
