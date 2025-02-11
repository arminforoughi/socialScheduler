import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Grid } from '@mui/material';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt) {
      alert('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('n', 1);  // Optional, defaults to 1

      const response = await axios.post('/api/images/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImages(response.data.images);
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Error generating images');
    }
    setLoading(false);
  };

  return (
    <Paper style={{ padding: '20px', maxWidth: '800px', margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>
        Image Generator
      </Typography>
      <TextField
        fullWidth
        label="Describe the image you want to create"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        margin="normal"
        multiline
        rows={3}
      />
      <Button
        variant="contained"
        onClick={handleGenerateImage}
        disabled={loading}
        style={{ marginTop: '20px' }}
      >
        Generate Image
      </Button>
      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        {images.map((image, index) => (
          <Grid item xs={6} key={index}>
            <img src={image} alt={`Generated ${index}`} style={{ width: '100%' }} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ImageGenerator; 