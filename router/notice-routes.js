const { Router } = require("express");

const NoticeController = require("../controllers/admin/NoticeController.js");

const router = Router();

router.get("/create", NoticeController.create); //uradjeno
router.post("/", NoticeController.store); //uradjeno

router.delete("/:id", NoticeController.destroy);
router.put("/notice/:id", NoticeController.edit);

module.exports = router;
