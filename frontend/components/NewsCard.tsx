'use client';

import React from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/lib/types';
import { useNews } from '@/contexts/NewsContext';
import { formatDate, truncateText, extractYouTubeId, getUniqueAgents, getAgentColor } from '@/lib/utils';

interface NewsCardProps {
    article: NewsArticle;
    priority?: boolean;
}

export default function NewsCard({ article, priority = false }: NewsCardProps) {
    const { bookmarks, toggleBookmark } = useNews();
    const isBookmarked = bookmarks.includes(article.id || '');

    const videoLink = article.video_links?.[0];
    const videoId = videoLink ? extractYouTubeId(videoLink.url) : null;

    // Prefer article images, fall back to video thumbnail
    const articleImage = article.images?.[0]?.url;
    const videoThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    const thumbnail = articleImage || videoThumbnail;

    const agents = getUniqueAgents(article.source_links);
    const timeDisplay = article.published
        ? formatDate(article.published)
        : article.timestamp
            ? formatDate(new Date(article.timestamp).toISOString())
            : 'Recently';

    return (
        <div className="group relative bg-[var(--bg-secondary)] rounded-card overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] animate-fade-in flex flex-col h-full">
            {/* Thumbnail or Image */}
            <Link href={`/article/${article.slug}`} className="relative h-48 block overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={article.alt_text || article.meta_title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Video Play Icon */}
                {videoLink && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <svg className="w-8 h-8 text-[var(--accent-primary)] ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Agent Badges (overlay on image) */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {agents.map((agent) => (
                        <span
                            key={agent}
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm ${getAgentColor(agent)}`}
                        >
                            {agent}
                        </span>
                    ))}
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex-grow flex flex-col">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {article.tags?.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)] rounded-full font-medium"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <Link href={`/article/${article.slug}`} className="block mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                    <h3 className="text-lg font-heading font-bold text-[var(--text-primary)] line-clamp-2 leading-tight">
                        {article.meta_title}
                    </h3>
                </Link>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-3">
                    {truncateText(article.meta_description, 120)}
                </p>

                {/* Footer (Time & Actions) */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                    <div className="flex items-center space-x-2 text-xs text-[var(--text-secondary)]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{timeDisplay}</span>
                    </div>

                    {/* Bookmark Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleBookmark(article.id || '');
                        }}
                        className={`p-1.5 rounded-full transition-colors hover:bg-[var(--bg-tertiary)] ${isBookmarked
                            ? 'text-[var(--accent-coral)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                            }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                        <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Neon border effect on hover (dark mode) */}
            <div className="absolute inset-0 rounded-card border-2 border-transparent group-hover:border-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none dark:block hidden z-10"></div>
        </div>
    );
}
