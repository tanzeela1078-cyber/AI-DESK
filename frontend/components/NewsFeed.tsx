'use client';

import React from 'react';
import { useNews } from '@/contexts/NewsContext';
import NewsCard from './NewsCard';

export default function NewsFeed() {
    const { filteredArticles, searchQuery } = useNews();

    if (filteredArticles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <svg className="w-24 h-24 text-[var(--text-secondary)] opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-heading font-semibold text-[var(--text-primary)] mb-2">
                    {searchQuery ? 'No results found' : 'No articles yet'}
                </h3>
                <p className="text-[var(--text-secondary)] text-center max-w-md">
                    {searchQuery
                        ? 'Try adjusting your search or filters'
                        : 'Articles will appear here once the AI agents fetch news. Click the refresh button to generate news.'}
                </p>
            </div>
        );
    }

    // Separate articles with videos from those without
    const articlesWithVideos = filteredArticles.filter(
        article => article.video_links && article.video_links.length > 0
    );
    const articlesWithoutVideos = filteredArticles.filter(
        article => !article.video_links || article.video_links.length === 0
    );

    return (
        <div className="space-y-8">
            {/* Video-First Section */}
            {articlesWithVideos.length > 0 && (
                <div>
                    <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        Video Content
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articlesWithVideos.map((article, idx) => (
                            <NewsCard key={article.id || idx} article={article} priority={idx < 3} />
                        ))}
                    </div>
                </div>
            )}

            {/* Article Section */}
            {articlesWithoutVideos.length > 0 && (
                <div>
                    <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-[var(--accent-secondary)]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                            <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                        </svg>
                        Articles & Insights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articlesWithoutVideos.map((article, idx) => (
                            <NewsCard key={article.id || idx} article={article} />
                        ))}
                    </div>
                </div>
            )}

            {/* All Articles (if no separation needed) */}
            {articlesWithVideos.length === 0 && articlesWithoutVideos.length === 0 && filteredArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article, idx) => (
                        <NewsCard key={article.id || idx} article={article} priority={idx < 6} />
                    ))}
                </div>
            )}
        </div>
    );
}
