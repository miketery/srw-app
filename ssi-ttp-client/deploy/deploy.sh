#!/bin/bash

# prep files for upload
cp -R files tmp_files
cp ../mysite/db.sqlite3 ./tmp_files/
zip -r tmp_files.zip tmp_files

# upload
scp -r tmp_files.zip root@arx.dev:/root/

# run remote install script
ssh root@arx.dev "unzip tmp_files.zip && chmod 700 tmp_files/install.sh"
# ssh root@eucxy.com "unzip tmp_files.zip && chmod 700 tmp_files/install.sh && ./tmp_files/install.sh && cd ~ && rm -rf tmp_files && rm -f tmp_files.zip"
rm -r tmp_files.zip tmp_files
