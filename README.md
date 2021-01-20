# Deno Twitter Api

This module will make accessing the twitter api much easier. You must provide your
own keys and pass them in, and then this module will handle all of the request 
authentication. 

## How To Run
Install it by including the link to `mod.ts` in the import. There is more detail in `example.ts`.
`import { TwitterApi } from './mod.ts'`;

Run the example by running `deno run --allow-net example.ts`
An example output is listed in `out.txt`

## Making Requests
`example.ts` shows this in action. The output from `userTimeline` is shown in out.txt.
To output this to a file, run `deno run --allow-net example.ts > out.txt`.

`TwitterApi()` takes one parameter, an object with keys from the Twitter developer
website. They must be in the form
```typescript
interface Keys {
  consumerApiKey: string,
  consumerApiSecret: string,
  accessToken: string,
  accessTokenSecret: string,
}
```

There are a couple different ways of making requests. These are shown with `userTimeline`
and `alternativeGet` as well as with `postResult` and `alternativePost`.

The first parameter of `twitterApi.get()` is the url. This should not include anything 
before or including `/1.1/`. Only pass in the url after `/1.1/`. 

For example, if the url is `https://api.twitter.com/1.1/lists/statuses.json`, the parameter 
should be `lists/statuses.json`

The optional second parameter is the query parameters. They should follow the form
```
interface Options {
  [key: string]: string
}
```

The same goes for requests with `twitterApi.request()`. The only difference is that the
first paramter is `GET` or `POST`. The url becomes the second parameter and the
query parameters become the third parameter.

If you are working with the Twitter Ads Api, or the Twitter Developer Labs Endpoint, 
the baseurl set by default will not work for you. It is set to `https://api.twitter.com/1.1/`
by default. You can change this by calling `setBaseUrl("new url here");`. This will 
the url you set when making the call to the twitter api.

## Response
```json
[
  {
    created_at: "Mon May 18 02:07:34 +0000 2020",
    id: 1262203141157720000,
    id_str: "1262203141157720068",
    full_text: "Line 1 Yonge-University: Regular service has resumed southbound at St Andrew.\nhttps://t.co/464apkmgj...",
    truncated: false,
    display_text_range: [ 0, 101 ],
    entities: { hashtags: [Array], symbols: [Array], user_mentions: [Array], urls: [Array] },
    source: "<a href=\"https://www.hootsuite.com\" rel=\"nofollow\">Hootsuite Inc.</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: { id: 19025957, id_str: "19025957" },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: true,
    quoted_status_id: 1262202517313724400,
    quoted_status_id_str: "1262202517313724417",
    quoted_status_permalink: {
    url: "https://t.co/464apkmgjr",
    expanded: "https://twitter.com/TTCnotices/status/1262202517313724417",
    display: "twitter.com/TTCnotices/sta…"
    },
    quoted_status: {
    created_at: "Mon May 18 02:05:05 +0000 2020",
    id: 1262202517313724400,
    id_str: "1262202517313724417",
    full_text: "Line 1 Yonge-University: Delays of up to 15 minutes southbound near St Andrew while we respond to an...",
    truncated: false,
    display_text_range: [Array],
    entities: [Object],
    source: "<a href=\"https://www.hootsuite.com\" rel=\"nofollow\">Hootsuite Inc.</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: [Object],
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 2,
    favorite_count: 2,
    favorited: false,
    retweeted: false,
    lang: "en"
    },
    retweet_count: 2,
    favorite_count: 0,
    favorited: false,
    retweeted: false,
    possibly_sensitive: false,
    lang: "en"
  },
  ...
]
```
