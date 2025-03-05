import { createEffect, createSignal } from "solid-js";

import { useSearchContext } from "../context/SearchContext";
import { filterSections } from "../utils/filterSections";
import { SearchBar } from "./SearchBar";
import { SectionList } from "./SectionList";

export function StyleEditor() {
  const [searchQuery, setSearchQuery] = useSearchContext();
  const [filteredSections, setFilteredSections] = createSignal(
    filterSections(searchQuery()),
  );

  // Update filtered sections whenever search query changes
  createEffect(() => {
    setFilteredSections(filterSections(searchQuery()));
  });

  function handleSearch(value: string) {
    setSearchQuery(value);
  }

  return (
    <div class="flex ai:start flex-direction:column jc:space-between mb:10 mt:10 w:full">
      <SearchBar
        handleChange={handleSearch}
        placeholder="Search Style..."
        value={searchQuery()}
      />
      <SectionList
        filteredSections={filteredSections}
        searchQuery={searchQuery()}
      />
    </div>
  );
}
