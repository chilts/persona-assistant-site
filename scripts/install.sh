#!/bin/bash
## ----------------------------------------------------------------------------
#
# Note: don't use this script to install this example application. This is very
# specific to my own hosting requirements. If you'd like to run it however,
# just do:
#
# $ npm install
# $ node server.js http://localhost:8080/
#
# Then visit the site using: http://persona-assistant.localhost.chilts.org/
# which resolves to 127.0.0.1. ie. your own localhost.
#
## ----------------------------------------------------------------------------

set -e

## ----------------------------------------------------------------------------

THIS_USER=`id -un`
THIS_GROUP=`id -gn`
THIS_PWD=`pwd`
THIS_NODE=`which node`

## ----------------------------------------------------------------------------

echo "Installing npm packages ..."
npm install --production
echo

echo "Fetching the latest jquery.persona-assistant.js ..."
curl -s https://raw.github.com/chilts/jquery.persona-assistant.js/master/jquery.persona-assistant.js > public/s/js/jquery.persona-assistant.js
echo

echo "Setting up various directories ..."
sudo mkdir -p /var/log/persona-assistant/
sudo chown $THIS_USER:$THIS_GROUP /var/log/persona-assistant/
echo

echo "Copying proximity config ..."
sudo cp etc/proximity.d/persona-assistant /etc/proximity.d/
echo

echo "Copying upstart script ..."
m4 \
    -D  __USER__=$THIS_USER \
    -D __GROUP__=$THIS_GROUP \
    -D   __PWD__=$THIS_PWD   \
    -D  __NODE__=$THIS_NODE \
    etc/init/persona-assistant.conf.m4 | sudo tee /etc/init/persona-assistant.conf
echo

# restart the service
echo "Restarting services ..."
sudo service persona-assistant restart
sudo service proximity restart
echo

## ----------------------------------------------------------------------------
