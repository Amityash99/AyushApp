import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import API from '../services/api';

const PwdDashboard = () => {
  const [stats, setStats] = useState({ planned: 0, ongoing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/api/construction/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h2 className="mb-4">PWD Dashboard</h2>
      <Row>
        <Col md={4}><Card className="text-center p-3"><h5>Planned</h5><h2>{stats.planned}</h2></Card></Col>
        <Col md={4}><Card className="text-center p-3"><h5>Ongoing</h5><h2>{stats.ongoing}</h2></Card></Col>
        <Col md={4}><Card className="text-center p-3"><h5>Completed</h5><h2>{stats.completed}</h2></Card></Col>
      </Row>
    </div>
  );
};

export default PwdDashboard;
