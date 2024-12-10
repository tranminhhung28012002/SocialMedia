const ProfileHeader = ({ avatarSrc }) => {
  return (
    <header className=''>
      <div className='flex self-start ml-4 max-md:ml-2.5'>
        <img
          loading='lazy'
          src={avatarSrc}
          alt={`${name}'s profile picture`}
          className='absolute top-[35%] z-50 object-cover shrink-0 my-auto w-[150px] h-[150px] border-2 border-white rounded-full'
        />
      </div>
    </header>
  )
}

export default ProfileHeader
