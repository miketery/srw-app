#!/bin/bash
# PROD_SERVER=arxsky.com
TARBALL="web-build.tar.gz"

DEV_SERVER=arx.dev
DEV_DIR=/opt/app.ssi.arxsky.dev/

function build_and_tar {
    expo build:web
    tar -cf $TARBALL web-build
}
function push_to_server {
    echo "Pushing to \"$1:$2\""
    ssh $1 "mkdir -p $2"
    scp $TARBALL $1:$2
    ssh $1 "cd $2; tar -xf $TARBALL --warning=no-timestamp; rm -rf public $TARBALL; mv web-build public; chown -R nginx:nginx $2;"
    rm $TARBALL
}
function reset_local_env {
    cp local.env .env
}
function help {
  echo "Usage: $0 {dev}"
  echo "  dev - push to $DEV_SERVER:$DEV_DIR"
}
if [ $# -eq 0 ]; then
  help && exit 1
fi

if [ $1 == "dev" ]; then
    echo "Doing a \"DEV\" build"
    cp dev.env .env
    build_and_tar
    push_to_server $DEV_SERVER $DEV_DIR
else
    echo "no other settings atm"
    # ENV="$1"
    # DIR=/opt/stage/skycastle-app/
fi
reset_local_env
