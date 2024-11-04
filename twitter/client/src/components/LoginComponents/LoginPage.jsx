import { Form, Input, message, Typography } from 'antd'
import Link from '../Link.jsx'
import Button from '../Button.jsx'
import { axiosInstance } from '../../axios.js'
import { useAuth } from '../../store.js'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

const LoginPage = () => {
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const { setUser, user } = useAuth()
  console.log(user)
  const navigate = useNavigate()
  const handleSubmit = (values) => {
    axiosInstance
      .post('/api/login', values)
      .then((res) => {
        localStorage.setItem('access_token', res.data.access_token)
        localStorage.setItem('refregh_token', res.data.refregh_token)
        axiosInstance
          .get('/api/me')
          .then((res) => {
            setUser(res.data.result)
            navigate('/home')
          })
          .catch((error) => {
            console.log(error)
          })
      })
      .catch((error) => {
        console.log(error)
        for (const key of Object.keys(error?.response?.data?.errors)) {
          messageApi.error(error?.response?.data?.errors[key].msg, 2)
        }
      })
  }

  return (
    <main className=' flex justify-around items-center px-20 text-lg  max-md:px-5 h-[100vh] '>
      <img
        src='/images/Premium Vector _ Social media marketing concept.jpg '
        alt='Social Media'
        className=' object-contain rounded-lg lg:w-5/12 display-none-md'
      />
      <div className='flex flex-col max-w-full w-[450px]'>
        {contextHolder}
        <img
          loading='lazy'
          src='https://cdn.builder.io/api/v1/image/assets/TEMP/bef80e460a0946a1cac96cf3ab2dc17be65b97af1ad29bcda78b3491d138c5d6?placeholderIfAbsent=true&apiKey=ee3b4c55f4e940649da4e87de99f1704'
          className='object-contain aspect-[1.22] w-[50px] mx-auto'
          alt='Twitter logo'
        />
        <Title level={1} className='self-start mt-9 text-5xl font-black text-black max-md:ml-2.5'>
          Welcome to Twitter
        </Title>
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
              Sign Up
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
