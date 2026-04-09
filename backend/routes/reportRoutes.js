const express = require("express");
const {
  getDayBook,
  getOutstanding,
  getPartyLedger,
  getPartyLedgerEntryDetail,
  getStockLedger,
  getDashboardAnalytics,
} = require("../controllers/reportsController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/day-book", getDayBook);
router.get("/outstanding", getOutstanding);
router.get("/party-ledger", getPartyLedger);
router.get("/party-ledger-entry-detail", getPartyLedgerEntryDetail);
router.get("/stock-ledger", getStockLedger);
router.get("/dashboard-analytics", getDashboardAnalytics);

module.exports = router;
