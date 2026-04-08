import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

const YogaInstructor = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const res = await API.get('/yoga-instructor'); setItems(res.data); } catch (err) { console.error(err); }
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
      if (editingId) await API.put(`/yoga-instructor/${editingId}`, current);
      else await API.post('/yoga-instructor', current);
      fetchItems();
      handleClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/yoga-instructor/${id}`); fetchItems(); } catch (err) { console.error(err); }
    }
  };
  const handleVerify = async (id, status, reason) => {
    try { await API.put(`/yoga-instructor/${id}/verify`, { status, rejectionReason: reason }); fetchItems(); } catch (err) { console.error(err); }
  };
  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Yoga Instructors</h2>
        {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Instructor</Button>}
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr><th>Name</th><th>Qualification</th><th>Assigned Center</th><th>Status</th><th>Availability</th><th>Verification</th><th>Actions</th> </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.qualification}</td>
              <td>{item.assignedCenter}</td>
              <td>{item.workingStatus}</td>
              <td>{item.availabilityStatus}</td>
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
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Instructor' : 'Add Instructor'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col><Form.Group><Form.Label>Name *</Form.Label><Form.Control name="name" value={current.name || ''} onChange={handleChange} required /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Father's Name</Form.Label><Form.Control name="fatherName" value={current.fatherName || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Row>
              <Col><Form.Group><Form.Label>Gender</Form.Label><Form.Select name="gender" value={current.gender || ''} onChange={handleChange}><option>Male</option><option>Female</option><option>Other</option></Form.Select></Form.Group></Col>
              <Col><Form.Group><Form.Label>Age</Form.Label><Form.Control type="number" name="age" value={current.age || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Address</Form.Label><Form.Control as="textarea" name="address" value={current.address || ''} onChange={handleChange} /></Form.Group>
            <Row>
              <Col><Form.Group><Form.Label>Mobile</Form.Label><Form.Control name="mobile" value={current.mobile || ''} onChange={handleChange} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={current.email || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Qualification</Form.Label><Form.Control name="qualification" value={current.qualification || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Certification Body</Form.Label><Form.Control name="certificationBody" value={current.certificationBody || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Working Status</Form.Label><Form.Select name="workingStatus" value={current.workingStatus || ''} onChange={handleChange}>
              <option>Full-time</option><option>Part-time</option><option>Outsourced</option><option>Honorarium</option>
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Assigned Center</Form.Label><Form.Control name="assignedCenter" value={current.assignedCenter || ''} onChange={handleChange} /></Form.Group>
            <Row>
              <Col><Form.Group><Form.Label>Date of Joining</Form.Label><Form.Control type="date" name="dateOfJoining" value={current.dateOfJoining?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Contract Validity</Form.Label><Form.Control type="date" name="contractValidity" value={current.contractValidity?.slice(0,10) || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <hr />
            <h6>Documents (URLs)</h6>
            <Form.Group><Form.Label>ID Proof URL</Form.Label><Form.Control name="documents.idProof" value={current.documents?.idProof || ''} onChange={e => setCurrent({...current, documents: {...current.documents, idProof: e.target.value}})} /></Form.Group>
            <Form.Group><Form.Label>Qualification Certificates URLs (comma separated)</Form.Label><Form.Control name="documents.qualificationCertificates" value={current.documents?.qualificationCertificates?.join(',') || ''} onChange={e => setCurrent({...current, documents: {...current.documents, qualificationCertificates: e.target.value.split(',')}})} /></Form.Group>
            <Form.Group><Form.Label>Contract Agreement URL</Form.Label><Form.Control name="documents.contractAgreement" value={current.documents?.contractAgreement || ''} onChange={e => setCurrent({...current, documents: {...current.documents, contractAgreement: e.target.value}})} /></Form.Group>
            <hr />
            <h6>Bank Details (Optional)</h6>
            <Form.Group><Form.Label>Account Number</Form.Label><Form.Control name="bankDetails.accountNumber" value={current.bankDetails?.accountNumber || ''} onChange={e => setCurrent({...current, bankDetails: {...current.bankDetails, accountNumber: e.target.value}})} /></Form.Group>
            <Form.Group><Form.Label>IFSC Code</Form.Label><Form.Control name="bankDetails.ifscCode" value={current.bankDetails?.ifscCode || ''} onChange={e => setCurrent({...current, bankDetails: {...current.bankDetails, ifscCode: e.target.value}})} /></Form.Group>
            <Form.Group><Form.Label>Bank Name</Form.Label><Form.Control name="bankDetails.bankName" value={current.bankDetails?.bankName || ''} onChange={e => setCurrent({...current, bankDetails: {...current.bankDetails, bankName: e.target.value}})} /></Form.Group>
            <Form.Group><Form.Label>Account Holder Name</Form.Label><Form.Control name="bankDetails.accountHolderName" value={current.bankDetails?.accountHolderName || ''} onChange={e => setCurrent({...current, bankDetails: {...current.bankDetails, accountHolderName: e.target.value}})} /></Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default YogaInstructor;