import { useAuth } from '../../store'
import { Select, Upload } from 'antd'
import { axiosInstance } from '../../axios'
import { useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
function TweetComposer({ setReload, reload }) {
  const [tweetContent, setTweetContent] = useState('')
  const [fileList, setFileList] = useState([])
  const [hashtag, setHashtag] = useState([])
  const [img, setImg] = useState('')
  const { user } = useAuth()

  const handleChange = (info) => {
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB

    const validFiles = []
    const errors = []

    info.fileList.forEach((file) => {
      if (file.size <= MAX_SIZE) {
        validFiles.push(file.originFileObj)
      } else {
        errors.push(file.name)
      }
    })

    if (errors.length > 0) {
      toast.error(`Các file sau vượt quá dung lượng cho phép: ${errors.join(', ')}`)
    }

    setFileList(validFiles)
    const previewUrls = validFiles.map((file) => URL.createObjectURL(file))
    setImg(previewUrls)
  }
  console.log('filelist', fileList)
  const upload = async (files) => {
    const CLOUD_NAME = 'dlvf2ltdx'
    const PRESET_NAME = 'uploadimages' // Cùng preset cho cả ảnh và video
    const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`
    const FOLDER_NAME = 'Post'
    const urls = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('upload_preset', PRESET_NAME)
      formData.append('folder', FOLDER_NAME)
      formData.append('file', file)

      // Phân loại file (ảnh/video)
      const resourceType = file.type.includes('video') ? 'video' : 'image'
      try {
        const response = await axios.post(`${API_URL}/${resourceType}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        urls.push(response.data.secure_url) // Lưu URL trả về
      } catch (error) {
        console.error(`Lỗi upload ${resourceType}:`, error)
      }
    }

    return urls
  }
  const handlePost = async () => {
    try {
      let imgUrl = img
      if (fileList) {
        imgUrl = await upload(fileList)
      }
      console.log('imgUrl', imgUrl)
      // for (const v of fileList) {
      //   const formData = new FormData()
      //   console.log('form data', formData)
      // if (imgUrl) {
      //   // formData.append('image', v.originFileObj)
      //   const res = await axiosInstance.post('/medias/upload-image', imgUrl)
      //   imgUrl = [...imgUrl, ...res.data.result]
      // }
      // if (v.type.includes('video')) {
      //   formData.append('video', v.originFileObj)
      //   const res = await axiosInstance.post('/medias/upload-video', formData)
      //   mediasUrl = [...mediasUrl, ...res.data.result]
      // }
      // }
      if (imgUrl.length > 0) {
        await axiosInstance.post('/tweets', {
          medias: imgUrl.map((url, index) => ({
            url,
            type: fileList[index]?.type.includes('video') ? 1 : 0 // 1: video, 0: ảnh
          })),
          type: 0,
          audience: 0,
          content: tweetContent,
          hashtags: hashtag,
          mentions: [],
          parent_id: null
        })
      }
      setReload(!reload)
      setTweetContent('')
      setFileList([])
      setHashtag([])
      setTimeout(() => {
        toast.success('Đăng bài thành công thành công!')
      }, 2000)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='flex flex-col justify-center px-4 py-2.5 w-full'>
      <div className='flex flex-col w-full max-md:max-w-full'>
        <div className='flex gap-3 self-start text-xl font-medium tracking-tight text-slate-500'>
          <img
            loading='lazy'
            src={user?.covver_photo || '/images/user-avatar.jpg'}
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
            onChange={(e) => {
              setTweetContent(e.target.value)
            }}
            placeholder="What's happening?"
            className='my-auto basis-auto bg-transparent border-none outline-none'
          />
        </div>
        <Select
          mode='tags'
          allowClear
          placeholder='Hashtag'
          className='w-1/2 mt-4'
          onChange={(v) => {
            setHashtag(v)
          }}
          value={hashtag}
          options={undefined}
        />
        <div className='flex flex-wrap gap-5 justify-between mt-2.5 max-w-full w-[510px]'>
          <div className='flex flex-wrap gap-4 items-start my-auto'>
            <Upload
              multiple
              beforeUpload={() => false} // Ngăn việc upload tự động
              fileList={fileList}
              onChange={handleChange}
            >
              {' '}
              <button aria-label='Add image'>
                <img
                  loading='lazy'
                  src='/images/add-image.svg'
                  alt=''
                  className='object-contain shrink-0 w-6 aspect-square'
                />
              </button>
            </Upload>
            <button aria-label='Add GIF'>
              <img
                loading='lazy'
                src='/images/add-gif.svg'
                alt=''
                className='object-contain shrink-0 w-6 aspect-square'
              />
            </button>
            <button aria-label='Add poll'>
              <img
                loading='lazy'
                src='/images/add-poll.svg'
                alt=''
                className='object-contain shrink-0 w-6 aspect-square'
              />
            </button>
            <button aria-label='Add emoji'>
              <img
                loading='lazy'
                src='/images/add-emoji.svg'
                alt=''
                className='object-contain shrink-0 w-6 aspect-square'
              />
            </button>
            <button aria-label='Schedule tweet'>
              <img
                loading='lazy'
                src='/images/schedule-tweet.svg'
                alt=''
                className='object-contain shrink-0 w-6 aspect-square'
              />
            </button>
          </div>
          <button
            disabled={!tweetContent}
            onClick={handlePost}
            style={{ opacity: !tweetContent ? '0.5' : '1' }}
            className='overflow-hidden gap-2.5 self-stretch py-2.5 pr-4 pl-5 text-base font-bold leading-none text-center text-white whitespace-nowrap bg-sky-500 rounded-full min-h-[39px]'
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

export default TweetComposer
