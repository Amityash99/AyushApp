import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

const Construction = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const res = await API.get('/construction'); setItems(res.data); } catch (err) { console.error(err); }
  };
  const handleClose = () => { setShowModal(false); setCurrent({}); setEditingId(null); };
  const handleShow = (item = null) => {
    if (item) { setCurrent(item); setEditingId(item._id); } else { setCurrent({}); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/construction/${editingId}`, current);
      else await API.post('/construction', current);
      fetchItems();
      handleClose();
    } catch (err) { console.error(err); alert(err.response?.data?.message || 'Submission failed'); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/construction/${id}`); fetchItems(); } catch (err) { console.error(err); }
    }
  };
  const handleVerify = async (id, status, reason) => {
    try { await API.put(`/construction/${id}/verify`, { status, rejectionReason: reason }); fetchItems(); } catch (err) { console.error(err); }
  };
  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Construction Works</h2>
        <div>
          <Button variant="secondary" onClick={fetchItems} className="me-2">Refresh</Button>
          {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Work</Button>}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="alert alert-info">No construction works found.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr><th>Name</th><th>District</th><th>Status</th><th>Completion %</th><th>Verification</th><th>Actions</th> </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.district}</td>
                <td>{item.status}</td>
                <td>{item.completionPercentage}%</td>
                <td>{getBadge(item.verificationStatus)}</td>
                <td>
                  {role === 'aam_center' && item.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="info" onClick={() => handleShow(item)}>Edit</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(item._id)}>Del</Button>
                    </>
                  )}
                  {role === 'district' && item.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => handleVerify(item._id, 'approved')}>Approve</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => {
                        const reason = prompt('Rejection reason:'); if (reason) handleVerify(item._id, 'rejected', reason);
                      }}>Reject</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Work' : 'Add Work'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Include all fields from the model */}
            <Row>
              <Col><Form.Group><Form.Label>Name</Form.Label><Form.Control name="name" value={current.name || ''} onChange={handleChange} required /></Form.Group></Col>
              <Col><Form.Group><Form.Label>District</Form.Label><Form.Control name="district" value={current.district || ''} onChange={handleChange} required /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Type of Site</Form.Label><Form.Select name="typeOfSite" value={current.typeOfSite || ''} onChange={handleChange}>
              <option>Dispensary</option><option>Hospital</option><option>AAM</option><option>Block Hospital</option><option>DH</option><option>College</option>
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Land Ownership</Form.Label><Form.Select name="landOwnership" value={current.landOwnership || ''} onChange={handleChange}>
              <option>Departmental</option><option>Donated</option><option>Rented</option>
            </Form.Select></Form.Group>
            <Row><Col><Form.Group><Form.Label>Area of Land (sq ft)</Form.Label><Form.Control type="number" name="areaOfLand" value={current.areaOfLand || ''} onChange={handleChange} /></Form.Group></Col>
            <Col><Form.Group><Form.Label>Built Area (sq ft)</Form.Label><Form.Control type="number" name="builtArea" value={current.builtArea || ''} onChange={handleChange} /></Form.Group></Col></Row>
            <Form.Group><Form.Label>Type of Construction</Form.Label><Form.Select name="typeOfConstruction" value={current.typeOfConstruction || ''} onChange={handleChange}>
              <option>New Building</option><option>Repairing</option><option>Extension work</option>
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Design Photo (URL)</Form.Label><Form.Control name="designPhoto" value={current.designPhoto || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Working Agency</Form.Label><Form.Select name="workingAgency" value={current.workingAgency || ''} onChange={handleChange}>
              <option>PWD</option><option>NHM</option><option>RSAMB</option><option>Other</option>
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Contractor Details (JSON)</Form.Label><Form.Control as="textarea" name="contractorDetails" value={JSON.stringify(current.contractorDetails) || ''} onChange={e => setCurrent({...current, contractorDetails: JSON.parse(e.target.value)})} /></Form.Group>
            <Form.Group><Form.Label>G-Schedule Photo (URL)</Form.Label><Form.Control name="gschedulePhoto" value={current.gschedulePhoto || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Work Completion Timeline</Form.Label><Form.Control type="date" name="workCompletionTimeline" value={current.workCompletionTimeline?.slice(0,10) || ''} onChange={handleChange} /></Form.Group>
            <Row><Col><Form.Group><Form.Label>Budget</Form.Label><Form.Control type="number" name="budget" value={current.budget || ''} onChange={handleChange} /></Form.Group></Col>
            <Col><Form.Group><Form.Label>Expenditure</Form.Label><Form.Control type="number" name="expenditure" value={current.expenditure || ''} onChange={handleChange} /></Form.Group></Col></Row>
            <Form.Group><Form.Label>Level of Work</Form.Label><Form.Select name="levelOfWork" value={current.levelOfWork || ''} onChange={handleChange}>
              <option>Plinth</option><option>Lentil</option><option>Roof</option><option>Flooring</option><option>Complete</option>
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Completion Percentage</Form.Label><Form.Control type="number" min="0" max="100" name="completionPercentage" value={current.completionPercentage || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Overall Status</Form.Label><Form.Select name="overallStatus" value={current.overallStatus || ''} onChange={handleChange}>
              <option>On Track</option><option>At Risk</option><option>Delayed</option>
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Challenges</Form.Label><Form.Control as="textarea" name="challenges" value={current.challenges || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Decisions Needed</Form.Label><Form.Control as="textarea" name="decisionsNeeded" value={current.decisionsNeeded || ''} onChange={handleChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Construction;