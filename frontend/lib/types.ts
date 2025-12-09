export type AgentType = 'YouTube' | 'Google' | 'Forbes' | 'Wikipedia' | 'DALL-E' | 'Unsplash';

export interface NewsArticle {
    id?: string;
    meta_title: string;
    meta_description: string;
    meta_image_prompt?: string;
    alt_text?: string;
    slug: string;
    tags: string[];
    content: ContentSection[];
    source_links?: SourceLink[];
    video_links?: VideoLink[];
    images?: ImageLink[];
    published?: string;
    timestamp?: number | string;
    fetched_by?: AgentType[];  // Track which agents contributed
}

export interface ImageLink {
    url: string;
    alt: string;
    source: string;
    generated: boolean;
}

export interface ContentSection {
    heading: string;
    paragraphs: string[];
}

export interface SourceLink {
    title: string;
    url: string;
    source: AgentType | string;
}

export interface VideoLink {
    title: string;
    url: string;
    videoId: string;
    thumbnail?: string;
    description?: string;
    published?: string;
}

export interface FilterOptions {
    contentType: string[];
    sources: string[];
    topics: string[];
    sortBy: 'recent' | 'watched' | 'highlighted';
}

export interface SearchState {
    query: string;
    filters: FilterOptions;
    results: NewsArticle[];
}
