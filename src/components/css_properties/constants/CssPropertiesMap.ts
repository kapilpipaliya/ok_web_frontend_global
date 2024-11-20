/* eslint-disable perfectionist/sort-objects */

import type { CSSJSONSchemaType } from "./FieldSchemaType";

import { BackgroundSection } from "./meta/BackgroundSection";
import { BorderSection } from "./meta/BorderSection";
import { BoxShadow } from "./meta/BoxShadow";
import { ColumnsSection } from "./meta/Columns";
import { DimentionSection } from "./meta/DimentionSection";
import { DisplaySection } from "./meta/DisplaySection";
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
import { Transform } from "./meta/Transform";

// CSS usage metrics
// https://chromestatus.com/metrics/css/popularity

export const JSONSchema: CSSJSONSchemaType = {
  Display: DisplaySection,
  Dimension: DimentionSection,
  "Margin And Padding": MarginAndPaddingSection,
  Border: BorderSection,
  Background: BackgroundSection,
  Typography: TypographySection,
  Transform: Transform,
  Position: PositionSection,
  Shadow: { ...BoxShadow, ...TextShadow },
  "Flex Container": FlexContainer,
  "Flex Child": FlexChild,
  "Grid Container": GridContainer,
  "Grid Child": GridChild,
  "Effects": EffectsSection,
  Columns: ColumnsSection,
  List: ListSection,
  Transition: Transition,
};
