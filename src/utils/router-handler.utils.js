import { globalErrorHandler } from "../Middleware/error-handler.middleware.js"
import authController from "../Modules/Auth/auth.controller.js"
import noteController from "../Modules/Note/note.controller.js"








const routerHandler = (app) => {

    app.use('/auth', authController)
    app.use('/note', noteController)

    app.use(globalErrorHandler)
}


export default routerHandler