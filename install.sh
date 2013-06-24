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

WHOAMI=`id -un`
GROUP=`id -gn`
PWD=`pwd`
NODE=`which node`

## ----------------------------------------------------------------------------

echo "Installing npm packages ..."
npm install
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
