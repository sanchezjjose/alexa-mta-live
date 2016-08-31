#!/bin/bash

zip -r App.zip .
aws s3 cp App.zip s3://mta-live-node --profile home

