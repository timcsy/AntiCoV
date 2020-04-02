#!/usr/bin/env sh

echo 'Start Frontend!'

nginx -g 'daemon off;' &

echo 'Nginx started'