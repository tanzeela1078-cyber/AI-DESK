# AI Desk Test Suite Documentation

## Overview

This document describes the comprehensive test suite for the AI Desk News System, covering all 10 critical test cases as specified.

## Test Cases

### 1. Fetching News From Multiple Sources ✓

**Objective**: Ensure each source is callable and returns expected structured data.

**Tests**:
- `test_youtube_fetch_structure`: Validates YouTube API response format
- `test_google_news_fetch_structure`: Validates Google News RSS feed format
- `test_forbes_fetch_structure`: Validates Forbes RSS feed format
- `test_wikipedia_fetch_structure`: Validates Wikipedia API response
- `test_all_sources_timeout`: Ensures all sources respond within 30 seconds

**Expected Fields**:
```python
{
    "title": str,
    "description": str,
    "source": str,
    "url": str,
    "image": str (optional),
    "videoURL": str (optional)
}
```

---

### 2. Agent Workflow Completion ✓

**Objective**: Validate end-to-end agent chain.

**Tests**:
- `test_end_to_end_workflow`: Tests complete pipeline from fetch to article generation
- `test_writer_agent_output_format`: Validates Writer agent JSON output

**Workflow**:
1. Source Agent (YouTube/Google/Forbes/Wikipedia) → Fetches raw data
2. Writer Agent → Creates structured article with metadata
3. Deduplication → Merges similar articles
4. Output → Returns array of articles

**Expected Output**:
```python
{
    "meta_title": str (≤70 chars),
    "meta_description": str (≤200 chars),
    "slug": str,
    "tags": list[str],
    "content": list[dict],
    "source_links": list[dict],
    "video_links": list[dict] (optional),
    "images": list[dict] (optional)
}
```

---

### 3. Duplicate News Detection & Filtering ✓

**Objective**: Remove repetitive or overlapping articles from different sources.

**Tests**:
- `test_exact_duplicate_removal`: Tests merging of identical articles
- `test_similar_title_detection`: Tests Jaccard similarity-based deduplication
- `test_different_articles_not_merged`: Ensures distinct articles remain separate

**Algorithm**:
- Normalizes titles (lowercase, remove special chars, remove stop words)
- Calculates Jaccard similarity between word sets
- Merges articles with similarity ≥ 50%
- Combines source_links, video_links, images, and tags

**Example**:
```python
Article 1: "OpenAI Releases GPT-5 Model" (Google)
Article 2: "OpenAI's GPT-5 Model Released" (Forbes)
→ Merged with both sources tagged
```

---

### 4. Content Classification & Categorization ✓

**Objective**: Categorize news into labels.

**Tests**:
- `test_tag_generation`: Validates that articles have appropriate AI-related tags

**Categories**:
- AI Models
- Startups
- Regulations
- Breakthroughs
- Machine Learning
- Deep Learning
- Research
- Technology

**Validation**: At least one AI-related tag per article

---

### 5. Title, Description, and Summary Generation ✓

**Objective**: Ensure OpenAI agent generates concise and readable content.

**Tests**:
- `test_title_length_constraint`: Title ≤ 70 characters
- `test_description_length_constraint`: Description 100-200 characters
- `test_summary_word_count`: Meta description ≤ 50 words

**Quality Checks**:
- No hallucination (facts match source)
- SEO-optimized
- Clear and concise
- Professional tone

---

### 6. UI Rendering Test ✓

**Objective**: Ensure UI renders all components correctly.

**Tests**:
- `test_mock_article_structure_for_ui`: Validates article structure for Next.js frontend

**Required Fields for UI**:
```typescript
{
    id: string,
    meta_title: string,
    meta_description: string,
    slug: string,
    tags: string[],
    source_links: Array<{source: string, url: string}>,
    video_links?: Array<{url: string, title: string}>,
    images?: Array<{url: string, alt: string}>,
    published: string (ISO 8601),
    timestamp: string (ISO 8601)
}
```

**UI Components Tested**:
- NewsCard (title, description, thumbnail, tags)
- HeroCarousel (featured articles)
- NewsFeed (grid layout)
- Sidebar (filters)

---

### 7. API Rate Limit Handling ✓

**Objective**: Ensure system handles throttling from sources.

**Tests**:
- `test_concurrent_requests_handling`: Tests multiple simultaneous requests
- `test_graceful_degradation`: Validates fallback behavior

