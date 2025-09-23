import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import '../style.css';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalEnrollments: 0,
    totalCourses: 0,
    totalRevenue: 0,
  });
  const [userGrowth, setUserGrowth] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [profileImage, setProfileImage] = useState('/images/default-image.png');

  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      showToast('Not authorized. Please login.');
      navigate('/login');
    } else {
      loadDashboardData();
      loadAdminTopbarProfile();
    }
  }, []);

   const showToast = (msg, type = 'success') => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: type === 'success' ? "green" : "red",
      }
    }).showToast();
  };

  const loadDashboardData = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMetrics(data.metrics);
      setUserGrowth(data.userGrowth);
      setTopCourses(data.topCourses);
    } catch (err) {
      console.error(err);
      showToast('Error loading dashboard');
    }
  };

  const loadAdminTopbarProfile = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.profileImage) {
        const path = data.profileImage.split('/uploads/')[1];
        setProfileImage(`${baseUrl}/uploads/${path}?t=${Date.now()}`);
      }
    } catch (err) {
      console.error('Profile image load error:', err);
    }
  };

  const chartData = {
    labels: userGrowth.map(item => item.date),
    datasets: [
      {
        label: 'Users',
        data: userGrowth.map(item => item.count),
        borderColor: '#38B6FF',
        backgroundColor: 'rgba(56, 182, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // ✅ Download User Report
  const handleDownload = () => {
    window.open(`${baseUrl}/api/admin/download-user-report`, "_blank");
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main container-fluid">
        <Topbar profileImage={profileImage} />

        <section className="main-content mt-4 text-white">
          {/* Metrics Section */}
          <div className="dashboard-metrics row g-3 justify-content-center">
            <div className="col-6 col-md-3 text-center">
              <div className="metric-card d-inline-block px-5 py-5 rounded">
                <h6 className="mb-1">Total Users</h6>
                <small>{metrics.totalUsers}</small>
              </div>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="metric-card d-inline-block px-5 py-5 rounded">
                <h6 className="mb-1">Total Enrollments</h6>
                <small>{metrics.totalEnrollments}</small>
              </div>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="metric-card d-inline-block px-5 py-5 rounded">
                <h6 className="mb-1">Total Courses</h6>
                <small>{metrics.totalCourses}</small>
              </div>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="metric-card d-inline-block px-5 py-5 rounded">
                <h6 className="mb-1">Total Revenue</h6>
                <small>${metrics.totalRevenue}</small>
              </div>
            </div>
          </div>

          {/* Chart and Top Courses */}
          <div className="main-content-row row mt-4 g-4">
            <div className="col-12 col-lg-8">
              <div className="chart-box h-100">
                <h4>User Growth Trend</h4>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                />
                <div className="chart-footer d-flex justify-content-between align-items-center mt-2">
                  <button
                    onClick={handleDownload}
                    className="btn btn-success"
                  >
                    Download User Report
                  </button>

                  <span className="highlight-tag">+8.8% All Time High</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="panel-box right-panel h-100">
                <h4>Top Performing Courses</h4>
                {topCourses.map((course, i) => (
                  <div className="course-item" key={course._id}>
                    <p>
                      {i + 1}. {course.title}
                    </p>
                    <div className="progress">
                      <div
                        className="bar"
                        style={{ width: `${Math.min(course.enrollmentsCount, 100)}%` }}
                      ></div>
                    </div>
                    <small>{course.enrollmentsCount} Enrollments</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
