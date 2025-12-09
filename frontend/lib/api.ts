import { NewsArticle } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CACHE_KEY = 'ai_desk_articles';
const CACHE_TIMESTAMP_KEY = 'ai_desk_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface ApiResponse {
    articles: NewsArticle[];
}

export async function fetchNews(): Promise<NewsArticle[]> {
    try {
        const response = await fetch(`${API_URL}/news`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
}

export function getCachedArticles(): NewsArticle[] {
    if (typeof window === 'undefined') return [];

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return [];

        return JSON.parse(cached);
    } catch (error) {
        console.error('Error reading cache:', error);
        return [];
    }
}

export function setCachedArticles(articles: NewsArticle[]): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.error('Error setting cache:', error);
    }
}

export function isCacheValid(): boolean {
    if (typeof window === 'undefined') return false;

    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const cacheAge = Date.now() - parseInt(timestamp);
    return cacheAge < CACHE_DURATION;
}

export async function fetchAndCacheNews(): Promise<NewsArticle[]> {
    try {
        const articles = await fetchNews();

        // Add timestamp to each article if missing
        const articlesWithMeta: NewsArticle[] = articles.map((article, index) => ({
            ...article,
            id: article.id || `article-${Date.now()}-${index}`,
            timestamp: article.timestamp || Date.now(),
        }));

        const existingArticles = getCachedArticles();

        // Merge new articles with existing, avoiding duplicates by id
        const existingIds = new Set(existingArticles.map(a => a.id));
        const newArticles = articlesWithMeta.filter(a => !existingIds.has(a.id));
        const updatedArticles = [...newArticles, ...existingArticles].slice(0, 100);

        setCachedArticles(updatedArticles);
        return updatedArticles;
    } catch (error) {
        console.error('Error fetching and caching news:', error);
        return getCachedArticles();
    }
}
