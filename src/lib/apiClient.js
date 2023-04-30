export class RESTfulAPIClient {
  _url;

  constructor(url) {
    console.log(`RPC: ${url}`);
    this._url = url;
  }

  async send({ method, params }) {
    if (!/\w+/g.test(method)) {
      console.error("method name cannot be empty");
      return;
    }

    let response = await fetch(`${this._url}/${method}`, {
      method: "POST",
      body: params,
    });

    return response.json();
  }
}
