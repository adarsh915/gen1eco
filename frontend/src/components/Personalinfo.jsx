import { useState } from "react";
import EditProfile from "./EditProfile";
import { useAuth } from "../context/AuthContext";

const Personalinfo = () => {
  const [showEdit, setShowEdit] = useState(false);

  const { user } = useAuth();

  if (showEdit) {
    return <EditProfile onCancel={() => setShowEdit(false)} />;
  }

  return (
    <>
      <style>{`
        /* ... existing styles ... */
        .dashboard_content {
          background: #fff;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
        }

        .dashboard_title {
          font-size: 22px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dashboard_title .common_btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 22px;
          background: #ab9774;
          color: #fff;
          border: 2px solid #ab9774;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: color 0.3s ease;
        }

        .dashboard_title .common_btn::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 100%;
          background: #333;
          z-index: -1;
          transition: width 0.3s ease;
        }

        .dashboard_title .common_btn:hover::after {
          width: 100%;
          left: 0;
        }

        .dashboard_title .common_btn:hover {
          color: #fff;
        }

        .dashboard_profile_info_list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .dashboard_profile_info_list ul li {
          padding: 14px 0;
          font-size: 15px;
          color: #555;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dashboard_profile_info_list ul li:last-child {
          border-bottom: none;
        }

        .dashboard_profile_info_list ul li span {
          font-weight: 600;
          color: #1a1a2e;
          min-width: 80px;
        }
      `}</style>

      <div className="dashboard_content">
        <h3 className="dashboard_title">
          Profile Information
          <button className="common_btn" onClick={() => setShowEdit(true)}>Edit</button>
        </h3>

        <div className="dashboard_profile_info_list">
          {/* Profile Image Display */}
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #ab9774', background: '#f8f9fa' }}>
            {user?.photo ? (
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/users/${user.photo}`}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ccc', fontWeight: 'bold', background: '#eee' }}>
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>


          <ul>
            <li><span>Name:</span> {user?.name}</li>
            <li><span>Email:</span> {user?.email}</li>
            <li><span>Phone:</span> {user?.phone || 'Not provided'}</li>
            <li><span>DOB:</span> {user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}</li>
            <li><span>Gender:</span> {user?.gender || 'Not provided'}</li>
          </ul>
        </div>

      </div>
    </>
  );
};

export default Personalinfo;
