"use client";

import React, { useState, useEffect, useMemo } from "react";
import { playUnifiedAnswerSound } from "@/lib/sound";
import { TestItem, PracticeQuestion } from "./types";
import { SAMPLE_EXAM_QUESTIONS, INITIAL_TESTS_VOL1, INITIAL_TESTS_VOL2, INITIAL_TESTS_VOL3 } from "./mockData";
import { fetchMockTests, fetchMockTestQuestions } from "@/lib/api/mockTests";

import {
  MockTestHeader,
  MockTestAdminTab,
} from "@/components/admin/content/mock-tests/MockTestHeader";
import { MockTestCardGrid } from "@/components/admin/content/mock-tests/MockTestCardGrid";
import {
  MockTestSubmissionsView,
  MockTestScoreConversionView,
  MockTestCollectionsView,
} from "@/components/admin/content/mock-tests/MockTestViews";
import { MockTestExamModal } from "@/components/admin/content/mock-tests/MockTestExamModal";
import { MockTestPracticeModal } from "@/components/admin/content/mock-tests/MockTestPracticeModal";
import { MockTestHistoryModal } from "@/components/admin/content/mock-tests/MockTestHistoryModal";
import { MockTestTranscriptModal } from "@/components/admin/content/mock-tests/MockTestTranscriptModal";
import { MockTestVocabModal } from "@/components/admin/content/mock-tests/MockTestVocabModal";
import { MockTestDeleteModal } from "@/components/admin/content/mock-tests/MockTestDeleteModal";
import { MockTestCreateModal } from "@/components/admin/content/mock-tests/MockTestCreateModal";

export const LOCAL_MOCK_TESTS_V1 = "toeic_mock_tests_v1";
export const LOCAL_MOCK_TESTS_V2 = "toeic_mock_tests_v2";
export const LOCAL_MOCK_TESTS_V3 = "toeic_mock_tests_v3";
export const LOCAL_MOCK_TESTS_VERSION_KEY = "toeic_mock_tests_sync_ver";
export const CURRENT_TESTS_VERSION = "2026_10_22_real_data_v3";

function getLocalMockTests(key: string): TestItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const ver = localStorage.getItem(LOCAL_MOCK_TESTS_VERSION_KEY);
    if (ver !== CURRENT_TESTS_VERSION) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLocalMockTests(v1: TestItem[], v2: TestItem[], v3: TestItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_MOCK_TESTS_VERSION_KEY, CURRENT_TESTS_VERSION);
    localStorage.setItem(LOCAL_MOCK_TESTS_V1, JSON.stringify(v1));
    localStorage.setItem(LOCAL_MOCK_TESTS_V2, JSON.stringify(v2));
    localStorage.setItem(LOCAL_MOCK_TESTS_V3, JSON.stringify(v3));
    window.dispatchEvent(new CustomEvent("toeic-mock-tests-updated"));
  } catch (err) {
    console.warn("Could not save mock tests to localStorage:", err);
  }
}

