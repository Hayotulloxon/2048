import { create } from 'zustand';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';

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
      set({ user: { ...auth.currentUser, ...data }, coins: data.coins, maxTile: data.maxTile, tasks: data.tasks || [] });
    }
  },
  syncProgress: async (coinsDelta, maxTile) => {
    const auth = getAuth();
    const db = getDatabase();
    if (auth.currentUser) {
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      const currentData = (await get(userRef)).val();
      await update(userRef, {
        coins: (currentData?.coins || 0) + coinsDelta,
        maxTile: Math.max(currentData?.maxTile || 0, maxTile),
      });
      set((state) => ({
        coins: state.coins + coinsDelta,
        maxTile: Math.max(state.maxTile, maxTile),
      }));
    }
  },
}));
