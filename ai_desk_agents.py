import os
import uuid
import hashlib
from datetime import datetime, timezone
from dotenv import load_dotenv
from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, function_tool
from agents.run import RunConfig
import asyncio
import json
import re

from googleapiclient.discovery import build
import feedparser
import wikipedia
import httpx

# Set language to English
wikipedia.set_lang("en")

# Load .env file
load_dotenv()

# Get API keys
groq_api_key = os.getenv("GROQ_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
google_api_key = os.getenv("GOOGLE_API_KEY")
unsplash_access_key = os.getenv("UNSPLASH_ACCESS_KEY", "")

if not groq_api_key:
    raise ValueError("GROQ_API_KEY is not set. Please ensure it is defined in your .env file.")

# Initialize Groq OpenAI-compatible client
external_client = AsyncOpenAI(
    api_key=groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

# Define the model
model = OpenAIChatCompletionsModel(
    model="groq/compound-mini",
    openai_client=external_client
)

# Run configuration
config = RunConfig(
    model=model,
    model_provider=external_client,
    tracing_disabled=True
)

# ================================================================================
#                           ARTICLE CACHE (Deduplication)
# ================================================================================

class ArticleCache:
    """
    Semantic deduplication cache for articles.
    Merges articles with similar titles/topics.
    """
    def __init__(self):
        self.articles = {}  # key: normalized_title -> article dict
        
    def _normalize_title(self, title: str) -> str:
        """Normalize title for comparison."""
        # Remove special chars, lowercase, remove common words
        title = title.lower()
        title = re.sub(r'[^a-z0-9\s]', '', title)
        stop_words = {'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'was', 'were'}
        words = [w for w in title.split() if w not in stop_words]
        return ' '.join(sorted(words))
    
    def _similarity(self, title1: str, title2: str) -> float:
        """Calculate Jaccard similarity between two titles."""
        set1 = set(self._normalize_title(title1).split())
        set2 = set(self._normalize_title(title2).split())
        if not set1 or not set2:
            return 0.0
        intersection = set1 & set2
        union = set1 | set2
        return len(intersection) / len(union)
    
    def find_similar(self, title: str, threshold: float = 0.5) -> str | None:
        """Find existing article with similar title."""
        for key, article in self.articles.items():
            if self._similarity(title, article.get('meta_title', '')) >= threshold:
                return key
        return None
    
    def add_or_merge(self, article: dict) -> dict:
        """Add new article or merge with existing similar one."""
        title = article.get('meta_title', '')
        existing_key = self.find_similar(title)
        
        if existing_key:
            # Merge with existing article
            existing = self.articles[existing_key]
            
            # Merge source_links
            existing_sources = existing.get('source_links', [])
            new_sources = article.get('source_links', [])
            merged_sources = existing_sources + [s for s in new_sources if s not in existing_sources]
            existing['source_links'] = merged_sources
            
            # Merge video_links
            existing_videos = existing.get('video_links', [])
            new_videos = article.get('video_links', [])
            merged_videos = existing_videos + [v for v in new_videos if v not in existing_videos]
            existing['video_links'] = merged_videos
            
            # Merge images
            existing_images = existing.get('images', [])
            new_images = article.get('images', [])
            merged_images = existing_images + [i for i in new_images if i not in existing_images]
            existing['images'] = merged_images
            
            # Merge tags
            existing_tags = set(existing.get('tags', []))
            new_tags = set(article.get('tags', []))
            existing['tags'] = list(existing_tags | new_tags)
            
            return existing
        else:
            # Add new article
            key = self._normalize_title(title)
            article['id'] = str(uuid.uuid4())
            article['timestamp'] = datetime.now(timezone.utc).isoformat()
            if 'published' not in article:
                article['published'] = article['timestamp']
            self.articles[key] = article
            return article
    
    def get_all(self) -> list:
        """Get all articles as a list."""
        return list(self.articles.values())
    
    def clear(self):
        """Clear the cache."""
        self.articles = {}


# Global cache instance
article_cache = ArticleCache()


# ================================================================================
#                               FUNCTION TOOLS
# ================================================================================

# Initialize YouTube client
youtube_client = build("youtube", "v3", developerKey=google_api_key) if google_api_key else None

@function_tool
def fetch_youtube_videos():
    """
    Fetches the latest AI-related videos from YouTube.
    Returns a list of videos with title, link, description, and published date.
    """
    if not youtube_client:
        return {"error": "YouTube API not configured"}
    
    request = youtube_client.search().list(
        part="snippet",
        q="AI news",
        type="video",
        maxResults=5,
        order="date"
    )
    response = request.execute()

    videos = []
    for item in response['items']:
        videos.append({
            "title": item['snippet']['title'],
            "link": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
            "description": item['snippet']['description'],
            "published": item['snippet']['publishedAt'],
            "thumbnail": item['snippet']['thumbnails']['high']['url']
        })

    return videos

# Non-decorated wrapper for direct calling
def _fetch_youtube_videos():
    if not youtube_client:
        return {"error": "YouTube API not configured"}
    
    request = youtube_client.search().list(
        part="snippet",
        q="AI news",
        type="video",
        maxResults=5,
        order="date"
    )
    response = request.execute()

    videos = []
    for item in response['items']:
        videos.append({
            "title": item['snippet']['title'],
            "link": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
            "description": item['snippet']['description'],
            "published": item['snippet']['publishedAt'],
            "thumbnail": item['snippet']['thumbnails']['high']['url']
        })

    return videos


@function_tool
def fetch_forbes_ai_news():
    """
    Fetches the latest AI news articles from Forbes RSS feed.
    Returns a list of articles with title, link, description, and published date.
    """
    feed_url = "https://www.forbes.com/ai/feed2/"
    feed = feedparser.parse(feed_url)

    articles = []
    for entry in feed.entries[:10]:
        articles.append({
            "title": entry.title,
            "link": entry.link,
            "summary": entry.summary,
            "published": entry.published
        })
    return articles

# Non-decorated wrapper
def _fetch_forbes_ai_news():
    feed_url = "https://www.forbes.com/ai/feed2/"
    feed = feedparser.parse(feed_url)

    articles = []
    for entry in feed.entries[:10]:
        articles.append({
            "title": entry.title,
            "link": entry.link,
            "summary": entry.summary,
            "published": entry.published
        })
    return articles



@function_tool
def fetch_google_ai_news():
    """
    Fetches latest AI news articles from Google News RSS feed.
    Returns a list of articles with title, link, summary, and published date.
    """
    feed_url = "https://news.google.com/rss/search?q=AI&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(feed_url)

    articles = []
    for entry in feed.entries[:10]:
        articles.append({
            "title": entry.title,
            "link": entry.link,
            "summary": entry.summary,
            "published": entry.published
        })
    return articles

# Non-decorated wrapper
def _fetch_google_ai_news():
    feed_url = "https://news.google.com/rss/search?q=AI&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(feed_url)

    articles = []
    for entry in feed.entries[:10]:
        articles.append({
            "title": entry.title,
            "link": entry.link,
            "summary": entry.summary,
            "published": entry.published
        })
    return articles



@function_tool
def fetch_wikipedia_ai_content() -> dict:
    """
    Fetch AI-related content from Wikipedia and return summary, title, URL, and images.
    """
    topic = "Artificial intelligence"
    try:
        page = wikipedia.page(topic)
        result = {
            "title": page.title,
            "summary": page.summary,
            "url": page.url,
            "images": page.images[:3]
        }
        return result
    except wikipedia.DisambiguationError as e:
        page = wikipedia.page(e.options[0])
        result = {
            "title": page.title,
            "summary": page.summary,
            "url": page.url,
            "images": page.images[:3]
        }
        return result
    except Exception as ex:
        return {"error": str(ex)}

# Non-decorated wrapper
def _fetch_wikipedia_ai_content() -> dict:
    topic = "Artificial intelligence"
    try:
        page = wikipedia.page(topic)
        result = {
            "title": page.title,
            "summary": page.summary,
            "url": page.url,
            "images": page.images[:3]
        }
        return result
    except wikipedia.DisambiguationError as e:
        page = wikipedia.page(e.options[0])
        result = {
            "title": page.title,
            "summary": page.summary,
            "url": page.url,
            "images": page.images[:3]
        }
        return result
    except Exception as ex:
        return {"error": str(ex)}


@function_tool
def fetch_images_for_topic(topic: str) -> list:
    """
    Fetch relevant images for a topic from Unsplash.
    Returns a list of image URLs with alt text.
    """
    images = []
    
    # Try Unsplash first
    if unsplash_access_key:
        try:
            url = f"https://api.unsplash.com/search/photos?query={topic}&per_page=3"
            headers = {"Authorization": f"Client-ID {unsplash_access_key}"}
            response = httpx.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for photo in data.get('results', [])[:3]:
                    images.append({
                        "url": photo['urls']['regular'],
                        "alt": photo.get('alt_description', topic),
                        "source": "Unsplash",
                        "generated": False
                    })
        except Exception:
            pass
    
    return images


@function_tool
def generate_image_for_topic(prompt: str) -> dict:
    """
    Generate an image using DALL-E for a given prompt.
    Returns image URL and metadata.
    """
    if not openai_api_key:
        return {"error": "OpenAI API key not configured for image generation"}
    
    try:
        import openai
        client = openai.OpenAI(api_key=openai_api_key)
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        return {
            "url": response.data[0].url,
            "alt": prompt,
            "source": "DALL-E",
            "generated": True
        }
    except Exception as e:
        return {"error": str(e)}


# ================================================================================
#                                   AGENTS
# ================================================================================

# Writer Agent
writer = Agent(
    name="Writer",
    instructions='''You are a professional news writer and SEO content creator. 
Your task: take raw news input (facts, bullet‑points, source links) related to AI and produce a complete, polished news article in English suitable for publication online.

Follow these rules strictly:

1. Construct a **Meta Title** (≤ 60 characters) - catchy, clear, includes main keyword(s).
2. Create a **Meta Description** (≈ 150–160 characters) - summarizes article concisely.
3. Suggest a **Meta Image Prompt** (e.g. "AI robot over futuristic city skyline") and provide an **alt‑text**.
4. Structure content with headings: H1 title, H2 subheadings (What happened, Why it matters, Key details, Conclusion).
5. Write in neutral, factual, professional tone.
6. Provide a **URL slug** (lowercase, hyphen‑separated).
7. Include **tags** (e.g. "AI", "Machine Learning", "News").

Format output as **JSON object** with these keys:
- `"meta_title"`
- `"meta_description"`
- `"meta_image_prompt"`
- `"alt_text"`
- `"slug"`
- `"tags"` (array)
- `"content"` (array of objects with `"heading"` and `"paragraphs"` list)
- `"source_links"` (array of objects with `"title"`, `"url"`, `"source"`)
- `"video_links"` (array of objects with `"title"`, `"url"`, `"source"`, `"published"`)

Output ONLY valid JSON, no markdown code blocks.
''',
    model=model
)

# Image Agent
image_agent = Agent(
    name="ImageAgent",
    instructions='''You are an Image Agent that finds or generates images for news articles.

Your task:
1. Receive article content with meta_image_prompt
2. First, use `fetch_images_for_topic` to search for relevant existing images
3. If no good images found, use `generate_image_for_topic` with the meta_image_prompt
4. Return the images array

Always prefer existing images over generated ones to save costs.
Return a JSON array of image objects with: url, alt, source, generated (boolean).
''',
    model=model,
    tools=[fetch_images_for_topic, generate_image_for_topic]
)

# YouTube Agent
youtube_agent = Agent(
    name="YoutubeAgent",
    instructions="""You are a YouTube Agent specialized in AI-related news.

Your task:
1. Use `fetch_youtube_videos()` to get the latest AI-related YouTube videos.
2. For EACH video, prepare a news summary with:
   - Title, published date, YouTube link
   - Key insights and relevance to AI
3. Format each video as a separate news item.

Return a JSON array where each item has:
- "title": video title
- "summary": your news summary
- "video_url": YouTube link
- "published": publication date
- "thumbnail": thumbnail URL
""",
    model=model,
    tools=[fetch_youtube_videos]
)

# Forbes Agent
forbes_agent = Agent(
    name="ForbesAgent",
    instructions="""You are a Forbes news agent.

Your task:
1. Use `fetch_forbes_ai_news()` to get the latest AI news from Forbes.
2. For EACH article, prepare a news summary with key points and insights.
3. Include article title, published date, and link.

Return a JSON array where each item has:
- "title": article title
- "summary": your news summary  
- "source_url": Forbes article link
- "published": publication date
""",
    model=model,
    tools=[fetch_forbes_ai_news]
)

# Google News Agent
google_agent = Agent(
    name="GoogleNewsAgent",
    instructions="""You are a Google News agent for AI topics.

Your task:
1. Use `fetch_google_ai_news()` to get the latest AI news.
2. For EACH article, prepare a news summary with key points.
3. Include title, published date, source, and link.

Return a JSON array where each item has:
- "title": article title
- "summary": your news summary
- "source_url": article link
- "published": publication date
""",
    model=model,
    tools=[fetch_google_ai_news]
)

# Wikipedia Agent
wikipedia_agent = Agent(
    name="WikipediaAgent",
    instructions="""You are a Wikipedia research agent for AI topics.

Your task:
1. Use `fetch_wikipedia_ai_content()` to get AI-related information.
2. Summarize the content in a journalistic style.
3. Include title, summary, and source link.

Return a JSON object with:
- "title": article title
- "summary": your summary
- "source_url": Wikipedia link
- "images": array of image URLs
""",
    model=model,
    tools=[fetch_wikipedia_ai_content]
)


# ================================================================================
#                              ORCHESTRATION
# ================================================================================

async def process_source_to_article(source_name: str, fetch_function, max_items: int = 3) -> list:
    """
    Fetch news from a source, then pass each result to Writer agent to create articles.
    Returns list of formatted articles.
    """
    articles = []
    
    try:
        # Step 1: Directly call the fetch function
        print(f"[{source_name}] Fetching news...")
        raw_data = fetch_function()
        
        # Handle different return types
        if isinstance(raw_data, dict):
            if "error" in raw_data:
                print(f"[{source_name}] Error: {raw_data['error']}")
                return []
            news_items = [raw_data]
        elif isinstance(raw_data, list):
            news_items = raw_data[:max_items]
        else:
            print(f"[{source_name}] Unexpected data type: {type(raw_data)}")
            return []
        
        print(f"[{source_name}] Processing {len(news_items)} items...")
        
        # Step 2: For each news item, call Writer agent
        for idx, item in enumerate(news_items, 1):
            writer_prompt = f"""
Create a news article from this {source_name} content:

Title: {item.get('title', 'AI News')}
Summary: {item.get('summary', item.get('description', ''))}
Source URL: {item.get('url', item.get('link', ''))}
Published: {item.get('published', '')}

Include this in source_links with source="{source_name}".
"""
            if item.get('link') and 'youtube.com' in item.get('link', ''):
                writer_prompt += f"\nVideo URL: {item.get('link')}\nInclude this in video_links."
            
            try:
                print(f"[{source_name}] Writing article {idx}/{len(news_items)}...")
                writer_result = await Runner.run(writer, writer_prompt, run_config=config)
                article_json = writer_result.final_output.strip()
                
                # Clean and parse
                if article_json.startswith("```"):
                    article_json = re.sub(r'^```\w*\n?', '', article_json)
                    article_json = re.sub(r'\n?```$', '', article_json)
                
                article = json.loads(article_json)
                
                # Add images directly (skip Image Agent for now to avoid errors)
                images = []
                if item.get('thumbnail'):
                    images.append({"url": item['thumbnail'], "alt": article.get('meta_title', ''), "source": source_name, "generated": False})
                elif item.get('images'):
                    for img_url in item.get('images', [])[:1]:
                        images.append({"url": img_url, "alt": article.get('meta_title', ''), "source": source_name, "generated": False})
                
                article['images'] = images
                articles.append(article)
                print(f"[{source_name}] ✓ Article created: {article.get('meta_title', '')[:50]}...")
                
            except Exception as e:
                print(f"[{source_name}] Writer error: {e}")
                continue
                
    except Exception as e:
        print(f"[{source_name}] Agent error: {e}")
    
    return articles


async def ai_desk():
    """
    Main orchestration function.
    Fetches news from all sources, creates articles via Writer, deduplicates.
    Returns array of articles.
    """
    # Clear cache for fresh run
    article_cache.clear()
    print("Starting AI Desk news generation...")
    
    # Run all source fetchers concurrently
    tasks = [
        process_source_to_article("YouTube", _fetch_youtube_videos, max_items=2),
        process_source_to_article("Google", _fetch_google_ai_news, max_items=3),
        process_source_to_article("Forbes", _fetch_forbes_ai_news, max_items=2),
        process_source_to_article("Wikipedia", _fetch_wikipedia_ai_content, max_items=1),
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Process results and deduplicate
    for result in results:
        if isinstance(result, Exception):
            print(f"Task error: {result}")
            continue
        if isinstance(result, list):
            for article in result:
                article_cache.add_or_merge(article)
    
    # Return all articles
    return article_cache.get_all()


# Run the AI Desk
if __name__ == "__main__":
    result = asyncio.run(ai_desk())
    print("===== AI DESK NEWS OUTPUT =====")
    print(json.dumps(result, indent=2))
