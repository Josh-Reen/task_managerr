# task_managerr

## Prerequisites
- Node.js
- MongoDB

## Setup

1. Clone the repository
2. Install server dependencies:

cd server
npm install
3. Install client dependencies:

cd client
npm install
4. Create .env files in both server and client directories:
    

server/.env
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_secret_key

client/.env
REACT_APP_API_URL=http://localhost:5000

5. Run the server:

cd server
npm start
6. Run the client (in a separate terminal):

cd client
npm start

Mongodb
    - MongoDB Compass GUI .exe
    - Create a connection in my case task-manager with database name task-manager

## Features
- User registration and login
- Create, edit, and delete tasks
- Mark tasks as complete/incomplete
- Persistent data storage with MongoDB
- Protected routes with JWT authentication

# Note:
      dependencies with reference to .json files
      .gitignore not added
      separately running servers npm start
      Toket retrieved right away in the terminal
