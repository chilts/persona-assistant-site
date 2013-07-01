#!/bin/bash
## ----------------------------------------------------------------------------
#
# Note: don't use this script (please see the readme.md).
#
## ----------------------------------------------------------------------------

set -e

echo "Fetching new changes ..."
git pull --rebase
echo

echo "Calling install.sh ..."
./scripts/install.sh
echo

echo
echo "Done"

## ----------------------------------------------------------------------------
