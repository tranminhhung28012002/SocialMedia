import { useAuth } from '../../store'
import { axiosInstance } from '../../axios'
import { useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { MdDeleteOutline } from 'react-icons/md'
function TweetComposer({ setReload, reload }) {
  const [tweetContent, setTweetContent] = useState('')
  const [fileList, setFileList] = useState([])
  const [hashtag, setHashtag] = useState([])
  const [img, setImg] = useState([])
  const [imgview, setImgview] = useState([])
  const { user } = useAuth()
  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    const MAX_SIZE = 40 * 1024 * 1024
    const validFiles = []
    const errors = []
    files.forEach((file) => {
      if (file.size <= MAX_SIZE) {
        validFiles.push(file)
      } else {
        errors.push(file.name)
      }
    })
    if (errors.length > 0) {
      toast.error(`Các file sau vượt quá dung lượng cho phép: ${errors.join(', ')}`)
    }

    setFileList((prevList) => {
      const newList = [...prevList, ...validFiles].filter((file) => file !== undefined)
      return newList
    })

    const previewUrls = validFiles
      .map((file) => {
        try {
          return URL.createObjectURL(file)
        } catch (error) {
          console.error('Lỗi khi tạo Object URL:', error)
          return null
        }
      })
      .filter((url) => url !== null)
    const previewText = validFiles.map((file) => file.name)
    setImg(previewUrls)
    setImgview((PreviewList) => {
      const update = [...PreviewList, ...previewText]
      return update
    })
  }

  const upload = async (files) => {
    const CLOUD_NAME = 'dlvf2ltdx'
    const PRESET_NAME = 'uploadimages'
    const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`
    const FOLDER_NAME = 'Post'
    const urls = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('upload_preset', PRESET_NAME)
      formData.append('folder', FOLDER_NAME)
      formData.append('file', file)

      const resourceType = file.type.includes('video') ? 'video' : 'image'

      try {
        const response = await axios.post(`${API_URL}/${resourceType}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        urls.push(response.data.secure_url)
      } catch (error) {
        console.error(`Lỗi upload ${resourceType}:`, error)
        toast.error(`Lỗi khi tải ảnh/video: ${file.name}`)
      }
    }

    return urls
  }

  const handleHashtagChange = (event) => {
    const value = event.target.value
    const hashtagsArray = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    setHashtag(hashtagsArray)
  }

  const handlePost = async () => {
    try {
      let imgUrl = img
      if (fileList.length > 0) {
        imgUrl = await upload(fileList)
      }
      const res = await axiosInstance.post('/tweets', {
        medias: imgUrl.map((url, index) => ({
          url,
          type: fileList[index]?.type.includes('video') ? 1 : 0
        })),
        type: 0,
        audience: 0,
        content: tweetContent,
        hashtags: hashtag,
        parent_id: null
      })

      console.log('Post successful', res.data)
      setReload(!reload)
      setTweetContent('')
      setFileList([])
      setHashtag([])
      setImgview('')
      toast.success('Đăng bài thành công!')
    } catch (error) {
      console.error('Error in handlePost:', error)
      toast.error('Đăng bài thất bại!')
    }
  }
  return (
    <div className='flex flex-col justify-center px-4 py-2.5 w-full'>
      <div className='flex flex-col w-full max-md:max-w-full'>
        <div className='flex gap-3 self-start text-xl font-medium tracking-tight text-slate-500'>
          <img
            loading='lazy'
            src={user?.avatar || '/images/iconavatar.jpg'}
            alt='User Avatar'
            className='object-contain shrink-0 aspect-square rounded-[99999px] w-[49px]'
          />
          <label htmlFor='tweetInput' className='sr-only'>
            What's happening?
          </label>
          <input
            id='tweetInput'
            type='text'
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
            placeholder="What's happening?"
            className='my-auto basis-auto bg-transparent border-none outline-none'
          />
        </div>
        <input
          type='tags'
          placeholder='Hashtag'
          className='w-1/2 mt-4 bg-white text-black p-1'
          onChange={handleHashtagChange}
        />
        <div className='flex flex-wrap gap-5 justify-between mt-2.5 max-w-full w-[510px]'>
          <div className='flex-wrap gap-4 items-start my-auto'>
            {/* File Input */}
            <div className='relative'>
              <button>
                <label htmlFor='fileInput'>
                  <img
                    loading='lazy'
                    src='/images/add-image.svg'
                    alt='Add Image'
                    className='object-contain shrink-0 w-6 aspect-square cursor-pointer'
                  />
                </label>
                <input id='fileInput' type='file' multiple onChange={handleChange} className='hidden' />
              </button>
              <button aria-label='Add GIF'>
                <img
                  loading='lazy'
                  src='/images/add-gif.svg'
                  alt='Add GIF'
                  className='object-contain shrink-0 w-6 aspect-square'
                />
              </button>
              <button aria-label='Add poll'>
                <img
                  loading='lazy'
                  src='/images/add-poll.svg'
                  alt='Add Poll'
                  className='object-contain shrink-0 w-6 aspect-square '
                />
              </button>
              <button aria-label='Add emoji'>
                <img
                  loading='lazy'
                  src='/images/add-emoji.svg'
                  alt='Add Emoji'
                  className='object-contain shrink-0 w-6 aspect-square'
                />
              </button>
              <button aria-label='Schedule tweet'>
                <img
                  loading='lazy'
                  src='/images/schedule-tweet.svg'
                  alt='Schedule Tweet'
                  className='object-contain shrink-0 w-6 aspect-square'
                />
              </button>
              <div className='flex flex-wrap flex-col  bg-gray-100 text-black top-[12.5rem] rounded-lg '>
                {imgview &&
                  imgview.map((url, index) => (
                    <div key={index} className='flex items-center gap-2.5 hover:bg-gray-200 cursor-pointer p-4'>
                      <p>{url}</p>
                      <MdDeleteOutline className='text-xl' />
                    </div>
                  ))}
              </div>
            </div>
            <button
              disabled={!tweetContent}
              onClick={handlePost}
              style={{ opacity: !tweetContent ? '0.5' : '1' }}
              className='gap-2.5  py-2.5 mt-2 pr-4 pl-5 text-base font-bold leading-none text-center text-white  bg-sky-500 rounded-full min-h-[39px]'
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TweetComposer
