import { RESTfulAPIClient } from "./apiClient";

export class FennelAPI extends RESTfulAPIClient{
  constructor(url) {
    super(url);
  }

  check() {
    return this.send(
      {
        method: "v1/hello_there",
      }
    );
  }

  generateKeypair() {
    return this.send(
      {
        method: "v1/get_or_generate_keypair",
      }
    );
  }

  encrypt(public_key_bytes, plaintext) {
    return this.send(
      {
        method: "v1/encrypt",
        params: JSON.stringify({
          public_key_bytes: public_key_bytes,
          plaintext: plaintext,
        }),
      }
    );
  }

  decrypt(ciphertext) {
    return this.send(
      {
        method: "v1/decrypt",
        params: JSON.stringify({
          ciphertext: ciphertext,
        }),
      }
    );
  }

  sign(message) {
    return this.send(
      {
        method: "v1/sign",
        params: JSON.stringify({
          message: message,
        }),
      }
    );
  }

  verify(public_key_bytes, message, signature) {
    return this.send(
      {
        method: "v1/verify",
        params: JSON.stringify({
          public_key_bytes: public_key_bytes,
          message: message,
          signature: signature,
        }),
      }
    );
  }

  whiteflag_encode(message) {
    let arg = JSON.stringify(message);
    return this.send(
      {
        method: "v1/whiteflag_encode",
        params: arg,
      }
    );
  }

  whiteflag_decode(message) {
    this.send(
      {
        method: "v1/whiteflag_decode",
        params: message,
      }
    );
  }
}
