import React, { useContext, useEffect, useState } from 'react'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import Sidebar from '../components/Sidebar'
import CollaborationDiscovery from '../components/CollaborationDiscovery'
import { ChatContext } from '../../context/ChatContext'
const HomePage = () => {

  const { selectedUser, setSelectedUser } = useContext(ChatContext);
  const [showDiscovery, setShowDiscovery] = useState(false);

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
      <div className={`h-[calc(100vh-24px)] sm:h-[calc(100vh-48px)] xl:h-[calc(100vh-64px)] backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 relative ${(selectedUser || showDiscovery) ? 'md:grid-cols-[280px_minmax(0,1.5fr)_320px]' : 'md:grid-cols-[280px_minmax(0,1fr)]'}`}>
        <Sidebar discoveryOpen={showDiscovery} onToggleDiscovery={() => setShowDiscovery(prev => !prev)} />
        <ChatContainer/>
        {showDiscovery ? (
          <div className='bg-[#8185B2]/10 text-white w-full overflow-y-scroll max-md:hidden'>
            <CollaborationDiscovery />
          </div>
        ) : (
          <RightSidebar/>
        )}

      </div>
    </div>
  )
}

export default HomePage