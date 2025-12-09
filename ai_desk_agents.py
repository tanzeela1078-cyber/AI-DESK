import os
from dotenv import load_dotenv
from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, SQLiteSession, function_tool
from agents.run import RunConfig
import asyncio
import os
from dotenv import load_dotenv
import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
import feedparser
import wikipedia
# Set language to English
wikipedia.set_lang("en")

# Load .env file
load_dotenv()
# Get Groq API key
groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise ValueError("GROQ_API_KEY is not set. Please ensure it is defined in your .env file.")

# Initialize Groq OpenAI-compatible client
external_client = AsyncOpenAI(
    api_key=groq_api_key,
    base_url="https://api.groq.com/openai/v1",  # Groq-compatible endpoint
)

# Define the model
model = OpenAIChatCompletionsModel(
    model="groq/compound-mini",  # Example Groq model
    openai_client=external_client
)

# Run configuration
config = RunConfig(
    model=model,
    model_provider=external_client,
    tracing_disabled=True
)


'''
================================================================================
                                FUNCTION TOOLS
================================================================================
'''
# Initialize YouTube client
youtube_api_key = os.getenv("GOOGLE_API_KEY")
youtube_client = build("youtube", "v3", developerKey=youtube_api_key)

@function_tool
def fetch_youtube_videos():
    """
    Fetches the latest AI-related videos from YouTube.
    Returns a list of videos with title, link, description, and published date.
    """
    request = youtube_client.search().list(
        part="snippet",
        q="AI news",  # Hardcoded query
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
            "published": item['snippet']['publishedAt']
        })

    return videos


# Function tool to fetch Forbes AI news
@function_tool
def fetch_forbes_ai_news():
    """
    Fetches the latest AI news articles from Forbes RSS feed.
    Returns a list of articles with title, link, description, and published date.
    """
    feed_url = "https://www.forbes.com/ai/feed2/"  # Forbes AI RSS feed
    feed = feedparser.parse(feed_url)

    articles = []
    for entry in feed.entries[:10]:  # Fetch latest 10 articles
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
    # Google News RSS feed for AI topics
    feed_url = "https://news.google.com/rss/search?q=AI&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(feed_url)

    articles = []
    for entry in feed.entries[:10]:  # Get latest 10 news
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
    Fetch AI-related content from Wikipedia and return summary, title, URL, and thumbnail if available.
    """
    topic = "Artificial intelligence"  # fixed query
    try:
        page = wikipedia.page(topic)
        result = {
            "title": page.title,
            "summary": page.summary,
            "url": page.url,
            "images": page.images[:3]  # optional, return first 3 images
        }
        return result
    except wikipedia.DisambiguationError as e:
        # Handle disambiguation pages by picking the first option
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

'''
================================================================================
                                 AGENTS
================================================================================

'''

#Define writer agent
writer=Agent(name="Writer", instructions=''' You are a professional news writer and SEO content creator. 
Your task: take raw news input (facts, bullet‑points, source links) realted to AI or companies working on AI or with AI or related to AI and produce a complete, polished news article in English suitable for publication online. 
Follow these rules strictly:

1. Construct a **Meta Title** (≤ 60 characters).  
   - Should be catchy, clear, and include the main keyword(s).  
   - No clickbait — it must truthfully reflect article content.

2. Create a **Meta Description** (≈ 150–160 characters).  
   - Summarize the article concisely.  
   - Include primary keyword(s).  
   - Encourage clicks (value‑based, not hype).  

3. Suggest a **Meta Image** (as a short descriptive prompt — e.g. “AI robot over futuristic city skyline”) and provide an **alt‑text description**.  
   - Good for social media cards / open‑graph.  

4. Structure the article content with HTML‑style headings (or Markdown). Use at least:  
   - A main **title (H1)** — same or similar to meta title  
   - Several **H2 subheadings** to organize sections (e.g. “What happened”, “Why it matters”, “Key details”, “Expert opinions / analysis”, “Conclusion / what’s next”).  
   - Within each section, use **short paragraphs** (2–5 sentences).  

5. Include **relevant keywords** naturally (but do not stuff). Also sprinkle **2–4 secondary / related keywords**.  

6. Write in a **neutral, factual, and professional tone** (like a tech‑news journalist). Avoid slang, hype, or exaggeration.  

7. At the end, add a short **conclusion or key takeaway** summarizing the significance of the news.  

8. Provide a suggested **URL slug** (lowercase, hyphen‑separated) for the article page.  

9. Optionally include **suggested tags or categories** (e.g. “AI”, “Machine Learning”, “News”, “Technology”).  

10. Format the output as a **JSON object** with these keys:  
    - `"meta_title"`  
    - `"meta_description"`  
    - `"meta_image_prompt"`  
    - `"alt_text"`  
    - `"slug"`  
    - `"tags"` (array)  
    - `"content"` (an array of objects, each with `"heading"` and `"paragraphs"` list)  

11. Ensure the article is **original and plagiarism‑free**.  

When you receive raw input (facts, bullet points, or URLs), you must first **infer a headline and primary keyword**, then generate the full article as above.  
12.You must provide the link to source of news
13.If the context provided to you have a video link then user must view that video as well
''', model=model)

#Define youtube agent
youtube_agent = Agent(
    name="Youtube",
    instructions="""
