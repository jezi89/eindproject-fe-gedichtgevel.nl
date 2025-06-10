// Auto-generated types for authors data
// Generated on: 2025-06-04T20:28:41.989Z

export interface Author {
  id: string;
  name: string;
  normalizedName: string;
  sources: string[];
  metadata: {
    hasPoems: boolean;
    aliases: string[];
    birthYear: number | null;
    deathYear: number | null;
    nationality: string | null;
    wikipediaUrl: string | null;
  };
}

export interface AuthorsData {
  metadata: {
    version: string;
    generated: string;
    sources: Array<{
      name: string;
      file: string;
      count: number;
      lastUpdated: string | null;
    }>;
    totalAuthors: number;
  };
  authors: Author[];
}
