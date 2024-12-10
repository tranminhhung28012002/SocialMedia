import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useQueryParams from './useQueryParams'
import axios from 'axios'

export default function VerifyForgotpassword() {
  const [message, setMessage] = useState(null)
  const { token } = useQueryParams()
  const navigate = useNavigate()

  useEffect(() => {
    const controller = new AbortController()
    if (token) {
      axios
        .post(
          'http://localhost:3000/api/verify-forgot-password',
          { forgot_password_token: token },
          {
            signal: controller.signal
          }
        )
        .then((res) => {
          const successMessage = res.data.message
          console.log('successMessage', successMessage)
          setMessage(successMessage)
          navigate('/reset-password', {
            state: {
              message: successMessage,
              token
            }
          })
        })
        .catch((err) => {
          setMessage(err.response?.data?.message || 'Có lỗi xảy ra')
        })
    }

    return () => {
      controller.abort()
    }
  }, [token, navigate])

  return <div>{message}</div>
}
