import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"

const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized request, please login to continue")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findOne(
        {
            _id: decodedToken?._id,
            refreshToken: { $exists: true, $ne: null }
        }
    ).select("-password -refreshToken")

    // Note: Token was syntactically correct, but if _id doesn't match, then the user is deleted and if _id matched but the refreshToken is null then the user is already logged out
    if (!user) {
        throw new ApiError(404, "This user is deleted or already logged out")
    }

    req.user = user
    next()
})

export { verifyJWT }