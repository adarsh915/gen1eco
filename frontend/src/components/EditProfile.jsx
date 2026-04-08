import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify"; // Corrected import

const EditProfile = ({ onCancel }) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    dob: user?.dob ? user.dob.split('T')[0] : "",
    gender: user?.gender || "",
  });
  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Frontend Validation
      if (!formData.name || !formData.phone || !formData.dob || !formData.gender) {
        toast.error("Please fill all required fields.");
        setLoading(false);
        return;
      }

      // Phone validation (10 digits)
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        toast.error("Please enter a valid 10-digit phone number.");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", cleanPhone);
      data.append("dob", formData.dob);
      data.append("gender", formData.gender);
      if (photo) {
        data.append("photo", photo);
      }

      const response = await api.put("/users/profile", data, { // Note: prefix /users is added by axios base or route nesting
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setUser(response.data.user);
        toast.success("Profile updated successfully!");
        onCancel();
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
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
          margin-bottom: 25px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cancel_edit {
          padding: 6px 16px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel_edit:hover {
          background: #e9ecef;
        }

        .single_input {
          margin-bottom: 20px;
        }

        .single_input label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #444;
          margin-bottom: 8px;
        }

        .single_input input, .single_input select {
          width: 100%;
          padding: 11px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .single_input input:focus, .single_input select:focus {
          border-color: #ab9774;
        }

        .submit_btn {
          background: #ab9774;
          color: #fff;
          border: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .submit_btn:hover {
          background: #333;
        }

        .submit_btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>

      <div className="dashboard_content">
        <h3 className="dashboard_title">
          Edit Information
          <button className="cancel_edit" onClick={onCancel}>Cancel</button>
        </h3>

        <div className="dashboard_profile_info_edit">
          <form className="info_edit_form" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="single_input">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="col-md-6">
                <div className="single_input">
                  <label>Email (Read-only)</label>
                  <input type="email" value={user?.email} disabled style={{ background: '#f8f9fa' }} />
                </div>
              </div>

              <div className="col-md-6">
                <div className="single_input">
                  <label>Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter 10-digit phone number" required />
                </div>
              </div>

              <div className="col-md-6">
                <div className="single_input">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                </div>
              </div>

              <div className="col-md-6">
                <div className="single_input">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="single_input">
                  <label>Profile Photo</label>
                  <input type="file" name="photo" onChange={handleFileChange} accept="image/*" />
                </div>
              </div>

              <div className="col-md-12" style={{ marginTop: '15px' }}>
                <button type="submit" className="submit_btn" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile →"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
