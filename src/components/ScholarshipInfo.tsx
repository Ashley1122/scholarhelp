import { ExternalLink, AlertCircle, FileText, Image, FileArchive } from 'lucide-react';
import '../styles/ScholarshipInfo.css';

export default function ScholarshipInfo() {
  return (
    <section className="scholarship-section" id="scholarships">
      <div className="container">
        <h2 className="section-title">Scholarship Information</h2>
        <p className="section-subtitle">Official government portal and document formatting tools</p>
        
        <div className="scholarship-grid">
          <div className="scholarship-card">
            <div className="card-header">
              <h3>National Scholarship Portal (NSP)</h3>
              <span className="badge">Official</span>
            </div>
            
            <div className="card-content">
              <div className="eligibility">
                <strong>About NSP:</strong>
                <p>
                  The National Scholarship Portal is the official Government of India platform 
                  for all scholarship applications. It provides a one-stop solution for students 
                  to apply for various scholarships offered by Central and State Governments.
                </p>
              </div>
              
              <div className="important-notes">
                <div className="notes-header">
                  <AlertCircle size={16} />
                  <strong>What NSP Offers:</strong>
                </div>
                <ul>
                  <li>Pre-Matric and Post-Matric Scholarships</li>
                  <li>Merit-cum-Means Based Scholarships</li>
                  <li>Central and State Government Schemes</li>
                  <li>Minority Affairs Scholarships</li>
                  <li>Direct bank transfer of scholarship amount</li>
                </ul>
              </div>
              
              <a 
                href="https://scholarships.gov.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="apply-link"
              >
                Visit Official NSP Portal <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className="scholarship-card">
            <div className="card-header">
              <h3>How ScholarHelp.in Assists You</h3>
              <span className="badge" style={{background: '#34d399'}}>Free Tools</span>
            </div>
            
            <div className="card-content">
              <div className="eligibility">
                <strong>Our Purpose:</strong>
                <p>
                  ScholarHelp.in is a FREE document formatting helper tool for students. 
                  We help you prepare the required documents for scholarship applications 
                  by providing easy-to-use tools for image and PDF processing.
                </p>
              </div>
              
              <div className="important-notes">
                <div className="notes-header">
                  <FileText size={16} />
                  <strong>What We Help With:</strong>
                </div>
                <ul>
                  <li><Image size={14} style={{display: 'inline', marginRight: '0.5rem'}} />Compress images to required size (200KB, 300KB)</li>
                  <li><FileArchive size={14} style={{display: 'inline', marginRight: '0.5rem'}} />Crop passport photos with face detection</li>
                  <li><FileText size={14} style={{display: 'inline', marginRight: '0.5rem'}} />Convert images to PDF format</li>
                  <li><FileArchive size={14} style={{display: 'inline', marginRight: '0.5rem'}} />Merge multiple PDFs into one</li>
                  <li><Image size={14} style={{display: 'inline', marginRight: '0.5rem'}} />All processing in browser - no uploads</li>
                </ul>
              </div>
              
              <button 
                onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
                className="apply-link"
                style={{border: 'none', cursor: 'pointer'}}
              >
                Use Free Tools Below <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="trust-note">
          <AlertCircle size={20} />
          <p>
            <strong>Important:</strong> ScholarHelp.in is NOT a scholarship application portal. 
            We only provide document formatting tools to help students prepare their documents. 
            All scholarship applications must be submitted through the official NSP portal at scholarships.gov.in
          </p>
        </div>
      </div>
    </section>
  );
}
