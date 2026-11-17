import { SampleQuestion, ExerciseCardData, VocabItem } from "@/app/admin/content/reading/types";
import { CURATED_TOEIC_VOCAB } from "@/lib/toeicVocabDetailEnricher";
import { TOEIC_VOCAB_DICT, translateToeicOption } from "@/lib/toeicQuestionEnricher";
import { lookupWordDetail } from "@/components/admin/content/reading/richDictionaryData";
import { formatExplanation } from "@/lib/utils/formatExplanation";

// Từ điển ánh xạ nghĩa tiếng Việt cho các phương án TOEIC thông dụng (Part 5, 6, 7)
export const COMMON_TOEIC_OPTION_TRANSLATIONS: Record<string, string> = {
  // Giới từ (Prepositions)
  with: "(prep): với, cùng với, bằng (công cụ)",
  for: "(prep): cho, vì, dành cho, trong khoảng",
  at: "(prep): tại, ở (địa điểm, thời gian)",
  by: "(prep): trước (thời gian), bởi, bằng cách",
  in: "(prep): trong, ở trong",
  on: "(prep): trên, vào ngày",
  to: "(prep): đến, tới, để (+ V)",
  from: "(prep): từ, xuất phát từ",
  of: "(prep): của, về",
  into: "(prep): vào trong",
  onto: "(prep): lên trên",
  about: "(prep): về, khoảng chừng",
  through: "(prep): xuyên qua, qua, thông qua",
  throughout: "(prep): trên khắp, trong suốt",
  between: "(prep): giữa (2 đối tượng)",
  among: "(prep): giữa (nhiều đối tượng)",
  under: "(prep): dưới, đang chịu sự",
  below: "(prep/adv): phía dưới, ở dưới",
  above: "(prep/adv): phía trên",
  over: "(prep): qua, hơn, trong suốt",
  without: "(prep): không có, thiếu",
  within: "(prep): trong vòng (khoảng thời gian/không gian)",
  against: "(prep): chống lại, dựa vào",
  behind: "(prep): phía sau",
  across: "(prep): băng qua, bên kia",
  along: "(prep): dọc theo",
  alongside: "(prep): bên cạnh, cùng với",
  beside: "(prep): bên cạnh",
  besides: "(prep/adv): ngoài ra, bên cạnh đó",
  near: "(prep/adj): gần",
  toward: "(prep): về phía, hướng tới",
  towards: "(prep): về phía, hướng tới",
  prior: "(adj/prep): trước (prior to: trước khi)",
  instead: "(adv): thay vì (instead of)",
  due: "(adj): do, đến hạn (due to: bởi vì)",
  thanks: "(n/prep): nhờ có (thanks to)",
  regarding: "(prep): liên quan đến, về việc",
  concerning: "(prep): liên quan tới, về",
  despite: "(prep): mặc dù (+ Cụm Noun/V-ing)",
  spite: "(n): bất chấp (in spite of)",
  beneath: "(prep): ở dưới, bên dưới",
  underneath: "(prep): ở dưới đáy, bên dưới",

  // Liên từ & Trạng từ nối (Conjunctions & Transitions)
  before: "(prep/conj): trước khi (+ V-ing / Mệnh đề)",
  after: "(prep/conj): sau khi (+ V-ing / Mệnh đề)",
  during: "(prep): trong suốt (+ Danh từ)",
  while: "(conj): trong khi (+ Mệnh đề/V-ing)",
  until: "(prep/conj): cho đến khi",
  since: "(prep/conj): từ khi, bởi vì",
  because: "(conj): bởi vì (+ Mệnh đề)",
  although: "(conj): mặc dù (+ Mệnh đề)",
  though: "(conj): mặc dù (+ Mệnh đề)",
  even: "(adv): thậm chí (even though: mặc dù; even if: kể cả khi)",
  however: "(adv): tuy nhiên",
  therefore: "(adv): do đó, vì vậy",
  furthermore: "(adv): hơn nữa, hơn thế nữa",
  moreover: "(adv): hơn thế nữa",
  nevertheless: "(adv): tuy nhiên, dẫu vậy",
  meanwhile: "(adv): trong lúc đó",
  otherwise: "(adv/conj): nếu không thì",
  unless: "(conj): trừ khi, nếu không",
  whether: "(conj): liệu rằng (whether... or)",
  either: "(pron/conj): hoặc (either... or: hoặc cái này hoặc cái kia)",
  neither: "(pron/conj): không ai/cái nào (neither... nor)",
  both: "(pron/conj): cả hai (both... and)",
  and: "(conj): và",
  but: "(conj): nhưng",
  or: "(conj): hoặc",
  nor: "(conj): cũng không",
  yet: "(conj/adv): nhưng, chưa",
  so: "(conj/adv): vì vậy, quá",
  as: "(prep/conj): như là, khi, bởi vì",
  consequently: "(adv): do đó, kết quả là",
  subsequently: "(adv): sau đó, tiếp theo",
  accordingly: "(adv): do đó, một cách phù hợp",
  regardless: "(adv): bất kể, không màng tới",
  whereas: "(conj): trong khi đó (chỉ sự đối lập)",
  rather: "(adv): hơn là (rather than: thay vì)",

  // Đại từ nhân xưng & Sở hữu (Pronouns & Possessives)
  i: "(pron): tôi (chủ ngữ)",
  me: "(pron): tôi (tân ngữ)",
  my: "(poss adj): của tôi (đứng trước danh từ)",
  mine: "(poss pron): cái của tôi (đại từ sở hữu)",
  myself: "(refl pron): chính tôi (đại từ phản thân)",
  they: "(pron): họ, chúng nó (làm chủ ngữ)",
  their: "(poss adj): của họ (đứng trước danh từ)",
  theirs: "(poss pron): cái của họ (đại từ sở hữu)",
  them: "(pron): họ, chúng (làm tân ngữ)",
  themselves: "(refl pron): chính họ (đại từ phản thân)",
  he: "(pron): anh ấy, ông ấy (chủ ngữ)",
  his: "(poss adj/pron): của anh ấy",
  him: "(pron): anh ấy (tân ngữ)",
  himself: "(refl pron): chính anh ấy",
  she: "(pron): cô ấy, bà ấy (chủ ngữ)",
  her: "(poss adj/pron): của cô ấy / cô ấy (tân ngữ)",
  hers: "(poss pron): cái của cô ấy",
  herself: "(refl pron): chính cô ấy",
  we: "(pron): chúng tôi, chúng ta (chủ ngữ)",
  our: "(poss adj): của chúng tôi (đứng trước danh từ)",
  ours: "(poss pron): cái của chúng tôi",
  us: "(pron): chúng tôi (tân ngữ)",
  ourselves: "(refl pron): chính chúng tôi",
  you: "(pron): bạn, các bạn",
  your: "(poss adj): của bạn (đứng trước danh từ)",
  yours: "(poss pron): cái của bạn",
  yourself: "(refl pron): chính bạn",
  yourselves: "(refl pron): chính các bạn",
  it: "(pron): nó (chủ ngữ/tân ngữ)",
  its: "(poss adj): của nó (đứng trước danh từ)",
  itself: "(refl pron): chính nó",
  one: "(pron): một người, người ta",
  ones: "(pron): những cái, những người",
  another: "(det/pron): một cái/người khác",
  other: "(det/adj): khác (other + N số nhiều)",
  others: "(pron): những người/cái khác",
  someone: "(pron): ai đó",
  anyone: "(pron): bất kỳ ai",
  everyone: "(pron): mọi người",
  noone: "(pron): không một ai",
  each: "(det/pron): mỗi, từng cái/người",
  every: "(det): mọi, mỗi (+ N số ít)",
  all: "(det/pron): tất cả",
  some: "(det/pron): một vài, một số",
  any: "(det/pron): bất kỳ (trong câu phủ định, nghi vấn)",
  none: "(pron): không ai, không cái nào",
  many: "(det/pron): nhiều (+ N đếm được)",
  much: "(det/pron): nhiều (+ N không đếm được)",
  few: "(adj/pron): ít, hầu như không có (+ N đếm được)",
  fewer: "(adj): ít hơn",
  fewest: "(adj): ít nhất",
  little: "(adj/pron): ít, không đáng kể (+ N không đếm được)",
  less: "(adj/adv): ít hơn",
  least: "(adj/adv): ít nhất",
  several: "(det/pron): một vài, một số (+ N đếm được số nhiều)",

  // Đại từ quan hệ (Relative Pronouns)
  who: "(rel pron): người mà (làm chủ ngữ)",
  whom: "(rel pron): người mà (làm tân ngữ)",
  whose: "(rel pron): có... của người mà (sở hữu)",
  which: "(rel pron): cái mà, điều mà",
  that: "(rel pron/conj): rằng, cái/người mà",
  where: "(rel adv): nơi mà",
  when: "(rel adv): khi mà",
  why: "(rel adv): lý do mà",
  what: "(pron): cái gì, điều gì",

  // Trợ động từ & Động từ To Be (Auxiliaries & Be)
  is: "(v): thì, là, ở (số ít hiện tại)",
  are: "(v): thì, là, ở (số nhiều hiện tại)",
  was: "(v): đã là/ở (số ít quá khứ)",
  were: "(v): đã là/ở (số nhiều quá khứ)",
  be: "(v): nguyên mẫu của to be",
  being: "(v-ing): đang là, đang được (bị động tiếp diễn)",
  been: "(v3/ed): quá khứ phân từ của be",
  have: "(v): có, đã (+ V3/ed)",
  has: "(v): có (ngôi thứ 3 số ít), đã (+ V3/ed)",
  had: "(v): đã có, đã (+ V3/ed quá khứ hoàn thành)",
  having: "(v-ing): có, sau khi đã (+ V3/ed)",
  do: "(v): làm, trợ động từ",
  does: "(v): làm (ngôi thứ 3 số ít)",
  did: "(v): đã làm (quá khứ)",
  can: "(modal v): có thể (khả năng)",
  could: "(modal v): có thể (quá khứ của can)",
  will: "(modal v): sẽ (tương lai)",
  would: "(modal v): sẽ, sẵn lòng (quá khứ của will)",
  shall: "(modal v): sẽ, nên",
  should: "(modal v): nên (khuyên bảo, hoặc đảo ngữ điều kiện)",
  must: "(modal v): phải (bắt buộc)",
  may: "(modal v): có thể, có lẽ",
  might: "(modal v): có thể, có lẽ (xác suất thấp)",

  // Word families phổ biến TOEIC Part 5 & 6 & 7
  temporarily: "(adv): một cách tạm thời",
  temporary: "(adj): tạm thời, ngắn hạn",
  temporariness: "(n): sự tạm thời",
  temporal: "(adj): thuộc thời gian, trần thế",

  outstanding: "(adj): xuất sắc, nổi bật, chưa thanh toán",
  outstand: "(v): nổi bật, tồn đọng",
  outstandingly: "(adv): một cách xuất sắc",

  compensation: "(n): tiền bồi thường, thù lao",
  compensate: "(v): bồi thường, đền bù",
  compensated: "(v-ed/adj): đã được bồi thường",
  compensatory: "(adj): mang tính bồi thường",

  promptly: "(adv): nhanh chóng, ngay lập tức, đúng giờ",
  prompt: "(adj/v): mau lẹ, thúc giục",
  prompting: "(n): sự thúc đẩy",
  promptness: "(n): tính mau lẹ",

  summary: "(n): bản tóm tắt, tổng hợp",
  summarize: "(v): tóm tắt, sơ lược",
  summarized: "(v-ed/adj): đã được tóm tắt",
  summarily: "(adv): một cách tóm tắt, ngắn gọn",

  reliable: "(adj): đáng tin cậy",
  reliability: "(n): sự tin cậy, độ tin cậy",
  reliably: "(adv): một cách đáng tin cậy",
  rely: "(v): dựa vào, tin tưởng vào",

  carefully: "(adv): một cách cẩn thận, kỹ lưỡng",
  careful: "(adj): cẩn thận, thận trọng",
  care: "(n/v): sự chăm sóc, quan tâm",
  careless: "(adj): bất cẩn, sơ suất",
  carelessly: "(adv): một cách bất cẩn",

  effectively: "(adv): một cách hiệu quả",
  effective: "(adj): có hiệu quả, có hiệu lực",
  effectiveness: "(n): tính hiệu quả",
  effect: "(n): hiệu quả, tác động",
  effected: "(v-ed): đã được thực hiện",

  superior: "(adj): vượt trội, cao cấp hơn (superior to)",
  superiors: "(n): cấp trên, người có vị thế cao hơn",
  superiority: "(n): sự vượt trội, ưu việt",
  superiorly: "(adv): một cách vượt trội",

  substantially: "(adv): đáng kể, về căn bản",
  substantial: "(adj): đáng kể, trọng yếu",
  substance: "(n): chất, bản chất",
  substantiate: "(v): chứng minh, xác nhận",

  properly: "(adv): đúng cách, thích hợp, chuẩn xác",
  proper: "(adj): thích hợp, đúng đắn",
  property: "(n): tài sản, bất động sản",
  properness: "(n): sự đúng mực",

  inconvenience: "(n): sự bất tiện, phiền toái",
  inconvenient: "(adj): bất tiện, phiền phức",
  inconveniently: "(adv): một cách bất tiện",
  inconveniencing: "(v-ing): gây bất tiện",

  signed: "(v-ed): đã ký, được ký kết",
  sign: "(v/n): ký tên / biển báo, dấu hiệu",
  signing: "(n/v-ing): việc ký kết hợp đồng",
  signature: "(n): chữ ký",

  reviewed: "(v-ed): đã xem xét, kiểm tra lại",
  reviews: "(v-s/n): xem xét / các đánh giá",
  reviewing: "(v-ing): đang xem xét",
  review: "(v/n): xem xét, duyệt lại",

  postpone: "(v): trì hoãn, hoãn lại",
  postponed: "(v-ed): đã hoãn lại",
  postponing: "(v-ing): việc trì hoãn",
  postponement: "(n): sự trì hoãn",

  recommended: "(v-ed/adj): được đánh giá cao, đề xuất",
  recommend: "(v): giới thiệu, đề xuất, khuyên",
  recommending: "(v-ing): việc đề xuất",
  recommendation: "(n): thư giới thiệu, lời đề xuất",

  receipts: "(n): các biên lai, hóa đơn nhận tiền",
  receives: "(v-s): nhận được",
  receive: "(v): nhận",
  reception: "(n): sự đón tiếp, lễ tân",
  receptive: "(adj): dễ tiếp thu, cởi mở",

  residents: "(n): cư dân, người dân sinh sống",
  reside: "(v): cư trú, thường trú",
  residential: "(adj): thuộc khu dân cư, nhà ở",
  residence: "(n): nơi cư trú, dinh thự",

  diligently: "(adv): chăm chỉ, cần cù, tận tụy",
  diligent: "(adj): siêng năng, cần cù",
  diligence: "(n): sự siêng năng, cần cán",

  officially: "(adv): một cách chính thức",
  official: "(adj/n): chính thức / viên chức, quan chức",
  officials: "(n): các quan chức, viên chức",
  officialize: "(v): chính thức hóa",

  period: "(n): khoảng thời gian, giai đoạn",
  moment: "(n): khoảnh khắc, thời điểm",
  schedule: "(n/v): lịch trình, thời gian biểu",
  season: "(n): mùa, đợt",

  badge: "(n): thẻ đeo, phù hiệu (visitor badge)",
  letter: "(n): lá thư, chữ cái",
  note: "(n/v): ghi chú, lưu ý",
  paper: "(n): giấy tờ, tài liệu, bài báo",

  high: "(adj/n): cao / mức cao kỷ lục (an all-time high)",
  highly: "(adv): rất, ở mức độ cao (highly recommended)",
  height: "(n): chiều cao, đỉnh cao",
  highness: "(n): sự cao cả, điện hạ",

  handling: "(v-ing/n): việc xử lý, giải quyết công việc",
  handle: "(v/n): xử lý, điều khiển / tay cầm",
  handled: "(v-ed): đã xử lý",
  handler: "(n): người điều khiển, người xử lý",

  efficient: "(adj): hiệu quả, năng suất",
  efficiently: "(adv): một cách hiệu quả",
  efficiency: "(n): hiệu suất, năng suất",

  convenient: "(adj): thuận tiện, tiện lợi",
  conveniently: "(adv): một cách thuận tiện (conveniently located)",
  convenience: "(n): sự thuận tiện",

  frequent: "(adj): thường xuyên",
  frequently: "(adv): một cách thường xuyên",
  frequency: "(n): tần suất, tần số",

  immediate: "(adj): ngay lập tức, trực tiếp",
  immediately: "(adv): ngay lập tức",

  successful: "(adj): thành công",
  successfully: "(adv): một cách thành công",
  succeed: "(v): thành công, kế nghiệp",
  success: "(n): sự thành công",

  approve: "(v): phê duyệt, tán thành",
  approved: "(v-ed/adj): đã được phê duyệt",
  approval: "(n): sự phê duyệt, chấp thuận",
  approving: "(v-ing): việc phê duyệt",

  complaint: "(n): lời phàn nàn, khiếu nại",
  complain: "(v): phàn nàn, khiếu nại",
  complaining: "(v-ing): việc phàn nàn",

  expansion: "(n): sự mở rộng, phát triển",
  expand: "(v): mở rộng, phát triển",
  expanded: "(v-ed/adj): đã được mở rộng",
  expansive: "(adj): rộng lớn, cởi mở",

  attendance: "(n): sự tham dự, số người tham dự",
  attend: "(v): tham dự, chú ý",
  attendee: "(n): người tham dự",
  attentive: "(adj): chú ý, chăm chú",

  inspection: "(n): sự thanh tra, kiểm tra kỹ thuật",
  inspect: "(v): thanh tra, kiểm tra",
  inspector: "(n): thanh tra viên",
  inspected: "(v-ed): đã được kiểm tra",

  // Thêm các từ vựng thường xuất hiện trong đề ETS (như Test 3, Test 1, Part 6, Part 7)
  specialists: "(n): các chuyên gia",
  specialist: "(n): chuyên gia, chuyên viên",
  qualifications: "(n): bằng cấp, phẩm chất, tiêu chuẩn chuyên môn",
  qualification: "(n): bằng cấp, phẩm chất, tiêu chuẩn chuyên môn",
  engagements: "(n): các cuộc hẹn, cam kết, sự gắn kết",
  engagement: "(n): cuộc hẹn, cam kết, sự gắn kết",
  assortments: "(n): các nhóm phân loại, mặt hàng hỗn hợp",
  assortment: "(n): nhóm hàng hỗn hợp, sự phân loại",
  assort: "(v): phân loại",
  assorted: "(adj): đủ loại, hỗn hợp",

  locate: "(v): định vị, đặt tại",
  located: "(v-ed/adj): tọa lạc, nằm ở (be located)",
  locates: "(v-s): định vị, xác định vị trí",
  location: "(n): địa điểm, vị trí",

  economy: "(n): nền kinh tế, sự tiết kiệm",
  economics: "(n): ngành kinh tế học",
  economize: "(v): tiết kiệm chi tiêu",
  economical: "(adj): tiết kiệm, kinh tế",
  economic: "(adj): thuộc về kinh tế",
  economically: "(adv): về mặt kinh tế, một cách tiết kiệm",

  experience: "(n/v): kinh nghiệm / trải nghiệm",
  experienced: "(adj/v-ed): có kinh nghiệm, từng trải",
  experiencing: "(v-ing): đang trải qua",
  experiential: "(adj): theo kinh nghiệm thực tế",

  enlarged: "(v-ed/adj): được mở rộng, phóng to",
  enlarge: "(v): mở rộng, phóng to",
  discontinued: "(v-ed/adj): ngừng sản xuất, dừng bán",
  discontinue: "(v): ngừng sản xuất, gián đoạn",
  accessible: "(adj): dễ tiếp cận, có thể sử dụng (accessible to)",
  access: "(n/v): sự tiếp cận / truy cập",
  refreshed: "(v-ed/adj): sảng khoái, được làm mới",
  refresh: "(v): làm mới, nạp lại năng lượng",

  replacement: "(n): sự thay thế, vật/người thay thế",
  replace: "(v): thay thế",
  heater: "(n): máy sưởi, lò sưởi",
  version: "(n): phiên bản",
  model: "(n): kiểu mẫu, mô hình, mẫu mã",

  hourly: "(adv/adj): hàng giờ, tính theo giờ",
  sometimes: "(adv): đôi khi, thỉnh thoảng",
  finally: "(adv): cuối cùng, rốt cuộc",

  sharing: "(v-ing/n): việc chia sẻ, đang chia sẻ",
  routes: "(n): các tuyến đường, lộ trình",
  route: "(n): tuyến đường, hành trình",
  responses: "(n): các câu trả lời, phản hồi",
  response: "(n): câu trả lời, sự phản hồi",
  software: "(n): phần mềm máy tính",
  careers: "(n): các sự nghiệp, nghề nghiệp",
  career: "(n): sự nghiệp, nghề nghiệp",

  controlling: "(v-ing/adj): kiểm soát, điều hành",
  quick: "(adj): nhanh chóng",
  quickly: "(adv): một cách nhanh chóng",
  quicken: "(v): làm nhanh hơn, đẩy mạnh",
  quickening: "(v-ing): đang đẩy mạnh",
  quickest: "(adj-est): nhanh nhất",
  quickness: "(n): sự nhanh chóng, mau lẹ",

  strictly: "(adv): một cách nghiêm ngặt, chặt chẽ",
  strict: "(adj): nghiêm khắc, chặt chẽ",
  hungrily: "(adv): một cách khao khát, thèm thuồng",
  punctually: "(adv): một cách đúng giờ",
  punctual: "(adj): đúng giờ",
  bravely: "(adv): một cách dũng cảm",

  allow: "(v): cho phép",
  manage: "(v): quản lý, xoay xở",
  finish: "(v): hoàn thành, kết thúc",
  small: "(adj): nhỏ",
  most: "(adj/adv): hầu hết, nhất",
};

