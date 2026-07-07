import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { validateRegister} from "../utils/authValidation";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
const submit = async (e) => {
  e.preventDefault();

  const validationErrors =
    validateRegister(form);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors({});

  try {
    const result = await registerUser(form);

    localStorage.setItem("token", result.token);
    localStorage.setItem(
      "user",
      JSON.stringify(result.user)
    );

    navigate("/base");
  } catch (err) {
    setErrors({
      server:
        err.message ||
        "Registration failed",
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow w-96">
        <h1 className="text-xl font-bold mb-4">Create Account</h1>
        
        {errors.server && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded mb-3 text-sm">
            {errors.server}
          </div>
        )}
        <input
          className={`w-full border p-2 rounded mb-1 ${
            errors.full_name ? "border-red-500" : ""
          }`}
          placeholder="Name"
          value={form.full_name}
          onChange={(e) =>
            setForm({
              ...form,
              full_name: e.target.value,
            })
          }
        />

        {errors.full_name && (
          <p className="text-red-500 text-sm mb-3">
            {errors.full_name}
          </p>
        )}

        <input
          className={`w-full border p-2 rounded mb-1 ${
            errors.email ? "border-red-500" : ""
          }`}
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        {errors.email && (
          <p className="text-red-500 text-sm mb-3">
            {errors.email}
          </p>
        )}
        <input
          type="password"
          className={`w-full border p-2 rounded mb-1 ${
            errors.password ? "border-red-500" : ""
          }`}
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-3">
            {errors.password}
          </p>
        )}

        <div className="text-xs text-gray-500 mt-1">
          <div className={form.password.length >= 8 ? "text-green-600" : ""}>
            ✓ At least 8 characters
          </div>

          <div className={/[A-Z]/.test(form.password) ? "text-green-600" : ""}>
            ✓ One uppercase letter
          </div>

          <div className={/[0-9]/.test(form.password) ? "text-green-600" : ""}>
            ✓ One number
          </div>
        </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded mt-4">
        Sign Up
      </button>
        <p className="text-sm mt-4">
          Already have account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;