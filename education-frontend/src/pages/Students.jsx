// ============================================================
// pages/Students.jsx
// Main Student directory dashboard supporting CRUD actions, Search,
// Filtering, Sorting, Pagination, and Excel/CSV exporting.
// ============================================================

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { studentsAPI, exportAPI, dashboardAPI } from '../services/api';
import StudentTable from '../components/StudentTable';
import { Modal, Form, Button, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { BsPlusLg, BsFileEarmarkExcelFill, BsFiletypeCsv } from 'react-icons/bs';

const Students = () => {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Table parameters
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal control
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Fetch Student listing
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll({
        page,
        per_page: perPage,
        search,
        course: courseFilter,
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setStudents(response.data.students);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      setError('Could not fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unique courses for filter dropdown
  const fetchCourses = async () => {
    try {
      const response = await dashboardAPI.getStats();
      const list = response.data.course_data.map((c) => c.course).filter(Boolean);
      setCourses(list);
    } catch (err) {
      console.error('Failed to load courses', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, courseFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle URL parameters for exports
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('export') === 'true') {
      // Auto-trigger export modal or actions if needed
    }
  }, [location]);

  // Open modal for Create/Edit
  const handleOpenModal = (student = null) => {
    if (student) {
      setEditStudent(student);
      setFormName(student.student_name);
      setFormEmail(student.email || '');
      setFormPhone(student.phone || '');
      setFormCourse(student.course || '');
      setFormDepartment(student.department || '');
      setFormYear(student.year || '');
      setFormCity(student.city || '');
      setFormStatus(student.status || 'Active');
      setFormPhotoUrl(student.photo || '');
    } else {
      setEditStudent(null);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormCourse('');
      setFormDepartment('');
      setFormYear('');
      setFormCity('');
      setFormStatus('Active');
      setFormPhotoUrl('');
    }
    setShowAddEdit(true);
  };

  // Submit manual record creation or updates
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      student_name: formName,
      email: formEmail || null,
      phone: formPhone || null,
      course: formCourse || null,
      department: formDepartment || null,
      year: formYear ? parseInt(formYear) : null,
      city: formCity || null,
      status: formStatus,
      photo: formPhotoUrl || null,
    };

    try {
      if (editStudent) {
        await studentsAPI.update(editStudent.id, payload);
        showFeedbackToast('Student updated successfully!');
      } else {
        await studentsAPI.create(payload);
        showFeedbackToast('Student added successfully!');
      }
      setShowAddEdit(false);
      fetchStudents();
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.detail || 'Validation failed. Check your inputs.');
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    try {
      await studentsAPI.delete(id);
      showFeedbackToast('Student record deleted successfully.');
      fetchStudents();
      fetchCourses();
    } catch (err) {
      showFeedbackToast('Failed to delete student.');
    }
  };

  // Helper trigger for toast notifications
  const showFeedbackToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  // Export functions
  const handleExportExcel = async () => {
    try {
      const response = await exportAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showFeedbackToast('Excel file exported successfully!');
    } catch (err) {
      showFeedbackToast('Failed to export Excel file.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await exportAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showFeedbackToast('CSV file exported successfully!');
    } catch (err) {
      showFeedbackToast('Failed to export CSV file.');
    }
  };

  return (
    <div className="animate-in">
      {/* Directory Control Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold mb-1">Student Directory</h2>
          <p className="text-muted mb-0">Browse, search, edit, or manually add student profiles.</p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-light" onClick={handleExportExcel} id="export-excel-btn">
            <BsFileEarmarkExcelFill className="me-2 text-success" /> Export Excel
          </button>
          <button className="btn btn-outline-light" onClick={handleExportCSV} id="export-csv-btn">
            <BsFiletypeCsv className="me-2 text-warning" /> Export CSV
          </button>
          <button className="btn btn-accent" onClick={() => handleOpenModal()} id="add-student-btn">
            <BsPlusLg className="me-2" /> Add Student
          </button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Main Student Table */}
      <div className="data-card">
        <div className="data-card-body">
          <StudentTable
            students={students}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
            onSearch={setSearch}
            onCourseFilter={setCourseFilter}
            onStatusFilter={setStatusFilter}
            onSort={(column) => {
              if (sortBy === column) {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy(column);
                setSortOrder('asc');
              }
            }}
            sortBy={sortBy}
            sortOrder={sortOrder}
            courses={courses}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal show={showAddEdit} onHide={() => setShowAddEdit(false)} centered size="lg">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editStudent ? 'Edit Student Details' : 'Add New Student'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label>Student Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter student full name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    id="form-student-name"
                  />
                </Form.Group>
              </div>

              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="student@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    id="form-student-email"
                  />
                </Form.Group>
              </div>

              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    id="form-student-phone"
                  />
                </Form.Group>
              </div>

              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label>Course / Subject</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Computer Science, Physics..."
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    id="form-student-course"
                  />
                </Form.Group>
              </div>

              <div className="col-12 col-md-4">
                <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Engineering, Arts..."
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    id="form-student-dept"
                  />
                </Form.Group>
              </div>

              <div className="col-12 col-md-4">
                <Form.Group>
                  <Form.Label>Academic Year (Graduation)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="2026"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    id="form-student-year"
                  />
                </Form.Group>
              </div>

              <div className="col-12 col-md-4">
                <Form.Group>
                  <Form.Label>City / Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="New York, Boston..."
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    id="form-student-city"
                  />
                </Form.Group>
              </div>

              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label>Student Status</Form.Label>
                  <Form.Select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    id="form-student-status"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Suspended">Suspended</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label>Photo URL</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    id="form-student-photo"
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddEdit(false)} id="form-cancel-btn">
              Cancel
            </Button>
            <button className="btn btn-accent" type="submit" id="form-save-btn">
              {editStudent ? 'Save Changes' : 'Add Student'}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Toast Feedback notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="dark">
          <Toast.Body className="text-white font-weight-bold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Students;
