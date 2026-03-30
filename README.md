# NexChat - Full Stack MERN Chat Application

A modern, full-stack real-time chat application built with **MERN** (MongoDB, Express, React, Node.js) stack. Features user authentication, messaging, profile management, and media uploads.

## Features

✨ **Core Features**
- User authentication & authorization
- Real-time messaging
- User profile management
- Image upload support (Cloudinary integration)
- Responsive UI design
- Sidebar for user navigation
- Chat container with message history

🔐 **Security**
- JWT-based authentication
- Password hashing
- Protected routes with middleware

## Tech Stack

**Frontend:**
- React 18
- Vite (build tool)
- Context API (state management)
- CSS for styling

**Backend:**
- Node.js
- Express.js
- MongoDB (database)
- Mongoose (ODM)
- JWT (authentication)
- Cloudinary (image storage)

## Project Structure

```
chat-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth and Chat context
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   └── assets/        # Static assets
│   ├── vite.config.js
│   └── package.json
│
└── server/                # Node.js backend
    ├── models/            # Mongoose schemas
    ├── controllers/       # Business logic
    ├── routes/            # API endpoints
    ├── middleware/        # Auth middleware
    ├── lib/               # Database & utilities
    └── server.js          # Entry point
```

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB instance
- Cloudinary account (for image uploads)

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server folder:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm start
```

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the client folder:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

## API Endpoints

### User Routes (`/api/users`)
- `POST /signup` - Register a new user
- `POST /login` - Login user
- `GET /profile/:id` - Get user profile
- `PUT /profile/:id` - Update user profile
- `GET /` - Get all users

### Message Routes (`/api/messages`)
- `POST /` - Send a message
- `GET /:conversationId` - Get messages for a conversation
- `DELETE /:id` - Delete a message

## Authentication

The app uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Components

### Frontend Components
- **ChatContainer** - Main chat interface
- **Sidebar** - User list and navigation
- **RightSidebar** - Additional options/settings
- **HomePage** - Main dashboard
- **LoginPage** - User authentication
- **ProfilePage** - User profile management

### Context
- **AuthContext** - Manages user authentication state
- **ChatContext** - Manages chat and messaging state

## Running the Application

1. **Start MongoDB** - Ensure MongoDB is running
2. **Start Backend** - `cd server && npm start`
3. **Start Frontend** - `cd client && npm run dev`
4. **Open Browser** - Navigate to `http://localhost:5173`

## Build for Production

**Client:**
```bash
cd client
npm run build
```

**Server:** Deploy to a hosting service (Heroku, Railway, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please open an issue or contact the maintainer.

---

**Happy Chatting!** 💬