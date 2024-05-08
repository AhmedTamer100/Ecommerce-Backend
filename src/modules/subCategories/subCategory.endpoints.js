import { systemRoles } from "../../utils/systemRoles.js";

export const subCategoryRoles = {
    CREATE_SUBCATEGORY:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    UPDATE_SUBCATEGORY:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    DELETE_SUBCATEGORY:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN]
}