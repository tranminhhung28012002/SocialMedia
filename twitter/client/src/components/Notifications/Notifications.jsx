import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../axios'
import socket from '../../socket'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    socket.on('newNotification', (newNotification) => {
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/notifications')
        const posts = response.data.data[0]?.posts || []
        setNotifications(posts)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    fetchNotifications()
  }, [])

  const handleNotificationClick = (notificationId, tweetId) => {
    axiosInstance
      .put(`/notifications/${notificationId}`, { isRead: true })
      .then(() => {})
      .catch((error) => {
        console.error('Error updating notification status:', error)
      })
    navigate(`/tweet/${tweetId}`)
  }
  return (
    <div className='flex overflow-hidden flex-col px-px mt-flex max-w-600px h-screen w-[600px] max-lg:mt-0 border-x-2'>
      <h1 className='text-5xll font-semibold mb-4 text-gray-800'>Notifications</h1>
      <div className='flex flex-col gap-4 overflow-y-auto scrollbar-chatbox'>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className='flex items-start gap-3 p-4 border-y-2 bg-white cursor-pointer hover:bg-gray-50'
              onClick={() => handleNotificationClick(notification._id, notification.TweetId)} // Sửa ở đây
            >
              <img
                src={notification.actorId.avatar || './images/iconavatar.jpg'}
                alt='User avatar'
                className='w-10 h-10 rounded-full border-2'
              />
              <div className='flex flex-col'>
                <div className='flex gap-1'>
                  <p className='text-lg text-gray-800'>
                    <strong>{notification.actorId.name}</strong>
                  </p>
                  <p className='text-lg text-gray-600'>{notification.message}</p>
                </div>
                <span className='text-xs text-gray-500'>
                  {new Date(notification.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
              {!notification.isRead && <span className='w-3 h-3 bg-blue-500 rounded-full self-center'></span>}
            </div>
          ))
        ) : (
          <p className='text-gray-500 text-sm'>Bạn không có thông báo nào.</p>
        )}
      </div>
    </div>
  )
}

export default Notifications
