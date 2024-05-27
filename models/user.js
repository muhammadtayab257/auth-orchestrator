const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    twoFaSettings: {
      TwoFaRequired: {
        type: Boolean,
        required: true,
      },
      TwoFaType: {
        type: String,
        enum: ["email", "sms", "none"],
        default: "none",
      },
      TwoFaValue: {
        type: String,
        default: null,
      },
      otpExpires: {
        type: Date,
        required: false,
      },
    },
    emailVerificationSettings: {
      emailVerified: {
        type: Boolean,
        required: true,
      },
      emailVerificationLink: {
        type: String,
        required: false,
        default: null,
      },
      emailVerificationLinkExpires: {
        type: Date,
        required: false,
      },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema);
module.exports = User;
