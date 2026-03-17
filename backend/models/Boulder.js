const mongoose = require("mongoose");

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
    vehicleWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    netWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    boulderWeight: {
      type: Number,
      required: true,
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
  }
);

boulderSchema.virtual("weight")
  .get(function getWeight() {
    return this.boulderWeight;
  })
  .set(function setWeight(value) {
    this.boulderWeight = value;
  });

boulderSchema.set("toJSON", { virtuals: true });
boulderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.models.Boulder || mongoose.model("Boulder", boulderSchema);
