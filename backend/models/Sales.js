const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    vehicleNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    stoneSize: {
      type: String,
      required: true,
      enum: ["10mm", "20mm", "40mm", "dust", "wmm", "gsb"],
      lowercase: true,
      trim: true,
    },
    vehicleWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    netWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    materialWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    slipImg: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

salesSchema.virtual("party")
  .get(function partyGetter() {
    return this.partyId;
  })
  .set(function partySetter(value) {
    this.partyId = value;
  });

salesSchema.virtual("materialType")
  .get(function materialTypeGetter() {
    return this.stoneSize;
  })
  .set(function materialTypeSetter(value) {
    this.stoneSize = value;
  });

module.exports = mongoose.models.Sales || mongoose.model("Sales", salesSchema);
