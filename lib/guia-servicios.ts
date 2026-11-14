import type { ChecklistEntry } from "@/lib/guia-compra";

export type ServiceGuideType = "venta" | "buscar-renta" | "ofrecer-renta";
export type GuideType = "compra" | ServiceGuideType;
export type ServiceAnswers = Record<string, string>;

type Choice = { value: string; title: string };
export type ServiceField = {
  key: string;
  label: string;
  step: 1 | 2;
  input: "choice" | "text" | "money" | "number";
  options?: readonly Choice[];
  placeholder?: string;
  hint?: string;
  optional?: boolean;
};

const choices = (values: readonly (readonly [string, string])[]): Choice[] =>
  values.map(([value,title]) => ({ value, title }));

const sellFields: ServiceField[] = [
  {key:"propertyType",label:"¿Qué tipo de propiedad querés vender?",step:1,input:"choice",options:choices([["casa","Casa"],["apartamento","Apartamento"],["terreno","Terreno"],["finca","Finca"],["local","Local comercial"]])},
  {key:"location",label:"¿En qué ciudad o sector está?",step:1,input:"text",placeholder:"Ej. Matagalpa, Nicaragua",hint:"Escribí solo ciudad o sector, no la dirección exacta."},
  {key:"documentStatus",label:"¿Está a tu nombre y tiene escritura inscrita?",step:1,input:"choice",options:choices([["inscrita","Sí, inscrita"],["tramite","Trámite pendiente"],["no-se","Necesito verificar"]])},
  {key:"mortgage",label:"¿Existen hipotecas u otras cargas?",step:2,input:"choice",options:choices([["libre","Sin cargas conocidas"],["hipoteca","Tiene hipoteca u otra carga"],["no-se","No estoy seguro"]])},
  {key:"occupancy",label:"¿Cuál es el estado de ocupación?",step:2,input:"choice",options:choices([["desocupada","Desocupada"],["habitada","Habitada por propietario"],["alquilada","Actualmente alquilada"]])},
  {key:"timing",label:"¿Cuándo te gustaría vender?",step:2,input:"choice",options:choices([["ahora","Lo antes posible"],["1-3","En 1 a 3 meses"],["explorando","Estoy evaluando opciones"]])},
  {key:"askingPrice",label:"Precio de venta aproximado (USD)",step:2,input:"money",placeholder:"Ej. 85000",optional:true}
];

const seekFields: ServiceField[] = [
  {key:"businessType",label:"¿Qué actividad tendrá el local?",step:1,input:"choice",options:choices([["comercio","Tienda o comercio"],["oficina","Oficina"],["gastronomia","Restaurante o cafetería"],["servicios","Servicios profesionales"],["bodega","Almacenamiento"],["otro","Otra actividad"]])},
  {key:"location",label:"¿En qué ciudad o zona buscás?",step:1,input:"text",placeholder:"Ej. Centro de Matagalpa"},
  {key:"size",label:"¿Qué superficie necesitás?",step:1,input:"choice",options:choices([["menos-50","Menos de 50 m²"],["50-150","Entre 50 y 150 m²"],["150-300","Entre 150 y 300 m²"],["mas-300","Más de 300 m²"],["flexible","Soy flexible"]])},
  {key:"monthlyBudget",label:"Presupuesto mensual aproximado (USD)",step:2,input:"money",placeholder:"Ej. 600",optional:true},
  {key:"startWhen",label:"¿Cuándo necesitás ocupar el local?",step:2,input:"choice",options:choices([["ahora","Inmediatamente"],["1-3","En 1 a 3 meses"],["flexible","Sin fecha definida"]])},
  {key:"businessStage",label:"¿En qué etapa está tu actividad?",step:2,input:"choice",options:choices([["establecido","Negocio ya operando"],["emprendimiento","Emprendimiento en preparación"],["otro","Otra situación"]])},
  {key:"leaseTerm",label:"¿Por cuánto tiempo pensás alquilar?",step:2,input:"choice",options:choices([["menos-ano","Menos de un año"],["1-3","De 1 a 3 años"],["mas-3","Más de 3 años"],["a-convenir","Por definir"]])}
];

