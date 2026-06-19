// ============================================================
// components/StudentTable.jsx
// Responsive Bootstrap table with search, sort, pagination,
// and action buttons for student CRUD operations
// ============================================================

import { useState } from 'react';
import { Table, Pagination, Form, InputGroup, Modal, Button, Spinner } from 'react-bootstrap';
import { BsSearch, BsFunnelFill, BsPencilSquare, BsTrash3Fill, BsEyeFill, BsSortDown, BsSortUp } from 'react-icons/bs';

const StudentTable = ({
  students,
  totalPages,
  currentPage,
  onPageChange,
  onSearch,
  onCourseFilter,
  onStatusFilter,
  onSort,
  sortBy,
  sortOrder,
  courses,
  onEdit,
  onDelete,
  loading,
}) => {
  const [viewStudent, setViewStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Handle search input with debounce effect
  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  // Handle course filter change
  const handleCourseFilter = (value) => {
    setSelectedCourse(value);
    onCourseFilter(value);
  };

  // Handle status filter change
  const handleStatusFilter = (value) => {
    setSelectedStatus(value);
    if (onStatusFilter) onStatusFilter(value);
  };

  // Handle column sort click
  const handleSort = (column) => {
    onSort(column);
  };

  // Render sort indicator
  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <BsSortUp className="ms-1" size={12} />
    ) : (
      <BsSortDown className="ms-1" size={12} />
    );
  };

  // Build pagination items
  const renderPagination = () => {
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    items.push(
      <Pagination.First
        key="first"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      />
    );
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <InputGroup>
            <InputGroup.Text style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
            }}>
              <BsSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              id="student-search"
            />
          </InputGroup>
        </div>
        <div className="col-12 col-md-3">
          <InputGroup>
            <InputGroup.Text style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
            }}>
              <BsFunnelFill />
            </InputGroup.Text>
            <Form.Select
              value={selectedCourse}
              onChange={(e) => handleCourseFilter(e.target.value)}
              id="course-filter"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </InputGroup>
        </div>
        <div className="col-12 col-md-3">
          <InputGroup>
            <InputGroup.Text style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
            }}>
              <BsFunnelFill />
            </InputGroup.Text>
            <Form.Select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              id="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
            </Form.Select>
          </InputGroup>
        </div>
      </div>

      {/* Student Table */}
      <div className="table-responsive">
        {loading ? (
          <div className="loading-spinner">
            <Spinner animation="border" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <Table hover className="table-dark-custom mb-0">
            <thead>
              <tr>
                <th>Photo</th>
                <th onClick={() => handleSort('id')}>
                  ID <SortIcon column="id" />
                </th>
                <th onClick={() => handleSort('student_name')}>
                  Name <SortIcon column="student_name" />
                </th>
                <th onClick={() => handleSort('email')}>
                  Email <SortIcon column="email" />
                </th>
                <th className="d-none d-md-table-cell">Phone</th>
                <th onClick={() => handleSort('course')}>
                  Course <SortIcon column="course" />
                </th>
                <th onClick={() => handleSort('department')}>
                  Department <SortIcon column="department" />
                </th>
                <th className="d-none d-lg-table-cell" onClick={() => handleSort('year')}>
                  Year <SortIcon column="year" />
                </th>
                <th className="d-none d-lg-table-cell" onClick={() => handleSort('city')}>
                  City <SortIcon column="city" />
                </th>
                <th onClick={() => handleSort('status')}>
                  Status <SortIcon column="status" />
                </th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      {student.photo ? (
                        <img src={student.photo} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                          {student.student_name ? student.student_name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </td>
                    <td>{student.id}</td>
                    <td style={{ fontWeight: 500 }}>{student.student_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.email || '—'}</td>
                    <td className="d-none d-md-table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {student.phone || '—'}
                    </td>
                    <td>
                      {student.course ? (
                        <span className="badge-course">{student.course}</span>
                      ) : '—'}
                    </td>
                    <td>{student.department || '—'}</td>
                    <td className="d-none d-lg-table-cell">{student.year || '—'}</td>
                    <td className="d-none d-lg-table-cell">{student.city || '—'}</td>
                    <td>
                      <span className={`badge ${student.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-light p-1"
                          onClick={() => setViewStudent(student)}
                          title="View details"
                        >
                          <BsEyeFill size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-light p-1"
                          onClick={() => onEdit(student)}
                          title="Edit student"
                        >
                          <BsPencilSquare size={14} />
                        </button>
                        <button
                          className="btn btn-sm p-1"
                          style={{ color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}
                          onClick={() => setDeleteConfirm(student)}
                          title="Delete student"
                        >
                          <BsTrash3Fill size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination size="sm">{renderPagination()}</Pagination>
        </div>
      )}

      {/* View Student Modal */}
      <Modal show={!!viewStudent} onHide={() => setViewStudent(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewStudent && (
            <div className="row g-3">
              {[
                ['ID', viewStudent.id],
                ['Name', viewStudent.student_name],
                ['Email', viewStudent.email],
                ['Phone', viewStudent.phone],
                ['Course', viewStudent.course],
                ['Department', viewStudent.department],
                ['Year', viewStudent.year],
                ['City', viewStudent.city],
                ['Status', viewStudent.status || 'Active'],
              ].map(([label, value]) => (
                <div className="col-6" key={label}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    {label}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    {value || '—'}
                  </div>
                </div>
              ))}
              {viewStudent.photo && (
                <div className="col-12 text-center mt-3">
                  <img src={viewStudent.photo} alt="Photo" style={{ maxWidth: '150px', borderRadius: '8px' }} />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deleteConfirm?.student_name}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onDelete(deleteConfirm.id);
              setDeleteConfirm(null);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentTable;
