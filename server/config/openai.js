const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://ayush-mjprwu4d-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-5.2-chat/chat/completions?api-version=2024-12-01-preview',
  headers: {
    'Content-Type': 'application/json',
    'api-key': process.env.OPENAI_API_KEY,
  },
});

module.exports = openai;
