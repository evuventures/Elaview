import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import './styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-grid">

          <div className="footer-section">
            <div className="logo">
              <span>Elaview</span>
            </div>
            <p className="footer-description">Turn your unused billboard space into a revenue stream. Our platform lets you list, manage, and rent your billboard sign effortlessly</p>
          </div>

          <div className="footer-section">

            <h4 className="footer-title">Product</h4>

            <ul className="footer-links">
              <li>
                <Link to="#" className="footer-link">
                  Features
                </Link>
              </li>

              <li>
                <Link to="#" className="footer-link">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li>
                <Link to="#" className="footer-link">
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className="footer-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">

            <h4 className="footer-title">Legal</h4>

            <ul className="footer-links">
              <li>
                <Link to="#" className="footer-link">
                  Terms
                </Link>
              </li>

              <li>
                <Link to="#" className="footer-link">
                  Cookies
                </Link>
              </li>
            </ul>

          </div>

        </div>

        <div className="footer-section">

          <h4 className="footer-title">Follow Us</h4>

          <div className="social-links">

            <Link to="#" className="social-link">
              <Twitter className="icon" />
            </Link>

            <Link to="#" className="social-link">
              <Facebook className="icon" />
            </Link>

            <Link to="#" className="social-link">
              <Instagram className="icon" />
            </Link>

            <Link to="#" className="social-link">
              <Linkedin className="icon" />
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Elaview. All rights reserved.
        </div>
      </div>

    </footer>
  )
} 