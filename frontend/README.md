# AI Desk Frontend

A modern Next.js 14 application for displaying AI-powered news and insights with a beautiful dual-theme interface.

## Features

- 🎨 **Dual Theme**: Beautiful light (soft pastels) and dark (cinematic neon) themes
- 🔍 **Real-time Search**: Search across all articles with instant filtering
- 🎬 **Video Integration**: Embedded YouTube videos with inline playback
- 📱 **Responsive Design**: Desktop-first with mobile optimization
- 🔖 **Bookmarks**: Save your favorite articles
- 🎯 **Advanced Filters**: Filter by content type, source, topics, and sort options
- ⚡ **Cache-First Loading**: Instant display with background refresh
- 🎭 **Smooth Animations**: Polished micro-interactions and transitions

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context API
- **Fonts**: Inter, Poppins, Merriweather (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- FastAPI backend running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (already created):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── article/[slug]/     # Article detail pages
│   └── globals.css         # Global styles and theme variables
├── components/
│   ├── Header.tsx          # Navigation and search
│   ├── Footer.tsx          # Footer with links
│   ├── HeroCarousel.tsx    # Top articles carousel
│   ├── NewsFeed.tsx        # Article grid display
│   ├── NewsCard.tsx        # Individual article card
│   └── Sidebar.tsx         # Filters sidebar
├── contexts/
│   ├── ThemeContext.tsx    # Theme management
│   └── NewsContext.tsx     # News state and filters
├── lib/
│   ├── api.ts              # API client with caching
│   ├── search.ts           # Search and filter logic
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Utility functions
└── tailwind.config.ts      # Tailwind theme configuration
```

## Usage

### Fetching News

The app automatically fetches news on page load and caches it. Click the refresh button in the header to manually fetch new articles.

### Search

Use the search bar in the header to search across article titles, descriptions, tags, and content.

### Filters

Open the sidebar to filter by:
- **Content Type**: Video, Article, Wikipedia
- **Sources**: YouTube, Google, Forbes, Wikipedia
- **Topics**: GPT, Gemini, Llama, AI regulation, etc.
- **Sort**: Most Recent, Most Watched, AI Highlighted

### Theme Toggle

Click the sun/moon icon in the header to switch between light and dark themes.

### Bookmarks

Click the bookmark icon on any article card to save it for later.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub

2. Import project in Vercel

3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your FastAPI backend URL

4. Deploy!

### Build for Production

```bash
npm run build
npm start
```

## API Integration

The frontend expects the FastAPI backend to have:

- **Endpoint**: `GET /news`
- **Response**: JSON object with article structure (see `lib/types.ts`)
- **CORS**: Enabled for `http://localhost:3000` and Vercel domains

## Customization

### Theme Colors

Edit `tailwind.config.ts` and `app/globals.css` to customize colors.

### Fonts

Fonts are loaded from Google Fonts in `app/globals.css`.

### Components

All components are in the `components/` directory and can be customized independently.

## Troubleshooting

### Articles not loading

1. Check if FastAPI backend is running on `http://localhost:8000`
2. Verify CORS is enabled in the backend
3. Check browser console for errors

### Theme not switching

Clear localStorage and refresh the page.

### Search not working

Make sure articles are loaded (check the news feed).

## License

MIT
