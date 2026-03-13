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
  const [isChatOpen, setIsChatOpen] = useState(false)
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
      {/* Business Header */}
      <header className="business-header">
        <div className="header-content">
          <div className="logo">
            <h1>🚀 TechSolutions Inc.</h1>
          </div>
          <nav className="main-nav">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <button className="cta-button">Get Started</button>
          </nav>
        </div>
      </header>

      {/* Main Business Content */}
      <main className="business-main">
        <section className="hero-section">
          <div className="hero-content">
            <h2>Transform Your Business with AI-Powered Solutions</h2>
            <p>We deliver cutting-edge technology solutions that drive growth, efficiency, and innovation for forward-thinking organizations.</p>
            <div className="hero-buttons">
              <button className="primary-btn">Learn More</button>
              <button className="secondary-btn">View Case Studies</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="placeholder-image">✨</div>
          </div>
        </section>

        <section className="services-section">
          <h3>Our Services</h3>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🤖</div>
              <h4>AI Integration</h4>
              <p>Seamlessly integrate AI solutions into your existing workflows and systems.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h4>Data Analytics</h4>
              <p>Turn your data into actionable insights with our advanced analytics platform.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔒</div>
              <h4>Security Solutions</h4>
              <p>Protect your digital assets with our comprehensive security services.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">☁️</div>
              <h4>Cloud Migration</h4>
              <p>Move to the cloud efficiently with our expert migration services.</p>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-container">
            <div className="stat">
              <h5>250+</h5>
              <p>Clients Worldwide</p>
            </div>
            <div className="stat">
              <h5>99.9%</h5>
              <p>Uptime Guarantee</p>
            </div>
            <div className="stat">
              <h5>24/7</h5>
              <p>Support Available</p>
            </div>
            <div className="stat">
              <h5>50+</h5>
              <p>Expert Engineers</p>
            </div>
          </div>
        </section>

        <section className="testimonial-section">
          <h3>What Our Clients Say</h3>
          <div className="testimonial">
            <p>"TechSolutions transformed our entire operation. Their AI integration increased our efficiency by 40%."</p>
            <div className="testimonial-author">
              <strong>Sarah Johnson</strong>
              <span>CEO, InnovateCorp</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="business-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>TechSolutions Inc.</h4>
            <p>Leading the way in business technology solutions since 2015.</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>contact@techsolutions.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#twitter">Twitter</a>
              <a href="#linkedin">LinkedIn</a>
              <a href="#github">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 TechSolutions Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* Chat Widget */}
      <div className={`chat-widget ${isChatOpen ? 'open' : ''}`}>
        {isChatOpen ? (
          <div className="chat-window">
            <div className="chat-header">
              <h4>🤖 AI Assistant</h4>
              <button className="close-chat" onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            <div className="chat-messages">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`chat-message ${message.role}`}
                >
                  <div className="message-bubble">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message assistant">
                  <div className="message-bubble">
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
            <div className="chat-input-area">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                rows={2}
              />
              <div className="chat-controls">
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="model-select"
                >
                  {availableModels.length > 0 ? (
                    availableModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  ) : (
                    <option value="llama2">llama2</option>
                  )}
                </select>
                <button 
                  onClick={sendMessage} 
                  disabled={isLoading || !input.trim()}
                  className="send-btn"
                >
                  {isLoading ? '⏳' : '➤'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button className="chat-toggle" onClick={() => setIsChatOpen(true)}>
            <span className="chat-icon">💬</span>
            <span className="chat-label">AI Assistant</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default App
