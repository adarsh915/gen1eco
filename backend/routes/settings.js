  const express = require('express');
  const router = express.Router();
  
  router.get('/company',(req, res)=>{
      res.render('settings/company', {title: "Company", subTitle:"Settings - Company"})
  });
  
  router.get('/currencies',(req, res)=>{
      res.render('settings/currencies', {title: "Currencies", subTitle:"Settings - Currencies"})
  });
  
  router.get('/languages',(req, res)=>{
      res.render('settings/languages', {title: "Languages", subTitle:"Settings - Languages"})
  });
  
  router.get('/notification',(req, res)=>{
      res.render('settings/notification', {title: "Notification", subTitle:"Settings - Notification"})
  });
  
  router.get('/notification-alert',(req, res)=>{
      res.render('settings/notificationAlert', {title: "Notification Alert", subTitle:"Settings - Notification Alert"})
  });
  
  router.get('/payment-getway',(req, res)=>{
      res.render('settings/paymentGetway', {title: "Payment Getway", subTitle:"Settings - Payment Getway"})
  });
  
  router.get('/theme',(req, res)=>{
      res.render('settings/theme', {title: "Theme", subTitle:"Settings - Theme"})
  });
  
  
  module.exports = router;
