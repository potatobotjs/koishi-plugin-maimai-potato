/**************************
 *MAIMAI-MAIBOT.FORTUNE.TS*
 * BY  LINGROTTIN & LTFJX *
 *     PART OF PROJECT    *
 *       PotatoBot        *
 **************************/

import { Argv, segment, Logger } from 'koishi';
import { Md5 } from 'ts-md5';
import { getMusicLen, getMusicMsgByIndex } from './music';


const event_list = ['拼机', '推分', '越级', '下埋', '夜勤', '练底力', '练手法', '打旧框', '干饭', '抓DX分', '收歌', '理论值', '打东方曲', '打索尼克曲']
const overview_good = ['拆机 - 然后您被机修当场处决', '女装 - 怎么这么好康！（然后受到了欢迎）', '耍帅 - 看我耍帅还AP+', '击剑 - Alea jacta est!(SSS+)', '打滴蜡熊 - 看我今天不仅推了分，还收了歌！', '日麻 - 看我三倍役满!!!你们三家全都起飞!!!', '出勤 - 不出则已，一出惊人，当场AP，羡煞众人。', '看手元 - 哦原来是这样！看了手元果真推分了。', '霸机 - 这么久群友都没来，霸机一整天不是梦！', '打Maipad -  Maipad上收歌了，上机也收了。', '唱打 -  Let the bass kick! O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A- JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA O-oooooooooo AAAAE-A-A-I-A-U-......', '抓绝赞 -  把把2600，轻松理论值！'];
const overview_bad = ['拆机 - 不仅您被机修当场处决，还被人尽皆知。', '女装 - 杰哥说你怎么这么好康！让我康康！！！（被堵在卫生间角落）', '耍帅 - 星星全都粉掉了......', '击剑 - Alea jacta est!(指在线下真实击剑)', '打滴蜡熊 - 滴蜡熊打你。', '日麻 - 我居然立直放铳....等等..三倍役满??????', '出勤 - 当场分数暴毙，惊呆众人。', '看手元 - 手法很神奇，根本学不来。', '霸机 - ......群友曰 - "霸机是吧？踢了！"', '打Maipad -  上机还是不大会......', '唱打 -  被路人拍下上传到了某音。', '抓绝赞 -  啊啊啊啊啊啊啊捏妈妈的我超！！！ --- 这是绝赞(好)的音效。'];
const tip_list = ['人品值和宜忌每天0点都会刷新，不喜欢总体运势可以通过这个指令再随一次。','在游戏过程中,请您不要大力拍打或滑动机器!', '建议您常多备一副手套！如果游玩时手套破裂或许会有大用！', '游玩时注意手指安全！意外戳到边框时若引发剧烈疼痛请立刻下机以休息手指，必要时可以选择就医。', '游玩过程中注意财物安全。自己的财物远比一个SSS+要更有价值。', '底力不够？建议下埋！不要强行越级，手癖难解。', '文明游玩，游戏要排队，不要做不遵守游戏规则的玩家！','疫情防护，人人有责。在游玩结束后请主动佩戴口罩！', '出勤时注意交通安全，身体安全永远在第一位！', '迪拉熊不断吃绝赞？去找机修教训它。', '热知识：DX理论值是101.0000，但是旧框没有固定的理论值。', '冷知识：每个绝赞 Perfect 等级有 2600/2550/2500，俗称理论/50落/100落。'];
const facing_list = ['东', '西', '南', '北'];
const area_list = ['1P', '2P', '排队区'];
const kink_list = ['滴蜡熊', '幸隐', '14+', '白潘', '紫潘', 'PANDORA BOXXX', '排队区', '旧框', '干饭', '超常maimai', '收歌', '福瑞', '削除', 'HAPPY', '谱面-100号', 'lbw', '茄子卡狗', '打五把CSGO', '一姬', '打麻将', '光吉猛修', '怒锤', '暴漫', '鼓动', '鼓动(红)']


const logger=new Logger("MAIMAI-MAIBOT.FORTUNE")

function md5Hex2Dec(hashString: string): number {
  // 得到 hashString 的 md5
  var md5 = Md5.hashStr(hashString);
  // 将 32 位 md5 转换成 16 位
  md5 = md5.substring(9, 24);
  return parseInt("0x" + md5);
}

function md5Random(date:Date, component:string, _:Argv, maxNumber:number, minNumber?: number): number {
  var md5 = md5Hex2Dec(date.toDateString() + _.session.userId + component);
  if (minNumber) {
    return md5 % (maxNumber + 1 - minNumber) + minNumber;
  }
  else {
    return md5 % (maxNumber + 1);
  }
}

function genRandom(maxNumber: number, minNumber?: number):number {
  if (minNumber) {
    return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
  }
  else {
    return Math.floor(Math.random() * (maxNumber + 1));
  }
}


