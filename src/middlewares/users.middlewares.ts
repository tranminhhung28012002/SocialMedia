import { Request, Response, NextFunction } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import usersService from '../services/users.services'
import { USERS_MESSAGES } from '../constants/Messager'
import { validate } from '../../utils/validation'
import databaseService from '../services/database.services'
import { hashPassword } from '../../utils/crypto'
import { verifyToken } from '../../utils/jwt'
import { ErrorWithStatus } from '../models/Errors'
import HTTP_STATUS from '../constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import CustomRequest from '../type'
import { TokenPayload } from '../models/requests/Users.Requests'
import { UserVerifyStatus } from '../constants/enums'
import { REGEX_USERNAME } from '../constants/regex'
import { verifyAccessToken } from '../../utils/commons'



//checkSchema là một kiểu mà đc cài đặt vào để kiểm tra điều kiện của các trường nhập của registerValidator
export const registerValidator = checkSchema({
  name: {
    notEmpty: {
      errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
    },
    isString: {
      errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
    },
    isLength: {
      options: {
        min: 1,
        max: 100
      },
      errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
    },
    trim: true
  },

  email: {
    notEmpty: {
      errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIREA
    },
    isEmail: {
      errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
    },
    trim: true,
    custom: {
      options: async (value) => {
        //hàm nhận giá trị value là giá trị của trường mail từ yêu cầu đầu vào.
        const result = await usersService.checkEmailExist(value)
        if (result) {
          //nếu mà email tồn tại thì báo lổi
          throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXSTS)
        } //Giá trị trả về return result (trong trường hợp này là false) thường không được sử dụng trực tiếp trong các bước tiếp theo, mà chỉ để đảm bảo rằng hàm đã thực thi mà không có lỗi.
        return true //đến chổ này thì là ko có lổi nó sẽ qua bên controler để thực hiện đăng ký
      }
    }
  },
  password: {
    notEmpty: {
      errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIREA
    },
    isString: {
      errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
    },
    isLength: {
      options: {
        min: 6,
        max: 50
      },
      errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_FROM_6_TO_50
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      },
      errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRONG
    }
  },

  confirm_password: {
    notEmpty: {
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
    },
    isString: {
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
    },
    isLength: {
      options: {
        min: 6,
        max: 50
      },
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      },
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
        }
        return true
      }
    }
  },

  date_of_birth: {
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true
      },
      errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_IS08601
    }
  }
})
