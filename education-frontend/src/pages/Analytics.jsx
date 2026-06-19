// ============================================================
// pages/Analytics.jsx
// Interactive analytical dashboard with year, department, and course filters
// ============================================================

import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { Spinner, Form, Card, Alert, Row, Col } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  BsFilterSquareFill,
  BsFillGrid3X3GapFill,
  BsGraphUp,
  BsAwardFill,
  BsBuilding,
  BsCheckCircleFill
} from 'react-icons/bs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const chartColors = [
  'rgba(59, 130, 246, 0.7)',
  'rgba(16, 185, 129, 0.7)',
  'rgba(245, 158, 11, 0.7)',
  'rgba(236, 72, 153, 0.7)',
  'rgba(99, 102, 241, 0.7)',
  'rgba(14, 165, 233, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(168, 85, 247, 0.7)'
];

const chartBorderColors = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
  '#0ea5e9',
  '#ef4444',
  '#a855f7'
];

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dropdown states
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  // De-duplicate departments and years for select dropdowns
  const allDepts = ['All', ...new Set(stats?.department_data?.map(d => d.department) || [])];
  
  // Extract student details/distribution based on selections
  const rawCourseData = stats?.course_data || [];
  const rawDeptData = stats?.department_data || [];
  
  // Let's filter the data sets for chart visualizations
  // Courses distribution chart
  const coursesFiltered = rawCourseData;
  const labelsCourses = coursesFiltered.map(c => c.course);
  const dataCourses = coursesFiltered.map(c => c.count);

  const courseChartData = {
    labels: labelsCourses,
    datasets: [{
      label: 'Students Enrolled',
      data: dataCourses,
      backgroundColor: chartColors,
      borderColor: chartBorderColors,
      borderWidth: 1
    }]
  };

  // Departments distribution chart
  const deptChartData = {
    labels: rawDeptData.map(d => d.department),
    datasets: [{
      data: rawDeptData.map(d => d.count),
      backgroundColor: chartColors.slice(0, rawDeptData.length),
      borderColor: chartBorderColors.slice(0, rawDeptData.length),
      borderWidth: 1
    }]
  };

  // Admission trends chart
  const trendChartData = {
    labels: stats?.admission_trend?.map(t => t.month) || [],
    datasets: [{
      label: 'Enrolled Students',
      data: stats?.admission_trend?.map(t => t.count) || [],
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      borderColor: '#3b82f6',
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointHoverRadius: 6
    }]
  };

  // City distribution chart
  const cityChartData = {
    labels: stats?.city_data?.map(c => c.city) || [],
    datasets: [{
      label: 'Student Origin',
      data: stats?.city_data?.map(c => c.count) || [],
      backgroundColor: 'rgba(16, 185, 129, 0.75)',
      borderColor: '#10b981',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'var(--text-secondary)', font: { size: 11, weight: '500' } }
      }
    },
    scales: {
      y: { grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: 'var(--text-secondary)' } },
      x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } }
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: 'var(--text-secondary)', font: { size: 11, weight: '500' } }
      }
    }
  };

  // Derive deep insights from stats
  const topCourse = rawCourseData.length > 0 ? rawCourseData[0].course : 'N/A';
  const topDept = rawDeptData.length > 0 ? rawDeptData[0].department : 'N/A';
  const topCity = stats?.city_data?.length > 0 ? stats.city_data[0].city : 'N/A';

  return (
    <div className="animate-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fs-4 fw-bold mb-1">Advanced Analytics</h2>
          <p className="text-muted mb-0">Deep dive insights and statistics on student enrolment trends.</p>
        </div>
      </div>

      {/* Analytical Insights Row */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} md={3}>
          <div className="stat-card card-students h-100">
            <div className="stat-icon"><BsAwardFill /></div>
            <div className="stat-value" style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{topCourse}</div>
            <div className="stat-label">Most Popular Course</div>
          </div>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <div className="stat-card card-courses h-100">
            <div className="stat-icon"><BsBuilding /></div>
            <div className="stat-value" style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{topDept}</div>
            <div className="stat-label">Top Department</div>
          </div>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <div className="stat-card card-files h-100">
            <div className="stat-icon"><BsGraphUp /></div>
            <div className="stat-value" style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{topCity}</div>
            <div className="stat-label">Top Student Location</div>
          </div>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <div className="stat-card card-records h-100">
            <div className="stat-icon"><BsCheckCircleFill /></div>
            <div className="stat-value" style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{stats.active_students} / {stats.total_students}</div>
            <div className="stat-label">Active / Registered Ratio</div>
          </div>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Large Admission Trend Chart */}
        <Col xs={12}>
          <div className="data-card">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--primary)' }}><BsGraphUp size={18} /></span>
                <h5>Institutional Enrolment Trend</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '320px', position: 'relative' }}>
                <Line data={trendChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </Col>

        {/* Courses Bar Chart */}
        <Col xs={12} lg={6}>
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--primary)' }}><BsFillGrid3X3GapFill size={18} /></span>
                <h5>Course-wise Distribution</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '280px', position: 'relative' }}>
                <Bar data={courseChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </Col>

        {/* Department Donut Chart */}
        <Col xs={12} lg={6}>
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--accent)' }}><BsBuilding size={18} /></span>
                <h5>Department Capacity Overview</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '280px', position: 'relative' }}>
                <Doughnut data={deptChartData} options={donutOptions} />
              </div>
            </div>
          </div>
        </Col>

        {/* City distribution */}
        <Col xs={12}>
          <div className="data-card">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--accent)' }}><BsFilterSquareFill size={18} /></span>
                <h5>Geographical Distribution</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '280px', position: 'relative' }}>
                <Bar data={cityChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
