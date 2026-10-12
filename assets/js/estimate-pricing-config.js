const pricingConfig = {
  currency: "USD",
  currencySymbol: "$",

  rates: {
    interiorWallPerSqFt: 2.50,      // per sq ft of wall area
    ceilingPerSqFt: 1.50,         // per sq ft of ceiling area
    exteriorPerSqFt: 3.50,        // per sq ft of exterior wall
    cabinetDoorEach: 120.00,      // per door
    cabinetDrawerEach: 80.00,     // per drawer
    cabinetBoxPerSqFt: 10.00,     // per sq ft of box surface
    deckPerSqFt: 4.00,            // per sq ft of deck/fence
    fencePerSqFt: 3.50,           // per sq ft of fence
    drywallRepairPerUnit: 150.00  // per repair area
  },

  laborIncludedInBaseRates: true,
  materialsIncludedInBaseRates: false,

  materialMultiplier: 0.20, // 20% of labor cost roughly for materials if separated

  preparationMultipliers: {
    "New Construction": 0.9,
    "Good Condition": 1.0,
    "Minor Repairs Needed": 1.15,
    "Extensive Preparation Needed": 1.4,
    "Major Preparation May Be Needed": 1.4,
    "Not Sure": 1.1
  },

  contingencyLow: 0.95, // 5% less for low end of range
  contingencyHigh: 1.15, // 15% more for high end of range

  minimumProjectCharge: 500.00,
  taxRate: 0.08 // 8% tax
};

window.pricingConfig = pricingConfig;
