const axios = require('axios');
const { env } = require('../config/env');

function unavailable(service) {
  const err = new Error(`${service} is not configured. Set the required API key in backend/.env. This endpoint never returns fake data.`);
  err.code = 'SERVICE_UNAVAILABLE';
  err.statusCode = 503;
  return err;
}

async function chat({ messages, model }) {
  if (env.geminiApiKey) {
    const m = model || 'gemini-1.5-flash';
    const contents = (messages || []).map((x) => ({
      role: x.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: x.content }],
    }));
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${env.geminiApiKey}`,
      { contents },
      { timeout: 30000 }
    );
    const text = res.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    return { reply: text, provider: 'gemini', model: m };
  }
  if (env.openaiApiKey) {
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model || 'gpt-4o-mini',
      messages,
    }, { headers: { Authorization: `Bearer ${env.openaiApiKey}` }, timeout: 30000 });
    return { reply: res.data.choices[0].message.content, provider: 'openai', model: res.data.model };
  }
  throw unavailable('AI Chat');
}

async function generateText(prompt) {
  const { reply, provider, model } = await chat({ messages: [{ role: 'user', content: prompt }] });
  return { text: reply, provider, model };
}

async function translate(text, targetLang = 'en') {
  const { reply, provider } = await chat({
    messages: [{ role: 'user', content: `Translate the following text to language code "${targetLang}". Return only the translation:\n\n${text}` }],
  });
  return { translated: reply, provider };
}

async function summarize(text) {
  const { reply, provider } = await chat({
    messages: [{ role: 'user', content: `Summarize this text concisely:\n\n${text}` }],
  });
  return { summary: reply, provider };
}

// Image generation: returns provider URL only when a real provider is configured.
async function generateImage(prompt) {
  if (env.openaiApiKey) {
    const res = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'dall-e-3', prompt, n: 1, size: '1024x1024',
    }, { headers: { Authorization: `Bearer ${env.openaiApiKey}` }, timeout: 60000 });
    return { url: res.data.data[0].url, provider: 'openai' };
  }
  throw unavailable('AI Image Generation');
}

// TTS / STT require provider keys; return clear unavailable error instead of fake audio/text.
async function textToSpeech(text, voice = 'alloy') {
  if (env.openaiApiKey) {
    const res = await axios.post('https://api.openai.com/v1/audio/speech', {
      model: 'tts-1', voice, input: text, response_format: 'mp3',
    }, { headers: { Authorization: `Bearer ${env.openaiApiKey}` }, responseType: 'arraybuffer', timeout: 60000 });
    return { audio: Buffer.from(res.data), contentType: 'audio/mpeg', provider: 'openai' };
  }
  throw unavailable('Text to Speech');
}

async function speechToText() {
  throw unavailable('Speech to Text (configure a Whisper-compatible provider key)');
}

module.exports = { chat, generateText, translate, summarize, generateImage, textToSpeech, speechToText };
