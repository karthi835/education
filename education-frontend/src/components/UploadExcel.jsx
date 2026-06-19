// ============================================================
// components/UploadExcel.jsx
// Drag & drop file upload with progress bar, preview and validation
// ============================================================

import { useState, useRef } from 'react';
import { Alert, ProgressBar, Table, Spinner } from 'react-bootstrap';
import { BsCloudUploadFill, BsFileEarmarkExcelFill, BsCheckCircleFill, BsXCircleFill, BsEyeFill } from 'react-icons/bs';
import { uploadAPI } from '../services/api';

const UploadExcel = ({ onUploadSuccess }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alert, setAlert] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  // Validate file type
  const isValidFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    const validExts = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    return validTypes.includes(file.type) || validExts.includes(ext);
  };

  // Handle file selection (from both click and drag)
  const handleFile = async (file) => {
    if (!isValidFile(file)) {
      setAlert({ type: 'danger', message: 'Invalid file type. Please upload .xlsx, .xls, or .csv files.' });
      return;
    }
    setSelectedFile(file);
    setAlert(null);
    setPreviewData(null);
    setProgress(0);

    // Call preview endpoint
    setPreviewing(true);
    try {
      const response = await uploadAPI.previewExcelFile(file);
      setPreviewData(response.data);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to preview file.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setPreviewing(false);
    }
  };

  // Poll background upload status until completed/failed
  const pollUploadStatus = async (uploadId) => {
    const POLL_INTERVAL = 3000; // 3 seconds
    const MAX_POLLS = 600;      // up to 30 minutes

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));
      try {
        const res = await uploadAPI.getUploadStatus(uploadId);
        const { status, total_records, file_name } = res.data;

        if (status === 'completed') {
          setAlert({
            type: 'success',
            message: `Successfully imported "${file_name}" with ${total_records.toLocaleString()} records.`,
          });
          setSelectedFile(null);
          setPreviewData(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          if (onUploadSuccess) onUploadSuccess();
          return;
        } else if (status === 'failed') {
          setAlert({ type: 'danger', message: `Upload "${file_name}" failed during processing. ${total_records.toLocaleString()} records were inserted before the error.` });
          return;
        } else {
          // Still processing — update progress message
          setAlert({
            type: 'info',
            message: `Processing in background... ${total_records.toLocaleString()} records inserted so far.`,
          });
        }
      } catch (err) {
        // Network error — keep polling
      }
    }

    setAlert({ type: 'warning', message: 'Upload is still processing. Refresh the page later to check status.' });
  };

  // Handle actual upload after preview confirmation
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setAlert(null);

    try {
      const response = await uploadAPI.uploadFile(selectedFile, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });

      const { file_name, total_records, upload_id, message } = response.data;

      // Large file — backend is processing in background
      if (message && message.toLowerCase().includes('background')) {
        setProgress(100);
        setAlert({
          type: 'info',
          message: `File uploaded. Processing ${file_name} in background — please wait...`,
        });
        // Start polling for completion
        await pollUploadStatus(upload_id);
      } else {
        // Small file — processed synchronously
        setAlert({
          type: 'success',
          message: `Successfully uploaded "${file_name}" with ${total_records.toLocaleString()} records.`,
        });
        setSelectedFile(null);
        setPreviewData(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Upload failed. Please try again.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Drag event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {/* Alert messages */}
      {alert && (
        <Alert
          variant={alert.type}
          dismissible
          onClose={() => setAlert(null)}
          className="mb-3"
        >
          {alert.type === 'success' ? (
            <BsCheckCircleFill className="me-2" />
          ) : (
            <BsXCircleFill className="me-2" />
          )}
          {alert.message}
        </Alert>
      )}

      {/* Drag & Drop Zone */}
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        id="upload-dropzone"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".xlsx,.xls,.csv"
          hidden
          id="file-input"
        />

        {selectedFile ? (
          <div>
            <BsFileEarmarkExcelFill className="upload-icon" style={{ color: 'var(--accent)' }} />
            <h5>{selectedFile.name}</h5>
            <p className="mb-0 text-muted">
              {(selectedFile.size / 1024).toFixed(1)} KB — Click or drag another file to replace
            </p>
          </div>
        ) : (
          <div>
            <BsCloudUploadFill className="upload-icon" />
            <h5>Drag & Drop your file here</h5>
            <p className="mb-0 text-muted">or click to browse — Supports .xlsx, .xls, .csv</p>
          </div>
        )}
      </div>

      {previewing && (
        <div className="text-center mt-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span className="text-muted">Analyzing file...</span>
        </div>
      )}

      {/* Data Preview */}
      {previewData && !uploading && !previewing && (() => {
        const records = previewData.records || [];
        const columns = records.length > 0 ? Object.keys(records[0]) : [];
        const sampleRows = records.slice(0, 5);
        return (
        <div className="mt-4 fade-in">
          <div className="d-flex align-items-center mb-2">
            <BsEyeFill className="me-2 text-primary" />
            <h6 className="mb-0 fw-bold">Data Preview</h6>
          </div>
          <p className="text-muted small mb-2">
            Found <strong>{previewData.total_records}</strong> valid rows. Here is a preview of the first {sampleRows.length} rows:
          </p>
          <div className="table-responsive bg-darker rounded p-2 border border-light">
            <Table hover size="sm" className="table-dark-custom mb-0" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, r_idx) => (
                  <tr key={r_idx}>
                    {columns.map((col, c_idx) => (
                      <td key={c_idx}>{row[col] != null ? String(row[col]) : '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
        );
      })()}

      {/* Upload progress bar */}
      {uploading && (
        <div className="mt-4">
          <ProgressBar
            now={progress}
            animated
            striped
            label={`${progress}%`}
            className="mb-2"
          />
          <div className="text-center small text-muted">Importing records, please wait...</div>
        </div>
      )}

      {/* Confirm Import button */}
      {selectedFile && previewData && !uploading && (
        <div className="mt-4 d-flex justify-content-end gap-2 border-top border-secondary pt-3">
          <button
            className="btn btn-outline-light px-4"
            onClick={() => {
              setSelectedFile(null);
              setPreviewData(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            id="cancel-upload-btn"
          >
            Cancel
          </button>
          <button
            className="btn btn-accent px-4"
            onClick={handleUpload}
            id="upload-btn"
          >
            <BsCloudUploadFill className="me-2" />
            Confirm & Import
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadExcel;
