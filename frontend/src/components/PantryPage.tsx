import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';
import { PantryItem } from '../types/pantry.types';
import { Trash, Plus, Magic } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };

export const PantryPage: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchPantry(); }, []);

  const fetchPantry = async () => {
    try {
      const response = await authService.fetchWithAuth('/api/pantry');
      if (response.ok) setItems(await response.json());
    } catch (err) { setError("Failed to load pantry"); } 
    finally { setLoading(false); }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      const response = await authService.fetchWithAuth('/api/pantry', {
        method: 'POST',
        body: JSON.stringify({ name: newItem, expirationDate: newDate })
      });
      if (response.ok) { setNewItem(''); setNewDate(''); fetchPantry(); }
    } catch (err) { setError("Could not add item"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await authService.fetchWithAuth(`/api/pantry/${id}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== id));
    } catch (err) { setError("Could not delete item"); }
  };

  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return null;
    const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (days < 0) return { color: 'danger', text: 'Expired', bg: '#ffebee', textCol: '#c62828' };
    if (days <= 3) return { color: 'warning', text: 'Expiring Soon', bg: '#fff3e0', textCol: '#ef6c00' };
    return { color: 'success', text: `${days} days left`, bg: '#e8f5e9', textCol: '#2e7d32' };
  };

  const handleLeftoverSearch = () => {
    const ingredients = items.map(i => i.name).join(',');
    navigate(`/?query=${encodeURIComponent(ingredients)}&mode=pantry`);
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.5 }}>
      
      {/* Hero Section */}
      <section style={{ padding: '4rem 0 3rem', background: 'linear-gradient(135deg, #fdfbf7 0%, #f4f7f6 100%)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Container className="text-center">
           <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--matcha-dark)' }}>My Pantry</h1>
           <p className="lead text-muted mb-4">Track your ingredients, reduce waste, and cook creatively.</p>
           {items.length > 0 && (
              <Button 
                variant="success" 
                onClick={handleLeftoverSearch}
                className="px-4 py-2 rounded-pill shadow-sm fw-bold"
                style={{ backgroundColor: 'var(--matcha-medium)', border: 'none' }}
              >
                  <Magic className="me-2"/> Cook with what I have
              </Button>
           )}
        </Container>
      </section>

      <Container className="my-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-lg border-0" style={{ borderRadius: 'var(--bs-border-radius-xl)' }}>
              <Card.Body className="p-4 p-md-5">
                
                <Form onSubmit={handleAddItem} className="mb-5">
                  <div className="d-flex flex-column flex-md-row gap-3">
                    <Form.Control 
                        type="text" 
                        placeholder="Add ingredient (e.g., Rice)" 
                        value={newItem} 
                        onChange={(e) => setNewItem(e.target.value)} 
                        className="border-0 bg-light shadow-sm py-3 flex-grow-1"
                        style={{ fontSize: '1.1rem' }}
                    />
                    <Form.Control 
                        type="date" 
                        value={newDate} 
                        onChange={(e) => setNewDate(e.target.value)} 
                        className="border-0 bg-light shadow-sm py-3" 
                        style={{ width: '100%', maxWidth: '200px' }} 
                    />
                    <Button variant="primary" type="submit" className="px-4 py-3 rounded-3 shadow-sm">
                        <Plus size={24} />
                    </Button>
                  </div>
                </Form>

                {error && <Alert variant="danger" className="text-center border-0 bg-danger bg-opacity-10 text-danger">{error}</Alert>}

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} />
                  </div>
                ) : (
                  <div className="pantry-list">
                    <AnimatePresence>
                      {items.map(item => {
                        const status = getExpiryStatus(item.expirationDate);
                        return (
                          <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, height: 0 }}
                            layout
                            className="mb-3"
                          >
                            <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white hover-shadow transition-all" style={{ borderColor: '#f0f0f0' }}>
                              <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🥗</span> 
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>{item.name}</h5>
                                    {status && (
                                        <Badge bg="light" className="mt-1 fw-normal" style={{ backgroundColor: status.bg, color: status.textCol }}>
                                            {status.text}
                                        </Badge>
                                    )}
                                </div>
                              </div>
                              <Button variant="light" className="text-danger bg-transparent border-0" onClick={() => handleDelete(item.id)}>
                                <Trash size={18} />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {items.length === 0 && (
                        <div className="text-center py-5">
                            <div className="display-1 mb-3">🥕</div>
                            <p className="text-muted">Your pantry is empty.</p>
                        </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};