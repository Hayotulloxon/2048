import GameBoard from '../components/GameBoard';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export default function Home() {
  const { user } = useUserStore();

  return (
    <div>
      <GameBoard />
      <div className="flex justify-center gap-4 mt-4">
        <Link to="/tasks" className="px-4 py-2 bg-blue-500 text-white rounded">Tasks</Link>
        <Link to="/leaderboard" className="px-4 py-2 bg-blue-500 text-white rounded">Leaderboard</Link>
        {user?.username === 'H08_09' && (
          <Link to="/admin" className="px-4 py-2 bg-red-500 text-white rounded">Admin</Link>
        )}
      </div>
    </div>
  );
}
