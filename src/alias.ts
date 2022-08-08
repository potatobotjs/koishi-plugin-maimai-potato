/**************************
 * MAIMAI-MAIBOT.ALIAS.TS *
 * BY  LINGROTTIN & LTFJX *
 *     PART OF PROJECT    *
 *       PotatoBot        *
 **************************/
import { Context, Logger } from 'koishi';
import { readFileSync } from 'node:fs';
import { Config } from './index'
import { getMusics, Music } from './music';

type Alias = {
  title: string,
  aliases: string[]
}
const logger = new Logger("MAIMAI-MAIBOT.ALIAS");

/*export function queryAlias(alias: string): string {
  var obj: Alias = undefined;
  obj = aliases.find(value => value.aliases.find(value => value === alias))
  if (obj) {
    return `别名 ${alias} 对应的歌曲是 ${obj.title}`;
  } else {
    return "没有找到这个别名。\n但是你可以帮助我收集歌曲的别名！戳链接加入 Kiba 歌曲别名收集计划:\nhttps://kdocs.cn/l/cdzsTdqaPFye"
  }
}*/

export function queryAlias(alias: string, ctx: Context, config: Config): Promise<Alias[]> {
  return new Promise((resolve, reject) => {
    var queryAddr: string = config.alias_endpoint + '/api/query/alias/alias';
    ctx.http.post(queryAddr, { alias: alias }).then(resp => {
      try {
        var aliasesObj = resp;
        var _aliases: Alias[] = [];
        aliasesObj.forEach(value => {
          _aliases.push({
            title: value.title,
            aliases: value.aliases
          });
        });
        resolve(aliasesObj);
      } catch (e) {
        reject(e);
      }
    }, rejt => {
      reject(rejt);
    });
  });
}

