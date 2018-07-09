#!/bin/bash
npm run-script build
AWS_PROFILE=deploy aws s3 sync build/. s3://stationeering.com/
AWS_PROFILE=deploy aws cloudfront create-invalidation --distribution-id=EC6V6Y638O5OD --paths="/*"
