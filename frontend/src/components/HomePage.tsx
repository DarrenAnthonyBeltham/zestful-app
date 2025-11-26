import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  Row, 
  Col, 
  InputGroup,
  Accordion,
  Card,
  Placeholder
} from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { EdamamHit, EdamamResponse } from '../types/recipe.types';
import { GNewsArticle, GNewsResponse } from '../types/news.types';
import { RecipeCard } from './RecipeCard';
import { NewsCard } from './NewsCard';
import { StyledDropdown } from './StyledDropdown';
import { authService } from '../services/auth.service';
import { Search, ArrowClockwise, FunnelFill } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const searchBarVariants = { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const resultsListVariants = { animate: { transition: { staggerChildren: 0.1 } } };
const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };

const dietOptions = [
  { label: "Any Diet", value: "" },
  { label: "Balanced", value: "balanced" },
  { label: "High-Fiber", value: "high-fiber" },
  { label: "High-Protein", value: "high-protein" },
  { label: "Low-Carb", value: "low-carb" },
  { label: "Low-Fat", value: "low-fat" },
  { label: "Low-Sodium", value: "low-sodium" }
];

const healthOptions = [
  { label: "Any Health", value: "" },
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Pescatarian", value: "pescatarian" },
  { label: "Paleo", value: "paleo" },
  { label: "Keto", value: "keto-friendly" },
  { label: "Gluten-Free", value: "gluten-free" },
  { label: "Dairy-Free", value: "dairy-free" },
  { label: "Nut-Free", value: "tree-nut-free" },
  { label: "Peanut-Free", value: "peanut-free" },
  { label: "Egg-Free", value: "egg-free" },
  { label: "Soy-Free", value: "soy-free" },
  { label: "Fish-Free", value: "fish-free" },
  { label: "Shellfish-Free", value: "shellfish-free" }
];

const mealTypeOptions = [
  { label: "Any Meal", value: "" },
  { label: "Breakfast", value: "Breakfast" },
  { label: "Lunch", value: "Lunch" },
  { label: "Dinner", value: "Dinner" },
  { label: "Snack", value: "Snack" },
  { label: "Teatime", value: "Teatime" }
];

const cuisineTypeOptions = [
  { label: "Any Cuisine", value: "" },
  { label: "American", value: "American" },
  { label: "Asian", value: "Asian" },
  { label: "British", value: "British" },
  { label: "Caribbean", value: "Caribbean" },
  { label: "Chinese", value: "Chinese" },
  { label: "French", value: "French" },
  { label: "Indian", value: "Indian" },
  { label: "Italian", value: "Italian" },
  { label: "Japanese", value: "Japanese" },
  { label: "Mediterranean", value: "Mediterranean" },
  { label: "Mexican", value: "Mexican" },
  { label: "Middle Eastern", value: "Middle Eastern" }
];

const timeOptions = [
  { label: "Any Time", value: "" },
  { label: "Under 15 min", value: "0-15" },
  { label: "Under 30 min", value: "0-30" },
  { label: "Under 60 min", value: "0-60" },
  { label: "1 hour +", value: "60+" },
];

