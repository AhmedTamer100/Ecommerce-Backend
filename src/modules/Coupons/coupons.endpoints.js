import { systemRoles } from "../../utils/systemRoles.js";

export const couponApisRoles={
    CREATE_COUPON:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    UPDATE_COUPON:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    DELETE_COUPON:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    GET_ALL_COUP:[systemRoles.ADMIN]
}