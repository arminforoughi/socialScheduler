import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Dialog, TextField, Button, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const PostingCalendar = () => {
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    frequency: 'weekly',
    scheduledDate: new Date()
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/calendar/posts');
      setEvents(response.data.map(post => ({
        title: post.title,
        start: new Date(post.scheduledDate),
        end: new Date(post.scheduledDate),
        resource: post
      })));
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/calendar/posts', newPost);
      setOpenDialog(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div style={{ height: '500px' }}>
      <Button 
        variant="contained" 
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: '20px' }}
      >
        Create New Post
      </Button>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ margin: '50px' }}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <TextField
            label="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Content"
            value={newPost.content}
            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <Select
            value={newPost.frequency}
            onChange={(e) => setNewPost({...newPost, frequency: e.target.value})}
            fullWidth
            margin="normal"
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
          <Button type="submit" variant="contained" color="primary">
            Create Post
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

export default PostingCalendar; 