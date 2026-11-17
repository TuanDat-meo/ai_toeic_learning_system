"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bolt,
  BookOpen,
  Crosshair,
  Heart,
  Medal,
  PackageOpen,
  Pause,
  Rocket,
  ScanSearch,
  Shield,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";

type Direction = "en-vi" | "vi-en";
type AnswerMode = "classic" | "typing" | "mixed";
type ItemId =
  | "scanner"
  | "elimination"
  | "freeze"
  | "repair"
  | "multishot"
  | "shield"
  | "double-score"
  | "magnet"
  | "mystery-box"
  | "phoenix";
type InventoryEntry = { id: ItemId; count: number };
type Choice = { id: string; label: string; correct: boolean };
type AnswerStatus = "correct" | "wrong" | null;

interface VocabularyPrompt {
  word: string;
  phonetic: string;
  meanings: string[];
  hint: string;
  alternatives: string[];
  distractors: string[];
}

interface ReviewEntry {
  word: string;
  dueAt: number;
}

const prompts: VocabularyPrompt[] = [
  {
    word: "accommodation",
    phonetic: "/əˌkɑːməˈdeɪʃən/",
    meanings: ["chỗ ở", "nơi lưu trú"],
    hint: "Danh từ: nơi bạn ở khi đi công tác hoặc du lịch.",
    alternatives: ["accommodation"],
    distractors: ["sự vận chuyển", "sự thanh toán", "sự thông báo"],
  },
  {
    word: "negotiate",
    phonetic: "/nɪˈɡoʊʃieɪt/",
    meanings: ["đàm phán", "thương lượng"],
    hint: "Động từ: cùng thảo luận để đạt thỏa thuận.",
    alternatives: ["negotiate", "to negotiate"],
    distractors: ["đặt chỗ", "giao hàng", "tuyển dụng"],
  },
  {
    word: "invoice",
    phonetic: "/ˈɪnvɔɪs/",
    meanings: ["hóa đơn", "giấy báo thanh toán"],
    hint: "Danh từ: liệt kê hàng hóa/dịch vụ và số tiền cần trả.",
    alternatives: ["invoice"],
    distractors: ["hợp đồng", "lịch trình", "đơn xin việc"],
  },
  {
    word: "shipment",
    phonetic: "/ˈʃɪpmənt/",
    meanings: ["lô hàng", "việc giao hàng"],
    hint: "Danh từ: hàng hóa được gửi đi cùng một đợt.",
    alternatives: ["shipment", "consignment"],
    distractors: ["cuộc họp", "hóa đơn", "khoản vay"],
  },
  {
    word: "deadline",
    phonetic: "/ˈdedlaɪn/",
    meanings: ["hạn chót", "thời hạn cuối"],
    hint: "Danh từ: thời điểm cuối cùng phải hoàn thành công việc.",
    alternatives: ["deadline"],
    distractors: ["lịch khởi hành", "bản báo cáo", "thời gian nghỉ"],
  },
  {
    word: "reliable",
    phonetic: "/rɪˈlaɪəbəl/",
    meanings: ["đáng tin cậy", "đáng tin"],
    hint: "Tính từ: có thể tin tưởng là sẽ hoạt động hoặc cư xử tốt.",
    alternatives: ["reliable"],
    distractors: ["có sẵn", "tạm thời", "có lợi"],
  },
  {
    word: "reservation",
    phonetic: "/ˌrezərˈveɪʃən/",
    meanings: ["sự đặt chỗ", "đặt chỗ trước"],
    hint: "Danh từ: sắp xếp trước để giữ chỗ ở nhà hàng hoặc khách sạn.",
    alternatives: ["reservation"],
    distractors: ["sự hoàn tiền", "sự vận chuyển", "cuộc phỏng vấn"],
  },
  {
    word: "purchase",
    phonetic: "/ˈpɜːrtʃəs/",
    meanings: ["mua", "việc mua hàng"],
    hint: "Động từ hoặc danh từ: dùng tiền để có được thứ gì.",
    alternatives: ["purchase", "to purchase"],
    distractors: ["bán", "vận chuyển", "sửa chữa"],
  },
  {
    word: "schedule",
    phonetic: "/ˈskedʒuːl/",
    meanings: ["lịch trình", "thời gian biểu"],
    hint: "Danh từ: danh sách thời gian của các sự kiện đã lên kế hoạch.",
    alternatives: ["schedule"],
    distractors: ["hóa đơn", "địa chỉ", "khoản chi"],
  },
  {
    word: "refund",
    phonetic: "/ˈriːfʌnd/",
    meanings: ["hoàn tiền", "khoản tiền được hoàn lại"],
    hint: "Danh từ/động từ: tiền trả lại cho khách hàng.",
    alternatives: ["refund", "to refund"],
    distractors: ["giảm giá", "hóa đơn", "tiền đặt cọc"],
  },
  {
    word: "efficient",
    phonetic: "/ɪˈfɪʃənt/",
    meanings: ["hiệu quả", "có năng suất"],
    hint: "Tính từ: đạt kết quả tốt mà không lãng phí thời gian hoặc nguồn lực.",
    alternatives: ["efficient"],
    distractors: ["đắt đỏ", "phức tạp", "có trách nhiệm"],
  },
  {
    word: "applicant",
    phonetic: "/ˈæplɪkənt/",
    meanings: ["người nộp đơn", "ứng viên"],
    hint: "Danh từ: người gửi hồ sơ xin việc hoặc xin tham gia.",
    alternatives: ["applicant"],
    distractors: ["nhà tuyển dụng", "khách hàng", "đồng nghiệp"],
  },
];

