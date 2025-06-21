  const mongoose = require("mongoose");
  const bcrypt = require("bcryptjs");
  const crypto = require("crypto");

  const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: [true, "First Name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
    },
    about: String,
    avatar: String,
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: function (email) {
          return String(email)
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        },
        message: (props) => `Email (${props.value}) is invalid!`,
      },
    },
    password: {
      type: String,
      select: false, // do not return password by default
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
    verified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otp_expiry_time: Date,
    friends: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    socket_id: String,
    status: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
    },
  });

  // 🔐 Hash password and OTP before saving
  userSchema.pre("save", async function (next) {
    // Only hash password if it's modified or new
    if (this.isModified("password") && this.password) {
      this.password = await bcrypt.hash(this.password, 12);
      this.passwordChangedAt = Date.now() - 1000; // adjust for token issuance timing
    }

    // Hash OTP if it's modified
    if (this.isModified("otp") && this.otp) {
      this.otp = await bcrypt.hash(this.otp.toString(), 12);
    }

    next();
  });

  // 🔐 Compare login password
  userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

  // 🔐 Compare OTP
  userSchema.methods.correctOTP = async function (candidateOTP, userOTP) {
    return await bcrypt.compare(candidateOTP, userOTP);
  };

  // 🔐 Check if password was changed after the token was issued
  userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimeStamp < changedTimestamp;
    }
    return false;
  };

  // 🔐 Generate password reset token
  userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
  };

  const User = mongoose.model("User", userSchema);
  module.exports = User;