/**
 * Trích xuất các biến thể gốc từ (lemmatization) để tra cứu linh hoạt
 */
export function getWordStems(word: string): string[] {
  const w = word.trim().toLowerCase().replace(/[^a-z0-9'-]/g, "");
  if (!w) return [];
  const stems = [w];
  if (w.endsWith("ies") && w.length > 4) stems.push(w.slice(0, -3) + "y");
  if (w.endsWith("es") && w.length > 3) stems.push(w.slice(0, -2));
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 2) stems.push(w.slice(0, -1));
  if (w.endsWith("ied") && w.length > 4) stems.push(w.slice(0, -3) + "y");
  if (w.endsWith("ed") && w.length > 3) {
    stems.push(w.slice(0, -2));
    stems.push(w.slice(0, -1));
  }
  if (w.endsWith("ing") && w.length > 4) {
    stems.push(w.slice(0, -3));
    stems.push(w.slice(0, -3) + "e");
  }
  if (w.endsWith("ly") && w.length > 3) stems.push(w.slice(0, -2));
  if (w.endsWith("tion") && w.length > 5) {
    stems.push(w.slice(0, -4));
    stems.push(w.slice(0, -4) + "te");
  }
  if (w.endsWith("ment") && w.length > 5) stems.push(w.slice(0, -4));
  return Array.from(new Set(stems.filter(Boolean)));
}

/**
 * Dịch cụm từ hoặc câu phương án hoàn chỉnh (Part 6 & Part 7)
 */
export function translateToeicOptionPhrase(text: string): string | null {
  if (!text) return null;
  const clean = text.trim();
  const lower = clean.toLowerCase().replace(/[\.\,\;\:]+$/, "");

  // Khớp chính xác các câu đề thi Part 6 & Part 7 thường gặp
  const knownPhrases: Record<string, string> = {
    "the results will be announced later this month": "Kết quả sẽ được công bố vào cuối tháng này.",
    "we are proud to serve our community with excellence": "Chúng tôi tự hào phục vụ cộng đồng với chất lượng xuất sắc.",
    "pat and kenny’s shop excelled in all four categories": "Cửa hàng của Pat và Kenny xuất sắc ở cả 4 hạng mục.",
    "pat and kenny's shop excelled in all four categories": "Cửa hàng của Pat và Kenny xuất sắc ở cả 4 hạng mục.",
    "please call in advance to schedule an appointment": "Vui lòng gọi điện trước để đặt lịch hẹn.",
    "come again very soon": "Hãy sớm quay lại nhé.",
    "it is warmer in the store": "Trong cửa hàng ấm áp hơn.",
    "itis warmer in the store": "Trong cửa hàng ấm áp hơn.",
    "do not take it inside": "Không mang nó vào bên trong.",
    "the tank is prefilled": "Bình chứa đã được nạp đầy sẵn.",
    "the tank is pre filled": "Bình chứa đã được nạp đầy sẵn.",
    "we also need to inform you that your payment is five days past due": "Chúng tôi cũng cần thông báo rằng khoản thanh toán của bạn đã quá hạn 5 ngày.",
    "we recommend that you purchase all related accessories in our retail store": "Chúng tôi khuyên bạn nên mua tất cả phụ kiện liên quan tại cửa hàng bán lẻ của chúng tôi.",
    "we recommend that you pur chase all related accessories in our retail store": "Chúng tôi khuyên bạn nên mua tất cả phụ kiện liên quan tại cửa hàng bán lẻ của chúng tôi.",
    "if you get an error message, disconnect from the internet and try again": "Nếu bạn gặp thông báo lỗi, hãy ngắt kết nối Internet và thử lại.",
    "if you cannot find what you need online, simply call our support number": "Nếu không tìm thấy thứ bạn cần trực tuyến, chỉ cần gọi số hỗ trợ của chúng tôi.",
    "people often use credit cards to purchase meals during the flight": "Mọi người thường dùng thẻ tín dụng để mua bữa ăn trong chuyến bay.",
    "peo ple often use credit cards to purchase meals during the flight": "Mọi người thường dùng thẻ tín dụng để mua bữa ăn trong chuyến bay.",
    "many people like public transportation because it is inexpensive": "Nhiều người thích phương tiện công cộng vì chi phí rẻ.",
    "the durable cards are made from recycled materials": "Các loại thẻ bền này được làm từ vật liệu tái chế.",
    "there was a small price increase last month": "Đã có một đợt tăng giá nhẹ vào tháng trước.",

    // Mẫu câu Part 7 Options
    "to report on airport renovations": "Để báo cáo về việc cải tạo sân bay.",
    "to give an update on a technical problem": "Để cập nhật thông tin về sự cố kỹ thuật.",
    "to introduce a new reservation system": "Để giới thiệu một hệ thống đặt chỗ mới.",
    "to advertise airline routes to some new cities": "Để quảng cáo các đường bay đến một số thành phố mới.",
    "the number of flights available": "Số lượng chuyến bay hiện có sẵn.",
    "the cost of plane tickets": "Giá của vé máy bay.",
    "the size of passenger luggage": "Kích thước của hành lý hành khách.",
    "the frequency of maintenance checks": "Tần suất của các lần kiểm tra bảo dưỡng.",
  };

  if (knownPhrases[lower]) return knownPhrases[lower];

  // Mẫu câu chỉ mục đích: To + V ...
  if (/^to\s+report\s+on\b/i.test(clean)) return `Để báo cáo về ${clean.replace(/^to\s+report\s+on\s+/i, "")}.`;
  if (/^to\s+give\s+an\s+update\s+on\b/i.test(clean)) return `Để cập nhật thông tin về ${clean.replace(/^to\s+give\s+an\s+update\s+on\s+/i, "")}.`;
  if (/^to\s+introduce\b/i.test(clean)) return `Để giới thiệu ${clean.replace(/^to\s+introduce\s+/i, "")}.`;
  if (/^to\s+advertise\b/i.test(clean)) return `Để quảng cáo ${clean.replace(/^to\s+advertise\s+/i, "")}.`;
  if (/^to\s+announce\b/i.test(clean)) return `Để thông báo ${clean.replace(/^to\s+announce\s+/i, "")}.`;
  if (/^to\s+request\b/i.test(clean)) return `Để yêu cầu ${clean.replace(/^to\s+request\s+/i, "")}.`;
  if (/^to\s+confirm\b/i.test(clean)) return `Để xác nhận ${clean.replace(/^to\s+confirm\s+/i, "")}.`;
  if (/^to\s+apologize\s+for\b/i.test(clean)) return `Để xin lỗi về ${clean.replace(/^to\s+apologize\s+for\s+/i, "")}.`;
  if (/^to\s+remind\b/i.test(clean)) return `Để nhắc nhở ${clean.replace(/^to\s+remind\s+/i, "")}.`;
  if (/^to\s+invite\b/i.test(clean)) return `Để mời ${clean.replace(/^to\s+invite\s+/i, "")}.`;
  if (/^the\s+number\s+of\b/i.test(clean)) return `Số lượng ${clean.replace(/^the\s+number\s+of\s+/i, "")}.`;

  // Mượn từ translateToeicOption trong toeicQuestionEnricher
  const enriched = translateToeicOption(clean);
  if (enriched && enriched !== clean && enriched !== lower) {
    return enriched;
  }

  return null;
}

/**
 * Trích xuất bản dịch tiếng Việt cho câu hỏi (Part 5, Part 6 và Part 7)
 */
export function getQuestionTranslation(q: SampleQuestion, card?: ExerciseCardData): string | null {
  if (!q) return null;

  // 1. Kiểm tra các trường dữ liệu trực tiếp
  if (q.bilingual && q.bilingual.trim().length > 0) {
    return q.bilingual.trim();
  }
  const qAny = q as unknown as Record<string, unknown>;
  if (typeof qAny.questionVi === "string" && qAny.questionVi.trim().length > 0) {
    return qAny.questionVi.trim();
  }
  if (qAny.translation) {
    if (typeof qAny.translation === "string" && qAny.translation.trim().length > 0) {
      return qAny.translation.trim();
    }
    if (typeof qAny.translation === "object" && qAny.translation !== null) {
      const transObj = qAny.translation as Record<string, unknown>;
      const viVal = transObj.questionVi || transObj.vi || transObj.textVi || transObj.meaning;
      if (typeof viVal === "string" && viVal.trim().length > 0) {
        return viVal.trim();
      }
    }
  }
  if (typeof qAny.bilingualText === "string" && qAny.bilingualText.trim().length > 0) {
    return qAny.bilingualText.trim();
  }
  if (typeof qAny.vietnamese === "string" && qAny.vietnamese.trim().length > 0) {
    return qAny.vietnamese.trim();
  }
  if (typeof qAny.vi === "string" && qAny.vi.trim().length > 0) {
    return qAny.vi.trim();
  }

  // 2. Trích xuất bản dịch từ lời giải (explanation) nếu có
  if (q.explanation && typeof q.explanation === "string") {
    // Pattern: "Dịch câu: ...", "Bản dịch: ...", "Dịch nghĩa: ...", "Tạm dịch: ..."
    const dichMatch = q.explanation.match(
      /(?:(?:bản\s*)?dịch(?:\s*câu|\s*nghĩa)?|tạm\s*dịch)\s*[:：]\s*([^\n\r]+)/i
    );
    if (dichMatch && dichMatch[1] && dichMatch[1].trim().length > 8) {
      return dichMatch[1].trim();
    }

    // Pattern: Đoạn text trong ngoặc kép theo sau bởi (Dịch...) hoặc (Tạm dịch...)
    const quoteDichMatch = q.explanation.match(
      /["“]([^"”]{10,})["”]\s*(?:\(Tạm dịch|\(Dịch|\(Nghĩa)/i
    );
    if (quoteDichMatch && quoteDichMatch[1]) {
      return quoteDichMatch[1].trim();
    }
  }

  // 3. Khớp các mẫu câu hỏi đọc hiểu Part 7 thường gặp chuẩn ETS
  const qText = (q.question || "").trim();
  if (qText) {
    const qLower = qText.toLowerCase();

    // Câu hỏi mục đích
    if (/what is the (?:main )?purpose of (?:the |this )?(email|letter|memo|notice|article|announcement|advertisement|message)/i.test(qLower)) {
      const docTypeMatch = qLower.match(/(email|letter|memo|notice|article|announcement|advertisement|message)/i);
      const docTypeMap: Record<string, string> = {
        email: "email này",
        letter: "lá thư này",
        memo: "bản ghi nhớ nội bộ này",
        notice: "thông báo này",
        article: "bài báo này",
        announcement: "thông báo này",
        advertisement: "mẩu quảng cáo này",
        message: "tin nhắn này",
      };
      const docName = (docTypeMatch && docTypeMap[docTypeMatch[1].toLowerCase()]) || "văn bản này";
      return `Mục đích chính của ${docName} là gì?`;
    }

    // Câu hỏi đối tượng người nhận / người viết
    if (/who (?:most likely )?is (?:the )?(?:intended )?(recipient|reader|author|sender|writer|speaker)/i.test(qLower)) {
      if (qLower.includes("recipient") || qLower.includes("reader")) {
        return "Ai là người có khả năng cao nhất nhận / đọc văn bản này?";
      }
      return "Ai có khả năng cao nhất là người viết / người gửi văn bản này?";
    }

    // Câu hỏi What is indicated / stated / suggested
    if (/what is (indicated|stated|suggested|mentioned|implied) about/i.test(qLower)) {
      const topic = qText.replace(/^.*about\s+/i, "").replace(/[\?\.\!]$/, "").trim();
      return `Điều gì được chỉ ra / đề cập về "${topic}"?`;
    }

    // Câu hỏi According to
    if (/according to the (email|letter|memo|notice|article|announcement|passage),/i.test(qLower)) {
      const rest = qText.replace(/^according to the [^,]+,\s*/i, "").replace(/[\?\.\!]$/, "").trim();
      return `Theo bài đọc, ${rest}?`;
    }

    // Câu hỏi điền câu Part 7
    if (/in which of the positions marked/i.test(qLower)) {
      return "Trong các vị trí được đánh dấu [1], [2], [3] và [4], câu văn trên phù hợp nhất ở vị trí nào?";
    }

    // Câu hỏi từ đồng nghĩa Part 7
    if (/closest in meaning to/i.test(qLower)) {
      const wordMatch = qText.match(/['"“]([^'"”]+)['"”]/);
      const targetWord = wordMatch ? wordMatch[1] : "Từ được hỏi";
      return `Từ "${targetWord}" trong đoạn văn gần nghĩa nhất với từ nào sau đây?`;
    }
  }

  return null;
}

/**
 * Trích xuất nghĩa tiếng Việt của phương án trả lời (A, B, C, D)
 */
export function getOptionMeaning(
  q: SampleQuestion,
  optIdx: number,
  optVal: string,
  cardVocabList?: VocabItem[]
): string | null {
  if (!optVal || !optVal.trim()) return null;

  // 1. Kiểm tra mảng optionMeanings có sẵn
  if (q.optionMeanings && Array.isArray(q.optionMeanings) && q.optionMeanings[optIdx]) {
    const rawMeaning = q.optionMeanings[optIdx].trim();
    if (rawMeaning.length > 0) return rawMeaning;
  }

  const qAny = q as unknown as Record<string, unknown>;
  if (Array.isArray(qAny.optionVi) && typeof qAny.optionVi[optIdx] === "string" && (qAny.optionVi[optIdx] as string).trim().length > 0) {
    return (qAny.optionVi[optIdx] as string).trim();
  }
  if (Array.isArray(qAny.optionsMeanings) && typeof qAny.optionsMeanings[optIdx] === "string" && (qAny.optionsMeanings[optIdx] as string).trim().length > 0) {
    return (qAny.optionsMeanings[optIdx] as string).trim();
  }

  // 1.5. Nếu là cụm từ hoặc câu hoàn chỉnh (chứa dấu cách), ưu tiên dịch cụm từ trước
  if (optVal.trim().includes(" ")) {
    const translatedPhrase = translateToeicOptionPhrase(optVal);
    if (translatedPhrase && translatedPhrase !== optVal) {
      return translatedPhrase;
    }
  }

  // Làm sạch phương án (bỏ tiền tố A/B/C/D)
  const cleanVal = optVal
    .trim()
    .replace(/^[\(\[]?[A-Da-d][\)\].:]\s*/, "")
    .trim()
    .toLowerCase();

  // 2. Trích xuất từ lời giải (q.explanation) nếu có liệt kê nghĩa từng phương án
  if (q.explanation && typeof q.explanation === "string") {
    const optLetter = String.fromCharCode(65 + optIdx);
    const escapedOpt = cleanVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Pattern: - word (pos): nghĩa hoặc - word: nghĩa
    const match1 = q.explanation.match(
      new RegExp(`(?:^|\\n|\\s)[-•*]\\s*${escapedOpt}\\b(?:\\s*\\(([^)]+)\\))?\\s*[:：]\\s*([^\\n•*-]+)`, "i")
    );
    if (match1 && match1[2] && match1[2].trim().length > 1) {
      const pos = match1[1] ? `(${match1[1].trim()}): ` : "";
      return `${pos}${match1[2].trim()}`;
    }

    // Pattern: (A) word: nghĩa hoặc (A) nghĩa
    const match2 = q.explanation.match(
      new RegExp(`\\(${optLetter}\\)\\s*(?:${escapedOpt}\\s*[:：]?)?\\s*[:：]?\\s*([^\\n•*\\(\\)]+)`, "i")
    );
    if (match2 && match2[1] && match2[1].trim().length > 2) {
      const cand = match2[1].trim();
      const lowerCand = cand.toLowerCase();
      if (
        !lowerCand.includes("đáp án đúng") &&
        !lowerCand.includes("phù hợp với") &&
        !lowerCand.includes("chính xác nhất") &&
        !lowerCand.includes("theo ngữ cảnh")
      ) {
        return cand;
      }
    }
  }

  // 3. Tra cứu trong bộ từ vựng gắn kèm câu hỏi hoặc thẻ bài đọc (hỗ trợ lemmatization)
  const combinedVocabs = [...(q.vocabList || []), ...(cardVocabList || [])];
  const stemCandidates = getWordStems(cleanVal);
  for (const stem of stemCandidates) {
    const matchedVocab = combinedVocabs.find(
      (v) => v.word.trim().toLowerCase() === stem
    );
    if (matchedVocab && matchedVocab.meaning) {
      const pos = matchedVocab.pos ? `(${matchedVocab.pos.replace(/[\(\)]/g, "")}): ` : "";
      return `${pos}${matchedVocab.meaning.trim()}`;
    }
  }

  // 4. Tra cứu trong Từ điển thông dụng TOEIC (COMMON_TOEIC_OPTION_TRANSLATIONS)
  for (const stem of stemCandidates) {
    if (COMMON_TOEIC_OPTION_TRANSLATIONS[stem]) {
      return COMMON_TOEIC_OPTION_TRANSLATIONS[stem];
    }
    const bare = stem.replace(/[^a-z0-9]/g, "");
    if (COMMON_TOEIC_OPTION_TRANSLATIONS[bare]) {
      return COMMON_TOEIC_OPTION_TRANSLATIONS[bare];
    }
  }

  // 5. Tra cứu trong richDictionaryData / CURATED_TOEIC_VOCAB / TOEIC_VOCAB_DICT
  for (const stem of stemCandidates) {
    if (CURATED_TOEIC_VOCAB[stem] && CURATED_TOEIC_VOCAB[stem].meaning) {
      const cur = CURATED_TOEIC_VOCAB[stem];
      const pos = cur.pos ? `(${cur.pos}): ` : "";
      return `${pos}${cur.meaning}`;
    }
    if (TOEIC_VOCAB_DICT[stem] && TOEIC_VOCAB_DICT[stem].meaning) {
      const cur = TOEIC_VOCAB_DICT[stem];
      const pos = cur.pos ? `(${cur.pos.replace(/[\(\)]/g, "")}): ` : "";
      return `${pos}${cur.meaning}`;
    }
    if (stem.length <= 25 && !stem.includes(" ")) {
      const richDetail = lookupWordDetail(stem);
      if (
        richDetail &&
        richDetail.contextMeaning &&
        !richDetail.contextMeaning.includes("Chưa có định nghĩa") &&
        !richDetail.contextMeaning.includes("Đang tra cứu")
      ) {
        const pos = richDetail.pos ? `(${richDetail.pos}): ` : "";
        return `${pos}${richDetail.contextMeaning}`;
      }
    }
  }

  // 6. Dịch câu / mệnh đề / cụm từ TOEIC (Dành cho phương án dài ở Part 6 & Part 7)
  const translatedPhrase = translateToeicOptionPhrase(optVal);
  if (translatedPhrase && translatedPhrase !== optVal) {
    return translatedPhrase;
  }

  return null;
}

/**
 * Sinh lời giải thích chi tiết toàn diện (đầy đủ phân tích, 4 đáp án và dịch câu/đoạn)
 */
export function getEnrichedExplanation(
  q: SampleQuestion,
  card?: ExerciseCardData
): string {
  if (!q) return "";

  const rawExpl = (q.explanation || "").trim();
  const formatted = formatExplanation(rawExpl);

  // Kiểm tra nếu lời giải quá ngắn / chung chung (ví dụ "Đáp án đúng là (B)...")
  const isGeneric =
    !formatted ||
    (formatted.startsWith("Đáp án đúng là") && formatted.length < 130) ||
    formatted === "Đáp án đúng theo ngữ cảnh.";

  let explanationBody = formatted;

  if (isGeneric) {
    const optLetter = String.fromCharCode(65 + q.correctIndex);
    const correctVal = (q.options && q.options[q.correctIndex]) || "";
    const correctMeaning = getOptionMeaning(q, q.correctIndex, correctVal, card?.vocabList) || "phù hợp";

    // Phân tích xem câu hỏi thuộc loại từ vựng, ngữ pháp hay liên từ
    const cleanOpts = (q.options || []).map((o) =>
      o.trim().replace(/^[\(\[]?[A-Da-d][\)\].:]\s*/, "").toLowerCase()
    );
    const stems = cleanOpts.map((o) => o.slice(0, 4));
    const isWordFamily = stems.length === 4 && stems.every((s) => s === stems[0] && s.length >= 3);

    if (isWordFamily) {
      explanationBody = `Căn cứ vào cấu trúc ngữ pháp và vị trí chỗ trống trong câu, ta cần chọn dạng từ thích hợp. Phương án (${optLetter}) "${correctVal}" ${correctMeaning ? `(${correctMeaning})` : ""} là lựa chọn chính xác về mặt ngữ pháp.`;
    } else {
      explanationBody = `Xét về mặt ngữ nghĩa và ngữ cảnh của câu/đoạn văn, phương án (${optLetter}) "${correctVal}" ${correctMeaning ? `(${correctMeaning})` : ""} tạo nên tính mạch lạc và chuẩn xác nhất.`;
    }
  }

  // Kiểm tra xem đã có danh sách nghĩa 4 phương án chưa
  const hasOptionsBullet =
    explanationBody.includes("•") ||
    /[-]\s*[a-zA-Z]+\s*[:：]/.test(explanationBody) ||
    /📌\s*Nghĩa các phương án/i.test(explanationBody);

  let optionsSection = "";
  if (!hasOptionsBullet && Array.isArray(q.options) && q.options.length > 0) {
    const optionLines: string[] = [];
    q.options.forEach((optVal, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const cleanVal = optVal.trim().replace(/^[\(\[]?[A-Da-d][\)\].:]\s*/, "").trim();
      const meaning = getOptionMeaning(q, idx, optVal, card?.vocabList);
      if (meaning) {
        optionLines.push(`• (${letter}) ${cleanVal}: ${meaning}`);
      } else {
        optionLines.push(`• (${letter}) ${cleanVal}`);
      }
    });
    if (optionLines.length > 0) {
      optionsSection = `\n\n📌 Nghĩa các phương án:\n${optionLines.join("\n")}`;
    }
  }

  // Kiểm tra xem đã có câu dịch chưa
  const hasTranslation =
    /(?:dịch\s*câu|dịch\s*nghĩa|bản\s*dịch|tạm\s*dịch)\s*[:：]/i.test(explanationBody);

  let translationSection = "";
  if (!hasTranslation) {
    const qTrans = getQuestionTranslation(q, card);
    if (qTrans && qTrans.trim().length > 5) {
      translationSection = `\n\n📖 Dịch câu / đoạn:\n${qTrans.trim()}`;
    }
  }

  return `${explanationBody}${optionsSection}${translationSection}`.trim();
}

/**
 * Trích xuất hoặc dự đoán bản dịch đoạn văn cho Part 6 & Part 7 nếu văn bản gốc bị thiếu textVi
 */
export function getSmartPassageTranslation(rawEnglishPassage: string): string | null {
  if (!rawEnglishPassage || rawEnglishPassage.trim().length === 0) return null;
  const clean = rawEnglishPassage.trim();

  // Thông báo bảo trì kỹ thuật thường gặp
  if (/routine plumbing maintenance|residential units|water pipes/i.test(clean)) {
    return "Thông báo gửi toàn thể cư dân:\nViệc bảo trì đường ống nước định kỳ sẽ được tiến hành tại toàn bộ các căn hộ vào thứ Ba, ngày 24 tháng 10.\nCác kỹ thuật viên sẽ cần vào từng phòng tắm để kiểm tra đường ống và thiết bị vệ sinh. Chúng tôi thành thật xin lỗi vì sự bất tiện này.";
  }

  // Email liên hệ hỗ trợ khách hàng
  if (/thank you for contacting customer support|ticket number|representative/i.test(clean)) {
    return "Cảm ơn quý khách đã liên hệ với bộ phận hỗ trợ khách hàng. Yêu cầu của bạn đã được ghi nhận với mã số hỗ trợ. Đại diện của chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.";
  }

  // Thông báo tuyển dụng
  if (/we are currently seeking|job opening|qualifications|submit your resume/i.test(clean)) {
    return "Chúng tôi hiện đang tìm kiếm ứng viên tài năng cho vị trí công việc mới. Ứng viên quan tâm vui lòng gửi hồ sơ xin việc (CV) và thư giới thiệu trước hạn chót.";
  }

  return null;
}
