import React, { useState } from "react";
import api from '../api/axios';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      return setError("New passwords do not match.");
    }
    if (formData.new_password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const response = await api.post('/users/profile/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      if (response.data.success) {
        setSuccess("Password updated successfully!");
        setFormData({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .dashboard_content { background: #fff; border-radius: 14px; padding: 30px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07); }
        .dashboard_title { font-size: 22px; font-weight: 600; color: #1a1a2e; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
        
        .info_edit_form .single_input { margin-bottom: 20px; }
        .info_edit_form .single_input label { display: block; font-size: 14px; font-weight: 500; color: #1a1a2e; margin-bottom: 8px; }
        .info_edit_form .single_input input { 
          width: 100%; padding: 13px 16px; border: 1.5px solid #e5ddd5; border-radius: 8px; font-size: 15px; background: #fdfaf7; outline: none; transition: all 0.3s;
        }
        .info_edit_form .single_input input:focus { border-color: #AB9774; background: #fff; box-shadow: 0 0 0 3px rgba(171, 151, 116, 0.1); }
        
        .submit_btn { background: #ab9774; color: #fff; border: none; padding: 14px 30px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .submit_btn:hover { background: #333; transform: translateY(-2px); }
        .submit_btn:disabled { background: #ccc; cursor: not-allowed; }
        
        .alert { padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; }
        .alert-error { background: #fff2f0; border: 1px solid #ffa39e; color: #cf1322; }
        .alert-success { background: #f6ffed; border: 1px solid #b7eb8f; color: #389e0d; }
      `}</style>

      <div className="dashboard_content">
        <h3 className="dashboard_title">Change Password</h3>

        <form className="info_edit_form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -10px' }}>
            <div className="col-md-12" style={{ width: '100%', padding: '0 10px' }}>
              <div className="single_input">
                <label>Current Password</label>
                <input type="password" name="current_password" value={formData.current_password} onChange={handleChange} required />
              </div>
            </div>

            <div className="col-md-6" style={{ width: '50%', padding: '0 10px' }}>
              <div className="single_input">
                <label>New Password</label>
                <input type="password" name="new_password" value={formData.new_password} onChange={handleChange} required minLength="6" />
              </div>
            </div>

            <div className="col-md-6" style={{ width: '50%', padding: '0 10px' }}>
              <div className="single_input">
                <label>Confirm Password</label>
                <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required minLength="6" />
              </div>
            </div>

            <div className="col-md-12" style={{ width: '100%', padding: '0 10px' }}>
              <button type="submit" className="submit_btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;
