import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createExpenseCard, getAnExpenseCard, updateExpenseCard, deleteExpenseCard, filterExpenseCards, getMostExpensiveCategory } from "../controllers/expenseCard.controller.js"


const expenseCardRouter = Router()

expenseCardRouter.use(verifyJWT)

expenseCardRouter.route("/create-expense-card").post(createExpenseCard)
expenseCardRouter.route("/filter-cards").get(filterExpenseCards)
expenseCardRouter.route("/most-expensive-category").get(getMostExpensiveCategory)

/*
IMPORTANT: Routes with dynamic parameters (like /:expenseId) must be defined LAST.
If defined earlier, Express will catch URLs like "/filter-cards" and treat "filter-cards"
as the "expenseId" parameter, causing "Invalid object id" errors in the controller.
*/
expenseCardRouter.route("/:expenseId").get(getAnExpenseCard).patch(updateExpenseCard).delete(deleteExpenseCard)

// Note: "/:path-parameter" is like a variable waiting for some "/text" so that it can take that text (can be any thing: numbers, strings, etc) so if "/:path-parameter" is defined earlies then "/filter-cards" is taken by that "/path-parameter" route and stops there, it will not check further for exact same match of "/filter-cards"

/*
Note: In Express, you NEVER define query parameters inside the route path.
correct path: router.route("/filter-cards").get(contollerMethod)
Query parameters:
1. Are automatically handled by Express
2. Come from the URL after ?
3. Are accessed using req.query
*/

export {expenseCardRouter}