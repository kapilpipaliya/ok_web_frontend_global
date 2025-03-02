import { createContext, createSignal, useContext } from "solid-js";

export type SearchContextType = [
  () => string,
  (value: string) => void
];

export const SearchContext = createContext<SearchContextType>([
  () => "",
  () => {}
]);

export function createSearchContext() {
  const [searchQuery, setSearchQuery] = createSignal("");
  return [searchQuery, setSearchQuery] as SearchContextType;
}

export function useSearchContext() {
  return useContext(SearchContext);
} 