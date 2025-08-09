const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests. Try again in 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});

app.use('/api/', limiter);
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/meep/cpf', require('./routes/cpf'));
app.use('/api/meep/checkin', require('./routes/checkin'));
app.use('/api/meep/validacao', require('./routes/validacao'));
app.use('/api/meep/analytics', require('./routes/analytics'));
app.use('/api/meep/equipamentos', require('./routes/equipamentos'));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'MEEP Events Service',
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        code: err.code || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 MEEP Service running on port ${PORT}`);
});

module.exports = app;
