import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { getDatabase, ref, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function TasksList() {
  const { tasks, fetchUser } = useUserStore();
  const [taskList, setTaskList] = useState([]);
  const functions = getFunctions();
  const completeTask = httpsCallable(functions, 'completeTask');

  useEffect(() => {
    const db = getDatabase();
    const tasksRef = ref(db, 'tasks');
    get(tasksRef).then((snapshot) => {
      setTaskList(Object.entries(snapshot.val() || {}).map(([id, task]) => ({ id, ...task })));
    });
  }, []);

  const handleComplete = async (task) => {
    let input;
    if (task.type === 'code') input = prompt('Enter code:');
    const { data } = await completeTask({ taskId: task.id, input });
    if (data.completed) {
      window.Telegram.WebApp.showAlert('Task completed! Coins awarded.');
      fetchUser();
    } else {
      window.Telegram.WebApp.showAlert('Task not completed.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tasks</h2>
      <ul className="space-y-4">
        {taskList.map((task) => (
          <li key={task.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <p>{task.description}</p>
            <p>Reward: {task.coinReward} coins</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => handleComplete(task)}>
              Complete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
