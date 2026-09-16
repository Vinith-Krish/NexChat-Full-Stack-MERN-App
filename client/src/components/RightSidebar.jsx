import React from 'react'
import assets from '../assets/assets'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import { useState } from 'react'
import { useEffect } from 'react'

const RightSidebar = () => {
  const {selectedUser,messages} = useContext(ChatContext);
  const {logout,onlineUsers} = useContext(AuthContext);
  const [msgImages,setMsgImages] = useState([]);

  // get all images from the messages and set them in state
   useEffect(()=>{
    setMsgImages(messages.filter(msg=>msg.image).map(msg=>msg.image));
   },[messages])

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? 'max-md:hidden':''}`}>

        <div className=" pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-20 aspect-square rounded-full" />
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
        <button
          type="button"
          onClick={logout}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-md border border-white/15 bg-white/5 px-6 py-2 text-sm font-light text-gray-200 transition-colors hover:border-violet-400 hover:bg-violet-500/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          Logout
        </button>
    </div>
  )
}

export default RightSidebar