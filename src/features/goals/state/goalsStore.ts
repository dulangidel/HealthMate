import { createStore, useStore } from 'zustand';

import { DEFAULT_GOALS, goalsRepository, type Goals, type GoalsRepository } from '../data/goalsRepository';

export interface GoalsState {
  goals: Goals;
  loaded: boolean;
  load(): Promise<void>;
  saveGoals(goals: Goals): Promise<void>;
}

export function createGoalsStore(repository: GoalsRepository) {
  return createStore<GoalsState>()((set) => ({
    goals: DEFAULT_GOALS,
    loaded: false,
    async load() {
      try {
        set({ goals: await repository.load(), loaded: true });
      } catch {
        set({ goals: DEFAULT_GOALS, loaded: true });
      }
    },
    async saveGoals(goals) {
      await repository.save(goals);
      set({ goals });
    },
  }));
}

export const goalsStore = createGoalsStore(goalsRepository);

export function useGoalsStore<T>(selector: (state: GoalsState) => T): T {
  return useStore(goalsStore, selector);
}
