// ============================================================
// pages/Departments.jsx
// Full Departments module — browse, search, and view department data
// ============================================================

import { useState, useEffect } from 'react';
import { dashboardAPI, exportAPI } from '../services/api';
import { Table, Spinner, InputGroup, Form, Toast, ToastContainer, ProgressBar } from 'react-bootstrap';
import { BsSearch, BsBuilding, BsPeopleFill, BsBookFill, BsCheckCircleFill, BsFileEarmarkExcelFill, BsFiletypeCsv } from 'react-icons/bs';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDepartments();
      setDepartments(response.data);
      setFiltered(response.data);
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(departments); return; }
    const term = search.toLowerCase();
    setFiltered(departments.filter(d => d.department?.toLowerCase().includes(term)));
  }, [search, departments]);

  const totalStudents = filtered.reduce((sum, d) => sum + (d.total_students || 0), 0);
  const totalCourses = filtered.reduce((sum, d) => sum + (d.course_count || 0), 0);
  const totalActive = filtered.reduce((sum, d) => sum + (d.active_students || 0), 0);
  const maxStudents = Math.max(...filtered.map(d => d.total_students || 0), 1);

  const handleExport = async (format) => {
    try {
      const response = format === 'xlsx'
        ? await exportAPI.exportExcel({ type: 'departments' })
        : await exportAPI.exportCSV({ type: 'departments' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `departments_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToastMsg(`Departments exported as ${format.toUpperCase()}`);
      setShowToast(true);
    } catch (err) {
      setToastMsg('Export failed.');
      setShowToast(true);
    }
  };

  const deptColors = ['#4f6ef7', '#00d4aa', '#f59e0b', '#ec4899', '#6c63ff', '#10b981', '#ef4444', '#0ea5e9'];

  return (
    <div className="animate-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold mb-1">Departments</h2>
          <p className="text-muted mb-0">Overview of all academic departments and their capacity.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light" onClick={() => handleExport('xlsx')} id="export-dept-excel">
            <BsFileEarmarkExcelFill className="me-2 text-success" /> Export Excel
          </button>
          <button className="btn btn-outline-light" onClick={() => handleExport('csv')} id="export-dept-csv">
            <BsFiletypeCsv className="me-2 text-warning" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="stat-card card-courses">
            <div className="stat-icon"><BsBuilding /></div>
            <div className="stat-value">{filtered.length}</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="stat-card card-students">
            <div className="stat-icon"><BsBookFill /></div>
            <div className="stat-value">{totalCourses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="stat-card card-files">
            <div className="stat-icon"><BsPeopleFill /></div>
            <div className="stat-value">{totalStudents.toLocaleString()}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Table */}
        <div className="col-12 col-xl-7">
          <div className="data-card h-100">
            <div className="data-card-body">
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <InputGroup>
                    <InputGroup.Text style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <BsSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search departments..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      id="dept-search"
                    />
                  </InputGroup>
                </div>
              </div>

              {loading ? (
                <div className="loading-spinner"><Spinner animation="border" style={{ color: 'var(--primary)' }} /></div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="table-dark-custom mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Department</th>
                        <th>Courses</th>
                        <th>Students</th>
                        <th>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-muted">No departments found.</td></tr>
                      ) : filtered.map((d, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${deptColors[idx % deptColors.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: deptColors[idx % deptColors.length], fontSize: '0.9rem', flexShrink: 0 }}>
                                <BsBuilding />
                              </div>
                              <span style={{ fontWeight: 600 }}>{d.department}</span>
                            </div>
                          </td>
                          <td><span className="badge-course">{d.course_count}</span></td>
                          <td><strong>{d.total_students}</strong></td>
                          <td><span className="badge bg-success">{d.active_students}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Distribution Panel */}
        <div className="col-12 col-xl-5">
          <div className="data-card h-100">
            <div className="data-card-header">
              <h5>Student Distribution by Department</h5>
            </div>
            <div className="data-card-body">
              {filtered.length === 0 ? (
                <div className="text-center py-4 text-muted">No data available.</div>
              ) : filtered.map((d, idx) => (
                <div key={idx} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{d.department}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.total_students} students</span>
                  </div>
                  <ProgressBar
                    now={(d.total_students / maxStudents) * 100}
                    style={{ height: 8, background: 'rgba(255,255,255,0.05)' }}
                  >
                    <ProgressBar
                      now={(d.total_students / maxStudents) * 100}
                      style={{ background: deptColors[idx % deptColors.length] }}
                    />
                  </ProgressBar>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="dark">
          <Toast.Body className="text-white fw-bold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Departments;
