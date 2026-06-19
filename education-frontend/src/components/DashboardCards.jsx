// ============================================================
// components/DashboardCards.jsx
// Statistics cards displaying key metrics with animated counters
// ============================================================

import { 
  BsPeopleFill, 
  BsBookFill, 
  BsBuilding, 
  BsCloudUploadFill, 
  BsDatabaseFill,
  BsPersonPlusFill,
  BsCheckCircleFill,
  BsGraphUpArrow
} from 'react-icons/bs';

const DashboardCards = ({ stats }) => {
  // Card configuration with icons, labels, colors
  const cards = [
    {
      key: 'students',
      label: 'Total Students',
      value: stats?.total_students || 0,
      icon: <BsPeopleFill />,
      className: 'card-students',
    },
    {
      key: 'courses',
      label: 'Total Courses',
      value: stats?.total_courses || 0,
      icon: <BsBookFill />,
      className: 'card-courses',
    },
    {
      key: 'departments',
      label: 'Total Departments',
      value: stats?.total_departments || 0,
      icon: <BsBuilding />,
      className: 'card-courses',
    },
    {
      key: 'files',
      label: 'Uploaded Files',
      value: stats?.total_files || 0,
      icon: <BsCloudUploadFill />,
      className: 'card-files',
    },
    {
      key: 'records',
      label: 'Total Records',
      value: stats?.total_records || 0,
      icon: <BsDatabaseFill />,
      className: 'card-records',
    },
    {
      key: 'admissions',
      label: 'New Admissions',
      value: stats?.new_admissions || 0,
      icon: <BsPersonPlusFill />,
      className: 'card-students',
    },
    {
      key: 'active',
      label: 'Active Students',
      value: stats?.active_students || 0,
      icon: <BsCheckCircleFill />,
      className: 'card-courses',
    },
    {
      key: 'growth',
      label: 'Growth Percentage',
      value: `${stats?.growth_percentage || 0}%`,
      icon: <BsGraphUpArrow />,
      className: 'card-files',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="col-12 col-sm-6 col-md-4 col-xl-3 animate-in"
        >
          <div className={`stat-card ${card.className}`} id={`stat-${card.key}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
