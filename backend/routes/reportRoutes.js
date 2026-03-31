const express = require("express");
const {
  getDayBook,
  getOutstanding,
  getPartyLedger,
  getPartyLedgerEntryDetail,
  getStockLedger,
  getDashboardAnalytics,
} = require("../controllers/reportsController");

const router = express.Router();

router.get("/day-book", getDayBook);
router.get("/outstanding", getOutstanding);
router.get("/party-ledger", getPartyLedger);
router.get("/party-ledger-entry-detail", getPartyLedgerEntryDetail);
router.get("/stock-ledger", getStockLedger);
router.get("/dashboard-analytics", getDashboardAnalytics);

module.exports = router;
