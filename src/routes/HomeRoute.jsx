import { Link } from 'react-router-dom';
import "./HomeRoute.css";

export default function HomeRoute() {
  return (
    <div>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">🌊 WAVE</div>
        <div className="nav-right">
          <Link to="/">Home</Link>
          <Link to="/features">Features</Link>
          <Link to="/login">Login</Link>
          <Link to="/seeker/register">Register</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        {/* LEFT SIDE */}
        <div className="hero-left">
          <h1>Welcome to Wave</h1>
          <p className="subtitle">Connect with people nearby to help or get help.</p>
          <p className="desc">
            Wave enables you to find helpers or offer help to people in your area.
            Whether you need assistance or want to contribute, Wave connects you with the right people.
          </p>
        </div>

        {/* RIGHT SIDE (CARDS) */}
        <div className="hero-right">

          {/* SEEKER CARD */}
          <div className="card seeker-card">
            <h2>Need Help?</h2>
            <p>Post a task and find someone nearby to assist you.</p>

            <Link to="/login" className="btn btn-green">Login as Seeker</Link>
            <Link to="/seeker/register" className="btn btn-outline-green">Register as Seeker</Link>
          </div>

          {/* HELPER CARD */}
          <div className="card helper-card">
            <h2>Want to Help?</h2>
            <p>Use your skills to help others and earn rewards.</p>

            <Link to="/login" className="btn btn-blue">Login as Helper</Link>
            <Link to="/user/register" className="btn btn-outline-blue">Register as Helper</Link>
          </div>

        </div>
      </section>

      {/* ABOUT + FEATURES SECTION */}
      <section className="about-section">
        <h2>Connecting Individuals</h2>
        <p>
          <strong>Wave</strong> is a micro-job help board web application that connects people who need assistance
          with small local tasks to those willing to help.
        </p>
        <p>
          The platform promotes mutual support and encourages a culture of goodwill.
        </p>

        <div className="features-grid">

          <div className="feature-box">
            <h3>📍 Location-Based Tasks</h3>
            <p>Users can post and explore jobs within their nearby area.</p>
          </div>

          <div className="feature-box">
            <h3>💡 Simple and Rewarding System</h3>
            <p>Easy posting, accepting, and completing tasks.</p>
          </div>

          <div className="feature-box">
            <h3>🔐 Secure User Authentication</h3>
            <p>Safe and verified interactions.</p>
          </div>

          <div className="feature-box">
            <h3>🤝 Community Engagement</h3>
            <p>Build trust and meaningful connections.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
