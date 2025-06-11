export function cleanSearchInput(searchTerm) {
    // Bewaar de originele zoekterm voor vergelijking
    const originalSearchTerm = searchTerm;

    // Verwijder speciale karakters, behoud alleen letters, cijfers en spaties
    // En vervang meerdere spaties door één spatie
    const cleanedSearchTerm = searchTerm
        .replace(/[^a-zA-Z0-9\s]/g, ' ')  // Verwijder speciale karakters
        .replace(/\s+/g, ' ')              // Vervang meerdere spaties door één
        .trim();                           // Verwijder spaties aan begin en eind

    // Check if Original Searchterm got modified
    const wasModified = originalSearchTerm !== cleanedSearchTerm;

    return {
        original: originalSearchTerm,
        cleaned: cleanedSearchTerm,
        wasModified: wasModified
    };
}