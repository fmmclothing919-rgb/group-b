/* ============================================================
   Booking page interactivity
   - Service / doctor selection updates summary
   - Date picker enforces today+ as minimum
   - Time slot grid (click to select)
   - Inline form validation + confirmation banner
   ============================================================ */

(function () {
  const SERVICES = {
    'general':    { label: 'General Consultation', price: 30000, duration: '30 min' },
    'dental':     { label: 'Dental Check-up',       price: 50000, duration: '45 min' },
    'pediatric':  { label: 'Pediatrics',            price: 40000, duration: '30 min' },
    'derma':      { label: 'Dermatology',           price: 60000, duration: '30 min' },
    'cardio':     { label: 'Cardiology',            price: 90000, duration: '45 min' },
    'physio':     { label: 'Physiotherapy',         price: 45000, duration: '60 min' },
  };

  const formatPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format;

  const DOCTORS = {
    'general':   ['Dr. Amina Yusuf', 'Dr. Tobi Adeyemi'],
    'dental':    ['Dr. Chika Okafor'],
    'pediatric': ['Dr. Hauwa Bello', 'Dr. Samuel Eze'],
    'derma':     ['Dr. Funmi Ogun'],
    'cardio':    ['Dr. Ibrahim Musa'],
    'physio':    ['Dr. Grace Nwosu'],
  };

  const SLOTS = [
    '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
  ];

  const form        = document.getElementById('booking-form');
  if (!form) return;

  const serviceSel  = document.getElementById('service');
  const doctorSel   = document.getElementById('doctor');
  const dateInput   = document.getElementById('date');
  const slotsWrap   = document.getElementById('slots');
  const banner      = document.getElementById('banner');

  // Summary elements
  const sumService  = document.getElementById('sum-service');
  const sumDoctor   = document.getElementById('sum-doctor');
  const sumDate     = document.getElementById('sum-date');
  const sumTime     = document.getElementById('sum-time');
  const sumDuration = document.getElementById('sum-duration');
  const sumTotal    = document.getElementById('sum-total');

  let selectedSlot = null;

  // --- Initialize service dropdown ---
  Object.entries(SERVICES).forEach(([key, s]) => {
    const o = document.createElement('option');
    o.value = key;
    o.textContent = `${s.label} — ${formatPrice(s.price)}`;
    serviceSel.appendChild(o);
  });

  // --- Date: min = today ---
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  // --- Render slots ---
  function renderSlots() {
    slotsWrap.innerHTML = '';
    SLOTS.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.textContent = t;
      // Disable slots if no date chosen
      if (!dateInput.value) b.classList.add('disabled');
      // Demo: randomly mark a couple as unavailable per date
      if (dateInput.value) {
        const seed = dateInput.value.split('-').join('') | 0;
        if ((seed + parseInt(t.replace(':',''),10)) % 7 === 0) {
          b.classList.add('disabled');
        }
      }
      b.addEventListener('click', () => {
        if (b.classList.contains('disabled')) return;
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
        b.classList.add('selected');
        selectedSlot = t;
        updateSummary();
      });
      slotsWrap.appendChild(b);
    });
  }
  renderSlots();

  // --- Update doctor list when service changes ---
  serviceSel.addEventListener('change', () => {
    doctorSel.innerHTML = '<option value="">Select a doctor</option>';
    const list = DOCTORS[serviceSel.value] || [];
    list.forEach(name => {
      const o = document.createElement('option');
      o.value = name; o.textContent = name;
      doctorSel.appendChild(o);
    });
    updateSummary();
  });

  dateInput.addEventListener('change', () => {
    selectedSlot = null;
    renderSlots();
    updateSummary();
  });
  doctorSel.addEventListener('change', updateSummary);

  // --- Summary ---
  function updateSummary() {
    const svc = SERVICES[serviceSel.value];
    sumService.textContent  = svc ? svc.label : '—';
    sumDuration.textContent = svc ? svc.duration : '—';
    sumDoctor.textContent   = doctorSel.value || '—';
    sumDate.textContent     = dateInput.value ? formatDate(dateInput.value) : '—';
    sumTime.textContent     = selectedSlot || '—';
    sumTotal.textContent    = formatPrice(svc ? svc.price : 0);
  }
  function formatDate(s) {
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  // --- Validation helpers ---
  function setInvalid(id, invalid) {
    const field = document.getElementById(id).closest('.field');
    field.classList.toggle('invalid', invalid);
  }

  // --- Submit ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;

    const fullname = document.getElementById('fullname').value.trim();
    const email    = document.getElementById('email').value.trim();
    const phone    = document.getElementById('phone').value.trim();

    if (fullname.length < 2)     { setInvalid('fullname', true); ok = false; } else setInvalid('fullname', false);
    if (!/^\S+@\S+\.\S+$/.test(email)) { setInvalid('email', true); ok = false; } else setInvalid('email', false);
    if (phone.replace(/\D/g,'').length < 7) { setInvalid('phone', true); ok = false; } else setInvalid('phone', false);
    if (!serviceSel.value)       { setInvalid('service', true); ok = false; } else setInvalid('service', false);
    if (!doctorSel.value)        { setInvalid('doctor', true);  ok = false; } else setInvalid('doctor', false);
    if (!dateInput.value)        { setInvalid('date', true);    ok = false; } else setInvalid('date', false);
    if (!selectedSlot) {
      ok = false;
      slotsWrap.style.outline = '2px solid var(--danger)';
      slotsWrap.style.borderRadius = '10px';
    } else {
      slotsWrap.style.outline = 'none';
    }

    if (!ok) return;

    // Build confirmation
    const ref = 'MB-' + Math.random().toString(36).slice(2, 8).toUpperCase();

    banner.innerHTML =
      `✓ Appointment confirmed! Reference <strong>${ref}</strong>. ` +
      `A confirmation has been sent to <strong>${email}</strong>.`;
    banner.classList.add('show');
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.reset();
    selectedSlot = null;
    renderSlots();
    updateSummary();
  });

  updateSummary();
})();
