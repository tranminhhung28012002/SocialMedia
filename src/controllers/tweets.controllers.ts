import { TokenPayload } from '../models/requests/Users.Requests'
import tweetsService from '../services/tweets.services'
import { TweetType } from '../constants/enums'
import { Request, Response } from 'express'
import CustomRequest from '../type'
import { TweetPanamQuenyPagination, TweetRequestBody } from '../models/requests/Tweer.requests'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Thay bằng API key của bạn
})

export const createTweetController = async (req: CustomRequest<TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)
  return res.json({
    message: 'Tạo Tweet thành công',
    result
  })
}
export const getAllTweetUser = async (req: CustomRequest, res: Response) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType // Chuyển đổi kiểu query

  const limit = Number(req.query.limit as string)

  const page = Number(req.query.page as string)

  const user_id = req.params.user_id

  const { total, tweets } = await tweetsService.getAllTweetUser({
    user_id,

    tweet_type,

    limit,

    page
  })

  return res.json({
    message: 'GET tweet User thành công',

    result: {
      tweets,

      tweet_type,

      limit,

      page,

      total_page: Math.ceil(total / limit) // Tính số trang
    }
  })
}

export const getTweetController = async (req: CustomRequest, res: Response) => {
  const result = await tweetsService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: 'GET Tweet thành công',
    result: tweet
  })
}

export const getTweetChildrenController = async (
  // req: Request<TweetParam, any, any, TweetQuery> Máy TƯ chạy bình thường, đây là code đúng theo video bài 22 chương 16
  req: CustomRequest<TweetPanamQuenyPagination>, // code chạy tạm
  res: Response
) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType // Chuyển đổi kiểu query
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)

  const user_id = req.decoded_authorization?.user_id

  const { total, tweets } = await tweetsService.getTweetChildren({
    user_id,
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page
  })

  return res.json({
    message: 'GET Comments Children thành công',
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit) // Tính số trang
    }
  })
}

