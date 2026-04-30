import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import API from '../services/api';

const YogaDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalSessions: 0, totalParticipants: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch instructor profile
      const profileRes = await API.get('/yoga-instructor/me');
      setProfile(profileRes.data);
      // Fetch session stats
      const statsRes = await API.get('/yoga-session/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location]); // Re‑fetch whenever the route changes (i.e., user navigates to this page)

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2 className="mb-4">Yoga Instructor Dashboard</h2>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center p-3">
            <h5>Welcome</h5>
            <h3>{profile?.name || 'Instructor'}</h3>
            <p className="text-muted">{profile?.assignedCenter || 'Center not assigned'}</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3">
            <h5>Total Sessions</h5>
            <h2>{stats.totalSessions}</h2>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3">
            <h5>Total Participants</h5>
            <h2>{stats.totalParticipants}</h2>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5>Recent Activity</h5>
              <p>Use the sidebar to manage your sessions and attendance.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5>Quick Links</h5>
              <ul>
                <li><a href="/yoga-session">Add New Session</a></li>
                <li><a href="/yoga-attendance">Mark Attendance</a></li>
                {/* <li><a href="/yoga-performance">View Performance</a></li> */}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default YogaDashboard;