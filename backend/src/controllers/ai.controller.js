const aiService = require('../services/ai.service');

exports.chat = async (req, res, next) => {
  try {
    const { messages, model } = req.body;
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ success: false, error: { code: 'MESSAGES_REQUIRED', message: 'Provide messages array' } });
    const data = await aiService.chat({ messages, model });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.generate = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: { code: 'PROMPT_REQUIRED', message: 'Provide prompt' } });
    const data = await aiService.generateText(prompt);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.translate = async (req, res, next) => {
  try {
    const { text, targetLang } = req.body;
    if (!text) return res.status(400).json({ success: false, error: { code: 'TEXT_REQUIRED', message: 'Provide text' } });
    const data = await aiService.translate(text, targetLang || 'en');
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.summarize = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: { code: 'TEXT_REQUIRED', message: 'Provide text' } });
    const data = await aiService.summarize(text);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.image = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: { code: 'PROMPT_REQUIRED', message: 'Provide prompt' } });
    const data = await aiService.generateImage(prompt);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.tts = async (req, res, next) => {
  try {
    const { text, voice } = req.body;
    if (!text) return res.status(400).json({ success: false, error: { code: 'TEXT_REQUIRED', message: 'Provide text' } });
    const { audio, contentType } = await aiService.textToSpeech(text, voice);
    res.set('Content-Type', contentType);
    res.set('Content-Disposition', 'inline; filename="speech.mp3"');
    res.send(audio);
  } catch (e) { next(e); }
};

exports.stt = async (req, res, next) => {
  try {
    await aiService.speechToText();
  } catch (e) { next(e); }
};
