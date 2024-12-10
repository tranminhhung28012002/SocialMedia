import EditProfileButton from './EditProfileButton'
import EditPasswordProfile from './EditPasswordProfile'
const MoreProfile = () => {
  return (
    <div className='flex  absolute right-[3%] gap-5'>
      <EditProfileButton />
      <EditPasswordProfile />
    </div>
  )
}
export default MoreProfile
