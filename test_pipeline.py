"""
Test script to verify AI Desk agent pipeline
"""
import asyncio
import json
from ai_desk_agents import ai_desk

async def test_pipeline():
    print("=" * 60)
    print("Testing AI Desk Agent Pipeline")
    print("=" * 60)
    
    print("\n1. Running ai_desk() to generate articles...")
    try:
        articles = await ai_desk()
        print(f"✓ Generated {len(articles)} articles")
        
        if len(articles) == 0:
            print("⚠ WARNING: No articles generated!")
            return
        
        print("\n2. Checking article structure...")
        for i, article in enumerate(articles[:3], 1):  # Check first 3
            print(f"\n   Article {i}:")
            print(f"   - Title: {article.get('meta_title', 'MISSING')[:60]}...")
            print(f"   - Slug: {article.get('slug', 'MISSING')}")
            print(f"   - Tags: {article.get('tags', [])}")
            print(f"   - Sources: {len(article.get('source_links', []))}")
            print(f"   - Videos: {len(article.get('video_links', []))}")
            print(f"   - Images: {len(article.get('images', []))}")
            print(f"   - Content sections: {len(article.get('content', []))}")
            
            # Check required fields
            required = ['meta_title', 'meta_description', 'slug', 'tags', 'content']
            missing = [f for f in required if f not in article]
            if missing:
                print(f"   ⚠ Missing fields: {missing}")
            else:
                print(f"   ✓ All required fields present")
        
        print("\n3. Testing deduplication...")
        titles = [a.get('meta_title', '') for a in articles]
        unique_titles = set(titles)
        print(f"   - Total articles: {len(articles)}")
        print(f"   - Unique titles: {len(unique_titles)}")
        if len(titles) > len(unique_titles):
            print(f"   ⚠ Found {len(titles) - len(unique_titles)} duplicate titles")
        else:
            print(f"   ✓ No duplicate titles found")
        
        print("\n4. Sample article JSON:")
        print(json.dumps(articles[0], indent=2)[:500] + "...")
        
        print("\n" + "=" * 60)
        print("✓ Pipeline test complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_pipeline())
