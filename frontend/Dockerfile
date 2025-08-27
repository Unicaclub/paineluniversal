# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build arguments (Railway will pass these via environment)
ARG VITE_API_URL
ARG VITE_MEEP_API_URL  
ARG VITE_WS_URL

# Set environment variables for build with defaults
ENV VITE_API_URL=${VITE_API_URL:-https://paineluniversal-backend-production.up.railway.app/api}
ENV VITE_MEEP_API_URL=${VITE_MEEP_API_URL:-https://meep-service-production.up.railway.app}
ENV VITE_WS_URL=${VITE_WS_URL:-wss://paineluniversal-backend-production.up.railway.app}
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy simple nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the built application
COPY --from=build /app/dist /usr/share/nginx/html

# Expose standard port
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
