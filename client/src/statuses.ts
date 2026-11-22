import { Status } from "./api";

export const STATUSES: { value: Status; label: string }[] = [
  { value: "WISHLIST", label: "À postuler" },
  { value: "APPLIED", label: "Envoyée" },
  { value: "INTERVIEW", label: "Entretien" },
  { value: "OFFER", label: "Offre" },
  { value: "REJECTED", label: "Refusée" },
];
