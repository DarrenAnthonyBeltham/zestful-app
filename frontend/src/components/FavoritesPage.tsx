import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner, Row, Col, Button, Modal, Form, Card, Nav, ListGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';
import { RecipeCard } from './RecipeCard';
import { EdamamRecipe } from '../types/recipe.types';
import { FolderPlus, FolderFill, HeartFill, PenFill, CheckCircleFill } from 'react-bootstrap-icons';

interface FavoriteRecipe { id: number; recipeUri: string; label: string; imageUrl: string; calories: number; }
interface CustomRecipe { id: number; title: string; imageUrl: string; }
interface Collection { id: number; name: string; recipes: FavoriteRecipe[]; }

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };

export const FavoritesPage: React.FC = () => {
  const [allRecipes, setAllRecipes] = useState<EdamamRecipe[]>([]);
  const [customRecipes, setCustomRecipes] = useState<EdamamRecipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<EdamamRecipe[]>([]);
  const [rawSavedRecipes, setRawSavedRecipes] = useState<FavoriteRecipe[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddToModal, setShowAddToModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<EdamamRecipe | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const [favRes, customRes, colRes] = await Promise.all([
        fetch('/api/favorites/my-recipes', { headers: authService.getAuthHeader() }),
        fetch('/api/custom/my-recipes', { headers: authService.getAuthHeader() }),
        fetch('/api/collections', { headers: authService.getAuthHeader() })
      ]);

      if (favRes.status === 401) { authService.logout(); return; }
      
      const edamamFavorites: FavoriteRecipe[] = await favRes.json();
      const rawCustomRecipes: CustomRecipe[] = await customRes.json();
      if (colRes.ok) setCollections(await colRes.json());

      setRawSavedRecipes(edamamFavorites); 

      const transformedSaved = edamamFavorites.map(transformFavoriteToEdamam);
      const transformedCustom = rawCustomRecipes.map(transformCustomToEdamam);

      setSavedRecipes(transformedSaved);
      setCustomRecipes(transformedCustom);
      setAllRecipes([...transformedSaved, ...transformedCustom]);

    } catch (err) { if (err instanceof Error) setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleCreateCollection = async () => {
      if(!newCollectionName.trim()) return;
      try {
          const res = await fetch('/api/collections', {
              method: 'POST',
              headers: {'Content-Type': 'application/json', ...authService.getAuthHeader()},
              body: JSON.stringify({ name: newCollectionName })
          });
          if(res.ok) {
              fetchData(); 
              setShowCreateModal(false);
              setNewCollectionName('');
          }
      } catch(e) {}
  };

  const openAddToCollectionModal = (recipe: EdamamRecipe) => {
      setSelectedRecipe(recipe);
      setShowAddToModal(true);
  };

  const addToCollection = async (collectionId: number) => {
      if (!selectedRecipe) return;
      
      const savedRef = rawSavedRecipes.find(r => r.recipeUri === selectedRecipe.uri);
      if (!savedRef) {
          alert("Please save this recipe to your favorites first!");
          return;
      }

      try {
          const res = await fetch(`/api/collections/${collectionId}/add/${savedRef.id}`, {
              method: 'POST',
              headers: authService.getAuthHeader()
          });
          if (res.ok) {
              setShowAddToModal(false);
              fetchData(); 
          }
      } catch (e) { console.error(e); }
  };

  const transformFavoriteToEdamam = (fav: FavoriteRecipe): EdamamRecipe => ({
    uri: fav.recipeUri, label: fav.label, image: fav.imageUrl, calories: fav.calories,
    url: `https://www.edamam.com/recipe/${fav.recipeUri.split('_').pop()}`,
    ingredientLines: [], totalNutrients: {}, dietLabels: [], healthLabels: [], cautions: []
  });

  const transformCustomToEdamam = (custom: CustomRecipe): EdamamRecipe => ({
    uri: `custom_${custom.id}`, label: custom.title, 
    image: custom.imageUrl || 'https://via.placeholder.com/300x300.png?text=My+Recipe',
    calories: 0, url: '', ingredientLines: [], totalNutrients: {}, dietLabels: ['Custom Recipe'], healthLabels: [], cautions: []
  });

  const getDisplayRecipes = () => {
      if (activeTab === 'saved') return savedRecipes;
      if (activeTab === 'custom') return customRecipes;
      return allRecipes;
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.5 }}>
      <div style={{ backgroundColor: '#f1f5f9', padding: '4rem 0', borderBottom: '1px solid #e2e8f0' }}>
        <Container>
           <Row className="align-items-center">
               <Col md={8}>
                   <h1 className="display-4 fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--matcha-dark)' }}>My Cookbook</h1>
                   <p className="text-muted lead mb-0">Your personal collection of culinary inspirations.</p>
               </Col>
               <Col md={4} className="text-md-end mt-4 mt-md-0">
                   <Button variant="primary" onClick={() => setShowCreateModal(true)} className="shadow-sm rounded-pill px-4 py-2">
                        <FolderPlus className="me-2"/> New Collection
                   </Button>
               </Col>
           </Row>
           
           <div className="d-flex gap-4 mt-4">
               <div className="d-flex align-items-center">
                   <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-danger"><HeartFill size={20}/></div>
                   <div><div className="fw-bold fs-5 lh-1">{savedRecipes.length}</div><small className="text-muted text-uppercase" style={{fontSize:'0.7rem', fontWeight: 700}}>Saved</small></div>
               </div>
               <div className="d-flex align-items-center">
                   <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-primary"><PenFill size={20}/></div>
                   <div><div className="fw-bold fs-5 lh-1">{customRecipes.length}</div><small className="text-muted text-uppercase" style={{fontSize:'0.7rem', fontWeight: 700}}>Created</small></div>
               </div>
               <div className="d-flex align-items-center">
                   <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-warning"><FolderFill size={20}/></div>
                   <div><div className="fw-bold fs-5 lh-1">{collections.length}</div><small className="text-muted text-uppercase" style={{fontSize:'0.7rem', fontWeight: 700}}>Collections</small></div>
               </div>
           </div>
        </Container>
      </div>

      <Container className="my-5">
        {collections.length > 0 && (
            <div className="mb-5">
                <h5 className="fw-bold text-muted text-uppercase mb-3 small">Your Collections</h5>
                <Row className="g-3">
                    {collections.map(col => (
                        <Col key={col.id} xs={6} md={4} lg={3}>
                            <motion.div whileHover={{ y: -5 }}>
                                <Card className="border-0 shadow-sm text-center py-4 h-100 cursor-pointer bg-white" style={{ borderRadius: '1rem' }}>
                                    <FolderFill className="mx-auto mb-3 text-warning" size={40} />
                                    <h6 className="mb-1 fw-bold text-dark">{col.name}</h6>
                                    <small className="text-muted">{col.recipes ? col.recipes.length : 0} items</small>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </div>
        )}

        <Nav variant="pills" className="mb-4 p-1 bg-light d-inline-flex rounded-pill" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'all')}>
            <Nav.Item><Nav.Link eventKey="all" className="rounded-pill px-4">All Recipes</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="saved" className="rounded-pill px-4">Saved</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="custom" className="rounded-pill px-4">Created</Nav.Link></Nav.Item>
        </Nav>

        {loading ? <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} /></div> : (
            <>
                {error && <Alert variant="danger">{error}</Alert>}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {getDisplayRecipes().length === 0 ? (
                            <div className="text-center py-5 text-muted bg-light rounded-3">
                                <div className="display-1 mb-3">🍽️</div>
                                <p>No recipes found in this category.</p>
                            </div>
                        ) : (
                            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                                {getDisplayRecipes().map(recipe => (
                                    <Col key={recipe.uri}>
                                        <RecipeCard 
                                            recipe={recipe} 
                                            onAddToCollection={activeTab !== 'custom' ? openAddToCollectionModal : undefined} 
                                        />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </motion.div>
                </AnimatePresence>
            </>
        )}

        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
            <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">New Collection</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form.Label className="text-muted small fw-bold text-uppercase">Collection Name</Form.Label>
                <Form.Control placeholder="e.g., Holiday Dinner" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} className="py-2" />
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="light" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCreateCollection}>Create Folder</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={showAddToModal} onHide={() => setShowAddToModal(false)} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">Add to Cookbook</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted mb-3">Select a collection for <strong>{selectedRecipe?.label}</strong>:</p>
                <ListGroup variant="flush">
                    {collections.map(col => (
                        <ListGroup.Item 
                            key={col.id} 
                            action 
                            onClick={() => addToCollection(col.id)}
                            className="d-flex justify-content-between align-items-center py-3"
                        >
                            <span className="fw-bold"><FolderFill className="text-warning me-2"/> {col.name}</span>
                            <CheckCircleFill className="text-light" />
                        </ListGroup.Item>
                    ))}
                    {collections.length === 0 && <p className="text-center text-muted">No collections yet. Create one first!</p>}
                </ListGroup>
            </Modal.Body>
        </Modal>

      </Container>
    </motion.div>
  );
};