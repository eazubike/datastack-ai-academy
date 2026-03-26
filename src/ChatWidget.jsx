import { useState, useRef, useEffect } from 'react'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the DataStack AI Academy assistant. Ask me anything about the course — curriculum, pricing, career outcomes, or prerequisites." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chat_session_id')
    if (stored) return stored
    const id = crypto.randomUUID()
    localStorage.setItem('chat_session_id', id)
    return id
  })
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL
      if (!apiUrl) {
        // Fallback when API not configured
        setMessages([...newMessages, { role: 'assistant', content: "The chatbot backend isn't connected yet. Please check back soon, or scroll down to the FAQ section for common questions!" }])
        setLoading(false)
        return
      }

      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId,
          history: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        }),
      })

      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply || data.error || 'Sorry, something went wrong.' }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I couldn't connect. Please try again in a moment." }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Open chat"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '480px' }}>
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">🤖</div>
            <div>
              <div className="text-sm font-semibold text-white">DataStack AI Assistant</div>
              <div className="text-xs text-emerald-400">Powered by AWS Bedrock</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-400 px-3 py-2 rounded-xl rounded-bl-sm text-sm">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about the course..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
