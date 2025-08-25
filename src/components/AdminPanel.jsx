import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function AdminPanel() {
  const [task, setTask] = useState({ type: 'code', description: '', coinReward: 0, code: '', targetId: '' });
  const functions = getFunctions();
  const manageTasks = httpsCallable(functions, 'manageTasks');

  const handleAdd = async () => {
    await manageTasks({ action: 'add', task });
    window.Telegram.WebApp.showAlert('Task added!');
    setTask({ type: 'code', description: '', coinReward: 0, code: '', targetId: '' });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <select
        className="border rounded p-2 mb-2 w-full"
        value={task.type}
        onChange={(e) => setTask({ ...task, type: e.target.value })}
      >
        <option value="code">Code Entry</option>
        <option value="subscription_telegram">Telegram Subscription</option>
        <option value="subscription_youtube">YouTube Subscription</option>
        <option value="referral">Referral</option>
        <option value="other">Other</option>
      </select>
      <input
        className="border rounded p-2 mb-2 w-full"
        type="text"
        placeholder="Description"
        value={task.description}
        onChange={(e) => setTask({ ...task, description: e.target.value })}
      />
      <input
        className="border rounded p-2 mb-2 w-full"
        type="number"
        placeholder="Coin Reward"
        value={task.coinReward}
        onChange={(e) => setTask({ ...task, coinReward: Number(e.target.value) })}
      />
      {task.type === 'code' && (
        <input
          className="border rounded p-2 mb-2 w-full"
          type="text"
          placeholder="Code"
          value={task.code}
          onChange={(e) => setTask({ ...task, code: e.target.value })}
        />
      )}
      {['subscription_telegram', 'subscription_youtube'].includes(task.type) && (
        <input
          className="border rounded p-2 mb-2 w-full"
          type="text"
          placeholder="Target ID"
          value={task.targetId}
          onChange={(e) => setTask({ ...task, targetId: e.target.value })}
        />
      )}
      <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded" onClick={handleAdd}>
        Add Task
      </button>
    </div>
  );
}
