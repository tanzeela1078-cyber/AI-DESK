"""
Simple test to check if agents can call their tools
"""
import asyncio
from agents import Runner
from ai_desk_agents import youtube_agent, google_agent, forbes_agent, wikipedia_agent, config

async def test_agents():
    print("Testing individual agents...\n")
    
    # Test YouTube agent
    print("1. Testing YouTube Agent...")
    try:
        result = await Runner.run(youtube_agent, "Fetch latest AI news from YouTube", run_config=config)
        print(f"✓ YouTube agent completed")
        print(f"Output preview: {result.final_output[:200]}...")
    except Exception as e:
        print(f"✗ YouTube agent error: {e}")
    
    # Test Google agent
    print("\n2. Testing Google Agent...")
    try:
        result = await Runner.run(google_agent, "Fetch latest AI news from Google", run_config=config)
        print(f"✓ Google agent completed")
        print(f"Output preview: {result.final_output[:200]}...")
    except Exception as e:
        print(f"✗ Google agent error: {e}")
    
    # Test Forbes agent
    print("\n3. Testing Forbes Agent...")
    try:
        result = await Runner.run(forbes_agent, "Fetch latest AI news from Forbes", run_config=config)
        print(f"✓ Forbes agent completed")
        print(f"Output preview: {result.final_output[:200]}...")
    except Exception as e:
        print(f"✗ Forbes agent error: {e}")
    
    # Test Wikipedia agent
    print("\n4. Testing Wikipedia Agent...")
    try:
        result = await Runner.run(wikipedia_agent, "Fetch AI-related information from Wikipedia", run_config=config)
        print(f"✓ Wikipedia agent completed")
        print(f"Output preview: {result.final_output[:200]}...")
    except Exception as e:
        print(f"✗ Wikipedia agent error: {e}")

if __name__ == "__main__":
    asyncio.run(test_agents())
