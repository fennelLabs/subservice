import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import {
  mnemonicGenerate,
  decodeAddress,
  blake2AsHex,
} from "@polkadot/util-crypto";
import { stringToU8a, u8aToHex } from "@polkadot/util";
import { BehaviorSubject } from "rxjs";

class KeyManager {
  /**
   * @type {BehaviorSubject<KeyringPair>}
   * @private
   */
  _pair = new BehaviorSubject(null);
  pair$ = this._pair.asObservable();

  // Added this to bridge the mismatches between the
  // extension's signer type and the Keypair type.
  _address = new BehaviorSubject(null);
  address$ = this._address.asObservable();

  constructor(name) {
    this._name = name; // For debugging.
    this._keyring = new Keyring();
  }

  name() {
    return this._name;
  }

  signer() {
    return this._pair.value;
  }

  address() {
    return this._address.value;
  }

  generateAccount(name) {
    console.log(`Generating a wallet with ${this._name}`);
    const mnemonic = mnemonicGenerate(24);
    this.loadAccount(name, mnemonic);
    return mnemonic;
  }

  importAccount(name, mnemonic) {
    console.log(`Restoring a wallet with ${this._name}`);
    this.loadAccount(name, mnemonic);
    return !!this._pair.value.address;
  }

  sign(message) {
    return u8aToHex(this._pair.value.sign(stringToU8a(message)));
  }

  verify(message, signature, address) {
    const public_key = u8aToHex(decodeAddress(address));
    return this._pair.value.verify(message, signature, public_key);
  }

  hash(data) {
    return blake2AsHex(data);
  }

  getAccountAsJson() {
    return JSON.stringify(this._pair.value.toJson(this._pair.value.address));
  }

  /**
   * @private
   */
  loadAccount(name, mnemonic) {
    console.log(`Loading account ${name} with ${mnemonic}`);
    this._pair.next(
      this._keyring.addFromUri(mnemonic, { name: name }, "sr25519")
    );
    console.log(`Address: ${this._pair.value.address}`);
    this._address.next(this._pair.value.address);
  }
}

export default KeyManager;
