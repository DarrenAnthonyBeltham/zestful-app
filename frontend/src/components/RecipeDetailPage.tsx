import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Button, ButtonGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { EdamamRecipe } from '../types/recipe.types';
import { ArrowLeft, Clock, Fire, People, Printer, Facebook, Twitter, Envelope, Share, Dash, Plus } from 'react-bootstrap-icons';
import { RatingSection } from './RatingSection';

const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<EdamamRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(4);
  const [baseServings, setBaseServings] = useState(4); 

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch recipe.');
        const data = await response.json();
        setRecipe(data.recipe);
        const estimatedServings = data.recipe.yield || 4;
        setBaseServings(estimatedServings);
        setServings(estimatedServings);
      } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      finally { setLoading(false); }
    };
    fetchRecipe();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this recipe for ${recipe?.label} on Zestful!`;
    
    if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'email') {
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
    } else if (platform === 'copy') {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
  };

  const updateServings = (delta: number) => {
      setServings(prev => Math.max(1, prev + delta));
  };

  const scaleIngredient = (line: string) => {
      if (servings === baseServings) return line;
      const ratio = servings / baseServings;
      
      return line.replace(/(\d+(\.\d+)?|\d+\/\d+)/g, (match) => {
          try {
              let val = 0;
              if (match.includes('/')) {
                  const [num, den] = match.split('/');
                  val = parseFloat(num) / parseFloat(den);
              } else {
                  val = parseFloat(match);
              }
              const scaled = val * ratio;
              
              return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(2).replace(/\.00$/, '');
          } catch (e) { return match; }
      });
  };

  if (loading) return <div className="text-center vh-100 d-flex align-items-center justify-content-center"><Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} /></div>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!recipe) return <Container className="mt-5"><Alert variant="info">Not found.</Alert></Container>;

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.5 }}>
      <div className="no-print" style={{ backgroundColor: '#f8f9fa', padding: '4rem 0 6rem', marginBottom: '-3rem' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Link to="/" className="text-decoration-none d-inline-flex align-items-center text-muted fw-bold" style={{ fontSize: '0.9rem' }}>
                <ArrowLeft className="me-2" /> BACK TO SEARCH
            </Link>
            <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => handleShare('facebook')} title="Share on Facebook"><Facebook /></Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleShare('twitter')} title="Share on Twitter"><Twitter /></Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleShare('email')} title="Share via Email"><Envelope /></Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleShare('copy')} title="Copy Link"><Share /></Button>
                <Button variant="outline-dark" size="sm" onClick={handlePrint} className="d-flex align-items-center ms-2">
                    <Printer className="me-2"/> Print
                </Button>
            </div>
          </div>
          <Row className="align-items-center">
            <Col lg={7}>
              <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--matcha-dark)' }}>{recipe.label}</h1>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {recipe.dietLabels?.map(l => <Badge key={l} bg="white" className="text-dark border shadow-sm px-3 py-2 fw-normal">{l}</Badge>)}
                {recipe.healthLabels?.slice(0,3).map(l => <Badge key={l} bg="white" className="text-dark border shadow-sm px-3 py-2 fw-normal">{l}</Badge>)}
              </div>
              <div className="d-flex gap-4 text-muted mb-4 mb-lg-0 align-items-center">
                <div className="d-flex align-items-center"><Fire className="me-2 text-warning" /> {Math.round(recipe.calories * (servings/baseServings))} kcal</div>
                <div className="d-flex align-items-center bg-white px-3 py-1 rounded-pill border shadow-sm">
                    <People className="me-2 text-info" /> 
                    <span className="me-2">Servings:</span>
                    <ButtonGroup size="sm">
                        <Button variant="light" className="py-0 px-2 border-0" onClick={() => updateServings(-1)} disabled={servings <= 1}><Dash/></Button>
                        <span className="px-2 fw-bold">{servings}</span>
                        <Button variant="light" className="py-0 px-2 border-0" onClick={() => updateServings(1)}><Plus/></Button>
                    </ButtonGroup>
                </div> 
                <div className="d-flex align-items-center"><Clock className="me-2 text-success" /> 45 mins</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="pb-5">
        <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: '1.5rem' }}>
          <Row className="g-0">
            <Col md={5} style={{ minHeight: '400px' }}>
              <img src={recipe.image} alt={recipe.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Col>
            <Col md={7}>
              <Card.Body className="p-4 p-lg-5">
                <div className="mb-5">
                  <h3 className="fw-bold mb-4" style={{ color: 'var(--matcha-dark)' }}>Ingredients</h3>
                  <ul className="list-unstyled">
                    {recipe.ingredientLines?.map((line, i) => (
                      <li key={i} className="mb-3 d-flex align-items-start">
                        <span className="me-3" style={{ color: 'var(--matcha-light)', fontSize: '1.2rem' }}>•</span>
                        <span style={{ fontSize: '1.05rem', color: '#4a5568' }}>{scaleIngredient(line)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-3 bg-light mb-4 no-print">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-bold mb-1">Instructions</h5>
                      <p className="text-muted small mb-0">View the full step-by-step guide on the source website.</p>
                    </div>
                    <Button href={recipe.url} target="_blank" variant="primary" className="px-4">Read Full Recipe</Button>
                  </div>
                </div>

                <div>
                  <h5 className="fw-bold mb-3">Nutrition Per Serving</h5>
                  <div className="d-flex gap-4 flex-wrap">
                    {['PROCNT', 'FAT', 'CHOCDF', 'NA'].map(k => {
                      const n = recipe.totalNutrients[k];
                      return n ? (
                        <div key={k}>
                          <div className="small text-muted text-uppercase fw-bold">{n.label}</div>
                          <div className="fs-5">{Math.round(n.quantity)}{n.unit}</div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </Card.Body>
            </Col>
          </Row>
        </Card>

        <div className="no-print">
            {id && <div className="mt-5 pt-5 border-top"><RatingSection recipeId={id} /></div>}
        </div>
      </Container>
    </motion.div>
  );
};