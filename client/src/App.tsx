import { useState } from "react";
import { getToken, setToken } from "./api";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [authed, setAuthed] = useState(Boolean(getToken()));

  if (!authed) return <AuthForm onSuccess={() => setAuthed(true)} />;

  return (
    <Dashboard
      onLogout={() => {
        setToken(null);
        setAuthed(false);
      }}
    />
  );
}
