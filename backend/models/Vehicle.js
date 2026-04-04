const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      default: null,
    },
    vehicleNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    unladenWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    vehicleType: {
      type: String,
      enum: ["boulder", "sales"],
      default: "sales",
    },
    rcImg: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
