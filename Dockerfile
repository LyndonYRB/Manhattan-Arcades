# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.16.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Set working directory
WORKDIR /Manhattan-Arcades

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY --link package-lock.json package.json ./ 
RUN npm ci

# Copy application code
COPY --link . .

# Build React app (assuming it's in 'client' directory)
WORKDIR /Manhattan-Arcades/client
RUN npm install && npm run build

# Final stage for app image
FROM base

# Set working directory back to the project root
WORKDIR /Manhattan-Arcades

# Copy built React app from 'build' stage to 'client/build' in final image
COPY --from=build /Manhattan-Arcades/client/build /Manhattan-Arcades/client/build

# Install only production dependencies in final image
COPY --from=build /Manhattan-Arcades/package.json /Manhattan-Arcades/package-lock.json ./
RUN npm install --production

# Expose the necessary port
EXPOSE 5000

# Start the server by default
CMD [ "node", "server.js" ]
