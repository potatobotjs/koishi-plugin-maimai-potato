/**************************
 * MAIMAI-MAIBOT.INDEX.TS *
 * BY  LINGROTTIN & LTFJX *
 *     PART OF PROJECT    *
 *       PotatoBot        *
 **************************/

import { Argv, Context, Logger, Schema, segment, Session } from 'koishi';
import { spawn, spawnSync } from 'node:child_process';
import { decode } from 'iconv-lite';
import { oFortune, kink, fortune } from './fortune';
import { musicInit, getMusicIndexByTitle, getMusicMsgByIndex } from './music';
import { queryAlias } from './alias';

const logger = new Logger("MAIMAI-MAIBOT");



export const name = 'maimai-maibot';

export interface Config {
  shell: string,
  name: string,
  alias_endpoint: string,
  alias_server: string
}

export const schema = Schema.object({
  shell: Schema.union(["bash", "powershell-core", "powershell-core-win", "powershell", "py.exe", "python.exe", "python3"])
    .default("py")
    .description("设置运行底层 MaiBot 使用的程序"),
  name: Schema.string()
    .description("发送消息时机器人的名字"),
  alias_endpoint: Schema.string()
    .default("http://127.0.0.1:4044")
    .description("可被机器人访问的 Maimai Alias Querier 监听地址"),
  alias_server: Schema.string()
    .default("https://yourmaq.example.org/maimai-alias-querier/")
    .description("可被用户访问的 Maimai Alias Querier 网页地址，用来让用户提交别名")
})

export function apply(ctx: Context, config: Config) {

  ctx.on("ready", () => {
    musicInit(ctx);
  });

  ctx.middleware((session, next) => {
    console.log(session.content);
    if (session.content.match('^.*是什么歌$')) {
      console.log('match');
      var alias = session.content.split('是什么歌')[0];
      qAlias(ctx, config, alias, session);
    }
    return next();
  });

  ctx.command("maimai", "舞萌相关的指令")
    .usage("占位指令，不可调用，请使用子指令。")
    .alias("舞萌")
    .action((_, message) => {
      var response: string = '';
      if (_.session.guildId) { // 如果是群组
        response += segment('at', { id: _.session.userId }) + '\n';
      }
      response += "指令无效，请输入 help maimai 查看完整指令列表。";
      _.session.send(response);
    });

  ctx.command("maimai/b40 [username:string]", "生成某个账号的 Best 40")
    .usage("username - 要查询的查分器用户名（绑定了 qq 可以省略）")
    .action((_, username) => {
      _.session.send("指令已收到，正在生成...");
      if (_.args.length) {
        generateBest("username", username, 'b40', config).then((value: string) => {
          sendBest(_, true, value, config.name);
        }, value => {
          _.session.send(value);
        });
      } else {
        generateBest("qq", _.session.userId, 'b40', config).then((value: string) => {
          sendBest(_, true, value, config.name);
        }, value => {
          _.session.send(value);
        });
      }
    });

  ctx.command("maimai/b50 [username:string]", "生成某个账号的 Best 50")
    .usage("username - 要查询的查分器用户名（绑定了 qq 可以省略）")
    .action((_, username) => {
      _.session.send("指令已收到，正在生成...");
      if (_.args.length) {
        generateBest("username", username, 'b50', config).then((value: string) => {
          sendBest(_, false, value, config.name);
        }, value => {
          _.session.send(value);
        });
      } else {
        generateBest("qq", _.session.userId, 'b50', config).then((value: string) => {
          sendBest(_, false, value, config.name);
        }, value => {
          _.session.send(value);
        });
      }
    });

  ctx.command("maimai/fortune", "查看你今天的 Maimai 运势")
    .alias("今日运势")
    .alias("今日舞萌")
    .action(_ => {
      _.session.send(oFortune(_));
    })
  ctx.command("maimai/kink", "查看你今天的性癖")
    .alias("今日性癖")
    .action(_ => {
      _.session.send(kink(_));
    })
  ctx.command("maimai/luck", "查看你今天的人品值")
    .alias("今日人品")
    .action(_ => {
      _.session.send(fortune(_));
    })
  ctx.command("maimai/alias <alias:string>", "查询别名对应歌曲", { checkArgCount: true })
    .alias("别名查询")
    .alias("查询别名")
    .action((_, alias) => {
      qAlias(ctx, config, alias, _.session)
    });
  }

