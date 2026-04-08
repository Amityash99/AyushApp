import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Try multiple possible file names
  const logoFiles = [
    '/Flag_of_Rajasthan.png',
    
  ];
  const [logoPath, setLogoPath] = useState(logoFiles[0]);

  useEffect(() => {
    // Preload the first available logo
    const checkLogo = async () => {
      for (const path of logoFiles) {
        try {
          const res = await fetch(path, { method: 'HEAD' });
          if (res.ok) {
            setLogoPath(path);
            break;
          }
        } catch (err) {
          console.warn(`Logo not found: ${path}`);
        }
      }
    };
    checkLogo();
  }, []);

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand href="#">
          {!logoError ? (
            <img
              src={logoPath}
              alt="Government of Rajasthan"
              height="50"
              className="me-2 d-inline-block align-top"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div style={{ width: 50, height: 50, background: '#1e3a6f', display: 'inline-block', marginRight: 10 }}></div>
          )}
          <strong>AYUSH Department, Rajasthan</strong>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <Button variant="outline-danger" onClick={logout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;