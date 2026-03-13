import { useState, useRef, useEffect } from 'react'
import './App.css'

interface Message {
  id: number
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: 'Hello! I\'m your AI assistant powered by Ollama. How can I help you today?', role: 'assistant', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState('llama2')
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch available models on mount
  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags')
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data.models.map((m: any) => m.name))
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      // Add a default message if Ollama isn't running
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        content: '⚠️ Unable to connect to Ollama. Make sure Ollama is running on http://localhost:11434',
        role: 'assistant',
        timestamp: new Date()
      }])
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: input }],
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: messages.length + 2,
        content: data.message.content,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: messages.length + 2,
        content: '❌ Error connecting to Ollama. Make sure it\'s running on http://localhost:11434',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: 1,
      content: 'Chat cleared. How can I help you?',
      role: 'assistant',
      timestamp: new Date()
    }])
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🤖 Ollama Chat</h1>
        <p>ChatGPT-like interface for Ollama local models</p>
      </header>

      <div className="chat-container">
        <div className="sidebar">
          <div className="model-selector">
            <label htmlFor="model-select">Model:</label>
            <select 
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="model-dropdown"
            >
              {availableModels.length > 0 ? (
                availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))
              ) : (
                <option value="llama2">llama2</option>
              )}
            </select>
          </div>
          <button onClick={fetchModels} className="refresh-button">
            🔄 Refresh Models
          </button>
          <button onClick={clearChat} className="clear-button">
            🗑️ Clear Chat
          </button>
          <div className="connection-status">
            <div className={`status-indicator ${availableModels.length > 0 ? 'connected' : 'disconnected'}`}></div>
            <span>{availableModels.length > 0 ? 'Connected to Ollama' : 'Not connected'}</span>
          </div>
        </div>

        <div className="chat-main">
          <div className="messages-container">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.role}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                className="chat-input"
                rows={3}
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
                className="send-button"
              >
                {isLoading ? '⏳' : '🚀'}
              </button>
            </div>
            <div className="input-hint">
              Ollama running on <code>http://localhost:11434</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
