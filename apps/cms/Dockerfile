FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/cms/package.json ./apps/cms/

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

EXPOSE 3001

CMD ["pnpm", "dev:cms"]
