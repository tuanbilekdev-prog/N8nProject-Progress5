"use client";

import { FormEvent, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Message = {
  id: number;
  from: "user" | "bot";
  text: string;
};

type ChatHistory = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: "bot",
      text: "Yooo! Dev siap nemenin kamu mikir!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Load chat history from Supabase
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const loadChatHistory = async () => {
        try {
          const res = await fetch("/api/chat");
          if (res.ok) {
            const data = await res.json();
            const sessions = data.sessions || [];
            // Convert Supabase sessions to ChatHistory format
            const history: ChatHistory[] = sessions.map((s: any) => ({
              id: s.id,
              title: s.title,
              messages: [], // Will be loaded when selected
              timestamp: new Date(s.updated_at || s.created_at).getTime()
            }));
            setChatHistory(history);
          }
        } catch (e) {
          console.error("Error loading chat history:", e);
          // Fallback to localStorage if Supabase fails
          const savedHistory = localStorage.getItem("chatHistory");
          if (savedHistory) {
            try {
              const history = JSON.parse(savedHistory) as ChatHistory[];
              setChatHistory(history);
            } catch (err) {
              console.error("Error parsing localStorage:", err);
            }
          }
        }
      };
      loadChatHistory();
    }
  }, [status, session]);

  // Save chat messages to Supabase (debounced)
  useEffect(() => {
    if (messages.length > 1 && currentChatId && status === "authenticated" && session?.user?.id) {
      const timeoutId = setTimeout(async () => {
        try {
          const firstUserMessage = messages.find(m => m.from === "user");
          const title = firstUserMessage?.text.slice(0, 30) || "Chat Baru";

          // Check if session exists in Supabase (only if currentChatId looks like UUID)
          const isSupabaseSession = currentChatId.length > 20; // UUID is longer than timestamp-based ID
          
          if (!isSupabaseSession) {
            // Create new session in Supabase
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "createSession",
                title
              })
            });
            
            if (res.ok) {
              const data = await res.json();
              const newSessionId = data.session.id;
              setCurrentChatId(newSessionId);
              
              // Save all messages to new session
              for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                await fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "saveMessage",
                    sessionId: newSessionId,
                    role: msg.from === "user" ? "user" : "assistant",
                    content: msg.text,
                    orderIndex: i
                  })
                });
              }
            }
          } else {
            // Update existing session title if needed
            await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "updateSession",
                sessionId: currentChatId,
                title
              })
            });

            // Save only new messages (check existing messages first)
            // For simplicity, we'll save all messages (API will handle duplicates)
            for (let i = 0; i < messages.length; i++) {
              const msg = messages[i];
              await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "saveMessage",
                  sessionId: currentChatId,
                  role: msg.from === "user" ? "user" : "assistant",
                  content: msg.text,
                  orderIndex: i
                })
              });
            }
          }

          // Update local history
          setChatHistory(prevHistory => {
            const history = [...prevHistory];
            const existingIndex = history.findIndex(h => h.id === currentChatId);
            const chatData: ChatHistory = {
              id: currentChatId,
              title,
              messages,
              timestamp: Date.now()
            };
            
            if (existingIndex >= 0) {
              history[existingIndex] = chatData;
            } else {
              history.push(chatData);
            }
            
            return history.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
          });
        } catch (error) {
          console.error("Error saving to Supabase:", error);
          // Fallback to localStorage
          const history = [...chatHistory];
          const existingIndex = history.findIndex(h => h.id === currentChatId);
          const firstUserMessage = messages.find(m => m.from === "user");
          const title = firstUserMessage?.text.slice(0, 30) || "Chat Baru";
          
          const chatData: ChatHistory = {
            id: currentChatId,
            title,
            messages,
            timestamp: Date.now()
          };
          
          if (existingIndex >= 0) {
            history[existingIndex] = chatData;
          } else {
            history.push(chatData);
          }
          
          const sorted = history.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
          localStorage.setItem("chatHistory", JSON.stringify(sorted));
          setChatHistory(sorted);
        }
      }, 1000); // Debounce 1s
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId, status, session]);

  // Initialize current chat ID
  useEffect(() => {
    if (!currentChatId) {
      const newChatId = `chat-${Date.now()}`;
      setCurrentChatId(newChatId);
    }
  }, [currentChatId]);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    setMessages([
      {
        id: 1,
        from: "bot",
        text: "Yooo! Dev siap nemenin kamu mikir!"
      }
    ]);
    setSidebarOpen(false);
  };

  const loadChat = async (chatId: string) => {
    try {
      // Try to load from Supabase first
      const res = await fetch(`/api/chat?sessionId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        const messages = data.messages || [];
        // Convert Supabase messages to Message format
        const formattedMessages: Message[] = messages.map((m: any, idx: number) => ({
          id: idx + 1,
          from: m.role === "user" ? "user" : "bot",
          text: m.content
        }));
        setCurrentChatId(chatId);
        setMessages(formattedMessages);
        setSidebarOpen(false);
        return;
      }
    } catch (error) {
      console.error("Error loading chat from Supabase:", error);
    }

    // Fallback to local history
    const chat = chatHistory.find(h => h.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setSidebarOpen(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    setOpenMenuId(null);
    
    try {
      // Delete from Supabase
      await fetch(`/api/chat?sessionId=${chatId}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.error("Error deleting from Supabase:", error);
    }

    // Update local state
    const updated = chatHistory.filter(h => h.id !== chatId);
    setChatHistory(updated);
    
    // Fallback to localStorage
    localStorage.setItem("chatHistory", JSON.stringify(updated));
    
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  const toggleMenu = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setUserMenuOpen(false);
    };
    
    if (openMenuId || userMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId, userMenuOpen]);

  // Function to format message text with better structure
  const formatMessage = (text: string) => {
    // Split by double newlines to detect paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((para, idx) => {
      const trimmedPara = para.trim();
      
      // Check if paragraph is a numbered list (1., 2., etc.)
      if (/^\d+\.\s/.test(trimmedPara)) {
        const lines = trimmedPara.split('\n').filter(line => line.trim());
        return (
          <div key={idx} className="chat-message-list">
            {lines.map((line, lineIdx) => {
              // Extract number and content
              const match = line.match(/^(\d+)\.\s*(.+)/);
              if (match) {
                const [, num, content] = match;
                
                // Check if content has product info format (Name: **Title**, Specs: ..., Quantity: ..., Location: ...)
                const productMatch = content.match(/(.+?):\s*\*\*(.+?)\*\*/);
                if (productMatch) {
                  const productName = productMatch[2];
                  const restContent = content.replace(productMatch[0], '').trim();
                  
                  // Extract specifications, quantity, location
                  const specsMatch = restContent.match(/Specifications?:\s*(.+?)(?:\n|$)/i);
                  const qtyMatch = restContent.match(/Available Quantity|Quantity|Stok|Jumlah:\s*(\d+)/i);
                  const locMatch = restContent.match(/Location|Lokasi:\s*(.+?)(?:\n|$)/i);
                  
                  return (
                    <div key={lineIdx} className="chat-list-item chat-product-item">
                      <span className="chat-list-number">{num}.</span>
                      <div className="chat-list-content">
                        <strong className="chat-product-name">{productName}</strong>
                        {specsMatch && (
                          <div className="chat-product-spec">
                            <span className="chat-spec-label">Spesifikasi:</span>
                            <span className="chat-spec-value">{specsMatch[1].trim()}</span>
                          </div>
                        )}
                        <div className="chat-product-details">
                          {qtyMatch && (
                            <span className="chat-detail-badge chat-detail-qty">
                              Stok: {qtyMatch[1]} unit
                            </span>
                          )}
                          {locMatch && (
                            <span className="chat-detail-badge chat-detail-loc">
                              Lokasi: {locMatch[1].trim()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Regular list item with bold text
                const formattedContent = content.split(/(\*\*.*?\*\*)/g).map((part, partIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={partIdx} className="chat-bold">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });
                
                return (
                  <div key={lineIdx} className="chat-list-item">
                    <span className="chat-list-number">{num}.</span>
                    <div className="chat-list-content">
                      {formattedContent}
                    </div>
                  </div>
                );
              }
              return <div key={lineIdx} className="chat-list-item">{line}</div>;
            })}
          </div>
        );
      }
      
      // Check if paragraph contains bold text (markdown **)
      const hasBold = /\*\*.*?\*\*/.test(trimmedPara);
      if (hasBold) {
        const parts = trimmedPara.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="chat-message-paragraph">
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIdx} className="chat-bold">{part.slice(2, -2)}</strong>;
              }
              // Check for links (format: Sumber: http://...)
              if (part.includes('Sumber:') || part.includes('http')) {
                const linkMatch = part.match(/(Sumber:?\s*)(https?:\/\/[^\s]+)/);
                if (linkMatch) {
                  const [, prefix, url] = linkMatch;
                  return (
                    <span key={partIdx}>
                      {part.split(linkMatch[0])[0]}
                      {prefix}
                      <a href={url} target="_blank" rel="noopener noreferrer" className="chat-link">
                        {url}
                      </a>
                      {part.split(linkMatch[0])[1]}
                    </span>
                  );
                }
              }
              return <span key={partIdx}>{part}</span>;
            })}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <div key={idx} className="chat-message-paragraph">
          {trimmedPara}
        </div>
      );
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setError(null);

    const newUserMessage: Message = {
      id: Date.now(),
      from: "user",
      text: question
    };
    setMessages(prev => [...prev, newUserMessage]);

    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          question,
          chatId: currentChatId || `chat-${Date.now()}`
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Gagal memanggil webhook n8n");
      }

      const data = await res.json();
      const answerText =
        typeof data.answer === "string"
          ? data.answer
          : typeof data === "string"
          ? data
          : JSON.stringify(data, null, 2);

      const botMessage: Message = {
        id: Date.now() + 1,
        from: "bot",
        text: answerText
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan tak diketahui");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="chat-container">
          <div className="chat-loading">Memuat...</div>
        </div>
      </div>
    );
  }

  // Don't render chat if not authenticated
  if (status === "unauthenticated" || !session) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 chat-page-wrapper">
      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? "chat-sidebar-open" : ""}`}>
        <div className="chat-sidebar-header">
          <h2 className="chat-sidebar-title">Riwayat Chat</h2>
          <button
            onClick={toggleSidebar}
            className="chat-sidebar-close"
            aria-label="Tutup sidebar"
          >
            ✕
          </button>
        </div>
        <button
          onClick={startNewChat}
          className="chat-sidebar-new"
        >
          + Chat Baru
        </button>
        <div className="chat-sidebar-list">
          {chatHistory.length === 0 ? (
            <div className="chat-sidebar-empty">
              <p>Belum ada riwayat chat</p>
            </div>
          ) : (
            chatHistory.map(chat => (
              <div
                key={chat.id}
                className={`chat-sidebar-item ${currentChatId === chat.id ? "chat-sidebar-item-active" : ""}`}
                onClick={() => loadChat(chat.id)}
              >
                <div className="chat-sidebar-item-content">
                  <p className="chat-sidebar-item-title">{chat.title}</p>
                  <span className="chat-sidebar-item-time">
                    {new Date(chat.timestamp).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <div className="chat-sidebar-item-menu">
                  <button
                    onClick={(e) => toggleMenu(chat.id, e)}
                    className="chat-sidebar-item-menu-button"
                    aria-label="Menu"
                    title="Menu"
                  >
                    ⋮
                  </button>
                  {openMenuId === chat.id && (
                    <div className="chat-sidebar-item-menu-dropdown">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="chat-sidebar-item-menu-item"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="chat-sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="chat-main-wrapper">
        {/* User Menu */}
        <div className="user-menu">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuOpen(!userMenuOpen);
            }}
            className="user-menu-button"
            aria-label="User menu"
            title="Menu"
          >
            ⋮
          </button>
          {userMenuOpen && (
            <div className="user-menu-dropdown">
              {session.user?.email && (
                <div className="user-menu-email">
                  {session.user.email}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className="user-menu-item"
              >
                <span>Tema: {theme === "dark" ? "Gelap" : "Terang"}</span>
                <span>{theme === "dark" ? "☀️" : "🌙"}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="user-menu-item user-menu-item-logout"
              >
                Keluar
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="chat-sidebar-toggle"
          aria-label="Toggle sidebar"
          title="Buka riwayat chat"
        >
          ☰
        </button>

        <div className="chat-container">
        <header className="chat-header">
          <div className="chat-header-title">Dev AI</div>
          <p className="chat-header-subtitle">
            Smart help, fast solution
          </p>
          {session.user?.email && (
            <p className="chat-header-user">
              Logged in as: {session.user.email}
            </p>
          )}
        </header>

        <main className="chat-main">
          <div className="chat-messages">
            {messages.map(message => {
              const isUser = message.from === "user";
              return (
                <div
                  key={message.id}
                  className={`chat-row ${isUser ? "chat-row-user" : "chat-row-bot"}`}
                >
                  <div
                    className={`chat-bubble ${
                      isUser ? "chat-bubble-user" : "chat-bubble-bot"
                    }`}
                  >
                    {isUser ? (
                      message.text
                    ) : (
                      <div className="chat-message-content">
                        {formatMessage(message.text)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {error && <div className="chat-error">{error}</div>}
        </main>

        <form onSubmit={handleSubmit} className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Tulis pertanyaan untuk dikirim ke n8n..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={loading || !input.trim()}
          >
            {loading ? "Mengirim..." : "Kirim"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

