
# 📰 Full-Stack Blog App (Node.js + React + MongoDB)

![Docker](https://img.shields.io/badge/dockerized-yes-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/your-org/blog-app/ci.yml)
![Last Commit](https://img.shields.io/github/last-commit/your-org/blog-app)

> A simple full-stack blogging platform built with Node.js, React, TypeScript, and MongoDB — featuring authentication, post management, comments, likes, and category management.

---

## ✨ Features

- 🔐 JWT-based Authentication (Register, Login)
- 🖊️ TipTap Rich-text Editor for Posts
- 💬 Commenting System with Likes
- 🗂️ Category Management with Validation
- 🧱 Modular Backend Architecture (DTO, Services, Middleware)
- 📦 Fully Dockerized (MongoDB + Node + React)
- 📚 Auto-generated Swagger API Docs
- ⚙️ Centralized Error Handling and Logging (Winston)

---

## 📸 Screenshots

| Login Page | Register Editor | Home Page |
|------------|------------------|-----------|
| <img src="./frontend/src/assets/screenshots/login-screen.png" alt="Login" width="250"/> | <img src="./frontend/src/assets/screenshots/register-screen.png" alt="Register" width="250"/> | <img src="./frontend/src/assets/screenshots/home-screen.png" alt="Home" width="250"/> |

| Categories Page | Post Page | Comment Page |
|------------------|------------|----------------|
| <img src="./frontend/src/assets/screenshots/create-category-screen.png" alt="Category" width="250"/> | <img src="./frontend/src/assets/screenshots/create-post-screen.png" alt="Post" width="250"/> | <img src="./frontend/src/assets/screenshots/comment-screen.png" alt="Comment" width="250"/> |

> _Images are stored under `frontend/src/assets/screenshots/`._

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React, Vite, MUI, TipTap, Axios      |
| Backend    | Node.js, Express.js, TypeScript      |
| Database   | MongoDB                              |
| Auth       | JWT, bcryptjs, Helmet, RateLimiter   |
| DevOps     | Docker, Docker Compose               |
| Docs       | Swagger (OpenAPI YAML)               |

---

## 📁 Project Structure

```bash
.
├── backend/
│   ├── config/        # DB, JWT, Logger, Multer setup
│   ├── controllers/   # Request handlers
│   ├── dtos/          # Joi-based validation DTOs
│   ├── middlewares/   # Auth, Error, Logger, Validator
│   ├── models/        # Mongoose models
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic
│   └── utils/         # ApiError, ResponseHandler
├── frontend/
│   ├── assets/        # Static images
│   ├── components/    # Navbar, PostCard, Forms
│   ├── contexts/      # Auth Context
│   ├── pages/         # Main React views
│   ├── services/      # Axios clients
│   └── theme/types/   # MUI theme & shared types
```

---

## 🚀 Getting Started (Docker)

### Prerequisites
- Docker & Docker Compose installed

### Steps

```bash
# Clone the project
git clone https://github.com/hengly4433/nodejs-reactjs-blog-app.git && cd nodejs-reactjs-blog-app

# Build & start all containers
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Swagger Docs: http://localhost:4000/api-docs

---

## 🔐 Environment Configuration

### backend/.env

```env
PORT=4000
MONGO_URI=mongodb://rootuser:rootpass@mongo:27017/blogdb?authSource=admin
JWT_SECRET=YourVeryLongRandomJWTSecretHere
JWT_EXPIRES_IN=1h
SALT_ROUNDS=10
LOG_LEVEL=info
```

### frontend/.env

```env
VITE_API_URL=http://localhost:4000
```

---

## 🧪 Development Scripts

### Backend

```bash
npm run dev        # Start in dev mode
npm run build      # Compile TypeScript
npm run test       # Run Jest tests
npm run lint       # Lint and fix
```

### Frontend

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # Lint and fix
```

---

## 📚 API Documentation

Swagger is available at:

```http
http://localhost:4000/api/docs
```

Generated from the `openapi.yaml` file.

## 📸 Swagger UI

<img src="./frontend/src/assets/screenshots/swagger-screen.png" alt="Swagger Screenshot" width="400"/>

---

## 🤝 Contributing

```bash
1. Fork the repo
2. Create your feature branch (git checkout -b feature/new-feature)
3. Commit your changes (git commit -m 'Add new feature')
4. Push to the branch (git push origin feature/new-feature)
5. Open a Pull Request
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 👨‍💻 Author

**SIEV HENGLY**  
📧 [https://www.linkedin.com/in/siev-hengly-41b3b0179/](LinkedIn)  

---
