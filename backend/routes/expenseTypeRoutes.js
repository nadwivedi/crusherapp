const express = require("express");
const auth = require("../middleware/auth");
const {
  createExpenseType,
  getAllExpenseTypes,
  updateExpenseType,
  deleteExpenseType,
} = require("../controllers/expenseTypeController");

const router = express.Router();

router.use(auth);

router.post("/", createExpenseType);
router.get("/", getAllExpenseTypes);
router.put("/:id", updateExpenseType);
router.delete("/:id", deleteExpenseType);

module.exports = router;
