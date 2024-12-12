import { numberEnumToArray } from './../../utils/commons'
import { checkSchema } from 'express-validator'
import { validate } from '../../utils/validation'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '../constants/enums'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '../constants/Messager'
import { ObjectId } from 'mongodb'
import { isEmpty } from 'lodash'
import databaseService from '../services/database.services'
import HTTP_STATUS from '../constants/httpStatus'
import { ErrorWithStatus } from '../models/Errors'
import Tweet from '../models/schemas/Tweet.shema'
import Request from '../type'
import { NextFunction, Response } from 'express'
import { wrapRequestHandler } from '../../utils/handlerl'
import CustomRequest from '../type'

const tweetType = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetType],
        errorMessage: TWEETS_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudiences],
        errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          // Nếu 'type' là retweet, comment, quotetweet thi 'parent_id' phải là 'tweet_id' ca tweet cha
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          // nếu 'type' là tweet thi 'parent_id' phai là 'null'
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          // Nếu 'type' là comment, quotetweet, tweet và không có 'mentions' và'hashtags' thì 'content' phải là string và không được rỗng
          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          // Nếu 'type' là retweet thi 'content' phải là " '.
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần từ trong array là string
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần từ trong array là Media ObjectId
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần từ trong array là Media Object
          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
            })
          ) {
            throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECTS)
          }
          return true
        }
      }
    }
  })
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,

                message: TWEETS_MESSAGES.INVALID_TWEET_ID
              })
            }

            const [tweet] = await databaseService.tweets

              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },

                {
                  $lookup: {
                    from: 'users',

                    localField: 'user_id',

                    foreignField: '_id',

                    as: 'user'
                  }
                },

                {
                  $unwind: {
                    path: '$user'
                  }
                },

                {
                  $lookup: {
                    from: 'hashtags',

                    localField: 'hashtags',

                    foreignField: '_id',

                    as: 'hashtags'
                  }
                },

                {
                  $lookup: {
                    from: 'users',

                    localField: 'mentions',

                    foreignField: '_id',

                    as: 'mentions'
                  }
                },

                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',

                        as: 'mention',

                        in: {
                          _id: '$$mention._id',

                          name: '$$mention.name',

                          username: '$$mention.username',

                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },

                {
                  $lookup: {
                    from: 'bookmarks',

                    localField: '_id',

                    foreignField: 'tweet_id',

                    as: 'bookmarks'
                  }
                },

                {
                  $lookup: {
                    from: 'likes',

                    localField: '_id',

                    foreignField: 'tweet_id',

                    as: 'likes'
                  }
                },

                {
                  $lookup: {
                    from: 'tweets',

                    localField: '_id',

                    foreignField: 'parent_id',

                    as: 'tweet_children'
                  }
                },

                {
                  $addFields: {
                    bookmarks: {
                      $size: '$bookmarks'
                    },

                    likes: {
                      $size: '$likes'
                    },

                    retweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',

                          as: 'item',

                          cond: {
                            $eq: ['$$item.type', TweetType.Retweet]
                          }
                        }
                      }
                    },

                    commet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',

                          as: 'item',

                          cond: {
                            $eq: ['$$item.type', TweetType.Comment]
                          }
                        }
                      }
                    },

                    quote_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',

                          as: 'item',

                          cond: {
                            $eq: ['$$item.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    },

                    views: {
                      $add: ['$user_views', '$guest_views']
                    }
                  }
                },

                {
                  $project: {
                    tweet_children: 0 //dùng để ẩn đi tweet_children
                  }
                }
              ])

              .toArray()

            //console.log(tweet)

            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,

                message: TWEETS_MESSAGES.TWEET_NOT_FOUND
              })
            }

            ;(req as CustomRequest).tweet = tweet

            return true
          }
        }
      }
    },

    ['params', 'body']
  )
)

// Muốn sử dụng async await trong handler express thi phải có try catch
// Nếu không dùng try catch thì phải dùng wrapRequestHandler
export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet

  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Kiểm tra người xem tweet này đã đăng nhập hay chưa
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      })
    }

    // Lấy tác giả của tweet
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })

    // Kiểm tra tài khoản tác giả có ổn (bị khóa hay bị xóa chưa) không
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USERS_NOT_FOUND
      })
    }

    const { user_id } = req.decoded_authorization

    // đoạn này được sửa: Thêm kiểm tra xem `twitter_circle` đã được xác định chưa và có phải là một mảng không
    // const isInTwitterCircle =
    //   Array.isArray(author.twitter_circle) &&
    //   author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    const isInTwitterCircle = author.twitter_circle.some((user_cincle_id) => user_cincle_id.equals(user_id))

    // Nếu bạn không phải là tác giả và không nằm trong twitter circle thì quăng lỗi
    if (!author._id.equals(user_id) && !isInTwitterCircle) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next()
})

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetType],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
