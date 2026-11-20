export interface MemoryPhotoItem {
  url: string;
  captionZh: string;
  captionEn: string;
}

export type PersonalMemoryKind =
  | 'freedive-crimson'
  | 'yzfls-campus'
  | 'redbrick-gate'
  | 'gramophone-lounge'
  | 'winter-bros'
  | 'hunau-campus';

export interface PersonalMemoryNode {
  id: PersonalMemoryKind;
  indexLabel: string;
  zoneId: 'meadow' | 'forest' | 'coast' | 'summit' | 'pier';
  islandCenter: { x: number; y: number; z: number };
  islandRadius: number;
  pos: { x: number; y: number; z: number };
  rotY: number;
  preferredTime?: number;
  categoryZh: string;
  categoryEn: string;
  titleZh: string;
  titleEn: string;
  subtitleZh: string;
  subtitleEn: string;
  eraZh: string;
  storyZh: string;
  storyEn: string;
  unlockQuestionZh: string;
  unlockQuestionEn: string;
  unlockPlaceholderZh: string;
  unlockPlaceholderEn: string;
  unlockAnswers: string[];
  photos: MemoryPhotoItem[];
}

export const MEMORY_PASSPHRASE_HINT_ZH = '回答对应的小问题即可显影原图';
export const MEMORY_PASSPHRASE_HINT_EN = 'Answer the memory question to develop the original photo';

