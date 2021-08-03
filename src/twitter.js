import axios from "./axiosClient.js";
import puppeteer from "puppeteer";
import axiosClient from "./axiosClient.js";

const getFriendList = async (
  user_id,
  screen_name,
  count = 200,
  cursor = -1
) => {
  return new Promise((resolve, reject) => {
    axios
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
        console.log(arr_users.length);
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
    axios
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
    axios
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
    axios
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

const getLoginSession = async (username, password) => {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await page.goto("https://twitter.com/login");
      await page.waitForSelector("input[name='session[username_or_email]']");
      await page.type("input[name='session[username_or_email]']", username);
      await page.type("input[name='session[password]']", password);
      await page.click('div[data-testid="LoginForm_Login_Button3"]');
      await page.waitForTimeout(1000);
      await page.goto("https://twitter.com/home");
      const [response] = await Promise.all([
        page.waitForResponse((response) =>
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
    } finally {
      console.log("close");

      await browser.close();
    }
  });
};

const setAuth = (bearer_token, csrf_token, cookies) => {
  axiosClient.defaults.headers = {
    authorization: bearer_token,
    cookie: cookies,
    "x-csrf-token": csrf_token,
    authority: "api.twitter.com",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  };
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
};
