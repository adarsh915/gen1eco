  const express = require('express');
  const router = express.Router();
  const db = require('../config/db');
  const bcrypt = require('bcryptjs');
  
  router.get('/add-user',(req, res)=>{
      res.render('users/addUser', {title: "Add User", subTitle:"Add User"})
  });
  
  router.get('/users-grid',(req, res)=>{
      res.render('users/usersGrid', {title: "users Grid", subTitle:"users Grid"})
  });
  
  router.get('/users-list',(req, res)=>{
      res.render('users/usersList', {title: "Users List", subTitle:"Users List"})
  });
  
  router.get('/view-profile', async (req, res)=>{
      try {
          const adminId = req.session.adminId;
          
          if (!adminId) {
              return res.redirect('/admin/login');
          }
          
          const [rows] = await db.execute(
              'SELECT id, name, email, phone, photo, role, status FROM users WHERE id=?',
              [adminId]
          );
          
          if (!rows[0]) {
              return res.status(404).send('Profile not found');
          }
          
          res.render('users/viewProfile', {
              title: "View Profile", 
              subTitle:"View Profile",
              user: rows[0],
              success: req.query.success || null,
              error: req.query.error || null
          });
      } catch (err) {
          console.error('Error fetching profile:', err);
          res.status(500).send('Server Error');
      }
  });

  // Change Email
  router.post('/change-email', async (req, res)=>{
      try {
          const adminId = req.session.adminId;
          const { newEmail, confirmEmail, password } = req.body;

          if (!adminId) {
              return res.redirect('/admin/login');
          }

          // Validate inputs
          if (!newEmail || !confirmEmail || !password) {
              return res.redirect('/users/view-profile?error=All fields are required');
          }

          if (newEmail !== confirmEmail) {
              return res.redirect('/users/view-profile?error=Email addresses do not match');
          }

          // Get current user
          const [rows] = await db.execute(
              'SELECT id, email, password FROM users WHERE id=?',
              [adminId]
          );

          if (!rows[0]) {
              return res.redirect('/users/view-profile?error=User not found');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, rows[0].password);
          if (!isPasswordValid) {
              return res.redirect('/users/view-profile?error=Invalid password');
          }

          // Check if new email already exists
          const [existing] = await db.execute(
              'SELECT id FROM users WHERE email=? AND id!=?',
              [newEmail, adminId]
          );

          if (existing[0]) {
              return res.redirect('/users/view-profile?error=Email already in use');
          }

          // Update email
          await db.execute(
              'UPDATE users SET email=? WHERE id=?',
              [newEmail, adminId]
          );

          res.redirect('/users/view-profile?success=Email updated successfully');
      } catch (err) {
          console.error('Error changing email:', err);
          res.redirect('/users/view-profile?error=Failed to update email');
      }
  });

  // Change Password
  router.post('/change-password', async (req, res)=>{
      try {
          const adminId = req.session.adminId;
          const { currentPassword, newPassword, confirmPassword } = req.body;

          if (!adminId) {
              return res.redirect('/admin/login');
          }

          // Validate inputs
          if (!currentPassword || !newPassword || !confirmPassword) {
              return res.redirect('/users/view-profile?error=All fields are required');
          }

          if (newPassword !== confirmPassword) {
              return res.redirect('/users/view-profile?error=New passwords do not match');
          }

          if (newPassword.length < 8) {
              return res.redirect('/users/view-profile?error=Password must be at least 8 characters');
          }

          // Get current user
          const [rows] = await db.execute(
              'SELECT id, password FROM users WHERE id=?',
              [adminId]
          );

          if (!rows[0]) {
              return res.redirect('/users/view-profile?error=User not found');
          }

          // Verify current password
          const isPasswordValid = await bcrypt.compare(currentPassword, rows[0].password);
          if (!isPasswordValid) {
              return res.redirect('/users/view-profile?error=Current password is incorrect');
          }

          // Hash new password
          const hashedPassword = await bcrypt.hash(newPassword, 12);

          // Update password
          await db.execute(
              'UPDATE users SET password=? WHERE id=?',
              [hashedPassword, adminId]
          );

          res.redirect('/users/view-profile?success=Password updated successfully');
      } catch (err) {
          console.error('Error changing password:', err);
          res.redirect('/users/view-profile?error=Failed to update password');
      }
  });
  
  module.exports = router;
