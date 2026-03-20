import { createStore } from 'zustand/vanilla';
import { SduiBladeNode, BladeState } from './types';

export const createSduiBladeStore = () => {
    return createStore<BladeState>()((set) => ({
        activeBlades: [],

        openBlade: (node) => {
            const id = node.id || `${node.type}-${Date.now()}`;
            set((state) => {
                // Prevent duplicate consecutive matching nodes
                const lastBlade = state.activeBlades[state.activeBlades.length - 1];
                if (lastBlade && lastBlade.type === node.type) {
                    const newBlades = [...state.activeBlades];
                    newBlades[newBlades.length - 1] = { ...lastBlade, props: node.props || {} };
                    return { activeBlades: newBlades };
                }

                return { 
                    activeBlades: [...state.activeBlades, { id, type: node.type, props: node.props || {} }] 
                };
            });
        },

        closeBlade: (id) => {
            set((state) => ({ activeBlades: state.activeBlades.filter((b) => b.id !== id) }));
        },

        closeTopBlade: () => {
            set((state) => ({ activeBlades: state.activeBlades.slice(0, -1) }));
        },

        closeAllBlades: () => set({ activeBlades: [] }),
    }));
};
