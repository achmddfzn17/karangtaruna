import { useSyncExternalStore } from "react";

/**
 * Returns `false` on the server and during the first client render (hydration),
 * then `true` once mounted on the client.
 *
 * Replaces the `const [mounted, setMounted] = useState(false)` +
 * `useEffect(() => setMounted(true), [])` pattern, which the React Compiler
 * flags (`react-hooks/set-state-in-effect`) because it triggers a cascading
 * render. `useSyncExternalStore` expresses the same "is this hydrated yet?"
 * intent without a synchronous setState inside an effect.
 */
const emptySubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
