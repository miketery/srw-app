#!/bin/bash

# install script for Centos 8, at the time of creating it there is no official uwsgi packages available
# for this OS version so we use 3rd party
#
# 1. run as root from /root/docs directory or change the dir below
# 2. certificate files are empty, need to be filled with the current certificate and key before running this script
# 3. whiteops-multi.crt needs to be all-in-one file, so ca-bundle must be in it as well
# 4. for git pulls to work your ssh key has to be on gitlab (and have access to the projects) and have to be forwarded to the box you are setting up

DIR=/root/tmp_files
USER=alice
PROJECT=ssi.arxsky.dev
GITUSER=miketery
GITPROJECT=ssi-ttp
BRANCH=dev
CERTBOT_EMAIL=michael@arxsky.dev


function seperator {
  echo "=================================="
}
function my_log {
  echo "[$PROJECT] $1"
}
seperator
my_log "installing $PROJECT Django Python Backend."
my_log "CentOS 9, nginx, uwsgi, python3, django"

function install_os_packages {
  seperator
  my_log "installing OS packages: epel-rlease, wget, firewalld, git, gcc, nginx, rsync, net-tools, bind-utils"
  dnf update -y
  dnf install epel-release wget firewalld nginx rsync net-tools -y
  dnf install git gcc -y
  dnf install net-tools bind-utils -y
}
function install_python {
  seperator
  my_log "installing python3, pip, virtualenv"
  # wget -nc https://centos.pkgs.org/9-stream/centos-crb-x86_64/python3-wheel-0.36.2-7.el9.noarch.rpm.html
  # pip install --upgrade pip wheel
  dnf --enablerepo=crb install python3-wheel -y
  dnf install python3 python3-pip -y
  dnf install python3-virtualenv -y
}
function install_uwsgi_python {
  seperator
  my_log "From https://cbs.centos.org/kojifiles/packages/uwsgi/2.0.18/16.el9s/x86_64/"
  my_log "----installing: uwsgi, uwsgi-plugin-common, uwsgi-plugin-python3, uwsgi-logger-file"
  cd $DIR
  wget -nc https://cbs.centos.org/kojifiles/packages/uwsgi/2.0.18/16.el9s/x86_64/uwsgi-2.0.18-16.el9s.x86_64.rpm
  wget -nc https://cbs.centos.org/kojifiles/packages/uwsgi/2.0.18/16.el9s/x86_64/uwsgi-plugin-common-2.0.18-16.el9s.x86_64.rpm
  wget -nc https://cbs.centos.org/kojifiles/packages/uwsgi/2.0.18/16.el9s/x86_64/uwsgi-plugin-python3-2.0.18-16.el9s.x86_64.rpm
  wget -nc https://cbs.centos.org/kojifiles/packages/uwsgi/2.0.18/16.el9s/x86_64/uwsgi-logger-file-2.0.18-16.el9s.x86_64.rpm

  dnf install ./uwsgi-2.0.18-16.el9s.x86_64.rpm --allowerasing -y
  dnf install ./uwsgi-plugin-common-2.0.18-16.el9s.x86_64.rpm -y
  dnf install ./uwsgi-plugin-python3-2.0.18-16.el9s.x86_64.rpm -y
  dnf install ./uwsgi-logger-file-2.0.18-16.el9s.x86_64.rpm -y

  touch /var/log/$PROJECT.uwsgi.log
  chown -R uwsgi:uwsgi /var/log/$PROJECT.uwsgi.log

  systemctl enable uwsgi
}
function add_keys {
  seperator
  my_log "adding keys for github"
  if [ ! -d "/root/.ssh" ]; then
    my_log "no .ssh dir, making one..."
    mkdir /root/.ssh && chmod 644 /root/.ssh
  fi

  # copy github keys
  cp $DIR/keys/* /root/.ssh/.
  chmod 600 /root/.ssh/github_ed25519
  chmod 644 /root/.ssh/github_ed25519.pub
}
function add_users {
  # user where project will live
  seperator
  my_log "adding user: uwsgi & $USER"
  if id uwsgi &>/dev/null; then
    my_log "user \"uwsgi\" already exists"
  else
    my_log "making user \"uwsgi\""
    adduser -r -s /sbin/nologin uwsgi
  fi
  if id $USER &>/dev/null; then
    my_log "user \"$USER\" already exists"
  else
    my_log "making user \"$USER\""
    adduser $USER
    chmod 755 /home/$USER
  fi
}
function uwsgi_nginx_move_configs {
  cd $DIR
  cp ./$PROJECT.conf /etc/nginx/conf.d/
  cp ./$PROJECT.uwsgi.ini /etc/uwsgi.d/
  chown -R uwsgi:uwsgi /etc/uwsgi.d/
}
function restart_services {
  seperator
  my_log "restarting services: firewalld, nginx, uwsgi"
  systemctl restart firewalld
  systemctl restart uwsgi
  systemctl restart nginx
  # systemctl restart crond
}
function start_service {
  my_log "starting service: $1"
  if systemctl is-active --quiet $1; then
    my_log "$1 is already running"
  else
    systemctl start $1
  fi
}
function start_services {
  seperator 
  my_log "starting services: firewalld, nginx, uwsgi"
  start_service firewalld
  start_service nginx
  start_service uwsgi
}
function install_certbot {
  seperator
  my_log "installing certbot"
  dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm -y
  dnf install certbot python3-certbot-nginx -y
}
function run_certbot {
  seperator
  my_log "running certbot"
  certbot --nginx -m $CERTBOT_EMAIL --agree-tos -d arxsky.dev --non-interactive
  certbot --nginx -m $CERTBOT_EMAIL --agree-tos -d ssi.arxsky.dev --non-interactive
  certbot --nginx -m $CERTBOT_EMAIL --agree-tos -d app.ssi.arxsky.dev --non-interactive
  certbot --nginx -m $CERTBOT_EMAIL --agree-tos -d api.ssi.arxsky.dev --non-interactive
}
function add_firewall_rules {
  firewall-cmd --zone=public --permanent --add-service=https
  firewall-cmd --zone=public --permanent --add-service=http
  # firewall-cmd --add-port=3031/tcp --permanent
  firewall-cmd --reload
  systemctl enable nginx
}
function clone_project {
  cd /home/$USER
  ssh-keyscan github.com >>/root/.ssh/known_hosts
  ssh-agent bash -c "ssh-add /root/.ssh/github_ed25519; git clone -b $BRANCH git@github.com:$GITUSER/$GITPROJECT.git $PROJECT"
}
function copy_db {
  cp $DIR/db.sqlite3 /home/$USER/$PROJECT/mysite/
}

function update_premissions {
  chown -R $USER:uwsgi /home/$USER/$PROJECT
  chmod 775 /home/$USER/$PROJECT/mysite
  chmod 660 /home/$USER/$PROJECT/mysite/db.sqlite3
  # su - $USER -c "cd $PROJECT && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && deactivate"
}
function create_python_venv {
  my_log "create_python_venv"
  su - $USER -c "cd $PROJECT && python3 -m venv venv"
}
function install_python_dependencies {
  my_log "install_python_dependencies"
  su - $USER -c "cd $PROJECT && source venv/bin/activate && pip install django django-cors-headers django-extensions djangorestframework djoser && deactivate"
}

function collect_staticfiles {
  cd /home/$USER/$PROJECT
  source venv/bin/activate
  cd mysite
  python manage.py collectstatic --noinput
  deactivate
}
function update_project {
  cd /home/$USER/$PROJECT
  ssh-keyscan github.com >>/root/.ssh/known_hosts
  ssh-agent bash -c "ssh-add /root/.ssh/github_ed25519; cd /home/$USER/$PROJECT && git pull"
  collect_staticfiles
  update_premissions
}

function install_project {
  my_log "install_project"
  clone_project
  copy_db
  create_python_venv
  install_python_dependencies
  collect_staticfiles
  update_premissions
}
function install_system {
  # on first boot / droplet created
  my_log "install_system"
  install_os_packages
  install_python
  add_user
  install_uwsgi_python
  install_certbot
  add_firewall_rules
  add_keys
  start_services
}
# sestatus
# se permissive?
# se disable?

function help {
  echo "Usage: $0 {full|update|simple}"
  echo "  full - install system, and project"
  echo "  install - install project only"
  echo "  reinstall - reinstall project"
  echo "  update - update project, restart services"
  echo "  configs - copy configs, restart services"
  echo "  certbot - run certbot"
  exit 1
}

if [ $# -eq 0 ]; then
  help && exit 1
fi

if [ $1 == "full" ]; then
  my_log "full install"
  install_system
  install_project
  # uwsgi_nginx_move_configs
  run_certbot
  restart_services
elif [ $1 == "update" ]; then
  my_log "update project (pull and collectstatic) & restart services"
  update_project
  # uwsgi_nginx_move_configs
  restart_services
elif [ $1 == "install" ]; then
  my_log "project install"
  install_project
  # uwsgi_nginx_move_configs
  restart_services
elif [ $1 == "reinstall" ]; then
  my_log "project reinstall"
  rm -rf /home/$USER/$PROJECT
  install_project
  # uwsgi_nginx_move_configs
  restart_services
elif [ $1 == "configs" ]; then
  my_log "move configs"
  uwsgi_nginx_move_configs
  restart_services
elif [ $1 == "certbot" ]; then
  my_log "certbot only"
  run_certbot
else
  help && exit 1
fi
