document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mainContactForm');
  if (!form) return;

  const alertBox = document.getElementById('formAlert');
  const fields = [...form.querySelectorAll('input, select, textarea')];
  const touched = new Set();

  function validate(field) {
    const value = field.value.trim();
    let message = '';
    if (field.id === 'fullName' && Array.from(value).length < 3) {
      message = 'Please enter a name with at least 3 characters.';
    } else if (field.id === 'emailAddr' && !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(value)) {
      message = 'Please enter a valid email address, such as john@example.com.';
    } else if (field.id === 'phoneNum' && field.value !== '' && !/^[0-9]+$/.test(field.value)) {
      message = 'Use digits only (0-9), without spaces, letters or symbols.';
    } else if (field.id === 'messageBox' && !value) {
      message = 'Please provide a message.';
    }
    field.setCustomValidity(message);
    const invalid = !field.validity.valid;
    const showError = touched.has(field) || form.classList.contains('was-validated');
    field.classList.toggle('is-invalid', showError && invalid);
    if (showError) field.setAttribute('aria-invalid', String(invalid));
    return !invalid;
  }

  fields.forEach(field => {
    field.addEventListener('blur', () => {
      if (field.type !== 'checkbox' && field.id !== 'phoneNum') field.value = field.value.trim();
      touched.add(field);
      validate(field);
    });
    ['input', 'change'].forEach(event => field.addEventListener(event, () => {
      alertBox.classList.add('d-none');
      validate(field);
    }));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    form.classList.add('was-validated');
    fields.forEach(field => {
      if (field.type !== 'checkbox' && field.id !== 'phoneNum') field.value = field.value.trim();
      validate(field);
    });
    if (!form.checkValidity()) {
      alertBox.className = 'alert mt-4 alert-danger border-0 shadow-sm';
      alertBox.textContent = 'Please correct the highlighted fields before submitting.';
      fields.find(field => !field.validity.valid)?.focus();
      return;
    }
    form.reset();
    alertBox.className = 'alert mt-4 alert-success border-0 shadow-sm';
    alertBox.textContent = 'Form submitted successfully!';
    alertBox.scrollIntoView({ block: 'nearest' });
  });

  form.addEventListener('reset', () => {
    touched.clear();
    form.classList.remove('was-validated');
    alertBox.classList.add('d-none');
    fields.forEach(field => {
      field.setCustomValidity('');
      field.classList.remove('is-invalid', 'is-valid');
      field.removeAttribute('aria-invalid');
    });
  });
});
