import { useState, useEffect } from "react";
import Addaddress from "./Addaddress";
import api from '../api/axios';
import { FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

const Address = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/profile/addresses');
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const response = await api.delete(`/users/profile/addresses/${id}`);
      if (response.data.success) {
        fetchAddresses();
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  const handleEdit = (addr) => {
    setEditData(addr);
    setShowAddForm(true);
  };

  const handleBack = () => {
    setEditData(null);
    setShowAddForm(false);
    fetchAddresses();
  };

  if (showAddForm) {
    return <Addaddress onBack={handleBack} editData={editData} />;
  }

  return (
    <>
      <style>{`
        .dashboard_content {
          background: #fff;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
        }
        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }
        .address-header h3 { font-size: 22px; font-weight: 600; color: #1a1a2e; margin: 0; }
        
        .address-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .address-card { border: 1px solid #eee; border-radius: 12px; padding: 20px; position: relative; transition: all 0.3s; }
        .address-card:hover { border-color: #AB9774; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .address-card.default { border-color: #AB9774; background: #fffdf9; }
        
        .addr-type { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #AB9774; margin-bottom: 10px; display: inline-block; padding: 2px 8px; background: #fdf5e6; border-radius: 4px; }
        .addr-name { font-weight: 600; font-size: 16px; margin-bottom: 5px; color: #1a1a2e; }
        .addr-text { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 15px; }
        
        .addr-actions { display: flex; gap: 10px; border-top: 1px solid #f0f0f0; pt: 15px; margin-top: auto; }
        .addr-btn { background: none; border: none; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; color: #888; transition: color 0.2s; }
        .addr-btn.edit:hover { color: #AB9774; }
        .addr-btn.delete:hover { color: #e53935; }
        
        .default-badge { position: absolute; top: 15px; right: 15px; color: #AB9774; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }
        
        .common_btn { background: #ab9774; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
        .common_btn:hover { background: #333; }
      `}</style>

      <div className="dashboard_content">
        <div className="address-header">
          <h3>Your Addresses</h3>
          <button className="common_btn" onClick={() => setShowAddForm(true)}>+ Add New Address</button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <p className="no-address">No addresses found. Add one to get started!</p>
        ) : (
          <div className="address-grid">
            {addresses.map((addr) => (
              <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                {addr.is_default && <span className="default-badge"><FaCheckCircle /> Default</span>}
                <span className="addr-type">{addr.address_type}</span>
                <div className="addr-name">{addr.full_name}</div>
                <div className="addr-text">
                  {addr.address}, {addr.landmark && `${addr.landmark},`} {addr.city}, {addr.state} - {addr.pincode}<br/>
                  Phone: {addr.phone}
                </div>
                <div className="addr-actions">
                  <button className="addr-btn edit" onClick={() => handleEdit(addr)}><FaEdit /> Edit</button>
                  <button className="addr-btn delete" onClick={() => handleDelete(addr.id)}><FaTrash /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Address;
