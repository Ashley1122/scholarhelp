import { Heart } from 'lucide-react';
import '../styles/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p>
            Made with <Heart size={16} className="heart" /> to help students prepare scholarship documents easily
          </p>
          <p className="footer-note">
            ScholarHelp.in - Free document formatting tools • No uploads • Privacy-first
          </p>
          <p className="copyright">© {currentYear} ScholarHelp.in - A free helper tool for NSP applications. Apply at scholarships.gov.in</p>
        </div>
      </div>
    </footer>
  );
}
