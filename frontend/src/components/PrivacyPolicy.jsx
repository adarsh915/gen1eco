import React from "react";
import HeroBanner from "./HeroBanner";



const PrivacyPolicy = () => {
  return (
    <div
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        color: "#555555",
      }}
    >
		  <HeroBanner
        title="Privacy Policy"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
      />
      <div className="container py-5  ">
        <div className="row">
         <div className="col-12 col-md-11 col-lg-11 ">

            {/* Page Title */}
            <h1
              style={{
               fontWeight: "500",
                fontSize: "32px",
                color: "#2b2b2b",
                marginBottom: "1.25rem",
                letterSpacing: "-0.01em",
              }}
            >
              Privacy Policy
            </h1>

            {/* Intro Paragraph */}
            <p
              style={{
                fontSize: "0.93rem",
                lineHeight: "1.85",
                color: "#666666",
                marginBottom: "2rem",
                maxWidth: "95%",
              }}
            >
              Gen1eco respects your privacy and is committed to protecting your personal information.
              We collect only the necessary details required to process orders and improve customer
              experience. All information is stored securely and handled responsibly.
            </p>

            {/* Section 1 */}
            <PolicySection title="We may collect the following information:">
              <PolicyItem>Full name and contact details</PolicyItem>
              <PolicyItem>Email address and phone number</PolicyItem>
              <PolicyItem>Billing and shipping address</PolicyItem>
              <PolicyItem>Payment transaction details</PolicyItem>
              <PolicyItem>Website browsing data for analytics</PolicyItem>
            </PolicySection>

            {/* Section 2 */}
            <PolicySection title="Your information is used to:">
              <PolicyItem>Process and deliver your orders</PolicyItem>
              <PolicyItem>Provide customer support</PolicyItem>
              <PolicyItem>Send order confirmations and updates</PolicyItem>
              <PolicyItem>Improve our website services</PolicyItem>
              
            </PolicySection>
  <p
              style={{
                fontSize: "0.93rem",
                lineHeight: "1.85",
                color: "#666666",
                marginBottom: "2rem",
                maxWidth: "95%",
              }}
            >
            We do not sell, trade, or rent your personal data to third parties. Information is shared only with trusted payment gateways and delivery partners for order fulfillment.

For any privacy concerns, please contact us at <a href="mailto:info@gen1eco.com">info@gen1eco.com</a>.
            </p>
            
        

          </div>
        </div>
      </div>
    </div>
  );
};

const PolicySection = ({ title, children }) => (
  <div style={{ marginBottom: "1.75rem" }}>
    <p
      style={{
        fontWeight: "700",
        fontSize: "0.93rem",
        color: "#2b2b2b",
        marginBottom: "0.85rem",
      }}
    >
      {title}
    </p>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {children}
    </ul>
  </div>
);

const PolicyItem = ({ children }) => (
  <li
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "0.65rem",
      padding: "0.42rem 0",
      fontSize: "0.93rem",
      color: "#666666",
      lineHeight: "1.7",
    }}
  >
    <span
      style={{
        minWidth: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#aaaaaa",
        marginTop: "9px",
        flexShrink: 0,
      }}
    />
    {children}
  </li>
);


export default PrivacyPolicy;