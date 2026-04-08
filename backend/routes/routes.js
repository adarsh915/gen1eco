const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");

const ai = require("./ai");
const authentication = require("./authentication");
const blog = require("./blog");
const chart = require("./chart");
const components = require("./components");
const cryptoCurrency = require("./cryptoCurrency");
const dashboard = require("./dashboard");
const forms = require("./forms");
const invoice = require("./invoice");
const rolesAndAccess = require("./rolesAndAccess");
const settings = require("./settings");
const table = require("./table");
const users = require("./users");
const category = require('./category');

// ✅ PUBLIC routes (no login needed)
router.get("/comingsoon", (req, res) => {
  res.render("comingsoon", { title: "Coming Soon", subTitle: "", layout: "../views/layout/layout2" });
});

router.get("/maintenance", (req, res) => {
  res.render("maintenance", { title: "Maintenance", subTitle: "", layout: "../views/layout/layout2" });
});

router.get("/not-found", (req, res) => {
  res.render("notFound", { title: "404", subTitle: "404" });
});

// ✅ Authentication routes stay public (login, register pages)
router.use("/authentication", authentication);

// 🔒 ALL routes below require login
router.use(isAuthenticated); // <-- single line protects everything below

const dashboardController = require("../controllers/dashboardController");
router.use('/category', category);

router.get("/", dashboardController.getStats);
router.get("/index", dashboardController.getStats);

router.get("/blankpage", (req, res) => {
  res.render("blankpage", { title: "Blank Page", subTitle: "Blank Page" });
});

router.get("/calendar", (req, res) => {
  res.render("calendar", { title: "Calendar", subTitle: "Components / Calendar" });
});

router.get("/chat", (req, res) => {
  res.render("chat", { title: "Chat", subTitle: "Chat" });
});

router.get("/chat-profile", (req, res) => {
  res.render("chatProfile", { title: "Chat Profile", subTitle: "" });
});

router.get("/email", (req, res) => {
  res.render("email", { title: "Email", subTitle: "Components / Email" });
});

router.get("/faqs", (req, res) => {
  res.render("faqs", { title: "Faq", subTitle: "Faq" });
});

router.get("/gallery", (req, res) => {
  res.render("gallery", { title: "Gallery", subTitle: "Gallery" });
});

router.get("/kanban", (req, res) => {
  res.render("kanban", { title: "Kanban", subTitle: "Kanban" });
});

router.get("/pricing", (req, res) => {
  res.render("pricing", { title: "Pricing", subTitle: "Pricing" });
});

router.get("/stared", (req, res) => {
  res.render("stared", { title: "Stared", subTitle: "" });
});

router.get("/terms-and-conditions", (req, res) => {
  res.render("termsAndConditions", { title: "Terms & Conditions", subTitle: "Terms & Conditions" });
});

router.get("/testimonials", (req, res) => {
  res.render("testimonials", { title: "Testimonials", subTitle: "Testimonials" });
});

router.get("/view-details", (req, res) => {
  res.render("viewDetails", { title: "View Details", subTitle: "" });
});

router.get("/widgets", (req, res) => {
  res.render("widgets", { title: "Widgets", subTitle: "Widgets" });
});

router.use("/ai", ai);
router.use("/blog", blog);
router.use("/chart", chart);
router.use("/components", components);
router.use("/crypto-currency", cryptoCurrency);
router.use("/dashboard", dashboard);
router.use("/forms", forms);
router.use("/invoice", invoice);
router.use("/role-and-access", rolesAndAccess);
router.use("/settings", settings);
router.use("/table", table);
router.use("/users", users);

module.exports = function (app) {
  // ✅ Skip /admin routes — let adminAuthRoutes handle them
  app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) return next('router');
    if (req.path.startsWith('/main-slider')) return next('router');
    if (req.path.startsWith('/single-banner')) return next('router');
    if (req.path.startsWith('/contact-messages')) return next('router');
    if (req.path.startsWith('/category')) return next('router');
    next();
  });

  app.use("/", router);
};