# ProtocolInfo Component

A React Native component that displays observation protocol information in a visually attractive manner.

## Features

- **Stage Name**: Displays the current observation protocol stage (e.g., "Vegetative") in a blue pill-shaped badge
- **Date of Sowing**: Shows the sowing date in a formatted, readable manner (e.g., "Sown: 18 Mar 2024")
- **Due Date**: Displays the due date with color-coded visual indicators based on proximity to current date
  - 🔴 **Red**: Overdue (past due date)
  - 🟡 **Yellow/Orange**: Due soon (3 days or less)
  - 🟢 **Green**: Due later (more than 3 days away)

## Props

| Prop           | Type     | Required | Description                                |
| -------------- | -------- | -------- | ------------------------------------------ |
| `stageName`    | `string` | No       | The name of the observation protocol stage |
| `dateOfSowing` | `string` | No       | The sowing date in DD/MM/YYYY format       |
| `dueDate`      | `string` | No       | The due date in DD/MM/YYYY format          |

## Usage

```tsx
import {ProtocolInfo} from '../../components';

// Basic usage
<ProtocolInfo
  stageName="Vegetative"
  dateOfSowing="18/03/2024"
  dueDate="10/04/2025"
/>

// With API data
<ProtocolInfo
  stageName={selectedPlot?.stageName}
  dateOfSowing={selectedPlot?.dateOfSowing}
  dueDate={selectedPlot?.dueDate}
/>
```

## API Integration

The component expects data from the plot list API response with the following keys:

- `stageName`: String value representing the observation protocol stage
- `dateOfSowing`: Date string in DD/MM/YYYY format
- `dueDate`: Date string in DD/MM/YYYY format

## Styling

The component uses:

- Responsive font scaling based on screen width
- Theme-consistent colors and spacing
- Card-like appearance with rounded corners and subtle shadows
- Color-coded due date indicators for at-a-glance status understanding

## Layout

The component is designed to be placed between the TraitDisplay component and input fields in the Plots screen, providing context about the current observation protocol state.

## Color Coding Logic

The due date color is determined by calculating the difference between the due date and current date:

- **Red (`#E53E3E`)**: When the due date has passed
- **Yellow (`#D69E2E`)**: When the due date is within 3 days
- **Green (`#38A169`)**: When the due date is more than 3 days away
- **Gray (`#999`)**: When no due date is provided or date parsing fails
