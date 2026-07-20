import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  return (
    <header className="h-14 shrink-0 border-b bg-white px-4 flex items-center dark:bg-slate-900 dark:border-slate-700">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="font-bold text-slate-800 dark:text-white"
      >
        Analytics Builder
      </button>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDarkMode((current) => !current)}
          className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
          title="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {token && user ? (
          <>
            <span className="hidden sm:block text-sm text-slate-600 dark:text-slate-300">
              {user.full_name || user.username || user.email}
            </span>

            <button
              type="button"
              onClick={() => navigate("/account")}
              className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:ring-2 hover:ring-blue-500"
              title="Account settings"
            >
              👤
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:ring-2 hover:ring-blue-500"
            title="Log in"
          >
            ❔
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;