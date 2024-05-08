import { systemRoles } from "../../utils/systemRoles.js";

export const brandRoles={
    CREATE_BRAND:[systemRoles.ADMIN,systemRoles.USER],
    UPDATE_BRAND:[systemRoles.ADMIN,systemRoles.USER],
    DELETE_BRAND:[systemRoles.ADMIN,systemRoles.USER]
}