export function oFortune(_:Argv): string {
  var message: string = "PotatoBot Fortune Generator";
  var date:Date = new Date();
  if (_.session.guildId) {
    message += `\nTo ${segment("at", {id: _.session.userId})}`
  }
  message += `\nAt ${date.toLocaleString()}`

  var fortune: number = md5Random(date, "fortune", _, 100);
  var luck: number = md5Random(date, "luck", _, 100);

  message += "\n\n★ Overall Fortune | 运势\n————————————————\n";
  if ((fortune > 50 && fortune < 70) || ((fortune >= 70 && fortune < 90) && luck < 60)) {
    message += "【末吉】稍微有那么一点小幸运！";
  } else if (((fortune >= 70 && fortune < 90) && luck > 60) || (fortune >= 90 && luck < 80)) {
    message += "【吉】好运连连，挡都挡不住～";
  } else if (fortune >= 90 && luck >= 80) {
    message += "【大吉】干点什么都会有惊喜发生！";
  } else if ((fortune >= 10 && fortune < 30) && luck < 40) {
    message += "【凶】emm…粉了一串纵连。";
  } else if (fortune < 10 && luck < 10) {
    message += "【大凶】今天稍微有点倒霉捏。";
  } else {
    message += "【小凶】有那么一丢丢的坏运气，不过不用担心捏。";
  }
  message += `\n————————————————\n ◩ 人品：${fortune}%\n ◩ 幸运：${luck}%`

  var overviewGoodNum = md5Random(date, "overviewGoodNum", _, 10);
  var overviewBadNum = md5Random(date, "overviewBadNum", _, 10);
  message += "\n\n★ Overview | 概览\n"
  if (overviewBadNum == overviewGoodNum) {
    message += " ◩ 平：今天总体上平平无常。向北走有财运，向南走运不佳…等一下，这句话好像在哪儿听过？\n"
  } else {
    message += ` ◩ 宜：${overview_good[overviewGoodNum]}\n`;
    message += ` ◩ 忌：${overview_bad[overviewBadNum]}\n`;
  }
  var allPerfect: number = md5Random(date, "allPerfect", _, 100);
  message += `\n★ Maimai Fortune | 舞萌运势
 ◩ 收歌指数：${allPerfect}%
 ◩ 最佳朝向：${facing_list[allPerfect % 4]}
 ◩ 最佳位置：${area_list[(allPerfect << 1) % 3]}
 ◩ 宜：`;

  var goodNum: number = md5Random(date, "goodNum", _, 14);
  var badNum: number = md5Random(date, "badNum", _, 14);
  var goodList: number[] = [];
  var badList: number[] = [];
  if (goodNum) {
    var good: number;
    var brk: boolean = false;
    for (var i = 0; i < goodNum; i++) {
      good = md5Random(date, `goodNum${i}`, _, event_list.length - 1);
      goodList.forEach(value => {
        if (good == value) brk = true;
        return;
      })
      if (brk) { break; }
      goodList.push(good);
      message += `${event_list[good]} `;
    }
    brk = false;
  } else {
    message += "万事不宜";
  }
  message += "\n ◩ 忌：";
  if (badNum) {
    var bad: number;
    var brk: boolean = false;
    for (var i = 0; i < badNum; i++) {
      bad = md5Random(date, `badNum${i}`, _, event_list.length - 1);
      goodList.forEach(value => {
        if (bad == value) brk = true;
        return;
      });
      badList.forEach(value => {
        if (bad == value) brk = true;
        return;
      })
      if (brk) { brk = false; continue; }
      badList.push(bad);
      message += `${event_list[bad]} `;
    }
  } else {
    message += "无所畏忌";
  }
  message += `\n\n★ Kiba's Tips | 犽的锦囊\nKiba 姐姐教给了土豆一些小知识...\n${tip_list[genRandom(tip_list.length-1, 0)]}`;
  message += `\n\n★ Preferred Song | 今日歌曲\n`;
  message += getMusicMsgByIndex(md5Random(date, "preferredMusic", _, getMusicLen() - 1));
  return message;
}

export function kink(_: Argv): string {
  const date = new Date();
  var message: string = 'PotatoBot Kink Generator\n';
  if (_.session.guildId) {
    message += `To ${segment("at", { id: _.session.userId })}\n`;
  }
  var fortune: number = md5Random(date, "fortune", _, 100);
  var kink_id: number = genRandom(kink_list.length-1, 0);
  message +='\n————————————————\n'
  message += ` ◩ 今日人品：${fortune}%\n ◩ 今日性癖：${kink_list[kink_id]}`;
  message +='\n————————————————\n不喜欢性癖就再随一个吧！'
  return message;
}
export function fortune(_:Argv) {
  var message: string = "PotatoBot Fortune Generator";
  var date: Date = new Date();
  if (_.session.guildId) {
    message += `\nTo ${segment("at", { id: _.session.userId })}`
  }
  message += `\nAt ${date.toLocaleString()}`

  var fortune: number = md5Random(date, "fortune", _, 100);
  var luck: number = md5Random(date, "luck", _, 100);

  message += "\n\n★ Overall Fortune | 运势\n————————————————\n";
  if ((fortune > 50 && fortune < 70) || ((fortune >= 70 && fortune < 90) && luck < 60)) {
    message += "【末吉】稍微有那么一点小幸运！";
  } else if (((fortune >= 70 && fortune < 90) && luck > 60) || (fortune >= 90 && luck < 80)) {
    message += "【吉】好运连连，挡都挡不住～";
  } else if (fortune >= 90 && luck >= 80) {
    message += "【大吉】干点什么都会有惊喜发生！";
  } else if ((fortune >= 10 && fortune < 30) && luck < 40) {
    message += "【凶】emm…粉了一串纵连。";
  } else if (fortune < 10 && luck < 10) {
    message += "【大凶】今天稍微有点倒霉捏。";
  } else {
    message += "【小凶】有那么一丢丢的坏运气，不过不用担心捏。";
  }
  message += `\n————————————————\n ◩ 人品：${fortune}%\n ◩ 幸运：${luck}%`
  message += '\n更多信息请查看 今日运势 或 今日性癖。'
  return message;
}
