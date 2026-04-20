# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Default port for Cloud Run is 8080, Nginx defaults to 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
