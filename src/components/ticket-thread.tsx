import { formatDateTimeBR } from "@/lib/format";

type Message = { id: number; author: string; authorName: string; body: string; createdAt: Date };

export function TicketThread({ messages, perspective }: { messages: Message[]; perspective: "cliente" | "equipe" }) {
  return (
    <ol className="space-y-5">
      {messages.map((m) => {
        const mine = m.author === perspective;
        const isStaff = m.author === "equipe";
        return (
          <li key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${
                isStaff ? "bg-navy-900 text-gold-300" : "bg-gold-100 text-gold-700"
              }`}
            >
              {isStaff ? "GC" : m.authorName.charAt(0).toUpperCase()}
            </span>
            <div className={`max-w-[85%] sm:max-w-[75%] ${mine ? "items-end text-right" : ""}`}>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{m.authorName}</span> · {formatDateTimeBR(m.createdAt)}
              </p>
              <div
                className={`mt-1.5 whitespace-pre-line rounded-2xl px-4 py-3 text-left text-sm leading-relaxed ${
                  mine
                    ? "rounded-tr-sm bg-navy-900 text-white"
                    : "rounded-tl-sm border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {m.body}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
