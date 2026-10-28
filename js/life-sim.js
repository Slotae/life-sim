const countryProfiles = window.LIFE_SIM_COUNTRIES;
const cityAlias = {
  THA: "กรุงเทพฯ",
  JPN: "โตเกียว",
  IND: "มุมไบ",
  IDN: "จาการ์ตา",
  KOR: "โซล",
  PHL: "มะนิลา",
  SGP: "สิงคโปร์",
  GBR: "ลอนดอน",
  DEU: "เบอร์ลิน",
  FRA: "ปารีส",
  TUR: "อิสตันบูล",
  KEN: "ไนโรบี",
  NGA: "ลากอส",
  ZAF: "เคปทาวน์",
  CAN: "โตรอนโต",
  USA: "นิวยอร์ก",
  MEX: "เม็กซิโกซิตี",
  BRA: "รีโอเดจาเนโร",
  ARG: "บัวโนสไอเรส",
  AUS: "ซิดนีย์",
  NZL: "โอ๊คแลนด์",
  ARE: "ดูไบ",
};
const places = countryProfiles
  .filter((c) => c.region && c.iso)
  .map((c) => ({
    city: cityAlias[c.iso] || c.capital || c.name,
    country: c.name,
    iso: c.iso,
    region: c.region,
    incomeLevel: c.incomeLevel,
    profile: c,
    birthWeight:
      (c.indicators.population?.value || 1) *
      (c.indicators.birthRate?.value || 15),
  }));
let speed = 0.3,
  paused = false,
  age = 18,
  elapsed = 0,
  simulationMinutes = 420,
  last = performance.now(),
  origin,
  current,
  home,
  visited = [],
  eventIndex = 0,
  activeEvent = null,
  stats,
  lifeLog = [];
