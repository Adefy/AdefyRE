#!/bin/sh
exec grunt concat_in_order coffee
RESULT=$?
if [ $RESULT -ne 0 ]
  then
    exit 1
fi