function generateBest(acctype: string, acc: string, bestType: string, config: Config) {
  let p = new Promise((resolve, reject) => {
    var resp = "";
    var resp_stderr = "";
    var shell = "";
    var args = [];
    var conv = false;
    if (config.shell.indexOf("py") != -1) {
      // 如果使用 cli.py 运行 Maibot
      shell = config.shell;
      args = ["./plugins/maimai-maibot/src/kiba-cli/cli.py", bestType, acctype, acc];
    } else if (config.shell.indexOf("powershell") != -1) {
      // 使用 PowerShell 运行 Maibot
      switch (config.shell) {
        case 'powershell':
          shell = "powershell.exe";
          break;
        case 'powershell-core':
          shell = "/usr/bin/env";
          args.push("pwsh");
          break;
        case 'powershell-core-win':
          shell = "pwsh.exe";
          break;
        default:
          logger.warn(`未知 Shell ${config.shell}，请检查插件设置！`);
          reject(`[KOISHI.MAIMAI-MAIBOT]: 未知 Shell ${config.shell}，请检查插件设置！`);
      }
      args.push("./plugins/maimai-maibot/src/kiba-cli/cli.ps1", bestType, acctype, acc);
    } else {
      // Bash
      shell = "bash";
      args.push("./plugins/maimai-maibot/src/kiba-cli/cli.sh", bestType, acctype, acc);
    }
    if (shell.indexOf("exe") != -1) {
      // Windows 默认以 GB2312 传递汉字，这里需要转换一下才能正常输出 Python 进程输出的汉字
      if (spawnSync("chcp").stdout.toString().match(/936/)) {
        conv = true;
      }
    }
    var process = spawn(shell, args);
    if (conv) {
      process.stdout.setEncoding("binary");
      process.stderr.setEncoding("binary");
    }
    process.stdout.on("data", chunk => {
      resp += chunk;
    });
    process.stdout.on("end", () => {
      var resp_ = Buffer.from(resp);
      if (resp.indexOf('base64://') != -1) {
        resolve(resp);
      } else {
        if (conv) {
          // Windows 默认是 GB2312，需要转换成 UTF-8 才能正确处理汉字
          resp = decode(resp_, "gbk");
        }
        logger.info(resp)
        reject(resp);
      }
    });
    process.stderr.on("data", chunk => {
      resp_stderr += chunk;
    })
    process.stderr.on("end", () => {
      if (resp_stderr.trim()) {
        logger.warn(`Exception from Python:\n${resp_stderr}`)
        reject("出现了来自 Python 的内部错误，请联系我的管理员。")
      }
    })
  });
  return p;
}
function sendBest(_: Argv, b40: boolean, imgBase64: string, botName: string) {
  var msg = `${botName} Maimai Best${(function () { if (b40) return "40"; else return "50" })()} Generator`;
  if (_.session.guildId) {
    msg += `\nTo ${segment("at", { id: _.session.userId })}`;
  }
  msg += `\n此 ID 的 Best${(function () { if (b40) return "40"; else return "50" })()} 如图所示。\n${segment("image", { url: imgBase64 })}`;
  if (!b40) {
    msg += "Best 50 是 DX Splash Plus 及以后版本的定数方法，与当前版本的定数方法不相同。若您需要当前版本定数，请使用 Best 40。"
  }
  _.session.send(msg);
}
function qAlias(ctx: Context, config: Config, alias: string, session: Session) {
  var message = 'PotatoBot Alias Querier';
  if (session.guildId) {
    message += `\n${segment('at', { id: session.userId })}\n`;
  }
  queryAlias(alias, ctx, config).then(_value => {
    var n: number = 0;
    var _message: string = '';
    _value.forEach(value => {
      _message += getMusicMsgByIndex(getMusicIndexByTitle(value.title));
      _message += '\n\n';
      n++;
    })
    if (n == 0) {
      message += `我不认识这个别名，但你可以帮我收集歌曲的别名！\n点击链接以提交歌曲别名：${config.alias_server}`
    }
    else {
      message += '您查找的歌曲可能是：\n';
      message += _message;
    }
    session.send(message);
  });
}
