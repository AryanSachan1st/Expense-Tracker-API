# 💸 Expense Tracker API

A RESTful backend API for tracking personal expenses. Built with **Node.js**, **Express**, and **MongoDB**, it supports secure user authentication with JWT and full CRUD operations on expense records with advanced filtering and analytics.

---

## 🚀 Features

- **User Authentication** — Register, login, and logout with JWT-based access and refresh tokens stored in HTTP-only cookies
- **Expense Management** — Create, read, update, and delete personal expense cards
- **Advanced Filtering** — Filter expenses by category, amount range, and date range with custom sort options
- **Analytics** — Find the most expensive spending category using MongoDB aggregation
- **Secure by Default** — All expense routes are protected with JWT middleware; users can only access their own data
- **Global Error Handler** — Centralized error handling for validation errors, cast errors, and duplicate key conflicts

---

## 🛠️ Tech Stack

| Layer       | Technology                         |
| ----------- | ---------------------------------- |
| Runtime     | Node.js (ESM / `"type": "module"`) |
| Framework   | Express.js v5                      |
| Database    | MongoDB with Mongoose              |
| Auth        | JSON Web Tokens (JWT) + bcrypt     |
| Dev tooling | Nodemon                            |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── user.controller.js          # Register, login, logout, delete
│   │   └── expenseCard.controller.js   # CRUD + filter + analytics
│   ├── models/
│   │   ├── user.model.js               # User schema with JWT & bcrypt methods
│   │   └── expenseCard.model.js        # Expense card schema
│   ├── routes/
│   │   ├── user.route.js               # /api/v1/users
│   │   └── expenseCard.route.js        # /api/v1/expenses
│   ├── middlewares/
│   │   └── auth.middleware.js          # JWT verification
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── AsyncHandler.js
│   ├── db/
│   │   └── index.js                    # MongoDB connection
│   ├── app.js                          # Express app + global error handler
│   └── index.js                        # Server entry point
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or MongoDB Atlas)

### Steps

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Expense-Tracker-API/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend/` directory:

   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=7d
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The server will be running at `http://localhost:8000`.

---

## 📡 API Reference

### 🔐 Auth Routes — `/api/v1/users`

| Method | Endpoint    | Auth Required | Description              |
| ------ | ----------- | ------------- | ------------------------ |
| POST   | `/register` | ❌            | Register a new user      |
| POST   | `/login`    | ❌            | Login and receive tokens |
| POST   | `/logout`   | ✅            | Logout current user      |
| DELETE | `/delete`   | ✅            | Delete user account      |

#### Register — `POST /api/v1/users/register`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login — `POST /api/v1/users/login`

```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

---

### 💳 Expense Routes — `/api/v1/expenses`

> All expense routes require a valid JWT (sent via cookie or `Authorization` header).

| Method | Endpoint                   | Description                   |
| ------ | -------------------------- | ----------------------------- |
| POST   | `/create-expense-card`     | Create a new expense          |
| GET    | `/:expenseId`              | Get a specific expense by ID  |
| PATCH  | `/:expenseId`              | Update an expense             |
| DELETE | `/:expenseId`              | Delete an expense             |
| GET    | `/filter-cards`            | Filter & sort expenses        |
| GET    | `/most-expensive-category` | Get highest-spending category |

#### Create Expense — `POST /api/v1/expenses/create-expense-card`

```json
{
  "title": "Groceries",
  "category": "Food",
  "amount": 1500,
  "date": "2025-02-20"
}
```

#### Filter Expenses — `GET /api/v1/expenses/filter-cards`

Supports the following query parameters:

| Parameter   | Description                         | Example      |
| ----------- | ----------------------------------- | ------------ |
| `category`  | Filter by category name             | `Food`       |
| `minAmount` | Minimum expense amount              | `500`        |
| `maxAmount` | Maximum expense amount              | `5000`       |
| `minDate`   | Start date range                    | `2025-01-01` |
| `maxDate`   | End date range                      | `2025-12-31` |
| `sortBasis` | Field to sort by (`amount`, `date`) | `amount`     |
| `sortOrder` | `asc` or `desc`                     | `desc`       |

**Example:** `GET /api/v1/expenses/filter-cards?category=Food&minAmount=500&sortBasis=amount&sortOrder=desc`

---

## 🔒 Authentication Flow

1. On **login**, the server issues an `accessToken` (short-lived) and a `refreshToken` (long-lived), both stored as **HTTP-only cookies**.
2. Protected routes use the `verifyJWT` middleware which reads the token from the cookie or `Authorization` header.
3. **Logout** clears both cookies and removes the refresh token from the database.

---

## 🗃️ Data Models

### User

| Field          | Type   | Notes                              |
| -------------- | ------ | ---------------------------------- |
| `username`     | String | Unique, lowercase, indexed         |
| `email`        | String | Unique, lowercase                  |
| `password`     | String | Hashed with bcrypt (10 rounds)     |
| `refreshToken` | String | Stored on login, cleared on logout |

### Expense Card

| Field      | Type     | Notes                         |
| ---------- | -------- | ----------------------------- |
| `title`    | String   | Required                      |
| `category` | String   | Required (e.g., Food, Travel) |
| `amount`   | Number   | Required                      |
| `date`     | Date     | Required                      |
| `owner`    | ObjectId | Reference to `User`           |
