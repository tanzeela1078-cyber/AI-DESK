# AI Desk - AI-Powered News Aggregation System

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](./TEST_RESULTS.md)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](./TEST_RESULTS.md)
[![Python](https://img.shields.io/badge/python-3.13-blue)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/next.js-16.0-black)](https://nextjs.org/)

AI Desk is an intelligent news aggregation system that uses multiple AI agents to fetch, analyze, and present AI-related news from various sources including YouTube, Google News, Forbes, and Wikipedia.

## 🎯 Features

- **Multi-Source Aggregation**: Fetches news from YouTube, Google News, Forbes, and Wikipedia
- **AI-Powered Writing**: Uses AI agents to create well-structured, SEO-optimized articles
- **Smart Deduplication**: Semantic similarity-based duplicate detection and merging
- **Responsive UI**: Modern Next.js frontend with dark mode support
- **Real-time Updates**: Refresh news on demand
- **Advanced Filtering**: Filter by source, content type, and topics
- **Video Integration**: Embedded YouTube videos with articles

## 🏗️ Architecture

```
┌─────────────────┐
│  Source Agents  │
│  (YouTube,      │
│   Google,       │
│   Forbes,       │
│   Wikipedia)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Writer Agent   │
│  (Generates     │
│   Articles)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deduplication  │
│  (Semantic      │
│   Merging)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   FastAPI       │
│   Backend       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js       │
│   Frontend      │
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- API Keys (see Configuration)

### Backend Setup

```bash
# Install dependencies using uv (recommended)
uv sync

# Or using pip
pip install -e .

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the backend
uvicorn FAST_API:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔑 Configuration

Create a `.env` file in the root directory:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Optional
OPENAI_API_KEY=your_openai_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
```

## 🧪 Testing

### Quick Test (Recommended)
```bash
python quick_test.py
```

### Full Test Suite
```bash
python run_tests.py
```

### Specific Tests
```bash
pytest test_comprehensive.py::TestMultiSourceFetching -v
```

### Test Coverage

**All 10 Critical Test Cases: ✅ PASSED (100%)**

1. ✅ Multi-Source Fetching (YouTube, Google, Forbes, Wikipedia)
2. ✅ Agent Workflow Completion (Fetch → Write → Deduplicate)
3. ✅ Duplicate Detection & Filtering
4. ✅ Content Classification & Categorization
5. ✅ Title, Description, and Summary Generation
6. ✅ UI Rendering Test (Next.js)
7. ✅ API Rate Limit Handling
8. ✅ Error Handling & Fallback Logic
9. ✅ Image & Video Validation
10. ✅ Search & Filtering Features

See [TEST_RESULTS.md](./TEST_RESULTS.md) for detailed test report.

## 📁 Project Structure

```
AI_DESK/
├── ai_desk_agents.py       # Main agent system
├── FAST_API.py             # FastAPI backend
├── frontend/               # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── contexts/
│   └── lib/
├── test_comprehensive.py   # Test suite
├── quick_test.py          # Quick validation
├── run_tests.py           # Test runner
├── pytest.ini             # Test configuration
├── TEST_RESULTS.md        # Test results
├── TEST_DOCUMENTATION.md  # Test docs
└── TEST_README.md         # Test guide
```

## 🎨 Frontend Components

- **Header**: Navigation, search, theme toggle, refresh
- **HeroCarousel**: Featured articles with auto-rotation
- **NewsFeed**: Grid layout with responsive columns
- **NewsCard**: Article cards with images, tags, and metadata
- **Sidebar**: Filters for sources, content types, and topics
- **Footer**: Links and newsletter signup

## 🔧 API Endpoints

### `GET /`
Welcome message

### `GET /health`
Health check with timestamp

### `GET /news`
Fetch and generate news articles

**Response**:
```json
{
  "articles": [
    {
      "id": "uuid",
      "meta_title": "Article Title",
      "meta_description": "Description",
      "slug": "article-slug",
      "tags": ["AI", "News"],
      "content": [...],
      "source_links": [...],
      "video_links": [...],
      "images": [...],
      "published": "2025-12-10T00:00:00Z",
      "timestamp": "2025-12-10T00:00:00Z"
    }
  ]
}
```

## 🤖 Agent System

### Source Agents
- **YouTubeAgent**: Fetches AI-related videos
- **GoogleNewsAgent**: Fetches from Google News RSS
- **ForbesAgent**: Fetches from Forbes AI feed
- **WikipediaAgent**: Fetches AI content from Wikipedia

### Processing Agents
- **WriterAgent**: Creates structured articles with SEO optimization
- **ImageAgent**: Fetches or generates images (optional)

### Deduplication
- Uses Jaccard similarity on normalized titles
- Merges articles with >50% similarity
- Combines sources, videos, images, and tags

## 📊 Performance

| Metric | Value |
|--------|-------|
| Source Fetch | ~7s avg |
| Article Generation | ~15s avg |
| Full Pipeline | ~45s avg |
| API Response | ~2s avg |
| Duplicate Detection | ~0.1s |

## 🛡️ Error Handling

- Graceful degradation when sources fail
- Proper fallback mechanisms
- User-friendly error messages
- Comprehensive logging
- No crashes on rate limits

## 🎯 Future Enhancements

- [ ] Redis caching layer
- [ ] Database persistence
- [ ] User authentication
- [ ] Bookmarks and favorites
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] RSS feed export

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python quick_test.py`
5. Submit a pull request

## 📧 Support

For issues or questions:
- Check [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)
- Review [TEST_README.md](./TEST_README.md)
- Open an issue on GitHub

## 🙏 Acknowledgments

- OpenAI for GPT models
- Groq for fast inference
- Google for YouTube and News APIs
- Forbes for AI news feed
- Wikipedia for AI content
- Next.js team for the framework
- FastAPI team for the backend framework

---

**Status**: ✅ Production Ready  
**Last Updated**: December 10, 2025  
**Version**: 1.0.0
