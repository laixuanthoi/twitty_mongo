import puppeteer from "puppeteer";
import axiosClient from "./axiosClient.js";
import axios from "axios";

const getFriendList = async (
  user_id,
  screen_name,
  count = 200,
  cursor = -1
) => {
  return new Promise((resolve, reject) => {
    axiosClient
      .request({
        method: "get",
        url: "friends/list.json",
        headers: {
          authority: "api.twitter.com",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          referer: `https://twitter.com/${screen_name}/following`,
        },
        params: {
          user_id: user_id,
          screen_name: screen_name,
          cursor: cursor,
          count: count,
          skip_status: 1,
          include_user_entities: false,
        },
      })
      .then((response) => {
        const users = response.data.users;
        const next_cursor = Number(response.data.next_cursor);
        return resolve({ users, next_cursor });
      })
      .catch((error) => reject(error));
  });
};

const getAllFriendList = async (_user_id, _screen_name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let _next_cursor = -1;
      let arr_users = [];
      while (_next_cursor != 0) {
        const { users, next_cursor } = await getFriendList(
          _user_id,
          _screen_name,
          200,
          _next_cursor
        );
        _next_cursor = next_cursor;
        users.map((item) => arr_users.push(item));
        // console.log(arr_users.length);
      }
      return resolve(arr_users);
    } catch (error) {
      return reject(error);
    }
  });
};

const getFollowerList = async (
  user_id,
  screen_name,
  count = 200,
  cursor = -1
) => {
  return new Promise((resolve, reject) => {
    axiosClient
      .request({
        method: "get",
        url: "followers/list.json",
        headers: {
          authority: "api.twitter.com",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          referer: `https://twitter.com/${screen_name}`,
        },
        params: {
          user_id: user_id,
          screen_name: screen_name,
          cursor: cursor,
          count: count,
          skip_status: 1,
          include_user_entities: false,
        },
      })
      .then((response) => {
        const users = response.data.users;
        const next_cursor = Number(response.data.next_cursor);
        return resolve({ users, next_cursor });
      })
      .catch((error) => reject(error));
  });
};

const getAllFollowerList = async (_user_id, _screen_name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let _next_cursor = -1;
      let arr_users = [];
      while (_next_cursor != 0) {
        const { users, next_cursor } = await getFollowerList(
          _user_id,
          _screen_name,
          200,
          _next_cursor
        );
        _next_cursor = next_cursor;
        users.map((item) => arr_users.push(item));
      }
      return resolve(arr_users);
    } catch (error) {
      return reject(error);
    }
  });
};

