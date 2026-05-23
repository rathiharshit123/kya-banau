import { PollVoteForm } from "@/components/poll-vote-form";

type PollPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-dvh flex flex-col" style={{ background: "var(--color-bg)" }}>
      <header
        className="flex items-center justify-between px-5 pt-6 pb-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center text-base"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 20%, var(--color-card))",
              border: "1px solid var(--color-border)",
            }}
          >
            🍛
          </div>
          <span className="font-display text-lg font-bold" style={{ color: "var(--color-text)" }}>
            Aaj Kya Banau?
          </span>
        </div>
      </header>

      <div className="flex-1 px-5 py-5 max-w-lg mx-auto w-full">
        <PollVoteForm pollId={id} />
      </div>
    </main>
  );
}
