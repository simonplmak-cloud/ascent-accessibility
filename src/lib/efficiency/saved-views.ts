// Saved-view (filter/sort) URL-state serialization — pure, node-testable.

export interface ViewState {
  status?: string;
  standard?: string;
  sort?: string;
  dir?: "asc" | "desc";
  q?: string;
}

const KEYS: Array<keyof ViewState> = ["status", "standard", "sort", "dir", "q"];

export function encodeViewState(view: ViewState): string {
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = view[key];
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function decodeViewState(search: string): ViewState {
  const params = new URLSearchParams(search);
  const view: ViewState = {};
  for (const key of KEYS) {
    const value = params.get(key);
    if (value == null || value === "") continue;
    if (key === "dir") {
      view.dir = value === "asc" ? "asc" : "desc";
    } else {
      (view as Record<string, unknown>)[key] = value;
    }
  }
  return view;
}
