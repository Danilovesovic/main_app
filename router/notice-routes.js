const { Router } = require("express");

const NoticeController = require("../controllers/admin/NoticeController.js");

const router = Router();

router.get("/create", NoticeController.create); //uradjeno
router.post("/", NoticeController.store); //uradjeno

router.get("/:id/edit", NoticeController.edit);
router.put("/:id", NoticeController.update);
router.delete("/:id", NoticeController.destroy);

module.exports = router;
