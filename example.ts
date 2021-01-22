import { TwitterApi } from './mod.ts';
import { keys } from './keys.ts';

// See correct format for keys in twitterApi.ts
let twitterApi = new TwitterApi(keys);
let twitterApi2 = new TwitterApi(keys, {apiVersion: '2'});

let userTimeline = await twitterApi.get("statuses/user_timeline.json", {
  user_id: "19025957",
  screen_name: "TTCnotices",
  count: "20",
  trim_user: "true",
  tweet_mode: "extended", // Used to prevent truncating tweets
});

console.log(await userTimeline.json());

let alternativeGet = await twitterApi.request("GET", "statuses/user_timeline.json", {
  user_id: "19025957",
  screen_name: "TTCnotices",
  count: "20",
  trim_user: "true",
  tweet_mode: "extended", // Used to prevent truncating tweets
});

let postResult = await twitterApi.post("statuses/update.json", {
  status: "Hello Ladies + Gentlement, a signed OAuth request!"
});

let alternativePost = await twitterApi.request("POST", "statuses/update.json", {
  status: "Hello Ladies + Gentlement, a signed OAuth request!"
});

const tweetInfo = (await (await twitterApi2.get('tweets/1320822556614676480', {
  'tweet.fields': 'referenced_tweets',
  'user.fields': 'username'
})).json());
console.log(data);
