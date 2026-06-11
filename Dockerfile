FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG API_URL=http://localhost:8080
RUN sed -i "s|\${API_URL}|${API_URL}|g" src/environments/environment.ts
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/alfa-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
