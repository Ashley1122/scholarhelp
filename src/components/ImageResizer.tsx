import { useState, useRef } from 'react';
import { Maximize2, Download, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import '../styles/SharedStyles.css';

interface ResizeOption {
    label: string;
    maxSizeKB: number;
}

const resizeOptions: ResizeOption[] = [
    { label: '200 KB', maxSizeKB: 200 },
    { label: '300 KB', maxSizeKB: 300 },
    { label: '500 KB', maxSizeKB: 500 },
];

export default function ImageResizer() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [compressedImage, setCompressedImage] = useState<Blob | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string>('');
    const [compressedPreview, setCompressedPreview] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<number>(200);
    const [customSize, setCustomSize] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setOriginalImage(file);
        setOriginalPreview(URL.createObjectURL(file));
        setCompressedImage(null);
        setCompressedPreview('');
    };

    const compressImage = async () => {
        if (!originalImage) return;

        setIsProcessing(true);

        const targetSize = customSize ? parseInt(customSize) : selectedOption;

        const options = {
            maxSizeMB: targetSize / 1024, // Convert KB to MB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.9,
            alwaysKeepResolution: true,
        };

        try {
            let compressed = await imageCompression(originalImage, options);

            // If still too large, try more aggressive compression
            let attempts = 0;
            while (compressed.size / 1024 > targetSize && attempts < 3) {
                options.initialQuality -= 0.15;
                options.maxWidthOrHeight = Math.floor(options.maxWidthOrHeight * 0.9);
                compressed = await imageCompression(originalImage, options);
                attempts++;
            }

            setCompressedImage(compressed);
            setCompressedPreview(URL.createObjectURL(compressed));
        } catch (error) {
            alert('Error compressing image. Please try again.');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadImage = () => {
        if (!compressedImage) return;

        const url = URL.createObjectURL(compressedImage);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatFileSize = (bytes: number): string => {
        return (bytes / 1024).toFixed(2) + ' KB';
    };

    return (
        <div className="tool-card">
            <div className="tool-header">
                <div className="tool-header-left">
                    <Maximize2 size={24} />
                    <h3>Image Size Reducer</h3>
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
                        Compress images to specific sizes (200 KB, 300 KB) without losing quality. Perfect for scholarship applications.
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    <button
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={18} />
                        Select Image
                    </button>

                    {originalImage && (
                        <>
                            <div className="size-options">
                                <label>Target Size:</label>
                                <div className="button-group">
                                    {resizeOptions.map((option) => (
                                        <button
                                            key={option.maxSizeKB}
                                            className={`btn-option ${selectedOption === option.maxSizeKB ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedOption(option.maxSizeKB);
                                                setCustomSize('');
                                            }}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="custom-size">
                                    <input
                                        type="number"
                                        placeholder="Custom size (KB)"
                                        value={customSize}
                                        onChange={(e) => {
                                            setCustomSize(e.target.value);
                                            setSelectedOption(0);
                                        }}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={compressImage}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Compressing...' : 'Compress Image'}
                            </button>

                            <div className="image-comparison">
                                <div className="comparison-item">
                                    <h4>Original</h4>
                                    <div className="image-container">
                                        <img src={originalPreview} alt="Original" />
                                    </div>
                                    <p className="file-size">{formatFileSize(originalImage.size)}</p>
                                </div>

                                {compressedImage && (
                                    <div className="comparison-item">
                                        <h4>Compressed</h4>
                                        <div className="image-container">
                                            <img src={compressedPreview} alt="Compressed" />
                                        </div>
                                        <p className="file-size">{formatFileSize(compressedImage.size)}</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={downloadImage}
                                        >
                                            <Download size={18} />
                                            Download
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