let abilities = null;
let characterLook = null;
function pick(exclude = []) {
  let pool = places.filter((p) => !exclude.includes(p.city));
  return pool[Math.floor(Math.random() * pool.length)];
}
function pickFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}
// The calendar contains only turning points; quiet years are simulated in the background.
function ageEventData() {
  const studyCity = pick([home.city]);
  const workCity = pick([home.city, studyCity.city]);
  const travelCity = pick([home.city, studyCity.city, workCity.city]);
  const nextCity = pick([
    home.city,
    studyCity.city,
    workCity.city,
    travelCity.city,
  ]);

  return [
    {
      age: 18,
      icon: "🎓",
      title: "ก้าวแรกหลังจบมัธยม",
      desc: "ผลการเรียน เงินที่บ้านมี และโอกาสที่หาได้ จะกำหนดต้นทุนของทางเลือกแรก",
      options: [
        {
          label: "สมัครเรียนต่อต่างประเทศ",
          sub:
            studyCity.city +
            " · " +
            studyCity.country +
            " · ต้องวางแผนทุนและวีซ่า",
          action: "move",
          dest: studyCity,
          application: {
            kind: "study",
            threshold: 68,
            subject: "สอบชิงทุนต่างประเทศ",
          },
          delta: [0, 5, 11, -2, -9],
          log: "ย้ายไปเริ่มเรียนที่ " + studyCity.city,
        },
        {
          label: "เรียนต่อใกล้บ้าน",
          sub: "ค่าใช้จ่ายต่ำกว่า · ครอบครัวยังช่วยได้",
          action: "stay",
          application: {
            kind: "study",
            threshold: 50,
            subject: "สอบเข้ามหาวิทยาลัยในประเทศ",
          },
          delta: [1, 3, 7, 3, -3],
          log: "เลือกเรียนต่อใกล้บ้าน",
        },
        {
          label: "ทำงานก่อน",
          sub: "มีรายได้เร็ว · อาจกลับไปเรียนทีหลัง",
          action: "work",
          application: {
            kind: "job",
            threshold: 42,
            subject: "สมัครงานเริ่มต้น",
          },
          delta: [-1, 0, 1, 2, 9],
          log: "เริ่มทำงานและเก็บประสบการณ์",
        },
      ],
    },
    {
      age: 21,
      icon: "📚",
      title: "ค่าใช้จ่ายเริ่มตึงมือ",
      desc: "ใกล้จบช่วงเรียน เงินสำรองเริ่มลดลง และคุณต้องตัดสินใจว่าจะรักษาเวลาเรียนหรือรีบหารายได้",
      options: [
        {
          label: "หางานฝึกงานตรงสาย",
          sub: "รายได้ยังน้อย แต่ได้ประสบการณ์",
          action: "internship",
          application: {
            kind: "job",
            threshold: 46,
            subject: "คัดเลือกนักศึกษาฝึกงาน",
          },
          delta: [-1, -1, 5, 1, 3],
          log: "รับงานฝึกงานเพื่อเก็บประสบการณ์",
        },
        {
          label: "ย้ายไปหลักสูตรที่จ่ายไหว",
          sub: "เรียนต่อโดยลดหนี้ก้อนใหม่",
          action: "transfer",
          application: {
            kind: "study",
            threshold: 48,
            subject: "สอบย้ายหลักสูตร",
          },
          delta: [0, 0, 3, 2, 4],
          log: "ย้ายไปเรียนหลักสูตรที่ค่าใช้จ่ายเหมาะกับฐานะ",
        },
        {
          label: "พักเรียนไปทำงานเต็มเวลา",
          sub: "ช่วยค่าใช้จ่ายที่บ้าน · วุฒิช้าลง",
          action: "work",
          delta: [-2, -1, -2, 5, 12],
          log: "พักเรียนเพื่อทำงานและช่วยค่าใช้จ่ายครอบครัว",
        },
      ],
    },
    {
      age: 24,
      icon: "💼",
      title: "ข้อเสนองานแรก",
      desc: "มีข้อเสนอจากเมืองใหม่ รายได้สูงขึ้น แต่ยังต้องคิดเรื่องค่าเช่า วีซ่า ชั่วโมงทำงาน และคนที่ต้องทิ้งไว้ข้างหลัง",
      options: [
        {
          label: "ย้ายไปรับงานที่ " + workCity.city,
          sub: workCity.country + " · ค่าเริ่มต้นและการย้ายสูง",
          action: "move",
          application: {
            kind: "job",
            threshold: 58,
            subject: "สัมภาษณ์งานต่างเมือง",
          },
          dest: workCity,
          delta: [-1, 1, 4, -3, 12],
          log: "ย้ายไปเริ่มงานที่ " + workCity.city,
        },
        {
          label: "เริ่มงานใกล้บ้าน",
          sub: "รายได้น้อยกว่า · มีเครือข่ายช่วยเหลือ",
          action: "stay",
          application: {
            kind: "job",
            threshold: 43,
            subject: "สัมภาษณ์งานใกล้บ้าน",
          },
          delta: [1, 2, 2, 5, 6],
          log: "เริ่มงานใกล้บ้านและรักษาความสัมพันธ์กับครอบครัว",
        },
        {
          label: "รับงานอิสระระหว่างเดินทาง",
          sub: travelCity.city + " · รายได้ไม่แน่นอน",
          action: "travel",
          application: {
            kind: "portfolio",
            threshold: 52,
            subject: "คัดเลือกผลงานฟรีแลนซ์",
          },
          dest: travelCity,
          delta: [-1, 8, 2, 0, -7],
          log: "รับงานอิสระและเดินทางไป " + travelCity.city,
        },
      ],
    },
    {
      age: 27,
      icon: "🧭",
      title: "งานที่ทำอยู่ยังพาไปต่อไหม",
      desc: "เริ่มรู้แล้วว่าชอบงานแบบไหน แต่การเปลี่ยนสายต้องแลกกับเงิน เวลา หรือความมั่นคง",
      options: [
        {
          label: "เรียนต่อเฉพาะทาง",
          sub: "ใช้เงินเก็บและเวลาหลังเลิกงาน",
          action: "specialize",
          delta: [-2, -1, 10, -1, -7],
          log: "เรียนต่อเฉพาะทางเพื่อเพิ่มโอกาสในอาชีพ",
        },
        {
          label: "ต่อรองงานและเงินเดือน",
          sub: "รับผิดชอบมากขึ้น · เสี่ยงเครียด",
          action: "promotion",
          delta: [-3, 1, 2, 0, 11],
          log: "รับบทบาทเพิ่มและต่อรองค่าตอบแทน",
        },
        {
          label: "เปลี่ยนสายงาน",
          sub: "เริ่มนับประสบการณ์ใหม่บางส่วน",
          action: "career-change",
          delta: [0, 4, 5, 1, -5],
          log: "เริ่มต้นเส้นทางอาชีพใหม่",
        },
      ],
    },
    {
      age: 29,
      icon: "✈️",
      title: "มีเวลาและเงินเก็บให้เลือกใช้",
      desc: "หลังทำงานมาหลายปี คุณได้วันหยุดยาว จะใช้เงินเก็บกับประสบการณ์หรือสร้างฐานะต่อดี",
      options: [
        {
          label: "เดินทางหลายเมือง",
          sub: travelCity.city + " · ใช้เงินก้อนแต่ได้ประสบการณ์",
          action: "travel",
          dest: travelCity,
          delta: [2, 10, 3, 2, -10],
          log: "ใช้เวลาหนึ่งปีเดินทางไป " + travelCity.city,
        },
        {
          label: "ย้ายไปเมืองที่อยากอยู่",
          sub: nextCity.city + " · " + nextCity.country,
          action: "move",
          dest: nextCity,
          delta: [-2, 5, 4, -2, -7],
          log: "ย้ายไปเริ่มต้นใหม่ที่ " + nextCity.city,
        },
        {
          label: "อยู่สร้างเงินสำรอง",
          sub: "ลดความเสี่ยงก่อนภาระเพิ่ม",
          action: "save",
          delta: [0, -1, 2, 2, 12],
          log: "เลือกเก็บเงินสำรองและสร้างความมั่นคง",
        },
      ],
    },
    {
      age: 32,
      icon: "♡",
      title: "ความสัมพันธ์ต้องการเวลา",
      desc: "ความสัมพันธ์ใกล้ชิดขึ้นหรือชีวิตยังเดินคนเดียวก็ได้ แต่ทุกทางต้องแบ่งเวลาและทรัพยากรให้สิ่งสำคัญ",
      options: [
        {
          label: "สร้างบ้านร่วมกับคนรัก",
          sub: "ค่าใช้จ่ายเพิ่ม · มีคนแบ่งภาระ",
          action: "family",
          delta: [0, 5, 0, 11, -8],
          log: "เริ่มสร้างครอบครัวร่วมกับคนรัก",
        },
        {
          label: "ใช้ชีวิตอิสระต่อ",
          sub: "เก็บเงินและเลือกจังหวะของตัวเอง",
          action: "stay",
          delta: [1, 3, 3, 2, 4],
          log: "เลือกใช้ชีวิตอิสระและรักษาความสัมพันธ์ที่มี",
        },
        {
          label: "ช่วยดูแลผู้ใหญ่ในบ้าน",
          sub: "ใช้เวลาเพิ่ม · ลดเวลาทำงานได้ยาก",
          action: "care",
          delta: [-2, 2, 0, 9, -8],
          log: "รับผิดชอบดูแลผู้ใหญ่ในครอบครัว",
        },
      ],
    },
    {
      age: 36,
      icon: "🏠",
      title: "บ้านสองหลังอยู่ไกลกัน",
      desc: "งานและคนในครอบครัวอยู่คนละเมือง จะย้ายกลับไป ดูแลจากระยะไกล หรือชวนทุกคนเริ่มต้นที่ใหม่",
      options: [
        {
          label: "กลับไปอยู่ใกล้บ้าน",
          sub: origin.city + " · " + origin.country,
          action: "return",
          dest: origin,
          delta: [2, 3, 1, 12, -5],
          log: "กลับมาอยู่ใกล้ครอบครัวที่ " + origin.city,
        },
        {
          label: "ย้ายครอบครัวมาอยู่ด้วย",
          sub: "ค่าเช่าและภาระดูแลสูงขึ้น",
          action: "stay",
          delta: [-1, 5, 2, 8, -9],
          log: "พาครอบครัวมาเริ่มต้นชีวิตในเมืองที่อยู่",
        },
        {
          label: "ช่วยเหลือจากระยะไกล",
          sub: "รักษางานเดิม แต่เดินทางกลับบ่อย",
          action: "stay",
          delta: [-2, -1, 3, 3, 5],
          log: "ทำงานต่อและช่วยเหลือครอบครัวจากระยะไกล",
        },
      ],
    },
    {
      age: 40,
      icon: "🔑",
      title: "จะซื้อบ้านหรือรักษาความคล่องตัว",
      desc: "เงินเก็บพอวางเงินดาวน์ได้ แต่การผ่อนระยะยาวจะลดเงินสำรองและทำให้ย้ายเมืองยากขึ้น",
      options: [
        {
          label: "ซื้อบ้านหลังแรก",
          sub: "มีทรัพย์สิน · รับภาระหนี้ระยะยาว",
          action: "buy-home",
          delta: [-1, 3, 1, 2, -5],
          log: "ซื้อบ้านหลังแรกและเริ่มผ่อนระยะยาว",
        },
        {
          label: "เช่าต่อและลงทุนกับงาน",
          sub: "ย้ายง่ายกว่า · ยังไม่มีบ้านเป็นของตัวเอง",
          action: "rent",
          delta: [0, 1, 5, 1, 5],
          log: "เช่าต่อและรักษาเงินสำรองให้คล่องตัว",
        },
        {
          label: "ย้ายไปเมืองที่ค่าครองชีพต่ำกว่า",
          sub: nextCity.city + " · " + nextCity.country,
          action: "move",
          dest: nextCity,
          delta: [1, 2, 1, -2, 4],
          log: "ย้ายไปเมืองที่มีค่าครองชีพเหมาะกว่า " + nextCity.city,
        },
      ],
    },
    {
      age: 45,
      icon: "🩺",
      title: "ร่างกายขอให้ชะลอลง",
      desc: "ชั่วโมงทำงานและความเครียดสะสมเริ่มส่งผล คุณเลือกได้ว่าจะรักษารายได้หรือคืนเวลาให้สุขภาพ",
      options: [
        {
          label: "ลดเวลางานและตรวจสุขภาพ",
          sub: "รายได้ลดลง · มีเวลาฟื้นตัว",
          action: "health-break",
          delta: [13, 4, 0, 2, -8],
          log: "ลดงานเพื่อดูแลสุขภาพและตรวจร่างกาย",
        },
        {
          label: "รับตำแหน่งบริหาร",
          sub: "รายได้สูงขึ้น · ชั่วโมงงานเพิ่ม",
          action: "promotion",
          delta: [-6, -2, 4, -2, 14],
          log: "รับตำแหน่งบริหารที่ " + nextCity.city,
        },
        {
          label: "เริ่มกิจการขนาดเล็ก",
          sub: "อิสระขึ้น · รายได้ช่วงแรกไม่แน่นอน",
          action: "business",
          delta: [-2, 8, 3, 1, -5],
          log: "เริ่มกิจการขนาดเล็กจากสิ่งที่ถนัด",
        },
      ],
    },
    {
      age: 50,
      icon: "🤝",
      title: "คนในบ้านเริ่มต้องการความช่วยเหลือ",
      desc: "ค่าเรียนของลูกหลานหรือค่าดูแลผู้ใหญ่เริ่มกระทบงบประมาณ คุณต้องเลือกว่าจะกันเงินและเวลาไว้ตรงไหน",
      options: [
        {
          label: "ช่วยค่าเรียนลูกหลานหรือญาติ",
          sub: "โอกาสของคนรุ่นต่อไป · เงินเก็บลด",
          action: "children",
          delta: [-1, 4, 5, 7, -8],
          log: "กันเงินไว้สนับสนุนการเรียนและอนาคตของลูก",
        },
        {
          label: "วางแผนดูแลผู้ใหญ่",
          sub: "ปรับบ้านและแบ่งเวรกับญาติ",
          action: "care-plan",
          delta: [1, 1, 0, 9, -5],
          log: "วางแผนดูแลผู้ใหญ่ร่วมกับครอบครัว",
        },
        {
          label: "ลดงานเพื่ออยู่กับครอบครัว",
          sub: "รายได้ลด แต่ภาระดูแลแบ่งกันได้",
          action: "family-time",
          delta: [2, 5, 0, 9, -7],
          log: "ลดชั่วโมงทำงานเพื่อแบ่งเวลาดูแลครอบครัว",
        },
      ],
    },
    {
      age: 56,
      icon: "🌍",
      title: "วางแผนชีวิตช่วงหลังทำงาน",
      desc: "เงินเกษียณ สุขภาพ และคนที่อยากอยู่ใกล้ เริ่มมีน้ำหนักพอๆ กับตำแหน่งงาน",
      options: [
        {
          label: "ย้ายไปเมืองใหม่",
          sub: nextCity.city + " · " + nextCity.country,
          action: "move",
          dest: nextCity,
          delta: [0, 6, 2, -2, -5],
          log: "ย้ายไปเริ่มบทใหม่ที่ " + nextCity.city,
        },
        {
          label: "กลับไปอยู่บ้านเกิด",
          sub: origin.city + " · " + origin.country,
          action: "return",
          dest: origin,
          delta: [3, 5, 0, 8, -3],
          log: "กลับบ้านเกิดเพื่ออยู่ใกล้ครอบครัว",
        },
        {
          label: "ทำงานต่ออีกระยะ",
          sub: "เพิ่มเงินเกษียณ · ลดเวลาพัก",
          action: "stay",
          delta: [-2, 1, 3, 0, 10],
          log: "ทำงานต่อเพื่อเพิ่มเงินสำรองก่อนเกษียณ",
        },
      ],
    },
    {
      age: 60,
      icon: "🕰️",
      title: "ถึงเวลาปรับจังหวะชีวิต",
      desc: "เงินออมยังไม่เท่ากับรายได้เดิม และสุขภาพกับภาระครอบครัวทำให้แผนเกษียณของแต่ละคนไม่เหมือนกัน",
      options: [
        {
          label: "ทำงานพาร์ตไทม์ต่อ",
          sub: "มีรายได้ · ยังมีเวลาว่าง",
          action: "part-time",
          delta: [1, 4, 2, 2, 5],
          log: "ลดชั่วโมงทำงานและรักษารายได้บางส่วน",
        },
        {
          label: "เกษียณและใช้เงินออม",
          sub: "ได้เวลาเพิ่ม · ต้องคุมค่าใช้จ่าย",
          action: "retire",
          delta: [1, 5, 1, 3, -3],
          log: "เกษียณและเริ่มใช้เงินออมอย่างระมัดระวัง",
        },
        {
          label: "ย้ายไปอยู่ใกล้ลูกหลาน",
          sub: "มีคนช่วยได้ · ต้องเริ่มสร้างชุมชนใหม่",
          action: "return",
          dest: home,
          delta: [2, 4, 0, 8, -4],
          log: "ย้ายกลับไปอยู่ใกล้บ้านและคนในครอบครัว",
        },
      ],
    },
    {
      age: 67,
      icon: "🌅",
      title: "เวลาเป็นของตัวเองมากขึ้น",
      desc: "ชีวิตประจำวันเปลี่ยนไปเมื่อหยุดทำงานเต็มเวลา คุณจะใช้เวลา ความรู้ และความสัมพันธ์ที่เหลืออย่างไร",
      options: [
        {
          label: "ใช้เวลากับคนสำคัญ",
          sub: "รักษาความสัมพันธ์ใกล้ตัว",
          action: "stay",
          delta: [3, 9, 0, 12, -2],
          log: "ใช้เวลากับคนสำคัญและครอบครัว",
        },
        {
          label: "สอนและแบ่งปันประสบการณ์",
          sub: "งานอาสา · สร้างชุมชนรอบตัว",
          action: "volunteer",
          delta: [1, 6, 9, 5, 2],
          log: "แบ่งปันประสบการณ์ให้คนรุ่นต่อไป",
        },
        {
          label: "เดินทางอีกครั้ง",
          sub: travelCity.city + " · เผื่อค่าเดินทางและสุขภาพ",
          action: "travel",
          dest: travelCity,
          delta: [0, 9, 2, 2, -6],
          log: "เดินทางไป " + travelCity.city + " อีกครั้ง",
        },
      ],
    },
    {
      age: 72,
      icon: "🪴",
      title: "บ้านแบบไหนจะอยู่สบายในระยะยาว",
      desc: "การเดินทาง สุขภาพ และเครือข่ายช่วยเหลือสำคัญขึ้น คุณวางแผนเรื่องที่อยู่อาศัยไว้ได้",
      options: [
        {
          label: "ปรับบ้านให้อยู่เองสะดวก",
          sub: "ใช้เงินกับความปลอดภัยและการเดินทาง",
          action: "adapt-home",
          delta: [4, 3, 0, 1, -5],
          log: "ปรับบ้านให้ปลอดภัยและอยู่ได้สะดวกขึ้น",
        },
        {
          label: "ย้ายไปอยู่ใกล้คนที่ช่วยได้",
          sub: "มีคนดูแล · ต้องปรับตัวกับบ้านใหม่",
          action: "return",
          dest: home,
          delta: [2, 4, 0, 10, -3],
          log: "ย้ายไปอยู่ใกล้ครอบครัวและเครือข่ายช่วยเหลือ",
        },
        {
          label: "เข้าร่วมชุมชนในละแวกบ้าน",
          sub: "รักษาความสัมพันธ์และกิจวัตร",
          action: "community",
          delta: [1, 7, 2, 8, -1],
          log: "สร้างกิจวัตรและความสัมพันธ์ในชุมชนใกล้บ้าน",
        },
      ],
    },
  ];
}
let events = [];

