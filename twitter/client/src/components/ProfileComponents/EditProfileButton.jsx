import { useState, useEffect } from 'react'
import { axiosInstance } from '../../axios'
import axios from 'axios'
import { CiEdit } from 'react-icons/ci'
const EditProfileButton = () => {
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [date, setDate] = useState('')
  const [email, setEmail] = useState('')
  const [initialProfile, setInitialProfile] = useState(null)
  const [banner, setBanner] = useState(null)
  const [bannerPreview, setBannerPreview] = useState('')
  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/api/me')
        const profile = response.data.result
        setInitialProfile(profile)
        setName(profile.name || '')
        setLocation(profile.location || '')
        setBio(profile.bio || '')
        setWebsite(profile.website || '')
        const birthDate = profile.date_of_birth
        if (birthDate) {
          const formattedDate = new Date(birthDate).toISOString().split('T')[0] // chuyển đổi thành YYYY-MM-DD
          setDate(formattedDate)
        }
        setEmail(profile.email || '')
        setAvatarPreview(profile.avatar || './images/iconavatar.jpg')
        setAvatarPreview(profile.cover_photo || './images/iconavatar.jpg')
      } catch (err) {
        setError('Failed to fetch profile data')
      }
    }
    fetchProfile()
  }, [])

  const upload = async (file) => {
    if (file) {
      const CLOUD_NAME = 'dlvf2ltdx'
      const PRESET_NAME = 'uploadimages'
      const api = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
      const FOLDER_NAME = 'Avatar'
      const formData = new FormData()
      formData.append('upload_preset', PRESET_NAME)
      formData.append('folder', FOLDER_NAME)
      formData.append('file', file)
      try {
        const response = await axios.post(api, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data.secure_url
      } catch (err) {
        throw new Error('Error uploading image', err)
      }
    }
  }
  const uploadBanner = async (file) => {
    console.log('file banner ', file)
    if (file) {
      const CLOUD_NAME = 'dlvf2ltdx'
      const PRESET_NAME = 'uploadimages'
      const api = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
      const FOLDER_NAME = 'Banner'
      const formData = new FormData()
      formData.append('upload_preset', PRESET_NAME)
      formData.append('folder', FOLDER_NAME)
      formData.append('file', file)
      try {
        const response = await axios.post(api, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data.secure_url
      } catch (err) {
        throw new Error('Error uploading image', err)
      }
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      let avatarUrl = avatarPreview
      if (avatar) {
        avatarUrl = await upload(avatar)
      }
      let bannerUrl = bannerPreview
      if (banner) {
        bannerUrl = await uploadBanner(banner)
      }
      console.log('avatar', avatarUrl)
      console.log('banner ', bannerUrl)
      const updatedData = {
        name: name,
        email: email,
        bio: bio,
        date_of_birth: date,
        location: location,
        avatar: avatarUrl,
        cover_photo: bannerUrl
      }
      await axiosInstance.patch('/api/me', updatedData)
      alert('Profile updated successfully!')
      setEdit(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile data')
    } finally {
      setLoading(false)
    }
  }
  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    setBanner(file)
    setBannerPreview(URL.createObjectURL(file))
  }
  console.log()
  const handleAvatarChange = (e) => {
    console.log('fileavatar', e)
    const file = e.target.files[0]
    if (file && file.size < 5 * 1024 * 1024) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    } else {
      setError('File size should not exceed 5MB.')
    }
  }
  const handleRemoveBanner = () => {
    setBanner(null)
    setBannerPreview(initialProfile.cover_photo || './images/iconavatar.jpg')
  }

  const handleRemoveAvatar = () => {
    setAvatar(null)
    setAvatarPreview(initialProfile.avatar || './images/iconavatar.jpg')
  }

  const handleClose = () => {
    setEdit(false)
    setError(null)
  }
  console.log('avatarPreview', avatarPreview)
  return (
    <div>
      <div className='relative group'>
        <CiEdit
          className='text-black rounded-full border-black border mt-2.5 h-[30px] w-[30px] cursor-pointer'
          onClick={() => setEdit(true)}
        />
        <div className='absolute right-[-15%] top-[105%] hidden group-hover:block bg-slate-200 text-black text-xs px-2 py-2 rounded-md w-[40px] text-center'>
          Edit
        </div>
      </div>
      {edit && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 xl:w-1/3'>
            <h2 className='text-xl font-bold mb-4 text-center text-gray-800'>Edit Profile</h2>
            {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
            <div>
              <div className='flex gap-2 mt-5'>
                <img
                  src={bannerPreview}
                  alt='bannerProfile'
                  className='w-full h-[100px] object-contain border-black border'
                />
                <div className='flex flex-col gap-2'>
                  <label className='bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 cursor-pointer'>
                    Upload
                    <input type='file' className='hidden' onChange={handleBannerChange} />
                  </label>
                  <button
                    onClick={handleRemoveBanner}
                    className='border-red-100 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500'
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <div className='grid grid-cols-1 xl:grid-cols-2 lg:gap-4'>
              <div>
                <div className='flex gap-2 mt-5'>
                  <img
                    src={avatarPreview}
                    alt='Profile'
                    className='w-[100px] h-[100px] object-cover border-black border rounded-full'
                  />
                  <div className='flex flex-col gap-2'>
                    <label className='bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 cursor-pointer'>
                      Upload
                      <input type='file' className='hidden' onChange={handleAvatarChange} />
                    </label>
                    <button
                      onClick={handleRemoveAvatar}
                      className='border-red-100 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <p className='text-gray-600 font-medium text-lg'>Name</p>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                  placeholder='Name'
                />
              </div>
            </div>
            <div className='xl:mt-7 mt-3 grid grid-cols-2 lg:gap-4'>
              <div>
                <p className='text-gray-600 font-medium text-lg'>Email</p>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                  placeholder='Email'
                />
              </div>
              <div>
                <p className='text-gray-600 font-medium text-lg'>Website</p>
                <input
                  type='text'
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                  placeholder='Website'
                />
              </div>
            </div>
            <div className='md:mt-7 mt-3 grid grid-cols-2 lg:gap-4'>
              <div>
                <p className='text-gray-600 font-medium text-lg'>Location</p>
                <input
                  type='text'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                  placeholder='Location'
                />
              </div>
              <div>
                <p className='text-gray-600 font-medium text-lg'>Bio</p>
                <input
                  type='text'
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                  placeholder='Bio'
                />
              </div>
            </div>
            <div className='md:mt-7 mt-3'>
              <p className='text-gray-600 font-medium text-lg'>Date of Birth</p>
              <input
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className='bg-white text-black mt-3 p-2 border border-gray-400 rounded w-full'
                placeholder='Date of Birth'
              />
            </div>
            <div className='flex justify-between mt-7'>
              <button
                onClick={handleClose}
                className='border-red-100 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500'
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`${loading ? 'bg-gray-400' : 'bg-sky-500'} text-white px-6 py-3 rounded-lg`}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditProfileButton
