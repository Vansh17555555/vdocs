import React from 'react'
import Image from 'next/image'
const Loader = () => {
  return (
    <div className='Loader'>
        <Image src="/assets/icons/loader.svg" alt="loader" width={32} height={32} className='animate-spin'></Image>
    </div>
  )
}

export default Loader