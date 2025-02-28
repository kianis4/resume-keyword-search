// lib/openaiClient.js

import OpenAI from 'openai';

const openai = new OpenAI({
  // This should match your actual environment variable name
  apiKey: process.env.OPENAI_API_KEY,
  // Optional: set organization or other options here
  // organization: "org-...etc..."
});

export default openai;
