import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const CaptionGenerator = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');

  useEffect(() => {
    fetchLocalImages();
  }, []);

  const fetchLocalImages = async () => {
    try {
      const response = await axios.get('/api/images/local');
      setImages(response.data.images.map((url, index) => ({
        id: index,
        image_url: url,
        title: `Image ${index + 1}`,
        image_description: `Local image ${index + 1}`
      })));
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const generateCaption = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/captions/generate', {
        prompt: `Generate a creative and engaging social media caption`,
        image_description: selectedImage.image_description,
        additional_context: additionalContext
      });
      setCaption(response.data.caption);
    } catch (error) {
      console.error('Error generating caption:', error);
    }
    setLoading(false);
  };

  return (
    <Paper style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>
        Caption Generator
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Select an Image
      </Typography>
      
      <Grid container spacing={2} style={{ marginBottom: '20px' }}>
        {images.map((image) => (
          <Grid item xs={12} sm={6} md={3} key={image.id}>
            <Card 
              onClick={() => setSelectedImage(image)}
              style={{ 
                cursor: 'pointer',
                border: selectedImage?.id === image.id ? '2px solid #1976d2' : 'none'
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={image.image_url}
                alt={image.title}
                style={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedImage && (
        <>
          <TextField
            fullWidth
            label="Additional Context or Requirements"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            margin="normal"
            multiline
            rows={2}
            placeholder="Add any specific requirements or context for the caption..."
          />

          <Button
            variant="contained"
            onClick={generateCaption}
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Caption'}
          </Button>

          {caption && (
            <Paper style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Generated Caption:
              </Typography>
              <Typography variant="body1">
                {caption}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigator.clipboard.writeText(caption)}
                style={{ marginTop: '10px' }}
              >
                Copy to Clipboard
              </Button>
            </Paper>
          )}
        </>
      )}
    </Paper>
  );
};

export default CaptionGenerator; 