import { IoIosLogOut } from 'react-icons/io'
import { useAuth } from '../../store'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../axios'

function ProfileButton() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  return (
    <button
      onClick={() => {
        navigate('/profile')
      }}
      className='flex gap-5  2xl:mt-56 mt-6 xl:justify-evenly justify-center text-base xl:w-[255px] bg-slate-100'
    >
      <div className='flex items-center '>
        <img
          loading='lazy'
          src={user?.avatar || './images/iconavatar.jpg'}
          alt=''
          className='object-contain shrink-0 aspect-square rounded-[99999px] w-[30px] h-[30px] '
        />
        <div className='flex flex-col display-none-xl'>
          <div className='self-start font-bold text-neutral-900'>{user?.name}</div>
          {user?.username && <div className='font-medium tracking-tight text-slate-500'>@ {user?.username}</div>}
        </div>
      </div>
      <IoIosLogOut
        onClick={() => {
          axiosInstance
            .post('/api/logout', {
              refresh_token: localStorage.getItem('refregh_token')
            })
            .then((res) => {
              console.log(res)

              setUser(null)
              localStorage.removeItem('access_token')
              navigate('/login')
            })
            .catch((error) => {
              console.log('errer', error)
            })
        }}
        className='mt-2.5 text-black  h-[30px] w-[30px] cursor-pointer'
      />
    </button>
  )
}

export default ProfileButton
