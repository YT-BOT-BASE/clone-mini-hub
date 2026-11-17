const downloadService = require('../services/download.service');

exports.info = async (req, res, next) => {
  try {
    const url = req.query.url || req.body?.url;
    if (!url) return res.status(400).json({ success: false, error: { code: 'URL_REQUIRED', message: 'Provide ?url= parameter' } });
    const info = await downloadService.getDownloadInfo(url, {
      videoQuality: req.query.quality || req.body?.quality || '720',
      downloadMode: req.query.mode || 'auto',
    });
    res.json({ success: true, data: info });
  } catch (e) { next(e); }
};

exports.sources = async (req, res) => {
  res.json({ success: true, data: { supported: downloadService.SUPPORTED } });
};
