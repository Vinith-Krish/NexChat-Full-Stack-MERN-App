import React, { useContext, useEffect } from 'react'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import Sidebar from '../components/Sidebar'
import { ChatContext } from '../../context/ChatContext'
const HomePage = () => {

  const { selectedUser, setSelectedUser } = useContext(ChatContext);

  useEffect(() => {
    const handleExitChatShortcut = (event) => {
      if (!selectedUser) return
      if (event.key.toLowerCase() !== 'x') return

      const target = event.target
      const isTypingField =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      if (isTypingField) return
      setSelectedUser(null)
    }

    window.addEventListener('keydown', handleExitChatShortcut)
    return () => window.removeEventListener('keydown', handleExitChatShortcut)
  }, [selectedUser, setSelectedUser])

  return (
    <div className='min-h-screen w-full px-3 py-3 sm:px-6 sm:py-6 xl:px-[8%] xl:py-[4%]'>
      <div className={`h-[calc(100vh-24px)] sm:h-[calc(100vh-48px)] xl:h-[calc(100vh-64px)] backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[280px_minmax(0,1.5fr)_320px]' : 'md:grid-cols-[280px_minmax(0,1fr)]'}`}>
        <Sidebar/>
        <ChatContainer/>
        <RightSidebar/>

      </div>
    </div>
  )
}

export default HomePage