const itemCatalog: {
  id: ItemId;
  name: string;
  detail: string;
  icon: typeof ScanSearch;
  color: string;
}[] = [
  { id: "scanner", name: "Hint Scanner", detail: "Mở gợi ý, không tiết lộ đáp án.", icon: ScanSearch, color: "text-cyan-200" },
  { id: "elimination", name: "Elimination", detail: "Ẩn hai đáp án sai.", icon: Crosshair, color: "text-violet-200" },
  { id: "freeze", name: "Time Freeze", detail: "Tạm dừng đồng hồ mục tiêu.", icon: Timer, color: "text-sky-200" },
  { id: "repair", name: "Emergency Repair", detail: "Hồi một mạng, tối đa ba.", icon: Heart, color: "text-rose-200" },
  { id: "multishot", name: "Multi-Shot", detail: "Cường hóa phát bắn sau câu đúng.", icon: Bolt, color: "text-amber-200" },
  { id: "shield", name: "Energy Shield", detail: "Chặn một lần mất mạng.", icon: Shield, color: "text-blue-200" },
  { id: "double-score", name: "Double Score", detail: "Nhân đôi điểm trong thời gian ngắn.", icon: Medal, color: "text-yellow-200" },
  { id: "magnet", name: "Magnet", detail: "Hút coin và vật phẩm rơi.", icon: Zap, color: "text-fuchsia-200" },
  { id: "mystery-box", name: "Mystery Box", detail: "Nhận vật phẩm hoặc coin ngẫu nhiên.", icon: PackageOpen, color: "text-purple-200" },
  { id: "phoenix", name: "Phoenix Core", detail: "Hồi sinh một lần khi hết mạng.", icon: Sparkles, color: "text-orange-200" },
];

const starField = Array.from({ length: 42 }, (_, index) => ({
  left: `${(index * 47 + 9) % 100}%`,
  top: `${(index * 61 + 5) % 100}%`,
  opacity: 0.2 + (index % 5) * 0.12,
}));

