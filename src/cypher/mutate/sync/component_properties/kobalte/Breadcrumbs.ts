export const Breadcrumbs = [
  {
    "description": "The visual separator between each breadcrumb item. It will be used as the default children of Breadcrumbs.Separator.",
    "property": "separator",
    "type": "string | JSX.Element"
  },
  {
    "description": "Localization strings.",
    "property": "translations",
    "type": "BreadcrumbsIntlTranslations"
  }
];

export const BreadcrumbsLink = [
  {
    "description": "Whether the breadcrumb link represents the current page.",
    "property": "current",
    "type": "boolean"
  },
  {
    "description": "Whether the breadcrumb link is disabled.",
    "property": "disabled",
    "type": "boolean"
  }
];