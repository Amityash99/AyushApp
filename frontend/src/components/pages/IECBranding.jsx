import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Button, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

const IECPlans = () => {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try { const res = await API.get('/iec-plan'); setPlans(res.data); } catch (err) { console.error(err); }
  };
  const handleClose = () => { setShowModal(false); setCurrent({}); setEditingId(null); };
  const handleShow = (plan = null) => {
    if (plan) { setCurrent(plan); setEditingId(plan._id); } else { setCurrent({}); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/iec-plan/${editingId}`, current);
      else await API.post('/iec-plan', current);
      fetchPlans(); handleClose();
    } catch (err) { console.error(err); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/iec-plan/${id}`); fetchPlans(); } catch (err) { console.error(err); }
    }
  };
  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>IEC Plans</h4>
        {role === 'state' && <Button variant="primary" onClick={() => handleShow()}>Add Plan</Button>}
      </div>
      <Table striped bordered hover responsive>
        <thead><tr><th>Title</th><th>Campaign</th><th>Start-End</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {plans.map(p => (
            <tr key={p._id}>
              <td>{p.title}</td><td>{p.campaignName}</td>
              <td>{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</td>
              <td>{p.status}</td>
              <td>
                {role === 'state' && (
                  <>
                    <Button size="sm" variant="info" onClick={() => handleShow(p)}>Edit</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(p._id)}>Del</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Plan' : 'Add Plan'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group><Form.Label>Title</Form.Label><Form.Control name="title" value={current.title || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Campaign Name</Form.Label><Form.Control name="campaignName" value={current.campaignName || ''} onChange={handleChange} /></Form.Group>
            <Row><Col><Form.Group><Form.Label>Start Date</Form.Label><Form.Control type="date" name="startDate" value={current.startDate?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col>
            <Col><Form.Group><Form.Label>End Date</Form.Label><Form.Control type="date" name="endDate" value={current.endDate?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col></Row>
            <Form.Group><Form.Label>Assigned To</Form.Label><Form.Select name="assignedTo" value={current.assignedTo || ''} onChange={handleChange}><option>All AAM Centers</option><option>Selected Districts</option><option>Specific Centers</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Status</Form.Label><Form.Select name="status" value={current.status || ''} onChange={handleChange}><option>Active</option><option>Completed</option><option>Cancelled</option></Form.Select></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

const IECReports = () => {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try { const res = await API.get('/iec-report'); setReports(res.data); } catch (err) { console.error(err); }
  };
  const handleClose = () => { setShowModal(false); setCurrent({}); setEditingId(null); };
  const handleShow = (report = null) => {
    if (report) { setCurrent(report); setEditingId(report._id); } else { setCurrent({}); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/iec-report/${editingId}`, current);
      else await API.post('/iec-report', current);
      fetchReports(); handleClose();
    } catch (err) { console.error(err); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/iec-report/${id}`); fetchReports(); } catch (err) { console.error(err); }
    }
  };
  const handleVerify = async (id, status, reason) => {
    try { await API.put(`/iec-report/${id}/verify`, { status, rejectionReason: reason }); fetchReports(); } catch (err) { console.error(err); }
  };
  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };
  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>IEC Reports</h4>
        {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Report</Button>}
      </div>
      <Table striped bordered hover responsive>
        <thead><tr><th>Activity Date</th><th>Center</th><th>Activity Type</th><th>Location</th><th>Verification</th><th>Actions</th></tr></thead>
        <tbody>
          {reports.map(r => (
            <tr key={r._id}>
              <td>{new Date(r.activityDate).toLocaleDateString()}</td><td>{r.centerId}</td><td>{r.activityType}</td><td>{r.location}</td>
              <td>{getBadge(r.verificationStatus)}</td>
              <td>
                {role === 'aam_center' && r.verificationStatus === 'pending' && (
                  <>
                    <Button size="sm" variant="info" onClick={() => handleShow(r)}>Edit</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(r._id)}>Del</Button>
                  </>
                )}
                {role === 'district' && r.verificationStatus === 'pending' && (
                  <>
                    <Button size="sm" variant="success" onClick={() => handleVerify(r._id, 'approved')}>Approve</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => {
                      const reason = prompt('Rejection reason:'); if (reason) handleVerify(r._id, 'rejected', reason);
                    }}>Reject</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Report' : 'Add Report'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row><Col><Form.Group><Form.Label>Activity Date</Form.Label><Form.Control type="date" name="activityDate" value={current.activityDate?.slice(0,10) || ''} onChange={handleChange} required /></Form.Group></Col>
            <Col><Form.Group><Form.Label>Center ID</Form.Label><Form.Control name="centerId" value={current.centerId || ''} onChange={handleChange} required /></Form.Group></Col></Row>
            <Form.Group><Form.Label>Location</Form.Label><Form.Control name="location" value={current.location || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Activity Type</Form.Label><Form.Select name="activityType" value={current.activityType || ''} onChange={handleChange} required>
              <option>Posters displayed</option><option>Wall painting</option><option>Hoarding installation</option><option>Community event</option><option>School awareness activity</option><option>Health camp IEC</option>
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Material Used (comma separated)</Form.Label><Form.Control name="materialUsed" value={current.materialUsed?.join(',') || ''} onChange={(e) => setCurrent({...current, materialUsed: e.target.value.split(',')})} /></Form.Group>
            <Form.Group><Form.Label>Quantity Used</Form.Label><Form.Control type="number" name="quantityUsed" value={current.quantityUsed || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Geo-tagged Photos (URLs, comma separated)</Form.Label><Form.Control name="photos" value={current.photos?.join(',') || ''} onChange={(e) => setCurrent({...current, photos: e.target.value.split(',')})} /></Form.Group>
            <Form.Group><Form.Label>Geo Location (lat,lng)</Form.Label><Form.Control name="geoLocation" value={current.geoLocation ? `${current.geoLocation.lat},${current.geoLocation.lng}` : ''} onChange={(e) => { const [lat,lng] = e.target.value.split(','); setCurrent({...current, geoLocation: {lat: parseFloat(lat), lng: parseFloat(lng)}}); }} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

const BrandingWorks = () => {
  const [works, setWorks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchWorks(); }, []);

  const fetchWorks = async () => {
    try { const res = await API.get('/branding-work'); setWorks(res.data); } catch (err) { console.error(err); }
  };
  const handleClose = () => { setShowModal(false); setCurrent({}); setEditingId(null); };
  const handleShow = (work = null) => {
    if (work) { setCurrent(work); setEditingId(work._id); } else { setCurrent({}); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/branding-work/${editingId}`, current);
      else await API.post('/branding-work', current);
      fetchWorks(); handleClose();
    } catch (err) { console.error(err); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/branding-work/${id}`); fetchWorks(); } catch (err) { console.error(err); }
    }
  };
  const handleVerify = async (id, status, reason) => {
    try { await API.put(`/branding-work/${id}/verify`, { status, rejectionReason: reason }); fetchWorks(); } catch (err) { console.error(err); }
  };
  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };
  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Branding Work</h4>
        {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Work</Button>}
      </div>
      <Table striped bordered hover responsive>
        <thead><tr><th>Center</th><th>Type</th><th>Status</th><th>Completion %</th><th>Verification</th><th>Actions</th></tr></thead>
        <tbody>
          {works.map(w => (
            <tr key={w._id}>
              <td>{w.centerId}</td><td>{w.brandingType}</td><td>{w.status}</td><td>{w.completionPercentage}%</td>
              <td>{getBadge(w.verificationStatus)}</td>
              <td>
                {role === 'aam_center' && w.verificationStatus === 'pending' && (
                  <>
                    <Button size="sm" variant="info" onClick={() => handleShow(w)}>Edit</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(w._id)}>Del</Button>
                  </>
                )}
                {role === 'district' && w.verificationStatus === 'pending' && (
                  <>
                    <Button size="sm" variant="success" onClick={() => handleVerify(w._id, 'approved')}>Approve</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => {
                      const reason = prompt('Rejection reason:'); if (reason) handleVerify(w._id, 'rejected', reason);
                    }}>Reject</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Work' : 'Add Work'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row><Col><Form.Group><Form.Label>Center ID</Form.Label><Form.Control name="centerId" value={current.centerId || ''} onChange={handleChange} required /></Form.Group></Col>
            <Col><Form.Group><Form.Label>District</Form.Label><Form.Control name="district" value={current.district || ''} onChange={handleChange} /></Form.Group></Col></Row>
            <Form.Group><Form.Label>Branding Type</Form.Label><Form.Select name="brandingType" value={current.brandingType || ''} onChange={handleChange} required>
              <option>AAM Signboards</option><option>Front-facade branding</option><option>Inner wall branding</option><option>Herbal-garden signage</option><option>Room-wise branding</option><option>Citizen charter display</option><option>Staff duty display</option><option>OPD/IPD directional boards</option>
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Status</Form.Label><Form.Select name="status" value={current.status || ''} onChange={handleChange}><option>Pending</option><option>Completed</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Pending Reason</Form.Label><Form.Control name="pendingReason" value={current.pendingReason || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Completion Percentage</Form.Label><Form.Control type="number" min="0" max="100" name="completionPercentage" value={current.completionPercentage || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Before Photo (URL)</Form.Label><Form.Control name="beforePhoto" value={current.beforePhoto || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>After Photo (URL)</Form.Label><Form.Control name="afterPhoto" value={current.afterPhoto || ''} onChange={handleChange} /></Form.Group>
            <hr /><h6>Civil Work Details (Optional)</h6>
            <Form.Group><Form.Label>Contractor Name</Form.Label><Form.Control name="contractorName" value={current.contractorName || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Sanctioning Authority</Form.Label><Form.Control name="sanctioningAuthority" value={current.sanctioningAuthority || ''} onChange={handleChange} /></Form.Group>
            <Row><Col><Form.Group><Form.Label>Start Date</Form.Label><Form.Control type="date" name="startDate" value={current.startDate?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col>
            <Col><Form.Group><Form.Label>Completion Date</Form.Label><Form.Control type="date" name="completionDate" value={current.completionDate?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col></Row>
            <Form.Group><Form.Label>Work Progress</Form.Label><Form.Control name="workProgress" value={current.workProgress || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Invoice Copy (URL)</Form.Label><Form.Control name="invoiceCopy" value={current.invoiceCopy || ''} onChange={handleChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

const IECBranding = () => {
  const [activeTab, setActiveTab] = useState('plans');
  return (
    <div>
      <h2 className="mb-4">IEC & Branding Activity</h2>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="plans" title="IEC Plans"><IECPlans /></Tab>
        <Tab eventKey="reports" title="IEC Reports"><IECReports /></Tab>
        <Tab eventKey="branding" title="Branding Work"><BrandingWorks /></Tab>
      </Tabs>
    </div>
  );
};

export default IECBranding;