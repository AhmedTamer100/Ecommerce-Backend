import { systemRoles } from '../../utils/systemRoles.js'
export const orderApisRoles = {
  DELIVERE_ORDER: [systemRoles.ADMIN],
  MAKE_ORDER:[systemRoles.USER]
}
