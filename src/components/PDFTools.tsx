import { useState, useRef } from 'react';
import { FileText, Download, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import '../styles/SharedStyles.css';

interface PDFFile {
    file: File;
    name: string;
}

export default function PDFTools() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newPDFs = files.map(file => ({ file, name: file.name }));
        setPdfFiles([...pdfFiles, ...newPDFs]);
    };

    const removePDF = (index: number) => {
        const newPDFs = [...pdfFiles];
        newPDFs.splice(index, 1);
        setPdfFiles(newPDFs);
    };

    const movePDF = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === pdfFiles.length - 1)
        ) {
            return;
        }

        const newPDFs = [...pdfFiles];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newPDFs[index], newPDFs[newIndex]] = [newPDFs[newIndex], newPDFs[index]];
        setPdfFiles(newPDFs);
    };

    const mergePDFs = async () => {
        if (pdfFiles.length < 2) {
            alert('Please select at least 2 PDF files to merge.');
            return;
        }

        setIsProcessing(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const pdfFile of pdfFiles) {
                const arrayBuffer = await pdfFile.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged-documents.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Error merging PDFs. Please ensure all files are valid PDFs.');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const compressPDF = async (pdfFile: PDFFile) => {
        setIsProcessing(true);

        try {
            const arrayBuffer = await pdfFile.file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);

            // Save with compression
            const compressedPdfBytes = await pdf.save({
                useObjectStreams: true,
                addDefaultPage: false,
            });

            const blob = new Blob([new Uint8Array(compressedPdfBytes)], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compressed-${pdfFile.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            const originalSize = (pdfFile.file.size / 1024).toFixed(2);
            const compressedSize = (blob.size / 1024).toFixed(2);
            alert(`Compression complete!\nOriginal: ${originalSize} KB\nCompressed: ${compressedSize} KB`);
        } catch (error) {
            alert('Error compressing PDF. Please try again.');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="tool-card">
            <div className="tool-header">
                <div className="tool-header-left">
                    <FileText size={24} />
                    <h3>PDF Tools</h3>
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
                        Merge multiple PDFs, compress PDFs, and reorder pages - all in your browser.
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    <button
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={18} />
                        Select PDF Files
                    </button>

                    {pdfFiles.length > 0 && (
                        <div className="pdf-list">
                            <h4>Selected PDFs ({pdfFiles.length})</h4>
                            {pdfFiles.map((pdf, index) => (
                                <div key={index} className="pdf-item">
                                    <div className="pdf-info">
                                        <span className="pdf-number">{index + 1}</span>
                                        <span className="pdf-name">{pdf.name}</span>
                                        <span className="pdf-size">
                                            {(pdf.file.size / 1024).toFixed(2)} KB
                                        </span>
                                    </div>
                                    <div className="pdf-actions">
                                        <button
                                            className="btn-icon"
                                            onClick={() => movePDF(index, 'up')}
                                            disabled={index === 0}
                                            title="Move up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => movePDF(index, 'down')}
                                            disabled={index === pdfFiles.length - 1}
                                            title="Move down"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            className="btn-icon compress"
                                            onClick={() => compressPDF(pdf)}
                                            disabled={isProcessing}
                                            title="Compress this PDF"
                                        >
                                            ⚡
                                        </button>
                                        <button
                                            className="btn-icon remove"
                                            onClick={() => removePDF(index)}
                                            title="Remove"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pdfFiles.length > 1 && (
                        <div className="tool-actions">
                            <button
                                className="btn btn-primary"
                                onClick={mergePDFs}
                                disabled={isProcessing}
                            >
                                <Download size={18} />
                                {isProcessing ? 'Merging...' : `Merge ${pdfFiles.length} PDFs`}
                            </button>
                            <button
                                className="btn btn-text"
                                onClick={() => setPdfFiles([])}
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
