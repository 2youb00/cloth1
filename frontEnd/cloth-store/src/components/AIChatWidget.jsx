"use client"

import { useState, useRef, useEffect } from "react"

const suggestions = ["ما الجديد؟", "أرني Carhartt pants", "اقتراح منتج", "أرني عروض اليوم", "فئات المنتجات"]

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleChat = () => setIsOpen(!isOpen)

  const sendMessage = async (text) => {
    const userInput = text || input.trim()
    if (!userInput || isLoading) return

    const newMessages = [...messages, { role: "user", content: userInput }]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("https://cloth1-1.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      })

      const data = await res.json()
      setMessages([...newMessages, { role: "assistant", content: data.reply }])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages([
        ...newMessages,
        { role: "assistant", content: "🤖 عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessage = (content) => {
    // Convert markdown-style formatting to HTML for better display
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/\n/g, "<br/>")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full w-16 h-16 shadow-xl text-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label="فتح المحادثة"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96  bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 animate-slideUp">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">🤖</div>
                <div>
                  <h2 className="font-bold text-lg">مساعد المتجر</h2>
                  <p className="text-gray-300 text-sm">متاح الآن للمساعدة</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:text-red-300 transition-colors text-xl p-1 hover:bg-white/10 rounded-full"
                aria-label="إغلاق المحادثة"
              >
                ✖
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
  className={`overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white transition-all duration-300 ${
    messages.length === 0 ? "max-h-60" : "h-80"
  }`}
>

            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-3 animate-bounce">👋</div>
                <p className="text-sm font-medium">مرحباً! كيف يمكنني مساعدتك اليوم؟</p>
                <p className="text-xs text-gray-400 mt-1">اسأل عن المنتجات، العروض، أو أي شيء آخر</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                <div
                  className={`flex items-end space-x-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm mb-1">
                      🤖
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                      msg.role === "user"
                        ? "bg-gray-900 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(msg.content),
                      }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm mb-1">
                      👤
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm mb-1">
                    🤖
                  </div>
                  <div className="bg-white text-gray-600 px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-gray-200 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm">جاري الكتابة...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 0 && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-3 font-medium">💡 اقتراحات سريعة:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(text)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-full transition-all duration-200 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
                    disabled={isLoading}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm placeholder-gray-400 transition-all duration-200"
                placeholder="اكتب رسالتك هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[48px] shadow-md hover:shadow-lg"
                disabled={isLoading || !input.trim()}
                aria-label="إرسال الرسالة"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">اضغط Enter للإرسال</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
