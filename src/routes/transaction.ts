import express from "express";
import controller from "../controllers/transaction";
const router = express.Router();

router.get("/healthcheck", controller.healthcheck);
router.get("/create_account", controller.createAccount);
router.post("/get_fee_for_transfer_token", controller.getFeeForTransferToken);
router.post("/transfer_token", controller.transferToken);
router.post("/download_account_as_json", controller.downloadAccountAsJson);
router.post("/get_address", controller.getAddress);
router.post("/get_account_balance", controller.getAccountBalance);
router.post("/get_fee_for_new_signal", controller.getFeeForNewSignal);
router.post("/send_new_signal", controller.sendNewSignal);
router.get("/get_signal_history", controller.getSignalHistory);
router.get("/get_fee_for_issue_trust", controller.getFeeForIssueTrust);
router.post("/issue_trust", controller.issueTrust);
router.post("/get_fee_for_remove_trust", controller.getFeeForRemoveTrust);
router.post("/remove_trust", controller.removeTrust);
router.post("/get_fee_for_request_trust", controller.getFeeForRequestTrust);
router.post("/request_trust", controller.requestTrust);
router.post(
  "/get_fee_for_cancel_trust_request",
  controller.getFeeForCancelTrustRequest
);
router.post("/cancel_trust_request", controller.cancelTrustRequest);
router.post("/get_fee_for_revoke_trust", controller.getFeeForRevokeTrust);
router.post("/revoke_trust", controller.revokeTrust);
router.get("/check_trust_exists", controller.checkTrustExists);
router.get("/get_trust_history", controller.getTrustHistory);

export = router;
