import React from 'react';
import { Container, Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import PostingCalendar from './components/Calendar/PostingCalendar';
import CaptionGenerator from './components/CaptionGenerator/CaptionGenerator';
import ImageGenerator from './components/ImageGenerator/ImageGenerator';
import VideoGenerator from './components/VideoGenerator/VideoGenerator';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: '20px' }}>
      {value === index && children}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container>
      <Box sx={{ width: '100%', marginTop: '20px' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleChange} centered>
            <Tab label="Calendar" />
            <Tab label="Caption Generator" />
            <Tab label="Image Generator" />
            <Tab label="Video Generator" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <PostingCalendar />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <CaptionGenerator />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <ImageGenerator />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <VideoGenerator />
        </TabPanel>
      </Box>
    </Container>
  );
}

export default App; 