const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    capacityCubicMeter: {
      type: Number,
      default: 0,
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

vehicleSchema.index({ userId: 1, vehicleNo: 1 }, { unique: true });
vehicleSchema.index({ userId: 1, vehicleType: 1, createdAt: -1 });

module.exports = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
