import { create } from "zustand";

type OrderStore = {
  selectedOrders: string[];
  setSelectedOrders: (ids: string[]) => void;
  toggleOrder: (id: string) => void;
  clearOrders: () => void;
};

export const useOrderStore = create<OrderStore>((set) => ({
  selectedOrders: [],

  setSelectedOrders: (ids) => set({ selectedOrders: ids }),

  toggleOrder: (id) =>
    set((state) => ({
      selectedOrders: state.selectedOrders.includes(id)
        ? state.selectedOrders.filter((i) => i !== id)
        : [...state.selectedOrders, id],
    })),

  clearOrders: () => set({ selectedOrders: [] }),
}));
