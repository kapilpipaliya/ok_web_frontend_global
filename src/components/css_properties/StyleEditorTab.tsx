import { createSignal } from "solid-js";

import { SearchBar } from "./SearchBar";
import { SectionList } from "./SectionList";
import { filterSections } from "./utils/filterSections";

export const StyleEditorTab = () => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredSections, setFilteredSections] = createSignal(filterSections(searchQuery()));

  function handleSearch(value: string) {
    setSearchQuery(value);
    setFilteredSections(filterSections(value));
  }

  return (
    <span class="flex ai:start flex-direction:column jc:space-between mb:10 mt:10 w:full">
      <SearchBar handleChange={handleSearch} value={searchQuery} />
      <SectionList filteredSections={filteredSections} />
    </span>
  );
};

