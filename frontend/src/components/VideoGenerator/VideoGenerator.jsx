import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  CircularProgress,
  Slider,
  Box,
  IconButton,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const VideoGenerator = () => {
  const [availableImages, setAvailableImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [durationPerImage, setDurationPerImage] = useState(3);
  const [caption, setCaption] = useState('');
  const [motionStrength, setMotionStrength] = useState(3);

  useEffect(() => {
    fetchLocalImages();
  }, []);

  const fetchLocalImages = async () => {
    try {
      const response = await axios.get('/api/images/local');
      setAvailableImages(response.data.images.map((url, index) => ({
        id: index,
        url: url
      })));
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleImageSelect = (image) => {
    if (!selectedImages.find(img => img.id === image.id)) {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const handleImageRemove = (imageId) => {
    setSelectedImages(selectedImages.filter(img => img.id !== imageId));
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    setAudioFile(file);
  };

  const handleGenerateVideo = async () => {
    if (selectedImages.length === 0) {
      alert('Please select at least one image');
      return;
    }

    if (!caption.trim()) {
      alert('Please enter a caption for the video');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      selectedImages.forEach(image => {
        formData.append('image_paths', image.url);
      });
      formData.append('duration_per_image', durationPerImage);
      formData.append('caption', caption);
      formData.append('motion_strength', motionStrength);
      if (audioFile) {
        formData.append('audio_file', audioFile);
      }

      const response = await axios.post('/api/videos/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setGeneratedVideo(response.data.video_url);
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Error generating video');
    }
    setLoading(false);
  };

  return (
    <Paper style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>
        AI Video Generator
      </Typography>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          1. Select Images
        </Typography>
        <Grid container spacing={2}>
          {availableImages.map((image) => (
            <Grid item xs={6} sm={4} md={3} key={image.id}>
              <Card 
                onClick={() => handleImageSelect(image)}
                style={{ cursor: 'pointer' }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={image.url}
                  alt={`Image ${image.id}`}
                  style={{ objectFit: 'cover' }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {selectedImages.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            2. Selected Images (Click to remove)
          </Typography>
          <Grid container spacing={2}>
            {selectedImages.map((image, index) => (
              <Grid item xs={6} sm={4} md={3} key={image.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="160"
                    image={image.url}
                    alt={`Selected ${image.id}`}
                    style={{ objectFit: 'cover' }}
                  />
                  <IconButton
                    onClick={() => handleImageRemove(image.id)}
                    style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.8)' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          3. Enter Caption
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Enter a caption for your video..."
        />
      </Box>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          4. Duration per Image (seconds)
        </Typography>
        <Slider
          value={durationPerImage}
          onChange={(_, newValue) => setDurationPerImage(newValue)}
          min={1}
          max={10}
          step={0.5}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          5. Motion Strength
        </Typography>
        <Slider
          value={motionStrength}
          onChange={(_, newValue) => setMotionStrength(newValue)}
          min={1}
          max={5}
          step={1}
          marks
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => {
            const labels = {
              1: 'Subtle',
              2: 'Mild',
              3: 'Medium',
              4: 'Strong',
              5: 'Intense'
            };
            return labels[value];
          }}
        />
      </Box>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          6. Upload Background Music (optional)
        </Typography>
        <input
          accept="audio/*"
          type="file"
          onChange={handleAudioUpload}
          style={{ marginBottom: '20px' }}
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleGenerateVideo}
        disabled={loading || selectedImages.length === 0 || !caption.trim()}
        style={{ marginBottom: '20px' }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate AI Video'}
      </Button>

      {generatedVideo && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Generated Video
          </Typography>
          <video
            controls
            width="100%"
            style={{ maxWidth: '600px' }}
          >
            <source src={generatedVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Button
            variant="outlined"
            href={generatedVideo}
            download
            style={{ marginTop: '10px' }}
          >
            Download Video
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default VideoGenerator; 