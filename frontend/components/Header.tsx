'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useNews } from '@/contexts/NewsContext';
import { debounce } from '@/lib/utils';

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const { setSearchQuery, refreshNews, isLoading } = useNews();
    const [searchInput, setSearchInput] = useState('');
    const [videoMode, setVideoMode] = useState(false);

    const debouncedSearch = React.useMemo(
        () => debounce((query: string) => setSearchQuery(query), 300),
        [setSearchQuery]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSearch(value);
    };

    return (
        <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--bg-secondary)] backdrop-blur-lg bg-opacity-90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">AI</span>
                        </div>
                        <span className="text-xl font-heading font-bold text-[var(--text-primary)]">
                            AI Desk
                        </span>
                    </Link>

                    {/* Navigation - Hidden on smaller screens to prevent overlap */}
                    <nav className="hidden xl:flex items-center space-x-6">
                        <Link href="/" className="text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/trends" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                            Trends
                        </Link>
                        <Link href="/videos" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                            Videos
                        </Link>
                        <Link href="/research" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                            Research
                        </Link>
                        <Link href="/insights" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                            Insights
                        </Link>
                    </nav>

                    {/* Search Bar (Test Case 11) */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search AI news..."
                                value={searchInput}
                                onChange={handleSearchChange}
                                className="search-input w-full px-4 py-2 pl-10 pr-10 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                                aria-label="Search AI news"
                            />
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchInput && (
                                <button
                                    onClick={() => {
                                        setSearchInput('');
                                        setSearchQuery('');
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                    aria-label="Clear search"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                        {/* Video Mode Toggle */}
                        <button
                            onClick={() => setVideoMode(!videoMode)}
                            className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all ${videoMode
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                                }`}
                            title="Toggle Video Mode"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            <span className="text-sm">Video</span>
                        </button>

                        {/* Refresh Button */}
                        <button
                            onClick={refreshNews}
                            disabled={isLoading}
                            className="p-2 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all disabled:opacity-50"
                            title="Refresh News"
                        >
                            <svg
                                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all"
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
