import ImageToPDF from './ImageToPDF';
import ImageResizer from './ImageResizer';
import PDFTools from './PDFTools';
import AutoCrop from './AutoCrop';
import '../styles/DocumentTools.css';

export default function DocumentTools() {
  return (
    <section className="tools-section" id="tools">
      <div className="container">
        <h2 className="section-title">Document Tools</h2>
        <p className="section-subtitle">Free tools to prepare your scholarship documents - 100% private, all processing happens in your browser</p>
        
        <div className="tools-grid">
          <ImageResizer />
          <AutoCrop />
          <ImageToPDF />
          <PDFTools />
        </div>
        
        <div className="privacy-note">
          <p>🔒 Your files never leave your device. All processing happens in your browser for complete privacy.</p>
        </div>
      </div>
    </section>
  );
}
