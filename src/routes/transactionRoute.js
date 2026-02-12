const express = require("express");
const {
  createTransaction,
  getListTransactionByUserId,
  getTransactionById,
  updateTransactionStatus,
  clearAllTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/createTransaction", createTransaction);
router.get("/getListTransactionByUserId", getListTransactionByUserId);
router.get("/getTransactionById", getTransactionById);

// for admin
router.put("/admin/updateTransactionStatus", updateTransactionStatus);
router.delete("/admin/clearAllTransactions", clearAllTransactions);

module.exports = router;
