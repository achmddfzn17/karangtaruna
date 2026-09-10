"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

interface NotificationState {
  count: number;
  setCount: (count: number) => void;
}

interface AppState extends SidebarState, NotificationState {
  // Combined state
}

/**
 * @deprecated Dead Code / Unused Store.
 * Komponen UI saat ini (Sidebar, Header, dsb.) menggunakan local state (useState) dan Server Actions.
 * Disimpan sebagai referensi jika di masa depan dibutuhkan client-side global state persistence.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      isCollapsed: false,
      isMobileOpen: false,
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      toggleMobile: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      closeMobile: () => set({ isMobileOpen: false }),

      // Notifications
      count: 0,
      setCount: (count) => set({ count }),
    }),
    {
      name: "karang-taruna-app-store",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
