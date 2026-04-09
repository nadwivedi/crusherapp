const express = require("express");
const { extractSaleFromImage, extractBoulderFromImage, upload } = require("../controllers/ocrController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

// POST /api/ocr/extract-sale
// Expects multipart/form-data with field name "image"
router.post("/extract-sale", upload.single("image"), extractSaleFromImage);
router.post("/extract-boulder", upload.single("image"), extractBoulderFromImage);

module.exports = router;
