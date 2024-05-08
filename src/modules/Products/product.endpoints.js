import { systemRoles } from "../../utils/systemRoles.js";

export const ProductRoles = {
    CREATE_PRODUCT:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    UPDATE_PRODUCT:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    DELETE_PRODUCT:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
}