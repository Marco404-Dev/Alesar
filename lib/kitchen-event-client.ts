import type { KitchenSnapshot } from "./kitchen";

type EventSourceLike = Pick<EventSource, "addEventListener" | "removeEventListener" | "close" | "onopen" | "onerror">;

export function observeKitchenStream(
  source: EventSourceLike,
  onSnapshot: (snapshot: KitchenSnapshot) => void,
  onConnection: (connected: boolean) => void,
): () => void {
  const handleSnapshot = (event: Event) => {
    try { onSnapshot(JSON.parse((event as MessageEvent).data) as KitchenSnapshot); }
    catch { onConnection(false); }
  };
  const handleStreamError = () => onConnection(false);
  source.addEventListener("snapshot", handleSnapshot);
  source.addEventListener("stream-error", handleStreamError);
  source.onopen = () => onConnection(true);
  source.onerror = () => onConnection(false);
  return () => {
    source.removeEventListener("snapshot", handleSnapshot);
    source.removeEventListener("stream-error", handleStreamError);
    source.close();
  };
}
