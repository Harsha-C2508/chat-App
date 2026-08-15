# Chit Chat - Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack and Socket.IO, supporting one-on-one messaging, group chats, file sharing, and more.

## Features

- **Real-Time Messaging** — Instant message delivery powered by Socket.IO
- **One-on-One & Group Chats** — Private conversations and group chat rooms
- **User Authentication** — Email/password registration and login with JWT-based auth
- **Google OAuth** — Sign in with Google for quick access
- **Typing Indicators** — See when someone is typing in real time
- **Online Status** — Know which users are currently online
- **Message Status** — Delivered and read receipts for messages
- **Message Deletion** — Delete messages from a conversation
- **File & Media Sharing** — Send images, videos, and other files in chat
- **Media Viewer** — View shared images and videos in a modal viewer
- **Chat Wallpapers** — Customize chat backgrounds with wallpaper options
- **User Profiles** — View and update user profile information
- **User Search** — Search for users to start new conversations
- **Chat Search** — Search within chat messages
- **Group Management** — Create groups, add/remove members, rename groups, and leave chats
- **Password Recovery** — Forgot password flow with email-based reset links
- **Appearance Settings** — Customize the app's look and feel
- **Responsive UI** — Built with Chakra UI and Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Chakra UI
- Tailwind CSS
- Framer Motion (animations)
- Socket.IO Client
- Axios
- React Router v6

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO
- JWT (JSON Web Tokens)
- bcrypt.js (password hashing)
- Nodemailer (email service)
- Google Auth Library

## Project Structure

```
chat-App/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── Authentication/   # Login & Signup forms
│       │   └── Chat/             # Chat UI components
│       ├── Context/        # React context providers
│       ├── Pages/          # Page-level components
│       ├── config/         # Utility functions & config
│       ├── routes/         # Route definitions
│       └── styles/         # CSS styles
├── server/                 # Express backend
│   ├── Config/             # Database & token config
│   ├── Controller/         # Route handlers
│   ├── Middlewares/        # Auth & error middleware
│   ├── Routes/             # API route definitions
│   ├── models/             # Mongoose schemas
│   ├── uploads/            # Uploaded files
│   └── utils/              # Helper utilities
├── .env                    # Environment variables (not committed)
└── package.json            # Root package config
```

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local instance or MongoDB Atlas)
- **npm**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-App
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_DB=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
NODE_ENV=development
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
CLIENT_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-email>
SMTP_PASS=<your-email-app-password>
SMTP_FROM=<your-email>
```

### 3. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install --legacy-peer-deps
```

### 4. Run the Application

```bash
# Start the backend (from root directory)
npm run dev

# Start the frontend (from client directory)
cd client
npm start
```

- **Frontend** runs on [http://localhost:3000](http://localhost:3000)
- **Backend** runs on [http://localhost:5000](http://localhost:5000)

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user` | Register a new user |
| POST | `/api/user/login` | Login with email & password |
| POST | `/api/user/google` | Google OAuth login |
| GET | `/api/user` | Search users (authenticated) |
| PUT | `/api/user/profile` | Update user profile (authenticated) |
| POST | `/api/user/forgot-password` | Request password reset email |
| PUT | `/api/user/reset-password/:token` | Reset password with token |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Access or create a one-on-one chat |
| GET | `/api/chat` | Fetch all chats for the user |
| POST | `/api/chat/group` | Create a group chat |
| PUT | `/api/chat/rename` | Rename a group chat |
| PUT | `/api/chat/groupadd` | Add a user to a group |
| PUT | `/api/chat/groupremove` | Remove a user from a group |
| DELETE | `/api/chat/:chatId` | Leave a chat |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/message` | Send a message |
| GET | `/api/message/:chatId` | Get all messages in a chat |
| PUT | `/api/message/delete/:messageId` | Delete a message |
| PUT | `/api/message/delivered/:messageId` | Mark message as delivered |
| PUT | `/api/message/read/:chatId` | Mark all messages in chat as read |

### Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a file |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `setup` | Client -> Server | Initialize socket connection with user data |
| `connected` | Server -> Client | Confirm connection established |
| `join chat` | Client -> Server | Join a chat room |
| `typing` | Bidirectional | User is typing in a chat |
| `stop typing` | Bidirectional | User stopped typing |
| `new message` | Bidirectional | New message sent/received |
| `message deleted` | Bidirectional | Message was deleted |
| `user online` | Server -> Client | A user came online |
| `user offline` | Server -> Client | A user went offline |
| `online users` | Server -> Client | List of currently online users |

## Deployment

For production deployment:

```bash
npm run build
```

This installs all dependencies and builds the React frontend. The Express server serves the built frontend in production mode (`NODE_ENV=production`).

## License

ISC
