from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel
from typing import List
import os
import openai
from pathlib import Path
import base64
import requests
import json

router = APIRouter()

class ImageResponse(BaseModel):
    images: List[str]

@router.post("/generate", response_model=ImageResponse)
async def generate_images(prompt: str = Form(...), n: int = Form(1)):
    """Generate images using DALL-E"""
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.images.generate(
            # model="dall-e-3",
            prompt=prompt,
            n=4,
            size="1024x1024"
        )

        # Create directory if it doesn't exist
        output_dir = Path("static/generated_images")
        output_dir.mkdir(parents=True, exist_ok=True)

        image_urls = []
        for i, image in enumerate(response.data):
            # Download the image
            image_url = image.url
            image_response = requests.get(image_url)
            
            if image_response.status_code == 200:
                # Generate unique filename
                filename = f"generated_{os.urandom(8).hex()}.png"
                image_path = output_dir / filename
                
                # Save the image
                with open(image_path, "wb") as f:
                    f.write(image_response.content)
                
                # Add to list of URLs
                image_urls.append(f"/static/generated_images/{filename}")

        return ImageResponse(images=image_urls)

    except Exception as e:
        print(f"Error generating images: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/local")
async def get_local_images():
    """Get list of locally stored images"""
    try:
        # Get all images from both directories
        generated_dir = Path("static/generated_images")
        uploaded_dir = Path("static/uploaded_images")
        
        image_urls = []
        
        # Get generated images
        if generated_dir.exists():
            for file in generated_dir.glob("*.png"):
                image_urls.append(f"/static/generated_images/{file.name}")
                
        # Get uploaded images
        if uploaded_dir.exists():
            for file in uploaded_dir.glob("*"):
                if file.suffix.lower() in ['.png', '.jpg', '.jpeg']:
                    image_urls.append(f"/static/uploaded_images/{file.name}")
        
        return {"images": sorted(image_urls)}
        
    except Exception as e:
        print(f"Error getting local images: {e}")
        raise HTTPException(status_code=500, detail=str(e))