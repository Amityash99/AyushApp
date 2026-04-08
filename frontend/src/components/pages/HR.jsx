import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

const HR = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await API.get('/hr');
      setItems(res.data);
    } catch (err) { console.error(err); }
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
      if (editingId) await API.put(`/hr/${editingId}`, current);
      else await API.post('/hr', current);
      fetchItems();
      handleClose();
    } catch (err) { console.error(err); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/hr/${id}`); fetchItems(); } catch (err) { console.error(err); }
    }
  };
  const handleVerify = async (id, status, reason) => {
    try {
      await API.put(`/hr/${id}/verify`, { status, rejectionReason: reason });
      fetchItems();
    } catch (err) { console.error(err); }
  };
  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Staff HR</h2>
        {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Staff</Button>}
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr><th>Employee ID</th><th>Name</th><th>Designation</th><th>Cadre</th><th>Verification</th><th>Actions</th> </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td>{item.employeeId}</td><td>{item.name}</td><td>{item.designation}</td><td>{item.cadre}</td>
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

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Staff' : 'Add Staff'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col><Form.Group><Form.Label>Employee ID</Form.Label><Form.Control name="employeeId" value={current.employeeId || ''} onChange={handleChange} required /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Name</Form.Label><Form.Control name="name" value={current.name || ''} onChange={handleChange} required /></Form.Group></Col>
            </Row>
            <Row>
              <Col><Form.Group><Form.Label>Father's Name</Form.Label><Form.Control name="fatherName" value={current.fatherName || ''} onChange={handleChange} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Gender</Form.Label><Form.Select name="gender" value={current.gender || ''} onChange={handleChange}><option>Male</option><option>Female</option><option>Other</option></Form.Select></Form.Group></Col>
              <Col><Form.Group><Form.Label>Date of Birth</Form.Label><Form.Control type="date" name="dateOfBirth" value={current.dateOfBirth?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Row>
              <Col><Form.Group><Form.Label>Contact Number</Form.Label><Form.Control name="contactNumber" value={current.contactNumber || ''} onChange={handleChange} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={current.email || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Address</Form.Label><Form.Control as="textarea" name="address" value={current.address || ''} onChange={handleChange} /></Form.Group>
            <Row>
              <Col><Form.Group><Form.Label>Designation</Form.Label><Form.Control name="designation" value={current.designation || ''} onChange={handleChange} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Cadre</Form.Label><Form.Select name="cadre" value={current.cadre || ''} onChange={handleChange}><option>Ayurveda</option><option>Homoeopathy</option><option>Unani</option><option>Yoga</option><option>Naturopathy</option></Form.Select></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Current Posting</Form.Label><Form.Control name="currentPosting" value={current.currentPosting || ''} onChange={handleChange} /></Form.Group>
            <Row>
              <Col><Form.Group><Form.Label>Posting Type</Form.Label><Form.Select name="postingType" value={current.postingType || ''} onChange={handleChange}><option>Permanent</option><option>Temporary</option><option>Work-arrangement</option><option>On-deputation</option></Form.Select></Form.Group></Col>
              <Col><Form.Group><Form.Label>Recruitment Source</Form.Label><Form.Control name="recruitmentSource" value={current.recruitmentSource || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Row>
              <Col><Form.Group><Form.Label>Date of Joining Service</Form.Label><Form.Control type="date" name="dateOfJoiningService" value={current.dateOfJoiningService?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Date of Joining Present Office</Form.Label><Form.Control type="date" name="dateOfJoiningPresentOffice" value={current.dateOfJoiningPresentOffice?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Service Status</Form.Label><Form.Select name="serviceStatus" value={current.serviceStatus || ''} onChange={handleChange}><option>Regular</option><option>Pay minus Scheme</option><option>Retired</option><option>Ex Serviceman</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Qualifications (JSON)</Form.Label><Form.Control as="textarea" name="qualifications" value={JSON.stringify(current.qualifications) || ''} onChange={e => setCurrent({...current, qualifications: JSON.parse(e.target.value)})} /></Form.Group>
            <Form.Group><Form.Label>Trainings (JSON)</Form.Label><Form.Control as="textarea" name="trainings" value={JSON.stringify(current.trainings) || ''} onChange={e => setCurrent({...current, trainings: JSON.parse(e.target.value)})} /></Form.Group>
            <Form.Group><Form.Label>Documents (photo URL)</Form.Label><Form.Control name="documents.photo" value={current.documents?.photo || ''} onChange={e => setCurrent({...current, documents: {...current.documents, photo: e.target.value}})} /></Form.Group>
            <Form.Group><Form.Label>Joining Letter (URL)</Form.Label><Form.Control name="documents.joiningLetter" value={current.documents?.joiningLetter || ''} onChange={e => setCurrent({...current, documents: {...current.documents, joiningLetter: e.target.value}})} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HR;