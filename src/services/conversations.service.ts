import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationService {
  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    const match = {
      $or: [
        { sender_id: new ObjectId(sender_id), receiver_id: new ObjectId(receiver_id) },
        { sender_id: new ObjectId(receiver_id), receiver_id: new ObjectId(sender_id) }
      ]
    }

    const conversations = await databaseService.conversations
      .find(match)
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    const total = await databaseService.conversations.countDocuments(match)

    return { conversations, total }
  }
  async getUnreadMessages(receiver_id: string) {
    const unreadMessages = await databaseService.conversations
      .aggregate([
        {
          $match: {
            receiver_id: new ObjectId(receiver_id),
            is_read: false // Chỉ lấy các tin nhắn chưa đọc
          }
        },
        {
          $group: {
            _id: '$sender_id', // Nhóm theo sender_id
            unreadCount: { $sum: 1 } // Đếm số lượng tin nhắn chưa đọc
          }
        },
        {
          $project: {
            _id: 0, // Không hiển thị _id
            sender_id: '$_id', // Đổi tên _id thành sender_id
            unreadCount: 1 // Số lượng tin nhắn chưa đọc
          }
        }
      ])
      .toArray()

    return unreadMessages
  }
}

const conversationService = new ConversationService()
export default conversationService
