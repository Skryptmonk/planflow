# Use an official Node.js image as the base
FROM node:14-alpine

# set working directory
WORKDIR /app

# Copies package.json and package-lock.json to Docker environment
COPY package*.json ./

# Installs all node packages
RUN npm install

# Copies everything over to Docker environment
COPY . .

# Build for production.
RUN npm run build --production

# Install `serve` to run the application.
RUN npm install -g serve

# Expose port 3000 for the backend application
EXPOSE 3000

# Set the command to start the app
#CMD ["npm", "start"]
CMD serve -s build
