FROM node:20-alpine

# Container working directory.
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm install

# Copy the app source and build the client bundle.
COPY . .
RUN npm run build

# Express listens on 8080 by default.
EXPOSE 8080
CMD ["node", "server.js"]
