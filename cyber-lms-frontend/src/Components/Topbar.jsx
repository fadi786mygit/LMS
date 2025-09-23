import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import baseUrl from '../baseUrl';

export default function Topbar() {
  const [profileImg, setProfileImg] = useState('/images/default-image.png');

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok && data.profileImage) {
          // ✅ If backend sends full Cloudinary URL, just use it
          if (data.profileImage.startsWith("http")) {
            setProfileImg(`${data.profileImage}?t=${Date.now()}`); 
          } else {
            // fallback if still using local uploads
            setProfileImg(`${baseUrl}/uploads/${data.profileImage}?t=${Date.now()}`);
          }
        }
      } catch {
        setProfileImg('/images/default-image.png');
      }
    };

    fetchProfile();
  }, []);

  return (
    <header className="topbar d-flex align-items-center px-3">
      {/* Right side: Admin name + profile image */}
      <div className="topbar-right text-white d-flex align-items-center ms-auto">
        <span className="admin-name me-2">Admin</span>
        <Link to="/admin/admin-settings">
          <img
            src={profileImg}
            onError={(e) => { e.target.src = '/images/default-image.png'; }}
            alt="Admin"
            className="profile-img"
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
        </Link>
      </div>
    </header>
  );
}
