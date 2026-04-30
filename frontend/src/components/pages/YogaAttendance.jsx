import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import API from '../services/api';

const YogaAttendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({ date: '', present: false, sessionsConducted: 0, overtime: 0, reasonForAbsence: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      const res = await API.get('/yoga-instructor-attendance');
      setAttendances(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
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
      if (editingId) await API.put(`/yoga-instructor-attendance/${editingId}`, current);
      else await API.post('/yoga-instructor-attendance', current);
      fetchAttendance();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>My Attendance</h2>
        <Button variant="primary" onClick={() => handleShow()}>Mark Attendance</Button>
      </div>
      {attendances.length === 0 ? (
        <Alert variant="info">No attendance records found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr><th>Date</th><th>Present</th><th>Sessions Conducted</th><th>Overtime (min)</th><th>Reason for Absence</th><th>Actions</th> </tr>
          </thead>
          <tbody>
            {attendances.map(a => (
              <tr key={a._id}>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.present ? 'Yes' : 'No'}</td>
                <td>{a.sessionsConducted}</td>
                <td>{a.overtime}</td>
                <td>{a.reasonForAbsence || '-'}</td>
                <td><Button size="sm" variant="info" onClick={() => handleShow(a)}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Attendance' : 'Mark Attendance'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Date</Form.Label><Form.Control type="date" name="date" value={current.date || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Check type="checkbox" label="Present" name="present" checked={current.present || false} onChange={e => setCurrent({...current, present: e.target.checked})} /></Form.Group>
            {!current.present && (
              <Form.Group className="mb-3"><Form.Label>Reason for Absence</Form.Label><Form.Control as="textarea" name="reasonForAbsence" value={current.reasonForAbsence || ''} onChange={handleChange} /></Form.Group>
            )}
            <Form.Group className="mb-3"><Form.Label>Sessions Conducted</Form.Label><Form.Control type="number" name="sessionsConducted" value={current.sessionsConducted || 0} onChange={handleChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Overtime (minutes)</Form.Label><Form.Control type="number" name="overtime" value={current.overtime || 0} onChange={handleChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default YogaAttendance;
