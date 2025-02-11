from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List
import os
import aiohttp
import asyncio
from pathlib import Path
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, VideoFileClip, CompositeVideoClip, TextClip
import tempfile
import json
from PIL import Image
import io

router = APIRouter()

LEONARDO_API_KEY = "8551a780-ae33-4bcd-8ba8-3b0387323aa8"
LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1"

class VideoResponse(BaseModel):
    video_url: str

async def upload_to_leonardo(image_path: str) -> str:
    """Upload image to Leonardo.ai and return the image ID"""
    try:
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {LEONARDO_API_KEY}"
        }
        
        # Step 1: Get presigned URL
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{LEONARDO_API_URL}/init-image",
                headers=headers,
                json={"extension": "jpg"}
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    print(f"Leonardo API error getting presigned URL: {error_text}")
                    return None
                
                data = await response.json()
                print("Presigned URL response:", data)
                
                # Extract upload details
                upload_data = data['uploadInitImage']
                fields = json.loads(upload_data['fields'])
                url = upload_data['url']
                image_id = upload_data['id']
                
                # Step 2: Upload image to presigned URL
                # Read the entire file into memory first
                with open(image_path, 'rb') as f:
                    file_data = f.read()
                
                # Create form data with file content
                files = aiohttp.FormData()
                for key, value in fields.items():
                    files.add_field(key, value)
                
                # Add the file using the in-memory data
                files.add_field('file', 
                              file_data,
                              filename=os.path.basename(image_path),
                              content_type='image/jpeg')
                
                async with session.post(url, data=files) as upload_response:
                    if upload_response.status not in [200, 201, 204]:
                        error_text = await upload_response.text()
                        print(f"Error uploading to presigned URL: {error_text}")
                        return None
                    
                    return image_id
                    
    except Exception as e:
        print(f"Error uploading to Leonardo: {str(e)}")
        return None

