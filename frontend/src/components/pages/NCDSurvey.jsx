import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Button, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

// ---------- Campaigns Component (State only) ----------
const NCDCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try { const res = await API.get('/ncd-campaign'); setCampaigns(res.data); } catch (err) { console.error(err); }
  };
  const handleClose = () => { setShowModal(false); setCurrent({}); setEditingId(null); };
  const handleShow = (c = null) => {
    if (c) { setCurrent(c); setEditingId(c._id); } else { setCurrent({}); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/ncd-campaign/${editingId}`, current);
      else await API.post('/ncd-campaign', current);
      fetchCampaigns(); handleClose();
    } catch (err) { console.error(err); alert(err.response?.data?.message); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/ncd-campaign/${id}`); fetchCampaigns(); } catch (err) { console.error(err); }
    }
  };
  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>NCD Campaigns</h4>
        {role === 'state' && <Button variant="primary" onClick={() => handleShow()}>Add Campaign</Button>}
      </div>
      <Table striped bordered hover responsive>
        <thead><tr><th>Name</th><th>Start-End</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {campaigns.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</td>
              <td>{c.status}</td>
              <td>{role === 'state' && (<><Button size="sm" variant="info" onClick={() => handleShow(c)}>Edit</Button>{' '}<Button size="sm" variant="danger" onClick={() => handleDelete(c._id)}>Del</Button></>)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Campaign' : 'Add Campaign'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group><Form.Label>Name</Form.Label><Form.Control name="name" value={current.name || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" name="description" value={current.description || ''} onChange={handleChange} /></Form.Group>
            <Row><Col><Form.Group><Form.Label>Start Date</Form.Label><Form.Control type="date" name="startDate" value={current.startDate?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col>
            <Col><Form.Group><Form.Label>End Date</Form.Label><Form.Control type="date" name="endDate" value={current.endDate?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col></Row>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

// ---------- Screenings Component (AAM Center) ----------
const NCDScreenings = () => {
  const [screenings, setScreenings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({
    beneficiary: {},
    vitals: {},
    riskFactors: {},
    lifestyle: {},
    referral: {},
    followUp: {}
  });
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchScreenings(); }, []);

  const fetchScreenings = async () => {
    try { const res = await API.get('/ncd-screening'); setScreenings(res.data); } catch (err) { console.error(err); }
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrent({
      beneficiary: {},
      vitals: {},
      riskFactors: {},
      lifestyle: {},
      referral: {},
      followUp: {}
    });
    setEditingId(null);
  };

  const handleShow = (screening = null) => {
    if (screening) {
      setCurrent(screening);
      setEditingId(screening._id);
    } else {
      setCurrent({
        beneficiary: {},
        vitals: {},
        riskFactors: {},
        lifestyle: {},
        referral: {},
        followUp: {}
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleChange = (section, field, value) => {
    setCurrent({
      ...current,
      [section]: { ...current[section], [field]: value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/ncd-screening/${editingId}`, current);
      } else {
        await API.post('/ncd-screening', current);
      }
      fetchScreenings();
      handleClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this screening record?')) {
      try {
        await API.delete(`/ncd-screening/${id}`);
        fetchScreenings();
      } catch (err) {
        console.error(err);
        alert('Delete failed');
      }
    }
  };

  const handleVerify = async (id, status, reason) => {
    try {
      await API.put(`/ncd-screening/${id}/verify`, { status, rejectionReason: reason });
      fetchScreenings();
    } catch (err) {
      console.error(err);
      alert('Verification failed');
    }
  };

  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>NCD Screenings</h4>
        <div>
          <Button variant="secondary" onClick={fetchScreenings} className="me-2">Refresh</Button>
          {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Screening</Button>}
        </div>
      </div>
      {screenings.length === 0 ? (
        <div className="alert alert-info">No NCD screenings found. Click "Add Screening" to create one.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Beneficiary Name</th>
              <th>Age</th>
              <th>BMI</th>
              <th>BP (Systolic/Diastolic)</th>
              <th>Blood Sugar</th>
              <th>Risk Stratification</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {screenings.map(s => (
              <tr key={s._id}>
                <td>{s.beneficiary?.name}</td>
                <td>{s.beneficiary?.age}</td>
                <td>{s.vitals?.bmi}</td>
                <td>{s.vitals?.bpSystolic}/{s.vitals?.bpDiastolic}</td>
                <td>{s.vitals?.bloodSugar}</td>
                <td>{s.riskStratification}</td>
                <td>{getBadge(s.verificationStatus)}</td>
                <td>
                  {role === 'aam_center' && s.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="info" onClick={() => handleShow(s)}>Edit</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(s._id)}>Del</Button>
                    </>
                  )}
                  {role === 'district' && s.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => handleVerify(s._id, 'approved')}>Approve</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) handleVerify(s._id, 'rejected', reason);
                      }}>Reject</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Form – full NCD screening form */}
      <Modal show={showModal} onHide={handleClose} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit NCD Screening' : 'Add NCD Screening'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Beneficiary Information */}
            <h5>Beneficiary Information</h5>
            <Row>
              <Col><Form.Group><Form.Label>Name</Form.Label><Form.Control value={current.beneficiary?.name || ''} onChange={e => handleChange('beneficiary', 'name', e.target.value)} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Gender</Form.Label><Form.Select value={current.beneficiary?.gender || ''} onChange={e => handleChange('beneficiary', 'gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></Form.Select></Form.Group></Col>
              <Col><Form.Group><Form.Label>Age</Form.Label><Form.Control type="number" value={current.beneficiary?.age || ''} onChange={e => handleChange('beneficiary', 'age', e.target.value)} /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Address</Form.Label><Form.Control value={current.beneficiary?.address || ''} onChange={e => handleChange('beneficiary', 'address', e.target.value)} /></Form.Group>
            <Row>
              <Col><Form.Group><Form.Label>Mobile</Form.Label><Form.Control value={current.beneficiary?.mobile || ''} onChange={e => handleChange('beneficiary', 'mobile', e.target.value)} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>ABHA ID</Form.Label><Form.Control value={current.beneficiary?.abhaId || ''} onChange={e => handleChange('beneficiary', 'abhaId', e.target.value)} /></Form.Group></Col>
            </Row>

            {/* Vitals & Measurements */}
            <hr /><h5>Vitals & Measurements</h5>
            <Row>
              <Col><Form.Group><Form.Label>Height (cm)</Form.Label><Form.Control type="number" value={current.vitals?.height || ''} onChange={e => handleChange('vitals', 'height', e.target.value)} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Weight (kg)</Form.Label><Form.Control type="number" value={current.vitals?.weight || ''} onChange={e => handleChange('vitals', 'weight', e.target.value)} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>BMI (auto-calc, optional)</Form.Label><Form.Control type="number" value={current.vitals?.bmi || ''} onChange={e => handleChange('vitals', 'bmi', e.target.value)} /></Form.Group></Col>
            </Row>
            <Row>
              <Col><Form.Group><Form.Label>BP Systolic</Form.Label><Form.Control type="number" value={current.vitals?.bpSystolic || ''} onChange={e => handleChange('vitals', 'bpSystolic', e.target.value)} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>BP Diastolic</Form.Label><Form.Control type="number" value={current.vitals?.bpDiastolic || ''} onChange={e => handleChange('vitals', 'bpDiastolic', e.target.value)} /></Form.Group></Col>
            </Row>
            <Row>
              <Col><Form.Group><Form.Label>Pulse Rate</Form.Label><Form.Control type="number" value={current.vitals?.pulse || ''} onChange={e => handleChange('vitals', 'pulse', e.target.value)} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Blood Sugar (mg/dL)</Form.Label><Form.Control type="number" value={current.vitals?.bloodSugar || ''} onChange={e => handleChange('vitals', 'bloodSugar', e.target.value)} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Waist Circumference (cm)</Form.Label><Form.Control type="number" value={current.vitals?.waistCircumference || ''} onChange={e => handleChange('vitals', 'waistCircumference', e.target.value)} /></Form.Group></Col>
            </Row>

            {/* Risk Factors */}
            <hr /><h5>Risk Factors (Yes/No/Not Assessed)</h5>
            {['hypertension','diabetes','obesity','copd','mentalHealth','oralHealth','breastCancer','cervicalCancer'].map(f => (
              <Form.Group key={f}><Form.Label>{f.replace(/([A-Z])/g, ' $1').toUpperCase()}</Form.Label>
                <Form.Select value={current.riskFactors?.[f] || ''} onChange={e => handleChange('riskFactors', f, e.target.value)}>
                  <option>Yes</option><option>No</option><option>Not Assessed</option>
                </Form.Select>
              </Form.Group>
            ))}

            {/* Lifestyle Assessment */}
            <hr /><h5>Lifestyle Assessment</h5>
            <Form.Group><Form.Check type="checkbox" label="Tobacco Use" checked={current.lifestyle?.tobacco || false} onChange={e => handleChange('lifestyle', 'tobacco', e.target.checked)} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Alcohol Consumption" checked={current.lifestyle?.alcohol || false} onChange={e => handleChange('lifestyle', 'alcohol', e.target.checked)} /></Form.Group>
            <Form.Group><Form.Label>Physical Activity Level</Form.Label><Form.Select value={current.lifestyle?.physicalActivity || ''} onChange={e => handleChange('lifestyle', 'physicalActivity', e.target.value)}><option>Low</option><option>Moderate</option><option>High</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Diet Score (1-10)</Form.Label><Form.Control type="number" min="1" max="10" value={current.lifestyle?.dietScore || ''} onChange={e => handleChange('lifestyle', 'dietScore', e.target.value)} /></Form.Group>
            <Form.Group><Form.Label>Stress Level</Form.Label><Form.Select value={current.lifestyle?.stressLevel || ''} onChange={e => handleChange('lifestyle', 'stressLevel', e.target.value)}><option>Low</option><option>Moderate</option><option>High</option></Form.Select></Form.Group>

            {/* Risk Stratification (auto-generated but can be set manually) */}
            <Form.Group><Form.Label>Risk Stratification</Form.Label><Form.Select value={current.riskStratification || ''} onChange={e => setCurrent({...current, riskStratification: e.target.value})}>
              <option>Low</option><option>Moderate</option><option>High</option>
            </Form.Select></Form.Group>

            {/* Referral Details */}
            <hr /><h5>Referral</h5>
            <Form.Group><Form.Check type="checkbox" label="Referred" checked={current.referral?.referred || false} onChange={e => handleChange('referral', 'referred', e.target.checked)} /></Form.Group>
            {current.referral?.referred && (
              <>
                <Form.Group><Form.Label>Reason for Referral</Form.Label><Form.Control value={current.referral?.reason || ''} onChange={e => handleChange('referral', 'reason', e.target.value)} /></Form.Group>
                <Form.Group><Form.Label>Referred To</Form.Label><Form.Control value={current.referral?.to || ''} onChange={e => handleChange('referral', 'to', e.target.value)} /></Form.Group>
                <Form.Group><Form.Label>Referral Date</Form.Label><Form.Control type="date" value={current.referral?.date?.slice(0,10) || ''} onChange={e => handleChange('referral', 'date', e.target.value)} /></Form.Group>
                <Form.Group><Form.Label>Referral Slip URL</Form.Label><Form.Control value={current.referral?.slipUrl || ''} onChange={e => handleChange('referral', 'slipUrl', e.target.value)} /></Form.Group>
              </>
            )}

            {/* Follow-Up */}
            <hr /><h5>Follow-Up</h5>
            <Form.Group><Form.Label>Follow-up Visit Date</Form.Label><Form.Control type="date" value={current.followUp?.visitDate?.slice(0,10) || ''} onChange={e => handleChange('followUp', 'visitDate', e.target.value)} /></Form.Group>
            <Form.Group><Form.Label>Outcome</Form.Label><Form.Control value={current.followUp?.outcome || ''} onChange={e => handleChange('followUp', 'outcome', e.target.value)} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Medication Started" checked={current.followUp?.medicationStarted || false} onChange={e => handleChange('followUp', 'medicationStarted', e.target.checked)} /></Form.Group>
            <Form.Group><Form.Label>Final Status</Form.Label><Form.Control value={current.followUp?.finalStatus || ''} onChange={e => handleChange('followUp', 'finalStatus', e.target.value)} /></Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Screening</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

// ---------- Main NCD Survey Component ----------
const NCDSurvey = () => {
  const [activeTab, setActiveTab] = useState('screenings');
  const role = localStorage.getItem('role');
  return (
    <div>
      <h2 className="mb-4">NCD Survey</h2>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {role === 'state' && <Tab eventKey="campaigns" title="Campaigns"><NCDCampaigns /></Tab>}
        <Tab eventKey="screenings" title="Screenings"><NCDScreenings /></Tab>
      </Tabs>
    </div>
  );
};

export default NCDSurvey;