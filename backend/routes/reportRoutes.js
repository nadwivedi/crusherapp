const express = require("express");
const {
  getDayBook,
  getOutstanding,
  getPartyLedger,
  getPartyLedgerEntryDetail,
} = require("../controllers/reportsController");

const router = express.Router();

router.get("/day-book", getDayBook);
router.get("/outstanding", getOutstanding);
router.get("/party-ledger", getPartyLedger);
router.get("/party-ledger-entry-detail", getPartyLedgerEntryDetail);

module.exports = router;
