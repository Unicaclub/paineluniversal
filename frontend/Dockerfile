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
ENV VITE_API_URL=${VITE_API_URL:-https://backend-painel-universal-production.up.railway.app}
ENV VITE_MEEP_API_URL=${VITE_MEEP_API_URL:-https://meep-service-production.up.railway.app}
ENV VITE_WS_URL=${VITE_WS_URL:-wss://backend-painel-universal-production.up.railway.app}
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage - use nginx alpine
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy only the built application (no package.json or node files)
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Start nginx explicitly
CMD ["nginx", "-g", "daemon off;"]
