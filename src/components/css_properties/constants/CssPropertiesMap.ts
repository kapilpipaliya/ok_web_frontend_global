/* eslint-disable perfectionist/sort-objects */

import type { CSSJSONSchemaType } from "./FieldType";

import { BackgroundSection } from "./BackgroundSection";
import { BorderSection } from "./BorderSection";
import { EffectsSection } from "./EffectsSection";
import { FlexContainer } from "./FlexContainer";
import { DisplaySection } from "./DisplaySection";
import { DimentionSection } from "./DimentionSection";
import { MarginAndPaddingSection } from "./SpaceSection";
import { TypographySection } from "./TypographySection";
import { FlexChild } from "./FlexChild";
import { BoxShadow } from "./BoxShadow";
import { TextShadow } from "./TextShadow";
import { PositionSection } from "./Position";
import { ColumnsSection } from "./Columns";
import { GridContainer } from "./GridContainer";
import { GridChild } from "./GridChild";
import { ListSection } from "./ListSection";
import { Transition } from "./Transition";

export const JSONSchema: CSSJSONSchemaType = {
  DisplaySection,
  PositionSection,
  FlexContainer,
  FlexChild,
  BackgroundSection,
  BoxShadow,
  TextShadow,
  BorderSection,
  // EffectsSection,
  DimentionSection,
  MarginAndPaddingSection,
  TypographySection,
  GridContainer,
  GridChild,
  ColumnsSection,
  ListSection,
  Transition,
};
