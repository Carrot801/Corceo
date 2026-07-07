import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="h-14 border-b bg-white px-4 flex items-center">
      <div className="font-bold text-slate-800">
        Analytics Builder
      </div>

      <div className="ml-auto flex items-center gap-3">
        {token ? (
          <>
            <span className="text-sm text-slate-600">
              {user?.full_name || user?.email}
            </span>

            <button
              onClick={logout}
              className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center"
              title="Logout"
            >
              👤
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center"
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