# College Event Management Backend

A simple and scalable backend API for a college event management system. This project is built with Node.js, Express, MongoDB, and JWT authentication, and includes role-based access control for students, organizers, and admins.

## Overview

This backend provides the foundation for handling user authentication and authorization in a college event platform. It supports account creation, login, protected user profile access, and restricted routes based on user roles.

## Features

- User registration with email and password
- Secure login with JWT token generation
- Password hashing using `bcryptjs`
- Protected routes with authentication middleware
- Role-based access control for `student`, `organizer`, and `admin`
- MongoDB integration using Mongoose
- Health check route for quick API status verification

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (`jsonwebtoken`)
- bcryptjs
- dotenv
- nodemon

## Folder Structure

```text
backend/
|- config/
|  |- db.js
|- controllers/
|  |- authControllers.js
|- middleware/
|  |- authMiddleware.js
|  |- roleMiddleware.js
|- models/
|  |- User.js
|- routes/
|  |- authRoutes.js
|- server.js
|- package.json
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env` file in the root of the project and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Running the Project

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will run by default at:

```text
http://localhost:5000
```

## API Endpoints

### Base Route

#### `GET /`

Checks whether the API is running and returns a list of available endpoints.

### Authentication Routes

#### `POST /api/auth/register`

Registers a new user.

Sample request body:

```json
{
  "name": "Ishita",
  "email": "ishita@example.com",
  "password": "123456",
  "role": "student"
}
```

#### `POST /api/auth/login`

Logs in a user and returns a JWT token.

Sample request body:

```json
{
  "email": "ishita@example.com",
  "password": "123456"
}
```

#### `GET /api/auth/me`

Returns the currently logged-in user's profile.

Required header:

```http
Authorization: Bearer your_jwt_token
```

### Role-Protected Routes

#### `GET /api/auth/admin-dashboard`

Accessible only by users with the `admin` role.

#### `GET /api/auth/create-event-panel`

Accessible by users with either the `organizer` or `admin` role.

## Supported Roles

- `student`
- `organizer`
- `admin`

## Available Scripts

```bash
npm start
npm run dev
```

## Example Workflow

1. Register a new user using `/api/auth/register`
2. Login using `/api/auth/login`
3. Copy the returned JWT token
4. Use the token in the `Authorization` header for protected routes
5. Access routes based on the role assigned to that user

## Future Improvements

- Add event creation and management APIs
- Add validation with a library like `express-validator` or `joi`
- Add refresh tokens and logout flow
- Add unit and integration tests
- Add API documentation with Postman or Swagger

## License

This project is licensed under the ISC License.
