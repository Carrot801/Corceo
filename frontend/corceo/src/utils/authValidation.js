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

  const fullName = form.full_name?.trim();
  const username = form.username?.trim();
  const email = form.email?.trim();
  const password = form.password || "";

  if (!fullName) {
    errors.full_name = "Full name is required";
  } else if (fullName.length < 2) {
    errors.full_name = "Full name must be at least 2 characters";
  }

  if (!username) {
    errors.username = "Username is required";
  } else if (username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  } else if (username.length > 30) {
    errors.username = "Username cannot exceed 30 characters";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username =
      "Username may contain only letters, numbers, and underscores";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/[A-Z]/.test(password)) {
    errors.password =
      "Password must contain at least one uppercase letter";
  } else if (!/[0-9]/.test(password)) {
    errors.password =
      "Password must contain at least one number";
  }

  return errors;
};