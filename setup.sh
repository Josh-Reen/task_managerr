#!/bin/bash

# Base directory
mkdir -p task-manager/{client/src/{components,pages},server/{models,routes,middleware,config}}

# Create frontend files
touch task-manager/client/src/{App.js,index.js} \
      task-manager/client/{package.json,.env}

# Create backend files
touch task-manager/server/{server.js,package.json,.env}

echo "Project structure created successfully!"
