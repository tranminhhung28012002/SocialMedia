import { changePasswordValidator, followValidator, refreshTokenValidator, unfollowValidator } from './../middlewares/users.middlewares'
import { wrapRequestHandler } from './../../utils/handlerl'
import { validate } from './../../utils/validation'
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getListUsersController,
  getMeController,
  getProfileController,
  getUsersForFollow,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendverifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '../controllers/users.controllers'
import { Router } from 'express'
import {
  accessTokenValidatetor,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  LoginValidator,
  // refreshTokenValidator,
  registerValidator,
  resetPasswordTokenValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '../middlewares/users.middlewares'
import { UpdateMeReqBody } from '../models/requests/Users.Requests'
import { filterMiddleware } from '../middlewares/common.middlewares'

const UserRouter = Router()

//Khi một yêu cầu POST được gửi đến /login, dữ liệu từ các trường trong form email or password (vidu như form đăng nhập) sẽ có sẵn trong req.body
//và muốn  lấy được các dử liệu đó trong controler thì bạn hảy dùng  const { email, password } = req.body thì các trường sẽ đc use
UserRouter.post('/login', LoginValidator, wrapRequestHandler(loginController))

//UserRouter.post('/register', validate(registerValidator), registerController) khi chạy http này thì khi nhập các dử liệu lưu hết vào UserRouter.post('/register') của express và registerController muốn lấy dử liệu chỉ cần req.body
//khi qua registerController thì (req: Request, res: Response) để sử dụng các trường vừa nhập
UserRouter.post('/register', validate(registerValidator), wrapRequestHandler(registerController))

UserRouter.post('/logout', accessTokenValidatetor, wrapRequestHandler(logoutController))

UserRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))


export default UserRouter
