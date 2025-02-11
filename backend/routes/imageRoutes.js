const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

router.post('/generate', async (req, res) => {
  try {
    const response = await openai.images.generate({
      prompt: req.body.prompt,
      n: 2,
      size: "1024x1024"
    });

    res.json({ images: response.data.map(img => img.url) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 