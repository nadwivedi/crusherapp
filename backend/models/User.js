const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    district: {
      type: String,
      trim: true,
      default: "",
    },
    featureAccess: {
      saleReturn: {
        type: Boolean,
        default: false,
      },
      stockAdjustment: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
