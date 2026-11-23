"use client";

import React, { useEffect, useState } from "react";
import { Download, FileJson, LoaderCircle, RotateCcw, Upload } from "lucide-react";
import type { GrammarTopicItem } from "@/app/admin/content/grammar/types";
import {
  createGrammarPassage,
  createGrammarRevision,
  createGrammarRule,
  getGrammarPassages,
  getGrammarRevisions,
  getGrammarRules,
  previewGrammarImport,
  restoreGrammarRevision,
} from "@/lib/api/grammar";

interface Props {
  topics: GrammarTopicItem[];
}

export function GrammarOperationsView({ topics }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState<unknown>(null);
  const [passages, setPassages] = useState<Array<{id: string; type: "PART6" | "PART7"; content: string; translation?: string}>>([]);
  const [rules, setRules] = useState<Array<{id: string; topicId: string; code: string; name: string}>>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [passageType, setPassageType] = useState<"PART6" | "PART7">("PART6");
  const [passageContent, setPassageContent] = useState("");
  const [passageTranslation, setPassageTranslation] = useState("");
  const [ruleCode, setRuleCode] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [revisionVersion, setRevisionVersion] = useState("");
  const [revisions, setRevisions] = useState<Array<{version: number; createdAt: string}>>([]);

  const refresh = async () => {
    try {
      const [passageRows, ruleRows] = await Promise.all([
        getGrammarPassages(),
        getGrammarRules(selectedTopicId || undefined),
      ]);
      setPassages(passageRows);
      setRules(ruleRows.map((row) => ({ id: row.id, topicId: row.topicId, code: row.code, name: row.name })));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu thao tác.");
    }
  };

  useEffect(() => {
    void refresh();
  }, [selectedTopicId]);

  const handleImport = async (file: File) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      setPreview(await previewGrammarImport(file));
      setNotice("Đã xem trước import. Chỉ các dòng hợp lệ mới được xử lý.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xem trước file.");
    } finally {
      setBusy(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ schema: "toeic-grammar-export-v1", topics }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "toeic-grammar-topics.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const createPassage = async () => {
    if (!passageContent.trim()) {
      setError("Nội dung đoạn văn không được để trống.");
      return;
    }
    setBusy(true);
    try {
      await createGrammarPassage({
        type: passageType,
        content: passageContent.trim(),
        translation: passageTranslation.trim() || undefined,
      });
      setPassageContent("");
      setPassageTranslation("");
      setNotice("Đã tạo đoạn văn.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tạo đoạn văn.");
    } finally {
      setBusy(false);
    }
  };

  const createRule = async () => {
    if (!selectedTopicId || !ruleCode.trim() || !ruleName.trim()) {
      setError("Chọn chủ điểm và nhập mã/tên quy tắc.");
      return;
    }
    setBusy(true);
    try {
      await createGrammarRule({
        topicId: selectedTopicId,
        code: ruleCode.trim(),
        name: ruleName.trim(),
      });
      setRuleCode("");
      setRuleName("");
      setNotice("Đã tạo quy tắc.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tạo quy tắc.");
    } finally {
      setBusy(false);
    }
  };

  const loadRevisions = async () => {
    if (!selectedTopicId) {
      setError("Chọn chủ điểm để xem lịch sử phiên bản.");
      return;
    }
    setBusy(true);
    try {
      const rows = await getGrammarRevisions("TOPIC", selectedTopicId);
      setRevisions(rows.map((row) => ({ version: row.version, createdAt: row.createdAt })));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải lịch sử.");
    } finally {
      setBusy(false);
    }
  };

  const saveRevision = async () => {
    if (!selectedTopicId) return;
    const topic = topics.find((item) => item.id === selectedTopicId);
    if (!topic) {
      setError("Không tìm thấy chủ điểm.");
      return;
    }
    setBusy(true);
    try {
      await createGrammarRevision("TOPIC", selectedTopicId, topic as unknown as Record<string, unknown>);
      setNotice("Đã lưu phiên bản chủ điểm.");
      await loadRevisions();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu phiên bản.");
    } finally {
      setBusy(false);
    }
  };

  const restoreRevision = async () => {
    const version = Number(revisionVersion);
    if (!selectedTopicId || !Number.isInteger(version) || version < 1) {
      setError("Chọn chủ điểm và nhập số phiên bản hợp lệ.");
      return;
    }
    setBusy(true);
    try {
      await restoreGrammarRevision("TOPIC", selectedTopicId, version);
      setNotice(`Đã khôi phục phiên bản ${version}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể khôi phục phiên bản.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {(error || notice) && (
        <div className={`xl:col-span-2 rounded-2xl border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {error || notice}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-black text-slate-900"><Upload className="h-4 w-4" />Import CSV / Excel / JSON</h2>
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImport(file);
          }}
          className="block w-full text-xs"
        />
        {busy && <p className="flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang xử lý…</p>}
        {preview !== null ? (
          <pre className="max-h-52 overflow-auto rounded-xl bg-slate-950 p-3 text-[11px] text-slate-100">
            {JSON.stringify(preview, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-slate-500">Chưa có preview import.</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-black text-slate-900"><FileJson className="h-4 w-4" />Export & Revision</h2>
        <button type="button" onClick={exportJson} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">
          <Download className="h-4 w-4" />Xuất JSON nội dung thật
        </button>
        <select value={selectedTopicId} onChange={(event) => setSelectedTopicId(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs">
          <option value="">Chọn chủ điểm</option>
          {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.titleVi || topic.title}</option>)}
        </select>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void saveRevision()} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">Lưu phiên bản</button>
          <button type="button" onClick={() => void loadRevisions()} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">Tải lịch sử</button>
        </div>
        {revisions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-600">Phiên bản: {revisions.map((row) => `v${row.version}`).join(", ")}</div>
            <div className="flex gap-2">
              <input type="number" min={1} value={revisionVersion} onChange={(event) => setRevisionVersion(event.target.value)} placeholder="Số phiên bản" className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-xs" />
              <button type="button" onClick={() => void restoreRevision()} className="inline-flex items-center gap-1 rounded-xl border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700">
                <RotateCcw className="h-3.5 w-3.5" />Khôi phục
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-black text-slate-900">Đoạn văn Part 6/7</h2>
        <select value={passageType} onChange={(event) => setPassageType(event.target.value as "PART6" | "PART7")} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs">
          <option value="PART6">Part 6</option>
          <option value="PART7">Part 7</option>
        </select>
        <textarea value={passageContent} onChange={(event) => setPassageContent(event.target.value)} rows={5} placeholder="Nội dung đoạn văn" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
        <textarea value={passageTranslation} onChange={(event) => setPassageTranslation(event.target.value)} rows={3} placeholder="Bản dịch (không bắt buộc)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
        <button type="button" onClick={() => void createPassage()} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">Tạo đoạn văn</button>
        <div className="text-xs text-slate-500">{passages.length} đoạn văn hiện có</div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-black text-slate-900">Quy tắc ngữ pháp</h2>
        <input value={ruleCode} onChange={(event) => setRuleCode(event.target.value)} placeholder="Mã quy tắc" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
        <input value={ruleName} onChange={(event) => setRuleName(event.target.value)} placeholder="Tên quy tắc" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
        <button type="button" onClick={() => void createRule()} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">Tạo quy tắc cho chủ điểm đã chọn</button>
        <div className="space-y-1">{rules.map((rule) => <div key={rule.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs"><strong>{rule.code}</strong> — {rule.name}</div>)}</div>
      </section>
    </div>
  );
}
