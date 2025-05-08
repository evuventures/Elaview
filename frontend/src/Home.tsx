import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="page-container">
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-container">
            <div className="hero-grid">
              <div className="hero-content">
                <div>
                  <h1 className="hero-title">
                    Unlock the Power of Your Space, Earn with Ease
                  </h1>
                  <p className="hero-description">
                    Turn your unused billboard space into a revenue stream. Our platform lets you list, manage, and rent your billboard sign effortlessly
                  </p>
                </div>
                <div className="hero-buttons">
                  <Link to="/login" className="button button-large">
                    Get Started
                  </Link>
                </div>
              </div>
              <img
                src="../public/images/home.png"
                width={550}
                height={550}
                alt="Hero Image"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
