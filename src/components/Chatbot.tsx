import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your learning assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Save user message
    await supabase.from('chatbot_messages').insert({
      student_id: user.id,
      role: 'user',
      content: userMessage
    });

    // Simple rule-based responses
    let response = '';
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('suggest') || lowerMessage.includes('recommend')) {
      response = 'Based on your recent performance, I recommend focusing on topics where you scored below 70%. Would you like to see a list of recommended videos?';
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('score')) {
      response = 'I can see your recent test scores! To view detailed progress analytics, visit your Performance page from the dashboard.';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      response = 'I\'m here to help! You can ask me about:\n• Subject recommendations\n• Your progress and scores\n• Study tips\n• Navigating the platform\n\nWhat would you like to know?';
    } else if (lowerMessage.includes('video') || lowerMessage.includes('watch')) {
      response = 'You can find videos on your dashboard! Select your subjects and teachers first, then I\'ll show you personalized video recommendations.';
    } else if (lowerMessage.includes('test') || lowerMessage.includes('quiz')) {
      response = 'Tests help us understand your learning progress. After watching videos, take tests to track your improvement. Don\'t worry about scores - focus on learning!';
    } else {
      response = 'That\'s an interesting question! I\'m still learning, but you can navigate to different sections using the dashboard. Is there something specific you\'d like to do?';
    }

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);

    // Save assistant message
    await supabase.from('chatbot_messages').insert({
      student_id: user.id,
      role: 'assistant',
      content: response
    });
  };

  if (!user || profile?.role !== 'student') return null;

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow bg-gradient-primary hover:scale-110 transition-smooth z-50"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-glow flex flex-col z-50">
          <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-primary text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Learning Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                size="icon"
                disabled={loading || !input.trim()}
                className="bg-gradient-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};