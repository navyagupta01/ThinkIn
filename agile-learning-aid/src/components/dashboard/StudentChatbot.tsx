import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Bot,
  ExternalLink,
  RefreshCw,
  Trash2,
  User,
  Clock,
  MessageSquare
} from 'lucide-react';

const StudentChatbot = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
  const iframeRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Check if 3D teacher is running
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await fetch('http://localhost:5173', { mode: 'no-cors' });
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chat history
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:3000/history');
      const data = await res.json();
      setChatHistory(data);
    } catch (error) {
      console.error('Failed to fetch chat history', error);
    }
  };

  // Clear chat
  const clearChat = async () => {
    try {
      await fetch('http://localhost:3000/history', { method: 'DELETE' });
      setChatHistory([]);
    } catch (error) {
      console.error('Failed to clear chat history', error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Only scroll to bottom on initial load
  useEffect(() => {
    if (chatHistory.length > 0 && !hasInitiallyScrolled && chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        setHasInitiallyScrolled(true);
      }, 100);
    }
  }, [chatHistory, hasInitiallyScrolled]);

  const refreshIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const openInNewTab = () => {
    window.open('http://localhost:5173', '_blank');
  };

  // Format timestamp (you can add timestamp to your chat entries)
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white mb-6 mx-6 mt-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
          <MessageCircle className="h-6 w-6 md:h-8 md:w-8 mr-3" />
          3D AI Teacher Assistant
        </h1>
        <p className="text-[#a8d4f0] text-sm md:text-base">
          Interactive learning with your virtual 3D teacher
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-6 mb-6 overflow-hidden flex gap-6">
        {/* 3D Iframe Section - Made larger */}
        <div className="flex-[2] flex flex-col overflow-hidden min-w-0 h-full">
          <Card className="flex-1 flex flex-col overflow-hidden h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <div className="flex items-center">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 mr-2 text-[#0071c5]" />
                  Your 3D Virtual Teacher
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/70 px-3 py-1 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-xs hover:bg-blue-50" onClick={refreshIframe}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs hover:bg-blue-50" onClick={openInNewTab}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      New Tab
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-hidden">
              <div className="w-full h-full rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner">
                {isConnected ? (
                  <iframe
                    ref={iframeRef}
                    src="http://localhost:5173"
                    className="w-full h-full border-0"
                    title="3D Virtual Teacher"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="text-center p-8">
                      <Bot className="h-16 w-16 md:h-20 md:w-20 text-slate-400 mx-auto mb-6 animate-bounce" />
                      <h3 className="text-lg md:text-xl font-semibold text-slate-600 mb-2">
                        3D Teacher Not Available
                      </h3>
                      <p className="text-sm text-slate-500 mb-6">
                        Please start your 3D teacher on port 5173
                      </p>
                      <Button variant="outline" className="mt-4 hover:bg-blue-50" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Connection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Chat History Section - Made smaller but still functional */}
        <div className="flex-[0_0_350px] flex flex-col h-full">
          <Card className="flex flex-col h-full overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                <CardTitle className="text-base text-slate-700">Chat History</CardTitle>
                <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                  {chatHistory.length}
                </span>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="text-xs hover:bg-red-600 transition-colors" 
                onClick={clearChat}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </CardHeader>
            <CardContent 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500 mb-2">No conversations yet</p>
                  <p className="text-xs text-slate-400">Start chatting with your 3D teacher!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...chatHistory].reverse().map((entry, index) => (
                    <div 
                      key={entry.id || index} 
                      className="group relative animate-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Student Message */}
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <User className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-semibold text-slate-600">You</span>
                            {entry.timestamp && (
                              <span className="text-xs text-slate-400 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(entry.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2.5 rounded-2xl rounded-tl-md shadow-sm">
                            <p className="text-xs leading-relaxed">{entry.question}</p>
                          </div>
                        </div>
                      </div>

                      {/* Teacher Response */}
                      <div className="flex items-start space-x-3 ml-2">
                        <div className="flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <Bot className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-semibold text-indigo-600">AI Teacher</span>
                          </div>
                          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-2.5 rounded-2xl rounded-tl-md shadow-sm">
                            <p className="text-xs text-slate-700 leading-relaxed">{entry.answer}</p>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      {index < chatHistory.length - 1 && (
                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentChatbot;