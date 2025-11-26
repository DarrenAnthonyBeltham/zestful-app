import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Badge, Row, Col } from 'react-bootstrap';
import { authService } from '../services/auth.service';
import { GamificationStats } from '../types/gamification.types';
import { Trophy, StarFill, Award } from 'react-bootstrap-icons';

export const GamificationSection: React.FC = () => {
  const [stats, setStats] = useState<GamificationStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/gamification', { headers: authService.getAuthHeader() });
        if (response.ok) setStats(await response.json());
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  const progress = (stats.currentXp / stats.nextLevelXp) * 100;

  return (
    <div className="mt-5">
      <h3 style={{ color: 'var(--matcha-dark)' }}>Your Chef Status</h3>
      <Card className="border-0 shadow-sm p-4" style={{ background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)' }}>
        <Row className="align-items-center">
          <Col md={3} className="text-center border-end">
            <div className="display-4 fw-bold" style={{ color: 'var(--matcha-medium)' }}>{stats.level}</div>
            <small className="text-muted text-uppercase fw-bold">Level</small>
          </Col>
          <Col md={9}>
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold"><StarFill className="text-warning me-2" /> {stats.currentXp} XP</span>
              <span className="text-muted">Next Level: {stats.nextLevelXp} XP</span>
            </div>
            <ProgressBar now={progress} variant="success" style={{ height: '10px', borderRadius: '10px' }} />
            
            <div className="mt-4">
              <h6 className="text-muted text-uppercase mb-3"><Award className="me-2" /> Earned Badges</h6>
              <div className="d-flex flex-wrap gap-2">
                {stats.badges.length > 0 ? stats.badges.map(badge => (
                  <Badge key={badge} bg="warning" text="dark" className="px-3 py-2 shadow-sm border fw-normal">
                    <Trophy className="me-1" /> {badge}
                  </Badge>
                )) : <span className="text-muted small">No badges yet. Start cooking!</span>}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};