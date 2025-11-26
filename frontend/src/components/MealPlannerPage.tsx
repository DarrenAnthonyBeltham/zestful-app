import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Modal, ListGroup, ProgressBar, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { authService } from '../services/auth.service';
import { CustomRecipe } from '../types/custom-recipe.types';
import { PlannerRecipe, MealPlanItem, ShoppingList } from '../types/mealplan.types';
import { Trash, ExclamationTriangleFill, CartCheck, Robot, PlusCircleDotted } from 'react-bootstrap-icons';

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealTypes = ["Breakfast", "Lunch", "Dinner"];

interface MealSlot { id: string; day: string; meal: string; recipe?: PlannerRecipe & { mealPlanId: number }; }
type PlannerState = { recipes: PlannerRecipe[]; calendar: { [key: string]: MealSlot }; };

export const MealPlannerPage: React.FC = () => {
  const [planner, setPlanner] = useState<PlannerState>({ recipes: [], calendar: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [showListModal, setShowListModal] = useState(false);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({ protein: 0, carbs: 0, fat: 0 });

  const [userHealthPref, setUserHealthPref] = useState<string>('');
  const [conflictModal, setConflictModal] = useState<{ show: boolean, recipe?: PlannerRecipe, target?: {day: string, meal: string, slotId: string} }>({ show: false });

  const initializeCalendar = (): { [key: string]: MealSlot } => {
    const calendar: { [key: string]: MealSlot } = {};
    daysOfWeek.forEach(day => {
      mealTypes.forEach(meal => {
        const id = `${day}-${meal}`;
        calendar[id] = { id, day, meal, recipe: undefined };
      });
    });
    return calendar;
  };

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [favRes, customRes, planRes, userRes] = await Promise.all([
        fetch('/api/favorites/my-recipes', { headers: authService.getAuthHeader() }),
        fetch('/api/custom/my-recipes', { headers: authService.getAuthHeader() }),
        fetch('/api/mealplan', { headers: authService.getAuthHeader() }),
        fetch('/api/user/me', { headers: authService.getAuthHeader() })
      ]);

      if (favRes.status === 401 || customRes.status === 401 || planRes.status === 401) {
        authService.logout();
        return;
      }

      const edamamFavorites: any[] = await favRes.json();
      const customRecipes: CustomRecipe[] = await customRes.json();
      const mealPlan: MealPlanItem[] = await planRes.json();
      const user = await userRes.json();

      if (user.preferredHealth) {
        setUserHealthPref(user.preferredHealth);
      }

      const favRecipes: PlannerRecipe[] = await Promise.all(edamamFavorites.map(async (fav: any) => {
        let healthLabels: string[] = [];
        try {
            const id = fav.recipeUri.split('_').pop();
            const detailsRes = await fetch(`/api/recipes/${id}`); 
            if(detailsRes.ok) {
                const details = await detailsRes.json();
                healthLabels = details.recipe.healthLabels;
            }
        } catch(e) {}

        return {
            id: fav.recipeUri,
            label: fav.label,
            image: fav.imageUrl,
            isCustom: false,
            recipeUri: fav.recipeUri,
            healthLabels: healthLabels
        };
      }));

      const customPlannerRecipes: PlannerRecipe[] = customRecipes.map(custom => ({
        id: `custom_${custom.id}`,
        label: custom.title,
        image: custom.imageUrl || 'https://via.placeholder.com/300x300.png?text=My+Recipe',
        isCustom: true,
        customRecipeId: custom.id
      }));

      const allRecipes = [...favRecipes, ...customPlannerRecipes];
      const calendar = initializeCalendar();
      
      mealPlan.forEach(item => {
        const slotId = `${item.dayOfWeek}-${item.mealType}`;
        const recipe = item.recipeUri 
          ? allRecipes.find(r => r.recipeUri === item.recipeUri) 
          : allRecipes.find(r => r.customRecipeId === item.customRecipe?.id);
        
        if (calendar[slotId] && recipe) {
          calendar[slotId].recipe = { ...recipe, mealPlanId: item.id };
        }
      });

      setPlanner({ recipes: allRecipes, calendar });
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  useEffect(() => {
    let p = 0, c = 0, f = 0;
    Object.values(planner.calendar).forEach(slot => {
        if (slot.recipe) { p += 25; c += 40; f += 15; } 
    });
    setWeeklyStats({ protein: p, carbs: c, fat: f });
  }, [planner.calendar]);

  const handleAiGenerate = async () => {
    setGenerating(true);
    try {
        const response = await fetch('/api/mealplan/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authService.getAuthHeader() },
            body: JSON.stringify({ diet: "Balanced", health: "None", ingredients: "Any" })
        });
        if(response.ok) {
            fetchPlannerData(); 
        }
    } catch (e) { setError("AI generation failed"); } finally { setGenerating(false); }
  };

  const processDrop = async (draggedRecipe: PlannerRecipe, slotId: string) => {
      const targetSlot = planner.calendar[slotId];
      const newCalendar = { ...planner.calendar };
      newCalendar[slotId].recipe = { ...draggedRecipe, mealPlanId: 0 };
      setPlanner(prev => ({ ...prev, calendar: newCalendar }));

      try {
        const response = await fetch('/api/mealplan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authService.getAuthHeader() },
          body: JSON.stringify({
            dayOfWeek: targetSlot.day,
            mealType: targetSlot.meal,
            recipeUri: draggedRecipe.recipeUri,
            customRecipeId: draggedRecipe.customRecipeId
          })
        });
        const savedMeal: MealPlanItem = await response.json();
        newCalendar[slotId].recipe!.mealPlanId = savedMeal.id;
        setPlanner(prev => ({ ...prev, calendar: newCalendar }));
      } catch (err) {
        console.error("Failed to save meal", err);
        const oldCalendar = { ...planner.calendar };
        oldCalendar[slotId].recipe = undefined;
        setPlanner(prev => ({ ...prev, calendar: oldCalendar }));
      }
  }

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    if (sourceId === 'recipe-bank' && destId.includes('-')) {
      const draggedRecipe = planner.recipes[source.index];
      
      if (userHealthPref && !draggedRecipe.isCustom) {
          const hasLabel = draggedRecipe.healthLabels?.some(label => 
              label.toLowerCase() === userHealthPref.toLowerCase()
          );
          
          if (!hasLabel) {
              setConflictModal({
                  show: true,
                  recipe: draggedRecipe,
                  target: { day: planner.calendar[destId].day, meal: planner.calendar[destId].meal, slotId: destId }
              });
              return; 
          }
      }

      await processDrop(draggedRecipe, destId);
    }
  };

  const confirmConflict = async () => {
      if(conflictModal.recipe && conflictModal.target) {
          await processDrop(conflictModal.recipe, conflictModal.target.slotId);
      }
      setConflictModal({ show: false });
  };

  const clearSlot = async (slotId: string) => {
    const slot = planner.calendar[slotId];
    if (!slot || !slot.recipe) return;

    const mealPlanId = slot.recipe.mealPlanId;
    const oldRecipe = slot.recipe;
    
    const newCalendar = { ...planner.calendar };
    newCalendar[slotId].recipe = undefined;
    setPlanner(prev => ({ ...prev, calendar: newCalendar }));

    try {
      await fetch(`/api/mealplan/${mealPlanId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeader()
      });
    } catch (err) {
      console.error("Failed to delete meal", err);
      const oldCalendar = { ...planner.calendar };
      oldCalendar[slotId].recipe = oldRecipe;
      setPlanner(prev => ({ ...prev, calendar: oldCalendar }));
    }
  };

  const handleGenerateList = async () => {
    setLoadingList(true);
    try {
      const response = await fetch('/api/shopping-list', { headers: authService.getAuthHeader() });
      if (!response.ok) throw new Error("Could not generate list");
      const list: ShoppingList = await response.json();
      setShoppingList(list);
      setShowListModal(true);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  const handleClearWeek = async () => {
    const mealIdsToClear = Object.values(planner.calendar)
      .filter(slot => slot.recipe)
      .map(slot => slot.recipe!.mealPlanId);
    
    setPlanner(prev => ({ ...prev, calendar: initializeCalendar() }));

    try {
      await Promise.all(
        mealIdsToClear.map(id => 
          fetch(`/api/mealplan/${id}`, {
            method: 'DELETE',
            headers: authService.getAuthHeader()
          })
        )
      );
    } catch (err) {
      console.error("Failed to clear week", err);
      setError("Failed to clear week, please refresh.");
    }
  };

  const renderShoppingList = () => {
    if (!shoppingList) return null;
    return (
      <>
        <Alert variant="success" className="d-flex align-items-center border-0 bg-success bg-opacity-10">
            <CartCheck className="me-2" size={20} />
            <div>
                <strong>Estimated Cost: ${shoppingList.estimatedCost.toFixed(2)}</strong>
                <div className="small">Based on average local prices</div>
            </div>
        </Alert>
        <ListGroup variant="flush">
            {Object.entries(shoppingList.ingredients).map(([name, count]) => (
            <ListGroup.Item key={name} className="d-flex justify-content-between">
                <span className="text-capitalize">{name}</span>
                <strong>{count > 1 ? `x ${count}` : ''}</strong>
            </ListGroup.Item>
            ))}
        </ListGroup>
      </>
    );
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}
      >
        <section style={{ padding: '3rem 0 2rem', background: 'linear-gradient(135deg, #fdfbf7 0%, #f4f7f6 100%)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Container fluid className="px-4">
                <Row className="align-items-center">
                    <Col md={6}>
                        <h1 className="display-5 fw-bold mb-0" style={{ fontFamily: 'var(--font-heading)', color: 'var(--matcha-dark)' }}>Weekly Planner</h1>
                        <p className="text-muted mb-0">Drag & drop to build your perfect week.</p>
                    </Col>
                    <Col md={6} className="text-md-end mt-3 mt-md-0">
                        <Button variant="outline-dark" className="me-2 rounded-pill" onClick={handleAiGenerate} disabled={generating}>
                            {generating ? <Spinner size="sm" animation="border"/> : <><Robot className="me-2"/> Auto-Fill Week</>}
                        </Button>
                        <Button variant="outline-danger" className="me-2 rounded-pill" onClick={handleClearWeek}>Clear</Button>
                        <Button variant="primary" onClick={handleGenerateList} className="rounded-pill shadow-sm"><CartCheck className="me-2"/> Shop List</Button>
                    </Col>
                </Row>
            </Container>
        </section>

        <Container fluid className="my-4 px-4">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="g-4">
            {/* Recipe Bank Sidebar - Made Responsive */}
            <Col lg={3} md={4} xs={12}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                <Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
                    <h5 className="fw-bold mb-0 text-uppercase small text-muted">Your Cookbook</h5>
                </Card.Header>
                <Droppable droppableId="recipe-bank">
                  {(provided) => (
                    <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef} 
                        style={{ minHeight: '200px', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }} 
                        className="p-3"
                    >
                      {planner.recipes.map((recipe, index) => (
                        <Draggable key={recipe.id} draggableId={recipe.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging ? provided.draggableProps.style?.transform : "translate(0,0)",
                                zIndex: snapshot.isDragging ? 1000 : "auto"
                              }}
                            >
                              <Card className="border-0 shadow-sm hover-card" style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'grab' }}>
                                <div className="d-flex align-items-center p-2">
                                    <img src={recipe.image} alt={recipe.label} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} className="me-3 flex-shrink-0" />
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d3748', lineHeight: '1.2' }} className="text-truncate-2">{recipe.label}</div>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Col>
            
            {/* Weekly Calendar Grid */}
            <Col lg={9} md={8} xs={12}>
              <div className="calendar-grid">
                {daysOfWeek.map(day => (
                  <div key={day} className="day-column">
                    <div className="day-header text-center py-2 rounded-3 mb-3 fw-bold shadow-sm" style={{ backgroundColor: 'var(--matcha-dark)', color: 'white' }}>
                        {day.substring(0, 3)}
                    </div>
                    {mealTypes.map(meal => {
                      const slotId = `${day}-${meal}`;
                      const slot = planner.calendar[slotId];
                      return (
                        <Droppable key={slotId} droppableId={slotId}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`meal-slot ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="meal-label">{meal}</span>
                                {slot.recipe && (
                                  <Trash size={12} className="text-danger" onClick={() => clearSlot(slotId)} style={{ cursor: 'pointer' }} />
                                )}
                              </div>
                              {slot.recipe ? (
                                <div className="text-center fade-in">
                                  <img src={slot.recipe.image} alt="" className="rounded-3 mb-2 shadow-sm" style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                                  <div className="recipe-label text-truncate-2">{slot.recipe.label}</div>
                                </div>
                              ) : (
                                <div className="empty-slot-icon">
                                    <PlusCircleDotted />
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </motion.div>

      {/* Modals remain the same... */}
      <Modal show={showListModal} onHide={() => setShowListModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title style={{ color: 'var(--matcha-dark)', fontWeight: 'bold' }}>Your Shopping List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {shoppingList && (
            <p className="text-muted mb-4">
              Generated from {shoppingList.totalRecipes} planned meals.
            </p>
          )}
          {renderShoppingList()}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowListModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={conflictModal.show} onHide={() => setConflictModal({show: false})} centered>
          <Modal.Header closeButton className="bg-warning bg-opacity-10 border-0">
              <Modal.Title className="text-warning-emphasis d-flex align-items-center">
                  <ExclamationTriangleFill className="me-2" /> Dietary Alert
              </Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <p>You have set your preference to <strong>{userHealthPref}</strong>.</p>
              <p>However, <strong>{conflictModal.recipe?.label}</strong> does not have the "{userHealthPref}" label.</p>
              <p>Are you sure you want to add it?</p>
          </Modal.Body>
          <Modal.Footer className="border-0">
              <Button variant="secondary" onClick={() => setConflictModal({show: false})}>Cancel</Button>
              <Button variant="warning" onClick={confirmConflict}>Add Anyway</Button>
          </Modal.Footer>
      </Modal>
    </DragDropContext>
  );
};