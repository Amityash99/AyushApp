import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

const HerbalGarden = () => {
  const [gardens, setGardens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({ location: {}, species: [] });
  const [editingId, setEditingId] = useState(null);
  const [selectedLayoutPhoto, setSelectedLayoutPhoto] = useState(null);
  const [selectedRegistrationPhoto, setSelectedRegistrationPhoto] = useState(null);
  const [geoLocation, setGeoLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchGardens(); }, []);

  const fetchGardens = async () => {
    try {
      const res = await API.get('/garden');
      setGardens(res.data);
    } catch (err) { console.error(err); }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationError('');
        },
        () => setLocationError('Unable to retrieve location')
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrent({ location: {}, species: [] });
    setEditingId(null);
    setSelectedLayoutPhoto(null);
    setSelectedRegistrationPhoto(null);
    setGeoLocation({ lat: null, lng: null });
    setLocationError('');
  };

  const handleShow = (garden = null) => {
    if (garden) {
      setCurrent(garden);
      setEditingId(garden._id);
    } else {
      setCurrent({ location: {}, species: [] });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    setCurrent({ ...current, [e.target.name]: e.target.value });
  };

  const handleSpeciesChange = (index, field, value) => {
    const newSpecies = [...current.species];
    newSpecies[index][field] = value;
    setCurrent({ ...current, species: newSpecies });
  };

  const addSpecies = () => {
    setCurrent({
      ...current,
      species: [
        ...current.species,
        {
          botanicalName: '',
          commonName: '',
          count: 0,
          plantationDate: '',
          source: '',
          maturityPeriod: '',
          seasonalRequirements: ''
        }
      ]
    });
  };

  const removeSpecies = (index) => {
    const newSpecies = current.species.filter((_, i) => i !== index);
    setCurrent({ ...current, species: newSpecies });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    const dataToSend = {
      ...current,
      location: geoLocation.lat ? geoLocation : current.location
    };
    formData.append('data', JSON.stringify(dataToSend));
    if (selectedLayoutPhoto) formData.append('layoutPhoto', selectedLayoutPhoto);
    if (selectedRegistrationPhoto) formData.append('registrationPhoto', selectedRegistrationPhoto);

    try {
      if (editingId) {
        await API.put(`/garden/${editingId}`, dataToSend);
      } else {
        await API.post('/garden', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      await fetchGardens();
      handleClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this garden?')) {
      try {
        await API.delete(`/garden/${id}`);
        fetchGardens();
      } catch (err) { console.error(err); alert('Delete failed'); }
    }
  };

  const handleVerify = async (id, status, reason = '') => {
    try {
      await API.put(`/garden/${id}/verify`, { status, rejectionReason: reason });
      fetchGardens();
    } catch (err) { console.error(err); alert('Verification failed'); }
  };

  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Herbal Gardens</h2>
        <div>
          <Button variant="secondary" onClick={fetchGardens} className="me-2">Refresh</Button>
          {(role === 'aam_center' || role === 'district') && (
            <Button variant="primary" onClick={() => handleShow()}>Add Garden</Button>
          )}
        </div>
      </div>

      {gardens.length === 0 ? (
        <div className="alert alert-info">No gardens found.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Facility Name</th>
              <th>Type</th>
              <th>Area (sqm)</th>
              <th>Established</th>
              <th>Species Count</th>
              {role === 'district' && <th>District</th>}
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gardens.map((garden) => (
              <tr key={garden._id}>
                <td>{garden.facilityName}</td>
                <td>{garden.gardenType}</td>
                <td>{garden.area}</td>
                <td>{garden.yearOfEstablishment}</td>
                <td>{garden.species?.length || 0}</td>
                {role === 'district' && <td>{garden.district || garden.centerId}</td>}
                <td>{getBadge(garden.verificationStatus)}</td>
                <td>
                  {(role === 'aam_center' || role === 'district') && garden.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="info" onClick={() => handleShow(garden)}>Edit</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(garden._id)}>Del</Button>
                    </>
                  )}
                  {role === 'district' && garden.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => handleVerify(garden._id, 'approved')}>Approve</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) handleVerify(garden._id, 'rejected', reason);
                      }}>Reject</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal – same as before (kept from previous answers) */}
      <Modal show={showModal} onHide={handleClose} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Garden' : 'Add New Garden'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Facility Name *</Form.Label>
              <Form.Control name="facilityName" value={current.facilityName || ''} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Garden Type *</Form.Label>
              <Form.Select name="gardenType" value={current.gardenType || ''} onChange={handleChange} required>
                <option value="">Select Type</option>
                <option>Mini</option>
                <option>Medium</option>
                <option>Large</option>
              </Form.Select>
            </Form.Group>
            <h6>Location (Geo‑tagging)</h6>
            <Button variant="secondary" type="button" onClick={getCurrentLocation} className="mb-2">Get Current Location</Button>
            {geoLocation.lat && <p>Location: {geoLocation.lat.toFixed(6)}, {geoLocation.lng.toFixed(6)}</p>}
            {locationError && <p className="text-danger">{locationError}</p>}
            <Row className="mb-3">
              <Col><Form.Group><Form.Label>Area (sqm)</Form.Label><Form.Control type="number" name="area" value={current.area || ''} onChange={handleChange} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Year of Establishment</Form.Label><Form.Control type="number" name="yearOfEstablishment" value={current.yearOfEstablishment || ''} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Layout Photo (upload)</Form.Label><Form.Control type="file" accept="image/*" onChange={(e) => setSelectedLayoutPhoto(e.target.files[0])} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Registration Photo (upload)</Form.Label><Form.Control type="file" accept="image/*" onChange={(e) => setSelectedRegistrationPhoto(e.target.files[0])} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Incharge Name</Form.Label><Form.Control name="inchargeName" value={current.inchargeName || ''} onChange={handleChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Incharge Contact</Form.Label><Form.Control name="inchargeContact" value={current.inchargeContact || ''} onChange={handleChange} /></Form.Group>
            <hr /><h6>Plant Species</h6>
            {current.species.map((sp, idx) => (
              <div key={idx} className="border p-3 mb-3">
                <Row><Col><Form.Group><Form.Label>Botanical Name</Form.Label><Form.Control value={sp.botanicalName} onChange={e => handleSpeciesChange(idx, 'botanicalName', e.target.value)} /></Form.Group></Col>
                <Col><Form.Group><Form.Label>Common Name</Form.Label><Form.Control value={sp.commonName} onChange={e => handleSpeciesChange(idx, 'commonName', e.target.value)} /></Form.Group></Col></Row>
                <Row><Col><Form.Group><Form.Label>Count</Form.Label><Form.Control type="number" value={sp.count} onChange={e => handleSpeciesChange(idx, 'count', e.target.value)} /></Form.Group></Col>
                <Col><Form.Group><Form.Label>Plantation Date</Form.Label><Form.Control type="date" value={sp.plantationDate?.slice(0,10) || ''} onChange={e => handleSpeciesChange(idx, 'plantationDate', e.target.value)} /></Form.Group></Col></Row>
                <Form.Group><Form.Label>Source of Saplings</Form.Label><Form.Control value={sp.source} onChange={e => handleSpeciesChange(idx, 'source', e.target.value)} /></Form.Group>
                <Form.Group><Form.Label>Expected Maturity Period</Form.Label><Form.Control value={sp.maturityPeriod} onChange={e => handleSpeciesChange(idx, 'maturityPeriod', e.target.value)} /></Form.Group>
                <Form.Group><Form.Label>Seasonal Requirements</Form.Label><Form.Control value={sp.seasonalRequirements} onChange={e => handleSpeciesChange(idx, 'seasonalRequirements', e.target.value)} /></Form.Group>
                <Button variant="danger" size="sm" onClick={() => removeSpecies(idx)}>Remove Species</Button>
              </div>
            ))}
            <Button variant="secondary" type="button" onClick={addSpecies}>Add Species</Button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Garden'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HerbalGarden;
