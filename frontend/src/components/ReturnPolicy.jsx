const ReturnPolicy = () => {
  return (
    <>
      <style>{`
        .dashboard_content {
          margin-top: 0;
        }

        .dashboard_content .card {
          background: #fff;
          border-radius: 14px;
          border: none;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
        }

        .dashboard_content .card-body {
          padding: 30px;
        }

        .dashboard_content .card-body h2 {
          font-size: 22px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f0f0;
        }

        .dashboard_content .card-body .text-muted {
          font-size: 14px;
          color: #777;
          line-height: 1.7;
        }

        .dashboard_content .card-body .text-muted strong {
          color: #1a1a2e;
        }

        .dashboard_content .list-group {
          margin-top: 16px;
          list-style: none;
          padding: 0;
        }

        .dashboard_content .list-group-item {
          padding: 14px 20px;
          font-size: 14px;
          color: #555;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dashboard_content .list-group-item:last-child {
          border-bottom: none;
        }

        .dashboard_content .list-group-item::before {
          content: '✓';
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #0aa84812;
          color: #0aa848;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
      `}</style>

      <div className="dashboard_content">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2>7-Day Return Policy</h2>

            <p className="text-muted">
              Hum apne customers ko product receive karne ke baad{" "}
              <strong>7 din</strong> ka return option dete hain.
              Agar aap product se satisfied nahi hain, to aap
              7 din ke andar return request raise kar sakte hain.
            </p>

            <ul className="list-group list-group-flush mt-3">
              <li className="list-group-item">
                Product unused aur original condition mein hona chahiye
              </li>
              <li className="list-group-item">
                Original packaging aur invoice required hai
              </li>
              <li className="list-group-item">
                Damaged ya used products return ke liye eligible nahi honge
              </li>
              <li className="list-group-item">
                Return approve hone ke baad refund 5–7 working days mein process ho jayega
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReturnPolicy;
