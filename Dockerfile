# # # syntax=docker/dockerfile:1

# # # ARG NODE_VERSION=18.15.0
# # # FROM node:${NODE_VERSION}-alpine as base
FROM node:18.15.0-alpine as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application source code into the container
COPY . .

# Build the React application for production
RUN npm run build

# Use Nginx as the production server
FROM nginx:alpine

# Copy the built React application into the Nginx server directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container is run
CMD ["nginx", "-g", "daemon off;"]
