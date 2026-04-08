import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const role = localStorage.getItem('role'); // aam_center, district, directorate, state

  return (
    <Nav className="flex-column p-3">
      <Nav.Link as={Link} to="/dashboard" className="text-white">Dashboard</Nav.Link>
      <Nav.Link as={Link} to="/construction" className="text-white">Construction Works</Nav.Link>
      <Nav.Link as={Link} to="/hr" className="text-white">Staff HR</Nav.Link>
      <Nav.Link as={Link} to="/attendance" className="text-white">Attendance</Nav.Link>
      <Nav.Link as={Link} to="/movement" className="text-white">Movement</Nav.Link>
      <Nav.Link as={Link} to="/garden" className="text-white">Herbal Garden</Nav.Link>
      <Nav.Link as={Link} to="/garden-maintenance" className="text-white">Garden Maintenance</Nav.Link>
      <Nav.Link as={Link} to="/programme" className="text-white">Programme Activities</Nav.Link>
      <Nav.Link as={Link} to="/yoga-instructor" className="text-white">Yoga Instructors</Nav.Link>
      <Nav.Link as={Link} to="/yoga-session" className="text-white">Yoga Sessions</Nav.Link>
      <Nav.Link as={Link} to="/reporting" className="text-white">NAM Reporting</Nav.Link>
      <Nav.Link as={Link} to="/iec" className="text-white">IEC & Branding</Nav.Link>
      <Nav.Link as={Link} to="/ncd" className="text-white">NCD Survey</Nav.Link>
      <Nav.Link as={Link} to="/inspection" className="text-white">Inspection</Nav.Link>
      {role === 'district' && (
        <Nav.Link as={Link} to="/verification" className="text-white">Verification Queue</Nav.Link>
      )}
    </Nav>
  );
};

export default Sidebar;