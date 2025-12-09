'use client';

import React, { useState } from 'react';
import { useNews } from '@/contexts/NewsContext';

export default function Sidebar() {
    const { filters, setFilters } = useNews();
    const [isOpen, setIsOpen] = useState(true);

    const contentTypes = ['video', 'article', 'wikipedia'];
    const sources = ['YouTube', 'Google', 'Forbes', 'Wikipedia'];
    const topics = ['GPT', 'Gemini', 'Llama', 'AI regulation', 'Machine Learning', 'Deep Learning'];
    const sortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'watched', label: 'Most Watched' },
        { value: 'highlighted', label: 'AI Highlighted' },
    ];

    const toggleContentType = (type: string) => {
        const updated = filters.contentType.includes(type)
            ? filters.contentType.filter(t => t !== type)
            : [...filters.contentType, type];
        setFilters({ contentType: updated });
    };

    const toggleSource = (source: string) => {
        const updated = filters.sources.includes(source)
            ? filters.sources.filter(s => s !== source)
            : [...filters.sources, source];
        setFilters({ sources: updated });
    };

    const toggleTopic = (topic: string) => {
        const updated = filters.topics.includes(topic)
            ? filters.topics.filter(t => t !== topic)
            : [...filters.topics, topic];
        setFilters({ topics: updated });
    };

    const clearFilters = () => {
        setFilters({
            contentType: [],
            sources: [],
            topics: [],
            sortBy: 'recent',
        });
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-[var(--accent-primary)] text-white rounded-full shadow-lg"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-16 right-0 h-[calc(100vh-4rem)] lg:h-auto
          w-80 lg:w-64 bg-[var(--bg-secondary)] border-l lg:border-l-0 lg:border-r border-[var(--bg-primary)]
          overflow-y-auto p-6 space-y-6 transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)]">Filters</h2>
                    <button
                        onClick={clearFilters}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                    >
                        Clear All
                    </button>
                </div>

                {/* Sort By */}
                <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Sort By</h3>
                    <div className="space-y-2">
                        {sortOptions.map(option => (
                            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="sort"
                                    value={option.value}
                                    checked={filters.sortBy === option.value}
                                    onChange={() => setFilters({ sortBy: option.value as any })}
                                    className="w-4 h-4 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)]">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Content Type */}
                <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Content Type</h3>
                    <div className="space-y-2">
                        {contentTypes.map(type => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.contentType.includes(type)}
                                    onChange={() => toggleContentType(type)}
                                    className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)] capitalize">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Sources */}
                <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Sources</h3>
                    <div className="space-y-2">
                        {sources.map(source => (
                            <label key={source} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.sources.includes(source)}
                                    onChange={() => toggleSource(source)}
                                    className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)]">{source}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Topics */}
                <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Trending Topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {topics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => toggleTopic(topic)}
                                className={`px-3 py-1 text-xs rounded-full transition-all ${filters.topics.includes(topic)
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--accent-primary)] hover:text-white'
                                    }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
