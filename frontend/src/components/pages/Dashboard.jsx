import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    construction: { planned: 0, ongoing: 0, completed: 0 },
    hr: { sanctioned: 0, filled: 0, vacant: 0 },
    garden: { total: 0, active: 0, totalPlantSpecies: 0 },
    programme: { total: 0, totalBeneficiaries: 0 },
    yoga: { totalSessions: 0, totalParticipants: 0 },
    ncd: { totalSurveys: 0, highRisk: 0 },
    iec: { completed: 0, pending: 0 }
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [constructionRes, hrRes, gardenRes, programmeRes, yogaRes, ncdRes, iecRes] = await Promise.all([
          API.get('/construction/stats'),
          API.get('/hr/stats'),
          API.get('/garden/stats'),
          API.get('/programme/stats'),
          API.get('/yoga-session/stats'),
          API.get('/ncd-screening/stats'),
          API.get('/branding-work/stats')
        ]);
        setStats({
          construction: constructionRes.data,
          hr: hrRes.data,
          garden: gardenRes.data,
          programme: programmeRes.data,
          yoga: yogaRes.data,
          ncd: ncdRes.data,
          iec: iecRes.data
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  const constructionData = [
    { name: 'Planned', value: stats.construction.planned },
    { name: 'Ongoing', value: stats.construction.ongoing },
    { name: 'Completed', value: stats.construction.completed }
  ];

  const pieData = [
    { name: 'Filled', value: stats.hr.filled },
    { name: 'Vacant', value: stats.hr.vacant }
  ];
  const COLORS = ['#1e3a6f', '#dc3545'];

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center p-3">
            <h5>Total Construction Works</h5>
            <h2>{stats.construction.planned + stats.construction.ongoing + stats.construction.completed}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3">
            <h5>Staff Filled / Sanctioned</h5>
            <h2>{stats.hr.filled} / {stats.hr.sanctioned}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3">
            <h5>Herbal Gardens</h5>
            <h2>{stats.garden.total}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-3">
            <h5>Total Beneficiaries</h5>
            <h2>{stats.programme.totalBeneficiaries}</h2>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Construction Status</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={constructionData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e3a6f" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Staff Sanctioned vs Filled</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5>Yoga Sessions</h5>
              <p>Total Sessions: {stats.yoga.totalSessions}</p>
              <p>Total Participants: {stats.yoga.totalParticipants}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5>NCD Survey</h5>
              <p>Total Screenings: {stats.ncd.totalSurveys}</p>
              <p>High‑Risk Cases: {stats.ncd.highRisk}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;