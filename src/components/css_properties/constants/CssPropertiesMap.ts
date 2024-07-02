
import type { CSSJSONSchemaType } from "./FieldType";

import { BackgroundSection } from "./BackgroundSection";
import { BorderSection } from "./BorderSection";
import { EffectsSection } from "./EffectsSection";
import { GeneralSection } from "./GeneralSection";
import { LayoutSection } from "./LayoutSection";
import { PositionSection } from "./PositionSection";
import { SizeSection } from "./SizeSection";
import { SpaceSection } from "./SpaceSection";
import { TypographySection } from "./TypographySection";

export const JSONSchema: CSSJSONSchemaType= {
  Background: BackgroundSection,
  Border: BorderSection,
  Effects: EffectsSection,
  General: GeneralSection,
  Layout: LayoutSection,
  Position: PositionSection,
  Size: SizeSection,
  Space: SpaceSection,
  Typography: TypographySection,
};

