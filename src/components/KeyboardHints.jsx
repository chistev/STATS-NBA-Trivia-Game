export default function KeyboardHints() {
  const hints = [
    { key: '↵', action: 'Submit guess' },
    { key: 'Tab', action: 'Navigate clues' },
    { key: 'R', action: 'Reveal next clue' }
  ];
  
  return (
    <div className="mt-6 pt-4 text-center">
      <div className="flex justify-center gap-4 text-xs text-slate-500">
        {hints.map((hint, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-800 rounded-md font-mono text-sm">
              {hint.key}
            </kbd>
            <span>{hint.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}