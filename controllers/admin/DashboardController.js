const Notice = require("../../models/Notice");
const Dashboard = async (req, res) => {
  let user = req.session.user;
  let notices = await Notice.find({})
    .populate("createdBy")
    .sort({ createdAt: -1 });

  res.render("admin/dashboard", {
    user,
    notices,
    title: "Dashboard",
    pageScript: "/js/admin/dashboard.js",
  });
};

module.exports = Dashboard;
