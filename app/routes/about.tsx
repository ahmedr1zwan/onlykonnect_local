import { Link } from "react-router";

export default function About() {
  return (
    <main className="ok-page px-4 pb-10 pt-20">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="ok-btn ok-btn-light ok-btn-sm"
        >
          Back to Home
        </Link>

        <div className="mt-8">
          <p className="ok-kicker">
            About
          </p>
          <h1 className="ok-title-3d mt-3 text-3xl md:text-5xl">
            How to Play OnlyKonnect
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            OnlyKonnect is a two-round connection game for hosts and teams. Choose
            hieroglyphic tiles, reveal clues, and race to spot the hidden logic.
          </p>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="ok-panel p-6">
            <h2 className="ok-heading-3d text-xl">
              Round 1: Connections
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Teams must identify the connection between four clues. Each clue is
              revealed one at a time, and teams can buzz in at any point to guess
              the connection. The host reveals hints progressively, and teams score
              by correctly identifying what connects all four clues.
            </p>
          </article>

          <article className="ok-panel p-6">
            <h2 className="ok-heading-3d text-xl">
              Round 2: Sequences
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
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
