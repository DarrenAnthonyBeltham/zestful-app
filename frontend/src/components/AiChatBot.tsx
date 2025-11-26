import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatDots, X, Send } from 'react-bootstrap-icons';
import { authService } from '../services/auth.service';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Bonjour! I am your Sous Chef. Ask me anything about cooking!", sender: 'bot' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({ message: userMsg.text })
      });

      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "My apron is tied too tight! I can't answer right now.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1050 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{ marginBottom: '0px' }} // Removed margin since button is hidden
          >
            <Card style={{ width: '350px', height: '500px', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: 'none', overflow: 'hidden' }}>
              <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--matcha-dark)' }}>
                <div className="fw-bold d-flex align-items-center"><ChatDots className="me-2" /> Sous Chef AI</div>
                <X size={24} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
              </div>
              
              <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa', height: '380px' }} ref={scrollRef}>
                {messages.map(msg => (
                  <div key={msg.id} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div style={{ 
                      maxWidth: '80%', 
                      padding: '10px 15px', 
                      borderRadius: '15px',
                      backgroundColor: msg.sender === 'user' ? 'var(--matcha-medium)' : 'white',
                      color: msg.sender === 'user' ? 'white' : 'var(--matcha-text)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      borderBottomRightRadius: msg.sender === 'user' ? '2px' : '15px',
                      borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '15px'
                    }}>
                      <p className="mb-0 small">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="d-flex justify-content-start mb-3">
                    <div className="bg-white p-2 rounded-3 shadow-sm">
                      <Spinner animation="grow" size="sm" style={{ color: 'var(--matcha-medium)' }} />
                      <Spinner animation="grow" size="sm" style={{ color: 'var(--matcha-medium)', marginLeft: '2px' }} />
                      <Spinner animation="grow" size="sm" style={{ color: 'var(--matcha-medium)', marginLeft: '2px' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white border-top">
                <Form onSubmit={handleSend} className="d-flex gap-2">
                  <Form.Control 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about food..."
                    style={{ borderRadius: '20px', fontSize: '0.9rem' }}
                  />
                  <Button type="submit" variant="primary" className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} disabled={loading}>
                    <Send size={16} />
                  </Button>
                </Form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
          style={{ width: '60px', height: '60px', backgroundColor: 'var(--matcha-dark)', border: 'none' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
        >
          <ChatDots size={28} />
        </motion.button>
      )}
    </div>
  );
};