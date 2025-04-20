import { createEffect, createSignal } from "solid-js";

import { useSearchContext } from "../context/SearchContext";
import { filterSections } from "../utils/filterSections";
import { SearchBar } from "./SearchBar";
import { SectionList } from "./SectionList";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
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
    <As as="div" css={css`
  display: flex;
  align-items: start;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-top: 10px;
  width: 100%;
`}>
      <SearchBar
        handleChange={handleSearch}
        placeholder="Search Style..."
        value={searchQuery()}
      />
      <SectionList
        filteredSections={filteredSections}
        searchQuery={searchQuery()}
      />
    </As>
  );
}
