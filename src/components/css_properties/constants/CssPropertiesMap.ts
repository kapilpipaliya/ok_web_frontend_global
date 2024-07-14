/* eslint-disable perfectionist/sort-objects */

import type { CSSJSONSchemaType } from "./FieldType";

import { BackgroundSection } from "./BackgroundSection";
import { BorderSection } from "./BorderSection";
import { BoxShadow } from "./BoxShadow";
import { ColumnsSection } from "./Columns";
import { DimentionSection } from "./DimentionSection";
import { DisplaySection } from "./DisplaySection";
// import { EffectsSection } from "./EffectsSection";
import { FlexChild } from "./FlexChild";
import { FlexContainer } from "./FlexContainer";
import { GridChild } from "./GridChild";
import { GridContainer } from "./GridContainer";
import { ListSection } from "./ListSection";
import { PositionSection } from "./Position";
import { MarginAndPaddingSection } from "./SpaceSection";
import { TextShadow } from "./TextShadow";
import { Transition } from "./Transition";
import { TypographySection } from "./TypographySection";

export const JSONSchema: CSSJSONSchemaType = {
  "Display": DisplaySection,
  "Position": PositionSection,
  "Flex Container": FlexContainer,
  "Flex Child": FlexChild,
  "Background": BackgroundSection,
  "Box Shadow": BoxShadow,
  "Text Shadow": TextShadow,
  "Border": BorderSection,
  // "Effects": EffectsSection,
  "Dimension": DimentionSection,
  "Margin And Padding": MarginAndPaddingSection,
  "Typography": TypographySection,
  "Grid Container": GridContainer,
  "Grid Child": GridChild,
  "Columns": ColumnsSection,
  "List": ListSection,
  "Transition": Transition,
};