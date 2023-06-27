import { Request, Response, NextFunction } from "express";
import KeyManager from "../lib/key";
import Node from "../lib/node";
import { ApiPromise, WsProvider } from "@polkadot/api";

async function connect() {
  const wsProvider = new WsProvider("wss://protocol-alpha.fennellabs.com:443");
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log(api.genesisHash.toHex());
  return api;
}

async function healthcheck(req: Request, res: Response, next: NextFunction) {
    return res.status(200);
}

async function createAccount(req: Request, res: Response, next: NextFunction) {
  const response = new KeyManager("Main").generateAccount();

  return res.status(200).json({
    mnemonic: response,
  });
}

async function getAddress(req: Request, res: Response, next: NextFunction) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);
  let response = keyManager.address();

  return res.status(200).json({
    address: response,
  });
}

async function getAccountBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const node = new Node(promise);
  const response = await node.getAccountBalance(keyManager);

  return res.status(200).json({
    balance: response,
  });
}

async function getFeeForTransferToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  const response = await node.getFeeForTransferToken(
    keyManager,
    req.body.to,
    req.body.amount
  );

  return res.status(200).json({
    fee: response,
  });
}

async function transferToken(req: Request, res: Response, next: NextFunction) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  let hash = await node.transferToken(
    keyManager,
    req.body.to,
    req.body.amount
  );

  return res.status(200).json({
    hash: hash,
  });
}

async function getFeeForNewSignal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  const response = await node.getFeeForSendNewSignal(
    keyManager,
    req.body.content
  );

  return res.status(200).json({
    fee: response,
  });
}

async function sendNewSignal(req: Request, res: Response, next: NextFunction) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  let hash = await node.sendNewSignal(keyManager, req.body.content);

  return res.status(200).json({
    hash: hash,
  });
}

async function getSignalHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const response = await new Node(promise).listenForSignals();

  return res.status(200).json({
    response: response,
  });
}

async function getFeeForIssueTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  const response = await node.getFeeForIssueTrust(
    keyManager,
    req.body.address
  );

  return res.status(200).json({
    fee: response,
  });
}

async function issueTrust(req: Request, res: Response, next: NextFunction) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  let hash = await node.issueTrust(keyManager, req.body.address);

  return res.status(200).json({
    hash: hash,
  });
}

async function getFeeForRemoveTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  const response = await node.getFeeForRemoveTrust(
    keyManager,
    req.body.address
  );

  return res.status(200).json({
    fee: response,
  });
}

async function removeTrust(req: Request, res: Response, next: NextFunction) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  let hash = await node.removeTrust(keyManager, req.body.address);

  return res.status(200).json({
    hash: hash,
  });
}

async function getFeeForRequestTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const promise = await connect();
  const node = new Node(promise);
  const response = await node.getFeeForRequestTrust(
    keyManager,
    req.body.address
  );

  return res.status(200).json({
    fee: response,
  });
}

async function requestTrust(req: Request, res: Response, next: NextFunction) {
  const promise = await connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const node = new Node(promise);
  let hash = await node.requestTrust(keyManager, req.body.address);

  return res.status(200).json({
    hash: hash,
  });
}

async function getFeeForCancelTrustRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const node = new Node(promise);
  const response = await node.getFeeForCancelTrustRequest(
    keyManager,
    req.body.address
  );

  return res.status(200).json({
    fee: response,
  });
}

async function cancelTrustRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const node = new Node(promise);
  let hash = await node.cancelTrustRequest(keyManager, req.body.address);

  return res.status(200).json({
    hash: hash,
  });
}

async function getFeeForRevokeTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const node = new Node(promise);
  const response = await node.getFeeForRevokeTrust(
    keyManager,
    req.body.address
  );

  return res.status(200).json({
    fee: response,
  });
}

async function revokeTrust(req: Request, res: Response, next: NextFunction) {
  const promise = await connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const node = new Node(promise);
  let hash = await node.revokeTrust(keyManager, req.body.address);

  return res.status(200).json({
    hash: hash,
  });
}

async function getFeeForRemoveRevokedTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const node = new Node(promise);
  const response = await node.getFeeForRemoveRevokedTrust(
    keyManager,
    req.body.address
  );

  return res.status(200).json({
    fee: response,
  });
}

async function removeRevokedTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const node = new Node(promise);
  let hash = await node.removeRevokedTrust(keyManager, req.body.address);

  return res.status(200).json({
    hash: hash,
  });
}

async function checkTrustExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const node = new Node(promise);

  const response = await node.checkTrustExists(req.body.address1, req.body.address2);

  return res.status(200).json({
    response: response,
  });
}

async function getTrustHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const promise = await connect();

  const node = new Node(promise);

  const response = await node.getTrustHistory();

  return res.status(200).json({
    response: response,
  });
}

export default {
  healthcheck,
  createAccount,
  getAddress,
  getAccountBalance,
  getFeeForTransferToken,
  transferToken,
  getFeeForNewSignal,
  sendNewSignal,
  getSignalHistory,
  getFeeForIssueTrust,
  issueTrust,
  getFeeForRemoveTrust,
  removeTrust,
  getFeeForRequestTrust,
  requestTrust,
  getFeeForCancelTrustRequest,
  cancelTrustRequest,
  getFeeForRevokeTrust,
  revokeTrust,
  getFeeForRemoveRevokedTrust,
  removeRevokedTrust,
  checkTrustExists,
  getTrustHistory,
};
