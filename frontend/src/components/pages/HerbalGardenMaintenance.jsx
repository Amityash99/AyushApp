
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import API from '../services/api';

const HerbalGardenMaintenance = () => {
  const [records, setRecords] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [geoLocation, setGeoLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState('');
  const role = localStorage.getItem('role');

  useEffect(() => { fetchRecords(); fetchGardens(); }, []);

  const fetchRecords = async () => {
    try { const res = await API.get('/garden-maintenance'); setRecords(res.data); } catch (err) { console.error(err); }
  };
  const fetchGardens = async () => {
    try { const res = await API.get('/garden'); setGardens(res.data); } catch (err) { console.error(err); }
  };
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setGeoLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); setLocationError(''); },
        () => setLocationError('Unable to retrieve location')
      );
    } else { setLocationError('Geolocation not supported'); }
  };
  const handleClose = () => { setShowModal(false); setCurrent({}); setEditingId(null); setSelectedPhotos([]); setGeoLocation({ lat: null, lng: null }); setLocationError(''); };
  const handleShow = (rec = null) => {
    if (rec) { setCurrent(rec); setEditingId(rec._id); } else { setCurrent({}); setEditingId(null); }
    setShowModal(true);
  };
  const handleChange = (e) => { setCurrent({ ...current, [e.target.name]: e.target.value }); };
  const handleFileChange = (e) => { setSelectedPhotos(Array.from(e.target.files)); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('data', JSON.stringify({ ...current, geoLocation: geoLocation.lat ? geoLocation : current.geoLocation }));
    selectedPhotos.forEach(photo => formData.append('photos', photo));
    try {
      if (editingId) {
        await API.put(`/garden-maintenance/${editingId}`, current);
      } else {
        await API.post('/garden-maintenance', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      fetchRecords();
      handleClose();
    } catch (err) { console.error(err); alert(err.response?.data?.message || 'Submission failed'); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) { try { await API.delete(`/garden-maintenance/${id}`); fetchRecords(); } catch (err) { console.error(err); } }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Garden Maintenance Records</h2>
        <div>
          <Button variant="secondary" onClick={fetchRecords} className="me-2">Refresh</Button>
          {role === 'aam_center' && <Button variant="primary" onClick={() => handleShow()}>Add Record</Button>}
        </div>
      </div>
      {records.length === 0 ? (
        <div className="alert alert-info">No maintenance records found. Click "Add Record" to create one.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead><tr><th>Garden</th><th>Month/Year</th><th>Watering</th><th>Cleanliness</th><th>Harvesting</th><th>Actions</th></tr></thead>
          <tbody>
            {records.map(r => (
              <tr key={r._id}>
                <td>{r.gardenId?.facilityName}</td>
                <td>{new Date(r.monthYear).toLocaleDateString()}</td>
                <td>{r.wateringFrequency}</td>
                <td>{r.cleanlinessStatus}</td>
                <td>{r.harvestingDone ? 'Yes' : 'No'}</td>
                <td><Button size="sm" variant="info" onClick={() => handleShow(r)}>Edit</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(r._id)}>Del</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit Record' : 'Add Record'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group><Form.Label>Garden</Form.Label><Form.Select name="gardenId" value={current.gardenId || ''} onChange={handleChange} required>
              <option value="">Select Garden</option>{gardens.map(g => <option key={g._id} value={g._id}>{g.facilityName}</option>)}
            </Form.Select></Form.Group>
            <Form.Group><Form.Label>Month/Year</Form.Label><Form.Control type="month" name="monthYear" value={current.monthYear?.slice(0,7) || ''} onChange={handleChange} required /></Form.Group>
            <Form.Group><Form.Label>Watering Frequency</Form.Label><Form.Control name="wateringFrequency" value={current.wateringFrequency || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Manure Used</Form.Label><Form.Control name="manureUsed" value={current.manureUsed || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Pesticides Used</Form.Label><Form.Control name="pesticidesUsed" value={current.pesticidesUsed || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Weeding Done" name="weedingDone" checked={current.weedingDone || false} onChange={e => setCurrent({...current, weedingDone: e.target.checked})} /></Form.Group>
            <Form.Group><Form.Label>Soil Maintenance</Form.Label><Form.Control name="soilMaintenance" value={current.soilMaintenance || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Saplings Replaced</Form.Label><Form.Control type="number" name="saplingsReplaced" value={current.saplingsReplaced || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Cleanliness Status</Form.Label><Form.Control name="cleanlinessStatus" value={current.cleanlinessStatus || ''} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Label>Issues</Form.Label><Form.Control as="textarea" name="issues" value={current.issues || ''} onChange={handleChange} /></Form.Group>
            <h6>Photos (Upload up to 5)</h6><Form.Group><Form.Control type="file" multiple accept="image/*" onChange={handleFileChange} /></Form.Group>
            <h6>Geo‑tagging</h6><Button variant="secondary" type="button" onClick={getCurrentLocation} className="mb-2">Get Current Location</Button>
            {geoLocation.lat && <p>Location: {geoLocation.lat}, {geoLocation.lng}</p>}{locationError && <p className="text-danger">{locationError}</p>}
            <hr /><h6>Harvesting Details</h6>
            <Form.Group><Form.Check type="checkbox" label="Harvesting Done" name="harvestingDone" checked={current.harvestingDone || false} onChange={e => setCurrent({...current, harvestingDone: e.target.checked})} /></Form.Group>
            {current.harvestingDone && (<>
              <Form.Group><Form.Label>Harvest Date</Form.Label><Form.Control type="date" name="harvestDate" value={current.harvestDate?.slice(0,10) || ''} onChange={handleChange} /></Form.Group>
              <Form.Group><Form.Label>Harvest Species</Form.Label><Form.Control name="harvestSpecies" value={current.harvestSpecies || ''} onChange={handleChange} /></Form.Group>
              <Form.Group><Form.Label>Harvest Quantity</Form.Label><Form.Control type="number" name="harvestQuantity" value={current.harvestQuantity || ''} onChange={handleChange} /></Form.Group>
              <Form.Group><Form.Label>Utilization</Form.Label><Form.Control as="textarea" name="utilization" value={current.utilization || ''} onChange={handleChange} /></Form.Group>
            </>)}
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="primary" type="submit">Save Record</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HerbalGardenMaintenance;