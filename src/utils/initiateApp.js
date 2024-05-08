import { Connection } from "../../DB/connection.js"
import cors from 'cors'
import * as routers from '../modules/index.routes.js'
export const IntiateApp=(app,express)=>{
    const port = process.env.PORT
    app.use(express.json())
    Connection()
    app.use(cors())
    app.use('/user',routers.userRouter)
    app.use('/category',routers.categoryRouter)
    app.use('/subCategory',routers.subCategoryRouter)
    app.use('/brand',routers.brandRouter)
    app.use('/product',routers.productRouter)
    app.use('/coupon',routers.couponRouter)
    app.use('/order',routers.orderRouter)
    app.use('/cart',routers.cartRouter)
    app.use('/review',routers.reviewRouter)

    app.all('*',(req,res,next)=>{
        res.status(404).json({message:'404 Not Found URL'})
    })

    app.listen(port,()=>{console.log('Server Connected')})
}   