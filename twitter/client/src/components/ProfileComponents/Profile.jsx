import { useEffect, useState } from 'react'
import ProfileHeader from './ProfileHeader'
import ProfileBanner from './ProfileBanner'
import ProfileInfo from './ProfileInfo'
import ProfileTabs from './ProfileTabs'
import { useAuth } from '../../store'
import moment from 'moment'
import { axiosInstance } from '../../axios'
import Tweet from '../layout/Tweet'
import ChildTweet from '../layout/ChildTweet'
import MoreProfile from './MoreProfile'
const Profile = () => {
  const { user, setUser } = useAuth()
  console.log('set user', setUser)
  console.log('user', user)
  const [tweets, setTweets] = useState([])
  const [reload, setReload] = useState(false)
  useEffect(() => {
    axiosInstance
      .get('/tweets/user/' + user._id, { params: { page: 1, limit: 100 } })
      .then((res) => {
        setTweets(
          res.data.result.tweets.map((v) => ({
            ...v,
            id: v._id,
            avatar: user?.avatar,
            author: user?.name,
            handle: '@' + user?.username,
            time: moment(v.created_at).format('DD/MM/YYYY HH:mm'),
            content: v.content,
            image: v.medias[0]?.url || null,
            stats: { comments: v.comment_count, retweets: v.retweet_count, likes: v.likes, views: v.bookmarks }
          }))
        )
      })
      .catch((error) => {
        console.log(error)
        if (error?.response?.status === 401) {
          setUser(null)
        }
      })
  }, [reload])
  return (
    <main className='flex overflow-hidden flex-col bg-white max-md:px-5 border-x'>
      <div className='flex overflow-hidden flex-col self-center px-px max-w-full w-[600px]'>
        <div className='flex flex-col pb-4 w-full max-md:max-w-full relative '>
          <ProfileBanner src={user?.cover_photo || './images/iconavatar.jpg'} />
          <div className='mb-9'>
            <ProfileHeader avatarSrc={user?.avatar || './images/iconavatar.jpg'} />
            <MoreProfile />
          </div>
          <ProfileInfo
            name={user?.name}
            email={user?.email}
            bio={user?.bio}
            location={user?.location}
            joinDate={moment(user?.created_at).format('DD/MM/YYYY')}
            following={569}
            followers={72}
          />
        </div>
        <ProfileTabs />
        <div className='flex flex-col pl-px w-full max-w-[598px] max-md:max-w-full'>
          {tweets.map((tweet, index) => {
            let parent
            console.log(tweet?.tweet_children[0])
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

export default Profile
