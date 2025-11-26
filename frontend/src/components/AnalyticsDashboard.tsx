import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { authService } from '../services/auth.service';

interface AnalyticsData {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalMeals: number;
  dailyCalories: { [key: string]: number };
}

const COLORS = ['#588157', '#a3b18a', '#dad7cd'];

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics', { headers: authService.getAuthHeader() });
        if (response.ok) {
          setData(await response.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--matcha-medium)' }} /></div>;
  if (!data || data.totalMeals === 0) return <p className="text-center text-muted">Add meals to your planner to see analytics.</p>;

  const pieData = [
    { name: 'Protein', value: data.totalProtein },
    { name: 'Carbs', value: data.totalCarbs },
    { name: 'Fat', value: data.totalFat },
  ];

  const barData = Object.entries(data.dailyCalories).map(([day, cals]) => ({
    name: day.substring(0, 3),
    calories: cals
  }));

  return (
    <div className="mt-5">
      <h3 style={{ color: 'var(--matcha-dark)' }}>Weekly Nutrition Snapshot</h3>
      <Row className="g-4 mt-2">
        <Col md={4}>
          <Card className="h-100 text-center p-4 border-0 shadow-sm">
            <h6 className="text-muted text-uppercase">Total Weekly Calories</h6>
            <div className="display-4 fw-bold" style={{ color: 'var(--matcha-dark)' }}>{data.totalCalories}</div>
            <small className="text-muted">Across {data.totalMeals} planned meals</small>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm p-3">
            <h6 className="text-center text-muted text-uppercase mb-3">Macro Breakdown</h6>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm p-3">
            <h6 className="text-center text-muted text-uppercase mb-3">Calories per Day</h6>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="calories" fill="var(--matcha-medium)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};