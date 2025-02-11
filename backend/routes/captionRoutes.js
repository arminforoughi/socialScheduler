const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

router.post('/generate', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: `Generate a creative and engaging social media caption for: ${req.body.prompt}`
      }],
    });

    res.json({ caption: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 