const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || (smtpUser ? smtpUser : 'no-reply@example.com');
const fromName = process.env.FROM_NAME || 'Gen1Eco';

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn("Email transport is not fully configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env to enable email notifications.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost || 'localhost',
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

async function sendMail({ to, subject, text, html }) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(`Skipping sending email to ${to} because SMTP configuration is missing.`);
    return;
  }

  if (!to) {
    throw new Error('Email recipient (to) is required');
  }

  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
}

function signupTemplate(user) {
  const userName = user.name || 'Customer';
  return {
    subject: 'Welcome to Gen1Eco! Your account is ready',
    html: `<h2>Hi ${userName},</h2>
      <p>Thanks for signing up at Gen1Eco. Your account has been created successfully.</p>
      <p>You can now log in and start using our services.</p>
      <p>Best regards,<br/>Gen1Eco Team</p>`,
  };
}

function accountBlockedTemplate(user, reason) {
  const userName = user.name || 'Customer';
  return {
    subject: 'Your Gen1Eco account has been blocked',
    html: `<h2>Hi ${userName},</h2>
      <p>Your account has been blocked.${reason ? ` Reason: ${reason}` : ''}</p>
      <p>If you think this is a mistake, please contact customer support.</p>
      <p>Best regards,<br/>Gen1Eco Team</p>`,
  };
}

function accountUnblockedTemplate(user) {
  const userName = user.name || 'Customer';
  return {
    subject: 'Your Gen1Eco account has been reactivated',
    html: `<h2>Hi ${userName},</h2>
      <p>Your account has been unblocked and is now active again. You can log in anytime.</p>
      <p>Best regards,<br/>Gen1Eco Team</p>`,
  };
}

function orderCreatedTemplate(order, user) {
  const userName = user.name || 'Customer';
  return {
    subject: `Order ${order.order_number} confirmed`,
    html: `<h2>Hi ${userName},</h2>
      <p>Thank you for your order. Your order <strong>${order.order_number}</strong> has been placed successfully.</p>
      <p>Total amount: ₹${order.total_amount}</p>
      <p>Order status: <strong>${order.order_status}</strong></p>
      <p>We will keep you updated about shipping and delivery.</p>
      <p>Best regards,<br/>Gen1Eco Team</p>`,
  };
}

function orderStatusUpdateTemplate(order, oldStatus, newStatus) {
  const userName = order.user_name || 'Customer';
  return {
    subject: `Order ${order.order_number} status updated: ${newStatus}`,
    html: `<h2>Hi ${userName},</h2>
      <p>Your order <strong>${order.order_number}</strong> status changed from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>
      <p>Current total: ₹${order.total_amount}</p>
      <p>Thank you for shopping with us.</p>
      <p>Best regards,<br/>Gen1Eco Team</p>`,
  };
}

function guestCheckoutWelcomeTemplate(user, tempPassword, orderData) {
  const userName = user.name || 'Customer';
  return {
    subject: `Welcome to Gen1Eco! Your order ${orderData.order_number} is confirmed`,
    html: `
      <h2>Hi ${userName},</h2>
      <p>Thank you for your order at Gen1Eco! Your order has been placed successfully.</p>
      
      <h3>Your Account Credentials:</h3>
      <p>
        <strong>Email:</strong> ${user.email}<br>
        <strong>Password:</strong> <code>${tempPassword}</code><br>
        <small>We recommend changing your password after your first login.</small>
      </p>
      
      <h3>Order Details:</h3>
      <p>
        <strong>Order Number:</strong> ${orderData.order_number}<br>
        <strong>Total Amount:</strong> ₹${orderData.total_amount}<br>
        <strong>Order Status:</strong> ${orderData.order_status}
      </p>
      
      <p>We will keep you updated about shipping and delivery.</p>
      <p>Best regards,<br/>Gen1Eco Team</p>
    `,
  };
}

function passwordResetTemplate(user, resetLink) {
  const userName = user.name || 'Customer';
  return {
    subject: 'Reset Your Gen1Eco Password',
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f5f0; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 12px; padding: 48px 40px; box-shadow: 0 10px 50px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">Gen1Eco</h1>
            <div style="width: 48px; height: 3px; background: #b5896a; margin: 0 auto;"></div>
          </div>
          <h2 style="font-family: Georgia, serif; font-size: 22px; color: #1a1a1a; margin-bottom: 12px;">Reset Your Password 🔐</h2>
          <p style="color: #777; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Hi <strong style="color:#1a1a1a;">${userName}</strong>, we received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #b5896a; color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.04em;">Reset My Password →</a>
          </div>
          <p style="color: #999; font-size: 13px; line-height: 1.6;">Or copy and paste this link in your browser:<br><a href="${resetLink}" style="color: #b5896a; word-break: break-all;">${resetLink}</a></p>
          <hr style="border: none; border-top: 1px solid #f0e8e0; margin: 28px 0;">
          <p style="color: #aaa; font-size: 12px; margin: 0;">If you did not request a password reset, you can safely ignore this email. Your password will not be changed.<br><br>Best regards,<br><strong style="color: #777;">Gen1Eco Team</strong></p>
        </div>
      </div>
    `,
  };
}

function passwordResetSuccessTemplate(user) {
  const userName = user.name || 'Customer';
  return {
    subject: 'Your Gen1Eco Password Has Been Reset',
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f5f0; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 12px; padding: 48px 40px; box-shadow: 0 10px 50px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">Gen1Eco</h1>
            <div style="width: 48px; height: 3px; background: #b5896a; margin: 0 auto;"></div>
          </div>
          <h2 style="font-family: Georgia, serif; font-size: 22px; color: #1a1a1a; margin-bottom: 12px;">Password Reset Successful ✅</h2>
          <p style="color: #777; font-size: 15px; line-height: 1.6;">Hi <strong style="color:#1a1a1a;">${userName}</strong>, your password has been changed successfully. You can now log in with your new password.</p>
          <p style="color: #aaa; font-size: 12px; margin-top: 24px;">If you did not make this change, please contact our support team immediately.<br><br>Best regards,<br><strong style="color: #777;">Gen1Eco Team</strong></p>
        </div>
      </div>
    `,
  };
}

module.exports = {
  sendMail,
  signupTemplate,
  accountBlockedTemplate,
  accountUnblockedTemplate,
  orderCreatedTemplate,
  orderStatusUpdateTemplate,
  guestCheckoutWelcomeTemplate,
  passwordResetTemplate,
  passwordResetSuccessTemplate,
};
