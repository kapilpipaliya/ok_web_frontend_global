export const getDefaultValue = (serverType?: string, component?: string) => {
 if (!serverType)
  switch (component) {
   case "Select": return undefined;
   case "TexInput": return "";
   case "TexArea": return "";
   // case "NumberInput": return 0;
   case "Json": return {};
   default: return undefined;
  }
 switch (serverType) {
  case "string":
   return "";
  case "boolean":
   return false;
  case "object":
   return {};
  case "table":
   return [];
  default:
   return undefined;
 }
};