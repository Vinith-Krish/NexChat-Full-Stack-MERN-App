import React, { useEffect, useRef, useState, useContext } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    deleteMessage,
    getMessages,
    loadingMessages,
    sendingMessage,
  } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)
  const scrollEnd = useRef(null)
  const menuRef = useRef(null)
  const [input, setInput] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [openMenuFor, setOpenMenuFor] = useState(null)

  const getReplySenderLabel = (message) => {
    if (!message) return ''
    return String(message.senderId) === String(authUser?._id) ? 'You' : selectedUser?.fullName || 'User'
  }

  const jumpToMessage = (messageId) => {
    if (!messageId) return
    const target = document.getElementById(`message-${messageId}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === '' || sendingMessage) return
    await sendMessage({ text: input, replyToMessageId: replyingTo?._id })
    setInput('')
    setReplyingTo(null)
    setOpenMenuFor(null)
  }

  const handleSendImage = async (e) => {
    if (sendingMessage) return
    const file = e.target.files[0]

    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result, replyToMessageId: replyingTo?._id })
      setReplyingTo(null)
      setOpenMenuFor(null)
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuFor(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    setReplyingTo(null)
    setOpenMenuFor(null)
  }, [selectedUser?._id])

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleCopyMessage = async (msg) => {
    try {
      const valueToCopy = msg.text || msg.image
      if (!valueToCopy) {
        toast.error('Nothing to copy')
        return
      }
      await navigator.clipboard.writeText(valueToCopy)
      toast.success('Copied')
      setOpenMenuFor(null)
    } catch {
      toast.error('Clipboard access failed')
    }
  }

  const handleForwardToComposer = (msg) => {
    if (msg.text) {
      setInput(`Fwd: ${msg.text}`)
      toast.success('Added to composer')
    } else if (msg.image) {
      toast('Forwarding images is not available yet')
    }
    setOpenMenuFor(null)
  }

  const handleDeleteMessage = async (msg) => {
    await deleteMessage(msg._id)
    setOpenMenuFor(null)
  }

  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(String(selectedUser._id)) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden max-w-7" />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      <div ref={menuRef} className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6 gap-4">
        {loadingMessages && <div className="text-center text-sm text-gray-300 py-6">Loading messages...</div>}
        {!loadingMessages && messages.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-6">No messages yet. Start the conversation.</div>
        )}

        {!loadingMessages && messages.map((msg) => {
          const isOwnMessage = String(msg.senderId) === String(authUser._id)

          return (
            <div id={`message-${msg._id}`} key={msg._id} className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                <img
                  src={isOwnMessage ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />

                <div className={`relative flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  <button
                    onClick={() => setOpenMenuFor((prev) => (prev === msg._id ? null : msg._id))}
                    className="absolute -top-1 right-0 z-10 text-[11px] px-1.5 py-0.5 rounded bg-black/35 text-gray-200 hover:text-white"
                    title="Message options"
                  >
                    <span className="inline-block -rotate-45">-&gt;</span>
                  </button>

                  {openMenuFor === msg._id && (
                    <div className="absolute top-5 right-0 z-20 min-w-20 bg-gray-900 border border-gray-700 rounded-md shadow-lg overflow-hidden">
                      <button
                        onClick={() => {
                          setReplyingTo(msg)
                          setOpenMenuFor(null)
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-gray-100 hover:bg-gray-800"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => handleCopyMessage(msg)}
                        className="w-full px-3 py-2 text-left text-xs text-gray-100 hover:bg-gray-800"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleForwardToComposer(msg)}
                        className="w-full px-3 py-2 text-left text-xs text-gray-100 hover:bg-gray-800"
                      >
                        Forward
                      </button>
                      {isOwnMessage && (
                        <button
                          onClick={() => handleDeleteMessage(msg)}
                          className="w-full px-3 py-2 text-left text-xs text-red-300 hover:bg-gray-800"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}

                  {msg.replyTo?.messageId && (
                    <button
                      onClick={() => jumpToMessage(msg.replyTo.messageId)}
                      className={`mb-1 w-full max-w-50 text-left border border-gray-600 bg-black/25 rounded-md px-2 py-1 text-xs text-gray-200 ${isOwnMessage ? 'self-end' : 'self-start'}`}
                    >
                      <p className="font-semibold text-gray-100">{getReplySenderLabel(msg.replyTo)}</p>
                      {msg.replyTo.image ? (
                        <p className="text-gray-300">Photo</p>
                      ) : (
                        <p className="truncate text-gray-300">{msg.replyTo.text || 'Message'}</p>
                      )}
                    </button>
                  )}

                  {msg.image ? (
                    <button
                      onClick={() => window.open(msg.image, '_blank', 'noopener,noreferrer')}
                      className="border border-gray-700 rounded-lg overflow-hidden"
                      title="Open image"
                    >
                      <img
                        src={msg.image}
                        alt="Sent image"
                        className="max-w-57.5"
                      />
                    </button>
                  ) : (
                    <p
                      className={`p-2 max-w-50 md:text-sm font-light rounded-lg wrap-break-word bg-violet-500/30 text-white ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'}`}
                    >
                      {msg.text}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                    <p>{formatMessageTime(msg.createdAt)}</p>
                    {isOwnMessage && <p>{msg.seen ? 'Seen' : 'Sent'}</p>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <div ref={scrollEnd}></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 bg-gray-100/12 px-3 rounded-2xl">
          {replyingTo && (
            <div className="flex items-start justify-between gap-2 pt-2">
              <div className="border-l-2 border-violet-300 pl-2 text-xs text-gray-200">
                <p className="font-medium">Replying to {getReplySenderLabel(replyingTo)}</p>
                {replyingTo.image ? (
                  <p className="text-gray-300">Photo</p>
                ) : (
                  <p className="truncate max-w-60 text-gray-300">{replyingTo.text || 'Message'}</p>
                )}
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-gray-300 hover:text-white text-xs">
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-center">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === 'Enter' ? handleSendMessage(e) : null)}
            type="text"
            placeholder='send a message'
            className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'
            disabled={sendingMessage}
          />
          <input onChange={handleSendImage} type="file" id='image' accept='image/png,image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
          </label>
          </div>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className={`w-7 ${sendingMessage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
