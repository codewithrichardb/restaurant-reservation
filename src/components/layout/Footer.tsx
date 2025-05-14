'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  // Use a static year for initial render to avoid hydration mismatch
  const [currentYear, setCurrentYear] = useState(2023);

  // Update the year on the client side after hydration
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Gourmet Haven</h5>
            <p className="text-muted">
              Exquisite dining experience in a warm, elegant atmosphere.
            </p>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Hours</h5>
            <ul className="list-unstyled text-muted">
              <li>Monday - Thursday: 11am - 10pm</li>
              <li>Friday - Saturday: 11am - 11pm</li>
              <li>Sunday: 10am - 9pm</li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Contact</h5>
            <ul className="list-unstyled text-muted">
              <li>123 Gourmet Street</li>
              <li>Culinary City, CC 12345</li>
              <li>Phone: (555) 123-4567</li>
              <li>Email: info@gourmethaven.com</li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-muted">
              &copy; {currentYear} Gourmet Haven. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#" className="text-muted">
                  <i className="bi bi-facebook fs-5"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-muted">
                  <i className="bi bi-instagram fs-5"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-muted">
                  <i className="bi bi-twitter-x fs-5"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
