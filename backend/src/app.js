import express from "express"
import cookieparser from "cookie-parser"

const app = express()

// middlewares
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.json({ limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieparser())

// routes
import { apiHealthRouter } from "./routes/apiHealth.route.js"
app.use("/", apiHealthRouter)

import { userRouter } from "./routes/user.route.js"
app.use("/api/v1/users", userRouter)

import { expenseCardRouter } from "./routes/expenseCard.route.js"
app.use("/api/v1/expenses", expenseCardRouter)

// global error handler
app.use((err, req, res, next) => {
    let code = err.code || 500
    let message = err.message || "Internal Server Error"

    if (err.name === "CastError") {
        code = 400,
        message = "Resource not found, invalid parameter"
    } else if (err.code === 11000) {
        code = 409,
        message = "Duplicate field value entered"
    } else if (err.name === "ValidationError") {
        code = 400,
        message = Object.values(err.errors || {}).map((error) => error.message).join(", ")
    }

    return res.status(code).json(
        {
            success: err.success,
            errors: err.errors,
            errorCode: code,
            errorMessage: message,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        }
    )
})

export { app }