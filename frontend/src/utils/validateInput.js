export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateMeetingCode = (code) => {
  return code && code.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const getValidationErrors = (formData) => {
  const errors = {};

  if (formData.email !== undefined && !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.password !== undefined && !validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (formData.name !== undefined && !validateName(formData.name)) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (formData.meetingCode !== undefined && !validateMeetingCode(formData.meetingCode)) {
    errors.meetingCode = 'Please enter a valid meeting code';
  }

  return errors;
};
