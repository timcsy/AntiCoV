FROM nginx:alpine
LABEL Name=anticov-frontend Version=0.0.1
COPY ./public /usr/share/nginx/html
CMD ["nginx", "-g", "'daemon off;'"]
EXPOSE 80