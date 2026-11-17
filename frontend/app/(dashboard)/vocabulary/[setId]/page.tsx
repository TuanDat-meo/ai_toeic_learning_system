"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Gamepad2, Search, Volume2 } from "lucide-react";
import type { VocabularyTestSet, WordItem } from "@/app/admin/content/vocabulary/types";
import { getVocabularySet } from "@/lib/api/vocabulary";

type DetailTab = "overview" | "words";

function speak(word: WordItem) {
  const source = word.audioUrl || word.audio;
  if (source && (/^https?:\/\//i.test(source) || source.startsWith("/"))) {
    void new Audio(source).play().catch(() => undefined);
  } else if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }
}

export default function VocabularySetDetailPage({ params }: { params: Promise<{ setId: string }> }) {
  const [setId, setSetId] = useState("");
  const [testSet, setTestSet] = useState<VocabularyTestSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>("overview");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    void params.then(({ setId: id }) => {
      if (!active) return;
      setSetId(id);
      return getVocabularySet(id).then((set) => {
        if (active) setTestSet(set);
      });
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Không thể tải bộ từ.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [params]);

  const words = useMemo(() => testSet?.words ?? [], [testSet]);
  const filteredWords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return words;
    return words.filter((word) => [
      word.word, word.meaning, word.partOfSpeech,
      ...(word.senses || []).map((sense) => `${sense.meaning} ${sense.partOfSpeech} ${sense.definitionEn}`),
    ].join(" ").toLocaleLowerCase().includes(query));
  }, [search, words]);
  const mastered = words.filter((word) => word.progressStatus === "MASTERED").length;
  const learned = words.filter((word) => word.progressStatus === "LEARNING" || word.progressStatus === "REVIEWING" || word.progressStatus === "MASTERED").length;

  if (loading) return <main className="mx-auto max-w-5xl animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-slate-200" /><div className="h-48 rounded-3xl bg-slate-100" /></main>;
  if (error || !testSet) return <main className="mx-auto max-w-5xl"><p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Không tìm thấy bộ từ vựng."}</p><Link href="/vocabulary" className="mt-4 inline-block text-sm font-semibold text-blue-700">Quay lại</Link></main>;

  const tabs: Array<{ key: DetailTab; label: string }> = [{ key: "overview", label: "Tổng quan" }, { key: "words", label: "Danh sách từ" }];
  const activityLinks = [
    { href: `/vocabulary/${setId}/learn`, title: "Học từ mới", description: "Chọn số từ mới cần học trong một phiên.", icon: BookOpen },
    { href: `/vocabulary/${setId}/practice`, title: "Luyện tập", description: "Câu hỏi từ nghĩa, audio và ví dụ.", icon: Search },
    { href: `/vocabulary/${setId}/review`, title: "Ôn tập SRS", description: "Ôn các từ đã đến hạn.", icon: ArrowLeft },
    { href: `/vocabulary/games?setId=${encodeURIComponent(setId)}`, title: "Trò chơi", description: "Luyện qua các mini-game từ vựng.", icon: Gamepad2 },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white sm:p-8">
        <Link href="/vocabulary" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> Kho từ vựng</Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm text-blue-100">{testSet.category} · {testSet.year}</p><h1 className="mt-1 text-3xl font-black">{testSet.title}</h1></div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm"><strong>{words.length}</strong> từ · Đã học <strong>{learned}</strong> · Ghi nhớ <strong>{mastered}</strong></div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${words.length ? Math.round(mastered * 100 / words.length) : 0}%` }} /></div>
      </header>

      <nav className="flex gap-2 border-b border-slate-200" aria-label="Các tab bộ từ">
        {tabs.map((item) => <button key={item.key} type="button" onClick={() => setTab(item.key)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === item.key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500"}`}>{item.label}</button>)}
      </nav>

      {tab === "overview" ? (
        <section>
          <h2 className="text-xl font-bold text-slate-900">Chọn hoạt động</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {activityLinks.map(({ href, title, description, icon: Icon }) => (
              <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm">
                <Icon className="h-5 w-5 text-blue-600" /><h3 className="mt-3 font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm" placeholder="Tìm từ, nghĩa hoặc từ loại" /></label>
          {filteredWords.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Không tìm thấy từ phù hợp.</p> : (
            <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {filteredWords.map((word) => (
                <li key={word.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><strong className="text-lg text-slate-900">{word.word}</strong><span className="font-mono text-xs text-slate-500">{word.ipa}</span><span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{word.partOfSpeech}</span><span className="text-xs text-slate-500">{word.level}</span></div>
                    {(word.senses?.length ? word.senses : [{ meaning: word.meaning || "", partOfSpeech: word.partOfSpeech || "", example: word.example || "", exampleMeaning: word.exampleMeaning || "" }]).map((sense, index) => (
                      <div key={`${word.id}-${index}`} className="mt-2 text-sm"><p className="font-medium text-slate-800">{sense.meaning} {sense.definitionEn ? <span className="font-normal text-slate-500">· {sense.definitionEn}</span> : null}</p>{sense.example ? <p className="mt-1 italic text-slate-500">{sense.example}</p> : null}{sense.exampleMeaning ? <p className="text-xs text-blue-700">{sense.exampleMeaning}</p> : null}</div>
                    ))}
                    <p className="mt-2 text-xs text-slate-500">Trạng thái: {word.progressStatus || "NEW"}</p>
                  </div>
                  <button type="button" onClick={() => speak(word)} className="inline-flex items-center gap-1 self-start rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"><Volume2 className="h-4 w-4" /> Phát âm</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
