import type { LedgerEvent } from "./ledger";

// Read-only insights over paper-ledger events. These helpers never mutate
// state and never participate in a risk, approval, or execution decision.

export interface FillTask {
  kind: "fill";
  orderId: string;
  asset: string;
  remainingUnits: number;
}

export function searchEvents(events: LedgerEvent[], query: string, type?: string): LedgerEvent[] {
  const needle = query.trim().toLowerCase();
  return events.filter((event) => {
    if (type && event.type !== type) return false;
    if (!needle) return true;
    return event.type.toLowerCase().includes(needle)
      || event.orderId.toLowerCase().includes(needle)
      || JSON.stringify(event.data).toLowerCase().includes(needle);
  }).map((event) => ({ ...event, data: { ...event.data } }));
}

export function listFillTasks(events: LedgerEvent[]): FillTask[] {
  const accepted = new Map<string, { asset: string; quantityUnits: number }>();
  const filled = new Map<string, number>();
  for (const event of events) {
    if (event.type === "ORDER_ACCEPTED") {
      accepted.set(event.orderId, { asset: String(event.data.asset), quantityUnits: Number(event.data.quantityUnits) });
    } else if (event.type === "FILL_RECORDED") {
      filled.set(event.orderId, (filled.get(event.orderId) || 0) + Number(event.data.quantityUnits));
    }
  }
  return [...accepted.entries()]
    .map(([orderId, order]) => ({ kind: "fill" as const, orderId, asset: order.asset, remainingUnits: order.quantityUnits - (filled.get(orderId) || 0) }))
    .filter((task) => task.remainingUnits > 0);
}

function csvCell(value: unknown): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function eventsToCsv(events: LedgerEvent[]): string {
  const header = "sequence,event_id,order_id,type,idempotency_key,occurred_at,hash,data";
  const rows = events.map((event) => [
    event.sequence, event.eventId, event.orderId, event.type, event.idempotencyKey,
    event.occurredAt, event.hash, JSON.stringify(event.data),
  ].map(csvCell).join(","));
  return [header, ...rows].join("\n");
}

export interface SummaryResult { provider: string; model?: string; text: string; facts: Record<string, number> }

type Fetcher = (url: string, init: Record<string, unknown>) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export async function summarizeLedger(
  events: LedgerEvent[],
  options: { apiKey?: string; baseUrl?: string; model?: string; fetcher?: Fetcher } = {},
): Promise<SummaryResult> {
  const facts: Record<string, number> = {
    events: events.length,
    accepted: events.filter((event) => event.type === "ORDER_ACCEPTED").length,
    rejected: events.filter((event) => event.type === "ORDER_REJECTED").length,
    fills: events.filter((event) => event.type === "FILL_RECORDED").length,
    openFillTasks: listFillTasks(events).length,
  };
  const fallbackText = `Paper ledger: ${facts.events} event(s), ${facts.accepted} accepted, ${facts.rejected} rejected, ${facts.fills} fill(s), ${facts.openFillTasks} open fill task(s).`;
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY;
  if (!apiKey) return { provider: "deterministic-fallback", text: fallbackText, facts };
  const fetcher = options.fetcher ?? (globalThis.fetch as unknown as Fetcher);
  const model = options.model ?? process.env.AI_MODEL ?? "gpt-4o-mini";
  const baseUrl = (options.baseUrl ?? process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const response = await fetcher(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Summarize paper-trading ledger facts in one short paragraph. Never recommend or approve trades." },
        { role: "user", content: JSON.stringify(facts) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`ai_provider_http_${response.status}`);
  const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("ai_provider_empty_response");
  return { provider: "openai-compatible", model, text, facts };
}
