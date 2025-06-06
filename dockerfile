
FROM node:20-alpine3.17 as dev
WORKDIR /app
COPY package.json ./
RUN npm install
CMD [ "npm", "run", "start:dev" ]

FROM node:20-alpine3.17 as dev-deps
WORKDIR /app
COPY package.json package.json
RUN npm install --frozen-lockfile

FROM node:20-alpine3.17 as builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine3.17 as prod-deps
WORKDIR /app
COPY package.json package.json
RUN npm install --prod --frozen-lockfile

FROM node:20-alpine3.17 as prod
EXPOSE 3000
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/main.js" ]
