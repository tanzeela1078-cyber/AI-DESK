import requests, os

url = "https://api.groq.com/openai/v1/models"
resp = requests.get(url, headers={
    "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"
})
print(resp.json())
