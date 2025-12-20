import { useState, useRef, useEffect } from 'react';
import { Crop, Download, X, Upload, ZoomIn, ZoomOut, ChevronDown, ChevronUp, Loader, Check } from 'lucide-react';
import Cropper from 'react-cropper';
import html2canvas from 'html2canvas';
import { detectAndCropFace, preloadFaceDetectionModels } from '../utils/faceDetection';
import '../styles/AutoCrop.css';
import '../styles/SharedStyles.css';

interface CropImageData {
  file: File;
  originalUrl: string;
  croppedUrl: string | null;
  processed: boolean;
  autoDetected: boolean;
}

export default function AutoCrop() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [images, setImages] = useState<CropImageData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<any>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  // Preload face detection models on component mount
  useEffect(() => {
    const loadModels = async () => {
      setStatusMessage('Loading face detection models...');
      const loaded = await preloadFaceDetectionModels();
      setModelLoaded(loaded);
      setStatusMessage(loaded ? 'Face detection ready!' : 'Failed to load face detection');
      setTimeout(() => setStatusMessage(''), 3000);
    };
    loadModels();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setStatusMessage('Processing images...');

    const imageData: CropImageData[] = [];

    for (const file of files) {
      const originalUrl = URL.createObjectURL(file);
      
      // Try auto face detection first
      if (modelLoaded) {
        const result = await detectAndCropFace(file, zoomLevel);
        
        if (result.success && result.croppedDataURL) {
          imageData.push({
            file,
            originalUrl,
            croppedUrl: result.croppedDataURL,
            processed: true,
            autoDetected: true
          });
        } else {
          // Face detection failed, use original
          imageData.push({
            file,
            originalUrl,
            croppedUrl: originalUrl,
            processed: false,
            autoDetected: false
          });
        }
      } else {
        // Model not loaded, use original
        imageData.push({
          file,
          originalUrl,
          croppedUrl: originalUrl,
          processed: false,
          autoDetected: false
        });
      }
    }

    setImages(imageData);
    setCurrentIndex(0);
    setIsProcessing(false);
    setStatusMessage(`Processed ${imageData.filter(img => img.autoDetected).length} of ${imageData.length} images with face detection`);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleAutoCrop = async () => {
    if (!images[currentIndex] || !modelLoaded) return;
    
    setIsProcessing(true);
    setStatusMessage('Detecting face...');
    
    const result = await detectAndCropFace(images[currentIndex].file, zoomLevel);
    
    if (result.success && result.croppedDataURL) {
      const newImages = [...images];
      newImages[currentIndex] = {
        ...newImages[currentIndex],
        croppedUrl: result.croppedDataURL,
        processed: true,
        autoDetected: true
      };
      setImages(newImages);
      setStatusMessage('Face detected and cropped!');
    } else {
      setStatusMessage(result.message || 'No face detected. Try manual cropping.');
    }
    
    setIsProcessing(false);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleManualCrop = () => {
    setIsEditMode(true);
    setStatusMessage('Manual crop mode activated');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleApplyCrop = () => {
    if (!cropperRef.current) return;

    const cropper = cropperRef.current.cropper;
    const croppedCanvas = cropper.getCroppedCanvas({
      width: 827, // 35mm at 600dpi for professional print quality
      height: 1063, // 45mm at 600dpi
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    const croppedDataURL = croppedCanvas.toDataURL('image/jpeg', 1.0);
    
    const newImages = [...images];
    newImages[currentIndex] = {
      ...newImages[currentIndex],
      croppedUrl: croppedDataURL,
      processed: true,
      autoDetected: false
    };
    setImages(newImages);
    setIsEditMode(false);
    setStatusMessage('Crop applied successfully!');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleCancelCrop = () => {
    setIsEditMode(false);
    setStatusMessage('Crop cancelled');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    if (cropperRef.current && isEditMode) {
      cropperRef.current.cropper.zoomTo(newZoom);
    }
  };

  const handleSaveImage = async () => {
    const currentImage = images[currentIndex];
    if (!currentImage || !currentImage.croppedUrl) return;

    setIsProcessing(true);
    setStatusMessage('Saving image...');

    try {
      if (previewImageRef.current) {
        const canvas = await html2canvas(previewImageRef.current, {
          scale: 10,
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        const link = document.createElement('a');
        link.download = `cropped_${currentImage.file.name}`;
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.click();

        setStatusMessage('Image saved successfully!');
      }
    } catch (error) {
      console.error('Save error:', error);
      setStatusMessage('Failed to save image');
    }

    setIsProcessing(false);
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleSaveAll = async () => {
    setIsProcessing(true);
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.croppedUrl) continue;

      try {
        const response = await fetch(img.croppedUrl);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.download = `cropped_${img.file.name}`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to save image ${i + 1}:`, error);
      }
    }

    setStatusMessage(`Saved ${images.length} images!`);
    setIsProcessing(false);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsEditMode(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsEditMode(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].originalUrl);
    if (newImages[index].croppedUrl && newImages[index].croppedUrl !== newImages[index].originalUrl) {
      URL.revokeObjectURL(newImages[index].croppedUrl!);
    }
    newImages.splice(index, 1);
    setImages(newImages);
    
    if (currentIndex >= newImages.length && newImages.length > 0) {
      setCurrentIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentIndex(0);
    }
  };

  const handleClear = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.croppedUrl && img.croppedUrl !== img.originalUrl) {
        URL.revokeObjectURL(img.croppedUrl);
      }
    });
    setImages([]);
    setCurrentIndex(0);
    setIsEditMode(false);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="tool-card">
      <div className="tool-header">
        <div className="tool-header-left">
          <Crop size={24} />
          <h3>Smart Photo Cropper with Face Detection</h3>
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
            Automatically detect faces and crop passport photos, or manually adjust the crop area. 
            Perfect for ID cards, visas, and official documents.
            {!modelLoaded && ' (Face detection loading...)'}
          </p>

          {statusMessage && (
            <div style={{
              padding: '0.75rem',
              background: modelLoaded ? '#f0fdf4' : '#fef3c7',
              border: `2px solid ${modelLoaded ? '#34d399' : '#fbbf24'}`,
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {isProcessing ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
              <span>{statusMessage}</span>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Upload size={20} />
            Upload Images
          </button>

          {images.length > 0 && currentImage && (
            <>
              <div className="crop-workspace">
                <div className="crop-header">
                  <span className="crop-counter">
                    Image {currentIndex + 1} of {images.length}
                    {currentImage.autoDetected && ' (Face Detected ✓)'}
                  </span>
                  <div className="image-navigation">
                    <button
                      className="btn-icon"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0 || isEditMode}
                    >
                      &lt;
                    </button>
                    <button
                      className="btn-icon"
                      onClick={handleNext}
                      disabled={currentIndex === images.length - 1 || isEditMode}
                    >
                      &gt;
                    </button>
                  </div>
                </div>

                <div className="crop-container">
                  {isEditMode ? (
                    <>
                      <div className="cropper-wrapper">
                        <Cropper
                          ref={cropperRef}
                          src={currentImage.originalUrl}
                          style={{ height: 500, width: '100%' }}
                          aspectRatio={35 / 45}
                          guides={true}
                          viewMode={1}
                          zoomable={true}
                          autoCropArea={0.8}
                          initialAspectRatio={35 / 45}
                          minCropBoxWidth={100}
                          minCropBoxHeight={128}
                          ready={() => {
                            if (cropperRef.current) {
                              const cropper = cropperRef.current.cropper;
                              cropper.zoomTo(0);
                              setZoomLevel(1);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="zoom-controls">
                        <button 
                          className="btn-icon"
                          onClick={() => handleZoomChange(Math.max(0.5, zoomLevel - 0.1))}
                        >
                          <ZoomOut size={16} />
                        </button>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={zoomLevel}
                          onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                          className="zoom-slider"
                        />
                        <span className="zoom-label">{Math.round(zoomLevel * 100)}%</span>
                        <button 
                          className="btn-icon"
                          onClick={() => handleZoomChange(Math.min(2, zoomLevel + 0.1))}
                        >
                          <ZoomIn size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="preview-wrapper">
                      <img
                        ref={previewImageRef}
                        src={currentImage.croppedUrl || currentImage.originalUrl}
                        alt="Preview"
                        className="preview-image"
                      />
                    </div>
                  )}
                </div>

                <div className="crop-actions">
                  {isEditMode ? (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={handleApplyCrop}
                        disabled={isProcessing}
                      >
                        <Check size={20} />
                        Apply Crop
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelCrop}
                        disabled={isProcessing}
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={handleAutoCrop}
                        disabled={isProcessing || !modelLoaded}
                        title={!modelLoaded ? 'Face detection model loading...' : ''}
                      >
                        <Crop size={20} />
                        Auto Crop Face
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleManualCrop}
                        disabled={isProcessing}
                      >
                        Manual Crop
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveImage}
                        disabled={isProcessing || !currentImage.processed}
                      >
                        <Download size={20} />
                        Save Image
                      </button>
                    </>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="image-gallery">
                  <h4>All Images ({images.length})</h4>
                  <div className="gallery-grid">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`gallery-item ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => !isEditMode && setCurrentIndex(index)}
                      >
                        <img src={img.croppedUrl || img.originalUrl} alt={`Image ${index + 1}`} />
                        {img.processed && <div className="processed-badge">✓</div>}
                        <button
                          className="remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          disabled={isEditMode}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="tool-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAll}
                  disabled={isProcessing || images.filter(img => img.processed).length === 0}
                >
                  <Download size={20} />
                  Download All ({images.filter(img => img.processed).length})
                </button>
                <button
                  className="btn btn-text"
                  onClick={handleClear}
                  disabled={isProcessing}
                >
                  <X size={20} />
                  Clear All
                </button>
              </div>
            </>
          )}

          <div className="privacy-note">
            <p>
              All processing happens in your browser. Face detection uses AI models loaded locally. 
              No images are uploaded to any server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
