SERVER=arx.dev # use ~/.ssh/config alias
TARBALL="srw-app-build.tar.gz"
ENV=dev
DIR=/opt/app.srw.arxsky.dev/ # server dir
# if [ -z "$1" ]
#     then
#         ENV="prod"
#         DIR=/opt/srw-app/
# else
#     ENV="$1"
#     DIR=/opt/stage/skycastle-app/
# fi

# Environment variables
cp .env tmp.current.env
echo "Doing a $ENV build"
cp $ENV.env .env # make prod .env before build

# Build
expo build:web -c

# custom page to show multiple app screens
cp webtestpages/multi_app.html web-build/multi_app.html

# hack to make web dark mode...
sed -i 's/<html lang="en">/<html lang="en" style="color-scheme: dark;">/' web-build/index.html

# Tar and push to server
tar -cf $TARBALL web-build
echo "Pushing to $SERVER:$DIR"
ssh $SERVER "mkdir -p $DIR"
scp $TARBALL $SERVER:$DIR

# Unpack new version on server
ssh $SERVER "cd $DIR; tar -xf $TARBALL --warning=no-timestamp; rm -rf public $TARBALL; mv web-build public;"

# Reset env and cleanup
cp tmp.current.env .env
rm tmp.current.env $TARBALL
echo "Done..."
