import VocabularyGameCenter from "@/components/vocabulary/VocabularyGameCenter";

export default async function VocabularyGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ setId?: string }>;
}) {
  const { setId } = await searchParams;
  return <VocabularyGameCenter initialSetId={setId} />;
}
