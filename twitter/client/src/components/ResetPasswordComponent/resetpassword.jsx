import axios from 'axios'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()

  // Chỉ lấy token từ state
  const { token } = location.state || {}
  console.log('Token from URL:', token)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.')
      return
    }

    if (!token) {
      setError('Không tìm thấy token.')
      return
    }

    try {
      await axios.post('http://localhost:3000/api/reset-password', {
        password: newPassword,
        confirm_password: confirmPassword,
        forgot_password_token: token
      })
      toast.success('Đổi mật khẩu thành công')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Đổi mật khẩu không thành công.')
      } else {
        setError('Đã xảy ra lỗi không xác định.')
      }
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 bg-white rounded shadow-lg'>
        <h2 className='mb-4 text-2xl font-bold text-center text-gray-800'>Reset Password</h2>
        <p className='mb-6 text-center text-gray-600'>Nhập mật khẩu mới để tiếp tục.</p>
        {error && <p className='mb-4 text-sm text-red-500'>{error}</p>}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <input
              type='password'
              placeholder='Mật khẩu mới'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='w-full px-3 bg-white text-black py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500'
            />
          </div>
          <div>
            <input
              type='password'
              placeholder='Xác nhận mật khẩu mới'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full bg-white text-black px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500'
            />
          </div>
          <button type='submit' className='w-full py-2 text-white bg-sky-500 rounded hover:bg-sky-600'>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}
