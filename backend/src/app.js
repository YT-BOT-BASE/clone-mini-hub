const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./config/env');
const { maintenanceMode } = require('./middleware/maintenance');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const swaggerSpec = require('./docs/swagger');

const app = express();

// Security
app.set('trust proxy', 1); // Heroku / VPS behind proxy
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: [env.clientUrl, /\.e2b\.app$/], credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(passport.initialize());
if (env.nodeEnv !== 'production') app.use(morgan('dev'));

// Global rate limit
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } },
}));
// Stricter limit for auth endpoints
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts.' } },
}));

// Health check BEFORE maintenance
app.use('/api', require('./routes/status.routes'));

// Maintenance mode (public API calls blocked when enabled)
app.use('/api', maintenanceMode);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/keys', require('./routes/apiKey.routes'));
app.use('/api/download', require('./routes/download.routes'));
app.use('/api/movie', require('./routes/movie.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/utility', require('./routes/utility.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/s', require('./routes/utility.routes')); // short url redirect

// Swagger / OpenAPI documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'CLONE MINI HUB API Docs' }));
app.get('/api/openapi.json', (req, res) => res.json(swaggerSpec));

// Serve frontend build (production)
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) res.status(200).json({ success: true, message: 'CLONE MINI HUB API is running. Build the frontend to serve the website here.' });
  });
});

// Errors
app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
