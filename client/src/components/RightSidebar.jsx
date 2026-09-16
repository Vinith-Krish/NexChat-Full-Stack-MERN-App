import React from 'react'
import assets from '../assets/assets'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import { useState } from 'react'
import { useEffect } from 'react'

const RightSidebar = () => {
  const {selectedUser,messages} = useContext(ChatContext);
  const {onlineUsers} = useContext(AuthContext);
  const [msgImages,setMsgImages] = useState([]);

  // get all images from the messages and set them in state
   useEffect(()=>{
    setMsgImages(messages.filter(msg=>msg.image).map(msg=>msg.image));
   },[messages])

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? 'max-md:hidden':''}`}>

        <div className="pt-16 flex flex-col items-start gap-2 text-xs font-light mx-0 w-full">
          <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="self-start mx-5 w-20 aspect-square rounded-full" />
          <h1 className='w-full px-5 text-xl font-medium flex items-center justify-start gap-2'>
            {onlineUsers.includes(String(selectedUser._id)) && <p className="w-2 h-2 rounded-full bg-green-500"></p> }
            
            {selectedUser.fullName}
          </h1>
          <p className="w-full px-5 text-left">{selectedUser.bio}</p>
        </div>
        <hr className="border-[#ffffff50] my-4" />
        <div className="px-5 text-xs">
          <p className="">Media</p>
          {msgImages.length > 0 ? (
            <div className="mt-2 max-h-50 overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
              {msgImages.map((url,index)=>(
                <div key={index} onClick={()=>window.open(url)} className="cursor-pointer rounded">
                  <img src={url} alt="" className="h-full rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-4 text-gray-400">
              No shared media yet.
            </div>
          )}
        </div>
    </div>
  )
}

export default RightSidebar