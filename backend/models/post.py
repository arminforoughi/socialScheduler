from sqlalchemy import Column, Integer, String, DateTime, Enum
from database import Base
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# SQLAlchemy Model
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    scheduled_date = Column(DateTime)
    frequency = Column(Enum("daily", "weekly", "monthly", name="frequency_types"))
    caption = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    image_description = Column(String, nullable=True)
    status = Column(Enum("draft", "scheduled", "published", name="status_types"), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic models for API
class PostBase(BaseModel):
    title: str
    content: str
    scheduled_date: datetime
    frequency: str
    caption: Optional[str] = None
    image_url: Optional[str] = None
    image_description: Optional[str] = None
    status: str = "draft"

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    frequency: Optional[str] = None
    caption: Optional[str] = None
    image_url: Optional[str] = None
    image_description: Optional[str] = None
    status: Optional[str] = None

class PostResponse(PostBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 