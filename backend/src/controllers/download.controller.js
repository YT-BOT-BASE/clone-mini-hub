const downloadService = require('../services/download.service');

const PLATFORM_LABELS = {
  youtube: 'YouTube', tiktok: 'TikTok', facebook: 'Facebook', instagram: 'Instagram',
  pinterest: 'Pinterest', twitter: 'Twitter / X', mediafire: 'MediaFire', drive: 'Google Drive',
};

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

// Dedicated per-platform handlers: /api/download/youtube, /tiktok, /facebook ...
exports.platform = (name) => async (req, res, next) => {
  try {
    const url = req.query.url || req.body?.url;
    if (!url) return res.status(400).json({ success: false, error: { code: 'URL_REQUIRED', message: `Provide ?url= parameter (${PLATFORM_LABELS[name]} link)` } });
    const detected = downloadService.detectSource(url);
    if (detected !== name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WRONG_PLATFORM',
          message: `This endpoint only accepts ${PLATFORM_LABELS[name]} URLs. Use /api/download/${detected || 'all'} for this link.`,
        },
      });
    }
    const info = await downloadService.getDownloadInfo(url, {
      videoQuality: req.query.quality || req.body?.quality || '720',
      downloadMode: req.query.mode || 'auto',
    });
    res.json({ success: true, data: { platform: PLATFORM_LABELS[name], ...info } });
  } catch (e) { next(e); }
};

exports.platforms = async (req, res) => {
  res.json({
    success: true,
    data: {
      platforms: Object.entries(PLATFORM_LABELS).map(([key, label]) => ({
        key, name: label, endpoint: `/api/download/${key}`,
      })),
      allInOne: '/api/download/all',
    },
  });
};

exports.sources = async (req, res) => {
  res.json({ success: true, data: { supported: downloadService.SUPPORTED } });
};
