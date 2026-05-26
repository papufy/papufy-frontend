/** QR decorativo estilo OLX (não funcional). */
export function QrCodePlaceholder({ className = "" }: { className?: string }) {
  const size = 7;
  const cells: number[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const isCorner =
        (row < 3 && col < 3) ||
        (row < 3 && col >= size - 3) ||
        (row >= size - 3 && col < 3);
      const inCornerBlock =
        isCorner &&
        !(
          (row === 1 && col === 1) ||
          (row === 1 && col === size - 2) ||
          (row === size - 2 && col === 1)
        );
      const pseudoRandom = (row * 7 + col * 13) % 5 !== 0;
      cells.push(inCornerBlock || pseudoRandom ? 1 : 0);
    }
  }

  return (
    <div
      className={`rounded-lg bg-white p-2 shadow-md ring-1 ring-black/5 ${className}`}
      aria-hidden
    >
      <div className="grid grid-cols-7 gap-[2px]">
        {cells.map((filled, i) => (
          <div
            key={i}
            className={`aspect-square rounded-[1px] ${
              filled ? "bg-[#1a1a1a]" : "bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
