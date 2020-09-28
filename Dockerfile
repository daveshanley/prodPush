FROM nginx

COPY dist /usr/share/nginx/html

RUN nginx

EXPOSE 80