export default function AdminMockTestsPage() {
  // State quản lý tab & danh sách đề thi
  const [activeMainTab, setActiveMainTab] = useState<MockTestAdminTab>("tests");
  const [selectedVol, setSelectedVol] = useState<"all" | "vol1" | "vol2" | "vol3">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [testsVol1, setTestsVol1] = useState<TestItem[]>(INITIAL_TESTS_VOL1);
  const [testsVol2, setTestsVol2] = useState<TestItem[]>(INITIAL_TESTS_VOL2);
  const [testsVol3, setTestsVol3] = useState<TestItem[]>(INITIAL_TESTS_VOL3);
  const [activeExamQuestions, setActiveExamQuestions] = useState<PracticeQuestion[]>(SAMPLE_EXAM_QUESTIONS);
  const [activePracticeQuestions, setActivePracticeQuestions] = useState<PracticeQuestion[]>(SAMPLE_EXAM_QUESTIONS);
  const [activeTranscriptQuestions, setActiveTranscriptQuestions] = useState<PracticeQuestion[]>(SAMPLE_EXAM_QUESTIONS);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tests directly from latest mockData (E:\Data)
  const handleSyncData = () => {
    setTestsVol1(INITIAL_TESTS_VOL1);
    setTestsVol2(INITIAL_TESTS_VOL2);
    setTestsVol3(INITIAL_TESTS_VOL3);
    saveLocalMockTests(INITIAL_TESTS_VOL1, INITIAL_TESTS_VOL2, INITIAL_TESTS_VOL3);
    triggerToast("Đã đồng bộ thành công toàn bộ 29 đề thi từ E:\\Data! 🔄");
  };

  // Asynchronously fetch 200 questions for any chosen test
  const loadQuestionsForTest = async (testId: number): Promise<PracticeQuestion[]> => {
    setIsLoadingQuestions(true);
    try {
      const qs = await fetchMockTestQuestions(testId);
      if (qs && qs.length > 0) {
        return qs;
      }
    } catch (err) {
      console.warn("Could not load questions for test:", testId, err);
    } finally {
      setIsLoadingQuestions(false);
    }
    return SAMPLE_EXAM_QUESTIONS;
  };

  // Auto-fetch tests from localStorage or API
  useEffect(() => {
    let active = true;
    async function loadTests() {
      const l1 = getLocalMockTests(LOCAL_MOCK_TESTS_V1);
      const l2 = getLocalMockTests(LOCAL_MOCK_TESTS_V2);
      const l3 = getLocalMockTests(LOCAL_MOCK_TESTS_V3);
      if (l1 || l2 || l3) {
        if (l1) setTestsVol1(l1);
        if (l2) setTestsVol2(l2);
        if (l3) setTestsVol3(l3);
        return;
      }

      try {
        const data = await fetchMockTests();
        if (data && data.length > 0 && active) {
          const v1 = data.filter((t) => t.volId === "ets2024" || t.volId === "vol1");
          const v2 = data.filter((t) => t.volId === "ets2023" || t.volId === "vol2");
          const v3 = data.filter((t) => t.volId === "ets2022" || t.volId === "vol3");
          const nextV1 = v1.length > 0 ? v1 : INITIAL_TESTS_VOL1;
          const nextV2 = v2.length > 0 ? v2 : INITIAL_TESTS_VOL2;
          const nextV3 = v3.length > 0 ? v3 : INITIAL_TESTS_VOL3;
          setTestsVol1(nextV1);
          setTestsVol2(nextV2);
          setTestsVol3(nextV3);
          saveLocalMockTests(nextV1, nextV2, nextV3);
        } else {
          saveLocalMockTests(INITIAL_TESTS_VOL1, INITIAL_TESTS_VOL2, INITIAL_TESTS_VOL3);
        }
      } catch (err) {
        console.warn("Could not load mock tests for admin from API:", err);
        saveLocalMockTests(INITIAL_TESTS_VOL1, INITIAL_TESTS_VOL2, INITIAL_TESTS_VOL3);
      }
    }
    loadTests();
    return () => { active = false; };
  }, []);


  // Toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2800);
  };

  // Audio helper SFX
  const playSfx = (_type?: string) => {
    playUnifiedAnswerSound();
  };

  // State Thi thử (Exam Mode)
  const [examModalTest, setExamModalTest] = useState<TestItem | null>(null);
  const [examDurationType, setExamDurationType] = useState<"120" | "60" | "30">("120");
  const [examStarted, setExamStarted] = useState(false);
  const [examTimeRemaining, setExamTimeRemaining] = useState(120 * 60);
  const [examAnswers, setExamAnswers] = useState<{ [qId: number]: string }>({});
  const [examCurrentQIndex, setExamCurrentQIndex] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResultScore, setExamResultScore] = useState<{
    total: number;
    listening: number;
    reading: number;
    correctCount: number;
  } | null>(null);

  // State Luyện tập (Practice Mode)
  const [practiceModalTest, setPracticeModalTest] = useState<TestItem | null>(null);
  const [practiceCurrentQIndex, setPracticeCurrentQIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<{ [qId: number]: string }>({});
  const [practiceChecked, setPracticeChecked] = useState<{ [qId: number]: boolean }>({});
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isDictationMode, setIsDictationMode] = useState(false);
  const [isFlipCardMode, setIsFlipCardMode] = useState(false);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState(true);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qId: number]: string }>({});
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [practiceTimerSeconds, setPracticeTimerSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(true);
  const [showVocabSection, setShowVocabSection] = useState(true);
  const [isVocabExpanded, setIsVocabExpanded] = useState(false);
  const [showBilingualPassage, setShowBilingualPassage] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  // Modals khác
  const [historyModalTest, setHistoryModalTest] = useState<TestItem | null>(null);
  const [transcriptModalTest, setTranscriptModalTest] = useState<TestItem | null>(null);
  const [vocabModalTest, setVocabModalTest] = useState<TestItem | null>(null);
  const [savedVocabBag, setSavedVocabBag] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);
  const [testFormTitle, setTestFormTitle] = useState("");
  const [testFormVolId, setTestFormVolId] = useState<"vol1" | "vol2" | "vol3">("vol1");
  const [testFormDifficulty, setTestFormDifficulty] = useState<"Khó" | "Trung bình" | "Vừa sức">("Trung bình");
  const [testFormDescription, setTestFormDescription] = useState("");
  const [testFormYear, setTestFormYear] = useState<number>(2024);
  const [testFormDuration, setTestFormDuration] = useState<number>(120);
  const [testFormTotalQuestions, setTestFormTotalQuestions] = useState<number>(200);
  const [testFormStatus, setTestFormStatus] = useState<string>("PUBLISHED");
  const [deleteConfirmTest, setDeleteConfirmTest] = useState<TestItem | null>(null);

  // Filtered Tests (hỗ trợ "all" hiển thị toàn bộ cả 3 bộ đề 2024, 2023, 2022)
  const currentTests = useMemo(() => {
    if (selectedVol === "vol1") return testsVol1;
    if (selectedVol === "vol2") return testsVol2;
    if (selectedVol === "vol3") return testsVol3;
    return [...testsVol1, ...testsVol2, ...testsVol3];
  }, [selectedVol, testsVol1, testsVol2, testsVol3]);

  const filteredCurrentTests = useMemo(() => {
    return currentTests.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiff = filterDifficulty === "ALL" || t.difficulty === filterDifficulty;
      return matchSearch && matchDiff;
    });
  }, [currentTests, searchQuery, filterDifficulty]);

  // Timers
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (examStarted && !examSubmitted && examTimeRemaining > 0) {
      timer = setInterval(() => {
        setExamTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, examTimeRemaining]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (practiceModalTest && !isTimerPaused) {
      interval = setInterval(() => {
        setPracticeTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [practiceModalTest, isTimerPaused]);

  // Handlers
  const handleOpenCreateTest = () => {
    setEditingTest(null);
    setTestFormTitle("");
    setTestFormVolId(selectedVol === "all" ? "vol1" : selectedVol);
    setTestFormDifficulty("Trung bình");
    setTestFormDescription("");
    setTestFormYear(selectedVol === "vol3" ? 2022 : selectedVol === "vol2" ? 2023 : 2024);
    setTestFormDuration(120);
    setTestFormTotalQuestions(200);
    setTestFormStatus("PUBLISHED");
    setShowCreateTestModal(true);
  };

  const handleOpenEditTest = (test: TestItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTest(test);
    setTestFormTitle(test.title);
    setTestFormVolId((test.volId as "vol1" | "vol2" | "vol3") || "vol1");
    setTestFormDifficulty((test.difficulty as "Khó" | "Trung bình" | "Vừa sức") || "Trung bình");
    setTestFormDescription(test.description || "Đề thi thử TOEIC chuẩn ETS quốc tế đầy đủ 200 câu hỏi.");
    setTestFormYear(test.year || 2024);
    setTestFormDuration(test.durationMinutes || 120);
    setTestFormTotalQuestions(test.totalQuestions || 200);
    setTestFormStatus(test.status === "DRAFT" || test.status === "Bản nháp" ? "DRAFT" : "PUBLISHED");
    setShowCreateTestModal(true);
  };

  const handleToggleTestStatus = (test: TestItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlyDraft = test.status === "DRAFT" || test.status === "Bản nháp";
    const newStatus = isCurrentlyDraft ? "Đã phát hành" : "DRAFT";
    const updateFn = (list: TestItem[]) =>
      list.map((t) => (t.id === test.id ? { ...t, status: newStatus } : t));

    let nextV1 = testsVol1, nextV2 = testsVol2, nextV3 = testsVol3;
    if (test.volId === "vol1" || test.volId === "ets2024") {
      nextV1 = updateFn(testsVol1);
      setTestsVol1(nextV1);
    } else if (test.volId === "vol2" || test.volId === "ets2023") {
      nextV2 = updateFn(testsVol2);
      setTestsVol2(nextV2);
    } else {
      nextV3 = updateFn(testsVol3);
      setTestsVol3(nextV3);
    }
    saveLocalMockTests(nextV1, nextV2, nextV3);
    triggerToast(
      newStatus === "Đã phát hành"
        ? `Đã xuất bản đề "${test.title}" cho học viên! 🚀`
        : `Đã chuyển đề "${test.title}" về bản nháp. Học viên sẽ không thấy đề này. 📝`
    );
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFormTitle.trim()) {
      triggerToast("Vui lòng nhập tên đề thi thử! ⚠️");
      return;
    }
    if (!testFormDescription.trim()) {
      triggerToast("Vui lòng nhập mô tả / hướng dẫn cho đề thi! ⚠️");
      return;
    }

    const finalStatus = testFormStatus === "DRAFT" ? "DRAFT" : "Đã phát hành";

    if (editingTest) {
      const updateFn = (list: TestItem[]) =>
        list.map((t) =>
          t.id === editingTest.id
            ? {
              ...t,
              title: testFormTitle.trim(),
              volId: testFormVolId,
              difficulty: testFormDifficulty,
              description: testFormDescription.trim(),
              year: testFormYear,
              durationMinutes: testFormDuration,
              totalQuestions: testFormTotalQuestions,
              status: finalStatus,
            }
            : t
        );
      let nextV1 = testsVol1, nextV2 = testsVol2, nextV3 = testsVol3;
      if (editingTest.volId === "vol1" || editingTest.volId === "ets2024") {
        nextV1 = updateFn(testsVol1);
        setTestsVol1(nextV1);
      } else if (editingTest.volId === "vol2" || editingTest.volId === "ets2023") {
        nextV2 = updateFn(testsVol2);
        setTestsVol2(nextV2);
      } else {
        nextV3 = updateFn(testsVol3);
        setTestsVol3(nextV3);
      }
      saveLocalMockTests(nextV1, nextV2, nextV3);
      triggerToast(`Đã cập nhật thông tin đề thi "${testFormTitle}" (${finalStatus === "DRAFT" ? "Bản nháp" : "Đã xuất bản"})! 💾`);
    } else {
      let targetList = testsVol1;
      if (testFormVolId === "vol2") targetList = testsVol2;
      else if (testFormVolId === "vol3") targetList = testsVol3;
      const nextId = targetList.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      const newTest: TestItem = {
        id: nextId,
        volId: testFormVolId,
        title: testFormTitle.trim(),
        difficulty: testFormDifficulty,
        description: testFormDescription.trim(),
        year: testFormYear,
        durationMinutes: testFormDuration,
        totalQuestions: testFormTotalQuestions,
        score: null,
        listeningScore: null,
        readingScore: null,
        status: finalStatus,
        completedAt: null,
        historyAttempts: [],
        keyVocab: [],
      };
      let nextV1 = testsVol1, nextV2 = testsVol2, nextV3 = testsVol3;
      if (testFormVolId === "vol1") {
        nextV1 = [...testsVol1, newTest];
        setTestsVol1(nextV1);
      } else if (testFormVolId === "vol2") {
        nextV2 = [...testsVol2, newTest];
        setTestsVol2(nextV2);
      } else {
        nextV3 = [...testsVol3, newTest];
        setTestsVol3(nextV3);
      }
      saveLocalMockTests(nextV1, nextV2, nextV3);
      triggerToast(`Đã thêm mới đề "${testFormTitle}" (${finalStatus === "DRAFT" ? "Bản nháp" : "Đã xuất bản"})! ✨`);
    }
    setShowCreateTestModal(false);
  };

  const handleConfirmDeleteTest = () => {
    if (!deleteConfirmTest) return;
    const deleteFn = (list: TestItem[]) => list.filter((t) => t.id !== deleteConfirmTest.id);
    let nextV1 = testsVol1, nextV2 = testsVol2, nextV3 = testsVol3;
    if (deleteConfirmTest.volId === "vol1" || deleteConfirmTest.volId === "ets2024") {
      nextV1 = deleteFn(testsVol1);
      setTestsVol1(nextV1);
    } else if (deleteConfirmTest.volId === "vol2" || deleteConfirmTest.volId === "ets2023") {
      nextV2 = deleteFn(testsVol2);
      setTestsVol2(nextV2);
    } else {
      nextV3 = deleteFn(testsVol3);
      setTestsVol3(nextV3);
    }
    saveLocalMockTests(nextV1, nextV2, nextV3);
    triggerToast(`Đã xóa đề thi "${deleteConfirmTest.title}"`);
    setDeleteConfirmTest(null);
  };

  const handleSelectMode = async (test: TestItem, mode: "exam" | "practice") => {
    triggerToast(`Đang tải dữ liệu 200 câu hỏi đề ${test.title}... ⏳`);
    const qs = await loadQuestionsForTest(test.id);
    if (mode === "exam") {
      setActiveExamQuestions(qs);
      setExamModalTest(test);
      setExamStarted(false);
      setExamSubmitted(false);
      setExamAnswers({});
      setExamCurrentQIndex(0);
      setExamResultScore(null);
      setExamTimeRemaining(120 * 60);
    } else {
      setActivePracticeQuestions(qs);
      setPracticeModalTest(test);
      setPracticeCurrentQIndex(0);
      setPracticeAnswers({});
      setPracticeChecked({});
      setPracticeTimerSeconds(0);
      setIsTimerPaused(false);
    }
  };

  const handleOpenTranscript = async (test: TestItem) => {
    triggerToast(`Đang tải lời giải chi tiết đề ${test.title}... ⏳`);
    const qs = await loadQuestionsForTest(test.id);
    setActiveTranscriptQuestions(qs);
    setTranscriptModalTest(test);
  };

  const handleStartExamNow = (_customParts?: string[], customMinutes?: number) => {
    setExamStarted(true);
    const secs = customMinutes
      ? customMinutes * 60
      : examDurationType === "120"
        ? 120 * 60
        : examDurationType === "60"
          ? 60 * 60
          : 30 * 60;
    setExamTimeRemaining(secs);
    setExamSubmitted(false);
    setExamAnswers({});
    setExamCurrentQIndex(0);
    setExamResultScore(null);
    triggerToast("Bắt đầu tính giờ thi thử!");
  };

  const handleSubmitExam = (effectiveQuestions?: PracticeQuestion[]) => {
    setExamSubmitted(true);
    const questionsToGrade = effectiveQuestions && effectiveQuestions.length > 0 ? effectiveQuestions : SAMPLE_EXAM_QUESTIONS;
    let correct = 0;
    let correctLC = 0;
    let correctRC = 0;
    questionsToGrade.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correct++;
        const isListening = ["Part 1", "Part 2", "Part 3", "Part 4"].includes(q.part);
        if (isListening) correctLC++;
        else correctRC++;
      }
    });

    // Mỗi câu làm đúng là 5 điểm
    const scaledListening = correctLC * 5;
    const scaledReading = correctRC * 5;
    const totalScore = correct * 5;

    const result = {
      total: totalScore,
      listening: scaledListening,
      reading: scaledReading,
      correctCount: correct,
    };
    setExamResultScore(result);
    playSfx("correct");

    if (examModalTest) {
      const maxTotal = questionsToGrade.length * 5;
      const updateFn = (list: TestItem[]) =>
        list.map((t) =>
          t.id === examModalTest.id
            ? {
              ...t,
              score: totalScore,
              listeningScore: scaledListening,
              readingScore: scaledReading,
              status: `Đã hoàn thành (${totalScore}/${maxTotal})`,
              completedAt: "Vừa xong",
            }
            : t
        );
      if (examModalTest.volId === "vol1") setTestsVol1(updateFn);
      else setTestsVol2(updateFn);
    }
    triggerToast("Đã nộp bài và hoàn thành chấm điểm! 🎉");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Tên đề thi", "Bộ sưu tập", "Độ khó", "Điểm TB", "Trạng thái"];
    const rows = [...testsVol1, ...testsVol2, ...testsVol3].map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.volId}"`,
      `"${t.difficulty}"`,
      t.avgScore ? Math.round(t.avgScore) : (t.score || 0),
      `"PUBLISHED"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `toeic_mock_tests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toastMessage && <div role="status" className="fixed right-6 top-6 z-[100] rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">{toastMessage}</div>}
      {/* Header and Filter Toolbar */}
      <MockTestHeader
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        selectedVol={selectedVol}
        setSelectedVol={setSelectedVol}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterDifficulty={filterDifficulty}
        setFilterDifficulty={setFilterDifficulty}
        viewMode={viewMode}
        setViewMode={setViewMode}
        vol1Count={testsVol1.length}
        vol2Count={testsVol2.length}
        vol3Count={testsVol3.length}
        onOpenCreateTest={handleOpenCreateTest}
        onExportCsv={handleExportCsv}
        onSyncData={handleSyncData}
      />

      {/* Main Tab Content Switching */}
      {activeMainTab === "tests" && (
        <MockTestCardGrid
          tests={filteredCurrentTests}
          viewMode={viewMode}
          onEditTest={handleOpenEditTest}
          onConfirmDeleteTest={setDeleteConfirmTest}
          onOpenTranscript={handleOpenTranscript}
          onOpenVocab={setVocabModalTest}
          onSelectMode={handleSelectMode}
          onToggleStatus={handleToggleTestStatus}
        />
      )}

      {activeMainTab === "submissions" && (
        <MockTestSubmissionsView tests={[...testsVol1, ...testsVol2, ...testsVol3]} />
      )}

      {activeMainTab === "score_conversion" && (
        <MockTestScoreConversionView />
      )}

      {activeMainTab === "collections" && (
        <MockTestCollectionsView
          vol1Count={testsVol1.length}
          vol2Count={testsVol2.length}
          vol3Count={testsVol3.length}
          onNavigateToTests={(volId) => {
            setSelectedVol(volId);
            setActiveMainTab("tests");
          }}
        />
      )}

      {/* Modals */}
      {examModalTest && (
        <MockTestExamModal
          test={examModalTest}
          activeExamQuestions={activeExamQuestions}
          activeExamParts={[]}
          examDurationType={examDurationType}
          setExamDurationType={setExamDurationType}
          examStarted={examStarted}
          examTimeRemaining={examTimeRemaining}
          examAnswers={examAnswers}
          setExamAnswers={setExamAnswers}
          examCurrentQIndex={examCurrentQIndex}
          setExamCurrentQIndex={setExamCurrentQIndex}
          examSubmitted={examSubmitted}
          examResultScore={examResultScore}
          isSfxEnabled={isSfxEnabled}
          setIsSfxEnabled={setIsSfxEnabled}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
          playSfx={playSfx}
          triggerToast={triggerToast}
          formatTime={formatTime}
          onClose={() => setExamModalTest(null)}
          onStartExamNow={handleStartExamNow}
          onSubmitExam={handleSubmitExam}
          onOpenQuestionGrid={() => setIsQuestionGridOpen(true)}
        />
      )}

      {practiceModalTest && (
        <MockTestPracticeModal
          test={practiceModalTest}
          filteredPracticeQuestions={activePracticeQuestions}
          practiceCurrentQIndex={practiceCurrentQIndex}
          setPracticeCurrentQIndex={setPracticeCurrentQIndex}
          practiceAnswers={practiceAnswers}
          setPracticeAnswers={setPracticeAnswers}
          practiceChecked={practiceChecked}
          setPracticeChecked={setPracticeChecked}
          showBilingualPassage={showBilingualPassage}
          setShowBilingualPassage={setShowBilingualPassage}
          showEvidence={showEvidence}
          setShowEvidence={setShowEvidence}
          isNotesModalOpen={isNotesModalOpen}
          setIsNotesModalOpen={setIsNotesModalOpen}
          practiceUserNotes={practiceUserNotes}
          setPracticeUserNotes={setPracticeUserNotes}
          isAnnotatorActive={isAnnotatorActive}
          setIsAnnotatorActive={setIsAnnotatorActive}
          annotatorColor={annotatorColor}
          setAnnotatorColor={setAnnotatorColor}
          isDictationMode={isDictationMode}
          setIsDictationMode={setIsDictationMode}
          isFlipCardMode={isFlipCardMode}
          setIsFlipCardMode={setIsFlipCardMode}
          isAutoPlayNext={isAutoPlayNext}
          setIsAutoPlayNext={setIsAutoPlayNext}
          isSfxEnabled={isSfxEnabled}
          setIsSfxEnabled={setIsSfxEnabled}
          isTimerPaused={isTimerPaused}
          setIsTimerPaused={setIsTimerPaused}
          practiceTimerSeconds={practiceTimerSeconds}
          isQuestionGridOpen={isQuestionGridOpen}
          setIsQuestionGridOpen={setIsQuestionGridOpen}
          showDetailedExplanation={showDetailedExplanation}
          setShowDetailedExplanation={setShowDetailedExplanation}
          showVocabSection={showVocabSection}
          setShowVocabSection={setShowVocabSection}
          isVocabExpanded={isVocabExpanded}
          setIsVocabExpanded={setIsVocabExpanded}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
          playSfx={playSfx}
          triggerToast={triggerToast}
          onClose={() => setPracticeModalTest(null)}
        />
      )}

      {historyModalTest && (
        <MockTestHistoryModal
          test={historyModalTest}
          onClose={() => setHistoryModalTest(null)}
          onClearHistory={(testId) => {
            const clearFn = (prev: TestItem[]) =>
              prev.map((t) =>
                t.id === testId
                  ? {
                    ...t,
                    score: null,
                    listeningScore: null,
                    readingScore: null,
                    status: "Chưa luyện tập",
                    completedAt: null,
                    historyAttempts: [],
                  }
                  : t
              );
            if (historyModalTest.volId === "vol1") setTestsVol1(clearFn);
            else setTestsVol2(clearFn);
            triggerToast(`Đã xóa lịch sử làm bài của "${historyModalTest.title}"`);
            setHistoryModalTest(null);
          }}
        />
      )}

      {transcriptModalTest && (
        <MockTestTranscriptModal
          test={transcriptModalTest}
          questions={activeTranscriptQuestions}
          onClose={() => setTranscriptModalTest(null)}
        />
      )}

      {vocabModalTest && (
        <MockTestVocabModal
          test={vocabModalTest}
          savedVocabBag={savedVocabBag}
          onToggleSaveVocab={(word) => {
            if (savedVocabBag.includes(word)) {
              setSavedVocabBag((prev) => prev.filter((w) => w !== word));
              triggerToast(`Đã bỏ từ "${word}" khỏi giỏ từ!`);
            } else {
              setSavedVocabBag((prev) => [...prev, word]);
              triggerToast(`Đã thêm từ "${word}" vào giỏ từ vựng! 🔖`);
            }
          }}
          onClose={() => setVocabModalTest(null)}
        />
      )}

      {deleteConfirmTest && (
        <MockTestDeleteModal
          test={deleteConfirmTest}
          onClose={() => setDeleteConfirmTest(null)}
          onConfirmDelete={handleConfirmDeleteTest}
        />
      )}

      {showCreateTestModal && (
        <MockTestCreateModal
          editingTest={editingTest}
          testFormTitle={testFormTitle}
          setTestFormTitle={setTestFormTitle}
          testFormVolId={testFormVolId}
          setTestFormVolId={setTestFormVolId}
          testFormDifficulty={testFormDifficulty}
          setTestFormDifficulty={setTestFormDifficulty}
          testFormDescription={testFormDescription}
          setTestFormDescription={setTestFormDescription}
          testFormYear={testFormYear}
          setTestFormYear={setTestFormYear}
          testFormDuration={testFormDuration}
          setTestFormDuration={setTestFormDuration}
          testFormTotalQuestions={testFormTotalQuestions}
          setTestFormTotalQuestions={setTestFormTotalQuestions}
          testFormStatus={testFormStatus}
          setTestFormStatus={setTestFormStatus}
          onSaveTest={handleSaveTest}
          onClose={() => setShowCreateTestModal(false)}
        />
      )}
    </div>
  );
}
