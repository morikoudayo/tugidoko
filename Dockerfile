FROM node:24-bookworm AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM cgr.dev/chainguard/nginx:latest

COPY --from=builder /usr/src/app/dist/ /etc/nginx/html/
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
