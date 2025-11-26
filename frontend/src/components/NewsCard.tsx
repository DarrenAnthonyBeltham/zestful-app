import React from 'react';
import { Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { GNewsArticle } from '../types/news.types';

interface NewsCardProps {
  article: GNewsArticle;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { 
    scale: 1.03,
    boxShadow: "0 8px 20px rgba(0,0,0,0.07)"
  }
};

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="h-100"
    >
      <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <Card className="h-100 shadow-sm" style={{ borderRadius: 'var(--bs-border-radius-lg)', overflow: 'hidden' }}>
          <Card.Img 
            variant="top" 
            src={article.image} 
            style={{ height: '180px', objectFit: 'cover' }}
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x360.png?text=Food+News')}
          />
          <Card.Body className="d-flex flex-column">
            <Card.Title 
              style={{ color: 'var(--matcha-dark)'}}
              className="h6"
            >
              {article.title}
            </Card.Title>
            <Card.Text className="text-muted small flex-grow-1" style={{ fontSize: '0.85rem' }}>
              {article.description.substring(0, 100)}...
            </Card.Text>
          </Card.Body>
        </Card>
      </a>
    </motion.div>
  );
};