import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { validateLogin} from "../utils/authValidation";
function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

const submit = async (e) => {
  e.preventDefault();

  const validationErrors = validateLogin(form);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors({});

  try {
    const result = await loginUser(form);

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));

    navigate("/base");
  } catch (err) {
    setErrors({
      server: err?.message || "Invalid email or password",
    });
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow w-96">
        <h1 className="text-xl font-bold mb-4">Login</h1>



        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {errors.server && (
          <div className="text-red-500 text-sm mb-3">
            {errors.server}
          </div>
        )}

        {errors.email && (
          <p className="text-red-500 text-sm mb-3">{errors.email}</p>
        )}

        {errors.password && (
          <p className="text-red-500 text-sm mb-3">{errors.password}</p>
        )}
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>

        <p className="text-sm mt-4">
          No account?{" "}
          <Link to="/register" className="text-blue-600">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;