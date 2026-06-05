# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly using clean install
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the production application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from build stage to Nginx content directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000 to match the configuration
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
