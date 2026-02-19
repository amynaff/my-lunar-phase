import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "./auth-client";

export const SESSION_QUERY_KEY = ["auth-session"] as const;

interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  session?: {
    id: string;
    userId: string;
    expiresAt: string;
  } | null;
}

export const useSession = () => {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async (): Promise<Session | null> => {
      const result = await authClient.getSession();
      return (result.data as Session) ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useInvalidateSession = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
};
