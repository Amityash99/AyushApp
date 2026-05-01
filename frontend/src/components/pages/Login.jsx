import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/api/auth/login', { email, password });
      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Redirect based on role
      if (role === 'yoga_instructor') {
        navigate('/yoga-dashboard');
      } else if (role === 'pwd') {
        navigate('/pwd-dashboard');
      } else if (['aam_center', 'district', 'directorate', 'state'].includes(role)) {
        navigate('/dashboard');
      } else {
        // Fallback for any other role
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px' }} className="shadow">
        <Card.Body>
          <div className="text-center mb-4">
            {/* <img src="/gov-logo.png" alt="Government of Rajasthan" height="60" className="mb-2" /> */}
            <h4>AYUSH Department, Rajasthan</h4>
            <p className="text-muted">Login to your account</p>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Login'}
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-muted text-center">
          <small>Government of Rajasthan – National Ayush Mission</small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Login;
