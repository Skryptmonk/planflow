#!/bin/bash

# This is your custom entrypoint script

# Perform any pre-start tasks here

# Start your application
npm start

# Perform any post-start tasks here

# Keep the container running
tail -f /dev/null
