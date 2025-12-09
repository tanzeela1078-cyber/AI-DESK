import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
        /youtube\.com\/embed\/([^&\s]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Map agent types to specific colors
export function getAgentColor(agent: string): string {
    const colors: Record<string, string> = {
        'YouTube': 'bg-[#FF0000] text-white',
        'Google': 'bg-[#4285F4] text-white',
        'Forbes': 'bg-[#000000] text-white',
        'Wikipedia': 'bg-[#636466] text-white',
        'DALL-E': 'bg-gradient-to-r from-purple-400 to-pink-600 text-white',
        'Unsplash': 'bg-black text-white',
    };

    return colors[agent] || 'bg-[var(--accent-primary)] text-white';
}

// Extract unique agents from source links
import { SourceLink, AgentType } from './types';

export function getUniqueAgents(sourceLinks: SourceLink[] = []): AgentType[] {
    const agents = new Set<AgentType>();

    sourceLinks.forEach(link => {
        // Simple heuristic to identify agent from source string if it matches our known types
        const source = link.source as string;
        if (['YouTube', 'Google', 'Forbes', 'Wikipedia', 'DALL-E', 'Unsplash'].includes(source)) {
            agents.add(source as AgentType);
        }
    });

    return Array.from(agents);
}

export const getRelativeTime = formatDate;
