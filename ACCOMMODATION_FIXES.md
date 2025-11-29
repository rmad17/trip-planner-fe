# Accommodation Fixes

## Issues Fixed

### 1. ✅ Accommodations Not Loading on First Visit

**Problem**: When visiting the Accommodations tab for the first time, no accommodations were displayed even though they existed in the backend.

**Root Cause**: The `fetchStays()` function depended on `tripHops` state, but was called in a `Promise.all()` before `tripHops` was set. This created a closure issue where `fetchStays` always saw an empty `tripHops` array.

**Solution**:
- Modified `fetchStays()` to accept an optional `hopsToUse` parameter
- When called during initial load, we now pass `tripData.trip_hops` directly instead of relying on state
- Fallback to state if no parameter is provided

**Code Changes** (TripDetails.js):
```javascript
// Before
const fetchStays = async () => {
  if (tripHops.length > 0) { // Always empty on first call
    // ...
  }
};

// After
const fetchStays = async (hopsToUse = null) => {
  const hops = hopsToUse || tripHops; // Use passed hops or state
  if (hops && hops.length > 0) {
    // ...
  }
};

// Called with explicit hops
fetchStays(tripData.trip_hops || [])
```

**Files Modified**:
- Line 265: `fetchStays` function signature
- Line 182: Call with explicit hops parameter

---

### 2. ✅ Accommodation Edit Form Missing Fields

**Problem**: The edit form only had 2 fields (Name and Cost), while the create form had many more fields including trip hop, address, dates, and notes.

**Solution**: Completely rewrote the edit form to match the create form with all fields:
- **Trip Hop/Destination**: Dropdown to select which destination the accommodation belongs to
- **Name**: Hotel/accommodation name
- **Address**: Full address
- **Check-in Date**: Date picker
- **Check-out Date**: Date picker
- **Cost per Night**: Nightly rate
- **Total Cost**: Total cost for stay
- **Notes**: Booking confirmation, special requests, etc.

**Code Changes** (TripDetails.js:3309-3424):

**Before** (only 2 fields):
```javascript
<div className="space-y-3">
  <div>
    <label>Name</label>
    <input defaultValue={stay.name || ''} id={`stay-name-${stay.id}`} />
  </div>
  <div>
    <label>Cost</label>
    <input type="number" defaultValue={stay.cost || ''} id={`stay-cost-${stay.id}`} />
  </div>
</div>
```

**After** (all 8 fields):
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
    <label>Name</label>
    <input defaultValue={stay.name || ''} id={`stay-name-${stay.id}`} />
  </div>
  <div>
    <label>Destination</label>
    <select defaultValue={stay.trip_hop || ''} id={`stay-hop-${stay.id}`}>
      {tripHops.map(hop => <option value={hop.id}>{hop.name}</option>)}
    </select>
  </div>
  <div className="md:col-span-2">
    <label>Address</label>
    <input defaultValue={stay.address || ''} id={`stay-address-${stay.id}`} />
  </div>
  <div>
    <label>Check-in Date</label>
    <input type="date" defaultValue={...} id={`stay-checkin-${stay.id}`} />
  </div>
  <div>
    <label>Check-out Date</label>
    <input type="date" defaultValue={...} id={`stay-checkout-${stay.id}`} />
  </div>
  <div>
    <label>Cost per Night</label>
    <input type="number" defaultValue={stay.cost_per_night} id={`stay-cost-per-night-${stay.id}`} />
  </div>
  <div>
    <label>Total Cost</label>
    <input type="number" defaultValue={stay.cost} id={`stay-cost-${stay.id}`} />
  </div>
  <div className="md:col-span-2">
    <label>Notes</label>
    <textarea defaultValue={stay.notes} id={`stay-notes-${stay.id}`} />
  </div>
</div>
```

**Update Handler** also fixed to include all fields:
```javascript
const updatedData = {
  name: document.getElementById(`stay-name-${stay.id}`).value,
  trip_hop: document.getElementById(`stay-hop-${stay.id}`).value,
  address: document.getElementById(`stay-address-${stay.id}`).value,
  check_in_date: document.getElementById(`stay-checkin-${stay.id}`).value,
  check_out_date: document.getElementById(`stay-checkout-${stay.id}`).value,
  cost_per_night: parseFloat(document.getElementById(`stay-cost-per-night-${stay.id}`).value) || null,
  cost: parseFloat(document.getElementById(`stay-cost-${stay.id}`).value) || null,
  notes: document.getElementById(`stay-notes-${stay.id}`).value
};
```

---

### 3. ✅ Trip Hop Link Added to Accommodations

**Problem**: Needed to ensure accommodations are properly linked to trip hops, and that one hop can have multiple accommodations.

**Solution**:
- **Create form** already had trip hop dropdown (line 3203-3215) ✓
- **Edit form** now also has trip hop dropdown (line 3322-3336) ✓
- Backend relationship properly maintained

**Features**:
- When creating/editing accommodation, select from list of destinations
- One destination can have multiple accommodations
- Accommodations display which hop they belong to
- Itinerary shows accommodations for each day based on dates

**Enhanced Create Form** (TripDetails.js:3252-3273):
Added "Cost per Night" field alongside "Total Cost" to match backend model:
```javascript
<div>
  <label>Cost per Night</label>
  <input
    type="number"
    step="0.01"
    value={newStayData.cost_per_night || ''}
    onChange={(e) => setNewStayData(prev => ({ ...prev, cost_per_night: e.target.value }))}
    placeholder="Cost per night"
  />
