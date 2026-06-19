// ============================================================
// pages/Dashboard.jsx
// Main analytical dashboard with charts, stats, and activity logs
// ============================================================

import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import DashboardCards from '../components/DashboardCards';
import { Spinner, Alert } from 'react-bootstrap';
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
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { 
  BsClockHistory, 
  BsBarChartLineFill, 
  BsPieChartFill,
  BsGraphUp,
  BsGeoAltFill,
  BsBuilding
} from 'react-icons/bs';

// Register Chart.js components
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
  'rgba(79, 110, 247, 0.7)',
  'rgba(0, 212, 170, 0.7)',
  'rgba(245, 158, 11, 0.7)',
  'rgba(236, 72, 153, 0.7)',
  'rgba(108, 99, 255, 0.7)',
  'rgba(16, 185, 129, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(14, 165, 233, 0.7)'
];

const chartBorderColors = [
  '#4f6ef7',
  '#00d4aa',
  '#f59e0b',
  '#ec4899',
  '#6c63ff',
  '#10b981',
  '#ef4444',
  '#0ea5e9'
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard metrics. Please reload the page.');
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

  // 1. Students by Course (Bar Chart)
  const courses = stats?.course_data?.map((c) => c.course) || [];
  const courseCounts = stats?.course_data?.map((c) => c.count) || [];
  const courseBarData = {
    labels: courses,
    datasets: [{
      label: 'Students Enrolled',
      data: courseCounts,
      backgroundColor: chartColors,
      borderColor: chartBorderColors,
      borderWidth: 1,
    }],
  };

  // 2. Students by Department (Donut Chart)
  const departments = stats?.department_data?.map((d) => d.department) || [];
  const deptCounts = stats?.department_data?.map((d) => d.count) || [];
  const departmentDonutData = {
    labels: departments,
    datasets: [{
      data: deptCounts,
      backgroundColor: chartColors,
      borderColor: chartBorderColors,
      borderWidth: 1,
    }],
  };

  // 3. Admission Trend (Area Chart)
  const admissionMonths = stats?.admission_trend?.map((t) => t.month) || [];
  const admissionCounts = stats?.admission_trend?.map((t) => t.count) || [];
  const admissionTrendData = {
    labels: admissionMonths,
    datasets: [{
      label: 'New Admissions',
      data: admissionCounts,
      fill: true,
      backgroundColor: 'rgba(79, 110, 247, 0.2)',
      borderColor: '#4f6ef7',
      tension: 0.4
    }],
  };

  // 4. Students by City (Bar Chart)
  const cities = stats?.city_data?.map((c) => c.city) || [];
  const cityCounts = stats?.city_data?.map((c) => c.count) || [];
  const cityBarData = {
    labels: cities,
    datasets: [{
      label: 'Students',
      data: cityCounts,
      backgroundColor: 'rgba(0, 212, 170, 0.7)',
      borderColor: '#00d4aa',
      borderWidth: 1,
    }],
  };

  // 5. Upload Activity (Line Chart)
  const uploadDates = stats?.upload_activity?.map((u) => u.date) || [];
  const uploadCounts = stats?.upload_activity?.map((u) => u.count) || [];
  const uploadActivityData = {
    labels: uploadDates,
    datasets: [{
      label: 'Files Uploaded',
      data: uploadCounts,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      tension: 0.3,
      fill: false
    }],
  };

  // 6. Course Popularity (Pie Chart) -> reuse course data
  const coursePieData = courseBarData; 

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'var(--text-secondary)', font: { size: 11 } }
      }
    }
  };

  const barOptions = {
    ...commonOptions,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(0, 0, 0, 0.06)' }, ticks: { color: 'var(--text-secondary)' } },
      x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      y: { grid: { color: 'rgba(0, 0, 0, 0.06)' }, ticks: { color: 'var(--text-secondary)', precision: 0 } },
      x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } },
    },
  };

  const pieOptions = {
    ...commonOptions,
    plugins: { legend: { position: 'right', labels: { color: 'var(--text-secondary)', font: { size: 11 } } } }
  };

  return (
    <div className="animate-in">
      <DashboardCards stats={stats} />

      <div className="row g-4 mb-4">
        {/* 1. Course distribution Bar Chart */}
        <div className="col-12 col-xl-8">
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--primary)' }}><BsBarChartLineFill size={18} /></span>
                <h5>Students by Course</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                {courses.length > 0 ? (
                  <Bar data={courseBarData} options={barOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Students by Department Donut Chart */}
        <div className="col-12 col-xl-4">
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--accent)' }}><BsBuilding size={18} /></span>
                <h5>Students by Department</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                {departments.length > 0 ? (
                  <Doughnut data={departmentDonutData} options={pieOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Admission Trend Area Chart */}
        <div className="col-12 col-xl-6">
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#4f6ef7' }}><BsGraphUp size={18} /></span>
                <h5>Admission Trend</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                {admissionMonths.length > 0 ? (
                  <Line data={admissionTrendData} options={lineOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Students by City Bar Chart */}
        <div className="col-12 col-xl-6">
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#00d4aa' }}><BsGeoAltFill size={18} /></span>
                <h5>Students by City</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                {cities.length > 0 ? (
                  <Bar data={cityBarData} options={barOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Upload Activity Line Chart */}
        <div className="col-12 col-xl-6">
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#f59e0b' }}><BsClockHistory size={18} /></span>
                <h5>Upload Activity</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                {uploadDates.length > 0 ? (
                  <Line data={uploadActivityData} options={lineOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Course Popularity Pie Chart */}
        <div className="col-12 col-xl-6">
          <div className="data-card h-100">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#ec4899' }}><BsPieChartFill size={18} /></span>
                <h5>Course Popularity</h5>
              </div>
            </div>
            <div className="data-card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                {courses.length > 0 ? (
                  <Pie data={coursePieData} options={pieOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="col-12">
          <div className="data-card">
            <div className="data-card-header">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#f59e0b' }}><BsClockHistory size={18} /></span>
                <h5>Recent Activity</h5>
              </div>
            </div>
            <div className="data-card-body">
              {stats?.recent_activities?.length > 0 ? (
                <div className="activity-list">
                  {stats.recent_activities.map((activity, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'upload' ? '📄' : '👤'}
                      </div>
                      <div className="activity-info">
                        <div className="file-name">{activity.title}</div>
                        <div className="file-meta">
                          {activity.description} • {new Date(activity.time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  No recent activities.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
