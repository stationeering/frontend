#!/bin/bash
npm run-script build
AWS_PROFILE=deploy aws s3 sync build/static/. s3://stationeering-app/static/ --cache-control max-age=31536000,public

ROOT_FILES=`find build/ -maxdepth 1 -type f`

for file in $ROOT_FILES; do
AWS_PROFILE=deploy aws s3 cp --cache-control max-age=120,no-cache,no-store,must-revalidate $file s3://stationeering-app/
done

AWS_PROFILE=deploy aws cloudfront create-invalidation --distribution-id=ETYAB7ZW9G4WW --paths="/*"
