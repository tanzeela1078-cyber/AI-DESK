'use client';

import { useParams } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { extractYouTubeId, formatDate, getUniqueAgents, getAgentColor, getRelativeTime } from '@/lib/utils';
import Link from 'next/link';

export default function ArticlePage() {
    const params = useParams();
    const { articles } = useNews();
    const slug = params.slug as string;

    const article = articles.find(a => a.slug === slug);

    if (!article) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)]">
                <Header />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-heading font-bold text-[var(--text-primary)] mb-4">
                            Article Not Found
                        </h1>
                        <p className="text-[var(--text-secondary)] mb-8">
                            The article you're looking for doesn't exist or has been removed.
                        </p>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity inline-block"
                        >
                            Back to Home
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const videoLink = article.video_links?.[0];
    const videoId = videoLink ? extractYouTubeId(videoLink.url) : null;
    const agents = getUniqueAgents(article.source_links);

    const publishedDate = article.published ? new Date(article.published) : (article.timestamp ? new Date(article.timestamp) : null);
    const dateStr = publishedDate ? publishedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';
    const relativeTime = publishedDate ? getRelativeTime(publishedDate.toISOString()) : 'Recently';

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Header />

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="mb-8">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags?.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 text-sm bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)] rounded-full font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-[var(--text-primary)] mb-6 leading-tight">
                        {article.meta_title}
                    </h1>

                    {/* Meta Info Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                        {/* Agents */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[var(--text-secondary)]">Fetched by:</span>
                            <div className="flex flex-wrap gap-2">
                                {agents.map((agent) => (
                                    <span
                                        key={agent}
                                        className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-sm ${getAgentColor(agent)}`}
                                    >
                                        {agent}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex flex-col md:items-end text-sm">
                            <div className="flex items-center gap-1 text-[var(--text-primary)] font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Updated {relativeTime}</span>
                            </div>
                            <span className="text-[var(--text-secondary)] text-xs mt-0.5">
                                {dateStr}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Video Player */}
                {videoId && (
                    <div className="mb-8">
                        <div className="aspect-video rounded-card overflow-hidden bg-black shadow-lg">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={videoLink?.title || article.meta_title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                )}

                {/* Summary / Meta Description */}
                <div className="prose prose-lg max-w-none mb-10">
                    <div className="p-6 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] border-l-4 border-[var(--accent-primary)] rounded-r-lg">
                        <h3 className="text-lg font-heading font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wide opacity-80">
                            Summary
                        </h3>
                        <p className="text-xl text-[var(--text-primary)] italic leading-relaxed">
                            {article.meta_description}
                        </p>
                    </div>
                </div>

                {/* Content Sections (Opinions/Analysis) */}
                <div className="space-y-10">
                    {article.content?.map((section, idx) => (
                        <section key={idx} className="bg-[var(--bg-secondary)] p-6 rounded-card border border-[var(--border-color)] bg-opacity-30">
                            <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[var(--accent-secondary)] rounded-full"></span>
                                {section.heading}
                            </h2>
                            <div className="space-y-4">
                                {section.paragraphs?.map((paragraph, pIdx) => (
                                    <p key={pIdx} className="text-[var(--text-secondary)] leading-relaxed text-lg">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Source Links */}
                {article.source_links && article.source_links.length > 0 && (
                    <div className="mt-12 p-6 bg-[var(--bg-secondary)] rounded-card border border-[var(--border-color)]">
                        <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Sources & References
                        </h3>
                        <div className="grid gap-3">
                            {article.source_links.map((source, idx) => (
                                <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg hover:border-[var(--accent-primary)] border border-transparent transition-all group"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm flex-shrink-0 ${getAgentColor(source.source as string)}`}>
                                            {source.source}
                                        </span>
                                        <span className="text-[var(--text-primary)] font-medium truncate group-hover:text-[var(--accent-primary)] transition-colors">
                                            {source.title || source.source}
                                        </span>
                                    </div>
                                    <svg className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Videos */}
                {article.video_links && article.video_links.length > 1 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-4">
                            Related Videos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {article.video_links.slice(1).map((video, idx) => {
                                const vId = extractYouTubeId(video.url);
                                return (
                                    <a
                                        key={idx}
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group"
                                    >
                                        <div className="aspect-video rounded-lg overflow-hidden bg-[var(--bg-secondary)] mb-2 relative">
                                            {vId && (
                                                <img
                                                    src={`https://img.youtube.com/vi/${vId}/mqdefault.jpg`}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
                                            {video.title}
                                        </p>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </article>

            <Footer />
        </div>
    );
}
