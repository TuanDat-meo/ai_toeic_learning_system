import { notFound } from "next/navigation";
import { VocabularyActivityWorkspace } from "@/components/vocabulary/VocabularyActivityWorkspace";

const modes = ["learn", "practice", "review"] as const;

export default async function VocabularyActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ setId: string; activity: string }>;
  searchParams: Promise<{ wordId?: string }>;
}) {
  const [{ setId, activity }, { wordId }] = await Promise.all([params, searchParams]);
  const mode = modes.find((candidate) => candidate === activity);
  if (!mode) notFound();

  return (
    <VocabularyActivityWorkspace
      key={`${mode}:${setId}:${wordId ?? ""}`}
      mode={mode}
      setId={setId}
      wordId={wordId}
    />
  );
}
