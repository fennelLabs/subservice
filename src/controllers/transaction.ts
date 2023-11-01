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
  return res.status(200).sendStatus(200);
}

async function createAccount(req: Request, res: Response, next: NextFunction) {
  const keyManager = new KeyManager("Main");

  return res.status(200).json({
    mnemonic: keyManager.generateAccount(),
    address: keyManager.address(),
    publicKey: keyManager.publicKey(),
  });
}

async function downloadAccountAsJson(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);
  const response = keyManager.getAccountAsJson();

  return res.status(200).json({
    json: response,
  });
}

async function getPublicKey(req: Request, res: Response, next: NextFunction) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.mnemonic);
  const response = keyManager.publicKey();

  return res.status(200).json({
    publicKey: response,
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

async function getAddressFromPublicKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const keyManager = new KeyManager("Main");
  keyManager.importAccount("Main", req.body.publicKey);
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
  try {
    const promise = await connect();

    const keyManager = new KeyManager("Main");
    keyManager.importAccount("Main", req.body.mnemonic);

    const node = new Node(promise);
    const response = await node.getAccountBalance(keyManager);

    return res.status(200).json({
      balance: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getFeeForTransferToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function transferToken(req: Request, res: Response, next: NextFunction) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getFeeForNewSignal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function sendNewSignal(req: Request, res: Response, next: NextFunction) {
  try {
    const keyManager = new KeyManager("Main");
    keyManager.importAccount("Main", req.body.mnemonic);

    const promise = await connect();
    const node = new Node(promise);
    let hash = await node.sendNewSignal(keyManager, req.body.content);

    return res.status(200).json({
      hash: hash,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getSignalHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const promise = await connect();

    const response = await new Node(promise).listenForSignals();

    return res.status(200).json({
      response: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getFeeForIssueTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function issueTrust(req: Request, res: Response, next: NextFunction) {
  try {
    const keyManager = new KeyManager("Main");
    keyManager.importAccount("Main", req.body.mnemonic);

    const promise = await connect();
    const node = new Node(promise);
    let hash = await node.issueTrust(keyManager, req.body.address);

    return res.status(200).json({
      hash: hash,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getFeeForRemoveTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function removeTrust(req: Request, res: Response, next: NextFunction) {
  try {
    const keyManager = new KeyManager("Main");
    keyManager.importAccount("Main", req.body.mnemonic);

    const promise = await connect();
    const node = new Node(promise);
    let hash = await node.removeTrust(keyManager, req.body.address);

    return res.status(200).json({
      hash: hash,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getFeeForRequestTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function requestTrust(req: Request, res: Response, next: NextFunction) {
  try {
    const promise = await connect();

    const keyManager = new KeyManager("Main");
    keyManager.importAccount("Main", req.body.mnemonic);

    const node = new Node(promise);
    let hash = await node.requestTrust(keyManager, req.body.address);

    return res.status(200).json({
      hash: hash,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getFeeForCancelTrustRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function cancelTrustRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const promise = await connect();

    const keyManager = new KeyManager("Main");
    keyManager.importAccount("Main", req.body.mnemonic);

    const node = new Node(promise);
    let hash = await node.cancelTrustRequest(keyManager, req.body.address);

    return res.status(200).json({
      hash: hash,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getFeeForRevokeTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function revokeTrust(req: Request, res: Response, next: NextFunction) {
  try {
    const promise = await connect();

    const keyManager = new KeyManager("Main");
    keyManager.importAccount("Main", req.body.mnemonic);

    const node = new Node(promise);
    let hash = await node.revokeTrust(keyManager, req.body.address);

    return res.status(200).json({
      hash: hash,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getFeeForRemoveRevokedTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function removeRevokedTrust(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const promise = await connect();

    const keyManager = new KeyManager("Main");
    keyManager.importAccount("Main", req.body.mnemonic);

    const node = new Node(promise);
    let hash = await node.removeRevokedTrust(keyManager, req.body.address);

    return res.status(200).json({
      hash: hash,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function checkTrustExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const promise = await connect();

    const node = new Node(promise);

    const response = await node.checkTrustExists(
      req.body.address1,
      req.body.address2
    );

    return res.status(200).json({
      response: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getTrustHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const promise = await connect();

    const node = new Node(promise);

    const response = await node.getTrustHistory();

    return res.status(200).json({
      response: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function getTrustParameters(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const promise = await connect();

    const node = new Node(promise);

    const response = await node.getTrustParameters();

    return res.status(200).json({
      response: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
}

async function calculateTrustScore(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parameters = req.body.parameters;
  const variables = req.body.variables;

  let score = 0;

  if (parameters.length !== variables.length) {
    return res.status(400).json({
      error: "Parameters and variables length mismatch",
    });
  }

  for (let i = 0; i < parameters.length; i++) {
    score += parameters[i] * variables[i];
  }

  return res.status(200).json({
    score: score,
  });
}

export default {
  healthcheck,
  createAccount,
  downloadAccountAsJson,
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
  getPublicKey,
  getAddressFromPublicKey,
  getTrustParameters,
  calculateTrustScore,
};
