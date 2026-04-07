// TODO Sprint 2: banner that signals "we are iterating on artifact X — iteration N".
export function IterationBanner({ artifact, iteration }: { artifact: string; iteration: number }) {
  return (
    <div className="rounded-md border border-helix-500 bg-helix-900/20 px-3 py-2 text-sm">
      Iterando: <strong>{artifact}</strong> — iteración {iteration}
    </div>
  );
}
