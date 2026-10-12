/**
 * Estimate Calculator Module
 * Requires estimate-pricing-config.js to be loaded first.
 */

window.calculateEstimate = function(data) {
    if (!window.pricingConfig || !window.pricingConfig.rates) {
        console.error("Pricing configuration is missing.");
        return null;
    }

    const cfg = window.pricingConfig;
    const lines = [];
    let subtotal = 0;

    // Helper to format currency
    const formatCurrency = (amount) => {
        return cfg.currencySymbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Helper to add a line item
    const addLine = (name, amount, notes = '') => {
        lines.push({ name, amount, formattedAmount: formatCurrency(amount), notes });
        subtotal += amount;
    };

    // 1. Property Condition Multiplier
    const condition = data.propertyCondition || "Good Condition";
    let prepMult = cfg.preparationMultipliers[condition] || 1.0;

    // 2. Interior Painting
    if (data.services.includes('Interior Painting') || data.services.includes('Whole House Painting') || data.services.includes('Walls & Ceilings')) {
        let totalWallArea = 0;
        let totalCeilArea = 0;
        
        if (data.interiorRooms && data.interiorRooms.length > 0) {
            data.interiorRooms.forEach(room => {
                const l = parseFloat(room.length) || 0;
                const w = parseFloat(room.width) || 0;
                const h = parseFloat(room.height) || 0;
                
                const wallArea = 2 * (l + w) * h;
                totalWallArea += wallArea;
                
                if (room.includeCeiling) {
                    totalCeilArea += (l * w);
                }
            });
        }

        const coats = parseInt(data.interiorCoats) || 2;
        const coatMult = (coats / 2); // Base rate is for 2 coats typically, let's assume rates are for 2 coats. If 1 coat, half price, if 3 coats, 1.5x.

        if (totalWallArea > 0) {
            const wallCost = totalWallArea * cfg.rates.interiorWallPerSqFt * coatMult * prepMult;
            addLine('Interior Wall Painting', wallCost, `${totalWallArea.toFixed(0)} sq ft, ${coats} coat(s)`);
        }
        if (totalCeilArea > 0) {
            const ceilCost = totalCeilArea * cfg.rates.ceilingPerSqFt * coatMult * prepMult;
            addLine('Interior Ceiling Painting', ceilCost, `${totalCeilArea.toFixed(0)} sq ft, ${coats} coat(s)`);
        }
    }

    // 3. Exterior Painting
    if (data.services.includes('Exterior Painting') || data.services.includes('Whole House Painting')) {
        const extArea = parseFloat(data.exteriorArea) || 0;
        const coats = parseInt(data.exteriorCoats) || 2;
        const coatMult = (coats / 2);

        if (extArea > 0) {
            const extCost = extArea * cfg.rates.exteriorPerSqFt * coatMult * prepMult;
            addLine('Exterior Painting', extCost, `${extArea.toFixed(0)} sq ft, ${coats} coat(s)`);
        }
    }

    // 4. Cabinets
    if (data.services.includes('Cabinets')) {
        const doors = parseInt(data.cabinetDoors) || 0;
        const drawers = parseInt(data.cabinetDrawers) || 0;
        const boxArea = parseFloat(data.cabinetBoxArea) || 0;

        let cabCost = 0;
        let notes = [];
        if (doors > 0) { cabCost += doors * cfg.rates.cabinetDoorEach; notes.push(`${doors} doors`); }
        if (drawers > 0) { cabCost += drawers * cfg.rates.cabinetDrawerEach; notes.push(`${drawers} drawers`); }
        if (boxArea > 0) { cabCost += boxArea * cfg.rates.cabinetBoxPerSqFt; notes.push(`${boxArea} sq ft boxes`); }

        cabCost = cabCost * prepMult;

        if (cabCost > 0) {
            addLine('Cabinet Painting/Refinishing', cabCost, notes.join(', '));
        }
    }

    // 5. Deck & Fence
    if (data.services.includes('Deck & Fence')) {
        const area = parseFloat(data.deckArea) || 0;
        const type = data.deckType || 'Deck';
        const rate = type === 'Fence' ? cfg.rates.fencePerSqFt : cfg.rates.deckPerSqFt;
        
        if (area > 0) {
            const deckCost = area * rate * prepMult;
            addLine(`${type} Painting/Staining`, deckCost, `${area.toFixed(0)} sq ft`);
        }
    }

    // 6. Drywall Repair
    if (data.services.includes('Drywall Repair')) {
        const areas = parseInt(data.drywallAreas) || 0;
        if (areas > 0) {
            const drCost = areas * cfg.rates.drywallRepairPerUnit;
            addLine('Drywall Repair', drCost, `${areas} repair area(s)`);
        }
    }

    // 7. Prep Cost explicitly separated if it was highly conditioned?
    // In this model we embedded prepMult into the line items for simplicity,
    // but the prompt says "Additional Preparation Cost".
    // Let's extract the premium prep cost to a separate line to be transparent.
    if (prepMult > 1.0 && subtotal > 0) {
        // We already multiplied line items by prepMult. So let's recalculate base vs prep.
        // Actually, it's easier to just calculate base in the steps above, then add prep.
        // Let's refactor the logic slightly in place:
        let totalPrepPremium = 0;
        lines.forEach(line => {
            const baseAmount = line.amount / prepMult;
            const prepPremium = line.amount - baseAmount;
            line.amount = baseAmount; // revert line to base
            line.formattedAmount = formatCurrency(baseAmount);
            totalPrepPremium += prepPremium;
        });
        subtotal = lines.reduce((acc, line) => acc + line.amount, 0); // recalculate subtotal without prep

        if (totalPrepPremium > 0) {
            addLine('Surface Preparation (Condition Adj.)', totalPrepPremium, `Based on '${condition}'`);
        }
    }

    // 8. Materials Split (Optional)
    if (!cfg.materialsIncludedInBaseRates && subtotal > 0) {
        // Base is labor. Material is roughly materialMultiplier * Labor.
        // Since we didn't specify if rates were labor only, assuming rates = labor.
        const matCost = subtotal * cfg.materialMultiplier;
        addLine('Estimated Materials', matCost, 'Paint, primer, supplies');
    }

    // Check Minimum Charge
    if (subtotal > 0 && subtotal < cfg.minimumProjectCharge) {
        const adjustment = cfg.minimumProjectCharge - subtotal;
        addLine('Minimum Project Adjustment', adjustment, `To meet base project minimum`);
    }

    // Calculate Taxes
    let taxAmount = 0;
    if (cfg.taxRate > 0) {
        taxAmount = subtotal * cfg.taxRate;
    }

    const totalWithTax = subtotal + taxAmount;

    // Range
    const low = totalWithTax * cfg.contingencyLow;
    const high = totalWithTax * cfg.contingencyHigh;

    return {
        lines,
        subtotal,
        formattedSubtotal: formatCurrency(subtotal),
        tax: taxAmount,
        formattedTax: formatCurrency(taxAmount),
        lowTotal: low,
        formattedLow: formatCurrency(low),
        highTotal: high,
        formattedHigh: formatCurrency(high),
        currencySymbol: cfg.currencySymbol
    };
};
