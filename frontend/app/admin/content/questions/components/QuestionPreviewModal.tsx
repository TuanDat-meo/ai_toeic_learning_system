"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Flag,
  Check,
  Plus,
  Volume2,
  Image as ImageIcon,
} from "lucide-react";
import { QuestionItem } from "../types";

interface QuestionPreviewModalProps {
  question: QuestionItem | null;
  onClose: () => void;
  playSfx?: (sound: string) => void;
  playAudio?: (url: string) => void;
  isPlayingAudio?: boolean;
  audioSpeed?: string;
  setAudioSpeed?: (speed: string) => void;
  showToast?: (msg: string) => void;
}

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({
  question,
  onClose,
  playSfx = () => {},
  playAudio = () => {},
  isPlayingAudio = false,
  audioSpeed = "1.0",
  setAudioSpeed = () => {},
  showToast = () => {},
}) => {
  if (!question) return null;
  const [userSelectedOption, setUserSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [showExplanationDetails, setShowExplanationDetails] = useState(true);
  const [showVocabSection, setShowVocabSection] = useState(true);
  const [isVocabExpanded, setIsVocabExpanded] = useState(true);
  const [addedVocabItems, setAddedVocabItems] = useState<string[]>([]);

  const cleanQuestionText = question.questionText.replace(/^[0-9]+\.\s*/, "");

  const vocabList = question.vocabList || (
    question.part === "Part 1"
      ? [
          {
            word: "workstation",
            pos: "n",
            level: "B1",
            ipa: "/ˈwɜːrksteɪʃn/",
            meaning: "bàn làm việc máy tính",
            exampleEn: "She is sitting focused at her computer workstation.",
            exampleVi: "Cô ấy đang ngồi tập trung tại bàn máy tính làm việc của mình.",
            collocations: ["computer workstation – trạm máy tính làm việc", "workstation setup – thiết lập bàn làm việc"],
            synonyms: ["desk – bàn làm việc"],
            antonyms: ["field – ngoài trời/công trường"],
            wordFamily: ["work v – làm việc", "worker n – người lao động"],
          },
          {
            word: "cabinet",
            pos: "n",
            level: "B1",
            ipa: "/ˈkæbɪnət/",
            meaning: "tủ tài liệu/hồ sơ",
            exampleEn: "Important paper documents are organized into a metal cabinet.",
            exampleVi: "Tài liệu giấy quan trọng được sắp xếp vào tủ hồ sơ kim loại.",
            collocations: ["filing cabinet – tủ đựng hồ sơ", "cabinet drawer – ngăn kéo tủ"],
            synonyms: ["cupboard – tủ đựng đồ"],
            antonyms: [],
            wordFamily: [],
          },
          {
            word: "whiteboard",
            pos: "n",
            level: "A2",
            ipa: "/ˈwaɪtbɔːrd/",
            meaning: "bảng viết bút lông",
            exampleEn: "She is hanging a new whiteboard on the wall.",
            exampleVi: "Cô ấy đang treo một chiếc bảng trắng mới lên tường.",
            collocations: ["whiteboard marker – bút viết bảng"],
            synonyms: [],
            antonyms: [],
            wordFamily: [],
          },
        ]
      : question.part === "Part 2"
      ? [
          {
            word: "invoice",
            pos: "n",
            level: "B2",
            ipa: "/ˈɪnvɔɪs/",
            meaning: "hóa đơn thanh toán/giao hàng",
            exampleEn: "Where should I file the newly approved shipment invoices?",
            exampleVi: "Tôi nên cất giữ các hóa đơn lô hàng mới được phê duyệt ở đâu?",
            collocations: ["tax invoice – hóa đơn thuế", "paid invoice – hóa đơn đã thanh toán"],
            synonyms: ["bill – hóa đơn"],
            antonyms: [],
            wordFamily: ["invoicing n – việc lập hóa đơn"],
          },
          {
            word: "shipment",
            pos: "n",
            level: "B2",
            ipa: "/ˈʃɪpmənt/",
            meaning: "lô hàng, việc vận chuyển",
            exampleEn: "Yes, the shipment arrived yesterday afternoon.",
            exampleVi: "Có, đơn giao lô hàng đã đến vào chiều qua.",
            collocations: ["shipment tracking – theo dõi lô hàng"],
            synonyms: ["delivery – giao hàng"],
            antonyms: [],
            wordFamily: ["ship v – vận chuyển"],
          },
          {
            word: "approved",
            pos: "adj",
            level: "B1",
            ipa: "/əˈpruːvd/",
            meaning: "đã được phê duyệt",
            exampleEn: "The newly approved plan will take effect tomorrow.",
            exampleVi: "Kế hoạch mới được phê duyệt sẽ có hiệu lực vào ngày mai.",
            collocations: ["approved budget – ngân sách đã phê duyệt"],
            synonyms: ["authorized – được ủy quyền"],
            antonyms: ["rejected – bị từ chối"],
            wordFamily: ["approve v – phê duyệt", "approval n – sự phê duyệt"],
          },
        ]
      : question.part === "Part 5"
      ? [
          {
            word: "include",
            pos: "v",
            level: "B1",
            ipa: "/ɪnˈkluːd/",
            meaning: "bao gồm",
            exampleEn: "The price does not include breakfast.",
            exampleVi: "Giá này không bao gồm bữa sáng.",
            collocations: ["include tax – bao gồm thuế", "include the details – bao gồm cả chi tiết"],
            synonyms: ["contain – chứa"],
            antonyms: ["exclude – loại trừ"],
            wordFamily: ["including prep – bao gồm cả", "inclusion n – sự bao gồm", "inclusive adj – bao gồm tất cả"],
          },
          {
            word: "reimbursement",
            pos: "n",
            level: "B2",
            ipa: "/ˌriːɪmˈbɜːrsmənt/",
            meaning: "khoản hoàn trả chi phí",
            exampleEn: "Reimbursement for travel expenses will be included in your paycheck.",
            exampleVi: "Khoản hoàn trả chi phí đi lại sẽ được bao gồm trong phiếu lương của bạn.",
            collocations: ["expense reimbursement – hoàn trả chi phí", "reimbursement policy – chính sách hoàn trả"],
            synonyms: ["refund – tiền hoàn lại"],
            antonyms: [],
            wordFamily: ["reimburse v – hoàn lại tiền"],
          },
          {
            word: "paycheck",
            pos: "n",
            level: "B1",
            ipa: "/ˈpeɪtʃek/",
            meaning: "phiếu lương, tiền lương",
            exampleEn: "Reimbursement will be included in your October 1 paycheck.",
            exampleVi: "Khoản hoàn trả sẽ được bao gồm trong phiếu lương ngày 1 tháng 10 của bạn.",
            collocations: ["monthly paycheck – phiếu lương hàng tháng"],
            synonyms: ["salary – tiền lương"],
            antonyms: [],
            wordFamily: [],
          },
        ]
      : [
          {
            word: "replacement",
            pos: "n",
            level: "B2",
            ipa: "/rɪˈpleɪsmənt/",
            meaning: "sự thay thế, vật thay thế",
            exampleEn: "We will offer a free replacement cartridge.",
            exampleVi: "Chúng tôi sẽ cung cấp hộp mực thay thế miễn phí.",
            collocations: ["replacement part – linh kiện thay thế"],
            synonyms: ["substitute – vật thay thế"],
            antonyms: [],
            wordFamily: ["replace v – thay thế"],
          },
          {
            word: "supplier",
            pos: "n",
            level: "B2",
            ipa: "/səˈplaɪər/",
            meaning: "nhà cung cấp",
            exampleEn: "The logistics supplier responded to our inquiry.",
            exampleVi: "Nhà cung cấp hậu cần đã phản hồi yêu cầu của chúng tôi.",
            collocations: ["equipment supplier – nhà cung cấp thiết bị"],
            synonyms: ["vendor – nhà bán hàng"],
            antonyms: [],
            wordFamily: ["supply v/n – cung cấp/nguồn cung"],
          },
        ]
  );

  const steps = question.steps || (
    question.part === "Part 1"
      ? [
          { title: "Bước 1: Quan sát bức ảnh", desc: "Xác định các chủ thể hành động và vật thể chính trong không gian phòng làm việc." },
          { title: "Bước 2: Phân tích hành động", desc: question.explanation || "Bức ảnh thể hiện rõ người trong hình đang thao tác làm việc với thiết bị máy tính." },
          { title: "Bước 3: Chọn đáp án", desc: "Phương án B mô tả chính xác nhất hành động làm việc tại bàn máy tính." },
        ]
      : question.part === "Part 2"
      ? [
          { title: "Bước 1: Xác định từ hỏi (Where)", desc: "Lắng nghe từ hỏi 'Where' chỉ vị trí/nơi chốn để loại trừ các đáp án trả lời Yes/No hay số lượng." },
          { title: "Bước 2: Phân tích nội dung câu hỏi", desc: question.explanation || "Hỏi vị trí cất giữ tài liệu hóa đơn lô hàng mới được phê duyệt." },
          { title: "Bước 3: Chọn đáp án", desc: "Phương án A chỉ rõ vị trí tủ hồ sơ cạnh bàn lễ tân." },
        ]
      : [
          { title: "Bước 1: Xác định dạng câu hỏi & từ loại", desc: "Phân tích cấu trúc ngữ pháp và vị trí đại từ / tính từ sở hữu cần điền vào câu." },
          { title: "Bước 2: Phân tích ngữ cảnh & nghĩa của câu", desc: question.explanation || "Chỗ trống nằm trước cụm danh từ 'October 1 paycheck' nên cần tính từ sở hữu 'your'." },
          { title: "Bước 3: Chọn đáp án chính xác", desc: "Chọn tính từ sở hữu 'your' bổ nghĩa cho cụm danh từ phía sau." },
        ]
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-100 rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-700 text-xs font-extrabold border border-blue-200">
              {question.part}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">
                {question.code || question.id}
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs font-bold text-slate-500">{question.skill}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* CỘT TRÁI (LEFT PANE): ẢNH, ĐOẠN VĂN, AUDIO */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-slate-50/50 space-y-6">
            {/* Ảnh minh họa nếu là Part 1 */}
            {question.imageUrl && (
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Hình ảnh câu hỏi (Part 1):
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                  <img
                    src={question.imageUrl}
                    alt="Question visual"
                    className="w-full h-auto object-cover max-h-80"
                  />
                </div>
              </div>
            )}

            {/* Đoạn văn nếu là Part 3, Part 4, Part 6, Part 7 */}
            {question.passage && (
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {question.part === "Part 3" || question.part === "Part 4"
                    ? "Kịch bản bài nghe (Script):"
                    : "Đoạn văn đọc hiểu (Passage):"}
                </span>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line shadow-xs">
                  {question.passage}
                </div>
              </div>
            )}

            {/* Trình phát Audio nếu có (Part 1 - Part 4) */}
            {question.audioUrl && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        playAudio(question.audioUrl!);
                      }}
                      className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition cursor-pointer"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-6 h-6 fill-white" />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5 fill-white" />
                      )}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Bấm nghe âm thanh câu hỏi</p>
                      <p className="text-[11px] text-slate-400">Nghe lại nhiều lần nếu cần</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-600 shrink-0">00:15</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Tốc độ phát:</span>
                  <div className="flex items-center gap-2">
                    {(["0.8", "1.0", "1.2"] as const).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          playSfx("click");
                          setAudioSpeed(spd);
                          showToast(`Đã đổi tốc độ phát sang ${spd}x`);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          audioSpeed === spd
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (RIGHT PANE): CÂU HỎI, CÁC ĐÁP ÁN & GIẢI THÍCH */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Khung nội dung câu hỏi & Dịch câu hỏi */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-2xs">
                    {question.difficulty === "Easy"
                      ? "Lv.1"
                      : question.difficulty === "Hard"
                      ? "Lv.3"
                      : "Lv.2"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast("Đã gửi yêu cầu hỏi bài đến giảng viên/AI!")}
                      className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hỏi bài</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast("Đã lưu câu hỏi vào danh sách yêu thích! ⭐")}
                      className="p-1.5 rounded-xl border border-slate-200 text-amber-500 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </button>
                  </div>
                </div>

                {question.part === "Part 2" ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                      Câu hỏi (Part 2):
                    </span>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {cleanQuestionText}
                    </p>
                  </div>
                ) : question.part !== "Part 1" ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {cleanQuestionText}
                    </p>
                  </div>
                ) : null}

                {/* Dịch nghĩa câu hỏi tiếng Việt */}
                {showExplanation && (
                  <div className="border-l-3 border-blue-500 pl-3 py-2.5 text-xs font-semibold text-blue-800 bg-blue-50/80 rounded-r-xl animate-in fade-in duration-200 leading-relaxed">
                    {question.part === "Part 1" &&
                      "Bức ảnh thể hiện rõ người phụ nữ đang tập trung gõ phím làm việc tại bàn máy tính ('She is working at a computer workstation')."}
                    {question.part === "Part 2" &&
                      "Tôi nên cất giữ các hóa đơn lô hàng mới được phê duyệt ở đâu?"}
                    {(question.part === "Part 3" || question.part === "Part 4") &&
                      "Người phụ nữ đề nghị làm gì để giải quyết vấn đề trước mắt?"}
                    {question.part === "Part 5" &&
                      "Khoản hoàn trả chi phí đi lại sẽ được bao gồm trong phiếu lương ngày 1 tháng 10 của bạn."}
                    {(question.part === "Part 6" || question.part === "Part 7") &&
                      "Đọc kỹ văn bản bên dưới để tìm thông tin trả lời câu hỏi."}
                  </div>
                )}
              </div>

              {/* Các phương án đáp án */}
              <div className="space-y-3">
                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Chọn phương án đúng:
                </p>

                <div className="space-y-3">
                  {question.options
                    .filter((opt) => question.part !== "Part 2" || opt.id !== "D")
                    .map((opt) => {
                      const isSelected = userSelectedOption === opt.id;
                      const isCorrect = opt.id === question.correctAnswer;
                      const isPart1Or2 =
                        question.part === "Part 1" || question.part === "Part 2";
                      const hideScriptBeforeCheck = isPart1Or2 && !showExplanation;

                      const cleanOptText = opt.text
                        ? opt.text.replace(/^[A-D][\.\:\)]\s*/i, "").trim()
                        : "";
                      const mainText = hideScriptBeforeCheck
                        ? ""
                        : cleanOptText || opt.text || "";

                      let subtext = "";
                      if (question.part === "Part 1") {
                        if (opt.id === "A") subtext = "| Dịch: Cô ấy đang treo một chiếc bảng trắng lên tường";
                        if (opt.id === "B") subtext = "| Dịch: Cô ấy đang làm việc tại bàn máy tính làm việc";
                        if (opt.id === "C") subtext = "| Dịch: Cô ấy đang sắp xếp tài liệu giấy vào tủ kim loại";
                        if (opt.id === "D") subtext = "| Dịch: Cô ấy đang trả lời một cuộc điện thoại gọi đến";
                      } else if (question.part === "Part 2") {
                        if (opt.id === "A") subtext = "| Dịch: Ở tủ hồ sơ ngay bên cạnh bàn lễ tân";
                        if (opt.id === "B") subtext = "| Dịch: Có, đơn giao hàng đã đến vào chiều qua";
                        if (opt.id === "C") subtext = "| Dịch: Khoảng 50 đô la cho mỗi hóa đơn";
                      } else if (question.part === "Part 5") {
                        if (opt.id === "A") subtext = "| (pron): bạn";
                        if (opt.id === "B") subtext = "| (adj sở hữu): của bạn";
                        if (opt.id === "C") subtext = "| (pron sở hữu): cái của bạn";
                        if (opt.id === "D") subtext = "| (pron): chính bạn";
                      } else if (question.part === "Part 3" || question.part === "Part 4") {
                        if (opt.id === "A") subtext = "| Dịch: Cung cấp thiết bị thay thế";
                        if (opt.id === "B") subtext = "| Dịch: Hoàn lại tiền cho khách hàng";
                        if (opt.id === "C") subtext = "| Dịch: Sửa chữa linh kiện bị hỏng";
                        if (opt.id === "D") subtext = "| Dịch: Hủy bỏ hợp đồng dịch vụ";
                      } else {
                        if (opt.id === "A") subtext = "| Dịch: Thông báo thay đổi chính sách công ty";
                        if (opt.id === "B") subtext = "| Dịch: Yêu cầu xác nhận đơn đặt hàng";
                        if (opt.id === "C") subtext = "| Dịch: Cung cấp lịch trình bảo trì thiết bị";
                        if (opt.id === "D") subtext = "| Dịch: Gửi lời mời tham dự hội thảo";
                      }

                      let cardStyle = "border-slate-200 bg-white text-slate-800 hover:bg-slate-50";
                      let iconNode = (
                        <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 transition">
                          {opt.id}
                        </span>
                      );

                      if (showExplanation) {
                        if (isCorrect) {
                          cardStyle = "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                          iconNode = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
                        } else if (isSelected) {
                          cardStyle = "border-rose-400 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-400/20";
                          iconNode = <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
                        } else {
                          cardStyle = "border-slate-200 bg-white text-slate-700 opacity-75";
                        }
                      } else if (isSelected) {
                        cardStyle = "border-2 border-blue-600 bg-blue-50/90 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs";
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (showExplanation) return;
                            playSfx("click");
                            setUserSelectedOption(opt.id);
                          }}
                          className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${cardStyle}`}
                        >
                          {iconNode}

                          <div className="flex-1 space-y-1">
                            <span className="text-sm font-semibold">
                              ({opt.id}){mainText ? ` ${mainText}` : ""}
                            </span>
                            {showExplanation && subtext && (
                              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 pt-0.5">
                                <span>{subtext}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Nút kiểm tra / làm lại */}
              {!showExplanation ? (
                <button
                  type="button"
                  disabled={!userSelectedOption}
                  onClick={() => {
                    playSfx("click");
                    setShowExplanation(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-sm font-extrabold transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setUserSelectedOption(null);
                    setShowExplanation(false);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Làm lại câu hỏi này
                </button>
              )}

              {/* Giải thích chi tiết & Từ vựng khi kiểm tra */}
              {showExplanation && (
                <div className="space-y-4 animate-in fade-in">
                  {/* TOGGLE 1: GIẢI THÍCH CHI TIẾT */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between py-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Giải thích chi tiết</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSfx("click");
                          setShowExplanationDetails(!showExplanationDetails);
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          showExplanationDetails ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            showExplanationDetails ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {showExplanationDetails && (
                      <div className="mt-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-800 space-y-2.5 animate-in fade-in duration-150 shadow-2xs">
                        {steps.map((st, i) => (
                          <div key={i} className="space-y-0.5">
                            <p className="font-bold text-blue-900">{st.title}</p>
                            <p className="text-slate-600 leading-relaxed pl-2 border-l-2 border-blue-300">
                              {st.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TOGGLE 2: TỪ VỰNG NÊN HỌC */}
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm">
                        <BookOpen className="w-4.5 h-4.5 text-amber-600" />
                        <span>Từ vựng nên học</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSfx("click");
                          setShowVocabSection(!showVocabSection);
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          showVocabSection ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            showVocabSection ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {showVocabSection && (
                      <div className="space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between pt-1 pb-1 border-t border-amber-200/50">
                          <span className="text-xs font-semibold text-slate-600">
                            {vocabList.length} từ
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                playSfx("click");
                                setIsVocabExpanded(!isVocabExpanded);
                              }}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-amber-100/70 transition cursor-pointer flex items-center gap-1.5"
                            >
                              {isVocabExpanded ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Thu gọn</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Xem chi tiết</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                playSfx("click");
                                setAddedVocabItems(vocabList.map((v: any) => v.word));
                                showToast(`Đã thêm tất cả ${vocabList.length} từ vào sổ từ vựng! ✨`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm tất cả ({vocabList.length})</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                          {vocabList.map((v: any, idx: number) => {
                            const isSaved = addedVocabItems.includes(v.word);

                            if (isVocabExpanded) {
                              return (
                                <div
                                  key={idx}
                                  className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 transition"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-slate-900 text-base">{v.word}</span>
                                        <span className="italic font-serif text-slate-500 text-xs">{v.pos}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                                          {v.level}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                                        <span>{v.ipa}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            playSfx("click");
                                            playAudio(v.word);
                                          }}
                                          className="text-blue-600 hover:text-blue-800 p-0.5 rounded transition cursor-pointer"
                                          title="Nghe phát âm"
                                        >
                                          <Volume2 className="w-3.5 h-3.5 inline" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => showToast(`Đã ghim từ "${v.word}"!`)}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition cursor-pointer"
                                        title="Đánh dấu từ"
                                      >
                                        <Flag className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          playSfx("click");
                                          if (isSaved) {
                                            setAddedVocabItems(addedVocabItems.filter((item) => item !== v.word));
                                          } else {
                                            setAddedVocabItems([...addedVocabItems, v.word]);
                                            showToast(`Đã lưu từ "${v.word}" vào sổ từ vựng!`);
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                          isSaved
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                            : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                                        }`}
                                      >
                                        {isSaved ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã lưu
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="w-3.5 h-3.5" /> Thêm
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-sm font-bold text-slate-800 leading-snug">{v.meaning}</p>

                                  {v.exampleEn && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-150/80 text-xs space-y-1">
                                      <p className="text-slate-800 font-medium">{v.exampleEn}</p>
                                      <p className="text-slate-500">{v.exampleVi}</p>
                                    </div>
                                  )}

                                  {v.collocations && v.collocations.length > 0 && (
                                    <div className="space-y-1 text-xs pt-1">
                                      <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Cụm từ</span>
                                      <div className="space-y-0.5 text-slate-700">
                                        {v.collocations.map((c: string, cIdx: number) => (
                                          <p key={cIdx} className="leading-tight">• {c}</p>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {((v.synonyms && v.synonyms.length > 0) || (v.antonyms && v.antonyms.length > 0)) && (
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                                      {v.synonyms && v.synonyms.length > 0 && (
                                        <div>
                                          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Đồng nghĩa</span>
                                          <p className="text-slate-700 text-[11px] font-medium">{v.synonyms.join(", ")}</p>
                                        </div>
                                      )}
                                      {v.antonyms && v.antonyms.length > 0 && (
                                        <div>
                                          <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider">Trái nghĩa</span>
                                          <p className="text-slate-700 text-[11px] font-medium">{v.antonyms.join(", ")}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {v.wordFamily && v.wordFamily.length > 0 && (
                                    <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Họ từ</span>
                                      <div className="space-y-0.5 text-slate-700 text-[11px]">
                                        {v.wordFamily.map((wf: string, wfIdx: number) => (
                                          <p key={wfIdx}>• {wf}</p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div
                                key={idx}
                                className="p-3 rounded-xl border border-amber-200/80 bg-white flex items-center justify-between gap-3 text-xs shadow-2xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 text-sm">{v.word}</span>
                                    <span className="italic text-slate-500 font-semibold">{v.pos}</span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                      {v.level}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                                    <span className="font-mono text-slate-500">{v.ipa}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        playSfx("click");
                                        playAudio(v.word);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 cursor-pointer p-0.5 rounded hover:bg-blue-50 transition"
                                      title="Phát âm từ này"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-medium text-slate-800">{v.meaning}</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    playSfx("click");
                                    if (isSaved) {
                                      setAddedVocabItems(addedVocabItems.filter((item) => item !== v.word));
                                    } else {
                                      setAddedVocabItems([...addedVocabItems, v.word]);
                                      showToast(`Đã lưu từ "${v.word}" vào sổ từ vựng!`);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    isSaved
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {isSaved ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" /> Đã lưu
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" /> Lưu từ
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <footer className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              showToast("Đã ghi nhận phản hồi về câu hỏi này!");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            <span>Báo lỗi câu hỏi</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition cursor-pointer shadow-xs"
            >
              Đóng cửa sổ
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
