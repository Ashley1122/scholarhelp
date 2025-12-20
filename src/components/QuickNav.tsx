import { GraduationCap, Wrench, BookOpen } from 'lucide-react';
import '../styles/QuickNav.css';

export default function QuickNav() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="quick-nav">
      <div className="container">
        <h2 className="quick-nav-title">What can you do here?</h2>
        <div className="nav-cards">
          <button 
            className="nav-card"
            onClick={() => scrollToSection('scholarships')}
          >
            <div className="nav-icon scholarships">
              <GraduationCap size={32} />
            </div>
            <h3>Official NSP Portal</h3>
            <p>Link to Government's National Scholarship Portal for applications</p>
          </button>
          
          <button 
            className="nav-card"
            onClick={() => scrollToSection('tools')}
          >
            <div className="nav-icon tools">
              <Wrench size={32} />
            </div>
            <h3>Document Tools</h3>
            <p>Free tools to compress, crop, and format images and PDFs for scholarships</p>
          </button>
          
          <button 
            className="nav-card"
            onClick={() => scrollToSection('guides')}
          >
            <div className="nav-icon guides">
              <BookOpen size={32} />
            </div>
            <h3>Step-by-Step Guides</h3>
            <p>Simple guides to help you prepare documents for scholarship applications</p>
          </button>
        </div>
      </div>
    </section>
  );
}
