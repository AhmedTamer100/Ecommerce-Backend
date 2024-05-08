
import { couponModel } from '../../DB/Models/coupon.model.js'
import moment from 'moment-timezone'


export const couponValidationFunction = async ({ couponCode, userID, next }) => {
  if (!userID) {
    return { msg: 'User ID is undefined' };
  }

  const coupon = await couponModel
    .findOne({ couponCode })
    .select('isFixedAmount isPercentage couponAmount couponAssginedToUsers');

  if (!coupon) {
    return { msg: 'Coupon not found' };
  }

  if (!coupon.couponAssginedToUsers.some((user) => user.userId.toString() === userID.toString())) {
    return { msg: 'Coupon not assigned to this user' };
  }

  const now = moment().tz('Africa/Cairo');
  const isExpired = coupon.expiryDate && moment(coupon.expiryDate).isBefore(now);
  if (isExpired) {
    return { msg: 'Coupon is expired' };
  }

  return true;
};
