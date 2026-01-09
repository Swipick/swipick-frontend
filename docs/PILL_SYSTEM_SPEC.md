# Pill System (Last 5 Games) - Technical Specification

## Overview
The pill system displays a team's last 5 match results using colored badges. Each badge shows:
1. **Number**: Whether the team played HOME (1) or AWAY (2) in that specific match
2. **Color**: Whether they WON (green), LOST (red), or DREW (gray) in that match

---

## Data Format

### Backend API Response
The backend must send `last5` data in a **2-character string format** for each match:

```
[position][outcome]
```

Where:
- **Position** (1st character): `'1'` = home, `'2'` = away
- **Outcome** (2nd character): `'W'` = win, `'D'` = draw, `'L'` = loss

### Example: Como's Last 5 Games

```json
{
  "home": {
    "name": "Como",
    "last5": ["1W", "2W", "1D", "2L", "1W"]
  }
}
```

Breaking down Como's results:
1. **"1W"** - Como played HOME (1) and WON (W) → **Green "1"**
2. **"2W"** - Como played AWAY (2) and WON (W) → **Green "2"**
3. **"1D"** - Como played HOME (1) and DREW (D) → **Gray "1"**
4. **"2L"** - Como played AWAY (2) and LOST (L) → **Red "2"**
5. **"1W"** - Como played HOME (1) and WON (W) → **Green "1"**

---

## Real-World Example: Como's Recent Matches

### Match History (Most Recent First)

| Date | Match | Como Position | Result | Encoding | Display |
|------|-------|--------------|--------|----------|---------|
| 28/11 | Como vs Sassuolo | HOME (1) | Como Won | `"1W"` | 🟢 **1** |
| 24/11 | Torino vs Como | AWAY (2) | Como Won | `"2W"` | 🟢 **2** |
| 08/11 | Como vs Cagliari | HOME (1) | Draw | `"1D"` | ⚪ **1** |
| 03/11 | Lazio vs Como | AWAY (2) | Como Lost | `"2L"` | 🔴 **2** |
| 28/10 | Como vs Parma | HOME (1) | Como Won | `"1W"` | 🟢 **1** |

**API Response:**
```json
{
  "home": {
    "name": "Como",
    "last5": ["1W", "2W", "1D", "2L", "1W"]
  }
}
```

**Visual Rendering:**
```
Como: 🟢1  🟢2  ⚪1  🔴2  🟢1
```

---

## All Possible Combinations

### Home Matches (Position = 1)

| Code | Meaning | Display | Background | Text Color |
|------|---------|---------|------------|------------|
| `"1W"` | Home Win | 🟢 **1** | #DCFCE7 (green-100) | #166534 (green-800) |
| `"1D"` | Home Draw | ⚪ **1** | #F3F4F6 (gray-100) | #374151 (gray-700) |
| `"1L"` | Home Loss | 🔴 **1** | #FEE2E2 (red-100) | #991B1B (red-800) |

### Away Matches (Position = 2)

| Code | Meaning | Display | Background | Text Color |
|------|---------|---------|------------|------------|
| `"2W"` | Away Win | 🟢 **2** | #DCFCE7 (green-100) | #166534 (green-800) |
| `"2D"` | Away Draw | ⚪ **2** | #F3F4F6 (gray-100) | #374151 (gray-700) |
| `"2L"` | Away Loss | 🔴 **2** | #FEE2E2 (red-100) | #991B1B (red-800) |

---

## Color Palette

### Win (Green)
```
Background: #DCFCE7 (Tailwind green-100)
Text:       #166534 (Tailwind green-800)
Border:     #166534
```

### Draw (Gray)
```
Background: #F3F4F6 (Tailwind gray-100)
Text:       #374151 (Tailwind gray-700)
Border:     #374151
```

### Loss (Red)
```
Background: #FEE2E2 (Tailwind red-100)
Text:       #991B1B (Tailwind red-800)
Border:     #991B1B
```

---

## Badge Specifications

### Visual Design
- **Size**: 20x20 pixels
- **Border Radius**: 6px
- **Border Width**: 1px
- **Font Size**: 10px
- **Font Weight**: 700 (Bold)
- **Spacing**: 4px gap between badges

### Layout
```
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ 1  │ │ 2  │ │ 1  │
└────┘ └────┘ └────┘ └────┘ └────┘
  4px    4px    4px    4px
```

---

## Backend Implementation Notes

### Data Requirements
1. **Order**: Last 5 matches should be ordered from **most recent to oldest**
2. **Count**: Always send exactly 5 matches (pad with empty strings if fewer than 5)
3. **Perspective**: Data should be from the **team's perspective** (not the fixture perspective)

### Example Backend Logic (Pseudocode)

```javascript
function generateLast5(teamId, matches) {
  const last5Matches = matches
    .filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId)
    .sort((a, b) => b.date - a.date) // Most recent first
    .slice(0, 5); // Take only last 5

  return last5Matches.map(match => {
    // Determine position
    const position = match.homeTeamId === teamId ? '1' : '2';

    // Determine outcome
    let outcome;
    if (match.homeScore > match.awayScore) {
      outcome = match.homeTeamId === teamId ? 'W' : 'L';
    } else if (match.homeScore < match.awayScore) {
      outcome = match.homeTeamId === teamId ? 'L' : 'W';
    } else {
      outcome = 'D';
    }

    return position + outcome; // e.g., "1W", "2D", "2L"
  });
}
```

### Example API Response Structure

```json
{
  "fixtureId": "abc-123",
  "week": 13,
  "home": {
    "name": "Como",
    "logo": "https://...",
    "winRateHome": 45.5,
    "last5": ["1W", "2W", "1D", "2L", "1W"],
    "standingsPosition": 12
  },
  "away": {
    "name": "Sassuolo",
    "logo": "https://...",
    "winRateAway": 38.2,
    "last5": ["2L", "1D", "2W", "1L", "2D"],
    "standingsPosition": 16
  }
}
```

---

## Edge Cases

### Fewer Than 5 Matches
If a team has played fewer than 5 matches, pad the array with empty strings:

```json
{
  "last5": ["1W", "2D", "1W", "", ""]
}
```

Empty codes will display as gray "1" pills by default.

### No Match Data
If no match history is available:

```json
{
  "last5": []
}
```

Frontend will pad to 5 gray "1" pills.

---

## Frontend Implementation

### File Locations
- **Component**: `src/components/game/LastFiveResults.tsx`
- **Usage**: `src/components/game/TeamInfo.tsx`
- **Types**: `src/types/game.types.ts`

### Parsing Logic
```typescript
const position = code.charAt(0); // '1' or '2'
const outcome = code.charAt(1).toUpperCase(); // 'W', 'D', or 'L'

let type: 'win' | 'loss' | 'draw' = 'draw';
if (outcome === 'W') type = 'win';
else if (outcome === 'L') type = 'loss';
else type = 'draw';
```

---

## Testing Checklist

- [ ] Home team with 5 wins displays 5 green "1" pills
- [ ] Away team with 5 losses displays 5 red "2" pills
- [ ] Mixed home/away matches show correct position numbers
- [ ] Draws display gray pills
- [ ] Fewer than 5 matches are padded correctly
- [ ] Empty/missing data displays default gray pills
- [ ] Badge colors match specification exactly
- [ ] Badges are ordered from most recent (left) to oldest (right)

---

**Last Updated**: 2025-11-30
**Version**: 1.0
