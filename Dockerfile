FROM cgr.dev/chainguard/nginx:latest

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./dist/ /etc/nginx/html/

EXPOSE 80
