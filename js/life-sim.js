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
const thailand = places.find((place) => place.iso === "THA");
const thaiPlaces = thailand
  ? ["กรุงเทพฯ", "เชียงใหม่", "ขอนแก่น", "นครราชสีมา", "ภูเก็ต", "ชลบุรี", "อุดรธานี"].map(
      (city) => ({ ...thailand, city, country: "ไทย" }),
    )
  : places;
let speed = 0.125,
  paused = false,
  age = 0,
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
let birthLife = null;
let choiceActivity = null;
let choiceActivityUntil = 0;
function pick(exclude = [], source = places) {
  const pool = source.filter((place) => !exclude.includes(place.city));
  return pool[Math.floor(Math.random() * pool.length)] || source[0];
}
function pickThai(exclude = []) {
  return pick(exclude, thaiPlaces);
}
function localizePlace(place) {
  return place.iso === "THA" ? { ...place, country: "ไทย" } : place;
}
function pickFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}
// The calendar contains only turning points; quiet years are simulated in the background.
function ageEventData() {
  const studyCity = pickThai([home.city]);
  const workCity = pickThai([home.city, studyCity.city]);
  const travelCity = localizePlace(pick([home.city], places));
  const nextCity = pickThai([
    home.city,
    studyCity.city,
    workCity.city,
  ]);

  const schedule = [
    {
      age: 5,
      icon: "home",
      title: `${birthLife.name} เริ่มรู้จักโลกกว้างขึ้น`,
      desc: "ช่วงวัยเด็กหล่อหลอมความสนใจและความสัมพันธ์ คุณจะใช้เวลาอยู่กับใครและทำอะไรเป็นพิเศษ?",
      options: [
        {
          label: "เล่นกับเด็ก ๆ แถวบ้าน",
          sub: "ฝึกเข้ากับคนอื่น · ความสัมพันธ์เพิ่ม",
          action: "child-social",
          delta: [0, 5, 1, 7, 0],
          log: "ใช้เวลาวิ่งเล่นกับเพื่อนในละแวกบ้าน",
        },
        {
          label: "ช่วยผู้ใหญ่ทำงานบ้าน",
          sub: "แบ่งเบาภาระ · เรียนรู้ทักษะชีวิต",
          action: "child-home",
          delta: [1, 1, 2, 4, 1],
          log: "เริ่มช่วยงานเล็ก ๆ ในบ้าน",
        },
        {
          label: "ชอบวาดรูปและประดิษฐ์ของเล่น",
          sub: "ค้นพบสิ่งที่ชอบ · ความคิดสร้างสรรค์เพิ่ม",
          action: "child-hobby",
          delta: [0, 6, 5, 1, 0],
          log: "ค้นพบว่างานวาดรูปและงานฝีมือทำให้มีความสุข",
        },
      ],
    },
    {
      age: 6,
      icon: "book",
      title: "จะได้เข้าเรียนหรือไม่?",
      desc: "ค่าใช้จ่าย ระยะทาง และรายได้ของบ้านอาจทำให้การเรียนไม่ใช่ทางเลือกที่ทุกครอบครัวเข้าถึงได้",
      options: [
        {
          label: origin.iso === "THA" ? "เข้าโรงเรียนรัฐใกล้บ้าน · ป.1" : "เข้าโรงเรียนรัฐใกล้บ้าน",
          sub: origin.iso === "THA"
            ? "ไม่เก็บค่าเล่าเรียน · ยังมีค่าชุด อุปกรณ์ และเดินทาง"
            : "ค่าเล่าเรียนต่ำ · ยังมีค่าอุปกรณ์และการเดินทาง",
          action: "school",
          application: {
            kind: "study",
            threshold: 24,
            subject: "สมัครเข้าเรียนชั้นประถม",
          },
          delta: [0, -2, 8, 1, -2],
          log: "ได้เริ่มเรียนชั้นประถมศึกษา",
          lesson: "โอกาสเรียนรู้สำคัญกว่าชื่อเสียงของโรงเรียน",
        },
        {
          label: "ช่วยงานที่บ้านก่อน",
          sub: "ครอบครัวพึ่งพาแรงช่วย · เวลาเรียนมีจำกัด",
          action: "family-work",
          delta: [0, 1, -2, 6, 3],
          log: "ช่วยครอบครัวทำงานและยังไม่ได้เข้าเรียน",
          lesson: "การช่วยบ้านมีคุณค่า แต่เด็กก็ควรได้โอกาสเรียนรู้",
        },
        {
          label: "เรียนกับญาติหรือศูนย์ใกล้บ้าน",
          sub: "ไม่เสียค่าเดินทางมาก · อาจไม่มีทุกพื้นที่",
          action: "informal-school",
          delta: [0, 0, 4, 2, 0],
          log: "เรียนทักษะพื้นฐานกับคนในชุมชน",
          lesson: "การเรียนรู้เกิดขึ้นได้หลายทาง ไม่ได้มีแค่ในห้องเรียน",
        },
        {
          label: origin.iso === "THA" ? "สอบชิงทุนโรงเรียนประจำอำเภอ" : "สมัครทุนโรงเรียนคัดเลือก",
          sub: "ใช้ผลการเรียนและทักษะ · ถ้าไม่ผ่านยังเลือกโรงเรียนใกล้บ้านได้",
          action: "scholarship-school",
          application: {
            kind: "study",
            threshold: 35,
            fallbackIndex: 2,
            subject: "คัดเลือกทุนการศึกษา",
          },
          delta: [-1, -1, 9, 2, 0],
          log: "สอบชิงทุนเพื่อเข้าเรียนในโรงเรียนที่มีโอกาสมากขึ้น",
          lesson: "การสอบตกครั้งหนึ่งไม่ได้กำหนดคุณค่าหรืออนาคตทั้งหมด",
        },
        {
          label: origin.iso === "THA" ? "เข้าโรงเรียนเอกชนถ้าบ้านจ่ายไหว" : "เข้าโรงเรียนเอกชนถ้าครอบครัวรับภาระไหว",
          sub: "ค่าเรียนและเดินทางสูงขึ้น · ลดเงินสำรองของบ้าน",
          action: "private-school",
          application: {
            kind: "study",
            threshold: 28,
            fallbackIndex: 2,
            subject: "สมัครเข้าโรงเรียนเอกชน",
          },
          delta: [-1, 1, 7, 1, -7],
          log: "ครอบครัวลงทุนกับการเรียนในโรงเรียนเอกชน",
          lesson: "ค่าใช้จ่ายที่สูงขึ้นควรแลกกับโอกาสที่เหมาะกับตัวเรา",
        },
      ],
    },
    {
      age: 8,
      icon: "family",
      title: "เรื่องเล็กในห้องเรียนที่จำได้นาน",
      desc: "การอยู่ร่วมกับเพื่อนและการขอความช่วยเหลือค่อยๆ สร้างความมั่นใจ คุณจะรับมือกับวันธรรมดาที่ไม่ง่ายอย่างไร?",
      options: [
        {
          label: "ชวนเพื่อนที่ถูกทิ้งให้อยู่กลุ่มเดียวกัน",
          sub: "ฝึกเห็นใจคนอื่น · สร้างเพื่อนที่ไว้ใจกัน",
          action: "peer-support",
          delta: [0, 4, 1, 7, 0],
          log: "ยื่นมือชวนเพื่อนที่ถูกทิ้งให้มาร่วมกลุ่ม",
          lesson: "ความใจดีเล็กๆ อาจเปลี่ยนวันของใครบางคนได้",
        },
        {
          label: "ยอมรับว่าวิชาหนึ่งยังไม่เข้าใจ แล้วขอครูช่วย",
          sub: "ใช้ความกล้าถาม · เพิ่มพื้นฐานระยะยาว",
          action: "ask-teacher",
          delta: [-1, 1, 7, 2, 0],
          log: "ขอครูอธิบายบทเรียนที่ยังตามไม่ทัน",
          lesson: "การถามเมื่อไม่เข้าใจเป็นทักษะ ไม่ใช่ความล้มเหลว",
        },
        {
          label: "กลับบ้านไปช่วยแบ่งเบาภาระ",
          sub: "ครอบครัวมีเวลาให้กัน · เวลาทำการบ้านลดลง",
          action: "help-family",
          delta: [0, 1, -1, 6, 2],
          log: "กลับบ้านไปช่วยครอบครัวในวันที่งานยุ่ง",
          lesson: "การดูแลกันสำคัญ และการขอให้คนอื่นช่วยเราก็สำคัญเหมือนกัน",
        },
      ],
    },
    {
      age: 10,
      icon: "book",
      title: "เวลาเรียนกับหน้าที่ที่บ้านเริ่มชนกัน",
      desc: "รายจ่ายและงานในบ้านเปลี่ยนได้เสมอ เด็กแต่ละคนจึงต้องแบ่งเวลาไม่เหมือนกัน",
      options: [
        {
          label: "จัดตารางอ่านหนังสือสั้นๆ ทุกวัน",
          sub: "ความรู้เพิ่มทีละน้อย · เวลาพักลดลงบ้าง",
          action: "steady-study",
          delta: [-1, -1, 6, 0, 0],
          log: "จัดเวลาอ่านหนังสือให้สม่ำเสมอ",
          lesson: "ความสม่ำเสมอมักพาไปได้ไกลกว่าการโหมครั้งเดียว",
        },
        {
          label: "แบ่งเวลาให้เพื่อนและกิจกรรมที่ชอบ",
          sub: "เติมความสุขและทักษะสังคม · คะแนนเรียนอาจไม่พุ่งเร็ว",
          action: "school-club",
          delta: [0, 6, 1, 5, 0],
          log: "เข้าร่วมกิจกรรมกับเพื่อนหลังเลิกเรียน",
          lesson: "ชีวิตที่ดีต้องมีทั้งความรับผิดชอบและเวลาที่เป็นของเรา",
        },
        {
          label: "ช่วยงานบ้านก่อน แล้วค่อยทำการบ้านเท่าที่ไหว",
          sub: "ครอบครัวพึ่งพาคุณ · ขอแรงสนับสนุนจากครูได้",
          action: "family-duty",
          delta: [-1, 0, 0, 5, 3],
          log: "ช่วยงานครอบครัวพร้อมพยายามรักษาเวลาเรียน",
          lesson: "ภาระของบ้านไม่ควรตกอยู่กับเด็กคนเดียว",
        },
      ],
    },
    {
      age: 12,
      icon: "book",
      title: "จบประถมแล้ว จะเรียนต่อที่ไหน?",
      desc: "การเดินทาง ค่าใช้จ่าย และผลการเรียนกำหนดทางเลือกหลัง ป.6 ไม่มีโรงเรียนแบบเดียวที่เหมาะกับทุกครอบครัว",
      options: [
        {
          label: origin.iso === "THA" ? "เรียนต่อ ม.1 โรงเรียนใกล้บ้าน" : "เรียนต่อโรงเรียนมัธยมใกล้บ้าน",
          sub: "เดินทางสะดวก · ครอบครัวช่วยดูแลได้",
          action: "secondary-school",
          application: { kind: "study", threshold: 30, fallbackIndex: 2, subject: "สมัครเข้าเรียนมัธยมใกล้บ้าน" },
          delta: [0, 1, 6, 2, -2],
          log: "สมัครเรียนต่อในโรงเรียนมัธยมใกล้บ้าน",
          lesson: "ทางเลือกที่ไปต่อได้จริงอาจเหมาะกว่าทางที่ดูดีที่สุดบนกระดาษ",
        },
        {
          label: origin.iso === "THA" ? "สอบเข้าโรงเรียนประจำจังหวัด" : "สอบเข้าโรงเรียนคัดเลือก",
          sub: "ใช้ความรู้และเวลาเดินทางเพิ่ม · หากไม่ผ่านมีแผนสำรอง",
          action: "competitive-secondary",
          application: { kind: "study", threshold: 48, fallbackIndex: 0, subject: "สอบเข้าโรงเรียนคัดเลือก" },
          delta: [-2, -1, 10, 1, -3],
          log: "เตรียมสอบเข้าโรงเรียนที่มีการแข่งขันสูง",
          lesson: "ความพยายามเพิ่มโอกาสได้ แต่ผลสอบไม่ได้บอกคุณค่าของคน",
        },
        {
          label: "เรียนต่อพร้อมช่วยธุรกิจหรืออาชีพของครอบครัว",
          sub: "ได้ประสบการณ์จริง · ต้องช่วยกันจัดเวลา",
          action: "study-family-work",
          delta: [-1, 2, 3, 6, 2],
          log: "เรียนต่อพร้อมช่วยงานครอบครัวในเวลาว่าง",
          lesson: "ประสบการณ์และการเรียนรู้ไปด้วยกันได้เมื่อแบ่งภาระอย่างเป็นธรรม",
        },
        {
          label: "ขอเรียนทางเลือกหรือศูนย์การเรียนใกล้ชุมชน",
          sub: "ยืดหยุ่นและประหยัดค่าเดินทาง · ต้องหมั่นเรียนด้วยตัวเอง",
          action: "community-learning",
          delta: [0, 1, 5, 2, 1],
          log: "เลือกเรียนต่อผ่านศูนย์การเรียนใกล้ชุมชน",
          lesson: "เมื่อทางหลักเข้าไม่ถึง การหาทางอื่นก็เป็นความพยายามที่มีค่า",
        },
      ],
    },
    {
      age: 14,
      icon: "book",
      title: "เรียนต่อมัธยมต้นหรือเริ่มทำงาน?",
      desc: "ผลการเรียน ค่าเล่าเรียน การเดินทาง และความจำเป็นของครอบครัว ทำให้เส้นทางหลังประถมของแต่ละคนต่างกัน",
      options: [
        {
          label: "สมัครเรียนมัธยมต้น",
          sub: "ต้องมีที่เรียนและเงินพอสำหรับค่าใช้จ่าย",
          action: "secondary-school",
          application: {
            kind: "study",
            threshold: 38,
            subject: "สมัครเข้าเรียนมัธยมต้น",
          },
          delta: [0, -2, 8, 1, -4],
          log: "เรียนต่อมัธยมศึกษาตอนต้น",
        },
        {
          label: "เรียนทักษะวิชาชีพในชุมชน",
          sub: "ได้ทักษะทำงาน · ค่าใช้จ่ายต่ำกว่าหลักสูตรเต็มเวลา",
          action: "training",
          application: {
            kind: "trade",
            skill: "practice",
            threshold: 32,
            subject: "สมัครเรียนทักษะวิชาชีพ",
          },
          delta: [1, 1, 4, 2, 1],
          log: "เริ่มฝึกทักษะวิชาชีพใกล้บ้าน",
        },
        {
          label: "เริ่มทำงานช่วยครอบครัว",
          sub: "มีรายได้เร็วขึ้น · อาจกลับไปเรียนภายหลัง",
          action: "work",
          delta: [-1, 0, 0, 4, 8],
          log: "ออกจากโรงเรียนเพื่อเริ่มทำงานช่วยครอบครัว",
        },
        {
          label: "สมัครทุนเรียนต่อมัธยมต้น",
          sub: "ใช้คะแนนและความสม่ำเสมอ · มีโรงเรียนใกล้บ้านเป็นทางสำรอง",
          action: "academic-scholarship",
          application: { kind: "study", skill: "study", threshold: 48, fallbackIndex: 0, subject: "สอบชิงทุนเรียนต่อ" },
          delta: [-1, -1, 10, 1, -1],
          log: "สอบชิงทุนเพื่อเรียนต่อมัธยมต้น",
          lesson: "ผลสอบเปิดประตูได้ แต่ไม่ได้ตัดสินว่าใครมีคุณค่ามากกว่า",
        },
      ],
    },
    {
      age: 16,
      icon: "book",
      title: "ทางเลือกหลังมัธยมต้น",
      desc: "เลือกจากผลการเรียน ค่าใช้จ่าย และโอกาสที่มีในพื้นที่ของคุณ ไม่ใช่ทุกคนจะมีเส้นทางเดียวกัน",
      options: [
        {
          label: "เรียนต่อมัธยมปลาย",
          sub: "เพิ่มโอกาสเข้ามหาวิทยาลัย · มีค่าใช้จ่ายต่อเนื่อง",
          action: "upper-school",
          application: {
            kind: "study",
            threshold: 44,
            subject: "สมัครเรียนมัธยมปลาย",
          },
          delta: [0, -2, 9, 0, -5],
          log: "เรียนต่อมัธยมศึกษาตอนปลาย",
        },
        {
          label: "เข้าเรียนอาชีวะ",
          sub: "ฝึกสายอาชีพ · เริ่มทำงานได้เร็วขึ้น",
          action: "training",
          application: {
            kind: "trade",
            skill: "practice",
            threshold: 34,
            subject: "สมัครเข้าเรียนสายอาชีพ",
          },
          delta: [1, 0, 4, 1, -2],
          log: "เลือกเรียนสายอาชีพเพื่อเตรียมทำงาน",
        },
        {
          label: "เริ่มทำงานเต็มเวลา",
          sub: "ช่วยรายจ่ายในบ้าน · การเรียนหยุดลง",
          action: "work",
          delta: [-2, 0, 0, 4, 10],
          log: "เริ่มทำงานเต็มเวลาแทนการเรียนต่อ",
        },
        {
          label: "ขอทุนเรียนมัธยมปลาย",
          sub: "เหมาะกับคนที่อยากเรียนต่อแต่ต้องคุมค่าใช้จ่าย",
          action: "upper-school-scholarship",
          application: { kind: "study", skill: "study", threshold: 52, fallbackIndex: 0, subject: "คัดเลือกทุนมัธยมปลาย" },
          delta: [-1, 0, 9, 1, 2],
          log: "สมัครทุนเพื่อเรียนมัธยมปลาย",
          lesson: "ขอความช่วยเหลือเมื่อจำเป็นเป็นการวางแผน ไม่ใช่ความล้มเหลว",
        },
        {
          label: "พักเรียนชั่วคราวและเตรียมสอบใหม่",
          sub: "ช่วยงานที่บ้านระหว่างวางแผนกลับไปเรียน",
          action: "gap-study",
          delta: [-1, 1, 2, 3, 2],
          log: "พักเรียนเพื่อช่วยที่บ้านและเตรียมโอกาสกลับไปเรียน",
          lesson: "เส้นทางที่ช้าลงยังพาไปถึงเป้าหมายได้",
        },
      ],
    },
    {
      age: 18,
      icon: "book",
      title: "ก้าวแรกสู่ชีวิตผู้ใหญ่",
      desc: "การเรียนที่ผ่านมาฐานะของบ้านและโอกาสในพื้นที่ ส่งผลต่อทางเลือกเรื่องงานและการศึกษาต่อ",
      options: [
        {
          label: "ย้ายเข้าเมืองเพื่อเรียนต่อมหาวิทยาลัย",
          sub:
            studyCity.city +
            " · " +
            studyCity.country +
            " · มีค่าเดินทางและที่พักเพิ่ม",
          action: "move",
          dest: studyCity,
          application: {
            kind: "study",
            threshold: 52,
            subject: "สอบเข้ามหาวิทยาลัยในเมืองใหญ่",
          },
          delta: [0, 5, 11, -2, -9],
          log: "ย้ายไปเรียนต่อในเมือง " + studyCity.city,
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
        {
          label: "สมัครสายอาชีพ",
          sub: "ฝึกทักษะที่ตลาดงานต้องการ · มีรายได้ระหว่างฝึก",
          action: "training",
          application: {
            kind: "trade",
            skill: "practice",
            threshold: 42,
            subject: "ทดสอบทักษะสายอาชีพ",
          },
          delta: [1, 2, 4, 2, 5],
          log: "สมัครฝึกสายอาชีพและเริ่มเก็บทักษะทำงาน",
        },
        {
          label: "ทำงานพาร์ตไทม์และเตรียมสมัครเรียน",
          sub: "มีรายได้บางส่วน · ต้องแบ่งเวลาและเก็บเงิน",
          action: "gap-year",
          delta: [-1, 1, 3, 2, 5],
          log: "ทำงานพาร์ตไทม์พร้อมเตรียมแผนเรียนต่อ",
          lesson: "การเริ่มจากสิ่งที่ทำไหวช่วยให้เป้าหมายใหญ่จับต้องได้",
        },
      ],
    },
    {
      age: 21,
      icon: "book",
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
      icon: "work",
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
        {
          label: "สมัครงานสายที่ถนัด",
          sub: "ตำแหน่งเริ่มต้น · ใช้ทักษะเด่นของคุณ",
          action: "stay",
          application: {
            kind: "job",
            skill: "study",
            threshold: 48,
            subject: "คัดเลือกงานตรงสาย",
          },
          delta: [0, 2, 2, 2, 7],
          log: "สมัครงานที่ตรงกับความสามารถเด่น",
        },
      ],
    },
    {
      age: 27,
      icon: "compass",
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
      icon: "plane",
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
      icon: "family",
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
      icon: "home",
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
      icon: "home",
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
      icon: "health",
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
      icon: "family",
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
      icon: "world",
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
      icon: "sun",
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
      icon: "sun",
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
      icon: "home",
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
  const thaiMoments = [
    {
      age: 7,
      icon: "family",
      scene: "songkran",
      title: "สงกรานต์กับคนในบ้าน",
      desc: "ช่วงปิดเทอม ญาติชวนกลับไปหาผู้ใหญ่ที่บ้าน มีทั้งรดน้ำขอพร เล่นน้ำหน้าซอย และช่วยเตรียมกับข้าว คุณอยากใช้วันหยุดแบบไหน?",
      options: [
        {
          label: "ไปหาผู้ใหญ่และช่วยจัดโต๊ะอาหาร",
          sub: "อยู่กับครอบครัว · เรียนรู้การดูแลกัน",
          action: "family-time",
          delta: [1, 5, 1, 8, -1],
          log: "ใช้วันสงกรานต์ไปหาผู้ใหญ่และช่วยเตรียมอาหาร",
          lesson: "การกลับไปใช้เวลาด้วยกันมีค่ากว่าของฝากราคาแพง",
        },
        {
          label: "เล่นน้ำกับเพื่อนบ้านแล้วช่วยเก็บขยะ",
          sub: "สนุกกับเพื่อน · รับผิดชอบพื้นที่ร่วมกัน",
          action: "child-social",
          delta: [2, 8, 0, 5, 0],
          log: "เล่นน้ำสงกรานต์กับเพื่อนบ้านและช่วยกันเก็บพื้นที่",
          lesson: "ความสนุกในชุมชนไปด้วยกันได้กับการดูแลพื้นที่ส่วนรวม",
        },
        {
          label: "ช่วยญาติขายน้ำและของกินหน้าบ้าน",
          sub: "ได้เรียนรู้การค้าขาย · เหนื่อยและพลาดเวลาเล่น",
          action: "help-family",
          delta: [-1, 2, 2, 3, 4],
          log: "ช่วยญาติขายเครื่องดื่มและอาหารในช่วงสงกรานต์",
          lesson: "งานเล็ก ๆ สอนให้เห็นทั้งแรงงานและรายได้ของครอบครัว",
        },
      ],
    },
    {
      age: 13,
      icon: "book",
      scene: "wai-khru",
      title: "วันไหว้ครูที่โรงเรียน",
      desc: "ห้องเรียนช่วยกันจัดพานดอกไม้ก่อนพิธี เพื่อนชวนคุณลงแรงทำพานและขึ้นไปกล่าวขอบคุณครู แต่ช่วงบ่ายยังมีงานที่บ้านรออยู่",
      options: [
        {
          label: "ช่วยเพื่อนทำพานและร่วมพิธี",
          sub: "ฝึกทำงานเป็นทีม · ใช้เวลาหลังเลิกเรียน",
          action: "school-club",
          delta: [0, 4, 3, 6, 0],
          log: "ช่วยเพื่อนทำพานดอกไม้และร่วมพิธีไหว้ครู",
          lesson: "การขอบคุณครูยังเป็นเรื่องของการลงมือเรียนรู้และดูแลกันทุกวัน",
        },
        {
          label: "กลับบ้านไปช่วยดูแลน้อง",
          sub: "รับผิดชอบที่บ้าน · พลาดกิจกรรมกับเพื่อน",
          action: "family-time",
          delta: [0, 1, 1, 5, 0],
          log: "กลับบ้านหลังเลิกเรียนเพื่อช่วยดูแลน้อง",
          lesson: "บางวันความรับผิดชอบในบ้านมาก่อนกิจกรรมที่โรงเรียน",
        },
      ],
    },
    {
      age: 20,
      icon: "family",
      scene: "loy-krathong",
      title: home.city === "เชียงใหม่" ? "คืนยี่เป็งริมแม่น้ำปิง" : "คืนลอยกระทง",
      desc: home.city === "เชียงใหม่"
        ? "หลังเลิกเรียนหรือเลิกงาน เพื่อนชวนไปดูโคมและงานยี่เป็งริมแม่น้ำปิง คุณจะใช้เวลาคืนนี้อย่างไร?"
        : "คืนวันเพ็ญ เพื่อนชวนไปริมแม่น้ำ มีทั้งกระทงทำจากวัสดุธรรมชาติ ร้านอาหาร และคนที่มาช่วยกันดูแลริมน้ำ",
      options: [
        {
          label: "ทำกระทงจากวัสดุธรรมชาติไปกับครอบครัว",
          sub: "รักษาธรรมเนียม · ใช้เวลาและค่าเดินทาง",
          action: "family-time",
          delta: [0, 7, 1, 7, -2],
          log: "ทำกระทงจากวัสดุธรรมชาติและไปงานกับครอบครัว",
          lesson: "ประเพณีมีความหมายขึ้นเมื่อเราคิดถึงทั้งผู้คนและแม่น้ำที่ใช้ร่วมกัน",
        },
        {
          label: "ไปช่วยเก็บขยะหลังงาน",
          sub: "ได้รู้จักชุมชน · ใช้เวลาช่วงกลางคืน",
          action: "volunteer",
          delta: [-1, 4, 2, 6, 0],
          log: "ช่วยอาสาเก็บขยะและดูแลพื้นที่ริมน้ำหลังงาน",
          lesson: "การรักษาประเพณีรวมถึงการรับผิดชอบผลกระทบที่เกิดขึ้นด้วย",
        },
        {
          label: "อยู่ทำงานพิเศษที่ร้านอาหาร",
          sub: "เก็บเงินเพิ่ม · พลาดเวลาร่วมงาน",
          action: "part-time",
          delta: [-2, -1, 1, 0, 5],
          log: "รับงานพิเศษในคืนเทศกาลเพื่อเพิ่มเงินเก็บ",
          lesson: "โอกาสและรายได้สำคัญ แต่การพักและเจอคนใกล้ตัวก็มีต้นทุน",
        },
      ],
    },
  ];
  return schedule.concat(thaiMoments).sort((a, b) => a.age - b.age);
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
    ["book", "วิชาการ", abilities.study, "#91cbe0"],
    ["world", "ภาษา", abilities.language, "#b49be7"],
    ["tools", "ทักษะงาน", abilities.practice, "#95d7b1"],
    ["message", "สื่อสาร", abilities.interview, "#f5c676"],
  ];
  rack.innerHTML = rows
    .map(
      ([icon, label, value, tone]) =>
        `<div class="ability" style="--tone:${tone}"><span class="abilityLabel">${uiIcon(icon)}${label}</span><b>${Math.round(value)}</b><i><u style="width:${clamp(value, 0, 100)}%"></u></i></div>`,
    )
    .join("");
}

function applicationScore(application) {
  if (application.skill) {
    const core = abilities[application.skill] || 0;
    const support =
      application.kind === "study"
        ? stats.know * 0.2 + abilities.language * 0.15
        : abilities.interview * 0.25 + stats.know * 0.1;
    const experienceBonus = application.kind === "trade" && age < 18
      ? Math.max(0, age - 8) * 0.75 + birthLife.householdRank * 1.1
      : 0;
    return core * 0.65 + support + experienceBonus;
  }
  const base = application.kind === "study"
    ? abilities.study * 0.55 + abilities.language * 0.2 + stats.know * 0.25
    : application.kind === "job"
      ? abilities.practice * 0.45 +
        abilities.interview * 0.4 +
        stats.health * 0.15
      : abilities.practice * 0.55 +
        abilities.interview * 0.25 +
        stats.know * 0.2;
  if (application.kind !== "study" || age > 18) return base;
  const schoolAccess = indicator(origin, "secondaryCompletion")?.value || 55;
  const accessBonus = 9 + birthLife.householdRank * 1.5 + schoolAccess * 0.06;
  const experienceBonus = Math.max(0, age - 6) * 0.65;
  return base + accessBonus + experienceBonus;
}

function careerRecommendation() {
  const tracks = [
    {
      skill: "study",
      title: "ข้อมูลและเทคโนโลยี",
      role: "ผู้ช่วยวิเคราะห์ข้อมูล",
      icon: "work",
    },
    {
      skill: "language",
      title: "ภาษาและสื่อสารนานาชาติ",
      role: "ผู้ประสานงานภาษา",
      icon: "world",
    },
    {
      skill: "practice",
      title: "ช่างเทคนิคและงานฝีมือ",
      role: "ช่างเทคนิคฝึกหัด",
      icon: "tools",
    },
    {
      skill: "interview",
      title: "ธุรกิจและการประสานงาน",
      role: "ผู้ช่วยประสานงาน",
      icon: "message",
    },
  ];
  return tracks.sort((a, b) => abilities[b.skill] - abilities[a.skill]);
}

function scheduledActivity() {
  const hour = Math.floor((simulationMinutes % 1440) / 60);
  const student =
    workLife?.job.includes("นักศึกษา") || workLife?.job.includes("นักเรียน");
  const working = age >= 14 && workLife?.hours > 0 && !workLife?.job.includes("เกษียณ");
  if (age < 3)
    return hour < 6 || hour >= 20
      ? { name: "งีบหลับในเปล", kind: "rest" }
      : hour < 9
        ? { name: "ตื่นมาอยู่กับครอบครัว", kind: "family" }
        : { name: "เล่นในบ้านและสำรวจสิ่งรอบตัว", kind: "home" };
  if (age < 6)
    return hour < 8
      ? { name: "ตื่นนอนและกินข้าวกับครอบครัว", kind: "cook" }
      : hour < 15
        ? { name: "เล่นและเรียนรู้ในชุมชน", kind: "exercise" }
        : { name: "ช่วยงานบ้านเล็ก ๆ", kind: "home" };
  if (age < 14 && !student && workLife?.job === "เด็กเล็ก")
    return hour < 8
      ? { name: "เตรียมตัวไปโรงเรียน", kind: "home" }
      : hour < 16
        ? { name: "เรียนรู้และเล่นกับเพื่อน", kind: "study" }
        : { name: "กลับบ้านช่วยครอบครัว", kind: "family" };
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

function activityAfterChoice(option) {
  const action = option.action || "";
  if (action === "stay" && /นักเรียน|นักศึกษา/.test(workLife?.job || "")) {
    return { name: "เริ่มต้นเส้นทางการเรียน", kind: "study" };
  }
  if (["travel", "move", "return"].includes(action)) {
    return { name: "ออกเดินทางไปยังสถานที่ใหม่", kind: "travel" };
  }
  if (["school", "family-work", "informal-school", "scholarship-school", "private-school", "secondary-school", "competitive-secondary", "study-family-work", "community-learning", "academic-scholarship", "upper-school", "upper-school-scholarship", "gap-study"].includes(action)) {
    return { name: "เริ่มต้นเส้นทางการเรียน", kind: "study" };
  }
  if (["child-social", "child-home", "child-hobby", "peer-support", "school-club", "family-time", "children", "care-plan", "community", "help-family"].includes(action)) {
    return { name: "ใช้เวลากับคนสำคัญ", kind: "family" };
  }
  if (["health-break", "retire", "rest"].includes(action)) {
    return { name: "พักและดูแลตัวเอง", kind: "rest" };
  }
  if (["exercise", "sports"].includes(action)) {
    return { name: "ออกกำลังกาย", kind: "exercise" };
  }
  if (["work", "training", "internship", "promotion", "business", "career-change", "part-time", "volunteer"].includes(action)) {
    return { name: "เริ่มทำงานตามเส้นทางที่เลือก", kind: "work" };
  }
  return scheduledActivity();
}

function visibleActivity() {
  return choiceActivity && simulationMinutes < choiceActivityUntil
    ? choiceActivity
    : scheduledActivity();
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
  factorAge = 0,
  actionCycle = -1;
function formatMoney(n) {
  return Math.max(0, Math.round(n)).toLocaleString("th-TH");
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
  const a = visibleActivity();
  const activityIcons = {
    rest: "sun",
    home: "home",
    commute: "compass",
    study: "book",
    lunch: "home",
    work: "work",
    cook: "home",
    family: "family",
    exercise: "health",
    travel: "plane",
  };
  const n = `${Math.floor(simulationMinutes / 30)}-${current?.city}`;
  if (n === actionCycle && !force) return;
  actionCycle = n;
  document.getElementById("activityName").innerHTML =
    `${uiIcon(activityIcons[a.kind] || "compass")}<span>${escapeHtml(a.name)}</span>`;
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
  document.getElementById("activityClock").innerHTML =
    `${uiIcon("sun")}<span>วัน${days[day]} · ${clock}</span>`;
}
function updatePlace() {
  if (!origin || !current) return;
  document.getElementById("activityPlace").textContent =
    current.city + " · " + current.country;
  document.getElementById("originLabel").textContent =
    birthLife.name + " · เกิดที่ " +
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
  document.getElementById("traits").innerHTML = [
    `${birthLife.rural ? "ชุมชนชนบท" : "ย่านเมือง"}`,
    `ฐานะครอบครัว ${birthLife.householdRank}/5`,
    birthLife.interest || "กำลังค้นหาสิ่งที่ชอบ",
  ]
    .map((label) => `<span class="stop">${escapeHtml(label)}</span>`)
    .join("");
}
function renderJournal() {
  const journal = document.getElementById("lifeJournal");
  if (!journal) return;
  const recentEvents = lifeLog.slice().reverse();
  const count = document.getElementById("journalCount");
  const preview = document.getElementById("journalPreview");
  if (count) count.textContent = `${lifeLog.length} เหตุการณ์สำคัญ`;
  if (preview) preview.textContent = lifeLog.at(-1)?.text || "จุดเริ่มต้นของชีวิต";
  const statNames = ["สุขภาพ", "ความสุข", "ความรู้", "คนใกล้ตัว", "เงินเก็บ"];
  journal.innerHTML = recentEvents.length
    ? recentEvents
        .map(
          (entry) => {
            const impacts = Array.isArray(entry.delta)
              ? entry.delta
                  .map((value, index) => ({ value, name: statNames[index] }))
                  .filter((change) => change.value)
                  .map(
                    (change) =>
                      `<span class="journalImpact ${change.value > 0 ? "up" : "down"}">${change.name} ${change.value > 0 ? "+" : ""}${change.value}</span>`,
                  )
                  .join("")
              : "";
            return `<article class="journalEntry"><span class="journalAge">อายุ ${entry.age} · ${escapeHtml(entry.place || current.city)}</span><b>${escapeHtml(entry.text)}</b>${entry.lesson ? `<p class="journalLesson">${escapeHtml(entry.lesson)}</p>` : ""}${impacts ? `<div class="journalImpacts">${impacts}</div>` : ""}</article>`;
          },
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

function renderEnding() {
  const years = Math.max(0, Math.floor(lifeEndAge));
  const familySummary = [
    ...familyLife.members.map(
      (member) => `${member.role} · อายุ ${member.age} · สุขภาพ ${Math.round(member.health)}`,
    ),
    familyLife.partner ? "คู่ชีวิต" : null,
    familyLife.children ? `ลูก ${familyLife.children} คน` : null,
    familyLife.caregiving ? "มีภาระดูแลคนในบ้าน" : null,
  ].filter(Boolean);
  const summary = [
    ["จุดเริ่มต้น", `${birthLife.name} · ${birthLife.sex} · ${birthLife.birthplace} · ${birthLife.rural ? "ชุมชนชนบท" : "เขตเมือง"} · พื้นฐานครอบครัวระดับ ${birthLife.householdRank}/5`],
    ["บ้านและการเดินทาง", `${origin.city}, ${origin.country} → ${current.city}, ${current.country} · ${new Set(visited.map((place) => place.city + place.country)).size} เมือง`],
    ["การเรียน", `${workLife.education} · ความรู้ ${Math.round(stats.know)} · วิชาการ ${Math.round(abilities.study)}`],
    ["งาน", `${workLife.job} · ประสบการณ์ ${workLife.experience} ปี · ทำงาน ${workLife.hours} ชม./สัปดาห์`],
    ["ครอบครัว", familySummary.length ? familySummary.join(" · ") : "ใช้ชีวิตอย่างอิสระ · ไม่มีผู้พึ่งพิง"],
    ["ความสามารถ", `วิชาการ ${Math.round(abilities.study)} · ภาษา ${Math.round(abilities.language)} · ทักษะงาน ${Math.round(abilities.practice)} · สื่อสาร ${Math.round(abilities.interview)}`],
    ["การเงิน", `เงินเก็บ ${formatMoney(finances.savings)} · หนี้ ${formatMoney(finances.debt)} · มูลค่าบ้าน ${formatMoney(finances.homeEquity)} · รายรับส่วนตัว/เดือน ${formatMoney(finances.personalIncome)} · รายรับบ้าน/เดือน ${formatMoney(finances.income)} · ค่าใช้จ่ายพื้นฐาน/เดือน ${formatMoney(finances.baseSpend)}`],
    ["สุขภาพและชีวิต", `สุขภาพ ${Math.round(stats.health)} · สุขใจ ${Math.round(stats.happy)} · ใกล้ชิด ${Math.round(stats.rel)} · สุขภาพใจ ${Math.round(healthLife.mental)} · ความเครียด ${Math.round(healthLife.stress)}`],
    ["ที่อยู่อาศัย", `${socialLife.housing} · ${socialLife.visa}`],
  ];
  document.getElementById("endingText").textContent =
    `อายุ ${Math.floor(lifeEndAge)} ปี · ใช้ชีวิต ${years} ปี · ${lifeLog.length} เหตุการณ์สำคัญ · อายุขัยเฉลี่ยประเทศเกิด ${metric(origin, "lifeExpectancy")} ปี`;
  document.getElementById("endingSummary").innerHTML = summary
    .map(([title, detail]) => `<article class="endingCard"><h4>${escapeHtml(title)}</h4><p>${escapeHtml(detail)}</p></article>`)
    .join("");
  const timeline = document.getElementById("endingTimeline");
  timeline.innerHTML = lifeLog.length
    ? lifeLog
        .map((entry, index) => `<div class="endingEntry"><span>${String(index + 1).padStart(2, "0")} · อายุ ${entry.age}</span><p>${escapeHtml(entry.text)}</p></div>`)
        .join("")
    : '<p class="endingEmpty">ชีวิตนี้ยังไม่มีบันทึกเหตุการณ์</p>';
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
  compass:
    '<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.5 5.1-5.1 2.5 2.5-5.1 5.1-2.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  tools: '<path d="m14.7 6.3 3 3M4 20l8.8-8.8m2.1-6.7a4 4 0 0 0 5.3 5.3l-4.5 4.5-5.3-5.3L15 5.5a4 4 0 0 0-5.3-5.3"/><path d="m13 12 6 6a2 2 0 0 1-3 3l-6-6"/>',
  message: '<path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-3.5-.7L4 20l1.5-4A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/><path d="M8 11h8M8 14h5"/>',
  balance: '<path d="M12 3v18M5 6h14M8 6l-4 7h8L8 6Zm8 0-4 7h8l-4-7ZM5 21h14"/>',
  hobby: '<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.6-3.2 1.7 1.7 0 0 1 1.4-2.8H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9Z"/><path d="M7.5 10h.01M11 7h.01M15.5 9h.01"/>',
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
  return icons[age] || "compass";
}

function uiIcon(k) {
  return (
    '<svg class="uiIcon" viewBox="0 0 24 24" aria-hidden="true">' +
    (iconPaths[k] || iconPaths.compass) +
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
  let p = places.find((x) => x.country === country) || (country === "ไทย" ? thailand : null);
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
  const familyName = pickFrom([
    "ศรีสุข", "วัฒนกุล", "แสงทอง", "ใจดี", "บุญมี", "พูนผล", "แก้วมณี", "ตั้งตรง", "สุขสันต์", "อินทร์คำ",
  ]);
  const givenNames = ["มินท์", "ภูมิ", "ฟ้า", "ต้น", "น้ำ", "ธารา", "นัท", "ปัน", "กานต์", "ข้าวหอม"];
  const adultNames = ["มาลี", "สมชาย", "สุรีย์", "ประเสริฐ", "อรทัย", "วิชัย", "รัตนา", "นิรันดร์", "จันทร์", "วรรณา"];
  const urbanShare = {
    "กรุงเทพฯ": 97,
    "ชลบุรี": 74,
    "เชียงใหม่": 69,
    "ภูเก็ต": 65,
    "ขอนแก่น": 62,
    "นครราชสีมา": 58,
    "อุดรธานี": 55,
  }[origin.city] || indicator(origin, "urban")?.value || 50;
  const isRural = Math.random() > urbanShare / 100;
  const maternalAge = 20 + Math.floor(Math.random() * 19);
  const paternalAge = maternalAge + 1 + Math.floor(Math.random() * 12);
  birthLife = {
    name: `${pickFrom(givenNames)} ${familyName}`,
    sex: Math.random() < 0.5 ? "หญิง" : "ชาย",
    rural: isRural,
    householdRank: clamp(
      Math.round(3 + normal() * (0.8 + (gini?.value || 40) / 120)),
      1,
      5,
    ),
    birthplace: isRural ? `ชนบทใกล้${origin.city}` : origin.city,
    homeStyle: isRural ? "บ้านครอบครัวในชุมชนชนบท" : "บ้านครอบครัวในย่านที่อยู่อาศัย",
    parents: [],
  };
  const parentCount = Math.random() < 0.34 ? 1 : 2;
  const siblings = Math.floor(
    Math.random() * (clamp(Math.round((fert?.value || 1.8) * 0.55), 0, 4) + 1),
  );
  const familyMembers = Array.from({ length: parentCount }, (_, index) => {
    const parent = {
      icon: "○",
      role: index === 0 ? "แม่" : "พ่อ",
      name: `${pickFrom(adultNames)} ${familyName}`,
      age: index === 0 ? maternalAge : paternalAge,
      health: 62 + Math.floor(Math.random() * 32),
      job: pickFrom(
        isRural
          ? ["เกษตรกรรายย่อย", "ค้าขายเล็ก ๆ", "รับจ้างทั่วไป", "ครูประถม"]
          : ["พนักงานบริการ", "ค้าขาย", "พนักงานโรงงาน", "เจ้าหน้าที่รัฐ"],
      ),
    };
    birthLife.parents.push(parent);
    return parent;
  });
  for (let index = 0; index < siblings; index++) {
    familyMembers.push({
      icon: "○",
      role: `${Math.random() < 0.5 ? "พี่" : "น้อง"}${Math.random() < 0.5 ? "ชาย" : "สาว"}`,
      name: `${pickFrom(givenNames)} ${familyName}`,
      age: 1 + Math.floor(Math.random() * 13),
      health: 70 + Math.floor(Math.random() * 25),
    });
  }
  if (Math.random() < 0.2) {
    familyMembers.push({
      icon: "○",
      role: pickFrom(["ยาย", "ตา", "ย่า", "ปู่"]),
      name: `${pickFrom(adultNames)} ${familyName}`,
      age: 62 + Math.floor(Math.random() * 24),
      health: 48 + Math.floor(Math.random() * 42),
    });
  }
  const householdSize = clamp(1 + familyMembers.length, 2, 7),
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
  stats.wealth = clamp(
    35 + Math.log10(finances.savings / Math.max(1, finances.baseSpend) + 1) * 18 -
      (finances.debt / Math.max(1, finances.baseSpend)) * 8,
    5,
    98,
  );
  familyLife = {
    members: familyMembers,
    partner: false,
    children: 0,
    caregiving: false,
    distance: false,
    householdSize,
  };
  workLife = {
    education: "ยังไม่เข้าเรียน",
    job: "เด็กเล็ก",
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
    housing: birthLife.homeStyle,
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
    }[tier];
  let familyRoles =
      familyLife.members
        .map((x) => `${x.role} ${x.name} · ${x.age} ปี${x.job ? ` · ${x.job}` : ""}`)
        .join(" · ") || "ไม่มีข้อมูล",
    childText = familyLife.children ? familyLife.children + " คน" : "ไม่มีลูก";
  const row = (label, value, long = false) =>
    `<div class="sysrow"><span>${escapeHtml(label)}</span><b${long ? ' class="long"' : ""}>${escapeHtml(value)}</b></div>`;
  const card = (key, title, badge, rows) =>
    `<article class="systemCard"><h3>${uiIcon(key)}${escapeHtml(title)} <span>${escapeHtml(badge)}</span></h3>${rows}</article>`;
  const cards = [
    card(
      "money",
      "เงิน & บ้าน",
      "≈ / เดือน",
      row(
        "รายได้ / เดือน",
        formatMoney(finances.income) +
          " · ส่วนตัว " +
          formatMoney(finances.personalIncome),
      ) +
        row(
          "รายจ่าย / เหลือสุทธิ",
          formatMoney(costs) +
            " / " +
            (net >= 0 ? "+" : "−") +
            formatMoney(Math.abs(net)),
        ) +
        row(
          "เงินเก็บ / หนี้",
          formatMoney(finances.savings) + " / " + formatMoney(finances.debt),
        ) +
        row(
          "ที่อยู่ / มูลค่าบ้าน",
          socialLife.housing + " / " + formatMoney(finances.homeEquity),
        ) +
        '<div class="tinybar"><i style="width:' +
        Math.min(100, buffer * 8) +
        '%"></i></div>',
    ),
    card(
      "family",
      "ครอบครัว",
      `${finances.householdSize} คน`,
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
        row("ว่างงานในประเทศ", metric(origin, "unemployment") + "%"),
    ),
    card(
      "health",
      "สุขภาพกาย & ใจ",
      "สุขภาพ",
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
        row("อายุขัยประเทศ", metric(origin, "lifeExpectancy") + " ปี"),
    ),
    card(
      "world",
      "ประเทศ & สังคม",
      tierLabel,
      row("เกิดที่", origin.city + " · " + origin.country, true) +
        row("ปัจจุบัน", current.city + " · " + current.country, true) +
        row("วีซ่า / พำนัก", socialLife.visa, true) +
        row("ค่าครองชีพ / เดือน", formatMoney(finances.baseSpend)) +
        row(
          "อยู่ในเมือง / ว่างงาน",
          metric(origin, "urban") +
            "% / " +
            metric(origin, "unemployment") +
            "%",
        ),
    ),
  ];
  panel.innerHTML = cards.join("");
}
function showEvent(event) {
  activeEvent = event;
  paused = true;

  const topTrack = careerRecommendation()[0];
  const practicalTrack = careerRecommendation().find(
    (track) => track.skill === "practice",
  );
  if (event.age === 18) {
    event.options[1].label = `เรียนต่อคณะ${topTrack.title}`;
    event.options[1].application.skill = "study";
    event.options[1].sub = `หลักสูตรใกล้บ้าน · ใช้คะแนนวิชาการ ${Math.round(abilities.study)}`;
    event.options[2].label = `สมัครงานเริ่มต้น · ${topTrack.role}`;
    event.options[2].application.skill = topTrack.skill;
    event.options[3].label = `สมัคร${practicalTrack.title}`;
    event.options[3].application.skill = "practice";
    event.options[3].log = `สมัครฝึกสายอาชีพด้าน${practicalTrack.title}`;
  }
  if (event.age === 14 || event.age === 16) {
    const preferredTrack = careerRecommendation()[0];
    const training = event.options[1];
    training.label = `สมัครสาย${preferredTrack.title}`;
    training.sub = `ใช้จุดแข็งด้าน${preferredTrack.title} · ต่อเป็นงาน${preferredTrack.role}`;
    training.application.skill = preferredTrack.skill;
    training.application.subject = `คัดเลือกหลักสูตร${preferredTrack.title}`;
    training.log = `เริ่มฝึกสาย${preferredTrack.title} ตามความถนัด`;
    const workOption = event.options[2];
    workOption.label = event.age === 16
      ? `เริ่มฝึกงานด้าน${preferredTrack.title}`
      : "เริ่มทำงานช่วยครอบครัว";
    if (event.age === 16) workOption.log = `เริ่มทำงานฝึกหัดด้าน${preferredTrack.title}`;
  }
  if (event.age === 21 && event.route !== "work") {
    event.options[0].label = `ฝึกงานด้าน${topTrack.title}`;
    event.options[0].application.skill = topTrack.skill;
    event.options[0].application.subject = `คัดเลือกฝึกงาน · ${topTrack.role}`;
  }
  if (event.age === 24) {
    event.options[3].label = `สมัครเป็น${topTrack.role}`;
    event.options[3].application.skill = topTrack.skill;
    event.options[3].application.subject = `คัดเลือกตำแหน่ง${topTrack.role}`;
    event.options[3].log = `สมัครงานสาย${topTrack.title}ให้ตรงกับความถนัด`;
  }

  if (event.age === 21) {
    const studying =
      workLife.job.includes("นักศึกษา") || workLife.job === "นักเรียน";
    event.route = studying ? "study" : "work";
    if (!studying) {
      const nextCity = pickThai([current.city, origin.city]);
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
  const impactNames = ["สุขภาพ", "ความสุข", "ความรู้", "คนใกล้ตัว", "เงินเก็บ"];
  optionList.replaceChildren(
    ...event.options.map((option, index) => {
      const button = document.createElement("button");
      const detail = document.createElement("small");
      const impact = document.createElement("span");
      button.className = "opt";
      button.type = "button";
      const icon = option.application
        ? option.application.kind === "study"
          ? "book"
          : option.application.kind === "job"
            ? "work"
            : "tools"
        : "compass";
      button.innerHTML = `${uiIcon(icon)}<span>${escapeHtml(option.label)}</span>`;
      detail.textContent = option.application
        ? `${option.sub} · ${option.application.subject} · คะแนน ${Math.round(applicationScore(option.application))} / ${option.application.threshold}`
        : option.sub;
      impact.className = "optionImpact";
      impact.textContent = option.delta
        .map((value, statIndex) => ({ value, label: impactNames[statIndex] }))
        .filter((item) => item.value !== 0)
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 2)
        .map((item) => `${item.label} ${item.value > 0 ? "+" : "−"}${Math.abs(item.value)}`)
        .join(" · ");
      button.append(detail, impact);
      button.addEventListener("click", () => choose(index), { once: true });
      return button;
    }),
  );
}

function updateTime() {
  age = Math.max(0, Math.min(lifeEndAge, Math.max(0, elapsed) * speed));
  let yr = Math.floor(2026 + age);
  const stage = age < 3 ? "วัยทารก" : age < 6 ? "วัยเด็กเล็ก" : age < 14 ? "วัยประถม" : age < 18 ? "วัยรุ่น" : age < 29 ? "เริ่มต้นชีวิต" : age < 45 ? "วัยทำงาน" : age < 60 ? "วัยกลางคน" : "บั้นปลาย";
  document.getElementById("age").textContent = Math.floor(age) + " ปี";
  document.getElementById("date").textContent = `${yr} · ${stage}`;
  document.getElementById("era").textContent = stage;
  document.getElementById("lifeNow").textContent =
    age < 6
      ? "เติบโตท่ามกลางครอบครัวและชุมชนรอบบ้าน"
      : age < 14
        ? "เรียนรู้ทักษะพื้นฐานและสร้างความทรงจำวัยเด็ก"
        : age < 18
          ? "กำลังเลือกเส้นทางเรียนและเตรียมสู่วัยทำงาน"
      : age < 29
        ? "เริ่มสร้างทางของตัวเอง งาน ความรู้ และเมืองใหม่ๆ"
        : age < 45
          ? "ทำงาน ดูแลคนใกล้ตัว และเลือกว่าที่ไหนคือบ้าน"
          : age < 60
            ? "ชีวิตที่สร้างมาค่อยๆ เปลี่ยนจังหวะและความสำคัญ"
            : "มีเวลาให้สิ่งที่เคยถูกเลื่อนไปก่อน";
  let pct = (age / Math.max(1, lifeEndAge)) * 100;
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
    case 5:
      birthLife.interest = ["เพื่อนและการเล่น", "ช่วยดูแลบ้าน", "งานวาดและประดิษฐ์"][choiceIndex];
      if (choiceIndex === 0) abilities.interview += 3;
      if (choiceIndex === 1) abilities.practice += 3;
      if (choiceIndex === 2) abilities.study += 3;
      break;
    case 6:
      if (option.action === "school") {
        workLife.education = "ประถมศึกษา";
        workLife.job = "นักเรียนประถม";
        workLife.hours = 0;
      } else if (option.action === "family-work") {
        workLife.job = "ช่วยงานครอบครัว";
        workLife.hours = 8;
        finances.personalIncome = 0;
      } else {
        workLife.education = option.action === "private-school"
          ? "ประถมศึกษา · โรงเรียนเอกชน"
          : option.action === "scholarship-school"
            ? "ประถมศึกษา · ทุนคัดเลือก"
            : "เรียนรู้ในชุมชน";
        workLife.job = option.action === "informal-school" ? "นักเรียนชุมชน" : "นักเรียนประถม";
        workLife.hours = 0;
        if (option.action === "private-school") finances.debt += finances.income * 0.2;
      }
      break;
    case 8:
      if (option.action === "ask-teacher") {
        abilities.study = clamp(abilities.study + 2, 5, 98);
        abilities.interview = clamp(abilities.interview + 1, 5, 98);
      } else if (option.action === "peer-support") {
        abilities.interview = clamp(abilities.interview + 3, 5, 98);
      } else if (option.action === "help-family") {
        abilities.practice = clamp(abilities.practice + 2, 5, 98);
      }
      break;
    case 10:
      if (option.action === "steady-study") {
        abilities.study = clamp(abilities.study + 3, 5, 98);
      } else if (option.action === "school-club") {
        abilities.interview = clamp(abilities.interview + 2, 5, 98);
        abilities.practice = clamp(abilities.practice + 1, 5, 98);
      } else if (option.action === "family-duty") {
        abilities.practice = clamp(abilities.practice + 2, 5, 98);
      }
      break;
    case 12:
      if (["secondary-school", "competitive-secondary"].includes(option.action)) {
        workLife.education = origin.iso === "THA" ? "มัธยมศึกษาตอนต้น · ม.1" : "มัธยมศึกษาตอนต้น";
        workLife.job = "นักเรียนมัธยมต้น";
        workLife.hours = 0;
      } else if (option.action === "study-family-work") {
        workLife.education = origin.iso === "THA" ? "มัธยมศึกษาตอนต้น · ม.1" : "มัธยมศึกษาตอนต้น";
        workLife.job = "นักเรียนมัธยมต้น · ช่วยงานครอบครัว";
        workLife.hours = 8;
      } else {
        workLife.education = "เรียนรู้ในชุมชน";
        workLife.job = "นักเรียนชุมชน";
        workLife.hours = 0;
      }
      break;
    case 14:
      if (option.action === "secondary-school" || option.action === "academic-scholarship") {
        workLife.education = "มัธยมศึกษาตอนต้น";
        workLife.job = "นักเรียนมัธยมต้น";
        workLife.hours = 0;
      } else if (option.action === "training") {
        workLife.education = `ฝึกทักษะวิชาชีพ · ${option.application?.subject || "ทักษะงาน"}`;
        workLife.job = "ผู้ฝึกงานวัยเยาว์";
        workLife.hours = 12;
      } else {
        workLife.job = "ช่วยงานครอบครัว";
        workLife.hours = 16;
      }
      break;
    case 16:
      if (option.action === "upper-school" || option.action === "upper-school-scholarship") {
        workLife.education = "มัธยมศึกษาตอนปลาย";
        workLife.job = "นักเรียนมัธยมปลาย";
        workLife.hours = 0;
      } else if (option.action === "training") {
        workLife.education = `ประกาศนียบัตรสายอาชีพ · ${option.application?.subject || "วิชาชีพ"}`;
        workLife.job = "นักเรียนอาชีวะ";
        workLife.hours = 10;
      } else if (option.action === "gap-study") {
        workLife.job = "เตรียมสอบและช่วยงานครอบครัว";
        workLife.hours = 12;
      } else {
        workLife.job = "พนักงานฝึกหัด";
        workLife.hours = 32;
        workLife.stability = 42;
        finances.personalIncome = finances.income * 0.25;
      }
      break;
    case 18:
      if (option.action === "move") {
        workLife.education = "ปริญญาตรี · ในประเทศ";
        workLife.job = "นักศึกษา";
        workLife.hours = 16;
        finances.debt += finances.income * 0.8;
        socialLife.visa = "พลเมืองในประเทศเกิด";
        socialLife.housing = "หอพัก / แชร์บ้าน";
      } else if (choiceIndex === 1) {
        workLife.education = "ปริญญาตรี · ในประเทศ";
        workLife.job = "นักศึกษา";
        workLife.hours = 16;
        finances.debt += finances.income * 0.5;
      } else if (choiceIndex === 2) {
        workLife.job = "พนักงานฝึกหัด";
        workLife.hours = 42;
        workLife.stability = 42;
        finances.personalIncome = finances.income * 0.45;
      } else if (choiceIndex === 3) {
        workLife.education = "ประกาศนียบัตรสายอาชีพ";
        workLife.job = "ช่างฝึกหัด · " + current.city;
        workLife.hours = 36;
        workLife.stability = 48;
        workLife.experience = 1;
        finances.personalIncome = finances.income * 0.38;
        finances.debt += finances.income * 0.2;
      } else {
        workLife.job = "ทำงานชั่วคราวเพื่อเตรียมเรียนต่อ";
        workLife.hours = 30;
        workLife.stability = 42;
        finances.personalIncome = finances.income * 0.3;
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
  const isStudent = workLife.job.includes("นักศึกษา") || workLife.job.includes("นักเรียน");
  const isRetired = workLife.job.includes("เกษียณ");
  const workingAge = age >= 16;

  if (workingAge && !isStudent && !isRetired && workLife.job !== "กำลังหางาน") {
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
  } else if (workingAge && workLife.job === "กำลังหางาน") {
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
    35 + Math.log10(finances.savings / Math.max(1, finances.baseSpend) + 1) * 18 -
      (finances.debt / Math.max(1, finances.baseSpend)) * 8,
    5,
    98,
  );
  recordYearlyStory();
  setStats();
  renderSystems();
}

function recordYearlyStory() {
  if (age < 2 || Math.random() > 0.29) return;
  const school = workLife.job.includes("นักเรียน") || workLife.job.includes("นักศึกษา");
  const stories = age < 6
    ? [
        ["ได้รู้จักเพื่อนบ้านที่แวะมาเล่นด้วย", 1, 2],
        ["ช่วยผู้ใหญ่รดน้ำต้นไม้ข้างบ้าน", 0, 1],
        ["เริ่มชอบนิทานและภาพวาดในหนังสือ", 1, 1],
      ]
    : age < 14
      ? school
        ? [["ครูชมความตั้งใจในห้องเรียน", 1, 2], ["ได้ทำงานกลุ่มกับเพื่อนใหม่", 2, 1], ["มีวันที่เรียนไม่ทันเพื่อน แต่ค่อย ๆ ตามได้", -1, 1]]
        : [["ช่วยครอบครัวผ่านช่วงงานยุ่ง", 1, 1], ["ได้เรียนรู้ทักษะใหม่จากคนในชุมชน", 1, 2], ["เพื่อนบ้านชวนไปเล่นหลังทำงานเสร็จ", 2, 0]]
      : age < 18
        ? school
          ? [["เริ่มเห็นวิชาที่ตัวเองถนัด", 1, 2], ["ใช้เวลาหลังเลิกเรียนกับกลุ่มเพื่อน", 2, 1], ["ตารางเรียนแน่นจนต้องแบ่งเวลาพัก", -1, 1]]
          : [["มีรายได้เล็กน้อยช่วยค่าใช้จ่ายในบ้าน", 1, 1], ["ได้เรียนรู้งานจากผู้ใหญ่ในพื้นที่", 1, 2], ["เริ่มคิดถึงโอกาสกลับไปเรียน", -1, 1]]
        : workLife.job.includes("เกษียณ")
          ? [["ใช้เวลาช่วยเหลือคนในชุมชน", 2, 1], ["กลับไปทำกิจกรรมที่เคยชอบ", 2, 0], ["สุขภาพทำให้ต้องปรับกิจวัตร", -1, 0]]
          : [["ได้รู้จักเพื่อนร่วมงานที่คอยช่วยกัน", 2, 1], ["ค่าใช้จ่ายในบ้านเพิ่มขึ้นเล็กน้อย", -1, 0], ["มีวันหยุดที่ได้พักกับครอบครัว", 2, 1], ["เริ่มเก็บเงินเพื่อเป้าหมายระยะยาว", 1, 1]];
  const [text, happiness, relation] = pickFrom(stories);
  stats.happy = clamp(stats.happy + happiness, 5, 98);
  stats.rel = clamp(stats.rel + relation, 5, 98);
  lifeLog.push({ age: Math.floor(age), text });
  renderJournal();
}

function restart() {
  elapsed = 0;
  simulationMinutes = 420;
  age = 0;
  eventIndex = 0;
  factorAge = 0;
  lifeLog = [];
  choiceActivity = null;
  choiceActivityUntil = 0;
  origin = pickThai();
  current = origin;
  home = origin;
  visited = [origin];
  stats = {
    health: 64 + Math.random() * 22,
    happy: 52 + Math.random() * 24,
    know: 12 + Math.random() * 12,
    rel: 48 + Math.random() * 30,
    wealth: 8 + Math.random() * 12,
  };
  abilities = {
    study: clamp(12 + stats.know * 0.58 + normal() * 5, 5, 40),
    language: clamp(10 + stats.know * 0.3 + normal() * 5, 5, 32),
    practice: clamp(11 + normal() * 6, 5, 30),
    interview: clamp(14 + stats.rel * 0.2 + normal() * 4, 5, 32),
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
  events = ageEventData();
  lifeLog.push({ age: 0, text: `เกิดใน${birthLife.birthplace} · ${birthLife.rural ? "ชุมชนชนบท" : "เขตเมือง"} · ครอบครัวมีสมาชิก ${familyLife.members.length} คน` });
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
      const fallbackIndex = Number.isInteger(opt.application.fallbackIndex)
        ? opt.application.fallbackIndex
        : ev.age === 18 ? (i === 0 ? 1 : 2) : 2;
      const fallback = ev.options[fallbackIndex];
      selectedIndex = fallbackIndex;
      opt = {
        ...fallback,
        application: null,
        log:
          resultText +
          (fallbackIndex === 1
            ? "เปลี่ยนไปเรียนใกล้บ้านแทนการย้ายเข้าเมือง"
            : "พักแผนเรียนต่อและเริ่มหาประสบการณ์ทำงาน"),
      };
      resultText = opt.log;
    } else {
      resultText =
        opt.application.kind === "trade"
          ? `คะแนน ${scoreText} ยังไม่ผ่านการทดสอบสายอาชีพ`
          : `คะแนน ${scoreText} ยังไม่ถึงเกณฑ์ · นายจ้างยังไม่รับเข้าทำงาน`;
      if (opt.application.kind === "trade" && ev.age < 18) {
        selectedIndex = ev.options.length - 1;
        opt = {
          ...ev.options[selectedIndex],
          application: null,
          log: `${resultText} · เลือกช่วยงานครอบครัวเป็นทางสำรอง`,
        };
      } else {
        failedApplication = true;
        opt = {
          ...opt,
          log: `${resultText} · ยื่นสมัครงานเพิ่มระหว่างหางาน`,
        };
      }
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
  lifeLog.push({
    age: ev.age,
    text: opt.log,
    lesson: opt.lesson || "",
    delta: opt.delta.slice(),
    place: opt.dest?.city || current.city,
  });
  choiceActivity = activityAfterChoice(opt);
  choiceActivityUntil = simulationMinutes + 180;
  renderJournal();
  updatePlace();
  eventIndex++;
  activeEvent = null;
  setStats();
  updatePlace();
  document.getElementById("decision").classList.remove("show");
  document.getElementById("eventCard").classList.add("waiting");
  document.getElementById("icon").innerHTML = uiIcon("compass");
  document.getElementById("eventTitle").textContent = "ทางเลือกถูกบันทึก";
  document.getElementById("eventDesc").textContent =
    (resultText || opt.log) +
    (opt.lesson ? ` · ข้อคิด: ${opt.lesson}` : " · ผลส่งต่อไปยังเงิน งาน สุขภาพ และคนใกล้ตัว");
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
      renderEnding();
    }
  }
  drawActivity(now);
  requestAnimationFrame(tick);
}
restart();
requestAnimationFrame(tick);
function drawActivity(timestamp) {
  const currentActivity = visibleActivity();
  updateActivityLabel(false);
  LifeScene.draw(timestamp, {
    activity: currentActivity,
    event: activeEvent ? { age: activeEvent.age, scene: activeEvent.scene } : null,
    age,
    location: current,
    family: familyLife,
    clockMinutes: simulationMinutes % 1440,
    character: characterLook,
    job: workLife?.job || "",
    urban: current === origin ? !birthLife?.rural : true,
  });
}