const offerFields: ServiceField[] = [
  {key:"spaceType",label:"¿Qué espacio querés ofrecer en renta?",step:1,input:"choice",options:choices([["local","Local comercial"],["oficina","Oficina"],["bodega","Bodega"],["edificio","Edificio"],["otro","Otro espacio comercial"]])},
  {key:"location",label:"¿En qué ciudad o sector se encuentra?",step:1,input:"text",placeholder:"Ej. Barrio Guanuca, Matagalpa",hint:"No incluyás una dirección privada exacta."},
  {key:"area",label:"Superficie aproximada (m²)",step:1,input:"number",placeholder:"Ej. 120",optional:true},
  {key:"condition",label:"¿En qué estado se encuentra?",step:2,input:"choice",options:choices([["listo","Listo para entregar"],["adecuaciones","Necesita adecuaciones"],["ocupado","Actualmente ocupado"]])},
  {key:"titleStatus",label:"¿Podés acreditar la propiedad o autorización para alquilar?",step:2,input:"choice",options:choices([["si","Sí"],["tramite","Tengo trámites pendientes"],["no-se","Necesito orientación"]])},
  {key:"startWhen",label:"¿Cuándo estará disponible?",step:2,input:"choice",options:choices([["ahora","De inmediato"],["1-3","En 1 a 3 meses"],["flexible","Por confirmar"]])},
  {key:"services",label:"¿Cuenta con servicios básicos?",step:2,input:"choice",options:choices([["si","Agua y electricidad"],["parcial","Solo algunos"],["no","Aún no cuenta con ellos"]])},
  {key:"monthlyRent",label:"Renta mensual sugerida (USD)",step:2,input:"money",placeholder:"Ej. 500",optional:true}
];

export const guideCatalog = {
  compra: {name:"Compra",title:"Quiero comprar",subtitle:"Conocé cómo prepararte para comprar con crédito o de contado.",href:"/guias/compra",number:"01"},
  venta: {name:"Venta",title:"Quiero vender",subtitle:"Prepará tu propiedad, revisá su documentación y definí el camino para vender.",href:"/guias/venta",number:"02"},
  "buscar-renta": {name:"Buscar renta",title:"Busco un local en renta",subtitle:"Definí qué espacio necesita tu negocio y qué revisar antes de alquilar.",href:"/guias/buscar-renta",number:"03"},
  "ofrecer-renta": {name:"Ofrecer renta",title:"Quiero alquilar mi local",subtitle:"Organizá la información de tu espacio comercial para ofrecerlo en renta.",href:"/guias/ofrecer-renta",number:"04"}
} as const;

export const serviceGuideConfig: Record<ServiceGuideType,{
  title:string; heading:string; subtitle:string; stepTitles:readonly [string,string];
  fields:readonly ServiceField[]; categoryLabel:string
}> = {
  venta:{title:"Guía para vender",heading:"Prepará tu propiedad para vender.",subtitle:"Respondé unas preguntas y conocé qué documentos y pasos conviene revisar.",stepTitles:["Tu propiedad","Tu plan de venta"],fields:sellFields,categoryLabel:"Venta de propiedad"},
  "buscar-renta":{title:"Guía para buscar renta",heading:"Encontrá un local adecuado.",subtitle:"Contanos qué espacio necesita tu actividad para orientarte sobre el alquiler.",stepTitles:["El local que buscás","Tu proyecto"],fields:seekFields,categoryLabel:"Búsqueda de local"},
  "ofrecer-renta":{title:"Guía para ofrecer renta",heading:"Prepará tu local para alquilar.",subtitle:"Organizá las condiciones y la documentación antes de ofrecer tu inmueble.",stepTitles:["Tu inmueble","Condiciones de renta"],fields:offerFields,categoryLabel:"Oferta de local"}
};

