import { scheduleJob } from 'node-schedule'
import { couponModel } from '../../DB/Models/coupon.model.js'
import moment from 'moment-timezone'

//====================  change couponStatus ================
export const changeCouponStatusCron = () => {
  scheduleJob('0 0 */12 * *', async function () {
    const validCoupons = await couponModel.find({ couponStatus: 'Valid' })
    for (const coupon of validCoupons) {
      if (moment(coupon.toDate).isBefore(moment().tz('Africa/Cairo'))) {
        coupon.couponStatus = 'Expired'
      }
      await coupon.save()
    }
    console.log(`Coupon Status Is Running At ${moment().tz('Africa/Cairo')}`)
  })

}



