// ============================================================
// pages/Courses.jsx
// Full Courses module — browse, search, and view course data
// ============================================================

import { useState, useEffect } from 'react';
import { dashboardAPI, exportAPI } from '../services/api';
import { Table, Spinner, InputGroup, Form, Toast, ToastContainer } from 'react-bootstrap';
import { BsSearch, BsBookFill, BsPeopleFill, BsCheckCircleFill, BsFileEarmarkExcelFill, BsFiletypeCsv, BsCalendarFill } from 'react-icons/bs';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getCourses();
      setCourses(response.data);
      setFiltered(response.data);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(courses); return; }
    const term = search.toLowerCase();
    setFiltered(courses.filter(c =>
      c.course?.toLowerCase().includes(term) ||
      c.department?.toLowerCase().includes(term)
    ));
  }, [search, courses]);

  const totalStudents = filtered.reduce((sum, c) => sum + (c.total_students || 0), 0);
  const totalActive = filtered.reduce((sum, c) => sum + (c.active_students || 0), 0);

  const handleExport = async (format) => {
    try {
      const response = format === 'xlsx'
        ? await exportAPI.exportExcel({ type: 'courses' })
        : await exportAPI.exportCSV({ type: 'courses' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `courses_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToastMsg(`Courses exported as ${format.toUpperCase()}`);
      setShowToast(true);
    } catch (err) {
      setToastMsg('Export failed.');
      setShowToast(true);
    }
  };

  return (
    <div className="animate-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold mb-1">Courses</h2>
          <p className="text-muted mb-0">Manage and view all courses across departments.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light" onClick={() => handleExport('xlsx')} id="export-courses-excel">
            <BsFileEarmarkExcelFill className="me-2 text-success" /> Export Excel
          </button>
          <button className="btn btn-outline-light" onClick={() => handleExport('csv')} id="export-courses-csv">
            <BsFiletypeCsv className="me-2 text-warning" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="stat-card card-courses">
            <div className="stat-icon"><BsBookFill /></div>
            <div className="stat-value">{filtered.length}</div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="stat-card card-students">
            <div className="stat-icon"><BsPeopleFill /></div>
            <div className="stat-value">{totalStudents.toLocaleString()}</div>
            <div className="stat-label">Total Enrolled</div>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="stat-card card-files">
            <div className="stat-icon"><BsCheckCircleFill /></div>
            <div className="stat-value">{totalActive.toLocaleString()}</div>
            <div className="stat-label">Active Students</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="data-card">
        <div className="data-card-body">
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <InputGroup>
                <InputGroup.Text style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search courses or departments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="course-search"
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
                    <th>Course Name</th>
                    <th>Department</th>
                    <th>Total Students</th>
                    <th>Active Students</th>
                    <th>Avg. Grad Year</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No courses found.</td></tr>
                  ) : filtered.map((c, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,212,170,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4aa', fontSize: '0.9rem', flexShrink: 0 }}>
                            <BsBookFill />
                          </div>
                          <span style={{ fontWeight: 600 }}>{c.course}</span>
                        </div>
                      </td>
                      <td><span className="badge-course">{c.department}</span></td>
                      <td><strong>{c.total_students}</strong></td>
                      <td>
                        <span className="badge bg-success">{c.active_students}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                          <BsCalendarFill size={12} /> {c.avg_year || '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
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

export default Courses;
