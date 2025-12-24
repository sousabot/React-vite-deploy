FROM node:20-bookworm-slim

# Install ffmpeg + python/pip
RUN apt-get update && apt-get install -y --no-install-recommends \
  ffmpeg python3 python3-pip ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install yt-dlp (Debian bookworm blocks system pip without this flag)
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
