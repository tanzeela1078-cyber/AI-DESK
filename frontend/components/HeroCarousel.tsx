'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNews } from '@/contexts/NewsContext';
import { extractYouTubeId, formatDate } from '@/lib/utils';

export default function HeroCarousel() {
    const { filteredArticles } = useNews();
    const [currentSlide, setCurrentSlide] = useState(0);

    const topArticles = filteredArticles.slice(0, 5);

    useEffect(() => {
        if (topArticles.length === 0) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % topArticles.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [topArticles.length]);

    if (topArticles.length === 0) {
        return null;
    }

    const currentArticle = topArticles[currentSlide];
    const videoLink = currentArticle.video_links?.[0];
    const videoId = videoLink ? extractYouTubeId(videoLink.url) : null;
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

    return (
        <div className="relative h-[500px] rounded-card overflow-hidden mb-8 group">
            {/* Background Image */}
            <div className="absolute inset-0">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={currentArticle.alt_text || currentArticle.meta_title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {currentArticle.tags?.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 text-sm bg-[var(--accent-primary)] text-white rounded-full font-medium"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 max-w-3xl">
                    {currentArticle.meta_title}
                </h1>

                {/* Description */}
                <p className="text-lg text-gray-200 mb-6 max-w-2xl line-clamp-2">
                    {currentArticle.meta_description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center space-x-4 mb-6">
                    {currentArticle.source_links?.slice(0, 2).map((source, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                            {source.source}
                        </span>
                    ))}
                    <span className="text-gray-300 text-sm">
                        {currentArticle.published ? formatDate(currentArticle.published) : 'Recently'}
                    </span>
                </div>

                {/* CTA */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={`/article/${currentArticle.slug}`}
                        className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Read More
                    </Link>
                    {videoLink && (
                        <a
                            href={videoLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-all flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            <span>Watch Video</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
                {topArticles.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide
                                ? 'bg-white w-8'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + topArticles.length) % topArticles.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % topArticles.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next slide"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
