import { FormEvent, useState } from "react";
import { NewApplication, Status } from "../api";
import { STATUSES } from "../statuses";

const empty: NewApplication = { company: "", position: "", status: "APPLIED", url: "", notes: "" };

export default function ApplicationForm({
  onSubmit,
  pending,
  error,
}: {
  onSubmit: (data: NewApplication) => Promise<void>;
  pending: boolean;
  error?: string;
}) {
  const [form, setForm] = useState<NewApplication>(empty);
  const set = <K extends keyof NewApplication>(key: K, value: NewApplication[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(form);
    setForm(empty);
  }

  return (
    <form className="new-form" onSubmit={submit}>
      <input placeholder="Entreprise" value={form.company} onChange={(e) => set("company", e.target.value)} required />
      <input placeholder="Poste" value={form.position} onChange={(e) => set("position", e.target.value)} required />
      <input
        type="url"
        placeholder="Lien de l'offre (optionnel)"
        value={form.url}
        onChange={(e) => set("url", e.target.value)}
      />
      <select value={form.status} onChange={(e) => set("status", e.target.value as Status)}>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button className="primary" disabled={pending}>
        Ajouter
      </button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
