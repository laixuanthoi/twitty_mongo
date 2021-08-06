import {
  getAllFriendList,
  setAuth,
  getFriendList,
  look_up_user,
  getLoginSession,
  lookup_user_no_auth,
  get_friend_count,
} from "./src/twitter.js";
import { User, Auth } from "./src/mongo.js";
import axiosClient from "./src/axiosClient.js";

// import { bot } from "./src/telegrambot.js";

import TelegramBot from "node-telegram-bot-api";

const token = "1844525211:AAH5lzam-fffd6pLh8Li6rH8uXpS8Gh5lKU";

const bot = new TelegramBot(token, { polling: true });

const loginSession = {
  bearer_token:
    "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
  csrf_token:
    "551db06c433ef17abe0c3231ff9d76f8c43c772f3a5625d63f664d91757acaa3fa62212c5e87913bfd4a824a829d98acd4eeb00a66c1394395813759e0cc937e4845057a2709649ae196a647d63cb7b1",
  cookies: `personalization_id="v1_Kw6w5zZVTv1bUhLrO6mbTg=="; guest_id=v1%3A162807770358855755; _sl=1; gt=1422887139943976960; _ga=GA1.2.267837280.1628077715; _gid=GA1.2.880239999.1628077715; dnt=1; ads_prefs="HBISAAA="; remember_checked_on=1; twid=u%3D1285240178664017921; ct0=551db06c433ef17abe0c3231ff9d76f8c43c772f3a5625d63f664d91757acaa3fa62212c5e87913bfd4a824a829d98acd4eeb00a66c1394395813759e0cc937e4845057a2709649ae196a647d63cb7b1; lang=en`,
};

const refreshSession = (dt) => {
  const inv = setInterval(async () => {
    const auths = await Auth.find();
    if (auths.length !== 0) {
      auths.forEach((a) => {
        getLoginSession(a.username, a.password).then(async (session) => {
          await Auth.updateOne({ username: a.username }, { ...session });
          await setAuth(session);
        });
      });
    }
  }, dt);
};

const excuteCommand = (args, model) => {
  if (model == "Auth") {
    return new Promise(async (resolve, reject) => {
      const cmd = args[0];
      switch (cmd) {
        case "add": {
          Auth.exists({ username: args[1] }).then((is_exist) => {
            if (is_exist) reject("Auth username already exists");
          });

          getLoginSession(args[1], args[2])
            .then((session) => {
              const newAuth = new Auth({
                username: args[1],
                password: args[2],
                ...session,
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

          const uData = await look_up_user(args[1]);
          const friends_list = await getAllFriendList(
            uData.id_str,
            uData.screen_name
          );
          const newAuth = new User({
            ...uData,
            friends_list: friends_list,
            screen_name_low: uData.screen_name.toLowerCase(),
          });

          newAuth.save((err) => {
            if (err) reject(err);
            resolve(`Success! ${args[1]} added`);
          });
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
            msg += `\n${item.name} - ${item.screen_name}`;
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

var chatId = "-586577405";
bot.onText(/\/help/, (msg) => {
  chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `==>HELP<==
      /help
      /auth add <username> <password>
      /auth remove <username>
      /auth list
      /user add <screen_name>
      /user remove <screen_name>
      /user li-st
      /user info <screen_name>
    `
  );
});

bot.onText(/\/auth (.+)/, async (msg, match) => {
  chatId = msg.chat.id;
  const args = match[1].split(" ");
  excuteCommand(args, "Auth")
    .then((msg) => bot.sendMessage(chatId, msg))
    .catch((err) => {
      bot.sendMessage(chatId, err.toString());
    });
});

bot.onText(/\/user (.+)/, (msg, match) => {
  chatId = msg.chat.id;
  const args = match[1].split(" ");
  excuteCommand(args, "User")
    .then((msg) => bot.sendMessage(chatId, msg))
    .catch((err) => {
      bot.sendMessage(chatId, err.toString());
    });
});

axiosClient.interceptors.request.use(
  function (request) {
    // console.log(request.url);
    return request;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

const delay = (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
};
const spydingFriend = async (dt) => {
  while (true) {
    const users = await User.find();
    if (users.length !== 0) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        var friends_count = await get_friend_count(user.screen_name);
        friends_count = friends_count.replace(/,/, "");
        friends_count = Number(friends_count);
        if (friends_count != user.friends_count) {
          //has new friend
          const new_friend_list = await getAllFriendList(
            user.id_str,
            user.screen_name
          );

          const diff_remove = user.friends_list.filter(
            ({ id_str: id1 }) =>
              !new_friend_list.some(({ id_str: id2 }) => id2 === id1)
          );
          const diff_add = new_friend_list.filter(
            ({ id_str: id1 }) =>
              !user.friends_list.some(({ id_str: id2 }) => id2 === id1)
          );

          // find difference friends
          diff_remove.forEach((d) =>
            bot.sendMessage(
              chatId,
              `🚨Alert\n✅ ${user.name} just unfollowing ${d.name}\nhttp://twitter.com/${d.screen_name}`
            )
          );
          diff_add.forEach((d) =>
            bot.sendMessage(
              chatId,
              `🚨Alert\n✅ ${user.name} just following ${d.name}\nhttp://twitter.com/${d.screen_name}`
            )
          );
          await User.updateOne(
            { screen_name_low: user.screen_name_low },
            {
              friends_list: new_friend_list,
            }
          );
        }
        await User.updateOne(
          { screen_name_low: user.screen_name_low },
          {
            friends_count: friends_count,
          }
        );
      }
    }
    await delay(dt);
  }
};
(async () => {
  setAuth(loginSession);
  spydingFriend(1000);
  refreshSession(172800000); // 48h
})();