export type ServiceGuideResult = {
  groups: {title:string;items:ChecklistEntry[]}[];
  steps:string[];
  warnings:string[];
};

export function serviceAnswerDisplay(kind:ServiceGuideType,values:ServiceAnswers) {
  return serviceGuideConfig[kind].fields.map(field=>({
    label:field.label,
    value: field.input==="choice"
      ? (field.options?.find(option=>option.value===values[field.key])?.title || "Sin respuesta")
      : field.input==="money"
        ? (values[field.key] ? "US$ "+Number(values[field.key]).toLocaleString("es-NI") : "No indicado")
        : field.input==="number"
          ? (values[field.key] ? values[field.key]+" m²" : "No indicado")
          : (values[field.key] || "No indicado")
  }));
}

export function serviceAnswerValid(kind:ServiceGuideType,values:ServiceAnswers):boolean {
  return serviceGuideConfig[kind].fields.every(field=>{
    const value=(values[field.key]||"").trim();
    if(!value) return !!field.optional;
    if(field.input==="choice") return !!field.options?.some(option=>option.value===value);
    if(field.input==="text") return value.length>=2 && value.length<=120 && !/[<>\\\n\r]/.test(value);
    if(field.input==="money" || field.input==="number") {
      const n=Number(value);
      return Number.isFinite(n) && n>0 && n<=100000000;
    }
    return false;
  });
}

export function normalizedServiceAnswers(kind:ServiceGuideType,values:ServiceAnswers):Record<string,string|number|null> {
  if(!serviceAnswerValid(kind,values)) throw new Error("Revisá las respuestas del formulario.");
  return Object.fromEntries(serviceGuideConfig[kind].fields.map(field=>[
    field.key,
    field.input==="money" || field.input==="number"
      ? (values[field.key]?.trim()?Number(values[field.key]):null)
      : values[field.key].trim().replace(/\s+/g," ")
  ]));
}

const entry=(text:string,detail?:string):ChecklistEntry=>({text,detail});

