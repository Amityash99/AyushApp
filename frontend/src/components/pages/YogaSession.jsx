import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

const YogaSession = () => {
  const [sessions, setSessions] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({
    participants: {},
    activities: [],
    sessionTime: ''          // ✅ Required field default
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [geoLocation, setGeoLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState('');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchSessions();
    fetchInstructors();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await API.get('/yoga-session');
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await API.get('/yoga-instructor');
      setInstructors(res.data);
    } catch (err) {
      console.error(err);
    }
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
    setCurrent({ participants: {}, activities: [], sessionTime: '' });
    setEditingId(null);
    setSelectedPhotos([]);
    setGeoLocation({ lat: null, lng: null });
    setLocationError('');
  };

  const handleShow = (session = null) => {
    if (session) {
      setCurrent({
        ...session,
        participants: session.participants || {},
        activities: session.activities || [],
        sessionTime: session.sessionTime || ''
      });
      setEditingId(session._id);
    } else {
      setCurrent({ participants: {}, activities: [], sessionTime: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrent((prev) => ({ ...prev, [name]: value }));
  };

  const handleActivityCheck = (activity) => {
    const updated = current.activities.includes(activity)
      ? current.activities.filter((a) => a !== activity)
      : [...current.activities, activity];
    setCurrent({ ...current, activities: updated });
  };

  const handleFileChange = (e) => {
    setSelectedPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to send
    const dataToSend = {
      ...current,
      geoLocation: geoLocation.lat ? geoLocation : current.geoLocation
    };

    // Validate required fields
    if (!dataToSend.sessionDate) {
      alert('Session date is required');
      return;
    }
    if (!dataToSend.sessionTime) {
      alert('Session time is required');
      return;
    }
    if (!dataToSend.instructorId) {
      alert('Instructor is required');
      return;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(dataToSend));
    selectedPhotos.forEach((photo) => formData.append('photos', photo));

    try {
      if (editingId) {
        await API.put(`/yoga-session/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.post('/yoga-session', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchSessions();
      handleClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this session?')) {
      try {
        await API.delete(`/yoga-session/${id}`);
        fetchSessions();
      } catch (err) {
        console.error(err);
        alert('Delete failed');
      }
    }
  };

  const handleVerify = async (id, status, reason = '') => {
    try {
      await API.put(`/yoga-session/${id}/verify`, { status, rejectionReason: reason });
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Verification failed');
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
        <h2>Yoga Sessions</h2>
        <div>
          <Button variant="secondary" onClick={fetchSessions} className="me-2">
            Refresh
          </Button>
          {role === 'aam_center' && (
            <Button variant="primary" onClick={() => handleShow()}>
              Add Session
            </Button>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="alert alert-info">No yoga sessions found. Click "Add Session" to create one.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Instructor</th>
              <th>Type</th>
              <th>Participants</th>
              <th>Activities</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s._id}>
                <td>{new Date(s.sessionDate).toLocaleDateString()}</td>
                <td>{s.sessionTime}</td>
                <td>{s.instructorId?.name}</td>
                <td>{s.sessionType}</td>
                <td>
                  {(s.participants?.male || 0) +
                    (s.participants?.female || 0) +
                    (s.participants?.children || 0) +
                    (s.participants?.other || 0)}
                </td>
                <td>{s.activities?.join(', ')}</td>
                <td>{getBadge(s.verificationStatus)}</td>
                <td>
                  {role === 'aam_center' && s.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="info" onClick={() => handleShow(s)}>
                        Edit
                      </Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(s._id)}>
                        Del
                      </Button>
                    </>
                  )}
                  {role === 'district' && s.verificationStatus === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleVerify(s._id, 'approved')}
                      >
                        Approve
                      </Button>{' '}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) handleVerify(s._id, 'rejected', reason);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleClose} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Yoga Session' : 'Add Yoga Session'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Instructor *</Form.Label>
              <Form.Select
                name="instructorId"
                value={current.instructorId || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select Instructor</option>
                {instructors.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Session Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="sessionDate"
                    value={current.sessionDate?.slice(0, 10) || ''}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Session Time *</Form.Label>
                  <Form.Select
                    name="sessionTime"
                    value={current.sessionTime || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Time</option>
                    <option>Morning</option>
                    <option>Evening</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Session Type</Form.Label>
                  <Form.Select name="sessionType" value={current.sessionType || ''} onChange={handleChange}>
                    <option>General</option>
                    <option>NCD</option>
                    <option>Pregnancy</option>
                    <option>Children</option>
                    <option>Elderly</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Venue</Form.Label>
                  <Form.Select name="venue" value={current.venue || ''} onChange={handleChange}>
                    <option>Indoor</option>
                    <option>Outdoor</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="durationMinutes"
                    value={current.durationMinutes || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Expected Participants</Form.Label>
                  <Form.Control
                    type="number"
                    name="expectedParticipants"
                    value={current.expectedParticipants || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6>Actual Participants</h6>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Male</Form.Label>
                  <Form.Control
                    type="number"
                    name="participants.male"
                    value={current.participants?.male || 0}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        participants: { ...current.participants, male: e.target.value }
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Female</Form.Label>
                  <Form.Control
                    type="number"
                    name="participants.female"
                    value={current.participants?.female || 0}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        participants: { ...current.participants, female: e.target.value }
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Children</Form.Label>
                  <Form.Control
                    type="number"
                    name="participants.children"
                    value={current.participants?.children || 0}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        participants: { ...current.participants, children: e.target.value }
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Other</Form.Label>
                  <Form.Control
                    type="number"
                    name="participants.other"
                    value={current.participants?.other || 0}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        participants: { ...current.participants, other: e.target.value }
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Instructor Present"
                name="instructorPresent"
                checked={current.instructorPresent || false}
                onChange={(e) => setCurrent({ ...current, instructorPresent: e.target.checked })}
              />
            </Form.Group>

            <h6>Activities Conducted</h6>
            {['Pranayama', 'Asanas', 'Surya Namaskar', 'Meditation', 'Health talk'].map((act) => (
              <Form.Check
                key={act}
                type="checkbox"
                label={act}
                checked={current.activities?.includes(act) || false}
                onChange={() => handleActivityCheck(act)}
              />
            ))}

            <hr />
            <h6>Photos (upload up to 4)</h6>
            <Form.Group className="mb-3">
              <Form.Control type="file" multiple accept="image/*" onChange={handleFileChange} />
            </Form.Group>

            <h6>Geo‑tagging</h6>
            <Button variant="secondary" type="button" onClick={getCurrentLocation} className="mb-2">
              Get Current Location
            </Button>
            {geoLocation.lat && (
              <p>
                Location: {geoLocation.lat.toFixed(6)}, {geoLocation.lng.toFixed(6)}
              </p>
            )}
            {locationError && <p className="text-danger">{locationError}</p>}

            <Form.Group className="mb-3">
              <Form.Label>Comments / Issues</Form.Label>
              <Form.Control as="textarea" name="comments" value={current.comments || ''} onChange={handleChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Session
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default YogaSession;