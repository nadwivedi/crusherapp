const express = require("express");
const upload = require("../config/multer");
const { uploadInvoice, uploadSlip } = require("../controllers/uploadController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/invoice", upload.single("invoice"), uploadInvoice);
router.post("/slip", upload.single("slip"), uploadSlip);

module.exports = router;