const NewsLoadingSkeleton: React.FC = () => (
  <Row xs={1} md={2} lg={3} className="g-4">
    {Array.from({ length: 3 }).map((_, idx) => (
      <Col key={idx}>
        <Card style={{ borderRadius: 'var(--bs-border-radius-lg)', overflow: 'hidden', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Placeholder as={Card.Img} animation="glow" variant="top" style={{ height: '180px' }} />
          <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
              <Placeholder xs={7} /> <Placeholder xs={4} />
            </Placeholder>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
);

export const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('');
  const [health, setHealth] = useState('');
  const [mealType, setMealType] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [time, setTime] = useState('');
  const [minCalories, setMinCalories] = useState('');
  const [maxCalories, setMaxCalories] = useState('');

  const [results, setResults] = useState<EdamamHit[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [news, setNews] = useState<GNewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [newsPage, setNewsPage] = useState(1);
  const [loadingMoreNews, setLoadingMoreNews] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (authService.isLoggedIn()) {
        try {
          const response = await fetch('/api/user/me', { headers: authService.getAuthHeader() });
          if (response.ok) {
            const user = await response.json();
            if (user.preferredDiet) setDiet(user.preferredDiet);
            if (user.preferredHealth) setHealth(user.preferredHealth);
          }
        } catch (e) { console.error(e); }
      }
    };
    
    const fetchNews = async (page: number) => {
        try {
            setLoadingNews(true);
            const response = await fetch(`/api/news/food?page=${page}`);
            if (!response.ok) throw new Error();
            const data: GNewsResponse = await response.json();
            setNews(data.articles || []);
        } catch (e) { setNewsError(true); } 
        finally { setLoadingNews(false); }
    };

    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('query');
    const mode = queryParams.get('mode');
    
    if (initialQuery && mode === 'pantry') {
        setQuery(initialQuery);
        fetchRecipesWithParam(initialQuery);
    } else {
      fetchUserPreferences();
    }
    fetchNews(1);
  }, [location]);

  const fetchNewsPage = async (page: number, isLoadMore: boolean) => {
      if (isLoadMore) setLoadingMoreNews(true);
      else { setLoadingNews(true); setNews([]); setNewsError(false); }
      
      try {
        const response = await fetch(`/api/news/food?page=${page}`);
        if (!response.ok) throw new Error();
        const data: GNewsResponse = await response.json();
        if (isLoadMore) setNews(prev => [...prev, ...(data.articles || [])]);
        else setNews(data.articles || []);
        setNewsPage(page);
      } catch (e) { 
          console.error(e);
          if (!isLoadMore) setNewsError(true);
      } finally { 
          setLoadingNews(false); 
          setLoadingMoreNews(false); 
      }
  };

  const handleRefreshNews = () => {
      fetchNewsPage(1, false);
  };

  const handleLoadMoreNews = () => {
      fetchNewsPage(newsPage + 1, true);
  };

  const fetchRecipesWithParam = async (searchQuery: string) => {
      setLoading(true); setError(null);
      try {
        const response = await fetch(`/api/recipes/search?query=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Search failed.');
        const data: EdamamResponse = await response.json();
        setResults(data.hits);
        setNextPageUrl(data._links?.next?.href || null);
        if (data.hits.length === 0) setError('No recipes found.');
      } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      finally { setLoading(false); }
  }

  const fetchRecipes = async (isLoadMore = false) => {
    if (!isLoadMore && !query) { setError('Please enter a search query.'); return; }
    isLoadMore ? setLoadingMore(true) : setLoading(true);
    setError(null);

    let url = '';
    if (isLoadMore && nextPageUrl) {
      url = `/api/recipes/search?nextPageUrl=${encodeURIComponent(nextPageUrl)}`;
    } else {
      const params = new URLSearchParams();
      params.append('query', query);
      
      if (diet) params.append('diet', diet);
      if (health) params.append('health', health);
      if (mealType) params.append('mealType', mealType);
      if (cuisineType) params.append('cuisineType', cuisineType);
      if (time) params.append('time', time);
      
      if (minCalories && maxCalories) {
          params.append('calories', `${minCalories}-${maxCalories}`);
      } else if (minCalories) {
          params.append('calories', `${minCalories}+`);
      } else if (maxCalories) {
          params.append('calories', `0-${maxCalories}`);
      }

      url = `/api/recipes/search?${params.toString()}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Search failed. Please try again.');
      const data: EdamamResponse = await response.json();
      setResults(prev => isLoadMore ? [...prev, ...data.hits] : data.hits);
      setNextPageUrl(data._links?.next?.href || null);
      if (!isLoadMore && data.hits.length === 0) setError('No recipes found for that query with the selected filters.');
    } catch (err) { 
        setError(err instanceof Error ? err.message : 'An unknown error occurred.'); 
    } finally { 
        isLoadMore ? setLoadingMore(false) : setLoading(false); 
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setResults([]);
    setNextPageUrl(null);
    fetchRecipes(false);
  };

  const handleLoadMore = () => {
    fetchRecipes(true);
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}>
      <section style={{ position: 'relative', padding: '4rem 0 3rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #fdfbf7 0%, #f4f7f6 100%)', borderBottom: '1px solid rgba(0,0,0,0.05)' }} className="py-5 py-lg-6">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <motion.h1 
                className="display-4 fw-bold mb-3" 
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--matcha-dark)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Master the Kitchen
              </motion.h1>
              <motion.p 
                className="lead text-muted mb-5 d-none d-md-block"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Explore thousands of recipes, curate your weekly plan, and shop smarter.
              </motion.p>

              <Card className="shadow-lg border-0" style={{ borderRadius: 'var(--bs-border-radius-xl)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <Card.Body className="p-3 p-md-4">
                  <Form onSubmit={handleSearchSubmit}>
                    <InputGroup size="lg" className="mb-2 shadow-sm rounded-pill overflow-hidden">
                      <InputGroup.Text className="bg-white border-0 ps-3 ps-md-4">
                        <Search className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control 
                        type="text" 
                        placeholder="Craving..." 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                        className="border-0 shadow-none bg-white" 
                        style={{ fontSize: '1.1rem' }} 
                      />
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="px-3 px-md-5 fw-bold border-0"
                        style={{ background: 'var(--matcha-medium)' }}
                      >
                        {/* Hide text on mobile, show only icon */}
                        <span className="d-none d-md-inline">Search</span>
                        <span className="d-inline d-md-none"><Search color="white" /></span>
                      </Button>
                    </InputGroup>
                    
                    <Accordion className="mt-2">
                      <Accordion.Item eventKey="0" className="border-0 bg-transparent">
                        <Accordion.Header className="small-accordion-header justify-content-center">
                            <div className="d-flex align-items-center text-muted small fw-bold px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                                <FunnelFill className="me-2" /> Advanced Filters
                            </div>
                        </Accordion.Header>
                        <Accordion.Body className="text-start px-1 pb-0 pt-3">
                          <Row className="g-2">
                            <Col xs={6} md={4}><StyledDropdown label="Diet" options={dietOptions} value={diet} onChange={setDiet} /></Col>
                            <Col xs={6} md={4}><StyledDropdown label="Health" options={healthOptions} value={health} onChange={setHealth} /></Col>
                            <Col xs={6} md={4}><StyledDropdown label="Meal" options={mealTypeOptions} value={mealType} onChange={setMealType} /></Col>
                            <Col xs={6} md={4}><StyledDropdown label="Cuisine" options={cuisineTypeOptions} value={cuisineType} onChange={setCuisineType} /></Col>
                            <Col xs={6} md={4}><StyledDropdown label="Time" options={timeOptions} value={time} onChange={setTime} /></Col>
                            <Col xs={6} md={4}>
                              <div className="d-flex gap-1 align-items-center h-100">
                                <Form.Control type="number" placeholder="Min Cal" value={minCalories} onChange={(e) => setMinCalories(e.target.value)} size="sm" className="h-100" />
                                <span className="text-muted">-</span>
                                <Form.Control type="number" placeholder="Max Cal" value={maxCalories} onChange={(e) => setMaxCalories(e.target.value)} size="sm" className="h-100" />
                              </div>
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="mb-5">
        <div className="mb-5">
          {loading && <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} /><p className="mt-3 text-muted">Curating recipes...</p></div>}
          <AnimatePresence>
            {error && !loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Alert variant="warning" className="text-center border-0 bg-warning bg-opacity-10 text-warning-emphasis">{error}</Alert></motion.div>}
          </AnimatePresence>

          {results.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="d-flex align-items-center justify-content-between mb-4"><h2 className="h3 fw-bold mb-0">Search Results</h2><span className="text-muted small">{results.length} items found</span></div>
              <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                <AnimatePresence>
                  {results.map((hit) => <Col key={hit.recipe.uri}><RecipeCard recipe={hit.recipe} /></Col>)}
                </AnimatePresence>
              </Row>
              {nextPageUrl && !loading && <div className="text-center mt-5"><Button variant="outline-primary" onClick={handleLoadMore} disabled={loadingMore} size="lg">{loadingMore ? 'Loading...' : 'Discover More'}</Button></div>}
            </motion.div>
          )}
        </div>

        <div className="mt-5 pt-4 border-top" style={{ borderColor: 'var(--matcha-pale)' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
             <div><h2 className="h3 fw-bold mb-0" style={{ color: 'var(--matcha-dark)' }}>Latest Food News</h2><span className="text-muted small">Fresh from the press</span></div>
             <Button variant="link" onClick={handleRefreshNews} className="text-decoration-none p-0" style={{ color: 'var(--matcha-medium)' }}><ArrowClockwise size={20} /> Refresh</Button>
          </div>
          
          {loadingNews && news.length === 0 ? <NewsLoadingSkeleton /> : newsError ? <Alert variant="light" className="text-center text-muted">News feed currently unavailable.</Alert> : (
            <motion.div variants={resultsListVariants} initial="initial" animate="animate">
              <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                <AnimatePresence>
                  {news.map((article, idx) => <Col key={`${article.url}-${idx}`}><NewsCard article={article} /></Col>)}
                </AnimatePresence>
              </Row>
              <div className="text-center">
                  <Button variant="outline-secondary" size="sm" onClick={handleLoadMoreNews} disabled={loadingMoreNews}>{loadingMoreNews ? 'Loading...' : 'Load More News'}</Button>
              </div>
            </motion.div>
          )}
        </div>
      </Container>
    </motion.div>
  );
};