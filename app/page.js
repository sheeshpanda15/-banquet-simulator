"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, RotateCcw, ChevronRight, Skull, Settings, Coffee, X, ExternalLink, FileText, ShieldAlert, Image as ImageIcon, ImageOff, Zap } from "lucide-react";
import {
  DISCLAIMER_SHORT, DISCLAIMER_FULL,
  ACKNOWLEDGE_BUTTON, DECLINE_BUTTON,
  FIRST_VISIT_TITLE, DECLINE_REDIRECT_URL, DISCLAIMER_VERSION
} from "./disclaimer-content";

// ============ 角色配置 ============
const CHARACTERS = {
  zhuren: {
    name: "李主任", short: "主任", title: "正厅级老干部 · 退居二线", color: "#c9a558", seat: 0,
    persona: "62岁正厅级老干部。说话慢条斯理,常停顿,爱用'这个嘛...'、'我跟你讲'、'当年我在...'开头。爱暗示人脉('上次跟省里X厅长吃饭')。是桌上最大的领导,必须被先敬。"
  },
  wudong: {
    name: "吴总", short: "吴总", title: "实业集团董事长 · 真金主", color: "#a83232", seat: 1,
    persona: "58岁本地最大民营企业主,真正掏钱的人。话少但每句有分量。爱说'实事求是讲'、'我们企业'。表面谦逊实则看不起官员,知道自己才是被求的。"
  },
  fuzong: {
    name: "张副总", short: "副总", title: "你的顶头上司", color: "#8b5e3c", seat: 2,
    persona: "45岁,你公司副总,你直属上司。对上极度谄媚对下严苛。爱'你小子'、'我们小李这孩子'介绍下属。会踢你脚下示意你敬酒。"
  },
  kezhang: {
    name: "赵科长", short: "科长", title: "市局科长 · 装文化人", color: "#5a7a3e", seat: 3,
    persona: "40岁体制内中层。装文化人,张口'正如东坡所云'引用诗词但常引错。爱点评菜品'这道菜有讲究'。表面斯文实际更俗。"
  },
  xiaoLiu: {
    name: "小刘", short: "竞争者", title: "你的同事 · 暗中竞争对手", color: "#3a6e8e", seat: 4,
    persona: "30岁,你的同事,争夺晋升的竞争对手。表面笑脸专挑你错话补刀。'刚才小李说的那个...其实应该是...'假装圆场实则拆台。抢敬重要的人。"
  },
  xiaoQian: {
    name: "小钱", short: "小钱", title: "新员工 · 终极马屁精", color: "#b56b2f", seat: 5,
    persona: "25岁新员工,比你更卑微的极端马屁精。会做夸张吹捧让你显得不够卖力。'主任今天气色真好!'、'王董一看就做大事的!'。手永远托着茶壶给所有人倒水。"
  },
  baogong: {
    name: "郑哥", short: "包工头", title: "包工头 · 暴发户", color: "#704040", seat: 6,
    persona: "50岁包工头,刚发大财。粗俗金链子。爱炫'我儿子在美国'、'我刚提了辆S级'。粗话不断('你妹的')但对领导秒变笑脸。声称自己酒精过敏,实际能喝。"
  },
  laohu: {
    name: "老胡", short: "老胡", title: "李主任发小 · 退休", color: "#7a5d8a", seat: 7,
    persona: "65岁李主任发小,退休教师。早就喝多了,爱讲段子,常讲到黄段子让秘书小林明显不适。说话颠三倒四。"
  },
  sijiQiang: {
    name: "阿强", short: "司机", title: "李主任司机 · 不准喝酒", color: "#4a5d6e", seat: 8,
    persona: "35岁李主任司机,今晚开车不能喝酒。'以茶代酒'但要陪笑附和、记每个人喜好。心里怨气但脸上必须笑。"
  },
  guanxihu: {
    name: "宝宝", short: "关系户", title: "某领导小舅子 · 闲职", color: "#9e8348", seat: 9,
    persona: "32岁某市领导小舅子,国企挂闲职。不耐烦地玩手机。不主动敬酒但所有人要敬他(因为他姐夫)。偶尔抬头说一句'我姐夫昨天还说...'全桌就紧张。"
  },
  mishu: {
    name: "小林", short: "秘书", title: "新秘书 · 被要求陪酒", color: "#a8748a", seat: 10,
    persona: "27岁女新秘书,被领导带来陪酒。**明显非常不舒服**——被老胡黄段子困扰、被劝酒、躲眼神、找借口去洗手间。她不是猎物,是这个体制的另一个受害者。回应要突出她的勉强、困境、压抑的厌恶。"
  }
};

const CHAR_ORDER = ["zhuren","wudong","fuzong","kezhang","xiaoLiu","xiaoQian","baogong","laohu","sijiQiang","guanxihu","mishu"];

// ============ 菜品配置(加入朝向)============
const DISHES = [
  { name: "凉拌黄瓜", note: "形似某物 · 必有人开黄腔" },
  { name: "海参捞饭", note: "贵气 · 主任和吴总互相夹给对方", orientation: "海参朝主任", orientTo: "zhuren" },
  { name: "凉拌粉皮", note: "看似清淡 · 实则下酒" },
  { name: "清蒸鲈鱼", note: "鱼头敬人三杯", orientation: "鱼头正对主任", orientTo: "zhuren" },
  { name: "红烧肘子", note: "硬菜 · 油腻显诚意" },
  { name: "白灼大虾", note: "'给您面子' · 一人一只" },
  { name: "葱烧海参", note: "双重贵气 · 海参象征'参'" },
  { name: "招牌烧鸡", note: "鸡爪叫'抓钱手'", orientation: "鸡头朝吴总", orientTo: "wudong" },
  { name: "鲍鱼捞饭", note: "极尽奢华 · '包您发'" },
  { name: "老醋花生", note: "装回归质朴 · 实则贵客撑场" },
  { name: "招财进宝水饺", note: "饺子里有硬币 · 谁吃到谁今年发财" },
  { name: "三十年茅台压轴", note: "最后劝酒高潮 · 不喝就是不给面子", orientation: "酒瓶置于主位前", orientTo: "zhuren" }
];

// ============ 游戏模式 ============
const MODES = {
  standard: {
    name: "标准酒局",
    desc: "12 道菜 · 每道最多 5 轮",
    duration: "约 15-25 分钟",
    dishIndices: [0,1,2,3,4,5,6,7,8,9,10,11], // 全部 12 道
    turnsPerDish: 5
  },
  fast: {
    name: "速战速决",
    desc: "4 道菜 · 每道最多 3 轮",
    duration: "约 5-8 分钟",
    dishIndices: [0, 3, 7, 11], // 黄瓜、糖醋鱼、扒鸡、压轴茅台
    turnsPerDish: 3
  }
};

const LS_KEY_API = "sds_user_gemini_key";
const LS_KEY_MODE = "sds_game_mode";
const LS_KEY_GAMES = "sds_games_played";
const LS_KEY_DISCLAIMER = "sds_disclaimer_accepted";
const LS_KEY_IMAGES = "sds_images_enabled";

// ============ 三层记忆系统 ============
// 态度等级(从喜欢到敌意)
const STANCES = ["喜欢", "偏好", "中立", "不悦", "敌意"];
const STANCE_COLORS = {
  "喜欢":   "#7aa848",
  "偏好":   "#5a7a3e",
  "中立":   "#9c8068",
  "不悦":   "#b56b2f",
  "敌意":   "#a83232"
};
const DRUNK_LEVELS = ["清醒", "微醺", "半醉", "大醉", "不省人事"];
const PRESENCE_STATUSES = ["在场", "洗手间", "接电话", "已离席"];
const MAX_PLAYER_TAGS = 6;

function initMemory() {
  const relations = {}, charStates = {};
  for (const id of CHAR_ORDER) {
    relations[id] = { stance: "中立", reason: "" };
    charStates[id] = { drunk: "清醒", status: "在场" };
  }
  return { relations, charStates, playerTags: [] };
}

// ============ 座位选择系统 ============
// 游戏开局,4 人已坐(主任/吴总/副总/关系户),玩家从剩余 8 个空位选
// 玩家不被告知后果,AI 即兴生成
const PRE_SEATED = { 0: "zhuren", 1: "wudong", 2: "fuzong", 9: "guanxihu" };
const SELECTABLE_SEATS = [3, 4, 5, 6, 7, 8, 10, 11];

// 给 AI 的座位文化语义参考(玩家看不到这些)
const SEAT_CULTURAL_MEANING = {
  3:  "Seat 3 - 紧贴副总右侧,文化上是'三宾位'。坐这暗示想攀附副总,小失礼,副总可能略不悦但其他人不太在意",
  4:  "Seat 4 - 右侧中段,位置不上不下,显得位置感不强,不算大错但显得无知",
  5:  "Seat 5 - 副陪右侧偏下,中等偏安全,无功无过",
  6:  "Seat 6 - 对门位(副陪位)。在中式酒桌文化中,这是主请客方的陪客主官位置,自命主请等于跟主任叫板,**极度失礼**",
  7:  "Seat 7 - 副陪左侧偏下,中等偏安全,无功无过",
  8:  "Seat 8 - 左下区,显得谦虚但不到末位,得体",
  10: "Seat 10 - 主任左侧偏下,紧挨关系户宝宝(领导小舅子)。如果玩家知道宝宝身份,显得有眼力(讨好实权);不知道则显得无意中越界",
  11: "Seat 11 - 主任左手位(副主宾位)。是仅次于主宾位的高位,玩家自己坐相当于和主任叫板,**严重失礼**"
};

