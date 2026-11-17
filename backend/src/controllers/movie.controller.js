const movieService = require('../services/movie.service');

exports.search = async (req, res, next) => {
  try {
    const { q, page } = req.query;
    if (!q) return res.status(400).json({ success: false, error: { code: 'QUERY_REQUIRED', message: 'Provide ?q= search query' } });
    const data = await movieService.searchMovies(q, Number(page || 1));
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.details = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    if (!['movie', 'tv'].includes(type)) return res.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'type must be movie or tv' } });
    const data = await movieService.getDetails(type, id);
    const providers = movieService.buildProviderLinks(id, type);
    res.json({ success: true, data: { ...data, sinhalaSubtitleLinks: providers, legalProviders: providers } });
  } catch (e) { next(e); }
};

exports.trending = async (req, res, next) => {
  try {
    const data = await movieService.getTrending(Number(req.query.page || 1));
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.episodes = async (req, res, next) => {
  try {
    const data = await movieService.getEpisodes(req.params.tvId, Number(req.query.season || 1));
    res.json({ success: true, data });
  } catch (e) { next(e); }
};