You are a Youtube Agent specialized in AI-related news. 
Your task is to:

1. Always use the function tool `fetch_youtube_videos()` to retrieve the latest AI-related YouTube videos.
2. Watch or analyze the content of each video.
3. Prepare a detailed summary of the video, written from the perspective of news reporting. Highlight important insights, key points, and relevance to AI.
4. Include the video title, published date, and YouTube link in your summary.
5. Pass all summarized content, along with the corresponding video links, to the Writer Agent for final news article generation with proper meta title, meta description, and SEO considerations.

Do not generate content from any other source unless explicitly instructed. Focus on accuracy, clarity, and relevance of AI news.
""",
    model=model
)


# Define Forbes Agent
forbes_agent = Agent(
    name="ForbesAgent",
    instructions="""
        You are a Forbes news agent. Your task is to:

1. Always use the function tool `fetch_forbes_ai_news()` to get the latest AI-related news from Forbes.
2. Read and analyze each article.
3. Prepare a detailed summary of the article, written from a news perspective. Highlight key points, trends, and insights relevant to AI.
4. Include the article title, published date, and link in your summary.
5. Pass all summarized content along with links to the Writer Agent for final news article generation with proper meta title, meta description, meta image, and SEO considerations.
        Always use the function tool `fetch_forbes_ai_news` to get the latest AI news. 
        Read and analyze each news article thoroughly. 
        Write a detailed overview of the news with a journalistic perspective. 
        Pass the news title, summary, and article link to the writer agent for formatting and publishing.
        Focus only on AI news, accuracy, and clarity. Use professional journalistic tone.
    """,
    model=model
)

#Define Google News Agent
google_agent = Agent(
    name="GoogleNewsAgent",
    instructions="""
        You are an experienced AI news journalist. 
        Your primary responsibility is to gather and analyze the latest AI-related news from Google. 
        Always use the function tool `fetch_google_ai_news` to retrieve accurate and up-to-date news articles. 
        For each news item, perform the following tasks: 

        1. Read and understand the content thoroughly, capturing the essence of the news.
        2. Evaluate the significance of the news in the context of AI research, technology, business, or innovation.
        3. Summarize the key points in a clear, concise, and journalistic style.
        4. Include all relevant metadata: news title, publication date, source, and direct link.
        5. Highlight trends, implications, or impacts of the news when possible, providing analytical insights.
        6. Format the output in a structured way to be easily consumed by the writer agent, ensuring it can generate SEO-friendly content with meta title, meta description, and suggested meta image.
        7. Maintain accuracy, neutrality, and credibility in reporting, avoiding any speculative or unverified information.

        Your goal is to produce high-quality, professional, and publish-ready news summaries that the writer agent can directly convert into engaging articles for the AI news platform.
    """,
    model=model
)

#Define Wikipedia Agent
wikipedia_agent = Agent(
    name="WikipediaAgent",
    instructions="""
        You are an expert AI researcher and journalist. 
        Your task is to gather accurate, detailed, and up-to-date information about AI-related topics from Wikipedia. 
        Always use the function tool `fetch_wikipedia_ai_content` to retrieve information. 

        For each topic, perform the following tasks:

        1. Read and analyze the Wikipedia article thoroughly, capturing the key points and essential details.
        2. Summarize the content in a clear, concise, and journalistic style suitable for publishing.
        3. Include all relevant metadata: article title, summary, link to the source, and the last updated date.
        4. Highlight the significance or impact of the information in the context of AI research, technology, or applications.
        5. Format the output in a structured way so the writer agent can easily generate SEO-friendly news articles, including meta title, meta description, and suggested meta image.
        6. Maintain accuracy, neutrality, and credibility, avoiding speculation or incorrect information.
        7. Ensure the summary is informative for readers who want both a quick overview and deeper understanding of AI topics.

        Your goal is to provide professional, publish-ready summaries of AI topics from Wikipedia that the writer agent can transform into engaging news content.
    """,
    model=model
)

#Coordinator Agent
async def run_with_retry(agent, prompt, retries=3, delay=20):
    """
    Run an agent with retry logic for rate-limit errors.
    """
    for attempt in range(retries):
        try:
            return await Runner.run(agent, prompt, run_config=config)
        except Exception as e:
            if "Rate limit" in str(e) or "429" in str(e):
                print(f"[{agent.name}] Rate limit hit. Retry {attempt+1}/{retries} in {delay} seconds...")
                await asyncio.sleep(delay)
            else:
                return e
    return Exception(f"[{agent.name}] Failed after {retries} retries due to rate limits.")

async def ai_desk():
    # Step 1: Run all source agents concurrently
    tasks = [
        Runner.run(youtube_agent, "Fetch latest AI news from YouTube"),
        Runner.run(google_agent, "Fetch latest AI news from Google"),
        Runner.run(forbes_agent, "Fetch latest AI news from Forbes"),
        Runner.run(wikipedia_agent, "Fetch AI-related information from Wikipedia")
    ]
    
    # Gather results concurrently and handle exceptions
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Step 2: Combine all outputs into a single content string
    combined_content = ""
    sources = ["YouTube", "Google", "Forbes", "Wikipedia"]
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            combined_content += f"\n[{sources[i]}] Error: {str(result)}\n"
        else:
            # Assuming each agent result has a final_output attribute
            combined_content += f"\n[{sources[i]}]\n{result.final_output}\n"
    
    # Step 3: Pass combined content to Writer Agent with a journalist perspective
    writer_instructions = f"""
    You are a professional news writer. You must:
    1. Take the combined content from YouTube, Google, Forbes, and Wikipedia.
    2. Write a coherent, detailed, and engaging news article.
    3. Include meta information for SEO: meta_title, meta_description, meta_image_prompt, alt_text, slug, and tags.
    4. Structure the article into headings and paragraphs for readability.
    5. Provide clear sources and links wherever possible.
    6. Maintain journalistic objectivity while summarizing key AI developments.
    Here is the combined content:\n{combined_content}
    """

    # Step 4: Run Writer Agent
    writer_result = await Runner.run(writer, writer_instructions, run_config=config)
    
    # Step 5: Print final output
    print("===== AI DESK NEWS OUTPUT =====")
    print(writer_result.final_output) 
# Run the AI Desk
if __name__ == "__main__":
    asyncio.run(ai_desk())
