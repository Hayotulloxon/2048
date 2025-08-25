import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import Home from './pages/Home';
import LeaderboardPage from './pages/LeaderboardPage';
import TasksPage from './pages/TasksPage';
import AdminPage from './pages/AdminPage';
import { init as initTelegram } from '@telegram-apps/sdk';

initTelegram();

export default function App() {
  const { fetchUser, user } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/admin" element={user?.username === 'H08_09' ? <AdminPage /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
