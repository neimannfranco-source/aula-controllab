"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjufnjnijkzypnktdxql.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdWZuam5pamt6eXBua3RkeHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzUyMjgsImV4cCI6MjA4OTUxMTIyOH0.VWEtmhvSB8Crtjf2vcoFMJaIiDQ5ejkaQB1B2zEBnbw";
const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const DB_ROW_ID = "global-app-state";
const PROFESSOR_PASSWORD = "controllab2025";

// ─── Types ────────────────────────────────────────────────────────────────────
type VocabItem = { es: string; pt: string };
type QuizQuestion = { question: string; options: string[]; answer: string };
type ModuleType = {
  id: string; title: string; level: string; category: string; emoji: string;
  description: string; readingTitle: string; reading: string[];
  vocab: VocabItem[]; quiz: QuizQuestion[]; dictation: string;
};
type Student = { id: string; name: string; code: string };
type ModuleProgress = { completed: boolean; score: number; total: number; attempts: number };
type DictationResult = { exact: boolean; score: number; written: string; expected: string; updatedAt: string };
type AppState = {
  students: Student[]; currentStudentId: string | null;
  progress: Record<string, Record<string, ModuleProgress>>;
  dictations: Record<string, Record<string, DictationResult>>;
};
type LoadStatus = "loading" | "ready" | "error";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       "#060b14",
  bg2:      "#0c1220",
  bg3:      "#111827",
  surface:  "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.055)",
  border:   "rgba(255,255,255,0.07)",
  borderA:  "rgba(45,212,191,0.30)",
  teal:     "#2dd4bf",
  tealDim:  "#0d9488",
  tealGlow: "rgba(45,212,191,0.12)",
  text:     "#f1f5f9",
  textMid:  "#94a3b8",
  textDim:  "#475569",
  green:    "#34d399",
  yellow:   "#fbbf24",
  red:      "#fb7185",
  redDim:   "rgba(251,113,133,0.12)",
  redBorder:"rgba(251,113,133,0.25)",
};

const FONT_BODY = "'DM Sans', system-ui, sans-serif";
const FONT_MONO = "'DM Mono', 'JetBrains Mono', monospace";
const FONT_DISPLAY = "'Syne', 'DM Sans', system-ui, sans-serif";