export function buildServiceGuide(kind:ServiceGuideType, a:ServiceAnswers):ServiceGuideResult {
  if(kind==="venta") {
    const warnings:string[]=[];
    if(a.documentStatus!=="inscrita") warnings.push("Antes de aceptar una reserva, pedí a un notario verificar la titularidad, inscripción y trámites pendientes.");
    if(a.mortgage!=="libre") warnings.push("Confirmá las cargas en el Registro Público y definí con asesoría legal cómo se cancelarían al vender.");
    if(a.occupancy==="alquilada") warnings.push("Revisá el contrato vigente y los derechos del arrendatario antes de prometer la entrega.");
    return {
      groups:[
        {title:"Documentación inicial",items:[
          entry("Identificación del propietario y facultades para vender."),
          entry("Escritura inscrita y certificación registral actualizada."),
          entry("Plano, datos catastrales y coincidencia de linderos."),
          entry("Solvencia municipal del IBI y comprobantes que correspondan."),
          ...(a.documentStatus!=="inscrita"?[entry("Revisión previa de inscripción o titularidad con notario.")]:[])
        ]},
        {title:"Preparación comercial",items:[
          entry("Inspección del estado del inmueble y fotografías actuales."),
          entry("Valoración de mercado y precio de publicación sustentado."),
          entry("Condiciones de comercialización, visitas y posible negociación."),
          ...(a.occupancy==="alquilada"?[entry("Disponibilidad para visitas y situación del arrendamiento actual.")]:[])
        ]},
        {title:"Formalización de la venta",items:[
          entry("Revisión notarial de gravámenes, poderes y antecedentes."),
          entry("Definición de gastos, impuestos y documentación de traspaso según el caso."),
          entry("Escritura pública, pagos aplicables e inscripción del comprador.")
        ]}
      ],
      steps:[
        "Reuní documentos de propiedad y verificá la inscripción.",
        "Solicitá una valoración y definí condiciones de venta con Isabel.",
        "Prepará material comercial y coordiná visitas seguras.",
        "Evaluá ofertas y acordá reservas sujetas a revisión jurídica.",
        "Formalizá con notario, completá trámites y entregá el inmueble conforme a lo pactado."
      ],warnings
    };
  }
  if(kind==="buscar-renta") {
    const warnings:string[]=[];
    if(a.businessType==="gastronomia")warnings.push("Antes de firmar, confirmá ventilación, extracción, agua, saneamiento y permisos aplicables a alimentos.");
    if(a.startWhen==="ahora")warnings.push("No entregués depósitos sin inspección, confirmación de facultades del arrendador y contrato revisado.");
    return {
      groups:[
        {title:"Antes de buscar",items:[
          entry("Presupuesto mensual y reserva para depósito, adecuaciones y servicios."),
          entry("Actividad comercial prevista y necesidades de área, ubicación y acceso."),
          entry("Documentación de identidad y, cuando aplique, del negocio o representante.")
        ]},
        {title:"Revisión del local",items:[
          entry("Estado físico, instalaciones eléctricas, agua, accesos y seguridad."),
          entry("Compatibilidad del uso comercial y permisos municipales o sectoriales que correspondan."),
          entry("Verificación de la identidad y facultades de quien ofrece el inmueble."),
          entry("Condiciones de entrega y responsabilidades por adecuaciones.")
        ]},
        {title:"Contrato y costos",items:[
          entry("Monto, moneda, depósito, forma de pago y ajustes de renta."),
          entry("Plazo, renovación, rescisión, subarriendo y obligaciones de mantenimiento."),
          entry("Inventario, acta de entrega y lectura de medidores cuando corresponda.")
        ]}
      ],
      steps:[
        "Definí necesidades, ubicación y presupuesto realista.",
        "Compará locales con Isabel y programá inspecciones.",
        "Confirmá que el local permita la actividad comercial prevista.",
        "Revisá condiciones y contrato de arrendamiento antes de entregar dinero.",
        "Documentá pagos, inventario y entrega del local."
      ],warnings
    };
  }
  const warnings:string[]=[];
  if(a.titleStatus!=="si")warnings.push("Antes de ofrecer el espacio, confirmá que tenés derecho o autorización válida para arrendarlo.");
  if(a.condition!=="listo")warnings.push("Acordá por escrito reparaciones y adecuaciones, indicando responsable y fechas.");
  if(a.services!=="si")warnings.push("Verificá instalaciones y responsabilidades por conexión o mejora de servicios.");
  return {
    groups:[
      {title:"Documentos del propietario",items:[
        entry("Identificación y escritura o autorización válida para arrendar."),
        entry("Información sobre gravámenes o restricciones contractuales."),
        entry("Situación de servicios y obligaciones municipales pertinentes.")
      ]},
      {title:"Presentación y condiciones",items:[
        entry("Descripción real, metraje, fotos y estado actual del local."),
        entry("Renta propuesta, depósito, plazo y fecha de disponibilidad."),
        entry("Uso comercial permitido, adecuaciones y condiciones de acceso."),
        entry("Inventario, servicios incluidos y obligaciones de mantenimiento.")
      ]},
      {title:"Selección y contrato",items:[
        entry("Verificar identidad y actividad del potencial arrendatario."),
        entry("Acordar garantías, pagos, duración, renovaciones y terminación."),
        entry("Dejar por escrito inventario, estado y entrega del inmueble.")
      ]}
    ],
    steps:[
      "Confirmá titularidad o autorización para arrendar.",
      "Revisá las instalaciones y definí mejoras pendientes.",
      "Definí condiciones de renta y prepará la publicación con Isabel.",
      "Evaluá interesados y negociá condiciones claramente.",
      "Formalizá el contrato y documentá entrega e inventario."
    ],warnings
  };
}
