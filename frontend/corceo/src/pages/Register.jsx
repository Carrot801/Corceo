import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { validateRegister } from "../utils/authValidation";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
      server: "",
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegister(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const result = await registerUser({
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      navigate("/base");
    } catch (err) {
      setErrors({
        server: err.message || "Registration failed",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-96 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-xl font-bold">Create Account</h1>

        {errors.server && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
            {errors.server}
          </div>
        )}

        <input
          type="text"
          autoComplete="name"
          className={`mb-1 w-full rounded border p-2 ${
            errors.full_name ? "border-red-500" : ""
          }`}
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => updateField("full_name", e.target.value)}
        />

        {errors.full_name && (
          <p className="mb-3 text-sm text-red-500">
            {errors.full_name}
          </p>
        )}

        <input
          type="text"
          autoComplete="username"
          className={`mb-1 w-full rounded border p-2 ${
            errors.username ? "border-red-500" : ""
          }`}
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            updateField(
              "username",
              e.target.value
                .toLowerCase()
                .replace(/\s+/g, "")
            )
          }
        />

        {errors.username && (
          <p className="mb-3 text-sm text-red-500">
            {errors.username}
          </p>
        )}

        <input
          type="email"
          autoComplete="email"
          className={`mb-1 w-full rounded border p-2 ${
            errors.email ? "border-red-500" : ""
          }`}
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        {errors.email && (
          <p className="mb-3 text-sm text-red-500">
            {errors.email}
          </p>
        )}

        <input
          type="password"
          autoComplete="new-password"
          className={`mb-1 w-full rounded border p-2 ${
            errors.password ? "border-red-500" : ""
          }`}
          placeholder="Password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
        />

        {errors.password && (
          <p className="mb-3 text-sm text-red-500">
            {errors.password}
          </p>
        )}

        <div className="mt-1 text-xs text-gray-500">
          <div
            className={
              form.password.length >= 8 ? "text-green-600" : ""
            }
          >
            ✓ At least 8 characters
          </div>

          <div
            className={
              /[A-Z]/.test(form.password) ? "text-green-600" : ""
            }
          >
            ✓ One uppercase letter
          </div>

          <div
            className={
              /[0-9]/.test(form.password) ? "text-green-600" : ""
            }
          >
            ✓ One number
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Sign Up
        </button>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;