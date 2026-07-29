# Use Node 20 Alpine as base image for a small footprint
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (use npm ci for production-like installs if package-lock is present, else npm install)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the default port the app listens on
EXPOSE 8080

# Define the default command to start the application
CMD ["node", "src/index.js"]
