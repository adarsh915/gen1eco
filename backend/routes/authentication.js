const express = require("express");
const router = express.Router();

router.get("/forgot-password", (req, res) => {
  res.render("authentication/forgotPassword", { title: "Dashboard", subTitle: "SubTitle", layout: "../views/layout/layout2" });
});

router.get("/signin", (req, res) => {
  res.render("authentication/signin", { title: "Dashboard", subTitle: "SubTitle", layout: "../views/layout/layout2" });
});

router.get("/signup", (req, res) => {
  res.render("authentication/signup", { title: "Dashboard", subTitle: "SubTitle", layout: "../views/layout/layout2" });
});

module.exports = router;
