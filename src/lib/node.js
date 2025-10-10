import { ApiPromise } from "@polkadot/api";
import { TextDecoder } from "text-encoding";

class Node {
  /**
   * @type {ApiPromise}
   * @private
   */
  _api;

  /**
   * @param {ApiPromise} api
   */
  constructor(api) {
    this._api = api;
  }

  async getAccountBalance(keyManager) {
    const api = await this.api();
    const { data: balance } = await api.query.system.account(
      keyManager.address()
    );
    this.disconnect();
    // Very large balances upset the toNumber() call
    return `${balance.free}`;
  }

  async getFeeForTransferToken(keyManager, to, amount) {
    if (!keyManager.signer()) return;

    try {
      const api = await this.api();

      // Ensure amount is properly formatted as BigNumber
      const parsedAmount =
        typeof amount === "string" ? parseInt(amount) : amount;
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error(`Invalid amount: ${amount}`);
      }

      // Validate address format
      if (!to || typeof to !== "string" || to.length < 40) {
        throw new Error(`Invalid address format: ${to}`);
      }

      // Create transaction and get payment info
      const tx = api.tx.balances.transferKeepAlive(to, parsedAmount);
      const info = await tx.paymentInfo(keyManager.address());

      this.disconnect();
      return info.partialFee.toNumber();
    } catch (error) {
      console.error("getFeeForTransferToken error:", error);
      this.disconnect();

      // Return a reasonable fallback fee (0.5 FNL in smallest unit)
      return 500000000000;
    }
  }

  async transferToken(keymanager, address, amount) {
    const api = await this.api();
    const txHash = await api.tx.balances
      .transferKeepAlive(address, parseInt(amount))
      .signAndSend(keymanager.signer(), { nonce: -1 });
    this.disconnect();
    return txHash.toHex();
  }

  async getTrustParameters() {
    const api = await this.api();
    let trustParameterList = await api.query.trust.trustParameterList.entries();
    let result = [];
    trustParameterList.forEach(
      ([
        {
          args: [address, id],
        },
        value,
      ]) => {
        result.push({
          address: address,
          parameter_id: id,
          value: value.toNumber(),
        });
      }
    );
    this.disconnect();
    return result;
  }

  async getFeeForSendNewSignal(keymanager, content) {
    if (!keymanager.signer()) return;

    try {
      const api = await this.api();

      console.log("getFeeForSendNewSignal called with:");
      console.log("- content:", content);
      console.log("- content length:", content?.length);
      console.log("- keymanager address:", keymanager.address());
      console.log(
        "- runtime version:",
        (await api.rpc.state.getRuntimeVersion()).toHuman()
      );

      // Validate content
      if (!content || typeof content !== "string" || content.length === 0) {
        throw new Error(`Invalid signal content: ${content}`);
      }

      // Check if signal pallet exists
      if (!api.tx.signal || !api.tx.signal.sendSignal) {
        throw new Error("Signal pallet not found in blockchain runtime");
      }

      // Create transaction and get payment info with updated API
      console.log("Creating transaction with updated Polkadot.js...");
      const tx = api.tx.signal.sendSignal(content);
      console.log("Getting payment info with compatible API version...");
      const info = await tx.paymentInfo(keymanager.address());
      console.log("Payment info successful! Fee:", info.partialFee.toString());

      this.disconnect();
      return info.partialFee.toNumber();
    } catch (error) {
      console.error("getFeeForSendNewSignal error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split("\n")[0],
      });
      this.disconnect();

      // Fallback fee calculation if runtime API still has issues
      const contentLength = content?.length || 0;
      const baseFee = 10000000000; // 0.01 FNL
      const sizeFee = contentLength * 100000; // ~0.0000001 FNL per character
      const complexityFee = 5000000000; // 0.005 FNL for Whiteflag processing
      const totalFee = baseFee + sizeFee + complexityFee;

      console.log(
        `Using fallback fee calculation: ${totalFee} (~${(
          totalFee / 1000000000000
        ).toFixed(4)} FNL)`
      );
      return totalFee;
    }
  }

  async sendNewSignal(keymanager, content) {
    try {
      const api = await this.api();

      console.log("sendNewSignal called with content:", content);
      console.log("Account address:", keymanager.address());

      // Get the current nonce for the account
      const nonce = await api.rpc.system.accountNextIndex(keymanager.address());
      console.log("Using nonce:", nonce.toString());

      const txHash = await api.tx.signal
        .sendSignal(content)
        .signAndSend(keymanager.signer(), { nonce });

      console.log("Transaction submitted successfully:", txHash.toHex());
      this.disconnect();
      return txHash.toHex();
    } catch (e) {
      console.error("sendNewSignal error:", e);
      console.error("Error details:", {
        name: e.name,
        message: e.message,
        stack: e.stack?.split("\n")[0],
      });
      this.disconnect();
      throw "sendNewSignal() failed.";
    }
  }

  /**
   * Send a new signal and wait for block inclusion to collect blockchain data
   * @param {*} keymanager
   * @param {*} content
   * @returns {Promise<{txHash: string, blockNumber: number, blockHash: string, extrinsicIndex: number, executionSuccess: boolean, executionError: string|null}>}
   */
  async sendNewSignalWithBlockchainData(keymanager, content) {
    try {
      const api = await this.api();

      console.log(
        "sendNewSignalWithBlockchainData called with content:",
        content
      );
      console.log("Account address:", keymanager.address());

      // Get the current nonce for the account
      const nonce = await api.rpc.system.accountNextIndex(keymanager.address());
      console.log("Using nonce:", nonce.toString());

      return new Promise((resolve, reject) => {
        api.tx.signal
          .sendSignal(content)
          .signAndSend(
            keymanager.signer(),
            { nonce },
            async ({ status, events, dispatchError, txHash }) => {
              try {
                console.log("Transaction status:", status.type);

                if (status.isInBlock) {
                  console.log(
                    "Transaction included in block:",
                    status.asInBlock.toHex()
                  );

                  const blockHash = status.asInBlock.toHex();
                  const header = await api.rpc.chain.getHeader(blockHash);
                  const blockNumber = header.number.toNumber();

                  // Find extrinsic index in the block
                  let extrinsicIndex = -1;
                  try {
                    const block = await api.rpc.chain.getBlock(blockHash);
                    const allExtrinsics = block.block.extrinsics;
                    extrinsicIndex = allExtrinsics.findIndex(
                      (ext) => ext.hash.toHex() === txHash.toHex()
                    );
                  } catch (blockError) {
                    console.warn("Could not fetch block to find extrinsic index:", blockError.message);
                    // Continue without extrinsic index - it's not critical
                  }

                  // Check execution status
                  let executionSuccess = true;
                  let executionError = null;

                  if (dispatchError) {
                    executionSuccess = false;
                    if (dispatchError.isModule) {
                      const decoded = api.registry.findMetaError(
                        dispatchError.asModule
                      );
                      executionError = `${decoded.section}.${
                        decoded.name
                      }: ${decoded.docs.join(" ")}`;
                    } else {
                      executionError = dispatchError.toString();
                    }
                    console.error(
                      "Transaction failed with error:",
                      executionError
                    );
                  }

                  const result = {
                    txHash: txHash.toHex(),
                    blockNumber: blockNumber,
                    blockHash: blockHash,
                    extrinsicIndex: extrinsicIndex,
                    executionSuccess: executionSuccess,
                    executionError: executionError,
                  };

                  console.log("Blockchain data collected:", result);
                  this.disconnect();
                  resolve(result);
                  return; // Exit callback after resolving
                }
              } catch (error) {
                console.error("Error in status callback:", error);
                this.disconnect();
                reject(error);
              }
            }
          )
          .catch((error) => {
            console.error("signAndSend error:", error);
            this.disconnect();
            reject(error);
          });
      });
    } catch (e) {
      console.error("sendNewSignalWithBlockchainData error:", e);
      console.error("Error details:", {
        name: e.name,
        message: e.message,
        stack: e.stack?.split("\n")[0],
      });
      this.disconnect();
      throw new Error("sendNewSignalWithBlockchainData() failed: " + e.message);
    }
  }

  async getFeeForIssueTrust(keymanager, address) {
    if (!keymanager.signer()) return;

    const api = await this.api();
    const info = await api.tx.trust
      .issueTrust(address)
      .paymentInfo(keymanager.address(), keymanager.signer());
    this.disconnect();
    return info.partialFee.toNumber();
  }

  async issueTrust(keymanager, address) {
    try {
      const api = await this.api();
      const txHash = await api.tx.trust
        .issueTrust(address)
        .signAndSend(keymanager.signer(), { nonce: -1 });
      this.disconnect();
      return txHash.toHex();
    } catch (e) {
      throw "issueTrust() failed.";
    }
  }

  async getFeeForRemoveTrust(keymanager, address) {
    if (!keymanager.signer()) return;

    const api = await this.api();
    const info = await api.tx.trust
      .removeTrust(address)
      .paymentInfo(keymanager.address(), keymanager.signer());
    this.disconnect();
    return info.partialFee.toNumber();
  }

  async removeTrust(keymanager, address) {
    try {
      const api = await this.api();
      const txHash = await api.tx.trust
        .removeTrust(address)
        .signAndSend(keymanager.signer(), { nonce: -1 });
      this.disconnect();
      return txHash.toHex();
    } catch (e) {
      throw "removeTrust() failed.";
    }
  }

  async getFeeForRequestTrust(keymanager, address) {
    if (!keymanager.signer()) return;

    const api = await this.api();
    const info = await api.tx.trust
      .requestTrust(address)
      .paymentInfo(keymanager.address(), keymanager.signer());
    this.disconnect();
    return info.partialFee.toNumber();
  }

  async requestTrust(keymanager, address) {
    try {
      const api = await this.api();
      const txHash = await api.tx.trust
        .requestTrust(address)
        .signAndSend(keymanager.signer(), { nonce: -1 });
      this.disconnect();
      return txHash.toHex();
    } catch (e) {
      throw "requestTrust() failed.";
    }
  }

  async getFeeForCancelTrustRequest(keymanager, address) {
    if (!keymanager.signer()) return;

    const api = await this.api();
    const info = await api.tx.trust
      .cancelTrustRequest(address)
      .paymentInfo(keymanager.address(), keymanager.signer());
    this.disconnect();
    return info.partialFee.toNumber();
  }

  async cancelTrustRequest(keymanager, address) {
    try {
      const api = await this.api();
      const txHash = await api.tx.trust
        .cancelTrustRequest(address)
        .signAndSend(keymanager.signer(), { nonce: -1 });
      this.disconnect();
      return txHash.toHex();
    } catch (e) {
      throw "cancelTrustRequest() failed.";
    }
  }

  async getFeeForRevokeTrust(keymanager, address) {
    if (!keymanager.signer()) return;

    const api = await this.api();
    const info = await api.tx.trust
      .revokeTrust(address)
      .paymentInfo(keymanager.address(), keymanager.signer());
    this.disconnect();
    return info.partialFee.toNumber();
  }

  async revokeTrust(keymanager, address) {
    try {
      const api = await this.api();
      const txHash = await api.tx.trust
        .revokeTrust(address)
        .signAndSend(keymanager.signer(), { nonce: -1 });
      this.disconnect();
      return txHash.toHex();
    } catch (e) {
      throw "revokeTrust() failed.";
    }
  }

  async getFeeForRemoveRevokedTrust(keymanager, address) {
    if (!keymanager.signer()) return;

    const api = await this.api();
    const info = await api.tx.trust
      .removeRevokedTrust(address)
      .paymentInfo(keymanager.address(), keymanager.signer());
    this.disconnect();
    return info.partialFee.toNumber();
  }

  async removeRevokedTrust(keymanager, address) {
    try {
      const api = await this.api();
      const txHash = await api.tx.trust
        .removeRevokedTrust(address)
        .signAndSend(keymanager.signer(), { nonce: -1 });
      this.disconnect();
      return txHash.toHex();
    } catch (e) {
      throw "removeRevokedTrust() failed.";
    }
  }

  async checkTrustExists(address1, address2) {
    const api = await this.api();
    const data = await api.query.trust.trustIssuance(address1, address2);
    this.disconnect();
    return data.toNumber();
  }

  async getTrustHistory() {
    const api = await this.api();
    let trustHistory = await api.query.trust.trustIssuance.entries();
    let result = [];
    trustHistory.forEach(
      ([
        {
          args: [address, address2],
        },
        value,
      ]) => {
        result.push({
          address: address,
          address2: address2,
          value: value.toNumber(),
        });
      }
    );
    this.disconnect();
    return result;
  }

  async getRatingHistory() {
    const api = await this.api();
    let ratingHistory = await api.query.signal.ratingSignalList.entries();
    let result = [];
    ratingHistory.forEach(
      ([
        {
          args: [address, address2],
        },
        value,
      ]) => {
        result.push({
          address: address,
          address2: address2,
          value: value.toNumber(),
        });
      }
    );
    this.disconnect();
    return result;
  }

  async listenForSignals() {
    var events_list = [];

    const decoder = new TextDecoder("utf-8");

    const api = await this.api();

    const signedBlock = await api.rpc.chain.getBlock();
    const apiAt = await api.at(signedBlock.block.header.hash);
    const allRecords = await apiAt.query.system.events();

    signedBlock.block.extrinsics.forEach(
      ({ method: { method, section } }, index) => {
        if (method == "sendSignal" && section == "signal") {
          const events = allRecords
            .filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)
            )
            .map(({ event }) => {
              return {
                id: event.index,
                section: event.section,
                method: event.method,
                message: decoder.decode(event.data[0]),
              };
            });

          events_list.push(...events);
        }
      }
    );

    let new_events_list = events_list.filter((element) => {
      return element.section == "signal" && element.method == "SignalSent";
    });

    let final_events = Array.from(
      new Set([...new_events_list].map(JSON.stringify))
    ).map(JSON.parse);

    this.disconnect();
    return final_events;
  }

  async getDiagnosticsData() {
    const api = await this.api();

    try {
      let data = await Promise.all([
        api.genesisHash.toHex(),
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version(),
      ]);
      this.disconnect();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getMetaData() {
    try {
      const api = await this.api();
      let data = await Promise.all([await api.rpc.methods()]);
      this.disconnect();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  hex_to_string(metadata) {
    return metadata
      .match(/.{1,2}/g)
      .map(function (v) {
        return String.fromCharCode(parseInt(v, 16));
      })
      .join("");
  }

  disconnect() {
    this.api().then((a) => a.disconnect());
  }

  apiNotReady() {
    return !this._api?.isConnected;
  }

  async api() {
    await this._api.isReady;
    return this._api;
  }
}

export default Node;
