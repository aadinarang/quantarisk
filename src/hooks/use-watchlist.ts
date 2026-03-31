import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, auth } from "@/lib/api";

export function useWatchlist() {
  const queryClient = useQueryClient();
  const isLoggedIn = auth.isLoggedIn();

  const { data } = useQuery({
    queryKey: ["watchlist"],
    queryFn: api.getWatchlist,
    enabled: isLoggedIn,
    retry: 1,
  });

  const watchlist = data ?? [];

  const addMutation = useMutation({
    mutationFn: async (symbol: string) => api.addToWatchlist(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (symbol: string) => api.removeFromWatchlist(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const addSymbol = (symbol: string) => {
    if (!isLoggedIn) {
      throw new Error("You must be signed in to edit your watchlist");
    }
    addMutation.mutate(symbol.toUpperCase());
  };

  const removeSymbol = (symbol: string) => {
    if (!isLoggedIn) {
      throw new Error("You must be signed in to edit your watchlist");
    }
    removeMutation.mutate(symbol.toUpperCase());
  };

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol.toUpperCase());

  return {
    watchlist,
    addSymbol,
    removeSymbol,
    isInWatchlist,
    isLoading: isLoggedIn && !data,
    isLoggedIn,
    isSaving: addMutation.isPending || removeMutation.isPending,
    error: addMutation.error || removeMutation.error,
  };
}
