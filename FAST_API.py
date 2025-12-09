from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ai_desk_agents import ai_desk
import json
import logging
from datetime import datetime, timezone

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Desk News API",
    description="API for generating AI news using multi-agent system",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to AI Desk News API v2.0. Visit /news to generate news."}


@app.get("/news")
async def get_news():
    """
    Trigger the AI Desk agents to fetch and generate news.
    Returns an array of news articles.
    """
    try:
        logger.info("Starting AI Desk news generation...")
        articles = await ai_desk()
        
        # Ensure each article has timestamp
        now_iso = datetime.now(timezone.utc).isoformat()
        for article in articles:
            if "timestamp" not in article:
                article["timestamp"] = now_iso
            if "published" not in article:
                article["published"] = now_iso
        
        logger.info(f"Generated {len(articles)} articles")
        return {"articles": articles}
            
    except Exception as e:
        logger.error(f"Error generating news: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}
