import React from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'
import { useState } from 'react'
import { useEffect } from 'react'
// import { get } from 'mongoose'

const Sidebar = ({ discoveryOpen, onToggleDiscovery }) => {
  const {getAllUsers, users, selectedUser, setSelectedUser,
    unseenMessages, setUnseenMessages, loadingUsers} = useContext(ChatContext);
  const { logout, onlineUsers, authUser } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const filteredUsers = input ? users.filter((user)=>user.fullName.toLowerCase().includes(input.toLowerCase())) : users;
  useEffect(()=>{
    getAllUsers();
  },[onlineUsers, getAllUsers]);
  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-hidden flex flex-col text-white ${selectedUser?'max-md:hidden':''}`}>
      <div className='pb-5'>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={assets.logo_icon} alt="logo" className="h-9 w-9 shrink-0" />
            <span className="text-lg font-bold tracking-tight text-white">NEXCHAT</span>
          </div>
          <div className="relative py-2 group">
              <img src={assets.menu_icon} alt="menu" className='max-h-5 cursor-pointer'/>
              <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border
              border-gray-600 hidden group-hover:block'>
                <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
              </div>
          </div>
        </div>
        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5' >
          <img src={assets.search_icon} alt="Search" className='w-3' />
          <input onChange={(e)=>setInput(e.target.value)}  type="text" className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1" placeholder='Search User...' />
        </div>
        <button
          type='button'
          onClick={onToggleDiscovery}
          aria-pressed={discoveryOpen}
          className={`w-full mt-4 rounded-md border border-white/15 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 ${discoveryOpen ? 'bg-violet-600/40 text-white' : 'bg-white/5 text-gray-200 hover:bg-white/10'}`}
        >
          {discoveryOpen ? 'Hide Discovery' : 'Discover Collaborators'}
        </button>
      </div>
      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto">
        {loadingUsers && <div className="px-4 py-6 text-sm text-gray-300">Loading conversations...</div>}
        {!loadingUsers && filteredUsers.length === 0 && authUser && (
          <div className="px-4 py-6 text-sm text-gray-400">No users found.</div>
        )}
        {filteredUsers.map((user,index)=>(
          <div onClick={()=>{setSelectedUser(user); setUnseenMessages(prev => ({...prev, [user._id]: 0}))}} key={index} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}>
            <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-8.75 aspect-square rounded-full" />
            <div className=" flex flex-col leading-5">
              <p >{user.fullName}</p>
              {
                onlineUsers.includes(String(user._id))
                ? <span className='text-green-400 text-xs'>Online</span>
                : <span className='text-neutral-400 text-xs'>Offline</span>
              }
            </div>
            { unseenMessages[user._id] > 0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>
            {unseenMessages[user._id]}</p>}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={logout}
        className="mt-4 w-full rounded-md border border-white/15 bg-white/5 py-2 text-sm font-light text-gray-200 transition-colors hover:border-violet-400 hover:bg-violet-500/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        Logout
      </button>
    </div>
  )
}

export default Sidebar