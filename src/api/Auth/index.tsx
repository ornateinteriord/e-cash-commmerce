import { useMutation, useQuery } from '@tanstack/react-query';
import { get, post } from '../Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import TokenService from "../token/tokenService";


export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return await post("/auth/signup", data);
    },
    onSuccess: (response) => {
      if (response.success) {
      } else {
        console.error(response.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response.data.message);
    },
  });
};

export const useGetSponserRef = (ref?: string) => {
  return useQuery({
    queryKey: ["sponsor", ref],
    queryFn: async () => {
      if (!ref) return null;
      try {
        const response = await get(`/auth/get-sponsor/${ref}`);
        return response.success ? response : null;
      } catch (err: any) {

        const errorMessage =
          err.response?.data.message;
        throw new Error(errorMessage);
      }
    },
    enabled: false,
  })
}

export const useResetpassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return await post("/auth/reset-password", data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
      } else {
        console.error(response.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response.data.message)
    }
  })
}

export const useLoginMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return await post("/auth/login", data);
    },
    onSuccess: (response) => {
      if (response.success && response.token) {
        TokenService.setToken(response.token)

        window.dispatchEvent(new Event("storage"));

        toast.success(response.message);
        const role = TokenService.getRole()
        if (role === "USER") {
          navigate("/user/dashboard", { replace: true });
        } else if (role === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else if (role === "ADMIN_01") {
          navigate("/admin_01/dashboard", { replace: true });
        } else if (role === "AGENT") {
          navigate("/agent/dashboard", { replace: true });
        } else {
          console.error("Invalid role:", role);
          localStorage.clear()
          toast.error("Invalid user role");
          return;
        }
      } else {
        console.error("Login failed:", response.message);
        toast.error(response.message);
      }
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      console.error("Login error:", errorMessage);
      toast.error(errorMessage);
    },
  });
};

