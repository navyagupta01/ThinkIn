import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, Lightbulb, BookOpen, Users, BarChart3 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type ContextStage = 'idle' | 'awaiting_subject' | 'awaiting_duration' | 'ready';

const TeacherChatbot: React.FC = () => {
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

  const quickPrompts = [
    {
      category: 'Lesson Planning',
      icon: BookOpen,
      color: 'bg-blue-500',
      prompts: [
        'Create a lesson plan for advanced algebra',
        'Suggest interactive activities for physics',
        'Help me design a chemistry lab experiment'
      ]
    },
    {
      category: 'Student Engagement',
      icon: Users,
      color: 'bg-green-500',
      prompts: [
        'How to improve student participation?',
        'Ideas for making math more engaging',
        'Strategies for shy students'
      ]
    },
    {
      category: 'Assessment',
      icon: BarChart3,
      color: 'bg-purple-500',
      prompts: [
        'Create quiz questions for biology',
        'Rubric for essay grading',
        'Alternative assessment methods'
      ]
    },
    {
      category: 'Teaching Tips',
      icon: Lightbulb,
      color: 'bg-orange-500',
      prompts: [
        'Classroom management techniques',
        'How to handle difficult students',
        'Time management for teachers'
      ]
    }
  ];

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

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">AI Teaching Assistant 🤖</h1>
        <p className="text-blue-100">Get personalized help with lesson planning, student engagement, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Prompts</CardTitle>
            <CardDescription>Click to get started with common requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickPrompts.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${category.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-medium text-sm">{category.category}</h4>
                  </div>
                  <div className="space-y-1">
                    {category.prompts.map((prompt, promptIndex) => (
                      <Button
                        key={promptIndex}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-auto p-2 text-left whitespace-normal"
                        onClick={() => handleQuickPrompt(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" /> AI Chat Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
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
                    className={`max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-lg ${
                      message.sender === 'user' ? 'bg-intel-blue text-white' : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about teaching..."
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
    </div>
  );
};

export default TeacherChatbot;
