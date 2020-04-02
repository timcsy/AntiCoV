#!/usr/bin/env sh

echo 'Start Frontend!'

chown root.root nginx
chmod 755 nginx
chmod u+s nginx
nginx -g 'daemon off;'