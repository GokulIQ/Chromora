
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('multi-step-form');
    if (!form) return;

    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const progressActive = document.querySelector('.progress-line-active');
    const stepIndicators = document.querySelectorAll('.step-item');
    const mobileProgressBar = document.getElementById('mobile-progress-bar');
    const mobileStepText = document.getElementById('mobile-step-text');
    
    let currentStep = 1;
    const totalSteps = steps.length;

    // -- State Data --
    const formData = {
        services: [],
        interiorRooms: []
    };

    // -- URL Parsing for Service Selection --
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
        const ALIASES = {
            'kitchen-cabinet-painting': 'cabinet-painting',
            'cabinet-refinishing': 'cabinet-painting',
            'baseboard-trim-painting': 'trim-door-painting',
            'trim-and-doors': 'trim-door-painting',
            'trim-doors': 'trim-door-painting',
            'decorative-wall-painting': 'decorative-finishes',
            'crown-molding-trim-painting': 'crown-molding-painting',
            'drywall-patching': 'drywall-repair',
            'wall-crack-repair': 'wall-crack-hole-repair',
            'crack-hole-repair': 'wall-crack-hole-repair',
            'move-in-painting': 'move-in-move-out-painting',
            'move-out-painting': 'move-in-move-out-painting',
            'two-tone-painting': 'two-tone-wall-painting',
            'textured-wall-painting': 'textured-wall-finishes'
        };
        const rawId = serviceParam.toLowerCase().trim();
        const selectedService = typeof servicesData !== 'undefined'
            ? (servicesData.find(service => service.id === rawId)
               || (ALIASES[rawId] && servicesData.find(service => service.id === ALIASES[rawId]))
               || servicesData.find(service => service.aliasIds && service.aliasIds.includes(rawId)))
            : null;
        const targetService = (selectedService?.estimateService || serviceParam).toLowerCase().replace(/-/g, ' ');
        const checkboxes = document.querySelectorAll('.service-card-input');
        let matched = false;
        checkboxes.forEach(cb => {
            const val = cb.value.toLowerCase();
            if (val === targetService || val.includes(targetService) || targetService.includes(val)) {
                cb.checked = true;
                matched = true;
            }
        });
        if (!matched) {
            const otherCb = document.getElementById('srv-other');
            if (otherCb) otherCb.checked = true;
        }
    }


    // -- Service Change Handlers --
    const serviceInputs = document.querySelectorAll('.service-card-input');
    const serviceError = document.getElementById('service-error');
    
    function updateServiceDependencies() {
        formData.services = Array.from(serviceInputs).filter(i => i.checked).map(i => i.value);
        
        // Hide all conditional blocks first
        document.getElementById('cond-interior').style.display = 'none';
        document.getElementById('cond-exterior').style.display = 'none';
        
        document.getElementById('measure-interior').classList.add('d-none');
        document.getElementById('measure-exterior').classList.add('d-none');
        document.getElementById('measure-cabinets').classList.add('d-none');
        document.getElementById('measure-deck').classList.add('d-none');
        document.getElementById('measure-drywall').classList.add('d-none');
        document.getElementById('measure-other').classList.add('d-none');

        const srvs = formData.services;
        const hasInterior = srvs.includes('Interior Painting') || srvs.includes('Whole House Painting') || srvs.includes('Walls & Ceilings');
        const hasExterior = srvs.includes('Exterior Painting') || srvs.includes('Whole House Painting');
        const hasCabinets = srvs.includes('Cabinets');
        const hasDeck = srvs.includes('Deck & Fence');
        const hasDrywall = srvs.includes('Drywall Repair');
        const hasOther = srvs.includes('Other') || srvs.includes('Trim & Doors');

        // Step 2 Conditionals
        if (hasInterior) document.getElementById('cond-interior').style.display = 'block';
        if (hasExterior) document.getElementById('cond-exterior').style.display = 'block';

        // Step 3 Measurements
        if (hasInterior) document.getElementById('measure-interior').classList.remove('d-none');
        if (hasExterior) document.getElementById('measure-exterior').classList.remove('d-none');
        if (hasCabinets) document.getElementById('measure-cabinets').classList.remove('d-none');
        if (hasDeck) document.getElementById('measure-deck').classList.remove('d-none');
        if (hasDrywall) document.getElementById('measure-drywall').classList.remove('d-none');
        if (hasOther) document.getElementById('measure-other').classList.remove('d-none');
        
        if(srvs.length > 0) {
            serviceError.classList.add('d-none');
        }
    }

    serviceInputs.forEach(input => {
        input.addEventListener('change', updateServiceDependencies);
    });
    updateServiceDependencies();

    // -- Dynamic Rooms Logic --
    const roomsContainer = document.getElementById('rooms-container');
    const addRoomBtn = document.getElementById('add-room-btn');
    const intRoomsCountInput = document.getElementById('int-rooms-count');

    function renderRooms(count) {
        if (!roomsContainer) return;
        const currentCount = roomsContainer.children.length;
        
        if (count > currentCount) {
            for (let i = currentCount; i < count; i++) {
                const roomHtml = `
                    <div class="room-entry p-3 bg-light rounded-3 border mb-3" data-index="${i}">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold text-navy mb-0">Room ${i + 1}</h6>
                            ${i > 0 ? `<button type="button" class="btn-close remove-room-btn" aria-label="Close"></button>` : ''}
                        </div>
                        <div class="row g-2">
                            <div class="col-sm-4">
                                <label class="small text-muted mb-1">Length (ft)</label>
                                <input type="number" class="form-control form-control-sm room-l" min="0" placeholder="e.g. 12">
                            </div>
                            <div class="col-sm-4">
                                <label class="small text-muted mb-1">Width (ft)</label>
                                <input type="number" class="form-control form-control-sm room-w" min="0" placeholder="e.g. 10">
                            </div>
                            <div class="col-sm-4">
                                <label class="small text-muted mb-1">Height (ft)</label>
                                <input type="number" class="form-control form-control-sm room-h" min="0" placeholder="e.g. 8" value="8">
                            </div>
                            <div class="col-12 mt-2">
                                <div class="form-check">
                                    <input class="form-check-input room-ceil" type="checkbox" id="ceil-${i}">
                                    <label class="form-check-label small text-muted" for="ceil-${i}">Include Ceiling</label>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                roomsContainer.insertAdjacentHTML('beforeend', roomHtml);
            }
        } else if (count < currentCount) {
            for (let i = currentCount - 1; i >= count; i--) {
                roomsContainer.children[i].remove();
            }
        }
        
        // Bind remove buttons
        document.querySelectorAll('.remove-room-btn').forEach(btn => {
            btn.onclick = function() {
                const row = this.closest('.room-entry');
                row.remove();
                intRoomsCountInput.value = roomsContainer.children.length;
                updateRoomLabels();
            };
        });
    }
    
    function updateRoomLabels() {
        Array.from(roomsContainer.children).forEach((room, idx) => {
            room.setAttribute('data-index', idx);
            room.querySelector('h6').innerText = `Room ${idx + 1}`;
            const ceilId = `ceil-${idx}`;
            room.querySelector('.room-ceil').id = ceilId;
            room.querySelector('label[for^="ceil-"]').setAttribute('for', ceilId);
        });
    }

    if (intRoomsCountInput) {
        intRoomsCountInput.addEventListener('change', (e) => {
            renderRooms(parseInt(e.target.value) || 1);
        });
        renderRooms(1);
    }
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', () => {
            intRoomsCountInput.value = parseInt(intRoomsCountInput.value) + 1;
            renderRooms(parseInt(intRoomsCountInput.value));
        });
    }

    // -- Navigation Logic --
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    if (currentStep === totalSteps) {
                        generateSummary();
                    }
                    updateUI();
                }
            } else {
                if (currentStep !== 4) {
                    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('was-validated');
                }
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            }
        });
    });

    const contactFields = ['contact-name', 'contact-email', 'contact-phone'].map(id => document.getElementById(id));

    function validateContactField(input, required = false) {
        const value = input.value.trim();
        let message = '';
        input.setCustomValidity('');
        if (!value && required) {
            message = 'This field is required to send an inquiry.';
        } else if (value) {
            if (input.id === 'contact-name' && Array.from(value).length < 3) {
                message = 'Enter a name with at least 3 characters.';
            } else if (input.id === 'contact-email' && (input.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
                message = 'Enter a valid email address, such as john@example.com.';
            } else if (input.id === 'contact-phone' && !/^[0-9]+$/.test(value)) {
                message = 'Enter a phone number using digits only.';
            }
        }
        input.setCustomValidity(message);
        input.classList.toggle('is-invalid', !!message);
        input.classList.toggle('is-valid', !!value && !message);
        input.setAttribute('aria-invalid', String(!!message));
        document.getElementById(`${input.id}-error`).textContent = message;
        return !message;
    }

    function validateContactDetails(required = false) {
        const valid = contactFields.map(input => validateContactField(input, required)).every(Boolean);
        if (!valid) contactFields.find(input => input.classList.contains('is-invalid')).focus();
        return valid;
    }

    contactFields.forEach(input => {
        input.addEventListener('input', () => {
            if (input.id === 'contact-phone') input.value = input.value.replace(/[^0-9]/g, '');
            validateContactField(input);
        });
        input.addEventListener('blur', () => {
            input.value = input.value.trim();
            validateContactField(input);
        });
    });

    function validateStep(stepNum) {
        const currentStepEl = document.querySelector(`.form-step[data-step="${stepNum}"]`);
        if (stepNum === 4) return validateContactDetails();
        
        if (stepNum === 1) {
            if (formData.services.length === 0) {
                serviceError.classList.remove('d-none');
                return false;
            }
            return true;
        }

        // For steps 2-4, validate required visible fields
        const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (input.offsetParent !== null && !input.checkValidity()) {
                isValid = false;
            }
        });
        return isValid;
    }

    function updateUI() {
        steps.forEach(step => step.classList.remove('active'));
        const activeStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        activeStep.classList.add('active');

        // Focus heading
        const heading = activeStep.querySelector('h3');
        if (heading) heading.focus();

        const formTop = document.getElementById('estimate-form-section').offsetTop - 100;
        window.scrollTo({ top: formTop, behavior: 'smooth' });

        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        if(progressActive) progressActive.style.width = `${progressPercentage}%`;

        stepIndicators.forEach((indicator, index) => {
            if (index < currentStep - 1) {
                indicator.classList.remove('active');
                indicator.classList.add('completed');
            } else if (index === currentStep - 1) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });

        if (mobileProgressBar) {
            mobileProgressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
            const titles = ['Services', 'Property', 'Measurements', 'Contact', 'Estimate'];
            mobileStepText.innerText = `Step ${currentStep} of ${totalSteps}  ${titles[currentStep-1]}`;
        }
    }

    // -- Estimate Generation --
    function gatherData() {
        formData.propertyType = document.getElementById('prop-type') ? document.getElementById('prop-type').value : '';
        formData.propertyZip = document.getElementById('prop-zip') ? document.getElementById('prop-zip').value : '';
        formData.propertyCondition = document.getElementById('prop-condition') ? document.getElementById('prop-condition').value : '';
        
        // Interior Rooms
        formData.interiorRooms = [];
        if (roomsContainer) {
            Array.from(roomsContainer.querySelectorAll('.room-entry')).forEach(roomEl => {
                formData.interiorRooms.push({
                    length: roomEl.querySelector('.room-l').value,
                    width: roomEl.querySelector('.room-w').value,
                    height: roomEl.querySelector('.room-h').value,
                    includeCeiling: roomEl.querySelector('.room-ceil').checked
                });
            });
        }
        formData.interiorCoats = document.getElementById('int-coats') ? document.getElementById('int-coats').value : '2';

        // Exterior
        formData.exteriorArea = document.getElementById('ext-total-area') ? document.getElementById('ext-total-area').value : '0';
        formData.exteriorCoats = document.getElementById('ext-coats') ? document.getElementById('ext-coats').value : '2';

        // Cabinets
        formData.cabinetDoors = document.getElementById('cab-doors') ? document.getElementById('cab-doors').value : '0';
        formData.cabinetDrawers = document.getElementById('cab-drawers') ? document.getElementById('cab-drawers').value : '0';
        formData.cabinetBoxArea = document.getElementById('cab-box-area') ? document.getElementById('cab-box-area').value : '0';

        // Deck
        formData.deckType = document.getElementById('deck-type') ? document.getElementById('deck-type').value : 'Deck';
        formData.deckArea = document.getElementById('deck-area') ? document.getElementById('deck-area').value : '0';

        // Drywall
        formData.drywallAreas = document.getElementById('drywall-areas') ? document.getElementById('drywall-areas').value : '0';
    }

    function generateSummary() {
        gatherData();

        // Populate Summary Block
        document.getElementById('sum-services').innerText = formData.services.join(', ');
        document.getElementById('sum-property').innerText = formData.propertyType || 'Not specified';
        document.getElementById('sum-condition').innerText = formData.propertyCondition || 'Not specified';
        document.getElementById('sum-zip').innerText = formData.propertyZip || 'Not specified';

        // Populate Measurements Summary
        const ml = document.getElementById('sum-measurements-list');
        ml.innerHTML = '';
        if (formData.interiorRooms.length > 0 && formData.services.some(s => s.includes('Interior') || s.includes('Whole House') || s.includes('Walls'))) {
            ml.innerHTML += `<li><strong>Interior:</strong> ${formData.interiorRooms.length} room(s) measured</li>`;
        }
        if (formData.exteriorArea > 0) {
            ml.innerHTML += `<li><strong>Exterior:</strong> ${formData.exteriorArea} sq ft estimated</li>`;
        }
        if (formData.cabinetDoors > 0 || formData.cabinetDrawers > 0) {
            ml.innerHTML += `<li><strong>Cabinets:</strong> ${formData.cabinetDoors} doors, ${formData.cabinetDrawers} drawers</li>`;
        }
        if (formData.deckArea > 0) {
            ml.innerHTML += `<li><strong>${formData.deckType}:</strong> ${formData.deckArea} sq ft</li>`;
        }
        if (formData.drywallAreas > 0) {
            ml.innerHTML += `<li><strong>Drywall:</strong> ${formData.drywallAreas} repair area(s)</li>`;
        }
        if(ml.innerHTML === '') ml.innerHTML = '<li>No specific measurements provided.</li>';

        // Call Calculator
        if (window.calculateEstimate) {
            const estimate = window.calculateEstimate(formData);
            
            const tbody = document.getElementById('est-line-items');
            tbody.innerHTML = '';
            
            if (estimate && estimate.lines.length > 0) {
                estimate.lines.forEach(line => {
                    tbody.innerHTML += `
                        <tr>
                            <td class="px-0 py-2">
                                <strong class="text-navy">${line.name}</strong><br>
                                <span class="text-muted" style="font-size:0.8rem;">${line.notes}</span>
                            </td>
                            <td class="px-0 py-2 text-end fw-bold">${line.formattedAmount}</td>
                        </tr>
                    `;
                });
                
                document.getElementById('est-subtotal').innerText = estimate.formattedSubtotal;
                
                if (estimate.tax > 0) {
                    document.getElementById('est-tax-row').style.setProperty('display', 'flex', 'important');
                    document.getElementById('est-tax').innerText = estimate.formattedTax;
                } else {
                    document.getElementById('est-tax-row').style.setProperty('display', 'none', 'important');
                }
                
                document.getElementById('est-total-range').innerText = `${estimate.formattedLow}  ${estimate.formattedHigh}`;
            } else {
                tbody.innerHTML = `<tr><td class="px-0 py-3 text-center">Your project details are ready. Contact our team for a personalized quote, as automatic pricing is not configured for these selections.</td></tr>`;
                document.getElementById('est-total-range').innerText = 'Contact Us';
            }
        }
    }

    window.editStep = function(step) {
        currentStep = step;
        updateUI();
    };

    // -- Form Submission (Inquiry) --
    const submitBtn = document.getElementById('btn-submit-inquiry');
    const submitError = document.getElementById('submit-error');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validate Step 4 explicitly for submission
            if (!validateContactDetails(true)) {
                submitError.classList.remove('d-none');
                editStep(4);
                contactFields.find(input => input.classList.contains('is-invalid')).focus();
                return;
            }
            submitError.classList.add('d-none');
            
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...';
            submitBtn.disabled = true;
            
            // Simulate network request
            setTimeout(() => {
                form.innerHTML = `
                    <div class="text-center py-5">
                        <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style="width: 80px; height: 80px; font-size: 2rem; background-color: rgba(184, 149, 98, 0.2); color: var(--c-accent);">
                            <i class="bi bi-check-lg"></i>
                        </div>
                        <h3 class="fw-bold text-navy mb-3">Request Received!</h3>
                        <p class="text-slate mb-4">Thank you for sharing your project details. This is a demonstration form.</p>
                        <a href="index.html" class="btn btn-navy px-4 py-2 rounded-pill text-white" style="background-color: var(--c-primary);">Return to Home</a>
                    </div>
                `;
            }, 1500);
        });
    }
});
