'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { NewsArticle, FilterOptions } from '@/lib/types';
import { getCachedArticles, fetchAndCacheNews } from '@/lib/api';
import { searchArticles, filterByContentType, filterBySource, filterByTopic, sortArticles } from '@/lib/search';

interface NewsContextType {
    articles: NewsArticle[];
    filteredArticles: NewsArticle[];
    searchQuery: string;
    filters: FilterOptions;
    bookmarks: string[];
    isLoading: boolean;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: Partial<FilterOptions>) => void;
    toggleBookmark: (articleId: string) => void;
    refreshNews: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFiltersState] = useState<FilterOptions>({
        contentType: [],
        sources: [],
        topics: [],
        sortBy: 'recent',
    });
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load cached articles on mount
    useEffect(() => {
        const initializeNews = async () => {
            setIsLoading(true); // Start loading
            try {
                const cached = getCachedArticles();
                if (cached.length > 0) {
                    setArticles(cached);
                }

                // Load bookmarks
                const storedBookmarks = localStorage.getItem('bookmarks');
                if (storedBookmarks) {
                    setBookmarks(JSON.parse(storedBookmarks));
                }

                // Fetch fresh news in background
                const updated = await fetchAndCacheNews();
                setArticles(updated);
            } finally {
                setIsLoading(false); // Stop loading regardless of result
            }
        };

        initializeNews();
    }, []);

    // Apply filters and search
    const filteredArticles = React.useMemo(() => {
        let result = [...articles];

        // Apply search
        if (searchQuery) {
            result = searchArticles(result, searchQuery);
        }

        // Apply content type filter
        if (filters.contentType.length > 0) {
            result = filterByContentType(result, filters.contentType);
        }

        // Apply source filter
        if (filters.sources.length > 0) {
            result = filterBySource(result, filters.sources);
        }

        // Apply topic filter
        if (filters.topics.length > 0) {
            result = filterByTopic(result, filters.topics);
        }

        // Apply sorting
        result = sortArticles(result, filters.sortBy);

        return result;
    }, [articles, searchQuery, filters]);

    const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
        setFiltersState(prev => ({ ...prev, ...newFilters }));
    }, []);

    const toggleBookmark = useCallback((articleId: string) => {
        setBookmarks(prev => {
            const updated = prev.includes(articleId)
                ? prev.filter(id => id !== articleId)
                : [...prev, articleId];
            localStorage.setItem('bookmarks', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const refreshNews = useCallback(async () => {
        setIsLoading(true);
        try {
            const updated = await fetchAndCacheNews();
            setArticles(updated);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <NewsContext.Provider
            value={{
                articles,
                filteredArticles,
                searchQuery,
                filters,
                bookmarks,
                isLoading,
                setSearchQuery,
                setFilters,
                toggleBookmark,
                refreshNews,
            }}
        >
            {children}
        </NewsContext.Provider>
    );
}

export function useNews() {
    const context = useContext(NewsContext);
    if (context === undefined) {
        throw new Error('useNews must be used within a NewsProvider');
    }
    return context;
}
