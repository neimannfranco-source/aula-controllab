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

const BG = "#060b14";
const GLASS: React.CSSProperties = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" };
const glassDark: React.CSSProperties = { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)" };
const TEAL = "#2dd4bf";
const TEXT = "#f1f5f9";
const TEXT_MID = "#94a3b8";
const TEXT_DIM = "#475569";
const BORDER = "rgba(255,255,255,0.08)";
const BORDER_A = "rgba(45,212,191,0.35)";
const MONO = "'JetBrains Mono','Fira Code',monospace";
const FONT = "'DM Sans','Inter',sans-serif";

const input: React.CSSProperties = { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", color: TEXT, fontSize: 14, fontFamily: FONT, outline: "none", boxSizing: "border-box" };
const btnAccent: React.CSSProperties = { background: `linear-gradient(135deg,${TEAL},#0d9488)`, color: "#042f2e", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT };
const btnBack: React.CSSProperties = { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, padding: "0 0 8px 0", display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans','Inter',sans-serif" };
const optBtn = (sel: boolean, correct: boolean, wrong: boolean): React.CSSProperties => ({ textAlign: "left", padding: "14px 18px", borderRadius: 14, border: `1px solid ${correct ? "rgba(52,211,153,0.5)" : wrong ? "rgba(251,113,133,0.5)" : sel ? BORDER_A : BORDER}`, background: correct ? "rgba(52,211,153,0.12)" : wrong ? "rgba(251,113,133,0.12)" : sel ? "rgba(45,212,191,0.08)" : "rgba(0,0,0,0.2)", color: correct ? "#34d399" : wrong ? "#fb7185" : sel ? TEAL : TEXT_MID, cursor: "pointer", fontFamily: FONT, fontSize: 14, width: "100%" });

function catColor(cat: string): string {
  const m: Record<string, string> = { Laboratorio: "#60a5fa", Gestión: "#f472b6", Comunicación: "#fb923c", Tecnología: "#a78bfa", Gramática: "#facc15", Controllab: TEAL };
  return m[cat] || TEXT_MID;
}


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
    { question: "¿Cuántos participantes mínimos requiere Controllab para usar estadísticas robustas?", options: ["Más de 5", "12 o más participantes en el grupo de evaluación", "Al menos 20 laboratorios", "30 participantes por rodada"], answer: "12 o más participantes en el grupo de evaluación" },
    { question: "¿Qué tipo de materiales analiza el laboratorio en el EA?", options: ["Sus propias muestras de pacientes", "Materiales desconocidos que simulan pacientes", "Materiales de calibración del fabricante", "Controles internos propios del laboratorio"], answer: "Materiales desconocidos que simulan pacientes" },
    { question: "¿Cuál es la respuesta correcta ante un resultado inadecuado en un EA?", options: ["Ignorarlo si el control interno estaba bien", "Investigación sistemática de la causa raíz con documentación y verificación de acciones correctivas", "Repetir el ensayo hasta obtener un resultado satisfactorio", "Cambiar de proveedor del programa de EA"], answer: "Investigación sistemática de la causa raíz con documentación y verificación de acciones correctivas" },
    { question: "¿Para qué se usan los resultados del EA externamente?", options: ["Solo para uso interno del laboratorio", "Para comprobación de capacidad técnica, diferencial frente a la competencia y requisitos de acreditación", "Solo para auditorías internas", "Solo para cumplir con ANVISA"], answer: "Para comprobación de capacidad técnica, diferencial frente a la competencia y requisitos de acreditación" },
    { question: "¿Qué diferencia al EA del control interno?", options: ["El EA es más preciso que el control interno", "El control interno evalúa reproducibilidad propia; el EA compara con otros laboratorios", "El EA solo se realiza una vez al año", "No hay diferencia real entre ambos"], answer: "El control interno evalúa reproducibilidad propia; el EA compara con otros laboratorios" },
  ],
  dictation: "El Ensayo de Aptitud es el control externo de la calidad: el laboratorio analiza materiales desconocidos que simulan pacientes y compara sus resultados con los de otros participantes.",
},
{
  id: "controllab-id", title: "Índice de Desvío (ID) de Controllab", level: "Avanzado", category: "Controllab", emoji: "📐",
  description: "El indicador principal de desempeño de Controllab: cálculo, interpretación y uso.",
  readingTitle: "¿Por qué Controllab usa el ID?",
  reading: [
    "Controllab utiliza el Índice de Desvío (ID) como indicador principal del desempeño cuantitativo en sus programas de Ensayo de Aptitud (EA). El ID tiene un propósito similar al Índice Z (Z-escore), pero con una diferencia conceptual importante: mientras el Z-escore relativiza el error frente a la variación del grupo comparativo, el ID relativiza el error frente al criterio del propio proveedor.",
    "La fórmula del ID es: ID = (resultado del laboratorio − valor alvo) / límite del programa. El valor alvo es la media o mediana del grupo de evaluación tras el tratamiento estadístico. El límite es el criterio de aceptación definido por Controllab para ese ensayo. Un ID entre -1 y +1 indica resultado adecuado.",
    "La ventaja práctica del ID es que permite comparar el desempeño entre diferentes ensayos de forma directa. Como siempre se relativiza frente al mismo criterio, un ID de 0.8 en glucosa y un ID de 0.8 en hemoglobina tienen exactamente el mismo significado relativo. Esto facilita la visualización de tendencias en programas con paneles múltiples.",
    "El ID también permite visualizar tendencias: si el ID se acerca progresivamente a 1 o a -1 en rodadas sucesivas, es una señal de alerta incluso antes de que el resultado sea inadecuado.",
    "El Índice Z del Grupo de Evaluación (GA) también está disponible en algunos ensayos clínicos, calculado como: Z (GA) = (resultado − média do GA) / desvio padrão do GA. Pero el indicador principal de desempeño en Controllab es siempre el ID, no el Z-escore.",
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
    { question: "¿Cuál es la fórmula del Índice de Desvío (ID)?", options: ["ID = resultado / valor alvo", "ID = (resultado − valor alvo) / límite del programa", "ID = (resultado − média) / desvio padrão do grupo", "ID = resultado × límite / valor alvo"], answer: "ID = (resultado − valor alvo) / límite del programa" },
    { question: "¿Qué indica un ID entre -1 y +1?", options: ["Resultado inadecuado que requiere investigación", "Resultado dentro del criterio de evaluación: adecuado", "Zona de alerta que debe monitorearse", "Resultado excelente que supera el promedio del grupo"], answer: "Resultado dentro del criterio de evaluación: adecuado" },
    { question: "¿Cuál es la diferencia conceptual principal entre el ID y el Z-escore?", options: ["El ID usa la mediana y el Z-escore usa la media", "El ID relativiza el error frente al criterio del proveedor; el Z-escore frente a la variación del grupo comparativo", "El Z-escore es más preciso que el ID", "Solo difieren en el nombre, el cálculo es idéntico"], answer: "El ID relativiza el error frente al criterio del proveedor; el Z-escore frente a la variación del grupo comparativo" },
    { question: "¿Por qué el ID facilita la comparación entre ensayos distintos?", options: ["Porque usa el mismo equipo para todos", "Porque siempre se relativiza frente al mismo criterio, haciendo comparables los ID de diferentes analitos", "Porque los valores de referencia son iguales para todos", "Solo para ensayos del mismo grupo analítico"], answer: "Porque siempre se relativiza frente al mismo criterio, haciendo comparables los ID de diferentes analitos" },
    { question: "¿Qué señal de alerta puede detectarse con el ID antes de un resultado inadecuado?", options: ["Un ID exactamente igual a 0 en varias rodadas", "Un ID que se acerca progresivamente a 1 o a -1 en rodadas sucesivas", "Un ID que varía aleatoriamente entre -0.5 y 0.5", "Un ID negativo en todos los resultados"], answer: "Un ID que se acerca progresivamente a 1 o a -1 en rodadas sucesivas" },
    { question: "¿Qué es el valor alvo en el programa de Controllab?", options: ["El valor del control interno del laboratorio", "La media o mediana del grupo de evaluación tras el tratamiento estadístico", "El límite máximo de la faja de evaluación", "El resultado del laboratorio de referencia"], answer: "La media o mediana del grupo de evaluación tras el tratamiento estadístico" },
    { question: "¿El Z-escore reemplaza al ID como indicador principal en Controllab?", options: ["Sí, el Z-escore es siempre el indicador principal", "No, el ID es el indicador principal; el Z-escore del GA es información complementaria en algunos ensayos", "Son equivalentes y el laboratorio elige cuál usar", "Solo el Z-escore está acreditado por el Cgcre"], answer: "No, el ID es el indicador principal; el Z-escore del GA es información complementaria en algunos ensayos" },
    { question: "¿En qué documento de Controllab aparece el ID del laboratorio?", options: ["Solo en el Certificado de Proficiência anual", "En el Relatório de Avaliação de cada rodada junto con la evaluación A o I", "Solo en el Perfil de Resultados del grupo", "En la Certidão de Inscrição"], answer: "En el Relatório de Avaliação de cada rodada junto con la evaluación A o I" },
    { question: "¿Cuándo se oculta el ID en el Relatório de Avaliação?", options: ["Siempre que el resultado sea inadecuado", "Cuando los datos no permiten usar medida de tendencia central, cuando son ensayos calculados o cuando el resultado tiene signo > o <", "Solo cuando el grupo tiene menos de 12 participantes", "Solo cuando el ID es mayor que 2"], answer: "Cuando los datos no permiten usar medida de tendencia central, cuando son ensayos calculados o cuando el resultado tiene signo > o <" },
    { question: "¿Qué diferencia conceptual existe entre el ID y el Z-escore como herramientas de mejora?", options: ["No hay diferencia conceptual relevante", "El ID dice si el resultado cumple el estándar de calidad; el Z-escore dice si el resultado es similar o diferente al de los pares", "El Z-escore siempre es más estricto que el ID", "Solo el ID es una herramienta de mejora; el Z-escore es solo estadístico"], answer: "El ID dice si el resultado cumple el estándar de calidad; el Z-escore dice si el resultado es similar o diferente al de los pares" },
  ],
  dictation: "El Índice de Desvío de Controllab se calcula dividiendo la diferencia entre el resultado y el valor alvo por el límite del programa: un ID entre menos uno y más uno indica resultado adecuado.",
},
{
  id: "controllab-rodada", title: "La rodada del EA: paso a paso", level: "Básico", category: "Controllab", emoji: "🔄",
  description: "Cómo funciona una rodada completa del Ensayo de Aptitud de Controllab.",
  readingTitle: "Desde el envío de la muestra hasta el certificado",
  reading: [
    "Una rodada del Ensayo de Aptitud (EA) de Controllab es una ronda completa: desde la distribución de los materiales hasta la emisión del informe de evaluación. Cada rodada tiene una identificación única formada por el mes (tres caracteres) y el año (cuatro dígitos) correspondientes al envío.",
    "El proceso comienza cuando Controllab distribuye los materiales junto con una Lista de Verificação que detalla los ítems enviados, las condiciones de almacenamiento y los plazos. El participante verifica que todos los materiales llegaron en condiciones correctas.",
    "El laboratorio analiza los materiales como si fueran muestras de pacientes, usando sus métodos y equipos de rutina. No debe intercambiar información con otros participantes durante la rodada. Los resultados se reportan en el Sistema Online dentro del plazo con el sistema analítico correcto seleccionado.",
    "Controllab aplica el tratamiento estadístico con el Grupo Assessor y emite el Relatório de Avaliação con los resultados individuales, el ID de cada ítem, la faja de evaluación y los comentarios técnicos. El Perfil de Resultados complementa el informe con el resumen estadístico de todos los participantes.",
    "A lo largo del año, el desempeño se acumula en el porcentaje de adecuados (%A). Al final del año, si el laboratorio alcanzó el grau de desempenho mínimo, recibe el Certificado de Proficiência. Para la mayoría de los ensayos el mínimo es 80%; para ensayos críticos de hemoterapia como Anti-HIV es 100%.",
  ],
  vocab: [
    { es: "rodada / ronda", pt: "rodada" },
    { es: "plazo de envío de resultados", pt: "prazo de envio de resultados" },
    { es: "Relatório de Avaliação", pt: "Relatório de Avaliação" },
    { es: "porcentaje de adecuados (%A)", pt: "percentual de adequados (%A)" },
    { es: "grau de desempeño mínimo", pt: "grau de desempenho mínimo" },
    { es: "Certificado de Proficiência", pt: "Certificado de Proficiência" },
  ],
  quiz: [
    { question: "¿Cómo se identifica cada rodada del EA de Controllab?", options: ["Con el número de participante del laboratorio", "Con el mes (tres caracteres) y el año (cuatro dígitos) correspondientes al envío", "Con un código alfanumérico asignado al azar", "Con el número del Certificado anterior"], answer: "Con el mes (tres caracteres) y el año (cuatro dígitos) correspondientes al envío" },
    { question: "¿Cómo debe analizar el laboratorio los materiales de la rodada?", options: ["Con métodos especiales diseñados para el EA", "Como si fueran muestras de pacientes, usando métodos y equipos de rutina", "Repitiendo el análisis tres veces para mayor precisión", "Solo en el horario que indique Controllab"], answer: "Como si fueran muestras de pacientes, usando métodos y equipos de rutina" },
    { question: "¿Qué está prohibido durante la rodada?", options: ["Repetir el análisis si el resultado parece incorrecto", "Intercambiar información de resultados con otros participantes", "Usar el sistema analítico habitual de la rutina", "Analizar los materiales antes del plazo límite"], answer: "Intercambiar información de resultados con otros participantes" },
    { question: "¿Qué contiene el Relatório de Avaliação?", options: ["Solo el resultado final de adecuado o inadecuado", "Resultados individuales, ID de cada ítem, faja de evaluación y comentarios del Grupo Assessor", "Solo los comentarios técnicos del grupo assessor", "Solo el Certificado de Proficiência del año"], answer: "Resultados individuales, ID de cada ítem, faja de evaluación y comentarios del Grupo Assessor" },
    { question: "¿Cuál es el grau de desempeño mínimo para la mayoría de los ensayos?", options: ["100% sin excepción", "80% para la mayoría de los ensayos", "70% para todos los ensayos", "90% para todos los ensayos"], answer: "80% para la mayoría de los ensayos" },
    { question: "¿Para qué ensayos el mínimo es 100%?", options: ["Para todos los ensayos de hemoterapia", "Para ensayos críticos como Anti-HIV, Sistema ABO, Sistema Rhesus, Prova Cruzada y NAT", "Solo para Anti-HIV y Anti-HCV", "Para todos los ensayos de microbiología"], answer: "Para ensayos críticos como Anti-HIV, Sistema ABO, Sistema Rhesus, Prova Cruzada y NAT" },
    { question: "¿Qué acumula el indicador %A a lo largo del año?", options: ["El número total de rodadas participadas", "El porcentaje de resultados adecuados acumulado en todos los ensayos del año", "El número de ensayos certificados", "El promedio del ID de todas las rodadas"], answer: "El porcentaje de resultados adecuados acumulado en todos los ensayos del año" },
    { question: "¿Qué es la Rodada Especial de Controllab?", options: ["Una rodada con materiales más difíciles para laboratorios avanzados", "Una rodada de recuperación al final del año para participantes que no alcanzaron el %A mínimo", "Una rodada adicional gratuita para todos los participantes", "Una rodada solo para ensayos de hemoterapia"], answer: "Una rodada de recuperación al final del año para participantes que no alcanzaron el %A mínimo" },
    { question: "¿Qué ocurre con el año para el programa de Controllab?", options: ["Comienza en enero y termina en diciembre", "Comienza en el 4to trimestre del año anterior y termina en el 3er trimestre del año vigente", "Siempre sigue el año calendario exacto", "Comienza cuando el laboratorio se inscribe"], answer: "Comienza en el 4to trimestre del año anterior y termina en el 3er trimestre del año vigente" },
  ],
  dictation: "En cada rodada el laboratorio analiza los materiales con sus métodos habituales y reporta los resultados en el Sistema Online dentro del plazo para obtener su Relatório de Avaliação.",
},
{
  id: "controllab-sistema-online", title: "Sistema Online de Controllab", level: "Básico", category: "Controllab", emoji: "💻",
  description: "Cómo usar el Sistema Online: envío de resultados, informes y gestión del programa.",
  readingTitle: "La herramienta que está siempre disponible",
  reading: [
    "El Sistema Online de Controllab es la plataforma digital a través de la cual los laboratorios participantes interactúan con el programa de Ensayo de Aptitud (EA). Es la herramienta central para el envío de resultados, el acceso a informes, la descarga de documentos y la gestión de los datos del programa.",
    "Cada laboratorio debe designar un administrador indicado por el establecimiento participante para: enviar los resultados de los ítems analizados a cada rodada; acceder e imprimir documentos y avaliações; delegar acceso a otros profesionales del establecimiento; y acceder a materiales exclusivos para clientes Controllab.",
    "El envío de resultados es la función más crítica. El participante debe seleccionar correctamente el sistema analítico (fabricante del kit, método, equipamiento, temperatura, unidad) antes de ingresar el resultado. Si el sistema no está disponible, puede completarse manualmente y subirse la documentación en el campo de Pendências.",
    "Una regla fundamental: los campos no deben llenarse con cero cuando un ensayo no fue realizado. El cero se interpreta como resultado real y puede generar evaluación inadecuada. Si el ensayo no fue realizado, deben dejarse todos los campos en blanco para que el ítem no cuente en la pontuação del año. Si fue por causa momentánea, puede solicitarse Não Participação Justificada, una vez por año por ensayo.",
    "Los documentos del programa — Manual do Participante, Instruções de Uso, Gibi do Controle de Qualidade, informes de cada rodada y Questionários Ilustrados — están disponibles para descarga en el Sistema Online.",
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
    { question: "¿Qué pasa si el sistema analítico del laboratorio no está disponible en el formulario?", options: ["Debe usarse el sistema más parecido disponible", "Puede completarse manualmente y subirse la documentación en el campo de Pendências", "El resultado no puede reportarse esa rodada", "Debe contactarse a Controllab para que lo agreguen"], answer: "Puede completarse manualmente y subirse la documentación en el campo de Pendências" },
    { question: "¿Qué puede hacer el administrador para otros profesionales del establecimiento?", options: ["Solo verlos en el historial", "Delegar acceso con permisos específicos a otros profesionales del establecimiento", "Solo el administrador puede ingresar resultados sin excepciones", "Cambiar la contraseña de acceso de Controllab"], answer: "Delegar acceso con permisos específicos a otros profesionales del establecimiento" },
    { question: "¿Qué documentos están disponibles en el Sistema Online?", options: ["Solo los Relatórios de Avaliação del año en curso", "Manual do Participante, Instruções de Uso, Gibi, informes de cada rodada y Questionários Ilustrados", "Solo el Certificado de Proficiência anual", "Solo los documentos del último año de participación"], answer: "Manual do Participante, Instruções de Uso, Gibi, informes de cada rodada y Questionários Ilustrados" },
    { question: "¿Cuál es el requisito para que Controllab libere el Certificado de Proficiência?", options: ["Solo haber participado en todas las rodadas", "Tener las facturas quitadas y haber alcanzado el grau de desempenho mínimo", "Solo haber obtenido 100% de adecuados", "Solo estar inscripto hace más de un año"], answer: "Tener las facturas quitadas y haber alcanzado el grau de desempenho mínimo" },
  ],
  dictation: "El administrador del Sistema Online de Controllab es responsable de enviar los resultados correctamente, mantener el sistema analítico actualizado y cumplir los plazos de cada rodada.",
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
    { question: "¿Qué es el valor alvo en el informe de Controllab?", options: ["El resultado del laboratorio en esa rodada", "La media (o mediana) de las respuestas del grupo de evaluación tras el tratamiento estadístico", "El valor esperado según el fabricante del reactivo", "El resultado del laboratorio de referencia designado"], answer: "La media (o mediana) de las respuestas del grupo de evaluación tras el tratamiento estadístico" },
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

const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática", "Controllab"];

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
    let mounted = true;
    const LSKEY = "aula-controllab-v7";
    (async () => {
      try { if (supabase) { const remote = await loadRemoteState(); if (!mounted) return; if (remote) { setAppState({ students: Array.isArray(remote.students) && remote.students.length ? remote.students : defaultStudents, currentStudentId: null, progress: remote.progress || {}, dictations: remote.dictations || {} }); setLoadStatus("ready"); return; } } } catch {}
      if (!mounted) return;
      try { const saved = localStorage.getItem(LSKEY); if (saved) { const p = JSON.parse(saved); setAppState({ ...createInitialState(), ...p, currentStudentId: null }); } else setAppState(createInitialState()); } catch { setAppState(createInitialState()); }
      setLoadStatus("ready");
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loadStatus !== "ready") return;
    const LSKEY = "aula-controllab-v7";
    const t = setTimeout(async () => { try { localStorage.setItem(LSKEY, JSON.stringify(appState)); } catch {} if (supabase) { try { await saveRemoteState(appState); } catch {} } }, 500);
    return () => clearTimeout(t);
  }, [appState, loadStatus]);

  useEffect(() => { stopSpeak(); setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setDictationText(""); setDictationResult(null); setQuizAnswers({}); setActiveSection("reading"); }, [selectedModuleId, appState.currentStudentId]); // eslint-disable-line

  const logout = () => { stopSpeak(); setAppState(prev => ({ ...prev, currentStudentId: null })); setSelectedModuleId(MODULES[0].id); setShowProfessorPanel(false); setProfessorUnlocked(false); };
  const login = () => { const found = appState.students.find(s => normalize(s.name) === normalize(loginName) && normalize(s.code) === normalize(loginCode)); if (!found) { setLoginError("Usuario o contraseña incorrectos."); return; } setAppState(prev => ({ ...prev, currentStudentId: found.id })); setLoginError(""); setLoginName(""); setLoginCode(""); };
  const changePassword = () => { if (!newPassword.trim()) { setPasswordMsg("Escribí una contraseña nueva."); return; } if (newPassword.trim().length < 4) { setPasswordMsg("La contraseña debe tener al menos 4 caracteres."); return; } if (newPassword.trim() !== confirmPassword.trim()) { setPasswordMsg("Las contraseñas no coinciden."); return; } if (!currentStudent) return; setAppState(prev => ({ ...prev, students: prev.students.map(s => s.id === currentStudent.id ? { ...s, code: newPassword.trim().toUpperCase() } : s) })); setPasswordMsg("✓ Contraseña actualizada correctamente."); setNewPassword(""); setConfirmPassword(""); setTimeout(() => { setShowChangePassword(false); setPasswordMsg(""); }, 1500); };
  const handleProfessorClick = () => { if (professorUnlocked) { setShowProfessorPanel(v => !v); return; } const pwd = window.prompt("Contraseña del profesor:"); if (pwd === PROFESSOR_PASSWORD) { setProfessorUnlocked(true); setShowProfessorPanel(true); } else if (pwd !== null) alert("Contraseña incorrecta."); };
  const saveProgress = (scoreValue: number, totalValue: number) => { if (!currentStudent) return; setAppState(prev => { const prevSP = prev.progress[currentStudent.id] || {}; const prevM = prevSP[selectedModuleId] || { completed: false, score: 0, total: totalValue, attempts: 0 }; return { ...prev, progress: { ...prev.progress, [currentStudent.id]: { ...prevSP, [selectedModuleId]: { completed: true, score: Math.max(prevM.score || 0, scoreValue), total: totalValue, attempts: (prevM.attempts || 0) + 1 } } } }; }); };
  const resetCurrentModule = () => { if (!currentStudent) return; if (!window.confirm(`¿Reiniciar el módulo "${selectedModule.title}" para ${currentStudent.name}?`)) return; setAppState(prev => { const newP = { ...(prev.progress[currentStudent.id] || {}) }; const newD = { ...(prev.dictations[currentStudent.id] || {}) }; delete newP[selectedModuleId]; delete newD[selectedModuleId]; return { ...prev, progress: { ...prev.progress, [currentStudent.id]: newP }, dictations: { ...prev.dictations, [currentStudent.id]: newD } }; }); setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setQuizAnswers({}); setDictationText(""); setDictationResult(null); setActiveSection("reading"); };
  const resetStudentModule = (studentId: string, moduleId: string) => { setAppState(prev => { const newP = { ...(prev.progress[studentId] || {}) }; const newD = { ...(prev.dictations[studentId] || {}) }; delete newP[moduleId]; delete newD[moduleId]; return { ...prev, progress: { ...prev.progress, [studentId]: newP }, dictations: { ...prev.dictations, [studentId]: newD } }; }); };
  const resetStudentAll = (studentId: string, studentName: string) => { if (!window.confirm(`¿Reiniciar TODOS los módulos de ${studentName}?`)) return; setAppState(prev => ({ ...prev, progress: { ...prev.progress, [studentId]: {} }, dictations: { ...prev.dictations, [studentId]: {} } })); };
  const resetAllStudents = () => { if (!window.confirm("¿Borrar TODO el progreso de TODOS los alumnos?")) return; setAppState(prev => ({ ...prev, progress: {}, dictations: {} })); };
  const handleSubmit = () => { if (!selectedOption) return; setSubmitted(true); };
  const handleNext = () => { if (currentQuestionIndex < selectedModule.quiz.length - 1) { const next = currentQuestionIndex + 1; setCurrentQuestionIndex(next); setSelectedOption(quizAnswers[next] || ""); setSubmitted(false); return; } const correct = selectedModule.quiz.reduce((sum, q, i) => sum + (quizAnswers[i] === q.answer ? 1 : 0), 0); saveProgress(correct, selectedModule.quiz.length); setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setQuizAnswers({}); setActiveSection("reading"); };
  const setAnswerMemory = (value: string) => { setSelectedOption(value); setQuizAnswers(prev => ({ ...prev, [currentQuestionIndex]: value })); };
  const addStudent = () => { if (!newStudentName.trim() || !newStudentCode.trim()) return; const exists = appState.students.some(s => normalize(s.name) === normalize(newStudentName) || normalize(s.code) === normalize(newStudentCode)); if (exists) { alert("Ese alumno o código ya existe."); return; } const id = `${normalize(newStudentName)}-${Date.now()}`; setAppState(prev => ({ ...prev, students: [...prev.students, { id, name: newStudentName.trim(), code: newStudentCode.trim().toUpperCase() }] })); setNewStudentName(""); setNewStudentCode(""); };
  const removeStudent = (studentId: string) => { const student = appState.students.find(s => s.id === studentId); if (!window.confirm(`¿Eliminar a ${student?.name || "este alumno"}?`)) return; setAppState(prev => { const newStudents = prev.students.filter(s => s.id !== studentId); const newP = { ...prev.progress }; const newD = { ...prev.dictations }; delete newP[studentId]; delete newD[studentId]; return { ...prev, students: newStudents, progress: newP, dictations: newD }; }); };
  const checkDictation = () => { if (!currentStudent) return; const expected = normalize(selectedModule.dictation); const written = normalize(dictationText); const expWords = expected.split(" ").filter(Boolean); const wrtWords = written.split(" ").filter(Boolean); const matches = wrtWords.filter((w, i) => w === expWords[i]).length; const score = expWords.length ? Math.round((matches / expWords.length) * 100) : 0; const result: DictationResult = { exact: expected === written, score, written: dictationText, expected: selectedModule.dictation, updatedAt: new Date().toLocaleString() }; setDictationResult(result); setAppState(prev => ({ ...prev, dictations: { ...prev.dictations, [currentStudent.id]: { ...(prev.dictations[currentStudent.id] || {}), [selectedModuleId]: result } } })); };

  const professorRows = useMemo(() => appState.students.map(student => { const progress = appState.progress[student.id] || {}; const dictations = appState.dictations[student.id] || {}; const completedMods = Object.keys(progress).length; const bestScore = MODULES.reduce((sum, m) => sum + (progress[m.id]?.score || 0), 0); const dictScores = MODULES.map(m => dictations[m.id]?.score).filter((v): v is number => typeof v === "number"); const dictAvg = dictScores.length ? Math.round(dictScores.reduce((a, b) => a + b, 0) / dictScores.length) : null; return { ...student, completedMods, bestScore, dictAvg }; }), [appState]);

  if (loadStatus === "loading") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, fontFamily: FONT }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 16 }}>⚗️</div><div style={{ color: TEXT_MID, fontSize: 15 }}>Cargando Aula Controllab...</div></div>
    </div>
  );

  const ProfessorPanel = () => (
    <div style={{ ...GLASS, borderRadius: 20, padding: 24, marginTop: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" as const }}>
        {(["progress", "students", "dictations"] as const).map(t => (
          <button key={t} onClick={() => setTeacherTab(t)} style={{ borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: teacherTab === t ? TEAL : "rgba(255,255,255,0.06)", color: teacherTab === t ? "#042f2e" : TEXT_MID, fontFamily: FONT }}>
            {t === "progress" ? "📊 Progreso" : t === "students" ? "👥 Alumnos" : "🎙 Dictados"}
          </button>
        ))}
        <button onClick={resetAllStudents} style={{ borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: "rgba(251,113,133,0.15)", color: "#fb7185", fontFamily: FONT, marginLeft: "auto" }}>🗑 Borrar todo</button>
      </div>
      {teacherTab === "progress" && (
        <div style={{ maxHeight: 380, overflowY: "auto" as const }}>
          {professorRows.map(row => (
            <div key={row.id} style={{ ...glassDark, borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const }}>
              <div style={{ flex: 1, minWidth: 120 }}><div style={{ fontWeight: 600, fontSize: 14, color: TEXT, fontFamily: FONT }}>{row.name}</div><div style={{ fontSize: 11, color: TEXT_DIM, fontFamily: MONO }}>{row.completedMods}/{MODULES.length} mód · {row.bestScore} pts</div></div>
              <button onClick={() => resetStudentAll(row.id, row.name)} style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>Reset</button>
            </div>
          ))}
        </div>
      )}
      {teacherTab === "dictations" && (
        <div style={{ maxHeight: 380, overflowY: "auto" as const }}>
          {professorRows.map(row => (
            <div key={row.id} style={{ ...glassDark, borderRadius: 14, padding: "12px 16px", marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: TEXT, fontFamily: FONT, marginBottom: 6 }}>{row.name} {row.dictAvg !== null && <span style={{ fontFamily: MONO, fontSize: 12, color: TEAL }}>avg {row.dictAvg}%</span>}</div>
              {MODULES.filter(m => appState.dictations[row.id]?.[m.id]).map(m => { const d = appState.dictations[row.id][m.id]; return (<div key={m.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: 12, color: TEXT_MID, fontFamily: FONT, flex: 1 }}>{m.emoji} {m.title}</span><span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: d.score >= 80 ? "#34d399" : d.score >= 50 ? "#fbbf24" : "#fb7185" }}>{d.score}%</span><button onClick={() => resetStudentModule(row.id, m.id)} style={{ background: "rgba(251,113,133,0.1)", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>×</button></div>); })}
              {!MODULES.some(m => appState.dictations[row.id]?.[m.id]) && <div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: FONT }}>Sin dictados aún</div>}
            </div>
          ))}
        </div>
      )}
      {teacherTab === "students" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Nombre" style={{ ...input, flex: 2 }} />
            <input value={newStudentCode} onChange={e => setNewStudentCode(e.target.value)} placeholder="Código" style={{ ...input, flex: 1 }} />
            <button onClick={addStudent} style={{ ...btnAccent, padding: "0 16px", whiteSpace: "nowrap" as const }}>+ Agregar</button>
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto" as const }}>
            {appState.students.map(s => (<div key={s.id} style={{ ...glassDark, borderRadius: 12, padding: "10px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1, fontSize: 14, color: TEXT, fontFamily: FONT }}>{s.name}</div><div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: MONO }}>{s.code}</div><button onClick={() => removeStudent(s.id)} style={{ background: "transparent", border: "none", color: "#fb7185", cursor: "pointer", fontSize: 16 }}>×</button></div>))}
          </div>
        </div>
      )}
    </div>
  );

  if (!currentStudent) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔬</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>Aula Controllab</h1>
          <p style={{ color: TEXT_MID, fontSize: 14, marginTop: 8 }}>Español técnico para profesionales del laboratorio</p>
        </div>
        <div style={{ ...GLASS, borderRadius: 24, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: "0 0 24px" }}>Iniciar sesión</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Tu nombre" style={input} onKeyDown={e => e.key === "Enter" && login()} />
            <input value={loginCode} onChange={e => setLoginCode(e.target.value)} placeholder="Contraseña" type="password" style={input} onKeyDown={e => e.key === "Enter" && login()} />
            {loginError && <div style={{ color: "#fb7185", fontSize: 13 }}>{loginError}</div>}
            <button onClick={login} style={{ ...btnAccent, width: "100%", textAlign: "center" as const }}>Entrar →</button>
          </div>
        </div>
        <button onClick={handleProfessorClick} style={{ marginTop: 16, width: "100%", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 16px", color: TEXT_DIM, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>
          👨‍🏫 Panel del profesor
        </button>
        {showProfessorPanel && professorUnlocked && <ProfessorPanel />}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: FONT }}>
      <header style={{ ...GLASS, borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 20 }}>🔬</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>Aula Controllab</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 6, overflowX: "auto" as const }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: activeCategory === cat ? TEAL : "rgba(255,255,255,0.06)", color: activeCategory === cat ? "#042f2e" : TEXT_MID, fontFamily: FONT, whiteSpace: "nowrap" as const }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => { setShowChangePassword(v => !v); setShowProfessorPanel(false); }} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "6px 12px", fontSize: 12, color: TEXT_MID, cursor: "pointer", fontFamily: FONT }}>🔑</button>
            <button onClick={handleProfessorClick} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "6px 12px", fontSize: 12, color: TEXT_MID, cursor: "pointer", fontFamily: FONT }}>👨‍🏫</button>
            <div style={{ ...glassDark, borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600 }}>{currentStudent.name}</div>
            <button onClick={logout} style={{ background: "rgba(251,113,133,0.15)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 10, padding: "6px 12px", fontSize: 12, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>Salir</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        {showChangePassword && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ ...GLASS, borderRadius: 20, padding: 24, maxWidth: 420 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Cambiar contraseña</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña" style={input} />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" style={input} />
                {passwordMsg && <div style={{ fontSize: 13, color: passwordMsg.startsWith("✓") ? "#34d399" : "#fb7185" }}>{passwordMsg}</div>}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={changePassword} style={{ ...btnAccent, flex: 1 }}>Guardar</button>
                  <button onClick={() => { setShowChangePassword(false); setPasswordMsg(""); setNewPassword(""); setConfirmPassword(""); }} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px", fontSize: 14, color: TEXT_MID, cursor: "pointer", fontFamily: FONT }}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showProfessorPanel && professorUnlocked && <ProfessorPanel />}
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" as const }}>
            <div style={{ fontSize: 40 }}>{selectedModule.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const, marginBottom: 6 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{selectedModule.title}</h2>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.07)", color: catColor(selectedModule.category), fontFamily: MONO }}>{selectedModule.category}</span>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: TEXT_DIM, fontFamily: MONO }}>{selectedModule.level}</span>
              </div>
              <p style={{ color: TEXT_MID, fontSize: 14, margin: 0 }}>{selectedModule.description}</p>
            </div>
            <button onClick={resetCurrentModule} style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 12, padding: "8px 14px", fontSize: 12, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>🔄 Reiniciar</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 20, flexWrap: "wrap" as const }}>
            {(["reading", "vocab", "quiz", "dictation"] as const).map(sec => {
              const labels: Record<string, string> = { reading: "📖 Lectura", vocab: "📝 Vocabulario", quiz: "🧠 Quiz", dictation: "🎙 Dictado" };
              const active = activeSection === sec;
              return (<button key={sec} onClick={() => setActiveSection(sec)} style={{ borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 600, border: `1px solid ${active ? BORDER_A : BORDER}`, cursor: "pointer", background: active ? "rgba(45,212,191,0.1)" : "rgba(255,255,255,0.04)", color: active ? TEAL : TEXT_MID, fontFamily: FONT }}>{labels[sec]}</button>);
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          <div>
            {activeSection === "reading" && (
              <div style={{ ...GLASS, borderRadius: 24, padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap" as const, gap: 12 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selectedModule.readingTitle}</h3>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => speak(selectedModule.reading.join(" "), 0.9)} style={{ ...GLASS, borderRadius: 12, padding: "9px 16px", fontSize: 13, color: TEXT_MID, cursor: "pointer", fontFamily: FONT }}>🔊 Escuchar</button>
                    <button onClick={stopSpeak} style={{ borderRadius: 12, padding: "9px 16px", fontSize: 13, fontWeight: 600, background: "rgba(244,63,94,0.15)", color: "#fda4af", border: "1px solid rgba(244,63,94,0.3)", cursor: "pointer", fontFamily: FONT }}>⏹ Stop</button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {selectedModule.reading.map((para, i) => <p key={i} style={{ lineHeight: 1.9, color: "#cbd5e1", fontSize: 15, margin: 0, fontFamily: FONT }}>{para}</p>)}
                </div>
                <button onClick={() => setActiveSection("quiz")} style={{ ...btnAccent, marginTop: 32, display: "inline-block" }}>Ir al quiz →</button>
              </div>
            )}

            {activeSection === "quiz" && (
              <div style={{ ...GLASS, borderRadius: 24, padding: 32 }}>
                <button onClick={() => setActiveSection("reading")} style={btnBack}>← Volver a la lectura</button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap" as const, gap: 12 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Comprensión</h3>
                  <div style={{ ...glassDark, borderRadius: 12, padding: "8px 16px", fontFamily: MONO, fontSize: 14, fontWeight: 700, color: TEAL }}>{currentQuestionIndex + 1}/{selectedModule.quiz.length}</div>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 28, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${((currentQuestionIndex + (submitted ? 1 : 0)) / selectedModule.quiz.length) * 100}%`, background: `linear-gradient(90deg,${TEAL},#67e8f9)`, transition: "width 0.4s ease", borderRadius: 99 }} />
                </div>
                <div style={{ ...glassDark, borderRadius: 20, padding: 24 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.6, fontFamily: FONT }}>{currentQuestion.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {shuffledOpts.map(option => { const sel = selectedOption === option; const correct = submitted && option === currentQuestion.answer; const wrong = submitted && sel && option !== currentQuestion.answer; return (<button key={option} onClick={() => !submitted && setAnswerMemory(option)} disabled={submitted} style={optBtn(sel, correct, wrong)}>{option}</button>); })}
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 16 }}>
                  <div style={{ fontSize: 14, fontFamily: FONT }}>
                    {submitted ? isCorrect ? <span style={{ color: "#34d399", fontWeight: 600 }}>✓ ¡Correcto!</span> : <span style={{ color: "#fb7185" }}>✗ Respuesta: <strong style={{ color: TEXT }}>{currentQuestion.answer}</strong></span> : <span style={{ color: TEXT_MID }}>Elegí una opción.</span>}
                  </div>
                  {!submitted ? <button onClick={handleSubmit} disabled={!selectedOption} style={{ ...btnAccent, opacity: selectedOption ? 1 : 0.4 }}>Comprobar</button> : <button onClick={handleNext} style={btnAccent}>{currentQuestionIndex < selectedModule.quiz.length - 1 ? "Siguiente →" : "Finalizar ✓"}</button>}
                </div>
              </div>
            )}

            {activeSection === "dictation" && (
              <div style={{ ...GLASS, borderRadius: 24, padding: 32 }}>
                <button onClick={() => setActiveSection("reading")} style={btnBack}>← Volver a la lectura</button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap" as const, gap: 12 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>🎙 Dictado</h3>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => speak(selectedModule.dictation, 0.75)} style={{ ...GLASS, borderRadius: 12, padding: "9px 16px", fontSize: 13, color: TEXT_MID, cursor: "pointer", fontFamily: FONT }}>🔊 Reproducir</button>
                    <button onClick={stopSpeak} style={{ borderRadius: 12, padding: "9px 16px", fontSize: 13, fontWeight: 600, background: "rgba(244,63,94,0.15)", color: "#fda4af", border: "1px solid rgba(244,63,94,0.3)", cursor: "pointer", fontFamily: FONT }}>⏹ Stop</button>
                  </div>
                </div>
                <p style={{ color: TEXT_MID, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Escuchá el audio y escribí la frase en español. Podés repetirlo varias veces.</p>
                <textarea value={dictationText} onChange={e => setDictationText(e.target.value)} rows={4} placeholder="Escribí lo que escuchaste..." style={{ ...input, resize: "none" as const, lineHeight: 1.7, borderRadius: 16, padding: "16px 20px" }} />
                <button onClick={checkDictation} style={{ ...btnAccent, marginTop: 16, display: "inline-block" }}>Corregir dictado</button>
                {(dictationResult || currentDictation) && (() => { const r = dictationResult || currentDictation!; return (<div style={{ ...glassDark, borderRadius: 20, padding: 20, marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, color: r.score >= 80 ? "#34d399" : r.score >= 50 ? "#fbbf24" : "#fb7185" }}>{r.score}%</div><div style={{ fontSize: 14, color: TEXT_MID }}>{r.score === 100 ? "¡Perfecto! 🎉" : r.score >= 80 ? "¡Muy bien!" : r.score >= 50 ? "Buen intento" : "Seguí practicando"}</div></div><div style={{ fontSize: 14 }}><span style={{ color: TEXT_MID }}>Frase modelo: </span><span style={{ color: "#cbd5e1", fontStyle: "italic" }}>{r.expected}</span></div></div>); })()}
              </div>
            )}

            {activeSection === "vocab" && (
              <div style={{ ...GLASS, borderRadius: 24, padding: 32 }}>
                <button onClick={() => setActiveSection("reading")} style={btnBack}>← Volver a la lectura</button>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>📝 Vocabulario clave</h3>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
                  {selectedModule.vocab.map(item => (
                    <div key={item.es} style={{ ...glassDark, borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <div><div style={{ fontWeight: 600, fontSize: 14, fontFamily: FONT }}>{item.es}</div><div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>Español</div></div>
                      <div style={{ textAlign: "right" as const }}><div style={{ fontWeight: 600, fontSize: 14, color: TEAL }}>{item.pt}</div><div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>Portugués</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...GLASS, borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: TEXT_DIM, marginBottom: 16, fontFamily: MONO }}>MI PROGRESO</div>
              <div style={{ fontSize: 52, fontWeight: 800, color: TEAL, fontFamily: MONO, lineHeight: 1 }}>{overallPercent}%</div>
              <div style={{ color: TEXT_MID, fontSize: 13, marginTop: 4 }}>completado</div>
              <div style={{ marginTop: 16, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${overallPercent}%`, background: `linear-gradient(90deg,${TEAL},#67e8f9)`, boxShadow: "0 0 12px rgba(45,212,191,0.35)", transition: "width 0.7s ease" }} />
              </div>
              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[{ n: completedModules, l: "Módulos" }, { n: totalBestScore, l: "Puntos", c: TEAL }].map(x => (
                  <div key={x.l} style={{ ...glassDark, borderRadius: 14, padding: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: MONO, color: x.c || TEXT }}>{x.n}</div>
                    <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 2 }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...GLASS, borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: TEXT_DIM, marginBottom: 16, fontFamily: MONO }}>MÓDULOS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 480, overflowY: "auto" as const, paddingRight: 4 }}>
                {filteredModules.map(m => { const p = studentProgress[m.id]; const isA = m.id === selectedModuleId; return (
                  <button key={m.id} onClick={() => setSelectedModuleId(m.id)} style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, padding: "10px 12px", background: isA ? "rgba(45,212,191,0.08)" : "transparent", border: `1px solid ${isA ? BORDER_A : "transparent"}`, cursor: "pointer", textAlign: "left" as const, width: "100%" }}>
                    <span style={{ fontSize: 16 }}>{m.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: isA ? 700 : 500, color: isA ? TEXT : "#94a3b8", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: catColor(m.category), marginTop: 1, fontFamily: MONO }}>{m.category}</div>
                    </div>
                    {p ? <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: TEAL, whiteSpace: "nowrap" as const }}>{p.score}/{p.total}</span> : <span style={{ color: TEXT_DIM, fontSize: 12 }}>—</span>}
                  </button>
                ); })}
              </div>
            </div>

            <div style={{ ...GLASS, borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: TEXT_DIM, marginBottom: 12, fontFamily: MONO }}>CONSEJO DEL DÍA</div>
              <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, margin: 0, fontFamily: FONT }}>💡 Cuando uses términos técnicos con un cliente, la <span style={{ color: TEAL, fontWeight: 600 }}>claridad</span> siempre es más importante que la complejidad del vocabulario.</p>
            </div>

            <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid rgba(30,215,96,0.2)", background: "linear-gradient(135deg,rgba(30,215,96,0.07),rgba(6,11,20,0.95))" }}>
              <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: FONT }}>Escuchá mientras estudiás</span>
              </div>
              <iframe style={{ borderRadius: "0 0 24px 24px", display: "block" }} src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcOFHFBj89A5?utm_source=generator&theme=0" width="100%" height="152" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
