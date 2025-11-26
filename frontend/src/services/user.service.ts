import { authService } from './auth.service';

export const userService = {
  recordAction: async (actionType: 'LOGIN' | 'SEARCH' | 'SAVE_RECIPE' | 'CREATE_RECIPE') => {
    try {
      await fetch('/api/gamification/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({ type: actionType })
      });
    } catch (error) {
      console.error("Failed to record XP", error);
    }
  }
};