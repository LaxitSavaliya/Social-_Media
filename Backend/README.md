# Backend - Social Media App

This is the backend server for the Social Media application. It is built with Node.js and Express, and provides RESTful APIs for user authentication, posts, comments, follow requests, and more.

## Features
- User authentication (sign up, login, JWT-based auth)
- Create, read, update, and delete posts
- Comment on posts
- Like posts
- Follow/unfollow users
- Handle follow requests (accept/decline)
- Image upload with Cloudinary
- MongoDB database integration

## Project Structure
```
Backend/
  package.json
  src/
    server.js                # Entry point
    Config/                  # Configuration files (Cloudinary, multer)
    Controllers/             # Route controllers (auth, post, comment, etc.)
    Lib/                     # Database connection
    Middleware/              # Authentication middleware
    Models/                  # Mongoose models
    Routes/                  # API route definitions
```

## Getting Started

### Prerequisites
- Node.js (v16 or above recommended)
- MongoDB database (local or cloud)
- Cloudinary account (for image uploads)

### Installation
1. Navigate to the `Backend` directory:
   ```sh
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the `Backend` directory and add the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Running the Server
```sh
npm run dev
```
The server will start on the port specified in your environment variables or default to 5000.

## API Endpoints
- `/api/auth` - Authentication routes
- `/api/posts` - Post CRUD operations
- `/api/comments` - Comment operations
- `/api/follow` - Follow/unfollow and follow requests
- `/api/users` - User profile and search

## License
This project is licensed under the MIT License.
