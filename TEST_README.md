# AI Desk Test Suite - Quick Start Guide

## Overview

This test suite validates all 10 critical requirements for the AI Desk News System.

## Quick Start

### 1. Install Dependencies

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -e .
```

### 2. Configure Environment

Create a `.env` file with your API keys:

```env
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here  # Optional
```

### 3. Run Tests

#### Quick Test (Recommended for first run)
```bash
python quick_test.py
```

This runs one representative test from each of the 10 categories (~2-3 minutes).

#### Full Test Suite
```bash
python run_tests.py
```

Or directly with pytest:
```bash
pytest test_comprehensive.py -v
```

#### Specific Test Categories
```bash
# Test 1: Multi-Source Fetching
pytest test_comprehensive.py::TestMultiSourceFetching -v

# Test 2: Agent Workflow
pytest test_comprehensive.py::TestAgentWorkflow -v

# Test 3: Duplicate Detection
pytest test_comprehensive.py::TestDuplicateDetection -v

# Test 4: Content Classification
pytest test_comprehensive.py::TestContentClassification -v

# Test 5: Content Generation
pytest test_comprehensive.py::TestContentGeneration -v

# Test 6: UI Rendering
pytest test_comprehensive.py::TestUIRendering -v

# Test 7: Rate Limit Handling
pytest test_comprehensive.py::TestRateLimitHandling -v

# Test 8: Error Handling
pytest test_comprehensive.py::TestErrorHandling -v

# Test 9: Media Validation
pytest test_comprehensive.py::TestMediaValidation -v

# Test 10: Search & Filtering
pytest test_comprehensive.py::TestSearchFiltering -v

# Integration Tests
pytest test_comprehensive.py::TestIntegration -v
```

## Test Categories

### ✅ Test 1: Multi-Source Fetching
- Validates YouTube, Google News, Forbes, and Wikipedia APIs
- Checks response format and structure
- Ensures all sources respond within timeout

### ✅ Test 2: Agent Workflow
- Tests end-to-end pipeline: Fetch → Write → Deduplicate
- Validates Writer agent JSON output
- Ensures proper handoff between agents

### ✅ Test 3: Duplicate Detection
- Tests semantic deduplication using Jaccard similarity
- Merges articles with >50% title similarity
- Combines source links, videos, and images

### ✅ Test 4: Content Classification
- Validates AI-related tag generation
- Ensures proper categorization
- Checks tag relevance

### ✅ Test 5: Content Generation
- Title length ≤ 70 characters
- Description 100-200 characters
- Summary conciseness

### ✅ Test 6: UI Rendering
- Validates article structure for Next.js frontend
- Checks all required fields
- Ensures proper data types

### ✅ Test 7: Rate Limit Handling
- Tests concurrent request handling
- Validates graceful degradation
- Ensures no crashes on rate limits

### ✅ Test 8: Error Handling
- Tests resilience when sources fail
- Validates fallback logic
- Ensures proper error responses

### ✅ Test 9: Media Validation
- Validates YouTube URL format
- Checks image URLs and alt text
- Ensures proper media structure

### ✅ Test 10: Search & Filtering
- Tests article relevance to AI topics
- Validates chronological sorting
- Ensures search functionality

## Expected Results

### Success Criteria
- ✅ All sources return valid data
- ✅ End-to-end workflow completes
- ✅ Duplicates properly merged
- ✅ Articles properly tagged
- ✅ Content meets length constraints
- ✅ UI-compatible structure
- ✅ Graceful error handling
- ✅ Valid media URLs
- ✅ AI-relevant content

### Pass Rates
- **Unit Tests**: 100% expected
- **Integration Tests**: ≥90% expected (depends on API availability)
- **Overall**: ≥95% expected

## Troubleshooting

### Common Issues

**YouTube API not configured**
```
Solution: Add GOOGLE_API_KEY to .env file
Note: Tests will skip if not configured
```

**Rate limit exceeded**
```
Solution: Wait and retry
Note: Tests handle this gracefully
```

**Import errors**
```
Solution: Run `uv sync` or `pip install -e .`
```

**Async test failures**
```
Solution: Ensure pytest-asyncio is installed
Check: pytest --version should show asyncio plugin
```

## Test Files

- `test_comprehensive.py` - Main test suite (all 10 test cases)
- `quick_test.py` - Quick validation (one test per category)
- `run_tests.py` - Full test runner with reporting
- `pytest.ini` - Pytest configuration
- `TEST_DOCUMENTATION.md` - Detailed test documentation

## CI/CD Integration

### GitHub Actions Example

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
      - run: python quick_test.py
    env:
      GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
      GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
```

## Test Coverage

To generate coverage report:

```bash
pytest test_comprehensive.py --cov=ai_desk_agents --cov=FAST_API --cov-report=html
```

View report:
```bash
# Open htmlcov/index.html in browser
```

## Performance Benchmarks

Expected test execution times:
- Quick Test: 2-3 minutes
- Full Test Suite: 5-10 minutes
- Single Category: 10-60 seconds

## Support

For issues or questions:
1. Check `TEST_DOCUMENTATION.md` for detailed explanations
2. Review test output for specific error messages
3. Ensure all environment variables are set
4. Verify API keys are valid and have sufficient quota

## Next Steps

After tests pass:
1. ✅ Deploy to production
2. ✅ Set up monitoring
3. ✅ Configure CI/CD pipeline
4. ✅ Enable caching layer
5. ✅ Add performance monitoring

---

**Last Updated**: 2025-12-10
**Test Suite Version**: 1.0.0
