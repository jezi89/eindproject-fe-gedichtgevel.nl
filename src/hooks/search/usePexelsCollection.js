import { useQuery } from '@tanstack/react-query';
import { pexelsApiService } from '../../services/api/apiService';

export function usePexelsCollection(collectionId, page = 1) {
    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ['pexels', 'collection', collectionId, page],
        queryFn: () => pexelsApiService.getCollection(collectionId, page),
        enabled: !!collectionId,
    });

    return {
        photos: data?.media || [],
        isLoading,
        isError,
        error,
        isFetching,
    };
}
