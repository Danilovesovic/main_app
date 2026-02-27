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
  try {
    const { id } = req.params;

    let deleteNotice = await Notice.findByIdAndDelete(id);

    console.log("Notice obrisan", deleteNotice);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.log(err);
    res.redirect("/admin/dashboard");
  }
};

const edit = async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  res.render("admin/notice/editNotice", {
    notice,
    title: "Edit Notice",
    user: req.session.user,
  });
};

const update = async (req, res) => {
  let { title, description } = req.body;
  let notice = await Notice.findByIdAndUpdate(req.params.id, {
    title,
    description,
  });
  res.redirect("/admin/dashboard");
};

module.exports = {
  store,
  create,
  edit,
  update,
  destroy,
};
