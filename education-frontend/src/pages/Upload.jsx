// ============================================================
// pages/Upload.jsx
// Drag and drop spreadsheet upload interface with import history logs
// ============================================================

import { useState, useEffect } from 'react';
import { uploadAPI } from '../services/api';
import UploadExcel from '../components/UploadExcel';
import { Table, Spinner } from 'react-bootstrap';
import { BsCloudUploadFill, BsClockHistory } from 'react-icons/bs';

const Upload = () => {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchUploadHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await uploadAPI.getHistory();
      setUploadHistory(response.data);
    } catch (err) {
      console.error('Failed to load upload history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  return (
    <div className="row g-4 animate-in">
      {/* Excel Upload Module Panel */}
      <div className="col-12 col-xl-7">
        <div className="data-card h-100">
          <div className="data-card-header">
            <div className="d-flex align-items-center gap-2">
              <span style={{ color: 'var(--primary)' }}><BsCloudUploadFill size={18} /></span>
              <h5>Excel / CSV File Importer</h5>
            </div>
          </div>
          <div className="data-card-body">
            <p className="text-secondary small mb-4">
              Drag and drop an Excel (.xlsx, .xls) or CSV (.csv) student list template.
              The parser automatically matches headers (like Name, Email, Course, Phone) and stores them in PostgreSQL.
            </p>

            <UploadExcel onUploadSuccess={fetchUploadHistory} />

            <div className="mt-4 p-3 bg-input border-1 rounded border-light" style={{ fontSize: '0.8rem' }}>
              <h6 className="fw-bold mb-2 text-primary">💡 Import Guidelines:</h6>
              <ul className="mb-0 ps-3 text-secondary">
                <li>Make sure the first row of your spreadsheet contains column headers.</li>
                <li>Required: A name column containing student names.</li>
                <li>Optional: Email, Phone, Course, Department, Year, City.</li>
                <li>Data formats: Years must be numerical integers (e.g., 2024).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* History Log Panel */}
      <div className="col-12 col-xl-5">
        <div className="data-card h-100">
          <div className="data-card-header">
            <div className="d-flex align-items-center gap-2">
              <span style={{ color: '#f59e0b' }}><BsClockHistory size={18} /></span>
              <h5>Uploaded Files History</h5>
            </div>
          </div>
          <div className="data-card-body p-0">
            {historyLoading ? (
              <div className="loading-spinner">
                <Spinner animation="border" style={{ color: 'var(--primary)' }} />
              </div>
            ) : uploadHistory.length === 0 ? (
              <div className="text-center py-5 text-muted small">
                No uploads recorded yet. Imported spreadsheets will show up here.
              </div>
            ) : (
              <Table hover className="table-dark-custom mb-0 text-start">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Records</th>
                    <th>Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadHistory.map((upload) => (
                    <tr key={upload.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{upload.file_name}</td>
                      <td>
                        <span className="badge bg-primary px-2 py-1">{upload.total_records}</span>
                      </td>
                      <td className="small text-muted">
                        {new Date(upload.uploaded_at).toLocaleDateString()} at{' '}
                        {new Date(upload.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
