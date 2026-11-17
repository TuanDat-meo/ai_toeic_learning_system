/**
 * Helper utility to clean up and format explanation text for TOEIC Reading & Listening questions.
 * Handles auto-spacing for stuck syllables (e.g. "Đâylà" -> "Đây là", "cầnđiền" -> "cần điền")
 * and formats section headers (Cấu trúc, Dịch nghĩa, Option bullets).
 */

const STUCK_REPLACEMENTS: [RegExp, string][] = [
  [/Đâylà/g, 'Đây là'],
  [/đâylà/g, 'đây là'],
  [/chínhlà/g, 'chính là'],
  [/nghĩalà/g, 'nghĩa là'],
  [/sẽlà/g, 'sẽ là'],
  [/đólà/g, 'đó là'],
  [/mớilà/g, 'mới là'],
  [/phảilà/g, 'phải là'],
  [/vẫnlà/g, 'vẫn là'],
  [/làmột/g, 'là một'],
  [/làcâu/g, 'là câu'],
  [/lànhững/g, 'là những'],
  [/làtínhđộng/g, 'là tính động'],
  [/Chỗtrống/g, 'Chỗ trống'],
  [/chỗtrống/g, 'chỗ trống'],
  [/chọnđápánđúng/g, 'chọn đáp án đúng'],
  [/chọnđápán/g, 'chọn đáp án'],
  [/Chọnđápán/g, 'Chọn đáp án'],
  [/đápánđúng/g, 'đáp án đúng'],
  [/đápán/g, 'đáp án'],
  [/Đápán/g, 'Đáp án'],
  [/cầnđiền/g, 'cần điền'],
  [/Cầnđiền/g, 'Cần điền'],
  [/cầndựavào/g, 'cần dựa vào'],
  [/dựavào/g, 'dựa vào'],
  [/Dựavào/g, 'Dựa vào'],
  [/bướcvào/g, 'bước vào'],
  [/vàovănphòng/g, 'vào văn phòng'],
  [/vănphòng/g, 'văn phòng'],
  [/tựđộng/g, 'tự động'],
  [/mớiđược/g, 'mới được'],
  [/lắpđặt/g, 'lắp đặt'],
  [/tất cảđèn/g, 'tất cả đèn'],
  [/cảđèn/g, 'cả đèn'],
  [/củamình/g, 'của mình'],
  [/chủngữ/g, 'chủ ngữ'],
  [/chủđộng/g, 'chủ động'],
  [/bịđộng/g, 'bị động'],
  [/sungýnghĩa/g, 'sung ý nghĩa'],
  [/sungý/g, 'sung ý'],
  [/vềý/g, 'về ý'],
  [/gợiý/g, 'gợi ý'],
  [/bổsung/g, 'bổ sung'],
  [/từđể/g, 'từ để'],
  [/từở/g, 'từ ở'],
  [/cảnhđể/g, 'cảnh để'],
  [/chođộngtừ/g, 'cho động từ'],
  [/chođộng/g, 'cho động'],
  [/chodanh/g, 'cho danh'],
  [/chiếcáo/g, 'chiếc áo'],
  [/tổchức/g, 'tổ chức'],
  [/khaitrương/g, 'khai trương'],
  [/lễkhai/g, 'lễ khai'],
  [/buổilễ/g, 'buổi lễ'],
  [/thíchhợp/g, 'thích hợp'],
  [/khănphủ/g, 'khăn phủ'],
  [/Khănphủ/g, 'Khăn phủ'],
  [/thờigian/g, 'thời gian'],
  [/trongcâu/g, 'trong câu'],
  [/Trongcâu/g, 'Trong câu'],
  [/nhữngngười/g, 'những người'],
  [/Nhữngngười/g, 'Những người'],
  [/tậpđoàn/g, 'tập đoàn'],
  [/Tậpđoàn/g, 'Tập đoàn'],
  [/biênbản/g, 'biên bản'],
  [/hoànthành/g, 'hoàn thành'],
  [/quákhứđơnmang/g, 'quá khứ đơn mang'],
  [/Quákhứđơnmang/g, 'Quá khứ đơn mang'],
  [/quákhứđơn/g, 'quá khứ đơn'],
  [/Quákhứđơn/g, 'Quá khứ đơn'],
  [/khứđơnmang/g, 'khứ đơn mang'],
  [/khứđơnđể/g, 'khứ đơn để'],
  [/khứđơn/g, 'khứ đơn'],
  [/quákhứ/g, 'quá khứ'],
  [/Quákhứ/g, 'Quá khứ'],
  [/hiệntạiđơn/g, 'hiện tại đơn'],
  [/Hiệntạiđơn/g, 'Hiện tại đơn'],
  [/hiệntại/g, 'hiện tại'],
  [/Hiệntại/g, 'Hiện tại'],
  [/tiếpdiễn/g, 'tiếp diễn'],
  [/đơnmang/g, 'đơn mang'],
  [/aiđó/g, 'ai đó'],
  [/cụmtừ/g, 'cụm từ'],
  [/cụmdanh/g, 'cụm danh'],
  [/danhtừ/g, 'danh từ'],
  [/độngtừ/g, 'động từ'],
  [/tínhtừ/g, 'tính từ'],
  [/trạngtừ/g, 'trạng từ'],
  [/giớitừ/g, 'giới từ'],
  [/liêntừ/g, 'liên từ'],
  [/hợpđồng/g, 'hợp đồng'],
  [/Hợpđồng/g, 'Hợp đồng'],
  [/giámđốc/g, 'giám đốc'],
  [/hướngdẫn/g, 'hướng dẫn'],
  [/thiếtlập/g, 'thiết lập'],
  [/đặcđiểm/g, 'đặc điểm'],
  [/đặctrưng/g, 'đặc trưng'],
  [/thỉnhthoảng/g, 'thỉnh thoảng'],
  [/hơiđúng/g, 'hơi đúng'],
  [/chặtchẽ/g, 'chặt chẽ'],
  [/nghiêmtúc/g, 'nghiêm túc'],
  [/nặngnề/g, 'nặng nề'],
  [/giậndữ/g, 'giận dữ'],
  [/khuyếnkhích/g, 'khuyến khích'],
  [/trangbị/g, 'trang bị'],
  [/chốngnước/g, 'chống nước'],
  [/lầmtưởng/g, 'lầm tưởng'],
  [/dựđịnh/g, 'dự định'],
  [/điềuphối/g, 'điều phối'],
  [/côngviệc/g, 'công việc'],
  [/nghĩatruyền/g, 'nghĩa truyền'],
  [/nghĩavà/g, 'nghĩa và'],
  [/ngườiđóng/g, 'người đóng'],
  [/ngườiđưa/g, 'người đưa'],
  [/hiệntrực/g, 'hiện trực'],
  [/hiệnđại/g, 'hiện đại'],
  [/Tínhđến/g, 'Tính đến'],
  [/Chọndanh/g, 'Chọn danh'],
  [/Chọngiới/g, 'Chọn giới'],
  [/Chọntrạng/g, 'Chọn trạng'],
  [/Chọntính/g, 'Chọn tính'],
  [/Chọnđộng/g, 'Chọn động'],
  [/Chủđề/g, 'Chủ đề'],
  [/chủđề/g, 'chủ đề'],
  [/CHỦYẾUchomỗi/g, 'CHỦ YẾU cho mỗi'],
  [/CHÍNHcho/g, 'CHÍNH cho'],
  [/CHẶNđược/g, 'CHẶN được'],
  [/ĐÃKHUYẾN KHÍCH/g, 'ĐÃ KHUYẾN KHÍCH'],
  [/ĐÃTỔ CHỨC/g, 'ĐÃ TỔ CHỨC'],
  [/ĐÃKHUYẾNKHÍCH/g, 'ĐÃ KHUYẾN KHÍCH'],
  [/ĐÃTỔCHỨC/g, 'ĐÃ TỔ CHỨC'],
  [/Ratherthan/g, 'Rather than'],
  [/Insteadof/g, 'Instead of'],
  [/cũngnhư/g, 'cũng như'],
  [/Cũngnhư/g, 'Cũng như'],
];

