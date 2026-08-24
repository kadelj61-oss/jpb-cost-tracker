"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setBusy(false);
        return;
      }
      router.push(params.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <form style={styles.card} onSubmit={submit}>
        <p style={styles.eyebrow}>Job Cost Tracker</p>
        <h1 style={styles.title}>Enter Password</h1>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={styles.input}
        />
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" disabled={busy} style={styles.button}>
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#EEF1F0",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  card: {
    background: "#fff",
    border: "1px solid #DBE0DD",
    borderRadius: 10,
    padding: "32px 28px",
    width: 320,
    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
  },
  eyebrow: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#5B6672",
    margin: "0 0 4px 0",
  },
  title: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 22,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    margin: "0 0 18px 0",
    color: "#1F2E45",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #DBE0DD",
    borderRadius: 6,
    marginBottom: 12,
    boxSizing: "border-box",
  },
  error: {
    color: "#C1443C",
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 500,
    background: "#D8571F",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
