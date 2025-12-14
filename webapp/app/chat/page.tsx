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

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory) as ChatHistory[];
        setChatHistory(history);
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    }
  }, []);

  // Save chat history when messages change (debounced)
  useEffect(() => {
    if (messages.length > 1 && currentChatId) {
      const timeoutId = setTimeout(() => {
        setChatHistory(prevHistory => {
          const history = [...prevHistory];
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
          
          // Sort by timestamp (newest first) and keep only last 20
          const sorted = history.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
          localStorage.setItem("chatHistory", JSON.stringify(sorted));
          return sorted;
        });
      }, 500); // Debounce 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId]);

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

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(h => h.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setSidebarOpen(false);
    }
  };

  const deleteChat = (chatId: string) => {
    const updated = chatHistory.filter(h => h.id !== chatId);
    setChatHistory(updated);
    localStorage.setItem("chatHistory", JSON.stringify(updated));
    setOpenMenuId(null);
    
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
        body: JSON.stringify({ question })
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
                    {message.text}
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

