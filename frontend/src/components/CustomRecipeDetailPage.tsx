import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Button, ButtonGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { CustomRecipe } from '../types/custom-recipe.types';
import { ArrowLeft, Printer, Share, Facebook, Twitter, Envelope, People, Dash, Plus } from 'react-bootstrap-icons';
import { RatingSection } from './RatingSection';

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };

export const CustomRecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<CustomRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(4);
  const [baseServings] = useState(4);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) { setError("Recipe ID not found."); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const response = await fetch(`/api/custom/${id}`, { headers: authService.getAuthHeader() });
        if (response.status === 401 || response.status === 403) { authService.logout(); return; }
        if (!response.ok) throw new Error('Failed to fetch recipe details.');
        const data: CustomRecipe = await response.json();
        setRecipe(data);
      } catch (err) { if (err instanceof Error) setError(err.message); } 
      finally { setLoading(false); }
    };
    fetchRecipe();
  }, [id]);

  const handlePrint = () => window.print();

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this custom recipe: ${recipe?.title}`;
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    else if (platform === 'email') window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
    else if (platform === 'copy') { navigator.clipboard.writeText(url); alert('Link copied!'); }
  };

  const updateServings = (delta: number) => setServings(prev => Math.max(1, prev + delta));

  const scaleIngredient = (line: string) => {
      if (servings === baseServings) return line;
      const ratio = servings / baseServings;
      return line.replace(/(\d+(\.\d+)?|\d+\/\d+)/g, (match) => {
          try {
              let val = 0;
              if (match.includes('/')) {
                  const [num, den] = match.split('/');
                  val = parseFloat(num) / parseFloat(den);
              } else { val = parseFloat(match); }
              const scaled = val * ratio;
              return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(2).replace(/\.00$/, '');
          } catch (e) { return match; }
      });
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} /></div>;
  if (error) return <Container><Alert variant="danger" className="my-5">{error}</Alert></Container>;
  if (!recipe) return <Container><Alert variant="info" className="my-5">Recipe not found.</Alert></Container>;

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}>
      <Container className="my-4 my-md-5">
        <Row className="justify-content-center">
          <Col lg={10} xl={9}>
            <div className="d-flex justify-content-between align-items-center mb-3 no-print">
                <Link to="/favorites" className="d-inline-flex align-items-center">
                    <ArrowLeft size={20} className="me-2" /> Back to My Recipes
                </Link>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" size="sm" onClick={() => handleShare('facebook')}><Facebook /></Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleShare('twitter')}><Twitter /></Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleShare('email')}><Envelope /></Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleShare('copy')}><Share /></Button>
                    <Button variant="outline-dark" size="sm" onClick={handlePrint}><Printer className="me-2"/> Print</Button>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-end mb-4">
                <h1 className="mb-0 display-5 fw-bold" style={{ color: 'var(--matcha-dark)' }}>{recipe.title}</h1>
                <div className="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
                    <People className="me-2 text-info" /> 
                    <span className="me-2 small fw-bold text-uppercase">Servings</span>
                    <ButtonGroup size="sm">
                        <Button variant="light" className="py-0 px-2 border-0" onClick={() => updateServings(-1)} disabled={servings <= 1}><Dash/></Button>
                        <span className="px-2 fw-bold">{servings}</span>
                        <Button variant="light" className="py-0 px-2 border-0" onClick={() => updateServings(1)}><Plus/></Button>
                    </ButtonGroup>
                </div>
            </div>
            
            <Row>
              <Col md={7}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="mb-4 border-0 shadow-lg" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                    <Card.Img 
                      variant="top" 
                      src={recipe.imageUrl || 'https://via.placeholder.com/600x400.png?text=My+Recipe'}
                    />
                  </Card>
                  
                  <h3 className="mb-3 fw-bold" style={{ color: 'var(--matcha-dark)' }}>Ingredients</h3>
                  <ListGroup variant="flush" className="mb-4">
                    {(recipe.ingredients || []).map((item) => (
                      <ListGroup.Item key={item.id} style={{ background: 'transparent', borderBottom: '1px solid #e2e8f0', padding: '1rem 0', fontSize: '1.05rem' }}>
                        <span className="me-3 text-success">•</span> {scaleIngredient(item.ingredientText)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </motion.div>
              </Col>
              <Col md={5}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="border-0 shadow-sm bg-light" style={{ borderRadius: '1rem' }}>
                    <Card.Body className="p-4">
                      <Card.Title as="h4" className="mb-4 fw-bold" style={{ color: 'var(--matcha-dark)' }}>Instructions</Card.Title>
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#4a5568' }}>
                        {recipe.instructions}
                      </p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {id && <div className="mt-5 pt-5 border-top no-print"><RatingSection recipeId={`custom_${id}`} /></div>}

          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};