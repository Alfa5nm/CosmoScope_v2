import { create } from 'zustand';

export interface PointsEvent {
  id: string;
  points: number;
  reason: string;
  timestamp: number;
  x?: number;
  y?: number;
}

interface PointsState {
  totalPoints: number;
  pointsHistory: PointsEvent[];
  recentEvents: PointsEvent[];
  addPoints: (points: number, reason: string, x?: number, y?: number) => void;
  clearRecentEvents: () => void;
  resetPoints: () => void;
}

export const usePointsStore = create<PointsState>((set) => ({
  totalPoints: 0,
  pointsHistory: [],
  recentEvents: [],

  addPoints: (points: number, reason: string, x?: number, y?: number) => {
    const event: PointsEvent = {
      id: Math.random().toString(36).substr(2, 9),
      points,
      reason,
      timestamp: Date.now(),
      x,
      y
    };

    set((state) => ({
      totalPoints: state.totalPoints + points,
      pointsHistory: [...state.pointsHistory, event],
      recentEvents: [...state.recentEvents, event].slice(-5) // Keep only last 5 events
    }));

    // Auto-clear recent events after 3 seconds
    setTimeout(() => {
      set((state) => ({
        recentEvents: state.recentEvents.filter(e => e.id !== event.id)
      }));
    }, 3000);
  },

  clearRecentEvents: () => {
    set({ recentEvents: [] });
  },

  resetPoints: () => {
    set({ 
      totalPoints: 0, 
      pointsHistory: [], 
      recentEvents: [] 
    });
  }
}));

// Points configuration
export const POINTS_CONFIG = {
  ANNOTATION_CREATE: 10,
  ANNOTATION_EDIT: 5,
  ANNOTATION_DELETE: -2,
  PLANET_CLICK: 5,
  PLANET_EXPLORE: 15,
  DISCOVERY: 25,
  ACHIEVEMENT: 50,
  BONUS: 100
} as const;
