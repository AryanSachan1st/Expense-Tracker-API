import { Schema, model } from "mongoose";

const ExpenseCardSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        date: {
            type: Date,
            required: true
        }
    },
    {timestamps: true}
)

export const ExpenseCard = model("ExpenseCard", ExpenseCardSchema)