# TomSelect Auto-Fetch Usage Examples

The RBTomSelect component now supports automatic option fetching using function names and singular/plural labels. Here are usage examples:

## Method 1: Using functionName with singularName/pluralName (New!)

```javascript
{
  componentName: "RBTomSelect",
  props: '''
return {
  functionName: "getUserRules",        // Function to call
  singularName: "Rule",               // Singular form for labels (optional)
  pluralName: "Rules",                // Plural form for labels (optional)
  dataKey: "rules",                   // Key to extract array from nested response (optional)
  valueKey: "id",                     // Projection to extract value from data (default: "id")
  labelKey: "title",                  // Projection to extract label from data (default: "title")
  placeholder: "Select a rule...",
  onChange: (value) => console.log("Selected:", value)
};
'''
}
```

## Method 2: Using optionType/subType (Existing)

```javascript
{
  componentName: "RBTomSelect",
  props: '''
return {
  optionType: "category",             // Uses getSelectOptions function
  subType: "active",                  // Optional subtype
  placeholder: "Select a category...",
  onChange: (value) => console.log("Selected:", value)
};
'''
}
```

## Method 3: Static Options (Existing)

```javascript
{
  componentName: "RBTomSelect",
  props: '''
return {
  options: [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" }
  ],
  placeholder: "Select an option...",
  onChange: (value) => console.log("Selected:", value)
};
'''
}
```

## How the New Functionality Works

1. **Automatic Function Calling**: When `functionName` is provided, TomSelect automatically calls that server function
2. **Smart Data Extraction**: It intelligently extracts options from various response formats:
   - Direct arrays
   - `{ success: true, data: [...] }`
   - `{ success: true, data: { rules: [...] } }`
   - Handles vertex format (Neo4j) data automatically
3. **Dynamic Placeholders**: Uses singular/plural names for better UX ("Loading rules...", "No rules available")
4. **Configurable Key Projection**: Uses `valueKey` and `labelKey` projections to extract specific fields from your data
   - Supports dot notation: `"P.title"`, `"channel.P.youtubeId"`, `"settings.customName"`
   - Works with nested objects and complex data structures
   - Falls back to common field names if projections don't match

## Response Format Support

The component handles these response formats:

```javascript
// Format 1: Direct array
result.result = [
  { id: "1", title: "Rule 1" },
  { id: "2", title: "Rule 2" }
]

// Format 2: Success wrapper with direct data array
result.result = {
  success: true,
  data: [
    { id: "1", title: "Rule 1" },
    { id: "2", title: "Rule 2" }
  ]
}

// Format 3: Success wrapper with named data property
result.result = {
  success: true,
  data: {
    rules: [
      { id: "1", title: "Rule 1" },
      { id: "2", title: "Rule 2" }
    ]
  }
}

// Format 4: Vertex format (Neo4j)
result.result = [
  {
    id: "1",
    P: { title: "Rule 1", description: "..." }
  }
]
```

## Benefits

1. **Simplified Usage**: No need to manually load and transform options
2. **Consistent UX**: Automatic loading states and error handling
3. **Better Performance**: Built-in caching and reactive updates
4. **Flexible**: Supports various server function response formats
5. **User-Friendly**: Dynamic placeholders based on singular/plural names

## Migration Example

### Before (Manual Loading):
```javascript
const rules = f.rules?.() || [];
const rulesLoading = f.rulesLoading?.() || false;
let options = [];
if (rulesLoading) {
  options = [{ value: "", label: "Loading rules...", disabled: true }];
} else if (rules.length === 0) {
  options = [{ value: "", label: "No rules available", disabled: true }];
} else {
  options = rules.map(ruleData => {
    const rule = ruleData.rule || ruleData;
    return {
      value: rule?.id,
      label: rule?.P?.title
    };
  });
}

return {
  options,
  placeholder: rulesLoading ? 'Loading...' : 'Select a rule...'
};
```

### After (Auto-Fetch):
```javascript
return {
  functionName: "getUserRules",
  singularName: "Rule",
  pluralName: "Rules"
};
```

Much cleaner and more maintainable!

## Key Projection Examples

### Example 1: Default Projections (id, title)
```javascript
return {
  functionName: "getUserRules",
  singularName: "Rule",
  pluralName: "Rules"
  // valueKey: "id" (default)
  // labelKey: "title" (default)
};
```

### Example 2: Simple Property Projections
```javascript
return {
  functionName: "getUserCategories",
  singularName: "Category",
  pluralName: "Categories",
  valueKey: "uuid",           // Use uuid field for value
  labelKey: "name"            // Use name field for label
};
```

### Example 3: Nested Property Projections
```javascript
return {
  functionName: "getChannelData",
  singularName: "Channel",
  pluralName: "Channels",
  valueKey: "channel.P.youtubeId",     // Extract from nested vertex structure
  labelKey: "channelSetting.P.customName"  // Extract from related settings vertex
};
```

### Example 4: Vertex Format Projections
```javascript
return {
  functionName: "getUserRules",
  singularName: "Rule",
  pluralName: "Rules",
  dataKey: "rules",           // Extract array from response.data.rules
  valueKey: "P.uuid",         // Extract from vertex properties
  labelKey: "P.title"         // Extract title from vertex properties
};
```

### Example 5: Complex Nested Response
```javascript
// For response: { success: true, data: { items: [...] } }
return {
  functionName: "getChannelData",
  singularName: "Channel",
  pluralName: "Channels",
  dataKey: "items",                    // Extract from response.data.items
  valueKey: "channel.P.youtubeId",     // Extract from nested structure
  labelKey: "channelSetting.P.customName"
};
```

This approach eliminates guesswork and ensures consistent, predictable data extraction from your server functions.