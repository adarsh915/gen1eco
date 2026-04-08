import React, { useState, useEffect } from "react";
import api from '../api/axios';

const Addaddress = ({ onBack, editData }) => {
  const [formData, setFormData] = useState({
    address_type: 'Home',
    full_name: '',
    email: '',
    phone: '',
    country: 'India',
    state: '',
    city: '',
    landmark: '',
    address: '',
    pincode: '',
    is_default: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        is_default: !!editData.is_default
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/users/profile/addresses', formData);
      if (response.data.success) {
        alert(editData ? "Address updated successfully!" : "Address added successfully!");
        onBack();
      }
    } catch (err) {
      console.error("Failed to save address:", err);
      alert("Failed to save address. Please try again.");
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
          font-size: 22px; font-weight: 600; color: #1a1a2e; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between;
        }
        .cancel_edit { background: #ab9774; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; }
        .cancel_edit:hover { background: #333; }
        
        .info_edit_form .single_input { margin-bottom: 15px; }
        .info_edit_form .single_input label { display: block; font-size: 14px; font-weight: 500; color: #1a1a2e; margin-bottom: 5px; }
        .info_edit_form .single_input input, .info_edit_form .single_input select, .info_edit_form .single_input textarea {
          width: 100%; padding: 10px 14px; border: 1.5px solid #e5ddd5; border-radius: 8px; font-size: 14px; background: #fdfaf7; outline: none; transition: all 0.3s;
        }
        .info_edit_form .single_input input:focus, .info_edit_form .single_input select:focus, .info_edit_form .single_input textarea:focus { border-color: #AB9774; background: #fff; }
        
        .submit_btn { background: #ab9774; color: #fff; border: none; padding: 12px 25px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .submit_btn:hover { background: #333; transform: translateY(-2px); }
        .submit_btn:disabled { background: #ccc; cursor: not-allowed; }
        
        .row { display: flex; flex-wrap: wrap; margin: 0 -10px; }
        .col-md-6 { width: 50%; padding: 0 10px; }
        .col-md-12 { width: 100%; padding: 0 10px; }
        @media (max-width: 768px) { .col-md-6 { width: 100%; } }
      `}</style>

      <div className="dashboard_content">
        <h3 className="dashboard_title">
          {editData ? 'Edit Address' : 'Add New Address'}
          <button className="cancel_edit" onClick={onBack}>Cancel</button>
        </h3>

        <form className="info_edit_form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="single_input">
                <label>Full Name *</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="single_input">
                <label>Phone *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="single_input">
                <label>Email (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="single_input">
                <label>Address Type</label>
                <select name="address_type" value={formData.address_type} onChange={handleChange}>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="single_input">
                <label>State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="single_input">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="single_input">
                <label>Area / Colony *</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="single_input">
                <label>Pincode *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-md-12">
              <div className="single_input">
                <label>Full Address *</label>
                <textarea name="address" rows="3" value={formData.address} onChange={handleChange} required></textarea>
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <input type="checkbox" name="is_default" id="is_default" checked={formData.is_default} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="is_default" style={{ fontSize: '14px', cursor: 'pointer' }}>Set as Default Address</label>
              </div>
            </div>
            <div className="col-md-12">
              <button type="submit" className="submit_btn" disabled={loading}>
                {loading ? 'Saving...' : editData ? 'Update Address →' : 'Add Address →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Addaddress;
