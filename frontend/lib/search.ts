import { NewsArticle } from './types';

export function searchArticles(articles: NewsArticle[], query: string): NewsArticle[] {
    if (!query.trim()) return articles;

    const lowerQuery = query.toLowerCase();

    return articles.filter((article) => {
        // Search in title
        if (article.meta_title?.toLowerCase().includes(lowerQuery)) return true;

        // Search in description
        if (article.meta_description?.toLowerCase().includes(lowerQuery)) return true;

        // Search in tags
        if (article.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

        // Search in content headings and paragraphs
        if (article.content?.some(section => {
            if (section.heading?.toLowerCase().includes(lowerQuery)) return true;
            return section.paragraphs?.some(p => p.toLowerCase().includes(lowerQuery));
        })) return true;

        return false;
    });
}

export function filterByContentType(articles: NewsArticle[], types: string[]): NewsArticle[] {
    if (!types.length) return articles;

    return articles.filter(article => {
        if (types.includes('video') && article.video_links && article.video_links.length > 0) return true;
        if (types.includes('article') && article.content && article.content.length > 0) return true;
        if (types.includes('wikipedia') && article.source_links?.some(s => s.source === 'Wikipedia')) return true;
        return false;
    });
}

export function filterBySource(articles: NewsArticle[], sources: string[]): NewsArticle[] {
    if (!sources.length) return articles;

    return articles.filter(article => {
        return article.source_links?.some(link => sources.includes(link.source));
    });
}

export function filterByTopic(articles: NewsArticle[], topics: string[]): NewsArticle[] {
    if (!topics.length) return articles;

    return articles.filter(article => {
        return article.tags?.some(tag =>
            topics.some(topic => tag.toLowerCase().includes(topic.toLowerCase()))
        );
    });
}

export function sortArticles(articles: NewsArticle[], sortBy: string): NewsArticle[] {
    const sorted = [...articles];

    switch (sortBy) {
        case 'recent':
            return sorted.sort((a, b) => {
                const tA = new Date(a.timestamp || 0).getTime();
                const tB = new Date(b.timestamp || 0).getTime();
                return tB - tA;
            });
        case 'watched':
            // For now, just return as-is. Could add view count tracking later
            return sorted;
        case 'highlighted':
            // Prioritize articles with videos
            return sorted.sort((a, b) => {
                const aHasVideo = (a.video_links?.length || 0) > 0 ? 1 : 0;
                const bHasVideo = (b.video_links?.length || 0) > 0 ? 1 : 0;
                return bHasVideo - aHasVideo;
            });
        default:
            return sorted;
    }
}
