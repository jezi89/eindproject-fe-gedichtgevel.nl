import { useQuery } from '@tanstack/react-query';
import { pexelsApiService } from '../../services/api/apiService';

export function usePexelsSearch(
  searchQuery,
  page = 1,
  orientation = "landscape"
) {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching, // Handig om te weten of een background fetch bezig is
  } = useQuery({
    // 1. De queryKey is uniek voor deze query. Tanstack gebruikt dit voor caching.
    queryKey: ["pexels", "search", searchQuery, page, orientation],

    // 2. De queryFn is de functie die de data ophaalt.
    queryFn: () => pexelsApiService.search(searchQuery, page, orientation),

    // 3. 'enabled' voorkomt dat de query wordt uitgevoerd als er geen zoekterm is.
    enabled: !!searchQuery,
  });

  return {
    photos: data?.photos || [], // Zorg voor een default waarde
    isLoading,
    isError,
    error,
    isFetching,
  };
}
