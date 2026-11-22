import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, Application, Status } from "../api";
import { STATUSES } from "../statuses";
import ApplicationForm from "./ApplicationForm";

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["applications", search],
    queryFn: () => api.list(search),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["applications"] });

  const create = useMutation({ mutationFn: api.create, onSuccess: refresh });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) => api.update(id, { status }),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: api.remove, onSuccess: refresh });

  const items = data?.items ?? [];

  return (
    <div className="page">
      <header className="topbar">
        <h1>JobTracker</h1>
        <input
          className="search"
          type="search"
          placeholder="Rechercher une entreprise ou un poste"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="link" onClick={onLogout}>
          Se déconnecter
        </button>
      </header>

      <ApplicationForm
        pending={create.isPending}
        error={create.error?.message}
        onSubmit={async (d) => {
          await create.mutateAsync(d).catch(() => undefined);
        }}
      />

      {isLoading && <p className="muted">Chargement…</p>}
      {error && <p className="error">{error.message}</p>}
      {!isLoading && items.length === 0 && !search && (
        <p className="muted">Aucune candidature pour l'instant. Ajoute la première ci-dessus.</p>
      )}

      <section className="board">
        {STATUSES.map(({ value, label }) => {
          const column = items.filter((a) => a.status === value);
          return (
            <div key={value} className={`column status-${value}`}>
              <h2>
                {label} <span className="count">{column.length}</span>
              </h2>
              {column.map((app) => (
                <Card
                  key={app.id}
                  app={app}
                  onStatus={(status) => update.mutate({ id: app.id, status })}
                  onDelete={() => {
                    if (confirm(`Supprimer la candidature chez ${app.company} ?`)) remove.mutate(app.id);
                  }}
                />
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Card({
  app,
  onStatus,
  onDelete,
}: {
  app: Application;
  onStatus: (s: Status) => void;
  onDelete: () => void;
}) {
  return (
    <article className="card">
      <strong>{app.company}</strong>
      <span>{app.position}</span>
      <time className="muted" dateTime={app.appliedAt}>
        {new Date(app.appliedAt).toLocaleDateString("fr-FR")}
      </time>
      {app.url && (
        <a href={app.url} target="_blank" rel="noreferrer noopener">
          Voir l'offre
        </a>
      )}
      <div className="card-actions">
        <select value={app.status} onChange={(e) => onStatus(e.target.value as Status)} aria-label="Changer le statut">
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button className="link danger" onClick={onDelete}>
          Supprimer
        </button>
      </div>
    </article>
  );
}
