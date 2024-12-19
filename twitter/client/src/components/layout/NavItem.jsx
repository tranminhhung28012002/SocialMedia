import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../axios'
import socket from '../../socket'

function NavItem({ icon, text, isActive, navigate }) {
  const navigateTo = useNavigate()
  const [notifications, setNotifications] = useState(0)
  const [message, setMessage] = useState(0)
  const fetchMessage = async () => {
    try {
      const response = await axiosInstance.get('/conversations/get')
      const count = response.data.cout[0]?.unreadCount || 0
      setMessage(count)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications')
      const posts = response.data.data[0]?.totalReadCount || 0
      setNotifications(posts)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }
  useEffect(() => {
    const handleNotification = (data) => {
      if (data.user_id) {
        fetchNotifications()
      }
    }
    socket.on('repNotifications', handleNotification)
    return () => {
      socket.off('repNotifications', handleNotification)
    }
  }, [])
  useEffect(() => {
    const handleMessage = (data) => {
      console.log(data)
      if (data.receiver_id) {
        fetchMessage()
      }
    }
    socket.on('notiMessage', handleMessage)
    return () => {
      socket.off('notiMessage', handleMessage)
    }
  }, [])
  const handleClick = () => {
    if (text === 'Notifications') {
      navigateTo('/notifications')
    } else if (navigate) {
      navigateTo(navigate)
    }
  }
  useEffect(() => {
    fetchNotifications()
    fetchMessage()
  }, [])
  return (
    <div
      onClick={handleClick}
      className={`flex cursor-pointer overflow-hidden gap-5 px-2.5 2xl:py-4 py-3 w-full ${isActive ? 'text-sky-500' : ''}`}
    >
      <img loading='lazy' src={icon} alt={`${text} icon`} className='object-contain shrink-0 aspect-square w-[30px]' />
      <div className='hidden xl:block grow shrink my-auto'>{text}</div>
      {notifications > 0 && text === 'Notifications' && (
        <div className='absolute top-[36.5%]  xl:top-[39%] 2xl:top-[39.5%] left-[27px] bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
          {notifications}
        </div>
      )}
      {message > 0 && text === 'Messages' && (
        <div className='absolute top-[47%] left-7 2xl:top-[51.5%] xl:top-[50%] bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
          {message}
        </div>
      )}
    </div>
  )
}

export default NavItem
