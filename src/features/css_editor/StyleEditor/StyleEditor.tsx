import { createSignal } from "solid-js";

import { filterSections } from "../utils/filterSections";
import { SearchBar } from "./SearchBar";
import { SectionList } from "./SectionList";

export function StyleEditor() {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredSections, setFilteredSections] = createSignal(
    filterSections(searchQuery()),
  );

  function handleSearch(value: string) {
    setSearchQuery(value);
    setFilteredSections(filterSections(value));
  }

  return (
    <div class="flex ai:start flex-direction:column jc:space-between mb:10 mt:10 w:full">
      <SearchBar
        handleChange={handleSearch}
        placeholder="Search Style..."
        value={searchQuery()}
      />
      <SectionList filteredSections={filteredSections} />
    </div>
  );
}
