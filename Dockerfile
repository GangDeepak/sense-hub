# Build stage
FROM node:20-alpine AS builder

# Bake the backend URL into the JS bundle at build time
# Override with: docker build --build-arg VITE_API_BASE_URL=https://... -t my-app .
ARG VITE_API_BASE_URL=https://chat-dashboard-ds-backend.azurewebsites.net
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage

FROM nginx:stable-alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]