import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path: "./.env"});

import { ExpenseCard } from "./src/models/expenseCard.model.js";

async function run() {
    await mongoose.connect(process.env.MONGODB_URI + "/expense-tracker");
    
    const ownerId = new mongoose.Types.ObjectId();
    const doc = await ExpenseCard.create({
        title: "Test Entry",
        category: "Test",
        amount: 100,
        owner: ownerId,
        ownerName: "Does this save?",
        date: new Date()
    });

    console.log("Newly created document:", doc);

    await mongoose.disconnect();
}
run();
