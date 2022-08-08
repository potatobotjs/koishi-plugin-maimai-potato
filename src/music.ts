/**************************
 * MAIMAI-MAIBOT.MUSIC.TS *
 * BY  LINGROTTIN & LTFJX *
 *     PART OF PROJECT    *
 *       PotatoBot        *
 **************************/
import { accessSync, constants } from 'node:fs';
import { segment, Logger, Context } from 'koishi';

var jsonMusicInfo;

export type Music = {
  id: string,
  DX: boolean,
  ds: number[],
  levels: string[],
  info: {
    title: string,
    artist: string,
    genre: string,
    bpm: number,
    from: number,
    is_new:boolean
  }
}

var success: boolean= true;
const logger = new Logger("MAIMAI-MAIBOT.MUSIC");
var musics: Music[] = [];

function getCoverJpgUrl(id: string):string {
  return 'file:///' + __dirname+`/kiba-cli/src/static/mai/cover/${id}.jpg`;
}

function getCoverPngUrl(id: string): string {
  return 'file:///' + __dirname+`/kiba-cli/src/static/mai/cover/${id}.png`;
}
function getCoverJpgPath(id: string): string {
  return __dirname + `/kiba-cli/src/static/mai/cover/${id}.jpg`;
}

export function getMusics(): Music[] {
  return musics;
}

export function musicInit(ctx:Context): void {
  ctx.http("get", "https://www.diving-fish.com/api/maimaidxprober/music_data").then(data => {
    logger.info("谱面数据已下载");
    jsonMusicInfo = data;
    musics = (function (): Music[] {
      var _musics: Music[] = [];
      jsonMusicInfo.forEach(value => {
        _musics.push({
          id: value.id,
          DX: value.type == 'DX',
          ds: value.ds,
          levels: value.level,
          info: {
            title: value.basic_info.title,
            artist: value.basic_info.artist,
            genre: value.basic_info.genre,
            bpm: value.basic_info.bpm,
            from: value.basic_info.from,
            is_new: value.basic_info.is_new
          }
        });
      });
      logger.info("谱面数据已加载");
      return _musics;
    })();
  }, err => {
    logger.warn(`谱面数据下载失败。\n${err}`);
    success = false;
  });
}

export function getMusicLen(): number {
  return musics.length;
}

export function getMusicInfoByIndex(index: number): Music {
  if (index >= getMusicLen()) {
    throw new RangeError(`There are only ${getMusicLen()} objects in musics, but got an unexpected ${index}.`);
  }
  else if (!index.toString().match(/^[0-9]*$/)) {
    throw new TypeError(`Doubles are not allowed.`);
  }
  return musics[index];
}

export function getMusicInfoById(id: string): Music {
  var _return: Music = musics.find(value => {
    return value.id == id;
  })
  if (!_return) {
    return _return;
  }
  else {
    return undefined;
  }
}

export function getMusicIndexByTitle(title: string): number {
  var musics = getMusics();
  var _id: number = -1;
  var _return: number;
  musics.forEach((value,n) => {
    if (value.info.title == title) {
      _return = n;
    }
  })
  if (!_return) {
    // 如果 _return 是 undefined
    return -1;
  }
  return _return;
}

export function getMusicMsgByIndex(index: number):string {
  if (index >= getMusicLen()) {
    throw new RangeError(`There are only ${getMusicLen()} objects in musics, but got an unexpected ${index}.`);
  }
  else if (!index.toString().match(/^[0-9]*$/)) {
    throw new TypeError(`Doubles are not allowed.`);
  }
  else if (!success) {
    return "歌曲数据获取出错！";
  }
  var message: string = '';
  var music = musics[index];
  var png: boolean = false;
  try {
    accessSync(getCoverJpgPath(music.id), constants.R_OK);
  } catch (e) {
    png = true;
  }
  message += segment("image", {
    url: png ? getCoverPngUrl(music.id) : getCoverJpgUrl(music.id)
  })
  message += `
[${music.DX ? "DX" : "SD"}] ♫ ${music.id}
${music.info.artist} — ${music.info.title}
 ◩ 分类：${music.info.genre}
 ◩ BPM：${music.info.bpm}
 ◩ 难度：${(function () {
    var difficulties: string = "";
    music.levels.forEach((value, n) => {
      difficulties += `${value} `;
      if (n != music.levels.length - 1) {
        difficulties += ' ▸ ';
      }
    });
    return difficulties;
})()}`
  return message;
}
