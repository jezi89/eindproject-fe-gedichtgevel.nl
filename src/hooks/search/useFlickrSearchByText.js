import { useQuery } from '@tanstack/react-query';
import { flickrApiService } from '../../services/api/apiService';

export function useFlickrSearchByText(query, page = 1) {
    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ['flickr', 'text', query, page],
        queryFn: () => flickrApiService.searchByText(query, page),
        enabled: !!query,
    });

    return {
        photos: data?.photos?.photo.filter(p => p.secret && p.server !== '0').map(p => ({
            id: p.id,
            alt: p.title,
            photographer: p.ownername || 'Unknown',
            width: p.o_width || p.width_b || null,
            height: p.o_height || p.height_b || null,
            source: 'flickr',
            src: {
                large2x: `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_b.jpg`,
                tiny: `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_q.jpg`
            },
            url_b: p.url_b || `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_b.jpg`,
            url_h: p.url_h,
            url_k: p.url_k,
            url_o: p.url_o
        })) || [],
        totalPages: data?.photos?.pages || 0,
        isLoading,
        isError,
        error,
        isFetching,
    };
}
