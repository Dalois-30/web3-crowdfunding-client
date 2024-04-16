# syntax=docker/dockerfile:1

# ARG NODE_VERSION=18.15.0
# FROM node:${NODE_VERSION}-alpine as base
FROM node:18.15.0-alpine as base
WORKDIR /usr/src/app

# Copying package.json and package-lock.json separately to leverage Docker caching
COPY package*.json ./
RUN npm ci 

# Copying the rest of the application
COPY . .

# Building the React application
RUN npm run build

# Stage 2 - Build the final image
FROM nginx:alpine

RUN rm -rf *

# Copying the build files from the previous stage
COPY --from=base /usr/src/app/dist /usr/share/nginx/html

# Exposing port 80 for Nginx
EXPOSE 80
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
# Nginx is configured to run automatically in the nginx:alpine image
