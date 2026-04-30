import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import API from '../services/api';

const Inspection = () => {
  const [inspections, setInspections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState({
    centerId: '',
    district: '',
    visitedBy: '',
    inspectionDate: '',
    infrastructure: {},
    humanResources: {},
    serviceDelivery: {},
    medicineLab: {},
    compliance: {},
    grievances: {},
    overallAssessment: {},
    inspector: {}
  });
  const [editingId, setEditingId] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => { fetchInspections(); }, []);

  const fetchInspections = async () => {
    try { const res = await API.get('/inspection'); setInspections(res.data); } catch (err) { console.error(err); }
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrent({
      centerId: '',
      district: '',
      visitedBy: '',
      inspectionDate: '',
      infrastructure: {},
      humanResources: {},
      serviceDelivery: {},
      medicineLab: {},
      compliance: {},
      grievances: {},
      overallAssessment: {},
      inspector: {}
    });
    setEditingId(null);
  };

  const handleShow = (insp = null) => {
    console.log("Opening modal", insp);
    if (insp) {
      setCurrent(insp);
      setEditingId(insp._id);
    } else {
      setCurrent({
        centerId: '',
        district: '',
        visitedBy: '',
        inspectionDate: '',
        infrastructure: {},
        humanResources: {},
        serviceDelivery: {},
        medicineLab: {},
        compliance: {},
        grievances: {},
        overallAssessment: {},
        inspector: {}
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleChange = (section, field, value) => {
    setCurrent({ ...current, [section]: { ...current[section], [field]: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put(`/inspection/${editingId}`, current);
      else await API.post('/inspection', current);
      fetchInspections();
      handleClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this inspection?')) {
      try { await API.delete(`/inspection/${id}`); fetchInspections(); } catch (err) { console.error(err); }
    }
  };

  const handleVerify = async (id, status, reason) => {
    try { await API.put(`/inspection/${id}/verify`, { status, rejectionReason: reason }); fetchInspections(); } catch (err) { console.error(err); }
  };

  const getBadge = (status) => {
    if (status === 'approved') return <Badge bg="success">Approved</Badge>;
    if (status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Inspections</h2>
        <div>
          <Button variant="secondary" onClick={fetchInspections} className="me-2">Refresh</Button>
          {(role === 'district' || role === 'aam_center') && (
            <Button variant="primary" onClick={() => handleShow()}>Add Inspection</Button>
          )}
        </div>
      </div>

      {inspections.length === 0 ? (
        <div className="alert alert-info">No inspections found.</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Center/District</th>
              <th>Date</th>
              <th>Visited By</th>
              <th>Building Condition</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map(i => (
              <tr key={i._id}>
                <td>{i.centerId || i.district}</td>
                <td>{new Date(i.inspectionDate).toLocaleDateString()}</td>
                <td>{i.visitedBy}</td>
                <td>{i.infrastructure?.buildingCondition}</td>
                <td>{getBadge(i.verificationStatus)}</td>
                <td>
                  {(role === 'district' || role === 'aam_center') && i.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="info" onClick={() => handleShow(i)}>Edit</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(i._id)}>Del</Button>
                    </>
                  )}
                  {role === 'directorate' && i.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => handleVerify(i._id, 'approved')}>Approve</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) handleVerify(i._id, 'rejected', reason);
                      }}>Reject</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Form */}
      <Modal show={showModal} onHide={handleClose} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Inspection' : 'Add Inspection'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Basic Details */}
            <Row>
              <Col><Form.Group><Form.Label>Center ID</Form.Label><Form.Control value={current.centerId || ''} onChange={e => setCurrent({...current, centerId: e.target.value})} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>District</Form.Label><Form.Control value={current.district || ''} onChange={e => setCurrent({...current, district: e.target.value})} /></Form.Group></Col>
              <Col><Form.Group><Form.Label>Inspection Date</Form.Label><Form.Control type="date" value={current.inspectionDate?.slice(0,10) || ''} onChange={e => setCurrent({...current, inspectionDate: e.target.value})} required /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>Visited By (Name & Designation)</Form.Label><Form.Control value={current.visitedBy || ''} onChange={e => setCurrent({...current, visitedBy: e.target.value})} required /></Form.Group>
            <Form.Group><Form.Label>SSO ID</Form.Label><Form.Control value={current.ssoId || ''} onChange={e => setCurrent({...current, ssoId: e.target.value})} /></Form.Group>
            <Form.Group><Form.Label>Accompanying Officials</Form.Label><Form.Control value={current.accompanyingOfficials || ''} onChange={e => setCurrent({...current, accompanyingOfficials: e.target.value})} /></Form.Group>

            {/* Infrastructure Status */}
            <hr /><h5>Infrastructure Status</h5>
            {['buildingCondition','waitingArea','opdIpdRooms','labFacility','medicineStore','toiletDrinkingWater','herbalGarden'].map(field => (
              <Form.Group key={field}><Form.Label>{field.replace(/([A-Z])/g, ' $1')}</Form.Label>
                <Form.Select value={current.infrastructure?.[field] || ''} onChange={e => handleChange('infrastructure', field, e.target.value)}>
                  <option>Good</option><option>Average</option><option>Poor</option>
                </Form.Select>
              </Form.Group>
            ))}
            <Form.Group><Form.Label>Remarks</Form.Label><Form.Control as="textarea" value={current.infrastructure?.remarks || ''} onChange={e => handleChange('infrastructure', 'remarks', e.target.value)} /></Form.Group>

            {/* Human Resources */}
            <hr /><h5>Human Resources</h5>
            <Row><Col><Form.Group><Form.Label>Sanctioned Posts</Form.Label><Form.Control type="number" value={current.humanResources?.sanctionedPosts || ''} onChange={e => handleChange('humanResources', 'sanctionedPosts', e.target.value)} /></Form.Group></Col>
            <Col><Form.Group><Form.Label>Filled Posts</Form.Label><Form.Control type="number" value={current.humanResources?.filledPosts || ''} onChange={e => handleChange('humanResources', 'filledPosts', e.target.value)} /></Form.Group></Col>
            <Col><Form.Group><Form.Label>Vacant Posts</Form.Label><Form.Control type="number" value={current.humanResources?.vacantPosts || ''} onChange={e => handleChange('humanResources', 'vacantPosts', e.target.value)} /></Form.Group></Col></Row>
            <Form.Group><Form.Label>Attendance on Day of Visit</Form.Label><Form.Control type="number" value={current.humanResources?.attendanceOnDay || ''} onChange={e => handleChange('humanResources', 'attendanceOnDay', e.target.value)} /></Form.Group>
            <Form.Group><Form.Label>Remarks</Form.Label><Form.Control as="textarea" value={current.humanResources?.remarks || ''} onChange={e => handleChange('humanResources', 'remarks', e.target.value)} /></Form.Group>

            {/* Service Delivery */}
            <hr /><h5>Service Delivery (Last 1 Month)</h5>
            {['opdServices','ipdServices','yogaWellness','ncdServices','referralCases'].map(field => (
              <Form.Group key={field}><Form.Check type="checkbox" label={field.replace(/([A-Z])/g, ' $1')} checked={current.serviceDelivery?.[field] || false} onChange={e => handleChange('serviceDelivery', field, e.target.checked)} /></Form.Group>
            ))}
            <Form.Group><Form.Label>Remarks</Form.Label><Form.Control as="textarea" value={current.serviceDelivery?.remarks || ''} onChange={e => handleChange('serviceDelivery', 'remarks', e.target.value)} /></Form.Group>

            {/* Medicine & Lab */}
            <hr /><h5>Medicine & Lab</h5>
            <Form.Group><Form.Check type="checkbox" label="Stock Register Maintained" checked={current.medicineLab?.stockRegisterMaintained || false} onChange={e => handleChange('medicineLab', 'stockRegisterMaintained', e.target.checked)} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Expired Medicines Found" checked={current.medicineLab?.expiredMedicinesFound || false} onChange={e => handleChange('medicineLab', 'expiredMedicinesFound', e.target.checked)} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Lab Equipment Functional" checked={current.medicineLab?.labEquipmentFunctional || false} onChange={e => handleChange('medicineLab', 'labEquipmentFunctional', e.target.checked)} /></Form.Group>
            <Form.Group><Form.Label>Shortages</Form.Label><Form.Control as="textarea" value={current.medicineLab?.shortages || ''} onChange={e => handleChange('medicineLab', 'shortages', e.target.value)} /></Form.Group>

            {/* Compliance & Records */}
            <hr /><h5>Compliance & Records</h5>
            {['dailyServiceReporting','attendanceRegister','citizenInformationDisplay','onlinePortalWork'].map(field => (
              <Form.Group key={field}><Form.Label>{field.replace(/([A-Z])/g, ' $1')}</Form.Label>
                <Form.Select value={current.compliance?.[field] || ''} onChange={e => handleChange('compliance', field, e.target.value)}>
                  <option>Maintained</option><option>Not Maintained</option>
                </Form.Select>
              </Form.Group>
            ))}

            {/* Grievances */}
            <hr /><h5>Grievances / Public Feedback</h5>
            <Form.Group><Form.Label>Citizen/Patient Interaction Notes</Form.Label><Form.Control as="textarea" value={current.grievances?.citizenNotes || ''} onChange={e => handleChange('grievances', 'citizenNotes', e.target.value)} /></Form.Group>
            <Form.Group><Form.Label>Issues Raised</Form.Label><Form.Control as="textarea" value={current.grievances?.issuesRaised || ''} onChange={e => handleChange('grievances', 'issuesRaised', e.target.value)} /></Form.Group>
            <Form.Group><Form.Label>Immediate Action Taken</Form.Label><Form.Control as="textarea" value={current.grievances?.immediateAction || ''} onChange={e => handleChange('grievances', 'immediateAction', e.target.value)} /></Form.Group>

            {/* Overall Assessment */}
            <hr /><h5>Overall Assessment</h5>
            <Form.Group><Form.Label>General Observation</Form.Label><Form.Control as="textarea" value={current.overallAssessment?.generalObservation || ''} onChange={e => handleChange('overallAssessment', 'generalObservation', e.target.value)} /></Form.Group>
            <Form.Group><Form.Label>Key Issues Identified</Form.Label><Form.Control as="textarea" value={current.overallAssessment?.keyIssues || ''} onChange={e => handleChange('overallAssessment', 'keyIssues', e.target.value)} /></Form.Group>
            <Form.Group><Form.Label>Suggestions / Recommendations</Form.Label><Form.Control as="textarea" value={current.overallAssessment?.suggestions || ''} onChange={e => handleChange('overallAssessment', 'suggestions', e.target.value)} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" label="Follow-up Required" checked={current.overallAssessment?.followUpRequired || false} onChange={e => handleChange('overallAssessment', 'followUpRequired', e.target.checked)} /></Form.Group>

            {/* Inspector Authentication */}
            <hr /><h5>Inspector's Authentication</h5>
            <Row><Col><Form.Group><Form.Label>Name & Designation</Form.Label><Form.Control value={current.inspector?.name || ''} onChange={e => handleChange('inspector', 'name', e.target.value)} /></Form.Group></Col>
            <Col><Form.Group><Form.Label>Digital Signature (URL)</Form.Label><Form.Control value={current.inspector?.digitalSignature || ''} onChange={e => handleChange('inspector', 'digitalSignature', e.target.value)} /></Form.Group></Col></Row>
            <Form.Group><Form.Label>Submission Date & Time</Form.Label><Form.Control type="datetime-local" value={current.inspector?.submissionDate?.slice(0,16) || ''} onChange={e => handleChange('inspector', 'submissionDate', e.target.value)} /></Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Inspection</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Inspection;