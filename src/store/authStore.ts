import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  isPragya: () => boolean;
  isAniruddh: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      login: (token, user) => {
        sessionStorage.setItem("token", token);
        set({ token, user, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        // Call backend to blacklist the token server-side
        try {
          const token = sessionStorage.getItem("token");
          if (token) {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/logout`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              }
            ).catch(() => {}); // Don't block logout on API failure
          }
        } catch {
          // Ignore errors — still clear local state
        }
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("auth-storage");
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      setLoading: (loading) => set({ isLoading: loading }),

      isAdmin: () => {
        const { user } = get();
        return user?.role === "super_admin";
      },

      isPragya: () => {
        const { user } = get();
        return user?.role === "pragya";
      },

      isAniruddh: () => {
        const { user } = get();
        return user?.role === "aniruddh";
      },
    }),
    {
      name: "auth-storage",
      storage: typeof window !== "undefined"
        ? {
            getItem: (name: string) => {
              const v = sessionStorage.getItem(name);
              return v ? JSON.parse(v) : null;
            },
            setItem: (name: string, value: unknown) => sessionStorage.setItem(name, JSON.stringify(value)),
            removeItem: (name: string) => sessionStorage.removeItem(name),
          }
        : undefined,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hook to get current user's display info
export const useCurrentUser = () => {
  const { user } = useAuthStore();
  return {
    id: user?.id,
    name: user?.full_name || "User",
    email: user?.email || "",
    role: user?.role,
    title: user?.title,
    isLoggedIn: !!user,
  };
};
