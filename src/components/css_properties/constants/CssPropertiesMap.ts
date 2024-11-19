/* eslint-disable perfectionist/sort-objects */

import type { CSSJSONSchemaType } from "./FieldSchemaType";

import { BackgroundSection } from "./meta/BackgroundSection";
import { BorderSection } from "./meta/BorderSection";
import { BoxShadow } from "./meta/BoxShadow";
import { ColumnsSection } from "./meta/Columns";
import { DimentionSection } from "./meta/DimentionSection";
import { DisplaySection } from "./meta/DisplaySection";
// import { EffectsSection } from "./EffectsSection";
import { FlexChild } from "./meta/FlexChild";
import { FlexContainer } from "./meta/FlexContainer";
import { GridChild } from "./meta/GridChild";
import { GridContainer } from "./meta/GridContainer";
import { ListSection } from "./meta/ListSection";
import { PositionSection } from "./meta/Position";
import { MarginAndPaddingSection } from "./meta/SpaceSection";
import { TextShadow } from "./meta/TextShadow";
import { Transition } from "./meta/Transition";
import { TypographySection } from "./meta/TypographySection";
import { EffectsSection } from "./meta/EffectsSection";

export const JSONSchema: CSSJSONSchemaType = {
  Dimension: DimentionSection,
  "Margin And Padding": MarginAndPaddingSection,
  Border: BorderSection,
  Background: BackgroundSection,
  Display: DisplaySection,
  "Flex Container": FlexContainer,
  "Flex Child": FlexChild,
  Shadow: { ...BoxShadow, ...TextShadow },
  "Effects": EffectsSection,
  Typography: TypographySection,
  Position: PositionSection,
  "Grid Container": GridContainer,
  "Grid Child": GridChild,
  Columns: ColumnsSection,
  List: ListSection,
  Transition: Transition,
};
