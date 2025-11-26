import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, CloudUpload, Eye, PencilSquare } from 'react-bootstrap-icons';

const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };

export const CreateRecipePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => setIngredients([...ingredients, '']);
  const removeIngredientField = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    setUploading(true); setError(null);
    try {
      const response = await fetch('/api/upload', { method: 'POST', headers: { ...authService.getAuthHeader() }, body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setImageUrl(data.url);
    } catch (err) { setError("Failed to upload image."); } finally { setUploading(false); }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); setSuccess(null); setSubmitting(true);
    
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    if (!title || !instructions || filteredIngredients.length === 0) {
      setError('Please fill in all required fields.');
      setSubmitting(false); return;
    }

    try {
      const response = await fetch('/api/custom/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeader() },
        body: JSON.stringify({ title, instructions, imageUrl, ingredients: filteredIngredients })
      });
      if (!response.ok) throw new Error('Failed to create recipe.');
      userService.recordAction('CREATE_RECIPE');
      setSuccess('Recipe created! Redirecting...');
      setTimeout(() => navigate('/favorites'), 1500);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); } 
    finally { setSubmitting(false); }
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.5 }}>
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '3rem 0' }}>
        <Container fluid="lg">
            <Row>
                {/* Editor Column */}
                <Col lg={7} className="mb-4">
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1.5rem' }}>
                        <Card.Body className="p-4 p-md-5">
                            <div className="d-flex align-items-center mb-4 text-muted">
                                <PencilSquare className="me-2"/>
                                <span className="fw-bold text-uppercase small">Recipe Editor</span>
                            </div>
                            <h2 className="fw-bold mb-4" style={{ color: 'var(--matcha-dark)' }}>Create New Recipe</h2>
                            
                            {error && <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger">{error}</Alert>}
                            {success && <Alert variant="success" className="border-0 bg-success bg-opacity-10 text-success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Title</Form.Label>
                                    <Form.Control size="lg" type="text" placeholder="e.g., Grandma's Lasagna" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-light border-0" />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Cover Image</Form.Label>
                                    <div className="border-2 border-dashed rounded-4 p-4 text-center" style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}>
                                        {uploading ? <Spinner animation="border" variant="secondary" /> : (
                                            <>
                                                <CloudUpload size={30} className="text-muted mb-2"/>
                                                <Form.Control type="file" accept="image/*" onChange={handleImageUpload} className="d-none" id="custom-file-upload" />
                                                <label htmlFor="custom-file-upload" className="btn btn-outline-secondary btn-sm d-block mx-auto" style={{ maxWidth: '200px' }}>Choose File</label>
                                            </>
                                        )}
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold text-muted small text-uppercase d-flex justify-content-between">
                                        Ingredients
                                        <span className="text-primary cursor-pointer" onClick={addIngredientField} style={{ cursor: 'pointer' }}><Plus/> Add Item</span>
                                    </Form.Label>
                                    {ingredients.map((ing, idx) => (
                                        <InputGroup className="mb-2" key={idx}>
                                            <Form.Control value={ing} onChange={(e) => handleIngredientChange(idx, e.target.value)} placeholder="e.g., 2 cups flour" className="bg-light border-0" />
                                            <Button variant="link" className="text-muted text-hover-danger" onClick={() => removeIngredientField(idx)}><Trash/></Button>
                                        </InputGroup>
                                    ))}
                                </Form.Group>

                                <Form.Group className="mb-5">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Instructions</Form.Label>
                                    <Form.Control as="textarea" rows={6} value={instructions} onChange={(e) => setInstructions(e.target.value)} className="bg-light border-0" placeholder="Step 1..." />
                                </Form.Group>

                                <Button variant="primary" type="submit" disabled={submitting || uploading} size="lg" className="w-100 py-3 shadow-lg">
                                    {submitting ? 'Publishing...' : 'Publish Recipe'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Live Preview Column */}
                <Col lg={5} className="d-none d-lg-block">
                    <div className="sticky-top" style={{ top: '100px' }}>
                        <div className="d-flex align-items-center mb-4 text-muted">
                            <Eye className="me-2"/>
                            <span className="fw-bold text-uppercase small">Live Preview</span>
                        </div>
                        
                        {/* Preview Card */}
                        <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: '1.5rem' }}>
                            <div style={{ height: '300px', backgroundColor: '#e2e8f0', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                {!imageUrl && <div className="h-100 d-flex align-items-center justify-content-center text-muted">No Image</div>}
                            </div>
                            <Card.Body className="p-4">
                                <h3 className="fw-bold mb-3 text-truncate">{title || "Untitled Recipe"}</h3>
                                <div className="d-flex gap-2 mb-4">
                                    <span className="badge bg-light text-dark border">Custom Recipe</span>
                                    <span className="badge bg-light text-dark border">{ingredients.filter(i => i).length} Ingredients</span>
                                </div>
                                <h6 className="fw-bold text-muted text-uppercase small mb-3">Ingredients</h6>
                                <ul className="list-unstyled mb-4">
                                    {ingredients.filter(i => i).map((ing, i) => (
                                        <li key={i} className="mb-2 text-muted small border-bottom pb-2">{ing}</li>
                                    ))}
                                    {ingredients.every(i => !i) && <li className="text-muted small fst-italic">Ingredients will appear here...</li>}
                                </ul>
                                <h6 className="fw-bold text-muted text-uppercase small mb-2">Instructions</h6>
                                <p className="text-muted small text-truncate-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {instructions || "Instructions will appear here..."}
                                </p>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Container>
      </div>
    </motion.div>
  );
};