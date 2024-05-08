//=============================Routers=================================
import userRouter from './Users/user.routes.js'
import categoryRouter from './Category/category.routes.js'
import subCategoryRouter from './subCategories/subcategory.routes.js'
import brandRouter from './Brands/brand.routes.js'
import productRouter from './Products/product.routes.js'
import couponRouter from './Coupons/coupons.routes.js'
import cartRouter from './Carts/cart.routes.js'
import orderRouter from './Orders/orders.routes.js'
import reviewRouter from './Reviews/review.routes.js'

export {
    userRouter,
    categoryRouter,
    subCategoryRouter,
    brandRouter,
    productRouter,
    couponRouter,
    cartRouter,
    orderRouter,
    reviewRouter
}