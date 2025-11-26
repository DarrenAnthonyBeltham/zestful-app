import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';
import { Person, Envelope, Lock, ArrowRight } from 'react-bootstrap-icons';

const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };

const backgroundStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: -1,
  background: `url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(20, 40, 30, 0.6)',
  backdropFilter: 'blur(4px)',
  zIndex: 0
};

const backgroundAnimation = {
  scale: [1, 1.05],
  transition: { duration: 25, repeat: Infinity, repeatType: "reverse" as const, ease: "linear" as const }
};

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const switchAuthModeHandler = () => {
        setIsLogin(!isLogin);
        setError(null);
        setSuccess(null);
        setUsername('');
        setEmail('');
        setPassword('');
    };

    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const url = isLogin ? '/api/auth/login' : '/api/auth/register';
        const body = isLogin
            ? JSON.stringify({ email, password })
            : JSON.stringify({ username, email, password });

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: body,
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Authentication failed');
            }

            if (isLogin) {
                const data: { accessToken: string, role: string } = await response.json();
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('role', data.role);
                setSuccess('Welcome back, Chef!');
                setTimeout(() => { window.location.href = '/favorites'; }, 1000);
            } else {
                setSuccess("Account created! Please log in.");
                setIsLogin(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.5 }}>
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: -1 }}>
             <motion.div style={backgroundStyle} animate={backgroundAnimation} />
             <div style={overlayStyle} />
          </div>

          <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
              <Row className="w-100 justify-content-center">
                  <Col md={8} lg={5}>
                      <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                          <Card.Body className="p-5">
                              <div className="text-center mb-5">
                                  <h1 className="display-5 fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--matcha-dark)' }}>Zestful</h1>
                                  <p className="text-muted small text-uppercase tracking-wide fw-bold letter-spacing-2">
                                      {isLogin ? 'Your Kitchen Awaits' : 'Join the Culinary Club'}
                                  </p>
                              </div>
                              
                              <AnimatePresence mode='wait'>
                                {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Alert variant="danger" className="text-center border-0 bg-danger bg-opacity-10 text-danger small">{error}</Alert></motion.div>}
                                {success && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Alert variant="success" className="text-center border-0 bg-success bg-opacity-10 text-success small">{success}</Alert></motion.div>}
                              </AnimatePresence>

                              <Form onSubmit={submitHandler}>
                                  <AnimatePresence mode="wait">
                                    {!isLogin && (
                                        <motion.div
                                            key="username-field"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Form.Group className="mb-4">
                                                <InputGroup className="border-bottom">
                                                    <InputGroup.Text className="bg-transparent border-0 ps-0"><Person size={18} className="text-muted"/></InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                        className="border-0 shadow-none bg-transparent px-2"
                                                        style={{ fontSize: '0.95rem' }}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </motion.div>
                                    )}
                                  </AnimatePresence>

                                  <Form.Group className="mb-4">
                                      <InputGroup className="border-bottom">
                                          <InputGroup.Text className="bg-transparent border-0 ps-0"><Envelope size={18} className="text-muted"/></InputGroup.Text>
                                          <Form.Control
                                              type="email"
                                              placeholder="Email Address"
                                              value={email}
                                              onChange={(e) => setEmail(e.target.value)}
                                              required
                                              className="border-0 shadow-none bg-transparent px-2"
                                              style={{ fontSize: '0.95rem' }}
                                          />
                                      </InputGroup>
                                  </Form.Group>

                                  <Form.Group className="mb-5">
                                      <InputGroup className="border-bottom">
                                          <InputGroup.Text className="bg-transparent border-0 ps-0"><Lock size={18} className="text-muted"/></InputGroup.Text>
                                          <Form.Control
                                              type="password"
                                              placeholder="Password"
                                              value={password}
                                              onChange={(e) => setPassword(e.target.value)}
                                              minLength={6}
                                              required
                                              className="border-0 shadow-none bg-transparent px-2"
                                              style={{ fontSize: '0.95rem' }}
                                          />
                                      </InputGroup>
                                  </Form.Group>

                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        className="w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                                        disabled={loading}
                                        style={{ borderRadius: '50px', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}
                                    >
                                        {loading ? <Spinner size="sm" animation="border" /> : (
                                            <>
                                                {isLogin ? 'Sign In' : 'Create Account'} 
                                                {!loading && <ArrowRight className="ms-2" />}
                                            </>
                                        )}
                                    </Button>
                                  </motion.div>
                              </Form>
                              
                              <div className="mt-4 text-center">
                                  <span className="text-muted small me-2">{isLogin ? "New to Zestful?" : 'Already a member?'}</span>
                                  <Button
                                      variant="link"
                                      onClick={switchAuthModeHandler}
                                      className="text-decoration-none p-0 fw-bold"
                                      style={{ color: 'var(--matcha-dark)', fontSize: '0.9rem' }}
                                  >
                                      {isLogin ? "Create Account" : 'Sign In'}
                                  </Button>
                              </div>
                          </Card.Body>
                      </Card>
                  </Col>
              </Row>
          </Container>
        </motion.div>
    );
};