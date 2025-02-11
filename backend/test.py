import openai
import os

print(os.getenv("OPENAI_API_KEY"))
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
response = client.images.generate(
    prompt="a beautiful sunset over a calm ocean",
    n=2,
    size="1024x1024"
)

print(response)