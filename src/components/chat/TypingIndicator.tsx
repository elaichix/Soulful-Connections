export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4 px-4">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-surface-100 bg-white px-5 py-4 shadow-sm dark:border-surface-700 dark:bg-surface-800">
        <span
          className="h-2 w-2 rounded-full bg-calm-400 animate-typing-dot"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-calm-400 animate-typing-dot"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-calm-400 animate-typing-dot"
          style={{ animationDelay: "400ms" }}
        />
      </div>
    </div>
  );
}