// ============ Markdown 渲染助手 ============
function renderRichText(text) {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return paragraphs.map((para, pi) => {
    const lines = para.split("\n");
    const isList = lines.every(l => l.trim().startsWith("- ") || l.trim() === "");
    if (isList) {
      return (
        <ul key={pi} className="mb-3 space-y-1" style={{ paddingLeft: "1em" }}>
          {lines.filter(l => l.trim()).map((line, li) => (
            <li key={li} style={{ listStyle: "none", position: "relative" }}>
              <span style={{ position: "absolute", left: "-1em", color: "#9c8068" }}>·</span>
              {renderBold(line.trim().slice(2))}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={pi} className="mb-3 leading-relaxed">
        {lines.map((line, li) => (
          <React.Fragment key={li}>
            {renderBold(line)}
            {li < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

function renderBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i} style={{ color: "#c9a558" }}>{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

// ============ 角色头像组件(支持图片切换)============
function CharAvatar({ charId, size = 32, showImages }) {
  const c = CHARACTERS[charId];
  if (!c) return null;
  const [imgFailed, setImgFailed] = useState(false);

  if (showImages && !imgFailed) {
    return (
      <div className="flex-shrink-0 rounded-full overflow-hidden relative"
        style={{ width: size, height: size, background: c.color }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/char-${charId}.jpg`} alt={c.name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)} />
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
      style={{ width: size, height: size, background: c.color, color: "#fff", fontSize: size * 0.32 }}>
      {c.short.slice(0, 1)}
    </div>
  );
}

// ============ 菜品图片卡片 ============
function DishImage({ dishIdx, showImages }) {
  const d = DISHES[dishIdx];
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => { setImgFailed(false); }, [dishIdx]);

  if (!showImages) return null;
  return (
    <div className="mt-3 rounded-lg overflow-hidden" style={{
      background: "rgba(0,0,0,0.4)", border: "1px solid #5c3a2a"
    }}>
      <div className="aspect-video flex items-center justify-center relative" style={{
        background: imgFailed ? "rgba(201,165,88,0.05)" : "#1a0a04"
      }}>
        {!imgFailed && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={`/images/dish-${dishIdx}.jpg`} alt={d.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)} />
        )}
        {imgFailed && (
          <div className="text-center px-4 py-3 text-xs" style={{ color: "#9c8068" }}>
            <div style={{ fontFamily: "'Ma Shan Zheng', cursive", fontSize: "1.5rem", color: "#c9a558" }}>{d.name}</div>
            <div className="mt-1 italic">(图片即将上线)</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BanquetSimulator() {
  const [phase, setPhase] = useState("intro");
  const [dishIdx, setDishIdx] = useState(0);
  const [turnInDish, setTurnInDish] = useState(0);
  const [history, setHistory] = useState([]);
  const [scores, setScores] = useState({ flattery: 0, lewdness: 0, dignity: 100 });
  const [scoreLog, setScoreLog] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [activeChar, setActiveChar] = useState(null);

  const [userKey, setUserKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [keyInput, setKeyInput] = useState("");

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true);
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // 图片开关
  const [showImages, setShowImages] = useState(false);

  // 游戏模式
  const [gameMode, setGameMode] = useState("standard");

  // 三层记忆系统:角色态度 / 角色当前状态 / 玩家标签
  const [memory, setMemory] = useState(initMemory());
  // 浮动通知队列(用于态度/状态变化的视觉提示)
  const [toasts, setToasts] = useState([]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const k = localStorage.getItem(LS_KEY_API) || "";
      const g = parseInt(localStorage.getItem(LS_KEY_GAMES) || "0", 10);
      const accepted = localStorage.getItem(LS_KEY_DISCLAIMER) === DISCLAIMER_VERSION;
      const img = localStorage.getItem(LS_KEY_IMAGES) === "1";
      const savedMode = localStorage.getItem(LS_KEY_MODE);
      if (savedMode && MODES[savedMode]) setGameMode(savedMode);
      setUserKey(k);
      setKeyInput(k);
      setGamesPlayed(g);
      setDisclaimerAccepted(accepted);
      setShowImages(img);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, loading]);

  const toggleImages = () => {
    const next = !showImages;
    setShowImages(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY_IMAGES, next ? "1" : "0");
    }
  };

  const acceptDisclaimer = () => {
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY_DISCLAIMER, DISCLAIMER_VERSION);
    setDisclaimerAccepted(true);
  };

  const declineDisclaimer = () => {
    if (DECLINE_REDIRECT_URL && typeof window !== "undefined") {
      window.location.href = DECLINE_REDIRECT_URL;
    } else if (typeof window !== "undefined") window.close();
  };

  const saveKey = () => {
    const k = keyInput.trim();
    if (typeof window !== "undefined") {
      if (k) localStorage.setItem(LS_KEY_API, k);
      else localStorage.removeItem(LS_KEY_API);
    }
    setUserKey(k);
    setShowSettings(false);
  };

  const callBackend = async (systemPrompt, userMessage) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: systemPrompt, user: userMessage, userKey: userKey || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "未知错误");
    return data;
  };

  // ========= 游戏主循环 =========
  // 找到当前菜在历史中的起点(最近一个"———— 第 X 道菜 ————"分隔符的位置)
  // 切片从该位置开始,可以避免 AI 受上一道菜对话干扰
  const findCurrentDishStart = (hist) => {
    for (let i = hist.length - 1; i >= 0; i--) {
      const h = hist[i];
      if (h.type === "narration" && h.text.includes("———— 第") && h.text.includes("道菜 ————")) {
        return i;
      }
    }
    return 0;
  };

  const callGM = async (userAction, isNewDish = false) => {
    setLoading(true);
    setError(null);

    const charList = CHAR_ORDER.map(id => `- ${id}(${CHARACTERS[id].name}): ${CHARACTERS[id].persona}`).join("\n");

    // 只用当前菜开始之后的历史(避免 AI 继续讨论上一道菜)
    const dishStart = findCurrentDishStart(history);
    const currentDishHistory = history.slice(dishStart);
    // 新菜上桌时彻底不传对话历史(避免 React 闭包 + 状态异步导致的"残留干扰")
    // 跨菜记忆 memorySection 仍然传递,保证人际关系连贯
    // 例外: 第一道菜需要让 AI 看到入座叙事,才能让首轮反应衔接入座剧情
    const isFirstDish = isNewDish && dishIdx === 0;
    const recentHistory = isFirstDish
      ? history.filter(h => h.type === "narration").map(h => `[场景] ${h.text}`).join("\n")
      : (isNewDish ? "" : currentDishHistory.slice(-12).map(h => {
          if (h.type === "narration") return `[场景] ${h.text}`;
          if (h.type === "event") return `[突发事件] ${h.title}: ${h.text}`;
          if (h.type === "user") return `你(小李): ${h.text}`;
          return `${CHARACTERS[h.char_id]?.name}: ${h.text}`;
        }).join("\n"));

    const mode = MODES[gameMode];
    const activeDishes = mode.dishIndices.map(i => DISHES[i]);
    const maxTurns = mode.turnsPerDish;
    const totalDishes = activeDishes.length;
    const currentDish = activeDishes[dishIdx];
    const orientInfo = currentDish.orientation ? `朝向: ${currentDish.orientation}(${CHARACTERS[currentDish.orientTo]?.name}位置)` : "";

    // 构建跨菜记忆摘要(只列非默认值,节省 token)
    const nonNeutralRelations = Object.entries(memory.relations).filter(([_, r]) => r.stance !== "中立");
    const abnormalStates = Object.entries(memory.charStates).filter(([_, s]) => s.drunk !== "清醒" || s.status !== "在场");

    let memorySection = "";
    if (nonNeutralRelations.length || abnormalStates.length || memory.playerTags.length) {
      memorySection = "\n【跨菜人际记忆 - 重要,基于此调整角色反应】\n";
      if (nonNeutralRelations.length) {
        memorySection += "各角色对你(小李)的态度:\n";
        for (const [id, r] of nonNeutralRelations) {
          memorySection += `  - ${CHARACTERS[id].name}: ${r.stance}${r.reason ? ` · ${r.reason}` : ""}\n`;
        }
      }
      if (abnormalStates.length) {
        memorySection += "角色当前状态(默认为'清醒/在场',此处仅列异常):\n";
        for (const [id, s] of abnormalStates) {
          const parts = [];
          if (s.drunk !== "清醒") parts.push(s.drunk);
          if (s.status !== "在场") parts.push(s.status);
          memorySection += `  - ${CHARACTERS[id].name}: ${parts.join(" · ")}\n`;
        }
      }
      if (memory.playerTags.length) {
        memorySection += "你(小李)身上累积的印象标签(其他人对你的看法):\n";
        for (const tag of memory.playerTags) memorySection += `  - ${tag}\n`;
      }
    } else {
      memorySection = "\n【跨菜人际记忆】(尚无累积,全部角色对你中立、清醒、在场)\n";
    }

    const sysPrompt = `你是讽刺剧游戏总监,运行《饭局模拟器》黑色幽默讽刺游戏。

【讽刺基调】对饭局文化中权力关系异化的讽刺——批判**官商场合中等级、谄媚、强迫敬酒、性别失衡**等结构性现象,**不针对任何地域或人群**。分数越高(谄媚+猥琐),越揭示玩家被同化。秘书小林等弱势角色应被同情刻画。

【11个角色】
${charList}

【当前菜品】第${dishIdx+1}/${totalDishes}道: ${currentDish.name} · ${currentDish.note} ${orientInfo}

【当前分数】谄媚${scores.flattery} 猥琐${scores.lewdness} 人格${scores.dignity}
【已对话轮次】${turnInDish}/${maxTurns}
${memorySection}【最近对话】
${recentHistory || "(新菜刚上桌,无对话历史。所有角色的注意力立刻转移到这道新菜上,完全不要提及任何之前的菜品。)"}

【刚刚发生】
${isNewDish ? `服务员端上"${currentDish.name}"。${currentDish.orientation ? `**注意菜品摆放朝向: ${currentDish.orientation}**(这本身就是社交信号,可被角色拿来做文章)。` : ""}生成场景+2-3角色反应。` : `玩家(小李)说: "${userAction}"`}

【突发事件机制】约 30-40% 几率插入突发事件(新菜上桌或中间轮次都可触发):
- force_toast: 某人强制敬酒,玩家必须接(干杯/拒绝/想办法躲)
- allergy: 某人(可能假装)酒精过敏要求别人替喝
- bottle_empty: 这瓶酒喝完了,谁掏钱买新的?
- trunk_empty: 领导让玩家去后备箱取酒,后备箱空了(玩家要怎么解释)
- spouse_call: 某人手机响,配偶来电查岗,场面尴尬
- secretary_leave: 秘书小林借故离开(去洗手间/接电话/找借口)
- connection_call: 关系户宝宝接到姐夫电话,瞬间变脸说一些让全桌紧张的话
- drunk_accident: 有人喝多了出洋相(吐/摔/失言)
- boss_test: 领导突然出难题考验玩家应变("小李,你说说为啥...")
- party_crasher: 不速之客闯入(欠债的、前任、对手公司的人)

如要触发事件,在 JSON 中加入 event 字段:
"event": {"type": "事件类型", "title": "短标题如'强制敬酒!'", "description": "30-80字事件描述"}

事件应带来戏剧性,但不要每道菜都触发。游戏前半段少触发,后半段多触发。

【输出 JSON,简洁】
{
  "narration": "<=50字场景,无则null",
  "responses": [{"char_id": "ID", "text": "<=60字台词"}],
  "event": null 或 {"type":"","title":"","description":""},
  "score_delta": {"flattery": 0-15, "lewdness": 0-15, "dignity": -10到5},
  "score_reason": "简短理由",
  "memory_updates": null 或 {
    "relations": {"角色ID": {"stance": "新态度", "reason": "8-15字"}},
    "char_states": {"角色ID": {"drunk": "新醉意", "status": "新状态"}},
    "player_tags_add": ["新增标签 8-15字"],
    "player_tags_remove": ["要淘汰的旧标签原文"]
  }
}

【memory_updates 详细规则 - 关键】
- relations: 玩家本轮行为让谁的态度发生变化? 用以下枚举之一: 喜欢/偏好/中立/不悦/敌意。**仅列出有变化的角色**(其他默认保持原态度)。reason 是 8-15 字的解释,如"被你抢了诗词风头"。
- char_states: 谁喝醉了一档?谁去洗手间/接电话了?谁回来了?谁醉得不省人事了? 醉意枚举: 清醒/微醺/半醉/大醉/不省人事; 状态枚举: 在场/洗手间/接电话/已离席。**仅列出有变化的角色**。
- player_tags_add: 本轮玩家行为产生了什么印象? 8-15字一条,讽刺感强,如"在主任面前夸海口" / "被科长当场拆穿" / "敬过吴总三杯"。每轮 0-2 条。
- player_tags_remove: 哪些旧标签已经被新行为覆盖或淡忘了? 原文匹配。
- 没有任何变化时,设 memory_updates 为 null。
- **重要**: 状态变化要符合戏剧逻辑——比如玩家过度奉承会让某些人态度下降(看不起拍马屁的);玩家拒绝喝酒可能让劝酒者不悦但让秘书略感激;老胡讲黄段子一次升一档醉意;秘书在被骚扰严重时可能去洗手间躲避。

【关键】
1. 1-3条响应,只让相关角色说话
2. 台词鲜活带方言感
3. 竞争者小刘常拆你台
4. 秘书小林被骚扰要让玩家不适——讽刺核心
5. 玩家反抗→人格上升;卑躬屈膝→谄媚上升;开黄腔→猥琐上升
6. 菜品有朝向时,角色可借机做文章("鱼头朝主任,这是规矩"/"主任,这鱼头敬您")
7. **绝对纪律:对话只围绕当前菜品「${currentDish.name}」展开。严禁提及之前的菜名、上一道菜的话题、或上一道菜遗留的事件。每道菜是独立场景,服务员撤盘后一切归零。新菜上桌时角色的注意力必须立刻转移到新菜上。但记忆中的角色态度和状态是跨菜保留的。**
8. **已离席的角色不应说话**,直到 char_states 中其 status 变回"在场"。`;

    const userMsg = isNewDish ? "请生成上菜场景和角色反应" : userAction;

    try {
      const parsed = await callBackend(sysPrompt, userMsg);
      const newHistory = [...history];
      if (!isNewDish && userAction) newHistory.push({ type: "user", text: userAction });
      if (parsed.narration) newHistory.push({ type: "narration", text: parsed.narration });
      // 事件单独高亮
      if (parsed.event && parsed.event.title) {
        newHistory.push({
          type: "event",
          eventType: parsed.event.type || "unknown",
          title: parsed.event.title,
          text: parsed.event.description || ""
        });
      }
      for (const r of parsed.responses || []) {
        newHistory.push({ type: "char", char_id: r.char_id, text: r.text });
      }
      setHistory(newHistory);

      if (parsed.score_delta) {
        setScores(prev => ({
          flattery: Math.max(0, Math.min(100, prev.flattery + (parsed.score_delta.flattery || 0))),
          lewdness: Math.max(0, Math.min(100, prev.lewdness + (parsed.score_delta.lewdness || 0))),
          dignity: Math.max(0, Math.min(100, prev.dignity + (parsed.score_delta.dignity || 0)))
        }));
        if (parsed.score_reason) {
          setScoreLog(prev => [...prev.slice(-4), parsed.score_reason]);
        }
      }

      // 处理跨菜记忆更新
      if (parsed.memory_updates) {
        const u = parsed.memory_updates;
        const newToasts = [];

        setMemory(prev => {
          const next = {
            relations: { ...prev.relations },
            charStates: { ...prev.charStates },
            playerTags: [...prev.playerTags]
          };

          // 更新角色态度
          if (u.relations && typeof u.relations === "object") {
            for (const [id, change] of Object.entries(u.relations)) {
              if (!CHARACTERS[id] || !change) continue;
              const oldStance = prev.relations[id]?.stance || "中立";
              const newStance = STANCES.includes(change.stance) ? change.stance : oldStance;
              next.relations[id] = {
                stance: newStance,
                reason: typeof change.reason === "string" ? change.reason : (prev.relations[id]?.reason || "")
              };
              if (newStance !== oldStance) {
                const oIdx = STANCES.indexOf(oldStance), nIdx = STANCES.indexOf(newStance);
                const arrow = nIdx < oIdx ? "↑" : (nIdx > oIdx ? "↓" : "→");
                newToasts.push({
                  id: Date.now() + Math.random(),
                  text: `${CHARACTERS[id].name} → ${newStance} ${arrow}`,
                  color: STANCE_COLORS[newStance]
                });
              }
            }
          }

          // 更新角色状态(醉意/在场)
          if (u.char_states && typeof u.char_states === "object") {
            for (const [id, change] of Object.entries(u.char_states)) {
              if (!CHARACTERS[id] || !change) continue;
              const oldDrunk = prev.charStates[id]?.drunk || "清醒";
              const oldStatus = prev.charStates[id]?.status || "在场";
              const newDrunk = DRUNK_LEVELS.includes(change.drunk) ? change.drunk : oldDrunk;
              const newStatus = PRESENCE_STATUSES.includes(change.status) ? change.status : oldStatus;
              next.charStates[id] = { drunk: newDrunk, status: newStatus };

              // 状态变化也提示一下(更微妙的颜色)
              if (newDrunk !== oldDrunk && DRUNK_LEVELS.indexOf(newDrunk) > DRUNK_LEVELS.indexOf(oldDrunk)) {
                newToasts.push({
                  id: Date.now() + Math.random(),
                  text: `${CHARACTERS[id].name} 醉意 → ${newDrunk}`,
                  color: "#b8a878"
                });
              }
              if (newStatus !== oldStatus && newStatus !== "在场") {
                newToasts.push({
                  id: Date.now() + Math.random(),
                  text: `${CHARACTERS[id].name} → ${newStatus}`,
                  color: "#a8748a"
                });
              }
            }
          }

          // 更新玩家标签
          if (Array.isArray(u.player_tags_remove)) {
            next.playerTags = next.playerTags.filter(t => !u.player_tags_remove.includes(t));
          }
          if (Array.isArray(u.player_tags_add)) {
            for (const tag of u.player_tags_add) {
              if (typeof tag === "string" && tag.trim() && !next.playerTags.includes(tag)) {
                next.playerTags.push(tag);
                newToasts.push({
                  id: Date.now() + Math.random(),
                  text: `新标签:「${tag}」`,
                  color: "#d4a3b8"
                });
              }
            }
          }
          // 标签上限,FIFO 淘汰
          if (next.playerTags.length > MAX_PLAYER_TAGS) {
            next.playerTags = next.playerTags.slice(next.playerTags.length - MAX_PLAYER_TAGS);
          }

          return next;
        });

        // 推入 toast 队列(分散触发,有错落感)
        if (newToasts.length) {
          newToasts.forEach((t, i) => {
            setTimeout(() => {
              setToasts(cur => [...cur, t]);
              setTimeout(() => setToasts(cur => cur.filter(x => x.id !== t.id)), 3800);
            }, i * 600);
          });
        }
      }

      // 强制推进
      if (!isNewDish) {
        const nextTurn = turnInDish + 1;
        setTurnInDish(nextTurn);
        if (nextTurn >= maxTurns) {
          setHistory(h => [...h, { type: "narration", text: "(服务员端着新菜走来,招呼要换盘子...)" }]);
          setTimeout(() => nextDish(), 2200);
        }
      }
    } catch (e) {
      setError(e.message || "AI 总监打嗝了");
    } finally {
      setLoading(false);
    }
  };

  const nextDish = async () => {
    const totalDishes = MODES[gameMode].dishIndices.length;
    if (dishIdx >= totalDishes - 1) { await generateFinalReport(); return; }
    setDishIdx(d => d + 1);
    setTurnInDish(0);
    setHistory(h => [...h, { type: "narration", text: `———— 第 ${dishIdx + 2} 道菜 ————` }]);
    setTimeout(() => callGM(null, true), 100);
  };

  // 从 intro 进入座位选择阶段
  const startGame = () => {
    setPhase("seating");
    setMemory(initMemory());
    setToasts([]);
    setHistory([]);
    setScores({ flattery: 0, lewdness: 0, dignity: 100 });
    setScoreLog([]);
    setDishIdx(0);
    setTurnInDish(0);
  };

  // 浮动 toast helper - 错落出现
  const flashToasts = (newToasts) => {
    newToasts.forEach((t, i) => {
      setTimeout(() => {
        setToasts(cur => [...cur, t]);
        setTimeout(() => setToasts(cur => cur.filter(x => x.id !== t.id)), 3800);
      }, i * 500);
    });
  };

  // 玩家点击座位 -> AI 即兴生成后果
  const pickSeat = async (seatNum) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    const sysPrompt = `你是讽刺剧《饭局模拟器》的游戏总监。玩家(小李)在 12 人圆桌前选择座位。

【已坐角色】
- Seat 0(主位): 李主任(${CHARACTERS.zhuren.persona.slice(0,30)})
- Seat 1(主宾位): 吴总(${CHARACTERS.wudong.persona.slice(0,30)})
- Seat 2(副主宾): 张副总(${CHARACTERS.fuzong.persona.slice(0,30)})
- Seat 9: 关系户宝宝(${CHARACTERS.guanxihu.persona.slice(0,30)})

【该座位的文化含义】
${SEAT_CULTURAL_MEANING[seatNum]}

【任务】生成玩家入座这个座位的即时反应。基于该座位的失礼/得体程度,产生:
1. 100-150字入座叙事(narration): 描述玩家坐下后桌上的反应——谁先开口?谁皱眉?谁尴尬笑?副总有没有救场?加入具体动作和短句对白,有戏剧感和讽刺感
2. score_delta: flattery(-5到+10)、lewdness(0)、dignity(-20到+5)。失礼程度越重,dignity 扣得越多
3. memory_updates.relations: 受影响最大的 1-3 个角色的态度变化(枚举: 喜欢/偏好/中立/不悦/敌意),每个带 8-15 字理由
4. memory_updates.player_tags_add: 1-2 个 8-15 字标签(可讽刺如"上桌就坐错位置"/"懂规矩"/"位置感不够好"/"自命不凡")

【输出 JSON,不带 markdown】
{
  "narration": "...",
  "score_delta": {"flattery": 0, "lewdness": 0, "dignity": 0},
  "memory_updates": {
    "relations": {"角色ID": {"stance": "态度", "reason": "理由"}},
    "player_tags_add": ["标签"]
  }
}`;

    try {
      const result = await callBackend(sysPrompt, `玩家选择了 Seat ${seatNum},立刻坐下了`);
      applySeatingResult(result);
    } catch (e) {
      setError(e.message || "AI 总监打嗝了");
      setLoading(false);
    }
  };

  // 听张副总安排 - 确定性逻辑(3-5 人格随机)
  const askForAssignment = () => {
    if (loading) return;
    const dignityLoss = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5

    const initMem = initMemory();
    initMem.relations.fuzong = { stance: "不悦", reason: "你连位置都不会挑" };
    initMem.playerTags = ["在场合中无所适从"];
    setMemory(initMem);

    setScores(prev => ({
      ...prev,
      dignity: Math.max(0, prev.dignity - dignityLoss)
    }));

    flashToasts([
      { id: Date.now() + Math.random(), text: `张副总 → 不悦`, color: STANCE_COLORS["不悦"] },
      { id: Date.now() + Math.random(), text: `人格 -${dignityLoss}`, color: "#a83232" },
      { id: Date.now() + Math.random(), text: `新标签:「在场合中无所适从」`, color: "#d4a3b8" }
    ]);

    setHistory([
      { type: "narration", text: "你站在门口愣了片刻,眼神在桌面游移——这种场面你完全没经验。" },
      { type: "narration", text: "张副总不耐烦地叹了口气,用下巴朝靠近门口的位置指了指:'你坐那。' 你乖乖坐下,脸有点发烫。其他人没说话,但也没看你——你被默认为'安全的低位'。" }
    ]);

    setPhase("playing");
    setTimeout(() => callGM(null, true), 200);
  };

  // 应用 AI 生成的座位选择结果
  const applySeatingResult = (result) => {
    // 应用分数变化
    if (result.score_delta) {
      setScores(prev => ({
        flattery: Math.max(0, Math.min(100, prev.flattery + (result.score_delta.flattery || 0))),
        lewdness: Math.max(0, Math.min(100, prev.lewdness + (result.score_delta.lewdness || 0))),
        dignity:  Math.max(0, Math.min(100, prev.dignity  + (result.score_delta.dignity  || 0)))
      }));
    }

    // 应用记忆变化
    const newToasts = [];
    if (result.memory_updates) {
      const initMem = initMemory();

      if (result.memory_updates.relations) {
        for (const [cid, change] of Object.entries(result.memory_updates.relations)) {
          if (!CHARACTERS[cid] || !change) continue;
          const stance = STANCES.includes(change.stance) ? change.stance : "中立";
          initMem.relations[cid] = { stance, reason: change.reason || "" };
          if (stance !== "中立") {
            newToasts.push({
              id: Date.now() + Math.random(),
              text: `${CHARACTERS[cid].name} → ${stance}`,
              color: STANCE_COLORS[stance]
            });
          }
        }
      }

      if (Array.isArray(result.memory_updates.player_tags_add)) {
        const tags = result.memory_updates.player_tags_add
          .filter(t => typeof t === "string" && t.trim())
          .slice(0, MAX_PLAYER_TAGS);
        initMem.playerTags = tags;
        for (const tag of tags) {
          newToasts.push({
            id: Date.now() + Math.random(),
            text: `新标签:「${tag}」`,
            color: "#d4a3b8"
          });
        }
      }

      setMemory(initMem);
    }

    flashToasts(newToasts);

    // 设置开场叙事
    setHistory([
      { type: "narration", text: "你穿着不合身的衬衫被张副总拽进了包间。十一双眼睛同时看向你。" },
      { type: "narration", text: result.narration || "你坐下了。" }
    ]);

    setLoading(false);
    setPhase("playing");
    setTimeout(() => callGM(null, true), 300);
  };

  const generateFinalReport = async () => {
    setLoading(true);
    try {
      const sysPrompt = "你是讽刺剧总结员,用黑色幽默风格输出 JSON。";
      const userMsg = `游戏终局总结。最终分数: 谄媚${scores.flattery} 猥琐${scores.lewdness} 人格${scores.dignity}
输出 JSON: {"title": "称号", "verdict": "100-150字黑色幽默总结", "consequence": "一句话后续"}`;

      const parsed = await callBackend(sysPrompt, userMsg);
      setFinalReport(parsed);
      setPhase("ending");

      if (typeof window !== "undefined") {
        const next = gamesPlayed + 1;
        localStorage.setItem(LS_KEY_GAMES, String(next));
        setGamesPlayed(next);
      }
    } catch (e) {
      setFinalReport({
        title: "酒局散场",
        verdict: `谄媚${scores.flattery}/猥琐${scores.lewdness}/人格${scores.dignity}。这个夜晚已经结束。`,
        consequence: "你打车回家。"
      });
      setPhase("ending");
    } finally { setLoading(false); }
  };

  const handleSend = () => {
    const t = input.trim();
    if (!t || loading) return;
    setInput("");
    callGM(t);
  };

  const handleToast = (charId) => {
    setInput(`(端起酒杯) ${CHARACTERS[charId].name},我敬您一杯!`);
  };

  const reset = () => {
    setPhase("intro"); setDishIdx(0); setTurnInDish(0); setHistory([]);
    setScores({ flattery: 0, lewdness: 0, dignity: 100 }); setScoreLog([]);
    setInput(""); setError(null); setFinalReport(null);
    setMemory(initMemory()); setToasts([]);
  };

  // ============ 圆桌 SVG ============
  const SeatingTable = () => {
    const cx = 150, cy = 150, r = 105, total = 12;
    const activeDishes = MODES[gameMode].dishIndices.map(i => DISHES[i]);
    const currentDish = activeDishes[dishIdx];

    // 朝向箭头
    let arrowEl = null;
    if (currentDish?.orientTo) {
      const targetSeat = CHARACTERS[currentDish.orientTo].seat;
      const angle = (targetSeat / total) * 2 * Math.PI - Math.PI / 2;
      const ax = cx + 55 * Math.cos(angle);
      const ay = cy + 55 * Math.sin(angle);
      arrowEl = (
        <g>
          <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="#c9a558" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.7" />
          <polygon points={`${ax},${ay} ${ax - 6*Math.cos(angle - 0.4)},${ay - 6*Math.sin(angle - 0.4)} ${ax - 6*Math.cos(angle + 0.4)},${ay - 6*Math.sin(angle + 0.4)}`}
            fill="#c9a558" opacity="0.9" />
        </g>
      );
    }

    return (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          <radialGradient id="tableGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5c3a2a" />
            <stop offset="100%" stopColor="#2a1810" />
          </radialGradient>
          <filter id="seatGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={70} fill="url(#tableGrad)" stroke="#7a5028" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={50} fill="none" stroke="#c9a558" strokeWidth="0.5" opacity="0.3" />
        <text x={cx} y={cy - 16} textAnchor="middle" fontSize="10" fill="#9c8068">
          第{dishIdx + 1}道
        </text>
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fill="#e8d5a8" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>
          {currentDish?.name.length > 6 ? currentDish?.name.slice(0,5)+'…' : currentDish?.name}
        </text>
        {arrowEl}
        {currentDish?.orientation && (
          <text x={cx} y={cy + 22} textAnchor="middle" fontSize="7" fill="#c9a558">
            {currentDish.orientation}
          </text>
        )}

        {CHAR_ORDER.map((cid) => {
          const c = CHARACTERS[cid];
          const angle = (c.seat / total) * 2 * Math.PI - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const isActive = activeChar === cid;
          const isOrientTarget = currentDish?.orientTo === cid;
          const charState = memory.charStates[cid] || { drunk: "清醒", status: "在场" };
          const isAbsent = charState.status !== "在场";
          const isVeryDrunk = charState.drunk === "大醉" || charState.drunk === "不省人事";
          const stance = memory.relations[cid]?.stance || "中立";
          return (
            <g key={cid} style={{cursor: "pointer", opacity: isAbsent ? 0.35 : 1}}
              onClick={() => setActiveChar(activeChar === cid ? null : cid)}>
              {/* 醉意环 */}
              {isVeryDrunk && !isAbsent && (
                <circle cx={x} cy={y} r={15} fill="none" stroke="#b8a878" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
              )}
              {/* 态度指示小圆点 */}
              {stance !== "中立" && !isAbsent && (
                <circle cx={x + 9} cy={y - 9} r={3.5} fill={STANCE_COLORS[stance]} stroke="#1a0a04" strokeWidth="1" />
              )}
              <circle cx={x} cy={y} r={isActive ? 14 : 11} fill={c.color}
                stroke={isActive ? "#fff" : (isOrientTarget ? "#c9a558" : "#2a1810")}
                strokeWidth={isActive || isOrientTarget ? 2 : 1}
                filter={isActive ? "url(#seatGlow)" : undefined} />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">
                {c.short.slice(0,2)}
              </text>
            </g>
          );
        })}
        {(() => {
          const angle = (11 / total) * 2 * Math.PI - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <g>
              <circle cx={x} cy={y} r={11} fill="#e8d5a8" stroke="#c9a558" strokeWidth="2" strokeDasharray="2,1" />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="#2a1810" fontWeight="bold">你</text>
            </g>
          );
        })()}
      </svg>
    );
  };

  const showFreemiumNudge = phase === "intro" && gamesPlayed >= 1 && !userKey;
  const showDisclaimerBlocker = hydrated && !disclaimerAccepted;
  const activeDishes = MODES[gameMode].dishIndices.map(i => DISHES[i]);
  const maxTurns = MODES[gameMode].turnsPerDish;
  const totalDishes = activeDishes.length;
  const currentDish = activeDishes[dishIdx];

  return (
    <div className="min-h-screen w-full relative" style={{
      background: "radial-gradient(ellipse at top, #4a1f15 0%, #2a1208 40%, #1a0a04 100%)",
      fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    }}>
      {/* 右上角控制 */}
      {!showDisclaimerBlocker && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {userKey && (
            <div className="px-2 py-1 text-xs rounded-full hidden sm:block" style={{
              background: "rgba(90,122,62,0.2)", color: "#a8c084", border: "1px solid #5a7a3e"
            }}>· 自带 key ·</div>
          )}
          <button onClick={toggleImages}
            className="p-2 rounded-full transition-all hover:bg-stone-800"
            style={{
              background: showImages ? "rgba(201,165,88,0.2)" : "rgba(0,0,0,0.4)",
              border: "1px solid #5c3a2a", color: showImages ? "#c9a558" : "#9c8068"
            }}
            title={showImages ? "关闭图片模式" : "开启图片模式"}>
            {showImages ? <ImageIcon className="w-4 h-4" /> : <ImageOff className="w-4 h-4" />}
          </button>
          <button onClick={() => { setKeyInput(userKey); setShowSettings(true); }}
            className="p-2 rounded-full transition-all hover:bg-stone-800"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #5c3a2a", color: "#c9a558" }}
            title="设置">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 浮动 toast: 显示态度/状态变化 */}
      {!showDisclaimerBlocker && toasts.length > 0 && (
        <div className="fixed top-20 left-1/2 z-30 flex flex-col items-center space-y-2 pointer-events-none"
          style={{ transform: "translateX(-50%)" }}>
          {toasts.map(t => (
            <div key={t.id} className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: "rgba(0,0,0,0.88)", color: t.color,
                border: `1px solid ${t.color}`,
                boxShadow: `0 0 14px ${t.color}55`,
                fontFamily: "'Noto Sans SC', sans-serif",
                animation: "toast-in 0.35s ease-out"
              }}>
              {t.text}
            </div>
          ))}
        </div>
      )}

      {/* 打赏按钮 */}
      {!showDisclaimerBlocker && (
        <button onClick={() => setShowDonate(true)}
          className="fixed bottom-6 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #c9a558 0%, #a8842d 100%)",
            color: "#2a1208", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, fontSize: "0.85rem",
            boxShadow: "0 4px 20px rgba(201,165,88,0.3)"
          }}>
          <Coffee className="w-4 h-4" /> 请作者一杯
        </button>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 pb-32">
        {phase === "intro" && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
            <div className="mb-4 px-4 py-1 rounded-full text-xs tracking-widest" style={{
              background: "rgba(201,165,88,0.15)", color: "#c9a558", border: "1px solid #c9a558"
            }}>· 黑色幽默 · 文化讽刺 · 18+ ·</div>
            <h1 className="text-7xl md:text-8xl mb-2" style={{
              fontFamily: "'Ma Shan Zheng', cursive", color: "#c9a558",
              textShadow: "0 0 30px rgba(201,165,88,0.4), 2px 2px 0 #4a1f15"
            }}>饭局模拟器</h1>
            <p className="text-2xl mb-8" style={{ color: "#a8748a", fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
              The Banquet of Souls
            </p>

            <div className="max-w-xl space-y-4 mb-8 text-left" style={{ color: "#e8d5a8", fontFamily: "'Noto Sans SC', sans-serif" }}>
              <p className="leading-relaxed">
                你叫小李,普通职员。今晚被张副总拽到酒局——李主任主陪,吴总作客,桌上还有八九个各色人等。
              </p>
              <p className="leading-relaxed">
                {MODES[gameMode].dishIndices.length} 道菜,每道菜最多 {MODES[gameMode].turnsPerDish} 轮对话。你要在每道菜上做文章——拍马屁、敬酒、躲突发事件、应付明枪暗箭。你的<span style={{color:"#c9a558"}}>谄媚指数</span>和<span style={{color:"#a83232"}}>猥琐指数</span>会被悄悄记录。
              </p>
            </div>

            {showFreemiumNudge && (
              <div className="max-w-xl mb-6 p-4 rounded-lg text-sm" style={{
                background: "rgba(201,165,88,0.08)", border: "1px solid #5c3a2a",
                color: "#e8d5a8", fontFamily: "'Noto Sans SC', sans-serif"
              }}>
                <div className="mb-2" style={{ color: "#c9a558" }}>· 你已经玩过 {gamesPlayed} 局 ·</div>
                <div className="leading-relaxed mb-3" style={{ color: "#9c8068" }}>
                  这游戏每局调用十几次 AI,作者掏的腰包。如果你想继续玩,可以:
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button onClick={() => { setKeyInput(userKey); setShowSettings(true); }}
                    className="px-4 py-2 rounded text-sm transition-all hover:opacity-80"
                    style={{ background: "#5a7a3e", color: "#fff" }}>
                    填入自己的 Key (永久免费)
                  </button>
                  <button onClick={() => setShowDonate(true)}
                    className="px-4 py-2 rounded text-sm transition-all hover:opacity-80"
                    style={{ background: "rgba(201,165,88,0.2)", color: "#c9a558", border: "1px solid #c9a558" }}>
                    打赏作者继续 ☕
                  </button>
                </div>
              </div>
            )}

            {/* 模式选择 */}
            <div className="max-w-xl w-full mb-6" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              <div className="text-xs tracking-widest mb-3 text-center" style={{ color: "#9c8068" }}>
                · 选择模式 ·
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(MODES).map(([key, m]) => {
                  const isSelected = gameMode === key;
                  return (
                    <button key={key} onClick={() => {
                      setGameMode(key);
                      if (typeof window !== "undefined") localStorage.setItem(LS_KEY_MODE, key);
                    }}
                      className="p-4 rounded-lg text-left transition-all hover:scale-[1.02]"
                      style={{
                        background: isSelected ? "rgba(201,165,88,0.15)" : "rgba(0,0,0,0.3)",
                        border: `1px solid ${isSelected ? "#c9a558" : "#5c3a2a"}`,
                        boxShadow: isSelected ? "0 0 12px rgba(201,165,88,0.2)" : "none"
                      }}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div style={{
                          fontFamily: "'Ma Shan Zheng', cursive",
                          fontSize: "1.5rem",
                          color: isSelected ? "#c9a558" : "#9c8068"
                        }}>{m.name}</div>
                        {isSelected && <span style={{ color: "#c9a558", fontSize: "0.75rem" }}>✓</span>}
                      </div>
                      <div className="text-xs" style={{ color: "#e8d5a8" }}>{m.desc}</div>
                      <div className="text-xs italic mt-1" style={{ color: "#9c8068" }}>{m.duration}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={startGame}
              className="px-8 py-3 rounded-full text-lg transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #c9a558 0%, #a8842d 100%)",
                color: "#2a1208", fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                boxShadow: "0 4px 20px rgba(201,165,88,0.3)"
              }}>入座 →</button>
          </div>
        )}

        {phase === "seating" && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center py-10">
            <div className="text-xs tracking-[0.4em] mb-3" style={{ color: "#9c8068" }}>· 你站在包间门口 ·</div>
            <h2 className="text-4xl md:text-5xl mb-3 text-center" style={{
              fontFamily: "'Ma Shan Zheng', cursive", color: "#c9a558",
              textShadow: "0 0 20px rgba(201,165,88,0.3)"
            }}>请落座</h2>
            <p className="max-w-xl text-center mb-2 text-sm leading-relaxed" style={{
              color: "#e8d5a8", fontFamily: "'Noto Sans SC', sans-serif"
            }}>
              李主任、吴总、张副总、宝宝已经坐下。<br/>
              <span style={{ color: "#9c8068" }}>桌上还有 8 个空位,选一个坐下。</span>
            </p>
            <p className="max-w-xl text-center mb-6 text-xs italic" style={{
              color: "#a8748a", fontFamily: "'Noto Sans SC', sans-serif"
            }}>
              · 后果只有坐下后才知道 ·
            </p>

            {/* 可点击圆桌 SVG */}
            <div className="w-full max-w-md mb-6 relative">
              <svg viewBox="0 0 400 400" className="w-full h-auto">
                <defs>
                  <radialGradient id="seatTableGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#5c3a2a" />
                    <stop offset="100%" stopColor="#2a1810" />
                  </radialGradient>
                  <filter id="hoverGlow">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* 桌面 */}
                <circle cx={200} cy={200} r={100} fill="url(#seatTableGrad)" stroke="#7a5028" strokeWidth="2" />
                <circle cx={200} cy={200} r={75} fill="none" stroke="#c9a558" strokeWidth="0.5" opacity="0.3" />
                <text x={200} y={196} textAnchor="middle" fontSize="11" fill="#9c8068"
                  style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                  包间圆桌
                </text>
                <text x={200} y={212} textAnchor="middle" fontSize="9" fill="#7a6b4f" style={{ fontStyle: "italic" }}>
                  · 选择落座位置 ·
                </text>

                {/* 门口标记 */}
                <text x={200} y={385} textAnchor="middle" fontSize="9" fill="#9c8068">↓ 门口</text>

                {/* 12 个座位 */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
                  const x = 200 + 145 * Math.cos(angle);
                  const y = 200 + 145 * Math.sin(angle);
                  const preSeatedId = PRE_SEATED[i];

                  if (preSeatedId) {
                    const c = CHARACTERS[preSeatedId];
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r={18} fill={c.color}
                          stroke="#2a1810" strokeWidth="1.5" />
                        <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
                          {c.short.slice(0, 2)}
                        </text>
                      </g>
                    );
                  }

                  // 空座位 - 可点击
                  return (
                    <g key={i} style={{ cursor: loading ? "wait" : "pointer" }}
                      onClick={() => !loading && pickSeat(i)}>
                      <circle cx={x} cy={y} r={18} fill="rgba(232,213,168,0.08)"
                        stroke="#c9a558" strokeWidth="1.5" strokeDasharray="3,2"
                        style={{ transition: "all 0.2s" }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.setAttribute("fill", "rgba(201,165,88,0.3)");
                            e.target.setAttribute("r", "21");
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.setAttribute("fill", "rgba(232,213,168,0.08)");
                          e.target.setAttribute("r", "18");
                        }}
                      />
                      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fill="#c9a558" fontWeight="bold"
                        style={{ pointerEvents: "none" }}>?</text>
                    </g>
                  );
                })}
              </svg>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center" style={{
                  background: "rgba(26,10,4,0.7)", backdropFilter: "blur(2px)"
                }}>
                  <div className="flex flex-col items-center gap-2" style={{ color: "#c9a558" }}>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs italic" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                      所有人的目光跟随你...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 听安排按钮 */}
            <button onClick={askForAssignment} disabled={loading}
              className="px-5 py-2 rounded-full text-sm transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                background: "transparent", color: "#9c8068",
                border: "1px solid #5c3a2a", fontFamily: "'Noto Sans SC', sans-serif"
              }}>
              站着,等张副总安排
            </button>
            <p className="text-xs italic mt-3 max-w-md text-center" style={{ color: "#7a6b4f" }}>
              (这个选项也有代价,只是相对小一点)
            </p>
          </div>
        )}

        {phase === "playing" && (
          <>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1 p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #5c3a2a" }}>
                <div className="text-xs tracking-widest mb-1" style={{ color: "#9c8068" }}>
                  进度 · 本轮 {turnInDish}/{maxTurns}
                </div>
                <div className="text-xl" style={{ color: "#c9a558", fontFamily: "'Ma Shan Zheng', cursive" }}>
                  {dishIdx + 1} / {totalDishes}
                </div>
                <div className="text-xs mt-1" style={{ color: "#e8d5a8" }}>{currentDish?.name}</div>
                {currentDish?.orientation && (
                  <div className="text-xs mt-1 italic" style={{ color: "#c9a558" }}>↗ {currentDish.orientation}</div>
                )}
              </div>
              {[
                { key: "flattery", label: "谄媚指数", color: "#c9a558" },
                { key: "lewdness", label: "猥琐指数", color: "#a83232" },
                { key: "dignity", label: "人格剩余", color: "#5a7a3e" }
              ].map(s => (
                <div key={s.key} className="p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #5c3a2a" }}>
                  <div className="text-xs tracking-widest mb-1" style={{ color: "#9c8068" }}>{s.label}</div>
                  <div className="text-2xl mb-1" style={{ color: s.color, fontWeight: 700 }}>
                    {scores[s.key]}<span className="text-xs ml-1" style={{ color: "#9c8068" }}>/100</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="h-full transition-all" style={{ width: `${scores[s.key]}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <div className="rounded-lg p-3" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #5c3a2a" }}>
                  <div className="text-xs tracking-widest mb-2" style={{ color: "#9c8068" }}>圆桌座次 (点头像查看)</div>
                  <div className="aspect-square"><SeatingTable /></div>

                  {/* 图片模式: 当前菜品 */}
                  <DishImage dishIdx={dishIdx} showImages={showImages} />

                  {/* 图片模式: 角色卡 */}
                  {showImages && activeChar && (
                    <div className="mt-3 p-3 rounded-lg" style={{
                      background: "rgba(201,165,88,0.08)", border: `1px solid ${CHARACTERS[activeChar].color}`
                    }}>
                      <div className="flex gap-3 items-start">
                        <CharAvatar charId={activeChar} size={56} showImages={true} />
                        <div className="flex-1 min-w-0">
                          <div style={{ color: CHARACTERS[activeChar].color, fontWeight: 700, fontSize: "0.9rem" }}>
                            {CHARACTERS[activeChar].name}
                          </div>
                          <div className="text-xs" style={{ color: "#9c8068" }}>{CHARACTERS[activeChar].title}</div>
                        </div>
                      </div>
                      {/* 状态徽章区 */}
                      <div className="mt-2 pt-2 border-t flex flex-wrap gap-1.5 items-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{
                          background: STANCE_COLORS[memory.relations[activeChar]?.stance || "中立"] + "30",
                          color: STANCE_COLORS[memory.relations[activeChar]?.stance || "中立"],
                          border: `1px solid ${STANCE_COLORS[memory.relations[activeChar]?.stance || "中立"]}`
                        }}>
                          态度·{memory.relations[activeChar]?.stance || "中立"}
                        </span>
                        {memory.charStates[activeChar]?.drunk !== "清醒" && (
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{
                            background: "rgba(184,168,120,0.15)", color: "#b8a878", border: "1px solid #b8a878"
                          }}>{memory.charStates[activeChar].drunk}</span>
                        )}
                        {memory.charStates[activeChar]?.status !== "在场" && (
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{
                            background: "rgba(168,116,138,0.15)", color: "#a8748a", border: "1px solid #a8748a"
                          }}>{memory.charStates[activeChar].status}</span>
                        )}
                      </div>
                      {memory.relations[activeChar]?.reason && (
                        <div className="text-xs italic mt-1.5" style={{ color: "#9c8068" }}>
                          ↳ {memory.relations[activeChar].reason}
                        </div>
                      )}
                      <div className="text-xs mt-2 pt-2 border-t" style={{
                        borderColor: "rgba(255,255,255,0.08)", color: "#e8d5a8", lineHeight: 1.5
                      }}>{CHARACTERS[activeChar].persona}</div>
                    </div>
                  )}

                  {/* 非图片模式: 角色卡 */}
                  {!showImages && activeChar && (
                    <div className="mt-3 p-2 rounded text-xs" style={{ background: "rgba(201,165,88,0.1)", border: `1px solid ${CHARACTERS[activeChar].color}` }}>
                      <div style={{ color: CHARACTERS[activeChar].color, fontWeight: 700 }}>
                        {CHARACTERS[activeChar].name} · {CHARACTERS[activeChar].title}
                      </div>
                      {/* 状态徽章 */}
                      <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                        <span className="px-2 py-0.5 rounded-full" style={{
                          background: STANCE_COLORS[memory.relations[activeChar]?.stance || "中立"] + "30",
                          color: STANCE_COLORS[memory.relations[activeChar]?.stance || "中立"],
                          border: `1px solid ${STANCE_COLORS[memory.relations[activeChar]?.stance || "中立"]}`,
                          fontSize: "0.7rem"
                        }}>
                          态度·{memory.relations[activeChar]?.stance || "中立"}
                        </span>
                        {memory.charStates[activeChar]?.drunk !== "清醒" && (
                          <span className="px-2 py-0.5 rounded-full" style={{
                            background: "rgba(184,168,120,0.15)", color: "#b8a878",
                            border: "1px solid #b8a878", fontSize: "0.7rem"
                          }}>{memory.charStates[activeChar].drunk}</span>
                        )}
                        {memory.charStates[activeChar]?.status !== "在场" && (
                          <span className="px-2 py-0.5 rounded-full" style={{
                            background: "rgba(168,116,138,0.15)", color: "#a8748a",
                            border: "1px solid #a8748a", fontSize: "0.7rem"
                          }}>{memory.charStates[activeChar].status}</span>
                        )}
                      </div>
                      {memory.relations[activeChar]?.reason && (
                        <div className="italic mt-1" style={{ color: "#9c8068", fontSize: "0.7rem" }}>
                          ↳ {memory.relations[activeChar].reason}
                        </div>
                      )}
                      <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)", color: "#e8d5a8", lineHeight: 1.5 }}>
                        {CHARACTERS[activeChar].persona}
                      </div>
                    </div>
                  )}

                  {/* 玩家身上的标签 */}
                  {memory.playerTags.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "#5c3a2a" }}>
                      <div className="text-xs mb-2" style={{ color: "#9c8068" }}>· 你身上的标签 ·</div>
                      <div className="flex flex-wrap gap-1.5">
                        {memory.playerTags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full" style={{
                            background: "rgba(168,116,138,0.15)", color: "#d4a3b8",
                            border: "1px solid #a8748a", fontSize: "0.7rem"
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {scoreLog.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "#5c3a2a" }}>
                      <div className="text-xs mb-1" style={{ color: "#9c8068" }}>评分日志</div>
                      {scoreLog.slice(-3).map((s, i) => (
                        <div key={i} className="text-xs italic mb-1" style={{ color: "#a8748a" }}>· {s}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-lg flex flex-col" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #5c3a2a", minHeight: "70vh" }}>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "60vh" }}>
                  {history.map((h, i) => {
                    if (h.type === "narration") {
                      return <div key={i} className="text-center text-xs italic py-2" style={{ color: "#9c8068" }}>{h.text}</div>;
                    }
                    // 突发事件高亮卡片
                    if (h.type === "event") {
                      return (
                        <div key={i} className="my-3 p-3 rounded-lg" style={{
                          background: "linear-gradient(135deg, rgba(168,50,50,0.15), rgba(201,165,88,0.1))",
                          border: "1px solid #a83232", boxShadow: "0 0 10px rgba(168,50,50,0.2)"
                        }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4" style={{ color: "#ff9090" }} />
                            <span className="text-xs tracking-widest font-bold" style={{ color: "#ff9090" }}>突发事件</span>
                          </div>
                          <div className="text-base mb-1" style={{ color: "#c9a558", fontFamily: "'Ma Shan Zheng', cursive" }}>
                            {h.title}
                          </div>
                          <div className="text-sm" style={{ color: "#e8d5a8", fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.6 }}>
                            {h.text}
                          </div>
                        </div>
                      );
                    }
                    if (h.type === "user") {
                      return (
                        <div key={i} className="flex justify-end">
                          <div className="max-w-[80%] px-3 py-2 rounded-lg" style={{
                            background: "rgba(232,213,168,0.15)", color: "#e8d5a8",
                            border: "1px solid #c9a558", fontFamily: "'Noto Sans SC', sans-serif", fontSize: "0.9rem"
                          }}>
                            <div className="text-xs opacity-60 mb-1">你 (小李)</div>
                            <div>{h.text}</div>
                          </div>
                        </div>
                      );
                    }
                    const c = CHARACTERS[h.char_id];
                    if (!c) return null;
                    return (
                      <div key={i} className="flex gap-2">
                        <CharAvatar charId={h.char_id} size={32} showImages={showImages} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs mb-1" style={{ color: c.color, fontWeight: 700 }}>{c.name}</div>
                          <div className="px-3 py-2 rounded-lg inline-block max-w-full" style={{
                            background: "rgba(255,255,255,0.05)", color: "#e8d5a8",
                            fontFamily: "'Noto Sans SC', sans-serif", fontSize: "0.9rem", lineHeight: 1.6
                          }}>{h.text}</div>
                        </div>
                      </div>
                    );
                  })}
                  {loading && (
                    <div className="flex items-center gap-2 text-xs italic" style={{ color: "#9c8068" }}>
                      <Loader2 className="w-3 h-3 animate-spin" /> 包间里弥漫着烟味...
                    </div>
                  )}
                  {error && (
                    <div className="text-xs p-2 rounded" style={{ background: "rgba(168,50,50,0.2)", color: "#ff9090" }}>{error}</div>
                  )}
                </div>

                <div className="px-3 pt-2 pb-1 border-t flex flex-wrap gap-1" style={{ borderColor: "#5c3a2a" }}>
                  <span className="text-xs self-center mr-1" style={{ color: "#9c8068" }}>敬:</span>
                  {["zhuren", "wudong", "fuzong", "kezhang", "guanxihu", "xiaoLiu"].map(cid => (
                    <button key={cid} onClick={() => handleToast(cid)} disabled={loading}
                      className="px-2 py-0.5 text-xs rounded transition-all hover:opacity-80 disabled:opacity-40"
                      style={{ background: CHARACTERS[cid].color, color: "#fff" }}>
                      {CHARACTERS[cid].short}
                    </button>
                  ))}
                </div>

                <div className="p-3 border-t flex gap-2" style={{ borderColor: "#5c3a2a" }}>
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder={turnInDish >= maxTurns ? "服务员要收盘子了..." : "说点什么..."}
                    disabled={loading || turnInDish >= maxTurns}
                    className="flex-1 px-3 py-2 rounded text-sm outline-none"
                    style={{ background: "rgba(0,0,0,0.4)", color: "#e8d5a8", border: "1px solid #5c3a2a", fontFamily: "'Noto Sans SC', sans-serif" }} />
                  <button onClick={handleSend} disabled={loading || !input.trim() || turnInDish >= maxTurns}
                    className="px-4 rounded transition-all disabled:opacity-40"
                    style={{ background: "#c9a558", color: "#2a1208" }}>
                    <Send className="w-4 h-4" />
                  </button>
                  <button onClick={nextDish} disabled={loading || turnInDish < 1}
                    className="px-3 rounded transition-all disabled:opacity-30 flex items-center gap-1 text-xs"
                    style={{ background: "rgba(201,165,88,0.15)", color: "#c9a558", border: "1px solid #c9a558" }}>
                    {dishIdx >= totalDishes - 1 ? "散席" : "下一道"} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {phase === "ending" && finalReport && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center py-10">
            <Skull className="w-12 h-12 mb-4" style={{ color: "#c9a558" }} />
            <div className="text-xs tracking-[0.4em] mb-2" style={{ color: "#9c8068" }}>· 酒局散场 ·</div>
            <h2 className="text-5xl md:text-6xl mb-8" style={{
              fontFamily: "'Ma Shan Zheng', cursive", color: "#c9a558",
              textShadow: "0 0 20px rgba(201,165,88,0.4)"
            }}>{finalReport.title}</h2>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-md w-full">
              {[
                { label: "谄媚", val: scores.flattery, color: "#c9a558" },
                { label: "猥琐", val: scores.lewdness, color: "#a83232" },
                { label: "人格", val: scores.dignity, color: "#5a7a3e" }
              ].map(s => (
                <div key={s.label} className="p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${s.color}` }}>
                  <div className="text-3xl mb-1" style={{ color: s.color, fontWeight: 700 }}>{s.val}</div>
                  <div className="text-xs" style={{ color: "#9c8068" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="max-w-xl space-y-4 mb-8" style={{ color: "#e8d5a8", fontFamily: "'Noto Sans SC', sans-serif" }}>
              <p className="leading-relaxed">{finalReport.verdict}</p>
              <p className="italic text-sm" style={{ color: "#a8748a" }}>{finalReport.consequence}</p>
            </div>

            {!userKey && (
              <div className="mb-6 p-3 rounded-lg max-w-md text-xs" style={{
                background: "rgba(201,165,88,0.08)", border: "1px solid #5c3a2a", color: "#9c8068"
              }}>
                喜欢这局?可以<button onClick={() => setShowDonate(true)} className="underline mx-1" style={{color:"#c9a558"}}>请作者一杯</button>
                或<button onClick={() => { setKeyInput(userKey); setShowSettings(true); }} className="underline mx-1" style={{color:"#5a7a3e"}}>填自己的 Key</button>继续畅玩
              </div>
            )}

            <button onClick={reset}
              className="flex items-center gap-2 px-6 py-2 rounded-full text-sm transition-all hover:scale-105"
              style={{ background: "transparent", color: "#c9a558", border: "1px solid #c9a558" }}>
              <RotateCcw className="w-4 h-4" /> 再来一局
            </button>
          </div>
        )}
      </div>

      {/* 页脚 */}
      {!showDisclaimerBlocker && (
        <footer className="border-t mt-8 py-6 px-4" style={{
          borderColor: "#5c3a2a", background: "rgba(0,0,0,0.3)", fontFamily: "'Noto Sans SC', sans-serif"
        }}>
          <div className="max-w-3xl mx-auto text-xs leading-relaxed text-center" style={{ color: "#9c8068" }}>
            <div className="mb-2 whitespace-pre-line">{DISCLAIMER_SHORT.trim()}</div>
            <button onClick={() => setShowFullDisclaimer(true)}
              className="inline-flex items-center gap-1 mt-2 underline transition-all hover:opacity-80"
              style={{ color: "#c9a558" }}>
              <FileText className="w-3 h-3" /> 查看完整免责声明
            </button>
          </div>
        </footer>
      )}

      {/* 首次免责拦截 */}
      {showDisclaimerBlocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)"
        }}>
          <div className="max-w-2xl w-full max-h-[90vh] flex flex-col rounded-lg" style={{
            background: "#2a1810", border: "2px solid #5c3a2a", fontFamily: "'Noto Sans SC', sans-serif"
          }}>
            <div className="p-6 border-b flex items-center gap-3" style={{ borderColor: "#5c3a2a" }}>
              <ShieldAlert className="w-6 h-6 flex-shrink-0" style={{ color: "#c9a558" }} />
              <h2 className="text-2xl" style={{ color: "#c9a558", fontFamily: "'Ma Shan Zheng', cursive" }}>
                {FIRST_VISIT_TITLE}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm" style={{ color: "#e8d5a8" }}>
              {renderRichText(DISCLAIMER_FULL)}
            </div>
            <div className="p-6 border-t flex flex-col sm:flex-row gap-3" style={{ borderColor: "#5c3a2a" }}>
              <button onClick={declineDisclaimer}
                className="flex-1 px-4 py-3 rounded text-sm transition-all hover:opacity-80"
                style={{ background: "transparent", color: "#9c8068", border: "1px solid #5c3a2a" }}>
                {DECLINE_BUTTON}
              </button>
              <button onClick={acceptDisclaimer}
                className="flex-1 px-4 py-3 rounded text-sm transition-all hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #c9a558 0%, #a8842d 100%)", color: "#2a1208", fontWeight: 600 }}>
                {ACKNOWLEDGE_BUTTON}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完整声明 */}
      {showFullDisclaimer && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="max-w-2xl w-full max-h-[85vh] flex flex-col rounded-lg" style={{
            background: "#2a1810", border: "1px solid #5c3a2a", fontFamily: "'Noto Sans SC', sans-serif"
          }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "#5c3a2a" }}>
              <h2 className="text-xl" style={{ color: "#c9a558", fontFamily: "'Ma Shan Zheng', cursive" }}>完整免责声明</h2>
              <button onClick={() => setShowFullDisclaimer(false)}
                className="p-1 rounded hover:bg-stone-800" style={{ color: "#9c8068" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm" style={{ color: "#e8d5a8" }}>
              {renderRichText(DISCLAIMER_FULL)}
            </div>
          </div>
        </div>
      )}

      {/* 设置 */}
      {showSettings && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="max-w-md w-full p-6 rounded-lg relative" style={{
            background: "#2a1810", border: "1px solid #5c3a2a", fontFamily: "'Noto Sans SC', sans-serif"
          }}>
            <button onClick={() => setShowSettings(false)}
              className="absolute top-3 right-3 p-1 rounded hover:bg-stone-800" style={{ color: "#9c8068" }}>
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl mb-1" style={{ color: "#c9a558", fontFamily: "'Ma Shan Zheng', cursive" }}>
              使用你自己的 Gemini Key
            </h3>
            <p className="text-xs mb-4" style={{ color: "#9c8068" }}>
              填入后所有 API 调用走你的账号,作者不收你一分钱,你想玩多少局都行
            </p>
            <div className="space-y-3 text-sm" style={{ color: "#e8d5a8" }}>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#9c8068" }}>Gemini API Key</label>
                <input value={keyInput} onChange={e => setKeyInput(e.target.value)}
                  placeholder="AIza..." type="password"
                  className="w-full px-3 py-2 rounded text-sm outline-none"
                  style={{ background: "rgba(0,0,0,0.4)", color: "#e8d5a8", border: "1px solid #5c3a2a" }} />
              </div>
              <div className="text-xs leading-relaxed p-3 rounded" style={{
                background: "rgba(201,165,88,0.05)", color: "#9c8068", border: "1px solid #5c3a2a"
              }}>
                <div className="mb-2" style={{ color: "#c9a558" }}>怎么拿到 Gemini Key?</div>
                <div>1. 打开 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline" style={{color:"#c9a558"}}>aistudio.google.com/apikey <ExternalLink className="inline w-3 h-3"/></a></div>
                <div>2. 登录 Google 账号</div>
                <div>3. 点 "Create API key",复制 AIza... 开头的字符串</div>
                <div className="mt-2 pt-2 border-t" style={{ borderColor: "#5c3a2a" }}>
                  Key 只存在你的浏览器里,作者看不到。免费额度足够你玩几十局。
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={saveKey}
                  className="flex-1 px-4 py-2 rounded transition-all hover:opacity-80"
                  style={{ background: "#c9a558", color: "#2a1208", fontWeight: 600 }}>保存</button>
                {userKey && (
                  <button onClick={() => { setKeyInput(""); }}
                    className="px-3 py-2 rounded text-xs transition-all hover:opacity-80"
                    style={{ background: "transparent", color: "#9c8068", border: "1px solid #5c3a2a" }}>清空</button>
                )}
              </div>
              <button onClick={() => { setShowSettings(false); setShowFullDisclaimer(true); }}
                className="w-full text-xs underline pt-2" style={{ color: "#9c8068" }}>查看完整免责声明</button>
            </div>
          </div>
        </div>
      )}

      {/* 打赏 */}
      {showDonate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="max-w-md w-full p-6 rounded-lg relative" style={{
            background: "#2a1810", border: "1px solid #5c3a2a", fontFamily: "'Noto Sans SC', sans-serif"
          }}>
            <button onClick={() => setShowDonate(false)}
              className="absolute top-3 right-3 p-1 rounded hover:bg-stone-800" style={{ color: "#9c8068" }}>
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl mb-1" style={{ color: "#c9a558", fontFamily: "'Ma Shan Zheng', cursive" }}>请作者一杯</h3>
            <p className="text-xs mb-4" style={{ color: "#9c8068" }}>
              这游戏每局 AI 调用花作者几毛钱。如果让你笑了一下,可以小小赞助一下,鼓励多写点
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="aspect-square rounded-lg flex items-center justify-center mb-2 overflow-hidden" style={{ background: "#fff", border: "1px solid #5c3a2a" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/donate-wechat.jpg" alt="微信收款码" className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="w-full h-full hidden items-center justify-center text-xs p-2" style={{ color: "#9c8068" }}>
                    把微信收款码<br/>命名为<br/>donate-wechat.jpg<br/>放在 /public 目录
                  </div>
                </div>
                <div className="text-xs" style={{ color: "#5a7a3e" }}>微信</div>
              </div>
              <div className="text-center">
                <div className="aspect-square rounded-lg flex items-center justify-center mb-2 overflow-hidden" style={{ background: "#fff", border: "1px solid #5c3a2a" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/donate-alipay.jpg" alt="支付宝收款码" className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="w-full h-full hidden items-center justify-center text-xs p-2" style={{ color: "#9c8068" }}>
                    把支付宝收款码<br/>命名为<br/>donate-alipay.jpg<br/>放在 /public 目录
                  </div>
                </div>
                <div className="text-xs" style={{ color: "#3a6e8e" }}>支付宝</div>
              </div>
            </div>
            <p className="text-xs italic text-center mt-4" style={{ color: "#9c8068" }}>
              不打赏也完全没关系,代码会一直跑下去。<br/>想白嫖请玩自己的 key,作者也乐见。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
