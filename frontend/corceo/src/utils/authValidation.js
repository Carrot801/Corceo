export const validateLogin = (form) => {
  const errors = {};

  const email = form.email || "";
  const password = form.password || "";

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Invalid email format";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const validateRegister = (form) => {
  const errors = {};

  // NAME
  if (!form.full_name.trim()) {
    errors.full_name = "Name is required";
  } else if (form.full_name.trim().length < 2) {
    errors.full_name = "Name must be at least 2 characters";
  }

  // EMAIL
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  ) {
    errors.email = "Please enter a valid email address";
  }

  // PASSWORD
  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 8) {
    errors.password =
      "Password must be at least 8 characters";
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password =
      "Password must contain at least one uppercase letter";
  } else if (!/[0-9]/.test(form.password)) {
    errors.password =
      "Password must contain at least one number";
  }

  return errors;
};