// Shared style objects
const glassCard = (active = false): React.CSSProperties => ({
  background: active ? C.tealGlow : C.surface,
  border: `1px solid ${active ? C.borderA : C.border}`,
  borderRadius: 16,
});

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: C.bg2,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "12px 16px",
  color: C.text,
  fontSize: 14,
  fontFamily: FONT_BODY,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const btnPrimary: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.teal}, ${C.tealDim})`,
  color: "#042f2e",
  border: "none",
  borderRadius: 12,
  padding: "11px 24px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONT_BODY,
  letterSpacing: "0.01em",
  transition: "opacity 0.15s",
};

const btnGhost: React.CSSProperties = {
  background: "transparent",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "7px 14px",
  fontSize: 13,
  color: C.textMid,
  cursor: "pointer",
  fontFamily: FONT_BODY,
  transition: "all 0.15s",
};

const btnDanger: React.CSSProperties = {
  background: C.redDim,
  border: `1px solid ${C.redBorder}`,
  borderRadius: 10,
  padding: "7px 14px",
  fontSize: 12,
  color: C.red,
  cursor: "pointer",
  fontFamily: FONT_BODY,
};

function catColor(cat: string): string {
  const m: Record<string, string> = {
    Laboratorio: "#60a5fa",
    Gestión: "#f472b6",
    Comunicación: "#fb923c",
    Tecnología: "#a78bfa",
    Gramática: "#facc15",
    Controllab: C.teal,
  };
  return m[cat] || C.textMid;
}

function catBg(cat: string): string {
  const m: Record<string, string> = {
    Laboratorio: "rgba(96,165,250,0.1)",
    Gestión: "rgba(244,114,182,0.1)",
    Comunicación: "rgba(251,146,60,0.1)",
    Tecnología: "rgba(167,139,250,0.1)",
    Gramática: "rgba(250,204,21,0.1)",
    Controllab: "rgba(45,212,191,0.1)",
  };
  return m[cat] || "rgba(255,255,255,0.05)";
}

// ─── Module Data (unchanged) ──────────────────────────────────────────────────
const MODULES: ModuleType[] = [
// ══ LABORATORIO ══
{
  id: "control-interno", title: "Control interno", level: "Intermedio", category: "Laboratorio", emoji: "🔬",
  description: "Monitoreo analítico, tendencias y decisiones preventivas.",
  readingTitle: "Una desviación que parecía pequeña",
  reading: [
    "Durante una revisión de rutina en el laboratorio de bioquímica, el equipo técnico detectó una desviación en los controles internos de uno de los analitos más procesados de la semana. A primera vista, la diferencia parecía mínima: apenas unos pocos puntos por encima del límite de advertencia establecido en el gráfico de Levey-Jennings. Sin embargo, al comparar los datos actuales con los registros históricos del mes anterior, la imagen fue mucho más preocupante: la tendencia se repetía desde hacía cinco días consecutivos, siempre en la misma dirección.",
    "La supervisora del turno decidió pausar la emisión de resultados y reunir al equipo para hacer una revisión sistemática. Examinaron con detalle los materiales de control utilizados, incluyendo los viales abiertos y los lotes en stock. Revisaron las curvas de calibración recientes y también inspeccionaron los lotes de reactivos en uso.",
    "Después de analizar toda esa información, concluyeron que la causa más probable era una combinación entre una variación dentro del lote del reactivo principal y una calibración que ya no representaba con suficiente precisión el desempeño real del método. Esta es una situación más difícil de detectar que una falla obvia, pero también más frecuente en la práctica diaria.",
    "Como medida preventiva inmediata, suspendieron la liberación de los resultados de ese analito correspondientes a las últimas doce horas. Repitieron las corridas con material de control fresco proveniente de un vial diferente y realizaron una recalibración completa del equipo.",
    "El caso fue documentado como un incidente de calidad y se presentó en la reunión mensual como ejemplo de buena práctica. Se decidió actualizar el procedimiento para incluir una alerta automática cuando tres puntos consecutivos superen el límite de advertencia en la misma dirección.",
  ],
  vocab: [
    { es: "control interno", pt: "controle interno" },
    { es: "desviación", pt: "desvio" },
    { es: "liberación de resultados", pt: "liberação de resultados" },
    { es: "reactivo", pt: "reagente" },
    { es: "tendencia", pt: "tendência" },
    { es: "corrida analítica", pt: "corrida analítica" },
  ],
  quiz: [
    { question: "¿Qué detectó el equipo técnico durante la revisión de rutina?", options: ["Un error en la facturación", "Una desviación en los controles internos", "Una falla en el refrigerador", "Un vial de control vacío"], answer: "Una desviación en los controles internos" },
    { question: "¿Cuántos días llevaba repitiéndose la tendencia?", options: ["Un día", "Dos días", "Cinco días consecutivos", "Todo el mes"], answer: "Cinco días consecutivos" },
    { question: "¿Qué elementos revisó el equipo en la investigación?", options: ["Solo los reactivos", "Reactivos, calibración, controles y almacenamiento", "Solo el equipo analítico", "Solo los registros del mes anterior"], answer: "Reactivos, calibración, controles y almacenamiento" },
    { question: "¿Cuál fue la causa identificada?", options: ["Falla total del equipo", "Variación del reactivo y calibración desactualizada combinadas", "Error del operador", "Muestra contaminada"], answer: "Variación del reactivo y calibración desactualizada combinadas" },
    { question: "¿Qué hicieron como medida preventiva inmediata?", options: ["Cambiaron al personal", "Suspendieron la liberación de algunos resultados y repitieron corridas", "Descartaron el equipamiento", "Cerraron el laboratorio"], answer: "Suspendieron la liberación de algunos resultados y repitieron corridas" },
    { question: "¿Qué mejora preventiva se implementó en el procedimiento?", options: ["Eliminar los controles internos", "Alerta cuando tres puntos consecutivos superen el límite en la misma dirección", "Reducir la frecuencia de los controles", "Cambiar de proveedor de reactivos"], answer: "Alerta cuando tres puntos consecutivos superen el límite en la misma dirección" },
    { question: "¿Por qué es importante identificar tendencias antes del límite de rechazo?", options: ["Para reducir reuniones", "Para evitar errores mayores antes de que ocurran y proteger la calidad", "Para eliminar controles", "Para justificar más personal"], answer: "Para evitar errores mayores antes de que ocurran y proteger la calidad" },
    { question: "¿Qué diferencia hay entre un límite de advertencia y un límite de rechazo?", options: ["Son lo mismo pero con nombres distintos", "El de advertencia es una señal temprana de alerta; el de rechazo obliga a detener la corrida", "Solo existe el límite de rechazo en la práctica", "El de advertencia aplica solo al control de nivel bajo"], answer: "El de advertencia es una señal temprana de alerta; el de rechazo obliga a detener la corrida" },
    { question: "¿Por qué una variación dentro del lote de reactivo es difícil de detectar?", options: ["Porque no existe esa variación en la práctica real", "Porque el lote parece correcto pero tiene inconsistencia interna, que el control puede tardar en mostrar", "Porque el equipo analítico la oculta automáticamente", "Porque solo afecta resultados de pacientes pediátricos"], answer: "Porque el lote parece correcto pero tiene inconsistencia interna, que el control puede tardar en mostrar" },
    { question: "¿Qué se entiende por 'corrida analítica' en el contexto del control interno?", options: ["El turno completo de trabajo del laboratorio", "El conjunto de muestras y controles procesados bajo las mismas condiciones analíticas en un período definido", "Solo los controles de calidad sin incluir muestras de pacientes", "El proceso de calibración del equipo"], answer: "El conjunto de muestras y controles procesados bajo las mismas condiciones analíticas en un período definido" },
    { question: "¿Qué información debe incluir la documentación del incidente de calidad?", options: ["Solo el resultado fuera de rango", "Descripción del hallazgo, causa identificada, acciones tomadas y resultados afectados", "Solo el nombre del analista responsable", "Solo la fecha y hora del incidente"], answer: "Descripción del hallazgo, causa identificada, acciones tomadas y resultados afectados" },
    { question: "¿Cuándo debe repetirse un control interno con material de un vial diferente?", options: ["Siempre, en cada corrida analítica", "Cuando se sospecha que el vial actual puede ser el origen del problema", "Solo cuando el resultado está fuera del límite de rechazo", "Solo al inicio de cada turno de trabajo"], answer: "Cuando se sospecha que el vial actual puede ser el origen del problema" },
    { question: "¿Por qué el control interno complementa pero no reemplaza al ensayo de aptitud (EA) externo?", options: ["Son exactamente lo mismo y solo difieren en el nombre", "El control interno evalúa reproducibilidad interna; el EA externo compara el resultado con otros laboratorios", "El ensayo externo es más preciso y reemplaza al control interno", "El control interno ya incluye la comparación con otros laboratorios"], answer: "El control interno evalúa reproducibilidad interna; el EA externo compara el resultado con otros laboratorios" },
  ],
  dictation: "El equipo detectó una desviación en los controles internos y suspendió la liberación de resultados para proteger la calidad del proceso.",
},
{
  id: "westgard", title: "Reglas de Westgard", level: "Intermedio", category: "Laboratorio", emoji: "📊",
  description: "Análisis de reglas y toma de decisiones estadísticas en el laboratorio.",
  readingTitle: "Una alerta en el turno de la mañana",
  reading: [
    "Un lunes a las siete de la mañana, durante la revisión inicial de los controles internos del turno, una analista notó que los valores del control de nivel medio, al mirar la secuencia de los últimos seis puntos en el gráfico de Levey-Jennings, todos caían por debajo de la media. Ese patrón, conocido como regla 6x, indica que algo está cambiando de forma sistemática en el proceso analítico.",
    "Las reglas de Westgard son un conjunto de criterios estadísticos desarrollados por el Dr. James Westgard en los años setenta para ayudar a los laboratorios a distinguir entre variación aleatoria, que es inherente a todo proceso de medición, y variación sistemática, que indica un problema real.",
    "Entre las reglas más utilizadas se encuentran la 13s, que es una regla de advertencia cuando un control supera tres desviaciones estándar; la 22s, que rechaza la corrida cuando dos controles consecutivos superan dos desviaciones en la misma dirección; la R4s, que detecta errores aleatorios grandes; y la 41s, que señala errores sistemáticos.",
    "En el caso del turno de la mañana, la analista aplicó correctamente la regla 6x y decidió investigar. Repitió los controles con material de un vial diferente y verificó si la temperatura del equipo había fluctuado durante la noche, encontrando una leve variación.",
    "Comprender las reglas de Westgard es una herramienta de razonamiento analítico que permite actuar con criterio. Un laboratorio que las aplica correctamente demuestra madurez técnica y capacidad para justificar sus decisiones frente a auditorías.",
  ],
  vocab: [
    { es: "regla de advertencia", pt: "regra de alerta" },
    { es: "media", pt: "média" },
    { es: "precisión", pt: "precisão" },
    { es: "rechazar la corrida", pt: "rejeitar a corrida" },
    { es: "error sistemático", pt: "erro sistemático" },
    { es: "variación aleatoria", pt: "variação aleatória" },
  ],
  quiz: [
    { question: "¿Qué patrón observó la analista en el gráfico de Levey-Jennings?", options: ["Valores fuera del límite de rechazo", "Seis puntos consecutivos por debajo de la media", "Dos valores muy elevados", "Un valor imposiblemente alto"], answer: "Seis puntos consecutivos por debajo de la media" },
    { question: "¿Qué indica la regla 6x?", options: ["Que hay un error aleatorio grande", "Que algo está cambiando sistemáticamente aunque no sea urgente aún", "Que la corrida debe rechazarse inmediatamente", "Que el reactivo está vencido"], answer: "Que algo está cambiando sistemáticamente aunque no sea urgente aún" },
    { question: "¿Para qué sirven las reglas de Westgard?", options: ["Para eliminar los controles", "Para distinguir entre variación aleatoria y errores sistemáticos", "Para acelerar el procesamiento", "Para reducir costos"], answer: "Para distinguir entre variación aleatoria y errores sistemáticos" },
    { question: "¿Qué indica la regla 22s?", options: ["Un control supera 3 desviaciones estándar", "Dos controles consecutivos superan 2 desviaciones en la misma dirección", "Cuatro puntos del mismo lado de la media", "La diferencia entre dos controles supera 4 desviaciones"], answer: "Dos controles consecutivos superan 2 desviaciones en la misma dirección" },
    { question: "¿Qué tipo de error detecta la regla R4s?", options: ["Error sistemático", "Error aleatorio grande", "Tendencia sostenida", "Error de calibración"], answer: "Error aleatorio grande" },
    { question: "¿Qué hizo la analista antes de decidir sobre la corrida?", options: ["La rechazó inmediatamente sin investigar", "Investigó repitiendo con vial diferente y verificando temperatura", "Llamó al proveedor del reactivo", "Esperó al día siguiente"], answer: "Investigó repitiendo con vial diferente y verificando temperatura" },
    { question: "¿Qué encontraron al investigar la causa del patrón?", options: ["El reactivo estaba vencido", "Una fluctuación de temperatura durante la noche", "Un error del operador", "Una calibración incorrecta"], answer: "Una fluctuación de temperatura durante la noche" },
    { question: "¿Qué valor aporta aplicar correctamente las reglas de Westgard?", options: ["Permite trabajar sin controles", "Demuestra madurez técnica y permite justificar decisiones ante auditorías", "Reduce el tiempo de procesamiento", "Elimina la necesidad de calibrar"], answer: "Demuestra madurez técnica y permite justificar decisiones ante auditorías" },
    { question: "¿Cuándo fue desarrollado el sistema de reglas de Westgard?", options: ["En la década de 1950", "En los años setenta por el Dr. James Westgard", "En la década de 1990", "En el año 2000 como parte de la norma ISO"], answer: "En los años setenta por el Dr. James Westgard" },
    { question: "¿Qué diferencia a un error sistemático de uno aleatorio?", options: ["Son idénticos en su efecto sobre los resultados", "El sistemático afecta todos los resultados en la misma dirección; el aleatorio es impredecible y variable", "El aleatorio es siempre mayor que el sistemático", "El sistemático solo ocurre con equipos viejos"], answer: "El sistemático afecta todos los resultados en la misma dirección; el aleatorio es impredecible y variable" },
    { question: "¿Qué regla se usa como señal de advertencia antes de rechazar la corrida?", options: ["22s directamente", "13s como regla de advertencia que activa la búsqueda de otros patrones", "R4s como primera señal", "6x como única regla válida"], answer: "13s como regla de advertencia que activa la búsqueda de otros patrones" },
    { question: "¿Por qué es importante documentar la decisión tomada ante un patrón de Westgard?", options: ["Solo por exigencia burocrática", "Para justificar técnicamente la acción ante auditorías internas y externas", "Para calcular el costo del reactivo utilizado", "Solo si la corrida fue rechazada"], answer: "Para justificar técnicamente la acción ante auditorías internas y externas" },
    { question: "¿Qué relación tienen las reglas de Westgard con la métrica sigma?", options: ["No tienen ninguna relación", "A mayor sigma del método, se pueden usar reglas más simples con menor frecuencia de controles", "A mayor sigma, se necesitan más reglas de control simultáneas", "Solo se usan en laboratorios con acreditación ISO"], answer: "A mayor sigma del método, se pueden usar reglas más simples con menor frecuencia de controles" },
  ],
  dictation: "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras y a justificar técnicamente cada acción del laboratorio.",
},
{
  id: "hemograma", title: "Hemograma completo", level: "Intermedio", category: "Laboratorio", emoji: "🩸",
  description: "Interpretación clínica y comunicación de resultados hematológicos.",
  readingTitle: "Los números que cuentan la historia",
  reading: [
    "El hemograma completo es uno de los análisis más solicitados en cualquier laboratorio clínico. Proporciona datos sobre tres grandes líneas celulares: los eritrocitos, cuya función principal es transportar oxígeno; los leucocitos, que son los principales actores del sistema inmune; y las plaquetas, responsables de la hemostasia primaria.",
    "Cuando el analista revisa un hemograma, no solo verifica si los valores individuales están dentro del rango de referencia. También evalúa la coherencia interna del informe: ¿son consistentes entre sí el hematocrito, la hemoglobina y el recuento de glóbulos rojos?",
    "Un aspecto crítico es la detección de valores de pánico o resultados críticos. Un recuento de glóbulos blancos extremadamente elevado con morfología anormal puede orientar hacia una leucemia aguda y requiere comunicación urgente al médico.",
    "Los factores preanalíticos son otra fuente importante de variación. La hemólisis puede elevar falsamente la hemoglobina libre. Una muestra con microcoágulos puede dar un recuento de plaquetas falsamente bajo.",
    "Comunicar un hemograma de forma útil al médico implica identificar cuáles hallazgos son clínicamente relevantes, cuáles son urgentes y cuáles pueden incluirse como observación en el informe escrito.",
  ],
  vocab: [
    { es: "hemograma", pt: "hemograma" },
    { es: "glóbulo rojo / eritrocito", pt: "glóbulo vermelho / eritrócito" },
    { es: "glóbulo blanco / leucocito", pt: "glóbulo branco / leucócito" },
    { es: "plaqueta", pt: "plaqueta" },
    { es: "valor crítico / pánico", pt: "valor crítico / pânico" },
    { es: "frotis de sangre", pt: "esfregaço de sangue" },
  ],
  quiz: [
    { question: "¿Qué tres líneas celulares evalúa el hemograma completo?", options: ["Glucosa, colesterol y triglicéridos", "Eritrocitos, leucocitos y plaquetas", "Sodio, potasio y cloro", "TGO, TGP y bilirrubina"], answer: "Eritrocitos, leucocitos y plaquetas" },
    { question: "¿Cuál es la función principal de los eritrocitos?", options: ["Defender contra infecciones", "Transportar oxígeno a los tejidos", "Controlar la coagulación", "Producir anticuerpos"], answer: "Transportar oxígeno a los tejidos" },
    { question: "¿Qué evalúa el analista además de los valores individuales?", options: ["Solo si están dentro del rango", "La coherencia interna y la consistencia con el cuadro clínico", "Solo el recuento total de células", "Solo el resultado más urgente"], answer: "La coherencia interna y la consistencia con el cuadro clínico" },
    { question: "¿Qué puede indicar un recuento de leucocitos muy elevado con morfología anormal?", options: ["Una infección bacteriana común", "Una posible leucemia aguda que requiere comunicación urgente", "Un valor normal por la edad del paciente", "Una hemólisis de la muestra"], answer: "Una posible leucemia aguda que requiere comunicación urgente" },
    { question: "¿Qué puede causar microcoágulos invisibles en la muestra?", options: ["Aumentar la hemoglobina medida", "Un recuento de plaquetas falsamente bajo", "Elevar los glóbulos blancos", "No tienen ningún efecto conocido"], answer: "Un recuento de plaquetas falsamente bajo" },
    { question: "¿Qué efecto tiene la lipemia sobre la medición del hemograma?", options: ["Aumenta falsamente las plaquetas", "Interfiere con la medición fotométrica de la hemoglobina", "Reduce el recuento de glóbulos rojos", "No tiene efectos conocidos"], answer: "Interfiere con la medición fotométrica de la hemoglobina" },
    { question: "¿Cuándo debe comunicarse un resultado crítico al médico?", options: ["Al día siguiente por correo electrónico", "Antes de liberar el informe formal, por teléfono", "Solo si el médico lo solicita expresamente", "Al finalizar el turno de trabajo"], answer: "Antes de liberar el informe formal, por teléfono" },
    { question: "¿Qué distingue a un analista que agrega valor al hemograma?", options: ["Que procesa más muestras por hora", "Que identifica hallazgos relevantes y colabora en el proceso diagnóstico", "Que usa el equipo más moderno disponible", "Que entrega el informe más rápido"], answer: "Que identifica hallazgos relevantes y colabora en el proceso diagnóstico" },
    { question: "¿Para qué sirve el frotis de sangre periférica en el contexto del hemograma?", options: ["Para medir la hemoglobina directamente", "Para evaluar morfología celular que los contadores automáticos no pueden determinar", "Para reemplazar el recuento automático", "Solo para pacientes pediátricos"], answer: "Para evaluar morfología celular que los contadores automáticos no pueden determinar" },
    { question: "¿Qué índices eritrocitarios se calculan a partir del hemograma?", options: ["Solo la hemoglobina y el hematocrito", "VCM, HCM y CHCM que orientan el tipo de anemia", "Solo el recuento de eritrocitos", "TGO y TGP"], answer: "VCM, HCM y CHCM que orientan el tipo de anemia" },
    { question: "¿Qué diferencia a una trombocitopenia real de una pseudotrombocitopenia?", options: ["No existe esa diferencia", "La pseudotrombocitopenia es un artefacto por agregación plaquetaria in vitro, no una condición real del paciente", "La pseudotrombocitopenia es siempre más grave", "Solo puede determinarse con un segundo análisis en tres días"], answer: "La pseudotrombocitopenia es un artefacto por agregación plaquetaria in vitro, no una condición real del paciente" },
    { question: "¿Cuándo debe el analista realizar un frotis aunque el equipo no lo haya marcado como alarma?", options: ["Nunca, confiar siempre en el equipo automático", "Cuando el contexto clínico sugiere una patología que el equipo puede no detectar", "Solo cuando el médico lo solicita explícitamente", "Solo en pacientes oncológicos"], answer: "Cuando el contexto clínico sugiere una patología que el equipo puede no detectar" },
    { question: "¿Por qué los rangos de referencia del hemograma varían según edad y sexo?", options: ["Solo por convención estadística sin base fisiológica", "Porque la producción de células sanguíneas y los niveles normales de hemoglobina difieren según edad, sexo y estado fisiológico", "Porque los equipos se calibran diferente para cada grupo", "Solo varían en pacientes pediátricos"], answer: "Porque la producción de células sanguíneas y los niveles normales de hemoglobina difieren según edad, sexo y estado fisiológico" },
  ],
  dictation: "El analista debe identificar los resultados críticos del hemograma y comunicarlos al médico antes de liberar el informe formal.",
},
{
  id: "no-conformidades", title: "No conformidades y CAPA", level: "Intermedio", category: "Gestión", emoji: "⚠️",
  description: "Detección, análisis de causa raíz y acciones correctivas y preventivas.",
  readingTitle: "El mismo error dos veces",
  reading: [
    "El área de calidad registró una nueva no conformidad relacionada con un error en el etiquetado de muestras durante el proceso de recepción. Al revisar el historial, el equipo encontró un incidente casi idéntico registrado seis meses antes, cerrado con una nota de 'informado al personal' pero sin ninguna acción correctiva formal.",
    "La situación planteaba una pregunta necesaria: ¿por qué el mismo error había ocurrido dos veces? Informar verbalmente al personal puede generar conciencia momentánea, pero sin un cambio en el proceso, el sistema sigue siendo igualmente vulnerable.",
    "Esta vez, el equipo decidió aplicar un análisis formal de causa raíz usando la técnica de los '5 Por qué'. La causa raíz identificada fue que el procedimiento escrito estaba desactualizado y no reflejaba el flujo real del proceso.",
    "Con la causa raíz identificada, el equipo diseñó una CAPA que incluía la actualización del procedimiento y un control de doble verificación.",
    "A los treinta días de implementadas las acciones, el indicador mostró una reducción del ochenta por ciento en no conformidades relacionadas con el proceso de recepción.",
  ],
  vocab: [
    { es: "no conformidad", pt: "não conformidade" },
    { es: "acción correctiva", pt: "ação corretiva" },
    { es: "acción preventiva", pt: "ação preventiva" },
    { es: "causa raíz", pt: "causa raiz" },
    { es: "verificación de eficacia", pt: "verificação de eficácia" },
    { es: "CAPA", pt: "CAPA" },
  ],
  quiz: [
    { question: "¿Cuándo había ocurrido un incidente similar anteriormente?", options: ["Nunca había ocurrido antes", "Seis meses antes, cerrado sin acción correctiva real", "Un año antes con acción correctiva documentada", "La semana anterior"], answer: "Seis meses antes, cerrado sin acción correctiva real" },
    { question: "¿Por qué informar verbalmente no es suficiente como acción correctiva?", options: ["Porque el personal no escucha", "Sin un cambio en el proceso el sistema sigue siendo igualmente vulnerable", "Porque no queda documentado", "Porque no involucra a la dirección"], answer: "Sin un cambio en el proceso el sistema sigue siendo igualmente vulnerable" },
    { question: "¿Qué técnica de análisis de causa raíz usó el equipo?", options: ["Diagrama de Ishikawa", "Los 5 Por qué", "Análisis de modo de falla", "Diagrama de Pareto"], answer: "Los 5 Por qué" },
    { question: "¿Cuál fue la causa raíz identificada?", options: ["Un error puntual del operador", "El procedimiento escrito estaba desactualizado y no reflejaba el flujo real", "El sistema informático tenía un error", "La capacitación inicial había sido insuficiente"], answer: "El procedimiento escrito estaba desactualizado y no reflejaba el flujo real" },
    { question: "¿Qué resultado mostró la verificación de eficacia a los 30 días?", options: ["No hubo mejora significativa", "Reducción del 80% en no conformidades relacionadas con el proceso de recepción", "El indicador empeoró con las nuevas medidas", "Los resultados no fueron concluyentes"], answer: "Reducción del 80% en no conformidades relacionadas con el proceso de recepción" },
    { question: "¿Qué acción correctiva se implementó?", options: ["Contratar más personal", "Actualización del procedimiento y control de doble verificación antes de avanzar la muestra", "Cambiar completamente el sistema informático", "Reducir las solicitudes simultáneas aceptadas"], answer: "Actualización del procedimiento y control de doble verificación antes de avanzar la muestra" },
    { question: "¿Cuál es la diferencia entre una acción correctiva y una acción preventiva?", options: ["Son exactamente lo mismo", "La correctiva responde a un problema ya ocurrido; la preventiva actúa antes de que el problema ocurra", "La preventiva es siempre más costosa de implementar", "Solo la correctiva es exigida por la norma ISO 15189"], answer: "La correctiva responde a un problema ya ocurrido; la preventiva actúa antes de que el problema ocurra" },
    { question: "¿Qué significa la sigla CAPA?", options: ["Control Analítico de Procedimientos y Acciones", "Corrective Action and Preventive Action (Acción Correctiva y Preventiva)", "Criterio de Aceptación para Procesos Analíticos", "Control Administrativo de Procedimientos Alternativos"], answer: "Corrective Action and Preventive Action (Acción Correctiva y Preventiva)" },
  ],
  dictation: "Una acción correctiva real debe identificar la causa raíz, cambiar el proceso y verificar la eficacia de las acciones implementadas.",
},
{
  id: "iso15189", title: "ISO 15189", level: "Avanzado", category: "Gestión", emoji: "🏅",
  description: "Requisitos de la norma internacional para laboratorios clínicos.",
  readingTitle: "El estándar que define la excelencia",
  reading: [
    "La norma ISO 15189 es el estándar internacional que establece los requisitos específicos de calidad y competencia para los laboratorios clínicos.",
    "La norma está estructurada en dos grandes bloques: los requisitos de gestión y los requisitos técnicos.",
    "Uno de los conceptos centrales de la ISO 15189 es el enfoque en el paciente como actor clave en la cadena de atención.",
    "La acreditación bajo ISO 15189 es un proceso formal en el que un organismo evaluador independiente verifica que el laboratorio cumple con todos los requisitos de la norma.",
    "Implementar ISO 15189 es adoptar una cultura de mejora continua en la que cada proceso es documentado, medido, evaluado y mejorado de manera sistemática.",
  ],
  vocab: [
    { es: "acreditación", pt: "acreditação" },
    { es: "norma ISO 15189", pt: "norma ISO 15189" },
    { es: "requisito técnico", pt: "requisito técnico" },
    { es: "revisión por la dirección", pt: "análise crítica pela direção" },
    { es: "mejora continua", pt: "melhoria contínua" },
    { es: "evaluación de pares", pt: "avaliação por pares" },
  ],
  quiz: [
    { question: "¿Para qué tipo de laboratorio fue diseñada específicamente la ISO 15189?", options: ["Para laboratorios industriales de control de calidad", "Para laboratorios clínicos médicos específicamente", "Para laboratorios ambientales", "Para cualquier tipo de laboratorio de ensayo"], answer: "Para laboratorios clínicos médicos específicamente" },
    { question: "¿Cuáles son los dos grandes bloques de requisitos de la ISO 15189?", options: ["Recursos humanos y equipamiento", "Requisitos de gestión y requisitos técnicos", "Documentación y control de calidad", "Procesos analíticos y postanalíticos"], answer: "Requisitos de gestión y requisitos técnicos" },
    { question: "¿Cuál es el concepto central de la ISO 15189?", options: ["La rentabilidad del laboratorio", "El enfoque en el paciente como actor clave de la cadena de atención", "La velocidad de procesamiento", "La reducción de costos operativos"], answer: "El enfoque en el paciente como actor clave de la cadena de atención" },
    { question: "¿La ISO 15189 es un fin en sí misma?", options: ["Sí, cumplirla es el objetivo principal", "No, es un medio para adoptar una cultura de mejora continua", "Sí, el certificado es lo que importa", "Depende del tipo de laboratorio"], answer: "No, es un medio para adoptar una cultura de mejora continua" },
  ],
  dictation: "La ISO 15189 establece requisitos de calidad y competencia para laboratorios clínicos con enfoque en el paciente y en la mejora continua.",
},
{
  id: "atencion-cliente", title: "Atención técnica al cliente", level: "Intermedio", category: "Comunicación", emoji: "📞",
  description: "Español profesional para explicar resultados y gestionar consultas técnicas.",
  readingTitle: "Una llamada que exigía claridad",
  reading: [
    "A media mañana, una analista del área de atención al cliente recibió una llamada de un médico clínico confundido porque el informe mostraba un valor de creatinina diferente al del mes anterior.",
    "La analista escuchó el planteo completo sin interrumpir. Luego pidió al médico que le confirmara el número de solicitud y el nombre del paciente para acceder al historial.",
    "Al revisar el historial, encontró la explicación: el laboratorio había implementado un nuevo método con calibración trazable a un estándar de referencia diferente.",
    "La analista explicó la situación con claridad y se disculpó por no haber comunicado el cambio proactivamente.",
    "El laboratorio estableció un procedimiento para comunicar a los médicos cualquier cambio de método con al menos quince días de anticipación.",
  ],
  vocab: [
    { es: "duda / consulta", pt: "dúvida / consulta" },
    { es: "informe", pt: "relatório / laudo" },
    { es: "validado", pt: "validado" },
    { es: "trazabilidad metrológica", pt: "rastreabilidade metrológica" },
    { es: "transmitir confianza", pt: "transmitir confiança" },
    { es: "comunicación proactiva", pt: "comunicação proativa" },
  ],
  quiz: [
    { question: "¿Por qué llamó el médico al laboratorio?", options: ["Para cambiar de proveedor", "Por una diferencia aparente en el valor de creatinina entre dos meses consecutivos", "Por un error en la factura", "Para solicitar un análisis urgente"], answer: "Por una diferencia aparente en el valor de creatinina entre dos meses consecutivos" },
    { question: "¿Cuál era la causa real de la diferencia en los valores?", options: ["Un error analítico", "Un cambio de método con calibración trazable a un estándar diferente", "Una muestra hemolizada", "Un error de identificación del paciente"], answer: "Un cambio de método con calibración trazable a un estándar diferente" },
    { question: "¿Cuál fue el error que el laboratorio reconoció?", options: ["Que el cambio de método no había sido validado", "Que no había comunicado proactivamente el cambio de método a los médicos", "Que el resultado estaba incorrecto", "Que el médico no había recibido el informe"], answer: "Que no había comunicado proactivamente el cambio de método a los médicos" },
    { question: "¿Qué lección central transmite este caso?", options: ["Que los médicos deben conocer mejor los métodos analíticos", "Que en atención técnica es necesario anticiparse a las dudas y comunicar proactivamente", "Que los cambios de método deben evitarse", "Que el teléfono es mejor que el correo para comunicar cambios"], answer: "Que en atención técnica es necesario anticiparse a las dudas y comunicar proactivamente" },
  ],
  dictation: "En atención técnica, no alcanza con tener razón: también es necesario comunicar proactivamente para evitar que las dudas se conviertan en problemas.",
},
{
  id: "ser-estar", title: "Ser vs. Estar", level: "Básico", category: "Gramática", emoji: "🔄",
  description: "La distinción más importante entre español y portugués: ser y estar.",
  readingTitle: "¿Es o está? La diferencia que cambia el significado",
  reading: [
    "La distinción entre 'ser' y 'estar' es probablemente el aspecto gramatical que más confunde a los hablantes de portugués cuando aprenden español.",
    "'Ser' se usa para características permanentes, esenciales o de identidad. 'Estar' se usa para estados, condiciones o situaciones temporales.",
    "En el contexto del laboratorio: 'el reactivo está vencido' usa estar porque el vencimiento es un estado temporal.",
    "Los adjetivos que cambian de significado con cada verbo son una fuente constante de confusión para estudiantes de portugués.",
    "Para los hablantes de portugués, 'é casado' equivale a 'está casado' en español.",
  ],
  vocab: [
    { es: "ser (identidad/permanente)", pt: "ser (identidade/permanente)" },
    { es: "estar (estado/temporal)", pt: "estar (estado/temporário)" },
    { es: "el reactivo está vencido", pt: "o reagente está vencido" },
    { es: "el resultado está validado", pt: "o resultado está validado" },
    { es: "el equipo está en mantenimiento", pt: "o equipamento está em manutenção" },
    { es: "ella es analista", pt: "ela é analista" },
  ],
  quiz: [
    { question: "¿Cuál es la regla general para usar 'ser' en español?", options: ["Para estados y condiciones temporales", "Para características que se perciben como permanentes, esenciales o de identidad", "Para indicar ubicación siempre", "Para describir cómo está alguien en un momento específico"], answer: "Para características que se perciben como permanentes, esenciales o de identidad" },
    { question: "¿Cuál es correcto en español para el estado de un reactivo vencido?", options: ["El reactivo es vencido", "El reactivo está vencido", "El reactivo fue vencido siempre", "El reactivo ser vencido hoy"], answer: "El reactivo está vencido" },
    { question: "¿Cuál es correcto para describir la ubicación de los reactivos?", options: ["Los reactivos son en el refrigerador", "Los reactivos están en el refrigerador", "Los reactivos serán en el refrigerador siempre", "Los reactivos estuvieron en el refrigerador siempre"], answer: "Los reactivos están en el refrigerador" },
    { question: "¿Con qué verbo se expresa la profesión u ocupación en español?", options: ["Siempre con estar", "Con ser: 'Ella es analista', 'Él es médico'", "Con tener: 'Ella tiene analista'", "Depende de si es permanente o temporaria la ocupación"], answer: "Con ser: 'Ella es analista', 'Él es médico'" },
  ],
  dictation: "El equipo está en mantenimiento, el resultado está validado y el reactivo está vencido: todos son estados temporales que usan estar, no ser.",
},
{
  id: "controllab-historia", title: "Historia de Controllab", level: "Básico", category: "Controllab", emoji: "🏛️",
  description: "Origen, hitos de acreditación y misión de Controllab desde 1977 hasta hoy.",
  readingTitle: "Casi cincuenta años construyendo calidad",
  reading: [
    "Controllab fue fundada en 1977 por Marcio Biasoli en Rio de Janeiro, Brasil. Desde el primer día, la empresa eligió un propósito claro: ayudar a los laboratorios a medir mejor.",
    "En agosto de 2001, fue el primer proveedor de Ensayo de Aptitud del Brasil habilitado por la ANVISA en el marco del programa REBLAS.",
    "Controllab tiene el apoyo de importantes sociedades científicas: la SBPC/ML y la SBMV. También es miembro de la IFCC y la EQALM.",
    "Hoy Controllab atiende a miles de laboratorios en toda Latinoamérica y Brasil, en sectores que van desde la clínica hasta la veterinaria y la vigilancia de resistencia antimicrobiana.",
    "La misión sigue siendo la misma que en 1977: estar lado a lado con el laboratorio en la búsqueda de la calidad.",
  ],
  vocab: [
    { es: "Ensayo de Aptitud (EA)", pt: "Ensaio de Proficiência (EP)" },
    { es: "acreditación / habilitación", pt: "acreditação / habilitação" },
    { es: "material de referencia certificado", pt: "material de referência certificado" },
    { es: "proveedora de Ensayo de Aptitud (EA)", pt: "provedora de Ensaio de Proficiência" },
    { es: "sociedad científica", pt: "sociedade científica" },
    { es: "buenas prácticas de fabricación", pt: "boas práticas de fabricação" },
  ],
  quiz: [
    { question: "¿En qué año y ciudad fue fundada Controllab?", options: ["1990 en São Paulo", "1977 en Rio de Janeiro", "2001 en Brasília", "1985 en Belo Horizonte"], answer: "1977 en Rio de Janeiro" },
    { question: "¿Quién fundó Controllab?", options: ["Un grupo de médicos brasileños", "Marcio Biasoli", "El gobierno federal brasileño", "La Sociedad Brasileña de Patología Clínica"], answer: "Marcio Biasoli" },
    { question: "¿En qué año fue Controllab el primer proveedor de EA habilitado por ANVISA/REBLAS?", options: ["1977", "2003", "2001", "2011"], answer: "2001" },
    { question: "¿A qué organizaciones internacionales pertenece Controllab?", options: ["Solo a la OPS", "IFCC y EQALM", "ISO y CLSI", "Solo a ANVISA"], answer: "IFCC y EQALM" },
  ],
  dictation: "Controllab fue fundada en 1977 por Marcio Biasoli y fue el primer proveedor de Ensayo de Aptitud del Brasil habilitado por ANVISA en 2001.",
},
{
  id: "controllab-ea", title: "Ensayo de Aptitud (EA)", level: "Intermedio", category: "Controllab", emoji: "🔬",
  description: "Qué es el EA, cómo funciona y cuáles son sus beneficios.",
  readingTitle: "¿Cómo sabe un laboratorio si sus resultados son correctos?",
  reading: [
    "Un laboratorio enfrenta una pregunta fundamental: ¿cómo sé que mis resultados son correctos? El control interno le dice si el método es reproducible, pero no si sus valores están alineados con los de otros laboratorios procesando la misma muestra.",
    "El Ensayo de Aptitud (EA) es también conocido como control externo de la calidad. Es una sistemática continua y periódica de evaluación de resultados obtenidos en el análisis de materiales desconocidos que simulan pacientes.",
    "Controllab evalúa el desempeño siguiendo la norma ABNT NBR ISO/IEC 17043.",
    "Los beneficios del EA incluyen: estandarizar la fase analítica, evaluar la eficiencia del control interno, identificar posibilidades de mejora e identificar diferencias entre establecimientos participantes.",
    "Los resultados obtenidos se usan en la comprobación de capacidad técnica, como diferencial frente a la competencia y como requisito de acreditación.",
  ],
  vocab: [
    { es: "Ensayo de Aptitud (EA)", pt: "Ensaio de Proficiência (EP)" },
    { es: "control externo de la calidad", pt: "controle externo da qualidade" },
    { es: "valor alvo", pt: "valor alvo" },
    { es: "faja de evaluación", pt: "faixa de avaliação" },
    { es: "desempeño satisfactorio / insatisfactorio", pt: "desempenho satisfatório / insatisfatório" },
    { es: "muestra desconocida", pt: "amostra desconhecida" },
  ],
  quiz: [
    { question: "¿Qué pregunta responde un Ensayo de Aptitud (EA)?", options: ["¿El equipo está calibrado correctamente?", "¿Los resultados del laboratorio están alineados con los de otros laboratorios que miden lo mismo?", "¿El personal está capacitado adecuadamente?", "¿El control interno está dentro de los límites?"], answer: "¿Los resultados del laboratorio están alineados con los de otros laboratorios que miden lo mismo?" },
    { question: "¿Con qué otro nombre se conoce el EA?", options: ["Control interno de calidad", "Control externo de la calidad", "Auditoría analítica", "Evaluación de pares"], answer: "Control externo de la calidad" },
    { question: "¿Bajo qué norma evalúa Controllab el desempeño?", options: ["ISO 15189 exclusivamente", "ABNT NBR ISO/IEC 17043", "ISO 13528 como única referencia", "CLIA 88"], answer: "ABNT NBR ISO/IEC 17043" },
    { question: "¿Cuál es la respuesta correcta ante un resultado inadecuado en un EA?", options: ["Ignorarlo si el control interno estaba bien", "Investigación sistemática de la causa raíz con documentación y acciones correctivas", "Repetir el ensayo hasta obtener satisfactorio", "Cambiar de proveedor del programa de EA"], answer: "Investigación sistemática de la causa raíz con documentación y acciones correctivas" },
  ],
  dictation: "El Ensayo de Aptitud es el control externo de la calidad: el laboratorio analiza materiales desconocidos que simulan pacientes y compara sus resultados con los de otros participantes.",
},
{
  id: "controllab-id", title: "Índice de Desvío (ID)", level: "Avanzado", category: "Controllab", emoji: "📐",
  description: "El indicador principal de desempeño de Controllab: cálculo, interpretación y uso.",
  readingTitle: "¿Por qué Controllab usa el ID?",
  reading: [
    "Controllab utiliza el Índice de Desvío (ID) como indicador principal del desempeño cuantitativo. La fórmula: ID = (resultado del laboratorio − valor alvo) / límite del programa.",
    "Un ID entre -1 y +1 indica resultado adecuado. El valor alvo es la media o mediana del grupo de evaluación tras el tratamiento estadístico.",
    "La ventaja del ID es que permite comparar el desempeño entre diferentes ensayos de forma directa.",
    "El ID también permite visualizar tendencias: si el ID se acerca progresivamente a 1 o a -1 en rodadas sucesivas, es una señal de alerta.",
    "El Z-escore del Grupo de Evaluación (GA) es un índice complementario, pero el indicador principal en Controllab es siempre el ID.",
  ],
  vocab: [
    { es: "Índice de Desvío (ID)", pt: "Índice de Desvio (ID)" },
    { es: "valor alvo", pt: "valor alvo" },
    { es: "límite del programa", pt: "limite do programa" },
    { es: "adecuado (A) / inadecuado (I)", pt: "adequado (A) / inadequado (I)" },
    { es: "tendencia en el ID", pt: "tendência no ID" },
    { es: "Grupo de Evaluación (GA)", pt: "Grupo de Avaliação (GA)" },
  ],
  quiz: [
    { question: "¿Cuál es la fórmula del Índice de Desvío (ID)?", options: ["ID = resultado / valor alvo", "ID = (resultado − valor alvo) / límite del programa", "ID = (resultado − media) / desvío estándar del grupo", "ID = resultado × límite / valor alvo"], answer: "ID = (resultado − valor alvo) / límite del programa" },
    { question: "¿Qué indica un ID entre -1 y +1?", options: ["Resultado inadecuado que requiere investigación", "Resultado dentro del criterio de evaluación: adecuado", "Zona de alerta que debe monitorearse", "Resultado excelente"], answer: "Resultado dentro del criterio de evaluación: adecuado" },
    { question: "¿Cuál es la diferencia conceptual principal entre el ID y el Z-escore?", options: ["El ID usa la mediana y el Z-escore usa la media", "El ID relativiza el error frente al criterio del proveedor; el Z-escore frente a la variación del grupo", "El Z-escore es más preciso que el ID", "Solo difieren en el nombre"], answer: "El ID relativiza el error frente al criterio del proveedor; el Z-escore frente a la variación del grupo" },
    { question: "¿El Z-escore reemplaza al ID como indicador principal en Controllab?", options: ["Sí, el Z-escore es siempre el indicador principal", "No, el ID es el indicador principal; el Z-escore es información complementaria", "Son equivalentes y el laboratorio elige cuál usar", "Solo el Z-escore está acreditado por el Cgcre"], answer: "No, el ID es el indicador principal; el Z-escore es información complementaria" },
  ],
  dictation: "El Índice de Desvío de Controllab se calcula dividiendo la diferencia entre el resultado y el valor alvo por el límite del programa: un ID entre menos uno y más uno indica resultado adecuado.",
},
];

// ─── Default Students ─────────────────────────────────────────────────────────
const defaultStudents: Student[] = [
  { id: "marilia", name: "Marília", code: "MARILIA" },
  { id: "claudio", name: "Claudio", code: "CLAUDIO" },
  { id: "juliana", name: "Juliana", code: "JULIANA" },
  { id: "thamiris", name: "Thamiris", code: "THAMIRIS" },
  { id: "livia", name: "Livia", code: "LIVIA" },
  { id: "adriana", name: "Adriana", code: "ADRIANA" },
  { id: "rafael", name: "Rafael", code: "RAFAEL" },
  { id: "jessica", name: "Jessica", code: "JESSICA" },
  { id: "luiza", name: "Luiza", code: "LUIZA" },
  { id: "ana-paula", name: "Ana Paula", code: "ANAPAULA" },
  { id: "lucas", name: "Lucas", code: "LUCAS" },
  { id: "katia", name: "Katia", code: "KATIA" },
  { id: "vinicius", name: "Vinicius", code: "VINICIUS" },
  { id: "thiago", name: "Thiago", code: "THIAGO" },
];

const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática", "Controllab"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function strSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h;
}
function shuffleOpts(opts: string[], seed: number): string[] {
  const arr = [...opts]; let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s = s >>> 0;
    const j = s % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function normalize(value: string): string {
  return value.trim().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ").trim();
}
function createInitialState(): AppState {
  return { students: defaultStudents, currentStudentId: null, progress: {}, dictations: {} };
}
function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

async function loadRemoteState(): Promise<AppState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("aula_controllab_state").select("data").eq("id", DB_ROW_ID).maybeSingle();
  if (error) throw error;
  return (data?.data as AppState) || null;
}
async function saveRemoteState(state: AppState): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("aula_controllab_state").upsert(
    { id: DB_ROW_ID, data: state, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (error) throw error;
}

// ─── Score Ring SVG ───────────────────────────────────────────────────────────
function ScoreRing({ percent, size = 80 }: { percent: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={percent >= 80 ? C.teal : percent >= 50 ? C.yellow : C.red}
        strokeWidth={6} strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Mini Progress Bar ────────────────────────────────────────────────────────
function MiniBar({ value, max, color = C.teal }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [appState, setAppState] = useState<AppState>(createInitialState);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [loginName, setLoginName] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(MODULES[0].id);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showProfessorPanel, setShowProfessorPanel] = useState(false);
  const [professorUnlocked, setProfessorUnlocked] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentCode, setNewStudentCode] = useState("");
  const [dictationText, setDictationText] = useState("");
  const [dictationResult, setDictationResult] = useState<DictationResult | null>(null);
  const [teacherTab, setTeacherTab] = useState<"students" | "progress" | "dictations">("progress");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [activeSection, setActiveSection] = useState<"reading" | "quiz" | "dictation" | "vocab">("reading");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentStudent = appState.students.find(s => s.id === appState.currentStudentId) ?? null;
  const selectedModule = MODULES.find(m => m.id === selectedModuleId) ?? MODULES[0];
  const studentProgress = currentStudent ? appState.progress[currentStudent.id] || {} : {};
  const studentDictations = currentStudent ? appState.dictations[currentStudent.id] || {} : {};
  const currentDictation = studentDictations[selectedModuleId] || null;
  const filteredModules = activeCategory === "Todos" ? MODULES : MODULES.filter(m => m.category === activeCategory);
  const currentQuestion = selectedModule.quiz[currentQuestionIndex];
  const shuffledOpts = shuffleOpts(currentQuestion.options, strSeed(selectedModule.id + String(currentQuestionIndex)));
  const isCorrect = submitted && selectedOption === currentQuestion.answer;
  const completedModules = Object.keys(studentProgress).length;
  const totalBestScore = MODULES.reduce((sum, m) => sum + (studentProgress[m.id]?.score || 0), 0);
  const overallPercent = Math.round((completedModules / MODULES.length) * 100);

  const speak = (text: string, rate = 0.9) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES"; u.rate = rate;
    const v = window.speechSynthesis.getVoices().find(x => x.lang.startsWith("es"));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  };
  const stopSpeak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  useEffect(() => {
    let mounted = true;
    const LSKEY = "aula-controllab-v7";
    (async () => {
      try {
        if (supabase) {
          const remote = await loadRemoteState();
          if (!mounted) return;
          if (remote) {
            setAppState({ students: Array.isArray(remote.students) && remote.students.length ? remote.students : defaultStudents, currentStudentId: null, progress: remote.progress || {}, dictations: remote.dictations || {} });
            setLoadStatus("ready"); return;
          }
        }
      } catch {}
      if (!mounted) return;
      try {
        const saved = localStorage.getItem(LSKEY);
        if (saved) { const p = JSON.parse(saved); setAppState({ ...createInitialState(), ...p, currentStudentId: null }); }
        else setAppState(createInitialState());
      } catch { setAppState(createInitialState()); }
      setLoadStatus("ready");
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loadStatus !== "ready") return;
    const LSKEY = "aula-controllab-v7";
    const t = setTimeout(async () => {
      try { localStorage.setItem(LSKEY, JSON.stringify(appState)); } catch {}
      if (supabase) { try { await saveRemoteState(appState); } catch {} }
    }, 500);
    return () => clearTimeout(t);
  }, [appState, loadStatus]);

  useEffect(() => {
    stopSpeak();
    setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false);
    setDictationText(""); setDictationResult(null); setQuizAnswers({});
    setActiveSection("reading");
  }, [selectedModuleId, appState.currentStudentId]); // eslint-disable-line

  const logout = () => { stopSpeak(); setAppState(prev => ({ ...prev, currentStudentId: null })); setSelectedModuleId(MODULES[0].id); setShowProfessorPanel(false); setProfessorUnlocked(false); };
  const login = () => {
    const found = appState.students.find(s => normalize(s.name) === normalize(loginName) && normalize(s.code) === normalize(loginCode));
    if (!found) { setLoginError("Usuario o contraseña incorrectos."); return; }
    setAppState(prev => ({ ...prev, currentStudentId: found.id }));
    setLoginError(""); setLoginName(""); setLoginCode("");
  };
  const changePassword = () => {
    if (!newPassword.trim()) { setPasswordMsg("Escribí una contraseña nueva."); return; }
    if (newPassword.trim().length < 4) { setPasswordMsg("Mínimo 4 caracteres."); return; }
    if (newPassword.trim() !== confirmPassword.trim()) { setPasswordMsg("Las contraseñas no coinciden."); return; }
    if (!currentStudent) return;
    setAppState(prev => ({ ...prev, students: prev.students.map(s => s.id === currentStudent.id ? { ...s, code: newPassword.trim().toUpperCase() } : s) }));
    setPasswordMsg("✓ Actualizada correctamente.");
    setNewPassword(""); setConfirmPassword("");
    setTimeout(() => { setShowChangePassword(false); setPasswordMsg(""); }, 1500);
  };
  const handleProfessorClick = () => {
    if (professorUnlocked) { setShowProfessorPanel(v => !v); return; }
    const pwd = window.prompt("Contraseña del profesor:");
    if (pwd === PROFESSOR_PASSWORD) { setProfessorUnlocked(true); setShowProfessorPanel(true); }
    else if (pwd !== null) alert("Contraseña incorrecta.");
  };
  const saveProgress = (scoreValue: number, totalValue: number) => {
    if (!currentStudent) return;
    setAppState(prev => {
      const prevSP = prev.progress[currentStudent.id] || {};
      const prevM = prevSP[selectedModuleId] || { completed: false, score: 0, total: totalValue, attempts: 0 };
      return { ...prev, progress: { ...prev.progress, [currentStudent.id]: { ...prevSP, [selectedModuleId]: { completed: true, score: Math.max(prevM.score || 0, scoreValue), total: totalValue, attempts: (prevM.attempts || 0) + 1 } } } };
    });
  };
  const resetCurrentModule = () => {
    if (!currentStudent) return;
    if (!window.confirm(`¿Reiniciar "${selectedModule.title}"?`)) return;
    setAppState(prev => {
      const newP = { ...(prev.progress[currentStudent.id] || {}) };
      const newD = { ...(prev.dictations[currentStudent.id] || {}) };
      delete newP[selectedModuleId]; delete newD[selectedModuleId];
      return { ...prev, progress: { ...prev.progress, [currentStudent.id]: newP }, dictations: { ...prev.dictations, [currentStudent.id]: newD } };
    });
    setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setQuizAnswers({}); setDictationText(""); setDictationResult(null); setActiveSection("reading");
  };
  const resetStudentModule = (studentId: string, moduleId: string) => {
    setAppState(prev => {
      const newP = { ...(prev.progress[studentId] || {}) };
      const newD = { ...(prev.dictations[studentId] || {}) };
      delete newP[moduleId]; delete newD[moduleId];
      return { ...prev, progress: { ...prev.progress, [studentId]: newP }, dictations: { ...prev.dictations, [studentId]: newD } };
    });
  };
  const resetStudentAll = (studentId: string, studentName: string) => {
    if (!window.confirm(`¿Reiniciar TODO de ${studentName}?`)) return;
    setAppState(prev => ({ ...prev, progress: { ...prev.progress, [studentId]: {} }, dictations: { ...prev.dictations, [studentId]: {} } }));
  };
  const resetAllStudents = () => {
    if (!window.confirm("¿Borrar TODO el progreso de TODOS los alumnos?")) return;
    setAppState(prev => ({ ...prev, progress: {}, dictations: {} }));
  };
  const handleSubmit = () => { if (!selectedOption) return; setSubmitted(true); };
  const handleNext = () => {
    if (currentQuestionIndex < selectedModule.quiz.length - 1) {
      const next = currentQuestionIndex + 1;
      setCurrentQuestionIndex(next); setSelectedOption(quizAnswers[next] || ""); setSubmitted(false); return;
    }
    const correct = selectedModule.quiz.reduce((sum, q, i) => sum + (quizAnswers[i] === q.answer ? 1 : 0), 0);
    saveProgress(correct, selectedModule.quiz.length);
    setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setQuizAnswers({});
    setActiveSection("reading");
  };
  const setAnswerMemory = (value: string) => {
    setSelectedOption(value);
    setQuizAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
  };
  const addStudent = () => {
    if (!newStudentName.trim() || !newStudentCode.trim()) return;
    const exists = appState.students.some(s => normalize(s.name) === normalize(newStudentName) || normalize(s.code) === normalize(newStudentCode));
    if (exists) { alert("Ese alumno o código ya existe."); return; }
    const id = `${normalize(newStudentName)}-${Date.now()}`;
    setAppState(prev => ({ ...prev, students: [...prev.students, { id, name: newStudentName.trim(), code: newStudentCode.trim().toUpperCase() }] }));
    setNewStudentName(""); setNewStudentCode("");
  };
  const removeStudent = (studentId: string) => {
    const student = appState.students.find(s => s.id === studentId);
    if (!window.confirm(`¿Eliminar a ${student?.name || "este alumno"}?`)) return;
    setAppState(prev => {
      const newStudents = prev.students.filter(s => s.id !== studentId);
      const newP = { ...prev.progress }; const newD = { ...prev.dictations };
      delete newP[studentId]; delete newD[studentId];
      return { ...prev, students: newStudents, progress: newP, dictations: newD };
    });
  };
  const checkDictation = () => {
    if (!currentStudent) return;
    const expected = normalize(selectedModule.dictation);
    const written = normalize(dictationText);
    const expWords = expected.split(" ").filter(Boolean);
    const wrtWords = written.split(" ").filter(Boolean);
    const matches = wrtWords.filter((w, i) => w === expWords[i]).length;
    const score = expWords.length ? Math.round((matches / expWords.length) * 100) : 0;
    const result: DictationResult = { exact: expected === written, score, written: dictationText, expected: selectedModule.dictation, updatedAt: new Date().toLocaleString() };
    setDictationResult(result);
    setAppState(prev => ({ ...prev, dictations: { ...prev.dictations, [currentStudent.id]: { ...(prev.dictations[currentStudent.id] || {}), [selectedModuleId]: result } } }));
  };

  const professorRows = useMemo(() => appState.students.map(student => {
    const progress = appState.progress[student.id] || {};
    const dictations = appState.dictations[student.id] || {};
    const completedMods = Object.keys(progress).length;
    const bestScore = MODULES.reduce((sum, m) => sum + (progress[m.id]?.score || 0), 0);
    const dictScores = MODULES.map(m => dictations[m.id]?.score).filter((v): v is number => typeof v === "number");
    const dictAvg = dictScores.length ? Math.round(dictScores.reduce((a, b) => a + b, 0) / dictScores.length) : null;
    return { ...student, completedMods, bestScore, dictAvg };
  }), [appState]);

  // ── Loading Screen ───────────────────────────────────────────────────────────
  if (loadStatus === "loading") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: FONT_BODY, gap: 16 }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.teal}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ color: C.textDim, fontSize: 13 }}>Cargando Aula Controllab...</span>
    </div>
  );

  // ── Professor Panel ──────────────────────────────────────────────────────────
  const ProfessorPanel = () => (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, marginTop: 16 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.bg3, borderRadius: 12, padding: 4 }}>
        {([["progress", "📊 Progreso"], ["students", "👥 Alumnos"], ["dictations", "🎙 Dictados"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTeacherTab(t)} style={{
            flex: 1, borderRadius: 9, padding: "8px 0", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
            background: teacherTab === t ? C.surface : "transparent",
            color: teacherTab === t ? C.text : C.textDim, fontFamily: FONT_BODY,
            boxShadow: teacherTab === t ? `0 0 0 1px ${C.border}` : "none",
          }}>{label}</button>
        ))}
        <button onClick={resetAllStudents} style={{ ...btnDanger, borderRadius: 9, marginLeft: 8 }}>🗑 Todo</button>
      </div>

      {/* Progress Tab */}
      {teacherTab === "progress" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto" }}>
          {professorRows.map(row => (
            <div key={row.id} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.tealGlow, border: `1px solid ${C.borderA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.teal, fontFamily: FONT_MONO }}>{getInitial(row.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.text, fontFamily: FONT_BODY }}>{row.name}</div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: FONT_MONO }}>{row.completedMods}/{MODULES.length} módulos · {row.bestScore} pts</div>
                </div>
                <button onClick={() => resetStudentAll(row.id, row.name)} style={btnDanger}>Reset</button>
              </div>
              <MiniBar value={row.completedMods} max={MODULES.length} />
            </div>
          ))}
        </div>
      )}

      {/* Dictations Tab */}
      {teacherTab === "dictations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
          {professorRows.map(row => (
            <div key={row.id} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: C.text, fontFamily: FONT_BODY }}>{row.name}</span>
                {row.dictAvg !== null && <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.teal, background: C.tealGlow, padding: "2px 8px", borderRadius: 20 }}>avg {row.dictAvg}%</span>}
              </div>
              {MODULES.filter(m => appState.dictations[row.id]?.[m.id]).map(m => {
                const d = appState.dictations[row.id][m.id];
                const scoreColor = d.score >= 80 ? C.green : d.score >= 50 ? C.yellow : C.red;
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.textMid, fontFamily: FONT_BODY, flex: 1 }}>{m.emoji} {m.title}</span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: scoreColor }}>{d.score}%</span>
                    <MiniBar value={d.score} max={100} color={scoreColor} />
                    <button onClick={() => resetStudentModule(row.id, m.id)} style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</button>
                  </div>
                );
              })}
              {!MODULES.some(m => appState.dictations[row.id]?.[m.id]) && <div style={{ fontSize: 12, color: C.textDim }}>Sin dictados aún</div>}
            </div>
          ))}
        </div>
      )}

      {/* Students Tab */}
      {teacherTab === "students" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Nombre" style={{ ...inputStyle, flex: 2 }} />
            <input value={newStudentCode} onChange={e => setNewStudentCode(e.target.value)} placeholder="Código" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addStudent} style={{ ...btnPrimary, padding: "0 16px", whiteSpace: "nowrap" }}>+ Agregar</button>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {appState.students.map(s => (
              <div key={s.id} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.tealGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.teal }}>{getInitial(s.name)}</div>
                <div style={{ flex: 1, fontSize: 14, color: C.text, fontFamily: FONT_BODY }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: FONT_MONO }}>{s.code}</div>
                <button onClick={() => removeStudent(s.id)} style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!currentStudent) return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(45,212,191,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(96,165,250,0.05) 0%, transparent 50%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: FONT_BODY,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: ${C.textDim}; }
        input:focus { border-color: ${C.borderA} !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: C.tealGlow, border: `1px solid ${C.borderA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>🔬</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: C.text, margin: "0 0 8px", fontFamily: FONT_DISPLAY, letterSpacing: "-0.03em" }}>Aula Controllab</h1>
          <p style={{ color: C.textMid, fontSize: 14, margin: 0 }}>Español técnico para profesionales del laboratorio</p>
        </div>

        {/* Login Card */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 8, fontFamily: FONT_MONO }}>NOMBRE</label>
            <input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Tu nombre completo" style={inputStyle} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 8, fontFamily: FONT_MONO }}>CONTRASEÑA</label>
            <input value={loginCode} onChange={e => setLoginCode(e.target.value)} placeholder="••••••••" type="password" style={inputStyle} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          {loginError && (
            <div style={{ background: "rgba(251,113,133,0.08)", border: `1px solid ${C.redBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>
              {loginError}
            </div>
          )}
          <button onClick={login} style={{ ...btnPrimary, width: "100%", padding: "13px 24px", fontSize: 15 }}>
            Entrar al aula →
          </button>
        </div>

        <button onClick={handleProfessorClick} style={{ marginTop: 12, width: "100%", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 14, padding: "11px 16px", color: C.textDim, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>
          👨‍🏫 Panel del profesor
        </button>
        {showProfessorPanel && professorUnlocked && <ProfessorPanel />}
      </div>
    </div>
  );

  // ── Main App ─────────────────────────────────────────────────────────────────
  const moduleProgress = studentProgress[selectedModuleId];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT_BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${C.textDim}; }
        input:focus, textarea:focus { border-color: ${C.borderA} !important; outline: none; }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .section-anim { animation: fadeIn 0.25s ease; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: C.bg2, borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 4 }}>
            <span style={{ fontSize: 18 }}>🔬</span>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY, color: C.text }}>Aula Controllab</span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: C.border }} />

          {/* Category Pills */}
          <div style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer", whiteSpace: "nowrap",
                background: activeCategory === cat ? C.teal : "transparent",
                color: activeCategory === cat ? "#042f2e" : C.textDim,
                fontFamily: FONT_BODY, transition: "all 0.15s",
              }}>{cat}</button>
            ))}
          </div>

          {/* Right Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setShowChangePassword(v => !v)} style={{ ...btnGhost, padding: "5px 10px", fontSize: 13 }} title="Cambiar contraseña">🔑</button>
            <button onClick={handleProfessorClick} style={{ ...btnGhost, padding: "5px 10px", fontSize: 13 }} title="Panel del profesor">👨‍🏫</button>
            {/* Student Chip */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 12px 4px 6px" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.tealGlow, border: `1px solid ${C.borderA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.teal, fontFamily: FONT_MONO }}>{getInitial(currentStudent.name)}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{currentStudent.name}</span>
            </div>
            <button onClick={logout} style={btnDanger}>Salir</button>
          </div>
        </div>

        {/* Password Change Dropdown */}
        {showChangePassword && (
          <div style={{ background: C.bg2, borderTop: `1px solid ${C.border}`, padding: "16px 24px" }}>
            <div style={{ maxWidth: 480, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña" style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar" style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
              <button onClick={changePassword} style={btnPrimary}>Guardar</button>
              <button onClick={() => { setShowChangePassword(false); setPasswordMsg(""); }} style={btnGhost}>Cancelar</button>
              {passwordMsg && <span style={{ fontSize: 13, color: passwordMsg.startsWith("✓") ? C.green : C.red, width: "100%" }}>{passwordMsg}</span>}
            </div>
          </div>
        )}
      </header>

      {/* Professor Panel */}
      {showProfessorPanel && professorUnlocked && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
          <ProfessorPanel />
        </div>
      )}

      {/* ── Main Layout ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 48px", display: "grid", gridTemplateColumns: sidebarOpen ? "280px 1fr 300px" : "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* ── Left Sidebar: Module List ── */}
        {sidebarOpen && (
          <aside style={{ position: "sticky", top: 80 }}>
            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 16, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "0 4px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.textDim, fontFamily: FONT_MONO }}>MÓDULOS</span>
                <span style={{ fontSize: 11, color: C.textDim, fontFamily: FONT_MONO }}>{filteredModules.filter(m => studentProgress[m.id]).length}/{filteredModules.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredModules.map(m => {
                  const p = studentProgress[m.id];
                  const isActive = m.id === selectedModuleId;
                  const isComplete = !!p;
                  return (
                    <button key={m.id} onClick={() => setSelectedModuleId(m.id)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      borderRadius: 12, padding: "9px 10px",
                      background: isActive ? C.tealGlow : "transparent",
                      border: `1px solid ${isActive ? C.borderA : "transparent"}`,
                      cursor: "pointer", textAlign: "left", width: "100%",
                      transition: "all 0.15s",
                    }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>{m.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.text : C.textMid, fontFamily: FONT_BODY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColor(m.category), flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: C.textDim, fontFamily: FONT_MONO }}>{m.level}</span>
                        </div>
                      </div>
                      {isComplete ? (
                        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: C.teal }}>{p.score}/{p.total}</span>
                          <span style={{ fontSize: 10, color: C.teal }}>✓</span>
                        </div>
                      ) : (
                        <span style={{ color: C.textDim, fontSize: 14 }}>·</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* ── Center: Content Area ── */}
        <main>
          {/* Module Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <button onClick={() => setSidebarOpen(v => !v)} style={{ ...btnGhost, padding: "6px 10px", flexShrink: 0, marginTop: 4 }} title="Toggle sidebar">
                {sidebarOpen ? "◀" : "▶"}
              </button>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: catBg(selectedModule.category), border: `1px solid ${catColor(selectedModule.category)}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                {selectedModule.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>{selectedModule.title}</h2>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: catBg(selectedModule.category), color: catColor(selectedModule.category), fontFamily: FONT_MONO }}>{selectedModule.category}</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.surface, color: C.textDim, fontFamily: FONT_MONO, border: `1px solid ${C.border}` }}>{selectedModule.level}</span>
                  {moduleProgress && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.tealGlow, color: C.teal, fontFamily: FONT_MONO, border: `1px solid ${C.borderA}` }}>✓ {moduleProgress.score}/{moduleProgress.total}</span>}
                </div>
                <p style={{ color: C.textMid, fontSize: 14, margin: 0 }}>{selectedModule.description}</p>
              </div>
              <button onClick={resetCurrentModule} style={{ ...btnDanger, flexShrink: 0, marginTop: 4 }}>↺ Reiniciar</button>
            </div>

            {/* Section Tabs */}
            <div style={{ display: "flex", gap: 4, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 4 }}>
              {([["reading", "📖 Lectura"], ["vocab", "📝 Vocabulario"], ["quiz", "🧠 Quiz"], ["dictation", "🎙 Dictado"]] as const).map(([sec, label]) => (
                <button key={sec} onClick={() => setActiveSection(sec)} style={{
                  flex: 1, borderRadius: 11, padding: "9px 4px", fontSize: 13, fontWeight: 600,
                  border: "none", cursor: "pointer", fontFamily: FONT_BODY,
                  background: activeSection === sec ? C.teal : "transparent",
                  color: activeSection === sec ? "#042f2e" : C.textMid,
                  transition: "all 0.15s",
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* ── Reading Section ── */}
          {activeSection === "reading" && (
            <div key="reading" className="section-anim" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0, fontFamily: FONT_DISPLAY, letterSpacing: "-0.02em" }}>{selectedModule.readingTitle}</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => speak(selectedModule.reading.join(" "), 0.9)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.tealGlow, border: `1px solid ${C.borderA}`, borderRadius: 10, padding: "7px 14px", fontSize: 13, color: C.teal, cursor: "pointer", fontFamily: FONT_BODY }}>
                    🔊 <span>Escuchar</span>
                  </button>
                  <button onClick={stopSpeak} style={{ ...btnGhost, padding: "7px 14px" }}>⏹</button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {selectedModule.reading.map((para, i) => (
                  <div key={i} style={{ display: "flex", gap: 20, padding: "16px 0", borderBottom: i < selectedModule.reading.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textDim, flexShrink: 0, paddingTop: 4, width: 20, textAlign: "right" }}>{i + 1}</span>
                    <p style={{ lineHeight: 2.0, color: "#cbd5e1", fontSize: 15, margin: 0, fontFamily: FONT_BODY }}>{para}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", gap: 12 }}>
                <button onClick={() => setActiveSection("vocab")} style={{ ...btnGhost, flex: 1 }}>📝 Ver vocabulario</button>
                <button onClick={() => setActiveSection("quiz")} style={{ ...btnPrimary, flex: 1 }}>Ir al quiz →</button>
              </div>
            </div>
          )}

          {/* ── Vocabulary Section ── */}
          {activeSection === "vocab" && (
            <div key="vocab" className="section-anim" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 24px", fontFamily: FONT_DISPLAY }}>📝 Vocabulario clave</h3>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {selectedModule.vocab.map(item => (
                  <div key={item.es} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.text, fontFamily: FONT_BODY }}>{item.es}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, fontFamily: FONT_MONO }}>ES</div>
                    </div>
                    <div style={{ width: 1, height: 32, background: C.border }} />
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.teal, fontFamily: FONT_BODY }}>{item.pt}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, fontFamily: FONT_MONO }}>PT</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                <button onClick={() => setActiveSection("reading")} style={btnGhost}>← Lectura</button>
                <button onClick={() => setActiveSection("quiz")} style={{ ...btnPrimary }}>Ir al quiz →</button>
              </div>
            </div>
          )}

          {/* ── Quiz Section ── */}
          {activeSection === "quiz" && (
            <div key="quiz" className="section-anim" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
              {/* Progress */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 99, background: C.bg3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${((currentQuestionIndex + (submitted ? 1 : 0)) / selectedModule.quiz.length) * 100}%`, background: `linear-gradient(90deg, ${C.teal}, #67e8f9)`, borderRadius: 99, transition: "width 0.4s ease" }} />
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, color: C.textMid, flexShrink: 0 }}>
                  {currentQuestionIndex + 1} <span style={{ color: C.textDim }}>/ {selectedModule.quiz.length}</span>
                </span>
              </div>

              {/* Question */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.65, margin: 0, fontFamily: FONT_BODY }}>
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {shuffledOpts.map(option => {
                  const sel = selectedOption === option;
                  const correct = submitted && option === currentQuestion.answer;
                  const wrong = submitted && sel && option !== currentQuestion.answer;
                  return (
                    <button key={option} onClick={() => !submitted && setAnswerMemory(option)} disabled={submitted} style={{
                      textAlign: "left", padding: "13px 18px",
                      borderRadius: 13,
                      border: `1px solid ${correct ? C.green + "60" : wrong ? C.red + "60" : sel ? C.teal + "60" : C.border}`,
                      background: correct ? "rgba(52,211,153,0.1)" : wrong ? C.redDim : sel ? C.tealGlow : C.bg3,
                      color: correct ? C.green : wrong ? C.red : sel ? C.teal : C.textMid,
                      cursor: submitted ? "default" : "pointer",
                      fontFamily: FONT_BODY, fontSize: 14, lineHeight: 1.5,
                      width: "100%", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${correct ? C.green : wrong ? C.red : sel ? C.teal : C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                        {correct ? "✓" : wrong ? "✗" : ""}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14 }}>
                  {submitted
                    ? isCorrect
                      ? <span style={{ color: C.green, fontWeight: 600 }}>✓ ¡Correcto!</span>
                      : <div><span style={{ color: C.red }}>✗ Respuesta: </span><strong style={{ color: C.text }}>{currentQuestion.answer}</strong></div>
                    : <span style={{ color: C.textDim }}>Seleccioná una opción para continuar</span>
                  }
                </div>
                {!submitted
                  ? <button onClick={handleSubmit} disabled={!selectedOption} style={{ ...btnPrimary, opacity: selectedOption ? 1 : 0.35 }}>Comprobar</button>
                  : <button onClick={handleNext} style={btnPrimary}>{currentQuestionIndex < selectedModule.quiz.length - 1 ? "Siguiente →" : "Finalizar ✓"}</button>
                }
              </div>
            </div>
          )}

          {/* ── Dictation Section ── */}
          {activeSection === "dictation" && (
            <div key="dictation" className="section-anim" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0, fontFamily: FONT_DISPLAY }}>🎙 Dictado</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => speak(selectedModule.dictation, 0.75)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.tealGlow, border: `1px solid ${C.borderA}`, borderRadius: 10, padding: "7px 14px", fontSize: 13, color: C.teal, cursor: "pointer", fontFamily: FONT_BODY }}>
                    🔊 <span>Reproducir</span>
                  </button>
                  <button onClick={stopSpeak} style={{ ...btnGhost, padding: "7px 14px" }}>⏹</button>
                </div>
              </div>

              <p style={{ color: C.textMid, fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
                Escuchá el audio y escribí la frase en español. Podés repetirlo las veces que necesites.
              </p>

              <textarea
                value={dictationText}
                onChange={e => setDictationText(e.target.value)}
                rows={4}
                placeholder="Escribí lo que escuchaste..."
                style={{ ...inputStyle, resize: "none", lineHeight: 1.8, borderRadius: 14, padding: "14px 18px" }}
              />

              <button onClick={checkDictation} style={{ ...btnPrimary, marginTop: 14 }}>
                Corregir dictado
              </button>

              {(dictationResult || currentDictation) && (() => {
                const r = dictationResult || currentDictation!;
                const scoreColor = r.score >= 80 ? C.green : r.score >= 50 ? C.yellow : C.red;
                return (
                  <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginTop: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <ScoreRing percent={r.score} size={64} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: scoreColor }}>{r.score}%</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{r.score === 100 ? "¡Perfecto! 🎉" : r.score >= 80 ? "¡Muy bien! 👍" : r.score >= 50 ? "Buen intento" : "Seguí practicando"}</div>
                        <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{r.updatedAt}</div>
                      </div>
                    </div>
                    <div style={{ background: C.bg2, borderRadius: 12, padding: "12px 16px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.textDim, marginBottom: 6, letterSpacing: "0.06em", fontFamily: FONT_MONO }}>FRASE MODELO</div>
                      <p style={{ fontSize: 14, color: "#cbd5e1", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{r.expected}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </main>

        {/* ── Right Sidebar: Progress + Modules ── */}
        <aside style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Progress Card */}
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.textDim, marginBottom: 16, fontFamily: FONT_MONO }}>MI PROGRESO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ScoreRing percent={overallPercent} size={80} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800, color: C.teal }}>{overallPercent}%</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{completedModules} de {MODULES.length}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>módulos completados</div>
                <div style={{ fontSize: 13, color: C.teal, fontWeight: 700, marginTop: 6, fontFamily: FONT_MONO }}>{totalBestScore} pts</div>
              </div>
            </div>

            {/* Category Breakdown */}
            {["Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática", "Controllab"].map(cat => {
              const catMods = MODULES.filter(m => m.category === cat);
              const done = catMods.filter(m => studentProgress[m.id]).length;
              return (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColor(cat), flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.textMid, width: 90, flexShrink: 0 }}>{cat}</span>
                  <MiniBar value={done} max={catMods.length} color={catColor(cat)} />
                  <span style={{ fontSize: 11, color: C.textDim, fontFamily: FONT_MONO, flexShrink: 0 }}>{done}/{catMods.length}</span>
                </div>
              );
            })}
          </div>

          {/* Tip Card */}
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.textDim, marginBottom: 10, fontFamily: FONT_MONO }}>CONSEJO DEL DÍA</div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: 0 }}>
              💡 En atención técnica, la <span style={{ color: C.teal, fontWeight: 600 }}>claridad</span> siempre es más valiosa que la complejidad del vocabulario.
            </p>
          </div>

          {/* Spotify */}
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(30,215,96,0.18)", background: "linear-gradient(135deg, rgba(30,215,96,0.06), rgba(6,11,20,0.98))" }}>
            <div style={{ padding: "14px 18px 8px", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Escuchá mientras estudiás</span>
            </div>
            <iframe
              style={{ borderRadius: "0 0 20px 20px", display: "block" }}
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcOFHFBj89A5?utm_source=generator&theme=0"
              width="100%" height="152" frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
