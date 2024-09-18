# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.16.0

# Stage 1: Base image
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Set working directory
WORKDIR /Manhattan-Arcades

# Set production environment
ENV NODE_ENV="production"

# Install dependencies
COPY package-lock.json package.json ./
RUN npm ci --production

# Stage 2: Build React app
FROM node:${NODE_VERSION}-slim as build

# Set working directory for React build
WORKDIR /Manhattan-Arcades/client

# Copy React app package.json and install dependencies
COPY client/package.json client/package-lock.json ./
RUN npm install

# Build the React app
COPY client/ ./
RUN npm run build

# Stage 3: Final production image
FROM base

# Copy built React app from the previous stage
COPY --from=build /Manhattan-Arcades/client/build /Manhattan-Arcades/client/build

# Copy the rest of the server code
COPY . .

# Expose the necessary port
EXPOSE 5000

# Start the server by default
CMD ["node", "server.js"]
