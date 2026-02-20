import mongoose from "mongoose";
import { ExpenseCard } from "../models/expenseCard.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js"


const createExpenseCard = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { title, amount, category, date } = req.body

    if (
        /* 
        Fix: Check string fields separately from amount (Number).
        Calling .trim() on a Number would cause a crash.
        */
        [title, category, date].some((field) => field?.trim() === "") ||
        amount === undefined
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const expenseCard = await ExpenseCard.create(
        {
            title, amount, category, owner: userId, date
        }
    )

    return res.status(201).json(
        new ApiResponse(201, expenseCard, "ExpenseCard created and saved successfully")
    )

})
const getAnExpenseCard = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { expenseId } = req.params

    if (!mongoose.isValidObjectId(expenseId)) {
        throw new ApiError(400, "Invalid expense id, inside getAnExpenseCard")
    }

    const expenseCard = await ExpenseCard.findOne(
        {
            _id: expenseId,
            owner: userId
        }
    )

    return res.status(200).json(
        new ApiResponse(200, expenseCard, "Expense Card fetched successfully")
    )
})
const updateExpenseCard = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { title, amount, category, date } = req.body
    const { expenseId } = req.params

    if (!mongoose.isValidObjectId(expenseId)) {
        throw new ApiError(400, "Invalid expense id, inside updateExpenseCard")
    }

    const expenseCard = await ExpenseCard.findOneAndUpdate(
        {
            _id: expenseId,
            owner: userId
        },
        {
            $set: {
                ...(title && { title }),
                /*
                Fix: Explicitly check undefined.
                (amount && {amount}) handles 0 as false, so 0 wouldn't be updated.
                */
                ...(amount !== undefined && { amount }),
                ...(category && { category }),
                ...(date && { date })
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!expenseCard) {
        throw new ApiError("Either expense card does not exists or you are not authorized to update this card")
    }

    return res.status(200).json(
        new ApiResponse(200, expenseCard, "Expense Card updated successfully")
    )
})
const deleteExpenseCard = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { expenseId } = req.params

    if(!mongoose.isValidObjectId(expenseId)) {
        throw new ApiError(400, "Invalid expense id, inside deleteExpenseCard")
    }

    const deletedExpenseCard = await ExpenseCard.findOneAndDelete(
        {
            _id: expenseId,
            owner: userId
        }
    )

    if (!deletedExpenseCard) {
        throw new ApiError(404, "Either expense card does not exist or you are not authorized to delete that card")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedExpenseCard, "Expense card deleted successfully")
    )
})
const filterExpenseCards = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { sortBasis, sortOrder, category, minAmount, maxAmount, minDate, maxDate } = req.query

    const sortOptions = {}
    const field = sortBasis || "createdAt"
    sortOptions[field] = sortOrder === "desc" ? -1 : 1

    const filter = {}
    filter.owner = userId
    if (category) filter.category = category

    /*
    Note: Must use filter.amount (not filter.amountRange) because the DB field is named 'amount'.
    */
    if (minAmount || maxAmount) {
        filter.amount = {}

        if (minAmount) filter.amount.$gte = Number(minAmount);
        if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    if (minDate || maxDate) {
        filter.date = {}

        if (minDate) filter.date.$gte = minDate;
        if (maxDate) filter.date.$lte = maxDate;
    }

    const expenseCards = await ExpenseCard.find(
        filter
    ).sort(sortOptions)

    return res.status(200).json(
        new ApiResponse(200, expenseCards, "Expense cards fetched successfully")
    )
})
const getMostExpensiveCategory = asyncHandler(async (req, res) => {
    const userId = req.user._id
    
    // Debug logging
    console.log("Debugging getMostExpensiveCategory:");
    console.log("User ID from req.user:", userId);
    console.log("User ID type:", typeof userId);

    const mostExpensiveCategory = await ExpenseCard.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: "$category", // basis of grouping (key)
                totalAmount : { $sum: "$amount" }
            }
        },
        {
            $sort: {
                totalAmount: -1
            }
        },
        {
            $limit: 1
        },
        {
            $project: {
                _id: 0,
                category: "$_id",
                totalAmount: 1
            }
        }
    ])
    
    console.log("Aggregation Result:", mostExpensiveCategory);

    return res.status(200).json(
        new ApiResponse(200, mostExpensiveCategory, "Most expensive category fetched")
    )
})

export { createExpenseCard, getAnExpenseCard, updateExpenseCard, deleteExpenseCard, filterExpenseCards, getMostExpensiveCategory }