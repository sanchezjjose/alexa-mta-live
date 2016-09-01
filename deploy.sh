#!/bin/bash

zip -r dist/app.zip src/*

aws lambda update-function-code --function-name alexa-mta-live --zip-file fileb://dist/app.zip --profile home
