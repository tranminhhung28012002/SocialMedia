import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../axios'

function NavItem({ icon, text, isActive, navigate }) {
  const navigateTo = useNavigate()
  const [notifications, setNotifications] = useState(0)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/notifications')
        const posts = response.data.data[0]?.totalReadCount || 0
        setNotifications(posts)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    fetchNotifications()
    const interval = setInterval(() => {
      fetchNotifications()
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])
  const handleClick = () => {
    if (text === 'Notifications') {
      navigateTo('/notifications')
    } else if (navigate) {
      navigateTo(navigate)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex cursor-pointer overflow-hidden gap-5 px-2.5 2xl:py-4 py-3 w-full ${isActive ? 'text-sky-500' : ''}`}
    >
      <img loading='lazy' src={icon} alt={`${text} icon`} className='object-contain shrink-0 aspect-square w-[30px]' />
      <div className='hidden xl:block grow shrink my-auto'>{text}</div>
      {notifications > 0 && text === 'Notifications' && (
        <div className='ml-auto bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
          {notifications}
        </div>
      )}
    </div>
  )
}

export default NavItem
