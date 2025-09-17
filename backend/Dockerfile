# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy configuration files
COPY --from=builder /app/sequelize.config.cjs ./
COPY --from=builder /app/src/config ./src/config

# Create uploads directory
RUN mkdir -p uploads/products

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
