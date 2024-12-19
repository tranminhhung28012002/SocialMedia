import { useEffect, useState } from 'react'
import Tweet from '../layout/Tweet'
import { axiosInstance } from '../../axios'
import { useAuth } from '../../store'
import moment from 'moment'
import { useSearchParams } from 'react-router-dom'
import ChildTweet from '../layout/ChildTweet'
import WhoToFollow from '../layout/WhoToFollow'

function Search() {
  const [trendingData, setTrendingData] = useState([])
  const [tweets, setTweets] = useState([])
  const [reload, setReload] = useState(false)
  const { setUser } = useAuth()
  const [query] = useSearchParams()
  const content = query.get('q')
  useEffect(() => {
    axiosInstance
      .get('/search', { params: { page: 1, limit: 100, content } })
      .then((res) => {
        setTweets(
          res.data.result.tweets.map((v) => {
            return {
              ...v,
              id: v._id,
              author: v.user.name,
              handle: '@' + v.user.username,
              avatar: v.user.avatar,
              time: moment(v.created_at).format('DD/MM/YYYY HH:mm'),
              content: v.content,
              image: v.medias[0]?.url || null,
              stats: {
                comments: v.comment_count,
                retweets: v.retweet_count,
                likes: v.likes,
                views: v.bookmarks
              }
            }
          })
        )
      })
      .catch((error) => {
        console.log(error)
        if (error.response.status === 401) {
          setUser(null)
        }
      })
  }, [reload, content])
  useEffect(() => {
    fetch('https://www.reddit.com/r/all/top.json?limit=5')
      .then((response) => response.json())
      .then((data) => {
        const posts = data.data.children.map((post) => ({
          title: post.data.title,
          url: post.data.url,
          score: post.data.score
        }))
        setTrendingData(posts)
      })
      .catch((error) => {
        console.error('Error fetching trending data:', error)
      })
  }, [])
  return (
    <main className='flex overflow-hidden flex-col px-px mt-0 max-w-full w-[600px] max-md:mt-0 border-x-[1px] border-gray-300'>
      <header className='flex overflow-hidden flex-col px-4 mt-1 w-full text-xl max-w-[598px] text-neutral-900'>
        <div>
          <input
            className='w-full bg-gray-200 text-black  px-4 py-2 rounded-lg focus:outline-none'
            type='text'
            placeholder='Search'
          />
        </div>
      </header>
      <main className=''>
        <div className='mt-6 text-black'>
          <h2 className='text-xl font-semibold'>Trending Posts</h2>
          <ul className='mt-4'>
            {trendingData.map((post, index) => (
              <li key={index} className='p-2 border-gray-500 border-y-[1px] hover:bg-gray-200 cursor-pointer'>
                <h3 className='text-lg font-semibold'>{post.title}</h3>
                <p className='text-sm'>Score: {post.score}</p>
                <a href={post.url} target='_blank' rel='noopener noreferrer' className='text-blue-400 hover:underline'>
                  View Post
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <WhoToFollow className='w-full bg-white' />
        </div>
      </main>
      {tweets.map((tweet, index) => {
        let parent
        if (tweet?.tweet_con?.at(0)) {
          parent = { ...tweet?.tweet_con[0], user: tweet?.user_con[0] }
          parent = {
            ...parent,
            id: parent._id,
            author: parent.user.name,
            handle: '@' + parent.user.username,
            avatar: parent.user.avatar,
            time: moment(parent.created_at).format('DD/MM/YYYY HH:mm'),
            content: parent.content,
            image: parent.medias[0]?.url || null,
            stats: {
              comments: parent.comment_count,
              retweets: parent.retweet_count,
              likes: parent.likes,
              views: parent.quote_count
            }
          }
        }
        return tweet?.tweet_con?.length > 0 ? (
          <ChildTweet key={index} setReload={setReload} reload={reload} parent={parent} {...tweet} />
        ) : (
          <Tweet key={index} setReload={setReload} reload={reload} {...tweet} />
        )
      })}
    </main>
  )
}

export default Search
