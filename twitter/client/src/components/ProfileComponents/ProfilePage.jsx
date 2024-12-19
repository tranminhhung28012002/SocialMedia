import { useEffect, useState } from 'react'
import { axiosInstance } from '../../axios'
import moment from 'moment'
import ProfileBanner from './ProfileBanner'
import ProfileHeader from './ProfileHeader'
import ProfileInfo from './ProfileInfo'
import ProfileTabs from './ProfileTabs'
import ChildTweet from '../layout/ChildTweet'
import Tweet from '../layout/Tweet'
import FeaturesProfile from './FeaturesProfile'
import { useParams } from 'react-router-dom'

export default function ProfilePage() {
  const { user_id } = useParams()
  console.log(user_id)
  const [tweets, setTweets] = useState([])
  const [userId, setUserId] = useState([])
  const [reload, setReload] = useState(false)
  console.log(tweets)
  useEffect(() => {
    const fetchProfileAndTweets = async () => {
      try {
        const profileRes = await axiosInstance.get(`/api/profile/${user_id}`)
        setTweets(profileRes.data.result)
        const tweetsRes = await axiosInstance.get('/tweets/user/' + user_id, { params: { page: 1, limit: 100 } })
        setUserId(
          tweetsRes.data.result.tweets.map((v) => ({
            ...v,
            id: v._id,
            avatar: profileRes.data.result?.avatar,
            author: profileRes.data.result?.name,
            handle: '@' + profileRes.data.result?.username,
            time: moment(v.created_at).format('DD/MM/YYYY HH:mm'),
            content: v.content,
            image: v.medias[0]?.url || null,
            stats: {
              comments: v.comment_count,
              retweets: v.retweet_count,
              likes: v.likes,
              views: v.bookmarks
            }
          }))
        )
      } catch (error) {
        console.error('Error fetching profile or tweets:', error)
      }
    }
    fetchProfileAndTweets()
  }, [user_id, reload])

  return (
    <main className='flex overflow-hidden flex-col bg-white max-md:px-5 border-x'>
      <div className='flex overflow-hidden flex-col self-center px-px max-w-full w-[600px]'>
        <div className='flex flex-col pb-4 w-full max-md:max-w-full relative '>
          <ProfileBanner src={tweets.cover_photo || './images/iconavatar.jpg'} />
          <div className='mb-9'>
            <ProfileHeader avatarSrc={tweets.avatar || './images/iconavatar.jpg'} />
            <FeaturesProfile reiceiverId={user_id} />
          </div>
          <ProfileInfo
            name={tweets?.name}
            email={tweets?.email}
            bio={tweets?.bio}
            location={tweets?.location}
            joinDate={moment(tweets?.created_at).format('DD/MM/YYYY')}
            following={569}
            followers={72}
          />
        </div>
        <ProfileTabs />
        <div className='flex flex-col pl-px w-full max-w-[598px] max-md:max-w-full'>
          {userId.map((tweet, index) => {
            let parent
            if (tweet?.tweet_children[0]) {
              parent = { ...tweet?.tweet_children[0], user: tweet?.user[0] }
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
                  views: parent.bookmarks
                }
              }
            }

            return tweet?.tweet_children.length > 0 ? (
              <ChildTweet key={index} setReload={setReload} reload={reload} parent={parent} {...tweet} />
            ) : (
              <Tweet key={index} setReload={setReload} reload={reload} {...tweet} />
            )
          })}
        </div>
      </div>
    </main>
  )
}
