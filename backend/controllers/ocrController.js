const multer = require("multer");

// Use memory storage so we don't touch the disk
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * Normalize the raw material string from the slip into one of the
 * allowed enum values: 60mm | 40mm | 20mm | 10mm | 6mm | 4mm | dust | wmm | gsb
 */
const normalizeMaterial = (raw = "") => {
  const s = String(raw).trim().toLowerCase().replace(/\s+/g, "");
  if (/(^|[^0-9])60([^0-9]|$)/.test(s) || s.includes("60mm")) return "60mm";
  if (/(^|[^0-9])40([^0-9]|$)/.test(s) || s.includes("40mm")) return "40mm";
  if (/(^|[^0-9])20([^0-9]|$)/.test(s) || s.includes("20mm")) return "20mm";
  if (/(^|[^0-9])10([^0-9]|$)/.test(s) || s.includes("10mm")) return "10mm";
  if (/(^|[^0-9])6([^0-9]|$)/.test(s) || s.includes("6mm")) return "6mm";
  if (/(^|[^0-9])4([^0-9]|$)/.test(s) || s.includes("4mm")) return "4mm";
  if (s.includes("gsb")) return "gsb";
  if (s.includes("wmm")) return "wmm";
  if (s.includes("dust")) return "dust";
  return s;
};

/**
 * Parse a date string from the slip (DD/MM/YYYY or YYYY/MM/DD) and
 * return it as yyyy-mm-dd for the HTML date input.
 */
const parseSlipDate = (raw = "") => {
  const s = String(raw).trim();
  // DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // YYYY/MM/DD or YYYY-MM-DD
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
};

const parseSlipTime = (raw = "") => {
  const s = String(raw || "").trim();
  const match = s.match(/^(\d{1,2})[:.](\d{2})/);
  if (!match) return "";
  const [, h, m] = match;
  return `${String(Number(h)).padStart(2, "0")}:${String(Number(m)).padStart(2, "0")}`;
};

const extractSaleFromImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "GROQ_API_KEY is not configured" });
  }

  try {
    // Convert buffer to base64 data URL
    const base64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const prompt = `You are an OCR assistant for a stone crusher business. 
Extract the following fields from this weighbridge slip image and return ONLY a valid JSON object with no extra text or markdown.

Fields to extract:
- vehicleNo: vehicle registration number (e.g. MP22ZD6430)
- materialType: material/stone type (e.g. 60MM, 40MM, 20MM, 10MM, 6MM, 4MM, WMM, GSB, DUST)
- grossWeight: GROSS Wt in kg (numeric, no units)
- tareWeight: TARE Wt in kg (numeric, no units)  
- netWeight: NET Wt in kg (numeric, no units)
- saleDate: date from the slip in DD/MM/YYYY format

Return ONLY this JSON format:
{"vehicleNo":"","materialType":"","grossWeight":0,"tareWeight":0,"netWeight":0,"saleDate":""}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 256,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return res.status(502).json({ message: "Groq API request failed", detail: errText });
    }

    const groqData = await response.json();
    const rawContent = groqData?.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (strip any markdown fences if present)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(422).json({
        message: "Could not parse OCR response as JSON",
        raw: rawContent,
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Normalize and validate the extracted values
    const result = {
      vehicleNo: String(parsed.vehicleNo || "").trim().toUpperCase(),
      materialType: normalizeMaterial(parsed.materialType),
      grossWeight: Number(parsed.grossWeight) || 0,
      tareWeight: Number(parsed.tareWeight) || 0,
      netWeight: Number(parsed.netWeight) || 0,
      saleDate: parseSlipDate(parsed.saleDate),
    };

    return res.json(result);
  } catch (err) {
    console.error("OCR extraction error:", err);
    return res.status(500).json({ message: "OCR extraction failed", error: err.message });
  }
};

const extractBoulderFromImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "GROQ_API_KEY is not configured" });
  }

  try {
    const base64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const prompt = `You are an OCR assistant for a stone crusher business.
This is a BOULDER weighbridge slip similar to sample files named boulder.jpeg and boulder2.jpeg.
Extract the following fields from this boulder slip image and return ONLY a valid JSON object with no extra text or markdown.

Fields to extract:
- vehicleNo: vehicle registration number (e.g. CG04AB1234)
- materialType: always return "boulder"
- grossWeight: GROSS Wt in kg (numeric, no units)
- tareWeight: TARE Wt in kg (numeric, no units)
- netWeight: NET Wt in kg (numeric, no units)
- boulderDate: date from the slip in DD/MM/YYYY format
- boulderTime: time from the slip in HH:MM format if visible, otherwise ""

Return ONLY this JSON format:
{"vehicleNo":"","materialType":"boulder","grossWeight":0,"tareWeight":0,"netWeight":0,"boulderDate":"","boulderTime":""}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 256,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return res.status(502).json({ message: "Groq API request failed", detail: errText });
    }

    const groqData = await response.json();
    const rawContent = groqData?.choices?.[0]?.message?.content || "";
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(422).json({
        message: "Could not parse OCR response as JSON",
        raw: rawContent,
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const result = {
      vehicleNo: String(parsed.vehicleNo || "").trim().toUpperCase(),
      materialType: "boulder",
      grossWeight: Number(parsed.grossWeight) || 0,
      tareWeight: Number(parsed.tareWeight) || 0,
      netWeight: Number(parsed.netWeight) || 0,
      boulderDate: parseSlipDate(parsed.boulderDate || parsed.saleDate),
      boulderTime: parseSlipTime(parsed.boulderTime || parsed.saleTime),
    };

    return res.json(result);
  } catch (err) {
    console.error("Boulder OCR extraction error:", err);
    return res.status(500).json({ message: "Boulder OCR extraction failed", error: err.message });
  }
};

module.exports = { extractSaleFromImage, extractBoulderFromImage, upload };
