import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";
import { v4 } from "https://deno.land/std@0.51.0/uuid/mod.ts";

interface Keys {
  consumerApiKey: string,
  consumerApiSecret: string,
  accessToken: string,
  accessTokenSecret: string,
}

interface Settings {
  apiVersion: '1.1' | '2';
}

interface Options {
  [key: string]: string
}

export class TwitterApi {
  private oauth_consumer_key: string;
  private oauth_consumer_secret: string;
  private oauth_token: string;
  private oauth_token_secret: string;
  private settings: Settings;

  private baseUrl = "https://api.twitter.com/1.1/";
  private readonly oauth_version = "1.0";
  private readonly oauth_signature_method = "HMAC-SHA1";

  /**
  * This class is used to access the twitter api
  * 
  * The link for the implementation rules can be found here:
  * https://developer.twitter.com/en/docs/basics/authentication/guides/authorizing-a-request
  * 
  * [consumerApiKey], [consumerApiSecret], [accessToken], and [accessTokenSecret] 
  * come from the link above. They are unique for each app and user. You will
  * need to generate your own and pass them in when creating the TwitterOauth 
  * object.
  */
  constructor(keys: Keys, settings?: Settings) {
    this.oauth_consumer_key = keys.consumerApiKey;
    this.oauth_consumer_secret = keys.consumerApiSecret;
    this.oauth_token = keys.accessToken;
    this.oauth_token_secret = keys.accessTokenSecret;
    this.settings = Object.assign({apiVersion: '1.1'}, settings);
    this.baseUrl = 'https://api.twitter.com/' + this.settings.apiVersion + '/';
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /** 
   * Makes a get request to the twitter api 
   * The [url] should not include `https://api.twitter.com/1.1/`
   * 
   * Good: `lists/statuses.json`
   * 
   * Bad: `https://api.twitter.com/1.1/lists/statuses.json`
  */
  async get(url: string, options?: Options): Promise<Response> {
    return await this.request("GET", url, options);
  }

  /** 
   * Makes a post request to the twitter api 
   * The [url] should not include `https://api.twitter.com/1.1/`
   * 
   * Good: `lists/statuses.json`
   * 
   * Bad: `https://api.twitter.com/1.1/lists/statuses.json`
  */
  async post(url: string, options?: Options): Promise<Response> {
    return await this.request("POST", url, options);
  }

    /** 
   * Makes a post request to the twitter api 
   * The [url] should not include `https://api.twitter.com/1.1/`
   * 
   * Good: `lists/statuses.json`
   * 
   * Bad: `https://api.twitter.com/1.1/lists/statuses.json`
  */
  async request( method: "GET" | "POST", url: string, options?: Options): Promise<Response> {
    if(options == null) options = {};

    let oauth_nonce: string = this.generateNonce();
    let oauth_timestamp: string = this.getCurrentTimestamp();
    let oauth_signature: string = this.createSignature(
      oauth_nonce, 
      oauth_timestamp, 
      {
        options,
        method,
        url
      });

    let authHeader: string = this.createAuthHeader(oauth_nonce, oauth_timestamp, oauth_signature);

    let headers = new Headers({
      "Authorization": authHeader,
      "Content-Type": "applicaton/json"
    });

    let request = new Request(this.baseUrl + url + "?" + new URLSearchParams(options).toString(), {
      method,
      headers,
    });

    // console.log(authHeader)

    // console.log(request);
    // console.log(headers)

    return await fetch(request);
    // return setTimeout(() => {}, 1000);
  }

  private createSignature(
    oauth_nonce: string, 
    oauth_timestamp: string, 
    { options, method, url }: { options: Options, method: "GET" | "POST", url: string }
  ): string {
    let signatureString: string = "";
    let paramPairs: string[] = [];
    let params: Options = {
      "oauth_consumer_key": this.oauth_consumer_key,
      "oauth_nonce": oauth_nonce,
      "oauth_signature_method": this.oauth_signature_method,
      "oauth_timestamp": oauth_timestamp,
      "oauth_token": this.oauth_token,
      "oauth_version": this.oauth_version,
      ...options,
    };

    for(let k in params) {
      let v = params[k];
      paramPairs.push(this.percentEncode(k) + "=" + this.percentEncode(v));
    }

    paramPairs.sort();

    signatureString = method + "&"
      + this.percentEncode(this.baseUrl + url) + "&"
      + this.percentEncode(paramPairs.join("&"));

    let signatureBaseString: string = signatureString;
    let signingKey: string = this.percentEncode(this.oauth_consumer_secret)
      + "&"
      + this.percentEncode(this.oauth_token_secret);

    let hmacSha1: string = hmac("sha1", signingKey, signatureBaseString, "utf8", "base64").toString();

    return hmacSha1;
  }

  private createAuthHeader(
    oauth_nonce: string, 
    oauth_timestamp: string, 
    oauth_signature: string
  ): string {
    return [
      "OAuth ",
      this.encodeAuthHeaderKeyValuePair("oauth_consumer_key", this.oauth_consumer_key) + ", ",
      this.encodeAuthHeaderKeyValuePair("oauth_nonce", oauth_nonce) + ", ",
      this.encodeAuthHeaderKeyValuePair("oauth_signature", oauth_signature) + ", ",
      this.encodeAuthHeaderKeyValuePair("oauth_signature_method", this.oauth_signature_method) + ", ",
      this.encodeAuthHeaderKeyValuePair("oauth_timestamp", oauth_timestamp) + ", ",
      this.encodeAuthHeaderKeyValuePair("oauth_token", this.oauth_token) + ", ",
      this.encodeAuthHeaderKeyValuePair("oauth_version", this.oauth_version)
    ].join("");
  }

  private encodeAuthHeaderKeyValuePair(key: string, value: string): string {
    return this.percentEncode(key)
      + "=\""
      + this.percentEncode(value)
      + "\"";
  }

  private percentEncode(val: string): string {
    let encodedVal: string = encodeURIComponent(val);

    // Adjust for RFC 3986 section 2.2 Reserved Characters 
    let reservedChars: {match: RegExp, replace: string}[] = [
      { match: /\!/g, replace: "%21"},
      { match: /\#/g, replace: "%23"},
      { match: /\$/g, replace: "%24"},
      { match: /\&/g, replace: "%26"},
      { match: /\'/g, replace: "%27"},
      { match: /\(/g, replace: "%28"},
      { match: /\)/g, replace: "%29"},
      { match: /\*/g, replace: "%2A"},
      { match: /\+/g, replace: "%2B"},
      { match: /\,/g, replace: "%2C"},
      { match: /\//g, replace: "%2F"},
      { match: /\:/g, replace: "%3A"},
      { match: /\;/g, replace: "%3B"},
      { match: /\=/g, replace: "%3D"},
      { match: /\?/g, replace: "%3F"},
      { match: /\@/g, replace: "%40"},
      { match: /\[/g, replace: "%5B"},
      { match: /\]/g, replace: "%5D"},
    ];

    encodedVal = reservedChars.reduce((tot, {match, replace}) => {
      return tot.replace(match, replace);
    }, encodedVal);

    return encodedVal;
  }

  private generateNonce(): string {
    return v4.generate().replace(/-/g, "");
  }

  private getCurrentTimestamp(): string {
    return Math.floor(new Date().valueOf() / 1000).toString();
  }
}