function setStats() {
  for (const k of ["health", "happy", "know", "rel", "wealth"]) {
    let v = Math.max(4, Math.min(98, Math.round(stats[k])));
    document.getElementById(k).textContent = v;
    document.getElementById(k + "Bar").style.width = v + "%";
  }
  renderAbilities();
}

function renderAbilities() {
  const rack = document.getElementById("abilityRack");
  if (!rack || !abilities) return;
  const rows = [
    ["📚 วิชาการ", abilities.study, "#91cbe0"],
    ["🌐 ภาษา", abilities.language, "#b49be7"],
    ["🛠 ทักษะงาน", abilities.practice, "#95d7b1"],
    ["🗣 สัมภาษณ์", abilities.interview, "#f5c676"],
  ];
  rack.innerHTML = rows
    .map(
      ([label, value, tone]) =>
        `<div class="ability" style="--tone:${tone}"><span>${label}</span><b>${Math.round(value)}</b><i><u style="width:${clamp(value, 0, 100)}%"></u></i></div>`,
    )
    .join("");
}

function applicationScore(application) {
  return application.kind === "study"
    ? abilities.study * 0.55 + abilities.language * 0.2 + stats.know * 0.25
    : application.kind === "job"
      ? abilities.practice * 0.45 +
        abilities.interview * 0.4 +
        stats.health * 0.15
      : abilities.practice * 0.55 +
        abilities.interview * 0.25 +
        stats.know * 0.2;
}

function scheduledActivity() {
  const hour = Math.floor((simulationMinutes % 1440) / 60);
  const student =
    workLife?.job.includes("นักศึกษา") || workLife?.job === "นักเรียน";
  const working = workLife?.hours > 0 && !workLife?.job.includes("เกษียณ");
  if (hour < 6 || hour >= 23)
    return { name: "พักผ่อนและนอนหลับ", kind: "rest" };
  if (hour < 8) return { name: "ตื่นนอน · เตรียมตัวออกจากบ้าน", kind: "home" };
  if (hour < 9)
    return {
      name: student ? "เดินทางไปโรงเรียน" : "เดินทางไปทำงาน",
      kind: "commute",
    };
  if (hour < 12)
    return student
      ? { name: "เรียนและทบทวนบทเรียน", kind: "study" }
      : working
        ? { name: "ทำงานช่วงเช้า", kind: "work" }
        : { name: "หางานและส่งใบสมัคร", kind: "study" };
  if (hour < 13) return { name: "พักกลางวัน · ซื้ออาหาร", kind: "lunch" };
  if (hour < 17)
    return student
      ? { name: "เรียนช่วงบ่าย", kind: "study" }
      : working
        ? { name: "ทำงานช่วงบ่าย", kind: "work" }
        : { name: "ฝึกทักษะระหว่างหางาน", kind: "study" };
  if (hour < 18) return { name: "เดินทางกลับบ้าน", kind: "commute" };
  if (hour < 20) return { name: "เตรียมอาหารและกินข้าว", kind: "cook" };
  if (hour < 22)
    return student
      ? { name: "อ่านหนังสือหลังเลิกเรียน", kind: "study" }
      : { name: "พักกับคนในครอบครัว", kind: "family" };
  return { name: "ผ่อนคลายก่อนเข้านอน", kind: "rest" };
}

document.querySelectorAll(".speed").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll(".speed")
        .forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      speed = Number(b.dataset.speed);
    }),
);
document.getElementById("pause").onclick = () => {
  if (activeEvent) return;
  paused = !paused;
  document.getElementById("pause").textContent = paused
    ? "▶ เล่นต่อ"
    : "Ⅱ หยุด";
};
let finances = null,
  familyLife = null,
  workLife = null,
  healthLife = null,
  socialLife = null,
  detailTab = "money",
  factorAge = 18,
  actionCycle = -1;
