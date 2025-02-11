# Social Media Content Scheduler

A full-stack application for scheduling and managing social media content, featuring AI-powered video generation, image processing, and content scheduling.

## Features

- AI-powered video generation from images using Leonardo.ai
- Image processing and management
- Content scheduling and calendar integration
- Caption generation using OpenAI GPT-4
- Modern React-based UI with Material-UI components

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.8 or higher
- Node.js 14.x or higher
- npm 6.x or higher
- FFmpeg (required for video processing)

## Project Structure

```
socialScheduler/
├── backend/         # FastAPI backend
├── frontend/        # React frontend
```

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- On Windows:
```bash
.\venv\Scripts\activate
```
- On macOS/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
LEONARDO_API_KEY=your_leonardo_api_key
DATABASE_URL=sqlite:///./app.db
```

6. Run the backend server:
```bash
uvicorn main:app --reload --port 5000
```

The backend will be available at `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:5000/docs`
- ReDoc: `http://localhost:5000/redoc`

## Features and Endpoints

### Backend APIs:
- `/api/video/generate` - Generate motion videos from images
- `/api/image/generate` - Generate images using AI
- `/api/caption/generate` - Generate captions using GPT-4
- `/api/calendar/posts` - Manage scheduled posts

### Frontend Features:
- Calendar view for content scheduling
- Image and video upload/generation
- Caption generation and editing
- Post scheduling and management

## Development

- Backend is built with FastAPI and uses SQLAlchemy for database operations
- Frontend is built with React and Material-UI
- Video processing uses moviepy and FFmpeg
- AI features powered by OpenAI and Leonardo.ai

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key
LEONARDO_API_KEY=your_leonardo_api_key
DATABASE_URL=sqlite:///./app.db
```

### Frontend
The frontend uses a proxy configuration to communicate with the backend (already configured in package.json)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 