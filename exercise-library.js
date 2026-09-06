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
    source: 'NSCA 运动技术手册',
    url: 'https://www1.rockpeaks.com/default.aspx/scholarship/597/528/aK0JRF/nsca__exercise_technique_manual.pdf'
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
    source: 'ACE Total-body Barbell Workout：Straight Leg Deadlift 要点',
    url: 'https://www.acefitness.org/resources/pros/expert-articles/3802/ace-total-body-barbell-workout/'
  },
  {
    id: 'lat-pulldown', name: '高位下拉', short: '下拉', level: '需高位下拉器',
    primary: ['背阔肌'], secondary: ['大圆肌', '肱二头肌', '中背部'], map: ['lats', 'biceps', 'midBack'],
    setup: '大腿固定在压腿垫下，躯干轻微后倾且胸部自然抬起。握距从略宽于肩开始；也可用中立把手，以肩部舒适和全程可控为先。',
    force: '先让肩胛向下稳定，再将肘向身体两侧和下方带动，把把手拉向上胸附近；控制回程，手臂伸直前不要耸肩。',
    cue: '“肘往裤兜方向走，别用身体往后甩。”',
    avoid: '不要拉到颈后；若必须大幅后仰才能拉动，说明重量或动作选择不合适。',
    source: 'ACE Beginner Strength Training：Lat Pull-down 教学',
    url: 'https://www.acefitness.org/resources/everyone/blog/3714/beginner-strength-training-workout/'
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

const EXERCISE_BY_ID = Object.fromEntries(VERIFIED_EXERCISES.map(exercise => [exercise.id, exercise]));