const VIET_VOWELS = 'aăâeêioôơuưyàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ';

export function formatExplanation(text?: string | null): string {
  if (!text) return '';

  let s = text.trim();

  // 1. Clean explicit stuck words
  for (const [pattern, replacement] of STUCK_REPLACEMENTS) {
    s = s.replace(pattern, replacement);
  }

  // 2. Boundary with 'đ' / 'Đ'
  // Syllable ending in vowel or (c, m, n, p, t) followed by 'đ' and vowel
  const regexMidD = new RegExp(`([${VIET_VOWELS}cmnpt])(đ[${VIET_VOWELS}])`, 'gi');
  s = s.replace(regexMidD, '$1 $2');

  const regexMidCapD = new RegExp(`([a-zA-Zà-ỹÀ-Ỹ])(Đ[${VIET_VOWELS}])`, 'g');
  s = s.replace(regexMidCapD, '$1 $2');

  // 3. Functional particles attached to words: để, vào, của
  s = s.replace(/để([a-zA-Zà-ỹÀ-Ỹ])/gi, 'để $1');
  s = s.replace(/([a-zA-Zà-ỹÀ-Ỹ])vào/gi, '$1 vào');
  s = s.replace(/vào([a-zA-Zà-ỹÀ-Ỹ])/gi, 'vào $1');
  s = s.replace(/([a-zA-Zà-ỹÀ-Ỹ])của/gi, '$1 của');
  s = s.replace(/của([a-zA-Zà-ỹÀ-Ỹ])/gi, 'của $1');

  // 4. Structural boundaries: *Cấu trúc: and Dịch:
  s = s.replace(/([a-zA-Zà-ỹÀ-Ỹ])\*Cấu trúc:/g, '$1\n\n📌 Cấu trúc:\n');
  s = s.replace(/^\*Cấu trúc:/g, '📌 Cấu trúc:\n');
  s = s.replace(/([a-zA-Zà-ỹÀ-Ỹ])Dịch:/g, '$1.\n\n📖 Dịch nghĩa: ');
  s = s.replace(/^\s*Dịch:/g, '📖 Dịch nghĩa: ');

  // 5. Bullet formatting for option vocabulary explanations: " - [word]:"
  s = s.replace(/(?<![Vv])\s*-\s*([a-zA-Z]+(?:\s*\([A-Za-z\s]+\))?:)/g, '\n• $1');

  // 6. Clean excess whitespace while preserving newlines
  s = s
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}
