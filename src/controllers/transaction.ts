import { Request, Response, NextFunction } from "express";
import KeyManager from "../lib/key";
import Node from "../lib/node";
import connect from "../lib/loadPolkadotApi";
import AccountBalanceService from "../lib/AccountBalance";

async function createAccount(req: Request, res: Response, next: NextFunction) {
  const response = new KeyManager("Main").generateAccount();

  return res.status(200).json({
    mnemonic: response,
  });
}

async function getAccountBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { rxjs } = connect();

  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const balanceService = new AccountBalanceService(rxjs, keyManager);
  await balanceService.listenForBalanceChanges();
  const response = balanceService.balance;

  return res.status(200).json({
    balance: response,
  });
}

async function getFeeForNewSignal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);

  const { promise } = connect();
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

  const { promise } = connect();
  const node = new Node(promise);
  await node.sendNewSignal(keyManager, req.body.content);

  return res.status(200);
}

async function getSignalHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { promise } = connect();

  const response = await new Node(promise).listenForSignals();

  return res.status(200).json({
    response: response,
  });
}

export default {
  createAccount,
  getAccountBalance,
  getFeeForNewSignal,
  sendNewSignal,
  getSignalHistory,
};
