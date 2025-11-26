import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { StyledDropdown } from './StyledDropdown';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { GamificationSection } from './GamificationSection';
import { PersonBadge, HeartPulse } from 'react-bootstrap-icons';

interface UserProfile {
  username: string;
  email: string;
  preferredDiet?: string;
  preferredHealth?: string;
}

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };
const dietOptions = [{ label: "None", value: "" }, { label: "Vegetarian", value: "vegetarian" }, { label: "Vegan", value: "vegan" }, { label: "Pescatarian", value: "pescatarian" }, { label: "Low-Carb", value: "low-carb" }, { label: "Low-Fat", value: "low-fat" }, { label: "High-Protein", value: "high-protein" }];
const healthOptions = [{ label: "None", value: "" }, { label: "Gluten-Free", value: "gluten-free" }, { label: "Dairy-Free", value: "dairy-free" }, { label: "Nut-Free", value: "tree-nut-free" }, { label: "Peanut-Free", value: "peanut-free" }, { label: "Keto-Friendly", value: "keto-friendly" }];

export const MyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preferredDiet, setPreferredDiet] = useState('');
  const [preferredHealth, setPreferredHealth] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true); setError(null);
        const response = await fetch('/api/user/me', { method: 'GET', headers: authService.getAuthHeader() });
        if (response.status === 401 || response.status === 403) { authService.logout(); return; }
        if (!response.ok) throw new Error('Failed to fetch profile.');
        const data: UserProfile = await response.json();
        setProfile(data);
        setPreferredDiet(data.preferredDiet || '');
        setPreferredHealth(data.preferredHealth || '');
      } catch (err) { if (err instanceof Error) setError(err.message); } 
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handlePreferencesSave = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setSuccess(null);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeader() },
        body: JSON.stringify({ preferredDiet, preferredHealth })
      });
      if (!response.ok) throw new Error('Failed to save preferences.');
      setSuccess('Preferences saved successfully!');
      if (profile) setProfile({ ...profile, preferredDiet, preferredHealth });
    } catch (err) { if (err instanceof Error) setError(err.message); }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-5"><Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} /><p className="mt-2">Loading Profile...</p></div>;
    if (error && !profile) return <Alert variant="danger">{error}</Alert>;

    if (profile) {
      return (
        <motion.div initial="hidden" animate="visible">
          <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3" style={{ width: '80px', height: '80px', color: 'var(--matcha-dark)' }}>
                  <span className="display-6 fw-bold">{profile.username.charAt(0).toUpperCase()}</span>
              </div>
              <h2 style={{ color: 'var(--matcha-dark)' }}>Welcome, {profile.username}!</h2>
              <p className="text-muted mb-3">{profile.email}</p>
              
              {/* Feature 10: Dietary Badges */}
              <div className="d-flex justify-content-center gap-2">
                  {profile.preferredDiet && (
                      <Badge bg="success" className="px-3 py-2 rounded-pill fw-normal d-flex align-items-center">
                          <PersonBadge className="me-2"/> {dietOptions.find(o => o.value === profile.preferredDiet)?.label}
                      </Badge>
                  )}
                  {profile.preferredHealth && (
                      <Badge bg="info" text="dark" className="px-3 py-2 rounded-pill fw-normal d-flex align-items-center bg-opacity-25 border border-info">
                          <HeartPulse className="me-2"/> {healthOptions.find(o => o.value === profile.preferredHealth)?.label}
                      </Badge>
                  )}
                  {!profile.preferredDiet && !profile.preferredHealth && <span className="text-muted small fst-italic">No dietary badges yet. Set preferences below!</span>}
              </div>
          </div>
          
          <hr className="my-5" style={{ color: 'var(--matcha-pale)' }} />
          <GamificationSection />
          <hr className="my-5" style={{ color: 'var(--matcha-pale)' }} />
          <AnalyticsDashboard />

          <hr className="my-5" style={{ color: 'var(--matcha-pale)' }} />
          <h3>My Default Preferences</h3>
          <p className="text-muted">Set your preferences here, and we'll apply them to your search automatically.</p>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handlePreferencesSave}>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Default Diet</Form.Label><StyledDropdown label="None" options={dietOptions} value={preferredDiet} onChange={setPreferredDiet} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Default Health/Allergy</Form.Label><StyledDropdown label="None" options={healthOptions} value={preferredHealth} onChange={setPreferredHealth} /></Form.Group></Col>
            </Row>
            <motion.div className="d-grid gap-2 mt-3" variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button variant="primary" type="submit">Save Preferences</Button>
            </motion.div>
          </Form>

          <div className="d-grid gap-2 mt-4">
            <motion.button className="btn btn-outline-secondary" variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={() => authService.logout()}>Logout</motion.button>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}>
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '1.5rem' }}>
              <Card.Body className="p-5">
                {renderContent()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};