import { useQuery } from '@tanstack/react-query';
import { flickrApiService } from '../../services/api/apiService';

export function useFlickrSearchByGeo(searchParams, page = 1) {
    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ['flickr', 'geo', searchParams, page],
        queryFn: () => flickrApiService.searchByGeo(searchParams, page),
        enabled: !!searchParams,
    });

    return {
        photos: data?.photos?.photo.filter(p => p.secret && p.server !== '0').map(p => ({
            id: p.id,
            alt: p.title,
            src: {
                large2x: `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_b.jpg`,
                tiny: `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_q.jpg`
            }
        })) || [],
        totalPages: data?.photos?.pages || 0,
        isLoading,
        isError,
        error,
        isFetching,
    };
}
