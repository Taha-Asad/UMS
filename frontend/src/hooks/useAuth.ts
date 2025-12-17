import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth.api";
import type { LoginCredentials, RegisterData } from "../types";
import { getDashboardPath } from "../utils/helpers";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types";

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    setAuth,
    logout: storeLogout,
    setLoading,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setLoading(true);

        const response = await authApi.login(credentials);
        const { user, accessToken, message } = response.data.data;

        setAuth(user, accessToken);
        toast.success(message ?? "Login successful!");

        navigate(getDashboardPath(user.role));

        return { success: true };
      } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;

        const message = err.response?.data?.message ?? "Login failed";

        toast.error(message);

        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [navigate, setAuth, setLoading]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setLoading(true);

        const response = await authApi.register(data);
        const { message } = response.data.data;

        toast.success(message ?? "Registration successful! Please login.");

        navigate("/login");

        return { success: true };
      } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;

        const message = err.response?.data?.message ?? "Registration failed";

        toast.error(message);

        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [navigate, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      storeLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    }
  }, [navigate, storeLogout]);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authApi.verifyToken();
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      return true;
    } catch {
      storeLogout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, storeLogout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };
}
