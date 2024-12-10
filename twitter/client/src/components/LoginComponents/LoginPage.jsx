import { Form, Input, Typography } from 'antd'
import { toast } from 'react-toastify'
import Link from '../Link.jsx'
import Button from '../Button.jsx'
import { axiosInstance } from '../../axios.js'
import { useAuth } from '../../store.js'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const { Title } = Typography

const LoginPage = () => {
  const [form] = Form.useForm()
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [err, setErr] = useState('')
  const handleSubmit = async (values) => {
    try {
      const adminLoginResponse = await axiosInstance.post('/admin/login', values)
      localStorage.setItem('access_token', adminLoginResponse.data.result.access_token)
      localStorage.setItem('refresh_token', adminLoginResponse.data.result.refresh_token)
      const adminInfoResponse = await axiosInstance.get('/me')
      const adminData = adminInfoResponse.data.result
      setUser(adminData)
      setTimeout(() => {
        navigate('/admin')
      }, 2000) // điều chỉnh lại
    } catch {
      try {
        const userLoginResponse = await axiosInstance.post('/api/login', values)
        localStorage.setItem('access_token', userLoginResponse.data.access_token)
        localStorage.setItem('refresh_token', userLoginResponse.data.refresh_token)

        toast.success('Đăng nhập User thành công!')
        const userInfoResponse = await axiosInstance.get('/api/me')
        const userData = userInfoResponse.data.result
        setUser(userData)
        setTimeout(() => {
          navigate('/home')
        }, 2000)
      } catch (userError) {
        setErr(userError?.response?.data?.errors.email.msg)
      }
    }
  }

  return (
    <main className='flex overflow-hidden items-center text-lg bg-white'>
      <img loading='lazy' src='./images/VAsocial.svg' className='object-cover w-[60%]' alt='Twitter logo' />
      <div className='flex flex-col w-[450px] bg-slate-200 p-5 rounded-md'>
        <Title level={1} className='self-start mt-9 text-5xl font-black text-black max-md:ml-2.5'>
          Log in to VAsocial
        </Title>
        {err && <p className='text-red-500'>{err}</p>}
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name='email'
            rules={[
              { required: true, message: 'Please input your email or phone number!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input
              type='text'
              placeholder='Phone number, email address'
              className='mt-9 h-16'
              aria-label='Phone number or email address'
            />
          </Form.Item>
          <Form.Item name='password' rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input type='password' placeholder='Password' className='mt-6 h-16' aria-label='Password' />
          </Form.Item>
          <Form.Item>
            <Button className='mt-6 w-full h-12' htmlType='submit'>
              Log In
            </Button>
          </Form.Item>
        </Form>
        <div className='flex gap-5 justify-between mt-10 text-sky-500 max-md:max-w-full'>
          <Link href='/forgot-password'>Forgot password?</Link>
          <Link href='/register'>Sign up to Twitter</Link>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
