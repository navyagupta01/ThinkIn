import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Loader2, BookOpen, Calculator, Lightbulb, Brain } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIAssistantProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${user.name}! 👋 I'm your AI study assistant. I'm here to help you with any academic questions across subjects like Math, Science, History, Literature, Psychology, Computer Science, and more. What would you like to explore today?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Enhanced system prompt for better educational assistance
  const systemPrompt = `You are EduChatBot, an advanced AI education assistant designed specifically for students. Your role:

PERSONALITY & APPROACH:
- Be encouraging, patient, and supportive like the best teacher
- Use a friendly, conversational tone that builds confidence
- Celebrate student curiosity and effort
- Never be condescending or overly complex

TEACHING METHODOLOGY:
- Break down complex concepts into digestible steps
- Use analogies, real-world examples, and visual descriptions
- Provide multiple approaches to solve problems
- Ask guiding questions to help students think critically
- Encourage active learning and self-discovery

SUBJECT EXPERTISE:
- Mathematics (Algebra, Calculus, Statistics, Geometry)
- Sciences (Physics, Chemistry, Biology, Computer Science)
- Humanities (History, Literature, Philosophy, Psychology)
- Study Skills (Note-taking, time management, exam prep)
- Research & Writing (Citations, structure, critical thinking)

RESPONSE STRUCTURE:
1. Acknowledge the question positively
2. Provide clear, step-by-step explanations
3. Include relevant examples or analogies
4. Offer practice suggestions or next steps
5. End with encouragement and invitation for follow-up

SPECIAL FEATURES:
- If asked about homework, guide toward understanding rather than giving direct answers
- Suggest study techniques and learning strategies
- Provide memory aids and mnemonics when helpful
- Recommend additional resources when appropriate
- Help with exam anxiety and study motivation

Always aim to inspire curiosity and love of learning!`;

  const quickSuggestions = [
    { icon: Calculator, text: "Help with math", color: "text-blue-600" },
    { icon: BookOpen, text: "Explain a concept", color: "text-green-600" },
    { icon: Brain, text: "Study strategies", color: "text-purple-600" },
    { icon: Lightbulb, text: "Essay writing tips", color: "text-orange-600" },
  ];

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'EduChatbot Student Dashboard'
        },
        body: JSON.stringify({
          model: 'mistralai/mixtral-8x7b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: messageText }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I encountered an issue. Please try again.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '🤖 Oops! I\'m having trouble connecting right now. Please check your internet connection and try again. In the meantime, feel free to try rephrasing your question!',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: `Hello ${user.name}! 👋 I'm your AI study assistant. What would you like to learn about today?`,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-[#f0f8ff] to-[#e6f3ff] dark:from-[#0071c5]/10 dark:to-[#004494]/10 h-[600px] flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 mr-3 text-[#0071c5]" />
            AI Study Assistant
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearChat}
            className="text-xs hover:bg-white/50"
          >
            Clear
          </Button>
        </CardTitle>
        <CardDescription>Your personal tutor for any subject 🎓</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
        {/* Chat Messages */}
        <div className="flex-1 mb-4 overflow-hidden">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-4 pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl break-words ${
                      message.isUser
                        ? 'bg-gradient-to-r from-[#0071c5] to-[#004494] text-white'
                        : 'bg-white dark:bg-slate-800 shadow-sm border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70 ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 shadow-sm border p-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0071c5]" />
                      <p className="text-sm text-gray-600">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-3 flex-shrink-0">
            <p className="text-xs text-gray-600 mb-2 font-medium">Quick start suggestions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="justify-start h-auto p-2 text-xs bg-white/50 hover:bg-white/80"
                >
                  <suggestion.icon className={`h-3 w-3 mr-2 ${suggestion.color}`} />
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-2 flex-shrink-0">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your studies..."
            disabled={isLoading}
            className="flex-1 bg-white/70 border-0 focus:bg-white transition-colors"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-gradient-to-r from-[#0071c5] to-[#004494] hover:from-[#005a9f] to-[#003875] text-white shadow-lg flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;