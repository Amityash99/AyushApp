
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import API from '../services/api';

const Movement = () => {
  const [movements, setMovements] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchMovements(); fetchStaff(); }, []);

  const fetchMovements = async () => {
    try { const res = await API.get('/movement'); setMovements(res.data); } catch (err) { console.error(err); }
  };
  const fetchStaff = async () => {
    try { const res = await API.get('/hr'); setStaffList(res.data); } catch (err) { console.error(err); }
  };
  const handleClose = () => { setShowModal(false); setCurrent({}); setEditingId(null); };
  const handleShow = (mov = null) => {
    if (mov) { setCurrent(mov); setEditingId(mov._id); } else { setCurrent({}); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/movement/${editingId}`, current);
      else await API.post('/movement', current);
      fetchMovements();
      handleClose();
    } catch (err) { console.error(err); alert(err.response?.data?.message || 'Submission failed'); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/movement/${id}`); fetchMovements(); } catch (err) { console.error(err); }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Movement Register</h2>
        <div>
          <Button variant="secondary" onClick={fetchMovements} className="me-2">Refresh</Button>
          {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Movement</Button>}
        </div>
      </div>
      {movements.length === 0 ? (
        <div className="alert alert-info">No movement records found.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr><th>Staff</th><th>Date & Time</th><th>Destination</th><th>Reason</th><th>Official Invited</th><th>Actions</th> </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m._id}>
                <td>{m.staffId?.name}</td>
                <td>{new Date(m.dateTime).toLocaleString()}</td>
                <td>{m.destination}</td>
                <td>{m.reason}</td>
                <td>{m.officialInvited ? 'Yes' : 'No'}</td>
                <td>
                  {role === 'aam_center' && (
                    <>
                      <Button size="sm" variant="info" onClick={() => handleShow(m)}>Edit</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(m._id)}>Del</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Movement' : 'Add Movement'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group><Form.Label>Staff</Form.Label><Form.Select name="staffId" value={current.staffId || ''} onChange={handleChange} required>
              <option value="">Select Staff</option>
              {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Date & Time</Form.Label><Form.Control type="datetime-local" name="dateTime" value={current.dateTime?.slice(0,16) || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Destination</Form.Label><Form.Control name="destination" value={current.destination || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Reason</Form.Label><Form.Control as="textarea" name="reason" value={current.reason || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Official Invited" name="officialInvited" checked={current.officialInvited || false} onChange={e => setCurrent({...current, officialInvited: e.target.checked})} /></Form.Group>
            <Form.Group><Form.Label>Remarks</Form.Label><Form.Control as="textarea" name="remarks" value={current.remarks || ''} onChange={handleChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Movement;