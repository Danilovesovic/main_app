const Notice = require("../../models/Notice");
const User = require("../../models/User");

const create = async (req, res) => {
  const users = await User.find({});
  res.render("admin/notice/creteNotice", {
    users,
    title: "Create Task",
    user: req.session.user,
  });
};

const store = async (req, res) => {
  let { title, description } = req.body;
  const notice = await Notice.create({
    title,
    description,
    createdBy: req.session.user._id,
  });
  res.redirect("/admin/dashboard");
};

const destroy = async (req, res) => {
  res.send("Notice destroy");
};

const edit = async (req, res) => {
  res.send("Notice edit");
};

module.exports = {
  store,
  create,
  edit,
  destroy,
};
