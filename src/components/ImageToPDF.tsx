import { useState, useRef } from 'react';
import { FileImage, Download, X, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import jsPDF from 'jspdf';
import imageCompression from 'browser-image-compression';
import '../styles/SharedStyles.css';

interface ImageFile {
  file: File;
  preview: string;
  compressed?: Blob;
}

export default function ImageToPDF() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newImages: ImageFile[] = await Promise.all(
      files.map(async (file) => {
        const preview = URL.createObjectURL(file);
        
        // Auto compress the image
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        
        try {
          const compressed = await imageCompression(file, options);
          return { file, preview, compressed };
        } catch {
          return { file, preview };
        }
      })
    );
    
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const convertToPDF = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const pdf = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imgData = await createImageData(image.compressed || image.file);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate dimensions to fit the page
        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        
        const width = imgWidth * ratio;
        const height = imgHeight * ratio;
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;
        
        pdf.addImage(imgData, 'JPEG', x, y, width, height);
      }
      
      pdf.save('scholarship-documents.pdf');
    } catch (error) {
      alert('Error creating PDF. Please try again.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const createImageData = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="tool-card">
      <div className="tool-header">
        <div className="tool-header-left">
          <FileImage size={24} />
          <h3>Image to PDF Converter</h3>
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="tool-content">
      <p className="tool-description">
        Select multiple images to combine into a single PDF. Images are automatically compressed.
      </p>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <button 
        className="btn btn-secondary"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={18} />
        Select Images
      </button>
      
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <img src={image.preview} alt={`Preview ${index + 1}`} />
              <button
                className="remove-btn"
                onClick={() => removeImage(index)}
                title="Remove image"
              >
                <X size={16} />
              </button>
              <span className="image-number">{index + 1}</span>
            </div>
          ))}
        </div>
      )}
      
      {images.length > 0 && (
        <div className="tool-actions">
          <button
            className="btn btn-primary"
            onClick={convertToPDF}
            disabled={isProcessing}
          >
            <Download size={18} />
            {isProcessing ? 'Creating PDF...' : `Convert to PDF (${images.length} images)`}
          </button>
          <button
            className="btn btn-text"
            onClick={() => {
              images.forEach(img => URL.revokeObjectURL(img.preview));
              setImages([]);
            }}
          >
            Clear All
          </button>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
