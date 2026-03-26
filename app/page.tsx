"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjufnjnijkzypnktdxql.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdWZuam5pamt6eXBua3RkeHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzUyMjgsImV4cCI6MjA4OTUxMTIyOH0.VWEtmhvSB8Crtjf2vcoFMJaIiDQ5ejkaQB1B2zEBnbw";
const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const DB_ROW_ID = "global-app-state";
const PROFESSOR_PASSWORD = "controllab2025";

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

const C = {
  bg: "#060b14", bg2: "#0c1220", bg3: "#111827",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)", borderA: "rgba(45,212,191,0.30)",
  teal: "#2dd4bf", tealDim: "#0d9488", tealGlow: "rgba(45,212,191,0.12)",
  text: "#f1f5f9", textMid: "#94a3b8", textDim: "#475569",
  green: "#34d399", yellow: "#fbbf24", red: "#fb7185",
  redDim: "rgba(251,113,133,0.12)", redBorder: "rgba(251,113,133,0.25)",
};
const FONT = "'DM Sans', system-ui, sans-serif";
const MONO = "'DM Mono', 'JetBrains Mono', monospace";
const DISPLAY = "'Syne', 'DM Sans', system-ui, sans-serif";
const BG = C.bg; const TEAL = C.teal; const TEXT = C.text; const TEXT_MID = C.textMid; const TEXT_DIM = C.textDim; const BORDER = C.border; const BORDER_A = C.borderA;
const GLASS: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 };
const glassDark: React.CSSProperties = { background: C.bg3, border: `1px solid ${C.border}` };
const input: React.CSSProperties = { width: "100%", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", color: C.text, fontSize: 14, fontFamily: FONT, outline: "none", boxSizing: "border-box" };
const btnAccent: React.CSSProperties = { background: `linear-gradient(135deg,${C.teal},${C.tealDim})`, color: "#042f2e", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT };
const btnBack: React.CSSProperties = { background: "transparent", border: "none", color: C.textMid, cursor: "pointer", fontSize: 13, padding: "0 0 8px 0", display: "flex", alignItems: "center", gap: 4, fontFamily: FONT };
const btnGhost: React.CSSProperties = { background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 14px", fontSize: 13, color: C.textMid, cursor: "pointer", fontFamily: FONT };
const btnDanger: React.CSSProperties = { background: C.redDim, border: `1px solid ${C.redBorder}`, borderRadius: 10, padding: "7px 14px", fontSize: 12, color: C.red, cursor: "pointer", fontFamily: FONT };
const optBtn = (sel: boolean, correct: boolean, wrong: boolean): React.CSSProperties => ({ textAlign: "left", padding: "13px 18px", borderRadius: 13, border: `1px solid ${correct ? C.green + "60" : wrong ? C.red + "60" : sel ? C.teal + "60" : C.border}`, background: correct ? "rgba(52,211,153,0.1)" : wrong ? C.redDim : sel ? C.tealGlow : C.bg3, color: correct ? C.green : wrong ? C.red : sel ? C.teal : C.textMid, cursor: "pointer", fontFamily: FONT, fontSize: 14, width: "100%", display: "flex", alignItems: "center", gap: 12 });
function catColor(cat: string): string { const m: Record<string, string> = { Laboratorio: "#60a5fa", Gestión: "#f472b6", Comunicación: "#fb923c", Ventas: "#4ade80", Tecnología: "#a78bfa", Gramática: "#facc15", Controllab: C.teal }; return m[cat] || C.textMid; }
function catBg(cat: string): string { const m: Record<string, string> = { Laboratorio: "rgba(96,165,250,0.1)", Gestión: "rgba(244,114,182,0.1)", Comunicación: "rgba(251,146,60,0.1)", Ventas: "rgba(74,222,128,0.1)", Tecnología: "rgba(167,139,250,0.1)", Gramática: "rgba(250,204,21,0.1)", Controllab: "rgba(45,212,191,0.1)", Viajes: "rgba(249,115,22,0.1)" }; return m[cat] || "rgba(255,255,255,0.05)"; }
function getInitial(name: string): string { return name.charAt(0).toUpperCase(); }
function ScoreRing({ percent, size = 80 }: { percent: number; size?: number }) { const r = (size - 8) / 2; const circ = 2 * Math.PI * r; const dash = (percent / 100) * circ; return (<svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={percent >= 80 ? C.teal : percent >= 50 ? C.yellow : C.red} strokeWidth={6} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} /></svg>); }
function MiniBar({ value, max, color = C.teal }: { value: number; max: number; color?: string }) { const pct = max > 0 ? Math.round((value / max) * 100) : 0; return (<div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden", flex: 1 }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.5s ease" }} /></div>); }


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
  id: "bioquimica", title: "Bioquímica clínica", level: "Intermedio", category: "Laboratorio", emoji: "⚗️",
  description: "Glucosa, perfil lipídico, función renal y hepática en contexto clínico.",
  readingTitle: "El perfil que habla por el paciente",
  reading: [
    "La bioquímica clínica abarca una gran variedad de análisis: la glucosa y la hemoglobina glicosilada para el metabolismo de los hidratos de carbono; el colesterol total, HDL, LDL y triglicéridos para el perfil lipídico; la creatinina, urea y tasa de filtración glomerular para la función renal; las transaminasas TGO y TGP, la bilirrubina, fosfatasa alcalina y GGT para la función hepática.",
    "Cuando el médico solicita un perfil metabólico completo, el analista debe garantizar no solo que cada valor individual sea correcto, sino también que el conjunto sea coherente. Un aumento de creatinina acompañado de disminución de la filtración glomerular y aumento de urea refuerza la sospecha de compromiso renal.",
    "La interpretación clínica requiere conocer el contexto del paciente. Una glucosa de 180 mg/dL tiene un significado completamente diferente en un paciente diabético conocido que en una persona sin antecedentes que no había ayunado.",
    "Si un control falla durante la corrida, el analista debe determinar qué muestras se vieron afectadas, retener esos resultados, investigar la causa y repetir tanto los controles como las muestras comprometidas.",
    "En la comunicación con el médico, el lenguaje técnico accesible es una habilidad clave. Un laboratorio que sabe comunicar bien sus resultados genera confianza y fidelidad en sus clientes.",
  ],
  vocab: [
    { es: "glucosa", pt: "glicose" },
    { es: "creatinina", pt: "creatinina" },
    { es: "perfil lipídico", pt: "perfil lipídico" },
    { es: "función hepática", pt: "função hepática" },
    { es: "filtración glomerular", pt: "filtração glomerular" },
    { es: "transaminasas", pt: "transaminases" },
  ],
  quiz: [
    { question: "¿Qué marcadores evalúan la función hepática?", options: ["Glucosa y creatinina", "TGO, TGP, bilirrubina, fosfatasa alcalina y GGT", "Colesterol y triglicéridos", "Hemoglobina y hematocrito"], answer: "TGO, TGP, bilirrubina, fosfatasa alcalina y GGT" },
    { question: "¿Qué marcadores evalúan la función renal?", options: ["TGO y TGP", "Creatinina, urea y filtración glomerular estimada", "Glucosa y hemoglobina glicosilada", "Colesterol HDL y LDL"], answer: "Creatinina, urea y filtración glomerular estimada" },
    { question: "¿Qué combinación refuerza la sospecha de compromiso renal?", options: ["Creatinina alta sola", "Creatinina alta más filtración glomerular baja más urea elevada", "Solo filtración glomerular baja", "TGO y TGP elevadas"], answer: "Creatinina alta más filtración glomerular baja más urea elevada" },
    { question: "¿Por qué importa el contexto clínico del paciente en bioquímica?", options: ["No importa, los valores son absolutos", "El mismo valor puede tener significados muy distintos según el paciente", "Solo importa para la facturación", "Solo para pacientes diabéticos"], answer: "El mismo valor puede tener significados muy distintos según el paciente" },
    { question: "¿Qué hace el analista si un control falla durante la corrida?", options: ["Libera todos los resultados igual", "Retiene resultados afectados, investiga y repite muestras comprometidas", "Solo repite el control fallido", "Avisa al médico y sigue procesando"], answer: "Retiene resultados afectados, investiga y repite muestras comprometidas" },
    { question: "¿Por qué la bilirrubina en una muestra hemolizada puede ser engañosa?", options: ["Porque siempre indica daño hepático real", "Porque la hemólisis libera contenido intracelular que no refleja el nivel real del paciente", "Porque la bilirrubina no se ve afectada por hemólisis", "Porque es un valor técnicamente imposible"], answer: "Porque la hemólisis libera contenido intracelular que no refleja el nivel real del paciente" },
    { question: "¿Por qué la creatinina puede interpretarse diferente en dos pacientes con el mismo valor?", options: ["Porque los equipos dan resultados distintos", "Porque la masa muscular, el sexo y la edad influyen en la interpretación", "Porque los rangos de referencia son incorrectos", "Porque depende del método analítico"], answer: "Porque la masa muscular, el sexo y la edad influyen en la interpretación" },
    { question: "¿Qué genera confianza y fidelidad en los clientes del laboratorio?", options: ["Tener los equipos más modernos", "Saber comunicar bien los resultados con claridad y contexto clínico", "Tener los precios más bajos", "Procesar más muestras por día"], answer: "Saber comunicar bien los resultados con claridad y contexto clínico" },
    { question: "¿Cuál es la diferencia entre LDL calculado y LDL directo?", options: ["Son idénticos en cualquier condición", "El LDL calculado puede ser inexacto con triglicéridos muy elevados; el directo es más confiable en esos casos", "El LDL directo es siempre inferior al calculado", "Solo el LDL calculado es aceptado por las normas de calidad"], answer: "El LDL calculado puede ser inexacto con triglicéridos muy elevados; el directo es más confiable en esos casos" },
    { question: "¿Qué indica una relación AST/ALT mayor a 2 en el contexto hepático?", options: ["Daño hepático de cualquier origen", "Sugiere enfermedad hepática alcohólica como causa probable del daño", "Es un valor completamente normal en adultos", "Solo ocurre en hepatitis virales"], answer: "Sugiere enfermedad hepática alcohólica como causa probable del daño" },
    { question: "¿Para qué sirve la hemoglobina glicosilada (HbA1c) en el seguimiento del paciente diabético?", options: ["Para medir la glucosa en un punto del tiempo", "Para reflejar el promedio de glucemia de los últimos dos a tres meses", "Para reemplazar la glucosa en ayunas en el diagnóstico", "Solo para pacientes con diabetes tipo 1"], answer: "Para reflejar el promedio de glucemia de los últimos dos a tres meses" },
    { question: "¿Por qué la lipemia puede interferir en múltiples analitos de bioquímica?", options: ["Solo afecta al perfil lipídico", "Porque la turbidez del suero interfiere con la espectrofotometría, afectando múltiples mediciones", "Porque aumenta la viscosidad y el equipo no puede procesar la muestra", "Solo interfiere con la glucosa"], answer: "Porque la turbidez del suero interfiere con la espectrofotometría, afectando múltiples mediciones" },
    { question: "¿Cuál es la acción correcta cuando se detecta que un resultado de bioquímica fue liberado con un error?", options: ["No hacer nada para no alarmar al paciente", "Contactar al médico de inmediato, corregir el informe y documentar el incidente", "Esperar que el médico llame a preguntar", "Solo corregir el informe sin avisar al médico"], answer: "Contactar al médico de inmediato, corregir el informe y documentar el incidente" },
  ],
  dictation: "La bioquímica clínica evalúa el funcionamiento de órganos a través de marcadores como glucosa, creatinina y perfil lipídico, siempre en contexto clínico.",
},
{
  id: "preanalítica", title: "Fase preanalítica", level: "Básico", category: "Laboratorio", emoji: "🩺",
  description: "El origen de la mayoría de los errores: todo lo que ocurre antes del análisis.",
  readingTitle: "El error que ocurrió antes de llegar al laboratorio",
  reading: [
    "Estudios realizados en diferentes países coinciden en un dato sorprendente: entre el sesenta y el setenta por ciento de todos los errores en el laboratorio clínico ocurren durante la fase preanalítica, antes de que la muestra llegue al analizador.",
    "La fase preanalítica comienza en el momento en que el médico decide solicitar un análisis. Incluye la solicitud médica, la preparación del paciente, la extracción de la muestra, el transporte y la recepción en el laboratorio.",
    "Uno de los errores preanalíticos más frecuentes es la hemólisis, la ruptura de los glóbulos rojos durante o después de la extracción. La hemólisis libera el contenido intracelular al plasma, elevando falsamente marcadores como la potasemia, la LDH y la hemoglobina libre.",
    "El orden de llenado de los tubos es otro aspecto crítico. Si se llena primero un tubo con anticoagulante antes de uno sin anticoagulante, puede producirse contaminación cruzada que afecta los estudios de coagulación.",
    "La gestión de la fase preanalítica requiere una visión sistémica que incluye la formación continua del personal, el diseño de formularios y la instalación de sistemas de trazabilidad como el código de barras.",
  ],
  vocab: [
    { es: "fase preanalítica", pt: "fase pré-analítica" },
    { es: "hemólisis", pt: "hemólise" },
    { es: "anticoagulante", pt: "anticoagulante" },
    { es: "centrifugado", pt: "centrifugação" },
    { es: "orden de llenado", pt: "ordem de coleta" },
    { es: "solicitud médica", pt: "pedido médico" },
  ],
  quiz: [
    { question: "¿Qué porcentaje de los errores del laboratorio ocurren en la fase preanalítica?", options: ["10 a 20%", "60 a 70%", "Menos del 5%", "Exactamente el 50%"], answer: "60 a 70%" },
    { question: "¿Cuándo comienza realmente la fase preanalítica?", options: ["Cuando la muestra llega al laboratorio", "Cuando el médico decide solicitar el análisis", "Cuando se centrifuga la muestra", "Cuando el analista recibe el tubo"], answer: "Cuando el médico decide solicitar el análisis" },
    { question: "¿Qué es la hemólisis?", options: ["Una infección bacteriana de la muestra", "La ruptura de glóbulos rojos durante o después de la extracción", "Un reactivo analítico vencido", "Una temperatura muy baja durante el transporte"], answer: "La ruptura de glóbulos rojos durante o después de la extracción" },
    { question: "¿Qué marcadores se ven elevados falsamente por hemólisis?", options: ["Glucosa y colesterol", "Potasemia, LDH y hemoglobina libre", "Creatinina y urea exclusivamente", "TGO y bilirrubina directa solamente"], answer: "Potasemia, LDH y hemoglobina libre" },
    { question: "¿Por qué es crítico el orden de llenado de los tubos?", options: ["Solo por razones estéticas", "Para evitar contaminación cruzada entre anticoagulantes que afecta los estudios de coagulación", "Porque lo exige la norma sin razón científica", "Solo es importante en los tubos de coagulación"], answer: "Para evitar contaminación cruzada entre anticoagulantes que afecta los estudios de coagulación" },
    { question: "¿Qué aspectos incluye la fase preanalítica?", options: ["Solo la extracción de sangre", "Solicitud médica, preparación del paciente, extracción, transporte y recepción", "Solo el transporte de las muestras", "Solo la recepción en el laboratorio"], answer: "Solicitud médica, preparación del paciente, extracción, transporte y recepción" },
    { question: "¿Qué herramienta de trazabilidad se menciona?", options: ["Solo los formularios de papel", "Sistemas de código de barras desde el momento de la extracción", "Solo la supervisión visual del proceso", "Solo la capacitación periódica"], answer: "Sistemas de código de barras desde el momento de la extracción" },
    { question: "¿Qué implica gestionar bien la fase preanalítica?", options: ["Contratar más analistas", "Reducir el mayor porcentaje de errores mediante trabajo colaborativo y trazabilidad", "Comprar equipos más costosos", "Aumentar la velocidad de procesamiento"], answer: "Reducir el mayor porcentaje de errores mediante trabajo colaborativo y trazabilidad" },
    { question: "¿Cuánto tiempo máximo se recomienda como tiempo de isquemia al extraer sangre?", options: ["5 minutos", "1 minuto, ya que la prolongación afecta la concentración de varios analitos", "10 minutos sin efecto alguno", "Solo importa en pacientes oncológicos"], answer: "1 minuto, ya que la prolongación afecta la concentración de varios analitos" },
    { question: "¿Qué efecto tiene el ayuno insuficiente en la muestra de sangre?", options: ["Ningún efecto conocido", "Puede elevar triglicéridos y glucosa, invalidando el perfil lipídico y glucémico", "Solo afecta la bilirrubina directa", "Solo afecta marcadores cardíacos"], answer: "Puede elevar triglicéridos y glucosa, invalidando el perfil lipídico y glucémico" },
    { question: "¿Por qué es importante el tiempo entre extracción y centrifugado?", options: ["No importa mientras sea el mismo día", "La demora puede causar cambios metabólicos en las células que alteran el resultado", "Solo importa para la muestra de orina", "Solo afecta los estudios microbiológicos"], answer: "La demora puede causar cambios metabólicos en las células que alteran el resultado" },
    { question: "¿Qué debe hacer el laboratorio cuando recibe una muestra hemolizada para potasio?", options: ["Liberarla con una nota al pie del informe", "Rechazarla y solicitar nueva extracción porque la hemólisis invalida el resultado", "Reportarla con un factor de corrección matemático", "Procesarla y no informar al médico"], answer: "Rechazarla y solicitar nueva extracción porque la hemólisis invalida el resultado" },
    { question: "¿Qué información debe comunicarse al punto de extracción para reducir errores preanalíticos?", options: ["Solo el listado de precios actualizado", "Instrucciones claras sobre preparación del paciente, tipo de tubo, volumen y condiciones de transporte", "Solo el nombre del analista de turno", "Solo las fechas de cierre del laboratorio"], answer: "Instrucciones claras sobre preparación del paciente, tipo de tubo, volumen y condiciones de transporte" },
  ],
  dictation: "Entre el sesenta y el setenta por ciento de los errores del laboratorio ocurren en la fase preanalítica, antes de que la muestra llegue al analizador.",
},
{
  id: "coagulacion", title: "Coagulación y hemostasia", level: "Avanzado", category: "Laboratorio", emoji: "🩹",
  description: "TP, KPTT, dímero D y comunicación de resultados críticos de coagulación.",
  readingTitle: "Cuando la sangre no se detiene",
  reading: [
    "La hemostasia es el conjunto de mecanismos que el organismo activa para detener un sangrado cuando se produce una lesión vascular. Este proceso se divide en hemostasia primaria, que involucra a las plaquetas y forma un tapón provisional, y hemostasia secundaria o coagulación, que consolida ese tapón mediante una red de fibrina.",
    "El laboratorio evalúa este sistema mediante el tiempo de protrombina que evalúa la vía extrínseca, utilizado principalmente para monitorear el tratamiento con anticoagulantes orales como warfarina; y el KPTT que evalúa la vía intrínseca y es fundamental para monitorear la heparina.",
    "Una particularidad del laboratorio de coagulación es que los resultados son especialmente sensibles a los factores preanalíticos. La proporción correcta entre la sangre y el anticoagulante citrato en el tubo azul es crítica: si el tubo no está completamente llenado, el resultado puede ser falsamente prolongado.",
    "El dímero D es un producto de degradación de la fibrina que se eleva cuando hay formación y lisis de coágulos. Se utiliza principalmente para descartar tromboembolismo venoso, aunque tiene alta sensibilidad pero baja especificidad.",
    "El laboratorio debe tener establecidos los valores de pánico para cada prueba de coagulación y el procedimiento para comunicarlos al médico de forma inmediata, documentada y verificada.",
  ],
  vocab: [
    { es: "coagulación", pt: "coagulação" },
    { es: "hemostasia", pt: "hemostasia" },
    { es: "tiempo de protrombina / INR", pt: "tempo de protrombina / RNI" },
    { es: "anticoagulante", pt: "anticoagulante" },
    { es: "dímero D", pt: "dímero D" },
    { es: "trombosis", pt: "trombose" },
  ],
  quiz: [
    { question: "¿Qué evalúa el tiempo de protrombina (TP)?", options: ["La vía intrínseca de coagulación", "La vía extrínseca de coagulación", "El número de plaquetas", "La función renal"], answer: "La vía extrínseca de coagulación" },
    { question: "¿Para qué se usa el INR principalmente?", options: ["Diagnóstico de anemia", "Monitoreo del tratamiento con anticoagulantes orales", "Evaluación de la función plaquetaria", "Diagnóstico de infecciones"], answer: "Monitoreo del tratamiento con anticoagulantes orales" },
    { question: "¿Qué evalúa el KPTT?", options: ["La vía extrínseca", "La vía intrínseca de la coagulación", "Las plaquetas", "El fibrinógeno únicamente"], answer: "La vía intrínseca de la coagulación" },
    { question: "¿Por qué es crítica la proporción sangre-citrato en el tubo azul?", options: ["Por razones estéticas", "Una relación alterada puede generar resultados falsamente prolongados", "Para facilitar el centrifugado", "Por exigencia del fabricante únicamente"], answer: "Una relación alterada puede generar resultados falsamente prolongados" },
    { question: "¿Qué indica el dímero D elevado?", options: ["Deficiencia de vitamina K", "Formación y lisis de coágulos en el organismo", "Anemia grave", "Infección bacteriana"], answer: "Formación y lisis de coágulos en el organismo" },
    { question: "¿Por qué el dímero D tiene baja especificidad?", options: ["Porque no es confiable", "Porque se eleva en muchas situaciones además de tromboembolismo", "Porque el equipo tiene poca sensibilidad", "Porque varía según la edad del paciente"], answer: "Porque se eleva en muchas situaciones además de tromboembolismo" },
    { question: "¿Qué factores preanalíticos afectan los resultados de coagulación?", options: ["Solo la temperatura del laboratorio", "Tubo no completamente lleno, hemólisis, coágulos y temperatura inadecuada", "Solo el tiempo de transporte", "Solo el tipo de anticoagulante del tubo"], answer: "Tubo no completamente lleno, hemólisis, coágulos y temperatura inadecuada" },
    { question: "¿Qué debe hacer el laboratorio ante un valor crítico de coagulación?", options: ["Esperar a que el médico llame", "Comunicarlo inmediatamente de forma documentada y verificada", "Repetir el análisis sin avisar", "Solo anotarlo en el informe"], answer: "Comunicarlo inmediatamente de forma documentada y verificada" },
    { question: "¿Cuál es la diferencia clínica entre monitorear warfarina con INR y monitorear heparina con KPTT?", options: ["Son intercambiables para cualquier anticoagulante", "El INR estandariza la medición de warfarina entre laboratorios; el KPTT monitorea el efecto de la heparina no fraccionada", "El INR es más preciso para heparina", "Solo el KPTT se usa en pacientes hospitalizados"], answer: "El INR estandariza la medición de warfarina entre laboratorios; el KPTT monitorea el efecto de la heparina no fraccionada" },
    { question: "¿Qué es el fibrinógeno y cuándo es importante medirlo?", options: ["Una enzima hepática sin relación con la coagulación", "Una proteína esencial para la formación de la red de fibrina, importante en coagulación intravascular diseminada y hemorragias graves", "Un marcador de infección bacteriana", "Solo se mide en pacientes con trombosis arterial"], answer: "Una proteína esencial para la formación de la red de fibrina, importante en coagulación intravascular diseminada y hemorragias graves" },
    { question: "¿Por qué se debe procesar la muestra de coagulación dentro de las cuatro horas de extracción?", options: ["Por exigencia del proveedor del equipo únicamente", "Porque los factores de coagulación son lábiles y se deterioran con el tiempo, alterando los resultados", "Solo por razones de bioseguridad", "Solo si el paciente tiene anticoagulantes"], answer: "Porque los factores de coagulación son lábiles y se deterioran con el tiempo, alterando los resultados" },
    { question: "¿Qué situación clínica puede elevar el dímero D sin que haya tromboembolismo?", options: ["Ninguna, el dímero D es completamente específico", "Embarazo, infecciones, inflamación, cirugía reciente o neoplasias", "Solo el ejercicio físico intenso", "Solo pacientes mayores de 70 años"], answer: "Embarazo, infecciones, inflamación, cirugía reciente o neoplasias" },
    { question: "¿Cómo se expresa el resultado del TP para facilitar la comparación entre laboratorios?", options: ["Solo en segundos", "Como INR, que normaliza el resultado frente al tromboplastina de referencia internacional (ISI)", "Como porcentaje de actividad sin estandarización", "En micromoles por litro"], answer: "Como INR, que normaliza el resultado frente al tromboplastina de referencia internacional (ISI)" },
  ],
  dictation: "El tiempo de protrombina evalúa la vía extrínseca de la coagulación y se expresa como INR para monitorear el tratamiento anticoagulante oral.",
},
{
  id: "marcadores-cardiacos", title: "Marcadores cardíacos", level: "Avanzado", category: "Laboratorio", emoji: "❤️",
  description: "Troponina, CK-MB y BNP en el diagnóstico de eventos cardiovasculares.",
  readingTitle: "Cuando el corazón deja huella en la sangre",
  reading: [
    "Los marcadores cardíacos son proteínas o enzimas que normalmente se encuentran dentro de las células del músculo cardíaco y que se liberan al torrente sanguíneo cuando esas células sufren daño. Su detección en sangre es una señal de lesión miocárdica.",
    "La troponina cardíaca es actualmente el marcador de elección para el diagnóstico de infarto agudo de miocardio. Las troponinas comienzan a elevarse entre tres y seis horas después del inicio del daño miocárdico, alcanzan su pico entre doce y veinticuatro horas y pueden permanecer elevadas hasta catorce días.",
    "La CK-MB fue el marcador estándar antes de la troponina. Aunque ha sido desplazada para el diagnóstico de infarto, sigue siendo útil para detectar reinfartos, porque sus niveles vuelven a la normalidad más rápidamente que la troponina.",
    "El BNP o péptido natriurético cerebral y su precursor NT-proBNP se elevan cuando el corazón trabaja bajo una presión o volumen excesivos, como ocurre en la insuficiencia cardíaca.",
    "La interpretación de los marcadores cardíacos siempre debe realizarse en contexto clínico y en función del tiempo transcurrido desde el inicio de los síntomas. Una troponina normal en las primeras dos horas no descarta infarto.",
  ],
  vocab: [
    { es: "troponina", pt: "troponina" },
    { es: "infarto agudo de miocardio", pt: "infarto agudo do miocárdio" },
    { es: "CK-MB", pt: "CK-MB" },
    { es: "BNP / NT-proBNP", pt: "BNP / NT-proBNP" },
    { es: "insuficiencia cardíaca", pt: "insuficiência cardíaca" },
    { es: "marcador de daño miocárdico", pt: "marcador de dano miocárdico" },
  ],
  quiz: [
    { question: "¿Por qué la troponina cardíaca es el marcador de elección para infarto?", options: ["Porque es más barata", "Por su alta especificidad por tejido cardíaco y su sensibilidad", "Porque se eleva antes que cualquier otro marcador", "Porque no se ve afectada por ejercicio físico"], answer: "Por su alta especificidad por tejido cardíaco y su sensibilidad" },
    { question: "¿Cuándo comienza a elevarse la troponina tras el daño miocárdico?", options: ["Inmediatamente al inicio del daño", "Entre 3 y 6 horas después del inicio del daño", "Solo después de 24 horas", "A las 48 horas"], answer: "Entre 3 y 6 horas después del inicio del daño" },
    { question: "¿Por qué la CK-MB sigue siendo útil a pesar de la troponina?", options: ["Es más específica que la troponina", "Vuelve a la normalidad más rápido y sirve para detectar reinfartos", "Tiene mayor sensibilidad diagnóstica", "Es el único marcador cuantificable"], answer: "Vuelve a la normalidad más rápido y sirve para detectar reinfartos" },
    { question: "¿Qué indica una elevación de BNP o NT-proBNP?", options: ["Infarto agudo de miocardio", "Estrés mecánico ventricular como en insuficiencia cardíaca", "Daño renal agudo", "Infección bacteriana severa"], answer: "Estrés mecánico ventricular como en insuficiencia cardíaca" },
    { question: "¿Una troponina normal descarta infarto en las primeras 2 horas?", options: ["Sí, siempre descarta infarto", "No, porque el marcador puede no haberse elevado aún", "Sí, con las troponinas de alta sensibilidad siempre", "Solo si se acompaña de ECG normal"], answer: "No, porque el marcador puede no haberse elevado aún" },
    { question: "¿Qué estrategia diagnóstica es la correcta para marcadores cardíacos?", options: ["Una sola medición es suficiente", "Mediciones seriadas en el tiempo para evaluar la cinética del marcador", "Solo medir al ingreso del paciente", "Medir solo si el ECG es anormal"], answer: "Mediciones seriadas en el tiempo para evaluar la cinética del marcador" },
    { question: "¿Cuánto tiempo puede permanecer elevada la troponina tras un infarto?", options: ["Solo 24 horas", "Hasta 14 días", "Solo 6 horas", "Exactamente 3 días"], answer: "Hasta 14 días" },
    { question: "¿Cuál es la responsabilidad del laboratorio ante resultados críticos de troponina?", options: ["Esperar la solicitud del médico", "Comunicarlos de forma inmediata y documentada", "Incluirlos solo en el informe impreso", "Solo si supera 10 veces el valor normal"], answer: "Comunicarlos de forma inmediata y documentada" },
    { question: "¿Qué ventaja tienen las troponinas de alta sensibilidad sobre las convencionales?", options: ["Son más baratas de producir", "Permiten detectar concentraciones menores y establecer diagnóstico más precoz o descarte más temprano", "Son más específicas para el miocardio", "Solo se usan en unidades de cuidados intensivos"], answer: "Permiten detectar concentraciones menores y establecer diagnóstico más precoz o descarte más temprano" },
    { question: "¿Por qué se pide NT-proBNP en lugar de BNP en algunos laboratorios?", options: ["Son completamente equivalentes sin ninguna diferencia", "NT-proBNP tiene mayor vida media y es más estable en la muestra, facilitando su medición", "BNP es más costoso de medir", "Solo el BNP es aceptado por las guías clínicas actuales"], answer: "NT-proBNP tiene mayor vida media y es más estable en la muestra, facilitando su medición" },
    { question: "¿Puede elevarse la troponina en condiciones distintas al infarto?", options: ["No, es completamente específica del infarto", "Sí, en miocarditis, embolia pulmonar, sepsis grave e insuficiencia renal avanzada", "Solo en deportistas de alto rendimiento", "Solo en pacientes con diabetes"], answer: "Sí, en miocarditis, embolia pulmonar, sepsis grave e insuficiencia renal avanzada" },
    { question: "¿Qué representa la cinética de la troponina en las mediciones seriadas?", options: ["Solo confirma que el primer resultado fue correcto", "El patrón de ascenso y descenso permite distinguir daño agudo de elevación crónica", "Solo importa para calcular el tamaño del infarto", "Es irrelevante si la primera medición fue positiva"], answer: "El patrón de ascenso y descenso permite distinguir daño agudo de elevación crónica" },
    { question: "¿Qué debe hacer el laboratorio si la muestra para troponina llegó hemolizada?", options: ["Procesarla igual sin nota", "Evaluar el grado de hemólisis; si es significativa, rechazarla y solicitar nueva muestra porque puede interferir", "Solo procesarla con un factor de corrección", "Siempre liberar el resultado con comentario"], answer: "Evaluar el grado de hemólisis; si es significativa, rechazarla y solicitar nueva muestra porque puede interferir" },
  ],
  dictation: "La troponina cardíaca es el marcador de elección para el diagnóstico de infarto y debe medirse de forma seriada en el tiempo.",
},
{
  id: "inmunologia", title: "Inmunología básica", level: "Intermedio", category: "Laboratorio", emoji: "🛡️",
  description: "Serología, anticuerpos y pruebas inmunológicas en el laboratorio clínico.",
  readingTitle: "Cuando el cuerpo deja rastros en la sangre",
  reading: [
    "La inmunología clínica estudia las respuestas del sistema inmune que pueden detectarse en el laboratorio. A través del suero del paciente, es posible identificar anticuerpos que evidencian infecciones pasadas o actuales, enfermedades autoinmunes o el estado vacunal.",
    "Las pruebas serológicas detectan anticuerpos específicos contra agentes infecciosos. En la hepatitis B, por ejemplo, el laboratorio puede determinar simultáneamente el antígeno de superficie (HBsAg), que indica infección activa, y los anticuerpos anti-HBs, que indican inmunidad.",
    "Las enfermedades autoinmunes son otra área clave de la inmunología clínica. El FAN (factor antinuclear) es un marcador de cribado para lupus eritematoso sistémico y otras enfermedades autoinmunes. Un FAN positivo no es diagnóstico pero requiere investigación adicional.",
    "La interpretación de las pruebas inmunológicas exige conocer la diferencia entre IgM e IgG. La IgM es el primer anticuerpo que aparece en una infección aguda y desaparece relativamente rápido. La IgG aparece más tarde, persiste durante años y es el indicador de inmunidad duradera o infección pasada.",
    "Los factores preanalíticos también afectan las pruebas inmunológicas. Una muestra hemolizada puede interferir con técnicas de quimioluminiscencia. El tiempo transcurrido entre la extracción y el procesamiento puede afectar la estabilidad de algunos anticuerpos. El analista debe evaluar la calidad de la muestra antes de validar cualquier resultado serológico.",
  ],
  vocab: [
    { es: "anticuerpo", pt: "anticorpo" },
    { es: "antígeno", pt: "antígeno" },
    { es: "serología", pt: "sorologia" },
    { es: "FAN / factor antinuclear", pt: "FAN / fator antinuclear" },
    { es: "inmunidad", pt: "imunidade" },
    { es: "IgM / IgG", pt: "IgM / IgG" },
  ],
  quiz: [
    { question: "¿Qué detectan las pruebas serológicas?", options: ["Glucosa y creatinina en suero", "Anticuerpos específicos contra agentes infecciosos o autoantígenos", "Solo bacterias cultivables en placa", "Solo antígenos de superficie de hepatitis"], answer: "Anticuerpos específicos contra agentes infecciosos o autoantígenos" },
    { question: "¿Qué indica la presencia de HBsAg en el suero del paciente?", options: ["Inmunidad vacunal contra hepatitis B", "Infección activa por hepatitis B", "Infección pasada ya resuelta", "Solo contacto previo con el virus"], answer: "Infección activa por hepatitis B" },
    { question: "¿Qué diferencia hay entre IgM e IgG en una infección?", options: ["Son iguales, solo difieren en el nombre", "IgM indica infección aguda reciente; IgG indica infección pasada o inmunidad duradera", "IgG aparece primero y desaparece rápido", "IgM persiste toda la vida"], answer: "IgM indica infección aguda reciente; IgG indica infección pasada o inmunidad duradera" },
    { question: "¿Qué significa un FAN positivo en el laboratorio?", options: ["Confirma diagnóstico de lupus", "Es un marcador de cribado que requiere investigación adicional, no es diagnóstico por sí solo", "Indica infección viral activa", "Es un hallazgo sin significado clínico"], answer: "Es un marcador de cribado que requiere investigación adicional, no es diagnóstico por sí solo" },
    { question: "¿Cómo puede la hemólisis afectar las pruebas serológicas?", options: ["No tiene ningún efecto", "Puede interferir con técnicas fotométricas o de quimioluminiscencia dando resultados falsos", "Solo eleva la IgM", "Solo afecta el FAN"], answer: "Puede interferir con técnicas fotométricas o de quimioluminiscencia dando resultados falsos" },
    { question: "¿Qué indica anti-HBs positivo?", options: ["Infección activa de hepatitis B", "Inmunidad, ya sea por vacunación o infección pasada resuelta", "Portador crónico del virus", "Necesidad de nueva dosis de vacuna"], answer: "Inmunidad, ya sea por vacunación o infección pasada resuelta" },
    { question: "¿Por qué un resultado inmunológico no puede interpretarse aisladamente?", options: ["Porque los equipos no son confiables", "Porque el contexto clínico, el tiempo de evolución y otros marcadores son esenciales para la interpretación", "Solo porque la norma lo exige", "Porque todos los resultados positivos son falsos"], answer: "Porque el contexto clínico, el tiempo de evolución y otros marcadores son esenciales para la interpretación" },
    { question: "¿Qué debe evaluar el analista antes de validar un resultado serológico?", options: ["Solo si el paciente tiene seguro médico", "La calidad de la muestra: hemólisis, lipemia, tiempo transcurrido y condiciones de almacenamiento", "Solo si el equipo fue calibrado ese día", "Solo si el reactivo es del mismo lote que el anterior"], answer: "La calidad de la muestra: hemólisis, lipemia, tiempo transcurrido y condiciones de almacenamiento" },
  ],
  dictation: "En inmunología clínica, la IgM indica infección aguda reciente y la IgG indica inmunidad duradera o infección pasada ya resuelta.",
},
{
  id: "gasometria", title: "Gasometría arterial", level: "Avanzado", category: "Laboratorio", emoji: "💨",
  description: "pH, pO2, pCO2 y equilibrio ácido-base en el paciente crítico.",
  readingTitle: "La muestra que no puede esperar",
  reading: [
    "La gasometría arterial es uno de los análisis más urgentes del laboratorio clínico. Evalúa el pH sanguíneo, la presión parcial de oxígeno (pO2), la presión parcial de dióxido de carbono (pCO2) y el bicarbonato (HCO3−). Estos parámetros reflejan el estado de la ventilación pulmonar y del equilibrio ácido-base del organismo.",
    "El pH normal de la sangre arterial es entre 7.35 y 7.45. Un pH por debajo de 7.35 indica acidosis; por encima de 7.45, alcalosis. La causa puede ser respiratoria, si el problema está en los pulmones y el CO2, o metabólica, si está en los riñones y el bicarbonato.",
    "La acidosis respiratoria se produce cuando los pulmones no eliminan suficiente CO2, que se acumula en sangre y acidifica el medio. La alcalosis respiratoria ocurre cuando se elimina demasiado CO2, por ejemplo en la hiperventilación.",
    "Desde el punto de vista preanalítico, la gasometría es extremadamente sensible. La muestra debe analizarse dentro de los 30 minutos de obtenida si se mantiene a temperatura ambiente, o dentro de los 60 minutos si se mantiene en hielo.",
    "Las burbujas de aire en la jeringa son uno de los errores preanalíticos más frecuentes en gasometría: elevan la pO2 y reducen la pCO2, produciendo resultados falsamente normales.",
  ],
  vocab: [
    { es: "gasometría", pt: "gasometria" },
    { es: "pH sanguíneo", pt: "pH sanguíneo" },
    { es: "acidosis / alcalosis", pt: "acidose / alcalose" },
    { es: "bicarbonato (HCO3−)", pt: "bicarbonato (HCO3−)" },
    { es: "pO2 / pCO2", pt: "pO2 / pCO2" },
    { es: "equilibrio ácido-base", pt: "equilíbrio ácido-base" },
  ],
  quiz: [
    { question: "¿Cuál es el rango normal del pH arterial?", options: ["7.20 a 7.30", "7.35 a 7.45", "7.50 a 7.60", "7.00 a 7.20"], answer: "7.35 a 7.45" },
    { question: "¿Qué indica un pH menor a 7.35?", options: ["Alcalosis", "Acidosis", "Resultado normal", "Error analítico"], answer: "Acidosis" },
    { question: "¿Qué causa la acidosis respiratoria?", options: ["Exceso de bicarbonato renal", "Acumulación de CO2 por ventilación insuficiente", "Pérdida de ácidos por vómitos", "Hiperventilación severa"], answer: "Acumulación de CO2 por ventilación insuficiente" },
    { question: "¿En cuánto tiempo debe analizarse la gasometría a temperatura ambiente?", options: ["Dentro de 2 horas", "Dentro de 30 minutos", "Dentro de 4 horas si se tapa la jeringa", "En 24 horas si se refrigera"], answer: "Dentro de 30 minutos" },
    { question: "¿Qué efecto tienen las burbujas de aire en la jeringa?", options: ["No tienen ningún efecto conocido", "Elevan la pO2 y reducen la pCO2 dando resultados falsamente normales", "Solo afectan el pH", "Bajan la pO2 y elevan la pCO2"], answer: "Elevan la pO2 y reducen la pCO2 dando resultados falsamente normales" },
    { question: "¿Qué evalúa principalmente la pCO2 en gasometría?", options: ["La función renal", "La ventilación pulmonar y la componente respiratoria del equilibrio ácido-base", "La oxigenación de los tejidos periféricos", "La función hepática"], answer: "La ventilación pulmonar y la componente respiratoria del equilibrio ácido-base" },
    { question: "¿Con qué se asocia la acidosis metabólica?", options: ["Hiperventilación por ansiedad", "Diabetes descompensada, insuficiencia renal o intoxicaciones", "Retención de CO2 por enfermedad pulmonar", "Uso de diuréticos"], answer: "Diabetes descompensada, insuficiencia renal o intoxicaciones" },
    { question: "¿Por qué los eritrocitos afectan la muestra de gasometría en el tiempo?", options: ["No tienen metabolismo fuera del organismo", "Continúan consumiendo oxígeno después de la extracción, modificando la pO2 real", "Solo afectan el pH pero no los gases", "Solo importa si la muestra es venosa"], answer: "Continúan consumiendo oxígeno después de la extracción, modificando la pO2 real" },
  ],
  dictation: "La gasometría debe procesarse dentro de los treinta minutos y las burbujas de aire en la jeringa elevan falsamente la pO2 y reducen la pCO2.",
},
{
  id: "toxicologia", title: "Toxicología clínica", level: "Avanzado", category: "Laboratorio", emoji: "☠️",
  description: "Drogas de abuso, fármacos y monitoreo terapéutico en el laboratorio.",
  readingTitle: "Lo que el laboratorio puede revelar",
  reading: [
    "La toxicología clínica comprende la detección de drogas de abuso, la monitorización de fármacos de rango terapéutico estrecho y la detección de intoxicaciones agudas.",
    "El monitoreo de fármacos terapéuticos es fundamental para medicamentos con ventana terapéutica estrecha, como digoxina, vancomicina, litio, ciclosporina y antiepilépticos.",
    "El momento de la extracción es crítico en el monitoreo de fármacos. La concentración valle, tomada justo antes de la siguiente dosis, refleja el nivel mínimo del fármaco. La concentración pico, tomada en el momento de máxima absorción, refleja el nivel máximo.",
    "Para el screening de drogas de abuso, los inmunoensayos son la técnica de primera línea por su rapidez. Sin embargo, pueden dar reacciones cruzadas con otras sustancias. Por eso, todo positivo en el screening debe confirmarse con cromatografía.",
    "La cadena de custodia es un requisito indispensable cuando los resultados toxicológicos tienen implicaciones legales.",
  ],
  vocab: [
    { es: "fármaco / medicamento", pt: "fármaco / medicamento" },
    { es: "rango terapéutico", pt: "faixa terapêutica" },
    { es: "concentración valle / pico", pt: "concentração vale / pico" },
    { es: "droga de abuso", pt: "droga de abuso" },
    { es: "cadena de custodia", pt: "cadeia de custódia" },
    { es: "cromatografía de confirmación", pt: "cromatografia de confirmação" },
  ],
  quiz: [
    { question: "¿Para qué se realiza el monitoreo de fármacos terapéuticos?", options: ["Para detectar drogas ilegales en el paciente", "Para mantener la concentración del fármaco dentro del rango eficaz y seguro", "Solo por exigencia legal hospitalaria", "Para verificar si el paciente tomó la medicación"], answer: "Para mantener la concentración del fármaco dentro del rango eficaz y seguro" },
    { question: "¿Qué representa la concentración valle de un fármaco?", options: ["El nivel máximo alcanzado tras la dosis", "El nivel mínimo justo antes de la siguiente dosis", "El promedio entre pico y valle", "El nivel al momento del primer síntoma de toxicidad"], answer: "El nivel mínimo justo antes de la siguiente dosis" },
    { question: "¿Por qué el horario de extracción es crítico en el monitoreo farmacológico?", options: ["Solo por requisito del sistema informático", "Porque la concentración varía según el momento del ciclo de dosificación y determina si es valle o pico", "Solo importa para antiepilépticos", "Porque el fármaco se destruye rápidamente a temperatura ambiente"], answer: "Porque la concentración varía según el momento del ciclo de dosificación y determina si es valle o pico" },
    { question: "¿Por qué un positivo en screening de drogas debe confirmarse?", options: ["Por exigencia burocrática únicamente", "Por posibles reacciones cruzadas con otras sustancias que den falsos positivos", "Porque el screening siempre da falsos resultados", "Solo si el paciente lo solicita"], answer: "Por posibles reacciones cruzadas con otras sustancias que den falsos positivos" },
    { question: "¿Qué es la cadena de custodia en toxicología?", options: ["El protocolo de envío de muestras al laboratorio de referencia", "La documentación ininterrumpida de cada paso desde la obtención hasta el resultado para garantizar la integridad legal", "El registro de los fármacos administrados al paciente", "El conjunto de reactivos usados en el análisis"], answer: "La documentación ininterrumpida de cada paso desde la obtención hasta el resultado para garantizar la integridad legal" },
    { question: "¿Qué fármacos requieren monitoreo por rango terapéutico estrecho?", options: ["Antibióticos comunes como amoxicilina", "Digoxina, vancomicina, litio, ciclosporina y antiepilépticos", "Solo vitaminas y suplementos", "Solo los fármacos de uso intravenoso"], answer: "Digoxina, vancomicina, litio, ciclosporina y antiepilépticos" },
    { question: "¿Qué técnica se usa para la confirmación de drogas de abuso?", options: ["Repetir el mismo inmunoensayo", "Cromatografía, que tiene mayor especificidad que el screening", "Solicitar una nueva muestra al día siguiente", "Electroforesis de proteínas"], answer: "Cromatografía, que tiene mayor especificidad que el screening" },
    { question: "¿Qué consecuencias puede tener un error en toxicología clínica?", options: ["Solo consecuencias técnicas internas", "Consecuencias clínicas, legales o laborales para el paciente dependiendo del contexto", "Solo consecuencias para la certificación del laboratorio", "Ninguna si el error se corrige rápidamente"], answer: "Consecuencias clínicas, legales o laborales para el paciente dependiendo del contexto" },
  ],
  dictation: "En toxicología clínica todo positivo en el screening de drogas de abuso debe confirmarse con cromatografía antes de emitir el resultado definitivo.",
},
{
  id: "validacion-metodo", title: "Validación de métodos", level: "Avanzado", category: "Laboratorio", emoji: "✅",
  description: "Parámetros de validación: exactitud, precisión, linealidad e interferencias.",
  readingTitle: "Antes de liberar el primer resultado",
  reading: [
    "Antes de que un método analítico sea utilizado en la rutina del laboratorio, debe demostrarse que produce resultados confiables para el propósito previsto. Ese proceso se llama validación del método.",
    "Los parámetros principales incluyen la exactitud, que mide qué tan cerca está el resultado del valor verdadero; la precisión, que evalúa la reproducibilidad; la linealidad, que establece el rango de concentración en que el método responde proporcionalmente; y los límites de detección.",
    "El estudio de interferencias evalúa el efecto de sustancias como hemoglobina (hemólisis), bilirrubina (ictericia) y lípidos (lipemia). Si la interferencia supera un umbral clínicamente significativo, debe quedar documentado.",
    "La verificación es diferente de la validación. Cuando el laboratorio implementa un método ya validado por el fabricante, verifica que funciona correctamente en su propio entorno.",
    "La documentación debe incluir el protocolo, los datos crudos, el análisis estadístico y las conclusiones.",
  ],
  vocab: [
    { es: "validación del método", pt: "validação do método" },
    { es: "exactitud", pt: "exatidão" },
    { es: "precisión", pt: "precisão" },
    { es: "linealidad", pt: "linearidade" },
    { es: "interferencia analítica", pt: "interferência analítica" },
    { es: "verificación", pt: "verificação" },
  ],
  quiz: [
    { question: "¿Qué demuestra la validación de un método analítico?", options: ["Que el equipo está calibrado correctamente", "Que el método produce resultados confiables para el propósito previsto", "Que el reactivo no está vencido", "Que el analista está capacitado para el método"], answer: "Que el método produce resultados confiables para el propósito previsto" },
    { question: "¿Qué mide la exactitud de un método?", options: ["La reproducibilidad de resultados repetidos", "Qué tan cerca está el resultado del valor verdadero", "El rango de concentración en que el método es lineal", "El tiempo de procesamiento del método"], answer: "Qué tan cerca está el resultado del valor verdadero" },
    { question: "¿Qué evalúa la precisión?", options: ["La cercanía al valor verdadero", "La reproducibilidad de los resultados en condiciones iguales", "El límite de detección del método", "La estabilidad del reactivo en el tiempo"], answer: "La reproducibilidad de los resultados en condiciones iguales" },
    { question: "¿Para qué sirve el estudio de interferencias?", options: ["Para calibrar el equipo analítico", "Para evaluar el efecto de sustancias presentes en la muestra que pueden alterar el resultado", "Para verificar la linealidad del método", "Para comparar el método con otros laboratorios"], answer: "Para evaluar el efecto de sustancias presentes en la muestra que pueden alterar el resultado" },
    { question: "¿Cuál es la diferencia entre validación y verificación?", options: ["Son lo mismo con distinto nombre", "La validación es completa (nuevo método); la verificación confirma que un método ya validado funciona en ese laboratorio específico", "La verificación es más costosa que la validación", "Solo la validación es requerida por la ISO 15189"], answer: "La validación es completa (nuevo método); la verificación confirma que un método ya validado funciona en ese laboratorio específico" },
    { question: "¿Qué incluye la documentación de la validación?", options: ["Solo el resultado final y la firma del director", "Protocolo, datos crudos, análisis estadístico y conclusiones", "Solo las interferencias identificadas", "Solo la curva de calibración del día"], answer: "Protocolo, datos crudos, análisis estadístico y conclusiones" },
    { question: "¿Cuándo debe realizarse una nueva validación o verificación parcial?", options: ["Solo cada 5 años por protocolo", "Cuando cambia significativamente el reactivo, equipo o procedimiento", "Solo si el EA da resultado inadecuado", "Solo si el cliente lo solicita expresamente"], answer: "Cuando cambia significativamente el reactivo, equipo o procedimiento" },
    { question: "¿Cuáles son las tres interferencias más comunes evaluadas en validación?", options: ["Glucosa, creatinina y colesterol", "Hemólisis, ictericia (bilirrubina) y lipemia (lípidos)", "Sodio, potasio y cloro", "Temperatura, humedad y luz"], answer: "Hemólisis, ictericia (bilirrubina) y lipemia (lípidos)" },
  ],
  dictation: "La validación del método demuestra que produce resultados confiables evaluando exactitud, precisión, linealidad e interferencias analíticas antes de usarlo en rutina.",
},
{
  id: "electroitos", title: "Electrolitos y función renal", level: "Intermedio", category: "Laboratorio", emoji: "⚡",
  description: "Sodio, potasio, cloro y su interpretación clínica en desequilibrios hidroelectrolíticos.",
  readingTitle: "El equilibrio que sostiene todo",
  reading: [
    "Los electrolitos son iones disueltos en los fluidos corporales que mantienen el equilibrio osmótico, la función nerviosa y muscular y el equilibrio ácido-base. Los principales son el sodio (Na+), el potasio (K+) y el cloro (Cl−).",
    "El sodio es el principal catión extracelular y el principal determinante de la osmolalidad plasmática. La hiponatremia (Na+ bajo) puede producir confusión, convulsiones y coma. La hipernatremia (Na+ alto) se asocia a deshidratación grave.",
    "El potasio tiene un impacto directo en la función cardíaca. Una hipopotasemia severa puede producir arritmias letales. Una hiperpotasemia también puede desencadenar una parada cardíaca.",
    "El potasio es especialmente sensible a la hemólisis: cuando los glóbulos rojos se rompen, liberan su contenido intracelular de potasio al suero, elevando falsamente la potasemia.",
    "La brecha aniónica: AG = Na+ − (Cl− + HCO3−). Permite identificar la causa de una acidosis metabólica. Una brecha aniónica elevada sugiere la presencia de aniones no medidos como lactato, cetonas o toxinas.",
  ],
  vocab: [
    { es: "sodio / potasio / cloro", pt: "sódio / potássio / cloro" },
    { es: "hiponatremia / hipernatremia", pt: "hiponatremia / hipernatremia" },
    { es: "hipopotasemia / hiperpotasemia", pt: "hipopotassemia / hiperpotassemia" },
    { es: "osmolalidad", pt: "osmolalidade" },
    { es: "brecha aniónica / anion gap", pt: "ânion gap" },
    { es: "desequilibrio hidroelectrolítico", pt: "desequilíbrio hidroeletrolítico" },
  ],
  quiz: [
    { question: "¿Cuál es el principal catión extracelular?", options: ["Potasio (K+)", "Sodio (Na+)", "Calcio (Ca2+)", "Magnesio (Mg2+)"], answer: "Sodio (Na+)" },
    { question: "¿Qué puede ocurrir en una hiperpotasemia severa?", options: ["Solo debilidad muscular leve", "Arritmias letales o parada cardíaca", "Solo confusión mental", "Deshidratación severa"], answer: "Arritmias letales o parada cardíaca" },
    { question: "¿Por qué la hemólisis eleva falsamente el potasio?", options: ["Porque activa enzimas que producen potasio", "Porque los glóbulos rojos liberan su potasio intracelular al suero cuando se rompen", "Porque interfiere con el electrodo de medición", "Solo en muestras de plasma, no en suero"], answer: "Porque los glóbulos rojos liberan su potasio intracelular al suero cuando se rompen" },
    { question: "¿Qué es la brecha aniónica (anion gap)?", options: ["La diferencia entre sodio arterial y venoso", "AG = Na+ − (Cl− + HCO3−), útil para identificar causas de acidosis metabólica", "La suma de todos los cationes plasmáticos", "La diferencia entre osmolalidad medida y calculada"], answer: "AG = Na+ − (Cl− + HCO3−), útil para identificar causas de acidosis metabólica" },
    { question: "¿Qué indica una brecha aniónica elevada?", options: ["Alcalosis metabólica", "Presencia de aniones no medidos como lactato, cetonas o toxinas", "Deshidratación simple", "Solo error de calibración del equipo"], answer: "Presencia de aniones no medidos como lactato, cetonas o toxinas" },
    { question: "¿Con qué se asocia la hipernatremia?", options: ["Insuficiencia cardíaca", "Deshidratación grave con pérdida de agua libre", "Insuficiencia renal crónica", "Cirrosis hepática avanzada"], answer: "Deshidratación grave con pérdida de agua libre" },
    { question: "¿Por qué sodio y potasio son valores que pueden ser críticos?", options: ["Por exigencia de la norma ISO", "Sus alteraciones extremas pueden producir emergencias neurológicas y cardíacas letales", "Solo porque son los análisis más solicitados", "Solo en pacientes pediátricos"], answer: "Sus alteraciones extremas pueden producir emergencias neurológicas y cardíacas letales" },
    { question: "¿Qué función tienen los electrolitos en el organismo?", options: ["Solo regular la glucemia", "Mantener el equilibrio osmótico, la función nerviosa y muscular y el equilibrio ácido-base", "Solo regular la función renal", "Solo participar en la coagulación"], answer: "Mantener el equilibrio osmótico, la función nerviosa y muscular y el equilibrio ácido-base" },
  ],
  dictation: "Un potasio falsamente elevado por hemólisis debe sospecharse siempre antes de asumir hiperpotasemia real en un paciente sin factores de riesgo.",
},
{
  id: "no-conformidades", title: "No conformidades y CAPA", level: "Intermedio", category: "Gestión", emoji: "⚠️",
  description: "Detección, análisis de causa raíz y acciones correctivas y preventivas.",
  readingTitle: "El mismo error dos veces",
  reading: [
    "El área de calidad registró una nueva no conformidad relacionada con un error en el etiquetado de muestras durante el proceso de recepción. Al revisar el historial, el equipo encontró un incidente casi idéntico registrado seis meses antes, cerrado con una nota de 'informado al personal' pero sin ninguna acción correctiva formal.",
    "La situación planteaba una pregunta necesaria: ¿por qué el mismo error había ocurrido dos veces? Informar verbalmente al personal puede generar conciencia momentánea, pero sin un cambio en el proceso, el sistema sigue siendo igualmente vulnerable.",
    "Esta vez, el equipo decidió aplicar un análisis formal de causa raíz usando la técnica de los '5 Por qué'. La causa raíz identificada fue que el procedimiento escrito estaba desactualizado y no reflejaba el flujo real del proceso.",
    "Con la causa raíz identificada, el equipo diseñó una CAPA que incluía la actualización del procedimiento y un control de doble verificación: el operador que etiqueta un tubo debe confirmarlo con otro analista antes de que la muestra avance al siguiente paso.",
    "A los treinta días de implementadas las acciones, el indicador de no conformidades relacionadas con el proceso de recepción mostró una reducción del ochenta por ciento.",
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
    { question: "¿Qué uso final se dio al caso dentro del laboratorio?", options: ["Se archivó y nunca se volvió a mencionar", "Se incluyó como ejemplo positivo en el programa de inducción de nuevos analistas", "Se reportó como sanción disciplinaria", "Se usó para justificar una inversión en tecnología"], answer: "Se incluyó como ejemplo positivo en el programa de inducción de nuevos analistas" },
    { question: "¿Qué acción correctiva se implementó?", options: ["Contratar más personal", "Actualización del procedimiento y control de doble verificación antes de avanzar la muestra", "Cambiar completamente el sistema informático", "Reducir las solicitudes simultáneas aceptadas"], answer: "Actualización del procedimiento y control de doble verificación antes de avanzar la muestra" },
    { question: "¿Cuál es la diferencia entre una acción correctiva y una acción preventiva?", options: ["Son exactamente lo mismo", "La correctiva responde a un problema ya ocurrido; la preventiva actúa antes de que el problema ocurra", "La preventiva es siempre más costosa de implementar", "Solo la correctiva es exigida por la norma ISO 15189"], answer: "La correctiva responde a un problema ya ocurrido; la preventiva actúa antes de que el problema ocurra" },
    { question: "¿Qué significa la sigla CAPA?", options: ["Control Analítico de Procedimientos y Acciones", "Corrective Action and Preventive Action (Acción Correctiva y Preventiva)", "Criterio de Aceptación para Procesos Analíticos", "Control Administrativo de Procedimientos Alternativos"], answer: "Corrective Action and Preventive Action (Acción Correctiva y Preventiva)" },
    { question: "¿Cuándo debe cerrarse formalmente una no conformidad en el sistema de calidad?", options: ["Inmediatamente después de identificarla", "Solo después de verificar que las acciones implementadas fueron eficaces y el problema no se repitió", "Cuando el responsable de calidad lo decide", "Al final del año, en la revisión anual"], answer: "Solo después de verificar que las acciones implementadas fueron eficaces y el problema no se repitió" },
    { question: "¿Qué es el diagrama de Ishikawa y para qué se usa?", options: ["Un tipo de gráfico de control para el hemograma", "Un diagrama de causa y efecto que organiza visualmente las posibles causas de un problema", "El gráfico de Levey-Jennings para el control interno", "Un formulario de registro de no conformidades"], answer: "Un diagrama de causa y efecto que organiza visualmente las posibles causas de un problema" },
    { question: "¿Qué diferencia a una queja de una no conformidad?", options: ["Son términos completamente equivalentes", "La queja es una expresión de insatisfacción del cliente; la no conformidad es un incumplimiento de un requisito del sistema", "La queja siempre genera una no conformidad mayor", "Solo las no conformidades requieren documentación"], answer: "La queja es una expresión de insatisfacción del cliente; la no conformidad es un incumplimiento de un requisito del sistema" },
    { question: "¿Por qué es importante registrar las no conformidades aunque sean menores?", options: ["Solo por requisito burocrático", "Porque el análisis de patrones de no conformidades menores puede revelar fallas sistémicas antes de que ocurra un problema mayor", "Para sancionar al personal responsable", "Solo si afectaron resultados de pacientes"], answer: "Porque el análisis de patrones de no conformidades menores puede revelar fallas sistémicas antes de que ocurra un problema mayor" },
  ],
  dictation: "Una acción correctiva real debe identificar la causa raíz, cambiar el proceso y verificar la eficacia de las acciones implementadas.",
},
{
  id: "indicadores", title: "Indicadores de calidad", level: "Intermedio", category: "Gestión", emoji: "📈",
  description: "Interpretar, discutir y gestionar indicadores, metas y desvíos operativos.",
  readingTitle: "Cuando el indicador no cuenta toda la historia",
  reading: [
    "En la reunión mensual de revisión de indicadores, el equipo presentó el informe de desempeño del período. A primera vista, los números parecían buenos: el tiempo medio de respuesta se mantenía dentro del objetivo. Sin embargo, cuando la coordinadora comenzó a hacer preguntas más específicas, la imagen empezó a complicarse.",
    "Una analista señaló que el tiempo medio de respuesta como número global era engañoso. Si bien el promedio estaba dentro del objetivo, existían dos o tres casos por semana en los que muestras urgentes llegaban con retrasos superiores a cuatro horas.",
    "La coordinación propuso desagregar los indicadores en al menos tres categorías: muestras de rutina, muestras urgentes de ambulatorio y muestras urgentes de internación.",
    "Los indicadores de calidad son herramientas de gestión, no fines en sí mismos. Un indicador que siempre está verde puede ser una buena noticia o puede ser señal de que se está midiendo lo incorrecto.",
    "La reunión terminó con un acuerdo concreto: durante los próximos dos meses, el equipo implementaría los indicadores desagregados, definiría metas específicas y presentaría análisis de causa para los casos que superaran el límite.",
  ],
  vocab: [
    { es: "indicador", pt: "indicador" },
    { es: "desagregar datos", pt: "desagregar dados" },
    { es: "no conformidad", pt: "não conformidade" },
    { es: "promedio / media", pt: "média" },
    { es: "meta / objetivo", pt: "meta / objetivo" },
    { es: "mejora continua", pt: "melhoria contínua" },
  ],
  quiz: [
    { question: "¿Por qué era engañoso el tiempo medio de respuesta como indicador global?", options: ["Porque era demasiado alto", "Porque ocultaba retrasos graves en muestras urgentes de pacientes críticos", "Porque no se medía correctamente", "Porque no era el indicador adecuado"], answer: "Porque ocultaba retrasos graves en muestras urgentes de pacientes críticos" },
    { question: "¿En qué categorías propuso desagregar el indicador la coordinación?", options: ["Por analista responsable y por turno", "Muestras de rutina, urgentes de ambulatorio y urgentes de internación", "Solo por tipo de análisis solicitado", "Por cliente y por mes"], answer: "Muestras de rutina, urgentes de ambulatorio y urgentes de internación" },
    { question: "¿Por qué un indicador siempre en verde puede ser problemático?", options: ["Nunca es problemático si está en verde", "Puede indicar que se mide lo incorrecto o que el umbral está mal definido", "Indica que el laboratorio funciona perfectamente", "Solo es problema si el cliente se queja"], answer: "Puede indicar que se mide lo incorrecto o que el umbral está mal definido" },
    { question: "¿Cuál es el verdadero valor de un indicador de calidad?", options: ["Estar siempre dentro del rango aceptable", "Orientar decisiones concretas y detectar problemas antes de que sean crisis", "Cumplir formalmente con los requisitos de la norma", "Mostrar resultados positivos al directorio"], answer: "Orientar decisiones concretas y detectar problemas antes de que sean crisis" },
    { question: "¿Quiénes deben participar en la selección de indicadores?", options: ["Solo el área de calidad", "Los profesionales que conocen el proceso desde adentro", "Solo la dirección del laboratorio", "Solo los auditores externos"], answer: "Los profesionales que conocen el proceso desde adentro" },
    { question: "¿Qué estructura de seguimiento se acordó implementar?", options: ["Revisar indicadores solo si hay quejas", "Responsables por indicador, metas específicas, análisis de causa y fechas de revisión", "Solo un informe anual de resultados", "Revisar mensualmente sin asignar responsables"], answer: "Responsables por indicador, metas específicas, análisis de causa y fechas de revisión" },
    { question: "¿Qué transforma a un indicador en una herramienta real de mejora?", options: ["Publicarlo en la cartelera", "La estructura de seguimiento con responsables, fechas y análisis concretos", "Calcularlo con mayor frecuencia", "Compararlo con indicadores de otros laboratorios"], answer: "La estructura de seguimiento con responsables, fechas y análisis concretos" },
    { question: "¿Cuántos casos de retraso grave se detectaban por semana?", options: ["Más de veinte", "Dos o tres casos con retrasos mayores a cuatro horas", "Ninguno según el indicador global", "Solo uno al mes"], answer: "Dos o tres casos con retrasos mayores a cuatro horas" },
    { question: "¿Cuál es la diferencia entre una meta y un límite de alerta en un indicador?", options: ["Son el mismo concepto con distintos nombres", "La meta es el valor óptimo esperado; el límite de alerta es el punto a partir del cual se investiga activamente", "El límite de alerta siempre es más exigente que la meta", "Solo existen límites, no metas en gestión de calidad"], answer: "La meta es el valor óptimo esperado; el límite de alerta es el punto a partir del cual se investiga activamente" },
    { question: "¿Con qué frecuencia deben revisarse los indicadores de un laboratorio clínico?", options: ["Solo una vez al año en la revisión anual", "Con una frecuencia definida según la criticidad del indicador: mensual para los críticos, trimestral para otros", "Solo cuando hay una auditoría", "Solo cuando un cliente hace una queja formal"], answer: "Con una frecuencia definida según la criticidad del indicador: mensual para los críticos, trimestral para otros" },
    { question: "¿Qué es un indicador rezagado (lagging) a diferencia de uno adelantado (leading)?", options: ["Son términos sinónimos en gestión de calidad", "El rezagado mide lo que ya ocurrió; el adelantado predice tendencias antes de que el problema ocurra", "El adelantado siempre es más preciso que el rezagado", "Solo se usan indicadores rezagados en laboratorio clínico"], answer: "El rezagado mide lo que ya ocurrió; el adelantado predice tendencias antes de que el problema ocurra" },
    { question: "¿Cómo se calcula el porcentaje de muestras rechazadas por criterios preanalíticos?", options: ["(Muestras rechazadas / Total de muestras recibidas) × 100", "Solo el número absoluto de rechazos por mes", "Rechazos / Total de análisis realizados", "No se puede calcular con precisión en la práctica"], answer: "(Muestras rechazadas / Total de muestras recibidas) × 100" },
    { question: "¿Por qué los indicadores de calidad son un requisito de la ISO 15189?", options: ["Solo como formalidad sin impacto real", "Porque permiten demostrar que el laboratorio monitorea su desempeño y actúa sobre él de forma sistemática", "Solo porque lo exige el organismo acreditador", "Para poder emitir el Certificado de Aptitud"], answer: "Porque permiten demostrar que el laboratorio monitorea su desempeño y actúa sobre él de forma sistemática" },
  ],
  dictation: "Los indicadores de calidad son útiles solo si se interpretan en contexto, se desagregan correctamente y se usan para tomar decisiones reales de mejora.",
},
{
  id: "iso15189", title: "ISO 15189", level: "Avanzado", category: "Gestión", emoji: "🏅",
  description: "Requisitos de la norma internacional para laboratorios clínicos.",
  readingTitle: "El estándar que define la excelencia",
  reading: [
    "La norma ISO 15189 es el estándar internacional que establece los requisitos específicos de calidad y competencia para los laboratorios clínicos. Está diseñada específicamente para el contexto del laboratorio médico, a diferencia de la ISO 17025, que aplica a laboratorios de ensayo en general.",
    "La norma está estructurada en dos grandes bloques: los requisitos de gestión, que incluyen el sistema de gestión de la calidad, el control de documentos, la gestión de no conformidades y las auditorías internas; y los requisitos técnicos, que abordan el personal, las instalaciones, los equipos y los procesos.",
    "Uno de los conceptos centrales de la ISO 15189 es el enfoque en el paciente. El laboratorio no es solo un proveedor de datos numéricos: es un actor clave en la cadena de atención al paciente.",
    "La acreditación bajo ISO 15189 es un proceso formal en el que un organismo evaluador independiente verifica que el laboratorio cumple con todos los requisitos de la norma. Los evaluadores son profesionales con experiencia en laboratorio clínico.",
    "Implementar ISO 15189 no es solo cumplir con una lista de requisitos formales. Es adoptar una cultura de mejora continua en la que cada proceso es documentado, medido, evaluado y mejorado de manera sistemática.",
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
    { question: "¿Qué diferencia la acreditación ISO 15189 de la certificación ISO 9001?", options: ["Son equivalentes y se usan indistintamente", "La 15189 evalúa competencia técnica específica; la 9001 solo el sistema de gestión general", "La 9001 es más exigente técnicamente", "Solo difieren en el costo del proceso"], answer: "La 15189 evalúa competencia técnica específica; la 9001 solo el sistema de gestión general" },
    { question: "¿Quiénes son los evaluadores en una acreditación ISO 15189?", options: ["Auditores financieros generales", "Profesionales con experiencia en laboratorio clínico", "Funcionarios del gobierno de salud", "Solo personal del organismo acreditador sin experiencia técnica"], answer: "Profesionales con experiencia en laboratorio clínico" },
    { question: "¿Qué exige la norma respecto a los resultados críticos?", options: ["Incluirlos solo en el informe impreso", "Informarlos de manera oportuna al médico", "Solo documentarlos internamente", "Repetirlos antes de comunicarlos"], answer: "Informarlos de manera oportuna al médico" },
    { question: "¿La ISO 15189 es un fin en sí misma?", options: ["Sí, cumplirla es el objetivo principal", "No, es un medio para adoptar una cultura de mejora continua", "Sí, el certificado es lo que importa", "Depende del tipo de laboratorio"], answer: "No, es un medio para adoptar una cultura de mejora continua" },
    { question: "¿Qué reportan los laboratorios que implementan ISO 15189?", options: ["Solo mejoras en documentación formal", "Mejoras en calidad, satisfacción del cliente y motivación del personal", "Solo reducción de costos operativos", "Solo mejoras en tiempos de respuesta"], answer: "Mejoras en calidad, satisfacción del cliente y motivación del personal" },
    { question: "¿Qué es la revisión por la dirección en el contexto de la ISO 15189?", options: ["Una auditoría externa anual obligatoria", "Una revisión periódica formal del desempeño del sistema de calidad realizada por la alta dirección", "La revisión de los informes de calidad por el área técnica", "El proceso de renovación de la acreditación"], answer: "Una revisión periódica formal del desempeño del sistema de calidad realizada por la alta dirección" },
    { question: "¿Qué debe contener el manual de calidad de un laboratorio acreditado bajo ISO 15189?", options: ["Solo los procedimientos técnicos analíticos", "La política de calidad, objetivos, estructura del sistema de gestión y referencia a los procedimientos", "Solo los registros históricos de control de calidad", "Solo la lista de equipos acreditados"], answer: "La política de calidad, objetivos, estructura del sistema de gestión y referencia a los procedimientos" },
    { question: "¿Qué es la trazabilidad metrológica en el contexto de la ISO 15189?", options: ["El seguimiento de cada muestra dentro del laboratorio", "La propiedad de una medición que puede relacionarse con una referencia estándar mediante una cadena ininterrumpida de calibraciones", "El registro histórico de todas las calibraciones realizadas", "Solo aplica a los equipos de medición de volumen"], answer: "La propiedad de una medición que puede relacionarse con una referencia estándar mediante una cadena ininterrumpida de calibraciones" },
    { question: "¿Cuál es la diferencia entre la ISO 15189 y la ISO 17043?", options: ["Son normas equivalentes para laboratorios", "La ISO 15189 aplica a laboratorios clínicos; la ISO 17043 aplica a proveedores de ensayos de aptitud (EA) como Controllab", "La ISO 17043 es más exigente que la 15189", "Solo difieren en el organismo que las emite"], answer: "La ISO 15189 aplica a laboratorios clínicos; la ISO 17043 aplica a proveedores de ensayos de aptitud (EA) como Controllab" },
    { question: "¿Con qué frecuencia debe revisarse y actualizarse la documentación del sistema de calidad?", options: ["Solo cuando hay una auditoría externa", "Cada vez que hay un cambio en el proceso o la norma, con revisión periódica programada aunque no haya cambios", "Solo cuando el personal lo solicita", "Una vez cada cinco años"], answer: "Cada vez que hay un cambio en el proceso o la norma, con revisión periódica programada aunque no haya cambios" },
  ],
  dictation: "La ISO 15189 establece requisitos de calidad y competencia para laboratorios clínicos con enfoque en el paciente y en la mejora continua.",
},
{
  id: "gestion-riesgos", title: "Gestión de riesgos", level: "Avanzado", category: "Gestión", emoji: "⚖️",
  description: "Identificación, evaluación y control de riesgos en el laboratorio clínico.",
  readingTitle: "Lo que puede salir mal, antes de que salga",
  reading: [
    "La gestión de riesgos es el proceso sistemático de identificar qué podría salir mal en un proceso, evaluar la probabilidad y el impacto de ese evento, y tomar acciones para reducirlo a un nivel aceptable. En el laboratorio clínico, un riesgo no controlado puede derivar en un resultado incorrecto que afecte la salud del paciente.",
    "La ISO 15189 y la ISO 22367 exigen que los laboratorios implementen un proceso de gestión de riesgos para toda la fase preanalítica, analítica y postanalítica. El objetivo no es eliminar todos los riesgos, sino identificarlos explícitamente y gestionarlos de forma consciente.",
    "La evaluación del riesgo combina dos dimensiones: la probabilidad de que el evento ocurra y la severidad del impacto si ocurre. Una matriz de riesgo clasifica los riesgos en una escala: los de alta probabilidad y alto impacto son prioritarios.",
    "Un ejemplo práctico: el riesgo de que una muestra de potasio hemolizada sea liberada como resultado válido tiene una severidad alta pero puede reducirse con controles de verificación visual y bloqueo automático del sistema cuando la hemólisis supera un umbral definido.",
    "El proceso de gestión de riesgos es dinámico. Debe revisarse cuando ocurre un incidente, cuando se incorpora un nuevo proceso o equipo, y en las revisiones periódicas del sistema de gestión.",
  ],
  vocab: [
    { es: "riesgo", pt: "risco" },
    { es: "probabilidad / impacto", pt: "probabilidade / impacto" },
    { es: "matriz de riesgo", pt: "matriz de risco" },
    { es: "gestión proactiva", pt: "gestão proativa" },
    { es: "severidad", pt: "severidade" },
    { es: "control del riesgo", pt: "controle do risco" },
  ],
  quiz: [
    { question: "¿Cuál es el objetivo de la gestión de riesgos en el laboratorio?", options: ["Eliminar absolutamente todos los riesgos posibles", "Identificar riesgos explícitamente y gestionarlos a un nivel aceptable", "Documentar los errores ocurridos para fines legales", "Reducir los costos operativos del laboratorio"], answer: "Identificar riesgos explícitamente y gestionarlos a un nivel aceptable" },
    { question: "¿Qué dos dimensiones combina la evaluación del riesgo?", options: ["Costo y tiempo de resolución", "Probabilidad de ocurrencia y severidad del impacto", "Frecuencia histórica y costo de la acción correctiva", "Número de afectados y tipo de error"], answer: "Probabilidad de ocurrencia y severidad del impacto" },
    { question: "¿Qué riesgos son prioritarios en una matriz de riesgo?", options: ["Los de baja probabilidad y alto impacto únicamente", "Los de alta probabilidad y alto impacto", "Los más fáciles de resolver primero", "Los que afectan al personal técnico"], answer: "Los de alta probabilidad y alto impacto" },
    { question: "¿Cuándo debe revisarse el proceso de gestión de riesgos?", options: ["Solo una vez al año en la reunión anual", "Cuando ocurre un incidente, se incorpora algo nuevo o en revisiones periódicas del sistema", "Solo cuando lo exige el organismo acreditador", "Solo después de una auditoría externa"], answer: "Cuando ocurre un incidente, se incorpora algo nuevo o en revisiones periódicas del sistema" },
    { question: "¿Qué normas exigen gestión de riesgos en el laboratorio clínico?", options: ["Solo la norma CLIA 88", "ISO 15189 e ISO 22367 entre otras", "Solo la ISO 9001 de gestión general", "Solo la legislación sanitaria local"], answer: "ISO 15189 e ISO 22367 entre otras" },
    { question: "¿Cómo puede reducirse el riesgo de liberar un potasio hemolizado como válido?", options: ["Eliminando el análisis de potasio en hemolizados", "Con verificación visual y bloqueo automático cuando la hemólisis supera un umbral definido", "Solo repitiendo el análisis manualmente", "Solo documentando el incidente después"], answer: "Con verificación visual y bloqueo automático cuando la hemólisis supera un umbral definido" },
    { question: "¿Por qué la gestión de riesgos es un proceso dinámico?", options: ["Porque los riesgos desaparecen solos con el tiempo", "Porque los procesos, equipos y contextos cambian y nuevos riesgos pueden surgir", "Solo porque la norma lo exige", "Porque los riesgos no pueden documentarse de forma permanente"], answer: "Porque los procesos, equipos y contextos cambian y nuevos riesgos pueden surgir" },
    { question: "¿Qué beneficio adicional tiene gestionar riesgos proactivamente?", options: ["Elimina la necesidad de auditorías internas", "Reduce tanto los errores como el costo asociado a su corrección posterior", "Solo mejora la imagen del laboratorio ante los clientes", "Permite eliminar algunos controles internos"], answer: "Reduce tanto los errores como el costo asociado a su corrección posterior" },
  ],
  dictation: "La gestión de riesgos combina probabilidad e impacto para priorizar acciones y debe revisarse cada vez que cambia el proceso o cuando ocurre un incidente.",
},
{
  id: "documentacion", title: "Control de documentos", level: "Intermedio", category: "Gestión", emoji: "📋",
  description: "Procedimientos, registros y control de versiones en el sistema de calidad.",
  readingTitle: "El documento que nadie había actualizado",
  reading: [
    "En una auditoría de seguimiento, el evaluador pidió ver el procedimiento operativo estándar del área de hematología. El analista lo buscó en la carpeta de procedimientos y encontró dos versiones: una impresa de 2021 y otra digital de 2023. Cuando el evaluador preguntó cuál era la vigente, nadie en el turno pudo responderlo con seguridad.",
    "El control de documentos es uno de los requisitos más básicos y más frecuentemente encontrados como hallazgo en auditorías. Un sistema documental eficaz debe garantizar que solo los documentos vigentes están disponibles en los puntos de uso, que las versiones obsoletas están retiradas o claramente identificadas, y que cada documento tiene un responsable de revisión y aprobación.",
    "Los documentos del sistema de calidad incluyen los procedimientos operativos estándar (POE), las instrucciones de trabajo, los formularios y los registros. Los POE describen cómo se realiza una actividad. Los registros documentan que esa actividad fue realizada tal como se describe.",
    "Cada vez que un procedimiento cambia, debe seguirse el proceso de revisión y aprobación antes de implementarlo. El personal debe ser notificado del cambio y capacitado si es necesario.",
    "El control de versiones asigna un número de versión y una fecha de vigencia a cada documento. Un sistema informático de gestión documental facilita enormemente este control, pero incluso con carpetas físicas es posible mantener un sistema eficaz con una lista maestra de documentos vigentes.",
  ],
  vocab: [
    { es: "procedimiento operativo estándar (POE)", pt: "procedimento operacional padrão (POP)" },
    { es: "versión vigente", pt: "versão vigente" },
    { es: "lista maestra de documentos", pt: "lista mestra de documentos" },
    { es: "registro", pt: "registro" },
    { es: "revisión y aprobación", pt: "revisão e aprovação" },
    { es: "control de versiones", pt: "controle de versões" },
  ],
  quiz: [
    { question: "¿Qué problema crítico encontró el evaluador en la auditoría?", options: ["Un resultado incorrecto liberado", "Dos versiones del mismo procedimiento sin que nadie supo cuál era la vigente", "Un reactivo vencido en uso", "Un registro faltante"], answer: "Dos versiones del mismo procedimiento sin que nadie supo cuál era la vigente" },
    { question: "¿Qué debe garantizar un sistema documental eficaz?", options: ["Que todos los documentos estén impresos", "Que solo los documentos vigentes estén disponibles en los puntos de uso", "Que los documentos nunca cambien", "Que solo el director técnico acceda a los documentos"], answer: "Que solo los documentos vigentes estén disponibles en los puntos de uso" },
    { question: "¿Cuál es la diferencia entre un POE y un registro?", options: ["Son lo mismo con distinto nombre", "El POE describe cómo se realiza una actividad; el registro documenta que fue realizada", "El registro es más importante que el POE", "El POE es solo para el área técnica"], answer: "El POE describe cómo se realiza una actividad; el registro documenta que fue realizada" },
    { question: "¿Qué debe hacerse antes de implementar un cambio en un procedimiento?", options: ["Informarlo verbalmente al equipo", "Seguir el proceso de revisión y aprobación y notificar al personal", "Esperar la próxima auditoría para documentarlo", "Solo anotarlo en el acta de reunión"], answer: "Seguir el proceso de revisión y aprobación y notificar al personal" },
    { question: "¿Para qué sirve el número de versión de un documento?", options: ["Solo para fines estéticos", "Para identificar cuál es el documento vigente y rastrear su historial de cambios", "Para calcular cuántas veces fue revisado", "Solo para el organismo acreditador"], answer: "Para identificar cuál es el documento vigente y rastrear su historial de cambios" },
    { question: "¿Qué es la lista maestra de documentos?", options: ["Un archivo con todos los documentos escaneados", "El registro centralizado de todos los documentos vigentes con versión, fecha y responsable", "El índice del manual de calidad únicamente", "Solo la lista de procedimientos del área técnica"], answer: "El registro centralizado de todos los documentos vigentes con versión, fecha y responsable" },
    { question: "¿Qué ocurre si se usa un procedimiento obsoleto?", options: ["No tiene consecuencias si el resultado es correcto", "Puede generar errores, no conformidades y hallazgos en auditorías", "Solo es un problema formal sin impacto real", "Es aceptable si el equipo lo conoce de memoria"], answer: "Puede generar errores, no conformidades y hallazgos en auditorías" },
    { question: "¿Cuándo debe capacitarse al personal respecto a un documento actualizado?", options: ["Solo si el cambio es muy significativo", "Siempre que haya un cambio que afecte la forma de ejecutar una actividad", "Solo al ingresar al laboratorio por primera vez", "Solo si el personal lo solicita expresamente"], answer: "Siempre que haya un cambio que afecte la forma de ejecutar una actividad" },
  ],
  dictation: "El control de documentos garantiza que solo las versiones vigentes estén disponibles en los puntos de uso y que cada cambio sea aprobado y comunicado al personal.",
},
{
  id: "satisfaccion-cliente", title: "Satisfacción del cliente", level: "Intermedio", category: "Gestión", emoji: "😊",
  description: "Medir, analizar y actuar sobre la percepción del cliente del laboratorio.",
  readingTitle: "La encuesta que cambió las prioridades",
  reading: [
    "El laboratorio llevaba tres años sin realizar una encuesta formal de satisfacción. La dirección asumía que, si los clientes no se quejaban, estaban conformes. Cuando finalmente se implementó una encuesta anual, los resultados sorprendieron: el noventa y dos por ciento de los médicos estaba satisfecho con la calidad técnica de los resultados, pero solo el sesenta y uno por ciento lo estaba con la facilidad para contactar al laboratorio.",
    "La satisfacción del cliente es un indicador de calidad que la ISO 15189 exige monitorear de forma sistemática. No alcanza con resolver quejas cuando llegan: el laboratorio debe buscar activamente la percepción de sus clientes y actuar sobre ella.",
    "Las formas de recopilar información incluyen encuestas estructuradas, entrevistas telefónicas y análisis de quejas. Las encuestas dan datos comparables en el tiempo; las entrevistas permiten profundizar en causas; el análisis de quejas identifica los problemas que el cliente considera suficientemente graves para comunicar.",
    "Los datos de satisfacción deben analizarse con rigurosidad: ¿hay diferencias entre segmentos de clientes? ¿Qué áreas mejoraron? ¿Hay correlación entre la satisfacción y determinados procesos internos?",
    "El laboratorio que cierra el ciclo comunicando a sus clientes las acciones tomadas a partir de sus comentarios genera un vínculo de confianza difícil de lograr por otros medios.",
  ],
  vocab: [
    { es: "encuesta de satisfacción", pt: "pesquisa de satisfação" },
    { es: "percepción del cliente", pt: "percepção do cliente" },
    { es: "queja / reclamo", pt: "reclamação / queixa" },
    { es: "fidelización", pt: "fidelização" },
    { es: "retroalimentación", pt: "retroalimentação" },
    { es: "expectativas del cliente", pt: "expectativas do cliente" },
  ],
  quiz: [
    { question: "¿Qué reveló la encuesta de satisfacción del laboratorio?", options: ["Que los clientes estaban satisfechos con todo", "Alta satisfacción técnica pero baja satisfacción con la facilidad de contacto", "Que la calidad técnica era el mayor problema", "Que los clientes preferían otro laboratorio"], answer: "Alta satisfacción técnica pero baja satisfacción con la facilidad de contacto" },
    { question: "¿Qué exige la ISO 15189 respecto a la satisfacción del cliente?", options: ["Solo resolver las quejas cuando llegan", "Monitorear la satisfacción de forma sistemática y activa", "Realizar encuestas cada cinco años", "Solo medir la satisfacción de los médicos derivadores"], answer: "Monitorear la satisfacción de forma sistemática y activa" },
    { question: "¿Qué ventaja tienen las encuestas estructuradas?", options: ["Son más baratas que otros métodos", "Dan datos comparables en el tiempo que permiten identificar tendencias", "Son más rápidas de analizar", "Solo sirven para grandes laboratorios"], answer: "Dan datos comparables en el tiempo que permiten identificar tendencias" },
    { question: "¿Qué representan las quejas formales del cliente?", options: ["El problema más grave y frecuente", "La fracción visible de la insatisfacción: muchos insatisfechos no se quejan formalmente", "Una señal de que el cliente quiere seguir con el laboratorio", "Solo problemas administrativos sin impacto técnico"], answer: "La fracción visible de la insatisfacción: muchos insatisfechos no se quejan formalmente" },
    { question: "¿Con qué rigor deben analizarse los datos de satisfacción?", options: ["Con la misma rigurosidad que los datos analíticos, buscando tendencias y causas", "Solo como indicadores cualitativos sin análisis estadístico", "Solo comparándolos con el año anterior", "Con el rigor mínimo necesario para la norma"], answer: "Con la misma rigurosidad que los datos analíticos, buscando tendencias y causas" },
    { question: "¿Qué genera cerrar el ciclo comunicando acciones al cliente?", options: ["Obligación de resolver todos los problemas rápido", "Un vínculo de confianza difícil de lograr por otros medios", "Más quejas porque el cliente se siente habilitado", "Solo cumplimiento formal de la norma"], answer: "Un vínculo de confianza difícil de lograr por otros medios" },
    { question: "¿Qué error asumía la dirección antes de la encuesta?", options: ["Que los clientes siempre se quejan cuando algo falla", "Que la ausencia de quejas equivale a satisfacción total", "Que la satisfacción técnica no importa", "Que solo los médicos son clientes relevantes"], answer: "Que la ausencia de quejas equivale a satisfacción total" },
    { question: "¿Qué diferencia hay entre una queja y una no conformidad?", options: ["Son lo mismo con distinto nombre", "La queja viene del cliente externo; la no conformidad puede ser detectada internamente", "Solo las no conformidades requieren acción correctiva", "Solo las quejas requieren documentación"], answer: "La queja viene del cliente externo; la no conformidad puede ser detectada internamente" },
  ],
  dictation: "La satisfacción del cliente debe medirse activamente porque la ausencia de quejas no equivale a satisfacción total con el servicio del laboratorio.",
},
{
  id: "formacion-personal", title: "Formación del personal", level: "Intermedio", category: "Gestión", emoji: "🎓",
  description: "Competencia, capacitación, evaluación y registro en el sistema de calidad.",
  readingTitle: "La analista que no sabía que no sabía",
  reading: [
    "Durante una revisión de competencias, el coordinador del área de hematología descubrió algo sorprendente: una analista con cuatro años de antigüedad nunca había sido evaluada formalmente en el procedimiento de frotis de sangre periférica. La técnica que usaba era la que le habían enseñado informalmente al ingresar, pero no estaba alineada con el procedimiento escrito vigente.",
    "La gestión de la competencia del personal es un pilar del sistema de calidad. La ISO 15189 requiere que el laboratorio defina los requisitos de competencia para cada función, que evalúe la competencia antes de que el personal trabaje de forma independiente, y que realice evaluaciones periódicas.",
    "La capacitación y la evaluación de competencias son procesos distintos. La capacitación transmite conocimiento y habilidades. La evaluación verifica que esos conocimientos se aplican correctamente en la práctica. Un analista puede haber sido capacitado sin haber adquirido competencia real.",
    "Los métodos de evaluación de competencias incluyen la observación directa del desempeño, la revisión de resultados históricos, la respuesta a preguntas técnicas y la participación en ensayos de aptitud (EA).",
    "Todos los registros de capacitación y evaluación deben mantenerse actualizados. Si un auditor pide demostrar que determinado analista es competente para realizar un análisis específico, el laboratorio debe poder responder con evidencia documentada.",
  ],
  vocab: [
    { es: "competencia del personal", pt: "competência do pessoal" },
    { es: "evaluación de competencias", pt: "avaliação de competências" },
    { es: "capacitación", pt: "capacitação / treinamento" },
    { es: "registro de formación", pt: "registro de treinamento" },
    { es: "evidencia documentada", pt: "evidência documentada" },
    { es: "trabajo independiente", pt: "trabalho independente" },
  ],
  quiz: [
    { question: "¿Qué problema se detectó con la analista de hematología?", options: ["Que cometió un error grave en un resultado", "Que nunca había sido evaluada formalmente en el procedimiento de frotis", "Que no tenía los títulos habilitantes", "Que usaba reactivos vencidos"], answer: "Que nunca había sido evaluada formalmente en el procedimiento de frotis" },
    { question: "¿Qué requiere la ISO 15189 respecto a la competencia?", options: ["Solo capacitación inicial al ingresar", "Definir requisitos, evaluar antes del trabajo independiente y hacer evaluaciones periódicas", "Solo evaluar cuando hay un error", "Solo documentar los títulos del personal"], answer: "Definir requisitos, evaluar antes del trabajo independiente y hacer evaluaciones periódicas" },
    { question: "¿Cuál es la diferencia entre capacitación y evaluación de competencias?", options: ["Son lo mismo con distinto nombre", "La capacitación transmite habilidades; la evaluación verifica que se aplican correctamente en práctica", "La evaluación es solo para el personal nuevo", "La capacitación es obligatoria y la evaluación es opcional"], answer: "La capacitación transmite habilidades; la evaluación verifica que se aplican correctamente en práctica" },
    { question: "¿Qué métodos se usan para evaluar competencias?", options: ["Solo un examen escrito de opción múltiple", "Observación directa, revisión de resultados históricos, preguntas técnicas y participación en EA", "Solo la revisión del currículum del analista", "Solo la antigüedad en el puesto"], answer: "Observación directa, revisión de resultados históricos, preguntas técnicas y participación en EA" },
    { question: "¿Qué debe hacer el laboratorio si un analista cambia de área o función?", options: ["Asumir que la competencia previa es suficiente", "Evaluar la competencia específica para la nueva función antes del trabajo independiente", "Solo hacer una capacitación informal", "Solo registrar el cambio de puesto"], answer: "Evaluar la competencia específica para la nueva función antes del trabajo independiente" },
    { question: "¿Por qué es insuficiente haber sido capacitado sin evaluación de competencias?", options: ["No es insuficiente si la capacitación fue formal", "Porque un analista puede haber sido capacitado sin haber adquirido competencia real y verificable", "Solo es insuficiente para análisis de alto riesgo", "Porque la norma lo exige pero no es necesario en la práctica"], answer: "Porque un analista puede haber sido capacitado sin haber adquirido competencia real y verificable" },
    { question: "¿Qué debe poder mostrar el laboratorio ante un auditor sobre la competencia de un analista?", options: ["El contrato laboral del analista", "Evidencia documentada de capacitación y evaluación de competencias vigente", "Solo el título universitario del analista", "Solo el listado de cursos tomados"], answer: "Evidencia documentada de capacitación y evaluación de competencias vigente" },
    { question: "¿Con qué frecuencia deben realizarse las evaluaciones de competencias?", options: ["Solo al ingresar al laboratorio", "Periódicamente según lo definido por el laboratorio, como mínimo anualmente para funciones críticas", "Solo cuando el analista lo solicita", "Solo cuando hay un incidente relacionado"], answer: "Periódicamente según lo definido por el laboratorio, como mínimo anualmente para funciones críticas" },
  ],
  dictation: "La evaluación de competencias verifica que el analista aplica correctamente las habilidades en la práctica y debe documentarse con evidencia formal y periódica.",
},
{
  id: "planificacion-produccion", title: "Planificación de la producción", level: "Avanzado", category: "Gestión", emoji: "🏭",
  description: "Cómo planificar y controlar la producción laboratorial frente a objetivos de calidad y demanda.",
  readingTitle: "Producir más no siempre significa producir mejor",
  reading: [
    "La planificación de la producción laboratorial consiste en organizar los recursos disponibles —personal, equipos, reactivos y tiempo— para atender la demanda de análisis cumpliendo simultáneamente los objetivos de calidad definidos. Un laboratorio que solo maximiza el volumen sin controlar la calidad produce resultados en cantidad, pero no necesariamente resultados confiables.",
    "El primer paso de cualquier plan de producción es conocer la demanda: ¿cuántos análisis se procesan por día, por turno y por área? ¿Cuáles son los picos de demanda y cuándo ocurren? Sin este diagnóstico, cualquier planificación es arbitraria. Los datos históricos del LIMS son la fuente principal para este análisis.",
    "El segundo componente es la capacidad instalada: ¿cuántos análisis puede procesar cada equipo por hora? ¿Cuál es el tiempo de respuesta (TAT) esperado para cada tipo de muestra? ¿Con cuántos turnos y cuántos analistas por turno? La capacidad nominal del equipo —la declarada por el fabricante— casi siempre difiere de la capacidad real del proceso, que incluye tiempos de preparación, controles de calidad y mantenimiento.",
    "El tercer componente es la integración con los objetivos de calidad: el plan de producción debe incluir explícitamente el tiempo y los recursos destinados al control interno, la calibración periódica y la verificación de parámetros. Un plan que no prevé tiempo para el control de calidad inevitablemente lo sacrifica cuando hay presión de volumen.",
    "La revisión periódica del plan de producción es tan importante como su diseño inicial. Los indicadores de TAT, tasa de rechazo de muestras, tiempo perdido por fallas de equipo y porcentaje de resultados liberados fuera de plazo alimentan un ciclo de mejora continua que mantiene el plan alineado con la realidad operativa del laboratorio.",
  ],
  vocab: [
    { es: "planificación de la producción", pt: "planejamento da produção" },
    { es: "capacidad instalada / capacidad real", pt: "capacidade instalada / capacidade real" },
    { es: "tiempo de respuesta (TAT)", pt: "tempo de resposta (TAT)" },
    { es: "pico de demanda", pt: "pico de demanda" },
    { es: "recursos disponibles", pt: "recursos disponíveis" },
    { es: "ciclo de mejora continua", pt: "ciclo de melhoria contínua" },
  ],
  quiz: [
    { question: "¿Cuál es el objetivo principal de la planificación de la producción laboratorial?", options: ["Maximizar el volumen de análisis procesados por turno", "Organizar recursos para atender la demanda cumpliendo los objetivos de calidad simultáneamente", "Reducir el número de analistas necesarios", "Solo cumplir los plazos de entrega sin considerar la calidad"], answer: "Organizar recursos para atender la demanda cumpliendo los objetivos de calidad simultáneamente" },
    { question: "¿Cuál es el primer paso para elaborar un plan de producción?", options: ["Comprar equipos más rápidos", "Conocer la demanda real: análisis por día, por turno y por área, con sus picos", "Capacitar al personal en nuevas técnicas", "Definir los objetivos de calidad del laboratorio"], answer: "Conocer la demanda real: análisis por día, por turno y por área, con sus picos" },
    { question: "¿Qué diferencia hay entre capacidad nominal y capacidad real de un equipo?", options: ["Son exactamente lo mismo según la norma ISO", "La nominal es la declarada por el fabricante; la real incluye tiempos de preparación, controles y mantenimiento", "La capacidad real siempre supera a la nominal", "Solo difieren para equipos de más de diez años de uso"], answer: "La nominal es la declarada por el fabricante; la real incluye tiempos de preparación, controles y mantenimiento" },
    { question: "¿Qué ocurre cuando un plan de producción no prevé tiempo para el control de calidad?", options: ["El control de calidad se realiza igual, solo en otro momento", "El control se sacrifica cuando hay presión de volumen, comprometiendo la confiabilidad de los resultados", "No tiene consecuencias si el equipo está bien calibrado", "Solo afecta a los análisis urgentes"], answer: "El control se sacrifica cuando hay presión de volumen, comprometiendo la confiabilidad de los resultados" },
    { question: "¿Qué fuente de datos se menciona para analizar la demanda histórica?", options: ["Las encuestas de satisfacción de los médicos", "Los datos históricos del LIMS", "Los registros de facturación del área administrativa", "Solo los registros de control interno"], answer: "Los datos históricos del LIMS" },
    { question: "¿Qué indicadores alimentan la revisión periódica del plan de producción?", options: ["Solo el volumen total de análisis por mes", "TAT, tasa de rechazo, tiempo perdido por fallas y porcentaje de resultados fuera de plazo", "Solo el número de no conformidades detectadas", "Solo la satisfacción del cliente medida por encuesta"], answer: "TAT, tasa de rechazo, tiempo perdido por fallas y porcentaje de resultados fuera de plazo" },
    { question: "¿Por qué producir más volumen no garantiza producir mejor?", options: ["Porque el volumen y la calidad son siempre inversamente proporcionales", "Porque sin control de los parámetros de calidad, el aumento de volumen puede degradar la confiabilidad de los resultados", "Solo porque los equipos se desgastan más rápido con mayor volumen", "Porque los clientes no valoran la velocidad de entrega"], answer: "Porque sin control de los parámetros de calidad, el aumento de volumen puede degradar la confiabilidad de los resultados" },
    { question: "¿Con qué frecuencia debe revisarse el plan de producción?", options: ["Solo cuando hay una auditoría externa", "Periódicamente, alimentado por indicadores operativos que detectan desviaciones respecto a la realidad", "Solo al inicio de cada año calendario", "Solo cuando cambia el equipo analítico principal"], answer: "Periódicamente, alimentado por indicadores operativos que detectan desviaciones respecto a la realidad" },
    { question: "¿Qué relación tiene el plan de producción con los turnos de trabajo?", options: ["No tienen relación directa", "El plan debe definir cuántos analistas y qué equipos operan en cada turno para cubrir la demanda prevista", "Solo se aplica al turno de mayor volumen", "Solo importa para laboratorios con más de 50 empleados"], answer: "El plan debe definir cuántos analistas y qué equipos operan en cada turno para cubrir la demanda prevista" },
    { question: "¿Cómo impacta la tasa de rechazo de muestras en la planificación de la producción?", options: ["No impacta, las muestras rechazadas no consumen recursos", "Cada muestra rechazada genera trabajo adicional de comunicación y eventual repetición, que debe estar previsto en el plan", "Solo impacta en el área preanalítica, no en la planificación general", "Solo si supera el 10% del total de muestras"], answer: "Cada muestra rechazada genera trabajo adicional de comunicación y eventual repetición, que debe estar previsto en el plan" },
    { question: "¿Qué riesgo operativo genera no conocer los picos de demanda del laboratorio?", options: ["Ninguno si el equipo tiene capacidad nominal suficiente", "Subdimensionamiento en los momentos de mayor demanda, generando retrasos y errores bajo presión", "Solo un problema de facturación por subestimar el volumen", "Solo afecta la compra de reactivos"], answer: "Subdimensionamiento en los momentos de mayor demanda, generando retrasos y errores bajo presión" },
    { question: "¿Qué diferencia a un laboratorio que planifica la producción de uno que solo reacciona a la demanda?", options: ["No hay diferencia real en los resultados finales", "El que planifica puede anticipar problemas, asignar recursos preventivamente y mantener la calidad en picos de demanda", "Solo el laboratorio certificado ISO necesita planificar la producción", "Solo los laboratorios grandes necesitan planificación formal"], answer: "El que planifica puede anticipar problemas, asignar recursos preventivamente y mantener la calidad en picos de demanda" },
  ],
  dictation: "La planificación de la producción laboratorial debe integrar la demanda real, la capacidad instalada y el tiempo necesario para el control de calidad en cada turno.",
},
{
  id: "objetivos-calidad", title: "Objetivos de calidad y metas analíticas", level: "Avanzado", category: "Gestión", emoji: "🎯",
  description: "Cómo definir, comunicar y monitorear objetivos de calidad concretos para el laboratorio.",
  readingTitle: "Una meta que nadie recuerda no es una meta",
  reading: [
    "Los objetivos de calidad son declaraciones concretas y medibles de lo que el laboratorio se propone lograr en un período determinado en materia de desempeño analítico, satisfacción del cliente y mejora de procesos. La ISO 15189 exige que los laboratorios definan objetivos de calidad, pero no prescribe cuáles deben ser: esa decisión pertenece a la dirección y al equipo técnico de cada laboratorio.",
    "Un objetivo de calidad bien formulado cumple con criterios SMART: es Específico (qué se quiere lograr exactamente), Medible (con qué indicador se evaluará), Alcanzable (realista con los recursos disponibles), Relevante (conectado con las necesidades del cliente o del proceso) y Temporal (con un plazo definido). Un objetivo como 'mejorar la calidad' no es un objetivo SMART; 'reducir la tasa de rechazo de muestras preanalíticas del 4% al 2% en seis meses' sí lo es.",
    "Las metas analíticas son un subconjunto de los objetivos de calidad específicamente relacionadas con el desempeño de los métodos: error total permitido, imprecisión máxima admisible e inexactitud máxima admisible para cada ensayo. Estas metas deben basarse en las especificaciones de calidad definidas para el laboratorio, no en el desempeño histórico promedio.",
    "La comunicación de los objetivos al equipo es tan importante como su definición. Un objetivo que solo conoce la dirección no genera cambio en el comportamiento cotidiano de los analistas. Los mejores laboratorios hacen visibles sus objetivos de calidad: los publican en los espacios de trabajo, los revisan en las reuniones mensuales y los usan como referencia en la retroalimentación individual.",
    "El monitoreo de los objetivos de calidad requiere un sistema de indicadores que se midan regularmente y se revisen formalmente. La revisión por la dirección, que la ISO 15189 exige al menos una vez al año, es el momento institucional para evaluar si los objetivos del período fueron alcanzados, qué obstáculos aparecieron y cuáles serán los objetivos del próximo ciclo.",
  ],
  vocab: [
    { es: "objetivo de calidad", pt: "objetivo da qualidade" },
    { es: "meta analítica", pt: "meta analítica" },
    { es: "criterios SMART", pt: "critérios SMART" },
    { es: "revisión por la dirección", pt: "análise crítica pela direção" },
    { es: "indicador de desempeño", pt: "indicador de desempenho" },
    { es: "período de evaluación", pt: "período de avaliação" },
  ],
  quiz: [
    { question: "¿Qué son los objetivos de calidad en el contexto de ISO 15189?", options: ["Solo los requisitos técnicos de la norma", "Declaraciones concretas y medibles de lo que el laboratorio se propone lograr en un período determinado", "Los valores de referencia de cada analito", "Los límites del control interno de calidad"], answer: "Declaraciones concretas y medibles de lo que el laboratorio se propone lograr en un período determinado" },
    { question: "¿Qué significa que un objetivo sea 'medible' según los criterios SMART?", options: ["Que se puede calcular matemáticamente en cualquier situación", "Que existe un indicador concreto con el que se evaluará si se logró o no", "Que es cuantitativo, nunca cualitativo", "Que lo puede medir cualquier integrante del equipo sin capacitación"], answer: "Que existe un indicador concreto con el que se evaluará si se logró o no" },
    { question: "¿Cuál de estos es un objetivo SMART correctamente formulado?", options: ["Mejorar la calidad de los resultados del laboratorio", "Reducir la tasa de rechazo preanalítico del 4% al 2% en seis meses", "Hacer más controles internos este año", "Que todos los analistas trabajen mejor"], answer: "Reducir la tasa de rechazo preanalítico del 4% al 2% en seis meses" },
    { question: "¿En qué se diferencian las metas analíticas de los objetivos de calidad generales?", options: ["Son exactamente lo mismo con distinto nombre", "Las metas analíticas son específicamente sobre el desempeño de los métodos: error total, imprecisión e inexactitud", "Los objetivos generales son siempre más exigentes que las metas analíticas", "Solo las metas analíticas son requeridas por la ISO 15189"], answer: "Las metas analíticas son específicamente sobre el desempeño de los métodos: error total, imprecisión e inexactitud" },
    { question: "¿En qué deben basarse las metas analíticas de un laboratorio?", options: ["En el desempeño histórico promedio del proceso", "En las especificaciones de calidad definidas con base en criterios clínicos o variación biológica", "En los límites de aceptación del fabricante del kit", "En los resultados del ensayo de aptitud del año anterior"], answer: "En las especificaciones de calidad definidas con base en criterios clínicos o variación biológica" },
    { question: "¿Por qué es insuficiente que solo la dirección conozca los objetivos de calidad?", options: ["No es insuficiente: la dirección es quien debe gestionar los objetivos", "Porque los objetivos generan cambio solo cuando el equipo los conoce y los tiene como referencia en su trabajo cotidiano", "Solo es insuficiente en laboratorios con más de 20 personas", "Porque la norma exige que estén publicados en el manual de calidad"], answer: "Porque los objetivos generan cambio solo cuando el equipo los conoce y los tiene como referencia en su trabajo cotidiano" },
    { question: "¿Qué exige la ISO 15189 respecto a la revisión por la dirección?", options: ["Que se realice antes de cada auditoría externa", "Que se realice al menos una vez al año para evaluar el sistema de gestión y los objetivos", "Solo que se documente en el manual de calidad", "Que la realice exclusivamente el director técnico"], answer: "Que se realice al menos una vez al año para evaluar el sistema de gestión y los objetivos" },
    { question: "¿Qué se evalúa en la revisión por la dirección respecto a los objetivos?", options: ["Solo si los indicadores estuvieron dentro del rango", "Si los objetivos del período fueron alcanzados, qué obstáculos aparecieron y cuáles serán los objetivos del próximo ciclo", "Solo el desempeño individual de cada analista", "Solo el cumplimiento de los requisitos legales"], answer: "Si los objetivos del período fueron alcanzados, qué obstáculos aparecieron y cuáles serán los objetivos del próximo ciclo" },
    { question: "¿Qué hace un objetivo 'temporal' según los criterios SMART?", options: ["Que se puede cambiar en cualquier momento", "Que tiene un plazo definido dentro del cual debe alcanzarse", "Que aplica solo a un período transitorio del laboratorio", "Que se evalúa más de una vez por año"], answer: "Que tiene un plazo definido dentro del cual debe alcanzarse" },
    { question: "¿Cómo hacen visibles sus objetivos de calidad los mejores laboratorios?", options: ["Solo en el manual de calidad que nadie lee en el día a día", "Publicándolos en espacios de trabajo, revisándolos en reuniones y usándolos en la retroalimentación individual", "Solo en la reunión anual de revisión por la dirección", "Solo cuando hay una auditoría próxima"], answer: "Publicándolos en espacios de trabajo, revisándolos en reuniones y usándolos en la retroalimentación individual" },
    { question: "¿Qué diferencia a un objetivo 'alcanzable' de uno que no lo es?", options: ["Que el alcanzable no requiere esfuerzo del equipo", "Que es realista con los recursos disponibles, aunque implique mejorar respecto a la situación actual", "Que ya fue logrado anteriormente por el mismo laboratorio", "Que lo propone el organismo acreditador, no el propio laboratorio"], answer: "Que es realista con los recursos disponibles, aunque implique mejorar respecto a la situación actual" },
    { question: "¿Qué riesgo tiene definir objetivos basados solo en el desempeño histórico promedio?", options: ["Ninguno, el desempeño histórico es siempre la mejor referencia", "Que se consolide un nivel de calidad insuficiente clínicamente, sin estímulo para mejorar", "Solo que el organismo acreditador no los acepte", "Que el equipo no pueda cumplirlos por ser demasiado exigentes"], answer: "Que se consolide un nivel de calidad insuficiente clínicamente, sin estímulo para mejorar" },
  ],
  dictation: "Los objetivos de calidad deben ser específicos, medibles y con plazo definido, y deben comunicarse al equipo para que orienten el trabajo cotidiano del laboratorio.",
},
{
  id: "acreditacion-proceso", title: "Proceso de acreditación ISO 15189", level: "Avanzado", category: "Gestión", emoji: "🏆",
  description: "Las etapas concretas del proceso de acreditación: desde la decisión hasta la evaluación en sitio.",
  readingTitle: "El camino tiene pasos, y los pasos tienen orden",
  reading: [
    "La acreditación bajo ISO 15189 no es un evento puntual: es un proceso que comienza mucho antes de la primera evaluación externa y continúa con ciclos de mantenimiento y renovación. Entender sus etapas permite al laboratorio planificar con realismo el tiempo, los recursos y las acciones necesarias.",
    "La primera etapa es la decisión estratégica: la dirección debe comprometerse formalmente con el proceso, asignar recursos humanos y financieros, y designar un responsable del sistema de calidad. Sin ese compromiso de la dirección, el proceso inevitablemente se paraliza ante los primeros obstáculos. La decisión también implica elegir al organismo acreditador, que en Brasil es la Cgcre/Inmetro; en otros países de Latinoamérica existen organismos equivalentes reconocidos por la ILAC.",
    "La segunda etapa es el diagnóstico de brechas: el laboratorio evalúa su situación actual frente a los requisitos de la norma e identifica qué procesos, documentos y evidencias están conformes y cuáles requieren trabajo. Este diagnóstico puede realizarse con recursos propios o con el apoyo de un consultor externo. El resultado es un plan de acción con responsables, plazos y prioridades.",
    "La tercera etapa es la implementación: el laboratorio desarrolla o actualiza su sistema de documentos, capacita al personal, implanta procesos que aún no existen —como la gestión formal de riesgos o la evaluación periódica de competencias— y genera las evidencias que demostrarán su conformidad. Esta etapa suele durar entre uno y dos años en laboratorios que parten de sistemas de calidad poco desarrollados.",
    "La cuarta etapa es la auditoría interna: antes de solicitar la evaluación externa, el laboratorio realiza una auditoría completa de su propio sistema para identificar no conformidades residuales y verificar que las acciones correctivas fueron eficaces. Una auditoría interna bien ejecutada reduce significativamente la cantidad de hallazgos en la evaluación externa.",
    "La quinta etapa es la evaluación en sitio: el organismo acreditador envía evaluadores —pares técnicos con experiencia en laboratorio clínico— que verifican documentos, observan procesos, entrevistan personal y revisan registros. Al finalizar, emiten un informe con los hallazgos. El laboratorio responde con un plan de acción para cada hallazgo y, una vez aprobado, recibe la acreditación.",
  ],
  vocab: [
    { es: "organismo acreditador", pt: "organismo acreditador" },
    { es: "diagnóstico de brechas", pt: "diagnóstico de lacunas" },
    { es: "plan de acción", pt: "plano de ação" },
    { es: "auditoría interna", pt: "auditoria interna" },
    { es: "evaluación en sitio", pt: "avaliação in loco" },
    { es: "hallazgo / no conformidad de auditoría", pt: "achado / não conformidade de auditoria" },
  ],
  quiz: [
    { question: "¿En cuántas etapas se puede dividir el proceso de acreditación ISO 15189?", options: ["Una sola: la evaluación en sitio", "Cinco etapas: decisión, diagnóstico, implementación, auditoría interna y evaluación en sitio", "Dos etapas: preparación y certificación", "Depende del organismo acreditador de cada país"], answer: "Cinco etapas: decisión, diagnóstico, implementación, auditoría interna y evaluación en sitio" },
    { question: "¿Por qué el compromiso de la dirección es indispensable en la primera etapa?", options: ["Solo por requisito formal de la norma", "Porque sin ese compromiso el proceso se paraliza ante los primeros obstáculos por falta de recursos y decisión", "Solo para motivar al equipo técnico", "Solo porque el organismo acreditador lo exige en la solicitud"], answer: "Porque sin ese compromiso el proceso se paraliza ante los primeros obstáculos por falta de recursos y decisión" },
    { question: "¿Cuál es el organismo acreditador en Brasil para laboratorios ISO 15189?", options: ["ANVISA", "Cgcre/Inmetro", "SBPC/ML", "CFM"], answer: "Cgcre/Inmetro" },
    { question: "¿Qué produce el diagnóstico de brechas?", options: ["El certificado provisional de acreditación", "Un plan de acción con responsables, plazos y prioridades para cerrar las diferencias con la norma", "El listado de documentos que deben actualizarse el primer mes", "La evaluación final del organismo acreditador"], answer: "Un plan de acción con responsables, plazos y prioridades para cerrar las diferencias con la norma" },
    { question: "¿Cuánto tiempo suele durar la etapa de implementación en laboratorios con sistemas poco desarrollados?", options: ["Un mes si se trabaja de forma intensiva", "Entre uno y dos años", "Exactamente seis meses según la norma", "Depende solo del presupuesto disponible"], answer: "Entre uno y dos años" },
    { question: "¿Para qué sirve la auditoría interna antes de la evaluación externa?", options: ["Para practicar la respuesta a las preguntas de los evaluadores", "Para identificar no conformidades residuales y verificar que las acciones correctivas fueron eficaces", "Solo para generar el registro que exige la norma", "Para reemplazar la evaluación externa si el resultado es bueno"], answer: "Para identificar no conformidades residuales y verificar que las acciones correctivas fueron eficaces" },
    { question: "¿Quiénes son los evaluadores en la evaluación en sitio de la ISO 15189?", options: ["Auditores financieros del organismo acreditador", "Pares técnicos con experiencia en laboratorio clínico designados por el organismo acreditador", "Solo funcionarios del Ministerio de Salud", "Personal de otras empresas del rubro seleccionado por el laboratorio"], answer: "Pares técnicos con experiencia en laboratorio clínico designados por el organismo acreditador" },
    { question: "¿Qué hace el laboratorio ante los hallazgos de la evaluación en sitio?", options: ["Los acepta sin más y espera la decisión final", "Responde con un plan de acción para cada hallazgo que debe ser aprobado por el organismo", "Los contesta solo si considera que son incorrectos", "Solicita una nueva evaluación inmediatamente"], answer: "Responde con un plan de acción para cada hallazgo que debe ser aprobado por el organismo" },
    { question: "¿Qué reduce significativamente la auditoría interna bien ejecutada?", options: ["El costo total del proceso de acreditación", "La cantidad de hallazgos en la evaluación externa posterior", "El tiempo de la evaluación en sitio", "La necesidad de capacitación del personal"], answer: "La cantidad de hallazgos en la evaluación externa posterior" },
    { question: "¿Qué ocurre después de obtener la acreditación?", options: ["El proceso termina y no requiere más acciones", "El laboratorio entra en ciclos de mantenimiento y renovación con evaluaciones periódicas", "Solo debe renovar la documentación cada cinco años", "Solo debe participar en ensayos de aptitud externos"], answer: "El laboratorio entra en ciclos de mantenimiento y renovación con evaluaciones periódicas" },
    { question: "¿Qué verifica el evaluador durante la evaluación en sitio?", options: ["Solo los documentos del sistema de calidad", "Documentos, procesos observados en tiempo real, entrevistas al personal y revisión de registros", "Solo los resultados de los controles internos del año", "Solo el cumplimiento de los requisitos técnicos analíticos"], answer: "Documentos, procesos observados en tiempo real, entrevistas al personal y revisión de registros" },
    { question: "¿Por qué la acreditación ISO 15189 no es solo una cuestión de documentación?", options: ["Porque la norma no exige documentación extensa", "Porque la evaluación verifica también que los procesos reales se ejecutan como se describe, no solo que existen los papeles", "Solo porque los evaluadores prefieren hacer entrevistas", "Porque la documentación es responsabilidad del área administrativa, no del área técnica"], answer: "Porque la evaluación verifica también que los procesos reales se ejecutan como se describe, no solo que existen los papeles" },
  ],
  dictation: "El proceso de acreditación ISO 15189 incluye diagnóstico de brechas, implementación, auditoría interna y evaluación en sitio por pares técnicos del organismo acreditador.",
},
{
  id: "costos-calidad", title: "Costos de la calidad y la no-calidad", level: "Avanzado", category: "Gestión", emoji: "💰",
  description: "Cómo identificar y gestionar los costos asociados a la calidad y a los errores en el laboratorio.",
  readingTitle: "Lo que cuesta hacer bien y lo que cuesta hacer mal",
  reading: [
    "En el laboratorio clínico, cada error tiene un costo. Pero también lo tiene cada medida que se toma para prevenirlo. La gestión de los costos de la calidad parte de reconocer que la calidad no es gratis —requiere inversión— pero que la no-calidad tampoco lo es: los errores generan reprocesos, pérdida de muestras, comunicaciones adicionales, daño a la reputación y, en el peor de los casos, daño al paciente.",
    "Los costos de la calidad se clasifican en cuatro categorías. Los costos de prevención incluyen todo lo invertido para evitar que ocurran errores: capacitación del personal, diseño y actualización de procedimientos, planificación del sistema de calidad y mantenimiento preventivo de equipos. Los costos de evaluación incluyen las actividades de inspección y verificación: el control interno diario, la participación en ensayos de aptitud y las auditorías internas.",
    "Los costos de fallas internas son los generados por errores detectados antes de que el resultado llegue al cliente: repetición de análisis por control fallido, descarte de reactivos vencidos por mala gestión del stock, tiempo perdido en investigaciones de no conformidades y reprocesamiento de muestras. Los costos de fallas externas son los más graves: ocurren cuando el error llega al cliente o al paciente, y pueden incluir devolución de informes, reclamos formales, asesoría legal y daño reputacional.",
    "El modelo clásico de gestión de costos de calidad propone encontrar el punto de equilibrio entre la inversión en prevención y evaluación —que reduce las fallas pero tiene un costo— y el costo de las fallas, que disminuye a medida que se invierte en prevención. Un laboratorio que invierte poco en prevención ahorra en el corto plazo pero paga más en fallas; uno que invierte demasiado puede estar sobreinvirtiendo en controles para un nivel de riesgo que ya es bajo.",
    "La aplicación práctica en el laboratorio comienza por hacer visible lo invisible: ¿cuánto tiempo por semana se dedica a repetir análisis por controles fallidos? ¿Cuántas muestras se rechazan y cuánto cuesta gestionarlas? ¿Cuántas llamadas técnicas recibe el laboratorio por resultados cuestionados? Cuantificar esos costos ocultos suele ser el argumento más convincente para justificar inversiones en calidad ante la dirección.",
  ],
  vocab: [
    { es: "costos de prevención", pt: "custos de prevenção" },
    { es: "costos de evaluación", pt: "custos de avaliação" },
    { es: "costos de fallas internas", pt: "custos de falhas internas" },
    { es: "costos de fallas externas", pt: "custos de falhas externas" },
    { es: "costos ocultos de la no-calidad", pt: "custos ocultos da não qualidade" },
    { es: "punto de equilibrio de la calidad", pt: "ponto de equilíbrio da qualidade" },
  ],
  quiz: [
    { question: "¿En cuántas categorías se clasifican los costos de la calidad?", options: ["Dos: prevención y corrección", "Cuatro: prevención, evaluación, fallas internas y fallas externas", "Tres: planificación, control y mejora", "Solo una categoría global de inversión en calidad"], answer: "Cuatro: prevención, evaluación, fallas internas y fallas externas" },
    { question: "¿Qué incluyen los costos de prevención?", options: ["El costo de repetir análisis fallidos", "Capacitación, diseño de procedimientos, planificación del sistema y mantenimiento preventivo", "El control interno diario y los ensayos de aptitud", "Las auditorías externas del organismo acreditador"], answer: "Capacitación, diseño de procedimientos, planificación del sistema y mantenimiento preventivo" },
    { question: "¿Qué distingue a los costos de fallas externas de los de fallas internas?", options: ["Las fallas externas son siempre más baratas que las internas", "Las fallas externas ocurren cuando el error llega al cliente o paciente; las internas se detectan y corrigen antes", "Solo las fallas externas generan no conformidades en el sistema de calidad", "Las fallas internas no tienen costo real para el laboratorio"], answer: "Las fallas externas ocurren cuando el error llega al cliente o paciente; las internas se detectan y corrigen antes" },
    { question: "¿Por qué las fallas externas son las más graves?", options: ["Porque son más frecuentes que las internas", "Porque pueden incluir reclamos legales, daño reputacional y potencialmente daño al paciente", "Solo porque son más costosas económicamente", "Porque el organismo acreditador las penaliza directamente"], answer: "Porque pueden incluir reclamos legales, daño reputacional y potencialmente daño al paciente" },
    { question: "¿Qué propone el modelo clásico de gestión de costos de calidad?", options: ["Eliminar todos los costos de evaluación para reducir gastos", "Encontrar el equilibrio entre inversión en prevención/evaluación y el costo de las fallas", "Maximizar siempre la inversión en prevención sin importar el costo", "Delegar los costos de calidad al proveedor de reactivos"], answer: "Encontrar el equilibrio entre inversión en prevención/evaluación y el costo de las fallas" },
    { question: "¿Qué ocurre en un laboratorio que invierte poco en prevención?", options: ["Ahorra recursos en el largo plazo sin consecuencias", "Ahorra en el corto plazo pero paga más en fallas internas y externas con el tiempo", "Solo tiene más trabajo administrativo", "Solo afecta la satisfacción del personal, no los resultados"], answer: "Ahorra en el corto plazo pero paga más en fallas internas y externas con el tiempo" },
    { question: "¿Cuál es el primer paso práctico para gestionar los costos de no-calidad?", options: ["Contratar más analistas para procesar más muestras", "Hacer visibles los costos ocultos: cuantificar tiempo en repeticiones, muestras rechazadas y llamadas técnicas", "Comprar el sistema de calidad más completo disponible", "Solicitar una auditoría externa para identificar los problemas"], answer: "Hacer visibles los costos ocultos: cuantificar tiempo en repeticiones, muestras rechazadas y llamadas técnicas" },
    { question: "¿Por qué cuantificar los costos ocultos es útil ante la dirección?", options: ["Solo por exigencia de la norma ISO 15189", "Porque convierte el argumento de calidad en un argumento económico concreto que justifica la inversión", "Solo porque mejora la imagen del responsable de calidad", "Porque los directores solo entienden argumentos técnicos"], answer: "Porque convierte el argumento de calidad en un argumento económico concreto que justifica la inversión" },
    { question: "¿Qué es un costo oculto de la no-calidad?", options: ["Un gasto que no aparece en el presupuesto pero genera pérdida real de tiempo y recursos", "Un error que nunca se detecta en el laboratorio", "El costo del control interno diario que no se registra", "Solo los errores que no generan quejas del cliente"], answer: "Un gasto que no aparece en el presupuesto pero genera pérdida real de tiempo y recursos" },
    { question: "¿Qué ejemplos de costos de fallas internas se mencionan?", options: ["Reclamos formales de médicos y devolución de informes", "Repetición por control fallido, descarte de reactivos vencidos, tiempo en investigaciones y reprocesamiento", "Capacitación del personal y diseño de procedimientos", "Participación en ensayos de aptitud y auditorías internas"], answer: "Repetición por control fallido, descarte de reactivos vencidos, tiempo en investigaciones y reprocesamiento" },
    { question: "¿Cuándo puede un laboratorio estar sobreinvirtiendo en calidad?", options: ["Nunca, siempre es necesario invertir más en calidad", "Cuando invierte más en controles para un nivel de riesgo que ya es bajo, generando costos sin beneficio adicional", "Solo cuando tiene más de dos auditores internos", "Solo cuando el organismo acreditador lo indica formalmente"], answer: "Cuando invierte más en controles para un nivel de riesgo que ya es bajo, generando costos sin beneficio adicional" },
    { question: "¿Por qué el mantenimiento preventivo de equipos es un costo de prevención y no de evaluación?", options: ["No es una distinción relevante en la práctica", "Porque su propósito es evitar que ocurra la falla, no detectarla una vez ocurrida", "Porque no genera ningún registro en el sistema de calidad", "Porque lo realiza el proveedor externo, no el personal del laboratorio"], answer: "Porque su propósito es evitar que ocurra la falla, no detectarla una vez ocurrida" },
  ],
  dictation: "Los costos de fallas externas son los más graves porque el error llega al cliente o al paciente; invertir en prevención reduce esos costos en el largo plazo.",
},
// ══ COMUNICACIÓN ══
{
  id: "atencion-cliente", title: "Atención técnica al cliente", level: "Intermedio", category: "Comunicación", emoji: "📞",
  description: "Español profesional para explicar resultados y gestionar consultas técnicas.",
  readingTitle: "Una llamada que exigía claridad",
  reading: [
    "A media mañana, una analista del área de atención al cliente recibió una llamada de un médico clínico que estaba confundido porque el informe de laboratorio de uno de sus pacientes mostraba un valor de creatinina diferente al del mes anterior.",
    "La analista escuchó el planteo completo sin interrumpir. Luego pidió al médico que le confirmara el número de solicitud y el nombre del paciente para poder acceder al historial.",
    "Al revisar el historial, la analista encontró la explicación: el laboratorio había implementado un nuevo método para la determinación de creatinina el mes anterior, con una calibración trazable a un estándar de referencia diferente.",
    "La analista explicó la situación con claridad, describió el cambio de método y el impacto clínico real. También se disculpó por no haber comunicado el cambio proactivamente y ofreció enviar una carta técnica con la información completa.",
    "La llamada terminó con el médico agradecido. El laboratorio estableció un procedimiento formal para comunicar a los médicos cualquier cambio de método con al menos quince días de anticipación.",
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
    { question: "¿Qué ofreció la analista al finalizar la llamada?", options: ["Solo una disculpa verbal", "Enviar una carta técnica con información completa sobre el cambio de método", "Repetir el análisis gratuitamente", "Revertir al método anterior"], answer: "Enviar una carta técnica con información completa sobre el cambio de método" },
    { question: "¿Cuál fue el error que el laboratorio reconoció?", options: ["Que el cambio de método no había sido validado", "Que no había comunicado proactivamente el cambio de método a los médicos", "Que el resultado estaba incorrecto", "Que el médico no había recibido el informe"], answer: "Que no había comunicado proactivamente el cambio de método a los médicos" },
    { question: "¿Qué procedimiento formal se implementó como mejora preventiva?", options: ["Volver a usar siempre el mismo método", "Comunicar a los médicos cualquier cambio de método con al menos 15 días de anticipación", "Solo notificar a los médicos que llamen a preguntar", "Publicar los cambios en el portal"], answer: "Comunicar a los médicos cualquier cambio de método con al menos 15 días de anticipación" },
    { question: "¿Qué hizo la analista mientras buscaba información en el sistema?", options: ["Puso al médico en espera en silencio", "Verbalizó en voz alta lo que estaba haciendo para transmitir atención y profesionalismo", "Le pidió que llamara más tarde", "Le transfirió la llamada"], answer: "Verbalizó en voz alta lo que estaba haciendo para transmitir atención y profesionalismo" },
    { question: "¿Qué lección central transmite este caso?", options: ["Que los médicos deben conocer mejor los métodos analíticos", "Que en atención técnica es necesario anticiparse a las dudas y comunicar proactivamente", "Que los cambios de método deben evitarse", "Que el teléfono es mejor que el correo para comunicar cambios"], answer: "Que en atención técnica es necesario anticiparse a las dudas y comunicar proactivamente" },
    { question: "¿Por qué es importante escuchar el planteo completo antes de responder?", options: ["Solo por cortesía formal", "Para entender el contexto completo y no responder basándose en una interpretación incorrecta del problema", "Para ganar tiempo mientras se busca la información", "Solo es importante si el cliente está muy enojado"], answer: "Para entender el contexto completo y no responder basándose en una interpretación incorrecta del problema" },
    { question: "¿Cómo debe formularse una disculpa profesional en atención técnica?", options: ["Evitando mencionar el error para no perder autoridad", "Reconociendo el error específico, explicando qué se hará diferente y comprometiéndose a mejorar", "Culpando al procedimiento anterior sin asumir responsabilidad", "Solo si el cliente la exige explícitamente"], answer: "Reconociendo el error específico, explicando qué se hará diferente y comprometiéndose a mejorar" },
    { question: "¿Qué información debe incluir una carta técnica sobre cambio de método?", options: ["Solo la fecha del cambio", "Descripción del nuevo método, motivo del cambio, impacto en los valores de referencia y acción recomendada para resultados históricos", "Solo el nombre del nuevo reactivo", "Solo la firma del director técnico"], answer: "Descripción del nuevo método, motivo del cambio, impacto en los valores de referencia y acción recomendada para resultados históricos" },
    { question: "¿Cómo se adapta el lenguaje técnico según el interlocutor?", options: ["Siempre se usa el mismo nivel de detalle técnico", "Se ajusta según si el interlocutor es un médico especialista, un médico general o un paciente", "Solo se simplifica para pacientes, nunca para médicos", "El lenguaje técnico no debe modificarse para mantener credibilidad"], answer: "Se ajusta según si el interlocutor es un médico especialista, un médico general o un paciente" },
    { question: "¿Qué herramientas ayudan a manejar una llamada técnica difícil con profesionalismo?", options: ["Transferir la llamada al director técnico siempre", "Escuchar activamente, tomar notas, parafrasear para confirmar comprensión y ofrecer próximos pasos concretos", "Responder rápido para demostrar conocimiento", "Evitar las preguntas del cliente haciéndolo hablar más"], answer: "Escuchar activamente, tomar notas, parafrasear para confirmar comprensión y ofrecer próximos pasos concretos" },
    { question: "¿Cuándo es apropiado escalar una consulta técnica a un superior o especialista?", options: ["Nunca, el analista debe resolver todo", "Cuando la consulta supera el conocimiento o autorización del analista, siendo transparente con el cliente", "Solo si el cliente lo exige", "Siempre, para demostrar que el laboratorio tiene jerarquía"], answer: "Cuando la consulta supera el conocimiento o autorización del analista, siendo transparente con el cliente" },
  ],
  dictation: "En atención técnica, no alcanza con tener razón: también es necesario comunicar proactivamente para evitar que las dudas se conviertan en problemas.",
},
{
  id: "llamada-urgente", title: "Llamada urgente al médico", level: "Intermedio", category: "Comunicación", emoji: "🚨",
  description: "Protocolo y lenguaje para comunicar resultados críticos por teléfono.",
  readingTitle: "La llamada que no puede esperar",
  reading: [
    "Hay resultados de laboratorio que no pueden esperar a que el médico revise el informe en el sistema. Son los llamados valores críticos o de pánico: resultados tan extremos que indican una amenaza inmediata para la vida del paciente y que requieren comunicación verbal directa.",
    "La lista de valores críticos incluye ejemplos como glucosa menor a 40 mg/dL o mayor a 500 mg/dL, potasio menor a 2.5 o mayor a 6.5 mEq/L, hemoglobina menor a 7 g/dL en adultos, y troponina muy elevada en contexto agudo.",
    "El procedimiento estándar implica varios pasos: el analista debe verificar el resultado antes de llamar, confirmando la identidad de la muestra y descartando errores preanalíticos. Luego llama al médico solicitante o, si no está disponible, al médico responsable del paciente.",
    "Durante la llamada, el analista comunica el nombre del paciente, el número de muestra, el análisis y el resultado, indica que se trata de un valor crítico, y espera confirmación verbal de que el médico recibió y entendió la información.",
    "Todo el proceso debe quedar documentado: fecha y hora de detección, resultado, nombre del analista que llamó, nombre del médico que recibió la llamada, hora de la llamada y confirmación de recepción.",
  ],
  vocab: [
    { es: "valor crítico / de pánico", pt: "valor crítico / de pânico" },
    { es: "protocolo de comunicación", pt: "protocolo de comunicação" },
    { es: "escalar", pt: "escalar / acionar" },
    { es: "confirmar recepción", pt: "confirmar recebimento" },
    { es: "guardia / servicio de urgencias", pt: "plantão / pronto-socorro" },
    { es: "trazabilidad de comunicación", pt: "rastreabilidade da comunicação" },
  ],
  quiz: [
    { question: "¿Por qué existen los protocolos de valores críticos?", options: ["Por exigencia burocrática solamente", "Porque ciertos resultados indican amenaza inmediata para la vida y no pueden esperar", "Para reducir la carga de trabajo del analista", "Solo para cumplir con la acreditación"], answer: "Porque ciertos resultados indican amenaza inmediata para la vida y no pueden esperar" },
    { question: "¿Qué debe verificar el analista antes de llamar?", options: ["Que el médico esté en su consultorio", "El resultado y la identidad de la muestra descartando errores preanalíticos", "Solo que el resultado esté fuera de rango", "Que el sistema registró el resultado"], answer: "El resultado y la identidad de la muestra descartando errores preanalíticos" },
    { question: "¿Es suficiente dejar un mensaje de voz o correo para comunicar un valor crítico?", options: ["Sí, si queda registrado", "No, la comunicación debe ser en tiempo real y verificada verbalmente", "Sí, si es fuera del horario habitual", "Solo si el médico no tiene disponibilidad inmediata"], answer: "No, la comunicación debe ser en tiempo real y verificada verbalmente" },
    { question: "¿Qué información debe comunicar el analista durante la llamada?", options: ["Solo el resultado y el nombre del paciente", "Nombre del paciente, número de muestra, análisis, resultado y confirmación de que es valor crítico", "Solo el análisis y el resultado numérico", "Solo el nombre del paciente y su diagnóstico previo"], answer: "Nombre del paciente, número de muestra, análisis, resultado y confirmación de que es valor crítico" },
    { question: "¿Qué debe documentarse en el registro de valores críticos?", options: ["Solo la fecha y el resultado", "Fecha, hora, resultado, analista, médico contactado, hora de llamada y confirmación", "Solo el nombre del médico y el resultado", "Solo si el médico hizo algún cambio en el tratamiento"], answer: "Fecha, hora, resultado, analista, médico contactado, hora de llamada y confirmación" },
    { question: "¿Qué se hace si no se puede contactar al médico solicitante?", options: ["Se deja el resultado en el sistema y se espera", "Se escala siguiendo el procedimiento: médico responsable, guardia o supervisor", "Se cancela el resultado hasta que el médico llame", "Se informa al día siguiente en el informe"], answer: "Se escala siguiendo el procedimiento: médico responsable, guardia o supervisor" },
    { question: "¿Por qué la trazabilidad de la comunicación puede tener consecuencias legales?", options: ["Solo por requisito de la norma de calidad", "Porque documenta si se actuó correctamente ante una emergencia clínica", "Solo si el paciente hace una queja formal", "No tiene consecuencias legales reales"], answer: "Porque documenta si se actuó correctamente ante una emergencia clínica" },
    { question: "¿Es un valor crítico de glucosa 300 mg/dL?", options: ["Sí, siempre es crítico", "No, el rango crítico típico es menor a 40 o mayor a 500 mg/dL", "Depende solo de la edad del paciente", "Sí, cualquier glucosa elevada es crítica"], answer: "No, el rango crítico típico es menor a 40 o mayor a 500 mg/dL" },
    { question: "¿Qué frase concreta usa el analista para confirmar que el médico entendió el valor crítico?", options: ["'¿Está bien?' y finaliza la llamada", "'¿Podría repetirme el valor que le informé para confirmar que lo recibió correctamente?'", "'El sistema ya tiene el resultado, puede revisarlo ahí'", "'Le envío un correo con el detalle para que tenga constancia'"], answer: "'¿Podría repetirme el valor que le informé para confirmar que lo recibió correctamente?'" },
    { question: "¿Cuánto tiempo máximo debe pasar entre detectar un valor crítico y comunicarlo al médico?", options: ["Al final del turno de trabajo", "Dentro de un tiempo definido en el procedimiento del laboratorio, generalmente entre 15 y 30 minutos", "Solo si el médico llama a preguntar", "Al emitir el informe final del día"], answer: "Dentro de un tiempo definido en el procedimiento del laboratorio, generalmente entre 15 y 30 minutos" },
    { question: "¿Qué hacer si el médico expresa dudas sobre el resultado crítico comunicado?", options: ["Insistir en que el resultado es correcto sin más información", "Ofrecer revisar la muestra, verificar el control del día y, si corresponde, repetir el análisis", "Decirle que llame a otro laboratorio", "Solo repetir el valor numérico sin más contexto"], answer: "Ofrecer revisar la muestra, verificar el control del día y, si corresponde, repetir el análisis" },
    { question: "¿Cada laboratorio puede definir sus propios valores críticos?", options: ["No, hay valores únicos internacionales para todos los laboratorios", "Sí, dentro de rangos clínicamente aceptables basados en guías, adaptados a la población atendida", "Solo si está acreditado por ISO 15189", "No, los valores críticos son definidos exclusivamente por el organismo regulador"], answer: "Sí, dentro de rangos clínicamente aceptables basados en guías, adaptados a la población atendida" },
    { question: "¿Qué indicador de calidad está directamente relacionado con los valores críticos?", options: ["El tiempo de respuesta promedio de todas las muestras", "El porcentaje de valores críticos comunicados dentro del tiempo establecido y documentados correctamente", "Solo el número total de valores críticos detectados por mes", "El costo de procesamiento de las muestras críticas"], answer: "El porcentaje de valores críticos comunicados dentro del tiempo establecido y documentados correctamente" },
  ],
  dictation: "La comunicación de valores críticos debe ser verbal, en tiempo real, verificada y documentada con nombre, hora y confirmación del médico.",
},
{
  id: "presentaciones", title: "Presentaciones técnicas", level: "Intermedio", category: "Comunicación", emoji: "🖥️",
  description: "Cómo estructurar y comunicar información técnica en presentaciones orales.",
  readingTitle: "La presentación que convenció al directorio",
  reading: [
    "La coordinadora de calidad del laboratorio tenía quince minutos para presentar al directorio los resultados del año en materia de calidad analítica. Sabía que la audiencia incluía personas con diferentes niveles de conocimiento técnico: directores médicos, directores financieros y el gerente de operaciones.",
    "Una presentación técnica efectiva comienza por entender a la audiencia. ¿Qué necesitan saber? ¿Qué decisiones deben tomar con esa información? El error más frecuente es presentar toda la información disponible en lugar de seleccionar la que es relevante para ese público específico.",
    "La estructura recomendada incluye: una apertura que contextualiza el tema, el desarrollo con los puntos clave ordenados de mayor a menor impacto, y un cierre con conclusiones claras y la recomendación específica.",
    "Las visualizaciones deben complementar el discurso, no repetirlo. Un gráfico claro que muestra la tendencia de los indicadores comunica más que cinco diapositivas llenas de tablas.",
    "El lenguaje debe adaptarse a la audiencia. Con directivos no técnicos, la clave es traducir datos técnicos a impacto operativo, económico o de riesgo que sea relevante para su rol.",
  ],
  vocab: [
    { es: "audiencia / público objetivo", pt: "audiência / público-alvo" },
    { es: "apertura / cierre", pt: "abertura / encerramento" },
    { es: "punto clave", pt: "ponto-chave" },
    { es: "visualización de datos", pt: "visualização de dados" },
    { es: "recomendación", pt: "recomendação" },
    { es: "adaptar el lenguaje", pt: "adaptar a linguagem" },
  ],
  quiz: [
    { question: "¿Cuál es el primer paso para preparar una presentación técnica efectiva?", options: ["Preparar todas las diapositivas posibles", "Entender a la audiencia: qué necesita saber y qué decisiones tomará", "Usar la plantilla corporativa estándar", "Incluir la mayor cantidad de datos disponibles"], answer: "Entender a la audiencia: qué necesita saber y qué decisiones tomará" },
    { question: "¿Cuál es el error más frecuente en presentaciones técnicas?", options: ["Usar demasiados gráficos", "Presentar toda la información disponible en lugar de la relevante para ese público", "Hablar demasiado despacio", "Usar términos técnicos con un público técnico"], answer: "Presentar toda la información disponible en lugar de la relevante para ese público" },
    { question: "¿Qué función tienen las visualizaciones en una presentación?", options: ["Repetir exactamente lo que dice el narrador", "Complementar el discurso mostrando datos de forma clara, no duplicar la información verbal", "Llenar el tiempo disponible", "Demostrar la complejidad técnica del tema"], answer: "Complementar el discurso mostrando datos de forma clara, no duplicar la información verbal" },
    { question: "¿Cómo debe estructurarse una presentación técnica?", options: ["Sin estructura fija, dejando que fluya", "Apertura con contexto, desarrollo de puntos clave y cierre con recomendación específica", "Solo con datos sin conclusiones", "Solo con conclusiones sin desarrollar el argumento"], answer: "Apertura con contexto, desarrollo de puntos clave y cierre con recomendación específica" },
    { question: "¿Cómo se presentan términos técnicos ante una audiencia mixta?", options: ["Se evitan completamente", "Se explican brevemente la primera vez que se usan sin interrumpir el flujo", "Se asume que todos los conocen", "Se incluye un glosario al final"], answer: "Se explican brevemente la primera vez que se usan sin interrumpir el flujo" },
    { question: "¿Cómo se traducen datos técnicos para directivos no técnicos?", options: ["Con más detalles estadísticos", "Traduciéndolos a impacto operativo, económico o de riesgo relevante para su rol", "Simplificando hasta perder precisión", "Con analogías deportivas únicamente"], answer: "Traduciéndolos a impacto operativo, económico o de riesgo relevante para su rol" },
    { question: "¿Qué transmite un cierre claro con recomendación específica?", options: ["Que el presentador no tiene más información", "Que la presentación tiene un propósito concreto y orienta la decisión", "Solo que el tiempo terminó", "Que el tema no requiere más análisis"], answer: "Que la presentación tiene un propósito concreto y orienta la decisión" },
    { question: "¿Por qué un gráfico claro comunica más que varias tablas?", options: ["Porque las tablas son técnicamente incorrectas", "Porque el cerebro procesa patrones visuales más rápido que datos numéricos en tabla", "Solo en presentaciones para público no técnico", "Solo cuando los datos son simples"], answer: "Porque el cerebro procesa patrones visuales más rápido que datos numéricos en tabla" },
  ],
  dictation: "Una presentación técnica efectiva selecciona la información relevante para la audiencia y traduce los datos en conclusiones claras con una recomendación específica.",
},
{
  id: "feedback-tecnico", title: "Dar y recibir feedback técnico", level: "Intermedio", category: "Comunicación", emoji: "💬",
  description: "Cómo comunicar observaciones técnicas al equipo de forma constructiva y efectiva.",
  readingTitle: "Lo que el supervisor no se animaba a decir",
  reading: [
    "El supervisor del área de microbiología llevaba semanas notando que un analista experimentado no respetaba el tiempo de estabilización de las placas después de sacarlas del refrigerador. Los resultados no habían tenido consecuencias clínicas visibles, pero el riesgo estaba presente.",
    "El supervisor sabía que el analista tenía más antigüedad que él. Finalmente, un principio simple lo ayudó a animarse: el feedback técnico no es una crítica personal, es información relevante para mejorar un proceso.",
    "El modelo SBI (Situación, Comportamiento, Impacto) estructura el feedback: primero la situación específica observada, luego el comportamiento concreto y finalmente el impacto técnico real o potencial.",
    "El feedback efectivo es específico y se basa en observaciones concretas, no en interpretaciones de la intención. 'Sembraste las placas sin estabilizar' es un hecho observable. 'No te importa la calidad' es una interpretación que destruye la conversación.",
    "Recibir feedback también es una habilidad: escuchar sin defenderse, hacer preguntas para entender mejor y agradecer la observación aunque sea incómoda construye una cultura de mejora continua.",
  ],
  vocab: [
    { es: "retroalimentación / feedback", pt: "feedback / retroalimentação" },
    { es: "observación concreta", pt: "observação concreta" },
    { es: "modelo SBI (Situación-Comportamiento-Impacto)", pt: "modelo SCI (Situação-Comportamento-Impacto)" },
    { es: "cultura de mejora", pt: "cultura de melhoria" },
    { es: "hecho observable vs. interpretación", pt: "fato observável vs. interpretação" },
    { es: "recibir crítica constructiva", pt: "receber crítica construtiva" },
  ],
  quiz: [
    { question: "¿Qué error técnico cometía el analista de microbiología?", options: ["Usaba reactivos vencidos", "No respetaba el tiempo de estabilización de las placas antes de sembrar", "Contaminaba las muestras", "No registraba los cultivos en el sistema"], answer: "No respetaba el tiempo de estabilización de las placas antes de sembrar" },
    { question: "¿Qué principio clave ayudó al supervisor?", options: ["Que el feedback es una crítica necesaria aunque duela", "Que el feedback técnico no es una crítica personal sino información para mejorar un proceso", "Que la antigüedad no protege de los errores", "Que el supervisor tiene autoridad para señalar errores"], answer: "Que el feedback técnico no es una crítica personal sino información para mejorar un proceso" },
    { question: "¿Cuáles son los tres componentes del modelo SBI?", options: ["Sugerencia, Beneficio, Instrucción", "Situación específica, Comportamiento concreto e Impacto técnico real o potencial", "Síntoma, Búsqueda, Intervención", "Señal, Bloqueo, Investigación"], answer: "Situación específica, Comportamiento concreto e Impacto técnico real o potencial" },
    { question: "¿Cuál es la diferencia entre hecho observable e interpretación?", options: ["Son lo mismo en feedback técnico", "'Sembraste sin estabilizar' es observable; 'no te importa la calidad' es interpretación que destruye la conversación", "Los hechos son subjetivos y las interpretaciones son objetivas", "Solo los hechos requieren evidencia"], answer: "'Sembraste sin estabilizar' es observable; 'no te importa la calidad' es interpretación que destruye la conversación" },
    { question: "¿Por qué el feedback debe ser específico?", options: ["Para cumplir con el formato de la norma de calidad", "Porque el feedback vago no permite a la persona saber exactamente qué cambiar", "Solo para documentar el incidente correctamente", "Para evitar conflictos legales"], answer: "Porque el feedback vago no permite a la persona saber exactamente qué cambiar" },
    { question: "¿Qué comportamientos caracterizan a quien recibe bien el feedback?", options: ["Defenderse de inmediato y explicar el motivo del error", "Escuchar sin defenderse, hacer preguntas para entender y agradecer la observación", "Ignorar el feedback si viene de alguien con menos experiencia", "Pedir que el feedback sea por escrito siempre"], answer: "Escuchar sin defenderse, hacer preguntas para entender y agradecer la observación" },
    { question: "¿Qué construye una cultura donde el feedback es frecuente y bienvenido?", options: ["Mayor control y supervisión de cada analista", "Una cultura de mejora continua donde los errores se reducen más rápido", "Mayor formalidad en las relaciones del equipo", "Mayor distancia entre supervisor y equipo"], answer: "Una cultura de mejora continua donde los errores se reducen más rápido" },
    { question: "¿Por qué la experiencia no debe inhibir dar feedback técnico?", options: ["Porque la jerarquía no existe en laboratorios modernos", "Porque los errores técnicos tienen impacto en la calidad independientemente de quién los comete", "Solo en laboratorios con acreditación ISO", "Porque los analistas experimentados siempre aceptan bien el feedback"], answer: "Porque los errores técnicos tienen impacto en la calidad independientemente de quién los comete" },
  ],
  dictation: "El feedback técnico efectivo describe una situación concreta, el comportamiento observado y el impacto técnico, sin interpretar la intención de la persona.",
},
{
  id: "correo-electronico", title: "Correo electrónico técnico", level: "Intermedio", category: "Comunicación", emoji: "✉️",
  description: "Redacción de emails formales en español para clientes, médicos y organismos.",
  readingTitle: "El correo que llegó tarde y mal escrito",
  reading: [
    "En el laboratorio clínico, el correo electrónico es una de las herramientas de comunicación más usadas y, al mismo tiempo, una de las más subestimadas. Un email mal redactado puede generar desconfianza, retrasar una decisión clínica o dañar la relación con un médico o cliente. Un email bien redactado, en cambio, resuelve problemas, genera credibilidad y queda registrado como evidencia.",
    "La estructura de un correo electrónico técnico formal en español tiene partes bien definidas: un asunto claro y específico que resume el contenido en pocas palabras, un saludo formal ('Estimado Dr. García:', 'Estimada Sra. López:'), el cuerpo del mensaje organizado en párrafos cortos, y un cierre profesional con los datos del remitente.",
    "El asunto es el elemento más importante del correo: es lo primero que lee el destinatario y lo que determina si abre el mensaje con urgencia o lo deja para después. Un asunto como 'Consulta' no dice nada. Uno como 'Cambio de método para creatinina a partir del 1 de abril' comunica exactamente de qué se trata.",
    "El tono del cuerpo del mensaje debe ser formal pero no frío. La clave es la cortesía funcional: se agradece, se explica, se solicita o se informa con claridad, sin rodeos innecesarios, pero siempre con respeto. Frases como 'En relación con su consulta del día de ayer' o 'Le informamos que a partir de la próxima semana' son ejemplos de apertura directa y profesional.",
    "Un error muy frecuente es escribir correos demasiado largos. El destinatario médico o cliente tiene poco tiempo: si el mensaje requiere más de tres párrafos para explicarse, probablemente necesita una llamada telefónica, no un correo. El correo electrónico técnico eficaz es conciso, claro y orientado a la acción.",
  ],
  vocab: [
    { es: "asunto del correo", pt: "assunto do e-mail" },
    { es: "destinatario / remitente", pt: "destinatário / remetente" },
    { es: "cuerpo del mensaje", pt: "corpo da mensagem" },
    { es: "adjunto / archivo adjunto", pt: "anexo / arquivo em anexo" },
    { es: "en relación con / con respecto a", pt: "em relação a / com referência a" },
    { es: "quedo a su disposición", pt: "fico à sua disposição" },
  ],
  quiz: [
    { question: "¿Qué determina si el destinatario abre el correo con urgencia?", options: ["La extensión del cuerpo del mensaje", "El asunto: debe ser claro y específico, no genérico", "El saludo inicial", "La firma del remitente"], answer: "El asunto: debe ser claro y específico, no genérico" },
    { question: "¿Cuál de estos asuntos es más efectivo para un correo técnico?", options: ["Consulta importante", "Cambio de método para creatinina a partir del 1 de abril", "Hola, escribo por un tema", "Información del laboratorio"], answer: "Cambio de método para creatinina a partir del 1 de abril" },
    { question: "¿Qué saludo formal es correcto para un correo a un médico?", options: ["Hola doctor García", "Estimado Dr. García:", "Querido colega:", "Buenos días García,"], answer: "Estimado Dr. García:" },
    { question: "¿Qué es la cortesía funcional en un correo técnico?", options: ["Usar muchas fórmulas de cortesía aunque el mensaje sea largo", "Ser formal y respetuoso siendo al mismo tiempo claro, directo y orientado a la acción", "Evitar cualquier tono personal en el mensaje", "Usar solo lenguaje técnico sin fórmulas de cortesía"], answer: "Ser formal y respetuoso siendo al mismo tiempo claro, directo y orientado a la acción" },
    { question: "¿Cuándo un correo largo debería ser una llamada telefónica?", options: ["Nunca, el correo siempre es preferible por dejar registro", "Cuando requiere más de tres párrafos para explicarse o hay urgencia clínica", "Solo si el destinatario lo solicita", "Solo para comunicar valores críticos"], answer: "Cuando requiere más de tres párrafos para explicarse o hay urgencia clínica" },
    { question: "¿Qué frase de apertura directa y profesional es correcta?", options: ["Como ya sabe usted...", "En relación con su consulta del día de ayer, le informamos que...", "Bueno, básicamente quería decirle que...", "Le escribo porque tengo que contarle algo importante"], answer: "En relación con su consulta del día de ayer, le informamos que..." },
    { question: "¿Qué valor tiene el correo electrónico técnico respecto a la llamada telefónica?", options: ["Es más rápido que la llamada en todos los casos", "Queda registrado como evidencia y permite al destinatario responder en su propio tiempo", "Es más personal que la llamada", "No tiene ventajas sobre la llamada en el contexto técnico"], answer: "Queda registrado como evidencia y permite al destinatario responder en su propio tiempo" },
    { question: "¿Cómo debe organizarse el cuerpo de un correo técnico formal?", options: ["En un solo párrafo continuo para mayor fluidez", "En párrafos cortos, cada uno con una idea principal", "Con viñetas y listas siempre", "Sin estructura fija, según el estilo del remitente"], answer: "En párrafos cortos, cada uno con una idea principal" },
    { question: "¿Qué incluye el cierre profesional de un correo técnico?", options: ["Solo el nombre del remitente", "Una fórmula de cierre, nombre completo, cargo, institución y datos de contacto", "Solo 'Saludos' sin más información", "Solo la firma digital automática del sistema"], answer: "Una fórmula de cierre, nombre completo, cargo, institución y datos de contacto" },
    { question: "¿Por qué un correo mal redactado puede tener consecuencias clínicas?", options: ["Solo tiene consecuencias estéticas", "Puede generar confusión sobre un resultado, retrasar una decisión médica o dañar la relación con el cliente", "Solo afecta la percepción del laboratorio, no la clínica", "Solo si el destinatario no entiende el idioma"], answer: "Puede generar confusión sobre un resultado, retrasar una decisión médica o dañar la relación con el cliente" },
    { question: "¿Cuándo es apropiado incluir un archivo adjunto en un correo técnico?", options: ["Siempre, para que el mensaje sea más completo", "Cuando hay documentación de respaldo relevante que el destinatario necesita, mencionándolo en el cuerpo", "Solo si el destinatario lo solicitó explícitamente antes", "Nunca, los archivos deben enviarse por otro canal"], answer: "Cuando hay documentación de respaldo relevante que el destinatario necesita, mencionándolo en el cuerpo" },
    { question: "¿Cómo se expresa correctamente una solicitud formal en un correo técnico en español?", options: ["'Necesito que usted...'", "'Le solicito que, de ser posible, nos confirme antes del viernes...'", "'Tiene que enviarnos el formulario'", "'Mándenos el resultado cuando pueda'"], answer: "'Le solicito que, de ser posible, nos confirme antes del viernes...'" },
    { question: "¿Qué diferencia hay entre 'adjunto' y 'en anexo' en un correo formal?", options: ["Son exactamente equivalentes y se usan indistintamente", "'Adjunto' es más informal y coloquial; 'en anexo' o 'adjunto a este correo' es la forma más formal en español profesional", "Solo 'adjunto' es correcto en español técnico", "Solo 'en anexo' se usa en comunicaciones con organismos oficiales"], answer: "'Adjunto' es más informal y coloquial; 'en anexo' o 'adjunto a este correo' es la forma más formal en español profesional" },
  ],
  dictation: "El asunto del correo técnico debe ser específico y el cuerpo debe ser conciso, formal y orientado a la acción para que el destinatario pueda responder con rapidez.",
},
{
  id: "manejo-quejas", title: "Manejo de quejas de clientes", level: "Intermedio", category: "Comunicación", emoji: "🤝",
  description: "Cómo recibir, registrar y responder quejas de clientes con profesionalismo.",
  readingTitle: "La queja que mejoró el laboratorio",
  reading: [
    "Una queja de un cliente no es un problema: es una oportunidad de información. Cuando un médico llama para quejarse de un resultado que tardó demasiado o de una muestra rechazada sin aviso previo, está dando al laboratorio información que de otro modo nunca recibiría. La mayoría de los clientes insatisfechos simplemente no vuelven, sin decir nada.",
    "El primer paso ante una queja es escuchar activamente, sin interrumpir y sin defenderse. El cliente necesita sentir que su queja fue escuchada y comprendida antes de recibir cualquier explicación. Interrumpirlo o justificarse demasiado pronto genera más frustración.",
    "Una vez escuchada la queja, el analista debe hacer tres cosas: agradecer la comunicación, disculparse por el inconveniente si corresponde, y comprometerse a investigar. El agradecimiento no implica aceptar que el laboratorio tuvo la culpa: implica valorar que el cliente tomó el tiempo de comunicarlo.",
    "El registro formal de la queja es obligatorio en un sistema de calidad. Debe incluir: fecha y hora de recepción, datos del cliente, descripción detallada del problema, análisis afectados, nombre del receptor y acciones tomadas. Este registro permite analizar tendencias y detectar problemas sistémicos.",
    "El cierre de la queja requiere una respuesta al cliente con el resultado de la investigación y las acciones correctivas implementadas. Un laboratorio que responde, explica y demuestra que mejoró a partir de la queja genera una confianza que difícilmente se obtiene por otro medio.",
  ],
  vocab: [
    { es: "queja / reclamo", pt: "reclamação / queixa" },
    { es: "escucha activa", pt: "escuta ativa" },
    { es: "disculpa formal", pt: "desculpa formal" },
    { es: "registro de la queja", pt: "registro da reclamação" },
    { es: "respuesta al cliente", pt: "resposta ao cliente" },
    { es: "cierre de la queja", pt: "encerramento da reclamação" },
  ],
  quiz: [
    { question: "¿Por qué una queja de un cliente es una oportunidad?", options: ["Porque permite facturar el servicio de atención adicional", "Porque da información que el laboratorio no obtendría de otra manera", "Porque obliga a mejorar solo cuando hay consecuencias legales", "Solo si el cliente es un médico derivador importante"], answer: "Porque da información que el laboratorio no obtendría de otra manera" },
    { question: "¿Qué hace la mayoría de los clientes insatisfechos según el texto?", options: ["Presentan quejas formales por escrito", "Simplemente no vuelven sin decir nada", "Llaman al organismo acreditador directamente", "Publican su experiencia en redes sociales"], answer: "Simplemente no vuelven sin decir nada" },
    { question: "¿Cuál es el primer paso ante una queja?", options: ["Explicar inmediatamente por qué ocurrió el problema", "Escuchar activamente sin interrumpir ni defenderse", "Derivar la queja al área de calidad", "Pedir los datos del cliente para registrar la queja"], answer: "Escuchar activamente sin interrumpir ni defenderse" },
    { question: "¿Por qué interrumpir al cliente que se queja genera más frustración?", options: ["Porque el cliente siempre tiene razón", "Porque necesita sentir que fue escuchado y comprendido antes de recibir cualquier explicación", "Solo si la queja es injustificada", "Porque interrumpir es una falta de respeto en cualquier contexto"], answer: "Porque necesita sentir que fue escuchado y comprendido antes de recibir cualquier explicación" },
    { question: "¿Qué tres acciones debe hacer el analista después de escuchar la queja?", options: ["Registrar, derivar y cerrar", "Agradecer la comunicación, disculparse si corresponde y comprometerse a investigar", "Defender al laboratorio, explicar el procedimiento y ofrecer un descuento", "Llamar al supervisor, registrar y esperar instrucciones"], answer: "Agradecer la comunicación, disculparse si corresponde y comprometerse a investigar" },
    { question: "¿Qué implica agradecer la queja del cliente?", options: ["Aceptar que el laboratorio tuvo la culpa del problema", "Valorar que el cliente tomó el tiempo de comunicarlo, independientemente de quién tenga razón", "Prometer que el error no se repetirá antes de investigarlo", "Solo es una fórmula de cortesía sin significado real"], answer: "Valorar que el cliente tomó el tiempo de comunicarlo, independientemente de quién tenga razón" },
    { question: "¿Qué debe incluir el registro formal de la queja?", options: ["Solo la descripción del problema y la solución ofrecida", "Fecha, datos del cliente, descripción del problema, análisis afectados, receptor y acciones tomadas", "Solo el nombre del cliente y la fecha", "Solo si la queja fue justificada"], answer: "Fecha, datos del cliente, descripción del problema, análisis afectados, receptor y acciones tomadas" },
    { question: "¿Para qué sirve analizar las tendencias de las quejas registradas?", options: ["Para sancionar al personal responsable", "Para detectar problemas sistémicos que se repiten y actuar sobre las causas raíz", "Solo para cumplir con el requisito de la norma", "Para calcular el costo de las quejas por año"], answer: "Para detectar problemas sistémicos que se repiten y actuar sobre las causas raíz" },
    { question: "¿Qué debe incluir el cierre formal de una queja?", options: ["Solo una disculpa adicional", "Una respuesta al cliente con el resultado de la investigación y las acciones correctivas implementadas", "Solo la confirmación de que la queja fue recibida", "Solo si el cliente vuelve a preguntar"], answer: "Una respuesta al cliente con el resultado de la investigación y las acciones correctivas implementadas" },
    { question: "¿Qué genera un laboratorio que responde quejas con investigación y mejora?", options: ["Más quejas porque el cliente se siente habilitado a reclamar", "Una confianza difícil de obtener por otro medio", "Mayor carga administrativa sin beneficio real", "Solo cumplimiento formal de la norma ISO 15189"], answer: "Una confianza difícil de obtener por otro medio" },
    { question: "¿Cuál es la diferencia entre una queja justificada y una injustificada en términos de gestión?", options: ["Las injustificadas no deben registrarse", "Ambas deben registrarse y responderse; la investigación determinará si el laboratorio tuvo responsabilidad", "Solo las justificadas generan acción correctiva", "Solo las injustificadas requieren respuesta formal al cliente"], answer: "Ambas deben registrarse y responderse; la investigación determinará si el laboratorio tuvo responsabilidad" },
    { question: "¿Cómo se diferencia una queja de una no conformidad interna?", options: ["Son exactamente lo mismo con distinto nombre", "La queja proviene de un cliente externo; la no conformidad puede ser detectada internamente sin intervención del cliente", "Solo las quejas generan acciones correctivas formales", "Las no conformidades son siempre más graves que las quejas"], answer: "La queja proviene de un cliente externo; la no conformidad puede ser detectada internamente sin intervención del cliente" },
    { question: "¿Qué tono es apropiado para responder una queja por escrito al cliente?", options: ["Defensivo pero educado", "Formal, empático, orientado a los hechos y a las acciones tomadas, sin culpar a terceros", "Muy informal para mostrar cercanía", "Técnico y frío para demostrar objetividad"], answer: "Formal, empático, orientado a los hechos y a las acciones tomadas, sin culpar a terceros" },
  ],
  dictation: "Ante una queja hay que escuchar sin interrumpir, agradecer la comunicación, investigar la causa y responder al cliente con las acciones correctivas implementadas.",
},
{
  id: "reuniones-actas", title: "Reuniones y actas técnicas", level: "Intermedio", category: "Comunicación", emoji: "📝",
  description: "Cómo participar, conducir y documentar reuniones técnicas en español.",
  readingTitle: "La reunión que sí tuvo resultados",
  reading: [
    "Una reunión técnica en el laboratorio tiene un propósito concreto: tomar decisiones, resolver problemas o compartir información relevante. Sin ese propósito claro, la reunión se convierte en una pérdida de tiempo para todos los participantes. La clave para que una reunión sea efectiva comienza antes de que empiece: con una agenda.",
    "La agenda de la reunión es el documento que lista los temas a tratar, el tiempo asignado a cada uno y quién es el responsable de presentarlos. Distribuir la agenda con anticipación permite que los participantes lleguen preparados y que la reunión no se desvíe hacia temas no planificados.",
    "Durante la reunión, el rol del conductor es mantener el foco, dar la palabra de forma ordenada y garantizar que cada tema tenga una conclusión concreta: una decisión tomada, una tarea asignada con responsable y fecha, o un tema que se pasa a la próxima reunión con justificación.",
    "El acta es el documento que registra lo que ocurrió en la reunión. Debe incluir: fecha, lugar, participantes, temas tratados, decisiones tomadas, tareas asignadas con responsable y fecha de cumplimiento, y próximos pasos. El acta debe distribuirse a todos los participantes dentro de las 24 a 48 horas posteriores a la reunión.",
    "En el contexto de la ISO 15189, las actas de reuniones técnicas, de revisión por la dirección y de seguimiento de indicadores son documentos del sistema de calidad. Deben conservarse, ser accesibles y estar disponibles para revisión en auditorías.",
  ],
  vocab: [
    { es: "agenda / orden del día", pt: "pauta / ordem do dia" },
    { es: "acta de reunión", pt: "ata de reunião" },
    { es: "conductor / moderador", pt: "condutor / moderador" },
    { es: "tarea asignada / responsable", pt: "tarefa atribuída / responsável" },
    { es: "próximos pasos", pt: "próximos passos" },
    { es: "tomar la palabra", pt: "pedir a palavra" },
  ],
  quiz: [
    { question: "¿Cuál es el propósito de una reunión técnica efectiva?", options: ["Informar sobre todas las novedades del período", "Tomar decisiones, resolver problemas o compartir información relevante con un propósito concreto", "Cumplir con la frecuencia exigida por la norma ISO", "Que todos los integrantes del equipo participen por igual"], answer: "Tomar decisiones, resolver problemas o compartir información relevante con un propósito concreto" },
    { question: "¿Qué debe incluir la agenda de una reunión técnica?", options: ["Solo la lista de participantes invitados", "Los temas a tratar, el tiempo asignado y el responsable de cada punto", "Solo el tema principal de la reunión", "Solo la fecha, hora y lugar"], answer: "Los temas a tratar, el tiempo asignado y el responsable de cada punto" },
    { question: "¿Por qué distribuir la agenda con anticipación?", options: ["Para que los participantes puedan cancelar si no les interesa el tema", "Para que lleguen preparados y la reunión no se desvíe hacia temas no planificados", "Solo por formalidad protocolar", "Para que el área de calidad apruebe los temas"], answer: "Para que lleguen preparados y la reunión no se desvíe hacia temas no planificados" },
    { question: "¿Cuál es el rol del conductor de la reunión?", options: ["Hablar la mayor parte del tiempo", "Mantener el foco, dar la palabra ordenadamente y garantizar conclusiones concretas por tema", "Solo tomar nota de lo que se dice", "Solo presentar los temas sin intervenir en la dinámica"], answer: "Mantener el foco, dar la palabra ordenadamente y garantizar conclusiones concretas por tema" },
    { question: "¿Qué debe tener cada tema de la agenda al cierre de la reunión?", options: ["Una presentación PowerPoint de respaldo", "Una decisión tomada, una tarea asignada o un pase justificado a la próxima reunión", "Solo el comentario del supervisor del área", "Solo una conclusión escrita sin responsable asignado"], answer: "Una decisión tomada, una tarea asignada o un pase justificado a la próxima reunión" },
    { question: "¿Qué debe incluir el acta de reunión?", options: ["Solo las decisiones tomadas", "Fecha, lugar, participantes, temas, decisiones, tareas con responsable y fecha, y próximos pasos", "Solo la lista de asistentes y los temas tratados", "Solo las tareas asignadas con sus responsables"], answer: "Fecha, lugar, participantes, temas, decisiones, tareas con responsable y fecha, y próximos pasos" },
    { question: "¿En cuánto tiempo debe distribuirse el acta después de la reunión?", options: ["En la próxima reunión del mes", "Dentro de las 24 a 48 horas posteriores a la reunión", "Solo si algún participante lo solicita", "Dentro de la semana laboral"], answer: "Dentro de las 24 a 48 horas posteriores a la reunión" },
    { question: "¿Por qué las actas son documentos del sistema de calidad en ISO 15189?", options: ["Solo por exigencia burocrática sin impacto real", "Porque evidencian que las reuniones de gestión ocurrieron y que las decisiones se tomaron y registraron", "Solo las actas de revisión por la dirección son documentos de calidad", "Solo si tienen la firma del director técnico"], answer: "Porque evidencian que las reuniones de gestión ocurrieron y que las decisiones se tomaron y registraron" },
    { question: "¿Qué ocurre si una reunión no tiene agenda previa?", options: ["Es más creativa y productiva sin estructura rígida", "Tiende a desviarse, extenderse y terminar sin conclusiones concretas", "Solo es un problema en reuniones con más de cinco personas", "No tiene consecuencias si el conductor es experimentado"], answer: "Tiende a desviarse, extenderse y terminar sin conclusiones concretas" },
    { question: "¿Cómo se pide la palabra formalmente en una reunión en español?", options: ["Se interrumpe cuando hay una pausa en el discurso", "Con expresiones como 'Si me permiten, quisiera agregar...' o 'Con respecto a ese punto...'", "Levantando la mano sin decir nada", "Solo si el conductor da la palabra directamente"], answer: "Con expresiones como 'Si me permiten, quisiera agregar...' o 'Con respecto a ese punto...'" },
    { question: "¿Cómo se registra una tarea asignada en el acta para que sea efectiva?", options: ["Solo con la descripción de la tarea", "Con la descripción, el nombre del responsable y la fecha límite de cumplimiento", "Solo con el nombre del responsable sin fecha", "Con la descripción y el área responsable sin nombrar a una persona"], answer: "Con la descripción, el nombre del responsable y la fecha límite de cumplimiento" },
    { question: "¿Qué diferencia hay entre el acta y la agenda de una reunión?", options: ["Son el mismo documento con distinto nombre", "La agenda se prepara antes y organiza la reunión; el acta se redacta después y registra lo que ocurrió", "El acta es más formal que la agenda siempre", "Solo la agenda es un documento del sistema de calidad"], answer: "La agenda se prepara antes y organiza la reunión; el acta se redacta después y registra lo que ocurrió" },
    { question: "¿Qué hace el conductor cuando la discusión de un tema se extiende demasiado?", options: ["Deja que continúe para no interrumpir la dinámica", "Interviene para redirigir: propone pasar el tema a una reunión específica o tomar una decisión provisional", "Cancela la reunión y la reprograma", "Solo lo anota como tema pendiente sin intervenir"], answer: "Interviene para redirigir: propone pasar el tema a una reunión específica o tomar una decisión provisional" },
  ],
  dictation: "El acta de reunión debe distribuirse dentro de las cuarenta y ocho horas con las decisiones tomadas, las tareas asignadas y el nombre del responsable de cada una.",
},
{
  id: "comunicacion-intercultural", title: "Comunicación intercultural", level: "Intermedio", category: "Comunicación", emoji: "🌎",
  description: "Diferencias culturales entre Brasil y países hispanohablantes en el ámbito del laboratorio.",
  readingTitle: "Más parecidos de lo que parece, más diferentes de lo que se cree",
  reading: [
    "Brasil y los países hispanohablantes de América Latina comparten una historia, una geografía y muchos valores culturales. Sin embargo, cuando un profesional brasileño interactúa en español con colegas de Argentina, México, Colombia o España, hay diferencias sutiles que pueden generar malentendidos si no se conocen.",
    "Una de las diferencias más frecuentes es el ritmo de la comunicación. En muchos países hispanohablantes, el estilo de comunicación profesional es más directo y explícito que en Brasil. Un colombiano o un argentino puede decir directamente 'ese resultado me parece incorrecto' donde un brasileño podría usar una formulación más indirecta. Ninguno de los dos estilos es mejor: son simplemente distintos.",
    "El uso del humor y la informalidad en reuniones técnicas también varía. En algunos países hispanohablantes, especialmente en el Cono Sur, es habitual mezclar humor e informalidad incluso en reuniones formales, lo que puede sorprender a un brasileño acostumbrado a un registro más protocolar en esos contextos.",
    "La gestión del tiempo y los plazos también presenta diferencias. En algunos contextos latinoamericanos, una reunión programada para las diez de la mañana puede comenzar con quince o veinte minutos de retraso sin que esto sea percibido como falta de respeto. Conocer esta norma cultural evita frustraciones innecesarias.",
    "La clave de la comunicación intercultural no es adoptar el estilo del otro ni juzgar el propio como superior. Es desarrollar la capacidad de observar, adaptar y preguntar cuando algo no queda claro. Un profesional del laboratorio que trabaja con clientes o colegas hispanohablantes necesita esta flexibilidad tanto como necesita el vocabulario técnico.",
  ],
  vocab: [
    { es: "diferencia cultural", pt: "diferença cultural" },
    { es: "estilo de comunicación directo / indirecto", pt: "estilo de comunicação direto / indireto" },
    { es: "malentendido", pt: "mal-entendido" },
    { es: "norma cultural / contexto cultural", pt: "norma cultural / contexto cultural" },
    { es: "adaptar el estilo", pt: "adaptar o estilo" },
    { es: "registro formal / informal", pt: "registro formal / informal" },
  ],
  quiz: [
    { question: "¿Cuál es una diferencia frecuente entre el estilo comunicativo brasileño y el de muchos hispanohablantes?", options: ["Los hispanohablantes son siempre más formales", "Los países hispanohablantes tienden a un estilo más directo y explícito que el brasileño", "Los brasileños son siempre más directos en contextos técnicos", "No existen diferencias reales entre ambos estilos"], answer: "Los países hispanohablantes tienden a un estilo más directo y explícito que el brasileño" },
    { question: "¿Qué puede causar el desconocimiento de las diferencias culturales?", options: ["Solo incomodidad momentánea sin consecuencias", "Malentendidos en la comunicación profesional que afectan la relación con clientes y colegas", "Solo problemas en contextos informales", "Solo dificultades lingüísticas con el vocabulario técnico"], answer: "Malentendidos en la comunicación profesional que afectan la relación con clientes y colegas" },
    { question: "¿Cómo debe interpretarse la mayor directitud de algunos hispanohablantes al dar feedback?", options: ["Como una falta de respeto hacia el interlocutor", "Como un estilo cultural diferente, no como agresividad o falta de cortesía", "Como señal de que el vínculo profesional no es bueno", "Solo como característica de personas con poco tacto"], answer: "Como un estilo cultural diferente, no como agresividad o falta de cortesía" },
    { question: "¿Qué característica del Cono Sur puede sorprender a un profesional brasileño en reuniones?", options: ["El uso exclusivo de tecnicismos en inglés", "La mezcla de humor e informalidad incluso en reuniones formales", "La puntualidad estricta al inicio de las reuniones", "El uso del tuteo en lugar del usted"], answer: "La mezcla de humor e informalidad incluso en reuniones formales" },
    { question: "¿Qué actitud favorece la comunicación intercultural efectiva?", options: ["Adoptar completamente el estilo cultural del interlocutor", "Observar, adaptar y preguntar cuando algo no queda claro, sin juzgar el estilo propio ni el ajeno", "Mantener siempre el estilo comunicativo propio para ser auténtico", "Evitar cualquier tema cultural en la comunicación profesional"], answer: "Observar, adaptar y preguntar cuando algo no queda claro, sin juzgar el estilo propio ni el ajeno" },
    { question: "¿Qué diferencia cultural respecto al tiempo se menciona en el texto?", options: ["En Brasil las reuniones siempre comienzan tarde", "En algunos contextos hispanohablantes un retraso de 15-20 minutos no se percibe como falta de respeto", "En todos los países hispanohablantes la puntualidad es estricta", "El manejo del tiempo es idéntico en toda América Latina"], answer: "En algunos contextos hispanohablantes un retraso de 15-20 minutos no se percibe como falta de respeto" },
    { question: "¿Qué comparten Brasil y los países hispanohablantes según el texto?", options: ["El mismo idioma con dialectos diferentes", "Historia, geografía y muchos valores culturales comunes", "Exactamente los mismos estilos de comunicación profesional", "Los mismos estándares de calidad laboratorial"], answer: "Historia, geografía y muchos valores culturales comunes" },
    { question: "¿Cuál es la clave de la comunicación intercultural según el texto?", options: ["Hablar el idioma del interlocutor perfectamente", "Desarrollar flexibilidad para observar, adaptar y preguntar sin juzgar ningún estilo como superior", "Adoptar siempre el estilo más formal disponible", "Evitar los temas que puedan generar diferencias de opinión"], answer: "Desarrollar flexibilidad para observar, adaptar y preguntar sin juzgar ningún estilo como superior" },
    { question: "¿Por qué un profesional del laboratorio necesita competencia intercultural además del vocabulario técnico?", options: ["Solo por exigencia de los clientes internacionales", "Porque trabaja con clientes y colegas de distintas culturas cuyas normas comunicativas pueden diferir de las suyas", "Solo si viaja al exterior para conferencias", "Solo si trabaja en un laboratorio multinacional"], answer: "Porque trabaja con clientes y colegas de distintas culturas cuyas normas comunicativas pueden diferir de las suyas" },
    { question: "¿Qué es una norma cultural en el contexto de la comunicación?", options: ["Una regla oficial de protocolo empresarial", "Un patrón de comportamiento aceptado y esperado dentro de un grupo cultural sin ser una ley formal", "Solo las reglas de etiqueta en reuniones formales", "El conjunto de valores éticos de una profesión"], answer: "Un patrón de comportamiento aceptado y esperado dentro de un grupo cultural sin ser una ley formal" },
    { question: "¿Cómo puede un profesional brasileño manejar la directitud de un colega hispanohablante sin incomodarse?", options: ["Respondiendo con igual directitud para equilibrar la conversación", "Entendiendo que es un estilo, no una crítica personal, y respondiendo con naturalidad", "Evitando temas técnicos delicados con ese colega", "Siempre consultando a un intermediario cultural"], answer: "Entendiendo que es un estilo, no una crítica personal, y respondiendo con naturalidad" },
    { question: "¿Por qué no es posible generalizar el estilo comunicativo de 'los hispanohablantes'?", options: ["Porque todos tienen el mismo estilo", "Porque hay diferencias significativas entre países y regiones dentro del mundo hispanohablante", "Solo porque el español varía entre países", "Porque cada persona tiene un estilo completamente individual sin influencia cultural"], answer: "Porque hay diferencias significativas entre países y regiones dentro del mundo hispanohablante" },
    { question: "¿Qué estrategia concreta ayuda a evitar malentendidos interculturales en una reunión técnica?", options: ["Hablar solo en inglés para neutralizar las diferencias", "Confirmar la comprensión parafraseando: 'Si entiendo bien, lo que proponen es...'", "Evitar preguntas para no parecer poco preparado", "Seguir solo el protocolo formal escrito sin adaptaciones"], answer: "Confirmar la comprensión parafraseando: 'Si entiendo bien, lo que proponen es...'" },
  ],
  dictation: "La comunicación intercultural efectiva no requiere adoptar el estilo del otro sino desarrollar la capacidad de observar, adaptarse y preguntar cuando algo no queda claro.",
},
{
  id: "negociacion-proveedores", title: "Negociación con proveedores", level: "Intermedio", category: "Comunicación", emoji: "🤝",
  description: "Cómo negociar contratos, condiciones y resolución de problemas con proveedores en español.",
  readingTitle: "El proveedor no es el enemigo",
  reading: [
    "La relación con los proveedores de reactivos, equipos y servicios es una de las más importantes que gestiona un laboratorio clínico. Una negociación bien conducida no solo obtiene mejores condiciones económicas: también construye una relación de largo plazo en la que el proveedor entiende las necesidades del laboratorio y responde con mayor agilidad ante problemas.",
    "Antes de cualquier negociación, el laboratorio debe prepararse: conocer exactamente qué necesita, en qué volumen, con qué frecuencia y bajo qué condiciones técnicas. Un laboratorio que llega a una negociación sin esa información pierde posición desde el inicio. La preparación incluye también conocer las alternativas disponibles en el mercado, lo que otorga margen real para negociar.",
    "Durante la negociación, el lenguaje debe ser formal pero directo. Expresiones como 'Nos interesa continuar con esta línea de productos, sin embargo necesitaríamos revisar las condiciones de entrega' o 'Valoramos la relación con su empresa y por eso queremos plantear este inconveniente antes de tomar una decisión' permiten mantener el tono colaborativo sin renunciar a los intereses del laboratorio.",
    "La resolución de problemas con proveedores —un lote defectuoso, una entrega demorada, un equipo que no cumple las especificaciones prometidas— requiere un enfoque estructurado: primero documentar el problema con evidencia técnica concreta, luego comunicarlo formalmente por escrito, y finalmente negociar la solución: reposición, nota de crédito, extensión de garantía o compromiso de mejora.",
    "El registro de cada interacción con el proveedor es parte del sistema de calidad. La ISO 15189 exige que el laboratorio evalúe periódicamente a sus proveedores críticos. Esa evaluación debe basarse en evidencia documentada: cumplimiento de plazos, calidad de los materiales entregados, respuesta ante problemas y soporte técnico. Un proveedor que no cumple sistemáticamente debe ser reemplazado, pero esa decisión también debe estar documentada.",
  ],
  vocab: [
    { es: "proveedor / abastecedor", pt: "fornecedor / abastecedor" },
    { es: "condiciones de entrega", pt: "condições de entrega" },
    { es: "lote defectuoso", pt: "lote defeituoso" },
    { es: "nota de crédito", pt: "nota de crédito" },
    { es: "evaluación de proveedores", pt: "avaliação de fornecedores" },
    { es: "garantía / soporte técnico", pt: "garantia / suporte técnico" },
  ],
  quiz: [
    { question: "¿Qué construye una negociación bien conducida además de mejores condiciones económicas?", options: ["Solo un contrato más barato", "Una relación de largo plazo en la que el proveedor entiende las necesidades del laboratorio", "La eliminación de todos los problemas futuros con ese proveedor", "Solo el cumplimiento de los requisitos de la ISO 15189"], answer: "Una relación de largo plazo en la que el proveedor entiende las necesidades del laboratorio" },
    { question: "¿Qué información debe preparar el laboratorio antes de negociar?", options: ["Solo el presupuesto disponible para el año", "Qué necesita, en qué volumen, con qué frecuencia, bajo qué condiciones técnicas y qué alternativas existen", "Solo el nombre del proveedor actual y su precio", "Solo los requisitos de la norma de acreditación"], answer: "Qué necesita, en qué volumen, con qué frecuencia, bajo qué condiciones técnicas y qué alternativas existen" },
    { question: "¿Por qué conocer las alternativas del mercado otorga ventaja en la negociación?", options: ["Porque el proveedor no puede saberlo", "Porque da margen real para negociar: el laboratorio no depende de una única opción", "Solo si el laboratorio tiene presupuesto para cambiar de proveedor inmediatamente", "Solo en negociaciones de equipos, no de reactivos"], answer: "Porque da margen real para negociar: el laboratorio no depende de una única opción" },
    { question: "¿Cuál es el enfoque correcto para resolver un problema con un proveedor?", options: ["Llamar de inmediato sin preparar evidencia", "Documentar con evidencia técnica, comunicar formalmente por escrito y negociar la solución", "Cambiar de proveedor directamente sin comunicarlo", "Solo mencionarlo verbalmente en la próxima reunión"], answer: "Documentar con evidencia técnica, comunicar formalmente por escrito y negociar la solución" },
    { question: "¿Qué exige la ISO 15189 respecto a los proveedores críticos?", options: ["Solo registrar el nombre y el contacto del proveedor", "Evaluarlos periódicamente con evidencia documentada de cumplimiento y calidad", "Cambiarlos cada dos años para garantizar competencia", "Solo verificar que tengan habilitación sanitaria vigente"], answer: "Evaluarlos periódicamente con evidencia documentada de cumplimiento y calidad" },
    { question: "¿Cuál de estas expresiones es apropiada para plantear un problema a un proveedor manteniendo el tono colaborativo?", options: ["Ustedes tienen la culpa de este problema", "Valoramos la relación con su empresa y por eso queremos plantear este inconveniente antes de tomar una decisión", "Si no lo resuelven hoy cancelamos el contrato", "Este lote es inaceptable y esperamos una solución inmediata"], answer: "Valoramos la relación con su empresa y por eso queremos plantear este inconveniente antes de tomar una decisión" },
    { question: "¿Qué soluciones pueden negociarse ante un lote defectuoso?", options: ["Solo la devolución del dinero", "Reposición del lote, nota de crédito, extensión de garantía o compromiso de mejora documentado", "Solo el descuento en la próxima compra", "Solo si el proveedor lo ofrece voluntariamente"], answer: "Reposición del lote, nota de crédito, extensión de garantía o compromiso de mejora documentado" },
    { question: "¿Qué debe documentarse en la relación con proveedores según el sistema de calidad?", options: ["Solo los contratos firmados", "Cada interacción relevante: entregas, problemas, respuestas y evaluaciones periódicas", "Solo los problemas que generaron una no conformidad formal", "Solo los cambios de proveedor"], answer: "Cada interacción relevante: entregas, problemas, respuestas y evaluaciones periódicas" },
    { question: "¿Cuándo debe reemplazarse un proveedor?", options: ["Cuando encuentran uno más barato", "Cuando no cumple sistemáticamente y la evidencia documentada respalda esa decisión", "Solo si el organismo acreditador lo exige", "Nunca, la estabilidad con el proveedor es siempre preferible"], answer: "Cuando no cumple sistemáticamente y la evidencia documentada respalda esa decisión" },
    { question: "¿Por qué el laboratorio que llega sin preparación a una negociación pierde posición?", options: ["Porque el proveedor siempre sabe más", "Porque no puede argumentar con datos concretos ni evaluar si la propuesta del proveedor es razonable", "Solo porque da imagen de desorganización", "Solo en negociaciones de equipos de alto costo"], answer: "Porque no puede argumentar con datos concretos ni evaluar si la propuesta del proveedor es razonable" },
    { question: "¿Qué diferencia hay entre una reclamación verbal y una formal por escrito a un proveedor?", options: ["No hay diferencia real en el resultado", "La formal por escrito genera evidencia documentada, establece plazos y tiene mayor peso en la negociación de soluciones", "La verbal siempre es más rápida y efectiva", "Solo la formal por escrito es aceptada por la ISO 15189"], answer: "La formal por escrito genera evidencia documentada, establece plazos y tiene mayor peso en la negociación de soluciones" },
    { question: "¿Qué criterios se usan en la evaluación periódica de proveedores?", options: ["Solo el precio y la disponibilidad del producto", "Cumplimiento de plazos, calidad de materiales, respuesta ante problemas y soporte técnico", "Solo los resultados del ensayo de aptitud del laboratorio", "Solo la habilitación regulatoria del proveedor"], answer: "Cumplimiento de plazos, calidad de materiales, respuesta ante problemas y soporte técnico" },
  ],
  dictation: "Antes de negociar con un proveedor hay que preparar la información técnica necesaria, conocer las alternativas del mercado y documentar cualquier problema con evidencia concreta.",
},
{
  id: "informes-tecnicos", title: "Redacción de informes técnicos", level: "Intermedio", category: "Comunicación", emoji: "📄",
  description: "Cómo estructurar y redactar informes técnicos claros, incluyendo comunicación escrita de resultados críticos.",
  readingTitle: "Un informe que se malinterpreta es un informe que falló",
  reading: [
    "El informe técnico es el producto final más visible del laboratorio clínico: es el documento que llega al médico, orienta decisiones clínicas y queda en el historial del paciente. Un informe bien redactado comunica con precisión; uno mal redactado puede generar confusión, solicitudes innecesarias o, en el peor de los casos, una decisión médica incorrecta.",
    "La estructura de un informe técnico formal en español incluye: encabezado con identificación del laboratorio y del paciente; cuerpo con los resultados organizados por área o panel; los intervalos de referencia correspondientes; la indicación clara de los valores fuera de rango; y un espacio para observaciones técnicas cuando el analista considera necesario agregar contexto.",
    "Las observaciones técnicas son el valor agregado que distingue a un laboratorio con criterio clínico. Ejemplos de observaciones apropiadas: 'Resultado obtenido en muestra con hemólisis moderada; se recomienda repetición en muestra fresca', 'Valor de potasio elevado en contexto de muestra lipémica verificada; resultado liberado con precaución', 'Control de calidad adecuado en la fecha de procesamiento'.",
    "La comunicación escrita de resultados críticos ocurre cuando, además de la llamada telefónica obligatoria, el laboratorio deja constancia escrita en el informe o en un documento adjunto. Esta constancia debe incluir: el valor crítico detectado, la fecha y hora de detección, el nombre del analista que lo procesó y la referencia a que fue comunicado verbalmente. Esa documentación es evidencia del cumplimiento del protocolo.",
    "El lenguaje de un informe técnico debe ser preciso, neutral y libre de ambigüedades. Frases como 'los resultados sugieren' o 'podría tratarse de' son apropiadas solo si se basan en hallazgos concretos. El informe no es el lugar para diagnósticos: es el lugar para datos bien contextualizados que apoyen al médico en su razonamiento clínico.",
  ],
  vocab: [
    { es: "informe técnico / laudo", pt: "laudo técnico / relatório" },
    { es: "intervalo de referencia", pt: "intervalo de referência" },
    { es: "observación técnica", pt: "observação técnica" },
    { es: "valor fuera de rango", pt: "valor fora do intervalo" },
    { es: "constancia escrita", pt: "registro escrito / comprovante" },
    { es: "contexto clínico en el informe", pt: "contexto clínico no laudo" },
  ],
  quiz: [
    { question: "¿Qué estructura básica debe tener un informe técnico formal?", options: ["Solo los resultados numéricos con unidades", "Encabezado con identificación, resultados por área, intervalos de referencia, valores fuera de rango y observaciones", "Solo los resultados y la firma del director técnico", "Solo los resultados y los intervalos de referencia del fabricante"], answer: "Encabezado con identificación, resultados por área, intervalos de referencia, valores fuera de rango y observaciones" },
    { question: "¿Qué aportan las observaciones técnicas en un informe?", options: ["Son solo un requisito formal sin valor clínico real", "Agregan contexto que ayuda al médico a interpretar correctamente el resultado", "Reemplazan la llamada telefónica en casos de valores críticos", "Solo son necesarias cuando el resultado es incorrecto"], answer: "Agregan contexto que ayuda al médico a interpretar correctamente el resultado" },
    { question: "¿Cuál es un ejemplo de observación técnica apropiada?", options: ["El paciente debe repetir el análisis mañana", "Resultado obtenido en muestra con hemólisis moderada; se recomienda repetición en muestra fresca", "Este resultado indica probable insuficiencia renal", "El médico debe revisar el historial del paciente"], answer: "Resultado obtenido en muestra con hemólisis moderada; se recomienda repetición en muestra fresca" },
    { question: "¿Qué debe incluir la constancia escrita de un resultado crítico?", options: ["Solo el valor numérico del resultado", "El valor crítico, fecha y hora de detección, nombre del analista y referencia a la comunicación verbal realizada", "Solo el nombre del médico que recibió la llamada", "Solo si el médico lo solicita expresamente"], answer: "El valor crítico, fecha y hora de detección, nombre del analista y referencia a la comunicación verbal realizada" },
    { question: "¿Para qué sirve la constancia escrita de un resultado crítico en el informe?", options: ["Para reemplazar la documentación telefónica", "Como evidencia del cumplimiento del protocolo de comunicación de valores críticos", "Solo para informar al paciente directamente", "Solo para el sistema de facturación"], answer: "Como evidencia del cumplimiento del protocolo de comunicación de valores críticos" },
    { question: "¿Qué tipo de lenguaje debe usar un informe técnico?", options: ["Coloquial y accesible para que el paciente lo entienda", "Preciso, neutral y libre de ambigüedades, sin diagnósticos", "Técnico avanzado que solo entienda el especialista", "Informal si va dirigido al médico de cabecera"], answer: "Preciso, neutral y libre de ambigüedades, sin diagnósticos" },
    { question: "¿Es apropiado incluir diagnósticos en el informe técnico?", options: ["Sí, siempre que el analista tenga experiencia suficiente", "No, el informe es para datos bien contextualizados que apoyen el razonamiento médico, no para diagnósticos", "Sí, pero solo como sugerencia informal", "Solo en informes de anatomía patológica"], answer: "No, el informe es para datos bien contextualizados que apoyen el razonamiento médico, no para diagnósticos" },
    { question: "¿Cuándo es apropiado usar frases como 'los resultados sugieren'?", options: ["Nunca, el informe técnico no admite interpretaciones", "Solo cuando se basan en hallazgos concretos que el analista puede respaldar con datos", "Siempre que el analista quiera agregar valor al informe", "Solo en informes de microbiología y serología"], answer: "Solo cuando se basan en hallazgos concretos que el analista puede respaldar con datos" },
    { question: "¿Qué consecuencia puede tener un informe mal redactado?", options: ["Solo una queja administrativa del médico", "Confusión en la interpretación, solicitudes innecesarias o una decisión médica incorrecta", "Solo la necesidad de corregir el documento internamente", "Solo pérdida de tiempo del laboratorio"], answer: "Confusión en la interpretación, solicitudes innecesarias o una decisión médica incorrecta" },
    { question: "¿Qué diferencia a un informe con criterio clínico de uno que solo lista números?", options: ["El que tiene criterio clínico es más largo", "El que tiene criterio clínico incluye observaciones técnicas que contextualizan los resultados para el médico", "El criterio clínico solo lo pueden agregar los médicos, no los analistas", "Solo los laboratorios acreditados pueden agregar observaciones técnicas"], answer: "El que tiene criterio clínico incluye observaciones técnicas que contextualizan los resultados para el médico" },
    { question: "¿Cómo se indica correctamente un valor fuera de rango en el informe?", options: ["Con una nota al pie sin destacarlo", "Con marcación visual clara (flecha, asterisco o negrita) junto al intervalo de referencia correspondiente", "Solo verbalmente al médico, no en el documento escrito", "Solo si el médico solicitó expresamente esa indicación"], answer: "Con marcación visual clara (flecha, asterisco o negrita) junto al intervalo de referencia correspondiente" },
    { question: "¿Por qué el informe técnico queda en el historial del paciente?", options: ["Solo por exigencia del sistema informático del hospital", "Porque es un documento médico legal que forma parte del registro clínico y puede ser consultado en el futuro", "Solo si el médico lo decide guardar", "Solo en hospitales públicos con historia clínica electrónica"], answer: "Porque es un documento médico legal que forma parte del registro clínico y puede ser consultado en el futuro" },
  ],
  dictation: "El informe técnico debe incluir observaciones cuando el resultado requiere contexto, y toda comunicación de valor crítico debe quedar documentada por escrito además de la llamada telefónica.",
},
{
  id: "comunicacion-pacientes", title: "Comunicación con pacientes", level: "Básico", category: "Comunicación", emoji: "🧑‍⚕️",
  description: "Cómo comunicarse con pacientes en español: instrucciones de preparación, entrega de resultados y dudas frecuentes.",
  readingTitle: "El paciente también merece claridad",
  reading: [
    "En el laboratorio clínico, el paciente es el cliente más vulnerable: es quien tiene más en juego en cada análisis y, al mismo tiempo, quien menos herramientas tiene para interpretar lo que ocurre. Comunicarse bien con el paciente no es solo cortesía: es parte de la calidad del servicio y, en muchos casos, determina si el análisis será válido o deberá repetirse.",
    "Las instrucciones de preparación son la primera oportunidad de comunicación con el paciente. Deben ser claras, concretas y adaptadas al nivel de comprensión del interlocutor. En español, las instrucciones a pacientes usan el imperativo o el infinitivo en tono amable: 'no coma ni beba nada durante las ocho horas anteriores a la extracción, solo puede tomar agua'; 'evite el ejercicio intenso el día anterior'; 'informe si está tomando algún medicamento'.",
    "Durante la extracción, el trato debe ser respetuoso y tranquilizador. Frases simples como 'va a sentir un pequeño pinchazo', 'respire profundo', 'ya casi terminamos' reducen la ansiedad del paciente y colaboran con la calidad de la muestra obtenida. La comunicación no verbal —el tono de voz, el contacto visual, la postura— tiene tanto peso como las palabras.",
    "La entrega de resultados es un momento sensible. El laboratorio no debe interpretar resultados para el paciente —esa función es del médico— pero sí debe orientarlo sobre cómo recibirlos y a quién dirigirse con preguntas clínicas. Una respuesta apropiada ante '¿mis resultados están bien?' es: 'Sus resultados están listos. El médico que solicitó el análisis es quien puede explicarle su significado clínico; nosotros podemos confirmarle si hay algún valor que requiera atención urgente'.",
    "Ante un paciente ansioso, confundido o molesto, la clave es la escucha activa y el lenguaje simple. Evitar tecnicismos innecesarios, confirmar que el paciente entendió la información y ofrecer canales de contacto claros son acciones concretas que transforman una interacción difícil en una experiencia de atención de calidad.",
  ],
  vocab: [
    { es: "instrucciones de preparación", pt: "instruções de preparo" },
    { es: "extracción de sangre / venopunción", pt: "coleta de sangue / venopunção" },
    { es: "ayuno (en horas)", pt: "jejum (em horas)" },
    { es: "medicamento / tratamiento", pt: "medicamento / tratamento" },
    { es: "entregar / retirar resultados", pt: "entregar / retirar resultados" },
    { es: "derivar al médico", pt: "encaminhar ao médico" },
  ],
  quiz: [
    { question: "¿Por qué comunicarse bien con el paciente es parte de la calidad del servicio?", options: ["Solo por exigencia de la norma de acreditación", "Porque determina si el análisis será válido y forma parte de la experiencia de atención", "Solo para mejorar la satisfacción en las encuestas", "Solo para cumplir con el código de ética profesional"], answer: "Porque determina si el análisis será válido y forma parte de la experiencia de atención" },
    { question: "¿Qué tono se recomienda usar en las instrucciones de preparación al paciente?", options: ["Técnico y formal para demostrar profesionalismo", "Amable, claro y adaptado al nivel de comprensión del paciente", "Imperativo directo sin explicaciones adicionales", "Igual al que se usa en un procedimiento operativo estándar"], answer: "Amable, claro y adaptado al nivel de comprensión del paciente" },
    { question: "¿Cuál es la respuesta apropiada ante la pregunta '¿mis resultados están bien?'", options: ["Sí, todo está normal, no se preocupe", "Sus resultados están listos; el médico que los solicitó es quien puede explicar su significado clínico", "No puedo decirle nada hasta que pase el médico", "Tiene algunos valores alterados que debería revisar"], answer: "Sus resultados están listos; el médico que los solicitó es quien puede explicar su significado clínico" },
    { question: "¿Por qué el laboratorio no debe interpretar resultados para el paciente?", options: ["Porque los analistas no están capacitados para hacerlo", "Porque esa función le corresponde al médico, que conoce el contexto clínico completo del paciente", "Solo porque está prohibido por la norma ISO 15189", "Solo en el caso de resultados normales"], answer: "Porque esa función le corresponde al médico, que conoce el contexto clínico completo del paciente" },
    { question: "¿Qué elementos de comunicación no verbal importan durante la extracción?", options: ["Solo el uniforme del profesional", "El tono de voz, el contacto visual y la postura, que tienen tanto peso como las palabras", "Solo si el paciente es ansioso o mayor de edad", "Solo en contextos de atención pediátrica"], answer: "El tono de voz, el contacto visual y la postura, que tienen tanto peso como las palabras" },
    { question: "¿Cómo se da una instrucción de ayuno correctamente en español al paciente?", options: ["Ayunar es necesario para este análisis", "No coma ni beba nada durante las ocho horas anteriores a la extracción; solo puede tomar agua", "El ayuno depende de lo que su médico le diga", "Venga en ayunas, usted ya sabe cómo se hace"], answer: "No coma ni beba nada durante las ocho horas anteriores a la extracción; solo puede tomar agua" },
    { question: "¿Qué hace la escucha activa ante un paciente ansioso o molesto?", options: ["Prolonga innecesariamente la interacción", "Permite entender la preocupación real del paciente y responder de forma apropiada antes de que la situación escale", "Solo funciona con pacientes que hablan bien el español", "Solo es útil en situaciones de queja formal"], answer: "Permite entender la preocupación real del paciente y responder de forma apropiada antes de que la situación escale" },
    { question: "¿Por qué evitar tecnicismos con el paciente mejora la calidad de la atención?", options: ["Porque los tecnicismos son siempre incorrectos en comunicación oral", "Porque el paciente puede entender mejor lo que se espera de él y sentirse respetado en lugar de confundido", "Solo para cumplir con el requisito de comunicación de la ISO 15189", "Solo con pacientes de baja escolaridad"], answer: "Porque el paciente puede entender mejor lo que se espera de él y sentirse respetado en lugar de confundido" },
    { question: "¿Cuándo es apropiado que el laboratorio informe al paciente que hay un valor que requiere atención urgente?", options: ["Nunca, siempre debe derivar todo al médico sin decir nada", "Cuando hay un valor crítico, el laboratorio puede indicar que hay algo que requiere atención y contactar al médico de inmediato", "Solo si el médico lo autoriza explícitamente", "Solo en resultados de hematología, no de bioquímica"], answer: "Cuando hay un valor crítico, el laboratorio puede indicar que hay algo que requiere atención y contactar al médico de inmediato" },
    { question: "¿Qué información debe dar el laboratorio al paciente si no puede interpretar sus resultados?", options: ["Que sus resultados son confidenciales y solo el médico puede verlos", "Cómo y cuándo recibirlos, y a quién dirigirse con preguntas clínicas", "Solo que el análisis fue procesado correctamente", "Que regrese al día siguiente cuando esté el médico"], answer: "Cómo y cuándo recibirlos, y a quién dirigirse con preguntas clínicas" },
    { question: "¿Qué impacto tiene una buena instrucción de preparación en la calidad del análisis?", options: ["Ninguno si el equipo está bien calibrado", "Directo: una preparación incorrecta puede invalidar el resultado y requerir repetición de la muestra", "Solo afecta el tiempo de procesamiento", "Solo importa para análisis en ayunas como glucosa y perfil lipídico"], answer: "Directo: una preparación incorrecta puede invalidar el resultado y requerir repetición de la muestra" },
    { question: "¿Cómo confirma el laboratorio que el paciente entendió las instrucciones de preparación?", options: ["Entregándole el folleto impreso sin más explicación", "Preguntando: '¿Tiene alguna duda sobre lo que debe hacer antes de venir?' o pidiendo que repita las instrucciones clave", "Solo si el paciente lo solicita", "Solo en pacientes mayores de 65 años"], answer: "Preguntando: '¿Tiene alguna duda sobre lo que debe hacer antes de venir?' o pidiendo que repita las instrucciones clave" },
  ],
  dictation: "Al entregar resultados al paciente el laboratorio no debe interpretarlos clínicamente, pero sí orientar sobre cómo recibirlos y a quién consultar si hay valores que requieren atención.",
},
{
  id: "crisis-error", title: "Comunicación en crisis y ante errores", level: "Avanzado", category: "Comunicación", emoji: "🚨",
  description: "Cómo comunicar errores, resultados incorrectos ya liberados y situaciones de crisis con claridad y responsabilidad.",
  readingTitle: "Lo que se dice en el momento difícil define la reputación",
  reading: [
    "Ningún laboratorio está exento de cometer errores. La diferencia entre un laboratorio que mantiene la confianza de sus clientes y uno que la pierde no siempre está en la frecuencia de los errores: está en cómo los comunica y qué hace después. Comunicar un error con claridad, rapidez y responsabilidad es una habilidad técnica que puede aprenderse y practicarse.",
    "La primera regla ante un error que ya llegó al cliente es actuar antes de que el cliente lo descubra por sí mismo. Un laboratorio que detecta que liberó un resultado incorrecto y llama proactivamente al médico antes de que este note la discrepancia demuestra integridad y genera más confianza que uno que espera a que lo llamen. La proactividad en la gestión del error es la diferencia entre una crisis y un incidente manejado.",
    "El mensaje en la comunicación de un error debe incluir cuatro elementos: qué ocurrió exactamente, qué impacto puede haber tenido en el paciente, qué acciones el laboratorio ya tomó o está tomando, y qué garantía ofrece de que no se repetirá. Omitir alguno de estos elementos —especialmente el impacto y las acciones— genera desconfianza aunque el tono sea correcto.",
    "El tono de la comunicación debe ser directo y sin evasivas, pero nunca defensivo ni acusatorio. Frases como 'Detectamos un error en el procesamiento de la muestra y queremos informarle inmediatamente' son mucho más efectivas que 'Hubo un inconveniente que podría estar relacionado con el equipo'. La primera asume responsabilidad; la segunda la diluye.",
    "Las situaciones de crisis más graves —un error que afectó a múltiples pacientes, una falla del sistema que impidió liberar resultados urgentes— requieren un protocolo específico: un vocero designado, un mensaje unificado, comunicación simultánea con todos los afectados y registro de cada contacto realizado. Improvisar en una crisis amplifica el daño.",
  ],
  vocab: [
    { es: "comunicar un error / notificar", pt: "comunicar um erro / notificar" },
    { es: "resultado incorrecto liberado", pt: "resultado incorreto liberado" },
    { es: "acción correctiva inmediata", pt: "ação corretiva imediata" },
    { es: "vocero / portavoz", pt: "porta-voz" },
    { es: "proactividad en la gestión", pt: "proatividade na gestão" },
    { es: "protocolo de crisis", pt: "protocolo de crise" },
  ],
  quiz: [
    { question: "¿Qué diferencia a un laboratorio que mantiene la confianza ante un error?", options: ["Que nunca comete errores", "Cómo comunica el error y qué hace después, no solo la frecuencia con que ocurre", "Que tiene acreditación ISO 15189 vigente", "Que el error no llegó al paciente"], answer: "Cómo comunica el error y qué hace después, no solo la frecuencia con que ocurre" },
    { question: "¿Cuál es la primera regla ante un error que ya llegó al cliente?", options: ["Esperar a que el cliente lo detecte para evaluar el impacto real", "Actuar proactivamente antes de que el cliente lo descubra por sí mismo", "Documentar el error internamente antes de comunicarlo", "Consultar con el director técnico si vale la pena comunicarlo"], answer: "Actuar proactivamente antes de que el cliente lo descubra por sí mismo" },
    { question: "¿Qué cuatro elementos debe incluir el mensaje al comunicar un error?", options: ["Fecha, hora, nombre del analista y resultado correcto", "Qué ocurrió, qué impacto pudo tener, qué acciones se tomaron y qué garantía se ofrece", "Solo disculpas y el resultado corregido", "El número de no conformidad y el plan de acción interno"], answer: "Qué ocurrió, qué impacto pudo tener, qué acciones se tomaron y qué garantía se ofrece" },
    { question: "¿Por qué omitir el impacto del error en la comunicación genera desconfianza?", options: ["Porque el cliente siempre asume el peor escenario", "Porque el cliente necesita saber si debe tomar alguna acción respecto al paciente y la omisión parece ocultamiento", "Solo si el médico ya descubrió el error por su cuenta", "Solo si el error fue muy grave"], answer: "Porque el cliente necesita saber si debe tomar alguna acción respecto al paciente y la omisión parece ocultamiento" },
    { question: "¿Cuál de estas frases asume mejor la responsabilidad del error?", options: ["Hubo un inconveniente que podría estar relacionado con el equipo", "Detectamos un error en el procesamiento de la muestra y queremos informarle inmediatamente", "El resultado que recibió puede tener alguna imprecisión", "Según nuestra investigación preliminar podría haber habido un problema"], answer: "Detectamos un error en el procesamiento de la muestra y queremos informarle inmediatamente" },
    { question: "¿Qué genera la proactividad en la gestión de un error?", options: ["Solo cumplimiento del requisito de la ISO 15189", "Más confianza que esperar a ser descubierto, porque demuestra integridad", "Mayores consecuencias legales por reconocer el error", "Solo es útil si el error no afectó al paciente directamente"], answer: "Más confianza que esperar a ser descubierto, porque demuestra integridad" },
    { question: "¿Qué debe incluir el protocolo de crisis ante un error que afecta a múltiples pacientes?", options: ["Solo una reunión interna de investigación", "Vocero designado, mensaje unificado, comunicación simultánea con todos los afectados y registro de cada contacto", "Solo comunicar al organismo acreditador", "Solo suspender el servicio hasta resolver el problema"], answer: "Vocero designado, mensaje unificado, comunicación simultánea con todos los afectados y registro de cada contacto" },
    { question: "¿Por qué improvisar en una crisis amplifica el daño?", options: ["Porque los clientes siempre reaccionan mal ante cualquier comunicación", "Porque los mensajes inconsistentes generan más confusión y desconfianza que el propio error", "Solo si la prensa se entera del incidente", "Solo si el laboratorio no tiene acreditación vigente"], answer: "Porque los mensajes inconsistentes generan más confusión y desconfianza que el propio error" },
    { question: "¿Cuál es el propósito de la garantía ofrecida al final del mensaje de error?", options: ["Solo para cumplir con el protocolo formal de comunicación", "Demostrar que el laboratorio aprendió del error y tomó medidas para que no se repita, reconstruyendo la confianza", "Solo para evitar consecuencias legales", "Solo si el cliente lo exige explícitamente"], answer: "Demostrar que el laboratorio aprendió del error y tomó medidas para que no se repita, reconstruyendo la confianza" },
    { question: "¿Qué tono debe evitarse al comunicar un error aunque las palabras sean correctas?", options: ["El tono empático", "El tono defensivo o acusatorio que diluye la responsabilidad del laboratorio", "El tono formal y directo", "El tono urgente cuando el error es grave"], answer: "El tono defensivo o acusatorio que diluye la responsabilidad del laboratorio" },
    { question: "¿Qué diferencia hay entre comunicar un error internamente y comunicarlo al médico?", options: ["No hay diferencia, el mensaje debe ser idéntico", "La comunicación interna activa el sistema de calidad; la externa prioriza el impacto clínico y las acciones tomadas para proteger al paciente", "Solo la comunicación interna es obligatoria según la norma", "La comunicación externa solo ocurre si el médico pregunta"], answer: "La comunicación interna activa el sistema de calidad; la externa prioriza el impacto clínico y las acciones tomadas para proteger al paciente" },
    { question: "¿Por qué documentar cada contacto realizado durante una crisis es importante?", options: ["Solo para el registro del sistema de calidad", "Porque demuestra que el laboratorio actuó diligentemente y provee evidencia ante posibles consecuencias legales o regulatorias", "Solo si el organismo acreditador lo exige", "Solo en crisis que afectan a más de diez pacientes"], answer: "Porque demuestra que el laboratorio actuó diligentemente y provee evidencia ante posibles consecuencias legales o regulatorias" },
  ],
  dictation: "Ante un resultado incorrecto ya liberado hay que comunicarlo proactivamente al médico antes de que lo descubra, informando qué ocurrió, el impacto posible y las acciones tomadas.",
},
// ══ TECNOLOGÍA ══
{
  id: "lims", title: "Sistema LIMS", level: "Intermedio", category: "Tecnología", emoji: "🖥️",
  description: "Gestión digital del laboratorio: flujo de muestras, trazabilidad y reportes automáticos.",
  readingTitle: "El flujo digital de una muestra",
  reading: [
    "Cuando una muestra ingresa al laboratorio, en ese mismo instante comienza a dejar un rastro digital en el LIMS. El número de recepción, el nombre y el código de barras del paciente, los análisis solicitados, el analista que recibió la muestra, la fecha y hora de ingreso: todo queda registrado y vinculado de forma automática.",
    "El LIMS permite al laboratorio responder con precisión y rapidez cuando un cliente solicita información sobre el estado de su análisis o cuando un médico necesita verificar un resultado histórico. Sin el LIMS, esa búsqueda requeriría revisar registros en papel en varios archivos físicos.",
    "El LIMS también permite automatizar gran parte del proceso de generación de informes. Una vez que el analista valida un resultado en el sistema, el LIMS puede generar automáticamente el informe con los rangos de referencia correspondientes, señalar los resultados fuera de rango, e incluso enviar el informe por correo electrónico al cliente.",
    "La integración del LIMS con los equipos analíticos mediante interfaces bidireccionales es otro aspecto crítico. Una interfaz bidireccional significa que el LIMS puede enviar automáticamente las solicitudes al equipo y recibir automáticamente los resultados, prácticamente eliminando los errores de transcripción.",
    "La implementación de un nuevo LIMS es un proyecto complejo que requiere planificación cuidadosa, formación del personal, validación del sistema y un plan de contingencia.",
  ],
  vocab: [
    { es: "LIMS", pt: "LIMS" },
    { es: "interfaz bidireccional", pt: "interface bidirecional" },
    { es: "trazabilidad digital", pt: "rastreabilidade digital" },
    { es: "informe automático", pt: "relatório automático" },
    { es: "validación del sistema", pt: "validação do sistema" },
    { es: "transcripción manual", pt: "transcrição manual" },
  ],
  quiz: [
    { question: "¿Qué información queda registrada automáticamente en el LIMS desde el ingreso?", options: ["Solo el resultado final validado", "Número de recepción, paciente, análisis, analista, instrumento y resultado", "Solo el nombre del paciente y el análisis pedido", "Solo el resultado y la fecha de entrega"], answer: "Número de recepción, paciente, análisis, analista, instrumento y resultado" },
    { question: "¿Qué puede hacer el LIMS automáticamente después de que el analista valida un resultado?", options: ["Solo guardarlo en la base de datos", "Generar el informe con rangos de referencia, marcadores y enviarlo al cliente sin intervención manual", "Solo imprimir el resultado en papel", "Solo notificar al médico por teléfono"], answer: "Generar el informe con rangos de referencia, marcadores y enviarlo al cliente sin intervención manual" },
    { question: "¿Qué es una interfaz bidireccional entre el LIMS y el equipo analítico?", options: ["Una interfaz que solo recibe datos del equipo", "Una interfaz que envía solicitudes al equipo Y recibe resultados automáticamente", "Una conexión que funciona en ambos turnos del día", "Una interfaz que conecta dos laboratorios diferentes"], answer: "Una interfaz que envía solicitudes al equipo Y recibe resultados automáticamente" },
    { question: "¿Qué error elimina prácticamente la interfaz bidireccional?", options: ["Los errores de calibración del equipo", "Los errores de transcripción manual de resultados", "Los errores de identificación de pacientes", "Los errores de control de calidad analítico"], answer: "Los errores de transcripción manual de resultados" },
    { question: "¿Qué requiere la implementación exitosa de un nuevo LIMS?", options: ["Solo comprar el software más moderno", "Planificación cuidadosa, formación del personal, validación y plan de contingencia", "Solo migrar los datos del sistema anterior", "Solo capacitar al área de TI"], answer: "Planificación cuidadosa, formación del personal, validación y plan de contingencia" },
    { question: "¿Por qué es fundamental la participación del equipo técnico en la implementación?", options: ["Para ahorrar costos de consultoría", "Porque conocen los flujos de trabajo reales y pueden garantizar que el sistema se configure correctamente", "Solo para aprobar el sistema ante el organismo acreditador", "Para justificar el presupuesto"], answer: "Porque conocen los flujos de trabajo reales y pueden garantizar que el sistema se configure correctamente" },
    { question: "¿Qué puede ocurrir con un LIMS mal configurado?", options: ["Funciona igual que uno bien configurado", "Puede generar más problemas de los que resuelve en la operación diaria", "Solo afecta la velocidad de procesamiento", "Solo afecta la estética de los informes"], answer: "Puede generar más problemas de los que resuelve en la operación diaria" },
    { question: "¿Cómo responde el LIMS ante una solicitud de revisión histórica?", options: ["Requiere buscar en archivos físicos", "Recupera toda la información de trazabilidad en segundos", "Solo puede recuperar los últimos 30 días", "Necesita intervención manual del administrador"], answer: "Recupera toda la información de trazabilidad en segundos" },
    { question: "¿Qué es el plan de contingencia en una implementación de LIMS?", options: ["El presupuesto de emergencia para imprevistos económicos", "El procedimiento que permite al laboratorio operar si el sistema falla durante la transición o después", "El manual de usuario para casos de dudas", "Solo el soporte técnico del proveedor"], answer: "El procedimiento que permite al laboratorio operar si el sistema falla durante la transición o después" },
    { question: "¿Por qué la validación del LIMS es un requisito de la ISO 15189?", options: ["Solo porque el organismo acreditador lo exige", "Porque el LIMS participa directamente en el proceso de generación y comunicación de resultados que afectan al paciente", "Solo para sistemas de gestión financiera", "Porque todos los software deben validarse independientemente de su función"], answer: "Porque el LIMS participa directamente en el proceso de generación y comunicación de resultados que afectan al paciente" },
    { question: "¿Qué ventaja ofrece el LIMS en la gestión de los controles internos de calidad?", options: ["Ninguna, el control interno se gestiona por separado", "Permite registrar los resultados de control, graficarlos automáticamente y enviar alertas cuando se detectan patrones de falla", "Solo almacena los resultados de control sin análisis", "Solo imprime los gráficos de Levey-Jennings manualmente"], answer: "Permite registrar los resultados de control, graficarlos automáticamente y enviar alertas cuando se detectan patrones de falla" },
    { question: "¿Qué información de trazabilidad debe registrar el LIMS para cada resultado?", options: ["Solo el resultado final y la fecha", "Muestra, paciente, análisis, método, instrumento, lote de reactivo, analista que validó, fecha y hora en cada paso", "Solo el nombre del analista y el instrumento", "Solo el resultado y el rango de referencia utilizado"], answer: "Muestra, paciente, análisis, método, instrumento, lote de reactivo, analista que validó, fecha y hora en cada paso" },
    { question: "¿Cuándo debe actualizarse la validación del LIMS?", options: ["Solo una vez al implementarlo", "Cada vez que haya una actualización de software, cambio de configuración o modificación en los flujos del proceso", "Solo si hay una auditoría próxima", "Solo si el sistema presenta errores visibles"], answer: "Cada vez que haya una actualización de software, cambio de configuración o modificación en los flujos del proceso" },
  ],
  dictation: "El LIMS registra toda la cadena de información de cada muestra y permite automatizar la generación de informes, reduciendo errores de transcripción.",
},
{
  id: "backup", title: "Copias de seguridad y continuidad", level: "Intermedio", category: "Tecnología", emoji: "💾",
  description: "Estrategias de backup, recuperación y continuidad operativa en el laboratorio.",
  readingTitle: "El día que el servidor no arrancó",
  reading: [
    "Un jueves a las seis de la mañana, el sistema de gestión del laboratorio no respondía. El técnico confirmó lo peor: el disco duro del servidor principal había fallado durante la noche. La pregunta más crítica fue inmediata: ¿cuándo fue la última copia de seguridad exitosa?",
    "Una estrategia de backup sólida sigue la regla 3-2-1: tres copias de los datos, en dos medios o formatos diferentes, con al menos una copia en un lugar físicamente distinto como la nube o un servidor remoto.",
    "Igual de importante que hacer el backup es probarlo regularmente. Un backup que nunca fue probado puede contener datos corruptos o archivos que no se restauran correctamente.",
    "El laboratorio debe tener un plan de continuidad operativa que defina qué hacer cuando un sistema crítico falla: quién activa el procedimiento, cómo se procesan las muestras sin el sistema y cómo se ingresan los datos una vez restaurado.",
    "Las pruebas de restauración deben ser parte del calendario de mantenimiento preventivo del área de TI, no algo que se hace solo cuando el sistema ya falló.",
  ],
  vocab: [
    { es: "copia de seguridad / backup", pt: "cópia de segurança / backup" },
    { es: "restauración de datos", pt: "restauração de dados" },
    { es: "continuidad operativa", pt: "continuidade operacional" },
    { es: "plan de contingencia", pt: "plano de contingência" },
    { es: "servidor / disco duro", pt: "servidor / disco rígido" },
    { es: "regla 3-2-1", pt: "regra 3-2-1" },
  ],
  quiz: [
    { question: "¿Qué pregunta es la más crítica cuando un servidor falla?", options: ["¿Cuánto cuesta reemplazarlo?", "¿Cuándo fue la última copia de seguridad exitosa?", "¿Quién es el responsable del error?", "¿Cuántos usuarios estaban conectados?"], answer: "¿Cuándo fue la última copia de seguridad exitosa?" },
    { question: "¿Qué establece la regla 3-2-1 de backup?", options: ["Tres backups diarios, dos semanales y uno mensual", "Tres copias en dos medios diferentes con al menos una copia en ubicación física distinta", "Backup cada tres días con dos verificaciones", "Tres técnicos responsables, dos sistemas y un proveedor"], answer: "Tres copias en dos medios diferentes con al menos una copia en ubicación física distinta" },
    { question: "¿Por qué no basta con hacer el backup sin probarlo?", options: ["Porque la norma exige documentación de las pruebas", "Porque un backup no probado puede contener datos corruptos que no se restauran correctamente", "Solo porque puede haberse llenado el espacio", "Porque el proveedor puede haberlo configurado mal"], answer: "Porque un backup no probado puede contener datos corruptos que no se restauran correctamente" },
    { question: "¿Qué protege la copia en ubicación física distinta?", options: ["Solo contra fallas del disco duro principal", "Contra desastres físicos como incendios o inundaciones que afecten la sede principal", "Solo contra errores humanos de borrado", "Contra ataques de ransomware únicamente"], answer: "Contra desastres físicos como incendios o inundaciones que afecten la sede principal" },
    { question: "¿Qué debe incluir un plan de continuidad operativa?", options: ["Solo la lista de contactos del proveedor de TI", "Responsables, procedimiento manual, registro de resultados y protocolo de ingreso al sistema restaurado", "Solo el procedimiento para reiniciar el servidor", "Solo el número del soporte técnico"], answer: "Responsables, procedimiento manual, registro de resultados y protocolo de ingreso al sistema restaurado" },
    { question: "¿Con qué frecuencia deben realizarse las pruebas de restauración?", options: ["Solo cuando falla el sistema", "Regularmente como parte del mantenimiento preventivo de TI", "Una vez al año por exigencia normativa", "Solo cuando se cambia el sistema de backup"], answer: "Regularmente como parte del mantenimiento preventivo de TI" },
    { question: "¿Qué riesgo adicional cubre incluir la nube en la estrategia?", options: ["Reduce el costo del hardware", "Agrega una copia geográficamente remota que protege ante desastres en la sede", "Acelera la restauración de datos", "Permite acceso simultáneo de múltiples usuarios"], answer: "Agrega una copia geográficamente remota que protege ante desastres en la sede" },
    { question: "¿Cómo se procesan las muestras durante una caída del sistema?", options: ["Se detiene todo hasta restaurar el sistema", "Siguiendo el procedimiento de contingencia manual definido previamente", "Se derivan todas las muestras a otro laboratorio", "Se espera al turno siguiente"], answer: "Siguiendo el procedimiento de contingencia manual definido previamente" },
  ],
  dictation: "Un plan de continuidad operativa define cómo procesar muestras sin el sistema y cómo restaurar los datos una vez recuperado el servidor.",
},
{
  id: "ciberseguridad", title: "Ciberseguridad básica", level: "Intermedio", category: "Tecnología", emoji: "🛡️",
  description: "Amenazas digitales, phishing, ransomware y buenas prácticas de seguridad en el laboratorio.",
  readingTitle: "El correo que casi bloqueó el laboratorio",
  reading: [
    "Un miércoles por la tarde, un administrativo del laboratorio recibió un correo aparentemente del proveedor del sistema de gestión: 'Actualización urgente de seguridad requerida'. El correo pedía ingresar las credenciales del sistema para confirmar la actualización.",
    "Una colega que había completado una capacitación de ciberseguridad le pidió que esperara. Revisaron juntos el correo y encontraron señales de alerta: el dominio del remitente era ligeramente diferente al oficial, el enlace llevaba a una dirección desconocida y el tono creaba urgencia artificial.",
    "El phishing es el intento de obtener credenciales mediante engaño. Es la amenaza de ciberseguridad más frecuente en organizaciones de salud. El ransomware, que encripta los datos y pide pago para liberarlos, frecuentemente se introduce a través de un ataque de phishing inicial.",
    "Las buenas prácticas incluyen verificar siempre el remitente real antes de hacer clic en cualquier enlace, no ingresar credenciales en páginas a las que se llegó por un correo inesperado, y reportar inmediatamente cualquier correo sospechoso al área de TI.",
    "En el laboratorio clínico, un ataque de ransomware puede bloquear completamente el acceso al LIMS y a los resultados históricos. La ciberseguridad en salud es responsabilidad de todos, no solo del área de TI.",
  ],
  vocab: [
    { es: "phishing", pt: "phishing" },
    { es: "ransomware", pt: "ransomware" },
    { es: "credenciales", pt: "credenciais" },
    { es: "señal de alerta", pt: "sinal de alerta" },
    { es: "urgencia artificial", pt: "urgência artificial" },
    { es: "verificar el remitente", pt: "verificar o remetente" },
  ],
  quiz: [
    { question: "¿Cuáles fueron las señales de alerta en el correo sospechoso?", options: ["El correo era demasiado largo", "Dominio ligeramente diferente, enlace desconocido y urgencia artificial", "El correo llegó fuera del horario laboral", "El remitente era desconocido"], answer: "Dominio ligeramente diferente, enlace desconocido y urgencia artificial" },
    { question: "¿Qué es el phishing?", options: ["Un tipo de virus que destruye archivos", "El intento de obtener credenciales o acceso mediante engaño por correo falso", "Un ataque que encripta los datos del sistema", "Una falla del sistema de autenticación"], answer: "El intento de obtener credenciales o acceso mediante engaño por correo falso" },
    { question: "¿Cómo se relacionan el phishing y el ransomware?", options: ["Son el mismo tipo de ataque", "El ransomware frecuentemente se introduce a través de un ataque de phishing inicial exitoso", "El ransomware es más común que el phishing en salud", "No tienen relación entre sí"], answer: "El ransomware frecuentemente se introduce a través de un ataque de phishing inicial exitoso" },
    { question: "¿Qué hace el ransomware?", options: ["Roba contraseñas del sistema", "Encripta los datos del sistema y exige pago para liberarlos", "Destruye el disco duro del servidor", "Envía correos falsos desde las cuentas infectadas"], answer: "Encripta los datos del sistema y exige pago para liberarlos" },
    { question: "¿Cuál es la primera acción ante un correo sospechoso?", options: ["Eliminarlo inmediatamente sin más", "No hacer clic en ningún enlace y reportarlo al área de TI", "Responder al remitente para verificar su identidad", "Reenviar el correo al supervisor"], answer: "No hacer clic en ningún enlace y reportarlo al área de TI" },
    { question: "¿Por qué la ciberseguridad es responsabilidad de todos?", options: ["Porque TI no tiene suficiente personal", "Porque la mayoría de los ataques se inician a través de acciones de usuarios no técnicos", "Solo porque la norma ISO lo exige", "Porque TI no puede controlar el correo electrónico"], answer: "Porque la mayoría de los ataques se inician a través de acciones de usuarios no técnicos" },
    { question: "¿Qué consecuencia puede tener un ransomware exitoso en un laboratorio?", options: ["Solo pérdida de datos administrativos", "Bloqueo del LIMS, resultados históricos y documentos con impacto en la atención de pacientes", "Solo pérdida temporal del acceso por horas", "Solo impacto económico por pago del rescate"], answer: "Bloqueo del LIMS, resultados históricos y documentos con impacto en la atención de pacientes" },
    { question: "¿Qué técnica usa el phishing para lograr que la víctima actúe sin pensar?", options: ["Ofrece beneficios económicos atractivos", "Crea urgencia artificial que presiona a actuar sin verificar", "Usa mensajes muy largos con mucha información técnica", "Replica exactamente el diseño del sistema real"], answer: "Crea urgencia artificial que presiona a actuar sin verificar" },
  ],
  dictation: "El phishing usa urgencia artificial para que el usuario ingrese sus credenciales sin verificar el remitente: ante cualquier correo sospechoso hay que reportarlo al área de TI.",
},
{
  id: "inteligencia-artificial", title: "Inteligencia artificial en el laboratorio", level: "Intermedio", category: "Tecnología", emoji: "🤖",
  description: "IA aplicada al diagnóstico, automatización de alertas y apoyo a la decisión clínica.",
  readingTitle: "La IA que ayuda a no perderse nada",
  reading: [
    "La inteligencia artificial (IA) está transformando el laboratorio clínico de formas concretas y prácticas. No se trata de ciencia ficción: hoy existen sistemas de IA que analizan imágenes de frotis de sangre, identifican morfologías celulares anómalas y generan alertas antes de que el analista revise la muestra manualmente.",
    "En el área de histopatología y anatomía patológica, los algoritmos de visión computacional pueden analizar imágenes de tejido y señalar regiones sospechosas con una precisión comparable a la de especialistas entrenados. Esto no reemplaza al patólogo, pero le permite concentrar su atención donde más importa.",
    "Otra aplicación clave es la detección de patrones en grandes volúmenes de datos. Un sistema de IA puede analizar miles de resultados históricos de un laboratorio e identificar que cierto equipo tiende a desviarse los lunes por la mañana, o que determinado reactivo produce más variabilidad en días de alta humedad ambiental. Ese tipo de patrón es invisible para el ojo humano en la rutina diaria.",
    "Los sistemas de apoyo a la decisión clínica (CDSS) integran los resultados del laboratorio con los datos clínicos del paciente y sugieren diagnósticos diferenciales o alertas. Un CDSS puede detectar una combinación de resultados que, aisladamente, parecen normales, pero que en conjunto son compatibles con una condición seria.",
    "La implementación de IA en el laboratorio requiere validación rigurosa, supervisión humana permanente y gestión de los sesgos del algoritmo. Un modelo entrenado con datos de una población específica puede tener un desempeño inferior en poblaciones distintas. El analista del futuro necesita entender estas limitaciones tanto como entiende las del equipo analítico.",
  ],
  vocab: [
    { es: "inteligencia artificial (IA)", pt: "inteligência artificial (IA)" },
    { es: "visión computacional", pt: "visão computacional" },
    { es: "apoyo a la decisión clínica", pt: "apoio à decisão clínica" },
    { es: "algoritmo / modelo", pt: "algoritmo / modelo" },
    { es: "sesgo del algoritmo", pt: "viés do algoritmo" },
    { es: "validación del sistema de IA", pt: "validação do sistema de IA" },
  ],
  quiz: [
    { question: "¿Qué aplicación de IA se menciona para el análisis de frotis de sangre?", options: ["Generar informes automáticos para el médico", "Identificar morfologías celulares anómalas y generar alertas antes de la revisión manual", "Reemplazar completamente al analista en hematología", "Calcular el hemograma sin equipo analítico"], answer: "Identificar morfologías celulares anómalas y generar alertas antes de la revisión manual" },
    { question: "¿Qué hace la IA en histopatología según el texto?", options: ["Reemplaza al patólogo en todos los diagnósticos", "Señala regiones sospechosas en imágenes de tejido para que el patólogo concentre su atención", "Emite el diagnóstico final sin intervención humana", "Solo clasifica las imágenes por color"], answer: "Señala regiones suspechosas en imágenes de tejido para que el patólogo concentre su atención" },
    { question: "¿Qué tipo de patrón puede detectar la IA que es difícil de ver manualmente?", options: ["Solo errores de calibración del día", "Tendencias en grandes volúmenes de datos históricos, como desviaciones recurrentes de un equipo", "Solo resultados fuera de rango en tiempo real", "Solo patrones en muestras pediátricas"], answer: "Tendencias en grandes volúmenes de datos históricos, como desviaciones recurrentes de un equipo" },
    { question: "¿Qué es un sistema CDSS?", options: ["Un tipo de LIMS especializado", "Un sistema de apoyo a la decisión clínica que integra resultados con datos del paciente", "Un software de facturación médica", "Un equipo de análisis automatizado"], answer: "Un sistema de apoyo a la decisión clínica que integra resultados con datos del paciente" },
    { question: "¿Por qué la IA no puede implementarse sin validación rigurosa?", options: ["Porque es muy costosa sin validación previa", "Porque un modelo puede tener desempeño inferior en poblaciones distintas a las de su entrenamiento", "Solo por exigencia regulatoria sin impacto técnico real", "Porque los algoritmos cambian cada semana"], answer: "Porque un modelo puede tener desempeño inferior en poblaciones distintas a las de su entrenamiento" },
    { question: "¿Qué significa 'sesgo del algoritmo'?", options: ["Que el algoritmo comete errores aleatorios", "Que el modelo tiende a funcionar peor en grupos no representados en sus datos de entrenamiento", "Que la IA siempre favorece resultados positivos", "Solo aplica a algoritmos de imagen, no de datos numéricos"], answer: "Que el modelo tiende a funcionar peor en grupos no representados en sus datos de entrenamiento" },
    { question: "¿La IA reemplaza al patólogo en anatomía patológica?", options: ["Sí, completamente en laboratorios modernos", "No, le permite concentrar su atención donde más importa pero no lo reemplaza", "Solo en laboratorios acreditados por ISO 15189", "Sí, pero solo para biopsias de bajo riesgo"], answer: "No, le permite concentrar su atención donde más importa pero no lo reemplaza" },
    { question: "¿Qué habilidad necesita el analista del futuro respecto a la IA?", options: ["Solo saber operar el software de IA", "Entender las limitaciones del modelo de IA igual que entiende las del equipo analítico", "Programar algoritmos de aprendizaje automático", "Solo validar los resultados de IA al final del turno"], answer: "Entender las limitaciones del modelo de IA igual que entiende las del equipo analítico" },
    { question: "¿Qué ejemplo de patrón temporal puede detectar la IA según el texto?", options: ["Que un equipo falla solo cuando hay tormenta", "Que cierto equipo tiende a desviarse los lunes por la mañana o con alta humedad", "Solo errores de transcripción manual de resultados", "Solo tendencias en ensayos de coagulación"], answer: "Que cierto equipo tiende a desviarse los lunes por la mañana o con alta humedad" },
    { question: "¿Qué requiere la supervisión humana permanente de la IA?", options: ["Que un analista revise cada resultado generado por IA antes de liberarlo", "Solo una revisión anual del sistema", "Solo supervisión del área de TI sin participación técnica", "No es necesaria si el sistema está validado"], answer: "Que un analista revise cada resultado generado por IA antes de liberarlo" },
    { question: "¿Qué puede detectar un CDSS que el laboratorio no detectaría solo?", options: ["Solo valores críticos individuales", "Combinaciones de resultados que aisladamente parecen normales pero en conjunto sugieren una condición seria", "Solo errores de identificación de muestras", "Solo interacciones medicamentosas"], answer: "Combinaciones de resultados que aisladamente parecen normales pero en conjunto sugieren una condición seria" },
    { question: "¿Cuál es la diferencia entre IA aplicada al laboratorio y automatización tradicional?", options: ["No hay diferencia real", "La automatización sigue reglas fijas; la IA aprende patrones de datos y puede adaptarse a nuevas situaciones", "La IA es más lenta que la automatización tradicional", "Solo la IA requiere validación según la norma ISO"], answer: "La automatización sigue reglas fijas; la IA aprende patrones de datos y puede adaptarse a nuevas situaciones" },
    { question: "¿Qué riesgo existe si se confía ciegamente en un sistema de IA sin supervisión?", options: ["Solo el riesgo de costos elevados de mantenimiento", "Que errores sistemáticos del algoritmo pasen desapercibidos y afecten resultados de pacientes", "Solo riesgo de pérdida de datos históricos", "Que el sistema se desactualice rápidamente"], answer: "Que errores sistemáticos del algoritmo pasen desapercibidos y afecten resultados de pacientes" },
  ],
  dictation: "La inteligencia artificial en el laboratorio puede detectar patrones invisibles en grandes volúmenes de datos, pero siempre requiere validación y supervisión humana permanente.",
},
{
  id: "automatizacion-robotica", title: "Automatización y robótica", level: "Intermedio", category: "Tecnología", emoji: "🦾",
  description: "Sistemas de track, robots de pipeteo e integración con LIMS en el laboratorio moderno.",
  readingTitle: "La muestra que se mueve sola",
  reading: [
    "La automatización en el laboratorio clínico va mucho más allá de tener equipos modernos. Un sistema de automatización total integra la recepción de muestras, el centrifugado, la distribución, el análisis y el almacenamiento en un flujo continuo coordinado por un sistema central, sin que ninguna muestra tenga que ser manipulada manualmente entre un paso y el siguiente.",
    "Los sistemas de track o líneas de transporte automatizado conectan físicamente los distintos módulos del laboratorio. Una muestra que ingresa al sistema es identificada por su código de barras, dirigida automáticamente al área correcta según los análisis solicitados, y sus resultados son transferidos directamente al LIMS sin intervención manual.",
    "Los robots de pipeteo permiten alícuotar muestras con alta precisión y reproducibilidad, eliminando la variabilidad del pipeteo manual y reduciendo la exposición del personal a materiales potencialmente infecciosos. Son especialmente útiles en áreas de alto volumen como bioquímica y serología.",
    "La automatización no elimina al analista: lo reposiciona. En lugar de pipetear manualmente cientos de muestras por turno, el analista supervisa el sistema, interpreta resultados complejos, gestiona las excepciones y garantiza la calidad de todo el proceso. Su rol se vuelve más técnico, más crítico y más orientado a la decisión.",
    "La implementación de un sistema de automatización total es un proyecto de varios años que requiere rediseño del espacio físico, integración de sistemas informáticos, validación exhaustiva y capacitación profunda del equipo. Los beneficios a largo plazo incluyen mayor capacidad de procesamiento, menor tasa de error preanalítico y mejor tiempo de respuesta.",
  ],
  vocab: [
    { es: "sistema de track / línea de transporte", pt: "sistema de trilho / linha de transporte" },
    { es: "robot de pipeteo", pt: "robô de pipetagem" },
    { es: "alícuota", pt: "alíquota" },
    { es: "flujo de trabajo automatizado", pt: "fluxo de trabalho automatizado" },
    { es: "integración de sistemas", pt: "integração de sistemas" },
    { es: "capacidad de procesamiento", pt: "capacidade de processamento" },
  ],
  quiz: [
    { question: "¿Qué integra un sistema de automatización total del laboratorio?", options: ["Solo los equipos analíticos del área de bioquímica", "Recepción, centrifugado, distribución, análisis y almacenamiento en un flujo continuo", "Solo el LIMS con los equipos analíticos", "Solo el pipeteo y el centrifugado"], answer: "Recepción, centrifugado, distribución, análisis y almacenamiento en un flujo continuo" },
    { question: "¿Qué función cumple el sistema de track?", options: ["Almacenar los reactivos del laboratorio", "Conectar físicamente los módulos del laboratorio y dirigir las muestras automáticamente", "Reemplazar al LIMS como sistema central", "Solo transportar muestras entre pisos del edificio"], answer: "Conectar físicamente los módulos del laboratorio y dirigir las muestras automáticamente" },
    { question: "¿Cómo se identifica y dirige una muestra en el sistema de track?", options: ["El analista la lleva manualmente al área correcta", "Por su código de barras que determina automáticamente el destino según los análisis solicitados", "Por el color del tubo únicamente", "Por el nombre del paciente registrado en pantalla"], answer: "Por su código de barras que determina automáticamente el destino según los análisis solicitados" },
    { question: "¿Qué ventaja ofrecen los robots de pipeteo respecto al pipeteo manual?", options: ["Son más baratos que el personal técnico", "Mayor precisión, reproducibilidad y menor exposición del personal a materiales infecciosos", "Solo son útiles para muestras de orina", "Eliminan la necesidad de calibración del equipo analítico"], answer: "Mayor precisión, reproducibilidad y menor exposición del personal a materiales infecciosos" },
    { question: "¿Cómo cambia el rol del analista con la automatización total?", options: ["Se vuelve innecesario y es reemplazado", "Se reposiciona hacia supervisión, interpretación de casos complejos y gestión de excepciones", "Solo opera el robot de pipeteo", "Su rol no cambia significativamente"], answer: "Se reposiciona hacia supervisión, interpretación de casos complejos y gestión de excepciones" },
    { question: "¿Qué ocurre con los resultados de las muestras procesadas en el track?", options: ["El analista los transcribe manualmente al LIMS", "Se transfieren directamente al LIMS sin intervención manual", "Se imprimen automáticamente y se archivan en papel", "Solo se envían al médico sin pasar por el LIMS"], answer: "Se transfieren directamente al LIMS sin intervención manual" },
    { question: "¿Qué beneficios a largo plazo tiene la automatización total?", options: ["Solo reducción de costos de reactivos", "Mayor capacidad de procesamiento, menor error preanalítico y mejor tiempo de respuesta", "Solo reducción del personal necesario", "Solo mejoras en el área de bioquímica"], answer: "Mayor capacidad de procesamiento, menor error preanalítico y mejor tiempo de respuesta" },
    { question: "¿Por qué la implementación de automatización total toma varios años?", options: ["Por burocracia regulatoria únicamente", "Requiere rediseño físico, integración de sistemas, validación exhaustiva y capacitación profunda", "Solo porque los proveedores tardan en instalar el equipo", "Solo por el costo financiero del proyecto"], answer: "Requiere rediseño físico, integración de sistemas, validación exhaustiva y capacitación profunda" },
    { question: "¿En qué áreas son especialmente útiles los robots de pipeteo?", options: ["Solo en microbiología y cultivos", "En áreas de alto volumen como bioquímica y serología", "Solo en pruebas de coagulación", "Solo para muestras pediátricas de bajo volumen"], answer: "En áreas de alto volumen como bioquímica y serología" },
    { question: "¿Qué es una alícuota en el contexto de la automatización?", options: ["Un tipo de reactivo específico para robots", "Una porción de la muestra original separada para análisis específicos", "El código de barras de la muestra", "El resultado analítico generado automáticamente"], answer: "Una porción de la muestra original separada para análisis específicos" },
    { question: "¿Qué riesgo preanalítico reduce significativamente la automatización?", options: ["Solo los errores de transcripción de resultados", "La variabilidad del manejo manual, incluyendo errores de identificación y contaminación cruzada", "Solo los errores de calibración de equipos", "Solo los errores de temperatura durante el transporte"], answer: "La variabilidad del manejo manual, incluyendo errores de identificación y contaminación cruzada" },
    { question: "¿Qué debe hacer el analista cuando el sistema de track detecta una muestra con excepción?", options: ["Ignorarla y continuar el flujo automatizado", "Investigar la causa, resolver la excepción manualmente y documentar el incidente", "Desechar la muestra automáticamente", "Transferirla a otro laboratorio"], answer: "Investigar la causa, resolver la excepción manualmente y documentar el incidente" },
    { question: "¿Por qué la integración entre el sistema de track y el LIMS es crítica?", options: ["Solo por razones estéticas del flujo de trabajo", "Porque garantiza la trazabilidad completa de cada muestra desde el ingreso hasta el resultado", "Solo para cumplir con la norma ISO 15189", "Solo para reducir el tiempo de trabajo del analista"], answer: "Porque garantiza la trazabilidad completa de cada muestra desde el ingreso hasta el resultado" },
  ],
  dictation: "La automatización total integra el flujo completo de la muestra y reposiciona al analista hacia la supervisión del sistema y la interpretación de casos complejos.",
},
{
  id: "telemedicina-laboratorio", title: "Telemedicina y laboratorio remoto", level: "Intermedio", category: "Tecnología", emoji: "📡",
  description: "Acceso remoto a resultados, tele-consulta técnica y laboratorio punto de atención (POCT).",
  readingTitle: "El resultado que viaja sin moverse",
  reading: [
    "La telemedicina y el laboratorio remoto son dos conceptos distintos pero complementarios. La telemedicina incluye cualquier práctica clínica mediada por tecnología a distancia, incluyendo la interpretación remota de resultados de laboratorio. El laboratorio remoto, en cambio, se refiere a la posibilidad de realizar análisis fuera del laboratorio central, por ejemplo en una unidad de cuidados intensivos, un puesto de salud rural o el domicilio del paciente.",
    "El laboratorio de punto de atención, conocido como POCT (Point of Care Testing), permite realizar análisis básicos directamente donde está el paciente. Glucómetros, analizadores de gases en sangre portátiles, pruebas rápidas de troponina o de virus: todos son ejemplos de POCT. Su ventaja principal es el tiempo: los resultados están disponibles en minutos, permitiendo decisiones clínicas inmediatas.",
    "Desde el punto de vista de la calidad, el POCT plantea desafíos importantes. Muchos de estos dispositivos son operados por personal no de laboratorio, como enfermeros o médicos, que pueden no tener entrenamiento en control de calidad analítico. Esto hace que la supervisión del laboratorio central sobre los dispositivos POCT sea un requisito de la ISO 15189.",
    "La transmisión remota de resultados es hoy una realidad cotidiana. Un paciente en un área rural puede realizarse un análisis básico en un puesto de salud local, y el resultado llega automáticamente al sistema del médico en la ciudad, junto con la alerta si hay un valor crítico. Esto reduce tiempos de diagnóstico en contextos de baja accesibilidad.",
    "El analista que trabaja con sistemas de laboratorio remoto y POCT necesita habilidades adicionales: capacidad para capacitar a personal no especializado, para establecer protocolos de control de calidad adaptados a entornos no controlados, y para comunicar a distancia hallazgos técnicos relevantes.",
  ],
  vocab: [
    { es: "POCT (Point of Care Testing)", pt: "POCT (Teste no Ponto de Cuidado)" },
    { es: "laboratorio remoto", pt: "laboratório remoto" },
    { es: "transmisión remota de resultados", pt: "transmissão remota de resultados" },
    { es: "dispositivo portátil", pt: "dispositivo portátil" },
    { es: "accesibilidad diagnóstica", pt: "acessibilidade diagnóstica" },
    { es: "supervisión del laboratorio central", pt: "supervisão do laboratório central" },
  ],
  quiz: [
    { question: "¿Cuál es la diferencia entre telemedicina y laboratorio remoto?", options: ["Son exactamente lo mismo", "La telemedicina incluye práctica clínica a distancia; el laboratorio remoto realiza análisis fuera del laboratorio central", "La telemedicina solo aplica a consultas médicas sin laboratorio", "El laboratorio remoto es solo para urgencias"], answer: "La telemedicina incluye práctica clínica a distancia; el laboratorio remoto realiza análisis fuera del laboratorio central" },
    { question: "¿Qué significa POCT?", options: ["Procedimiento Operativo de Control Total", "Point of Care Testing: análisis realizados directamente donde está el paciente", "Protocolo de Calidad Técnica", "Proceso de Operación de Control de Turno"], answer: "Point of Care Testing: análisis realizados directamente donde está el paciente" },
    { question: "¿Cuál es la ventaja principal del POCT?", options: ["Mayor precisión que el laboratorio central", "Resultados disponibles en minutos que permiten decisiones clínicas inmediatas", "Menor costo por análisis que el laboratorio central", "No requiere control de calidad"], answer: "Resultados disponibles en minutos que permiten decisiones clínicas inmediatas" },
    { question: "¿Qué desafío de calidad plantea el POCT?", options: ["Que los dispositivos son muy costosos", "Que es operado por personal sin entrenamiento en control de calidad analítico", "Que los resultados no pueden transmitirse digitalmente", "Que solo funciona para glucosa y no otros analitos"], answer: "Que es operado por personal sin entrenamiento en control de calidad analítico" },
    { question: "¿Qué exige la ISO 15189 respecto al POCT?", options: ["Que sea operado exclusivamente por analistas del laboratorio", "Que el laboratorio central supervise los dispositivos POCT y sus controles de calidad", "Que el POCT no forme parte del sistema de calidad del laboratorio", "Solo que los resultados sean registrados en papel"], answer: "Que el laboratorio central supervise los dispositivos POCT y sus controles de calidad" },
    { question: "¿Qué beneficio tiene la transmisión remota de resultados en áreas rurales?", options: ["Elimina la necesidad de laboratorios locales", "Reduce tiempos de diagnóstico en contextos de baja accesibilidad geográfica", "Solo sirve para resultados no críticos", "Solo es útil en países desarrollados"], answer: "Reduce tiempos de diagnóstico en contextos de baja accesibilidad geográfica" },
    { question: "¿Qué habilidades adicionales necesita el analista en entornos POCT?", options: ["Solo conocer los dispositivos portátiles", "Capacitar personal no especializado, diseñar protocolos adaptados y comunicar hallazgos a distancia", "Solo supervisar los resultados críticos", "Solo manejar el software de transmisión"], answer: "Capacitar personal no especializado, diseñar protocolos adaptados y comunicar hallazgos a distancia" },
    { question: "¿Qué ejemplos de POCT se mencionan en el texto?", options: ["Solo glucómetros domésticos", "Glucómetros, analizadores de gases portátiles, pruebas rápidas de troponina y de virus", "Solo pruebas de embarazo", "Solo análisis de orina con tiras reactivas"], answer: "Glucómetros, analizadores de gases portátiles, pruebas rápidas de troponina y de virus" },
    { question: "¿Cómo llega el resultado de un POCT rural al médico en la ciudad?", options: ["El paciente lleva el resultado impreso", "Se transmite automáticamente al sistema del médico con alerta si hay valor crítico", "El analista lo envía por correo al día siguiente", "El médico debe consultar el sistema manualmente cada vez"], answer: "Se transmite automáticamente al sistema del médico con alerta si hay valor crítico" },
    { question: "¿Por qué el control de calidad en POCT es más complejo que en el laboratorio central?", options: ["Porque los dispositivos POCT son menos precisos", "Porque el entorno no es controlado y el operador puede no tener formación analítica", "Solo porque hay más muestras por procesar", "Solo por restricciones regulatorias locales"], answer: "Porque el entorno no es controlado y el operador puede no tener formación analítica" },
    { question: "¿Qué información debe transmitirse junto con el resultado remoto?", options: ["Solo el valor numérico", "El resultado, la identificación del paciente, el dispositivo usado, el operador y cualquier alerta relevante", "Solo el resultado y la fecha", "Solo la alerta de valor crítico si corresponde"], answer: "El resultado, la identificación del paciente, el dispositivo usado, el operador y cualquier alerta relevante" },
    { question: "¿Cuándo es más valioso el laboratorio remoto desde el punto de vista clínico?", options: ["Solo en hospitales de alta complejidad", "En contextos de urgencia, baja accesibilidad o cuando el tiempo de diagnóstico es crítico", "Solo para pacientes crónicos estables", "Solo en países con sistemas de salud avanzados"], answer: "En contextos de urgencia, baja accesibilidad o cuando el tiempo de diagnóstico es crítico" },
    { question: "¿Qué protocolo debe implementar el laboratorio central para los dispositivos POCT bajo su supervisión?", options: ["Solo registrar los resultados que envían", "Definir el programa de controles, la frecuencia de calibración, la capacitación y los criterios de rechazo", "Solo revisar los resultados críticos mensualmente", "Solo asegurarse de que los dispositivos tengan batería"], answer: "Definir el programa de controles, la frecuencia de calibración, la capacitación y los criterios de rechazo" },
  ],
  dictation: "El POCT permite obtener resultados en minutos directamente donde está el paciente, pero requiere supervisión del laboratorio central para garantizar la calidad analítica.",
},
{
  id: "equipos-mantenimiento", title: "Equipos analíticos y mantenimiento", level: "Intermedio", category: "Tecnología", emoji: "🔧",
  description: "Mantenimiento preventivo, calibración, trazabilidad metrológica y gestión de equipos.",
  readingTitle: "El equipo que no falla de golpe",
  reading: [
    "En el laboratorio clínico, los equipos analíticos son el corazón del proceso. Un equipo mal mantenido no falla de un día para otro: falla gradualmente, de formas que a veces el control interno detecta tarde. El mantenimiento preventivo es la estrategia para anticiparse a esas fallas antes de que afecten los resultados de los pacientes.",
    "El mantenimiento preventivo incluye una serie de actividades programadas: limpieza de líneas y celdas de flujo, reemplazo de piezas con vida útil definida, verificación de parámetros de funcionamiento y calibración con materiales trazables a estándares de referencia. Cada una de estas actividades tiene una frecuencia recomendada por el fabricante que debe seguirse y documentarse.",
    "La calibración es el proceso que establece la relación entre la señal del equipo y la concentración real del analito. Un equipo descalibrado puede producir resultados sistemáticamente desplazados, lo que puede pasar inadvertido si el control interno tiene límites demasiado amplios. Por eso, la calibración debe realizarse con materiales de referencia certificados y trazables.",
    "El inventario de equipos es otro componente clave de la gestión. Cada equipo debe tener un registro que incluya: identificación única, fabricante, modelo, número de serie, fecha de instalación, historial de mantenimiento y calibraciones, incidentes registrados y contratos de servicio vigentes. Este registro es un requisito de la ISO 15189 y es revisado en toda auditoría.",
    "Cuando un equipo falla durante la rutina, el laboratorio debe tener un plan de contingencia: ¿qué análisis se afectan? ¿Existe un equipo de respaldo? ¿Se derivan muestras a otro laboratorio? ¿Cómo se comunica la situación al médico? La respuesta a estas preguntas debe estar escrita antes de que ocurra la falla.",
  ],
  vocab: [
    { es: "mantenimiento preventivo", pt: "manutenção preventiva" },
    { es: "calibración / recalibración", pt: "calibração / recalibração" },
    { es: "trazabilidad metrológica", pt: "rastreabilidade metrológica" },
    { es: "registro de equipo", pt: "registro de equipamento" },
    { es: "plan de contingencia de equipo", pt: "plano de contingência de equipamento" },
    { es: "vida útil de componente", pt: "vida útil de componente" },
  ],
  quiz: [
    { question: "¿Cómo falla habitualmente un equipo mal mantenido en el laboratorio?", options: ["De forma abrupta e inmediata", "Gradualmente, de formas que el control interno puede detectar tarde", "Solo falla en los fines de semana", "Solo en equipos con más de diez años de uso"], answer: "Gradualmente, de formas que el control interno puede detectar tarde" },
    { question: "¿Qué incluye el mantenimiento preventivo?", options: ["Solo la limpieza exterior del equipo", "Limpieza, reemplazo de piezas con vida útil definida, verificación de parámetros y calibración", "Solo la calibración mensual", "Solo el reemplazo de reactivos vencidos"], answer: "Limpieza, reemplazo de piezas con vida útil definida, verificación de parámetros y calibración" },
    { question: "¿Qué establece la calibración en un equipo analítico?", options: ["Que el equipo está limpio y listo para usar", "La relación entre la señal del equipo y la concentración real del analito", "El límite de detección del método", "Solo la linealidad del método"], answer: "La relación entre la señal del equipo y la concentración real del analito" },
    { question: "¿Por qué un equipo descalibrado puede pasar inadvertido?", options: ["Porque los controles internos siempre detectan descalibración", "Porque si los límites del control interno son amplios, el desplazamiento sistemático puede no activar alertas", "Solo si el equipo fue instalado recientemente", "Solo en equipos de bioquímica, no en hematología"], answer: "Porque si los límites del control interno son amplios, el desplazamiento sistemático puede no activar alertas" },
    { question: "¿Con qué tipo de materiales debe realizarse la calibración?", options: ["Con controles internos del propio laboratorio", "Con materiales de referencia certificados y trazables a estándares de referencia", "Con el calibrador comercial del kit, sin más requisito", "Solo con materiales del mismo fabricante del equipo"], answer: "Con materiales de referencia certificados y trazables a estándares de referencia" },
    { question: "¿Qué debe incluir el registro de cada equipo del laboratorio?", options: ["Solo el nombre del equipo y el área donde está", "Identificación, fabricante, modelo, serie, instalación, historial de mantenimiento y contratos", "Solo las fechas de calibración del año en curso", "Solo el nombre del analista responsable del equipo"], answer: "Identificación, fabricante, modelo, serie, instalación, historial de mantenimiento y contratos" },
    { question: "¿Por qué el registro de equipos es revisado en auditorías ISO 15189?", options: ["Solo para verificar que el equipo es nuevo", "Porque demuestra que el laboratorio gestiona activamente el mantenimiento y la trazabilidad de sus instrumentos", "Solo para validar el costo de los equipos", "Solo si hubo incidentes reportados el año anterior"], answer: "Porque demuestra que el laboratorio gestiona activamente el mantenimiento y la trazabilidad de sus instrumentos" },
    { question: "¿Qué debe contener el plan de contingencia ante una falla de equipo?", options: ["Solo el número del proveedor de servicio técnico", "Qué análisis se afectan, si hay equipo de respaldo, cómo se derivan muestras y cómo se comunica al médico", "Solo el procedimiento de reinicio del equipo", "Solo la lista de análisis que no pueden realizarse"], answer: "Qué análisis se afectan, si hay equipo de respaldo, cómo se derivan muestras y cómo se comunica al médico" },
    { question: "¿Con qué frecuencia deben realizarse las actividades de mantenimiento preventivo?", options: ["Solo cuando el equipo muestra señales de problema", "Con la frecuencia recomendada por el fabricante, documentada en el registro del equipo", "Una vez al año como mínimo para todos los equipos", "Solo cuando el proveedor de servicio lo programa"], answer: "Con la frecuencia recomendada por el fabricante, documentada en el registro del equipo" },
    { question: "¿Qué es la trazabilidad metrológica en el contexto de la calibración de equipos?", options: ["El historial de todos los resultados producidos por el equipo", "La cadena que conecta la calibración del equipo con un patrón de referencia internacional reconocido", "Solo el certificado de calibración del fabricante", "El registro de todas las fallas del equipo"], answer: "La cadena que conecta la calibración del equipo con un patrón de referencia internacional reconocido" },
    { question: "¿Qué diferencia hay entre mantenimiento preventivo y mantenimiento correctivo?", options: ["Son lo mismo con distinto nombre", "El preventivo se realiza antes de que ocurra la falla; el correctivo repara una falla ya ocurrida", "El correctivo siempre es más costoso en tiempo, no en dinero", "Solo el preventivo está incluido en el contrato de servicio"], answer: "El preventivo se realiza antes de que ocurra la falla; el correctivo repara una falla ya ocurrida" },
    { question: "¿Qué debe comunicarse al médico cuando un equipo crítico falla durante la rutina?", options: ["Nada, el laboratorio resuelve internamente", "Que ciertos análisis tienen demora o deben derivarse, con el tiempo estimado de resolución", "Solo cuando la falla dura más de 24 horas", "Solo si el médico pregunta activamente"], answer: "Que ciertos análisis tienen demora o deben derivarse, con el tiempo estimado de resolución" },
    { question: "¿Qué ocurre si se omite documentar una actividad de mantenimiento realizada?", options: ["No tiene consecuencias si el equipo funciona bien", "Para el sistema de calidad y la auditoría, una actividad no documentada es una actividad no realizada", "Solo es un problema si hay una no conformidad posterior", "Solo importa para equipos de coagulación y gasometría"], answer: "Para el sistema de calidad y la auditoría, una actividad no documentada es una actividad no realizada" },
  ],
  dictation: "El mantenimiento preventivo se realiza antes de que el equipo falle y toda actividad debe documentarse en el registro del equipo con fecha, responsable y resultado.",
},
{
  id: "interoperabilidad", title: "Interoperabilidad y estándares digitales", level: "Avanzado", category: "Tecnología", emoji: "🔗",
  description: "HL7, FHIR y cómo los laboratorios intercambian datos con hospitales y sistemas de salud.",
  readingTitle: "Cuando los sistemas no se entienden entre sí",
  reading: [
    "En un hospital moderno, el laboratorio no opera de forma aislada: sus resultados deben llegar al sistema del médico, al historial clínico electrónico del paciente, a la farmacia, a la unidad de cuidados intensivos y eventualmente a registros de salud pública. Cuando esos sistemas no pueden intercambiar información de forma automática y confiable, el resultado es la transcripción manual, los errores de identificación y la pérdida de trazabilidad. La interoperabilidad es la capacidad de sistemas distintos para comunicarse y entenderse.",
    "HL7 (Health Level Seven) es el estándar internacional más utilizado para el intercambio de información clínica entre sistemas de salud. Define cómo se estructuran y transmiten los mensajes: un resultado de laboratorio, una orden de análisis, un alta hospitalaria. Cada mensaje HL7 sigue una estructura fija con segmentos identificados, lo que permite que un sistema emisor y un sistema receptor intercambien datos sin intervención humana.",
    "FHIR (Fast Healthcare Interoperability Resources) es el estándar más moderno, desarrollado por HL7 International. A diferencia de las versiones anteriores de HL7, FHIR usa tecnología web estándar (APIs REST, JSON, XML) y es mucho más fácil de implementar. Está siendo adoptado como estándar obligatorio en varios países, incluyendo Estados Unidos, y crece rápidamente en Latinoamérica.",
    "Para el laboratorio clínico, la interoperabilidad tiene implicaciones prácticas directas. Una interfaz HL7 bien configurada entre el sistema hospitalario y el LIMS permite que las órdenes de análisis lleguen automáticamente al laboratorio y que los resultados validados vuelvan al historial del paciente sin transcripción manual. Esto reduce errores, acelera el TAT y mejora la trazabilidad.",
    "La implementación de interfaces de interoperabilidad requiere colaboración entre el área técnica del laboratorio, el equipo de TI institucional y los proveedores de los sistemas involucrados. El laboratorio debe participar activamente en la definición de los mapeos de datos —qué campo del LIMS corresponde a qué campo del sistema receptor— para garantizar que la información llegue completa, correcta y en el formato esperado.",
  ],
  vocab: [
    { es: "interoperabilidad", pt: "interoperabilidade" },
    { es: "estándar HL7 / FHIR", pt: "padrão HL7 / FHIR" },
    { es: "interfaz / integración de sistemas", pt: "interface / integração de sistemas" },
    { es: "historial clínico electrónico", pt: "prontuário eletrônico do paciente" },
    { es: "API / servicio web", pt: "API / serviço web" },
    { es: "mapeo de datos", pt: "mapeamento de dados" },
  ],
  quiz: [
    { question: "¿Qué es la interoperabilidad en el contexto de los sistemas de salud?", options: ["La capacidad de un sistema de funcionar sin conexión a internet", "La capacidad de sistemas distintos de comunicarse e intercambiar información de forma confiable", "El proceso de migrar datos de un sistema a otro manualmente", "La compatibilidad de hardware entre equipos de distintos fabricantes"], answer: "La capacidad de sistemas distintos de comunicarse e intercambiar información de forma confiable" },
    { question: "¿Para qué sirve el estándar HL7?", options: ["Para configurar la seguridad de las redes hospitalarias", "Para definir cómo se estructuran y transmiten mensajes clínicos entre sistemas de salud", "Para gestionar el inventario de reactivos del laboratorio", "Para encriptar los datos del paciente durante el transporte"], answer: "Para definir cómo se estructuran y transmiten mensajes clínicos entre sistemas de salud" },
    { question: "¿Qué ventaja tiene FHIR sobre las versiones anteriores de HL7?", options: ["Es más antiguo y por lo tanto más estable", "Usa tecnología web estándar (APIs REST, JSON) y es más fácil de implementar", "Solo funciona en sistemas hospitalarios públicos", "No requiere ningún tipo de configuración técnica"], answer: "Usa tecnología web estándar (APIs REST, JSON) y es más fácil de implementar" },
    { question: "¿Qué elimina una interfaz HL7 bien configurada entre el LIMS y el sistema hospitalario?", options: ["La necesidad de controles internos de calidad", "La transcripción manual de órdenes y resultados, reduciendo errores y mejorando el TAT", "La necesidad de validación de resultados por el analista", "Los costos de mantenimiento del LIMS"], answer: "La transcripción manual de órdenes y resultados, reduciendo errores y mejorando el TAT" },
    { question: "¿Qué es un mapeo de datos en el contexto de la interoperabilidad?", options: ["Un diagrama del flujo de muestras en el laboratorio", "La definición de qué campo de un sistema corresponde a qué campo del sistema receptor", "El registro de todos los datos del paciente en formato digital", "El proceso de validación de resultados en el LIMS"], answer: "La definición de qué campo de un sistema corresponde a qué campo del sistema receptor" },
    { question: "¿Qué problema genera la falta de interoperabilidad entre sistemas?", options: ["Solo ralentiza la facturación del laboratorio", "Transcripción manual, errores de identificación y pérdida de trazabilidad de los resultados", "Solo afecta a los laboratorios hospitalarios, no a los ambulatorios", "Solo cuando los sistemas son de fabricantes distintos"], answer: "Transcripción manual, errores de identificación y pérdida de trazabilidad de los resultados" },
    { question: "¿Quiénes deben colaborar en la implementación de una interfaz de interoperabilidad?", options: ["Solo el proveedor del LIMS", "El área técnica del laboratorio, TI institucional y los proveedores de los sistemas involucrados", "Solo el área de TI sin participación del laboratorio", "Solo el director técnico del laboratorio"], answer: "El área técnica del laboratorio, TI institucional y los proveedores de los sistemas involucrados" },
    { question: "¿Por qué el laboratorio debe participar activamente en la definición del mapeo de datos?", options: ["Para reducir el costo del proyecto de integración", "Para garantizar que la información llegue completa y correcta al sistema receptor", "Solo para cumplir con el requisito de la ISO 15189", "Solo si el sistema receptor es un historial clínico electrónico"], answer: "Para garantizar que la información llegue completa y correcta al sistema receptor" },
    { question: "¿Qué tipo de tecnología utiliza FHIR para el intercambio de datos?", options: ["Mensajes de texto plano sin estructura definida", "APIs REST con formatos JSON o XML, tecnología web estándar", "Solo archivos PDF generados automáticamente", "Bases de datos relacionales propietarias"], answer: "APIs REST con formatos JSON o XML, tecnología web estándar" },
    { question: "¿Qué impacto tiene la interoperabilidad en la trazabilidad del resultado del laboratorio?", options: ["Ninguno, la trazabilidad depende solo del LIMS interno", "Permite que cada resultado quede vinculado automáticamente al historial del paciente sin intervención manual", "Solo mejora la trazabilidad en laboratorios con acreditación ISO", "Solo si el sistema receptor también tiene acreditación"], answer: "Permite que cada resultado quede vinculado automáticamente al historial del paciente sin intervención manual" },
    { question: "¿Por qué FHIR crece rápidamente en Latinoamérica?", options: ["Porque es gratuito para todos los laboratorios", "Porque varios países lo adoptan como estándar obligatorio y su implementación basada en web es más accesible", "Solo porque reemplaza completamente al HL7 anterior sin período de transición", "Porque no requiere ningún trabajo técnico de configuración"], answer: "Porque varios países lo adoptan como estándar obligatorio y su implementación basada en web es más accesible" },
    { question: "¿Qué riesgo clínico concreto reduce la interoperabilidad bien implementada?", options: ["El riesgo de que los equipos fallen durante la rutina", "Los errores de identificación de pacientes y de transcripción que pueden generar decisiones clínicas incorrectas", "Solo el riesgo de pérdida de datos históricos del laboratorio", "Solo los errores de calibración de los equipos analíticos"], answer: "Los errores de identificación de pacientes y de transcripción que pueden generar decisiones clínicas incorrectas" },
  ],
  dictation: "La interoperabilidad permite que los resultados del laboratorio lleguen automáticamente al historial clínico del paciente mediante estándares como HL7 y FHIR, eliminando la transcripción manual.",
},
{
  id: "big-data-laboratorio", title: "Big data y analítica en el laboratorio", level: "Avanzado", category: "Tecnología", emoji: "📊",
  description: "Cómo los grandes volúmenes de datos del laboratorio generan valor clínico, operativo y de calidad.",
  readingTitle: "Los datos que siempre estuvieron ahí",
  reading: [
    "Cada análisis procesado en un laboratorio clínico genera datos: el resultado, el método, el equipo, el lote de reactivo, el analista, la hora, el resultado del control de calidad asociado. Multiplicado por miles de análisis diarios durante años, ese conjunto de datos es una fuente extraordinaria de información que la mayoría de los laboratorios apenas aprovecha. El big data aplicado al laboratorio es exactamente eso: extraer valor de los datos que ya existen.",
    "Las aplicaciones de analítica en el laboratorio se organizan en tres niveles. La analítica descriptiva resume lo que ocurrió: volúmenes procesados por área, tasas de rechazo, distribución del TAT, frecuencia de fallas por equipo. Es la base de los dashboards de indicadores que muchos laboratorios ya usan. La analítica predictiva usa modelos estadísticos para anticipar lo que va a ocurrir: predecir picos de demanda, detectar que un equipo está cerca de fallar antes de que falle, identificar reactivos que tienden a desviarse al final de su vida útil.",
    "La analítica prescriptiva va un paso más allá: no solo predice sino que recomienda acciones. Un sistema prescriptivo podría sugerir automáticamente reprogramar un mantenimiento preventivo, ajustar el nivel de stock de un reactivo o reasignar muestras entre equipos para optimizar el TAT. Este nivel aún no es común en la mayoría de los laboratorios, pero es la dirección hacia la que apunta la industria.",
    "Una aplicación especialmente valiosa es el uso de datos de pacientes para controlar la calidad analítica en tiempo real. El algoritmo de Bull, por ejemplo, utiliza los índices eritrocitarios de las muestras procesadas para detectar desviaciones del proceso sin necesidad de materiales de control adicionales. Este enfoque, llamado 'control de calidad basado en datos del paciente', complementa el control interno convencional.",
    "El principal desafío del big data en el laboratorio no es técnico: es cultural. Requiere que el laboratorio pase de una cultura reactiva —que analiza datos cuando hay un problema— a una cultura proactiva que analiza datos continuamente para anticipar problemas y mejorar procesos. Esa transición requiere liderazgo, capacitación y, sobre todo, la decisión de invertir tiempo en el análisis de la información disponible.",
  ],
  vocab: [
    { es: "big data / grandes volúmenes de datos", pt: "big data / grandes volumes de dados" },
    { es: "analítica descriptiva / predictiva / prescriptiva", pt: "análise descritiva / preditiva / prescritiva" },
    { es: "dashboard / panel de indicadores", pt: "dashboard / painel de indicadores" },
    { es: "algoritmo de Bull", pt: "algoritmo de Bull" },
    { es: "datos del paciente para control de calidad", pt: "dados do paciente para controle de qualidade" },
    { es: "cultura proactiva de datos", pt: "cultura proativa de dados" },
  ],
  quiz: [
    { question: "¿Qué es el big data aplicado al laboratorio clínico?", options: ["Tener un servidor con mucha capacidad de almacenamiento", "Extraer valor de los grandes volúmenes de datos que el laboratorio ya genera en su operación diaria", "Solo los datos de pacientes almacenados en el LIMS", "El conjunto de análisis estadísticos del control interno"], answer: "Extraer valor de los grandes volúmenes de datos que el laboratorio ya genera en su operación diaria" },
    { question: "¿Qué hace la analítica descriptiva?", options: ["Predice lo que va a ocurrir en el próximo mes", "Resume lo que ocurrió: volúmenes, tasas de rechazo, TAT, fallas por equipo", "Recomienda acciones preventivas automáticamente", "Detecta patrones de enfermedad en la población atendida"], answer: "Resume lo que ocurrió: volúmenes, tasas de rechazo, TAT, fallas por equipo" },
    { question: "¿Qué hace la analítica predictiva que la descriptiva no hace?", options: ["Resume el desempeño histórico del laboratorio", "Usa modelos estadísticos para anticipar eventos futuros como picos de demanda o fallas de equipo", "Recomienda acciones concretas al personal técnico", "Solo analiza los resultados de los controles internos"], answer: "Usa modelos estadísticos para anticipar eventos futuros como picos de demanda o fallas de equipo" },
    { question: "¿Qué caracteriza a la analítica prescriptiva?", options: ["Solo describe lo que pasó con más detalle que la descriptiva", "No solo predice sino que recomienda acciones concretas como reprogramar mantenimientos o ajustar stock", "Es el nivel más básico de analítica disponible hoy", "Solo aplica a laboratorios con más de 100 equipos analíticos"], answer: "No solo predice sino que recomienda acciones concretas como reprogramar mantenimientos o ajustar stock" },
    { question: "¿Para qué usa el algoritmo de Bull los datos del paciente?", options: ["Para predecir diagnósticos clínicos", "Para detectar desviaciones del proceso analítico usando índices eritrocitarios de muestras reales", "Para calcular los intervalos de referencia de la población atendida", "Para reemplazar completamente el control interno convencional"], answer: "Para detectar desviaciones del proceso analítico usando índices eritrocitarios de muestras reales" },
    { question: "¿Cómo complementa el control de calidad basado en datos del paciente al control interno convencional?", options: ["Lo reemplaza completamente en laboratorios modernos", "Agrega una fuente continua de información de calidad basada en muestras reales, sin costo adicional de materiales", "Solo funciona para el hemograma, no para otros analitos", "Solo si el laboratorio tiene más de 500 muestras diarias"], answer: "Agrega una fuente continua de información de calidad basada en muestras reales, sin costo adicional de materiales" },
    { question: "¿Cuál es el principal desafío del big data en el laboratorio según el texto?", options: ["La falta de datos suficientes para el análisis", "El desafío cultural: pasar de una cultura reactiva a una proactiva de análisis continuo de datos", "El costo de los servidores necesarios para almacenar los datos", "La falta de estándares técnicos para el análisis de datos en salud"], answer: "El desafío cultural: pasar de una cultura reactiva a una proactiva de análisis continuo de datos" },
    { question: "¿Qué diferencia a una cultura proactiva de datos de una reactiva?", options: ["La proactiva analiza datos solo cuando hay una no conformidad", "La proactiva analiza datos continuamente para anticipar problemas; la reactiva lo hace solo cuando ya ocurrieron", "Solo la proactiva usa el LIMS para almacenar resultados", "No hay diferencia real en los resultados finales"], answer: "La proactiva analiza datos continuamente para anticipar problemas; la reactiva lo hace solo cuando ya ocurrieron" },
    { question: "¿Qué tipo de datos genera cada análisis procesado en el laboratorio?", options: ["Solo el resultado numérico y la fecha", "Resultado, método, equipo, lote de reactivo, analista, hora y resultado del control de calidad asociado", "Solo los datos del paciente y el análisis solicitado", "Solo los datos que el LIMS decide almacenar"], answer: "Resultado, método, equipo, lote de reactivo, analista, hora y resultado del control de calidad asociado" },
    { question: "¿Qué requiere la transición hacia una cultura proactiva de datos?", options: ["Solo comprar software de analítica avanzado", "Liderazgo, capacitación y la decisión de invertir tiempo en el análisis continuo de los datos disponibles", "Solo contratar un especialista en datos externo", "Solo que el LIMS tenga módulo de reportes avanzado"], answer: "Liderazgo, capacitación y la decisión de invertir tiempo en el análisis continuo de los datos disponibles" },
    { question: "¿Qué ejemplo de analítica predictiva se menciona en el texto?", options: ["Calcular el TAT promedio del mes anterior", "Detectar que un equipo está cerca de fallar antes de que lo haga, o identificar reactivos que tienden a desviarse al final de su vida útil", "Sugerir automáticamente reasignar muestras entre equipos", "Resumir la tasa de rechazo preanalítico del trimestre"], answer: "Detectar que un equipo está cerca de fallar antes de que lo haga, o identificar reactivos que tienden a desviarse al final de su vida útil" },
    { question: "¿Por qué la mayoría de los laboratorios no aprovecha suficientemente sus datos históricos?", options: ["Porque los datos no contienen información útil", "Porque requiere una cultura y capacidad analítica que muchos laboratorios aún no han desarrollado", "Porque los datos del LIMS no son confiables para análisis estadístico", "Porque los organismos acreditadores no lo exigen"], answer: "Porque requiere una cultura y capacidad analítica que muchos laboratorios aún no han desarrollado" },
  ],
  dictation: "El big data en el laboratorio permite pasar de una analítica descriptiva que resume lo ocurrido a una predictiva que anticipa problemas antes de que afecten los resultados.",
},
{
  id: "privacidad-datos", title: "Privacidad de datos y expediente electrónico", level: "Intermedio", category: "Tecnología", emoji: "🔒",
  description: "LGPD, protección de datos del paciente, firma digital y gestión del expediente clínico electrónico.",
  readingTitle: "Los datos del paciente no son del laboratorio",
  reading: [
    "Cada resultado de laboratorio es un dato sensible: revela información sobre la salud de una persona que tiene derecho a que esa información sea protegida, usada solo para los fines para los que fue recolectada y no compartida sin su consentimiento. En Brasil, la Lei Geral de Proteção de Dados (LGPD), vigente desde 2020, establece el marco legal para el tratamiento de datos personales, incluyendo los datos de salud, que reciben protección especial por considerarse datos sensibles.",
    "Para el laboratorio clínico, la LGPD implica obligaciones concretas: contar con una base legal para el tratamiento de los datos del paciente (el consentimiento o la ejecución de un contrato de servicio); garantizar que los datos solo sean accedidos por quienes los necesitan; tener mecanismos para responder a solicitudes del titular —el paciente— de acceso, corrección o eliminación de sus datos; y notificar a la autoridad competente en caso de incidente de seguridad.",
    "El expediente clínico electrónico es el registro digital de toda la información clínica de un paciente, incluyendo sus resultados de laboratorio. Su gestión requiere controles de acceso por roles —no todos los usuarios del sistema pueden ver todos los datos—, trazabilidad de quién accedió a qué y cuándo, y sistemas de respaldo que garanticen la integridad del historial en el largo plazo.",
    "La firma digital es el mecanismo técnico y legal que permite validar documentos electrónicos con la misma validez jurídica que una firma manuscrita. En el laboratorio, la firma digital del director técnico en los informes electrónicos garantiza la autenticidad del documento y la responsabilidad profesional sobre el resultado emitido. Brasil cuenta con la Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil) como marco de confianza para los certificados digitales.",
    "El principal riesgo en la gestión de datos de salud no siempre es el ataque externo: frecuentemente es el acceso interno no autorizado, el envío de resultados a destinatarios incorrectos o la eliminación accidental de registros. Una política clara de acceso, capacitación del personal en manejo de datos sensibles y auditorías periódicas de los registros de acceso son las medidas más efectivas para mitigar ese riesgo.",
  ],
  vocab: [
    { es: "LGPD (Ley General de Protección de Datos)", pt: "LGPD (Lei Geral de Proteção de Dados)" },
    { es: "datos sensibles / datos de salud", pt: "dados sensíveis / dados de saúde" },
    { es: "titular de los datos", pt: "titular dos dados" },
    { es: "firma digital / certificado digital", pt: "assinatura digital / certificado digital" },
    { es: "expediente clínico electrónico", pt: "prontuário eletrônico do paciente" },
    { es: "control de acceso por roles", pt: "controle de acesso por perfis" },
  ],
  quiz: [
    { question: "¿Por qué los datos de salud reciben protección especial en la LGPD?", options: ["Porque son más difíciles de almacenar digitalmente", "Porque son datos sensibles que revelan información íntima de la persona y su uso indebido puede generar discriminación o daño", "Solo porque son los datos más frecuentes en el sistema de salud", "Solo porque los médicos los generan, no los pacientes"], answer: "Porque son datos sensibles que revelan información íntima de la persona y su uso indebido puede generar discriminación o daño" },
    { question: "¿Desde qué año está vigente la LGPD en Brasil?", options: ["2015", "2018", "2020", "2022"], answer: "2020" },
    { question: "¿Qué base legal puede usar el laboratorio para tratar los datos del paciente?", options: ["No necesita base legal si tiene certificación ISO 15189", "El consentimiento del paciente o la ejecución del contrato de servicio de salud", "Solo el consentimiento expreso y por escrito en todos los casos", "La habilitación sanitaria del laboratorio es suficiente como base legal"], answer: "El consentimiento del paciente o la ejecución del contrato de servicio de salud" },
    { question: "¿Qué derechos tiene el titular de los datos respecto a sus datos de salud?", options: ["Solo el derecho a recibir sus resultados en tiempo y forma", "Acceso, corrección y eliminación de sus datos, entre otros derechos reconocidos por la LGPD", "Solo el derecho a saber quién accedió a sus datos", "Solo los derechos que el laboratorio decida otorgarle"], answer: "Acceso, corrección y eliminación de sus datos, entre otros derechos reconocidos por la LGPD" },
    { question: "¿Qué es el control de acceso por roles en el expediente electrónico?", options: ["Un sistema que permite a todos los usuarios ver todos los datos", "Un mecanismo que define qué información puede ver cada usuario según su función", "Solo una medida de seguridad para el área de TI", "El registro de cada acceso realizado al sistema"], answer: "Un mecanismo que define qué información puede ver cada usuario según su función" },
    { question: "¿Para qué sirve la firma digital en los informes del laboratorio?", options: ["Solo para ahorrar papel en la emisión de resultados", "Para garantizar la autenticidad del documento y la responsabilidad profesional del director técnico sobre el resultado", "Solo para cumplir con el requisito de la ISO 15189", "Para encriptar el contenido del informe durante el transporte"], answer: "Para garantizar la autenticidad del documento y la responsabilidad profesional del director técnico sobre el resultado" },
    { question: "¿Qué es la ICP-Brasil?", options: ["El organismo regulador de laboratorios en Brasil", "La Infraestrutura de Chaves Públicas Brasileira, marco de confianza para los certificados digitales en Brasil", "El sistema nacional de historia clínica electrónica", "El registro de firmas digitales de los directores técnicos"], answer: "La Infraestrutura de Chaves Públicas Brasileira, marco de confianza para los certificados digitales en Brasil" },
    { question: "¿Cuál es el principal riesgo en la gestión de datos de salud según el texto?", options: ["Siempre los ataques externos de hackers", "Frecuentemente el acceso interno no autorizado, el envío a destinatarios incorrectos o la eliminación accidental", "Solo el robo físico de dispositivos de almacenamiento", "Solo los virus informáticos que cifran los datos"], answer: "Frecuentemente el acceso interno no autorizado, el envío a destinatarios incorrectos o la eliminación accidental" },
    { question: "¿Qué debe hacer el laboratorio ante un incidente de seguridad de datos?", options: ["Resolverlo internamente sin comunicarlo a nadie", "Notificar a la autoridad competente (ANPD) y potencialmente al titular de los datos afectados", "Solo documentarlo en el sistema de calidad interno", "Solo si el incidente afecta a más de cien pacientes"], answer: "Notificar a la autoridad competente (ANPD) y potencialmente al titular de los datos afectados" },
    { question: "¿Qué medidas mitigan el riesgo de acceso interno no autorizado?", options: ["Solo instalar un antivirus en todos los equipos", "Política clara de acceso, capacitación en manejo de datos sensibles y auditorías periódicas de registros de acceso", "Solo el cifrado de todos los archivos del sistema", "Solo designar un responsable de seguridad de TI"], answer: "Política clara de acceso, capacitación en manejo de datos sensibles y auditorías periódicas de registros de acceso" },
    { question: "¿Qué garantiza la trazabilidad en el expediente clínico electrónico?", options: ["Que nadie puede acceder al expediente sin autorización previa", "Que queda registrado quién accedió a qué información y cuándo, permitiendo auditar el uso de los datos", "Solo que los datos no se pueden modificar una vez ingresados", "Solo que el expediente se respalda automáticamente cada noche"], answer: "Que queda registrado quién accedió a qué información y cuándo, permitiendo auditar el uso de los datos" },
    { question: "¿Cuánto tiempo debe conservarse el expediente clínico electrónico?", options: ["Solo mientras el paciente sea cliente activo del laboratorio", "El tiempo establecido por la legislación sanitaria vigente, generalmente entre 5 y 20 años según el tipo de registro", "Solo un año desde la última atención", "Indefinidamente sin posibilidad de eliminación"], answer: "El tiempo establecido por la legislación sanitaria vigente, generalmente entre 5 y 20 años según el tipo de registro" },
  ],
  dictation: "La LGPD establece que los datos de salud son datos sensibles y el laboratorio debe garantizar su protección, el acceso controlado por roles y la notificación ante cualquier incidente de seguridad.",
},
{
  id: "nuevas-tecnologias-diagnosticas", title: "Nuevas tecnologías diagnósticas", level: "Intermedio", category: "Tecnología", emoji: "🔭",
  description: "Impresión 3D, secuenciación genómica, biosensores y el futuro del diagnóstico de laboratorio.",
  readingTitle: "El laboratorio que viene",
  reading: [
    "El laboratorio clínico del futuro no se parece exactamente al de hoy. En la última década surgieron tecnologías que están redefiniendo qué puede diagnosticarse, con qué velocidad y a qué costo. Entender estas tecnologías no es solo curiosidad académica: es parte de la formación del profesional que va a trabajar con ellas o que va a explicarlas a sus clientes.",
    "La secuenciación genómica de nueva generación (NGS, por sus siglas en inglés) permite leer el ADN de un paciente o de un microorganismo con una velocidad y un costo impensables hace veinte años. En el laboratorio clínico, la NGS tiene aplicaciones en oncología molecular —identificar mutaciones que orientan el tratamiento del cáncer—, en enfermedades genéticas raras y en el diagnóstico de infecciones por microorganismos difíciles de cultivar. La pandemia de COVID-19 aceleró la adopción de la secuenciación para vigilancia epidemiológica.",
    "Los biosensores son dispositivos que detectan una molécula específica —glucosa, troponina, un anticuerpo viral— a través de una señal eléctrica o óptica generada por una reacción biológica. Son la base tecnológica de los glucómetros domésticos y de muchas pruebas rápidas de POCT. La miniaturización y el aumento de sensibilidad de los biosensores están llevando el diagnóstico hacia dispositivos portátiles que pueden usarse fuera del laboratorio con resultados de calidad comparable.",
    "La impresión 3D tiene aplicaciones emergentes en el laboratorio clínico: fabricación de modelos anatómicos para planificación quirúrgica basados en imágenes del paciente, producción de dispositivos microfluídicos para análisis en microvolúmenes, y desarrollo de tejidos artificiales para pruebas de fármacos. Aunque aún no es una tecnología de uso rutinario en la mayoría de los laboratorios, su costo disminuye rápidamente y su presencia en el ámbito diagnóstico crece.",
    "El denominador común de estas tecnologías es la generación de grandes volúmenes de datos complejos que requieren análisis computacional avanzado para ser interpretados. El profesional del laboratorio del futuro necesita combinar el conocimiento biológico y clínico tradicional con competencias en interpretación de datos, comunicación de resultados complejos y evaluación crítica de nuevas tecnologías antes de su implementación.",
  ],
  vocab: [
    { es: "secuenciación genómica (NGS)", pt: "sequenciamento genômico (NGS)" },
    { es: "biosensor / prueba rápida", pt: "biossensor / teste rápido" },
    { es: "impresión 3D / microfluídica", pt: "impressão 3D / microfluídica" },
    { es: "oncología molecular", pt: "oncologia molecular" },
    { es: "dispositivo portátil / wearable", pt: "dispositivo portátil / wearable" },
    { es: "evaluación crítica de tecnologías", pt: "avaliação crítica de tecnologias" },
  ],
  quiz: [
    { question: "¿Qué es la secuenciación genómica de nueva generación (NGS)?", options: ["Un tipo de análisis de sangre convencional muy preciso", "Una tecnología que permite leer el ADN de un paciente o microorganismo con alta velocidad y bajo costo relativo", "Solo una técnica de investigación sin aplicación clínica actual", "Un sistema de control de calidad basado en datos genéticos"], answer: "Una tecnología que permite leer el ADN de un paciente o microorganismo con alta velocidad y bajo costo relativo" },
    { question: "¿Cuáles son las aplicaciones clínicas de la NGS mencionadas en el texto?", options: ["Solo diagnóstico de diabetes y enfermedades cardiovasculares", "Oncología molecular, enfermedades genéticas raras, diagnóstico de infecciones difíciles de cultivar y vigilancia epidemiológica", "Solo identificación de microorganismos en cultivos convencionales", "Solo diagnóstico prenatal en embarazos de alto riesgo"], answer: "Oncología molecular, enfermedades genéticas raras, diagnóstico de infecciones difíciles de cultivar y vigilancia epidemiológica" },
    { question: "¿Qué aceleró la adopción de la secuenciación genómica para vigilancia epidemiológica?", options: ["La reducción del costo de los equipos de NGS en 2018", "La pandemia de COVID-19", "La aprobación regulatoria de la NGS en Brasil en 2019", "La incorporación de la NGS al programa de ensayos de aptitud"], answer: "La pandemia de COVID-19" },
    { question: "¿Qué es un biosensor?", options: ["Un equipo de análisis automatizado de gran tamaño", "Un dispositivo que detecta una molécula específica a través de una señal generada por una reacción biológica", "Solo el sensor de temperatura de los refrigeradores del laboratorio", "Un sistema de monitoreo remoto de equipos analíticos"], answer: "Un dispositivo que detecta una molécula específica a través de una señal generada por una reacción biológica" },
    { question: "¿Cuál es la base tecnológica de los glucómetros domésticos?", options: ["La cromatografía de alta resolución", "Los biosensores electroquímicos", "La espectrofotometría de absorción atómica", "La inmunoelectroforesis"], answer: "Los biosensores electroquímicos" },
    { question: "¿Hacia dónde apunta la miniaturización de los biosensores?", options: ["Hacia equipos más grandes y precisos para el laboratorio central", "Hacia dispositivos portátiles de diagnóstico fuera del laboratorio con calidad comparable al laboratorio central", "Solo hacia reducir el costo de los glucómetros domésticos", "Solo hacia aplicaciones de diagnóstico veterinario"], answer: "Hacia dispositivos portátiles de diagnóstico fuera del laboratorio con calidad comparable al laboratorio central" },
    { question: "¿Cuál es una aplicación emergente de la impresión 3D en el laboratorio clínico?", options: ["Fabricación de reactivos analíticos personalizados", "Producción de dispositivos microfluídicos y modelos anatómicos para planificación quirúrgica", "Reemplazo de los equipos analíticos convencionales", "Solo fabricación de material de empaque para muestras"], answer: "Producción de dispositivos microfluídicos y modelos anatómicos para planificación quirúrgica" },
    { question: "¿Por qué la impresión 3D crece en el ámbito diagnóstico?", options: ["Porque ya reemplazó a los métodos convencionales en laboratorios líderes", "Porque su costo disminuye rápidamente y sus aplicaciones diagnósticas se expanden", "Solo porque los hospitales universitarios la adoptaron como estándar", "Solo porque reduce el tiempo de análisis a la mitad"], answer: "Porque su costo disminuye rápidamente y sus aplicaciones diagnósticas se expanden" },
    { question: "¿Qué competencias necesita el profesional del laboratorio del futuro?", options: ["Solo conocimiento técnico de los equipos analíticos", "Conocimiento biológico y clínico combinado con interpretación de datos, comunicación de resultados complejos y evaluación crítica de tecnologías", "Solo habilidades informáticas avanzadas", "Solo capacidad de operar equipos de secuenciación"], answer: "Conocimiento biológico y clínico combinado con interpretación de datos, comunicación de resultados complejos y evaluación crítica de tecnologías" },
    { question: "¿Qué tienen en común la NGS, los biosensores y la impresión 3D como tecnologías diagnósticas?", options: ["Todas requieren el mismo tipo de formación técnica", "Todas generan grandes volúmenes de datos complejos que requieren análisis computacional para ser interpretados", "Todas son tecnologías ya de uso rutinario en la mayoría de los laboratorios", "Todas fueron desarrolladas exclusivamente para el laboratorio clínico"], answer: "Todas generan grandes volúmenes de datos complejos que requieren análisis computacional para ser interpretados" },
    { question: "¿Por qué evaluar críticamente una nueva tecnología antes de implementarla es parte del rol del profesional del laboratorio?", options: ["Solo para cumplir con el requisito de validación de la ISO 15189", "Porque no toda tecnología nueva es superior a la existente y su adopción requiere evidencia de desempeño en el contexto real del laboratorio", "Solo si la tecnología fue desarrollada fuera de Brasil", "Solo para justificar el costo de la inversión ante la dirección"], answer: "Porque no toda tecnología nueva es superior a la existente y su adopción requiere evidencia de desempeño en el contexto real del laboratorio" },
    { question: "¿Qué aplicación de la NGS en oncología se menciona?", options: ["Diagnóstico de leucemias por morfología celular", "Identificación de mutaciones que orientan el tratamiento personalizado del cáncer", "Solo detección de marcadores tumorales en sangre", "Solo diagnóstico de linfomas por biopsia convencional"], answer: "Identificación de mutaciones que orientan el tratamiento personalizado del cáncer" },
  ],
  dictation: "La secuenciación genómica, los biosensores y la impresión 3D son tecnologías que expanden las capacidades diagnósticas del laboratorio y requieren del profesional competencias en interpretación de datos complejos.",
},
// ══ 3 NUEVOS MÓDULOS DE DIÁLOGO — categoría: "Ventas" ══
// Pegar dentro del array MODULES antes del cierre ];

{
  id: "dialogo-por-que-cambiar",
  title: "Diálogo: ¿por qué cambiar de laboratorio?",
  level: "Intermedio",
  category: "Ventas",
  emoji: "🔄",
  description: "Conversación entre un representante de Controllab y un director de laboratorio que evalúa cambiar de proveedor de EA.",
  readingTitle: "Una reunión en Santiago de Chile",
  reading: [
    "— Buenos días, Rodrigo. Gracias por recibirme. Soy Lucas Ferreira, de Controllab.\n— Buenos días, Lucas. Tome asiento. Le seré directo: actualmente trabajamos con otro proveedor de Ensayo de Aptitud desde hace cuatro años. ¿Por qué debería cambiar?",
    "— Lo entiendo, y se lo agradezco. Cuatro años es una relación larga y no quiero pedirle que la abandone sin buenos motivos. ¿Me puede contar qué es lo que más valora del servicio que tiene hoy?\n— Honestamente, funciona. Los materiales llegan a tiempo, los informes también. Pero a veces siento que cuando tengo una duda técnica, la respuesta es lenta o genérica.",
    "— Eso es exactamente lo que me gustaría mostrarle. En Controllab, cada laboratorio tiene un equipo técnico de respaldo que conoce su historial de resultados. Cuando usted tiene un inadecuado, no recibe un correo automático: recibe una llamada de alguien que ya revisó su ID, su valor alvo y la tendencia de sus últimas rondas. ¿Le ha pasado alguna vez que un inadecuado quedó sin explicación clara?\n— Sí, una vez con troponina. Nunca entendimos bien qué había pasado.",
    "— Ese es el tipo de situación en que la diferencia se nota. ¿Puedo mostrarle cómo funciona nuestro Relatorio de Evaluación? Es una herramienta que le permite ver la evolución de su ID a lo largo del año y correlacionarlo con cambios en su proceso — un lote nuevo de reactivo, una recalibración — para identificar exactamente cuándo empezó una desviación.\n— Eso sería útil, sí. ¿Y los programas que ofrecen son comparables a los que tengo?",
    "— Comparables y en muchos casos más amplios. Cubrimos bioquímica, hematología, coagulación, inmunología, microbiología, hemoterapia, veterinaria, análisis de agua y alimentos, tuberculosis y más. Además, somos el único proveedor de EA de Brasil acreditado bajo ISO/IEC 17043 y somos miembros de la IFCC y la EQALM. ¿Le parece si coordinamos una prueba piloto con uno de sus programas actuales para que pueda comparar directamente?\n— Me parece razonable. ¿Cómo funcionaría eso?\n— Le propongo que participe en una ronda de un ensayo de su elección sin costo. Así puede evaluar la calidad del informe, el soporte técnico y la plataforma online antes de tomar cualquier decisión. Sin presión.",
  ],
  vocab: [
    { es: "proveedor de EA", pt: "provedor de EP" },
    { es: "historial de resultados", pt: "histórico de resultados" },
    { es: "prueba piloto", pt: "projeto piloto / teste piloto" },
    { es: "soporte técnico de respaldo", pt: "suporte técnico de apoio" },
    { es: "evolución del ID", pt: "evolução do ID" },
    { es: "sin presión / sin compromiso", pt: "sem pressão / sem compromisso" },
  ],
  quiz: [
    { question: "¿Cuál es la objeción principal de Rodrigo al inicio de la conversación?", options: ["Que Controllab es más caro que su proveedor actual", "Que ya tiene un proveedor de EA con cuatro años de relación y no ve motivo para cambiar", "Que los materiales de Controllab no llegan a tiempo", "Que no conoce los programas que ofrece Controllab"], answer: "Que ya tiene un proveedor de EA con cuatro años de relación y no ve motivo para cambiar" },
    { question: "¿Qué hace Lucas antes de presentar argumentos a favor de Controllab?", options: ["Critica al proveedor actual de Rodrigo", "Pregunta qué es lo que Rodrigo más valora del servicio actual para identificar necesidades no cubiertas", "Entrega directamente el catálogo de precios de Controllab", "Habla de las certificaciones de Controllab sin escuchar primero"], answer: "Pregunta qué es lo que Rodrigo más valora del servicio actual para identificar necesidades no cubiertas" },
    { question: "¿Qué necesidad no cubierta identifica Lucas en la conversación?", options: ["Que los materiales del proveedor actual llegan tarde", "Que el soporte técnico ante resultados inadecuados es lento o genérico", "Que el proveedor actual no tiene acreditación ISO", "Que los programas del proveedor actual son incompletos"], answer: "Que el soporte técnico ante resultados inadecuados es lento o genérico" },
    { question: "¿Qué diferencial concreto ofrece Controllab según Lucas?", options: ["Precios más bajos y más programas disponibles", "Un equipo técnico que conoce el historial de cada laboratorio y llama proactivamente ante un inadecuado", "Entrega más rápida de materiales que cualquier competidor", "Un sistema automático de respuestas a consultas técnicas"], answer: "Un equipo técnico que conoce el historial de cada laboratorio y llama proactivamente ante un inadecuado" },
    { question: "¿Qué herramienta de Controllab menciona Lucas para mostrar el valor agregado?", options: ["El certificado de acreditación ISO/IEC 17043", "El Perfil de Resultados que muestra la evolución del ID y permite correlacionar con cambios en el proceso", "El catálogo completo de programas disponibles", "El Sistema Online con acceso a todos los informes anteriores"], answer: "El Perfil de Resultados que muestra la evolución del ID y permite correlacionar con cambios en el proceso" },
    { question: "¿Qué estrategia de cierre usa Lucas al final de la conversación?", options: ["Pedir que Rodrigo firme el contrato en esa misma reunión", "Ofrecer una ronda piloto gratuita sin presión para que Rodrigo evalúe por sí mismo", "Ofrecer un descuento del 20% en el primer año", "Proponer una visita a las instalaciones de Controllab en Brasil"], answer: "Ofrecer una ronda piloto gratuita sin presión para que Rodrigo evalúe por sí mismo" },
    { question: "¿Por qué Lucas no critica directamente al proveedor actual de Rodrigo?", options: ["Porque no conoce a ese proveedor", "Porque criticar al competidor no genera valor; es mejor identificar necesidades no cubiertas y mostrar el diferencial propio", "Porque existe un acuerdo de no competencia entre proveedores", "Porque Rodrigo podría enojarse si critica a su proveedor actual"], answer: "Porque criticar al competidor no genera valor; es mejor identificar necesidades no cubierdan y mostrar el diferencial propio" },
    { question: "¿Qué certifica la acreditación ISO/IEC 17043 de Controllab?", options: ["Que los laboratorios clientes de Controllab están acreditados", "Que Controllab cumple los requisitos internacionales como proveedor de Ensayo de Aptitud", "Que los materiales de referencia de Controllab son trazables al SI", "Que el sistema de calidad interno de Controllab está certificado"], answer: "Que Controllab cumple los requisitos internacionales como proveedor de Ensayo de Aptitud" },
    { question: "¿Qué información usa Lucas para personalizar su presentación durante la reunión?", options: ["El tamaño del laboratorio de Rodrigo y su facturación anual", "La experiencia concreta de Rodrigo: el caso de troponina sin explicación clara", "El listado de programas que el proveedor actual no ofrece", "Los precios que Rodrigo paga actualmente"], answer: "La experiencia concreta de Rodrigo: el caso de troponina sin explicación clara" },
    { question: "¿Qué significa ofrecer una prueba piloto 'sin presión' en el contexto de ventas?", options: ["Que el servicio será gratuito de forma permanente", "Que el cliente puede evaluar el servicio real antes de decidir, sin compromiso de compra inmediata", "Que Controllab no espera que el cliente cambie de proveedor", "Que la prueba no incluye soporte técnico para ser más económica"], answer: "Que el cliente puede evaluar el servicio real antes de decidir, sin compromiso de compra inmediata" },
  ],
  dictation: "Antes de presentar argumentos hay que preguntar qué valora el cliente de su proveedor actual: esa respuesta revela las necesidades no cubiertas que son la oportunidad real.",
},

{
  id: "dialogo-negociacion-hospital",
  title: "Diálogo: negociación con un hospital",
  level: "Avanzado",
  category: "Ventas",
  emoji: "🏥",
  description: "Conversación entre una representante de Controllab y la gerente de compras de un hospital que evalúa el contrato anual de EA.",
  readingTitle: "La reunión con la gerente de compras",
  reading: [
    "— Buenas tardes, señora Vargas. Soy Ana Lima, responsable de cuentas institucionales de Controllab. Gracias por recibirme.\n— Buenas tardes, Ana. Tengo cuarenta minutos. El comité de compras revisó la propuesta que enviaron y hay algunas observaciones antes de avanzar.",
    "— Por supuesto. Estoy aquí para eso. ¿Cuáles son las principales observaciones?\n— Primero, el precio. La propuesta está un doce por ciento por encima de lo que pagamos el año pasado con el proveedor anterior. Necesito una justificación clara para presentar al comité. Segundo, el hospital necesita cobertura para diecisiete áreas analíticas distintas, incluyendo hemoterapia y anatomía patológica. ¿Controllab cubre todo eso? Tercero, ¿cómo garantizan la continuidad del servicio si hay un problema de entrega?",
    "— Entendido. Las abordo en orden. Respecto al precio: la diferencia refleja que estamos ofreciendo programas con criterios de evaluación basados en variación biológica y acreditados bajo ISO/IEC 17043, con soporte técnico incluido — no solo materiales. El costo de un resultado incorrecto que lleva a una decisión clínica equivocada es significativamente mayor que esa diferencia del doce por ciento. Puedo dejarle documentado ese análisis para el comité si le parece útil.",
    "— Me parece útil, sí. ¿Y las diecisiete áreas?\n— Cubrimos todas. Bioquímica, hematología, coagulación, inmunología, microbiología, hemoterapia — incluyendo ABO, Rhesus, prueba cruzada y NAT — anatomía patológica, uroanálisis, análisis de agua y más. Si me permite, puedo enviarle el mapa de programas específico para su hospital antes del final de esta semana.",
    "— Bien. ¿Y la continuidad?\n— Tenemos un protocolo de contingencia documentado. Si por alguna razón una entrega se demora, notificamos al laboratorio con al menos setenta y dos horas de anticipación y coordinamos una solución antes de que afecte la ronda. En cuatro años de operación con hospitales de este tamaño, no hemos tenido ninguna ronda interrumpida por falta de material. Puedo incluir una cláusula de garantía de servicio en el contrato si el comité lo requiere.\n— Eso sería importante para nosotros. ¿Pueden tener una propuesta revisada con esos tres puntos incorporados para el jueves?\n— El miércoles a más tardar. Le escribo esta tarde para confirmar.",
  ],
  vocab: [
    { es: "comité de compras", pt: "comitê de compras" },
    { es: "cobertura de áreas analíticas", pt: "cobertura de áreas analíticas" },
    { es: "cláusula de garantía", pt: "cláusula de garantia" },
    { es: "protocolo de contingencia", pt: "protocolo de contingência" },
    { es: "propuesta revisada", pt: "proposta revisada" },
    { es: "cuenta institucional", pt: "conta institucional" },
  ],
  quiz: [
    { question: "¿Cuáles son las tres observaciones del comité de compras del hospital?", options: ["Calidad, velocidad y precio", "Precio más alto, cobertura de 17 áreas analíticas y garantía de continuidad del servicio", "Acreditación, catálogo y tiempo de entrega", "Soporte técnico, facturación y plazos de pago"], answer: "Precio más alto, cobertura de 17 áreas analíticas y garantía de continuidad del servicio" },
    { question: "¿Cómo justifica Ana la diferencia de precio del 12%?", options: ["Diciendo que Controllab es el proveedor más grande del mercado", "Explicando que refleja criterios de evaluación basados en variación biológica, acreditación ISO/IEC 17043 y soporte técnico incluido", "Ofreciendo un descuento equivalente a esa diferencia", "Comparando el precio con otros proveedores más caros"], answer: "Explicando que refleja criterios de evaluación basados en variación biológica, acreditación ISO/IEC 17043 y soporte técnico incluido" },
    { question: "¿Qué argumento de valor usa Ana para contextualizar el precio?", options: ["Que Controllab tiene más años en el mercado que los competidores", "Que el costo de un resultado incorrecto que lleva a una decisión clínica equivocada es mayor que la diferencia del 12%", "Que el precio incluye visitas mensuales al laboratorio", "Que otros hospitales pagan más por el mismo servicio"], answer: "Que el costo de un resultado incorrecto que lleva a una decisión clínica equivocada es mayor que la diferencia del 12%" },
    { question: "¿Qué ofrece Ana para ayudar a la señora Vargas con el comité?", options: ["Una presentación en Power Point para el comité", "Dejar documentado el análisis del costo de la no-calidad para presentar al comité", "Reunirse directamente con el comité sin pasar por la señora Vargas", "Un descuento especial solo para el primer año"], answer: "Dejar documentado el análisis del costo de la no-calidad para presentar al comité" },
    { question: "¿Cómo responde Ana a la preocupación sobre la continuidad del servicio?", options: ["Diciendo que nunca ha habido problemas en su historia", "Describiendo un protocolo de contingencia documentado con notificación de 72 horas y ofreciendo incluir una cláusula de garantía en el contrato", "Ofreciendo entregar los materiales con dos semanas de anticipación siempre", "Tranquilizando verbalmente sin ofrecer ninguna garantía formal"], answer: "Describiendo un protocolo de contingencia documentado con notificación de 72 horas y ofreciendo incluir una cláusula de garantía en el contrato" },
    { question: "¿Qué hace Ana con el plazo solicitado por la señora Vargas?", options: ["Acepta el jueves como lo pide el hospital", "Mejora el plazo: ofrece tener la propuesta revisada el miércoles, un día antes de lo solicitado", "Pide más tiempo diciendo que necesita consultar internamente", "Propone enviarla por correo sin fijar una fecha exacta"], answer: "Mejora el plazo: ofrece tener la propuesta revisada el miércoles, un día antes de lo solicitado" },
    { question: "¿Por qué es importante que Ana aborde las tres observaciones en el orden en que fueron planteadas?", options: ["Porque es una regla de protocolo formal en reuniones institucionales", "Porque demuestra que escuchó activamente y respeta la estructura de preocupaciones del cliente", "Porque el precio siempre debe abordarse primero en cualquier negociación", "Porque el comité de compras exige ese orden"], answer: "Porque demuestra que escuchó activamente y respeta la estructura de preocupaciones del cliente" },
    { question: "¿Qué tipo de ensayos de hemoterapia menciona Ana que Controllab cubre?", options: ["Solo tipificación ABO y Rhesus", "ABO, Rhesus, prueba cruzada y NAT", "Solo NAT para HIV y HCV", "Hemoterapia completa excepto anatomía patológica"], answer: "ABO, Rhesus, prueba cruzada y NAT" },
    { question: "¿Qué hace Ana al final de la reunión para demostrar compromiso?", options: ["Entrega su tarjeta y espera que el hospital llame", "Confirma que escribirá esa tarde para confirmar el envío de la propuesta revisada el miércoles", "Propone una segunda reunión para la semana siguiente", "Pide que la señora Vargas le confirme si el comité aprobó la propuesta"], answer: "Confirma que escribirá esa tarde para confirmar el envío de la propuesta revisada el miércoles" },
    { question: "¿Qué habilidad demuestra Ana al ofrecer documentar el análisis del costo de la no-calidad?", options: ["Que conoce bien el catálogo de precios de Controllab", "Que entiende que su interlocutora necesita argumentos para convencer a un tercero — el comité — y le facilita esa tarea", "Que tiene experiencia en contabilidad hospitalaria", "Que puede hacer análisis financieros complejos en tiempo real"], answer: "Que entiende que su interlocutora necesita argumentos para convencer a un tercero — el comité — y le facilita esa tarea" },
    { question: "¿Cuál es el tono correcto para una negociación institucional como esta?", options: ["Informal y cercano para generar confianza personal", "Formal, directo, preparado y orientado a dar soluciones concretas para cada observación", "Técnico y detallado para demostrar expertise sin importar el tiempo disponible", "Flexible en precio y condiciones para cerrar rápido"], answer: "Formal, directo, preparado y orientado a dar soluciones concretas para cada observación" },
  ],
  dictation: "En una negociación institucional hay que abordar cada observación del comité con un argumento concreto, ofrecer documentación de respaldo y demostrar compromiso con plazos claros.",
},

{
  id: "dialogo-medico-resultado-dudas",
  title: "Diálogo: médico con dudas sobre un resultado",
  level: "Intermedio",
  category: "Ventas",
  emoji: "🩺",
  description: "Conversación entre un técnico de soporte de Controllab y un médico clínico que tiene dudas sobre un resultado de su paciente.",
  readingTitle: "Una llamada que podía salir mal",
  reading: [
    "— Buenas tardes, soporte técnico de Controllab, habla Carlos. ¿En qué le puedo ayudar?\n— Buenas tardes. Soy la Dra. Herrera, médica clínica en Montevideo. Llamo porque uno de mis pacientes fue al laboratorio que trabaja con ustedes y el resultado de TSH me parece muy bajo para el cuadro clínico que presenta. El paciente no tiene síntomas de hipertiroidismo.",
    "— Buenas tardes, Dra. Herrera. Entiendo su preocupación y es una pregunta muy válida. ¿Me podría indicar el número de solicitud o el nombre del laboratorio para poder revisar la información del caso?\n— El laboratorio es Laboratorio Central del Sur. El número de solicitud es el 4471-B.",
    "— Perfecto, dame un momento mientras accedo al sistema. [pausa] Ya tengo la información. El resultado de TSH fue de 0.08 mUI/L, con un valor de referencia de 0.4 a 4.0. El control de calidad de ese día estaba adecuado y el sistema analítico registrado es el correcto para ese ensayo.\n— Sí, eso es lo que dice el informe. ¿Y no podría ser un error analítico?",
    "— Es una posibilidad que siempre hay que considerar, Dra. Herrera. En este caso, los controles internos del laboratorio para TSH ese día estaban dentro del criterio y el laboratorio tiene resultados adecuados en el último ciclo del EA para TSH. Eso no descarta completamente un error puntual, pero reduce significativamente la probabilidad de que sea un problema del proceso analítico.\n— Entonces, ¿qué me recomendaría?",
    "— Desde el punto de vista técnico, si la duda clínica persiste, lo más recomendable sería solicitar una nueva muestra para repetir el análisis — idealmente en ayunas y en un horario similar al original para minimizar la variabilidad biológica. También podría ser útil agregar T4 libre en esa misma muestra para completar el perfil tiroideo. La decisión clínica es suya, por supuesto; yo le puedo dar el contexto analítico.\n— Tiene sentido. Lo voy a hacer así. ¿Puedo llamar nuevamente si tengo más dudas?\n— Por supuesto, Dra. Herrera. Para eso estamos. Que tenga buenas tardes.",
  ],
  vocab: [
    { es: "soporte técnico / asistencia técnica", pt: "suporte técnico / assistência técnica" },
    { es: "cuadro clínico", pt: "quadro clínico" },
    { es: "control de calidad adecuado", pt: "controle de qualidade adequado" },
    { es: "variabilidad biológica", pt: "variabilidade biológica" },
    { es: "perfil tiroideo", pt: "perfil tireoidiano" },
    { es: "contexto analítico", pt: "contexto analítico" },
  ],
  quiz: [
    { question: "¿Cuál es la preocupación de la Dra. Herrera?", options: ["Que el informe del laboratorio llegó tarde", "Que el resultado de TSH parece muy bajo para el cuadro clínico del paciente que no tiene síntomas de hipertiroidismo", "Que el laboratorio usó el método incorrecto para TSH", "Que el paciente no ayunó antes de la extracción"], answer: "Que el resultado de TSH parece muy bajo para el cuadro clínico del paciente que no tiene síntomas de hipertiroidismo" },
    { question: "¿Qué hace Carlos antes de responder la duda de la médica?", options: ["Le explica de inmediato que el resultado es correcto", "Pide el número de solicitud y el nombre del laboratorio para acceder al sistema y revisar la información concreta del caso", "Le pregunta si el paciente tomó algún medicamento", "Le transfiere la llamada al laboratorio directamente"], answer: "Pide el número de solicitud y el nombre del laboratorio para acceder al sistema y revisar la información concreta del caso" },
    { question: "¿Cuál fue el resultado de TSH y cuál es el rango de referencia?", options: ["TSH 4.08 mUI/L, referencia 0.4 a 4.0", "TSH 0.08 mUI/L, referencia 0.4 a 4.0", "TSH 0.08 mUI/L, referencia 0.1 a 2.5", "TSH 0.8 mUI/L, referencia 0.4 a 4.0"], answer: "TSH 0.08 mUI/L, referencia 0.4 a 4.0" },
    { question: "¿Qué información usa Carlos para evaluar si podría ser un error analítico?", options: ["La fecha de vencimiento del reactivo usado ese día", "El estado del control interno ese día y los resultados del EA del laboratorio para TSH en el último ciclo", "El número de muestras procesadas ese día en el laboratorio", "La temperatura del laboratorio durante el análisis"], answer: "El estado del control interno ese día y los resultados del EA del laboratorio para TSH en el último ciclo" },
    { question: "¿Carlos afirma que el resultado es definitivamente correcto?", options: ["Sí, lo afirma con certeza porque el control interno estaba adecuado", "No, dice que los controles reducen significativamente la probabilidad de error pero no lo descartan completamente", "Sí, porque el laboratorio tiene acreditación ISO 15189", "No, porque cree que puede haber un error pero no lo puede confirmar"], answer: "No, dice que los controles reducen significativamente la probabilidad de error pero no lo descartan completamente" },
    { question: "¿Qué recomienda Carlos desde el punto de vista técnico?", options: ["Que la médica ignore el resultado y se base solo en la clínica", "Repetir la muestra en ayunas y en horario similar, y agregar T4 libre para completar el perfil tiroideo", "Que el paciente repita el análisis en otro laboratorio", "Que la médica contacte directamente al laboratorio para pedir una repetición gratuita"], answer: "Repetir la muestra en ayunas y en horario similar, y agregar T4 libre para completar el perfil tiroideo" },
    { question: "¿Por qué Carlos menciona que la decisión clínica es de la médica?", options: ["Para no asumir responsabilidad por el resultado", "Porque reconoce su rol: dar el contexto analítico sin invadir el espacio de la decisión médica que corresponde al médico tratante", "Porque no tiene autoridad para dar recomendaciones clínicas según la norma", "Porque no conoce el caso clínico completo del paciente"], answer: "Porque reconoce su rol: dar el contexto analítico sin invadir el espacio de la decisión médica que corresponde al médico tratante" },
    { question: "¿Por qué se recomienda repetir la muestra en un horario similar al original?", options: ["Para que el mismo analista procese la muestra", "Para minimizar la variabilidad biológica circadiana de la TSH que puede fluctuar según el momento del día", "Porque el laboratorio solo procesa TSH en ciertos horarios", "Para que el médico pueda estar presente durante la extracción"], answer: "Para que el mismo analista procese la muestra" },
    { question: "¿Qué demuestra Carlos al invitar a la médica a llamar nuevamente si tiene más dudas?", options: ["Que Controllab cobra por cada consulta técnica adicional", "Que el soporte técnico es continuo y la relación con el médico no termina con una sola llamada", "Que no pudo resolver la duda completamente en esa llamada", "Que la médica necesita más capacitación sobre los resultados de laboratorio"], answer: "Que el soporte técnico es continuo y la relación con el médico no termina con una sola llamada" },
    { question: "¿Qué impacto tiene este tipo de soporte técnico en la relación del laboratorio con sus médicos clientes?", options: ["Ninguno, los médicos solo valoran la velocidad del resultado", "Genera confianza y fidelización porque el médico siente que tiene respaldo técnico calificado ante situaciones difíciles", "Solo es valorado por médicos especialistas en laboratorio clínico", "Solo importa si el resultado finalmente resultó incorrecto"], answer: "Genera confianza y fidelización porque el médico siente que tiene respaldo técnico calificado ante situaciones difíciles" },
    { question: "¿Cómo se conecta esta llamada con el valor del EA de Controllab para el laboratorio cliente?", options: ["No se conecta: el EA y el soporte a médicos son servicios independientes", "Los resultados del EA del laboratorio en TSH son parte del argumento técnico que Carlos usa para evaluar la probabilidad de error analítico", "Solo si el laboratorio tuvo un inadecuado en TSH en el EA", "Solo si el médico pregunta directamente por el EA"], answer: "Los resultados del EA del laboratorio en TSH son parte del argumento técnico que Carlos usa para evaluar la probabilidad de error analítico" },
  ],
  dictation: "El soporte técnico de calidad reconoce su rol: dar el contexto analítico con evidencia concreta sin invadir la decisión clínica que corresponde siempre al médico tratante.",
},
// ══ GRAMÁTICA ══
{
  id: "ser-estar", title: "Ser vs. Estar", level: "Básico", category: "Gramática", emoji: "🔄",
  description: "La distinción más importante entre español y portugués: ser y estar.",
  readingTitle: "¿Es o está? La diferencia que cambia el significado",
  reading: [
    "La distinción entre 'ser' y 'estar' es probablemente el aspecto gramatical que más confunde a los hablantes de portugués cuando aprenden español. La regla más general: 'ser' se usa para características que se perciben como permanentes, esenciales o definitivas, mientras que 'estar' se usa para estados, condiciones o situaciones temporales.",
    "En el contexto del laboratorio, esta distinción aparece constantemente. 'El reactivo es vencido' es incorrecto: el vencimiento es un estado temporal, por lo que la forma correcta es 'el reactivo está vencido'. De la misma manera, 'el equipo está en mantenimiento' usa estar porque es una condición temporal.",
    "Los adjetivos que funcionan de forma diferente con 'ser' y 'estar' son una fuente constante de confusión. 'El analista es aburrido' significa que tiene una personalidad aburrida como característica permanente. 'El analista está aburrido' significa que en este momento se siente aburrido.",
    "La ubicación y las condiciones físicas van casi siempre con 'estar': 'las muestras están en el refrigerador', 'el resultado está validado'. La excepción son los eventos: 'La reunión es en la sala de conferencias'.",
    "Para los hablantes de portugués, 'é casado' en portugués equivale a 'está casado' en español, porque el matrimonio se percibe como un estado más que como una característica identitaria permanente.",
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
    { question: "¿Qué significa 'el analista está aburrido'?", options: ["Que es una persona aburrida por naturaleza", "Que en este momento se siente aburrido sin implicar nada sobre su carácter habitual", "Que fue aburrido en el pasado", "Que aburre permanentemente a sus compañeros"], answer: "Que en este momento se siente aburrido sin implicar nada sobre su carácter habitual" },
    { question: "¿Cuál es la diferencia entre 'el reactivo es malo' y 'el reactivo está malo'?", options: ["No hay ninguna diferencia real", "'Es malo' implica mala calidad inherente; 'está malo' implica que actualmente no está en condiciones de uso", "Solo una diferencia de registro formal vs informal", "'Está malo' es siempre incorrecto en español técnico"], answer: "'Es malo' implica mala calidad inherente; 'está malo' implica que actualmente no está en condiciones de uso" },
    { question: "¿Por qué 'la reunión es en la sala de conferencias' usa 'ser'?", options: ["Por una excepción gramatical sin explicación", "Porque se describe el evento en sí mismo, no la condición de un lugar", "Porque las salas son características permanentes del edificio", "Porque es una expresión fija"], answer: "Porque se describe el evento en sí mismo, no la condición de un lugar" },
    { question: "¿Qué equivale en portugués a 'está casado' en español?", options: ["'Está casado' también en portugués", "'É casado' con el verbo ser", "'Foi casado' en el pasado", "'Fica casado' con verbo diferente"], answer: "'É casado' con el verbo ser" },
    { question: "¿Cuál es correcto para describir la ubicación de los reactivos?", options: ["Los reactivos son en el refrigerador", "Los reactivos están en el refrigerador", "Los reactivos serán en el refrigerador siempre", "Los reactivos estuvieron en el refrigerador siempre"], answer: "Los reactivos están en el refrigerador" },
    { question: "¿Cuál es la mejor estrategia para internalizar ser y estar?", options: ["Memorizar todas las reglas abstractas de una vez", "Practicar con ejemplos del contexto laboral real y corregir errores en el momento", "Usar siempre 'estar' para evitar errores con 'ser'", "Traducir literalmente del portugués"], answer: "Practicar con ejemplos del contexto laboral real y corregir errores en el momento" },
    { question: "¿Con qué verbo se expresa la profesión u ocupación en español?", options: ["Siempre con estar", "Con ser: 'Ella es analista', 'Él es médico'", "Con tener: 'Ella tiene analista'", "Depende de si es permanente o temporaria la ocupación"], answer: "Con ser: 'Ella es analista', 'Él es médico'" },
    { question: "¿Cómo se dice en español que el equipo actualmente funciona bien?", options: ["El equipo es bien", "El equipo está funcionando bien / El equipo funciona bien", "El equipo ser bien ahora", "El equipo es bueno funcionando"], answer: "El equipo está funcionando bien / El equipo funciona bien" },
    { question: "¿Cuál es correcto para describir el origen de algo?", options: ["El reactivo está fabricado en Alemania", "El reactivo es fabricado en Alemania / Es de origen alemán", "El reactivo está de Alemania", "El reactivo fue siendo de Alemania"], answer: "El reactivo es fabricado en Alemania / Es de origen alemán" },
    { question: "¿Cómo se expresa que el resultado está listo para ser enviado?", options: ["El resultado es listo", "El resultado está listo para enviar", "El resultado ser listo ahora", "El resultado estaba siendo listo"], answer: "El resultado está listo para enviar" },
    { question: "¿Cómo se diferencia 'es seguro' de 'está seguro' en español?", options: ["No hay ninguna diferencia", "'Es seguro' describe una característica inherente; 'está seguro' describe una condición actual que puede cambiar", "'Está seguro' siempre implica duda sobre la seguridad", "Solo 'es seguro' es gramaticalmente correcto"], answer: "'Es seguro' describe una característica inherente; 'está seguro' describe una condición actual que puede cambiar" },
  ],
  dictation: "El equipo está en mantenimiento, el resultado está validado y el reactivo está vencido: todos son estados temporales que usan estar, no ser.",
},
{
  id: "conectores", title: "Conectores y cohesión", level: "Intermedio", category: "Gramática", emoji: "🔗",
  description: "Conectores para textos técnicos: informes, hallazgos y comunicaciones formales.",
  readingTitle: "El informe que fluía",
  reading: [
    "Un informe técnico de laboratorio es, ante todo, un texto que debe comunicar información compleja de forma clara y organizada. Los conectores son las palabras y expresiones que guían al lector de una idea a la siguiente y señalan relaciones lógicas entre los datos.",
    "Los conectores de adición son los más simples y los más utilizados: además, también, asimismo, igualmente, del mismo modo, por otra parte. Por ejemplo: 'El control de nivel bajo fue rechazado. Además, el control de nivel alto mostró una tendencia descendente.'",
    "Los conectores de contraste son fundamentales en los informes técnicos: sin embargo, no obstante, aunque, a pesar de que, por el contrario, en cambio. Por ejemplo: 'Los resultados del control de nivel bajo fueron aceptables. Sin embargo, el control de nivel alto presentó valores fuera del rango.'",
    "Los conectores de causa y consecuencia son esenciales para explicar por qué ocurrió algo y qué efectos tuvo. Los causales son: porque, ya que, dado que, debido a que. Los de consecuencia son: por lo tanto, en consecuencia, como resultado, por ende.",
    "El dominio de los conectores no solo mejora la calidad de los textos escritos: también mejora la claridad de la comunicación oral en reuniones, presentaciones y llamadas con clientes.",
  ],
  vocab: [
    { es: "sin embargo / no obstante", pt: "no entanto / porém" },
    { es: "además / asimismo", pt: "além disso / igualmente" },
    { es: "por lo tanto / en consecuencia", pt: "portanto / consequentemente" },
    { es: "dado que / ya que", pt: "dado que / uma vez que" },
    { es: "aunque / a pesar de que", pt: "embora / apesar de que" },
    { es: "por el contrario / en cambio", pt: "pelo contrário / em vez disso" },
  ],
  quiz: [
    { question: "¿Por qué son importantes los conectores en un texto técnico?", options: ["Para hacer el texto más largo", "Porque guían al lector entre ideas y señalan las relaciones lógicas entre los datos", "Para complicar la lectura y demostrar conocimiento", "Solo por razones estéticas"], answer: "Porque guían al lector entre ideas y señalan las relaciones lógicas entre los datos" },
    { question: "¿Qué tipo de relación expresa el conector 'por lo tanto'?", options: ["Adición de información nueva", "Contraste con lo expresado anteriormente", "Consecuencia lógica de lo que se dijo antes", "Causa de lo que se expresará después"], answer: "Consecuencia lógica de lo que se dijo antes" },
    { question: "¿Cuál de estos conectores expresa contraste?", options: ["Además", "Asimismo", "Sin embargo", "Dado que"], answer: "Sin embargo" },
    { question: "¿Qué conectores sirven para indicar causa?", options: ["Sin embargo, aunque, a pesar de que", "Porque, ya que, dado que, debido a que", "Además, también, asimismo, igualmente", "Por lo tanto, en consecuencia, así que"], answer: "Porque, ya que, dado que, debido a que" },
    { question: "¿Qué diferencia hay entre 'además' y 'sin embargo'?", options: ["Son sinónimos en español técnico", "'Además' añade en la misma dirección; 'sin embargo' introduce una idea contraria o inesperada", "'Sin embargo' es más formal que 'además' siempre", "Solo se diferencian en el nivel de registro"], answer: "'Además' añade en la misma dirección; 'sin embargo' introduce una idea contraria o inesperada" },
    { question: "¿Cuál es el conector adecuado para una consecuencia formal en un informe técnico?", options: ["Pero, como conector más simple", "En consecuencia, como conector más formal", "Y además, para agregar información", "O sea, para reformular"], answer: "En consecuencia, como conector más formal" },
    { question: "¿Los conectores mejoran solo la comunicación escrita?", options: ["Sí, exclusivamente para textos escritos", "No, también mejoran la claridad del discurso oral en reuniones y presentaciones", "Solo son útiles para correos electrónicos formales", "Solo son útiles en informes de auditoría"], answer: "No, también mejoran la claridad del discurso oral en reuniones y presentaciones" },
    { question: "¿Qué transmite quien organiza su discurso con conectores explícitos?", options: ["Que conoce muchas palabras en español técnico", "Mayor claridad de pensamiento y más confianza en el interlocutor", "Que estudió gramática avanzada", "Que habla más lento de lo necesario"], answer: "Mayor claridad de pensamiento y más confianza en el interlocutor" },
    { question: "¿Cuál es el conector correcto para introducir una reformulación o aclaración?", options: ["Sin embargo", "Es decir / o sea / en otras palabras", "Dado que", "Por ende"], answer: "Es decir / o sea / en otras palabras" },
    { question: "¿Cómo se usa correctamente 'aunque' en un informe técnico?", options: ["Solo al final de la oración", "Para introducir una concesión: 'Aunque el control estuvo dentro del rango, se observó una tendencia creciente'", "Solo como sinónimo de 'porque'", "Solo en oraciones negativas"], answer: "Para introducir una concesión: 'Aunque el control estuvo dentro del rango, se observó una tendencia creciente'" },
    { question: "¿Qué error común cometen los hablantes de portugués con los conectores del español?", options: ["Usar demasiados conectores", "Traducir literalmente 'porém' como 'porém' en lugar de usar 'sin embargo' o 'no obstante'", "No usar ningún conector", "Confundir los conectores de causa con los de tiempo"], answer: "Traducir literalmente 'porém' como 'porém' en lugar de usar 'sin embargo' o 'no obstante'" },
    { question: "¿Cómo se inicia un párrafo de conclusión en un informe técnico formal?", options: ["Con 'y' como primer conector", "Con 'En conclusión', 'En síntesis' o 'Para concluir' seguidos del hallazgo principal", "Con el nombre del analista responsable", "Con el número del análisis realizado"], answer: "Con 'En conclusión', 'En síntesis' o 'Para concluir' seguidos del hallazgo principal" },
    { question: "¿Qué diferencia existe entre 'por lo tanto' y 'a pesar de ello'?", options: ["Son sinónimos intercambiables", "'Por lo tanto' expresa consecuencia; 'a pesar de ello' expresa que algo ocurre en contra de lo esperado", "Solo difieren en el nivel de formalidad", "'A pesar de ello' solo se usa en textos académicos"], answer: "'Por lo tanto' expresa consecuencia; 'a pesar de ello' expresa que algo ocurre en contra de lo esperado" },
  ],
  dictation: "El control presentó una desviación; sin embargo, el equipo actuó rápidamente y, por lo tanto, no fue necesario rechazar la corrida analítica.",
},
{
  id: "preterito", title: "Pretérito: indefinido e imperfecto", level: "Intermedio", category: "Gramática", emoji: "⏪",
  description: "Los dos pasados del español y su uso en informes técnicos y narrativas.",
  readingTitle: "Dos pasados para dos realidades",
  reading: [
    "Una de las diferencias gramaticales más importantes entre el español y el portugués es el uso de dos tiempos distintos para el pasado: el pretérito indefinido y el pretérito imperfecto.",
    "El pretérito indefinido se usa para acciones del pasado que se perciben como terminadas y delimitadas: 'El equipo detectó una desviación', 'La analista llamó al médico', 'El control falló en la segunda corrida'. Son eventos puntuales que ocurrieron y terminaron.",
    "El pretérito imperfecto describe situaciones pasadas continuas, habituales o de fondo: 'El control interno se realizaba todos los días', 'El procedimiento indicaba que debía repetirse'. No marca el momento exacto en que comenzó o terminó.",
    "En los informes de no conformidades, ambos aparecen juntos: 'Cuando la analista revisó el registro (indefinido: acción puntual), notó que el procedimiento indicaba (imperfecto: descripción de fondo) que debía registrarse dos veces al día'.",
    "Una trampa frecuente para hablantes de portugués: el indefinido español ('hablé', 'llegué') corresponde al pretérito perfeito simples portugués. El pretérito perfeito composto portugués ('tenho falado') no tiene equivalente directo en español estándar.",
  ],
  vocab: [
    { es: "pretérito indefinido", pt: "pretérito perfeito simples" },
    { es: "pretérito imperfecto", pt: "pretérito imperfeito" },
    { es: "acción puntual / terminada", pt: "ação pontual / concluída" },
    { es: "situación de fondo / habitual", pt: "situação de fundo / habitual" },
    { es: "narrativa técnica", pt: "narrativa técnica" },
    { es: "secuencia de eventos", pt: "sequência de eventos" },
  ],
  quiz: [
    { question: "¿Para qué se usa el pretérito indefinido en español?", options: ["Para acciones habituales del pasado", "Para acciones del pasado percibidas como terminadas y delimitadas en el tiempo", "Para describir el contexto o fondo de una situación", "Para el futuro inmediato"], answer: "Para acciones del pasado percibidas como terminadas y delimitadas en el tiempo" },
    { question: "¿Para qué se usa el pretérito imperfecto?", options: ["Para acciones puntuales y completas del pasado", "Para describir situaciones continuas, habituales o de fondo en el pasado", "Para el pasado reciente únicamente", "Para eventos que ocurrieron una sola vez"], answer: "Para describir situaciones continuas, habituales o de fondo en el pasado" },
    { question: "¿Cuál es el tiempo correcto en 'el control ___ en la segunda corrida'?", options: ["fallaba (imperfecto)", "falló (indefinido)", "falla (presente)", "ha fallado (perfecto compuesto)"], answer: "falló (indefinido)" },
    { question: "¿Cuál es el tiempo correcto en 'el procedimiento ___ que debía repetirse'?", options: ["indicó (indefinido)", "indica (presente)", "indicaba (imperfecto)", "indicará (futuro)"], answer: "indicaba (imperfecto)" },
    { question: "¿Qué función tiene el imperfecto en una narrativa de incidente?", options: ["Avanzar la secuencia de hechos", "Describir el contexto o fondo en que ocurrieron los hechos puntuales", "Indicar la causa raíz del problema", "Solo en informes formales escritos"], answer: "Describir el contexto o fondo en que ocurrieron los hechos puntuales" },
    { question: "¿Cómo difiere el uso del pretérito indefinido entre español y portugués?", options: ["Son exactamente iguales en todos los contextos", "El indefinido español corresponde al perfeito simples; el composto portugués no tiene equivalente directo en español estándar", "El español usa más el imperfecto", "El portugués no tiene equivalente del indefinido"], answer: "El indefinido español corresponde al perfeito simples; el composto portugués no tiene equivalente directo en español estándar" },
    { question: "¿Cuál de estas frases usa correctamente el tiempo verbal para una acción terminada ayer?", options: ["Ayer, el equipo estaba detectando la desviación", "Ayer, el equipo detectó la desviación", "Ayer, el equipo detectaba por primera vez la desviación", "Ayer, el equipo ha detectado la desviación"], answer: "Ayer, el equipo detectó la desviación" },
    { question: "¿En qué tipo de texto del laboratorio aparecen ambos pasados juntos con más frecuencia?", options: ["En los procedimientos operativos estándar", "En los informes de no conformidades y registros de incidentes", "En los certificados de calidad", "En los informes de resultados de pacientes"], answer: "En los informes de no conformidades y registros de incidentes" },
  ],
  dictation: "El pretérito indefinido narra acciones terminadas y el imperfecto describe el contexto: en el informe de no conformidad ambos tiempos aparecen juntos.",
},
{
  id: "imperativo", title: "Imperativo y procedimientos", level: "Básico", category: "Gramática", emoji: "📌",
  description: "Usar el imperativo y el infinitivo para redactar instrucciones técnicas claras.",
  readingTitle: "Las instrucciones que se entienden",
  reading: [
    "Los procedimientos operativos estándar y los protocolos técnicos del laboratorio necesitan transmitir acciones con claridad y sin ambigüedad. Para esto, el español ofrece dos formas principales: el imperativo y el infinitivo.",
    "El imperativo se usa para dar instrucciones directas: 'Centrifugue la muestra a 3000 rpm durante diez minutos', 'Registre el resultado en el formulario', 'Llame al médico antes de liberar el resultado'. Es la forma más frecuente en procedimientos escritos porque comunica obligatoriedad sin ambigüedad.",
    "El infinitivo también se usa en listas de pasos: '1. Preparar los reactivos. 2. Calibrar el equipo. 3. Analizar los controles antes de procesar las muestras'. Es una forma más neutral y descriptiva.",
    "En español, el imperativo formal (usted) es diferente del familiar (tú). En textos técnicos escritos de Latinoamérica se usa casi exclusivamente el formal: 'centrifugue', 'registre', 'llame'.",
    "Diferencia clave con el portugués: el imperativo formal en español termina en -e para verbos -ar (centrifugue) y en -a para verbos -er/-ir (procese, distribuya). No deben confundirse con el presente de indicativo.",
  ],
  vocab: [
    { es: "imperativo formal", pt: "imperativo formal" },
    { es: "centrifugue / registre / llame", pt: "centrifugue / registre / ligue" },
    { es: "instrucción / paso", pt: "instrução / passo" },
    { es: "procedimiento escrito", pt: "procedimento escrito" },
    { es: "infinitivo en instrucciones", pt: "infinitivo em instruções" },
    { es: "obligatorio / requerido", pt: "obrigatório / requerido" },
  ],
  quiz: [
    { question: "¿Cuáles son las dos formas principales de dar instrucciones en español técnico?", options: ["Presente de indicativo e imperfecto", "Imperativo y infinitivo", "Subjuntivo y condicional", "Futuro y presente"], answer: "Imperativo y infinitivo" },
    { question: "¿Cuál es el imperativo formal correcto del verbo 'registrar'?", options: ["registra (familiar)", "registras", "registre (formal)", "registró (pasado)"], answer: "registre (formal)" },
    { question: "¿Cuál es el imperativo formal correcto del verbo 'procesar'?", options: ["procesa (familiar)", "procese (formal)", "procesó (pasado)", "procesan (presente plural)"], answer: "procese (formal)" },
    { question: "¿Cuándo se prefiere el infinitivo en instrucciones?", options: ["Nunca, siempre se usa el imperativo", "En listas de pasos numerados donde se prefiere un tono más descriptivo y neutral", "Solo en instrucciones para directivos", "Solo en documentos traducidos del inglés"], answer: "En listas de pasos numerados donde se prefiere un tono más descriptivo y neutral" },
    { question: "¿Qué forma de imperativo se usa en textos técnicos formales de Latinoamérica?", options: ["El familiar (tú): centrifuga, registra", "El formal (usted): centrifugue, registre", "Ambas por igual dependiendo del contexto", "El infinitivo siempre, nunca el imperativo"], answer: "El formal (usted): centrifugue, registre" },
    { question: "¿Cómo terminan los verbos -ar en imperativo formal?", options: ["En -a como en el presente de indicativo", "En -e, diferente del presente de indicativo que termina en -a", "En -ó igual que en el pasado", "En -ar como el infinitivo"], answer: "En -e, diferente del presente de indicativo que termina en -a" },
    { question: "¿Qué valor tiene el imperativo en un procedimiento técnico?", options: ["Solo es una formalidad estilística", "Comunica obligatoriedad y elimina ambigüedad sobre si la acción es opcional o requerida", "Solo lo entienden hablantes nativos", "Es menos claro que el infinitivo para instrucciones"], answer: "Comunica obligatoriedad y elimina ambigüedad sobre si la acción es opcional o requerida" },
    { question: "¿Cuál es una instrucción técnica correctamente redactada en español formal?", options: ["Centrifuga la muestra antes de analizarla", "Centrifugue la muestra a 3000 rpm durante 10 minutos antes de analizar", "La muestra debe de centrifugar antes del análisis", "Centrifugar la muestra es necesario"], answer: "Centrifugue la muestra a 3000 rpm durante 10 minutos antes de analizar" },
  ],
  dictation: "En los procedimientos operativos estándar se usa el imperativo formal: centrifugue, registre, analice; o el infinitivo en listas numeradas de pasos.",
},
{
  id: "cortesia-formal", title: "Cortesía y registro formal", level: "Intermedio", category: "Gramática", emoji: "🎩",
  description: "Cómo adaptar el registro formal del español para comunicaciones profesionales.",
  readingTitle: "La diferencia entre 'querido' y 'estimado'",
  reading: [
    "En español profesional, el registro formal es la norma en las comunicaciones escritas con clientes, proveedores, organismos reguladores y médicos. El registro informal puede ser apropiado internamente, pero usar un tono coloquial en una comunicación formal afecta la percepción de profesionalismo del laboratorio.",
    "Los saludos formales más usados incluyen: 'Estimado/a Dr./Dra.', 'Estimado/a Sr./Sra.', 'A quien corresponda'. El tratamiento de 'usted' es obligatorio en comunicaciones formales escritas. 'Querido' se reserva para relaciones personales y nunca debe usarse en comunicaciones profesionales técnicas.",
    "Los cierres formales incluyen: 'Quedo a su disposición para cualquier consulta', 'Sin otro particular, saludo a usted atentamente', 'En espera de su respuesta, le saluda cordialmente'.",
    "Las fórmulas de agradecimiento formal incluyen: 'Le agradezco su atención', 'Agradecemos su confianza en nuestros servicios'. Todas usan el pronombre 'le' o la forma plural 'les', no 'te' que es informal.",
    "El uso de 'por favor' y 'le solicito' suaviza el tono sin perder claridad. La cortesía en español técnico no es solo una cuestión de buenas maneras: construye la relación profesional y facilita la comunicación a largo plazo.",
  ],
  vocab: [
    { es: "estimado/a", pt: "prezado/a" },
    { es: "usted (formal)", pt: "você / o senhor / a senhora" },
    { es: "quedo a su disposición", pt: "fico à sua disposição" },
    { es: "le agradezco", pt: "agradeço-lhe" },
    { es: "atentamente / cordialmente", pt: "atenciosamente / cordialmente" },
    { es: "a quien corresponda", pt: "a quem possa interessar" },
  ],
  quiz: [
    { question: "¿Qué saludo formal es correcto para una comunicación con un médico?", options: ["Querido Dr. García", "Estimado Dr. García", "Hola Dr. García", "Buenos días García"], answer: "Estimado Dr. García" },
    { question: "¿Por qué 'querido' no debe usarse en comunicaciones profesionales?", options: ["Porque es incorrecto gramaticalmente", "Porque se reserva para relaciones personales y reduce la percepción de profesionalismo", "Porque no existe en español latinoamericano", "Solo debe evitarse en correos electrónicos"], answer: "Porque se reserva para relaciones personales y reduce la percepción de profesionalismo" },
    { question: "¿Qué pronombre de tratamiento es obligatorio en comunicaciones formales escritas?", options: ["tú", "vos", "usted", "él/ella"], answer: "usted" },
    { question: "¿Cuál de estos cierres es apropiado para una comunicación técnica formal?", options: ["Nos vemos pronto", "Sin otro particular, saludo a usted atentamente", "Chau, hasta luego", "Ya quedo"], answer: "Sin otro particular, saludo a usted atentamente" },
    { question: "¿Cuál es una fórmula de agradecimiento formal correcta?", options: ["Te agradezco tu atención", "Le agradezco su atención y quedo a su disposición", "Muchas gracias por todo", "Gracias, estuvo buenísimo"], answer: "Le agradezco su atención y quedo a su disposición" },
    { question: "¿Cómo se suaviza un pedido formal sin perder claridad?", options: ["Usando el imperativo directo sin más", "Con 'le solicito' o 'por favor' antes del pedido", "Convirtiendo el pedido en pregunta indirecta solo", "Evitando hacer el pedido y esperando que lo infieran"], answer: "Con 'le solicito' o 'por favor' antes del pedido" },
    { question: "¿Qué transmiten los cierres formales adecuados?", options: ["Solo que el correo terminó", "Disponibilidad, cortesía y profesionalismo que construyen la relación a largo plazo", "Que el remitente no tiene más tiempo para responder", "Solo formalidad burocrática sin valor real"], answer: "Disponibilidad, cortesía y profesionalismo que construyen la relación a largo plazo" },
    { question: "¿Por qué la cortesía en español técnico es más que buenas maneras?", options: ["No tiene más valor que estético", "Construye la relación profesional y facilita la comunicación efectiva a largo plazo", "Solo importa en la primera comunicación con un cliente nuevo", "Solo en comunicaciones con organismos reguladores"], answer: "Construye la relación profesional y facilita la comunicación efectiva a largo plazo" },
  ],
  dictation: "En español profesional el tratamiento de usted es obligatorio en comunicaciones formales: estimado doctor, le agradezco su atención, quedo a su disposición.",
},
{
  id: "por-para", title: "Por vs. Para", level: "Intermedio", category: "Gramática", emoji: "🔀",
  description: "Las dos preposiciones que más confunden a los hablantes de portugués en contextos técnicos.",
  readingTitle: "Una confusión que cambia el significado",
  reading: [
    "Una de las dificultades más frecuentes para los hablantes de portugués al escribir en español es la distinción entre 'por' y 'para'. En portugués, 'por' y 'para' existen, pero su distribución es diferente a la del español, lo que genera interferencias constantes en textos técnicos del laboratorio.",
    "'Para' indica finalidad, destino o destinatario: 'Este informe es para el médico', 'La muestra fue enviada para análisis', 'El procedimiento fue diseñado para garantizar la trazabilidad'. Siempre que se pueda responder la pregunta '¿con qué objetivo?' o '¿a quién va dirigido?', la respuesta es 'para'.",
    "'Por' indica causa, medio, duración, sustitución o agente en oraciones pasivas: 'El error fue detectado por el analista', 'La muestra fue rechazada por hemólisis', 'El equipo estuvo en mantenimiento por tres días', 'Llamé por teléfono para comunicar el valor crítico'.",
    "En el contexto del laboratorio, los errores más frecuentes son: 'el resultado fue validado para el analista' (incorrecto) en lugar de 'por el analista' (agente de una acción); y 'el reactivo fue rechazado por vencimiento' (correcto, causa) versus 'el reactivo fue preparado para el turno de la tarde' (correcto, destino temporal).",
    "Una estrategia práctica: si podés reemplazar la preposición por 'con el objetivo de' o 'destinado a', usá 'para'. Si podés reemplazarla por 'a causa de', 'a través de' o 'durante', usá 'por'.",
  ],
  vocab: [
    { es: "para + finalidad ('para garantizar')", pt: "para + finalidade ('para garantir')" },
    { es: "por + causa ('por hemólisis')", pt: "por + causa ('por hemólise')" },
    { es: "por + agente pasivo ('fue detectado por')", pt: "por + agente passivo ('foi detectado por')" },
    { es: "para + destinatario ('para el médico')", pt: "para + destinatário ('para o médico')" },
    { es: "por + duración ('por tres días')", pt: "por + duração ('por três dias')" },
    { es: "para + plazo ('para el viernes')", pt: "para + prazo ('para sexta-feira')" },
  ],
  quiz: [
    { question: "¿Cuál es correcto: 'el resultado fue validado ___ el analista'?", options: ["para el analista", "por el analista", "hacia el analista", "con el analista"], answer: "por el analista" },
    { question: "¿Cuál es correcto: 'este informe es ___ el médico de guardia'?", options: ["por el médico", "para el médico", "hacia el médico", "con el médico"], answer: "para el médico" },
    { question: "¿Por qué se usa 'por' en 'la muestra fue rechazada por hemólisis'?", options: ["Porque indica el destinatario de la acción", "Porque indica la causa del rechazo", "Porque indica la duración del proceso", "Porque indica el objetivo del análisis"], answer: "Porque indica la causa del rechazo" },
    { question: "¿Cuál es correcto: 'el equipo estuvo fuera de servicio ___ dos días'?", options: ["para dos días", "por dos días", "hacia dos días", "con dos días"], answer: "por dos días" },
    { question: "¿Cuál es correcto: 'el procedimiento fue diseñado ___ garantizar la trazabilidad'?", options: ["por garantizar", "para garantizar", "hacia garantizar", "con garantizar"], answer: "para garantizar" },
    { question: "¿Cuál es correcto: 'llamé ___ teléfono ___ comunicar el valor crítico'?", options: ["para teléfono / por comunicar", "por teléfono / para comunicar", "con teléfono / para comunicar", "por teléfono / por comunicar"], answer: "por teléfono / para comunicar" },
    { question: "¿Qué pregunta ayuda a decidir si usar 'para'?", options: ["¿A través de qué medio?", "¿Con qué objetivo o a quién va dirigido?", "¿Durante cuánto tiempo?", "¿A causa de qué?"], answer: "¿Con qué objetivo o a quién va dirigido?" },
    { question: "¿Cuál es correcto: 'el reactivo fue preparado ___ el turno de la tarde'?", options: ["por el turno", "para el turno", "hacia el turno", "en el turno"], answer: "para el turno" },
    { question: "¿Cuál es correcto en una oración pasiva: 'el error fue identificado ___ el supervisor'?", options: ["para el supervisor", "por el supervisor", "hacia el supervisor", "con el supervisor"], answer: "por el supervisor" },
    { question: "¿Cuál es correcto: 'el informe debe estar listo ___ el viernes'?", options: ["por el viernes", "para el viernes", "hacia el viernes", "en el viernes"], answer: "para el viernes" },
    { question: "¿Qué indica 'por' en 'el analista fue reemplazado por su colega'?", options: ["Finalidad", "Sustitución", "Causa", "Duración"], answer: "Sustitución" },
    { question: "¿Cuál de estas frases usa 'por' y 'para' correctamente?", options: ["El resultado fue emitido para el equipo por el médico", "El resultado fue emitido por el equipo para el médico", "El resultado fue emitido para el equipo para el médico", "El resultado fue emitido por el equipo por el médico"], answer: "El resultado fue emitido por el equipo para el médico" },
  ],
  dictation: "La muestra fue rechazada por hemólisis y el informe fue preparado para el médico de guardia por el analista del turno.",
},
{
  id: "condicional", title: "Condicional y hipótesis", level: "Intermedio", category: "Gramática", emoji: "🔮",
  description: "Cómo expresar hipótesis, recomendaciones y situaciones posibles en el laboratorio.",
  readingTitle: "Lo que haría si ocurriera",
  reading: [
    "El condicional simple en español se forma con el infinitivo más las terminaciones -ía, -ías, -ía, -íamos, -íais, -ían. Se usa para expresar hipótesis, recomendaciones educadas, situaciones posibles o el resultado de una condición. Ejemplos: 'en ese caso, repetiría el análisis', 'deberías revisar el calibrador', 'el laboratorio podría mejorar su tiempo de respuesta'.",
    "En el contexto del laboratorio, el condicional aparece frecuentemente en situaciones de análisis de causa raíz, recomendaciones técnicas y comunicaciones formales. En lugar de 'tenés que cambiar el reactivo' (imperativo directo), una comunicación más profesional sería 'convendría revisar el lote del reactivo antes de continuar'.",
    "El condicional también se usa en oraciones con 'si' para expresar situaciones hipotéticas: 'si el control estuviera fuera de rango, detendría la corrida'. La estructura clásica es: si + imperfecto de subjuntivo + condicional simple. Aunque el subjuntivo se trate en otro módulo, es útil reconocer este patrón.",
    "Para los hablantes de portugués, el condicional español equivale al futuro do pretérito portugués ('faria', 'diria', 'poderia'). La formación es similar: infinitivo + terminación. El error más frecuente es usar el imperfecto en lugar del condicional: 'yo quería decirle que...' cuando la forma más precisa sería 'yo querría decirle que...'.",
    "En textos técnicos formales como informes de no conformidades, el condicional permite expresar recomendaciones sin sonar impositivo: 'sería conveniente actualizar el procedimiento', 'correspondería investigar la causa raíz', 'se recomendaría capacitar nuevamente al personal'.",
  ],
  vocab: [
    { es: "condicional simple (-ía)", pt: "futuro do pretérito (-ia)" },
    { es: "debería / convendría", pt: "deveria / conviria" },
    { es: "podría / tendría", pt: "poderia / teria" },
    { es: "sería conveniente", pt: "seria conveniente" },
    { es: "si + imperfecto subjuntivo + condicional", pt: "se + imperfeito subjuntivo + futuro do pretérito" },
    { es: "recomendación formal", pt: "recomendação formal" },
  ],
  quiz: [
    { question: "¿Cómo se forma el condicional simple en español?", options: ["Presente del verbo auxiliar + participio", "Infinitivo + terminaciones -ía, -ías, -ía...", "Imperfecto de indicativo + que", "Futuro simple con sufijo -ría"], answer: "Infinitivo + terminaciones -ía, -ías, -ía..." },
    { question: "¿Cuál es el equivalente del condicional español en portugués?", options: ["Pretérito imperfeito", "Futuro do pretérito (-ia, -ias)", "Pretérito perfeito composto", "Presente do subjuntivo"], answer: "Futuro do pretérito (-ia, -ias)" },
    { question: "¿Para qué se usa el condicional en recomendaciones formales?", options: ["Para dar órdenes directas", "Para suavizar recomendaciones sin sonar impositivo", "Para describir acciones habituales del pasado", "Para indicar acciones futuras seguras"], answer: "Para suavizar recomendaciones sin sonar impositivo" },
    { question: "¿Cuál es la forma más profesional de recomendar revisar un reactivo?", options: ["Revisá el reactivo ahora mismo", "Convendría revisar el lote del reactivo antes de continuar", "El reactivo hay que revisarlo", "Revisando el reactivo se soluciona"], answer: "Convendría revisar el lote del reactivo antes de continuar" },
    { question: "¿Cuál es correcto: 'si el control fallara, ___ la corrida'?", options: ["detendré", "detendría", "detuve", "detenga"], answer: "detendría" },
    { question: "¿Qué error frecuente cometen los hablantes de portugués con el condicional?", options: ["Usar el futuro en lugar del condicional", "Usar el imperfecto de indicativo en lugar del condicional", "Usar el presente en lugar del condicional", "Confundir el condicional con el imperativo"], answer: "Usar el imperfecto de indicativo en lugar del condicional" },
    { question: "¿Cuál es el condicional correcto del verbo 'deber'?", options: ["debía", "debe", "debería", "deberá"], answer: "debería" },
    { question: "¿Qué expresa 'sería conveniente actualizar el procedimiento'?", options: ["Una orden directa al equipo", "Una recomendación formal expresada con cortesía técnica", "Una descripción de lo que ocurrió", "Una hipótesis sobre el pasado"], answer: "Una recomendación formal expresada con cortesía técnica" },
    { question: "¿Cuál de estas frases usa el condicional correctamente?", options: ["Si el equipo falla, detengo la corrida", "Si el equipo fallara, detendría la corrida", "Si el equipo falla, detendría la corrida inmediatamente siempre", "Si el equipo fallaba, detengo la corrida"], answer: "Si el equipo fallara, detendría la corrida" },
    { question: "¿Cómo se dice en condicional 'poder investigar la causa'?", options: ["puedo investigar", "pude investigar", "podría investigar", "podré investigar"], answer: "podría investigar" },
    { question: "¿Cuál es una recomendación formal correcta en un informe técnico?", options: ["Hay que capacitar al personal", "Correspondería capacitar nuevamente al personal involucrado", "El personal necesita capacitación urgente", "Capaciten al personal inmediatamente"], answer: "Correspondería capacitar nuevamente al personal involucrado" },
    { question: "¿Qué diferencia hay entre 'debería' y 'debe' en una recomendación?", options: ["Son intercambiables en cualquier contexto", "'Debe' es una obligación directa; 'debería' es una recomendación más cortés y matizada", "'Debería' es más urgente que 'debe'", "Solo 'debe' se usa en textos técnicos formales"], answer: "'Debe' es una obligación directa; 'debería' es una recomendación más cortés y matizada" },
  ],
  dictation: "Si el control interno mostrara una tendencia negativa, sería conveniente investigar la causa raíz antes de continuar liberando resultados.",
},
{
  id: "subjuntivo", title: "Subjuntivo en contexto técnico", level: "Intermedio", category: "Gramática", emoji: "🌀",
  description: "El modo subjuntivo para expresar dudas, recomendaciones y condiciones en el laboratorio.",
  readingTitle: "El modo que expresa lo que no es certeza",
  reading: [
    "El subjuntivo es uno de los aspectos gramaticales que más distinguen al español del portugués, no porque no exista en portugués, sino porque su uso en español es mucho más frecuente y sistemático. En el laboratorio, el subjuntivo aparece constantemente en recomendaciones, instrucciones, dudas y condiciones.",
    "El subjuntivo presente se forma a partir de la primera persona del presente de indicativo: hablar → hablo → hable; registrar → registro → registre; procesar → proceso → procese. Esta es también la forma del imperativo formal, lo que refuerza su uso en procedimientos.",
    "Los contextos más frecuentes en el laboratorio son: recomendaciones ('es importante que el analista registre el resultado'), dudas ('no es seguro que el control esté dentro del rango'), condiciones hipotéticas ('cuando el equipo falle, el analista detenga la corrida') y verbos de comunicación con que ('le recomiendo que revise el calibrador', 'le pido que documente el incidente').",
    "Una regla práctica: si la oración principal tiene un verbo de deseo, recomendación, duda, emoción o negación, y hay un cambio de sujeto antes del 'que', la segunda oración probablemente usa subjuntivo. Por ejemplo: 'quiero que el analista verifique' (dos sujetos distintos: yo quiero / el analista verifica).",
    "El error más frecuente de los hablantes de portugués es usar el infinitivo donde el español requiere subjuntivo: 'es importante registrar el resultado' es correcto cuando no hay cambio de sujeto, pero 'es importante que el analista registre' (con cambio de sujeto) requiere subjuntivo, no infinitivo.",
  ],
  vocab: [
    { es: "subjuntivo presente (que + verbo)", pt: "subjuntivo presente (que + verbo)" },
    { es: "es importante que + subjuntivo", pt: "é importante que + subjuntivo" },
    { es: "le recomiendo que + subjuntivo", pt: "recomendo que + subjuntivo" },
    { es: "cuando + subjuntivo (futuro)", pt: "quando + subjuntivo (futuro)" },
    { es: "no es seguro que + subjuntivo", pt: "não é certo que + subjuntivo" },
    { es: "para que + subjuntivo", pt: "para que + subjuntivo" },
  ],
  quiz: [
    { question: "¿Cómo se forma el subjuntivo presente de 'registrar'?", options: ["registra", "registre", "registró", "registrará"], answer: "registre" },
    { question: "¿Cuál es correcto: 'es importante que el analista ___ el resultado'?", options: ["registra", "registrará", "registre", "registrar"], answer: "registre" },
    { question: "¿Qué indica el uso del subjuntivo en 'le recomiendo que revise el calibrador'?", options: ["Que la acción ya ocurrió", "Que hay un cambio de sujeto y una recomendación de parte del hablante", "Que la acción es imposible", "Que el hablante está seguro de que ocurrirá"], answer: "Que hay un cambio de sujeto y una recomendación de parte del hablante" },
    { question: "¿Cuándo se usa subjuntivo en oraciones con 'cuando' en español?", options: ["Cuando describe acciones habituales del presente", "Cuando se refiere a una acción futura o hipotética: 'cuando llegue la muestra'", "Siempre que aparece la palabra 'cuando'", "Solo en oraciones negativas con 'cuando'"], answer: "Cuando se refiere a una acción futura o hipotética: 'cuando llegue la muestra'" },
    { question: "¿Cuál es correcto con cambio de sujeto: 'es necesario que el equipo ___'?", options: ["funciona bien", "funcionará bien", "funcione bien", "funcionando bien"], answer: "funcione bien" },
    { question: "¿Por qué los hablantes de portugués cometen errores con el subjuntivo español?", options: ["Porque el subjuntivo no existe en portugués", "Porque en español el subjuntivo es más frecuente y sistemático que en portugués", "Porque las terminaciones son completamente distintas", "Porque el español no tiene equivalente del subjuntivo portugués"], answer: "Porque en español el subjuntivo es más frecuente y sistemático que en portugués" },
    { question: "¿Cuál es correcto sin cambio de sujeto?", options: ["Es importante que registrar el resultado", "Es importante registrar el resultado", "Es importante que registre uno el resultado", "Es importante de registrar el resultado"], answer: "Es importante registrar el resultado" },
    { question: "¿Qué estructura activa el subjuntivo en la segunda oración?", options: ["Verbo en futuro + que", "Verbo de deseo, recomendación, duda o emoción + que + cambio de sujeto", "Cualquier verbo + que", "Solo verbos negativos + que"], answer: "Verbo de deseo, recomendación, duda o emoción + que + cambio de sujeto" },
    { question: "¿Cuál es el subjuntivo correcto de 'procesar'?", options: ["procesa", "procesará", "procesó", "procese"], answer: "procese" },
    { question: "¿Cuál es correcto: 'le pido que ___ el incidente en el sistema'?", options: ["documenta", "documentará", "documente", "documentando"], answer: "documente" },
    { question: "¿Qué expresa 'para que el médico entienda el resultado'?", options: ["Una causa del problema", "Una finalidad que requiere subjuntivo porque hay cambio de sujeto", "Una condición del pasado", "Una descripción del proceso analítico"], answer: "Una finalidad que requiere subjuntivo porque hay cambio de sujeto" },
    { question: "¿Cuál de estas frases usa el subjuntivo correctamente en contexto de laboratorio?", options: ["Es importante que el analista registra cada resultado", "Es importante que el analista registre cada resultado", "Es importante que el analista registrará cada resultado", "Es importante que el analista ha registrado cada resultado"], answer: "Es importante que el analista registre cada resultado" },
  ],
  dictation: "Es importante que el analista registre el incidente y que el supervisor verifique las acciones correctivas antes de cerrar la no conformidad.",
},
{
  id: "pronombres-oi", title: "Pronombres de objeto", level: "Intermedio", category: "Gramática", emoji: "🔁",
  description: "Pronombres de objeto directo e indirecto en comunicaciones y procedimientos técnicos.",
  readingTitle: "A quién y qué",
  reading: [
    "Los pronombres de objeto son palabras que reemplazan a un sustantivo para evitar la repetición. En español técnico del laboratorio, su uso correcto marca una diferencia importante en la fluidez y claridad de la comunicación. Los pronombres de objeto directo responden a la pregunta '¿qué?' o '¿a quién?' y los de objeto indirecto responden a '¿a quién?' o '¿para quién?' beneficia la acción.",
    "Los pronombres de objeto directo son: me, te, lo/la, nos, os, los/las. Los de objeto indirecto son: me, te, le, nos, os, les. En el laboratorio: 'el analista validó el resultado' → 'el analista lo validó'; 'informé al médico' → 'le informé'; 'envié el informe al cliente' → 'se lo envié' (cuando se combinan le/les + lo/la, el le/les se convierte en se).",
    "La posición de los pronombres es una fuente constante de errores para hablantes de portugués. En español, los pronombres átonos van antes del verbo conjugado: 'lo validé', 'le informé', 'se lo envié'. Con infinitivo o gerundio pueden ir antes o después: 'voy a validarlo' o 'lo voy a validar'; 'estoy informándole' o 'le estoy informando'.",
    "El leísmo es el uso de 'le' en lugar de 'lo' para objeto directo de persona masculina: 'llamé al médico' → 'le llamé' (leísmo aceptado en España pero no en Latinoamérica, donde se prefiere 'lo llamé'). En comunicaciones técnicas con clientes hispanohablantes de toda Latinoamérica, es más seguro usar 'lo/la' para objeto directo.",
    "En el contexto del laboratorio, los pronombres aparecen frecuentemente en: instrucciones ('procésela dentro de los 30 minutos'), comunicaciones ('le informo que el resultado está disponible') y respuestas a consultas ('ya lo revisé y le envío el informe ahora').",
  ],
  vocab: [
    { es: "lo / la (objeto directo)", pt: "o / a (objeto direto)" },
    { es: "le / les (objeto indirecto)", pt: "lhe / lhes (objeto indireto)" },
    { es: "se lo / se la (combinación)", pt: "lho / lha (combinação)" },
    { es: "posición antes del verbo conjugado", pt: "posição antes do verbo conjugado" },
    { es: "procésela / envíelo (con imperativo)", pt: "processe-a / envie-o (com imperativo)" },
    { es: "le informo / lo reviso", pt: "informo-lhe / reviso-o" },
  ],
  quiz: [
    { question: "¿A qué pregunta responde el objeto directo?", options: ["¿A quién beneficia la acción?", "¿Qué o a quién recibe directamente la acción del verbo?", "¿Con qué se realiza la acción?", "¿Para quién se realiza la acción?"], answer: "¿Qué o a quién recibe directamente la acción del verbo?" },
    { question: "¿Cómo se reemplaza 'validé el resultado' con pronombre?", options: ["le validé", "lo validé", "se validé", "me validé"], answer: "lo validé" },
    { question: "¿Cómo se reemplaza 'informé al médico' con pronombre de objeto indirecto?", options: ["lo informé", "la informé", "le informé", "se informé"], answer: "le informé" },
    { question: "¿Qué ocurre cuando se combinan 'le' + 'lo' en español?", options: ["Se usan los dos juntos: 'le lo envié'", "'Le' se convierte en 'se': 'se lo envié'", "'Lo' desaparece y queda solo 'le'", "Se usa solo 'le' sin el objeto directo"], answer: "'Le' se convierte en 'se': 'se lo envié'" },
    { question: "¿Dónde va el pronombre átono respecto al verbo conjugado?", options: ["Siempre después", "Siempre antes", "Puede ir antes o después indistintamente", "Depende del tiempo verbal únicamente"], answer: "Siempre antes" },
    { question: "¿Cuál es correcto: 'voy a enviar el informe' con pronombre?", options: ["Voy a lo enviar", "Lo voy a enviar / Voy a enviarlo", "Le voy a enviar / Voy a enviarle", "Se voy a enviar / Voy a enviarse"], answer: "Lo voy a enviar / Voy a enviarlo" },
    { question: "¿Cuál es correcto en una instrucción: 'tome la muestra y ___ dentro de 30 minutos'?", options: ["procésela", "procéselo", "procésele", "procesela sin acento"], answer: "procésela" },
    { question: "¿Cuál es la frase correcta para decir 'envié el informe al médico'?", options: ["Le lo envié", "Se lo envié", "Lo le envié", "Le envié lo"], answer: "Se lo envié" },
    { question: "¿Qué pronombre reemplaza a 'los resultados' (objeto directo plural)?", options: ["le", "lo", "los", "les"], answer: "los" },
    { question: "¿Cuál es correcto: 'ya revisé la muestra'?", options: ["Ya le revisé", "Ya la revisé", "Ya se revisé", "Ya me revisé"], answer: "Ya la revisé" },
    { question: "¿Qué expresa 'le informo que el resultado está disponible'?", options: ["Que el resultado es el objeto directo de 'informar'", "Que hay un objeto indirecto (la persona informada) antes del contenido informado", "Que 'le' reemplaza al resultado", "Que 'le' es un objeto directo femenino"], answer: "Que hay un objeto indirecto (la persona informada) antes del contenido informado" },
    { question: "¿Cuál es la forma más segura para Latinoamérica al referirse a un médico masculino como objeto directo?", options: ["Siempre 'le llamé'", "'Lo llamé', evitando el leísmo que no es estándar en Latinoamérica", "Siempre 'les llamé'", "'La llamé' independientemente del género"], answer: "'Lo llamé', evitando el leísmo que no es estándar en Latinoamérica" },
  ],
  dictation: "El analista revisó la muestra, la procesó dentro del plazo y le informó al médico que el resultado ya estaba disponible en el sistema.",
},
// ══ CONTROLLAB ══
{
  id: "controllab-historia", title: "Historia de Controllab", level: "Básico", category: "Controllab", emoji: "🏛️",
  description: "Origen, hitos de acreditación y misión de Controllab desde 1977 hasta hoy.",
  readingTitle: "Casi cincuenta años construyendo calidad",
  reading: [
    "Controllab fue fundada en 1977 por Marcio Biasoli en Rio de Janeiro, Brasil. Desde el primer día, la empresa eligió un propósito claro: ayudar a los laboratorios a medir mejor. Biasoli partió de una extensa experiencia laboratorial y de proyectos piloto de control de calidad, y con ese conocimiento construyó una empresa que, con el tiempo, se convertiría en referencia para la calidad analítica en toda Latinoamérica.",
    "A lo largo de los años, Controllab acumuló una serie de hitos de acreditación que demuestran su compromiso con la transparencia y la excelencia. En agosto de 2001, fue el primer proveedor de Ensayo de Aptitud (EA) del Brasil habilitado por la ANVISA en el marco del programa REBLAS. En diciembre de 2002, fue acreditada por la Cgcre para servicios de calibración volumétrica (CAL0214). En junio de 2003, conquistó el sello ISO 9001. En septiembre de 2011 fue acreditada como proveedora de Ensayo de Aptitud (EA) bajo el número PEP003. En octubre de 2012, fue certificada en Buenas Prácticas de Fabricación (BPF) por ANVISA. En agosto de 2016, fue acreditada como Productora de Material de Referencia Certificado (PMR0009).",
    "Controllab tiene el apoyo de importantes sociedades científicas: la Sociedad Brasileña de Patología Clínica y Medicina Laboratorial (SBPC/ML) y la Sociedad Brasileña de Medicina Veterinaria (SBMV). También es miembro de organizaciones internacionales como la IFCC (Federación Internacional de Química Clínica) y la EQALM (Asociación Europea para la Gestión de la Calidad en Laboratorios de Medicina).",
    "La oferta de servicios de Controllab fue creciendo de forma sostenida. Además de los Ensayos de Aptitud (EA), incorporó la producción de materiales de referencia certificados, el desarrollo de programas educativos como los Questionários Ilustrados y el acceso al Sistema Online para la gestión digital de la participación.",
    "Hoy Controllab atiende a miles de laboratorios en toda Latinoamérica y Brasil, en sectores que van desde la clínica hasta la anatomía patológica, hemoterapia, veterinaria, microbiología, análisis físico-químicas, tuberculosis, leche humana y vigilancia de resistencia antimicrobiana (vigiRAM). La misión sigue siendo la misma que en 1977: estar lado a lado con el laboratorio en la búsqueda de la calidad.",
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
    { question: "¿Quién fundó Controllab?", options: ["Un grupo de médicos brasileños", "Marcio Biasoli, con base en experiencia laboratorial y proyectos piloto de control de calidad", "El gobierno federal brasileño", "La Sociedad Brasileña de Patología Clínica"], answer: "Marcio Biasoli, con base en experiencia laboratorial y proyectos piloto de control de calidad" },
    { question: "¿En qué año fue Controllab el primer proveedor de EA habilitado por ANVISA/REBLAS?", options: ["1977", "2003", "2001", "2011"], answer: "2001" },
    { question: "¿Bajo qué número fue acreditada Controllab como proveedora de Ensayo de Aptitud (EA)?", options: ["ISO 15189", "PMR0009", "PEP003", "CAL0214"], answer: "PEP003" },
    { question: "¿En qué año fue Controllab acreditada como Productora de Material de Referencia Certificado?", options: ["2001", "2011", "2003", "2016"], answer: "2016" },
    { question: "¿Cuáles son las dos sociedades científicas que apoyan a Controllab?", options: ["IFCC y EQALM", "SBPC/ML y SBMV", "ANVISA y Cgcre", "OPS y OMS"], answer: "SBPC/ML y SBMV" },
    { question: "¿A qué organizaciones internacionales pertenece Controllab?", options: ["Solo a la OPS", "IFCC como miembro y EQALM como miembro asociado", "ISO y CLSI", "Solo a ANVISA como organismo nacional"], answer: "IFCC como miembro y EQALM como miembro asociado" },
    { question: "¿En qué año obtuvo Controllab la certificación ISO 9001?", options: ["1977", "2001", "2003", "2016"], answer: "2003" },
    { question: "¿Qué es el programa vigiRAM de Controllab?", options: ["Un programa de control de calidad para laboratorios veterinarios", "Un programa de vigilancia de resistencia antimicrobiana", "Un ensayo de aptitud para análisis físico-químicas", "Un programa educativo online"], answer: "Un programa de vigilancia de resistencia antimicrobiana" },
    { question: "¿Qué sectores cubre actualmente la oferta de ensayos de Controllab?", options: ["Solo laboratorios clínicos en Brasil", "Clínica, anatomía patológica, hemoterapia, veterinaria, microbiología, físico-químicas, tuberculosis, leche humana y vigiRAM", "Solo análisis bioquímicos y hematológicos", "Solo laboratorios acreditados por ISO 15189"], answer: "Clínica, anatomía patológica, hemoterapia, veterinaria, microbiología, físico-químicas, tuberculosis, leche humana y vigiRAM" },
    { question: "¿Qué significa el slogan 'Lado a lado con vos' de Controllab?", options: ["Que Controllab es el proveedor más grande del mercado", "Que la empresa acompaña al laboratorio en el proceso de mejora continua, no solo provee servicios", "Que Controllab tiene oficinas en todo Brasil", "Que los clientes pueden visitar las instalaciones de Controllab"], answer: "Que la empresa acompaña al laboratorio en el proceso de mejora continua, no solo provee servicios" },
    { question: "¿Qué número identifica la acreditación Cgcre para calibración volumétrica?", options: ["PEP003", "PMR0009", "CAL0214", "CRL0586"], answer: "CAL0214" },
    { question: "¿Qué certifica la acreditación CRL0586 de Controllab?", options: ["Los programas de EA", "Las actividades laboratoriales para control de proceso y calidad de materiales preparados por Controllab", "La producción de materiales de referencia", "Las buenas prácticas de fabricación"], answer: "Las actividades laboratoriales para control de proceso y calidad de materiales preparados por Controllab" },
  ],
  dictation: "Controllab fue fundada en 1977 por Marcio Biasoli y fue el primer proveedor de Ensayo de Aptitud del Brasil habilitado por ANVISA en 2001.",
},
{
  id: "controllab-ea", title: "Ensayo de Aptitud (EA)", level: "Intermedio", category: "Controllab", emoji: "🔬",
  description: "Qué es el EA, cómo funciona y cuáles son sus beneficios según el Manual del Participante.",
  readingTitle: "¿Cómo sabe un laboratorio si sus resultados son correctos?",
  reading: [
    "Un laboratorio enfrenta una pregunta fundamental: ¿cómo sé que mis resultados son correctos? El control interno le dice si el método es reproducible dentro de su propio sistema, pero no le dice si sus valores están alineados con los que obtendrían otros laboratorios procesando la misma muestra. Esa pregunta es la que responde el Ensayo de Aptitud (EA).",
    "El Ensayo de Aptitud (EA) es también conocido como control externo de la calidad. Es una sistemática continua y periódica, constituida por evaluaciones de resultados obtenidos por los establecimientos en el análisis de materiales desconocidos que simulan pacientes.",
    "Controllab evalúa el desempeño siguiendo la norma ABNT NBR ISO/IEC 17043. Los participantes son evaluados en grupos según el sistema analítico utilizado. Para grupos de 12 o más participantes se usan estadísticas robustas conforme a la ISO 13528. Para grupos de menos de 12 participantes se aplican métodos estadísticos tradicionales con técnicas de remuestreo.",
    "Los beneficios del EA incluyen: padronizar la fase analítica frente al mercado, evaluar la eficiencia del control interno, identificar posibilidades de mejora relacionadas con equipos y cuerpo técnico, promover acciones correctivas y preventivas, e identificar diferencias entre establecimientos participantes.",
    "Los resultados obtenidos en estos programas son normalmente utilizados en la comprobación de capacidad técnica para clientes y usuarios, como diferencial frente a la competencia y como requisito de licitaciones y de sistemas de acreditación.",
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
    { question: "¿Bajo qué norma evalúa Controllab el desempeño en sus programas de EA?", options: ["ISO 15189 exclusivamente", "ABNT NBR ISO/IEC 17043", "ISO 13528 como única referencia", "CLIA 88 como norma principal"], answer: "ABNT NBR ISO/IEC 17043" },
    { question: "¿Cuántos participantes mínimos requiere Controllab para usar estadísticas robustas?", options: ["Más de 5", "12 o más participantes en el grupo de evaluación", "Al menos 20 laboratorios", "30 participantes por ronda"], answer: "12 o más participantes en el grupo de evaluación" },
    { question: "¿Qué tipo de materiales analiza el laboratorio en el EA?", options: ["Sus propias muestras de pacientes", "Materiales desconocidos que simulan pacientes", "Materiales de calibración del fabricante", "Controles internos propios del laboratorio"], answer: "Materiales desconocidos que simulan pacientes" },
    { question: "¿Cuál es la respuesta correcta ante un resultado inadecuado en un EA?", options: ["Ignorarlo si el control interno estaba bien", "Investigación sistemática de la causa raíz con documentación y verificación de acciones correctivas", "Repetir el ensayo hasta obtener un resultado satisfactorio", "Cambiar de proveedor del programa de EA"], answer: "Investigación sistemática de la causa raíz con documentación y verificación de acciones correctivas" },
    { question: "¿Para qué se usan los resultados del EA externamente?", options: ["Solo para uso interno del laboratorio", "Para comprobación de capacidad técnica, diferencial frente a la competencia y requisitos de acreditación", "Solo para auditorías internas", "Solo para cumplir con ANVISA"], answer: "Para comprobación de capacidad técnica, diferencial frente a la competencia y requisitos de acreditación" },
    { question: "¿Qué diferencia al EA del control interno?", options: ["El EA es más preciso que el control interno", "El control interno evalúa reproducibilidad propia; el EA compara con otros laboratorios", "El EA solo se realiza una vez al año", "No hay diferencia real entre ambos"], answer: "El control interno evalúa reproducibilidad propia; el EA compara con otros laboratorios" },
  ],
  dictation: "El Ensayo de Aptitud es el control externo de la calidad: el laboratorio analiza materiales desconocidos que simulan pacientes y compara sus resultados con los de otros participantes.",
},
{
  id: "dialogo-control-calidad-cliente",
  title: "Diálogo: explicar el EA a un cliente",
  level: "Intermedio",
  category: "Ventas",
  emoji: "🗣️",
  description: "Conversación real entre un representante de Controllab y un director de laboratorio cliente.",
  readingTitle: "Una llamada desde Bogotá",
  reading: [
    "— Buenos días, habla Mariana Souza de Controllab. ¿Estoy hablando con el Dr. Ramírez?\n— Sí, soy yo. Buenos días, Mariana. ¿En qué le puedo ayudar?\n— Le llamo porque notamos que su laboratorio recibió el informe de la última ronda del programa de bioquímica y quería saber si tiene alguna duda sobre los resultados.",
    "— Justamente iba a llamarlos. Tengo aquí el informe y veo que en glucosa el resultado aparece como inadecuado. No entiendo por qué, porque nuestro control interno estaba perfecto esa semana.\n— Entiendo, Dr. Ramírez, y es una pregunta muy válida. El control interno y el Ensayo de Aptitud miden cosas distintas. ¿Me permite explicarle?",
    "— Por favor.\n— El control interno le dice si su método es reproducible dentro de su propio laboratorio: si el equipo mide igual hoy que ayer y que la semana pasada. Eso es muy importante. Pero no le dice si sus valores están alineados con los de otros laboratorios que miden lo mismo con métodos similares. Eso es exactamente lo que evalúa el Ensayo de Aptitud.",
    "— Ah, entiendo. Entonces puede que mi equipo sea consistente pero esté midiendo con un desplazamiento sistemático respecto al valor real.\n— Exactamente. Y en su caso, el Índice de Desvío fue de 1.3, lo que indica que su resultado estuvo un 30% por encima del límite superior del criterio de evaluación. El valor alvo del grupo fue 95 mg/dL y su resultado fue 108 mg/dL.",
    "— ¿Y qué me recomiendan investigar?\n— Le sugiero revisar tres cosas. Primero, el lote del calibrador que estaba usando esa semana: ¿era el mismo que las semanas anteriores? Segundo, los resultados del control interno de ese período: aunque estuvieran 'en verde', ¿había alguna tendencia sostenida hacia arriba? Tercero, si otros laboratorios de su mismo grupo analítico tuvieron resultados similares, lo puede ver en la sección de comparación por método del informe.",
    "— Tiene sentido. ¿Y si investigo y resulta que el calibrador tenía un problema?\n— En ese caso, idealmente debería documentar el hallazgo como una no conformidad, implementar una acción correctiva — ya sea recalibrar con un lote nuevo o contactar al proveedor — y verificar en la próxima ronda que el resultado mejora. Eso también sirve como evidencia para su sistema de calidad y para futuras auditorías.\n— Perfecto, Mariana. Muchas gracias por la orientación. Le aviso cómo resulta la investigación.\n— Con mucho gusto, Dr. Ramírez. Quedo a su disposición para cualquier consulta.",
  ],
  vocab: [
    { es: "ronda / ciclo del EA", pt: "ronda / ciclo do EP" },
    { es: "Índice de Desvío (ID)", pt: "Índice de Desvio (ID)" },
    { es: "valor alvo", pt: "valor alvo" },
    { es: "desplazamiento sistemático", pt: "deslocamento sistemático" },
    { es: "lote del calibrador", pt: "lote do calibrador" },
    { es: "no conformidad documentada", pt: "não conformidade documentada" },
  ],
  quiz: [
    {
      question: "¿Por qué el Dr. Ramírez estaba confundido con el resultado inadecuado?",
      options: ["Porque no había recibido el informe completo", "Porque su control interno estaba bien pero el EA marcó inadecuado, y no entendía la diferencia entre ambos", "Porque el valor alvo le parecía incorrecto", "Porque pensaba que el programa de EA tenía un error"],
      answer: "Porque su control interno estaba bien pero el EA marcó inadecuado, y no entendía la diferencia entre ambos",
    },
    {
      question: "¿Cuál es la diferencia clave entre el control interno y el Ensayo de Aptitud según Mariana?",
      options: ["El control interno es más preciso que el EA", "El control interno evalúa reproducibilidad interna; el EA compara el resultado con otros laboratorios que miden lo mismo", "El EA solo sirve para laboratorios grandes", "El control interno es obligatorio; el EA es opcional"],
      answer: "El control interno evalúa reproducibilidad interna; el EA compara el resultado con otros laboratorios que miden lo mismo",
    },
    {
      question: "¿Qué significa que el ID fue de 1.3 en el caso del Dr. Ramírez?",
      options: ["Que el resultado estuvo exactamente en el límite del criterio", "Que el resultado estuvo un 30% por encima del límite superior del criterio de evaluación", "Que el resultado fue 1.3 mg/dL mayor que el valor alvo", "Que el método tiene una imprecisión del 1.3%"],
      answer: "Que el resultado estuvo un 30% por encima del límite superior del criterio de evaluación",
    },
    {
      question: "¿Cuál fue el valor alvo del grupo y el resultado del laboratorio?",
      options: ["Valor alvo 108 mg/dL, resultado 95 mg/dL", "Valor alvo 95 mg/dL, resultado 108 mg/dL", "Valor alvo 100 mg/dL, resultado 113 mg/dL", "Valor alvo 90 mg/dL, resultado 108 mg/dL"],
      answer: "Valor alvo 95 mg/dL, resultado 108 mg/dL",
    },
    {
      question: "¿Qué tres cosas le sugirió Mariana investigar al Dr. Ramírez?",
      options: ["El equipo, el personal y los reactivos vencidos", "El lote del calibrador, la tendencia del control interno y la comparación con otros laboratorios del mismo grupo analítico", "La temperatura del laboratorio, el tiempo de centrifugado y la hemólisis de las muestras", "El proveedor del reactivo, el software del LIMS y el procedimiento escrito"],
      answer: "El lote del calibrador, la tendencia del control interno y la comparación con otros laboratorios del mismo grupo analítico",
    },
    {
      question: "¿Qué puede indicar una tendencia sostenida hacia arriba en el control interno aunque esté 'en verde'?",
      options: ["Que el método es muy preciso y estable", "Un desplazamiento sistemático que aún no cruzó el límite de rechazo pero que puede estar afectando los resultados", "Que el equipo fue calibrado recientemente con éxito", "Que el control tiene un error de fabricación"],
      answer: "Un desplazamiento sistemático que aún no cruzó el límite de rechazo pero que puede estar afectando los resultados",
    },
    {
      question: "¿Para qué sirve documentar el hallazgo como no conformidad?",
      options: ["Solo para cumplir con un requisito burocrático del programa de EA", "Como evidencia para el sistema de calidad y para futuras auditorías, además de formalizar la acción correctiva", "Solo si el laboratorio está en proceso de acreditación ISO 15189", "Para reportar el problema al proveedor del reactivo"],
      answer: "Como evidencia para el sistema de calidad y para futuras auditorías, además de formalizar la acción correctiva",
    },
    {
      question: "¿Cómo demuestra el laboratorio que la acción correctiva fue efectiva?",
      options: ["Enviando un correo a Controllab explicando lo que hizo", "Mostrando que el resultado mejoró en la próxima ronda del EA", "Repitiendo el análisis con la misma muestra del EA", "Cambiando de proveedor de reactivos inmediatamente"],
      answer: "Mostrando que el resultado mejoró en la próxima ronda del EA",
    },
    {
      question: "¿Qué tono usa Mariana durante toda la conversación?",
      options: ["Formal y distante, solo con información técnica", "Cálido, técnico y orientado a ayudar: escucha, explica con claridad y propone pasos concretos", "Comercial: aprovecha la llamada para ofrecer nuevos programas", "Defensivo: justifica los resultados del EA ante las dudas del cliente"],
      answer: "Cálido, técnico y orientado a ayudar: escucha, explica con claridad y propone pasos concretos",
    },
    {
      question: "¿Qué frase usa Mariana para cerrar la conversación de forma profesional?",
      options: ["'Espero que haya quedado claro'", "'Quedo a su disposición para cualquier consulta'", "'Le enviaré un correo con todo lo que hablamos'", "'Llámenos cuando tenga los resultados de la investigación'"],
      answer: "'Quedo a su disposición para cualquier consulta'",
    },
    {
      question: "¿Por qué Mariana llama al cliente proactivamente sin esperar que él llame?",
      options: ["Porque es un requisito del programa de EA de Controllab", "Porque detectaron que el cliente recibió un resultado inadecuado y quieren acompañarlo antes de que surja una duda sin respuesta", "Porque el cliente había solicitado una llamada de seguimiento", "Porque necesitan verificar que el informe fue recibido"],
      answer: "Porque detectaron que el cliente recibió un resultado inadecuado y quieren acompañarlo antes de que surja una duda sin respuesta",
    },
    {
      question: "¿Qué información del informe usa Mariana para dar una respuesta específica y no genérica?",
      options: ["Solo el resultado de adecuado o inadecuado", "El ID concreto (1.3), el valor alvo (95 mg/dL) y el resultado del laboratorio (108 mg/dL)", "Solo el nombre del ensayo y la fecha de la ronda", "El número de participantes del grupo y el CV del grupo"],
      answer: "El ID concreto (1.3), el valor alvo (95 mg/dL) y el resultado del laboratorio (108 mg/dL)",
    },
  ],
  dictation: "El control interno evalúa la reproducibilidad dentro del laboratorio pero no indica si los valores están alineados con los de otros laboratorios: eso es lo que mide el Ensayo de Aptitud.",
},
{
  id: "controllab-id", title: "Índice de Desvío (ID) de Controllab", level: "Avanzado", category: "Controllab", emoji: "📐",
  description: "El indicador principal de desempeño de Controllab: cálculo, interpretación y uso.",
  readingTitle: "¿Por qué Controllab usa el ID?",
  reading: [
    "Controllab utiliza el Índice de Desvío (ID) como indicador principal del desempeño cuantitativo en sus programas de Ensayo de Aptitud (EA). El ID tiene un propósito similar al Z-escore, pero con una diferencia conceptual importante: mientras el Z-escore relativiza el error frente a la variación del grupo comparativo, el ID relativiza el error frente al criterio del propio proveedor.",
    "La fórmula del ID es: ID = (resultado del laboratorio − valor alvo) / límite del programa. El valor alvo es la media o mediana del grupo de evaluación tras el tratamiento estadístico. El límite es el criterio de aceptación definido por Controllab para ese ensayo. Un ID entre -1 y +1 indica resultado adecuado.",
    "La ventaja práctica del ID es que permite comparar el desempeño entre diferentes ensayos de forma directa. Como siempre se relativiza frente al mismo criterio, un ID de 0.8 en glucosa y un ID de 0.8 en hemoglobina tienen exactamente el mismo significado relativo. Esto facilita la visualización de tendencias en programas con paneles múltiples.",
    "El ID también permite visualizar tendencias: si el ID se acerca progresivamente a 1 o a -1 en rondas sucesivas, es una señal de alerta incluso antes de que el resultado sea inadecuado.",
    "El Z-escore del Grupo de Evaluación (GA) es un índice complementario disponible en algunos ensayos clínicos de Controllab. Su fórmula es: Z (GA) = (resultado − media del grupo) / desvío estándar del grupo. Este índice permite comparar el comportamiento del laboratorio frente a sus pares en ese ciclo específico. Sin embargo, el indicador principal de desempeño en Controllab es siempre el ID, no el Z-escore.",
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
    { question: "¿Qué indica un ID entre -1 y +1?", options: ["Resultado inadecuado que requiere investigación", "Resultado dentro del criterio de evaluación: adecuado", "Zona de alerta que debe monitorearse", "Resultado excelente que supera el promedio del grupo"], answer: "Resultado dentro del criterio de evaluación: adecuado" },
    { question: "¿Cuál es la diferencia conceptual principal entre el ID y el Z-escore?", options: ["El ID usa la mediana y el Z-escore usa la media", "El ID relativiza el error frente al criterio del proveedor; el Z-escore frente a la variación del grupo comparativo", "El Z-escore es más preciso que el ID", "Solo difieren en el nombre, el cálculo es idéntico"], answer: "El ID relativiza el error frente al criterio del proveedor; el Z-escore frente a la variación del grupo comparativo" },
    { question: "¿Por qué el ID facilita la comparación entre ensayos distintos?", options: ["Porque usa el mismo equipo para todos", "Porque siempre se relativiza frente al mismo criterio, haciendo comparables los ID de diferentes analitos", "Porque los valores de referencia son iguales para todos", "Solo para ensayos del mismo grupo analítico"], answer: "Porque siempre se relativiza frente al mismo criterio, haciendo comparables los ID de diferentes analitos" },
    { question: "¿Qué señal de alerta puede detectarse con el ID antes de un resultado inadecuado?", options: ["Un ID exactamente igual a 0 en varias rondas", "Un ID que se acerca progresivamente a 1 o a -1 en rondas sucesivas", "Un ID que varía aleatoriamente entre -0.5 y 0.5", "Un ID negativo en todos los resultados"], answer: "Un ID que se acerca progresivamente a 1 o a -1 en rondas sucesivas" },
    { question: "¿Qué es el valor alvo en el programa de Controllab?", options: ["El valor del control interno del laboratorio", "La media o mediana del grupo de evaluación tras el tratamiento estadístico", "El límite máximo de la faja de evaluación", "El resultado del laboratorio de referencia"], answer: "La media o mediana del grupo de evaluación tras el tratamiento estadístico" },
    { question: "¿El Z-escore reemplaza al ID como indicador principal en Controllab?", options: ["Sí, el Z-escore es siempre el indicador principal", "No, el ID es el indicador principal; el Z-escore del GA es información complementaria en algunos ensayos", "Son equivalentes y el laboratorio elige cuál usar", "Solo el Z-escore está acreditado por el Cgcre"], answer: "No, el ID es el indicador principal; el Z-escore del GA es información complementaria en algunos ensayos" },
    { question: "¿Cuál es la fórmula del Z-escore del Grupo de Evaluación (GA)?", options: ["Z = (resultado − valor alvo) / límite del programa", "Z = (resultado − media del grupo) / desvío estándar del grupo", "Z = resultado / media del grupo", "Z = (límite − resultado) / valor alvo"], answer: "Z = (resultado − media del grupo) / desvío estándar del grupo" },
    { question: "¿En qué documento de Controllab aparece el ID del laboratorio?", options: ["Solo en el Certificado de Proficiência anual", "En el Relatório de Avaliação de cada ronda junto con la evaluación A o I", "Solo en el Perfil de Resultados del grupo", "En la Certidão de Inscrição"], answer: "En el Relatório de Avaliação de cada ronda junto con la evaluación A o I" },
    { question: "¿Qué diferencia conceptual existe entre el ID y el Z-escore como herramientas de mejora?", options: ["No hay diferencia conceptual relevante", "El ID dice si el resultado cumple el estándar de calidad; el Z-escore dice si el resultado es similar o diferente al de los pares", "El Z-escore siempre es más estricto que el ID", "Solo el ID es una herramienta de mejora; el Z-escore es solo estadístico"], answer: "El ID dice si el resultado cumple el estándar de calidad; el Z-escore dice si el resultado es similar o diferente al de los pares" },
  ],
  dictation: "El Índice de Desvío de Controllab se calcula dividiendo la diferencia entre el resultado y el valor alvo por el límite del programa: un ID entre menos uno y más uno indica resultado adecuado.",
},
{
  id: "controllab-ronda", title: "La ronda del EA: paso a paso", level: "Básico", category: "Controllab", emoji: "🔄",
  description: "Cómo funciona una ronda completa del Ensayo de Aptitud de Controllab.",
  readingTitle: "Desde el envío de la muestra hasta el certificado",
  reading: [
    "Una ronda del Ensayo de Aptitud (EA) de Controllab es una ronda completa: desde la distribución de los materiales hasta la emisión del informe de evaluación. Cada ronda tiene una identificación única formada por el mes (tres caracteres) y el año (cuatro dígitos) correspondientes al envío.",
    "El proceso comienza cuando Controllab distribuye los materiales junto con una Lista de Verificação que detalla los ítems enviados, las condiciones de almacenamiento y los plazos. El participante verifica que todos los materiales llegaron en condiciones correctas.",
    "El laboratorio analiza los materiales como si fueran muestras de pacientes, usando sus métodos y equipos de rutina. No debe intercambiar información con otros participantes durante la ronda. Los resultados se reportan en el Sistema Online dentro del plazo con el sistema analítico correcto seleccionado.",
    "Controllab aplica el tratamiento estadístico con el Grupo Assessor y emite el Relatório de Avaliação con los resultados individuales, el ID de cada ítem, la faja de evaluación y los comentarios técnicos. El Perfil de Resultados complementa el informe con el resumen estadístico de todos los participantes.",
    "A lo largo del año, el desempeño se acumula en el porcentaje de adecuados (%A). Al final del año, si el laboratorio alcanzó el grau de desempenho mínimo, recibe el Certificado de Proficiência. Para la mayoría de los ensayos el mínimo es 80%; para ensayos críticos de hemoterapia como Anti-HIV es 100%.",
  ],
  vocab: [
    { es: "ronda / ronda", pt: "ronda" },
    { es: "plazo de envío de resultados", pt: "prazo de envio de resultados" },
    { es: "Relatório de Avaliação", pt: "Relatório de Avaliação" },
    { es: "porcentaje de adecuados (%A)", pt: "percentual de adequados (%A)" },
    { es: "grau de desempeño mínimo", pt: "grau de desempenho mínimo" },
    { es: "Certificado de Proficiência", pt: "Certificado de Proficiência" },
  ],
  quiz: [
    { question: "¿Cómo se identifica cada ronda del EA de Controllab?", options: ["Con el número de participante del laboratorio", "Con el mes (tres caracteres) y el año (cuatro dígitos) correspondientes al envío", "Con un código alfanumérico asignado al azar", "Con el número del Certificado anterior"], answer: "Con el mes (tres caracteres) y el año (cuatro dígitos) correspondientes al envío" },
    { question: "¿Cómo debe analizar el laboratorio los materiales de la ronda?", options: ["Con métodos especiales diseñados para el EA", "Como si fueran muestras de pacientes, usando métodos y equipos de rutina", "Repitiendo el análisis tres veces para mayor precisión", "Solo en el horario que indique Controllab"], answer: "Como si fueran muestras de pacientes, usando métodos y equipos de rutina" },
    { question: "¿Qué está prohibido durante la ronda?", options: ["Repetir el análisis si el resultado parece incorrecto", "Intercambiar información de resultados con otros participantes", "Usar el sistema analítico habitual de la rutina", "Analizar los materiales antes del plazo límite"], answer: "Intercambiar información de resultados con otros participantes" },
    { question: "¿Qué contiene el Relatório de Avaliação?", options: ["Solo el resultado final de adecuado o inadecuado", "Resultados individuales, ID de cada ítem, faja de evaluación y comentarios del Grupo Assessor", "Solo los comentarios técnicos del grupo assessor", "Solo el Certificado de Proficiência del año"], answer: "Resultados individuales, ID de cada ítem, faja de evaluación y comentarios del Grupo Assessor" },
    { question: "¿Cuál es el grau de desempeño mínimo para la mayoría de los ensayos?", options: ["100% sin excepción", "80% para la mayoría de los ensayos", "70% para todos los ensayos", "90% para todos los ensayos"], answer: "80% para la mayoría de los ensayos" },
    { question: "¿Para qué ensayos el mínimo es 100%?", options: ["Para todos los ensayos de hemoterapia", "Para ensayos críticos como Anti-HIV, Sistema ABO, Sistema Rhesus, Prova Cruzada y NAT", "Solo para Anti-HIV y Anti-HCV", "Para todos los ensayos de microbiología"], answer: "Para ensayos críticos como Anti-HIV, Sistema ABO, Sistema Rhesus, Prova Cruzada y NAT" },
    { question: "¿Qué acumula el indicador %A a lo largo del año?", options: ["El número total de rondas participadas", "El porcentaje de resultados adecuados acumulado en todos los ensayos del año", "El número de ensayos certificados", "El promedio del ID de todas las rondas"], answer: "El porcentaje de resultados adecuados acumulado en todos los ensayos del año" },
    { question: "¿Qué es la ronda Especial de Controllab?", options: ["Una ronda con materiales más difíciles para laboratorios avanzados", "Una ronda de recuperación al final del año para participantes que no alcanzaron el %A mínimo", "Una ronda adicional gratuita para todos los participantes", "Una ronda solo para ensayos de hemoterapia"], answer: "Una ronda de recuperación al final del año para participantes que no alcanzaron el %A mínimo" },
    { question: "¿Qué ocurre con el año para el programa de Controllab?", options: ["Comienza en enero y termina en diciembre", "Comienza en el 4to trimestre del año anterior y termina en el 3er trimestre del año vigente", "Siempre sigue el año calendario exacto", "Comienza cuando el laboratorio se inscribe"], answer: "Comienza en el 4to trimestre del año anterior y termina en el 3er trimestre del año vigente" },
  ],
  dictation: "En cada ronda el laboratorio analiza los materiales con sus métodos habituales y reporta los resultados en el Sistema Online dentro del plazo para obtener su Relatório de Avaliação.",
},
{
  id: "controllab-sistema-online", title: "Sistema Online de Controllab", level: "Básico", category: "Controllab", emoji: "💻",
  description: "Cómo usar el Sistema Online: envío de resultados, informes y gestión del programa.",
  readingTitle: "La herramienta que está siempre disponible",
  reading: [
    "El Sistema Online de Controllab es la plataforma digital a través de la cual los laboratorios participantes interactúan con el programa de Ensayo de Aptitud (EA). Es la herramienta central para el envío de resultados, el acceso a informes, la descarga de documentos y la gestión de los datos del programa.",
    "Cada laboratorio debe designar un administrador indicado por el establecimiento participante para: enviar los resultados de los ítems analizados a cada ronda; acceder e imprimir documentos y avaliações; delegar acceso a otros profesionales del establecimiento; y acceder a materiales exclusivos para clientes Controllab.",
    "El envío de resultados es la función más crítica. El participante debe seleccionar correctamente el sistema analítico (fabricante del kit, método, equipamiento, temperatura, unidad) antes de ingresar el resultado. Si el sistema no está disponible, puede completarse manualmente y subirse la documentación en el campo de Pendências.",
    "Una regla fundamental: los campos no deben llenarse con cero cuando un ensayo no fue realizado. El cero se interpreta como resultado real y puede generar evaluación inadecuada. Si el ensayo no fue realizado, deben dejarse todos los campos en blanco para que el ítem no cuente en la pontuação del año. Si fue por causa momentánea, puede solicitarse Não Participação Justificada, una vez por año por ensayo.",
    "Los documentos del programa — Manual do Participante, Instruções de Uso, Gibi do Controle de Qualidade, informes de cada ronda y Questionários Ilustrados — están disponibles para descarga en el Sistema Online.",
  ],
  vocab: [
    { es: "administrador del Sistema Online", pt: "administrador do Sistema Online" },
    { es: "envío de resultados", pt: "envio de resultados" },
    { es: "sistema analítico", pt: "sistema analítico" },
    { es: "campo en blanco (ensayo no realizado)", pt: "campo em branco (ensaio não realizado)" },
    { es: "Não Participação Justificada", pt: "Não Participação Justificada" },
    { es: "descarga de documentos", pt: "download de documentos" },
  ],
  quiz: [
    { question: "¿Quién gestiona el Sistema Online en el laboratorio participante?", options: ["Cualquier analista del turno de mañana", "Un administrador designado por el establecimiento participante", "El director técnico exclusivamente", "El área de TI del laboratorio"], answer: "Un administrador designado por el establecimiento participante" },
    { question: "¿Qué información debe seleccionarse antes de ingresar un resultado?", options: ["Solo el nombre del analista", "El sistema analítico: fabricante, método, equipo, temperatura y unidades", "Solo el número de participante y la fecha", "Solo el resultado numérico y la unidad"], answer: "El sistema analítico: fabricante, método, equipo, temperatura y unidades" },
    { question: "¿Por qué nunca debe ingresarse cero cuando un ensayo no fue realizado?", options: ["Porque el sistema no acepta el valor cero", "Porque el cero se interpreta como resultado real y puede generar evaluación inadecuada", "Solo por exigencia formal de la norma", "Porque distorsiona el cálculo de la media del grupo únicamente"], answer: "Porque el cero se interpreta como resultado real y puede generar evaluación inadecuada" },
    { question: "¿Qué deben hacer los campos de un ensayo no realizado en la rutina?", options: ["Completarse con el valor del mes anterior", "Dejarse en blanco para que el ítem no cuente en la pontuação anual", "Completarse con NA o con cero", "Solicitarse Não Participação Justificada siempre"], answer: "Dejarse en blanco para que el ítem no cuente en la pontuação anual" },
    { question: "¿Cuántas veces puede solicitarse la Não Participação Justificada por ensayo por año?", options: ["Sin límite cuando sea necesario", "Una vez por año para cada ensayo", "Dos veces si hay justificación documentada", "No existe esa opción"], answer: "Una vez por año para cada ensayo" },
    { question: "¿Qué pasa si el sistema analítico del laboratorio no está disponible en el formulario?", options: ["Debe usarse el sistema más parecido disponible", "Puede completarse manualmente y subirse la documentación en el campo de Pendências", "El resultado no puede reportarse esa ronda", "Debe contactarse a Controllab para que lo agreguen"], answer: "Puede completarse manualmente y subirse la documentación en el campo de Pendências" },
    { question: "¿Qué puede hacer el administrador para otros profesionales del establecimiento?", options: ["Solo verlos en el historial", "Delegar acceso con permisos específicos a otros profesionales del establecimiento", "Solo el administrador puede ingresar resultados sin excepciones", "Cambiar la contraseña de acceso de Controllab"], answer: "Delegar acceso con permisos específicos a otros profesionales del establecimiento" },
    { question: "¿Qué documentos están disponibles en el Sistema Online?", options: ["Solo los Relatórios de Avaliação del año en curso", "Manual do Participante, Instruções de Uso, Gibi, informes de cada ronda y Questionários Ilustrados", "Solo el Certificado de Proficiência anual", "Solo los documentos del último año de participación"], answer: "Manual do Participante, Instruções de Uso, Gibi, informes de cada ronda y Questionários Ilustrados" },
    { question: "¿Cuál es el requisito para que Controllab libere el Certificado de Proficiência?", options: ["Solo haber participado en todas las rondas", "Tener las facturas quitadas y haber alcanzado el grau de desempenho mínimo", "Solo haber obtenido 100% de adecuados", "Solo estar inscripto hace más de un año"], answer: "Tener las facturas quitadas y haber alcanzado el grau de desempenho mínimo" },
  ],
  dictation: "El administrador del Sistema Online de Controllab es responsable de enviar los resultados correctamente, mantener el sistema analítico actualizado y cumplir los plazos de cada ronda.",
},
{
  id: "controllab-comunicacion", title: "Comunicar con clientes de Controllab", level: "Intermedio", category: "Controllab", emoji: "📞",
  description: "Vocabulario y situaciones reales de comunicación con laboratorios clientes en español.",
  readingTitle: "La llamada desde Buenos Aires",
  reading: [
    "Una mañana de lunes, una analista del equipo de Controllab recibió una llamada de un laboratorio clínico en Buenos Aires. El responsable de calidad del laboratorio estaba preocupado: acababa de recibir el informe del último ciclo del programa de bioquímica y su resultado de glucosa aparecía con un Índice de Desvío (ID) de 1.4, lo que lo colocaba fuera del criterio del proveedor.",
    "La analista escuchó el planteo completo antes de responder. Luego revisó el informe en el sistema y confirmó que el ID era efectivamente de 1.4, lo que indicaba que el resultado estaba fuera de la faja de evaluación establecida por Controllab.",
    "La conversación fue un ejercicio práctico de comunicación técnica en español. La analista tuvo que explicar conceptos como el Índice de Desvío (ID), el valor alvo, el límite del proveedor y la faja de evaluación, usando un lenguaje claro y accesible pero sin perder precisión técnica.",
    "La analista sugirió al laboratorio revisar tres aspectos: primero, el lote de calibrador vigente durante el ciclo del EA; segundo, los resultados del control interno del mismo período; tercero, si otros laboratorios que usaban el mismo método habían tenido resultados similares, consultando la sección de comparación por método en el informe.",
    "Ese tipo de interacción es el núcleo de la relación entre Controllab y sus clientes hispanohablantes. Acompañar al laboratorio en la interpretación del ID, del informe y en la mejora de su desempeño requiere un dominio sólido del español técnico del laboratorio.",
  ],
  vocab: [
    { es: "Índice de Desvío (ID)", pt: "Índice de Desvio (ID)" },
    { es: "faja de evaluación", pt: "faixa de avaliação" },
    { es: "responsable de calidad del laboratorio", pt: "responsável pela qualidade do laboratório" },
    { es: "lote de calibrador", pt: "lote de calibrador" },
    { es: "documentar la consulta", pt: "documentar a consulta" },
    { es: "soporte técnico", pt: "suporte técnico" },
  ],
  quiz: [
    { question: "¿Por qué llamó el responsable de calidad del laboratorio de Buenos Aires?", options: ["Para cancelar su participación en el programa de EA", "Porque su ID de glucosa estaba en 1.4, fuera del criterio del proveedor, y quería orientación", "Porque no recibió el informe del ciclo en tiempo y forma", "Para solicitar un nuevo ciclo de análisis gratuito"], answer: "Porque su ID de glucosa estaba en 1.4, fuera del criterio del proveedor, y quería orientación" },
    { question: "¿Qué hizo la analista antes de responder al cliente?", options: ["Le envió directamente el protocolo de investigación por correo", "Escuchó el planteo completo y revisó el informe en el sistema antes de responder", "Le pidió que enviara los datos por correo electrónico", "Le indicó que el resultado era inaceptable sin revisar el contexto"], answer: "Escuchó el planteo completo y revisó el informe en el sistema antes de responder" },
    { question: "¿Un ID de 1.4 significa que el resultado del laboratorio está dentro del criterio de Controllab?", options: ["Sí, cualquier ID menor a 2 es aceptable", "No, el criterio de Controllab es ID entre -1 y +1; un ID de 1.4 está fuera", "Sí, 1.4 es solo una señal de alerta sin consecuencia", "Depende del analito evaluado"], answer: "No, el criterio de Controllab es ID entre -1 y +1; un ID de 1.4 está fuera" },
    { question: "¿Qué tres aspectos sugirió revisar la analista al laboratorio?", options: ["El equipo, el reactivo y el personal", "El lote de calibrador, los controles internos del período y la comparación por método en el informe", "Solo los resultados de los controles internos", "Solo la calibración del equipo analítico"], answer: "El lote de calibrador, los controles internos del período y la comparación por método en el informe" },
    { question: "¿Qué refleja ese tipo de interacción sobre la relación de Controllab con sus clientes?", options: ["Que Controllab solo distribuye materiales y espera resultados", "Que Controllab acompaña al laboratorio en la interpretación del ID y en la mejora del desempeño", "Que el soporte técnico es solo por correo electrónico", "Que la relación es exclusivamente comercial sin soporte técnico"], answer: "Que Controllab acompaña al laboratorio en la interpretación del ID y en la mejora del desempeño" },
    { question: "¿Qué requiere el soporte técnico a clientes hispanohablantes del equipo Controllab?", options: ["Solo conocer el sistema informático de gestión de clientes", "Dominio sólido del español técnico del laboratorio: vocabulario específico y habilidades comunicativas", "Solo hablar español a nivel básico conversacional", "Solo conocer los productos del catálogo de Controllab"], answer: "Dominio sólido del español técnico del laboratorio: vocabulario específico y habilidades comunicativas" },
    { question: "¿Qué hizo la analista al finalizar la llamada?", options: ["Solo cerró la llamada sin registro adicional", "Documentó la consulta en el sistema con el plan de acción acordado", "Envió un correo de seguimiento al directorio del laboratorio", "Solicitó al laboratorio que repitiera el análisis"], answer: "Documentó la consulta en el sistema con el plan de acción acordado" },
    { question: "¿Por qué el ID de 1.4 es más informativo que solo saber que el resultado fue 'inadecuado'?", options: ["No hay diferencia, ambos dicen lo mismo", "El ID cuantifica qué tan lejos está el resultado del límite y en qué dirección, facilitando la investigación", "El ID es menos informativo porque requiere cálculo matemático", "Solo el Z-escore es informativo; el ID solo indica adecuado o inadecuado"], answer: "El ID cuantifica qué tan lejos está el resultado del límite y en qué dirección, facilitando la investigación" },
    { question: "¿Qué es el valor alvo en el informe de Controllab?", options: ["El resultado del laboratorio en esa ronda", "La media (o mediana) de las respuestas del grupo de evaluación tras el tratamiento estadístico", "El valor esperado según el fabricante del reactivo", "El resultado del laboratorio de referencia designado"], answer: "La media (o mediana) de las respuestas del grupo de evaluación tras el tratamiento estadístico" },
    { question: "¿Por qué el laboratorio no debe comparar su resultado solo con el valor alvo sino también con la faja de evaluación?", options: ["Porque el valor alvo siempre es incorrecto", "Porque la faja de evaluación es el intervalo aceptable; el ID indica su posición dentro o fuera de ese intervalo", "Solo por exigencia del sistema online", "Porque el valor alvo no aparece en el informe impreso"], answer: "Porque la faja de evaluación es el intervalo aceptable; el ID indica su posición dentro o fuera de ese intervalo" },
  ],
  dictation: "El soporte técnico a clientes hispanohablantes de Controllab requiere explicar el Índice de Desvío y la faja de evaluación con claridad, calma y un plan de acción concreto.",
},
{
  id: "controllab-materiales", title: "Materiales de referencia", level: "Intermedio", category: "Controllab", emoji: "🧪",
  description: "Qué son, para qué sirven y cómo se usan los materiales de referencia certificados.",
  readingTitle: "El patrón que todo laboratorio necesita",
  reading: [
    "Un material de referencia es una sustancia o mezcla con propiedades suficientemente homogéneas y estables para ser usada en la calibración de equipos, la validación de métodos o el control de calidad del proceso analítico.",
    "Controllab produce y distribuye materiales de referencia certificados (MRC), acreditada por la Cgcre bajo el número PMR0009 desde agosto de 2016. Los MRC tienen un certificado especificando los valores de las propiedades junto con su incertidumbre de medición, determinados mediante procedimientos metrológicamente trazables.",
    "En el laboratorio clínico, los materiales de referencia se usan para tres propósitos principales: la calibración de los equipos analíticos, la validación de métodos y el control interno de calidad.",
    "La trazabilidad metrológica es el concepto que conecta el resultado de una medición con un patrón de referencia internacional a través de una cadena ininterrumpida de calibraciones. Cuando un laboratorio usa un material de referencia certificado trazable al SI, sus resultados son comparables con los de cualquier otro laboratorio del mundo.",
    "Los materiales de referencia de Controllab cubren matrices diversas: suero, plasma, orina, agua, alimentos, suelos y otros. La estabilidad del material durante el período de uso declarado en el certificado es un parámetro crítico que Controllab evalúa y garantiza.",
  ],
  vocab: [
    { es: "material de referencia certificado (MRC)", pt: "material de referência certificado (MRC)" },
    { es: "trazabilidad metrológica", pt: "rastreabilidade metrológica" },
    { es: "incertidumbre de medición", pt: "incerteza de medição" },
    { es: "calibración trazable", pt: "calibração rastreável" },
    { es: "comparabilidad de resultados", pt: "comparabilidade de resultados" },
    { es: "homogeneidad / estabilidad", pt: "homogeneidade / estabilidade" },
  ],
  quiz: [
    { question: "¿Qué es un material de referencia?", options: ["Un reactivo comercial de alta calidad", "Una sustancia con propiedades determinadas con alta precisión para calibración, validación o control de calidad", "Un estándar solo usado en investigación académica", "Un control de calidad interno sin certificación"], answer: "Una sustancia con propiedades determinadas con alta precisión para calibración, validación o control de calidad" },
    { question: "¿Bajo qué número está acreditada Controllab como Productora de Material de Referencia Certificado?", options: ["PEP003", "CAL0214", "PMR0009", "ISO 17034"], answer: "PMR0009" },
    { question: "¿Cuáles son los tres usos principales de los materiales de referencia?", options: ["Calibración, diagnóstico clínico y facturación", "Calibración de equipos, validación de métodos y control interno de calidad", "Solo calibración y validación de métodos", "Control interno, EA y certificación"], answer: "Calibración de equipos, validación de métodos y control interno de calidad" },
    { question: "¿Qué es la trazabilidad metrológica?", options: ["El registro histórico de todas las calibraciones del equipo", "La cadena ininterrumpida que conecta una medición con un patrón de referencia internacional", "El proceso de verificar que el material no está vencido", "El conjunto de normas que regulan el uso de materiales de referencia"], answer: "La cadena ininterrumpida que conecta una medición con un patrón de referencia internacional" },
    { question: "¿Por qué la trazabilidad es esencial para la comparabilidad de resultados?", options: ["Por exigencia burocrática de la norma únicamente", "Porque permite que los resultados de diferentes laboratorios sean comparables entre sí en todo el mundo", "Solo porque lo requieren los organismos acreditadores", "Porque reduce los costos de producción de los materiales"], answer: "Porque permite que los resultados de diferentes laboratorios sean comparables entre sí en todo el mundo" },
    { question: "¿Qué matrices cubren los materiales de referencia de Controllab?", options: ["Solo suero y plasma para laboratorio clínico", "Suero, plasma, orina, agua, alimentos, suelos y otras matrices", "Solo matrices de laboratorio clínico", "Solo matrices industriales sin aplicación clínica"], answer: "Suero, plasma, orina, agua, alimentos, suelos y otras matrices" },
    { question: "¿Qué parámetro crítico garantiza Controllab respecto a sus materiales?", options: ["La velocidad de entrega al laboratorio", "La estabilidad del material durante el período de uso declarado en el certificado", "El precio más bajo del mercado", "La cantidad mínima de viales por pedido"], answer: "La estabilidad del material durante el período de uso declarado en el certificado" },
    { question: "¿Qué diferencia a un MRC de un material de referencia sin certificar?", options: ["Solo el precio más alto del MRC", "El MRC tiene certificado con valores e incertidumbre determinados por procedimientos metrológicamente trazables", "El MRC es producido por organismos gubernamentales únicamente", "El MRC no requiere condiciones especiales de almacenamiento"], answer: "El MRC tiene certificado con valores e incertidumbre determinados por procedimientos metrológicamente trazables" },
  ],
  dictation: "Los materiales de referencia certificados de Controllab tienen trazabilidad metrológica y se usan para calibración, validación de métodos y control interno de calidad.",
},
{
  id: "controllab-perfil-resultados", title: "Perfil de Resultados de Controllab", level: "Intermedio", category: "Controllab", emoji: "📈",
  description: "Cómo leer e interpretar el Perfil de Resultados: gráficos, grupos comparativos y tendencias.",
  readingTitle: "Más allá del adecuado o inadecuado",
  reading: [
    "El Relatório de Avaliação informa si cada resultado fue adecuado o inadecuado y muestra el Índice de Desvío (ID). El Perfil de Resultados va más lejos: muestra el resultado del laboratorio en el contexto de todos los participantes del programa, permitiendo comparar el desempeño propio con el del grupo y visualizar tendencias a lo largo del tiempo.",
    "El Perfil de Resultados incluye el resumen estadístico del grupo comparativo: el valor designado (media o mediana robusta), la dispersión del grupo (desvío estándar o CV), el número de participantes y la distribución de los resultados. Esta información permite al laboratorio entender si su resultado, aunque adecuado, está cerca del límite o en el centro del grupo; y si un resultado inadecuado fue apenas por poco o estuvo muy alejado.",
    "Los grupos comparativos son fundamentales para interpretar el Perfil de Resultados correctamente. Controllab agrupa a los participantes por sistema analítico —fabricante del kit, método y equipo— antes de calcular el valor designado. Un resultado que parece alejado del promedio global puede estar perfectamente alineado con su grupo comparativo específico si usa un método con desplazamiento sistemático reconocido.",
    "La visualización de tendencias a lo largo de múltiples rondas es uno de los usos más valiosos del Perfil de Resultados. Si el ID de un ensayo se mantiene consistentemente positivo en varias rondas consecutivas —aunque siempre dentro del criterio de aceptación— eso indica un error sistemático leve que vale la pena investigar antes de que supere el límite. El Perfil de Resultados convierte datos de rondas individuales en una herramienta de gestión longitudinal.",
    "Una herramienta complementaria disponible en el Sistema Online es el gráfico de evolución histórica del ID, que muestra visualmente la trayectoria del laboratorio en cada ensaio a lo largo del año. Este gráfico es especialmente útil para detectar el momento exacto en que comenzó una desviación, correlacionarlo con cambios en el proceso —nuevo lote de reactivo, nueva calibración, cambio de equipo— y documentar la mejora después de implementar acciones correctivas.",
  ],
  vocab: [
    { es: "Perfil de Resultados", pt: "Perfil de Resultados" },
    { es: "grupo comparativo", pt: "grupo comparativo" },
    { es: "valor designado / mediana robusta", pt: "valor designado / mediana robusta" },
    { es: "dispersión del grupo (CV%)", pt: "dispersão do grupo (CV%)" },
    { es: "tendencia longitudinal", pt: "tendência longitudinal" },
    { es: "evolución histórica del ID", pt: "evolução histórica do ID" },
  ],
  quiz: [
    { question: "¿Qué información agrega el Perfil de Resultados respecto al Relatório de Avaliação?", options: ["Solo repite la información del Relatório con otro formato", "Muestra el resultado propio en el contexto del grupo completo y permite visualizar tendencias longitudinales", "Solo informa el resultado de los otros laboratorios sin comparación", "Solo está disponible para laboratorios con acreditación ISO 15189"], answer: "Muestra el resultado propio en el contexto del grupo completo y permite visualizar tendencias longitudinales" },
    { question: "¿Por qué es importante saber si un resultado adecuado está cerca del límite o en el centro del grupo?", options: ["No tiene ninguna importancia práctica si el resultado es adecuado", "Porque un resultado consistentemente cercano al límite puede indicar un error sistemático que merece investigación antes de cruzarlo", "Solo importa si el resultado es inadecuado", "Solo para decidir si cambiar de proveedor de reactivos"], answer: "Porque un resultado consistentemente cercano al límite puede indicar un error sistemático que merece investigación antes de cruzarlo" },
    { question: "¿Cómo agrupa Controllab a los participantes para calcular el valor designado?", options: ["Por país y región geográfica", "Por sistema analítico: fabricante del kit, método y equipo", "Por tamaño del laboratorio y volumen de muestras", "Por nivel de acreditación del laboratorio"], answer: "Por sistema analítico: fabricante del kit, método y equipo" },
    { question: "¿Por qué un resultado aparentemente alejado del promedio global puede ser correcto?", options: ["Porque los promedios globales siempre son incorrectos", "Porque puede estar alineado con su grupo comparativo específico, que usa un método con desplazamiento sistemático reconocido", "Solo si el laboratorio tiene acreditación vigente", "Porque Controllab permite un margen adicional para laboratorios pequeños"], answer: "Porque puede estar alineado con su grupo comparativo específico, que usa un método con desplazamiento sistemático reconocido" },
    { question: "¿Qué indica un ID consistentemente positivo en varias rondas consecutivas aunque siempre adecuado?", options: ["Que el proceso es excelente y estable", "Un error sistemático leve que vale investigar antes de que supere el límite de aceptación", "Que el sistema analítico tiene mayor precisión que el promedio", "Solo una variación aleatoria normal sin significado"], answer: "Un error sistemático leve que vale investigar antes de que supere el límite de aceptación" },
    { question: "¿Qué muestra el gráfico de evolución histórica del ID?", options: ["Solo los resultados inadecuados del año", "La trayectoria del ID del laboratorio en cada ensayo a lo largo del tiempo", "Solo la comparación con el grupo en la última ronda", "Solo el porcentaje de adecuados acumulado"], answer: "La trayectoria del ID del laboratorio en cada ensayo a lo largo del tiempo" },
    { question: "¿Para qué sirve correlacionar el momento de inicio de una desviación con cambios en el proceso?", options: ["Solo para justificar el resultado inadecuado ante el organismo acreditador", "Para identificar la causa probable del error sistemático y orientar la acción correctiva", "Solo para documentar el incidente en el sistema de calidad", "Solo si la desviación generó un resultado inadecuado"], answer: "Para identificar la causa probable del error sistemático y orientar la acción correctiva" },
    { question: "¿Qué es la mediana robusta y por qué la usa Controllab?", options: ["Es lo mismo que la media aritmética pero con otro nombre", "Es una medida de tendencia central que minimiza el impacto de valores atípicos (outliers), dando un valor designado más confiable", "Es el valor más frecuente entre todos los participantes", "Solo se usa cuando hay menos de 12 participantes en el grupo"], answer: "Es una medida de tendencia central que minimiza el impacto de valores atípicos (outliers), dando un valor designado más confiable" },
    { question: "¿Cómo documenta el laboratorio la mejora después de implementar acciones correctivas?", options: ["Solo en el registro de no conformidades interno", "Usando el gráfico de evolución histórica del ID para mostrar la trayectoria antes y después de la acción", "Solo mediante el Certificado de Proficiência del año siguiente", "Solo si el organismo acreditador lo solicita"], answer: "Usando el gráfico de evolución histórica del ID para mostrar la trayectoria antes y después de la acción" },
    { question: "¿Qué convierte al Perfil de Resultados en una herramienta de gestión y no solo de evaluación?", options: ["Que incluye el resultado de todos los laboratorios del país", "Que permite visualizar tendencias longitudinales y correlacionar desviaciones con cambios en el proceso", "Solo que está disponible en el Sistema Online de Controllab", "Solo que lo usa el organismo acreditador en las evaluaciones"], answer: "Que permite visualizar tendencias longitudinales y correlacionar desviaciones con cambios en el proceso" },
    { question: "¿Qué información del resumen estadístico del grupo es más útil para evaluar la calidad del grupo comparativo?", options: ["Solo el número de participantes", "El CV del grupo, que indica cuánta dispersión hay entre los laboratorios que usan el mismo método", "Solo el valor designado", "Solo el porcentaje de resultados adecuados del grupo"], answer: "El CV del grupo, que indica cuánta dispersión hay entre los laboratorios que usan el mismo método" },
    { question: "¿Por qué el Perfil de Resultados es especialmente útil para la preparación de auditorías?", options: ["Porque reemplaza los registros del control interno en las auditorías", "Porque provee evidencia objetiva del desempeño analítico histórico del laboratorio con tendencias visibles", "Solo si el laboratorio tuvo resultados inadecuados que explicar", "Solo para auditorías ISO 15189, no para auditorías internas"], answer: "Porque provee evidencia objetiva del desempeño analítico histórico del laboratorio con tendencias visibles" },
  ],
  dictation: "El Perfil de Resultados permite comparar el desempeño propio con el del grupo comparativo y detectar tendencias longitudinales en el ID antes de que generen un resultado inadecuado.",
},
{
  id: "vender-laboratorio",
  title: "Vender el laboratorio clínico",
  level: "Intermedio",
  category: "Ventas",
  emoji: "💼",
  description: "Cómo presentar el laboratorio a médicos y clientes con argumentos de valor concretos.",
  readingTitle: "No vendés análisis, vendés certeza diagnóstica",
  reading: [
    "Cuando un médico elige a qué laboratorio derivar a sus pacientes, no toma esa decisión basándose únicamente en el precio o la cercanía. Toma una decisión de confianza: ¿este laboratorio va a darme resultados en los que puedo apoyarme para tomar decisiones clínicas? La primera tarea del profesional que presenta el laboratorio a un cliente es entender que no está vendiendo análisis de sangre: está vendiendo certeza diagnóstica.",
    "La propuesta de valor de un laboratorio clínico de calidad se construye sobre tres pilares. El primero es la confiabilidad técnica: métodos validados, control interno diario, participación en programas de Ensayo de Aptitud externos, equipos calibrados y personal capacitado. El segundo es la disponibilidad y el tiempo de respuesta: resultados en los plazos prometidos, comunicación activa de valores críticos, acceso digital a informes. El tercero es el respaldo profesional: capacidad del equipo para responder consultas técnicas, interpretar resultados complejos y acompañar al médico en decisiones difíciles.",
    "Una presentación comercial efectiva no es un catálogo de servicios. Es una conversación sobre las necesidades del médico o del cliente. ¿Qué especialidades atiende? ¿Qué ensayos solicita con más frecuencia? ¿Ha tenido problemas con resultados de otros laboratorios? ¿Qué es lo que más valora en un laboratorio? Las respuestas a estas preguntas son el mapa para construir una presentación relevante.",
    "Los argumentos de valor deben ser concretos y verificables. No basta con decir 'somos un laboratorio de calidad': hay que mostrar qué certificaciones se tienen, qué programas de EA se realizan, qué indicadores de desempeño se monitorean. Un laboratorio acreditado bajo ISO 15189 o que participa regularmente en los programas de Controllab con resultados adecuados tiene evidencia objetiva de su calidad.",
    "El momento más poderoso de una visita comercial es cuando el profesional puede decir: 'Puedo mostrarle nuestros resultados en el Ensayo de Aptitud de los últimos doce meses.' Eso no es publicidad: es evidencia. Y la evidencia genera confianza de una forma que ningún folleto puede igualar.",
  ],
  vocab: [
    { es: "propuesta de valor", pt: "proposta de valor" },
    { es: "certeza diagnóstica", pt: "certeza diagnóstica" },
    { es: "confiabilidad técnica", pt: "confiabilidade técnica" },
    { es: "argumentos de valor", pt: "argumentos de valor" },
    { es: "visita comercial", pt: "visita comercial" },
    { es: "evidencia objetiva", pt: "evidência objetiva" },
  ],
  quiz: [
    { question: "¿Qué es lo que realmente decide un médico cuando elige un laboratorio?", options: ["Solo el precio más bajo del mercado", "Una decisión de confianza: si los resultados son confiables para tomar decisiones clínicas", "La cercanía geográfica al consultorio", "La cantidad de análisis disponibles en el catálogo"], answer: "Una decisión de confianza: si los resultados son confiables para tomar decisiones clínicas" },
    { question: "¿Cuáles son los tres pilares de la propuesta de valor de un laboratorio?", options: ["Precio, velocidad y atención al cliente", "Confiabilidad técnica, disponibilidad/tiempo de respuesta y respaldo profesional", "Equipos modernos, personal numeroso e instalaciones amplias", "Acreditación, publicidad y precio competitivo"], answer: "Confiabilidad técnica, disponibilidad/tiempo de respuesta y respaldo profesional" },
    { question: "¿Cómo debe estructurarse una presentación comercial efectiva?", options: ["Como un catálogo detallado de todos los servicios disponibles", "Como una conversación sobre las necesidades específicas del médico o cliente", "Con énfasis en los precios y descuentos disponibles", "Con datos técnicos avanzados para demostrar expertise"], answer: "Como una conversación sobre las necesidades específicas del médico o cliente" },
    { question: "¿Por qué 'somos un laboratorio de calidad' no es suficiente como argumento comercial?", options: ["Porque los médicos no valoran la calidad", "Porque es una afirmación vaga sin evidencia concreta verificable", "Porque es una frase demasiado corta", "Porque los competidores usan el mismo argumento"], answer: "Porque es una afirmación vaga sin evidencia concreta verificable" },
    { question: "¿Qué herramienta concreta convierte la calidad en evidencia verificable para un médico?", options: ["Un folleto con fotos del laboratorio", "Los resultados del Ensayo de Aptitud de los últimos doce meses", "Las opiniones de otros médicos clientes", "El catálogo de equipos con marcas y modelos"], answer: "Los resultados del Ensayo de Aptitud de los últimos doce meses" },
    { question: "¿Qué preguntas son clave para hacer al inicio de una visita comercial?", options: ["¿Cuánto está pagando actualmente? y ¿Cuántas muestras envía por semana?", "¿Qué especialidades atiende? ¿Qué ensayos solicita más? ¿Qué valora en un laboratorio?", "¿Cuántos pacientes tiene? y ¿Tiene convenio con algún laboratorio?", "¿Conoce nuestra empresa? y ¿Le interesa nuestro catálogo?"], answer: "¿Qué especialidades atiende? ¿Qué ensayos solicita más? ¿Qué valora en un laboratorio?" },
    { question: "¿Qué valor tiene comunicar activamente los resultados críticos como argumento de ventas?", options: ["Ninguno, es solo una obligación regulatoria", "Demuestra compromiso con la seguridad del paciente y la colaboración clínica con el médico", "Solo importa para médicos intensivistas", "Es un servicio extra que justifica cobrar más"], answer: "Demuestra compromiso con la seguridad del paciente y la colaboración clínica con el médico" },
    { question: "¿Qué diferencia a un profesional de ventas de laboratorio de un vendedor genérico?", options: ["Que conoce el catálogo de precios en detalle", "Que entiende el lenguaje clínico y puede hablar sobre calidad analítica con autoridad técnica", "Que tiene mayor experiencia en negociación comercial", "Que visita más médicos por semana"], answer: "Que entiende el lenguaje clínico y puede hablar sobre calidad analítica con autoridad técnica" },
    { question: "¿Cómo se convierte una objeción del médico ('ya tengo un laboratorio') en oportunidad?", options: ["Ignorándola y continuando la presentación", "Preguntando qué valora de ese laboratorio y dónde siente que podría mejorar", "Ofreciendo un precio más bajo inmediatamente", "Criticando al laboratorio competidor"], answer: "Preguntando qué valora de ese laboratorio y dónde siente que podría mejorar" },
    { question: "¿Por qué la evidencia de calidad genera más confianza que la publicidad?", options: ["Porque la publicidad está prohibida para laboratorios", "Porque la evidencia es objetiva y verificable; la publicidad es una afirmación unilateral", "Solo porque los médicos no ven publicidad", "Porque la publicidad es más costosa"], answer: "Porque la evidencia es objetiva y verificable; la publicidad es una afirmación unilateral" },
  ],
  dictation: "La propuesta de valor del laboratorio se construye con evidencia concreta: resultados del Ensayo de Aptitud, indicadores de calidad y capacidad técnica para acompañar al médico en decisiones difíciles.",
},

{
  id: "diferenciacion-competitiva",
  title: "Diferenciación competitiva",
  level: "Avanzado",
  category: "Ventas",
  emoji: "🏆",
  description: "Cómo identificar y comunicar lo que hace único al laboratorio frente a la competencia.",
  readingTitle: "¿Por qué yo y no el de enfrente?",
  reading: [
    "La diferenciación competitiva responde una sola pregunta: ¿por qué un médico, un hospital o un cliente debería elegirte a vos y no a otro laboratorio que ofrece aparentemente lo mismo? La trampa más frecuente es intentar diferenciarse en el precio. El precio puede ser una ventaja táctica de corto plazo, pero es la más frágil de todas: cualquier competidor puede bajar sus precios mañana. La diferenciación duradera se construye en dimensiones que son difíciles de copiar.",
    "Las dimensiones de diferenciación más sostenibles para un laboratorio clínico son la calidad certificada externamente, la velocidad con consistencia, la especialización técnica, el servicio de soporte profesional y la innovación. Una acreditación ISO 15189, por ejemplo, no es solo un certificado: es una señal creíble de que el laboratorio ha sometido su sistema de calidad a una evaluación externa rigurosa. Eso es difícil de fingir y difícil de copiar rápidamente.",
    "La especialización técnica es otra dimensión poderosa. Un laboratorio que tiene competencia comprobada en genómica, en coagulación avanzada o en anatomía patológica oncológica tiene un diferencial que un laboratorio generalista no puede igualar de un día para otro. Comunicar esa especialización con evidencia — publicaciones, participación en comités, casos resueltos — construye autoridad técnica.",
    "El servicio post-resultado es un diferencial frecuentemente subestimado. Muchos laboratorios entregan resultados y ahí termina el vínculo. Un laboratorio que tiene un equipo técnico disponible para responder consultas, que proactivamente llama cuando detecta un patrón clínico relevante, que envía alertas técnicas cuando cambia un método o un rango de referencia, está brindando un servicio que el médico percibe como valor agregado y que es difícil de replicar sin cultura y personal adecuados.",
    "Para comunicar el diferencial efectivamente, el profesional de ventas necesita dominar lo que se llama el 'elevator pitch': en noventa segundos o menos, ¿qué hace diferente a tu laboratorio? La respuesta debe incluir un hecho concreto, una consecuencia clínica o práctica para el médico, y una invitación a profundizar. 'Somos el único laboratorio de la región acreditado bajo ISO 15189. Eso significa que cuando le llega un resultado de nuestra parte, hay un sistema de control detrás que puede rastrearse completamente. ¿Le gustaría que le mostrara cómo funciona ese sistema?'",
  ],
  vocab: [
    { es: "diferenciación competitiva", pt: "diferenciação competitiva" },
    { es: "ventaja sostenible", pt: "vantagem sustentável" },
    { es: "autoridad técnica", pt: "autoridade técnica" },
    { es: "elevator pitch", pt: "elevator pitch" },
    { es: "valor agregado", pt: "valor agregado" },
    { es: "especialización técnica", pt: "especialização técnica" },
  ],
  quiz: [
    { question: "¿Por qué diferenciarse por precio es la estrategia más frágil?", options: ["Porque los médicos no toman decisiones por precio", "Porque cualquier competidor puede bajar sus precios mañana, eliminando esa ventaja", "Porque bajar el precio afecta la calidad", "Porque los laboratorios no pueden competir en precio por regulación"], answer: "Porque cualquier competidor puede bajar sus precios mañana, eliminando esa ventaja" },
    { question: "¿Cuáles son las dimensiones de diferenciación más sostenibles para un laboratorio?", options: ["Precio, ubicación y horarios extendidos", "Calidad certificada externamente, velocidad con consistencia, especialización técnica, soporte profesional e innovación", "Marca reconocida, publicidad y descuentos", "Equipos modernos, precio bajo y atención rápida"], answer: "Calidad certificada externamente, velocidad con consistencia, especialización técnica, soporte profesional e innovación" },
    { question: "¿Por qué la acreditación ISO 15189 es un diferencial difícil de copiar rápidamente?", options: ["Porque es muy cara para los competidores", "Porque requiere someter el sistema de calidad a una evaluación externa rigurosa que lleva tiempo y esfuerzo real", "Porque solo la puede tener un laboratorio por región", "Porque los evaluadores no la otorgan fácilmente por razones burocráticas"], answer: "Porque requiere someter el sistema de calidad a una evaluación externa rigurosa que lleva tiempo y esfuerzo real" },
    { question: "¿Qué hace que la especialización técnica sea un diferencial poderoso?", options: ["Que permite cobrar más por los análisis especializados", "Que un laboratorio generalista no puede igualarla de un día para otro", "Que atrae pacientes de otras regiones", "Que justifica tener más personal técnico"], answer: "Que un laboratorio generalista no puede igualarla de un día para otro" },
    { question: "¿Qué es el 'elevator pitch' y por qué es importante en ventas?", options: ["Un discurso largo y detallado sobre todos los servicios", "Una presentación de noventa segundos o menos que comunica el diferencial con un hecho concreto y una consecuencia práctica", "Un folleto de presentación del laboratorio", "Una reunión formal con el director del cliente"], answer: "Una presentación de noventa segundos o menos que comunica el diferencial con un hecho concreto y una consecuencia práctica" },
    { question: "¿Por qué el servicio post-resultado es un diferencial frecuentemente subestimado?", options: ["Porque no tiene impacto real en la satisfacción del médico", "Porque agrega valor visible al médico y es difícil de replicar sin cultura y personal adecuados", "Porque es muy costoso de implementar", "Solo es valorado por médicos especialistas"], answer: "Porque agrega valor visible al médico y es difícil de replicar sin cultura y personal adecuados" },
    { question: "¿Qué tres elementos debe incluir un elevator pitch efectivo sobre el diferencial del laboratorio?", options: ["Nombre, precio y ubicación", "Un hecho concreto, una consecuencia práctica para el médico y una invitación a profundizar", "Historia de la empresa, equipo y tecnología", "Certificaciones, precio y tiempo de respuesta"], answer: "Un hecho concreto, una consecuencia práctica para el médico y una invitación a profundizar" },
    { question: "¿Cómo se construye autoridad técnica en un área de especialización?", options: ["Solo con equipos de última generación", "Con evidencia: publicaciones, participación en comités científicos y casos clínicamente relevantes resueltos", "Con más personal técnico que los competidores", "Con certificaciones de los equipos analíticos"], answer: "Con evidencia: publicaciones, participación en comités científicos y casos clínicamente relevantes resueltos" },
    { question: "¿Cuál de estas afirmaciones es un diferencial bien comunicado?", options: ["'Somos el mejor laboratorio de la zona'", "'Somos el único laboratorio de la región acreditado ISO 15189; eso significa que cada resultado tiene un sistema de control trazable detrás'", "'Tenemos los equipos más modernos del mercado'", "'Nuestros precios son los más competitivos'"], answer: "'Somos el único laboratorio de la región acreditado ISO 15189; eso significa que cada resultado tiene un sistema de control trazable detrás'" },
    { question: "¿Qué diferencia a un diferencial real de uno que es fácilmente imitable?", options: ["El precio y la velocidad siempre son reales y difíciles de imitar", "Los diferenciales reales están basados en sistemas, cultura y evidencia que toman tiempo construir; los imitables son solo afirmaciones", "Los diferenciales basados en equipos son siempre los más reales", "No hay diferenciales imposibles de imitar en el largo plazo"], answer: "Los diferenciales reales están basados en sistemas, cultura y evidencia que toman tiempo construir; los imitables son solo afirmaciones" },
    { question: "¿Cómo se usa la participación en programas de EA de Controllab como argumento de diferenciación?", options: ["Solo para cumplir con requisitos regulatorios", "Como evidencia objetiva del desempeño analítico frente a otros laboratorios, mostrando los resultados concretos", "Solo ante auditorías de acreditación", "Como requisito para participar en licitaciones públicas"], answer: "Como evidencia objetiva del desempeño analítico frente a otros laboratorios, mostrando los resultados concretos" },
  ],
  dictation: "La diferenciación duradera no se construye en el precio sino en la calidad certificada, la especialización técnica y el servicio profesional que el cliente percibe como difícil de encontrar en otro lugar.",
},

{
  id: "objeciones-ventas",
  title: "Manejo de objeciones comerciales",
  level: "Intermedio",
  category: "Ventas",
  emoji: "🤺",
  description: "Cómo responder las objeciones más frecuentes al vender servicios del laboratorio.",
  readingTitle: "Una objeción es una pregunta disfrazada",
  reading: [
    "En ventas, una objeción no es un rechazo: es una señal de interés. Cuando un médico dice 'ya tengo un laboratorio con quien trabajo hace años', no está diciéndote que no te quiere escuchar; te está diciendo que tiene una relación establecida que necesita ser superada con argumentos sólidos. La diferencia entre un vendedor que se desanima ante las objeciones y uno que las aprovecha es que el segundo entiende que cada objeción revela lo que el cliente valora.",
    "Las objeciones más frecuentes en la venta de servicios de laboratorio clínico son cuatro. La objeción de precio ('sus análisis son más caros'). La objeción de relación ('ya tengo un laboratorio de confianza'). La objeción de comodidad ('los resultados llegan bien, no tengo motivo para cambiar'). La objeción de tiempo ('ahora no es el momento, estoy muy ocupado').",
    "Para la objeción de precio, la respuesta más efectiva no es bajar el precio: es redirigir la conversación hacia el valor. '¿Cuánto cuesta para usted y para su paciente recibir un resultado incorrecto que lleva a una decisión diagnóstica equivocada?' No es una pregunta retórica: es una invitación a pensar en el costo real de la no-calidad. Un laboratorio que participa en Ensayos de Aptitud externos y tiene resultados comprobados cobra lo que cobra porque tiene un sistema que lo respalda.",
    "Para la objeción de relación, la estrategia no es atacar al laboratorio actual sino hacer preguntas que abran espacio: '¿Hay algún tipo de análisis donde sienta que le gustaría tener más respaldo técnico?' o '¿Le ha ocurrido alguna vez que un resultado generó una duda y no supo bien a quién llamar?' Estas preguntas no critican al competidor; identifican una necesidad no cubierta.",
    "Para la objeción de tiempo, la respuesta es reducir la fricción: '¿Podría quedarme diez minutos solamente? No necesito más que eso para mostrarle una cosa concreta.' La clave es no pedir un compromiso grande desde el inicio: pedí una pequeña apertura, demostrá valor rápidamente y dejá que el cliente pida más.",
  ],
  vocab: [
    { es: "objeción comercial", pt: "objeção comercial" },
    { es: "redirigir la conversación", pt: "redirecionar a conversa" },
    { es: "costo de la no-calidad", pt: "custo da não qualidade" },
    { es: "necesidad no cubierta", pt: "necessidade não atendida" },
    { es: "reducir la fricción", pt: "reduzir a fricção" },
    { es: "argumento de cierre", pt: "argumento de fechamento" },
  ],
  quiz: [
    { question: "¿Por qué una objeción en ventas no es un rechazo?", options: ["Porque los médicos siempre aceptan eventualmente", "Porque es una señal de interés que revela lo que el cliente valora y qué necesita para decidir", "Porque las objeciones son solo tácticas de negociación de precio", "Porque el médico no tuvo tiempo de escuchar la propuesta completa"], answer: "Porque es una señal de interés que revela lo que el cliente valora y qué necesita para decidir" },
    { question: "¿Cuáles son las cuatro objeciones más frecuentes en venta de servicios de laboratorio?", options: ["Calidad, tecnología, personal y ubicación", "Precio, relación establecida, comodidad y tiempo", "Acreditación, horarios, distancia y catálogo", "Resultados, plazos, facturación y sistema digital"], answer: "Precio, relación establecida, comodidad y tiempo" },
    { question: "¿Cuál es la respuesta más efectiva ante la objeción de precio?", options: ["Bajar el precio inmediatamente para cerrar la venta", "Redirigir hacia el valor: el costo real de recibir un resultado incorrecto que lleva a una decisión diagnóstica equivocada", "Ofrecer un descuento por volumen", "Comparar el precio con otros laboratorios más caros"], answer: "Redirigir hacia el valor: el costo real de recibir un resultado incorrecto que lleva a una decisión diagnóstica equivocada" },
    { question: "¿Por qué no se debe atacar al laboratorio competidor al manejar la objeción de relación?", options: ["Porque es de mala educación hablar mal de los competidores", "Porque críticar al competidor no genera valor; identificar una necesidad no cubierta sí lo hace", "Porque el médico puede conocer personalmente al dueño del competidor", "Porque el competidor podría enterarse y reaccionar"], answer: "Porque críticar al competidor no genera valor; identificar una necesidad no cubierta sí lo hace" },
    { question: "¿Qué pregunta ayuda a identificar necesidades no cubiertas ante la objeción de relación?", options: ["'¿Sabe que ese laboratorio no está acreditado?'", "'¿Hay algún análisis donde sienta que le gustaría tener más respaldo técnico?'", "'¿Cuánto está pagando actualmente por ese servicio?'", "'¿Conoce todos los análisis que ofrecemos nosotros?'"], answer: "'¿Hay algún análisis donde sienta que le gustaría tener más respaldo técnico?'" },
    { question: "¿Cómo se maneja efectivamente la objeción de tiempo?", options: ["Insistiendo hasta que el médico acceda a una reunión larga", "Reduciendo la fricción: pidiendo solo diez minutos para mostrar algo concreto", "Enviando toda la información por correo sin reunirse", "Visitando al médico sin cita previa repetidamente"], answer: "Reduciendo la fricción: pidiendo solo diez minutos para mostrar algo concreto" },
    { question: "¿Qué revela la objeción 'los resultados llegan bien, no tengo motivo para cambiar'?", options: ["Que el médico está completamente satisfecho y no hay oportunidad", "Que el médico valora la consistencia y que la propuesta debe demostrar mayor valor sin interrumpir lo que ya funciona", "Que el precio es la única forma de entrar", "Que el médico no conoce los servicios del laboratorio"], answer: "Que el médico valora la consistencia y que la propuesta debe demostrar mayor valor sin interrumpir lo que ya funciona" },
    { question: "¿Cuál es la estrategia de cierre más efectiva después de manejar una objeción?", options: ["Pedir inmediatamente un compromiso grande de volumen", "Pedir una pequeña apertura, demostrar valor rápidamente y dejar que el cliente pida más", "Entregar toda la documentación técnica para que lo estudie", "Ofrecer un mes de servicio gratuito sin compromiso"], answer: "Pedir una pequeña apertura, demostrar valor rápidamente y dejar que el cliente pida más" },
    { question: "¿Qué significa redirigir la conversación hacia el valor en respuesta a una objeción de precio?", options: ["Hablar de las características técnicas de los equipos", "Cambiar el enfoque del costo del análisis al beneficio clínico y al riesgo de la no-calidad", "Explicar por qué los costos operativos del laboratorio son altos", "Comparar el precio con los honorarios médicos para contextualizar"], answer: "Cambiar el enfoque del costo del análisis al beneficio clínico y al riesgo de la no-calidad" },
    { question: "¿Cómo se usa el EA de Controllab para responder la objeción de precio?", options: ["Mostrando que el EA es caro y eso justifica el precio", "Mostrando que el precio incluye un sistema de calidad con evidencia objetiva de desempeño que no todos los laboratorios tienen", "Solo ante clientes que ya conocen el programa", "Solo cuando el médico pregunta específicamente por la calidad"], answer: "Mostrando que el precio incluye un sistema de calidad con evidencia objetiva de desempeño que no todos los laboratorios tienen" },
  ],
  dictation: "Ante la objeción de precio la respuesta más efectiva no es bajar el precio sino redirigir hacia el valor: el costo real de recibir un resultado incorrecto que lleva a una decisión diagnóstica equivocada.",
},

{
  id: "fidelizacion-clientes",
  title: "Fidelización de clientes del laboratorio",
  level: "Intermedio",
  category: "Comunicación",
  emoji: "🤝",
  description: "Estrategias para retener médicos y clientes institucionales a largo plazo.",
  readingTitle: "Conseguir un cliente es difícil. Perderlo es fácil.",
  reading: [
    "En el mercado de laboratorios clínicos, conseguir un nuevo cliente médico requiere esfuerzo, tiempo y recursos. Perderlo, en cambio, puede ocurrir por algo tan aparentemente pequeño como una llamada no devuelta a tiempo, un informe con un error que no fue comunicado proactivamente o la sensación de que el laboratorio no recuerda quién es ese médico ni cuáles son sus necesidades particulares. La fidelización es el conjunto de acciones que mantienen al cliente satisfecho, comprometido y con poca motivación para explorar alternativas.",
    "La fidelización no comienza después de la primera venta: comienza en el momento en que el médico envía su primera muestra. Ese primer contacto define la expectativa del cliente sobre cómo será tratado en el futuro. Un onboarding bien gestionado — con una bienvenida personalizada, una explicación clara de los procesos y un contacto técnico de referencia asignado — establece un estándar de relación que es difícil de abandonar.",
    "Los programas de seguimiento periódico son una herramienta concreta de fidelización. Una llamada mensual breve para preguntar si hay algo que el laboratorio pueda mejorar, el envío proactivo de actualizaciones técnicas relevantes para la especialidad del médico, o una reunión trimestral para revisar juntos los indicadores de desempeño del laboratorio: todas estas acciones comunican que el cliente no es un número sino una relación valorada.",
    "La resolución rápida y proactiva de problemas es uno de los factores más determinantes en la fidelización. Investigaciones en satisfacción de clientes muestran que un cliente cuya queja fue resuelta de forma rápida y satisfactoria tiene mayor lealtad que uno que nunca tuvo un problema. Eso significa que el modo en que el laboratorio responde ante un error puede convertirse en su mejor argumento de retención.",
    "En el mercado institucional — hospitales, clínicas, mutuales — la fidelización tiene una dimensión adicional: los interlocutores cambian. El jefe de laboratorio que firmó el contrato puede ser reemplazado. El médico de referencia puede cambiar de institución. Un laboratorio que construyó la relación solo con una persona es frágil ante esos cambios. La fidelización institucional requiere construir vínculos en múltiples niveles: técnico, administrativo y de liderazgo.",
  ],
  vocab: [
    { es: "fidelización / retención", pt: "fidelização / retenção" },
    { es: "onboarding del cliente", pt: "onboarding do cliente" },
    { es: "seguimiento periódico", pt: "acompanhamento periódico" },
    { es: "cliente institucional", pt: "cliente institucional" },
    { es: "indicadores de desempeño compartidos", pt: "indicadores de desempenho compartilhados" },
    { es: "contacto de referencia", pt: "contato de referência" },
  ],
  quiz: [
    { question: "¿Por qué perder un cliente puede ocurrir por razones aparentemente pequeñas?", options: ["Porque los clientes son irracionales en sus decisiones", "Porque la experiencia del cliente se construye en cada interacción, incluyendo las más pequeñas como responder una llamada", "Solo en clientes con poca lealtad de base", "Porque la competencia siempre ofrece precios más bajos"], answer: "Porque la experiencia del cliente se construye en cada interacción, incluyendo las más pequeñas como responder una llamada" },
    { question: "¿Cuándo comienza realmente la fidelización de un cliente?", options: ["Después de seis meses de relación consolidada", "Desde el primer contacto: el onboarding define la expectativa de cómo será tratado en el futuro", "Cuando el cliente renueva el contrato por primera vez", "Cuando el cliente recomienda el laboratorio a otro médico"], answer: "Desde el primer contacto: el onboarding define la expectativa de cómo será tratado en el futuro" },
    { question: "¿Qué debe incluir un buen onboarding de cliente?", options: ["Solo el envío del contrato firmado y el catálogo de precios", "Bienvenida personalizada, explicación clara de procesos y un contacto técnico de referencia asignado", "Una visita de cortesía sin contenido técnico específico", "El acceso al sistema digital de resultados"], answer: "Bienvenida personalizada, explicación clara de procesos y un contacto técnico de referencia asignado" },
    { question: "¿Qué tipo de programa de seguimiento contribuye a la fidelización?", options: ["Solo contacto cuando hay un problema o queja", "Llamadas periódicas, envío de actualizaciones técnicas relevantes y reuniones de revisión de desempeño", "Solo el envío mensual de facturas y estados de cuenta", "Solo cuando el contrato está por vencer"], answer: "Llamadas periódicas, envío de actualizaciones técnicas relevantes y reuniones de revisión de desempeño" },
    { question: "¿Qué revela la investigación sobre clientes cuyas quejas fueron resueltas satisfactoriamente?", options: ["Que presentan más quejas que los que nunca tuvieron problemas", "Que tienen mayor lealtad que clientes que nunca tuvieron un problema con el laboratorio", "Que eventualmente cambian de proveedor de todas formas", "Que solo son fieles si reciben descuentos compensatorios"], answer: "Que tienen mayor lealtad que clientes que nunca tuvieron un problema con el laboratorio" },
    { question: "¿Por qué la fidelización institucional requiere vínculos en múltiples niveles?", options: ["Porque las instituciones tienen más poder de negociación", "Porque los interlocutores cambian y una relación construida solo con una persona es frágil ante esos cambios", "Solo porque los contratos institucionales son más largos", "Porque las instituciones tienen más empleados a los que fidelizar"], answer: "Porque los interlocutores cambian y una relación construida solo con una persona es frágil ante esos cambios" },
    { question: "¿Cómo puede convertirse la resolución de un problema en un argumento de retención?", options: ["Ofreciendo crédito económico ante cada error", "Respondiendo de forma rápida, proactiva y satisfactoria, lo que genera más lealtad que si nunca hubiera ocurrido el problema", "Solo documentando el error en el sistema de calidad", "Solo si el médico reclama formalmente por escrito"], answer: "Respondiendo de forma rápida, proactiva y satisfactoria, lo que genera más lealtad que si nunca hubiera ocurrido el problema" },
    { question: "¿Qué mensaje comunican las acciones de seguimiento periódico al cliente?", options: ["Que el laboratorio necesita más volumen de muestras", "Que el cliente no es un número sino una relación valorada que merece atención continua", "Que el laboratorio tiene personal disponible para tareas adicionales", "Que el laboratorio quiere renovar el contrato"], answer: "Que el cliente no es un número sino una relación valorada que merece atención continua" },
  ],
  dictation: "La fidelización comienza en el primer contacto con el cliente y se construye en cada interacción: la resolución proactiva de problemas genera más lealtad que si nunca hubiera ocurrido un error.",
},

{
  id: "presentacion-calidad-clientes",
  title: "Comunicar calidad a clientes no técnicos",
  level: "Intermedio",
  category: "Ventas",
  emoji: "📊",
  description: "Cómo traducir la calidad analítica en lenguaje relevante para médicos, gestores y pacientes.",
  readingTitle: "La calidad que no se comunica no existe",
  reading: [
    "El laboratorio puede tener el sistema de calidad más robusto del mercado — acreditación ISO 15189, participación en doce programas de EA, controles internos diarios con reglas de Westgard — pero si esa calidad no se comunica de forma clara y relevante para cada interlocutor, no existe para ese cliente. La brecha más frecuente en la relación entre laboratorios y sus clientes es exactamente esa: un gap entre la calidad real del laboratorio y la calidad percibida por quienes lo contratan o derivan pacientes.",
    "El lenguaje de la calidad debe adaptarse radicalmente según el interlocutor. Con un médico especialista, podés hablar de Índice de Desvío, de trazabilidad metrológica y de especificaciones basadas en variación biológica. Con un gerente de compras de un hospital, el lenguaje relevante es el de riesgo operativo, costo de errores, cumplimiento regulatorio y continuidad del servicio. Con un paciente, la calidad se traduce en confianza: 'este análisis fue revisado dos veces antes de llegar a usted.'",
    "Las herramientas visuales son especialmente útiles para comunicar calidad a audiencias no técnicas. Un gráfico simple que muestra el porcentaje de adecuados en el EA del último año, una línea de tiempo de las acreditaciones obtenidas, o un certificado Controllab visible en la recepción del laboratorio comunican más que cinco páginas de texto técnico.",
    "El certificado de participación en programas de EA de Controllab es una herramienta de comunicación externa que los laboratorios frecuentemente subutilizan. Mostrarlo en reuniones con gestores hospitalarios, incluirlo en propuestas de servicios y exhibirlo en el laboratorio transforma un documento técnico en una señal de calidad comprensible para cualquier interlocutor.",
    "El marketing de calidad en el laboratorio no es publicidad vacía: es evidencia organizada. Un laboratorio que construye un dossier con sus indicadores de calidad, sus certificaciones, sus resultados en EA y sus indicadores de satisfacción de clientes tiene en sus manos el argumento comercial más poderoso que puede existir: la realidad bien documentada.",
  ],
  vocab: [
    { es: "calidad percibida vs. calidad real", pt: "qualidade percebida vs. qualidade real" },
    { es: "dossier de calidad", pt: "dossiê de qualidade" },
    { es: "marketing de calidad", pt: "marketing de qualidade" },
    { es: "lenguaje adaptado al interlocutor", pt: "linguagem adaptada ao interlocutor" },
    { es: "herramientas visuales de calidad", pt: "ferramentas visuais de qualidade" },
    { es: "señal de calidad", pt: "sinal de qualidade" },
  ],
  quiz: [
    { question: "¿Qué es el gap entre calidad real y calidad percibida en el laboratorio?", options: ["La diferencia entre los resultados del EA y los del control interno", "La brecha entre lo que el laboratorio realmente hace en calidad y lo que el cliente percibe o conoce de esa calidad", "El margen de error aceptable en los análisis de rutina", "La diferencia de precio entre laboratorios de distinta calidad"], answer: "La brecha entre lo que el laboratorio realmente hace en calidad y lo que el cliente percibe o conoce de esa calidad" },
    { question: "¿Cómo debe traducirse la calidad para un gerente de compras de un hospital?", options: ["Con términos técnicos como CVi y CVg para demostrar expertise", "En lenguaje de riesgo operativo, costo de errores, cumplimiento regulatorio y continuidad del servicio", "Con una explicación detallada del sistema de control interno", "Con el catálogo completo de análisis disponibles"], answer: "En lenguaje de riesgo operativo, costo de errores, cumplimiento regulatorio y continuidad del servicio" },
    { question: "¿Cómo se traduce la calidad para un paciente?", options: ["Con el número de análisis que se procesan por día", "En confianza concreta: 'este análisis fue revisado antes de llegar a usted'", "Con las certificaciones técnicas del laboratorio en detalle", "Con los nombres de los equipos analíticos utilizados"], answer: "En confianza concreta: 'este análisis fue revisado antes de llegar a usted'" },
    { question: "¿Por qué las herramientas visuales son más efectivas que el texto técnico para comunicar calidad?", options: ["Porque los clientes no tienen tiempo para leer", "Porque comunican la información de forma comprensible e impactante para audiencias sin formación técnica específica", "Porque son más baratas de producir", "Porque los reguladores exigen materiales visuales"], answer: "Porque comunican la información de forma comprensible e impactante para audiencias sin formación técnica específica" },
    { question: "¿Qué es un dossier de calidad y para qué sirve comercialmente?", options: ["Un archivo interno de procedimientos del sistema de calidad", "Un documento con indicadores de calidad, certificaciones, resultados de EA y satisfacción de clientes que funciona como argumento comercial", "El manual de calidad del laboratorio para auditorías", "El registro histórico de no conformidades del año"], answer: "Un documento con indicadores de calidad, certificaciones, resultados de EA y satisfacción de clientes que funciona como argumento comercial" },
    { question: "¿Cómo puede el certificado de Controllab usarse como herramienta comercial?", options: ["Solo debe conservarse en el archivo del sistema de calidad", "Mostrándolo en reuniones, incluyéndolo en propuestas y exhibiéndolo visiblemente en el laboratorio como señal de calidad", "Solo ante organismos reguladores y auditores", "Solo en propuestas para hospitales públicos"], answer: "Mostrándolo en reuniones, incluyéndolo en propuestas y exhibiéndolo visiblemente en el laboratorio como señal de calidad" },
    { question: "¿Qué hace que el marketing de calidad sea diferente de la publicidad convencional?", options: ["Que es más costoso y elaborado", "Que está basado en evidencia real documentada, no en afirmaciones sin respaldo", "Que solo se dirige a médicos, no a pacientes", "Que requiere aprobación de los organismos reguladores"], answer: "Que está basado en evidencia real documentada, no en afirmaciones sin respaldo" },
    { question: "¿Qué ocurre cuando un laboratorio tiene alta calidad real pero baja calidad percibida?", options: ["Los clientes descubren la calidad con el tiempo y la relación mejora sola", "El laboratorio pierde oportunidades comerciales porque el cliente no puede valorar lo que no conoce ni percibe", "Solo afecta la imagen, no los resultados económicos", "La situación solo se corrige con una reducción de precios"], answer: "El laboratorio pierde oportunidades comerciales porque el cliente no puede valorar lo que no conoce ni percibe" },
    { question: "¿Cuál es el argumento comercial más poderoso que puede tener un laboratorio?", options: ["El precio más competitivo del mercado", "La realidad bien documentada: evidencia organizada de calidad, desempeño y satisfacción", "La tecnología más moderna disponible", "El mayor número de análisis en catálogo"], answer: "La realidad bien documentada: evidencia organizada de calidad, desempeño y satisfacción" },
  ],
  dictation: "La calidad que no se comunica no existe para el cliente: un dossier con indicadores de desempeño, certificaciones y resultados del Ensayo de Aptitud es el argumento comercial más poderoso del laboratorio.",
},
{
  id: "controllab-investigacion", title: "Investigar un resultado inadecuado", level: "Avanzado", category: "Controllab", emoji: "🔍",
  description: "Cómo estructurar la investigación de un resultado inadecuado en el EA y usar los Questionários Ilustrados.",
  readingTitle: "Un inadecuado es una pregunta, no solo una mala noticia",
  reading: [
    "Recibir un resultado inadecuado en el Ensayo de Aptitud no es el final del proceso: es el comienzo de una investigación. Un laboratorio que registra el inadecuado, archiva el informe y sigue con su rutina sin investigar la causa pierde la oportunidad más valiosa que ofrece el EA: entender exactamente dónde está la falla y corregirla antes de que afecte a los pacientes.",
    "La investigación de un resultado inadecuado sigue la misma lógica que cualquier análisis de causa raíz. El primer paso es caracterizar el error: ¿el ID es positivo o negativo? ¿Es un error de imprecisión (aleatorio) o de inexactitud (sistemático)? ¿Afecta a un solo ítem del panel o a varios analitos relacionados? ¿Es consistente con resultados inadecuados anteriores en el mismo ensayo o es la primera vez? Responder estas preguntas orienta hacia la causa probable.",
    "Las causas más frecuentes de un resultado inadecuado en el EA incluyen: error en la selección del sistema analítico al reportar (se ingresó un método incorrecto en el Sistema Online); error preanalítico en el manejo del material del EA (temperatura inadecuada, reconstitución incorrecta, contaminación); falla del equipo o calibración desactualizada; lote de reactivo con problema; y error de transcripción al ingresar el resultado.",
    "Los Questionários Ilustrados de Controllab son una herramienta educativa que complementa la investigación. Disponibles en el Sistema Online, presentan casos clínicos reales con imágenes —morfología hematológica, parasitología, microbiología, anatomía patológica— junto con preguntas de interpretación. No generan puntuación en el programa de EA, pero son una fuente de formación continua que el laboratorio puede usar para identificar brechas de conocimiento en el equipo técnico, especialmente en ensayos cualitativos donde el criterio morfológico es central.",
    "El cierre formal de la investigación requiere un registro documentado que incluya: el resultado inadecuado y su ID, la causa identificada, las acciones correctivas implementadas y la evidencia de mejora en rondas posteriores. Este registro es parte del sistema de calidad del laboratorio y puede ser solicitado en auditorías de acreditación como evidencia del uso efectivo del EA como herramienta de mejora continua.",
  ],
  vocab: [
    { es: "resultado inadecuado (I)", pt: "resultado inadequado (I)" },
    { es: "investigación de causa raíz del EA", pt: "investigação de causa raiz do EP" },
    { es: "error de imprecisión vs. inexactitud", pt: "erro de imprecisão vs. inexatidão" },
    { es: "Questionários Ilustrados", pt: "Questionários Ilustrados" },
    { es: "cierre documentado de la investigación", pt: "encerramento documentado da investigação" },
    { es: "evidencia de mejora en rondas posteriores", pt: "evidência de melhora em rondas posteriores" },
  ],
  quiz: [
    { question: "¿Qué debe hacer el laboratorio al recibir un resultado inadecuado en el EA?", options: ["Archivar el informe y esperar la próxima ronda", "Iniciar una investigación de causa raíz para identificar y corregir la falla antes de que afecte pacientes", "Contactar a Controllab para solicitar una nueva muestra", "Solo documentarlo en el registro de no conformidades sin más análisis"], answer: "Iniciar una investigación de causa raíz para identificar y corregir la falla antes de que afecte pacientes" },
    { question: "¿Qué preguntas orientan la caracterización del error en la investigación?", options: ["Solo si el material del EA llegó en buenas condiciones", "Si el ID es positivo o negativo, si es aleatorio o sistemático, cuántos ítems afecta y si es recurrente", "Solo si el control interno del mismo período estaba adecuado", "Solo cuánto se alejó el resultado del valor designado"], answer: "Si el ID es positivo o negativo, si es aleatorio o sistemático, cuántos ítems afecta y si es recurrente" },
    { question: "¿Qué indica un ID positivo en un resultado inadecuado?", options: ["Que el resultado fue más bajo que el valor designado", "Que el resultado fue más alto que el valor designado, superando el límite superior del criterio", "Que el error es aleatorio", "Que el sistema analítico fue ingresado incorrectamente"], answer: "Que el resultado fue más alto que el valor designado, superando el límite superior del criterio" },
    { question: "¿Cuál es una causa frecuente de resultado inadecuado que no refleja un problema real del proceso analítico?", options: ["Una calibración desactualizada", "Seleccionar un sistema analítico incorrecto al reportar el resultado en el Sistema Online", "Un lote de reactivo con problema", "Una temperatura inadecuada durante el análisis"], answer: "Seleccionar un sistema analítico incorrecto al reportar el resultado en el Sistema Online" },
    { question: "¿Qué son los Questionários Ilustrados de Controllab?", options: ["Exámenes obligatorios para mantener la inscripción en el programa de EA", "Una herramienta educativa con casos clínicos e imágenes para formación continua del equipo técnico", "El manual de instrucciones del Sistema Online", "Los formularios de inscripción en los programas especiales"], answer: "Una herramienta educativa con casos clínicos e imágenes para formación continua del equipo técnico" },
    { question: "¿Los Questionários Ilustrados generan puntuación en el programa de EA?", options: ["Sí, cuentan para el porcentaje de adecuados anual", "No, son una herramienta educativa opcional sin impacto en la puntuación del programa", "Solo si el laboratorio los realiza dentro del plazo de la ronda", "Solo para los programas de hemoterapia y microbiología"], answer: "No, son una herramienta educativa opcional sin impacto en la puntuación del programa" },
    { question: "¿Para qué tipo de ensayos son especialmente útiles los Questionários Ilustrados?", options: ["Solo para ensayos cuantitativos de bioquímica", "Para ensayos cualitativos donde el criterio morfológico es central: hematología, parasitología, microbiología, anatomía patológica", "Solo para laboratorios que tuvieron resultados inadecuados", "Solo para el personal que recién ingresa al laboratorio"], answer: "Para ensayos cualitativos donde el criterio morfológico es central: hematología, parasitología, microbiología, anatomía patológica" },
    { question: "¿Qué debe incluir el cierre documentado de la investigación?", options: ["Solo el resultado inadecuado y la fecha", "El resultado inadecuado, el ID, la causa identificada, las acciones correctivas y la evidencia de mejora posterior", "Solo la acción correctiva implementada", "Solo si el organismo acreditador lo solicita formalmente"], answer: "El resultado inadecuado, el ID, la causa identificada, las acciones correctivas y la evidencia de mejora posterior" },
    { question: "¿Cómo demuestra el laboratorio mejora tras implementar una acción correctiva por un inadecuado?", options: ["Solo actualizando el procedimiento escrito", "Mostrando resultados adecuados en rondas posteriores del mismo ensayo, visibles en el Perfil de Resultados", "Solo con una nota del director técnico en el sistema de calidad", "Solo si la acción correctiva fue validada por Controllab"], answer: "Mostrando resultados adecuados en rondas posteriores del mismo ensayo, visibles en el Perfil de Resultados" },
    { question: "¿Por qué el registro de la investigación puede ser solicitado en una auditoría de acreditación?", options: ["Solo por requisito formal sin valor real", "Porque demuestra que el laboratorio usa el EA efectivamente como herramienta de mejora continua, no solo como evaluación", "Solo si el laboratorio tuvo más de tres inadecuados en el año", "Solo en auditorías de renovación, no en las de mantenimiento"], answer: "Porque demuestra que el laboratorio usa el EA efectivamente como herramienta de mejora continua, no solo como evaluación" },
    { question: "¿Qué diferencia hay entre un error de imprecisión y uno de inexactitud en el contexto de un inadecuado?", options: ["Son lo mismo expresado de forma diferente", "El error de imprecisión indica variabilidad del método; el de inexactitud indica desplazamiento sistemático respecto al valor verdadero", "El error de inexactitud siempre es más grave que el de imprecisión", "Solo el error sistemático aparece en el EA, no el aleatorio"], answer: "El error de imprecisión indica variabilidad del método; el de inexactitud indica desplazamiento sistemático respecto al valor verdadero" },
    { question: "¿Cuándo conviene revisar el manejo del material del EA como posible causa de inadecuado?", options: ["Solo cuando el control interno del mismo día también falló", "Siempre, porque errores preanalíticos como temperatura inadecuada o reconstitución incorrecta pueden generar resultados falsos", "Solo si el material llegó visiblemente dañado", "Solo si es el primer inadecuado del año en ese ensayo"], answer: "Siempre, porque errores preanalíticos como temperatura inadecuada o reconstitución incorrecta pueden generar resultados falsos" },
  ],
  dictation: "Un resultado inadecuado en el EA debe investigarse sistemáticamente: caracterizar el error, identificar la causa raíz, implementar una acción correctiva y documentar la mejora en rondas posteriores.",
},
{
  id: "controllab-programas-especiales", title: "Programas especiales de Controllab", level: "Intermedio", category: "Controllab", emoji: "🧫",
  description: "Hemoterapia, veterinaria, microbiología y otros programas especializados de Controllab.",
  readingTitle: "La calidad más allá del laboratorio clínico general",
  reading: [
    "Controllab no solo atiende al laboratorio clínico de bioquímica y hematología de rutina: ofrece programas de Ensayo de Aptitud para una variedad de segmentos especializados, cada uno con sus propias particularidades técnicas, materiales específicos y criterios de evaluación adaptados. Conocer estos programas permite al profesional de Controllab comunicarlos con precisión a sus clientes hispanohablantes.",
    "El programa de hemoterapia es uno de los más críticos. Evalúa ensayos como la tipificación del Sistema ABO y del Sistema Rhesus, la Prova Cruzada (prueba de compatibilidad), la pesquisa de anticuerpos irregulares y los ensayos de biología molecular como el NAT (Nucleic Acid Test) para detección de HIV, HCV y HBV en donantes de sangre. Para estos ensayos, el grau de desempenho mínimo es del 100%: un solo resultado inadecuado en cualquiera de ellos genera evaluación insatisfactoria para el año, dado el riesgo clínico que representa un error en la seguridad transfusional.",
    "El programa de microbiología abarca la identificación de microorganismos, el antibiograma (teste de susceptibilidade a antimicrobianos), la detección de mecanismos de resistencia y la microbiología de alimentos y agua. Los materiales enviados incluyen cepas en diferentes formas de presentación: lâminas coradas, suspensões, meios de cultura e cepas ATCC. La evaluación combina critérios qualitativos —identificación correcta del microorganismo— con critérios de performance en el antibiograma.",
    "El programa de veterinaria es el único de su tipo en Latinoamérica, dirigido a laboratorios que realizan análisis clínicos en animales. Incluye ensayos de hematología, bioquímica y urianálisis con materiales e intervalos de referencia adaptados a las especies más frecuentes: bovinos, caninos, felinos y equinos. La participación en este programa es un diferencial importante para laboratorios veterinarios que buscan demostrar calidad analítica a sus clientes.",
    "Otros programas especializados incluyen el de análisis físico-químicas de agua y alimentos, el de tuberculosis (baciloscopia e identificación de Mycobacterium), el de leche humana para bancos de leche, y el programa vigiRAM de vigilancia de resistencia antimicrobiana. Cada uno responde a una necesidad específica del sistema de salud y contribuye a que Controllab sea el proveedor de EA de referencia para la diversidad de laboratorios que existen en Brasil y Latinoamérica.",
  ],
  vocab: [
    { es: "hemoterapia / seguridad transfusional", pt: "hemoterapia / segurança transfusional" },
    { es: "Sistema ABO / Sistema Rhesus", pt: "Sistema ABO / Sistema Rhesus" },
    { es: "antibiograma / resistencia antimicrobiana", pt: "antibiograma / resistência antimicrobiana" },
    { es: "cepa ATCC / cepa clínica", pt: "cepa ATCC / cepa clínica" },
    { es: "NAT (Nucleic Acid Test)", pt: "NAT (Teste de Ácido Nucleico)" },
    { es: "programa vigiRAM", pt: "programa vigiRAM" },
  ],
  quiz: [
    { question: "¿Por qué el grau de desempeño mínimo en hemoterapia es del 100%?", options: ["Porque los materiales de hemoterapia son más fáciles de analizar", "Porque un error en tipificación o compatibilidad representa un riesgo directo para la vida del receptor de sangre", "Solo por exigencia de la ANVISA sin base clínica", "Porque los laboratorios de hemoterapia tienen más recursos"], answer: "Porque un error en tipificación o compatibilidad representa un riesgo directo para la vida del receptor de sangre" },
    { question: "¿Qué ensayos incluye el programa de hemoterapia de Controllab?", options: ["Solo la tipificación ABO", "ABO, Rhesus, Prova Cruzada, pesquisa de anticuerpos irregulares y NAT para HIV, HCV y HBV", "Solo los ensayos de biología molecular NAT", "Solo los ensayos de compatibilidad y anticuerpos"], answer: "ABO, Rhesus, Prova Cruzada, pesquisa de anticuerpos irregulares y NAT para HIV, HCV y HBV" },
    { question: "¿Qué es el NAT en el contexto de la seguridad transfusional?", options: ["Un tipo de control de calidad interno para hemoterapia", "El Nucleic Acid Test: ensayo de biología molecular para detectar material genético de HIV, HCV y HBV en donantes", "Una prueba de compatibilidad cruzada entre donante y receptor", "El nombre del programa de hemoterapia de Controllab"], answer: "El Nucleic Acid Test: ensayo de biología molecular para detectar material genético de HIV, HCV y HBV en donantes" },
    { question: "¿Qué evalúa el programa de microbiología además de la identificación del microorganismo?", options: ["Solo la identificación de especie y género", "El antibiograma y la detección de mecanismos de resistencia antimicrobiana", "Solo la morfología de las colonias en cultivo", "Solo ensayos de biología molecular"], answer: "El antibiograma y la detección de mecanismos de resistencia antimicrobiana" },
    { question: "¿En qué formas de presentación pueden llegar los materiales del programa de microbiología?", options: ["Solo en cultivos en caldo", "Láminas teñidas, suspensiones, medios de cultivo y cepas ATCC", "Solo cepas liofilizadas en tubos sellados", "Solo en agar sangre listo para usar"], answer: "Láminas teñidas, suspensiones, medios de cultivo y cepas ATCC" },
    { question: "¿Qué hace único al programa de veterinaria de Controllab en Latinoamérica?", options: ["Que tiene el mayor número de participantes de la región", "Que es el único programa de EA para laboratorios de análisis clínicos veterinarios en Latinoamérica", "Que usa los mismos materiales que el programa clínico humano", "Que tiene requisito de 100% de adecuados como hemoterapia"], answer: "Que es el único programa de EA para laboratorios de análisis clínicos veterinarios en Latinoamérica" },
    { question: "¿Qué especies animales contempla el programa de veterinaria de Controllab?", options: ["Solo caninos y felinos", "Bovinos, caninos, felinos y equinos, entre las más frecuentes", "Solo animales de producción: bovinos, porcinos y aves", "Solo animales de compañía: caninos y felinos"], answer: "Bovinos, caninos, felinos y equinos, entre las más frecuentes" },
    { question: "¿Qué es el programa vigiRAM?", options: ["Un programa de vigilancia de reacciones adversas a medicamentos", "Un programa de vigilancia de resistencia antimicrobiana en microorganismos de laboratorios clínicos", "Un programa de control de calidad para antibióticos hospitalarios", "El programa de hemoterapia orientado a la seguridad transfusional"], answer: "Un programa de vigilancia de resistencia antimicrobiana en microorganismos de laboratorios clínicos" },
    { question: "¿Para qué laboratorios está dirigido el programa de leche humana de Controllab?", options: ["Para laboratorios clínicos pediátricos en general", "Para bancos de leche humana que realizan análisis de calidad de la leche donada", "Para laboratorios de nutrición hospitalaria", "Para laboratorios veterinarios que trabajan con bovinos lecheros"], answer: "Para bancos de leche humana que realizan análisis de calidad de la leche donada" },
    { question: "¿Por qué la participación en el programa de veterinaria es un diferencial para un laboratorio veterinario?", options: ["Solo porque reduce los costos operativos del laboratorio", "Porque demuestra a sus clientes que el desempeño analítico fue evaluado externamente con un estándar de calidad reconocido", "Solo porque es obligatorio por la legislación veterinaria", "Solo para laboratorios universitarios de investigación"], answer: "Porque demuestra a sus clientes que el desempeño analítico fue evaluado externamente con un estándar de calidad reconocido" },
    { question: "¿Qué consecuencia tiene un único resultado inadecuado en un ensayo de hemoterapia crítico?", options: ["Genera una alerta pero no afecta el Certificado de Proficiência", "Genera evaluación insatisfactoria para el año completo en ese programa por el riesgo clínico que representa", "Solo requiere una investigación adicional sin consecuencias en la puntuación", "Solo afecta si el laboratorio tiene menos de 80% de adecuados en total"], answer: "Genera evaluación insatisfactoria para el año completo en ese programa por el riesgo clínico que representa" },
    { question: "¿Cómo adapta Controllab los intervalos de referencia en el programa de veterinaria?", options: ["Usa los mismos intervalos que para humanos", "Los adapta a cada especie animal, ya que los valores normales de hematología y bioquímica varían entre bovinos, caninos, felinos y equinos", "Solo los adapta para bovinos, usando humanos como referencia para las demás especies", "No usa intervalos de referencia en veterinaria, solo critérios cualitativos"], answer: "Los adapta a cada especie animal, ya que los valores normales de hematología y bioquímica varían entre bovinos, caninos, felinos y equinos" },
  ],
  dictation: "El programa de hemoterapia de Controllab exige el cien por ciento de resultados adecuados porque un error en tipificación o compatibilidad representa un riesgo directo para la seguridad transfusional.",
},
{
  id: "controllab-variacion-biologica", title: "Variación biológica y especificaciones", level: "Avanzado", category: "Controllab", emoji: "🧬",
  description: "CVI, CVG y cómo Controllab usa la variación biológica para definir los límites de sus programas.",
  readingTitle: "Por qué los límites de Controllab son los que son",
  reading: [
    "Una pregunta frecuente entre los participantes de los programas de Controllab es: ¿por qué el límite de evaluación para determinado ensayo es ese porcentaje y no otro? La respuesta está, en muchos casos, en la variación biológica. Los límites del programa de EA de Controllab para ensayos cuantitativos se basan en especificaciones de calidad derivadas de criterios clínicos o de variación biológica, siguiendo la jerarquía propuesta por la Conferencia de Estocolmo (1999).",
    "La variación biológica describe la fluctuación natural de un analito en el organismo humano. La variación biológica intra-individual (CVi) es la variación de un analito dentro del mismo individuo a lo largo del tiempo, en condiciones estables. La variación biológica inter-individual (CVg) es la variación entre distintos individuos de una población. Ambas son características biológicas inherentes a cada analito, independientes del método analítico.",
    "A partir de CVi y CVg se calculan tres niveles de especificación de calidad analítica: la especificación deseable, la mínima y la óptima. Para el error total deseable, la fórmula es: ETdeseable = 1.65 × (0.5 × CVi) + 0.5 × √(CVi² + CVg²). Para la imprecisión deseable: CVdeseable < 0.5 × CVi. Para la inexactitud deseable: |bias| < 0.25 × √(CVi² + CVg²). Estos valores están publicados en la base de datos de Ricós y colaboradores, referencia internacional para las especificaciones basadas en variación biológica.",
    "En la práctica del programa de Controllab, cuando el límite de evaluación de un ensayo se basa en variación biológica, ese límite es independiente del desempeño promedio del mercado: es una exigencia clínica objetiva. Esto significa que si la tecnología disponible aún no puede cumplir con esa especificación, el límite señala una brecha de calidad real que el mercado debe esforzarse por cerrar, no un criterio que deba flexibilizarse para que más laboratorios puedan aprobarlo.",
    "Para el equipo de Controllab, conocer este fundamento es esencial para comunicarlo a los participantes hispanohablantes. Cuando un director técnico pregunta por qué su laboratorio obtuvo un inadecuado con un ID de apenas 1.1, la respuesta requiere explicar no solo el cálculo del ID sino la base clínica del límite: el límite no es arbitrario, está anclado en la variación biológica del analito y en el impacto clínico que tiene un error de esa magnitud en la toma de decisiones médicas.",
  ],
  vocab: [
    { es: "variación biológica intra-individual (CVi)", pt: "variação biológica intraindividual (CVi)" },
    { es: "variación biológica inter-individual (CVg)", pt: "variação biológica interindividual (CVg)" },
    { es: "especificación deseable / mínima / óptima", pt: "especificação desejável / mínima / ótima" },
    { es: "error total deseable (ETd)", pt: "erro total desejável (ETd)" },
    { es: "base de datos de Ricós", pt: "banco de dados de Ricós" },
    { es: "límite basado en variación biológica", pt: "limite baseado em variação biológica" },
  ],
  quiz: [
    { question: "¿En qué se basan los límites de evaluación de los programas cuantitativos de Controllab?", options: ["En el desempeño promedio de los participantes del año anterior", "En especificaciones de calidad derivadas de criterios clínicos o de variación biológica, siguiendo la jerarquía de Estocolmo", "En los límites que define la ANVISA para cada analito", "En el desempeño de los mejores laboratorios del grupo"], answer: "En especificaciones de calidad derivadas de criterios clínicos o de variación biológica, siguiendo la jerarquía de Estocolmo" },
    { question: "¿Qué es la variación biológica intra-individual (CVi)?", options: ["La variación del analito entre distintos individuos de una población", "La fluctuación natural de un analito dentro del mismo individuo a lo largo del tiempo en condiciones estables", "El coeficiente de variación del método analítico en el laboratorio", "La variación del analito debida a errores preanalíticos"], answer: "La fluctuación natural de un analito dentro del mismo individuo a lo largo del tiempo en condiciones estables" },
    { question: "¿Qué es la variación biológica inter-individual (CVg)?", options: ["La variación del analito en el mismo individuo en distintos momentos del día", "La variación de un analito entre distintos individuos de una población", "La variación generada por distintos métodos analíticos para el mismo analito", "La variación del analito según la edad y el sexo del paciente"], answer: "La variación de un analito entre distintos individuos de una población" },
    { question: "¿Cuál es la especificación de imprecisión deseable basada en variación biológica?", options: ["CV < CVi", "CV < 0.5 × CVi", "CV < 0.25 × CVi", "CV < CVg"], answer: "CV < 0.5 × CVi" },
    { question: "¿Cuál es la referencia internacional más usada para las especificaciones basadas en variación biológica?", options: ["La norma ISO 15189 edición 2022", "La base de datos de Ricós y colaboradores, publicada y actualizada periódicamente", "Los límites definidos por la CLIA en Estados Unidos", "Los criterios del grupo de trabajo de la IFCC"], answer: "La base de datos de Ricós y colaboradores, publicada y actualizada periódicamente" },
    { question: "¿Qué significa que el límite de Controllab sea independiente del desempeño promedio del mercado?", options: ["Que Controllab lo define arbitrariamente sin base científica", "Que es una exigencia clínica objetiva que no se flexibiliza aunque el promedio del mercado no la alcance", "Que solo aplica a laboratorios acreditados por ISO 15189", "Que cambia cada año según los resultados del grupo"], answer: "Que es una exigencia clínica objetiva que no se flexibiliza aunque el promedio del mercado no la alcance" },
    { question: "¿Por qué un límite basado en variación biológica puede señalar una brecha de calidad real?", options: ["Porque siempre es más exigente que cualquier tecnología disponible", "Porque refleja lo que clínicamente se necesita, y si la tecnología no llega, es la tecnología la que debe mejorar", "Solo para ensayos donde no existe variación biológica publicada", "Solo para laboratorios de alta complejidad"], answer: "Porque refleja lo que clínicamente se necesita, y si la tecnología no llega, es la tecnología la que debe mejorar" },
    { question: "¿Qué información necesita el equipo de Controllab para explicar un inadecuado con ID de 1.1?", options: ["Solo el cálculo matemático del ID", "El cálculo del ID y la base clínica del límite: por qué ese porcentaje de error impacta en la decisión médica", "Solo que el resultado superó el límite del programa", "Solo el valor designado y el resultado del laboratorio"], answer: "El cálculo del ID y la base clínica del límite: por qué ese porcentaje de error impacta en la decisión médica" },
    { question: "¿Los tres niveles de especificación (deseable, mínima, óptima) son siempre iguales para un mismo analito?", options: ["Sí, son fijos e independientes del contexto", "No, la mínima es menos exigente que la deseable y la óptima es más exigente, adaptándose al desempeño tecnológico disponible", "Solo difieren para analitos con alta variación biológica inter-individual", "Solo difieren en el componente de inexactitud, no en el de imprecisión"], answer: "No, la mínima es menos exigente que la deseable y la óptima es más exigente, adaptándose al desempeño tecnológico disponible" },
    { question: "¿Qué ocurre si el programa de EA usara como límite el desempeño promedio del mercado en lugar de la variación biológica?", options: ["Los resultados serían siempre más exigentes", "El límite consolidaría el desempeño actual sin estimular mejora, y podría aceptar errores clínicamente significativos si todos los laboratorios los cometen", "Solo cambiaría el porcentaje de adecuados del grupo", "No habría ninguna diferencia práctica para los participantes"], answer: "El límite consolidaría el desempeño actual sin estimular mejora, y podría aceptar errores clínicamente significativos si todos los laboratorios los cometen" },
    { question: "¿Por qué CVi y CVg son independientes del método analítico?", options: ["Porque los fabricantes de reactivos los definen para cada método", "Porque son características biológicas inherentes al analito en el organismo humano, no del proceso de medición", "Solo para analitos estables como el sodio y el potasio", "Porque el organismo compensa cualquier variación del método analítico"], answer: "Porque son características biológicas inherentes al analito en el organismo humano, no del proceso de medición" },
    { question: "¿Qué componentes se suman para calcular el error total deseable según la fórmula de variación biológica?", options: ["Solo el componente de imprecisión", "El componente de imprecisión (basado en CVi) y el componente de inexactitud (basado en CVi y CVg combinados)", "Solo el componente de inexactitud basado en CVg", "El coeficiente de variación del control interno y el error sistemático del EA"], answer: "El componente de imprecisión (basado en CVi) y el componente de inexactitud (basado en CVi y CVg combinados)" },
  ],
  dictation: "Los límites de los programas cuantitativos de Controllab se basan en variación biológica: la imprecisión deseable es menor al cincuenta por ciento del CVi del analito.",
},
{
  id: "viaje-aeropuerto",
  title: "Aeropuerto, aduana y transporte",
  level: "Básico",
  category: "Viajes",
  emoji: "✈️",
  description: "Vocabulario y diálogos para el aeropuerto, la aduana y el transporte al llegar a un país hispanohablante.",
  readingTitle: "El primer español del viaje",
  reading: [
    "El viaje de un colaborador de Controllab a un país hispanohablante comienza mucho antes de la primera reunión de negocios. Comienza en el aeropuerto, en la fila de migraciones, en el mostrador de aduana y en el taxi o remís hacia el hotel. Esos primeros momentos en español determinan el tono del viaje y son la primera prueba del idioma en condiciones reales.",
    "En migraciones, el agente puede hacerle preguntas básicas al viajero: '¿Cuál es el motivo de su visita?' — La respuesta correcta es: 'Vengo por motivos de negocios. Tengo reuniones con clientes de laboratorio clínico.' O: 'Asisto a un congreso de calidad analítica.' '¿Cuántos días va a permanecer en el país?' — 'Tres días. Regreso el jueves.' '¿Tiene algo que declarar?' — 'No, solo equipaje personal y materiales de trabajo.'",
    "En la aduana, si el colaborador lleva materiales de referencia o kits de demostración de Controllab, es importante tener la documentación en orden y saber explicar con claridad qué son: 'Son materiales de referencia para laboratorio clínico. Tengo la documentación técnica aquí.' Llevar una carta de la empresa en español puede facilitar mucho ese momento.",
    "Para el transporte desde el aeropuerto, las expresiones más útiles son: '¿Dónde puedo tomar un taxi oficial?' — '¿Cuánto cuesta aproximadamente ir al centro?' — '¿Acepta tarjeta de crédito?' — 'Me puede llevar a este hotel, por favor.' — 'Necesito un recibo, por favor.' En muchos países hispanohablantes existe la aplicación Uber o equivalentes locales; preguntar en el aeropuerto sobre la opción más segura es siempre una buena práctica.",
    "Una diferencia cultural importante: en algunos países como Argentina o Uruguay, el taxista espera que conversen durante el trayecto. En otros contextos, el silencio es más habitual. Observar el tono del conductor y adaptarse es una pequeña muestra de inteligencia cultural que genera buena impresión desde el primer momento del viaje.",
  ],
  vocab: [
    { es: "migraciones / aduana", pt: "imigração / alfândega" },
    { es: "motivo de visita", pt: "motivo da visita" },
    { es: "equipaje / maleta de mano", pt: "bagagem / mala de mão" },
    { es: "taxi / remís / aplicación de transporte", pt: "táxi / transfer / aplicativo de transporte" },
    { es: "recibo / comprobante", pt: "recibo / comprovante" },
    { es: "materiales de trabajo", pt: "materiais de trabalho" },
  ],
  quiz: [
    { question: "¿Cómo se responde correctamente a '¿Cuál es el motivo de su visita?' en migraciones?", options: ["'Soy turista, vengo a conocer el país'", "'Vengo por motivos de negocios, tengo reuniones con clientes de laboratorio clínico'", "'Trabajo para una empresa brasileña'", "'Vine a visitar amigos y también tengo algunas reuniones'"], answer: "'Vengo por motivos de negocios, tengo reuniones con clientes de laboratorio clínico'" },
    { question: "¿Qué es importante tener listo si se llevan materiales de Controllab en el equipaje?", options: ["Solo el pasaporte y el ticket de vuelta", "La documentación técnica de los materiales y una carta de la empresa en español", "El catálogo de precios de Controllab", "El contrato con el cliente que se va a visitar"], answer: "La documentación técnica de los materiales y una carta de la empresa en español" },
    { question: "¿Qué se debe pedir siempre al tomar un taxi para propósitos de viaje de trabajo?", options: ["El número de licencia del conductor", "Un recibo o comprobante del viaje", "El nombre del taxista y su teléfono", "La ruta exacta que va a tomar"], answer: "Un recibo o comprobante del viaje" },
    { question: "¿Cómo se dice 'tengo solo equipaje personal y materiales de trabajo' en aduana?", options: ["'No traigo nada importante'", "'Solo equipaje personal y materiales de trabajo, sin productos comerciales'", "'Tengo ropa y una computadora'", "'Todo es para uso personal'"], answer: "'Solo equipaje personal y materiales de trabajo, sin productos comerciales'" },
    { question: "¿Qué diferencia cultural menciona el texto respecto al trayecto en taxi?", options: ["Que en todos los países hispanohablantes el taxista habla mucho", "Que en algunos países como Argentina se espera conversación durante el trayecto; en otros el silencio es más habitual", "Que en ningún país hispanohablante se habla con el taxista", "Que solo en España los taxistas son conversadores"], answer: "Que en algunos países como Argentina se espera conversación durante el trayecto; en otros el silencio es más habitual" },
    { question: "¿Cuántos días permanece el viajero según el ejemplo del texto?", options: ["Dos días, regresa el miércoles", "Tres días, regresa el jueves", "Una semana completa", "Solo un día de reuniones"], answer: "Tres días, regresa el jueves" },
    { question: "¿Qué pregunta es útil hacer en el aeropuerto antes de tomar transporte?", options: ["'¿Dónde está el restaurante más cercano?'", "'¿Cuál es la opción de transporte más segura hacia el centro?'", "'¿A qué hora cierra el aeropuerto?'", "'¿Dónde puedo cambiar dinero?'"], answer: "'¿Cuál es la opción de transporte más segura hacia el centro?'" },
    { question: "¿Por qué adaptarse al tono del conductor del taxi es una muestra de inteligencia cultural?", options: ["Porque es una obligación de cortesía en todos los países", "Porque demuestra capacidad de observar y adaptarse al contexto local, generando buena impresión desde el inicio del viaje", "Porque el conductor puede ser un cliente potencial", "Solo porque es incómodo viajar en silencio"], answer: "Porque demuestra capacidad de observar y adaptarse al contexto local, generando buena impresión desde el inicio del viaje" },
  ],
  dictation: "Vengo por motivos de negocios: tengo reuniones con clientes de laboratorio clínico durante tres días y regreso el jueves.",
},

{
  id: "viaje-hotel",
  title: "Hotel y check-in",
  level: "Básico",
  category: "Viajes",
  emoji: "🏨",
  description: "Vocabulario y situaciones para el check-in, servicios del hotel y situaciones cotidianas durante el alojamiento.",
  readingTitle: "La habitación que no estaba lista",
  reading: [
    "Llegar al hotel después de un vuelo largo y encontrar que la habitación no está lista, que la reserva no aparece en el sistema o que el cuarto asignado no tiene las condiciones necesarias para trabajar son situaciones que ocurren. Saber manejarse en español en esos momentos con calma y claridad es una habilidad práctica muy valiosa.",
    "Las frases más importantes para el check-in son: 'Tengo una reserva a nombre de...' — 'Mi empresa es Controllab, es posible que la reserva esté a nombre de la empresa.' — '¿A qué hora es el check-out?' — '¿El desayuno está incluido?' — 'Necesito una habitación tranquila porque tengo reuniones de trabajo mañana temprano.' — '¿Tienen sala de reuniones disponible para mañana?'",
    "Si hay un problema con la reserva: '¿Podría verificar nuevamente? La reserva fue confirmada por correo electrónico.' — 'Tengo el número de confirmación aquí: es el 4471-B.' — 'Entiendo que hay un inconveniente. ¿Cuál sería la solución posible?' Esta última frase es especialmente útil: en lugar de quejarse, redirige la conversación hacia la solución.",
    "Durante la estadía, las situaciones más frecuentes son: necesitar más toallas o almohadas ('¿Podría enviarme más toallas a la habitación 304, por favor?'), reportar un problema técnico ('El aire acondicionado no funciona, ¿pueden revisarlo?'), pedir el servicio de lavandería ('¿Tienen servicio de lavandería exprés? Necesito la ropa para mañana a las ocho.') y pedir la factura correcta para reembolso ('Necesito la factura a nombre de Controllab, con CNPJ, para rendir gastos.').",
    "Un detalle importante para el colaborador en viaje de negocios: siempre pedir la factura completa con los datos de la empresa al hacer el check-out. En muchos países hispanohablantes, corregir una factura después de emitida es un proceso complicado. Mejor pedirla bien desde el inicio.",
  ],
  vocab: [
    { es: "check-in / check-out", pt: "check-in / check-out" },
    { es: "reserva / número de confirmación", pt: "reserva / número de confirmação" },
    { es: "habitación / cuarto", pt: "quarto / habitação" },
    { es: "factura / comprobante de pago", pt: "nota fiscal / comprovante de pagamento" },
    { es: "servicio de lavandería", pt: "serviço de lavanderia" },
    { es: "rendir gastos / reembolso", pt: "prestar contas / reembolso" },
  ],
  quiz: [
    { question: "¿Cómo se dice que la reserva puede estar a nombre de la empresa?", options: ["'No sé cómo está la reserva'", "'Es posible que la reserva esté a nombre de Controllab, mi empresa'", "'Mi jefe hizo la reserva, no sé los detalles'", "'Busque bajo el nombre del hotel'"], answer: "'Es posible que la reserva esté a nombre de Controllab, mi empresa'" },
    { question: "¿Qué frase redirige un problema hacia la solución en lugar de solo quejarse?", options: ["'Esto es inaceptable, quiero hablar con el gerente'", "'Entiendo que hay un inconveniente. ¿Cuál sería la solución posible?'", "'Ya pagué, tienen la obligación de darme la habitación'", "'¿Por qué no verificaron antes?'"], answer: "'Entiendo que hay un inconveniente. ¿Cuál sería la solución posible?'" },
    { question: "¿Qué información necesita el colaborador al pedir la factura del hotel?", options: ["Solo el precio total de la estadía", "La factura a nombre de Controllab con los datos fiscales de la empresa para rendir gastos", "El nombre del recepcionista que hizo el check-in", "Solo el comprobante de tarjeta de crédito"], answer: "La factura a nombre de Controllab con los datos fiscales de la empresa para rendir gastos" },
    { question: "¿Por qué es importante pedir la factura correcta al momento del check-out?", options: ["Porque es obligatorio por ley en todos los países", "Porque corregir una factura después de emitida es complicado en muchos países hispanohablantes", "Solo porque el departamento de contabilidad lo exige", "Porque el hotel puede cobrar un cargo extra después"], answer: "Porque corregir una factura después de emitida es complicado en muchos países hispanohablantes" },
    { question: "¿Cómo se pide servicio de lavandería con urgencia?", options: ["'Necesito lavar ropa'", "'¿Tienen servicio de lavandería exprés? Necesito la ropa para mañana a las ocho'", "'¿Pueden lavar mi ropa hoy?'", "'La ropa está sucia, necesito ayuda'"], answer: "'¿Tienen servicio de lavandería exprés? Necesito la ropa para mañana a las ocho'" },
    { question: "¿Qué se debe mencionar al hacer el check-in si se necesita trabajar temprano?", options: ["El horario del desayuno", "'Necesito una habitación tranquila porque tengo reuniones de trabajo mañana temprano'", "El número de vuelo de llegada", "El nombre del cliente que se va a visitar"], answer: "'Necesito una habitación tranquila porque tengo reuniones de trabajo mañana temprano'" },
    { question: "¿Cómo se reporta un problema técnico en la habitación?", options: ["Llamando directamente a mantenimiento sin avisar a recepción", "'El aire acondicionado no funciona, ¿pueden revisarlo por favor?'", "'Quiero cambiar de habitación inmediatamente'", "'Esto no debería pasar en un hotel de esta categoría'"], answer: "'El aire acondicionado no funciona, ¿pueden revisarlo por favor?'" },
    { question: "¿Qué información se puede usar si la reserva no aparece en el sistema?", options: ["Solo el nombre completo del viajero", "El número de confirmación de la reserva y el correo electrónico de confirmación", "El precio que se pagó por la reserva", "El nombre del proveedor de viajes corporativos"], answer: "El número de confirmación de la reserva y el correo electrónico de confirmación" },
  ],
  dictation: "Tengo una reserva a nombre de Controllab; necesito la factura completa con los datos de la empresa para rendir gastos al regresar.",
},

{
  id: "viaje-reuniones-presenciales",
  title: "Reuniones y presentaciones presenciales",
  level: "Intermedio",
  category: "Viajes",
  emoji: "🤝",
  description: "Cómo conducirse en reuniones presenciales en países hispanohablantes: llegada, presentación, negociación y cierre.",
  readingTitle: "La reunión de las diez",
  reading: [
    "Una reunión presencial en un país hispanohablante tiene matices que una videollamada no tiene. El saludo inicial, la forma de intercambiar tarjetas, el tiempo dedicado a la conversación informal antes de entrar en materia, y el lenguaje no verbal son dimensiones que comunican tanto como las palabras. Llegar preparado para esas dimensiones marca la diferencia entre un profesional que 'habla español' y uno que sabe 'trabajar en español'.",
    "Al llegar a la reunión: 'Buenos días, soy Lucas Ferreira de Controllab Brasil. Tengo una reunión con el Dr. Mendoza a las diez.' Si llega unos minutos antes, es habitual esperar sin mostrar impaciencia. En muchos países hispanohablantes, comenzar la reunión exactamente a la hora acordada no siempre es la norma; cinco o diez minutos de demora son culturalmente aceptables en contextos no formales.",
    "El saludo: en la mayoría de los países hispanohablantes de América Latina, el saludo profesional es el apretón de manos firme con contacto visual. En contextos más distendidos o con personas conocidas, el beso en la mejilla es habitual entre personas de distinto sexo y en algunos países entre hombres también. Seguir el ejemplo del anfitrión es siempre la estrategia más segura.",
    "Durante la reunión, algunas frases clave: 'Permítame presentarme brevemente...' — 'Les traje materiales sobre nuestros programas...' — 'Si me permiten, quisiera mostrarles esto...' — 'Tienen alguna pregunta sobre este punto antes de continuar?' — 'Tomo nota de eso para consultarlo con mi equipo.' — 'Me comprometería a enviarles esa información antes del viernes.'",
    "Al cerrar la reunión: '¿Cuál sería el siguiente paso desde su lado?' — 'Quedo a disposición para cualquier consulta.' — '¿A quién debo dirigirme para coordinar lo que acordamos hoy?' — 'Fue un placer conocerlos. Espero que podamos avanzar juntos.' Siempre confirmar por correo electrónico los acuerdos de la reunión dentro de las veinticuatro horas: eso demuestra seriedad y compromiso.",
  ],
  vocab: [
    { es: "apretón de manos / saludo formal", pt: "aperto de mão / cumprimento formal" },
    { es: "anfitrión / sede de la reunión", pt: "anfitrião / sede da reunião" },
    { es: "entrar en materia", pt: "entrar no assunto" },
    { es: "tomo nota / me comprometo a", pt: "anoto / me comprometo a" },
    { es: "siguiente paso / próximos pasos", pt: "próximo passo / próximos passos" },
    { es: "confirmar por correo / hacer seguimiento", pt: "confirmar por e-mail / fazer follow-up" },
  ],
  quiz: [
    { question: "¿Cómo se presenta un colaborador de Controllab al llegar a una reunión?", options: ["'Hola, soy de Controllab'", "'Buenos días, soy Lucas Ferreira de Controllab Brasil. Tengo una reunión con el Dr. Mendoza a las diez'", "'Buenos días, vine por el tema del laboratorio'", "'Hola, ¿está el doctor? Quedamos en reunirnos hoy'"], answer: "'Buenos días, soy Lucas Ferreira de Controllab Brasil. Tengo una reunión con el Dr. Mendoza a las diez'" },
    { question: "¿Cuál es la estrategia más segura para el saludo en una reunión en América Latina?", options: ["Siempre dar el beso en la mejilla para ser cercano", "Dar siempre solo el apretón de manos en cualquier contexto", "Seguir el ejemplo del anfitrión y adaptarse al tono de cada situación", "Saludar solo con un gesto de cabeza para evitar incomodidad"], answer: "Seguir el ejemplo del anfitrión y adaptarse al tono de cada situación" },
    { question: "¿Qué se debe hacer dentro de las 24 horas después de una reunión?", options: ["Llamar al cliente para preguntar si quedó conforme", "Confirmar por correo electrónico los acuerdos de la reunión", "Enviar la propuesta comercial definitiva", "Esperar a que el cliente tome la iniciativa"], answer: "Confirmar por correo electrónico los acuerdos de la reunión" },
    { question: "¿Qué frase demuestra compromiso sin prometer algo que no se puede cumplir de inmediato?", options: ["'Le digo ahora mismo la respuesta'", "'Me comprometería a enviarles esa información antes del viernes'", "'Vemos cómo seguimos'", "'Mi equipo se va a encargar de eso'"], answer: "'Me comprometería a enviarles esa información antes del viernes'" },
    { question: "¿Cómo se cierra una reunión preguntando por los próximos pasos?", options: ["'¿Entonces firmamos hoy?'", "'¿Cuál sería el siguiente paso desde su lado?'", "'¿Cuándo me llaman para confirmar?'", "'¿Están interesados o no?'"], answer: "'¿Cuál sería el siguiente paso desde su lado?'" },
    { question: "¿Qué significa 'entrar en materia' en el contexto de una reunión?", options: ["Comenzar a hablar del tema central de la reunión después de la conversación inicial", "Traer materiales físicos a la reunión", "Presentar los datos técnicos del laboratorio", "Llegar exactamente a la hora acordada"], answer: "Comenzar a hablar del tema central de la reunión después de la conversación inicial" },
    { question: "¿Qué comunica la demora de 5-10 minutos en muchos contextos latinoamericanos?", options: ["Falta de respeto hacia el visitante", "Es culturalmente aceptable en contextos no formales y no debe interpretarse como descortesía", "Que la reunión fue cancelada sin aviso", "Que el anfitrión no está interesado en la reunión"], answer: "Es culturalmente aceptable en contextos no formales y no debe interpretarse como descortesía" },
    { question: "¿Qué frase se usa para verificar comprensión durante la presentación?", options: ["'¿Entendieron todo?'", "'¿Tienen alguna pregunta sobre este punto antes de continuar?'", "'¿Queda claro o necesitan que repita?'", "'¿Están siguiendo la presentación?'"], answer: "'¿Tienen alguna pregunta sobre este punto antes de continuar?'" },
    { question: "¿Por qué confirmar los acuerdos por correo demuestra seriedad?", options: ["Porque el correo tiene valor legal en todos los países", "Porque crea un registro escrito de lo acordado y muestra compromiso con el seguimiento", "Solo porque el cliente lo exige", "Porque permite corregir malentendidos antes de la próxima reunión"], answer: "Porque crea un registro escrito de lo acordado y muestra compromiso con el seguimiento" },
  ],
  dictation: "Al cerrar la reunión siempre preguntar cuál es el siguiente paso y confirmar los acuerdos por correo electrónico dentro de las veinticuatro horas.",
},

{
  id: "viaje-restaurantes-cotidiano",
  title: "Restaurantes y vida cotidiana",
  level: "Básico",
  category: "Viajes",
  emoji: "🍽️",
  description: "Vocabulario para restaurantes, compras, conversación informal y situaciones cotidianas durante el viaje.",
  readingTitle: "La cena de trabajo",
  reading: [
    "Una cena de trabajo en un restaurante es, en muchos países hispanohablantes, una parte fundamental del proceso de construcción de la relación con el cliente. No es solo comer: es el espacio donde la conversación se vuelve más personal, donde el cliente habla de su familia, de su ciudad, de lo que le gusta y lo que no, y donde el visitante tiene la oportunidad de mostrarse como persona además de como representante de Controllab.",
    "En el restaurante, las frases más útiles son: 'Una mesa para dos, por favor.' — '¿Nos puede recomendar algo típico de la región?' — '¿Cuál es el plato del día?' — 'Sin mariscos, por favor, tengo alergia.' — '¿La cuenta, por favor?' — '¿Está incluido el servicio?' — 'Voy a invitar yo, es un placer.' En muchos países hispanohablantes, quien invita a la cena de negocios paga la cuenta; intentar dividir la cuenta puede ser interpretado como un gesto extraño en ese contexto.",
    "Durante la cena de trabajo, los temas de conversación informal más seguros son: la ciudad visitada ('Es la primera vez que vengo a esta ciudad, ¿qué me recomendaría visitar?'), el trabajo del cliente sin entrar en detalles técnicos de ventas, el deporte local si el contexto lo permite, y la gastronomía local. Los temas a evitar en una primera cena de trabajo son la política local, la religión y las comparaciones desfavorables con Brasil.",
    "Para las compras cotidianas: '¿Dónde hay una farmacia cerca?' — '¿Acepta dólares / euros?' — '¿Tiene cambio de cincuenta?' — '¿Cuánto cuesta este artículo?' — '¿Puedo pagar con tarjeta?' — 'Me da un recibo, por favor.' En muchos países, el regateo no es habitual en tiendas establecidas pero sí en mercados y ferias.",
    "Una diferencia lingüística importante para el colaborador brasileño: en España y gran parte de América Latina, 'coger' tiene connotaciones vulgares en varios países como México y Argentina. Usar 'tomar' es siempre más seguro: 'voy a tomar el metro', 'tomo un taxi', en lugar de 'voy a coger el metro'.",
  ],
  vocab: [
    { es: "la cuenta / propina / servicio incluido", pt: "a conta / gorjeta / serviço incluído" },
    { es: "el plato del día / menú del día", pt: "o prato do dia / menu executivo" },
    { es: "invitar / pagar la cuenta", pt: "convidar / pagar a conta" },
    { es: "farmacia / cambio de dinero", pt: "farmácia / troco" },
    { es: "tomar (en lugar de coger)", pt: "pegar / tomar" },
    { es: "regateo / precio fijo", pt: "pechincha / preço fixo" },
  ],
  quiz: [
    { question: "¿Qué se debe usar en lugar de 'coger' para evitar malentendidos en México y Argentina?", options: ["'Agarrar'", "'Tomar'", "'Llevar'", "'Usar'"], answer: "'Tomar'" },
    { question: "¿Qué significa 'voy a invitar yo' en el contexto de una cena de trabajo?", options: ["Que el colaborador va a invitar a más personas a unirse", "Que el colaborador va a pagar la cuenta de la cena", "Que el cliente debe elegir el restaurante", "Que la empresa va a reembolsar la cena a todos"], answer: "Que el colaborador va a pagar la cuenta de la cena" },
    { question: "¿Qué tema es más seguro para la conversación en una primera cena de trabajo?", options: ["La política local del país visitado", "La ciudad visitada y recomendaciones turísticas", "Las comparaciones entre Brasil y el país visitado", "Los detalles de la propuesta comercial de Controllab"], answer: "La ciudad visitada y recomendaciones turísticas" },
    { question: "¿Cómo se pregunta si el servicio está incluido en la cuenta?", options: ["'¿Hay que dejar propina?'", "'¿Está incluido el servicio?'", "'¿Cuánto es la propina normal aquí?'", "'¿El mozo cobró bien?'"], answer: "'¿Está incluido el servicio?'" },
    { question: "¿En qué contexto es habitual el regateo en países hispanohablantes?", options: ["En todos los comercios como norma general", "En mercados y ferias, pero no en tiendas establecidas", "Solo en países con alta inflación", "En ningún contexto, el precio siempre es fijo"], answer: "En mercados y ferias, pero no en tiendas establecidas" },
    { question: "¿Qué pregunta es útil para conectar con el cliente en la cena?", options: ["'¿Cuántos análisis procesa su laboratorio por día?'", "'Es la primera vez que vengo aquí, ¿qué me recomendaría visitar?'", "'¿Cuánto tiempo lleva trabajando en este laboratorio?'", "'¿Está conforme con su proveedor actual de EA?'"], answer: "'Es la primera vez que vengo aquí, ¿qué me recomendaría visitar?'" },
    { question: "¿Qué significa que la cena de trabajo es 'parte del proceso de construcción de la relación'?", options: ["Que las decisiones comerciales se toman siempre en cenas, no en reuniones formales", "Que es un espacio para conocerse como personas y construir confianza más allá de la relación comercial", "Que el cliente espera ser invitado a cenar antes de firmar cualquier contrato", "Que la cena reemplaza a la reunión formal en muchos países"], answer: "Que es un espacio para conocerse como personas y construir confianza más allá de la relación comercial" },
    { question: "¿Cómo se informa una alergia alimentaria al pedir en un restaurante?", options: ["'No me gusta el marisco'", "'Sin mariscos por favor, tengo alergia'", "'¿Hay algo sin marisco en el menú?'", "'Prefiero comer sin mariscos'"], answer: "'Sin mariscos por favor, tengo alergia'" },
  ],
  dictation: "En una cena de trabajo quien invita paga la cuenta; los temas más seguros son la ciudad visitada, la gastronomía local y el trabajo del cliente sin entrar en detalles técnicos de ventas.",
},

{
  id: "viaje-emergencias",
  title: "Emergencias y situaciones imprevistas",
  level: "Intermedio",
  category: "Viajes",
  emoji: "🚨",
  description: "Cómo manejar emergencias, imprevistos y situaciones difíciles durante un viaje de trabajo en español.",
  readingTitle: "Cuando el plan B se convierte en el plan A",
  reading: [
    "Los imprevistos son parte inevitable de los viajes de trabajo: un vuelo cancelado, una reunión que se posterga sin aviso, un documento olvidado en el hotel, una situación médica menor. Saber manejarse en español en esas situaciones con calma y vocabulario preciso puede convertir un problema en un inconveniente manejable.",
    "Ante un vuelo cancelado o demorado: '¿Cuál es el motivo de la cancelación?' — '¿Cuándo es el próximo vuelo disponible a São Paulo?' — '¿La aerolínea se hace cargo del hotel si la demora es de más de seis horas?' — '¿Puedo hablar con el supervisor, por favor?' — 'Necesito un documento escrito que certifique la cancelación para presentar a mi empresa.' Esta última frase es crítica: el certificado de cancelación es necesario para justificar gastos adicionales ante el departamento de viajes.",
    "Ante una situación médica menor en el hotel o la calle: '¿Hay una farmacia cerca?' — '¿Puede llamar a un médico?' — 'Necesito algo para el dolor de cabeza / fiebre / malestar estomacal.' — 'Tengo seguro médico de viaje, ¿dónde queda el hospital más cercano?' — 'Necesito guardar reposo, ¿pueden avisar al cliente que no podré asistir a la reunión de mañana?'",
    "Ante una reunión cancelada de último momento por el cliente: 'Entiendo perfectamente, no hay ningún problema. ¿Cuándo podríamos reagendar?' — 'Si le viene bien, podría quedarme un día más para que tengamos la reunión.' — 'Si no es posible reagendar durante este viaje, ¿podríamos hacer una videollamada la semana próxima?' Mostrar flexibilidad sin perder el objetivo es la clave en estas situaciones.",
    "Si se pierde o roba el pasaporte o documentos: llamar inmediatamente al consulado brasileño del país y a la empresa para activar el protocolo de emergencia. La frase más importante es: 'Perdí mis documentos. Necesito comunicarme con el Consulado de Brasil. ¿Puede ayudarme a encontrar el número?' El hotel suele ser el primer aliado en estas situaciones: su personal conoce los procedimientos y puede orientar rápidamente.",
  ],
  vocab: [
    { es: "cancelación / demora del vuelo", pt: "cancelamento / atraso do voo" },
    { es: "certificado de cancelación", pt: "declaração de cancelamento" },
    { es: "seguro médico de viaje", pt: "seguro de viagem / seguro saúde" },
    { es: "reagendar / reprogramar", pt: "reagendar / remarcar" },
    { es: "consulado / embajada", pt: "consulado / embaixada" },
    { es: "guardar reposo / sentirse mal", pt: "guardar repouso / sentir-se mal" },
  ],
  quiz: [
    { question: "¿Qué documento es crítico pedir ante una cancelación de vuelo para justificar gastos?", options: ["El boarding pass del vuelo cancelado", "Un documento escrito que certifique la cancelación para presentar a la empresa", "La tarjeta de embarque del vuelo alternativo", "El número de teléfono del supervisor de la aerolínea"], answer: "Un documento escrito que certifique la cancelación para presentar a la empresa" },
    { question: "¿Qué se pregunta para saber si la aerolínea cubre el hotel por una demora larga?", options: ["'¿Me dan un hotel gratis?'", "'¿La aerolínea se hace cargo del hotel si la demora es de más de seis horas?'", "'¿Cuánto cuesta el hotel del aeropuerto?'", "'¿Puedo dormir en el aeropuerto?'"], answer: "'¿La aerolínea se hace cargo del hotel si la demora es de más de seis horas?'" },
    { question: "¿Qué frase muestra flexibilidad cuando el cliente cancela la reunión de último momento?", options: ["'Esto es inaceptable, viajé especialmente para esta reunión'", "'Entiendo perfectamente. ¿Cuándo podríamos reagendar?'", "'Si cancela, tendremos que cobrar la visita'", "'¿Por qué no avisaron antes?'"], answer: "'Entiendo perfectamente. ¿Cuándo podríamos reagendar?'" },
    { question: "¿Qué opciones ofrece el colaborador cuando no es posible reagendar en el mismo viaje?", options: ["Regresar al país sin haber tenido la reunión sin decir nada", "Ofrecer quedarse un día más o proponer una videollamada la semana siguiente", "Cancelar el contrato con el cliente", "Pedir que el cliente venga a Brasil para la reunión"], answer: "Ofrecer quedarse un día más o proponer una videollamada la semana siguiente" },
    { question: "¿Cuál es el primer paso ante la pérdida del pasaporte?", options: ["Ir directamente al aeropuerto para explicar la situación", "Llamar al consulado brasileño del país y a la empresa para activar el protocolo de emergencia", "Publicar en redes sociales para que alguien lo encuentre", "Esperar al día siguiente para ver si aparece"], answer: "Llamar al consulado brasileño del país y a la empresa para activar el protocolo de emergencia" },
    { question: "¿Qué frase se usa para pedir ayuda para encontrar el consulado?", options: ["'Necesito ir a Brasil urgente'", "'Perdí mis documentos. Necesito comunicarme con el Consulado de Brasil. ¿Puede ayudarme a encontrar el número?'", "'¿Dónde está la policía?'", "'Llamen a la embajada de Brasil por favor'"], answer: "'Perdí mis documentos. Necesito comunicarme con el Consulado de Brasil. ¿Puede ayudarme a encontrar el número?'" },
    { question: "¿Por qué el hotel es un aliado clave en situaciones de emergencia?", options: ["Porque tiene seguro médico para los huéspedes", "Porque su personal conoce los procedimientos locales y puede orientar rápidamente", "Porque tiene obligación legal de resolver cualquier problema del viajero", "Solo si es un hotel de cinco estrellas"], answer: "Porque su personal conoce los procedimientos locales y puede orientar rápidamente" },
    { question: "¿Cómo se pide medicación básica en una farmacia hispanohablante?", options: ["'Quiero pastillas'", "'Necesito algo para el dolor de cabeza / fiebre / malestar estomacal'", "'¿Tienen remedios brasileños?'", "'Dame lo que uses vos para el dolor'"], answer: "'Necesito algo para el dolor de cabeza / fiebre / malestar estomacal'" },
  ],
  dictation: "Ante una cancelación de vuelo hay que pedir el certificado escrito para justificar gastos y preguntar si la aerolínea cubre el alojamiento cuando la demora supera las seis horas.",
},

{
  id: "viaje-etiqueta-cultural",
  title: "Etiqueta y cultura en países hispanohablantes",
  level: "Intermedio",
  category: "Viajes",
  emoji: "🌎",
  description: "Diferencias culturales clave entre Brasil y los países hispanohablantes que el colaborador de Controllab debe conocer antes de viajar.",
  readingTitle: "Lo que nadie te dice antes del viaje",
  reading: [
    "Hay cosas que no están en los manuales de viaje pero que marcan la diferencia en una visita de negocios a un país hispanohablante. Son los detalles de etiqueta y cultura que, si se ignoran, pueden generar incomodidad o malentendidos, y que si se conocen, demuestran respeto y generan una impresión de profesionalismo que va más allá del idioma.",
    "El uso del tuteo y el ustedeo varía enormemente entre países. En Argentina, el tuteo — e incluso el 'voseo' — es habitual incluso en contextos profesionales desde el primer encuentro. En Colombia, México y muchos países de América Central, el 'usted' es la norma en contextos profesionales y usarlo transmite respeto. En España, el 'tú' es casi universal en contextos laborales. La regla práctica: observar cómo te habla el interlocutor y usar el mismo registro.",
    "Los horarios son otra dimensión cultural importante. En España, la jornada laboral se extiende hasta más tarde y las cenas de trabajo pueden comenzar a las nueve o diez de la noche, lo que puede sorprender a un brasileño acostumbrado a cenar a las siete. En México y Colombia, el almuerzo de negocios es la comida de trabajo más frecuente. En Argentina, las reuniones a última hora de la tarde son habituales.",
    "Los regalos corporativos tienen reglas diferentes según el país. En general, en América Latina es bien recibido llevar un pequeño regalo representativo de Brasil — café especial, chocolates regionales, una artesanía — como gesto de cortesía al visitar a un cliente por primera vez. No es obligatorio pero es apreciado. Evitar regalos muy costosos que puedan interpretarse como soborno en contextos institucionales.",
    "El idioma de los cumplidos: en muchos países hispanohablantes, especialmente en Colombia y México, la cortesía verbal es muy elaborada. 'Está usted en su casa', 'para lo que guste mandar', 'con mucho gusto' son expresiones de cortesía que no deben tomarse al pie de la letra pero que tampoco deben responderse con la brusquedad que podría ser habitual en otros contextos. Responder con la misma calidez — 'muy amables', 'muchas gracias por su hospitalidad' — construye el tono correcto para la relación.",
  ],
  vocab: [
    { es: "tuteo / ustedeo / voseo", pt: "tutear / usar 'você' / usar 'vós'" },
    { es: "horario laboral / cena tardía", pt: "horário de trabalho / jantar tardio" },
    { es: "regalo corporativo", pt: "brinde corporativo" },
    { es: "cortesía verbal / cumplido", pt: "cortesia verbal / elogio" },
    { es: "al pie de la letra", pt: "ao pé da letra" },
    { es: "soborno / conflicto de interés", pt: "suborno / conflito de interesses" },
  ],
  quiz: [
    { question: "¿Cuál es la regla práctica para decidir entre tutear o usar 'usted' con un cliente?", options: ["Siempre usar 'usted' en cualquier país hispanohablante", "Siempre usar 'tú' para ser más cercano y moderno", "Observar cómo te habla el interlocutor y usar el mismo registro", "Preguntar directamente al cliente qué prefiere"], answer: "Observar cómo te habla el interlocutor y usar el mismo registro" },
    { question: "¿En qué país hispanohablante es habitual el 'voseo' incluso en contextos profesionales?", options: ["México", "Colombia", "Argentina", "España"], answer: "Argentina" },
    { question: "¿A qué hora pueden comenzar las cenas de trabajo en España?", options: ["A las siete de la tarde como en Brasil", "A las nueve o diez de la noche", "A las seis de la tarde antes de que oscurezca", "Al mediodía como almuerzo de negocios"], answer: "A las nueve o diez de la noche" },
    { question: "¿Qué tipo de regalo corporativo es bien recibido al visitar un cliente latinoamericano por primera vez?", options: ["Productos tecnológicos de alto valor", "Un pequeño regalo representativo de Brasil como café especial o artesanía regional", "Dinero en efectivo como gesto de cortesía", "Productos del catálogo de Controllab"], answer: "Un pequeño regalo representativo de Brasil como café especial o artesanía regional" },
    { question: "¿Por qué hay que evitar regalos muy costosos en contextos institucionales?", options: ["Porque el cliente puede no tener dónde guardarlo", "Porque pueden interpretarse como soborno o conflicto de interés", "Porque es una costumbre que no existe en América Latina", "Porque los regalos corporativos están prohibidos en hospitales"], answer: "Porque pueden interpretarse como soborno o conflicto de interés" },
    { question: "¿Qué significa 'está usted en su casa' dicho por un cliente colombiano o mexicano?", options: ["Que el cliente quiere invitar al visitante a conocer su casa", "Es una expresión de cortesía verbal que no debe tomarse al pie de la letra pero sí responderse con calidez", "Que el visitante puede usar todas las instalaciones de la empresa libremente", "Que el cliente está muy cómodo con la visita y quiere firmar el contrato"], answer: "Es una expresión de cortesía verbal que no debe tomarse al pie de la letra pero sí responderse con calidez" },
    { question: "¿Cuál es la comida de trabajo más frecuente en México y Colombia?", options: ["La cena tardía", "El desayuno de negocios", "El almuerzo de negocios", "El café de media mañana"], answer: "El almuerzo de negocios" },
    { question: "¿Cómo se responde con el tono correcto a la cortesía verbal elaborada de un cliente?", options: ["Con brevedad para no perder tiempo en la reunión", "Con la misma calidez: 'muy amables', 'muchas gracias por su hospitalidad'", "Ignorándola y entrando directamente en los temas de negocios", "Solo con un gesto de cabeza para no excederse en formalidades"], answer: "Con la misma calidez: 'muy amables', 'muchas gracias por su hospitalidad'" },
    { question: "¿Por qué conocer la etiqueta cultural del país visitado va más allá del idioma?", options: ["Porque permite evitar sanciones legales en el país visitado", "Porque demuestra respeto por la cultura local y genera una impresión de profesionalismo que el idioma solo no puede lograr", "Solo porque facilita la conversación informal en las cenas", "Porque es un requisito para obtener la visa de negocios"], answer: "Porque demuestra respeto por la cultura local y genera una impresión de profesionalismo que el idioma solo no puede lograr" },
  ],
  dictation: "La regla práctica para el tuteo es observar cómo habla el interlocutor y usar el mismo registro: en Argentina el voseo es habitual; en Colombia y México el usted transmite respeto profesional.",
},
];

const defaultStudents: Student[] = [
  { id: "marilia", name: "Marília", code: "MARILIA" }, { id: "claudio", name: "Claudio", code: "CLAUDIO" },
  { id: "juliana", name: "Juliana", code: "JULIANA" }, { id: "thamiris", name: "Thamiris", code: "THAMIRIS" },
  { id: "livia", name: "Livia", code: "LIVIA" }, { id: "adriana", name: "Adriana", code: "ADRIANA" },
  { id: "rafael", name: "Rafael", code: "RAFAEL" }, { id: "jessica", name: "Jessica", code: "JESSICA" },
  { id: "luiza", name: "Luiza", code: "LUIZA" }, { id: "ana-paula", name: "Ana Paula", code: "ANAPAULA" },
  { id: "lucas", name: "Lucas", code: "LUCAS" }, { id: "katia", name: "Katia", code: "KATIA" },
  { id: "vinicius", name: "Vinicius", code: "VINICIUS" }, { id: "thiago", name: "Thiago", code: "THIAGO" },
];

const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Ventas", "Viajes", "Tecnología", "Gramática", "Controllab"];

function strSeed(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h; }
function shuffleOpts(opts: string[], seed: number): string[] { const arr = [...opts]; let s = seed || 1; for (let i = arr.length - 1; i > 0; i--) { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s = s >>> 0; const j = s % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
function normalize(value: string): string { return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim(); }
function createInitialState(): AppState { return { students: defaultStudents, currentStudentId: null, progress: {}, dictations: {} }; }

async function loadRemoteState(): Promise<AppState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("aula_controllab_state").select("data").eq("id", DB_ROW_ID).maybeSingle();
  if (error) throw error;
  return (data?.data as AppState) || null;
}
async function saveRemoteState(state: AppState): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("aula_controllab_state").upsert({ id: DB_ROW_ID, data: state, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>(createInitialState);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [loginName, setLoginName] = useState(""); const [loginCode, setLoginCode] = useState(""); const [loginError, setLoginError] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(MODULES[0].id);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(""); const [submitted, setSubmitted] = useState(false);
  const [showProfessorPanel, setShowProfessorPanel] = useState(false); const [professorUnlocked, setProfessorUnlocked] = useState(false);
  const [newStudentName, setNewStudentName] = useState(""); const [newStudentCode, setNewStudentCode] = useState("");
  const [dictationText, setDictationText] = useState(""); const [dictationResult, setDictationResult] = useState<DictationResult | null>(null);
  const [teacherTab, setTeacherTab] = useState<"students" | "progress" | "dictations">("progress");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [activeSection, setActiveSection] = useState<"reading" | "quiz" | "dictation" | "vocab">("reading");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [passwordMsg, setPasswordMsg] = useState("");
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

  const speak = (text: string, rate = 0.9) => { if (typeof window === "undefined" || !("speechSynthesis" in window)) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "es-ES"; u.rate = rate; const v = window.speechSynthesis.getVoices().find(x => x.lang.startsWith("es")); if (v) u.voice = v; window.speechSynthesis.speak(u); };
  const stopSpeak = () => { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); };

  useEffect(() => {
    let mounted = true; const LSKEY = "aula-controllab-v7";
    (async () => {
      try { if (supabase) { const remote = await loadRemoteState(); if (!mounted) return; if (remote) { setAppState({ students: Array.isArray(remote.students) && remote.students.length ? remote.students : defaultStudents, currentStudentId: null, progress: remote.progress || {}, dictations: remote.dictations || {} }); setLoadStatus("ready"); return; } } } catch {}
      if (!mounted) return;
      try { const saved = localStorage.getItem(LSKEY); if (saved) { const p = JSON.parse(saved); setAppState({ ...createInitialState(), ...p, currentStudentId: null }); } else setAppState(createInitialState()); } catch { setAppState(createInitialState()); }
      setLoadStatus("ready");
    })(); return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loadStatus !== "ready") return; const LSKEY = "aula-controllab-v7";
    const t = setTimeout(async () => { try { localStorage.setItem(LSKEY, JSON.stringify(appState)); } catch {} if (supabase) { try { await saveRemoteState(appState); } catch {} } }, 500);
    return () => clearTimeout(t);
  }, [appState, loadStatus]);

  useEffect(() => { stopSpeak(); setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setDictationText(""); setDictationResult(null); setQuizAnswers({}); setActiveSection("reading"); }, [selectedModuleId, appState.currentStudentId]); // eslint-disable-line

  const logout = () => { stopSpeak(); setAppState(prev => ({ ...prev, currentStudentId: null })); setSelectedModuleId(MODULES[0].id); setShowProfessorPanel(false); setProfessorUnlocked(false); };
  const login = () => { const found = appState.students.find(s => normalize(s.name) === normalize(loginName) && normalize(s.code) === normalize(loginCode)); if (!found) { setLoginError("Usuario o contraseña incorrectos."); return; } setAppState(prev => ({ ...prev, currentStudentId: found.id })); setLoginError(""); setLoginName(""); setLoginCode(""); };
  const changePassword = () => { if (!newPassword.trim()) { setPasswordMsg("Escribí una contraseña nueva."); return; } if (newPassword.trim().length < 4) { setPasswordMsg("Mínimo 4 caracteres."); return; } if (newPassword.trim() !== confirmPassword.trim()) { setPasswordMsg("Las contraseñas no coinciden."); return; } if (!currentStudent) return; setAppState(prev => ({ ...prev, students: prev.students.map(s => s.id === currentStudent.id ? { ...s, code: newPassword.trim().toUpperCase() } : s) })); setPasswordMsg("✓ Actualizada."); setNewPassword(""); setConfirmPassword(""); setTimeout(() => { setShowChangePassword(false); setPasswordMsg(""); }, 1500); };
  const handleProfessorClick = () => { if (professorUnlocked) { setShowProfessorPanel(v => !v); return; } const pwd = window.prompt("Contraseña del profesor:"); if (pwd === PROFESSOR_PASSWORD) { setProfessorUnlocked(true); setShowProfessorPanel(true); } else if (pwd !== null) alert("Contraseña incorrecta."); };
  const saveProgress = (scoreValue: number, totalValue: number) => { if (!currentStudent) return; setAppState(prev => { const prevSP = prev.progress[currentStudent.id] || {}; const prevM = prevSP[selectedModuleId] || { completed: false, score: 0, total: totalValue, attempts: 0 }; return { ...prev, progress: { ...prev.progress, [currentStudent.id]: { ...prevSP, [selectedModuleId]: { completed: true, score: Math.max(prevM.score || 0, scoreValue), total: totalValue, attempts: (prevM.attempts || 0) + 1 } } } }; }); };
  const resetCurrentModule = () => { if (!currentStudent) return; if (!window.confirm(`¿Reiniciar "${selectedModule.title}"?`)) return; setAppState(prev => { const newP = { ...(prev.progress[currentStudent.id] || {}) }; const newD = { ...(prev.dictations[currentStudent.id] || {}) }; delete newP[selectedModuleId]; delete newD[selectedModuleId]; return { ...prev, progress: { ...prev.progress, [currentStudent.id]: newP }, dictations: { ...prev.dictations, [currentStudent.id]: newD } }; }); setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setQuizAnswers({}); setDictationText(""); setDictationResult(null); setActiveSection("reading"); };
  const resetStudentModule = (studentId: string, moduleId: string) => { setAppState(prev => { const newP = { ...(prev.progress[studentId] || {}) }; const newD = { ...(prev.dictations[studentId] || {}) }; delete newP[moduleId]; delete newD[moduleId]; return { ...prev, progress: { ...prev.progress, [studentId]: newP }, dictations: { ...prev.dictations, [studentId]: newD } }; }); };
  const resetStudentAll = (studentId: string, studentName: string) => { if (!window.confirm(`¿Reiniciar TODO de ${studentName}?`)) return; setAppState(prev => ({ ...prev, progress: { ...prev.progress, [studentId]: {} }, dictations: { ...prev.dictations, [studentId]: {} } })); };
  const resetAllStudents = () => { if (!window.confirm("¿Borrar TODO el progreso de TODOS los alumnos?")) return; setAppState(prev => ({ ...prev, progress: {}, dictations: {} })); };
  const handleSubmit = () => { if (!selectedOption) return; setSubmitted(true); };
  const handleNext = () => { if (currentQuestionIndex < selectedModule.quiz.length - 1) { const next = currentQuestionIndex + 1; setCurrentQuestionIndex(next); setSelectedOption(quizAnswers[next] || ""); setSubmitted(false); return; } const correct = selectedModule.quiz.reduce((sum, q, i) => sum + (quizAnswers[i] === q.answer ? 1 : 0), 0); saveProgress(correct, selectedModule.quiz.length); setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setQuizAnswers({}); setActiveSection("reading"); };
  const setAnswerMemory = (value: string) => { setSelectedOption(value); setQuizAnswers(prev => ({ ...prev, [currentQuestionIndex]: value })); };
  const addStudent = () => { if (!newStudentName.trim() || !newStudentCode.trim()) return; const exists = appState.students.some(s => normalize(s.name) === normalize(newStudentName) || normalize(s.code) === normalize(newStudentCode)); if (exists) { alert("Ese alumno o código ya existe."); return; } const id = `${normalize(newStudentName)}-${Date.now()}`; setAppState(prev => ({ ...prev, students: [...prev.students, { id, name: newStudentName.trim(), code: newStudentCode.trim().toUpperCase() }] })); setNewStudentName(""); setNewStudentCode(""); };
  const removeStudent = (studentId: string) => { const student = appState.students.find(s => s.id === studentId); if (!window.confirm(`¿Eliminar a ${student?.name || "este alumno"}?`)) return; setAppState(prev => { const newStudents = prev.students.filter(s => s.id !== studentId); const newP = { ...prev.progress }; const newD = { ...prev.dictations }; delete newP[studentId]; delete newD[studentId]; return { ...prev, students: newStudents, progress: newP, dictations: newD }; }); };
  const checkDictation = () => { if (!currentStudent) return; const expected = normalize(selectedModule.dictation); const written = normalize(dictationText); const expWords = expected.split(" ").filter(Boolean); const wrtWords = written.split(" ").filter(Boolean); const matches = wrtWords.filter((w, i) => w === expWords[i]).length; const score = expWords.length ? Math.round((matches / expWords.length) * 100) : 0; const result: DictationResult = { exact: expected === written, score, written: dictationText, expected: selectedModule.dictation, updatedAt: new Date().toLocaleString() }; setDictationResult(result); setAppState(prev => ({ ...prev, dictations: { ...prev.dictations, [currentStudent.id]: { ...(prev.dictations[currentStudent.id] || {}), [selectedModuleId]: result } } })); };

  const professorRows = useMemo(() => appState.students.map(student => { const progress = appState.progress[student.id] || {}; const dictations = appState.dictations[student.id] || {}; const completedMods = Object.keys(progress).length; const bestScore = MODULES.reduce((sum, m) => sum + (progress[m.id]?.score || 0), 0); const dictScores = MODULES.map(m => dictations[m.id]?.score).filter((v): v is number => typeof v === "number"); const dictAvg = dictScores.length ? Math.round(dictScores.reduce((a, b) => a + b, 0) / dictScores.length) : null; return { ...student, completedMods, bestScore, dictAvg }; }), [appState]);

  if (loadStatus === "loading") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: FONT, gap: 16 }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.teal}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ color: C.textDim, fontSize: 13 }}>Cargando Aula Controllab...</span>
    </div>
  );

  const ProfessorPanel = () => (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, marginTop: 16 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.bg3, borderRadius: 12, padding: 4 }}>
        {([["progress", "📊 Progreso"], ["students", "👥 Alumnos"], ["dictations", "🎙 Dictados"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTeacherTab(t)} style={{ flex: 1, borderRadius: 9, padding: "8px 0", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: teacherTab === t ? C.surface : "transparent", color: teacherTab === t ? C.text : C.textDim, fontFamily: FONT, boxShadow: teacherTab === t ? `0 0 0 1px ${C.border}` : "none" }}>{label}</button>
        ))}
        <button onClick={resetAllStudents} style={{ ...btnDanger, borderRadius: 9, marginLeft: 8 }}>🗑 Todo</button>
      </div>
      {teacherTab === "progress" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto" }}>
          {professorRows.map(row => (
            <div key={row.id} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.tealGlow, border: `1px solid ${C.borderA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.teal, fontFamily: MONO }}>{getInitial(row.name)}</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{row.name}</div><div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO }}>{row.completedMods}/{MODULES.length} mód · {row.bestScore} pts</div></div>
                <button onClick={() => resetStudentAll(row.id, row.name)} style={btnDanger}>Reset</button>
              </div>
              <MiniBar value={row.completedMods} max={MODULES.length} />
            </div>
          ))}
        </div>
      )}
      {teacherTab === "dictations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
          {professorRows.map(row => (
            <div key={row.id} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{row.name}</span>
                {row.dictAvg !== null && <span style={{ fontFamily: MONO, fontSize: 12, color: C.teal, background: C.tealGlow, padding: "2px 8px", borderRadius: 20 }}>avg {row.dictAvg}%</span>}
              </div>
              {MODULES.filter(m => appState.dictations[row.id]?.[m.id]).map(m => { const d = appState.dictations[row.id][m.id]; const sc = d.score >= 80 ? C.green : d.score >= 50 ? C.yellow : C.red; return (<div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}><span style={{ fontSize: 12, color: C.textMid, flex: 1 }}>{m.emoji} {m.title}</span><span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: sc }}>{d.score}%</span><MiniBar value={d.score} max={100} color={sc} /><button onClick={() => resetStudentModule(row.id, m.id)} style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</button></div>); })}
              {!MODULES.some(m => appState.dictations[row.id]?.[m.id]) && <div style={{ fontSize: 12, color: C.textDim }}>Sin dictados aún</div>}
            </div>
          ))}
        </div>
      )}
      {teacherTab === "students" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Nombre" style={{ ...input, flex: 2 }} />
            <input value={newStudentCode} onChange={e => setNewStudentCode(e.target.value)} placeholder="Código" style={{ ...input, flex: 1 }} />
            <button onClick={addStudent} style={{ ...btnAccent, padding: "0 16px", whiteSpace: "nowrap" }}>+ Agregar</button>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {appState.students.map(s => (<div key={s.id} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: C.tealGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.teal }}>{getInitial(s.name)}</div><div style={{ flex: 1, fontSize: 14, color: C.text }}>{s.name}</div><div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO }}>{s.code}</div><button onClick={() => removeStudent(s.id)} style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>×</button></div>))}
          </div>
        </div>
      )}
    </div>
  );

  if (!currentStudent) return (
<div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT }}>      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; } input::placeholder { color: ${C.textDim}; } input:focus { border-color: ${C.borderA} !important; outline: none; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }`}</style>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: C.tealGlow, border: `1px solid ${C.borderA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>🔬</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: C.text, margin: "0 0 8px", fontFamily: DISPLAY, letterSpacing: "-0.03em" }}>Aula Controllab</h1>
          <p style={{ color: C.textMid, fontSize: 14, margin: 0 }}>Español técnico para profesionales del laboratorio</p>
        </div>
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 8, fontFamily: MONO }}>NOMBRE</label>
            <input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Tu nombre completo" style={input} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 8, fontFamily: MONO }}>CONTRASEÑA</label>
            <input value={loginCode} onChange={e => setLoginCode(e.target.value)} placeholder="••••••••" type="password" style={input} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          {loginError && <div style={{ background: "rgba(251,113,133,0.08)", border: `1px solid ${C.redBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>{loginError}</div>}
          <button onClick={login} style={{ ...btnAccent, width: "100%", padding: "13px 24px", fontSize: 15 }}>Entrar al aula →</button>
        </div>
        <button onClick={handleProfessorClick} style={{ marginTop: 12, width: "100%", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 14, padding: "11px 16px", color: C.textDim, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>👨‍🏫 Panel del profesor</button>
        {showProfessorPanel && professorUnlocked && <ProfessorPanel />}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; } input::placeholder, textarea::placeholder { color: ${C.textDim}; } input:focus, textarea:focus { border-color: ${C.borderA} !important; outline: none; } button:hover { opacity: 0.88; } ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; } @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } .sa { animation: fadeIn 0.25s ease; }`}</style>

      <header style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 4 }}>
            <span style={{ fontSize: 18 }}>🔬</span>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", fontFamily: DISPLAY }}>Aula Controllab</span>
          </div>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <div style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap", background: activeCategory === cat ? C.teal : "transparent", color: activeCategory === cat ? "#042f2e" : C.textDim, fontFamily: FONT }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => { setShowChangePassword(v => !v); setShowProfessorPanel(false); }} style={{ ...btnGhost, padding: "5px 10px", fontSize: 13 }}>🔑</button>
            <button onClick={handleProfessorClick} style={{ ...btnGhost, padding: "5px 10px", fontSize: 13 }}>👨‍🏫</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 12px 4px 6px" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.tealGlow, border: `1px solid ${C.borderA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.teal, fontFamily: MONO }}>{getInitial(currentStudent.name)}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{currentStudent.name}</span>
            </div>
            <button onClick={logout} style={btnDanger}>Salir</button>
          </div>
        </div>
        {showChangePassword && (
          <div style={{ background: C.bg2, borderTop: `1px solid ${C.border}`, padding: "16px 24px" }}>
            <div style={{ maxWidth: 480, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña" style={{ ...input, flex: 1, minWidth: 160 }} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar" style={{ ...input, flex: 1, minWidth: 140 }} />
              <button onClick={changePassword} style={btnAccent}>Guardar</button>
              <button onClick={() => { setShowChangePassword(false); setPasswordMsg(""); }} style={btnGhost}>Cancelar</button>
              {passwordMsg && <span style={{ fontSize: 13, color: passwordMsg.startsWith("✓") ? C.green : C.red, width: "100%" }}>{passwordMsg}</span>}
            </div>
          </div>
        )}
      </header>

      {showProfessorPanel && professorUnlocked && <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}><ProfessorPanel /></div>}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 48px", display: "grid", gridTemplateColumns: sidebarOpen ? "280px 1fr 300px" : "1fr 300px", gap: 20, alignItems: "start" }}>

        {sidebarOpen && (
          <aside style={{ position: "sticky", top: 72 }}>
            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 16, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "0 4px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.textDim, fontFamily: MONO }}>MÓDULOS</span>
                <span style={{ fontSize: 11, color: C.textDim, fontFamily: MONO }}>{filteredModules.filter(m => studentProgress[m.id]).length}/{filteredModules.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredModules.map(m => {
                  const p = studentProgress[m.id]; const isActive = m.id === selectedModuleId;
                  return (
                    <button key={m.id} onClick={() => setSelectedModuleId(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "9px 10px", background: isActive ? C.tealGlow : "transparent", border: `1px solid ${isActive ? C.borderA : "transparent"}`, cursor: "pointer", textAlign: "left", width: "100%" }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>{m.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.text : C.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColor(m.category), flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: C.textDim, fontFamily: MONO }}>{m.level}</span>
                        </div>
                      </div>
                      {p ? <div style={{ flexShrink: 0, textAlign: "right" }}><div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.teal }}>{p.score}/{p.total}</div><div style={{ fontSize: 10, color: C.teal }}>✓</div></div> : <span style={{ color: C.textDim, fontSize: 14 }}>·</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        <main>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <button onClick={() => setSidebarOpen(v => !v)} style={{ ...btnGhost, padding: "6px 10px", flexShrink: 0, marginTop: 4 }}>{sidebarOpen ? "◀" : "▶"}</button>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: catBg(selectedModule.category), border: `1px solid ${catColor(selectedModule.category)}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{selectedModule.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", fontFamily: DISPLAY }}>{selectedModule.title}</h2>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: catBg(selectedModule.category), color: catColor(selectedModule.category), fontFamily: MONO }}>{selectedModule.category}</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.surface, color: C.textDim, fontFamily: MONO, border: `1px solid ${C.border}` }}>{selectedModule.level}</span>
                  {studentProgress[selectedModuleId] && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.tealGlow, color: C.teal, fontFamily: MONO, border: `1px solid ${C.borderA}` }}>✓ {studentProgress[selectedModuleId].score}/{studentProgress[selectedModuleId].total}</span>}
                </div>
                <p style={{ color: C.textMid, fontSize: 14, margin: 0 }}>{selectedModule.description}</p>
              </div>
              <button onClick={resetCurrentModule} style={{ ...btnDanger, flexShrink: 0, marginTop: 4 }}>↺ Reiniciar</button>
            </div>
            <div style={{ display: "flex", gap: 4, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 4 }}>
              {([["reading", "📖 Lectura"], ["vocab", "📝 Vocabulario"], ["quiz", "🧠 Quiz"], ["dictation", "🎙 Dictado"]] as const).map(([sec, label]) => (
                <button key={sec} onClick={() => setActiveSection(sec)} style={{ flex: 1, borderRadius: 11, padding: "9px 4px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: FONT, background: activeSection === sec ? C.teal : "transparent", color: activeSection === sec ? "#042f2e" : C.textMid }}>{label}</button>
              ))}
            </div>
          </div>

          {activeSection === "reading" && (
            <div className="sa" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0, fontFamily: DISPLAY, letterSpacing: "-0.02em" }}>{selectedModule.readingTitle}</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => speak(selectedModule.reading.join(" "), 0.9)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.tealGlow, border: `1px solid ${C.borderA}`, borderRadius: 10, padding: "7px 14px", fontSize: 13, color: C.teal, cursor: "pointer", fontFamily: FONT }}>🔊 Escuchar</button>
                  <button onClick={stopSpeak} style={{ ...btnGhost, padding: "7px 14px" }}>⏹</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {selectedModule.reading.map((para, i) => (
                  <div key={i} style={{ display: "flex", gap: 20, padding: "16px 0", borderBottom: i < selectedModule.reading.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, flexShrink: 0, paddingTop: 4, width: 20, textAlign: "right" }}>{i + 1}</span>
                    <p style={{ lineHeight: 2.0, color: "#cbd5e1", fontSize: 15, margin: 0 }}>{para}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", gap: 12 }}>
                <button onClick={() => setActiveSection("vocab")} style={btnGhost}>📝 Ver vocabulario</button>
                <button onClick={() => setActiveSection("quiz")} style={btnAccent}>Ir al quiz →</button>
              </div>
            </div>
          )}

          {activeSection === "vocab" && (
            <div className="sa" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 24px", fontFamily: DISPLAY }}>📝 Vocabulario clave</h3>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {selectedModule.vocab.map(item => (
                  <div key={item.es} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div><div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{item.es}</div><div style={{ fontSize: 11, color: C.textDim, marginTop: 2, fontFamily: MONO }}>ES</div></div>
                    <div style={{ width: 1, height: 32, background: C.border }} />
                    <div style={{ textAlign: "right" }}><div style={{ fontWeight: 600, fontSize: 14, color: C.teal }}>{item.pt}</div><div style={{ fontSize: 11, color: C.textDim, marginTop: 2, fontFamily: MONO }}>PT</div></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                <button onClick={() => setActiveSection("reading")} style={btnGhost}>← Lectura</button>
                <button onClick={() => setActiveSection("quiz")} style={btnAccent}>Ir al quiz →</button>
              </div>
            </div>
          )}

          {activeSection === "quiz" && (
            <div className="sa" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 99, background: C.bg3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${((currentQuestionIndex + (submitted ? 1 : 0)) / selectedModule.quiz.length) * 100}%`, background: `linear-gradient(90deg, ${C.teal}, #67e8f9)`, borderRadius: 99, transition: "width 0.4s ease" }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.textMid, flexShrink: 0 }}>{currentQuestionIndex + 1} <span style={{ color: C.textDim }}>/ {selectedModule.quiz.length}</span></span>
              </div>
              <p style={{ fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.65, margin: "0 0 24px" }}>{currentQuestion.question}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {shuffledOpts.map(option => {
                  const sel = selectedOption === option; const correct = submitted && option === currentQuestion.answer; const wrong = submitted && sel && option !== currentQuestion.answer;
                  return (
                    <button key={option} onClick={() => !submitted && setAnswerMemory(option)} disabled={submitted} style={optBtn(sel, correct, wrong)}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${correct ? C.green : wrong ? C.red : sel ? C.teal : C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{correct ? "✓" : wrong ? "✗" : ""}</span>
                      {option}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14 }}>
                  {submitted ? isCorrect ? <span style={{ color: C.green, fontWeight: 600 }}>✓ ¡Correcto!</span> : <div><span style={{ color: C.red }}>✗ Respuesta: </span><strong style={{ color: C.text }}>{currentQuestion.answer}</strong></div> : <span style={{ color: C.textDim }}>Seleccioná una opción</span>}
                </div>
                {!submitted ? <button onClick={handleSubmit} disabled={!selectedOption} style={{ ...btnAccent, opacity: selectedOption ? 1 : 0.35 }}>Comprobar</button> : <button onClick={handleNext} style={btnAccent}>{currentQuestionIndex < selectedModule.quiz.length - 1 ? "Siguiente →" : "Finalizar ✓"}</button>}
              </div>
            </div>
          )}

          {activeSection === "dictation" && (
            <div className="sa" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0, fontFamily: DISPLAY }}>🎙 Dictado</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => speak(selectedModule.dictation, 0.75)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.tealGlow, border: `1px solid ${C.borderA}`, borderRadius: 10, padding: "7px 14px", fontSize: 13, color: C.teal, cursor: "pointer", fontFamily: FONT }}>🔊 Reproducir</button>
                  <button onClick={stopSpeak} style={{ ...btnGhost, padding: "7px 14px" }}>⏹</button>
                </div>
              </div>
              <p style={{ color: C.textMid, fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>Escuchá el audio y escribí la frase en español.</p>
              <textarea value={dictationText} onChange={e => setDictationText(e.target.value)} rows={4} placeholder="Escribí lo que escuchaste..." style={{ ...input, resize: "none", lineHeight: 1.8, borderRadius: 14, padding: "14px 18px" }} />
              <button onClick={checkDictation} style={{ ...btnAccent, marginTop: 14 }}>Corregir dictado</button>
              {(dictationResult || currentDictation) && (() => { const r = dictationResult || currentDictation!; const sc = r.score >= 80 ? C.green : r.score >= 50 ? C.yellow : C.red; return (
                <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginTop: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <ScoreRing percent={r.score} size={64} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 14, fontWeight: 700, color: sc }}>{r.score}%</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{r.score === 100 ? "¡Perfecto! 🎉" : r.score >= 80 ? "¡Muy bien! 👍" : r.score >= 50 ? "Buen intento" : "Seguí practicando"}</div>
                      <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{r.updatedAt}</div>
                    </div>
                  </div>
                  <div style={{ background: C.bg2, borderRadius: 12, padding: "12px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.textDim, marginBottom: 6, letterSpacing: "0.06em", fontFamily: MONO }}>FRASE MODELO</div>
                    <p style={{ fontSize: 14, color: "#cbd5e1", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{r.expected}</p>
                  </div>
                </div>
              ); })()}
            </div>
          )}
        </main>

        <aside style={{ position: "sticky", top: 72, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.textDim, marginBottom: 16, fontFamily: MONO }}>MI PROGRESO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ScoreRing percent={overallPercent} size={80} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: C.teal }}>{overallPercent}%</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{completedModules} de {MODULES.length}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>módulos completados</div>
                <div style={{ fontSize: 13, color: C.teal, fontWeight: 700, marginTop: 6, fontFamily: MONO }}>{totalBestScore} pts totales</div>
              </div>
            </div>
            {["Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática", "Controllab"].map(cat => {
              const catMods = MODULES.filter(m => m.category === cat); const done = catMods.filter(m => studentProgress[m.id]).length;
              return (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColor(cat), flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.textMid, width: 90, flexShrink: 0 }}>{cat}</span>
                  <MiniBar value={done} max={catMods.length} color={catColor(cat)} />
                  <span style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, flexShrink: 0 }}>{done}/{catMods.length}</span>
                </div>
              );
            })}
          </div>

          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.textDim, marginBottom: 10, fontFamily: MONO }}>CONSEJO DEL DÍA</div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.8, margin: 0 }}>💡 En atención técnica, la <span style={{ color: C.teal, fontWeight: 600 }}>claridad</span> siempre es más valiosa que la complejidad del vocabulario.</p>
          </div>

          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(30,215,96,0.18)", background: "linear-gradient(135deg, rgba(30,215,96,0.06), rgba(6,11,20,0.98))" }}>
            <div style={{ padding: "14px 18px 8px", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Escuchá mientras estudiás</span>
            </div>
            <iframe style={{ borderRadius: "0 0 20px 20px", display: "block" }} src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcOFHFBj89A5?utm_source=generator&theme=0" width="100%" height="152" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
          </div>
        </aside>
      </div>
    </div>
  );
}
