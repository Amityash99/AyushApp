import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import API from '../services/api';

const NAMReporting = () => {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({ data: {} });
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get('/reporting');
      setReports(res.data);
    } catch (err) { console.error(err); }
  };

  const handleClose = () => { setShowModal(false); setCurrent({ data: {} }); setEditingId(null); };
  const handleShow = (rep = null) => {
    if (rep) { setCurrent(rep); setEditingId(rep._id); }
    else { setCurrent({ data: {} }); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleDataChange = (e) => {
    setCurrent({ ...current, data: { ...current.data, [e.target.name]: e.target.value } });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/reporting/${editingId}`, current);
      else await API.post('/reporting', current);
      fetchReports();
      handleClose();
    } catch (err) { console.error(err); alert(err.response?.data?.message || 'Submission failed'); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try { await API.delete(`/reporting/${id}`); fetchReports(); } catch (err) { console.error(err); }
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
        <h2>NAM Reporting</h2>
        <div>
          <Button variant="secondary" onClick={fetchReports} className="me-2">Refresh</Button>
          {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Report</Button>}
        </div>
      </div>
      {reports.length === 0 ? (
        <div className="alert alert-info">No reports found.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr><th>Form Name</th><th>Center ID</th><th>Submitted At</th><th>Status</th><th>Actions</th> </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r._id}>
                <td>{r.formName}</td>
                <td>{r.centerId}</td>
                <td>{new Date(r.submittedAt).toLocaleString()}</td>
                <td>{getBadge(r.status)}</td>
                <td>
                  {role === 'aam_center' && r.status === 'pending' && (
                    <>
                      <Button size="sm" variant="info" onClick={() => handleShow(r)}>Edit</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(r._id)}>Del</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Report' : 'Add Report'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Form Name *</Form.Label>
              <Form.Control name="formName" value={current.formName || ''} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Center ID *</Form.Label>
              <Form.Control name="centerId" value={current.centerId || ''} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>District</Form.Label>
              <Form.Control name="district" value={current.district || ''} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data (JSON) *</Form.Label>
              <Form.Control as="textarea" rows={5} name="data" value={JSON.stringify(current.data) || ''} onChange={e => setCurrent({...current, data: JSON.parse(e.target.value)})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deadline</Form.Label>
              <Form.Control type="date" name="deadline" value={current.deadline?.slice(0,10) || ''} onChange={handleChange} />
            </Form.Group>
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

export default NAMReporting;