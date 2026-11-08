# ALU — CSE Networking Platform

A MERN-stack networking platform (LinkedIn-style) for the CSE community, featuring
authentication, user profiles, posts, image uploads, and real-time messaging.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT auth, Cloudinary
- **Frontend:** React, Vite, Tailwind CSS

## Project Structure

```
ALU/
├── backend/     # Express API + Socket.IO server
└── frontend/    # React + Vite client
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- A MongoDB database (e.g. MongoDB Atlas)
- A Cloudinary account (for image uploads)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your own values
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Author

Sidhartha Mahapatra
