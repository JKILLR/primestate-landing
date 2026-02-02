FROM node:20-alpine
WORKDIR /app
COPY package.json server.js ./
RUN mkdir -p /data
EXPOSE 3847
CMD ["node", "server.js"]
