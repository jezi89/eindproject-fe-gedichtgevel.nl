/// TODO poetryDbHealth Check nakijken en beoordelen of het geen overkill is voor eindproject

import {
    poetryDbApi
} from "@/services/api/axios.js"; // Importeer de gedeelde axios instantie

/**
 * Checkt of PoetryDB API bereikbaar is en het verwachte aantal titels geeft binnen marge.
 * Gebruikt de geconfigureerde poetryDbApi
 .
 * @param {number} expectedCount - Verwacht aantal titels.
 * @param {number} tolerance - Toegestane marge (default ±10).
 * @returns {Promise<{ ok: boolean, count?: number, message: string }>}
 */
export const checkPoetryDbHealth = async (expectedCount = 3010, tolerance = 10) => {
    // Implement retry logic for better reliability
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Add a small delay between retries
            if (attempt > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }

            // Gebruik de geïmporteerde poetryDbApi
            const response = await poetryDbApi
                .get('/title');
            const data = response.data;

            if (!Array.isArray(data.titles)) {
                return {
                    ok: false,
                    message: 'PoetryDB antwoordt, maar geeft geen lijst met titels terug.',
                };
            }

            const titles = data.titles;
            const count = titles.length;

            const lowerBound = expectedCount - tolerance;
            const upperBound = expectedCount + tolerance;

            if (count < lowerBound) {
                return {
                    ok: false,
                    count,
                    message: `PoetryDB API is bereikbaar, maar de database lijkt incompleet: ${count} titels gevonden, (${expectedCount - count} minder dan verwacht).`,
                };
            }

            if (count > upperBound) {
                return {
                    ok: false,
                    count,
                    message: `PoetryDB API is bereikbaar, maar de database bevat onverwacht veel titels: ${count} gevonden, (${count - expectedCount} meer dan verwacht).`,
                };
            }

            return {
                ok: true,
                count,
                message: `PoetryDB API is volledig functioneel en levert het verwachte aantal titels (${count}).`,
            };
        } catch (error) {
            lastError = error;
            // Only log on final attempt
            if (attempt === maxRetries) {
                // console.error("Health check error after retries:", error);
            }
        }
    }

    // All retries failed
    return {
        ok: false,
        message: `Fout bij bereiken van PoetryDB API tijdens health check: ${lastError.message}`,
    };
};