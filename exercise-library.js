const VERIFIED_EXERCISES = [
  {
    id: 'back-squat', name: '杠铃深蹲', short: '蹲', level: '需深蹲架',
    primary: ['股四头肌', '臀大肌'], secondary: ['内收肌群', '核心与竖脊肌（稳定）'],
    map: ['quads', 'glutes'],
    setup: '从肩宽附近站距开始，脚尖可轻微外展。杠稳定放在上背，双手略宽于肩；以肩、肘舒适和上背稳定为准。',
    force: '髋和膝同时屈曲，膝盖大致随脚尖方向移动；在可控深度折返，用全脚掌向下推地站起。',
    cue: '“肋骨别外翻，脚掌抓稳地面，膝盖跟着脚尖走。”',
    avoid: '不要为了追求深度而失去躯干控制；出现膝、髋或腰部锐痛时停止并换动作。',
    source: 'NSCA 基础力量训练技术手册',
    url: 'https://www.nsca.com/contentassets/de9aebfe7a7340b69217b99bb13862a7/basics_of_strength_and_conditioning_manual.pdf'
  },
  {
    id: 'barbell-bench-press', name: '杠铃卧推', short: '卧推', level: '需卧推架',
    primary: ['胸大肌'], secondary: ['肱三头肌', '前三角肌'], map: ['chest', 'triceps', 'frontShoulder'],
    setup: '眼睛在杠铃正下方附近，双脚稳踩地面。肩胛自然向后下方稳定，手腕尽量中立；握距从略宽于肩开始，再按肩部舒适度微调。',
    force: '控制杠铃下降到中下胸附近；上推时保持肩胛稳定，让杠铃回到起点。脚下稳定是提供全身张力，不是臀部离凳弹起。',
    cue: '“肩胛稳住，手腕叠在前臂上，推杠不是耸肩。”',
    avoid: '没有保护杠时不要接近力竭；肩前侧疼痛、手腕明显后折或臀部离凳时先减重并调整。',
    source: 'ACE 胸部训练研究与卧推动作说明',
    url: 'https://contentcdn.eacefitness.com/certifiednews/images/article/pdfs/ACE_BestChestExercises.pdf'
  },
  {
    id: 'conventional-deadlift', name: '传统硬拉', short: '硬拉', level: '需杠铃',
    primary: ['臀大肌', '股四头肌', '腘绳肌'], secondary: ['竖脊肌与背阔肌（稳定）', '前臂'], map: ['glutes', 'hamstrings', 'quads', 'back'],
    setup: '杠铃在脚中部上方，双脚髋宽到肩宽。屈髋屈膝靠近杠，双手在腿外侧握杠；先用双正握，混合握不是必须，使用时应交替手位。',
    force: '收紧躯干、让杠贴近身体；脚向地面发力，髋和膝一起伸展。顶端站直即可，不要后仰。下放时先髋后移，控制杠铃贴腿回落。',
    cue: '“把地面推开，腋下夹紧，杠别离开身体。”',
    avoid: '硬拉不是用腰把杠拽起。背部失去控制、杠远离腿或出现锐痛时停止该组。',
    source: 'ACE The Deadlift：setup、pull、lockout 教学',
    url: 'https://www.acefitness.org/continuing-education/certified/december-2024/8762/the-ace-do-it-better-series-the-deadlift/'
  },
  {
    id: 'romanian-deadlift', name: '罗马尼亚硬拉', short: 'RDL', level: '杠铃或哑铃',
    primary: ['腘绳肌', '臀大肌'], secondary: ['竖脊肌与核心（稳定）', '前臂'], map: ['hamstrings', 'glutes', 'back'],
    setup: '双脚约髋宽，杠铃或哑铃从大腿前侧起始。双手正握、约肩宽，手臂保持伸直。',
    force: '膝盖只保持轻微弯曲，重点是髋向后移；器械始终贴近腿，感到腿后侧拉伸且脊柱仍可控制时折返，臀部向前伸展站起。',
    cue: '“屁股往后找墙，器械贴腿，别把它变成深蹲。”',
    avoid: '不要为了下得更低而圆背；若下背先不适而腿后侧没有拉伸感，先减重或缩短幅度。',
    source: 'ACE 2025：Romanian Deadlift 动作教学',
    url: 'https://www.acefitness.org/continuing-education/certified/may-2025/8865/the-ace-do-it-better-series-the-romanian-deadlift/'
  },
  {
    id: 'lat-pulldown', name: '高位下拉', short: '下拉', level: '需高位下拉器',
    primary: ['背阔肌'], secondary: ['大圆肌', '肱二头肌', '中背部'], map: ['lats', 'biceps', 'midBack'],
    setup: '大腿固定在压腿垫下，躯干轻微后倾且胸部自然抬起。握距从略宽于肩开始；也可用中立把手，以肩部舒适和全程可控为先。',
    force: '将肘向身体两侧和下方带动，把把手拉向上胸附近；控制回程，让肩胛随手臂自然运动，不要全程强行夹紧或压低肩胛。',
    cue: '“肘往裤兜方向走，别用身体往后甩。”',
    avoid: '不要拉到颈后；若必须大幅后仰才能拉动，说明重量或动作选择不合适。',
    source: 'ACE 动作库：Seated Lat Pulldown',
    url: 'https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'
  },
  {
    id: 'seated-row', name: '坐姿划船', short: '划船', level: '拉力器或弹力带',
    primary: ['菱形肌', '中斜方肌'], secondary: ['背阔肌', '后束三角肌', '肱二头肌'], map: ['midBack', 'lats', 'rearShoulder', 'biceps'],
    setup: '坐稳，躯干保持直立稳定；优先使用中立握把或让手腕舒适的把手，起始位置有足够空间让手臂伸直。',
    force: '从肩胛后收开始，再让肘沿身体两侧向后拉，把把手带向下胸或上腹附近；停顿后受控还原，避免躯干前后甩动。',
    cue: '“胸口稳定，肘往后，肩别耸到耳朵。”',
    avoid: '不要用腰部后仰借力，也不要为了夹背把肩强行顶到不舒服的位置。',
    source: 'NSCA Personal Training Quarterly：Seated Row 技术说明',
    url: 'https://www.nsca.com/globalassets/education/ptq/ptq-4.3.pdf'
  },
  {
    id: 'dumbbell-chest-press', name: '哑铃卧推', short: '哑铃推', level: '哑铃与长凳',
    primary: ['胸大肌'], secondary: ['肱三头肌', '前三角肌'], map: ['chest', 'triceps', 'frontShoulder'],
    setup: '坐在长凳边后再躺下，头和上背都有支撑，双脚稳踩地面。哑铃从胸部两侧起始，手腕保持中立；可用掌心相对或略向前的自然握法。',
    force: '控制哑铃下降到上臂接近与躯干同一平面或肩部舒适范围，再沿稳定轨迹推回胸部上方。',
    cue: '“肩胛稳，手腕别折，左右同步推。”',
    avoid: '不要把哑铃下放到肩前侧疼痛的位置；起卧和收放哑铃时也要控制，必要时请人协助。',
    source: 'ACE Beginner Strength Training：Dumbbell Chest Press 教学',
    url: 'https://www.acefitness.org/resources/everyone/blog/3714/beginner-strength-training-workout/'
  },
  {
    id: 'goblet-squat', name: '高脚杯深蹲', short: '高脚杯蹲', level: '哑铃或壶铃',
    primary: ['股四头肌', '臀大肌'], secondary: ['内收肌群', '核心（稳定）'], map: ['quads', 'glutes'],
    setup: '将哑铃或壶铃贴近胸前，双手稳握。站距从肩宽附近开始，脚尖可轻微外展。',
    force: '髋和膝一起屈曲下蹲，膝盖随脚尖方向；保持器械靠近身体，在能控制的深度用全脚掌站起。',
    cue: '“重量贴胸，肋骨收住，脚掌稳。”',
    avoid: '不要把器械举离胸前来平衡，也不要忍着关节锐痛继续下蹲。',
    source: 'ACE Strength Training for Longevity：Goblet Squat 作为全身力量训练动作',
    url: 'https://www.acefitness.org/resources/pros/expert-articles/8882/strength-training-for-longevity/'
  }
];

