# Itinerary Features

## Overview
The itinerary section now includes accommodations and print/PDF export functionality for comprehensive trip planning.

## Features

### 1. **Accommodations Display**
Accommodations are now automatically shown for each day based on check-in/check-out dates.

#### How it works:
- Stays are filtered by date for each day
- Displayed in a blue highlighted box above activities
- Shows:
  - Hotel/accommodation name
  - Address with map pin icon
  - Check-in/check-out dates
  - Cost per night

#### Example:
```
Day 1 - March 15, 2024
┌─────────────────────────────────┐
│ 🏨 Accommodation                │
│ Hotel Paradise                   │
│ 📍 123 Beach Road, Goa          │
│ Mar 15 → Mar 17                 │
│ ₹2,500/night                    │
└─────────────────────────────────┘

Activities:
⏰ Check-in at hotel
⏰ Beach walk
...
```

### 2. **Print/PDF Export**

#### Print Button
- Located in the itinerary header (top right)
- Icon: Printer icon
- Click to open browser print dialog

#### What gets printed:
- **Trip header** with:
  - Trip name
  - Date range
  - Destination route (cities)
- **Each day** with:
  - Day number and date
  - Accommodation details
  - All activities with:
    - Name and description
    - Activity type
    - Start time
    - Cost
    - Location
  - Dotted line separators between days

#### What's hidden in print:
- Navigation sidebar
- Edit/delete buttons
- View mode toggles
- All interactive elements

#### Print Optimizations:
- A4 page size with 1cm margins
- Page breaks avoided within day cards
- Colors preserved for accommodations
- Professional black and white friendly layout
- Proper spacing and typography

### 3. **Usage Instructions**

#### To view itinerary:
1. Navigate to trip details
2. Click "Itinerary" in the sidebar
3. View all days or select single day

#### To print/save as PDF:
1. Click the "Print" button in itinerary header
2. In the print dialog:
   - **Chrome/Edge**: Choose "Save as PDF" as destination
   - **Firefox**: Choose "Save to PDF"
   - **Safari**: Click PDF → Save as PDF
3. Adjust settings if needed:
   - Paper size: A4
   - Margins: Default
   - Background graphics: Enable (to show colors)
4. Save or print

#### Tips for best print results:
- Use "All Days" view for complete itinerary
- Enable background graphics in print settings
- Use portrait orientation
- Ensure accommodations are added with proper dates
- Activities should have times for chronological order

## Technical Details

### Print Styles
Custom print media queries in `src/index.css`:
- Hides interactive elements
- Optimizes layout for paper
- Preserves important colors
- Prevents awkward page breaks
- Full-width layout

### Accommodation Filtering
```javascript
// Matches stays where day falls within check-in/check-out range
const dayStays = stays.filter(stay => {
  const checkIn = stay.check_in_date;
  const checkOut = stay.check_out_date;
  const currentDate = groupedDay.date;

  return currentDate >= checkIn && currentDate < checkOut;
});
```

### Print Classes
Tailwind utilities:
- `print:hidden` - Hide on print
- `print:block` - Show only on print
- `print:border-b-2` - Thicker borders for print

## Browser Compatibility

### Print functionality tested on:
- ✅ Chrome 120+ (Windows, Mac, Linux)
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+

### Save as PDF:
- ✅ Chrome: Built-in PDF printer
- ✅ Firefox: Built-in PDF save
- ✅ Safari: Built-in PDF export
- ✅ Edge: Built-in PDF printer

## Future Enhancements

Potential improvements:
- [ ] Custom PDF styling options (themes)
- [ ] Include expenses summary in print
- [ ] Add QR code for sharing trip
- [ ] Weather forecast inclusion
- [ ] Map snapshots for destinations
- [ ] Multi-language support for print
- [ ] Email itinerary as PDF
- [ ] WhatsApp/social media sharing

## Troubleshooting

### Accommodations not showing:
- Verify stays have check-in and check-out dates
- Check dates match the day's date
- Ensure stays are saved in the Accommodations section

### Print looks wrong:
- Enable "Background graphics" in print settings
- Try different browsers
- Check print preview before saving
- Use A4 paper size

### Missing activities:
- Ensure activities are assigned to correct days
- Verify activities have been saved
- Check "All Days" view to see complete itinerary

### Colors not printing:
1. Open print dialog
2. Find "More settings" or "Options"
3. Enable "Background graphics" or "Background colors"

## Examples

### Sample Printed Itinerary Structure:
```
================================================
Beach Vacation in Goa
March 15, 2024 - March 20, 2024
Mumbai → Goa → Mumbai
================================================

Itinerary
---------

┌─────────────────────────────────────────┐
│ Day 1                        March 15   │
│ 🎯 Travel · 2 activities               │
├─────────────────────────────────────────┤
│                                         │
│ 🏨 Accommodation                        │
│ Taj Fort Aguada Resort & Spa           │
│ 📍 Sinquerim, Bardez, Goa              │
│ Mar 15 → Mar 20                        │
│ ₹15,000/night                          │
│                                         │
│ Activities:                             │
│ ⏰ 10:00 AM - Flight to Goa            │
│    ₹5,000                              │
│                                         │
│ ⏰ 3:00 PM - Check-in                  │
│    📍 Taj Fort Aguada                  │
└─────────────────────────────────────────┘

       ⋮ (dotted line separator)

┌─────────────────────────────────────────┐
│ Day 2                        March 16   │
│ ...                                     │
```

## Support

For issues or feature requests:
- Check browser console for errors
- Verify data is saved properly
- Try refreshing the page
- Test in different browser
