import express from "express";
import controller from "../controllers/transaction";
const router = express.Router();

router.get("/create_account", controller.createAccount);
router.post("/get_account_balance", controller.getAccountBalance);
router.post("/get_fee_for_new_signal", controller.getFeeForNewSignal);
router.post("/send_new_signal", controller.sendNewSignal);
router.get("/get_signal_history", controller.getSignalHistory);

export = router;
