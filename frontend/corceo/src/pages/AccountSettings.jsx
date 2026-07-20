import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function AccountSettings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await request("http://localhost:5000/users/me");

        setProfile({
          full_name: data.full_name || "",
          username: data.username || "",
          email: data.email || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const updatedUser = await request(
        "http://localhost:5000/users/me",
        {
          method: "PUT",
          body: JSON.stringify(profile),
        }
      );

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      await request("http://localhost:5000/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage("Password changed successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This action cannot be undone."
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await request("http://localhost:5000/users/me", {
        method: "DELETE",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/register");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-8">Loading account...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Header />

      <main className="mx-auto max-w-3xl p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-slate-600 hover:text-blue-600 dark:text-slate-300"
        >
          ← Back
        </button>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow dark:bg-slate-900">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Account settings
            </h1>

            {message && (
              <div className="mt-4 rounded-lg bg-green-100 p-3 text-sm text-green-800">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={updateProfile} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold dark:text-white">
                  Full name
                </span>

                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      full_name: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold dark:text-white">
                  Username
                </span>

                <input
                  type="text"
                  value={profile.username}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold dark:text-white">
                  Email
                </span>

                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Save profile
              </button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow dark:bg-slate-900">
            <h2 className="text-lg font-bold dark:text-white">
              Change password
            </h2>

            <form onSubmit={changePassword} className="mt-4 space-y-4">
              <input
                type="password"
                placeholder="Current password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:text-white"
              />

              <input
                type="password"
                placeholder="New password"
                value={passwords.newPassword}
                onChange={(event) =>
                  setPasswords((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:text-white"
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={(event) =>
                  setPasswords((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:text-white"
              />

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Change password
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-red-200 bg-white p-6 shadow dark:bg-slate-900">
            <h2 className="font-bold text-red-600">Account actions</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border px-4 py-2 text-sm font-semibold dark:text-white"
              >
                Log out
              </button>

              <button
                type="button"
                onClick={deleteAccount}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Delete account
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AccountSettings;