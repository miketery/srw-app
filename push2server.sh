SERVER=arx.dev
TARBALL="srw-app-build.tar.gz"
ENV=dev
DIR=/opt/app.srw.arxsky.dev/
# if [ -z "$1" ]
#     then
#         ENV="prod"
#         DIR=/opt/srw-app/
# else
#     ENV="$1"
#     DIR=/opt/stage/skycastle-app/
# fi

cp .env tmp.current.env
echo "Doing a $ENV build"
cp $ENV.env .env # make prod .env before build
expo build:web -c
cp webtestpages/multi_app.html web-build/multi_app.html
tar -cf $TARBALL web-build

echo "Pushing to $SERVER:$DIR"
ssh $SERVER "mkdir -p $DIR"
scp $TARBALL $SERVER:$DIR
ssh $SERVER "cd $DIR; tar -xf $TARBALL --warning=no-timestamp; rm -rf public $TARBALL; mv web-build public;"
cp tmp.current.env .env # reset env
rm tmp.current.env
rm $TARBALL