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
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

client/.env
REACT_APP_API_URL=http://localhost:5000

5. Run the server:

cd server
npm start
6. Run the client (in a separate terminal):

cd client
npm start

## Features
- User registration and login
- Create, edit, and delete tasks
- Mark tasks as complete/incomplete
- Persistent data storage with MongoDB
- Protected routes with JWT authentication