import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import API from '../services/api';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchAttendances(); fetchStaff(); }, []);

  const fetchAttendances = async () => {
    try { const res = await API.get('/attendance'); setAttendances(res.data); } catch (err) { console.error(err); }
  };
  const fetchStaff = async () => {
    try { const res = await API.get('/hr'); setStaffList(res.data); } catch (err) { console.error(err); }
  };
  const handleClose = () => { setShowModal(false); setCurrent({}); setEditingId(null); };
  const handleShow = (att = null) => {
    if (att) { setCurrent(att); setEditingId(att._id); } else { setCurrent({}); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/attendance/${editingId}`, current);
      else await API.post('/attendance', current);
      fetchAttendances();
      handleClose();
    } catch (err) { console.error(err); alert(err.response?.data?.message || 'Submission failed'); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/attendance/${id}`); fetchAttendances(); } catch (err) { console.error(err); }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Attendance</h2>
        <div>
          <Button variant="secondary" onClick={fetchAttendances} className="me-2">Refresh</Button>
          {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Attendance</Button>}
        </div>
      </div>
      {attendances.length === 0 ? (
        <div className="alert alert-info">No attendance records found.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr><th>Staff</th><th>Date</th><th>Present</th><th>Leave Type</th><th>Actions</th> </tr>
          </thead>
          <tbody>
            {attendances.map(a => (
              <tr key={a._id}>
                <td>{a.staffId?.name}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.present ? 'Present' : (a.onLeave ? 'On Leave' : 'Absent')}</td>
                <td>{a.leaveType || '-'}</td>
                <td>
                  {role === 'aam_center' && (
                    <>
                      <Button size="sm" variant="info" onClick={() => handleShow(a)}>Edit</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(a._id)}>Del</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Attendance' : 'Add Attendance'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group><Form.Label>Staff</Form.Label><Form.Select name="staffId" value={current.staffId || ''} onChange={handleChange} required>
              <option value="">Select Staff</option>
              {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Date</Form.Label><Form.Control type="date" name="date" value={current.date?.slice(0,10) || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Present" name="present" checked={current.present || false} onChange={e => setCurrent({...current, present: e.target.checked, onLeave: false})} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="On Leave" name="onLeave" checked={current.onLeave || false} onChange={e => setCurrent({...current, onLeave: e.target.checked, present: false})} /></Form.Group>
            {current.onLeave && (
              <Form.Group><Form.Label>Leave Type</Form.Label><Form.Select name="leaveType" value={current.leaveType || ''} onChange={handleChange}><option>EL</option><option>CL</option><option>ML</option><option>Other</option></Form.Select></Form.Group>
            )}
            <Form.Group><Form.Label>Remarks</Form.Label><Form.Control as="textarea" name="remarks" value={current.remarks || ''} onChange={handleChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Attendance;