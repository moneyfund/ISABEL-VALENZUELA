export type PaymentMode = "credito" | "contado";
export type PropertyType = "casa" | "apartamento" | "terreno" | "finca" | "local";
export type IncomeType = "asalariado" | "independiente" | "mixto" | "extranjero" | "no-comprobable";
export type ResidenceType = "nicaragua" | "nic-exterior" | "extranjero";
export type PropertyDocuments = "confirmado" | "pendiente" | "desconocido";

export interface GuideAnswers {
  payment: PaymentMode | null;
  property: PropertyType | null;
  income: IncomeType | null;
  residence: ResidenceType | null;
  documents: PropertyDocuments | null;
  identified: boolean | null;
  price: string;
  savings: string;
}
export interface ChecklistEntry { text: string; detail?: string; }
export interface GuideOutput {
  personal: ChecklistEntry[];
  property: ChecklistEntry[];
  finance: ChecklistEntry[];
  steps: string[];
  warnings: string[];
}
export const initialAnswers: GuideAnswers = {
  payment: null, property: null, income: null, residence: null,
  documents: null, identified: null, price: "", savings: ""
};
export const paymentOptions = [
  { value: "credito", title: "Con crédito", description: "Quiero consultar una opción de financiamiento." },
  { value: "contado", title: "De contado", description: "Dispongo de los fondos para comprar." }
] as const;
export const propertyOptions = [
  { value: "casa", title: "Casa" },
  { value: "apartamento", title: "Apartamento" },
  { value: "terreno", title: "Terreno o lote" },
  { value: "finca", title: "Finca" },
  { value: "local", title: "Local comercial" }
] as const;
export const incomeOptions = [
  { value: "asalariado", title: "Salario fijo", description: "Trabajo para una empresa o institución." },
  { value: "independiente", title: "Negocio propio", description: "Emprendo o trabajo por cuenta propia." },
  { value: "mixto", title: "Ingresos combinados", description: "Recibo salario y otros ingresos." },
  { value: "extranjero", title: "Ingresos del exterior", description: "Trabajo o percibo ingresos fuera de Nicaragua." },
  { value: "no-comprobable", title: "Sin soportes formales", description: "Aún no tengo documentos de ingresos." }
] as const;
export const residenceOptions = [
  { value: "nicaragua", title: "Resido en Nicaragua" },
  { value: "nic-exterior", title: "Nicaragüense en el extranjero" },
  { value: "extranjero", title: "Soy extranjero" }
] as const;
export const documentOptions = [
  { value: "confirmado", title: "Sí, tiene escritura inscrita" },
  { value: "pendiente", title: "No o está en trámite" },
  { value: "desconocido", title: "Todavía no lo sé" }
] as const;
export const propertyLabels: Record<PropertyType, string> = {
  casa: "casa", apartamento: "apartamento", terreno: "terreno",
  finca: "finca", local: "local comercial"
};
export const paymentLabels: Record<PaymentMode, string> = { credito: "con crédito", contado: "de contado" };

