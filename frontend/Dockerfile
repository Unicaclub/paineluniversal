# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Debug: List files to verify structure
RUN echo "=== Listing source structure ===" && \
    find src -type f -name "*.ts" -o -name "*.tsx" | head -20

# Debug: Check if specific files exist
RUN echo "=== Checking specific files ===" && \
    ls -la src/lib/ && \
    ls -la src/components/ui/ | head -10

# Build arguments (Railway will pass these via environment)
ARG VITE_API_URL
ARG VITE_MEEP_API_URL  
ARG VITE_WS_URL

# Set environment variables for build with defaults
ENV VITE_API_URL=${VITE_API_URL:-https://backend-painel-universal-production.up.railway.app}
ENV VITE_MEEP_API_URL=${VITE_MEEP_API_URL:-https://meep-service-production.up.railway.app}
ENV VITE_WS_URL=${VITE_WS_URL:-wss://backend-painel-universal-production.up.railway.app}
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
