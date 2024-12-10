import { useState } from 'react'
import { MdOutlinePassword } from 'react-icons/md'
import { axiosInstance } from '../../axios'

const EditPasswordProfile = () => {
  const [openResetPassModal, setOpenResetPassModal] = useState(false)
  const [password, setPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleClose = () => {
    setOpenResetPassModal(false)
    setError('')
    setPassword('')
    setOldPassword('')
    setConfirmPassword('')
  }

  const handleSave = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,50}$/

    if (!passwordRegex.test(password)) {
      setError(
        'Mật khẩu mới phải dài từ 6-50 ký tự, chứa ít nhất 1 chữ cái thường, 1 chữ cái in hoa, 1 số và 1 ký tự đặc biệt.'
      )
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp với mật khẩu mới.')
      return
    }
    try {
      const updatedData = {
        old_password: oldPassword,
        password: password,
        confirm_password: confirmPassword
      }
      await axiosInstance.put('/api/change-password', updatedData)
      alert('Cập nhật mật khẩu thành công!')
      handleClose()
    } catch {
      setError('Mật khẩu cũ không đúng')
    }
  }
  return (
    <div>
      <div className='relative group'>
        <MdOutlinePassword
          onClick={() => {
            setOpenResetPassModal(true)
          }}
          className='mt-2.5 text-black rounded-full border border-black h-[30px] w-[30px] cursor-pointer'
        />
        <div className='absolute right-[-50%] top-[105%] hidden group-hover:block bg-slate-200 text-black text-[10px] px-2 py-2 rounded-md w-[60px] text-center'>
          Password
        </div>
      </div>
      {openResetPassModal && (
        <div>
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white rounded-lg shadow-lg p-6 w-1/4'>
              <h2 className='text-xl font-bold mb-4 text-center text-gray-800'>Edit Password</h2>
              {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
              <div className='xl:mt-7 mt-3 grid grid-cols-1 lg:gap-4'>
                <div>
                  <p className='text-gray-600 font-medium text-lg'>Old password</p>
                  <input
                    type='password'
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                    placeholder='Old password'
                  />
                </div>
                <div>
                  <p className='text-gray-600 font-medium text-lg'>New Password</p>
                  <input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                    placeholder='New Password'
                  />
                </div>
                <div>
                  <p className='text-gray-600 font-medium text-lg'>Confirm password</p>
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                    placeholder='Confirm password'
                  />
                </div>
              </div>
              <div className='flex justify-between mt-7'>
                <button onClick={handleSave} className='bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600'>
                  Save
                </button>
                <button
                  onClick={handleClose}
                  className='border-red-100 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditPasswordProfile
