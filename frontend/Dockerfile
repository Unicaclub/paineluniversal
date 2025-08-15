# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Railway production
ARG VITE_API_URL=https://backend-painel-universal-production.up.railway.app
ARG VITE_MEEP_API_URL=https://meep-service-production.up.railway.app
ARG VITE_WS_URL=wss://backend-painel-universal-production.up.railway.app

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MEEP_API_URL=$VITE_MEEP_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV NODE_ENV=production

# Build the application with verbose output
RUN echo "Starting build process..." && \
    npm run build --verbose && \
    echo "Build completed successfully!" && \
    ls -la dist/

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Create a simple startup script inline
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "🚀 Starting Frontend..."' >> /start.sh && \
    echo 'if [ -n "$PORT" ]; then' >> /start.sh && \
    echo '  echo "📝 Configuring port $PORT..."' >> /start.sh && \
    echo '  sed -i "s/listen 3000/listen $PORT/g" /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo 'echo "✅ Starting nginx..."' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose port (Railway will override with PORT env var)
EXPOSE 3000

# Health check - verificar se nginx está respondendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start with custom script
CMD ["/start.sh"]
