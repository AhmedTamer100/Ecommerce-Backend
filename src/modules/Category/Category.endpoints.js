import { systemRoles } from "../../utils/systemRoles.js";

export const CategoryRoles = {
    CREATE_CATEGORY:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    UPDATE_CATEGORY:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    DELETE_CATEGORY:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN]
}