# syntax=docker/dockerfile:1
FROM node:24-bookworm AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

RUN npm run build

FROM cgr.dev/chainguard/nginx:latest

COPY --from=builder /usr/src/app/dist/ /etc/nginx/html/
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80