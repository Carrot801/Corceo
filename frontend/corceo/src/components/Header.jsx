import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="h-14 border-b bg-white dark:bg-slate-900 dark:border-slate-700 px-4 flex items-center">
      <div className="font-bold text-slate-800 dark:text-white">
        Analytics Builder
      </div>

      <div className="ml-auto flex items-center gap-3">

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
          title="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {token ? (
          <>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {user?.full_name || user?.email}
            </span>

            <button
              onClick={logout}
              className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
              title="Logout"
            >
              👤
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
            title="Login"
          >
            👤
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;