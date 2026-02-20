import { app } from "./src/app.js";
import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path: "./.env"});

import { connectDB } from "./src/db/index.js";
import { User } from "./src/models/user.model.js";

async function runTest() {
    await mongoose.connect(process.env.MONGODB_URI + "/expense-tracker");
    await User.deleteMany({ username: "test_owner" }); // clean up

    // Create user directly or via API
    const userDoc = await User.create({
        username: "test_owner",
        email: "test_owner@test.com",
        password: "password123"
    });

    const token = userDoc.generateAccessToken();

    // Call createExpenseCard API
    const response = await request(app)
        .post("/api/v1/expenses/create-expense-card")
        .set("Authorization", "Bearer " + token)
        .send({
            title: "Sunday dates and almonds order",
            category: "Dry Fruits and Nuts",
            amount: 600,
            date: "2026-02-14T18:06:32.000Z"
        });

    console.log("Response status:", response.status);
    console.log("Response body:", response.body);

    await mongoose.disconnect();
}
runTest();
