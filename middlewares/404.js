const notFound = (req, res, next) => {
  res.status(404).render("pageNotFound");
};

module.exports = notFound;
