import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import API from '../services/api';

const YogaPerformance = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const profileRes = await API.get('/yoga-instructor/me');
        const instructorId = profileRes.data._id;
        const res = await API.get(`/yoga-instructor/${instructorId}/performance`);
        setPerformance(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load performance');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!performance) return <Alert variant="warning">No performance data available</Alert>;

  return (
    <div>
      <h2 className="mb-4">My Performance</h2>
      <Row>
        <Col md={4}>
          <Card className="text-center p-3">
            <h5>Total Sessions</h5>
            <h2>{performance.sessions}</h2>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3">
            <h5>Total Participants</h5>
            <h2>{performance.totalParticipants}</h2>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3">
            <h5>Avg Attendance / Session</h5>
            <h2>{performance.avgAttendance.toFixed(1)}</h2>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5>Alerts</h5>
              {performance.alerts && performance.alerts.length > 0 ? (
                <ul>
                  {performance.alerts.map((alert, idx) => (
                    <li key={idx}><Badge bg="danger" className="me-2">Alert</Badge> {alert}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-success">No alerts – you are doing great!</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default YogaPerformance;