const getUserDetail = async (user_id, screen_name) => {
  return new Promise((resolve, reject) => {
    axiosClient
      .request({
        method: "get",
        url: "users/lookup.json",
        headers: {
          authority: "api.twitter.com",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          referer: `https://twitter.com/${screen_name}/following`,
        },
        params: {
          user_id: user_id,
          screen_name: screen_name,
          include_entities: 0,
          tweet_mode: 0,
        },
      })
      .then((response) => {
        return resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};

const look_up_user = async (screen_name) => {
  return new Promise((resolve, reject) => {
    axiosClient
      .request({
        method: "get",
        url: "users/show.json",
        headers: {
          authority: "api.twitter.com",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          referer: `https://twitter.com/${screen_name}/following`,
        },
        params: {
          screen_name: screen_name,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};

const setAuth = (session) => {
  const { bearer_token, csrf_token, cookies } = session;

  axiosClient.defaults.headers = {
    authorization: bearer_token,
    cookie: cookies,
    "x-csrf-token": csrf_token,
    authority: "api.twitter.com",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  };
};

const browser = await puppeteer.launch({
  headless: false,
  args: [
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-setuid-sandbox",
    "--no-first-run",
    "--no-sandbox",
    "--no-zygote",
    "--single-process",
  ],
});
const pages = await browser.pages();

//page 0 : looking_no_auth
//page 1: looking_no_auth_one
//page 2: getLoginSession
// const page_lookup_no_auth = await browser.newPage(); //loopup and no closing page
pages[1] = await browser.newPage();
pages[2] = await browser.newPage();

const getLoginSession = async (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      await pages[2].setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await pages[2].goto("https://twitter.com/login");
      await pages[2].waitForSelector(
        "input[name='session[username_or_email]']"
      );
      await pages[2].type("input[name='session[username_or_email]']", username);
      await pages[2].type("input[name='session[password]']", password);

      await pages[2].click('div[data-testid="LoginForm_Login_Button"]');
      await pages[2].waitForTimeout(1000);
      await pages[2].goto("https://twitter.com/home");
      const [response] = await Promise.all([
        pages[2].waitForResponse((response) =>
          response
            .url()
            .includes("https://twitter.com/i/api/2/timeline/home.json")
        ),
      ]);
      const cookies = await page.evaluate(() => {
        return document.cookie;
      });

      const header = response._request._headers;

      resolve({
        csrf_token: header["x-csrf-token"],
        baerer_token: header["authorization"],
        cookies: cookies,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const lookup_user_no_auth = (screen_name) => {
  return new Promise(async (resolve, reject) => {
    try {
      await pages[0].setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await pages[0].goto(`https://twitter.com/${screen_name}`);
      pages[0].on("response", async (response) => {
        if (response.url().includes("UserByScreenNameWithoutResults")) {
          const json = await response.json();

          const user = json.data.user;
          resolve({
            id: Number(user.rest_id),
            id_str: user.rest_id,
            screen_name: screen_name,
            screen_name_low: screen_name.toLowerCase(),
            location: user.legacy.location || "",
            description: user.legacy.description || "",
            url: user.legacy.url || "",
            protected: user.legacy.protected || false,
            followers_count: Number(user.legacy.followers_count) || 0,
            friends_count: Number(user.legacy.friends_count) || 0,
            created_at: user.legacy.created_at,
            favourites_count: Number(user.legacy.favourites_count) || 0,
            statuses_count: Number(user.legacy.statuses_count) || 0,
            media_count: Number(user.legacy.media_count) || 0,
            profile_image_url: user.legacy.profile_image_url_https,
            friends_list: [],
            followers_list: [],
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const lookup_user_no_auth_one = (screen_name) => {
  return new Promise(async (resolve, reject) => {
    try {
      await pages[1].setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await pages[1].goto(`https://twitter.com/${screen_name}`);
      pages[1].on("response", async (response) => {
        if (response.url().includes("UserByScreenNameWithoutResults")) {
          const json = await response.json();

          const user = json.data.user;
          resolve({
            id: Number(user.rest_id),
            id_str: user.rest_id,
            screen_name: screen_name,
            screen_name_low: screen_name.toLowerCase(),
            location: user.legacy.location || "",
            description: user.legacy.description || "",
            url: user.legacy.url || "",
            protected: user.legacy.protected || false,
            followers_count: Number(user.legacy.followers_count) || 0,
            friends_count: Number(user.legacy.friends_count) || 0,
            created_at: user.legacy.created_at,
            favourites_count: Number(user.legacy.favourites_count) || 0,
            statuses_count: Number(user.legacy.statuses_count) || 0,
            media_count: Number(user.legacy.media_count) || 0,
            profile_image_url: user.legacy.profile_image_url_https,
            friends_list: [],
            followers_list: [],
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const get_friend_count = (screen_name) => {
  return new Promise(async (resolve, reject) => {
    const page1 = await browser.newPage();
    try {
      await page1.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await page1.goto(`https://twitter.com/${screen_name}`);
      const e = `a[href="/${screen_name}/following"]>span>span`;
      await page1.waitForSelector(e, { timeout: 0 });
      const element = await page1.$(e);
      const friends_count = await page1.evaluate(
        (element) => element.textContent,
        element
      );
      resolve(friends_count);
    } catch (error) {
      reject(error);
    } finally {
      await page1.close();
    }
  });
};
export {
  getFriendList,
  getAllFriendList,
  getUserDetail,
  look_up_user,
  getLoginSession,
  getFollowerList,
  getAllFollowerList,
  setAuth,
  lookup_user_no_auth,
  get_friend_count,
  lookup_user_no_auth_one,
};
