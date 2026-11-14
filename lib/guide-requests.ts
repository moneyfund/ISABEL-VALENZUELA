import { collection, doc, serverTimestamp, setDoc, type Firestore, type Timestamp } from "firebase/firestore";
import type {
  GuideAnswers, PaymentMode, PropertyType, IncomeType, ResidenceType, PropertyDocuments
} from "@/lib/guia-compra";

export type GuideRequestStatus = "nuevo" | "contactado" | "atendido";

export interface GuideRequestRecord {
  id: string;
  firstName: string;
  lastName: string;
  payment: PaymentMode;
  property: PropertyType;
  income: IncomeType;
  residence: ResidenceType;
  documents: PropertyDocuments;
  identified: boolean;
  price: number | null;
  savings: number | null;
  consent: true;
  status: GuideRequestStatus;
  createdAt?: Timestamp;
}

export function guideReference(id: string) {
  return "IV-" + id.slice(0, 8).toUpperCase();
}

function amountOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000000) {
    throw new Error("Revisá el presupuesto y la prima ingresados.");
  }
  return amount;
}

export async function submitGuideRequest(
  firestore: Firestore,
  firstName: string,
  lastName: string,
  answers: GuideAnswers,
  consent: boolean
): Promise<string> {
  const name = firstName.trim().replace(/\s+/g, " ");
  const surname = lastName.trim().replace(/\s+/g, " ");
  if (name.length < 2 || surname.length < 2 || name.length > 60 || surname.length > 60) {
    throw new Error("Escribí tu nombre y apellido (de 2 a 60 caracteres cada uno).");
  }
  if (!answers.payment || !answers.property || !answers.income ||
      !answers.residence || !answers.documents || answers.identified === null) {
    throw new Error("Completá todas las preguntas para continuar.");
  }
  if (!consent) {
    throw new Error("Debés autorizar el envío de tus respuestas antes de generar la guía.");
  }
  const price = amountOrNull(answers.price);
  const savings = answers.payment === "credito" ? amountOrNull(answers.savings) : null;
  const reference = doc(collection(firestore, "purchase_requests"));
  await setDoc(reference, {
    firstName: name,
    lastName: surname,
    payment: answers.payment,
    property: answers.property,
    income: answers.income,
    residence: answers.residence,
    documents: answers.documents,
    identified: answers.identified,
    price, savings,
    consent: true,
    status: "nuevo",
    createdAt: serverTimestamp()
  });
  return guideReference(reference.id);
}

export const requestStatuses: { value: GuideRequestStatus; title: string }[] = [
  { value: "nuevo", title: "Nueva consulta" },
  { value: "contactado", title: "Contactado" },
  { value: "atendido", title: "Atendido" }
];

export const guideLabels = {
  payment: { credito: "Crédito", contado: "Contado" },
  property: {
    casa: "Casa", apartamento: "Apartamento", terreno: "Terreno",
    finca: "Finca", local: "Local comercial"
  },
  income: {
    asalariado: "Salario fijo", independiente: "Negocio propio",
    mixto: "Ingresos mixtos", extranjero: "Ingresos del exterior",
    "no-comprobable": "Sin soportes formales"
  },
  residence: {
    nicaragua: "Reside en Nicaragua", "nic-exterior": "Nicaragüense en el exterior",
    extranjero: "Extranjero"
  },
  documents: {
    confirmado: "Escritura inscrita", pendiente: "Trámite pendiente",
    desconocido: "Sin confirmar"
  }
} as const;

export function localDateTime(value?: Timestamp) {
  if (!value || typeof value.toDate !== "function") return "Fecha pendiente";
  return new Intl.DateTimeFormat("es-NI", {
    timeZone: "America/Managua",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value.toDate());
}
