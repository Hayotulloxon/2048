import { create } from 'zustand';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export const useUserStore = create((set) => ({
  user: null,
  coins: 0,
  maxTile: 0,
  tasks: [],
  fetchUser: async () => {
    const auth = getAuth();
    const db = getDatabase();
    if (auth.currentUser) {
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      const snapshot = await get(userRef);
      const data = snapshot.val() || { coins: 0, maxTile: 0, tasks: [] };
      set({ user: auth.currentUser, coins: data.coins, maxTile: data.maxTile, tasks: data.tasks || [] });
    }
  },
  syncProgress: async (coinsDelta, maxTile) => {
    const auth = getAuth();
    const db = getDatabase();
    if (auth.currentUser) {
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      await update(userRef, {
        coins: (await get(userRef)).val()?.coins + coinsDelta || coinsDelta,
        maxTile: Math.max((await get(userRef)).val()?.maxTile || 0, maxTile),
      });
      set((state) => ({
        coins: state.coins + coinsDelta,
        maxTile: Math.max(state.maxTile, maxTile),
      }));
    }
  },
}));