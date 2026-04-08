import React from "react";
import HeroBanner from "./HeroBanner";

const ShippingPolicy = () => {
  return (
	<>
		  <HeroBanner
        title="Shipping Policy"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shipping Policy" },
        ]}
      />

	
    <div className="container py-5">
	
      <div className="row justify-content-flex-start">
        <div className="col-lg-10 col-md-12">
          
          <h1 className=" mb-4"
		  style={{
                fontWeight: "500",
                fontSize: "32px",
              }}>
			  Shipping Policy</h1>

				  <p className="text-muted " style={{
					  marginTop: "20px",
					  fontSize: "15px",
					  lineHeight: "30px",
              }}>
            We aim to process and dispatch orders quickly to ensure timely delivery.
            Orders are generally processed within 1–2 business days after payment
            confirmation. Delivery timelines may vary depending on location and
            courier services.
          </p>

          <h5 className="fw-semibold mt-4 mb-3">
            Important shipping points include:
          </h5>

          <ul className="text-muted ps-3">
            <li className="mb-2">Orders dispatched within 1–2 working days</li>
            <li className="mb-2">Estimated delivery time: 3–7 business days</li>
            <li className="mb-2">Tracking details shared after dispatch</li>
            <li className="mb-2">Accurate address details must be provided</li>
            <li className="mb-2">
              Re-shipping charges may apply for incorrect information
            </li>
          </ul>

          <p className="text-muted mt-4">
            While we strive for timely delivery, delays caused by unforeseen
            circumstances such as weather or transportation disruptions are
            beyond our control.
          </p>

        </div>
      </div>
    </div>
	</>
  );
};
	

export default ShippingPolicy;