**Implementation**:
- Uses `asyncio.gather()` with `return_exceptions=True`
- Continues operation if some sources fail
- No crashes on rate limits
- Returns cached/partial results

---

### 8. Error Handling & Fallback Logic ✓

**Objective**: Verify resilience when a source fails.

**Tests**:
- `test_source_failure_resilience`: Tests system continues with remaining sources
- `test_api_error_response`: Validates proper error responses

**Error Scenarios**:
- API key not configured → Skip source
- Network timeout → Return empty list
- Invalid response → Log error and continue
- Partial failures → Merge successful results

**Example**:
```python
# Forbes fails, but YouTube, Google, Wikipedia succeed
→ Returns articles from 3 sources instead of 4
```

---

### 9. Image & Video Validation ✓

**Objective**: Ensure invalid URLs are rejected and replaced.

**Tests**:
- `test_video_url_format`: Validates YouTube URL format
- `test_image_url_validation`: Checks image URLs and alt text

**Validation Rules**:
- Video URLs must contain `youtube.com/watch?v=`
- Image URLs must start with `http://` or `https://`
- All images must have non-empty alt text
- Broken links → Replace with placeholder (future enhancement)

---

### 10. Search & Filtering Feature Test ✓

**Objective**: Ensure user can search and filter relevant news.

**Tests**:
- `test_article_relevance`: Validates all articles are AI-related
- `test_chronological_sorting`: Tests date-based sorting

**Search Keywords**:
- AI, Artificial Intelligence
- Machine Learning, Deep Learning
- GPT, LLM, Neural Networks
- OpenAI, Google, Gemini
- ChatGPT, Claude, etc.

**Filtering Options** (Frontend):
- Content Type: Video, Article, Wikipedia
- Sources: YouTube, Google, Forbes, Wikipedia
- Topics: GPT, Gemini, Llama, Regulations, etc.
- Sort: Recent, Most Watched, AI Highlighted

---

## Running the Tests

### Install Dependencies

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -e .
```

### Run All Tests

```bash
# Using pytest directly
pytest test_comprehensive.py -v

# Using the test runner script
python run_tests.py
```

### Run Specific Test Categories

```bash
# Run only source fetching tests
pytest test_comprehensive.py::TestMultiSourceFetching -v

# Run only integration tests
pytest test_comprehensive.py::TestIntegration -v

# Run only duplicate detection tests
pytest test_comprehensive.py::TestDuplicateDetection -v
```

### Run with Coverage

```bash
pytest test_comprehensive.py --cov=ai_desk_agents --cov-report=html
```

---

## Test Results Interpretation

### Success Criteria

- ✓ All sources return valid data structures
- ✓ End-to-end workflow completes without errors
- ✓ Duplicate articles are properly merged
- ✓ Articles have appropriate tags
- ✓ Titles ≤ 70 chars, descriptions 100-200 chars
- ✓ UI-compatible data structure
- ✓ System handles concurrent requests
- ✓ Graceful error handling
- ✓ Valid media URLs
- ✓ AI-relevant content (≥80% accuracy)

### Expected Pass Rate

- **Unit Tests**: 100% (all should pass)
- **Integration Tests**: ≥90% (some may fail due to API availability)
- **Overall**: ≥95%

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.13'
      - run: pip install -e .
      - run: pytest test_comprehensive.py -v
```

---

## Troubleshooting

### Common Issues

1. **YouTube API not configured**
   - Solution: Add `GOOGLE_API_KEY` to `.env` file
   - Tests will skip if not configured

2. **Rate limit exceeded**
   - Solution: Wait and retry, or use cached results
   - Tests handle this gracefully

3. **Network timeout**
   - Solution: Check internet connection
   - Increase timeout in test configuration

4. **Import errors**
   - Solution: Ensure all dependencies are installed
   - Run `uv sync` or `pip install -e .`

---

## Future Enhancements

- [ ] Add performance benchmarks
- [ ] Implement broken link detection
- [ ] Add semantic similarity tests
- [ ] Create mock data for offline testing
- [ ] Add load testing (100+ concurrent requests)
- [ ] Implement caching layer tests
- [ ] Add database integration tests

---

## Contact

For issues or questions about the test suite, please open an issue on GitHub.
