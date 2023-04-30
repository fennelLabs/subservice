import { Request, Response, NextFunction } from "express";
import { FennelAPI } from "../lib/api";

const API_URL = "http://127.0.0.1:9031";

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const message = JSON.stringify({
    prefix: "WF",
    version: "1",
    encryptionIndicator: "0",
    duressIndicator: "0",
    messageCode: "A",
    referenceIndicator: "0",
    referencedMessage:
      "0000000000000000000000000000000000000000000000000000000000000000",
    verificationMethod: req.body.verificationMethod,
    verificationData: req.body.verificationData,
  });

  const rpc = new FennelAPI(API_URL);
  let output = await rpc.whiteflag_encode(message);

  return res.status(200).json({
    message: output,
  });
}

async function discontinue_authentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const message = JSON.stringify({
    prefix: "WF",
    version: "1",
    encryptionIndicator: "0",
    duressIndicator: "0",
    messageCode: "A",
    referenceIndicator: "4",
    referencedMessage: req.body.referencedMessage,
    verificationMethod: req.body.verificationMethod,
    verificationData: req.body.verificationData,
  });

  const rpc = new FennelAPI(API_URL);
  let output = await rpc.whiteflag_encode(message);

  return res.status(200).json({
    message: output,
  });
}

async function whiteflag_encode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const message = JSON.stringify({
    prefix: "WF",
    version: "1",
    encryptionIndicator: req.body.encryptionIndicator,
    duressIndicator: req.body.duressIndicator,
    messageCode: req.body.messageCode,
    referenceIndicator: req.body.referenceIndicator,
    referencedMessage: req.body.referencedMessage,
    verificationMethod: req.body.verificationMethod,
    verificationData: req.body.verificationData,
    cryptoDataType: req.body.cryptoDataType,
    cryptoData: req.body.cryptoData,
    text: req.body.text,
    resourceMethod: req.body.resourceMethod,
    resourceData: req.body.resourceData,
    pseudoMessageCode: req.body.pseudoMessageCode,
    subjectCode: req.body.subjectCode,
    dateTime: req.body.dateTime,
    duration: req.body.duration,
    objectType: req.body.objectType,
    objectLatitude: req.body.objectLatitude,
    objectLongitude: req.body.objectLongitude,
    objectSizeDim1: req.body.objectSizeDim1,
    objectSizeDim2: req.body.objectSizeDim2,
    objectOrientation: req.body.objectOrientation,
    objectTypeQuant: req.body.objectTypeQuant,
  });

  const rpc = new FennelAPI(API_URL);
  let output = await rpc.whiteflag_encode(message);

  return res.status(200).json({
    message: output,
  });
}

async function whiteflag_decode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rpc = new FennelAPI(API_URL);
  let output = await rpc.whiteflag_decode(req.body.message);

  return res.status(200).json({
    message: output,
  });
}

export default {
  authenticate,
  discontinue_authentication,
  whiteflag_encode,
  whiteflag_decode,
};