async def generate_motion(image_id: str, motion_strength: int = 3) -> str:
    """Generate motion video using Leonardo.ai"""
    try:
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {LEONARDO_API_KEY}"
        }
        
        payload = {
            "imageId": image_id,
            "isInitImage": True,
            "motionStrength": motion_strength
        }
        
        print("Sending motion generation request:", payload)
        
        async with aiohttp.ClientSession() as session:
            # Start generation
            async with session.post(
                f"{LEONARDO_API_URL}/generations-motion-svd",
                headers=headers,
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    print(f"Leonardo API error: {error_text}")
                    return None
                    
                data = await response.json()
                print("Motion generation response:", data)
                generation_id = data['motionSvdGenerationJob']['generationId']
                
            # Poll for completion using the correct endpoint
            max_attempts = 120  # 10 minutes total
            attempts = 0
            
            while attempts < max_attempts:
                # Query the generation directly
                async with session.get(
                    f"{LEONARDO_API_URL}/generations/{generation_id}",
                    headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"Leonardo API error during polling: {error_text}")
                        return None
                        
                    data = await response.json()
                    print(f"Polling attempt {attempts + 1} - Raw response:", data)
                    
                    # Handle the nested response structure
                    generation_data = data.get('generations_by_pk', {})
                    
                    # Check for video URL in generated_images
                    generated_images = generation_data.get('generated_images', [])
                    for image in generated_images:
                        if image.get('motionMP4URL'):
                            return image['motionMP4URL']
                    
                    status = generation_data.get('status')
                    print(f"Current status: {status}")
                    
                    if status == 'COMPLETE':
                        print("Generation complete but no video URL found")
                        return None
                    elif status == 'FAILED':
                        print("Motion generation failed:", generation_data)
                        return None
                    elif status == 'PENDING' or status == 'IN_PROGRESS':
                        # Continue waiting
                        attempts += 1
                        await asyncio.sleep(10)  # 10 second delay between checks
                    else:
                        print(f"Unexpected status: {status}")
                        print("Full response:", generation_data)
                        return None
            
            print("Exceeded maximum polling attempts (10 minutes)")
            return None
            
    except Exception as e:
        print(f"Error generating motion: {str(e)}")
        return None

def validate_image(image_path: str) -> bool:
    """Validate image size and format"""
    try:
        with Image.open(image_path) as img:
            # Check format
            if img.format not in ['JPEG', 'PNG']:
                print(f"Unsupported image format: {img.format}")
                return False
                
            # Check size
            if img.size[0] > 4096 or img.size[1] > 4096:
                print(f"Image too large: {img.size}")
                return False
                
            # Check file size
            file_size = os.path.getsize(image_path) / (1024 * 1024)  # Size in MB
            if file_size > 10:
                print(f"File too large: {file_size}MB")
                return False
                
            return True
    except Exception as e:
        print(f"Error validating image: {str(e)}")
        return False

@router.post("/generate", response_model=VideoResponse)
async def generate_video(
    image_paths: List[str] = Form(...),
    duration_per_image: float = Form(3.0),
    caption: str = Form(...),
    audio_file: UploadFile = File(None),
    motion_strength: int = Form(3)
):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Process audio
            audio_path = None
            if audio_file:
                audio_path = os.path.join(temp_dir, "audio.mp3")
                with open(audio_path, "wb") as buffer:
                    content = await audio_file.read()
                    buffer.write(content)

            # Process each image with Leonardo.ai
            motion_clips = []
            for img_path in image_paths:
                full_path = os.path.join("static", *img_path.split("/static/")[1:])
                if os.path.exists(full_path) and validate_image(full_path):
                    # Upload image to Leonardo
                    image_id = await upload_to_leonardo(full_path)
                    if not image_id:
                        print(f"Failed to upload image: {full_path}")
                        continue
                        
                    print(f"Successfully uploaded image with ID: {image_id}")
                    
                    # Generate motion video
                    video_url = await generate_motion(image_id, motion_strength)
                    if not video_url:
                        print(f"Failed to generate motion for image: {image_id}")
                        continue
                        
                    print(f"Successfully generated video: {video_url}")
                    
                    # Download and save motion video
                    video_path = os.path.join(temp_dir, f"motion_{len(motion_clips)}.mp4")
                    async with aiohttp.ClientSession() as session:
                        async with session.get(video_url) as response:
                            if response.status != 200:
                                print(f"Failed to download video: {video_url}")
                                continue
                            with open(video_path, 'wb') as f:
                                f.write(await response.read())
                    motion_clips.append(video_path)

            if not motion_clips:
                raise HTTPException(status_code=400, detail="No valid motion videos generated")

            # Combine motion videos
            clips = [VideoFileClip(path).set_duration(duration_per_image) for path in motion_clips]
            final_clip = concatenate_videoclips(clips, method="compose")

            # Add caption
            if caption:
                text_clip = TextClip(
                    caption,
                    fontsize=30,
                    color='white',
                    font="Arial",
                    size=(final_clip.w, 100)
                ).set_duration(final_clip.duration)
                text_clip = text_clip.set_position(('center', 'bottom'))
                final_clip = CompositeVideoClip([final_clip, text_clip])

            # Add audio if provided
            if audio_path:
                audio = AudioFileClip(audio_path)
                if audio.duration < final_clip.duration:
                    audio = audio.loop(duration=final_clip.duration)
                else:
                    audio = audio.subclip(0, final_clip.duration)
                final_clip = final_clip.set_audio(audio)

            # Save final video
            output_dir = Path("static/videos")
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / f"video_{os.urandom(8).hex()}.mp4"

            final_clip.write_videofile(
                str(output_path),
                fps=30,
                codec='libx264',
                audio_codec='aac',
                bitrate="4000k"
            )

            # Clean up
            final_clip.close()
            if audio_path:
                audio.close()

            return VideoResponse(video_url=f"/static/videos/{output_path.name}")

    except Exception as e:
        print(e)
        print(f"Error generating video: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 