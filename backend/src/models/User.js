const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, default: null, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  googleId: { type: String, default: null, index: true },
  coins: { type: Number, default: 50, min: 0 },
  lastDailyBonus: { type: Date, default: null },
  verifyTokenHash: { type: String, default: null },
  verifyTokenExpires: { type: Date, default: null },
  resetTokenHash: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verifyTokenHash;
  delete obj.resetTokenHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
