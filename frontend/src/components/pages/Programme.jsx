import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

const Programme = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const res = await API.get('/programme'); setItems(res.data); } catch (err) { console.error(err); }
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
      if (editingId) await API.put(`/programme/${editingId}`, current);
      else await API.post('/programme', current);
      fetchItems();
      handleClose();
    } catch (err) { console.error(err); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/programme/${id}`); fetchItems(); } catch (err) { console.error(err); }
    }
  };
  const handleVerify = async (id, status, reason) => {
    try { await API.put(`/programme/${id}/verify`, { status, rejectionReason: reason }); fetchItems(); } catch (err) { console.error(err); }
  };
  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Programme Activities</h2>
        {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Activity</Button>}
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr><th>Title</th><th>Category</th><th>Event Date</th><th>Participants</th><th>Verification</th><th>Actions</th> </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td><td>{item.category}</td><td>{new Date(item.eventDate).toLocaleDateString()}</td>
              <td>{item.totalParticipants}</td><td>{getBadge(item.verificationStatus)}</td>
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

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Activity' : 'Add Activity'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group><Form.Label>Title</Form.Label><Form.Control name="title" value={current.title || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Category</Form.Label><Form.Select name="category" value={current.category || ''} onChange={handleChange}><option>Yoga</option><option>NCD</option><option>Awareness</option><option>Training</option><option>Camp</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Event Date & Time</Form.Label><Form.Control type="datetime-local" name="eventDate" value={current.eventDate?.slice(0,16) || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Venue</Form.Label><Form.Control name="venue" value={current.venue || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Organizing Unit</Form.Label><Form.Control name="organizingUnit" value={current.organizingUnit || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Target Group</Form.Label><Form.Control name="targetGroup" value={current.targetGroup || ''} onChange={handleChange} /></Form.Group>
            <Row>
              <Col><Form.Group><Form.Label>Total Participants</Form.Label><Form.Control type="number" name="totalParticipants" value={current.totalParticipants || ''} onChange={handleChange} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Male</Form.Label><Form.Control type="number" name="genderBreakdown.male" value={current.genderBreakdown?.male || ''} onChange={e => setCurrent({...current, genderBreakdown: {...current.genderBreakdown, male: e.target.value}})} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Female</Form.Label><Form.Control type="number" name="genderBreakdown.female" value={current.genderBreakdown?.female || ''} onChange={e => setCurrent({...current, genderBreakdown: {...current.genderBreakdown, female: e.target.value}})} /></Form.Group></Col>
            </Row>
            <Row>
              <Col><Form.Group><Form.Label>Children</Form.Label><Form.Control type="number" name="genderBreakdown.children" value={current.genderBreakdown?.children || ''} onChange={e => setCurrent({...current, genderBreakdown: {...current.genderBreakdown, children: e.target.value}})} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Senior Citizens</Form.Label><Form.Control type="number" name="genderBreakdown.seniorCitizens" value={current.genderBreakdown?.seniorCitizens || ''} onChange={e => setCurrent({...current, genderBreakdown: {...current.genderBreakdown, seniorCitizens: e.target.value}})} /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Staff Involved</Form.Label><Form.Control type="number" name="staffInvolved" value={current.staffInvolved || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>External Agencies</Form.Label><Form.Control name="externalAgencies" value={current.externalAgencies || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" name="description" value={current.description || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Services Provided (comma separated)</Form.Label><Form.Control name="servicesProvided" value={current.servicesProvided?.join(',') || ''} onChange={e => setCurrent({...current, servicesProvided: e.target.value.split(',')})} /></Form.Group>
            <Form.Group><Form.Label>Screenings Done (comma separated)</Form.Label><Form.Control name="screeningsDone" value={current.screeningsDone?.join(',') || ''} onChange={e => setCurrent({...current, screeningsDone: e.target.value.split(',')})} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Medicines Distributed" name="medicinesDistributed" checked={current.medicinesDistributed || false} onChange={e => setCurrent({...current, medicinesDistributed: e.target.checked})} /></Form.Group>
            <Form.Group><Form.Label>IEC Materials Used (JSON)</Form.Label><Form.Control as="textarea" name="iecMaterialsUsed" value={JSON.stringify(current.iecMaterialsUsed) || ''} onChange={e => setCurrent({...current, iecMaterialsUsed: JSON.parse(e.target.value)})} placeholder='{"posters":true,"banners":false}' /></Form.Group>
            <Form.Group><Form.Label>Photos (URLs, comma separated)</Form.Label><Form.Control name="photos" value={current.photos?.join(',') || ''} onChange={e => setCurrent({...current, photos: e.target.value.split(',')})} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Programme;

