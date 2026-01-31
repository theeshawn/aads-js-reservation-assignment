// ===================== DATASETS =====================

const properties = [
  {
    id: "P001",
    name: "Sunset Villa",
    city: "Harare",
    type: "Villa",
    nightlyRate: 120,
    cleaningFee: 30,
    maxGuests: 6,
    amenities: ["WiFi", "Pool", "Parking"],
    isActive: true
  },
  {
    id: "P002",
    name: "CBD Studio",
    city: "Harare",
    type: "Apartment",
    nightlyRate: 60,
    cleaningFee: 15,
    maxGuests: 2,
    amenities: ["WiFi"],
    isActive: true
  },
  {
    id: "P003",
    name: "Hilltop Lodge",
    city: "Bulawayo",
    type: "House",
    nightlyRate: 80,
    cleaningFee: 20,
    maxGuests: 4,
    amenities: ["WiFi", "Parking"],
    isActive: true
  },
  {
    id: "P004",
    name: "Garden Cottage",
    city: "Bulawayo",
    type: "Cottage",
    nightlyRate: 50,
    cleaningFee: 10,
    maxGuests: 2,
    amenities: ["Parking"],
    isActive: false
  },
  {
    id: "P005",
    name: "Airport Guesthouse",
    city: "Harare",
    type: "House",
    nightlyRate: 70,
    cleaningFee: 20,
    maxGuests: 3,
    amenities: ["WiFi", "Parking"],
    isActive: true
  },
  {
    id: "P006",
    name: "City View Flat",
    city: "Harare",
    type: "Apartment",
    nightlyRate: 55,
    cleaningFee: 15,
    maxGuests: 2,
    amenities: ["WiFi"],
    isActive: true
  }
];

const bookings = [
  { id: "B001", propertyId: "P001", guestName: "Alice", guests: 4, checkIn: "2026-02-10", checkOut: "2026-02-14", status: "CONFIRMED", createdAt: "2026-01-01" },
  { id: "B002", propertyId: "P001", guestName: "Bob", guests: 3, checkIn: "2026-02-13", checkOut: "2026-02-17", status: "CONFIRMED", createdAt: "2026-01-02" },
  { id: "B003", propertyId: "P002", guestName: "Charlie", guests: 2, checkIn: "2026-02-11", checkOut: "2026-02-13", status: "PENDING", createdAt: "2026-01-03" },
  { id: "B004", propertyId: "P003", guestName: "Diana", guests: 4, checkIn: "2026-02-15", checkOut: "2026-02-20", status: "CONFIRMED", createdAt: "2026-01-04" },
  { id: "B005", propertyId: "P003", guestName: "David", guests: 5, checkIn: "2026-02-10", checkOut: "2026-02-12", status: "CANCELLED", createdAt: "2026-01-05" },
  { id: "B006", propertyId: "P004", guestName: "Inactive Test", guests: 1, checkIn: "2026-02-10", checkOut: "2026-02-11", status: "CONFIRMED", createdAt: "2026-01-06" },
  { id: "B007", propertyId: "P005", guestName: "Grace", guests: 3, checkIn: "2026-02-14", checkOut: "2026-02-18", status: "CONFIRMED", createdAt: "2026-01-07" },
  { id: "B008", propertyId: "P006", guestName: "Tinashe", guests: 1, checkIn: "2026-02-12", checkOut: "2026-02-13", status: "CANCELLED", createdAt: "2026-01-08" },
  { id: "B009", propertyId: "P002", guestName: "Over Guest", guests: 4, checkIn: "2026-02-15", checkOut: "2026-02-17", status: "PENDING", createdAt: "2026-01-09" },
  { id: "B010", propertyId: "P005", guestName: "Late Booker", guests: 2, checkIn: "2026-02-11", checkOut: "2026-02-12", status: "CONFIRMED", createdAt: "2026-01-10" }
];

// ===================== UTILITIES =====================

function parseDate(dateString) {
  const d = new Date(dateString);
  return isNaN(d) ? null : d;
}

function nightsBetween(checkIn, checkOut) {
  const inDate = parseDate(checkIn);
  const outDate = parseDate(checkOut);
  return (outDate - inDate) / (1000 * 60 * 60 * 24);
}

function isOverlapping(aIn, aOut, bIn, bOut) {
  return parseDate(aIn) < parseDate(bOut) && parseDate(bIn) < parseDate(aOut);
}

// ===================== FILTER FUNCTIONS =====================

function getActiveProperties(props) {
  return props.filter(p => p.isActive);
}

function searchProperties(props, filters) {
  return props.filter(p => {
    if (filters.city && p.city !== filters.city) return false;
    if (filters.minRate && p.nightlyRate < filters.minRate) return false;
    if (filters.maxRate && p.nightlyRate > filters.maxRate) return false;
    if (filters.minGuests && p.maxGuests < filters.minGuests) return false;
    if (filters.amenities && !filters.amenities.every(a => p.amenities.includes(a))) return false;
    return true;
  });
}

// ===================== BOOKING FUNCTIONS =====================

function getConfirmedBookings(bks) {
  return bks.filter(b => b.status === "CONFIRMED");
}

function isPropertyAvailable(bks, propertyId, checkIn, checkOut) {
  return !getConfirmedBookings(bks).some(b =>
    b.propertyId === propertyId && isOverlapping(b.checkIn, b.checkOut, checkIn, checkOut)
  );
}

