import { notFound, redirect } from "next/navigation";
import { VocabularyActivityWorkspace } from "@/components/vocabulary/VocabularyActivityWorkspace";
import VocabularyTypingGame from "@/components/vocabulary/VocabularyTypingGame";
import WordRainGame from "@/components/vocabulary/WordRainGame";

const games = ["word-rain", "runner", "sentence", "matching", "battle"] as const;

export default async function VocabularyGamePage({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ setId?: string }>;
}) {
  const [{ game }, { setId }] = await Promise.all([params, searchParams]);
  const selectedGame = games.find((candidate) => candidate === game);
  if (!selectedGame) notFound();

  // If no setId was supplied, gracefully redirect to Game Center so user can select a deck
  if (!setId) {
    redirect("/vocabulary/games");
  }

  if (selectedGame === "battle") {
    return <VocabularyTypingGame key={setId} setId={setId} />;
  }

  if (selectedGame === "word-rain") {
    return <WordRainGame key={setId} setId={setId} />;
  }

  return (
    <VocabularyActivityWorkspace
      key={`${game}:${setId}`}
      mode="game"
      game={selectedGame}
      setId={setId}
    />
  );
}
