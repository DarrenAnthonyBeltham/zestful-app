import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, ListGroup, Button, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { authService } from '../services/auth.service';
import { People, BookmarkHeart, JournalText, CupHot, ShieldCheck, Trash } from 'react-bootstrap-icons';
import { motion } from 'framer-motion';

interface AdminStats {
  totalUsers: number;
  totalSavedRecipes: number;
  totalCustomRecipes: number;
  totalMealPlans: number;
  dietDistribution: { [key: string]: number };
}

interface Review {
  id: number;
  user: { username: string };
  rating: number;
  comment: string;
  createdAt: string;
}

const StatCard: React.FC<{ title: string, value: number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Card className="border-0 shadow-sm h-100 admin-card-gradient">
            <Card.Body className="d-flex align-items-center p-4">
                <div className="rounded-circle p-3 d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px', backgroundColor: `${color}20`, color: color }}>
                    {icon}
                </div>
                <div>
                    <h2 className="fw-bold mb-0 text-dark">{value}</h2>
                    <p className="text-muted mb-0 small text-uppercase fw-bold">{title}</p>
                </div>
            </Card.Body>
        </Card>
    </motion.div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', { headers: authService.getAuthHeader() });
        if (response.ok) setStats(await response.json());
        
        setReviews([
            { id: 1, user: { username: "chef_john" }, rating: 5, comment: "Great recipe!", createdAt: new Date().toISOString() },
            { id: 2, user: { username: "angry_user" }, rating: 1, comment: "Terrible! Hate it.", createdAt: new Date().toISOString() }
        ]);

      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const handleDeleteReview = (id: number) => {
      setReviews(reviews.filter(r => r.id !== id));
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} /></div>;
  if (!stats) return <div className="text-center py-5 text-muted">Access Denied</div>;

  const chartData = Object.entries(stats.dietDistribution || {}).map(([name, count]) => ({ name, count }));

  return (
    <Container className="my-5">
      <div className="mb-5">
        <h1 className="fw-bold display-5 mb-2" style={{ color: 'var(--matcha-dark)' }}>Admin Dashboard</h1>
        <p className="text-muted">Platform Analytics & Moderation</p>
      </div>

      <Row className="g-4 mb-5">
        <Col md={6} lg={3}><StatCard title="Total Users" value={stats.totalUsers} icon={<People size={24} />} color="#588157" /></Col>
        <Col md={6} lg={3}><StatCard title="Saved Recipes" value={stats.totalSavedRecipes} icon={<BookmarkHeart size={24} />} color="#bc4749" /></Col>
        <Col md={6} lg={3}><StatCard title="Meal Plans" value={stats.totalMealPlans} icon={<JournalText size={24} />} color="#f4a261" /></Col>
        <Col md={6} lg={3}><StatCard title="Custom Recipes" value={stats.totalCustomRecipes} icon={<CupHot size={24} />} color="#2a9d8f" /></Col>
      </Row>

      <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-lg p-4 h-100" style={{ borderRadius: '1.5rem' }}>
                <Card.Body>
                    <h4 className="fw-bold mb-4" style={{ color: 'var(--matcha-dark)' }}>User Diet Preferences</h4>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} cursor={{ fill: 'rgba(88, 129, 87, 0.1)' }} />
                                <Bar dataKey="count" fill="var(--matcha-medium)" radius={[8, 8, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
              <Card className="border-0 shadow-lg h-100" style={{ borderRadius: '1.5rem' }}>
                  <Card.Header className="bg-white border-0 pt-4 px-4 d-flex align-items-center">
                      <ShieldCheck className="me-2 text-primary" size={20}/>
                      <h5 className="fw-bold mb-0">Review Moderation</h5>
                  </Card.Header>
                  <Card.Body className="px-0">
                      <ListGroup variant="flush">
                          {reviews.map(review => (
                              <ListGroup.Item key={review.id} className="px-4 py-3 border-light">
                                  <div className="d-flex justify-content-between mb-1">
                                      <span className="fw-bold small">{review.user.username}</span>
                                      <Badge bg={review.rating >= 4 ? 'success' : 'warning'}>{review.rating} ★</Badge>
                                  </div>
                                  <p className="small text-muted mb-2">{review.comment}</p>
                                  <div className="text-end">
                                      <Button variant="outline-danger" size="sm" className="py-0" onClick={() => handleDeleteReview(review.id)}>
                                          <Trash size={12} className="me-1"/> Remove
                                      </Button>
                                  </div>
                              </ListGroup.Item>
                          ))}
                      </ListGroup>
                  </Card.Body>
              </Card>
          </Col>
      </Row>
    </Container>
  );
};