function calculateBookingTotal(property, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  return nights * property.nightlyRate + property.cleaningFee;
}

function createBooking(bks, props, data) {
  const property = props.find(p => p.id === data.propertyId);
  if (!property) return { success: false, error: "Property does not exist" };
  if (!property.isActive) return { success: false, error: "Property is inactive" };
  if (!parseDate(data.checkIn) || !parseDate(data.checkOut)) return { success: false, error: "Invalid dates" };
  if (parseDate(data.checkIn) >= parseDate(data.checkOut)) return { success: false, error: "Check-in must be before check-out" };
  if (data.guests <= 0) return { success: false, error: "Guests must be positive" };
  if (data.guests > property.maxGuests) return { success: false, error: "Guests exceed max allowed" };
  if (!isPropertyAvailable(bks, data.propertyId, data.checkIn, data.checkOut))
    return { success: false, error: "Property not available" };

  const newBooking = {
    id: "B" + String(bks.length + 1).padStart(3, "0"),
    ...data,
    status: "PENDING",
    createdAt: new Date().toISOString().split("T")[0]
  };
  bks.push(newBooking);
  return { success: true, booking: newBooking };
}

// ===================== CLASS =====================

class ReservationSystem {
  constructor(properties, bookings) {
    this.properties = properties;
    this.bookings = bookings;
  }

  findPropertyById(id) {
    return this.properties.find(p => p.id === id) || null;
  }

  listActiveProperties() {
    return getActiveProperties(this.properties);
  }

  listAvailableProperties(checkIn, checkOut, city = null) {
    return this.listActiveProperties().filter(p =>
      (!city || p.city === city) &&
      isPropertyAvailable(this.bookings, p.id, checkIn, checkOut)
    );
  }

  quote(propertyId, checkIn, checkOut) {
    const p = this.findPropertyById(propertyId);
    const nights = nightsBetween(checkIn, checkOut);
    return {
      nights,
      nightlyRate: p.nightlyRate,
      cleaningFee: p.cleaningFee,
      total: calculateBookingTotal(p, checkIn, checkOut)
    };
  }

  requestBooking(data) {
    return createBooking(this.bookings, this.properties, data);
  }

  confirmBooking(id) {
    const b = this.bookings.find(b => b.id === id);
    if (!b) return false;
    if (!isPropertyAvailable(this.bookings, b.propertyId, b.checkIn, b.checkOut)) return false;
    b.status = "CONFIRMED";
    return true;
  }

  cancelBooking(id) {
    const b = this.bookings.find(b => b.id === id);
    if (!b) return false;
    b.status = "CANCELLED";
    return true;
  }

  dailyReport(date) {
    const d = parseDate(date);
    const active = this.listActiveProperties();
    const confirmed = getConfirmedBookings(this.bookings);

    const occupancyByCity = {};
    let revenue = 0;

    active.forEach(p => {
      if (!occupancyByCity[p.city])
        occupancyByCity[p.city] = { totalActiveProperties: 0, occupiedProperties: 0 };
      occupancyByCity[p.city].totalActiveProperties++;
    });

    confirmed.forEach(b => {
      if (parseDate(b.checkIn) <= d && d < parseDate(b.checkOut)) {
        const p = this.findPropertyById(b.propertyId);
        occupancyByCity[p.city].occupiedProperties++;
        revenue += p.nightlyRate;
      }
    });

    Object.values(occupancyByCity).forEach(c =>
      c.occupancyRate = (c.occupiedProperties / c.totalActiveProperties) * 100
    );

    return {
      date,
      totalProperties: this.properties.length,
      activeProperties: active.length,
      inactiveProperties: this.properties.length - active.length,
      totalBookings: this.bookings.length,
      confirmedBookings: confirmed.length,
      pendingBookings: this.bookings.filter(b => b.status === "PENDING").length,
      cancelledBookings: this.bookings.filter(b => b.status === "CANCELLED").length,
      occupancyByCity,
      estimatedRevenueForDate: revenue
    };
  }
}

// ===================== DEMO OUTPUT =====================

const system = new ReservationSystem(properties, bookings);

console.log("\nSTEP 1: ACTIVE PROPERTIES");
console.log(system.listActiveProperties());

console.log("\nSTEP 2: SEARCH FILTER");
console.log(searchProperties(properties, { city: "Harare", maxRate: 100, amenities: ["WiFi"] }));

console.log("\nSTEP 3: AVAILABILITY TEST (EXPECTED FALSE)");
console.log(isPropertyAvailable(bookings, "P001", "2026-02-12", "2026-02-15"));

console.log("\nSTEP 4: QUOTE");
console.log(system.quote("P001", "2026-02-20", "2026-02-22"));

console.log("\nSTEP 5: INVALID BOOKING");
console.log(system.requestBooking({ propertyId: "P002", guestName: "Test", guests: 10, checkIn: "2026-02-20", checkOut: "2026-02-22" }));

console.log("\nSTEP 6: VALID BOOKING");
const newB = system.requestBooking({ propertyId: "P002", guestName: "Jane", guests: 2, checkIn: "2026-02-20", checkOut: "2026-02-22" });
console.log(newB);

console.log("\nSTEP 7: CONFIRM BOOKING");
console.log("Before:", newB.booking.status);
system.confirmBooking(newB.booking.id);
console.log("After:", newB.booking.status);

console.log("\nSTEP 8: DAILY REPORT");
console.log(system.dailyReport("2026-02-12"));
