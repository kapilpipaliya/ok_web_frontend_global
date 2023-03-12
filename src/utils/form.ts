export const getDefaultValue = (dataType?: string, component?: string) => {
 if (!dataType)
  switch (component) {
   case "Select": return undefined;
   case "TexInput": return "";
   case "TexArea": return "";
   // case "NumberInput": return 0;
   case "Json": return {};
   default: return undefined;
  }
 switch (dataType) {
  case "string":
   return "";
  case "boolean":
   return false;
  case "object":
   return {};
  case "TableField":
   return [];
  default:
   return undefined;
 }
};