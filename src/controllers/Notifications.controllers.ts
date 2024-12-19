import { ObjectId } from 'mongodb'
import CustomRequest from '../type'
import { TokenPayload } from '../models/requests/Users.Requests'
import { CreateNotifi } from '../models/requests/Notification.request'
import notificationService from '../services/Notifications.services'
import { Request, Response } from 'express'
import databaseService from '../services/database.services'

export const createNotification = async (req: CustomRequest<CreateNotifi>, res: Response) => {
  try {
    const actorId = req.decoded_authorization as TokenPayload
    const user_id = new ObjectId(actorId.user_id)
    const result = await notificationService.createNotification(user_id, req.body)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false })
  }
}

export const getNotificationsByOwner = async (req: CustomRequest, res: Response) => {
  try {
    const ownerId = req.decoded_authorization as TokenPayload
    const user_id = new ObjectId(ownerId.user_id)
    const notifications = await notificationService.getNotificationsByOwner(user_id)

    res.status(200).json({
      success: true,
      data: notifications
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: ' loi '
    })
  }
}
export const updateNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params
    const objectId = new ObjectId(notificationId)
    const result = await databaseService.Notifications.updateOne({ _id: objectId }, { $set: { isRead: true } })

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Notification not found or already updated' })
    }
    res.status(200).json({ message: 'Notification marked as read successfully' })
  } catch (error) {
    console.error('Error updating notification:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
