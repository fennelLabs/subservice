import { Request, Response, NextFunction } from "express";
import KeyManager from "../lib/key";
import Node from "../lib/node";
import { ApiPromise, WsProvider } from "@polkadot/api";

async function connect() {
  const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log(api.genesisHash.toHex());
  return api;
}

async function testRPC(req: Request, res: Response, next: NextFunction) {
  const response = await fetch("http://127.0.0.1:9944", {
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "system_chain",
      params: [],
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  return res.status(200).json({
    response: await response.json(),
  });
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

export default {
  testRPC,
  createAccount,
  getAddress,
  getAccountBalance,
  getFeeForTransferToken,
  transferToken,
  getFeeForNewSignal,
  sendNewSignal,
  getSignalHistory,
};
