from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
import os
from typing import Optional

router = APIRouter()

class CaptionPrompt(BaseModel):
    prompt: str
    image_description: Optional[str] = None
    additional_context: Optional[str] = None

class CaptionResponse(BaseModel):
    caption: str

@router.post("/generate", response_model=CaptionResponse)
async def generate_caption(prompt: CaptionPrompt):
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Build a more detailed prompt
        prompt_text = "Generate a creative and engaging social media caption"
        if prompt.image_description:
            prompt_text += f" for an image that shows: {prompt.image_description}"
        if prompt.additional_context:
            prompt_text += f"\nAdditional context: {prompt.additional_context}"
        prompt_text += f"\nMake it engaging and relevant to: {prompt.prompt}"
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": prompt_text
            }]
        )
        return CaptionResponse(caption=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 