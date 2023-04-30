import express from "express";
import controller from "../controllers/whiteflag";
const router = express.Router();

router.post("/authenticate", controller.authenticate);
router.post(
  "/discontinue_authentication",
  controller.discontinue_authentication
);
router.post("/encode", controller.whiteflag_encode);
router.post("/decode", controller.whiteflag_decode);

export = router;
