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

    const api = await this.api();
    const info = await api.tx.balances
      .transferKeepAlive(to, amount)
      .paymentInfo(keyManager.address(), keyManager.signer());
    this.disconnect();
    return info.partialFee.toNumber();
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

    const api = await this.api();
    const info = await api.tx.signal
      .sendSignal(content)
      .paymentInfo(keymanager.address(), keymanager.signer());
    this.disconnect();
    return info.partialFee.toNumber();
  }

  async sendNewSignal(keymanager, content) {
    try {
      const api = await this.api();
      const txHash = await api.tx.signal
        .sendSignal(content)
        .signAndSend(keymanager.signer(), { nonce: -1 });
      this.disconnect();
      return txHash.toHex();
    } catch (e) {
      throw "sendNewSignal() failed.";
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
