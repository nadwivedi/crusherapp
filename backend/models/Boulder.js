const mongoose = require("mongoose");

const getCurrentTime = () => {
  const now = new Date();
  const hours = `${now.getHours()}`.padStart(2, "0");
  const minutes = `${now.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
};

const boulderSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    vehicleNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    boulderNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    grossWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    tareWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    netWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    boulderDate: {
      type: Date,
      default: Date.now,
    },
    boulderTime: {
      type: String,
      trim: true,
      default: getCurrentTime,
    },
    slipImg: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Boulder || mongoose.model("Boulder", boulderSchema);