export const PERSONAL_MEMORIES: PersonalMemoryNode[] = [
  {
    id: 'freedive-crimson',
    indexLabel: 'M01',
    zoneId: 'pier',
    islandCenter: { x: -15.5, y: 0.45, z: 22.5 },
    islandRadius: 8.6,
    pos: { x: -15.5, y: -0.1, z: 22.5 },
    rotY: 0.32,
    preferredTime: 19.2,
    categoryZh: '人物记忆 · 蓝调潜水区',
    categoryEn: 'PERSON MEMORY · FREEDIVING SANCTUARY',
    titleZh: '深蓝自由潜与红光夜车',
    titleEn: 'Freediving Blue & Crimson Night Drive',
    subtitleZh: '水下屏息的那束白绳，与夜色车窗里的绯红微光',
    subtitleEn: 'Holding breath along the white dive line, and crimson light inside a night car',
    eraZh: '珍藏瞬间 · 同一个人',
    storyZh:
      '同一张面孔，藏着两种截然不同却同样难忘的色温：一面是在湛蓝深水里拉着白绳、安静而自由地向水下潜去的身影；另一面是夜色车厢里被红色尾灯染亮、微微皱眉却格外鲜活的瞬间。',
    storyEn:
      'One person captured in two unforgettable color temperatures: weightless and serene holding the white guide line beneath deep blue water, and vividly illuminated by warm crimson car light on a quiet night ride.',
    unlockQuestionZh: '这是在哪里潜水的？',
    unlockQuestionEn: 'Which city was this freediving session in?',
    unlockPlaceholderZh: '输入城市名...',
    unlockPlaceholderEn: 'Enter city name...',
    unlockAnswers: ['深圳', '深圳市', 'shenzhen'],
    photos: [
      {
        url: '/memories/p6-freedive.webp',
        captionZh: '深圳 · 深蓝水下手握导绳自由潜',
        captionEn: 'Shenzhen · Underwater freediving along the guide rope',
      },
      {
        url: '/memories/p1-night-car.webp',
        captionZh: '夜色车厢 · 绯红微光里的定格',
        captionEn: 'Night Car · Portrait in crimson ambient light',
      },
    ],
  },
  {
    id: 'yzfls-campus',
    indexLabel: 'M02',
    zoneId: 'forest',
    islandCenter: { x: 31.5, y: 1.35, z: -17.5 },
    islandRadius: 8.6,
    pos: { x: 31.5, y: 1.35, z: -18.2 },
    rotY: -0.35,
    preferredTime: 13.5,
    categoryZh: '建筑记忆 · 少年母校',
    categoryEn: 'ARCHITECTURE · MIDDLE SCHOOL',
    titleZh: '株洲市外国语学校',
    titleEn: 'Zhuzhou Foreign Language School',
    subtitleZh: '长长的石阶、绯红花丛与楼顶「办有灵魂的学校」',
    subtitleEn: 'Grand stone stairs, crimson hedges & the blue-and-white campus hall',
    eraZh: '初中记忆 · 株洲',
    storyZh:
      '每天走过那道被红继木夹道的长石阶，抬头就能看见蓝白教学楼顶上醒目的红色大字「办有灵魂的学校」。亮黄色的校门岗亭、白色弧形门廊和绿荫大树，构成了在株洲市外国语学校最清晰的晨光记忆。',
    storyEn:
      'Climbing the stone steps lined with crimson shrubs toward the blue-and-white teaching hall crowned with bold red calligraphy — the yellow gatehouse, curved white canopy, and tall shade trees of Zhuzhou Foreign Language School.',
    unlockQuestionZh: '我在株洲市外国语学校是哪个班？',
    unlockQuestionEn: 'Which class was I in at Zhuzhou Foreign Language School?',
    unlockPlaceholderZh: '输入班级号...',
    unlockPlaceholderEn: 'Enter class number...',
    unlockAnswers: ['227', '227班'],
    photos: [
      {
        url: '/memories/p2-yzfls.webp',
        captionZh: '株洲市外国语学校 · 校门阶梯与蓝白教学楼',
        captionEn: 'Zhuzhou Foreign Language School · Steps & Main Hall',
      },
    ],
  },
  {
    id: 'redbrick-gate',
    indexLabel: 'M03',
    zoneId: 'meadow',
    islandCenter: { x: 24.5, y: 1.05, z: 16.5 },
    islandRadius: 9.4,
    pos: { x: 24.5, y: 1.05, z: 16.0 },
    rotY: -0.5,
    preferredTime: 15.5,
    categoryZh: '建筑记忆 · 高中母校',
    categoryEn: 'ARCHITECTURE · HIGH SCHOOL',
    titleZh: '株洲南方中学',
    titleEn: 'Zhuzhou Nanfang High School',
    subtitleZh: '蓝天白云下对称的红砖柱廊校门与守望时间的钟楼',
    subtitleEn: 'Symmetrical red-brick gateway and clock tower beneath bright summer clouds',
    eraZh: '高中记忆 · 株洲',
    storyZh:
      '红砖砌成的宽阔柱廊大门，右侧立着标志性的高耸红砖钟楼。每当晴空万里、云朵从教学楼后方缓缓飘过，南方中学的钟楼指针就像在默默记录着高中三年每一次早出晚归与奔赴理想的脚步。',
    storyEn:
      'The iconic red-brick colonnade and tall clock tower of Zhuzhou Nanfang High School — silently marking every morning rush and late-evening return across three unforgettable high school years.',
    unlockQuestionZh: '我在株洲南方中学是哪个班？',
    unlockQuestionEn: 'Which class was I in at Zhuzhou Nanfang High School?',
    unlockPlaceholderZh: '输入班级号...',
    unlockPlaceholderEn: 'Enter class number...',
    unlockAnswers: ['2114', '2114班'],
    photos: [
      {
        url: '/memories/p3-redbrick-gate.webp',
        captionZh: '株洲南方中学 · 晴空下的红砖校门与钟楼广场',
        captionEn: 'Zhuzhou Nanfang High School · Red-brick gate & clock tower',
      },
    ],
  },
  {
    id: 'gramophone-lounge',
    indexLabel: 'M04',
    zoneId: 'summit',
    islandCenter: { x: 13.5, y: 3.1, z: -32.0 },
    islandRadius: 7.4,
    pos: { x: 13.5, y: 3.1, z: -32.2 },
    rotY: -0.35,
    preferredTime: 21.5,
    categoryZh: '人物记忆 · 云端夜色露台',
    categoryEn: 'FRIENDS MEMORY · SKY LOUNGE',
    titleZh: '留声机与落地窗客厅',
    titleEn: 'Gramophone & City-View Lounge',
    subtitleZh: '沙发、旧留声机、满桌零食与窗外的万家灯火',
    subtitleEn: 'Cozy sofa, vintage brass gramophone, snacks & glittering night skyline',
    eraZh: '好友相聚 · 暖夜客厅',
    storyZh:
      '落地窗外是璀璨的城市夜景，角落里立着一台复古黄铜大喇叭留声机。几个人挤在深色沙发上对着镜头比耶大笑，茶几上摆满饮料和小零食——这样松弛而热闹的夜晚，值得在山顶永远留一盏暖灯。',
    storyEn:
      'City lights glittering beyond the floor-to-ceiling window, a vintage brass gramophone in the corner, snacks across the coffee table, and friends crowded onto the sofa flashing peace signs.',
    unlockQuestionZh: '这张四人合照是在哪里拍的？',
    unlockQuestionEn: 'Which city was this 4-person group photo taken in?',
    unlockPlaceholderZh: '输入城市名...',
    unlockPlaceholderEn: 'Enter city name...',
    unlockAnswers: ['重庆', '重庆市', 'chongqing'],
    photos: [
      {
        url: '/memories/p4-friends-room.webp',
        captionZh: '重庆 · 夜色落地窗与留声机旁的四人合照',
        captionEn: 'Chongqing · Group photo by the gramophone & night window',
      },
    ],
  },
  {
    id: 'winter-bros',
    indexLabel: 'M05',
    zoneId: 'coast',
    islandCenter: { x: -31.5, y: 1.05, z: -15.5 },
    islandRadius: 7.2,
    pos: { x: -31.5, y: 1.05, z: -15.5 },
    rotY: 0.45,
    preferredTime: 17.5,
    categoryZh: '人物记忆 · 冬日海岸岬',
    categoryEn: 'FRIENDS MEMORY · WINTER OVERLOOK',
    titleZh: '冬日羽绒服与并肩老友',
    titleEn: 'Winter Puffers & Side-by-Side',
    subtitleZh: '米白与哑光黑羽绒服，举起红壳手机留下的冬日定格',
    subtitleEn: 'Cream and matte-black puffers, red phone case, and an effortless winter snapshot',
    eraZh: '并肩同行 · 冬日留念',
    storyZh:
      '天冷的时候套上厚厚的羽绒服——一件米白配黑框眼镜与红壳手机，一件高领哑光黑手里捏着眼镜。不需要刻意摆拍，只是并肩站在一起按下快门，就是最铁的默契。',
    storyEn:
      'Bundled up in winter puffers — one cream with black-framed glasses and a red phone case, one matte-black holding glasses — an effortless side-by-side snapshot of genuine friendship.',
    unlockQuestionZh: '拍这张合照时，我当时在干嘛？',
    unlockQuestionEn: 'What was I doing when this photo was taken?',
    unlockPlaceholderZh: '输入 2 个字的活动...',
    unlockPlaceholderEn: 'Enter activity...',
    unlockAnswers: ['健身', '去健身', '锻炼', 'gym', 'workout'],
    photos: [
      {
        url: '/memories/p5-winter-bros.webp',
        captionZh: '健身日常 · 米白与黑羽绒服冬日合照',
        captionEn: 'Gym day · Winter duo snapshot in cream and black puffers',
      },
    ],
  },
  {
    id: 'hunau-campus',
    indexLabel: 'M06',
    zoneId: 'summit',
    islandCenter: { x: -16.8, y: 1.65, z: -31.8 },
    islandRadius: 9.4,
    pos: { x: -16.8, y: 1.65, z: -31.8 },
    rotY: 0.42,
    preferredTime: 16.5,
    categoryZh: '建筑记忆 · 大学母校',
    categoryEn: 'ARCHITECTURE · UNIVERSITY',
    titleZh: '湖南农业大学',
    titleEn: 'Hunan Agricultural University',
    subtitleZh: '红砖红瓦第一教学楼、巨幅校名墙、袁隆平铜像、金色稻田与红枫大道',
    subtitleEn: 'Heritage First Teaching Building, Yuan Longping statue, rice paddy & red maple boulevard',
    eraZh: '大学记忆 · 长沙',
    storyZh:
      '溯源 1903 年修业学堂，镌刻「朴诚、奋勉、求实、创新」校训。正门校名墙与校训石背后，中央绿茵大草坪上矗立着袁隆平院士手持稻穗的铜像与校内金色杂交水稻试验田；红枫大道环抱下，校徽原型「第一教学楼」中间四层、两侧三层的红砖红瓦身影巍然屹立，承载着在农大求学与写代码的青春岁月。',
    storyEn:
      'Founded in 1903 as Xiuye Academy under the motto "Simplicity, Diligence, Pragmatism, Innovation". Behind the monumental school name wall and motto stone lie the bronze statue of Academician Yuan Longping, a golden hybrid-rice experimental paddy field, blazing autumn red maples, and the iconic 1956 red-tile First Teaching Building.',
    unlockQuestionZh: '我在湖南农业大学是什么专业？',
    unlockQuestionEn: 'What is my major at Hunan Agricultural University?',
    unlockPlaceholderZh: '输入专业全称...',
    unlockPlaceholderEn: 'Enter major name...',
    unlockAnswers: ['计算机科学与技术', '计科', 'computer science and technology'],
    photos: [],
  },
];
