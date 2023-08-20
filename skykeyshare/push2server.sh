SERVER=sky00
TARBALL="web-build.tar.gz"
if [ -z "$1" ]
    then
        ENV="prod"
        DIR=/opt/skycastle-app/
else
    ENV="$1"
    DIR=/opt/stage/skycastle-app/
fi

echo "Doing a $ENV build"
cp $ENV.env .env # make prod .env before build
expo build:web -c
tar -cf $TARBALL web-build

echo "Pushing to $SERVER:$DIR"
scp $TARBALL $SERVER:$DIR
ssh sky00 "cd $DIR; tar -xf $TARBALL --warning=no-timestamp; rm -rf public $TARBALL; mv web-build public;"
cp local.env .env # reset to dev
rm $TARBALL