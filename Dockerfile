# Step 1: Build frontend
FROM node:20 as build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build


# Step 2: Setup backend
FROM node:20

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install

COPY server/ ./

# Copy built frontend into backend
COPY --from=build /app/client/dist ../client/dist

EXPOSE 5000

CMD ["node", "index.js"]