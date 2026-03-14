#!/bin/bash
npm run fetch-swagger
npm run detect-auth
npm run generate-endpoints
npm run generate-workflows
npm run generate-scenerios

node generator/generate-payloads.js

k6 run k6/test.js