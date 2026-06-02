import wordmark from '../../assets/dartmouth-wordmark.png';

// Affiliation footer + copyright.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__affil">
          <span className="footer__affil-label">An official platform of</span>
          <img className="footer__wordmark" src={wordmark} alt="Dartmouth" />
        </div>
        <p className="footer__copy">
          © 2026 DartClubs · Dartmouth College Club Management Platform
        </p>
      </div>
    </footer>
  );
}
