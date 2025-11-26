import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, NavDropdown, Button } from 'react-bootstrap';
import { AnimatePresence } from 'framer-motion';
import { AuthPage } from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/auth.service';
import { MyProfilePage } from './components/MyProfilePage';
import { HomePage } from './components/HomePage';
import { FavoritesPage } from './components/FavoritesPage';
import { RecipeDetailPage } from './components/RecipeDetailPage';
import { CreateRecipePage } from './components/CreateRecipePage';
import { CustomRecipeDetailPage } from './components/CustomRecipeDetailPage';
import { MealPlannerPage } from './components/MealPlannerPage';
import { PantryPage } from './components/PantryPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PersonCircle, Basket3, Speedometer2, Dice5 } from 'react-bootstrap-icons';
import { AiChatbot } from './components/AiChatBot';

const NavigationContent = () => {
  const isLoggedIn = authService.isLoggedIn();
  const isAdmin = authService.getRole() === 'ADMIN';
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
  };

  const handleRandom = async () => {
      try {
          const res = await fetch('/api/recipes/random');
          if(res.ok) {
              const data = await res.json();
              if (data && data.recipe && data.recipe.uri) {
                  const id = data.recipe.uri.split('_').pop();
                  navigate(`/recipe/${id}`);
              }
          }
      } catch(e) { console.error(e); }
  };

  const UserDropdownTitle = (
    <span className="d-inline-flex align-items-center">
      <PersonCircle size={24} className="me-2" style={{ color: 'var(--matcha-dark)' }}/> 
      <span className="fw-medium" style={{ color: 'var(--matcha-dark)' }}>Account</span>
    </span>
  );

  return (
    <Navbar expand="lg" className="py-3 border-bottom sticky-top" style={{ backgroundColor: 'var(--matcha-bg)', zIndex: 1000 }}>
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3" style={{ color: 'var(--matcha-dark)' }}>
            Zestful
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/" className="mx-2">Home</Nav.Link>
              
              <Button variant="link" onClick={handleRandom} className="text-decoration-none mx-2" style={{ color: 'var(--matcha-medium)' }}>
                  <Dice5 size={20} className="me-1"/> Surprise Me
              </Button>
              
              {isLoggedIn ? (
                <>
                  <Nav.Link as={Link} to="/pantry" className="mx-2 d-inline-flex align-items-center">
                    <Basket3 className="me-1" size={18} /> Pantry
                  </Nav.Link>

                  <NavDropdown 
                    title={UserDropdownTitle}
                    id="user-nav-dropdown" 
                    align="end"
                    className="mx-2"
                  >
                    <NavDropdown.Item as={Link} to="/meal-planner">Weekly Meal Planner</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/favorites">My Recipes</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/create-recipe">Create New Recipe</NavDropdown.Item>
                    <NavDropdown.Divider />
                    {isAdmin && (
                      <>
                        <NavDropdown.Item as={Link} to="/admin">
                          <Speedometer2 className="me-2"/> Admin Dashboard
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                      </>
                    )}
                    <NavDropdown.Item as={Link} to="/profile">My Profile & Preferences</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout} className="text-danger">Logout</NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <Nav.Link as={Link} to="/login" className="btn btn-primary text-white px-4 ms-2 shadow-sm">
                  Login / Sign Up
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

function App() {
  const isLoggedIn = authService.isLoggedIn();
  
  const AppRoutes: React.FC = () => {
    const location = useLocation();
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/login" element={<AuthPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/create-recipe" element={<CreateRecipePage />} />
            <Route path="/custom-recipe/:id" element={<CustomRecipeDetailPage />} />
            <Route path="/meal-planner" element={<MealPlannerPage />} />
            <Route path="/pantry" element={<PantryPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </AnimatePresence>
    );
  };

  return (
    <BrowserRouter>
      <NavigationContent />
      <AppRoutes />
      {isLoggedIn && <AiChatbot />}
    </BrowserRouter>
  );
}

export default App;