function fmtPPP(n) {
  return "Intl$ " + Math.max(0, Math.round(n)).toLocaleString("en-US");
}
function showSystem(tab, button) {
  detailTab = tab;
  document
    .querySelectorAll(".sysTab")
    .forEach((x) => x.classList.remove("active"));
  if (button) button.classList.add("active");
  renderSystems();
}
function updateActivityLabel(force) {
  const a = scheduledActivity();
  const activityIcons = {
    rest: "🌙",
    home: "🌅",
    commute: "🚌",
    study: "📚",
    lunch: "🍱",
    work: "💼",
    cook: "🍳",
    family: "🏠",
  };
  const n = `${Math.floor(simulationMinutes / 30)}-${current?.city}`;
  if (n === actionCycle && !force) return;
  actionCycle = n;
  document.getElementById("activityName").textContent =
    `${activityIcons[a.kind] || "✨"} ${a.name}`;
  document.getElementById("activityPlace").textContent =
    current.city + " · " + current.country;
  const days = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัส",
    "ศุกร์",
    "เสาร์",
  ];
  const day = Math.floor(simulationMinutes / 1440) % 7;
  const time = Math.floor(simulationMinutes % 1440);
  const clock = `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;
  document.getElementById("activityClock").textContent =
    `วัน${days[day]} · ${clock}`;
}
function updatePlace() {
  if (!origin || !current) return;
  document.getElementById("activityPlace").textContent =
    current.city + " · " + current.country;
  document.getElementById("originLabel").textContent =
    "เกิดที่ " +
    origin.city +
    " (" +
    origin.country +
    ")  →  ตอนนี้ " +
    current.city +
    " (" +
    current.country +
    ")  ·  " +
    visited.length +
    " จุดสำคัญ";
  document.getElementById("journey").innerHTML = visited
    .map(
      (v, i) =>
        '<span class="stop">' +
        (i === 0 ? "เริ่ม" : "→") +
        " " +
        v.city +
        " · " +
        v.country +
        "</span>",
    )
    .join("");
}
function renderJournal() {
  const journal = document.getElementById("lifeJournal");
  if (!journal) return;
  const recentEvents = lifeLog.slice(-3).reverse();
  journal.innerHTML = recentEvents.length
    ? recentEvents
        .map(
          (entry) =>
            `<div class="journalEntry"><span>อายุ ${entry.age}</span><b>${escapeHtml(entry.text)}</b></div>`,
        )
        .join("")
    : '<div class="journalEmpty">การเลือกสำคัญจะเก็บไว้ที่นี่</div>';
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

const iconPaths = {
  money:
    '<circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-.7-1.7-1-3-1-1.5 0-2.6.8-2.6 1.9 0 3 5.2 1.2 5.2 4.2 0 1.2-1.1 2-2.8 2-1.2 0-2.3-.4-3.1-1.1M12 5.5v13"/>',
  family:
    '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.3-3 2.2-4.7 5.5-4.7 1.3 0 2.4.3 3.2.9M16.5 7.5a2.6 2.6 0 1 1 0 5.2M15.1 15c3.2-.3 5.1 1.1 5.4 4"/>',
  work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  health:
    '<path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/><path d="M6 12h3l1.4-2.5 2.2 5L14 12h4"/>',
  world:
    '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M4 15h16M12 3c2.7 2.5 4 5.5 4 9s-1.3 6.5-4 9c-2.7-2.5-4-5.5-4-9s1.3-6.5 4-9Z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22V4.5Z"/><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 6h8M8 9h7"/>',
  plane: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"/>',
  spark:
    '<path d="m12 2 1.6 6.4L20 11l-6.4 1.6L12 19l-1.6-6.4L4 11l6.4-2.6L12 2Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};
function eventIconKey(age) {
  const icons = {
    18: "book",
    21: "book",
    24: "work",
    27: "work",
    29: "plane",
    32: "family",
    36: "home",
    40: "home",
    45: "health",
    50: "family",
    56: "world",
    60: "sun",
    67: "sun",
    72: "home",
  };
  return icons[age] || "spark";
}

function uiIcon(k) {
  return (
    '<svg class="uiIcon" viewBox="0 0 24 24" aria-hidden="true">' +
    (iconPaths[k] || iconPaths.spark) +
    "</svg>"
  );
}
function indicator(place, key) {
  return place?.profile?.indicators?.[key] || null;
}
function metric(place, key, digits = 1) {
  const d = indicator(place, key);
  return d
    ? Number(d.value).toLocaleString("en-US", { maximumFractionDigits: digits })
    : "—";
}
function metricYear(place, key) {
  return indicator(place, key)?.year || "ไม่มีข้อมูล";
}
function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}
function normal() {
  let u = Math.random() || 0.0001,
    v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function giniSigma(g) {
  let x = clamp(g / 100, 0.02, 0.75),
    a = 0.147,
    l = Math.log(1 - x * x),
    q = 2 / (Math.PI * a) + l / 2;
  return 2 * Math.sqrt(Math.sqrt(q * q - l / a) - q);
}
function tierOf(country) {
  let p = places.find((x) => x.country === country);
  let l = p?.profile?.incomeLevel || "Not classified";
  return l === "High income"
    ? "high"
    : l === "Upper middle income"
      ? "upper"
      : l === "Lower middle income"
        ? "lower"
        : l === "Low income"
          ? "low"
          : "middle";
}
function sourceYear(p, k) {
  return indicator(p, k)?.year || "ไม่มีข้อมูล";
}
function monthlyConsumption(p) {
  return (
    (indicator(p, "consumptionPpp")?.value ||
      (indicator(p, "gdpPpp")?.value || 8200) * 0.55) / 12
  );
}
function initLifeSystems() {
  const gdp = indicator(origin, "gdpPpp"),
    cons = indicator(origin, "consumptionPpp"),
    fert = indicator(origin, "fertility"),
    gini = indicator(origin, "gini"),
    le = indicator(origin, "lifeExpectancy");
  const householdSize = clamp(1.8 + (fert?.value || 1.8) * 0.4, 2, 4.6),
    avgSpend = monthlyConsumption(origin) * householdSize,
    avgOutput = ((gdp?.value || 10000) / 12) * householdSize * 0.52,
    sigma = gini ? giniSigma(gini.value) : 0.45,
    income = avgOutput * Math.exp(sigma * normal() - 0.5 * sigma * sigma);
  finances = {
    income,
    rent: avgSpend * 0.27,
    food: avgSpend * 0.31,
    transport: avgSpend * 0.1,
    health: avgSpend * 0.055,
    family: avgSpend * 0.07,
    care: 0,
    maintenance: 0,
    homeEquity: 0,
    savings: Math.max(avgSpend * 0.2, income * (0.5 + Math.random() * 2)),
    debt: income * Math.random() * 0.8,
    personalIncome: 0,
    monthlyInflation: 0.025,
    householdSize,
    gini: gini?.value ?? null,
    baseSpend: avgSpend,
    incomeYear: gdp?.year || null,
    spendYear: cons?.year || null,
  };
  const siblings = clamp(Math.round((fert?.value || 1.8) * 0.4), 0, 3);
  familyLife = {
    members: [
      {
        icon: "○",
        role: "ผู้ปกครอง",
        age: 45 + Math.floor(Math.random() * 17),
        health: 60 + Math.floor(Math.random() * 35),
      },
    ],
    partner: false,
    children: 0,
    caregiving: false,
    distance: false,
    householdSize,
  };
  if (Math.random() < 0.62)
    familyLife.members.unshift({
      icon: "○",
      role: "ผู้ปกครอง",
      age: 43 + Math.floor(Math.random() * 19),
      health: 60 + Math.floor(Math.random() * 35),
    });
  for (let i = 0; i < siblings; i++)
    familyLife.members.push({
      icon: "○",
      role: i === 0 ? "พี่น้อง" : "ญาติใกล้ชิด",
      age: Math.max(4, Math.floor(age) - Math.floor(Math.random() * 15)),
      health: 70 + Math.floor(Math.random() * 25),
    });
  workLife = {
    education: "มัธยมปลาย",
    job: "นักเรียน",
    hours: 0,
    commute: 0,
    experience: 0,
    stability: 58,
  };
  healthLife = {
    mental: 48 + Math.random() * 25,
    physical: stats.health,
    coverage: indicator(origin, "outOfPocket")
      ? "จ่ายเอง " + metric(origin, "outOfPocket") + "% ของรายจ่ายสุขภาพ"
      : "ไม่มีข้อมูลรายประเทศ",
    sleep: 7.5,
    stress: 36,
  };
  socialLife = {
    housing: "บ้านครอบครัว",
    visa: "พลเมืองในประเทศเกิด",
    safety: indicator(origin, "homicide")
      ? metric(origin, "homicide") + " ต่อแสนคน"
      : "ไม่มีข้อมูล",
    educationAccess: indicator(origin, "secondaryCompletion")
      ? metric(origin, "secondaryCompletion") + "% จบมัธยมต้น"
      : "ไม่มีข้อมูล",
    support: indicator(origin, "dependency")
      ? metric(origin, "dependency") + "% อัตราพึ่งพิงประชากร"
      : "ไม่มีข้อมูล",
  };
  lifeEndAge = Math.round(clamp((le?.value || 73) + 2 + normal() * 7, 48, 101));
  renderSystems();
  updateActivityLabel(true);
}
function renderSystems() {
  if (!finances || !familyLife || !workLife || !healthLife || !socialLife)
    return;
  const panel = document.getElementById("sysPanel"),
    costs =
      finances.rent +
      finances.food +
      finances.transport +
      finances.health +
      finances.family +
      finances.care +
      (finances.maintenance || 0),
    net = finances.income - costs,
    buffer = costs ? finances.savings / costs : 0,
    tier = tierOf(current.country),
    tierLabel = {
      low: "รายได้ต่ำ",
      lower: "ปานกลางค่อนต่ำ",
      middle: "ปานกลาง",
      upper: "ปานกลางค่อนสูง",
      high: "รายได้สูง",
    }[tier],
    g = indicator(origin, "gini");
  let familyRoles =
      familyLife.members.map((x) => x.role).join(" · ") || "ไม่มีข้อมูล",
    childText = familyLife.children ? familyLife.children + " คน" : "ไม่มีลูก";
  const row = (label, value, long = false) =>
    `<div class="sysrow"><span>${escapeHtml(label)}</span><b${long ? ' class="long"' : ""}>${escapeHtml(value)}</b></div>`;
  const card = (key, title, badge, rows, note) =>
    `<article class="systemCard"><h3>${uiIcon(key)}${escapeHtml(title)} <span>${escapeHtml(badge)}</span></h3>${rows}<div class="factorNote">${escapeHtml(note)}</div></article>`;
  const cards = [
    card(
      "money",
      "เงิน & บ้าน",
      "PPP Intl$",
      row(
        "รายได้ / เดือน",
        fmtPPP(finances.income) +
          " · ส่วนตัว " +
          fmtPPP(finances.personalIncome),
      ) +
        row(
          "รายจ่าย / เหลือสุทธิ",
          fmtPPP(costs) +
            " / " +
            (net >= 0 ? "+" : "−") +
            fmtPPP(Math.abs(net)),
        ) +
        row(
          "เงินเก็บ / หนี้",
          fmtPPP(finances.savings) + " / " + fmtPPP(finances.debt),
        ) +
        row(
          "ที่อยู่ / มูลค่าบ้าน",
          socialLife.housing + " / " + fmtPPP(finances.homeEquity),
        ) +
        '<div class="tinybar"><i style="width:' +
        Math.min(100, buffer * 8) +
        '%"></i></div>',
      "บริโภค/คน " +
        fmtPPP(indicator(origin, "consumptionPpp")?.value || 0) +
        " ต่อปี · Gini " +
        (g ? metric(origin, "gini") + " (" + g.year + ")" : "ไม่มีข้อมูล"),
    ),
    card(
      "family",
      "ครอบครัว",
      "บ้าน ~" + finances.householdSize.toFixed(1),
      row("คนในบ้าน", familyRoles, true) +
        row(
          "คู่ / ลูก",
          (familyLife.partner ? "มีคู่" : "ไม่มีคู่") + " / " + childText,
        ) +
        row("ดูแลครอบครัว", familyLife.caregiving ? "มีภาระดูแล" : "ยังไม่มี") +
        row(
          "ระยะจากบ้าน",
          familyLife.distance ? "อยู่ต่างเมือง/ประเทศ" : "อยู่ใกล้บ้าน",
        ),
      "ภาวะเจริญพันธุ์ " +
        metric(origin, "fertility") +
        " คน/หญิง (" +
        sourceYear(origin, "fertility") +
        ") · สมาชิกครอบครัวเป็นการจำลอง ไม่ใช่ข้อมูลจริงรายคน",
    ),
    card(
      "work",
      "เรียน & งาน",
      "แรงงาน",
      row("วุฒิ", workLife.education, true) +
        row("งาน", workLife.job, true) +
        row(
          "เวลางาน / เดินทาง",
          workLife.hours + " / " + workLife.commute + " ชม./สัปดาห์",
        ) +
        row(
          "ประสบการณ์ / ความมั่นคง",
          workLife.experience + " ปี / " + workLife.stability + "%",
        ) +
        row(
          "ว่างงานในประเทศ",
          metric(origin, "unemployment") +
            "% · " +
            sourceYear(origin, "unemployment"),
        ),
      "จบมัธยมต้น " +
        metric(origin, "secondaryCompletion") +
        "% (" +
        sourceYear(origin, "secondaryCompletion") +
        ") · ค่าเฉลี่ยประเทศไม่ใช่โอกาสเฉพาะบุคคล",
    ),
    card(
      "health",
      "สุขภาพกาย & ใจ",
      "อายุขัยประเทศ",
      row(
        "กาย / ใจ",
        Math.round(stats.health) +
          " / " +
          Math.round(healthLife.mental) +
          " จาก 100",
      ) +
        row(
          "เครียด / นอน",
          Math.round(healthLife.stress) +
            " / " +
            healthLife.sleep.toFixed(1) +
            " ชม.",
        ) +
        row(
          "อายุขัยประเทศ",
          metric(origin, "lifeExpectancy") +
            " ปี · " +
            sourceYear(origin, "lifeExpectancy"),
        ) +
        row(
          "ค่ารักษา/คน",
          fmtPPP(indicator(origin, "healthSpendPpp")?.value || 0) +
            "/ปี · จ่ายเอง " +
            metric(origin, "outOfPocket") +
            "%",
        ),
      "ช่วงอายุจบชีวิตอิงการกระจายรอบอายุขัยประเทศ ไม่ใช่คำทำนาย",
    ),
    card(
      "world",
      "ประเทศ & สังคม",
      tierLabel,
      row("เกิดที่", origin.city + " · " + origin.country, true) +
        row("ปัจจุบัน", current.city + " · " + current.country, true) +
        row("วีซ่า / พำนัก", socialLife.visa, true) +
        row(
          "รายได้ประเทศ/คน",
          fmtPPP(indicator(origin, "gdpPpp")?.value || 0) +
            " · " +
            sourceYear(origin, "gdpPpp"),
        ) +
        row(
          "ระดับรายได้ / อัตราเมือง",
          tierLabel + " / " + metric(origin, "urban") + "%",
        ),
      "ข้อมูลประเทศล่าสุดที่มี · ช่องว่างคงเป็น “—” ไม่ประมาณแทน",
    ),
  ];
  panel.innerHTML = cards.join("");
}
function showEvent(event) {
  activeEvent = event;
  paused = true;

  if (event.age === 21) {
    const studying =
      workLife.job.includes("นักศึกษา") || workLife.job === "นักเรียน";
    event.route = studying ? "study" : "work";
    if (!studying) {
      const nextCity = pick([current.city, origin.city]);
      event.title = "สัญญางานแรกกำลังจะจบ";
      event.desc =
        "รายได้เริ่มเข้าบ้านแล้ว แต่สัญญาจ้างและอนาคตในอาชีพยังไม่แน่นอน คุณจะรักษาความมั่นคงหรือยอมเริ่มใหม่";
      event.options = [
        {
          label: "ต่อสัญญากับนายจ้าง",
          sub: "รายได้ค่อยๆ โต · งานเดิม",
          action: "stay",
          delta: [0, 1, 1, 3, 7],
          log: "ต่อสัญญางานและรักษารายได้ประจำ",
        },
        {
          label: "เรียนวิชาชีพควบงาน",
          sub: "ใช้เวลาหลังเลิกงาน · เพิ่มทักษะ",
          action: "training",
          delta: [-1, 0, 7, 0, -3],
          log: "เรียนทักษะวิชาชีพควบคู่กับงาน",
        },
        {
          label: "ย้ายไปหาโอกาสใหม่",
          sub: nextCity.city + " · มีค่าใช้จ่ายย้ายบ้าน",
          action: "move",
          dest: nextCity,
          delta: [-2, 2, 2, -2, 5],
          log: "ย้ายไปเริ่มงานใหม่ที่ " + nextCity.city,
        },
      ];
    }
  }

  if (event.age === 36 && !familyLife.distance) {
    event.title = "ผู้ใหญ่ในบ้านเริ่มต้องการความช่วยเหลือ";
    event.desc =
      "คนในครอบครัวอายุมากขึ้น ขณะที่งานและชีวิตส่วนตัวก็มีภาระ คุณจะจัดเวลาและค่าใช้จ่ายดูแลอย่างไร";
  }

  if (event.age === 40) {
    const downPayment = finances.income * 48 * 0.2;
    event.options[0].label =
      finances.savings >= downPayment
        ? "ซื้อบ้านหลังแรก"
        : "ขอสินเชื่อซื้อบ้าน";
    event.options[0].sub =
      finances.savings >= downPayment
        ? "มีเงินดาวน์ · ยังต้องผ่อนระยะยาว"
        : "เงินดาวน์ยังไม่พอ · หนี้และความเสี่ยงสูง";
  }

  const pauseButton = document.getElementById("pause");
  pauseButton.disabled = true;
  pauseButton.textContent = "รอเลือก";
  document.getElementById("eventCard").classList.remove("waiting");
  document.getElementById("eventAge").textContent =
    `อายุ ${event.age} · เลือกเส้นทาง`;
  document.getElementById("icon").innerHTML = uiIcon(eventIconKey(event.age));
  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("eventDesc").textContent = event.desc;
  document.getElementById("when").textContent =
    "เหตุการณ์สำคัญ · เวลาเดินชั่วคราว";
  document.getElementById("resume").textContent =
    "เลือกหนึ่งทางเพื่อเดินหน้าต่อ";
  document.getElementById("decision").classList.add("show");

  const optionList = document.getElementById("options");
  optionList.replaceChildren(
    ...event.options.map((option, index) => {
      const button = document.createElement("button");
      const detail = document.createElement("small");
      button.className = "opt";
      const icon = option.application
        ? option.application.kind === "study"
          ? "🎓"
          : option.application.kind === "job"
            ? "💼"
            : "🧰"
        : "↗";
      button.textContent = `${icon} ${option.label}`;
      detail.textContent = option.application
        ? `${option.sub} · ${option.application.subject} · คะแนน ${Math.round(applicationScore(option.application))} / ${option.application.threshold}`
        : option.sub;
      button.append(detail);
      button.addEventListener("click", () => choose(index), { once: true });
      return button;
    }),
  );
}

function updateTime() {
  age = Math.max(18, Math.min(lifeEndAge, 18 + Math.max(0, elapsed) * speed));
  let yr = Math.floor(2026 + age - 18);
  document.getElementById("age").textContent = Math.floor(age) + " ปี";
  document.getElementById("date").textContent =
    yr +
    " · " +
    (age < 20
      ? "วัยเรียน"
      : age < 29
        ? "เริ่มต้นชีวิต"
        : age < 45
          ? "วัยทำงาน"
          : age < 60
            ? "วัยกลางคน"
            : "บั้นปลาย");
  document.getElementById("era").textContent =
    age < 20
      ? "วัยเรียน"
      : age < 29
        ? "เริ่มต้นชีวิต"
        : age < 45
          ? "วัยทำงาน"
          : age < 60
            ? "วัยกลางคน"
            : "บั้นปลาย";
  document.getElementById("lifeNow").textContent =
    age < 20
      ? "กำลังเรียนรู้โลกและรอโอกาสแรกของชีวิต"
      : age < 29
        ? "เริ่มสร้างทางของตัวเอง งาน ความรู้ และเมืองใหม่ๆ"
        : age < 45
          ? "ทำงาน ดูแลคนใกล้ตัว และเลือกว่าที่ไหนคือบ้าน"
          : age < 60
            ? "ชีวิตที่สร้างมาค่อยๆ เปลี่ยนจังหวะและความสำคัญ"
            : "มีเวลาให้สิ่งที่เคยถูกเลื่อนไปก่อน";
  let pct = ((age - 18) / Math.max(1, lifeEndAge - 18)) * 100;
  document.getElementById("progress").style.width = pct + "%";
  document.getElementById("percent").textContent = Math.floor(pct) + "%";
  let ev = events[eventIndex];
  if (ev) {
    document.getElementById("eventAge").textContent = "อายุ " + ev.age;
    document.getElementById("when").textContent =
      "อีกประมาณ " + Math.max(0, Math.ceil(ev.age - age)) + " ปี";
  } else {
    document.getElementById("eventAge").textContent = "ชีวิตดำเนินต่อ";
    document.getElementById("when").textContent = "ไม่มีคำถามระหว่างทาง";
  }
}
// Choices update the same household, job, health, and migration state used by yearly simulation.
function updateChoiceSystems(event, option, choiceIndex, previousLocation) {
  if (!workLife || !finances) return;

  switch (event.age) {
    case 18:
      if (choiceIndex === 0) {
        workLife.education = "ปริญญาตรี · ต่างประเทศ";
        workLife.job = "นักศึกษา";
        workLife.hours = 14;
        finances.debt += finances.income * 2;
        socialLife.visa = "วีซ่านักศึกษา";
        socialLife.housing = "หอพัก / แชร์บ้าน";
      } else if (choiceIndex === 1) {
        workLife.education = "ปริญญาตรี · ในประเทศ";
        workLife.job = "นักศึกษา";
        workLife.hours = 16;
        finances.debt += finances.income * 0.5;
      } else {
        workLife.job = "พนักงานฝึกหัด";
        workLife.hours = 42;
        workLife.stability = 42;
        finances.personalIncome = finances.income * 0.45;
      }
      break;

    case 21:
      if (event.route === "work") {
        if (choiceIndex === 0) {
          workLife.job = "พนักงานประจำ · " + current.city;
          workLife.hours = 42;
          workLife.stability = Math.min(88, workLife.stability + 9);
          finances.personalIncome *= 1.08;
        } else if (choiceIndex === 1) {
          workLife.education = "หลักสูตรวิชาชีพควบงาน";
          workLife.hours = 38;
          workLife.experience += 1;
          finances.personalIncome *= 0.92;
        } else {
          workLife.job = "พนักงานใหม่ · " + current.city;
          workLife.hours = 42;
          workLife.stability = 52;
          finances.personalIncome *= 1.05;
        }
      } else if (choiceIndex === 0) {
        workLife.job = "นักศึกษา · ฝึกงาน";
        workLife.hours = 26;
        workLife.experience += 1;
        finances.personalIncome = finances.income * 0.35;
      } else if (choiceIndex === 1) {
        workLife.education = "หลักสูตรที่ค่าใช้จ่ายเหมาะกับฐานะ";
        workLife.hours = 14;
        finances.debt = Math.max(0, finances.debt - finances.income * 0.2);
        finances.rent *= 0.92;
      } else {
        workLife.education = "เรียนไม่จบ · มีประสบการณ์ทำงาน";
        workLife.job = "พนักงานประจำ · เริ่มต้น";
        workLife.hours = 44;
        workLife.stability = 54;
        finances.personalIncome = finances.income * 0.62;
        if (familyLife.distance) socialLife.visa = "ต้องเปลี่ยนเป็นวีซ่าทำงาน";
      }
      break;

    case 24:
      workLife.job =
        choiceIndex === 2
          ? "ฟรีแลนซ์ / เดินทาง"
          : "พนักงานประจำ · " + current.city;
      workLife.hours = choiceIndex === 2 ? 24 : 42;
      workLife.stability = choiceIndex === 2 ? 43 : 69;
      workLife.commute = choiceIndex === 1 ? 7 : 4;
      workLife.experience = Math.max(workLife.experience, 2);
      if (choiceIndex !== 2) finances.personalIncome = finances.income * 0.78;
      break;

    case 27:
      if (choiceIndex === 0) {
        workLife.education = "ใบรับรองวิชาชีพ / เฉพาะทาง";
        workLife.experience += 1;
        finances.savings = Math.max(0, finances.savings - finances.income * 2);
        healthLife.stress += 5;
      } else if (choiceIndex === 1) {
        workLife.job = "ผู้เชี่ยวชาญ · " + current.city;
        workLife.hours = 47;
        workLife.stability = Math.min(92, workLife.stability + 8);
        finances.personalIncome *= 1.16;
        healthLife.stress += 7;
      } else {
        workLife.job = "เปลี่ยนสายงาน · เริ่มใหม่";
        workLife.hours = 38;
        workLife.experience = Math.max(0, workLife.experience - 2);
        workLife.stability = Math.max(35, workLife.stability - 8);
        finances.personalIncome *= 0.82;
      }
      break;

    case 29:
      if (choiceIndex === 0) {
        finances.savings *= 0.72;
        finances.personalIncome *= 0.9;
      } else if (choiceIndex === 1) {
        finances.savings *= 0.82;
      } else {
        finances.savings *= 1.18;
        healthLife.stress = Math.max(5, healthLife.stress - 4);
      }
      break;

    case 32:
      if (choiceIndex === 0) {
        familyLife.partner = true;
        const fertility = indicator(origin, "fertility")?.value || 1.5;
        familyLife.children =
          Math.random() < clamp(fertility / 4, 0.15, 0.75) ? 1 : 0;
        finances.family += finances.income * 0.08;
        workLife.hours = Math.max(30, workLife.hours - 4);
      } else if (choiceIndex === 2) {
        familyLife.caregiving = true;
        finances.care = finances.income * 0.13;
        workLife.hours = Math.max(24, workLife.hours - 8);
      }
      break;

    case 36:
      if (choiceIndex === 0) {
        familyLife.distance = false;
        familyLife.caregiving = true;
        finances.family += finances.income * 0.08;
        socialLife.visa = "พลเมืองในประเทศเกิด";
        socialLife.housing = "อยู่ใกล้ครอบครัว";
      } else if (choiceIndex === 1) {
        familyLife.distance = false;
        familyLife.caregiving = true;
        finances.family += finances.income * 0.12;
        finances.rent *= 1.25;
      } else {
        familyLife.distance = true;
        finances.family += finances.income * 0.1;
        finances.care = finances.income * 0.05;
      }
      break;

    case 40:
      if (choiceIndex === 0) {
        const homeValue = finances.income * 48;
        const downPayment = Math.min(finances.savings, homeValue * 0.2);
        finances.savings -= downPayment;
        finances.debt += homeValue - downPayment;
        finances.homeEquity = homeValue;
        finances.rent = finances.income * 0.2;
        socialLife.housing = "ผ่อนบ้าน";
      } else if (choiceIndex === 1) {
        finances.savings += finances.income * 3;
        socialLife.housing = "เช่าที่พัก";
      }
      break;

    case 45:
      if (choiceIndex === 0) {
        workLife.hours = Math.max(20, workLife.hours - 10);
        healthLife.stress = Math.max(10, healthLife.stress - 15);
        finances.personalIncome *= 0.82;
      } else if (choiceIndex === 1) {
        workLife.job = "ผู้จัดการ / ผู้เชี่ยวชาญ";
        workLife.hours = 48;
        finances.personalIncome *= 1.2;
        workLife.stability = Math.min(90, workLife.stability + 4);
        healthLife.stress += 12;
      } else {
        workLife.job = "เจ้าของกิจการ";
        workLife.stability = 38;
        workLife.hours = 50;
        finances.personalIncome *= 0.85;
        finances.debt += finances.income;
      }
      break;

    case 50:
      if (choiceIndex === 0) {
        finances.family += finances.income * 0.1;
        finances.savings = Math.max(0, finances.savings - finances.income * 4);
      } else if (choiceIndex === 1) {
        familyLife.caregiving = true;
        finances.care = finances.income * 0.1;
        finances.health *= 1.08;
        healthLife.stress = Math.max(5, healthLife.stress - 3);
      } else {
        workLife.hours = Math.max(22, workLife.hours - 8);
        finances.personalIncome *= 0.84;
        finances.care = finances.income * 0.08;
      }
      break;

    case 56:
      if (choiceIndex === 0) {
        workLife.job = "ทำงานยืดหยุ่น";
        workLife.hours = 25;
        finances.personalIncome *= 0.72;
      } else if (choiceIndex === 1) {
        familyLife.distance = false;
        finances.personalIncome *= 0.7;
      } else {
        workLife.hours = Math.max(28, workLife.hours);
        finances.personalIncome *= 0.92;
      }
      break;

    case 60:
      if (choiceIndex === 0) {
        workLife.job = "ทำงานพาร์ตไทม์";
        workLife.hours = 22;
        finances.personalIncome *= 0.58;
      } else if (choiceIndex === 1) {
        workLife.job = "เกษียณ";
        workLife.hours = 0;
        finances.personalIncome = 0;
        finances.income *= 0.52;
        healthLife.stress = Math.max(5, healthLife.stress - 8);
      } else {
        workLife.job = "ทำงานใกล้ครอบครัว";
        workLife.hours = 28;
        finances.personalIncome *= 0.7;
      }
      break;

    case 72:
      if (choiceIndex === 0) {
        socialLife.housing = "ปรับบ้านให้อยู่เองสะดวก";
        finances.savings = Math.max(0, finances.savings - finances.income * 3);
      } else if (choiceIndex === 1) {
        familyLife.distance = false;
        finances.care = Math.max(finances.care, finances.income * 0.06);
      } else {
        healthLife.mental += 5;
        healthLife.stress = Math.max(5, healthLife.stress - 5);
      }
      break;
  }

  if (event.age >= 67) {
    if (event.age !== 72) workLife.job = "เกษียณ / งานอาสา";
    workLife.hours = Math.min(workLife.hours, 8);
    healthLife.sleep = 7.8;
  }

  if (option.action === "travel") {
    const tripCost = Math.min(finances.savings, finances.income * 1.2);
    finances.savings -= tripCost;
    finances.debt += Math.max(0, finances.income * 1.2 - tripCost) * 0.15;
    healthLife.mental += 5;
  }

  if (option.action === "move" || option.action === "return") {
    const monthlyBudget = monthlyConsumption(current) * finances.householdSize;
    const student = workLife.job.includes("นักศึกษา");
    const retired = workLife.job.includes("เกษียณ");
    finances.income = monthlyBudget * (student ? 0.55 : retired ? 0.65 : 0.98);
    finances.personalIncome = student
      ? finances.income * 0.2
      : finances.income * 0.78;
    finances.rent = monthlyBudget * 0.27;

    if (previousLocation && previousLocation.country !== current.country) {
      const movingCost = finances.income * (student ? 3 : 2);
      const paidFromSavings = Math.min(finances.savings, movingCost);
      finances.savings -= paidFromSavings;
      finances.debt += movingCost - paidFromSavings;
      socialLife.visa = student
        ? "วีซ่านักศึกษา · ต้องรักษาสถานะ"
        : "วีซ่าทำงาน / สถานะพำนัก";
      socialLife.housing = student ? "หอพัก / แชร์บ้าน" : "เช่าที่พักในเมือง";
      familyLife.distance = true;
    } else if (current.country === origin.country) {
      socialLife.visa = "พลเมืองในประเทศเกิด";
      familyLife.distance = false;
    }

    socialLife.safety = indicator(current, "homicide")
      ? metric(current, "homicide") + " ต่อแสนคน"
      : "ไม่มีข้อมูล";
    socialLife.educationAccess = indicator(current, "secondaryCompletion")
      ? metric(current, "secondaryCompletion") + "% จบมัธยมต้น"
      : "ไม่มีข้อมูล";
    socialLife.support = indicator(current, "dependency")
      ? metric(current, "dependency") + "% อัตราพึ่งพิงประชากร"
      : "ไม่มีข้อมูล";
  }

  if (finances.homeEquity > 0) {
    finances.maintenance = (finances.homeEquity * 0.009) / 12;
  }
  healthLife.mental = clamp(healthLife.mental + option.delta[1] * 0.4, 5, 98);
  healthLife.stress = clamp(
    healthLife.stress - (option.delta[1] > 0 ? 2 : 0),
    5,
    95,
  );
  familyLife.distance = current.country !== origin.country;
  renderSystems();
}
// Apply a year of prices, work risk, savings, debt, care needs, and aging.
function annualLifeUpdate() {
  if (!finances) return;

  factorAge++;
  finances.rent *= 1.03;
  finances.food *= 1.025;
  finances.transport *= 1.025;
  finances.health *= 1.035;
  finances.maintenance =
    finances.homeEquity > 0 ? (finances.homeEquity * 0.009) / 12 : 0;
  finances.care = familyLife.caregiving
    ? finances.income * 0.13
    : familyLife.members.some((member) => member.age > 67)
      ? finances.income * 0.04
      : 0;

  const monthlyCosts =
    finances.rent +
    finances.food +
    finances.transport +
    finances.health +
    finances.family +
    finances.care +
    finances.maintenance;
  const unemploymentRate =
    (indicator(origin, "unemployment")?.value || 8) / 100;
  const isStudent = workLife.job === "นักศึกษา" || workLife.job === "นักเรียน";
  const isRetired = workLife.job.includes("เกษียณ");

  if (!isStudent && !isRetired && workLife.job !== "กำลังหางาน") {
    const layoffRisk = clamp(
      (100 - workLife.stability) / 2500 + unemploymentRate / 4,
      0.004,
      0.03,
    );
    if (Math.random() < layoffRisk) {
      workLife.job = "กำลังหางาน";
      workLife.hours = 0;
      workLife.stability = Math.max(20, workLife.stability - 14);
      finances.personalIncome *= 0.2;
      healthLife.stress = clamp(healthLife.stress + 12, 5, 95);
      stats.happy -= 4;
    } else {
      finances.personalIncome *= 1.018;
      workLife.experience++;
    }
  } else if (workLife.job === "กำลังหางาน") {
    const chanceOfNewWork = clamp(0.55 - unemploymentRate * 0.8, 0.18, 0.5);
    if (Math.random() < chanceOfNewWork) {
      workLife.job = "งานใหม่ · " + current.city;
      workLife.hours = 40;
      workLife.stability = 48;
      finances.personalIncome =
        monthlyConsumption(current) * finances.householdSize * 0.75;
      healthLife.stress = Math.max(5, healthLife.stress - 6);
      lifeLog.push({ age: Math.floor(age), text: "ได้งานใหม่หลังช่วงว่างงาน" });
      renderJournal();
    }
  }

  if (workLife.job.includes("เกษียณ")) {
    finances.income = Math.max(finances.personalIncome, finances.income);
  } else if (familyLife.distance && finances.personalIncome > 0) {
    finances.income = finances.personalIncome;
  } else {
    finances.income = Math.max(finances.income, finances.personalIncome);
  }

  const monthlySurplus = finances.income - monthlyCosts;
  if (monthlySurplus > 0) {
    finances.savings += monthlySurplus * 0.55;
    finances.debt = Math.max(0, finances.debt - monthlySurplus * 0.15);
  } else {
    finances.debt += -monthlySurplus * 0.7;
    healthLife.stress = clamp(healthLife.stress + 2, 5, 95);
    stats.happy -= 1;
  }

  if (finances.homeEquity > 0) finances.homeEquity *= 1.015;
  if (familyLife.distance) {
    stats.rel -= 0.12;
    healthLife.mental -= 0.08;
  }
  familyLife.members.forEach((member) => {
    member.age++;
    if (member.age > 65) member.health -= 0.4;
    if (member.age > 72 && member.health < 40) familyLife.caregiving = true;
  });

  const overtimeStress = Math.max(0, workLife.hours - 40) * 0.16;
  const restRecovery = workLife.hours <= 32 ? 0.35 : 0;
  const studying =
    workLife.job.includes("นักศึกษา") || workLife.job.includes("นักเรียน");
  if (studying) {
    abilities.study = clamp(abilities.study + 1.4, 5, 98);
    stats.know = clamp(stats.know + 0.7, 5, 98);
  }
  if (workLife.hours > 0 && !studying) {
    abilities.practice = clamp(abilities.practice + 0.9, 5, 98);
    abilities.interview = clamp(abilities.interview + 0.25, 5, 98);
  }
  if (current.country !== origin.country) {
    abilities.language = clamp(abilities.language + 0.9, 5, 98);
  }
  healthLife.stress = clamp(
    healthLife.stress + overtimeStress - restRecovery,
    5,
    95,
  );
  const ageWear = age >= 70 ? 0.28 : age >= 55 ? 0.14 : age >= 40 ? 0.05 : 0;
  stats.health = clamp(
    stats.health + (healthLife.stress < 45 ? 0.05 : -0.08) - ageWear,
    5,
    98,
  );
  healthLife.mental = clamp(
    healthLife.mental + (Math.random() - 0.5) * 2,
    5,
    98,
  );
  healthLife.physical = stats.health;
  stats.wealth = clamp(
    35 + Math.log10(Math.max(1, finances.savings + 1)) * 11,
    5,
    98,
  );
  setStats();
  renderSystems();
}

function restart() {
  elapsed = 0;
  simulationMinutes = 420;
  age = 18;
  eventIndex = 0;
  factorAge = 18;
  lifeLog = [];
  origin = pick([]);
  current = origin;
  home = origin;
  visited = [origin];
  events = ageEventData();
  stats = {
    health: 60 + Math.random() * 25,
    happy: 40 + Math.random() * 30,
    know: 35 + Math.random() * 45,
    rel: 45 + Math.random() * 35,
    wealth: 20 + Math.random() * 40,
  };
  abilities = {
    study: clamp(28 + stats.know * 0.58 + normal() * 8, 15, 96),
    language: clamp(26 + stats.know * 0.3 + normal() * 13, 10, 92),
    practice: clamp(24 + normal() * 16, 8, 82),
    interview: clamp(28 + stats.rel * 0.45 + normal() * 10, 10, 94),
  };
  characterLook = {
    skin: pickFrom(["#f4c9a9", "#e7ad8c", "#c98565", "#a9694e", "#80533f"]),
    hair: pickFrom(["#283047", "#493a51", "#74503e", "#252c32", "#7d6047"]),
    shirt: pickFrom(["#7899d5", "#75a58e", "#cb806f", "#9884bd", "#d0a85e"]),
    hairstyle: Math.floor(Math.random() * 4),
    accessory: Math.random() < 0.34 ? "glasses" : "none",
  };
  paused = false;
  activeEvent = null;
  const le = indicator(origin, "lifeExpectancy");
  lifeEndAge = Math.round(clamp((le?.value || 73) + 2 + normal() * 7, 48, 101));
  document.getElementById("end").classList.remove("show");
  document.getElementById("decision").classList.remove("show");
  document.getElementById("eventCard").classList.add("waiting");
  document.getElementById("pause").disabled = false;
  document.getElementById("pause").textContent = "Ⅱ หยุด";
  document.getElementById("icon").innerHTML = uiIcon("home");
  document.getElementById("eventTitle").textContent = "ชีวิตกำลังดำเนินไป";
  document.getElementById("eventDesc").textContent =
    "เวลาเดินเอง เหตุการณ์สำคัญเท่านั้นที่จะหยุดให้เลือก";
  document.getElementById("resume").textContent =
    "AUTO SIM · จำลองเวลาอัตโนมัติ";
  document.getElementById("lastResult").textContent = "ยังไม่มีการตัดสินใจ";
  initLifeSystems();
  last = null;
  setStats();
  updatePlace();
  renderJournal();
  updateTime();
  actionCycle = -1;
}
function choose(i) {
  if (!activeEvent) return;
  const ev = activeEvent;
  let selectedIndex = i;
  let opt = ev.options[i];
  let resultText = "";
  let failedApplication = false;
  if (opt.application) {
    const score = applicationScore(opt.application);
    const passed = score >= opt.application.threshold;
    const scoreText = `${Math.round(score)}/${opt.application.threshold}`;
    if (passed) {
      resultText = `ผ่าน${opt.application.subject} คะแนน ${scoreText}`;
      opt = { ...opt, log: `${resultText} · ${opt.log}` };
      abilities[opt.application.kind === "study" ? "study" : "practice"] =
        clamp(
          abilities[opt.application.kind === "study" ? "study" : "practice"] +
            2,
          0,
          100,
        );
    } else if (opt.application.kind === "study") {
      resultText = `คะแนน ${scoreText} ยังไม่ถึงเกณฑ์ · `;
      const fallbackIndex = ev.age === 18 ? (i === 0 ? 1 : 2) : 2;
      const fallback = ev.options[fallbackIndex];
      selectedIndex = fallbackIndex;
      opt = {
        ...fallback,
        application: null,
        log:
          resultText +
          (fallbackIndex === 1
            ? "เปลี่ยนไปเรียนใกล้บ้านแทนการไปต่างประเทศ"
            : "พักแผนเรียนต่อและเริ่มหาประสบการณ์ทำงาน"),
      };
      resultText = opt.log;
    } else {
      failedApplication = true;
      resultText = `คะแนน ${scoreText} ยังไม่ถึงเกณฑ์ · นายจ้างยังไม่รับเข้าทำงาน`;
      opt = {
        ...opt,
        log: `${resultText} · ยื่นสมัครงานเพิ่มระหว่างหางาน`,
      };
    }
  }
  const previousLocation = current;
  stats.health += opt.delta[0];
  stats.happy += opt.delta[1];
  stats.know += opt.delta[2];
  stats.rel += opt.delta[3];
  stats.wealth += opt.delta[4];
  if (opt.dest) {
    if (opt.action === "travel") {
      const old = current;
      current = opt.dest;
      visited.push(current);
      setTimeout(() => {
        if (current === opt.dest) {
          current = old;
          visited.push(old);
          updatePlace();
          renderSystems();
        }
      }, 4000);
    } else if (opt.action === "move" || opt.action === "return") {
      current = opt.dest;
      home = current;
      visited.push(current);
    }
  }
  updateChoiceSystems(ev, opt, selectedIndex, previousLocation);
  abilities.study = clamp(abilities.study + opt.delta[2] * 0.35, 5, 98);
  abilities.interview = clamp(abilities.interview + opt.delta[3] * 0.22, 5, 98);
  if (["work", "internship", "promotion", "training"].includes(opt.action)) {
    abilities.practice = clamp(abilities.practice + 3, 5, 98);
  }
  if (failedApplication) {
    workLife.job = "กำลังหางาน";
    workLife.hours = 0;
    workLife.stability = 32;
    finances.personalIncome = 0;
    healthLife.stress = clamp(healthLife.stress + 5, 5, 95);
  }
  lifeLog.push({ age: ev.age, text: opt.log });
  renderJournal();
  eventIndex++;
  activeEvent = null;
  setStats();
  updatePlace();
  document.getElementById("decision").classList.remove("show");
  document.getElementById("eventCard").classList.add("waiting");
  document.getElementById("icon").innerHTML = uiIcon("spark");
  document.getElementById("eventTitle").textContent = "ทางเลือกถูกบันทึก";
  document.getElementById("eventDesc").textContent =
    (resultText || opt.log) + " · ผลส่งต่อไปยังเงิน งาน สุขภาพ และคนใกล้ตัว";
  document.getElementById("resume").textContent = "AUTO SIM · จำลองเวลาต่อ";
  document.getElementById("lastResult").textContent =
    "อายุ " + ev.age + " · " + opt.log;
  document.getElementById("toast").textContent =
    "ชีวิตดำเนินต่อ · " + current.city;
  document.getElementById("toast").classList.add("show");
  setTimeout(
    () => document.getElementById("toast").classList.remove("show"),
    1600,
  );
  paused = false;
  document.getElementById("pause").disabled = false;
  document.getElementById("pause").textContent = "Ⅱ หยุด";
  actionCycle = -1;
  updateTime();
}
// The clock pauses at choices, so the player only responds when life reaches a turning point.
function tick(now) {
  let dt = last === null ? 0 : Math.min(0.12, Math.max(0, (now - last) / 1000));
  last = now;
  if (!paused) {
    elapsed += dt;
    simulationMinutes += dt * 60 * speed;
    updateTime();
    if (Math.floor(age) > factorAge) {
      while (factorAge < Math.floor(age)) annualLifeUpdate();
    }
    let next = events[eventIndex];
    if (next && age >= next.age) showEvent(next);
    if (age >= lifeEndAge) {
      paused = true;
      document.getElementById("end").classList.add("show");
      document.getElementById("endingText").textContent =
        "อายุขัยเฉลี่ยประเทศเกิด " +
        metric(origin, "lifeExpectancy") +
        " ปี · ชีวิตจำลองสิ้นสุดราวอายุ " +
        Math.floor(lifeEndAge) +
        " · " +
        lifeLog.length +
        " เหตุการณ์สำคัญ";
    }
  }
  drawActivity(now);
  requestAnimationFrame(tick);
}
restart();
requestAnimationFrame(tick);
function drawActivity(timestamp) {
  const currentActivity = scheduledActivity();
  updateActivityLabel(false);
  LifeScene.draw(timestamp, {
    activity: currentActivity,
    age,
    location: current,
    family: familyLife,
    clockMinutes: simulationMinutes % 1440,
    character: characterLook,
  });
}
