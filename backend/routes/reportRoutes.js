const express = require("express");
const {
  getDayBook,
  getOutstanding,
  getPartyLedger,
  getPartyLedgerEntryDetail,
  getStockLedger,
} = require("../controllers/reportsController");

const router = express.Router();

router.get("/day-book", getDayBook);
router.get("/outstanding", getOutstanding);
router.get("/party-ledger", getPartyLedger);
router.get("/party-ledger-entry-detail", getPartyLedgerEntryDetail);
router.get("/stock-ledger", getStockLedger);

module.exports = router;