export function buildPurchaseGuide(input: GuideAnswers): GuideOutput {
  const personal: ChecklistEntry[] = [
    { text: "Documento de identidad vigente", detail: input.residence === "extranjero" ? "Pasaporte y documentos de residencia o identificación que correspondan." : "Cédula nicaragüense o pasaporte, según corresponda." },
    { text: "Información de contacto y datos para la escritura", detail: "El notario confirmará identidad, capacidad de comparecer y situación del comprador." }
  ];
  if (input.residence === "nic-exterior") personal.push(
    { text: "Documento de identidad vigente y coordinación de firma", detail: "Si no podés viajar, consultá con el notario la representación mediante poder válido y sus formalidades." }
  );
  if (input.residence === "extranjero") personal.push(
    { text: "Revisión jurídica antes de comprometer fondos", detail: "Solicitá al notario confirmar requisitos de identidad, representación y posibles restricciones aplicables al inmueble o ubicación." }
  );

  const property: ChecklistEntry[] = [
    { text: "Escritura antecedente y datos de inscripción", detail: "Verificar titularidad del vendedor y coincidencia de la finca registral." },
    { text: "Libertad de gravamen e historia registral actualizadas", detail: "Revisar hipotecas, embargos, anotaciones y limitaciones inscritas." },
    { text: "Solvencia municipal e información del IBI", detail: "Comprobar estado de obligaciones municipales y documentación exigida." },
    { text: "Plano y constancia o documentación catastral", detail: "Contrastar área, linderos y ubicación con la realidad física." },
    { text: "Visita e inspección del inmueble", detail: "Revisar estado, accesos, servicios, ocupación y correspondencia con lo anunciado." }
  ];
  if (input.property === "terreno" || input.property === "finca") property.push(
    { text: "Medición y revisión de linderos", detail: "Considerá apoyo de un topógrafo; verificá acceso, servidumbres y uso permitido." }
  );
  if (input.property === "finca") property.push(
    { text: "Condiciones rurales y uso del suelo", detail: "Confirmar acceso, disponibilidad de agua, derechos de terceros y restricciones ambientales o territoriales aplicables." }
  );
  if (input.property === "apartamento") property.push(
    { text: "Régimen de propiedad y gastos comunes", detail: "Consultar reglamento, obligaciones de condominio, cuotas y solvencia de administración cuando corresponda." }
  );
  if (input.property === "casa" || input.property === "local") property.push(
    { text: "Estado de construcción y permisos pertinentes", detail: "Un técnico debe revisar modificaciones, instalaciones y compatibilidad con el uso previsto cuando aplique." }
  );
  if (input.property === "local") property.push(
    { text: "Compatibilidad del uso comercial", detail: "Verificar zonificación, permisos y requisitos de la actividad con la alcaldía respectiva." }
  );

  const finance: ChecklistEntry[] = [];
  if (input.payment === "credito") {
    finance.push(
      { text: "Precalificación bancaria y evaluación de capacidad de pago", detail: "La entidad determinará plazo, tasa, prima, seguros y elegibilidad; esta guía no aprueba créditos." },
      { text: "Solicitud y autorización para consulta crediticia", detail: "El banco puede solicitar historial crediticio, identificación y datos de deudas vigentes." },
      { text: "Presupuesto de prima y gastos de formalización", detail: "Reservá fondos para prima, avalúo, honorarios, inscripción, impuestos y seguros según el banco y la operación." }
    );
    if (input.income === "asalariado" || input.income === "mixto") finance.push(
      { text: "Constancia salarial y respaldo laboral", detail: "Prepará antigüedad laboral, ingresos y colillas de pago/INSS cuando aplique." },
      { text: "Estados de cuenta bancarios recientes", detail: "Los bancos pueden solicitar entre tres y seis meses o un período diferente." }
    );
    if (input.income === "independiente" || input.income === "mixto") finance.push(
      { text: "Documentación de negocio o actividad independiente", detail: "RUC, matrícula municipal, declaraciones tributarias y/o certificación de ingresos según banco y régimen aplicable." },
      { text: "Movimientos y estados financieros", detail: "Reuní estados bancarios y financieros que acrediten ingresos recurrentes; el período depende de la entidad." }
    );
    if (input.income === "extranjero" || input.residence === "nic-exterior") finance.push(
      { text: "Soportes de ingresos y crédito del exterior", detail: "Pueden requerirse estados de cuenta, certificaciones laborales, declaraciones de impuestos y reporte crediticio del país de residencia." },
      { text: "Consulta sobre firma y fiador o representante local", detail: "Algunas instituciones solicitan documentación adicional para solicitantes en el exterior." }
    );
    if (input.income === "no-comprobable") finance.push(
      { text: "Plan para documentar los ingresos", detail: "Antes de solicitar financiamiento, consultá qué medios de acreditación acepta la institución; sin soportes puede ser difícil obtener aprobación." }
    );
    if (input.property === "terreno" || input.property === "finca" || input.property === "local") finance.push(
      { text: "Confirmación de financiamiento para este tipo de inmueble", detail: "No todos los productos hipotecarios financian terrenos, fincas o locales bajo las mismas condiciones de una vivienda." }
    );
    finance.push(
      { text: "Avalúo y revisión legal requeridos por el banco", detail: "La institución suele evaluar valor, garantías y documentación antes del desembolso." }
    );
  } else {
    finance.push(
      { text: "Disponibilidad y origen documentable de los fondos", detail: "Acordá con el notario y la entidad bancaria los soportes y la forma segura de transferir el dinero." },
      { text: "Reserva para gastos adicionales al precio", detail: "Considerá honorarios notariales, tributos aplicables, gestión catastral, registro y otras verificaciones." },
      { text: "Compraventa sujeta a revisión jurídica", detail: "El pago al contado no sustituye la verificación de dominio, gravámenes ni situación municipal." }
    );
    if (input.income === "no-comprobable") finance.push(
      { text: "Soporte del origen de fondos", detail: "Aunque compres de contado, pueden solicitar respaldo de procedencia conforme a la operación y a las obligaciones aplicables." }
    );
    if (input.residence === "nic-exterior") finance.push(
      { text: "Coordinación de fondos y representación", detail: "Consultá cómo transferir fondos y formalizar la firma desde el exterior, si corresponde." }
    );
  }

  const steps = [
    input.payment === "credito"
      ? "Definí presupuesto, prima disponible y consultá precalificación antes de comprometer la compra."
      : "Definí presupuesto completo, incluidos gastos y forma segura de pago.",
    input.identified === true
      ? "Solicitá la documentación de la propiedad que ya identificaste."
      : "Seleccioná y visitá inmuebles que coincidan con tu presupuesto y necesidades.",
    "Pedí a un notario una revisión de escritura, registro, gravámenes, catastro y solvencia municipal.",
    input.payment === "credito"
      ? "Gestioná avalúo, aprobación formal y condiciones del crédito; solo entonces cerrá los acuerdos definitivos."
      : "Negociá condiciones y dejá por escrito los términos y mecanismos de pago.",
    "Firmá la escritura pública ante notario, verificando identidad y facultades de quien vende.",
    "Realizá los trámites municipales, catastrales y fiscales aplicables; inscribí la escritura en el Registro Público.",
    "Solicitá los documentos inscritos y actualizá los datos municipales o catastrales que correspondan."
  ];
  const warnings: string[] = [];
  if (input.documents === "pendiente") warnings.push(
    "Atención: si no hay escritura inscrita o existen trámites pendientes, evitá entregar anticipos sin una evaluación legal independiente. La regularización puede requerir pasos adicionales."
  );
  if (input.documents === "desconocido") warnings.push(
    "Antes de entregar una reserva, confirmá la inscripción registral y revisá las cargas del inmueble con un notario."
  );
  if (input.payment === "credito" && input.income === "no-comprobable") warnings.push(
    "El crédito requiere valoración bancaria. Documentar ingresos es un paso prioritario; no es posible estimar elegibilidad con esta información."
  );
  if (input.property === "finca") warnings.push(
    "Para fincas, confirmá especialmente la situación de linderos, accesos, servidumbres y posibles restricciones territoriales."
  );
  const price = Number(input.price);
  const savings = Number(input.savings);
  if (input.payment === "credito" && input.price.trim() && input.savings.trim()
    && Number.isFinite(price) && Number.isFinite(savings) && price > 0 && savings >= 0) {
    if (savings > price) warnings.push("Tu prima ingresada supera el precio indicado. Verificá los montos antes de utilizar esta referencia.");
    else warnings.push(`Aporte indicado: ${(savings / price * 100).toFixed(1)}% del precio. Es solo un cálculo; cada banco define la prima mínima y el monto financiable según el inmueble y el avalúo.`);
  }
  return { personal, property, finance, steps, warnings };
}
