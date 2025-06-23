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

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newUserMessage: Message = {
        id: Date.now(),
        text: inputText,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newUserMessage]);
      setInputText('');

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now() + 1,
          text: generateBotResponse(inputText),
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('lesson plan')) {
      return "I'd be happy to help you create a lesson plan! To provide the most relevant suggestions, could you tell me: 1) What subject and grade level? 2) What's the main learning objective? 3) How long is the class period? 4) What resources do you have available?";
    } else if (input.includes('engagement') || input.includes('participate')) {
      return "Great question! Here are some proven strategies to boost student engagement: 1) Use interactive polls and quizzes 2) Incorporate group discussions and peer learning 3) Connect lessons to real-world applications 4) Use multimedia and visual aids 5) Encourage questions and create a safe learning environment. Would you like me to elaborate on any of these strategies?";
    } else if (input.includes('quiz') || input.includes('assessment')) {
      return "I can help you create effective assessments! For quiz questions, I recommend using a mix of: 1) Multiple choice for quick knowledge checks 2) Short answer for concept understanding 3) Problem-solving questions for application 4) Essay questions for deeper analysis. What subject area are you assessing, and what learning objectives do you want to measure?";
    } else {
      return "That's an interesting question! I'm here to help with various teaching challenges. Could you provide more details about what you're looking for? I can assist with lesson planning, student engagement, classroom management, assessment creation, and much more.";
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">AI Teaching Assistant 🤖</h1>
        <p className="text-blue-100">Get personalized help with lesson planning, student engagement, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Prompts */}
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

        {/* Chat Interface */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              AI Chat Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages Container */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    message.sender === 'user' 
                      ? 'bg-intel-blue' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-intel-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' 
                        ? 'text-blue-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about teaching..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-intel-blue hover:bg-intel-darkblue"
                disabled={!inputText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant Capabilities</CardTitle>
          <CardDescription>Here's how I can help enhance your teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
              <h4 className="font-medium mb-1">Lesson Planning</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create comprehensive lesson plans, learning objectives, and activity suggestions.
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <Users className="h-8 w-8 text-green-500 mb-2" />
              <h4 className="font-medium mb-1">Student Engagement</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Strategies to increase participation and make learning more interactive.
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
              <h4 className="font-medium mb-1">Assessment Design</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate quiz questions, rubrics, and alternative assessment methods.
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <Lightbulb className="h-8 w-8 text-orange-500 mb-2" />
              <h4 className="font-medium mb-1">Teaching Tips</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Classroom management, time management, and pedagogical best practices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherChatbot;