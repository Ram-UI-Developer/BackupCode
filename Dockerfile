# Stage 1: Build React App
FROM node:20.10.0-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm config set legacy-peer-deps true && npm install

# Increase the memory limit to avoid out of memory errors
ENV NODE_OPTIONS="--max_old_space_size=6096"

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm config set legacy-peer-deps true && npm run build

# Stage 2: Serve React App with Nginx
FROM nginx:alpine

# Copy built files from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
