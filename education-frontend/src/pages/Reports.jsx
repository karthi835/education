// ============================================================
// pages/Reports.jsx
// Centralized Reporting Interface for exporting data.
// ============================================================

import { useState } from 'react';
import { exportAPI } from '../services/api';
import { ToastContainer, Toast, Spinner } from 'react-bootstrap';
import { BsFileEarmarkExcelFill, BsFiletypeCsv, BsFileEarmarkPdfFill, BsPeopleFill, BsJournalBookmarkFill, BsBuilding } from 'react-icons/bs';

const Reports = () => {
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [exporting, setExporting] = useState(null);

  const showFeedbackToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const handleExport = async (dataset, format) => {
    setExporting(`${dataset}-${format}`);
    try {
      let response;
      let filename = `${dataset}_report.${format}`;
      
      if (format === 'xlsx') {
        response = await exportAPI.exportExcel({ type: dataset });
      } else if (format === 'csv') {
        response = await exportAPI.exportCSV({ type: dataset });
      }

      if (response && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showFeedbackToast(`Successfully exported ${filename}`);
      }
    } catch (err) {
      showFeedbackToast(`Failed to export ${dataset} report.`);
    } finally {
      setExporting(null);
    }
  };

  const reportModules = [
    {
      id: 'students',
      title: 'Student Data Report',
      description: 'Export complete student directory including personal details, course enrollment, and status.',
      icon: <BsPeopleFill size={32} style={{ color: '#3b82f6' }} />,
      color: '#3b82f6'
    },
    {
      id: 'courses',
      title: 'Course Analytics Report',
      description: 'Export aggregate metrics on course enrollment, popularity, and historical trends.',
      icon: <BsJournalBookmarkFill size={32} style={{ color: '#10b981' }} />,
      color: '#10b981'
    },
    {
      id: 'departments',
      title: 'Department Overview',
      description: 'Export high-level department statistics, capacity metrics, and resource allocation.',
      icon: <BsBuilding size={32} style={{ color: '#8b5cf6' }} />,
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="animate-in">
      <div className="mb-4">
        <h2 className="fs-4 fw-bold mb-1">Data Reports</h2>
        <p className="text-muted mb-0">Generate and export administrative reports in various formats.</p>
      </div>

      <div className="row g-4">
        {reportModules.map((mod) => (
          <div className="col-12 col-xl-4 col-md-6" key={mod.id}>
            <div className="data-card h-100">
              <div className="data-card-body d-flex flex-column h-100">
                <div className="d-flex align-items-center mb-3">
                  <div 
                    className="rounded p-3 me-3 d-flex align-items-center justify-content-center"
                    style={{ background: `${mod.color}15` }}
                  >
                    {mod.icon}
                  </div>
                  <h5 className="mb-0 fw-bold">{mod.title}</h5>
                </div>
                
                <p className="text-muted small mb-4 flex-grow-1">
                  {mod.description}
                </p>

                <div className="d-flex flex-column gap-2 mt-auto border-top border-secondary pt-3">
                  <button 
                    className="btn btn-outline-light text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleExport(mod.id, 'xlsx')}
                    disabled={exporting !== null}
                    id={`export-${mod.id}-xlsx`}
                  >
                    <div><BsFileEarmarkExcelFill className="me-2 text-success" /> Export Excel (.xlsx)</div>
                    {exporting === `${mod.id}-xlsx` && <Spinner size="sm" animation="border" />}
                  </button>
                  <button 
                    className="btn btn-outline-light text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleExport(mod.id, 'csv')}
                    disabled={exporting !== null}
                    id={`export-${mod.id}-csv`}
                  >
                    <div><BsFiletypeCsv className="me-2 text-warning" /> Export CSV (.csv)</div>
                    {exporting === `${mod.id}-csv` && <Spinner size="sm" animation="border" />}
                  </button>
                  <button 
                    className="btn btn-outline-light text-start d-flex justify-content-between align-items-center"
                    disabled={true}
                    title="PDF Export coming soon"
                    id={`export-${mod.id}-pdf`}
                  >
                    <div><BsFileEarmarkPdfFill className="me-2 text-danger" /> Export PDF (.pdf)</div>
                    <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>Soon</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="dark">
          <Toast.Body className="text-white fw-bold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Reports;
