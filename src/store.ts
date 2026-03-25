import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SduiBlade } from './schema/blade-spec';

export interface BladeState {
  activeBlades: Required<SduiBlade>[];
  payloadCache: Record<string, Required<SduiBlade>>;
  openBlade: (blade: SduiBlade) => void;
  setAppBlade: (blade: SduiBlade) => void;
  closeBlade: (id: string, force?: boolean) => void;
  closeTopBlade: (force?: boolean) => void;
  closeAllBlades: (force?: boolean) => void;
}

export const createSduiBladeStore = () => {
  return createStore<BladeState>()(
    persist(
      (set) => ({
        activeBlades: [],
        payloadCache: {},

    openBlade: (blade) => {
      const id = blade.id || `${blade.type}-${Date.now()}`;
      set((state) => {
        // Prevent stacking the EXACT SAME IDENTIFIER consecutively
        const lastBlade = state.activeBlades[state.activeBlades.length - 1];
        if (lastBlade && lastBlade.id === id) {
          const newBlades = [...state.activeBlades];
          const parsedBlade = { ...blade, id, properties: blade.properties || {}, children: blade.children || lastBlade.children } as Required<SduiBlade>;
          newBlades[newBlades.length - 1] = parsedBlade;
          return { 
            activeBlades: newBlades,
            payloadCache: { ...state.payloadCache, [id]: parsedBlade }
          };
        }

        const parsedBlade = { ...blade, id, properties: blade.properties || {} } as Required<SduiBlade>;
        return {
          activeBlades: [...state.activeBlades, parsedBlade],
          payloadCache: { ...state.payloadCache, [id]: parsedBlade }
        };
      });
    },

    setAppBlade: (blade) => {
      const id = blade.id || `${blade.type}-${Date.now()}`;
      set((state) => {
        const parsedBlade = { ...blade, id, properties: blade.properties || {} } as Required<SduiBlade>;
        return {
          activeBlades: [parsedBlade],
          payloadCache: { ...state.payloadCache, [id]: parsedBlade }
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
  }),
  {
    name: 'sdui-blade-session', // unique name
    storage: createJSONStorage(() => (typeof window !== 'undefined' ? sessionStorage : ({} as any))),
  }
  ));
};
