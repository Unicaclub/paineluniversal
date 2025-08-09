# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_URL=http://localhost:8000
ARG VITE_MEEP_API_URL=http://localhost:3001
ARG VITE_WS_URL=ws://localhost:8000

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MEEP_API_URL=$VITE_MEEP_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Build the application with verbose output
RUN echo "Starting build process..." && \
    npm run build --verbose && \
    echo "Build completed successfully!" && \
    ls -la dist/

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Add health check script
RUN echo '#!/bin/sh' > /health-check.sh && \
    echo 'curl -f http://localhost:3000/health || exit 1' >> /health-check.sh && \
    chmod +x /health-check.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /health-check.sh

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
