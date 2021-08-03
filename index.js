import {
  getAllFriendList,
  setAuth,
  getFriendList,
  look_up_user,
} from "./src/twitter.js";
import { User, Auth } from "./src/mongo.js";
import axiosClient from "./src/axiosClient.js";

import { bot } from "./src/telegrambot.js";
const bearer_token =
  "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
const csrf_token =
  "ac02caf432b73e8fc51b1cfb82d3a62427e18c6e8d10d2b9a5614b2afc8eac7af149e724f651c61a05566735791c3125bbada53f04cd8ede4ccbcad85e057efba60a5e014538487eac3bda683df7e7e5";
const cookies = `_ga=GA1.2.1209713735.1627306972; kdt=oQoIszKRUVUI7B5TGIegTxw4XBCHphYfqqz1yEQ3; remember_checked_on=1; dnt=1; personalization_id="v1_uTJB7Vz0OcUKqh8JZ5K9jA=="; guest_id=v1%3A162730971704131887; ads_prefs="HBISAAA="; auth_token=b9ef1652e93f2ca674ddf717b93bbf25cbe9d656; ct0=ac02caf432b73e8fc51b1cfb82d3a62427e18c6e8d10d2b9a5614b2afc8eac7af149e724f651c61a05566735791c3125bbada53f04cd8ede4ccbcad85e057efba60a5e014538487eac3bda683df7e7e5; twid=u%3D1285240178664017921; external_referer=padhuUp37zjgzgv1mFWxJ12Ozwit7owX|0|8e8t2xd8A2w%3D; _gid=GA1.2.53155257.1627888035; lang=en`;

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `==>HELP<==
      /help
      /auth add <username> <password>
      /auth remove <username>
      /auth list
      /user add <screen_name>
      /user remove <screen_name>
      /user list
      /user info <screen_name>
    `
  );
});

const excuteCommand = (args, model) => {
  if (model == "Auth") {
    return new Promise(async (resolve, reject) => {
      const cmd = args[0];
      switch (cmd) {
        case "add": {
          Auth.exists({ username: args[1] }).then((is_exist) => {
            if (is_exist) reject("Auth username already exists");
          });

          const newAuth = new Auth({ username: args[1], password: args[2] });
          newAuth.save((err) => {
            if (err) reject(err);
            resolve(`Success! ${args[1]} added`);
          });
          break;
        }
        case "remove": {
          Auth.exists({ username: args[1] }).then(async (is_exist) => {
            if (is_exist) {
              await Auth.deleteOne({ username: args[1] }, (err) => {
                if (err) reject(err);
                resolve(`Success! ${args[1]} removed`);
              });
            } else {
              reject("Auth username not found");
            }
          });

          break;
        }
        case "list": {
          const listUser = await Auth.find();
          if (listUser == 0) resolve("Empty!");
          let msg = "";
          listUser.map((item) => {
            msg += `\n${item.username}`;
          });
          resolve(msg);
          break;
        }
        default: {
          reject("Invalid Command");
          break;
        }
      }
    });
  }
  if (model == "User") {
    return new Promise(async (resolve, reject) => {
      const cmd = args[0];
      switch (cmd) {
        case "add": {
          User.exists({ screen_name_low: args[1].toLowerCase() }).then(
            (is_exist) => {
              if (is_exist) reject("User already exists");
            }
          );
          look_up_user(args[1])
            .then((uData) => {
              const newAuth = new User({
                ...uData,
                screen_name_low: uData.screen_name.toLowerCase(),
              });
              newAuth.save((err) => {
                if (err) reject(err);
                resolve(`Success! ${args[1]} added`);
              });
            })
            .catch((err) => reject(err));
          break;
        }
        case "remove": {
          User.exists({ screen_name_low: args[1].toLowerCase() }).then(
            async (is_exist) => {
              if (is_exist) {
                await User.deleteOne(
                  { screen_name_low: args[1].toLowerCase() },
                  (err) => {
                    if (err) reject(err);
                    resolve(`Success! ${args[1]} removed`);
                  }
                );
              } else {
                reject("User not found");
              }
            }
          );

          break;
        }
        case "list": {
          const listUser = await User.find();
          if (listUser == 0) resolve("Empty");
          let msg = "";
          listUser.map((item) => {
            msg += `\n${item.screen_name}`;
          });
          resolve(msg);
          break;
        }
        default: {
          reject("Invalid Command");
          break;
        }
      }
    });
  }
};

bot.onText(/\/auth (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].split(" ");
  excuteCommand(args, "Auth")
    .then((msg) => bot.sendMessage(chatId, msg))
    .catch((err) => {
      bot.sendMessage(chatId, err.toString());
    });
});

bot.onText(/\/user (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].split(" ");
  excuteCommand(args, "User")
    .then((msg) => bot.sendMessage(chatId, msg))
    .catch((err) => {
      bot.sendMessage(chatId, err.toString());
    });
});

axiosClient.interceptors.request.use(
  function (request) {
    const url = request.url;

    return request;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    console.log(response);
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

(async () => {
  setAuth(bearer_token, csrf_token, cookies);
})();
