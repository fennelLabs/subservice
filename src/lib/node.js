import { ApiPromise } from "@polkadot/api";
import { TextDecoder } from "text-encoding";
import { NODE_URI_WS } from "./config";

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

  async getFeeForSendNewSignal(keymanager, content) {
    if (!keymanager.signer()) return;

    const api = await this.api();
    const info = await api.tx.signalModule
      .sendSignal(content)
      .paymentInfo(keymanager.address(), keymanager.signer());
    return info.partialFee.toNumber();
  }

  async sendNewSignal(keymanager, content) {
    try {
      const api = await this.api();
      await api.tx.signalModule
        .sendSignal(content)
        .signAndSend(
          keymanager.address(),
          { signer: keymanager.signer() },
          (result) => {
            console.log(`Current status is ${result.status}`);

            if (result.status.isInBlock) {
              console.log(
                `Transaction included at blockHash ${result.status.asInBlock}`
              );
            } else if (result.status.isFinalized) {
              console.log(
                `Transaction finalized at blockHash ${result.status.asFinalized}`
              );
            }
          }
        );
    } catch (e) {
      throw "sendNewSignal() failed.";
    }
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
        if (method == "sendSignal" && section == "signalModule") {
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
      return (
        element.section == "signalModule" && element.method == "SignalSent"
      );
    });

    let final_events = Array.from(
      new Set([...this._signals.value, ...new_events_list].map(JSON.stringify))
    ).map(JSON.parse);

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
      await this.disconnect();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getMetaData() {
    try {
      const api = await this.api();
      let data = await Promise.all([await api.rpc.methods()]);
      await this.disconnect();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  get_metadata_request() {
    let request = new Request(NODE_URI_WS, {
      method: "POST",
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "state_getMetadata",
      }),
      headers: { "Content-Type": "application/json" },
    });
    return request;
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
