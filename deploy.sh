#!/bin/bash

zip -r dist/app.zip src/
aws s3 cp dist/app.zip s3://mta-live-node --profile home

