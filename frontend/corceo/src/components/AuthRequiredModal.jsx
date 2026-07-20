import { useNavigate } from "react-router-dom";

function AuthRequiredModal({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Account required
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Please register or log in before creating projects or stories.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-600 dark:text-white"
          >
            Log in
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthRequiredModal;