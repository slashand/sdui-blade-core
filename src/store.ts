import { createStore } from 'zustand/vanilla';
import { SduiBlade } from './schema/blade-spec';

export interface BladeState {
  activeBlades: Required<SduiBlade>[];
  openBlade: (blade: SduiBlade) => void;
  closeBlade: (id: string, force?: boolean) => void;
  closeTopBlade: (force?: boolean) => void;
  closeAllBlades: (force?: boolean) => void;
}

export const createSduiBladeStore = () => {
  return createStore<BladeState>()((set) => ({
    activeBlades: [],

    openBlade: (blade) => {
      const id = blade.id || `${blade.type}-${Date.now()}`;
      set((state) => {
        // Prevent duplicate consecutive matching nodes during transient state updates
        const lastBlade = state.activeBlades[state.activeBlades.length - 1];
        if (lastBlade && lastBlade.type === blade.type) {
          const newBlades = [...state.activeBlades];
          newBlades[newBlades.length - 1] = { ...lastBlade, properties: blade.properties || {} };
          return { activeBlades: newBlades };
        }

        return {
          activeBlades: [
            ...state.activeBlades,
            { ...blade, id, properties: blade.properties || {} } as Required<SduiBlade>,
          ],
        };
      });
    },

    closeBlade: (id, force = false) => {
      set((state) => {
        const blade = state.activeBlades.find((b) => b.id === id);
        if (!force && blade && blade.properties?.isDirty) {
          console.warn(
            `[SDUI Guard]: Attempted to close dirty blade [${id}]. Close rejected. Use force=true to override.`,
          );
          return state;
        }
        return { activeBlades: state.activeBlades.filter((b) => b.id !== id) };
      });
    },

    closeTopBlade: (force = false) => {
      set((state) => {
        const top = state.activeBlades[state.activeBlades.length - 1];
        if (!top) return state;
        if (!force && top.properties?.isDirty) {
          console.warn(
            `[SDUI Guard]: Attempted to close dirty top blade [${top.id}]. Close rejected. Use force=true to override.`,
          );
          return state;
        }
        return { activeBlades: state.activeBlades.slice(0, -1) };
      });
    },

    closeAllBlades: (force = false) => {
      set((state) => {
        if (!force && state.activeBlades.some((b) => b.properties?.isDirty)) {
          console.warn(
            `[SDUI Guard]: Attempted to close all blades, but one or more are dirty. Close rejected. Use force=true to override.`,
          );
          return state;
        }
        return { activeBlades: [] };
      });
    },
  }));
};
