# Smart Note App

A full-featured note management REST API built with Node.js and Express, including user authentication, file uploads, and AI-powered note summarization.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (asymmetric encryption)
- bcrypt
- dotenv
- nodemailer
- multer
- HUGGINGFACE API
- Joi
- GraphQL
- Helmet, CORS, Rate Limiter

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Yousef1550/Smart_Note_App.git
cd Smart_Note_App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate RSA Key Pair

If the `keys/` directory does not exist, generate the keys:

```bash
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key

openssl genrsa -out refresh_private.key 2048
openssl rsa -in refresh_private.key -pubout -out refresh_public.key
```

Then place them inside a folder named `keys/` at the root level.

### 4. Set Environment Variables

Create a `.env` file with the following content:

```env
PORT=3000
MONGO_URI=your_mongo_connection_string
HUGGINGFACE_API_KEY=your_HUGGINGFACE_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 5. Run the Application

```bash
npm run dev
```

Server will run at: `http://localhost:3000`

---

## API Overview

### Authentication

- `POST /register` – Register a user
- `POST /login` – Login and get a JWT token
- `POST /logout` – Revoke a token
- `POST /forget-password` – Request password reset (sends OTP via email)
- `POST /reset-password` – Reset password using OTP
- `PATCH /upload-profile-pic` – Upload user profile picture (using multer)

### Notes (REST + GraphQL)

- `POST /notes` – Create a note
- `DELETE /notes/:id` – Delete a note
- `GET /notes` – Fetch notes using GraphQL with filters (userId, title, date interval) – returns paginated
- `POST /notes/:id/summarize` – Summarize a note using OpenAI

---

## Other Features

- Input validation using Joi
- Authentication middleware with token revocation check
- Error-handling middleware with centralized error response
- CORS, Helmet, Rate Limiting for security
- Clean modular code with clear structure
- 404 handler for unmatched routes
- Logs only necessary info (server start, DB connect, errors)

---

## Postman Collection

Postman collection is included in the repository for testing the APIs.

---

## Author

https://github.com/Yousef1550
