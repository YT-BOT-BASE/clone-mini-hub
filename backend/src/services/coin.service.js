const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PlatformSettings = require('../models/PlatformSettings');

async function getStartingCoins() {
  return Number(await PlatformSettings.get('startingCoins', 50));
}
async function getDailyBonus() {
  return Number(await PlatformSettings.get('dailyBonus', 50));
}

// Atomic coin deduction: only succeeds if balance is enough. Returns new balance.
async function deductCoins(userId, amount, { description = '', apiEndpoint = '', requestId = '' } = {}) {
  if (amount <= 0) {
    const u = await User.findById(userId).select('coins');
    return { success: true, balance: u ? u.coins : 0 };
  }
  const updated = await User.findOneAndUpdate(
    { _id: userId, coins: { $gte: amount } },
    { $inc: { coins: -amount } },
    { new: true }
  );
  if (!updated) {
    const u = await User.findById(userId).select('coins');
    return { success: false, balance: u ? u.coins : 0, error: 'INSUFFICIENT_COINS' };
  }
  await Transaction.create({
    user: userId, type: 'API_USAGE', amount: -amount, balanceAfter: updated.coins,
    description, apiEndpoint, requestId,
  });
  return { success: true, balance: updated.coins };
}

async function refundCoins(userId, amount, { description = 'Refund for failed request', requestId = '' } = {}) {
  if (amount <= 0) return { success: true };
  const updated = await User.findByIdAndUpdate(userId, { $inc: { coins: amount } }, { new: true });
  if (!updated) return { success: false };
  await Transaction.create({
    user: userId, type: 'REFUND', amount, balanceAfter: updated.coins, description, requestId,
  });
  return { success: true, balance: updated.coins };
}

async function addCoins(userId, amount, type = 'ADMIN_ADJUST', description = '') {
  const updated = await User.findByIdAndUpdate(userId, { $inc: { coins: amount } }, { new: true });
  if (!updated) return null;
  await Transaction.create({ user: userId, type, amount, balanceAfter: updated.coins, description });
  return updated;
}

async function claimDailyBonus(userId) {
  const bonus = await getDailyBonus();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const user = await User.findById(userId);
  if (!user) return { success: false, error: 'USER_NOT_FOUND' };
  if (user.lastDailyBonus && new Date(user.lastDailyBonus) >= startOfDay) {
    return { success: false, error: 'ALREADY_CLAIMED_TODAY', balance: user.coins };
  }
  const updated = await User.findByIdAndUpdate(
    userId,
    { $inc: { coins: bonus }, $set: { lastDailyBonus: now } },
    { new: true }
  );
  await Transaction.create({ user: userId, type: 'DAILY_BONUS', amount: bonus, balanceAfter: updated.coins, description: 'Daily bonus' });
  return { success: true, balance: updated.coins, bonus };
}

module.exports = { getStartingCoins, getDailyBonus, deductCoins, refundCoins, addCoins, claimDailyBonus };
