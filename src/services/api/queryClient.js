import { QueryClient } from '@tanstack/react-query';

// Configureer hier globale cache-instellingen
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Data wordt 5 minuten als 'fresh' beschouwd
            gcTime: 1000 * 60 * 30,    // Data wordt na 30 minuten inactiviteit uit de cache verwijderd
            retry: 1, // Probeer falende requests 1 keer opnieuw
            refetchOnWindowFocus: false, // Voorkomt onnodige fetches bij window focus
        },
    },
});

export default queryClient;
