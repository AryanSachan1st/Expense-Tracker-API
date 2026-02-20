import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({path: "./.env"});

import { connectDB } from "./src/db/index.js";
import { User } from "./src/models/user.model.js";
import { ExpenseCard } from "./src/models/expenseCard.model.js";

async function run() {
    await mongoose.connect(process.env.MONGODB_URI + "/expense-tracker");
    
    // Check an existing document
    const card = await ExpenseCard.findOne({ title: "Sunday dates and almonds order" });
    console.log("Found card:", card);

    await mongoose.disconnect();
}
run();