VERIFIED_EXERCISES.push(...[
  {
    "id": "machine-chest-press",
    "name": "坐姿推胸机",
    "short": "固定器械水平推",
    "level": "坐姿推胸机",
    "primary": [
      "胸大肌"
    ],
    "secondary": [
      "肱三头肌",
      "前三角肌"
    ],
    "setup": "调节座椅，使把手大致与胸部中段同高，背部靠稳、脚掌着地。用拇指环握把手，手腕与前臂保持连贯；握距受机器把手限制，选肩部舒适的握位，不强求固定厘米数。",
    "force": "保持躯干稳定，将把手受控向前推，再缓慢还原。不要猛撞伸直终点，也不要让把手后退到肩前侧疼痛的位置。",
    "cue": "“背靠稳，手腕直，向前推而不是耸肩。”",
    "avoid": "先确认插销完全插入、座椅锁紧；不同机器轨迹不同，先用轻负荷试行程。机器固定轨迹不等于绝对安全。",
    "source": "NASM：Chest Press Machine",
    "url": "https://www.nasm.org/resource-center/exercise-library/chest-press-machine"
  },
  {
    "id": "leg-press",
    "name": "坐姿腿举机",
    "short": "固定器械下肢推",
    "level": "坐姿腿举机",
    "primary": [
      "股四头肌",
      "臀大肌"
    ],
    "secondary": [
      "内收肌群"
    ],
    "setup": "按机器铭牌调节座椅和行程，背部与骨盆靠稳。双脚完整踩在踏板上，从髋宽至肩宽附近试起，膝盖大致跟随脚尖方向；双手握侧边把手。",
    "force": "用整个脚掌推踏板，让髋膝受控伸展；缓慢回到能保持骨盆贴垫的深度，不用膝关节猛顶终点。",
    "cue": "“脚掌踩满，膝盖跟脚尖，屁股别卷离坐垫。”",
    "avoid": "图示为坐姿机，不是所有45度倒蹬机的解锁教程。若有安全挡位，使用前请工作人员演示；不要用手推膝盖帮助完成，别照抄图中的赤足外观。",
    "source": "NASM：Leg Press",
    "url": "https://www.nasm.org/resource-center/exercise-library/leg-press"
  },
  {
    "id": "seated-leg-curl",
    "name": "坐姿腿弯举机",
    "short": "屈膝 · 大腿后侧",
    "level": "坐姿腿弯举机",
    "primary": [
      "腘绳肌"
    ],
    "secondary": [
      "腓肠肌"
    ],
    "setup": "调节靠背使膝部与机器标示转轴对齐；上方压垫固定大腿，下方滚垫接触小腿后侧、脚跟上方。背部靠稳，双手握把。具体调节顺序以本机铭牌为准。",
    "force": "屈膝把脚跟向座椅下方带动，控制滚垫向下、向后移动；再缓慢伸膝还原。保持骨盆稳定，不借上身摆动。",
    "cue": "“大腿稳住，用腿后侧把滚垫卷回来。”",
    "avoid": "这是腿弯举，不是滚垫在小腿前侧的腿屈伸。膝后受挤压或关节疼痛时停止，重新检查座椅、转轴和滚垫位置。",
    "source": "NASM：Seated Leg Curl（肌群与运动方向；调节以机器说明为准）",
    "url": "https://www.nasm.org/resource-center/exercise-library/seated-leg-curl"
  }
]);
VERIFIED_EXERCISES.push(...[
  {
    "id": "pec-deck",
    "name": "蝴蝶机夹胸",
    "short": "胸部 · 器械飞鸟",
    "level": "蝴蝶机（手握式）",
    "primary": [
      "胸大肌"
    ],
    "secondary": [
      "前三角肌"
    ],
    "setup": "座椅调至把手与胸部中段大致同高，背靠垫、脚踩地；握稳把手，肘轻弯。肘垫式机器需按本机说明调整。",
    "force": "肘角大致固定，双臂向胸前合拢，再缓慢打开。不是反复屈伸肘的推胸。",
    "cue": "像合拢双臂抱住大桶，躯干不前扑。",
    "avoid": "不强拉到肩后、不撞配重；肩前侧疼痛时停止。",
    "source": "Fitness Institute：Pec Fly",
    "url": "https://fitnessinstitute.com.au/pec-fly-pin-loaded/"
  },
  {
    "id": "incline-dumbbell-press",
    "name": "上斜哑铃推胸",
    "short": "胸部 · 上斜推",
    "level": "哑铃与可调训练凳",
    "primary": [
      "胸大肌（含锁骨部）"
    ],
    "secondary": [
      "前三角肌",
      "肱三头肌"
    ],
    "setup": "锁紧上斜档位，头、上背与臀部有支撑，脚踩稳。拇指环握，腕与前臂连贯，肘在手腕下方。凳角按肩部耐受调整，不是越高越好。",
    "force": "同步控制哑铃降向上胸两侧，在肩部舒适范围折返，向上推回，不靠过度拱腰借力。",
    "cue": "手腕叠稳，左右同步，控制下放。",
    "avoid": "本卡为哑铃版本，不是上斜推胸机调节教程。取放重量也须控制，重哑铃请人保护。",
    "source": "ACE：Incline Chest Press",
    "url": "https://www.acefitness.org/resources/everyone/exercise-library/25/incline-chest-press/"
  },
  {
    "id": "face-pull",
    "name": "绳索面拉",
    "short": "肩后束与上背",
    "level": "拉力器与双头绳",
    "primary": [
      "后三角肌",
      "菱形肌"
    ],
    "secondary": [
      "中斜方肌",
      "肩袖肌群"
    ],
    "setup": "滑轮调至面部附近高度，双手各握绳的一端，退后使绳有张力并站稳。检查插销与扣锁。图为起始位置，不是终点。",
    "force": "屈肘向后带动，把绳拉向面部并分开两端，双手靠近脸两侧；到舒适范围停下，再受控伸臂还原。",
    "cue": "绳拉向脸，不是脸去追绳；轻重量、躯干稳。",
    "avoid": "不后仰猛拽、不强求固定肘角，绳不要碰眼睛；不是治疗圆肩或肩痛的处方。",
    "source": "NASM：Face Pull",
    "url": "https://www.nasm.org/resource-center/exercise-library/face-pull"
  },
  {
    "id": "dumbbell-curl",
    "name": "哑铃二头弯举",
    "short": "手臂 · 旋后握",
    "level": "哑铃",
    "primary": [
      "肱二头肌"
    ],
    "secondary": [
      "肱肌",
      "肱桡肌"
    ],
    "setup": "站稳，上臂放体侧，掌心朝前，全握哑铃；屈肘时掌心朝上，手腕平直。易晃动可改有靠背的坐姿。",
    "force": "屈肘把哑铃向肩前带动，再缓慢下放；上臂大致稳定，不用腰后仰甩起。",
    "cue": "弯的是肘，不是手腕。",
    "avoid": "肘腕疼痛时停止。插图为站姿；来源为坐姿，参考握法与屈肘控制，支撑条件不同。",
    "source": "ACE：Seated Biceps Curl（站姿改编）",
    "url": "https://www.acefitness.org/resources/everyone/exercise-library/44/seated-biceps-curl/"
  },
  {
    "id": "hammer-curl",
    "name": "哑铃垂式弯举",
    "short": "手臂 · 中立握",
    "level": "哑铃",
    "primary": [
      "肱肌",
      "肱桡肌",
      "肱二头肌"
    ],
    "secondary": [
      "前臂握力肌群"
    ],
    "setup": "掌心相对，哑铃在体侧，站稳、腕平直，上臂自然靠近躯干。",
    "force": "保持掌心相对屈肘抬起，再缓慢下放，可同步或交替；不扭腕变成普通弯举。",
    "cue": "像握锤子，肘别往前甩。",
    "avoid": "需要耸肩、后仰或甩动才能完成就减重；不宣称完全孤立某块肌肉。",
    "source": "ACE：Hammer Curl",
    "url": "https://www.acefitness.org/resources/everyone/exercise-library/10/hammer-curl/"
  },
  {
    "id": "lateral-raise",
    "name": "哑铃侧平举",
    "short": "肩部 · 侧向抬举",
    "level": "哑铃",
    "primary": [
      "三角肌中束"
    ],
    "secondary": [
      "冈上肌",
      "肩胛旋转相关肌群"
    ],
    "setup": "轻哑铃置于体侧，站稳，肘稍弯、腕平直，头颈自然。双臂可略在身体侧前方。",
    "force": "向两侧受控抬起，到肩部舒适高度，通常不必超过肩高，再缓慢下降。",
    "cue": "向两侧展开，不做小拇指朝上的倒水动作。",
    "avoid": "不甩腰起重量、不全程强锁肩胛；夹挤感或锐痛时停止。",
    "source": "ACE：Lateral Raise",
    "url": "https://www.acefitness.org/resources/everyone/exercise-library/26/lateral-raise/"
  },
  {
    "id": "seated-dumbbell-shoulder-press",
    "name": "坐姿哑铃推肩",
    "short": "肩部 · 垂直推",
    "level": "哑铃与靠背凳",
    "primary": [
      "前三角肌",
      "三角肌中束"
    ],
    "secondary": [
      "肱三头肌"
    ],
    "setup": "锁紧靠背，臀背靠稳、脚踩地。哑铃在肩附近，拇指环握，前臂大致竖直，肘可略在躯干前方。",
    "force": "躯干稳定，哑铃向上推，再控制降到舒适位置；让肩胛随抬臂自然运动，不靠腰后仰换幅度。",
    "cue": "向上推，肋骨别翻起。",
    "avoid": "过头活动疼痛或需过度拱腰才能完成时停止并调整；重哑铃起落请人协助。",
    "source": "ACE：Seated Overhead Press（支撑与运动控制参考）",
    "url": "https://www.acefitness.org/resources/everyone/exercise-library/45/seated-overhead-press/"
  },
  {
    "id": "reverse-pec-deck",
    "name": "蝴蝶机反向飞鸟",
    "short": "肩后束与上背",
    "level": "支持反向模式的蝴蝶机",
    "primary": [
      "后三角肌"
    ],
    "secondary": [
      "菱形肌",
      "中斜方肌"
    ],
    "setup": "确认机器支持反向模式，按铭牌设置档位。面向靠垫坐，胸有支撑，把手接近肩高，握稳、肘轻弯。",
    "force": "胸保持靠垫，以肩带动双臂向两侧打开，再缓慢还原；肘角大致固定，避免做成划船。",
    "cue": "手臂向外展开，胸别离垫。",
    "avoid": "不强拉到身后、不耸肩甩动；把手形状不同，掌心方向可不同，以舒适握位为先。",
    "source": "Fitness Institute：Rear Delt",
    "url": "https://fitnessinstitute.com.au/rear-delt-pin-loaded/"
  }
]);
const EXERCISE_BY_ID = Object.fromEntries(VERIFIED_EXERCISES.map(exercise => [exercise.id, exercise]));
