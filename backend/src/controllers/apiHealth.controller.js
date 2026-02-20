import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const apiHealth = asyncHandler(async (_, res) => {
    return res.status(200).json(
        new ApiResponse(200, {}, "Expense Tracker API is healthy and running")
    )
})

export { apiHealth }