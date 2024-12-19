import { useEffect, useState } from 'react'
import { axiosInstance } from '../../axios'
import { useAuth } from '../../store'
import { Avatar, message, Modal } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function WhoToFollow() {
  const [users, setUsers] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axiosInstance.get('/api/listUsers')
        const allUsers = userRes.data.result
        const followRes = await axiosInstance.get(`/api/followers/${user._id}`)
        const followList = followRes.data.result.map((follower) => follower._id)
        const filteredUsers = allUsers.filter((u) => u._id !== user._id && !followList.includes(u._id))
        setUsers(filteredUsers)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [user])
  const [messageApi, contextHolder] = message.useMessage()
  return (
    <div className='flex overflow-hidden flex-col mt-4 w-full rounded-2xl bg-slate-50 '>
      {contextHolder}
      <Modal
        title='All user'
        open={openModal}
        okButtonProps={{ hidden: true }}
        onCancel={() => {
          setOpenModal(false)
        }}
      >
        <div className='overflow-scroll p-4'>
          {users.map((item, index) => (
            <div key={index} className='flex flex-col pt-2.5 w-full hover:bg-gray-200'>
              <div className='flex gap-5 justify-between mx-4 max-md:mx-2.5'>
                <div
                  className='flex gap-2.5 text-base cursor-pointer'
                  onClick={() => {
                    navigate('/profile/' + item._id)
                  }}
                >
                  {item.avatar ? (
                    <Avatar icon={<img src={item.avatar} />} className='mr-4' />
                  ) : (
                    <Avatar icon={item.avatar ? <img src={item.avatar} /> : <UserOutlined />} className='mr-4' />
                  )}
                  <div className='flex flex-col my-auto'>
                    <div className='self-start font-bold text-neutral-900'>{item.name}</div>
                    <div className='font-medium tracking-tight text-slate-500'>@{item.username}</div>
                  </div>
                </div>
                <button
                  className='overflow-hidden self-stretch px-4 py-1.5 my-auto text-base font-bold leading-none text-center text-sky-500 whitespace-nowrap rounded-full border border-sky-500 border-solid min-h-[30px]'
                  onClick={() => axiosInstance.post('/api/follow', { followed_user_id: users[index]._id })}
                >
                  Follow
                </button>
              </div>
              <div className='flex shrink-0 mt-2.5 h-px bg-gray-200' />
            </div>
          ))}
        </div>
      </Modal>
      <div className='flex flex-col pt-3 w-full text-xl font-bold text-neutral-900'>
        <div className='self-start ml-4 max-md:ml-2.5'>Who to follow</div>
        <div className='flex shrink-0 mt-2.5 h-px bg-gray-200' />
      </div>
      {users.slice(0, 2).map((item, index) => (
        <div key={index} className='flex flex-col pt-2.5 w-full hover:bg-gray-200'>
          <div className='flex gap-5 justify-between mx-4 max-md:mx-2.5'>
            <div
              className='flex gap-2.5 text-base cursor-pointer'
              onClick={() => {
                navigate('/profile/' + item._id)
              }}
            >
              {item.avatar ? (
                <Avatar icon={<img src={item.avatar} />} className='mr-4' />
              ) : (
                <Avatar icon={item.avatar ? <img src={item.avatar} /> : <UserOutlined />} className='mr-4' />
              )}
              <div className='flex flex-col my-auto'>
                <div className='self-start font-bold text-neutral-900'>{item.name}</div>
                <div className='font-medium tracking-tight text-slate-500'>@{item.username}</div>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await axiosInstance.post('/api/follow', { followed_user_id: item._id })
                  messageApi.success('Đã follow thành công')
                } catch (error) {
                  console.log(error)
                  messageApi.error('Đã có lỗi xảy ra')
                }
              }}
              className='overflow-hidden self-stretch px-4 py-1.5 my-auto text-base font-bold leading-none text-center text-sky-500 whitespace-nowrap rounded-full border border-sky-500 border-solid min-h-[30px]'
            >
              Follow
            </button>
          </div>
          <div className='flex shrink-0 mt-2.5 h-px bg-gray-200' />
        </div>
      ))}
      <div
        onClick={() => {
          setOpenModal(true)
        }}
        className='p-4 w-full cursor-pointer text-base font-medium text-sky-500'
      >
        Show more
      </div>
    </div>
  )
}

export default WhoToFollow
