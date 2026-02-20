import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createUser, login, logout, deleteUser } from "../controllers/user.controller.js"

const userRouter = Router()

userRouter.route("/register").post(createUser)
userRouter.route("/login").post(login)
userRouter.route("/logout").post(verifyJWT, logout)
userRouter.route("/delete").delete(verifyJWT, deleteUser)

export { userRouter }