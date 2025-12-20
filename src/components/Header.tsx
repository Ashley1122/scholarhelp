import { GraduationCap } from 'lucide-react';
import '../styles/Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <GraduationCap size={32} />
            <h1>ScholarshipHelp.web.app</h1>
          </div>
          <p className="tagline">Free document formatting tools for scholarship applications</p>
        </div>
      </div>
    </header>
  );
}
