# ROI Calculator Component Documentation

## Overview
The `DecodeCommerceROICalculator` is an interactive component that calculates Return on Investment (ROI) for potential customers based on their eCommerce metrics. It helps demonstrate the value proposition of DecodeCommerce services.

## Component Location
```
/src/page_schema/decodecommerce/components/DecodeCommerceROICalculator.hjson
```

## ROI Formula

The component uses the standard ROI (Return on Investment) formula:

```
ROI = ((Net Profit - Investment) / Investment) × 100

Where:
- Net Profit = Total Profit - Total Investment
- Total Profit = Revenue × Gross Margin %
- Total Investment = Service Cost × Timeframe (months)
- Revenue = Visitors × Conversion Rate × Average Order Value
```

## Input Parameters

### 1. Monthly Visitors
- **Range**: 1,000 - 100,000
- **Step**: 1,000
- **Default**: 10,000
- **Description**: Number of unique visitors to the eCommerce site per month

### 2. Conversion Rate (%)
- **Range**: 0.1% - 10%
- **Step**: 0.1%
- **Default**: 2%
- **Description**: Percentage of visitors who make a purchase

### 3. Average Order Value ($)
- **Range**: $10 - $500
- **Step**: $5
- **Default**: $75
- **Description**: Average amount spent per order

### 4. Gross Margin (%)
- **Range**: 10% - 90%
- **Step**: 5%
- **Default**: 60%
- **Description**: Profit margin on products sold

### 5. Timeframe
- **Options**: 1 month, 6 months, 12 months
- **Default**: 6 months
- **Description**: Period for ROI calculation

### 6. Service Cost (Fixed)
- **Value**: $5,000/month
- **Description**: DecodeCommerce monthly service fee

## Output Metrics

### 1. ROI Percentage
- Main metric displayed prominently
- Calculated as percentage return on investment

### 2. Total Revenue
- Projected revenue over the selected timeframe
- Formula: `Monthly Revenue × Timeframe`

### 3. Net Profit
- Profit after subtracting investment
- Formula: `Total Profit - Total Investment`

### 4. Total Investment
- Total cost of DecodeCommerce services
- Formula: `$5,000 × Timeframe`

### 5. Breakeven Time
- Months required to recover investment
- Formula: `Total Investment / Monthly Profit`

## Technical Implementation

### State Management
The component uses SolidJS signals for reactive state:
```javascript
const [monthlyVisitors, setMonthlyVisitors] = _.createSignal(10000);
const [conversionRate, setConversionRate] = _.createSignal(2);
const [avgOrderValue, setAvgOrderValue] = _.createSignal(75);
const [grossMargin, setGrossMargin] = _.createSignal(60);
const [timeframe, setTimeframe] = _.createSignal(6);
```

### Calculation Function
```javascript
const calculateROI = () => {
  const monthlyOrders = monthlyVisitors() * (conversionRate() / 100);
  const monthlyRevenue = monthlyOrders * avgOrderValue();
  const monthlyProfit = monthlyRevenue * (grossMargin() / 100);
  
  const totalRevenue = monthlyRevenue * timeframe();
  const totalProfit = monthlyProfit * timeframe();
  const totalInvestment = serviceCost * timeframe();
  
  const netProfit = totalProfit - totalInvestment;
  const roi = ((netProfit) / totalInvestment) * 100;
  
  return {
    monthlyRevenue,
    totalRevenue,
    totalProfit,
    totalInvestment,
    netProfit,
    roi: Math.round(roi),
    breakeven: totalInvestment / monthlyProfit
  };
};
```

## UI/UX Features

### Input Section
- **Range Sliders**: Visual, interactive controls for numeric inputs
- **Real-time Updates**: Values update as sliders move
- **Value Display**: Current value shown next to each slider
- **Dropdown**: For timeframe selection
- **Service Cost Display**: Fixed cost clearly shown

### Results Section
- **Large ROI Display**: Primary metric prominently featured
- **Grid Layout**: 2x2 grid for supporting metrics
- **Color Coding**: Success colors for positive values
- **Summary Message**: Plain-English explanation of results
- **Responsive Design**: Adapts to mobile screens

## Styling

### Slider Styling
- Track: Light background with rounded corners
- Thumb: Primary color with shadow and hover effects
- Enhanced visibility with larger thumb size (24px)
- Border and shadow for better contrast

### Color Scheme
- Primary colors for interactive elements
- Success colors for positive results
- Light backgrounds for input sections
- Proper contrast for accessibility

## Usage Example

```hjson
// In a page schema
{
  id: "roi-section",
  L: "Attr",
  P: {
    displayOrder: 5,
    componentName: "DecodeCommerceROICalculator"
  }
}
```

## Customization

To modify the component:

1. **Change Input Ranges**: Update min/max values in slider props
2. **Adjust Service Cost**: Modify the `serviceCost` constant
3. **Add Timeframes**: Add more options to the select dropdown
4. **Style Updates**: Modify CSS in component definitions
5. **Formula Changes**: Update the `calculateROI` function

## Best Practices

1. **Realistic Defaults**: Set default values that represent typical customer metrics
2. **Clear Labels**: Use descriptive labels for all inputs
3. **Visual Feedback**: Provide hover states and transitions
4. **Mobile Optimization**: Ensure component works well on small screens
5. **Accessibility**: Include proper labels and keyboard navigation

## Future Enhancements

1. **Presets**: Add "Startup", "Growth", "Enterprise" presets
2. **Charts**: Visual representation of ROI over time
3. **Comparison**: Compare with/without DecodeCommerce
4. **Export**: PDF or email report generation
5. **Advanced Inputs**: Additional metrics like customer lifetime value
6. **Sensitivity Analysis**: Show how changes affect ROI