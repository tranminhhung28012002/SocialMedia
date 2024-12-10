import { useState } from 'react'
import { Card, Avatar, Button, Input } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { axiosInstance } from '../../axios'

const { TextArea } = Input

const Comment = ({ comment, id, parent_id, user_id, reload, setReload }) => {
  const [replyVisible, setReplyVisible] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(
        2,
        '0'
      )}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
  }

  const handleReply = async () => {
    if (!replyContent.trim()) {
      return
    }

    try {
      // Gửi thông báo
      await axiosInstance.post('/createNotification', {
        TweetId: parent_id,
        ownerId: user_id,
        actionType: 'comment'
      })
      const data = {
        type: 2,
        audience: 0,
        content: replyContent,
        parent_id,
        hashtags: [],
        mentions: [],
        medias: [],
        repcomment: id
      }
      await axiosInstance.post('http://localhost:3000/tweets', data)
      setReload((prev) => !prev)
    } catch (error) {
      console.error('Lỗi khi phản hồi:', error)
    }

    setReplyContent('')
    setReplyVisible(false)
  }

  return (
    <div className='mb-4'>
      {/* Parent Comment */}
      <Card bordered={false} className='mb-2 shadow-sm rounded-md'>
        <div className='flex items-start'>
          <Avatar
            icon={comment?.user?.avatar ? <img src={comment.user.avatar} alt='User Avatar' /> : <UserOutlined />}
            className='mr-4'
          />
          <div>
            <h4 className='font-semibold'>{comment?.user?.name || 'Người dùng ẩn danh'}</h4>
            <p className='text-gray-700 mt-1'>{comment?.content || 'Nội dung không tồn tại.'}</p>
            <div className='flex items-center text-gray-500 mt-2 space-x-4'>
              <span className='text-black'>{formatDate(comment?.created_at || new Date())}</span>
              <Button type='link' className='p-0' onClick={() => setReplyVisible(!replyVisible)}>
                Phản hồi
              </Button>
            </div>
            {/* Reply Input */}
            {replyVisible && (
              <div className='mt-4'>
                <TextArea
                  rows={2}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder='Viết phản hồi của bạn...'
                />
                <div className='flex justify-end mt-2'>
                  <Button type='primary' onClick={handleReply}>
                    Gửi
                  </Button>
                  <Button className='ml-2' onClick={() => setReplyVisible(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Replies */}
      {comment?.children?.map((reply) => (
        <div key={reply._id} className='ml-12'>
          <Comment
            comment={reply}
            id={reply._id}
            parent_id={reply.parent_id}
            user_id={user_id}
            setReload={setReload}
            reload={reload}
          />
        </div>
      ))}
    </div>
  )
}

export default Comment
