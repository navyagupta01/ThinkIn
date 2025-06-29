import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Bot, User, Send, MessageCircle
} from 'lucide-react';
import QADiscussionBoard from '@/components/QADiscussionBoard';
import ErrorBoundary from '@/components/ErrorBoundary';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type ContextStage = 'idle' | 'awaiting_subject' | 'awaiting_duration' | 'ready';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI teaching assistant. I can help you with lesson planning, student engagement strategies, assessment creation, and more. What would you like assistance with today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextStage, setContextStage] = useState<ContextStage>('idle');
  const [lessonSubject, setLessonSubject] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: User not authenticated. Please log in.
      </div>
    );
  }

  const addBotMessage = (text: string) => {
    const botMessage: Message = {
      id: Date.now() + 1,
      text,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    if (contextStage === 'awaiting_subject') {
      setLessonSubject(inputText);
      setContextStage('awaiting_duration');
      addBotMessage('Got it! How long is the class (in minutes)?');
      return;
    }

    if (contextStage === 'awaiting_duration') {
      setLessonDuration(inputText);
      setContextStage('ready');
      addBotMessage(`Subject: ${lessonSubject}\nDuration: ${inputText} mins\nGenerating full lesson plan...`);
    }

    if (contextStage === 'idle' && /lesson plan|make a plan/i.test(inputText)) {
      setContextStage('awaiting_subject');
      addBotMessage('Sure! What subject is the lesson for?');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://yourwebsite.com',
          'X-Title': 'EduChatbot'
        },
        body: JSON.stringify({
          model: 'mistralai/mixtral-8x7b-instruct',
          messages: [
            {
              role: 'system',
              content:
                "You are EduChatBot, a friendly AI education assistant.\nRespond with clear formatting: use paragraphs, line breaks, and numbered or bulleted lists when appropriate.\nOnly provide full lesson plans when you know the subject and class duration."
            },
            ...messages.map((msg) => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            { role: 'user', content: inputText }
          ]
        })
      });

      const data = await response.json();
      const botResponse = data?.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
      addBotMessage(botResponse);

      setContextStage('idle');
      setLessonSubject('');
      setLessonDuration('');
    } catch (err) {
      addBotMessage("Oops! Couldn't fetch a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👨‍🏫</h1>
        <p className="text-blue-100">Ready to inspire minds today?</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Q&A Section */}
        <div className="lg:col-span-4">
          <ErrorBoundary>
            <QADiscussionBoard
              user={{
                id: user.id,
                name: user.name,
                role: user.role || 'teacher',
              }}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Floating Assistant Button */}
      <button
        onClick={() => setShowAssistant(prev => !prev)}
        className="fixed bottom-5 right-5 z-50 bg-intel-blue text-white p-3 rounded-full shadow-lg hover:bg-intel-darkblue transition"
        aria-label="Toggle AI Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Assistant Pop-up */}
      {showAssistant && (
  <div className="fixed bottom-20 right-6 z-50 w-[90vw] sm:w-[22rem] bg-white dark:bg-gray-900 shadow-xl rounded-2xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
    <Card className="flex-1 flex flex-col min-h-0">
      <CardHeader className="py-2 px-4 border-b">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            AI Assistant
          </span>
          <button
            onClick={() => setShowAssistant(false)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-3 pb-3 min-h-0">
        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-3 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  message.sender === 'user' ? 'bg-intel-blue' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div
                className={`max-w-xs p-3 rounded-lg text-sm ${
                  message.sender === 'user' ? 'bg-intel-blue text-white' : 'bg-white dark:bg-gray-900'
                }`}
              >
                <p className="whitespace-pre-line leading-snug">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center space-x-2 mt-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about teaching..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-intel-blue hover:bg-intel-darkblue"
            disabled={!inputText.trim() || loading}
          >
            {loading ? '...' : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)}

    </div>
  );
};

export default TeacherDashboard;
