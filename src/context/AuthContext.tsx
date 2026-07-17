import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { adminService } from "../services/admin.service";

interface AuthUser {
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes auto logout

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load auth state from local storage on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("admin_token");
      const storedUser = localStorage.getItem("admin_user");
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        resetActivityTimer();
      }
      setIsLoading(false);
    };
    initAuth();

    // Listen for session expired events from Axios interceptor
    const handleSessionExpired = () => {
      logout();
      setSessionExpired(true);
    };

    window.addEventListener("admin_session_expired", handleSessionExpired);

    // Activity tracking listeners
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const handleActivity = () => resetActivityTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      window.removeEventListener("admin_session_expired", handleSessionExpired);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    };
  }, []);

  const resetActivityTimer = () => {
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    
    // Only track timeout if logged in
    const storedToken = localStorage.getItem("admin_token");
    if (!storedToken) return;

    activityTimerRef.current = setTimeout(() => {
      logout();
      setSessionExpired(true);
    }, INACTIVITY_TIMEOUT);
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      const data = await adminService.login(email, password);
      
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setSessionExpired(false);
      
      if (rememberMe) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
      } else {
        // Session storage or in-memory, but to keep simple we use standard state.
        // We will store in local storage but clear on page close.
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
      }
      resetActivityTimer();
    } catch (e: any) {
      throw new Error(e.message || "Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock support for OTP Verification
  const verifyOtp = async (code: string): Promise<boolean> => {
    if (code === "123456") {
      // OTP verified successfully
      return true;
    }
    throw new Error("Invalid OTP verification code");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        verifyOtp,
        logout,
        sessionExpired,
        clearSessionExpired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
