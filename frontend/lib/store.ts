import { create } from 'zustand'

interface Toast { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; market?: string }

interface UIStore {
  toasts: Toast[]
  addToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  slideOverOpen: boolean
  slideOverContent: 'supply' | 'borrow' | 'repay' | null
  slideOverMarketId: string | null
  openSlideOver: (c: UIStore['slideOverContent'], id: string) => void
  closeSlideOver: () => void
  expandedMarketId: string | null
  toggleMarketExpand: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  addToast: (t) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 5000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  slideOverOpen: false,
  slideOverContent: null,
  slideOverMarketId: null,
  openSlideOver: (c, id) => set({ slideOverOpen: true, slideOverContent: c, slideOverMarketId: id }),
  closeSlideOver: () => set({ slideOverOpen: false, slideOverContent: null, slideOverMarketId: null }),
  expandedMarketId: null,
  toggleMarketExpand: (id) => set((s) => ({ expandedMarketId: s.expandedMarketId === id ? null : id })),
}))
