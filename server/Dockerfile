FROM node:alpine
WORKDIR /app
COPY package.json .
RUN npm install && npm install -g typescript
COPY . .
RUN tsc
EXPOSE 4000
CMD ["node", "index.js"]
