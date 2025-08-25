import { useRef, useState, useEffect } from 'react';
import Game2048 from '../utils/gameLogic';
import { useUserStore } from '../store/userStore';

export default function GameBoard() {
  const game = useRef(new Game2048());
  const [board, setBoard] = useState(game.current.board);
  const { coins, syncProgress } = useUserStore();

  useEffect(() => {
    const handleKey = (e) => {
      const moves = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (moves[e.key]) {
        const moved = game.current.move(moves[e.key]);
        if (moved) {
          setBoard([...game.current.board]);
          syncProgress(game.current.coinsDelta, game.current.maxTile);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const buyUpgrade = (type) => {
    if (coins >= 100) {
      game.current.applyUpgrade(type);
      syncProgress(-100, game.current.maxTile);
      window.Telegram.WebApp.showAlert('Upgrade applied!');
    } else {
      window.Telegram.WebApp.showAlert('Not enough coins!');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <span>Coins: {coins}</span>
        <span>Max Tile: {game.current.maxTile}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 w-80 mx-auto">
        {board.flat().map((value, i) => (
          <div key={i} className={`p-4 text-center ${value ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded font-bold`}>
            {value || ''}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2 justify-center">
        <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => buyUpgrade('highProb')}>
          Higher Value Tiles (100 coins)
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => buyUpgrade('minSpawn')}>
          Min Spawn 4 (100 coins)
        </button>
      </div>
    </div>
  );
}