</div>
<div>
  <label>Total Cost</label>
  <input
    type="number"
    step="0.01"
    value={newStayData.cost || ''}
    onChange={(e) => setNewStayData(prev => ({ ...prev, cost: e.target.value }))}
    placeholder="Total cost"
  />
</div>
```

---

## Backend Integration

### Data Mapping

**Create Accommodation** (handleCreateStay):
```javascript
const stayData = {
  name: newStayData.name,
  address: newStayData.address,
  notes: newStayData.notes,
  cost: newStayData.cost ? parseFloat(newStayData.cost) : null,
  cost_per_night: newStayData.cost_per_night ? parseFloat(newStayData.cost_per_night) : null,
  check_in_date: newStayData.check_in || null,
  check_out_date: newStayData.check_out || null
};
await staysAPI.createStay(newStayData.trip_hop, stayData);
```

**Update Accommodation** (handleUpdateStay):
```javascript
const stayData = {
  name: updatedData.name,
  trip_hop: updatedData.trip_hop || null,
  address: updatedData.address,
  notes: updatedData.notes,
  cost: updatedData.cost ? parseFloat(updatedData.cost) : null,
  cost_per_night: updatedData.cost_per_night ? parseFloat(updatedData.cost_per_night) : null,
  check_in_date: updatedData.check_in_date || null,
  check_out_date: updatedData.check_out_date || null
};
await staysAPI.updateStay(stayId, stayData);
```

### Field Name Mapping
| Frontend Field | Backend Field | Type |
|---------------|---------------|------|
| name | name | string |
| trip_hop | trip_hop | UUID |
| address | address | string |
| check_in | check_in_date | date |
| check_out | check_out_date | date |
| cost_per_night | cost_per_night | float |
| cost | cost/total_cost | float |
| notes | notes | string |

---

## State Management

**Updated Initial State** (line 132-141):
```javascript
const [newStayData, setNewStayData] = useState({
  name: '',
  address: '',
  check_in: '',
  check_out: '',
  cost: '',
  cost_per_night: '',  // ← Added
  notes: '',
  trip_hop: ''
});
```

---

## How It Works Now

### Creating Accommodation
1. User clicks "Add Stay" button
2. Form appears with all fields including:
   - Destination dropdown (from trip hops)
   - Name, Address
   - Check-in/out dates
   - Cost per night and Total cost
   - Notes
3. User fills form and clicks "Add Accommodation"
4. Data is saved to backend with proper hop association
5. List refreshes automatically

### Editing Accommodation
1. User clicks Edit (pencil icon) on any accommodation
2. Form appears pre-filled with ALL current values
3. User can change ANY field including the destination
4. Changes are saved and list refreshes

### Viewing in Itinerary
- Accommodations automatically appear in itinerary for each day
- Matched by check-in/check-out date range
- Shows hotel name, address, dates, and cost
- Blue highlighted box distinguishes from activities

---

## Testing Checklist

- [x] Accommodations load on first visit
- [x] Can create accommodation with all fields
- [x] Can edit accommodation and change all fields
- [x] Trip hop dropdown shows all destinations
- [x] Multiple accommodations can exist for one hop
- [x] Accommodations display correctly in list
- [x] Accommodations show in itinerary on correct days
- [x] Cost per night and total cost both work
- [x] Dates display correctly
- [x] Build succeeds without errors

---

## Files Modified

1. **src/pages/TripDetails.js**
   - Line 132-141: Updated newStayData initial state
   - Line 182: Fixed fetchStays call with explicit hops
   - Line 265: Updated fetchStays function signature
   - Line 720-754: Updated handleCreateStay
   - Line 756-776: Updated handleUpdateStay
   - Line 3252-3273: Enhanced create form
   - Line 3309-3424: Completely rewrote edit form

---

## Known Behaviors

### Date Handling
- Frontend uses `check_in` and `check_out` in forms
- Backend expects `check_in_date` and `check_out_date`
- Conversion happens in handler functions

### Cost Fields
- **Cost per Night**: Daily rate
- **Total Cost**: Full stay cost
- Both are optional
- Both saved to backend separately

### Trip Hop Association
- Required when creating (enforced with validation)
- Can be changed when editing
- If hop is deleted, accommodation remains but shows "Unknown Location"

---

## Future Enhancements

- [ ] Calculate total cost from (nights × cost per night)
- [ ] Show number of nights in display
- [ ] Filter accommodations by hop
- [ ] Add booking reference field
- [ ] Add accommodation type (hotel, hostel, airbnb, etc.)
- [ ] Add contact information
- [ ] Add confirmation status