function normalizedAnswer(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function questionChoices(prompt: VocabularyPrompt, direction: Direction, questionIndex: number): Choice[] {
  const correctAnswers = direction === "en-vi" ? prompt.meanings : prompt.alternatives;
  const correctAnswer = correctAnswers[0];
  const wrongAnswers = prompt.distractors.slice(0, 3);
  const correctPosition = (questionIndex * 3 + 1) % 4;
  const answers = [...wrongAnswers];
  answers.splice(correctPosition, 0, correctAnswer);
  return answers.map((label, index) => ({
    id: `${questionIndex}-${index}`,
    label,
    correct: index === correctPosition,
  }));
}

export default function VocabularySpaceDefenseMockup() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("mixed");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lives, setLives] = useState(3);
  const [bossHp, setBossHp] = useState(100);
  const [inventory, setInventory] = useState<InventoryEntry[]>([
    { id: "scanner", count: 1 },
    { id: "elimination", count: 1 },
    { id: "shield", count: 1 },
  ]);
  const [notice, setNotice] = useState("Chọn đáp án hoặc nhập câu trả lời. Phím 1–4 chọn đáp án nhanh.");
  const [hintVisible, setHintVisible] = useState(false);
  const [eliminatedChoiceIds, setEliminatedChoiceIds] = useState<string[]>([]);
  const [shieldActive, setShieldActive] = useState(false);
  const [doubleScoreActive, setDoubleScoreActive] = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [multiShotActive, setMultiShotActive] = useState(false);
  const [phoenixAvailable, setPhoenixAvailable] = useState(false);
  const [coinCount, setCoinCount] = useState(12);
  const [earnedReward, setEarnedReward] = useState<ItemId | "coin" | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ReviewEntry[]>([]);

  const reviewEntry = reviewQueue.find((entry) => entry.dueAt <= questionIndex);
  const prompt = reviewEntry
    ? prompts.find((entry) => entry.word === reviewEntry.word) ?? prompts[questionIndex % prompts.length]
    : prompts[questionIndex % prompts.length];
  const direction: Direction = questionIndex % 2 === 0 ? "en-vi" : "vi-en";
  const isBossRound = questionIndex > 0 && questionIndex % 10 === 0;
  const isTypingRound = answerMode === "typing" || (answerMode === "mixed" && questionIndex % 2 === 1);
  const choices = useMemo(
    () => questionChoices(prompt, direction, questionIndex),
    [direction, prompt, questionIndex],
  );
  const completedInMission = questionIndex % 10;
  const bossProgress = bossHp;
  const currentItem = (id: ItemId) => inventory.find((entry) => entry.id === id);

  useEffect(() => {
    if (!freezeActive) return;
    const timeout = window.setTimeout(() => {
      setFreezeActive(false);
      setNotice("Time Freeze hết hiệu lực — mục tiêu tiếp tục di chuyển.");
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [freezeActive]);

  useEffect(() => {
    if (!doubleScoreActive) return;
    const timeout = window.setTimeout(() => {
      setDoubleScoreActive(false);
      setNotice("Double Score đã hết hiệu lực.");
    }, 10_000);
    return () => window.clearTimeout(timeout);
  }, [doubleScoreActive]);

  const resetQuestionState = () => {
    setSelectedChoiceId(null);
    setTypedAnswer("");
    setAnswerStatus(null);
    setHintVisible(false);
    setEliminatedChoiceIds([]);
    setEarnedReward(null);
  };

  const addItem = (id: ItemId) => {
    setInventory((current) => {
      const existing = current.find((entry) => entry.id === id);
      if (existing) {
        return current.map((entry) => entry.id === id ? { ...entry, count: entry.count + 1 } : entry);
      }
      if (current.length >= 3) return current;
      return [...current, { id, count: 1 }];
    });
  };

  const submitAnswer = () => {
    if (answerStatus) return;
    const selectedChoice = choices.find((choice) => choice.id === selectedChoiceId);
    const correct = isTypingRound
      ? (direction === "en-vi" ? prompt.meanings : prompt.alternatives)
        .some((accepted) => normalizedAnswer(accepted) === normalizedAnswer(typedAnswer))
      : selectedChoice?.correct === true;
    if (isTypingRound && !typedAnswer.trim()) {
      setNotice("Nhập câu trả lời trước khi khai hỏa.");
      return;
    }
    if (!isTypingRound && !selectedChoice) {
      setNotice("Chọn một đáp án A/B/C/D trước khi khai hỏa.");
      return;
    }

    setAnswerStatus(correct ? "correct" : "wrong");
    setTotalAnswered((current) => current + 1);
    if (correct) {
      if (reviewEntry) setReviewQueue((current) => current.filter((entry) => entry.word !== reviewEntry.word));
      setCorrectAnswers((current) => current + 1);
      const nextCombo = combo + 1;
      const basePoints = 10 + Math.min(nextCombo - 1, 4) * 5;
      setScore((current) => current + basePoints * (doubleScoreActive ? 2 : 1));
      setCombo(nextCombo);
      setBestCombo((current) => Math.max(current, nextCombo));
      setNotice(multiShotActive
        ? "Chính xác! Multi-Shot cường hóa đòn đánh — bạn vẫn phải tự trả lời câu hỏi."
        : "Chính xác! Tàu khai hỏa, combo và điểm đã được cập nhật trong bản demo.");
      setMultiShotActive(false);
      let availableSlots = 3 - inventory.length;
      const grantReward = (reward: ItemId) => {
        const alreadyOwned = Boolean(currentItem(reward));
        if (!alreadyOwned && availableSlots <= 0) return false;
        addItem(reward);
        if (!alreadyOwned) availableSlots -= 1;
        setEarnedReward(reward);
        return true;
      };
      if (nextCombo === 5 || nextCombo === 10) {
        const reward = nextCombo === 10 ? "mystery-box" : itemCatalog[(questionIndex + nextCombo) % 8].id;
        if (grantReward(reward)) {
          setNotice(nextCombo === 10 ? "Combo 10! Nhận Mystery Box." : "Đúng 5 câu liên tiếp! Nhận một vật phẩm.");
        } else {
          setNotice("Đạt mốc thưởng nhưng kho đã đầy — hãy dùng vật phẩm để trống một ô.");
        }
      }
      if (isBossRound) {
        setBossHp(0);
        if (grantReward("phoenix")) {
          setNotice("Hạ Boss! Nhận Phoenix Core hiếm.");
        } else {
          setCoinCount((current) => current + 20);
          setNotice("Hạ Boss! Kho đã đầy — nhận 20 coin thay vật phẩm hiếm.");
        }
      }
      return;
    }

    setCombo(0);
    setReviewQueue((current) => [
      ...current.filter((entry) => entry.word !== prompt.word),
      { word: prompt.word, dueAt: questionIndex + 3 },
    ]);
    if (shieldActive) {
      setShieldActive(false);
      setNotice("Sai đáp án nhưng Energy Shield đã chặn một lần mất mạng.");
    } else if (lives > 1) {
      setLives(lives - 1);
      setNotice("Chưa chính xác. Đáp án đúng được hiển thị để bạn ghi nhớ.");
    } else if (phoenixAvailable) {
      setPhoenixAvailable(false);
      setLives(1);
      setNotice("Phoenix Core kích hoạt: hồi sinh với 1 mạng.");
    } else {
      setNotice("Chưa chính xác. Đáp án đúng được hiển thị để bạn ghi nhớ.");
      setLives(0);
    }
  };

  const continueMission = () => {
    const nextIndex = questionIndex + 1;
    if (nextIndex > 0 && nextIndex % 10 === 0) {
      setBossHp(100);
      setNotice("BOSS BATTLE! Câu hỏi tiếp theo là thử thách đối đầu Boss.");
    } else if (earnedReward) {
      setNotice("Vật phẩm đã được đưa vào kho. Chọn thời điểm thích hợp để sử dụng.");
    } else {
      setNotice("Đợt mục tiêu tiếp theo đang đến.");
    }
    setQuestionIndex(nextIndex);
    resetQuestionState();
    setDoubleScoreActive(false);
  };

  const handleItemUse = (id: ItemId) => {
    const entry = currentItem(id);
    if (!entry || entry.count <= 0) return;

    if (id === "repair" && lives >= 3) {
      setNotice("Thân tàu đã đầy máu; Emergency Repair chưa cần dùng.");
      return;
    }
    if (id === "phoenix" && (lives > 0 || phoenixAvailable)) {
      setNotice("Phoenix Core chỉ kích hoạt khi hết mạng, tối đa một lần.");
      return;
    }
    if (id === "elimination" && isTypingRound) {
      setNotice("Elimination chỉ dùng được trong lượt trắc nghiệm.");
      return;
    }

    setInventory((current) => current
      .map((item) => item.id === id ? { ...item, count: item.count - 1 } : item)
      .filter((item) => item.count > 0));
    switch (id) {
      case "scanner":
        setHintVisible(true);
        setNotice("Hint Scanner mở gợi ý, không tiết lộ đáp án.");
        break;
      case "elimination": {
        setEliminatedChoiceIds(choices.filter((choice) => !choice.correct).slice(0, 2).map((choice) => choice.id));
        setNotice("Elimination đã loại hai phương án sai.");
        break;
      }
      case "freeze":
        setFreezeActive(true);
        setNotice("Time Freeze đang tạm dừng tốc độ mục tiêu trong 5 giây (minh họa).");
        break;
      case "repair":
        setLives((current) => Math.min(3, current + 1));
        setNotice("Emergency Repair hồi một mạng.");
        break;
      case "multishot":
        setMultiShotActive(true);
        setNotice("Multi-Shot sẵn sàng cường hóa phát bắn tiếp theo — không tự trả lời câu hỏi.");
        break;
      case "shield":
        setShieldActive(true);
        setNotice("Energy Shield sẵn sàng chặn một lần mất mạng.");
        break;
      case "double-score":
        setDoubleScoreActive(true);
        setNotice("Double Score kích hoạt cho lượt trả lời tiếp theo.");
        break;
      case "magnet":
        setCoinCount((current) => current + 3);
        setNotice("Magnet hút coin và vật phẩm gần đó (minh họa +3 coin).");
        break;
      case "mystery-box": {
        const reward = itemCatalog[(questionIndex + coinCount) % 8].id;
        if (inventory.length < 3 || currentItem(reward)) {
          addItem(reward);
          setNotice(`Mystery Box chứa ${itemCatalog.find((item) => item.id === reward)?.name}.`);
        } else {
          setCoinCount((current) => current + 5);
          setNotice("Kho đầy — Mystery Box đổi thành 5 coin.");
        }
        break;
      }
      case "phoenix":
        setPhoenixAvailable(true);
        setNotice("Phoenix Core sẽ tự hồi sinh nếu bạn hết mạng.");
        break;
    }
  };

  const accuracy = totalAnswered === 0 ? 100 : Math.round((correctAnswers / totalAnswered) * 100);

  return (
    <main className="mx-auto max-w-7xl space-y-4 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/vocabulary/games"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Game Center
        </Link>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300">UI Concept · Neon Cyberpunk</p>
          <h1 className="text-xl font-black text-white sm:text-2xl">Vocabulary Battleship</h1>
        </div>
      </header>

      <section className="overflow-hidden rounded-[1.75rem] border border-cyan-300/20 bg-[#080b1b] p-2 shadow-[0_0_70px_rgba(34,211,238,0.12)] sm:p-4">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-300/20 bg-[radial-gradient(ellipse_at_50%_42%,rgba(60,37,120,0.52),transparent_44%),radial-gradient(ellipse_at_10%_90%,rgba(8,145,178,0.15),transparent_40%),linear-gradient(145deg,#0b1027,#11112f_55%,#090d1d)]">
          {starField.map((star, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="pointer-events-none absolute h-0.5 w-0.5 rounded-full bg-cyan-100"
              style={{ left: star.left, top: star.top, opacity: star.opacity }}
            />
          ))}
          <div className="pointer-events-none absolute -right-20 top-28 h-56 w-56 rounded-full border border-fuchsia-300/10 bg-fuchsia-500/5 shadow-[0_0_80px_rgba(217,70,239,0.12)] sm:h-72 sm:w-72" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/40 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-200">
                <Crosshair className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/70">Sector 07 · TOEIC 650+</p>
                <p className="text-sm font-black text-white">NEBULA FRONTIER</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-3 py-1.5 text-xs font-bold text-amber-200">
              <Target className="h-3.5 w-3.5" /> MISSION {Math.floor(questionIndex / 10) + 1}
              <span className="text-amber-100/50">·</span> {completedInMission + 1}/10
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-300/20 bg-rose-950/30 px-3 py-2" aria-label={`${lives} mạng`}>
              {Array.from({ length: 3 }, (_, index) => (
                <Heart key={index} className={`h-4 w-4 ${index < lives ? "fill-rose-400 text-rose-400" : "text-slate-700"}`} />
              ))}
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-rose-200/70">Hull</span>
            </div>
          </div>

          <div className="relative z-10 grid gap-3 px-3 pt-3 sm:grid-cols-[1fr_auto_1fr] sm:px-5">
            <div className="flex items-center justify-between rounded-2xl border border-cyan-300/15 bg-slate-950/50 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Score</p>
                <p className="text-2xl font-black tabular-nums text-cyan-200">{score.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Coin</p>
                <p className="text-sm font-black text-amber-200">◈ {coinCount}</p>
              </div>
            </div>

            <div className="flex min-w-48 flex-col justify-center rounded-2xl border border-fuchsia-300/20 bg-slate-950/65 px-4 py-2.5 text-center sm:min-w-64">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em]">
                <span className="text-fuchsia-200">Dreadnought {isBossRound ? "· BOSS" : "· NEXT BOSS 10"}</span>
                <span className="text-white">{isBossRound ? bossProgress : "—"}{isBossRound ? "%" : ""}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-400 to-amber-300 transition-all duration-500"
                  style={{ width: `${isBossRound ? bossProgress : 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-amber-300/15 bg-slate-950/50 px-4 py-3 sm:justify-end sm:gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Combo</p>
                <p className="text-2xl font-black text-amber-200">×{combo}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Best</p>
                <p className="text-sm font-black text-emerald-200">×{bestCombo}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid gap-3 px-3 pb-3 pt-3 sm:px-5 sm:pb-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section
              className="relative flex min-h-[580px] flex-col overflow-hidden rounded-2xl border border-indigo-200/10 bg-slate-950/25 p-4 sm:p-5"
              aria-label="Khu vực chiến đấu"
              onKeyDown={(event) => {
                if (isTypingRound || answerStatus || !/^[1-4]$/.test(event.key)) return;
                const choice = choices[Number(event.key) - 1];
                if (choice && !eliminatedChoiceIds.includes(choice.id)) {
                  event.preventDefault();
                  setSelectedChoiceId(choice.id);
                }
              }}
            >
              <div className="pointer-events-none absolute right-8 top-14 h-32 w-32 rounded-full border border-fuchsia-300/10 bg-fuchsia-400/5 shadow-[0_0_60px_rgba(217,70,239,0.12)] sm:right-16 sm:h-48 sm:w-48" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Battle zone</p>
                  <p className="mt-1 text-sm font-black text-white">{isBossRound ? "BOSS ENCOUNTER" : "ENEMY WAVE"} <span className="text-cyan-200">· {direction === "en-vi" ? "EN → VI" : "VI → EN"}</span></p>
                </div>
                <button type="button" onClick={() => setNotice("Game đang tạm dừng trong bản thiết kế giao diện.")} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-[10px] font-bold text-slate-300">
                  <Pause className="h-3 w-3" /> TẠM DỪNG
                </button>
              </div>

              <div className="relative mt-3 min-h-[140px] flex-1 overflow-hidden rounded-xl border border-white/5 bg-slate-950/20">
                <div className="absolute left-[12%] top-[25%] rounded-lg border border-cyan-300/30 bg-cyan-950/75 px-3 py-2 shadow-[0_0_16px_rgba(34,211,238,0.15)]">
                  <p className="text-[8px] font-black tracking-[0.18em] text-cyan-200">SCOUT · 1 HP</p>
                  <p className="mt-1 text-xs font-black text-white">invoice</p>
                </div>
                <div className="absolute right-[13%] top-[43%] rounded-lg border border-amber-300/25 bg-amber-950/75 px-3 py-2">
                  <p className="text-[8px] font-black tracking-[0.18em] text-amber-200">ARMORED · 2 HP</p>
                  <p className="mt-1 text-xs font-black text-white">shipment</p>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center">
                  <Rocket className="mx-auto h-8 w-8 rotate-[-45deg] fill-cyan-300/20 text-cyan-100 drop-shadow-[0_0_12px_rgba(34,211,238,0.85)]" />
                  <p className="mt-1 text-[8px] font-black tracking-[0.25em] text-cyan-100/60">YOUR FIGHTER</p>
                </div>
                {multiShotActive ? <span className="absolute bottom-5 left-[42%] text-[9px] font-black text-amber-200">MULTI-SHOT READY</span> : null}
                {shieldActive ? <span className="absolute bottom-5 right-4 text-[9px] font-black text-blue-200">SHIELD ACTIVE</span> : null}
                {freezeActive ? <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-sky-300/10 px-2 py-1 text-[8px] font-black text-sky-100">TIME FROZEN</span> : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-xl border border-white/10 bg-slate-950/60 p-1" aria-label="Chế độ trả lời">
                  {([
                    ["classic", "Classic"],
                    ["typing", "Typing"],
                    ["mixed", "Mixed"],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setAnswerMode(id);
                        setSelectedChoiceId(null);
                        setTypedAnswer("");
                        setAnswerStatus(null);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition ${answerMode === id ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:text-white"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] font-semibold text-slate-500">
                  {answerMode === "classic" ? "Trắc nghiệm · phím 1–4" : answerMode === "typing" ? "Nhập đáp án" : "Trộn trắc nghiệm và nhập"}
                </span>
              </div>

              <div className="mt-3 rounded-2xl border border-cyan-200/15 bg-slate-950/75 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-200/5 px-2.5 py-1 text-[9px] font-black tracking-[0.14em] text-cyan-100">
                    <BookOpen className="h-3 w-3" /> {direction === "en-vi" ? "ENGLISH TARGET" : "VIETNAMESE TARGET"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    {reviewEntry ? "REVIEW" : isBossRound ? "Boss · câu hỏi đặc biệt" : `Question ${questionIndex + 1}`}
                  </span>
                </div>
                <h2 className="mt-3 text-center text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
                  {direction === "en-vi" ? prompt.word : prompt.meanings[0]}
                </h2>
                <p className="mt-1 text-center text-xs text-cyan-100/65">
                  {direction === "en-vi" ? prompt.phonetic : "Tìm từ tiếng Anh tương ứng"}
                </p>
                <p className="mt-2 text-center text-xs text-slate-400">
                  {direction === "en-vi" ? "Chọn nghĩa tiếng Việt chính xác" : "Chọn từ tiếng Anh phù hợp"}
                </p>

                {hintVisible ? (
                  <p className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 text-center text-xs text-cyan-100">
                    <ScanSearch className="mr-1 inline h-3.5 w-3.5" /> Gợi ý: {prompt.hint}
                  </p>
                ) : null}

                {!answerStatus && isTypingRound ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitAnswer();
                    }}
                    className="mx-auto mt-4 flex max-w-xl gap-2"
                  >
                    <label className="sr-only" htmlFor="mockup-answer">Nhập câu trả lời</label>
                    <input
                      id="mockup-answer"
                      value={typedAnswer}
                      onChange={(event) => setTypedAnswer(event.target.value)}
                      placeholder={direction === "en-vi" ? "Nhập nghĩa tiếng Việt..." : "Nhập từ tiếng Anh..."}
                      className="min-w-0 flex-1 rounded-xl border border-cyan-200/20 bg-slate-900 px-3 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-200/60"
                    />
                    <button type="submit" className="rounded-xl bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950 hover:bg-cyan-200">
                      FIRE ↵
                    </button>
                  </form>
                ) : null}

                {!answerStatus && !isTypingRound ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {choices.map((choice, index) => {
                      const eliminated = eliminatedChoiceIds.includes(choice.id);
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          disabled={eliminated}
                          onClick={() => setSelectedChoiceId(choice.id)}
                          className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                            eliminated
                              ? "cursor-not-allowed border-slate-800 bg-slate-950/50 text-slate-700 line-through opacity-60"
                              : selectedChoiceId === choice.id
                                ? "border-cyan-200 bg-cyan-300/10 text-cyan-50 ring-1 ring-cyan-200/50"
                                : "border-white/10 bg-slate-900/70 text-slate-200 hover:border-cyan-200/40"
                          }`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-[10px] font-black text-cyan-100">{String.fromCharCode(65 + index)}</span>
                          {choice.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      disabled={!selectedChoiceId}
                      onClick={submitAnswer}
                      className="sm:col-span-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      XÁC NHẬN & KHAI HỎA
                    </button>
                  </div>
                ) : null}

                {answerStatus ? (
                  <div className={`mt-4 rounded-xl border p-3 ${answerStatus === "correct" ? "border-emerald-300/30 bg-emerald-950/30" : "border-rose-300/30 bg-rose-950/30"}`}>
                    <p className={`text-sm font-black ${answerStatus === "correct" ? "text-emerald-200" : "text-rose-200"}`}>
                      {answerStatus === "correct" ? "ĐÚNG — MỤC TIÊU ĐÃ BỊ BẮN HẠ" : "CHƯA ĐÚNG — HÃY GHI NHỚ ĐÁP ÁN"}
                    </p>
                    <p className="mt-1 text-xs text-slate-200">
                      {direction === "en-vi"
                        ? `${prompt.word} = ${prompt.meanings.join(" / ")}`
                        : `${prompt.meanings.join(" / ")} = ${prompt.word}`}
                    </p>
                    {earnedReward ? <p className="mt-2 text-xs font-bold text-amber-200">Vật phẩm nhận được: {itemCatalog.find((item) => item.id === earnedReward)?.name}</p> : null}
                    <button type="button" onClick={continueMission} className="mt-3 rounded-lg bg-cyan-300 px-4 py-2 text-[10px] font-black text-slate-950 hover:bg-cyan-200">
                      TIẾP TỤC NHIỆM VỤ →
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[9px] font-semibold text-slate-500">
                <span>{freezeActive ? "Mục tiêu đóng băng 5 giây" : "Trả lời đúng để bắn hạ · sai làm mất combo và có thể mất mạng"}</span>
                <span>Độ chính xác {accuracy}% · Hai chiều luân phiên EN ↔ VI</span>
              </div>
            </section>

            <aside className="space-y-3">
              <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Power-up bay</p>
                    <h3 className="mt-1 text-sm font-black text-white">Kho vật phẩm <span className="text-cyan-200">{inventory.length}/3</span></h3>
                  </div>
                  <PackageOpen className="h-5 w-5 text-amber-200" />
                </div>
                <div className="mt-3 space-y-2">
                  {[0, 1, 2].map((slot) => {
                    const entry = inventory[slot];
                    const item = entry ? itemCatalog.find((candidate) => candidate.id === entry.id) : undefined;
                    const Icon = item?.icon ?? Sparkles;
                    return (
                      <div key={slot} className={`flex min-h-14 items-center gap-2 rounded-xl border px-2.5 py-2 ${item ? "border-indigo-200/15 bg-indigo-300/5" : "border-dashed border-slate-700 bg-slate-950/30"}`}>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900">
                          <Icon className={`h-4 w-4 ${item?.color ?? "text-slate-600"}`} />
                        </span>
                        {item ? (
                          <>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[10px] font-black text-white">{item.name}</span>
                              <span className="block text-[9px] text-slate-400">x{entry.count}</span>
                            </span>
                            <button type="button" onClick={() => handleItemUse(entry.id)} className="rounded-lg border border-cyan-200/20 bg-cyan-200/5 px-2 py-1.5 text-[9px] font-black text-cyan-100 hover:bg-cyan-200/10">
                              DÙNG
                            </button>
                          </>
                        ) : <span className="text-[9px] font-semibold text-slate-600">Ô trống · tối đa 3 món</span>}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[9px] leading-4 text-slate-500">Đúng 5 câu liên tiếp nhận vật phẩm · combo 10 nhận Mystery Box.</p>
              </section>

              <section className="rounded-2xl border border-rose-300/15 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Active recall</p>
                    <h3 className="mt-1 text-sm font-black text-white">Ôn từ sai</h3>
                  </div>
                  <BookOpen className="h-4 w-4 text-rose-200" />
                </div>
                <p className="mt-2 text-[10px] leading-4 text-slate-400">
                  {reviewQueue.length
                    ? `${reviewQueue.length} từ sẽ xuất hiện lại sau một vài câu.`
                    : "Từ trả lời sai sẽ được đưa vào hàng đợi ôn tập."}
                </p>
                {reviewQueue.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {reviewQueue.map((entry) => (
                      <span key={entry.word} className="rounded-md border border-rose-200/15 bg-rose-200/5 px-2 py-1 text-[9px] font-bold text-rose-100">
                        {entry.word}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Enemy database</p>
                    <h3 className="mt-1 text-sm font-black text-white">Đội hình địch</h3>
                  </div>
                  <Crosshair className="h-4 w-4 text-cyan-200" />
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    ["SCOUT", "Nhanh · 1 câu", "border-cyan-300/20 text-cyan-100"],
                    ["ARMORED", "Chậm · cần 2 hit", "border-amber-300/20 text-amber-100"],
                    ["STEALTH", "Ẩn từ · nhớ nghĩa", "border-violet-300/20 text-violet-100"],
                    ["BOMB", "Đếm ngược · ưu tiên", "border-rose-300/20 text-rose-100"],
                  ].map(([name, description, style]) => (
                    <div key={name} className={`flex items-center justify-between rounded-lg border bg-slate-900/50 px-2.5 py-2 ${style}`}>
                      <span className="text-[9px] font-black tracking-wider">{name}</span>
                      <span className="text-[9px] text-slate-400">{description}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-3">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                    <span className="text-fuchsia-200">Boss · every 10 questions</span>
                    <span className="text-white">{isBossRound ? `${bossProgress}% HP` : `${10 - completedInMission} câu nữa`}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-fuchsia-400 transition-all" style={{ width: `${isBossRound ? bossProgress : 100}%` }} />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Armory guide</p>
                    <h3 className="mt-1 text-sm font-black text-white">Vật phẩm trong game</h3>
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-200" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {itemCatalog.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} title={item.detail} className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/5 bg-slate-900/40 px-2 py-1.5">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${item.color}`} />
                        <span className="truncate text-[8px] font-semibold text-slate-300">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>

          <div className="relative z-10 mx-3 mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 sm:mx-5 sm:mb-5" aria-live="polite">
            <Sparkles className="h-4 w-4 shrink-0 text-cyan-200" />
            <p className="text-xs text-slate-300">{notice}</p>
            {doubleScoreActive ? <span className="ml-auto shrink-0 rounded bg-amber-300/10 px-2 py-1 text-[9px] font-black text-amber-200">2X SCORE</span> : null}
            {phoenixAvailable ? <span className="ml-auto shrink-0 rounded bg-orange-300/10 px-2 py-1 text-[9px] font-black text-orange-200">PHOENIX READY</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-3 text-[10px] font-semibold text-slate-500 sm:px-3">
          <span>Prototype tương tác · nội dung và điểm minh họa · chưa kết nối backend</span>
          <span>Đáp án gõ chấp nhận biến thể khai báo, không nhận gần đúng tự do</span>
        </div>
      </section>
    </main>
  );
}
