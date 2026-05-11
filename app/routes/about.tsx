import { Link } from "react-router";

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Back to Home
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
            About
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            How to Play OnlyKonnect
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            OnlyKonnect is a two-round connection game for hosts and teams. Choose
            hieroglyphic tiles, reveal clues, and race to spot the hidden logic.
          </p>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="rounded-lg border border-blue-200 bg-white/85 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">
              Round 1: Connections
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              Teams must identify the connection between four clues. Each clue is
              revealed one at a time, and teams can buzz in at any point to guess
              the connection. The host reveals hints progressively, and teams score
              by correctly identifying what connects all four clues.
            </p>
          </article>

          <article className="rounded-lg border border-blue-200 bg-white/85 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">
              Round 2: Sequences
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              Teams must identify the sequence or pattern. Three clues are
              revealed, and teams must guess what comes next. The final clue is
              revealed only after teams have had a chance to answer, making this
              round more challenging.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
