import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/AsyncHandler.js"

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.create(
        {
            username: username,
            email: email,
            password: password
        }
    )
    // Note: runValidators auto run during .create() query, so for ex: we entered a username/email which is already taken, then it will throw an error

    return res.status(201).json(
        new ApiResponse(201, user, "User created successfully")
    )
})
const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or Email required")
    }

    const queryConditions = []
    if (username) queryConditions.push({ username })
    if (email) queryConditions.push({ email });

    /*
    Fix: Dynamic query construction prevents dangerous queries.
    If 'username' was undefined, { $or: [{ username }, { email: ... }] }
    would result in { $or: [{}, { email: ... }] } which matches ANY user.
    */
    const user = await User.findOne({
        $or: queryConditions
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    if (!await user.isPasswordCorrect(password)) {
        throw new ApiError(400, "Invalid Password")
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },"User logged in successfully")
        )
})
const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id
    
    const logoutUser = await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {},   `User: ${logoutUser._id} logged out successfully`)
        )
})
const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const deletedUser = await User.findByIdAndDelete(userId)

    if (!deletedUser) {
        throw new ApiError(500, "Failed to delete user or user not found")
    }

    return res.status(200).json(
        new ApiResponse(200, {
            userId: deletedUser._id,
            username: deletedUser.username,
            email: deletedUser.email
        }, "User deleted successfully")
    )
})

export { createUser, login, logout, deleteUser }