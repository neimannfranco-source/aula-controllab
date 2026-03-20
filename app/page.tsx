"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjufnjnijkzypnktdxql.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdWZuam5pamt6eXBua3RkeHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzUyMjgsImV4cCI6MjA4OTUxMTIyOH0.VWEtmhvSB8Crtjf2vcoFMJaIiDQ5ejkaQB1B2zEBnbw";
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG      = "#060b14";
const SURFACE = "rgba(15,23,42,0.85)";
const GLASS   = "rgba(255,255,255,0.04)";
const BORDER  = "rgba(255,255,255,0.08)";
const BORDER_A= "rgba(45,212,191,0.35)";
const TEAL    = "#2dd4bf";
const TEXT    = "#f1f5f9";
const TEXT_MID= "#94a3b8";
const TEXT_DIM= "#475569";
const MONO    = "'JetBrains Mono', 'Fira Code', monospace";
const FONT    = "'DM Sans', 'Inter', sans-serif";

const glass: React.CSSProperties = {
  background: GLASS,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${BORDER}`,
};
const glassDark: React.CSSProperties = {
  background: "rgba(0,0,0,0.25)",
  border: `1px solid ${BORDER}`,
};
const input: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.3)",
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  padding: "12px 16px",
  color: TEXT,
  fontSize: 14,
  fontFamily: FONT,
  outline: "none",
  boxSizing: "border-box",
};
const btnAccent: React.CSSProperties = {
  background: `linear-gradient(135deg, ${TEAL}, #0d9488)`,
  color: "#042f2e",
  border: "none",
  borderRadius: 12,
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONT,
  transition: "opacity 0.15s",
};
const optBtn = (sel: boolean, correct: boolean, wrong: boolean): React.CSSProperties => ({
  textAlign: "left",
  padding: "14px 18px",
  borderRadius: 14,
  border: `1px solid ${correct ? "rgba(52,211,153,0.5)" : wrong ? "rgba(251,113,133,0.5)" : sel ? BORDER_A : BORDER}`,
  background: correct ? "rgba(52,211,153,0.12)" : wrong ? "rgba(251,113,133,0.12)" : sel ? "rgba(45,212,191,0.08)" : "rgba(0,0,0,0.2)",
  color: correct ? "#34d399" : wrong ? "#fb7185" : sel ? TEAL : TEXT_MID,
  cursor: "pointer",
  fontFamily: FONT,
  fontSize: 14,
  transition: "all 0.15s",
  width: "100%",
});

function catColor(cat: string): string {
  const m: Record<string, string> = {
    Laboratorio: "#60a5fa", Gestión: "#f472b6",
    Comunicación: "#fb923c", Tecnología: "#a78bfa",
    Gramática: "#facc15", Controllab: TEAL,
  };
  return m[cat] || TEXT_MID;
}

// ─── Modules data ─────────────────────────────────────────────────────────────
const MODULES: ModuleType[] = [
  {
    id: "control-interno", title: "Control interno", level: "Intermedio", category: "Laboratorio", emoji: "🔬",
    description: "Monitoreo analítico, tendencias y decisiones preventivas.",
    readingTitle: "Una desviación que parecía pequeña",
    reading: [
      "Durante una revisión de rutina en el laboratorio de bioquímica, el equipo técnico detectó una desviación en los controles internos de uno de los analitos más procesados de la semana. A primera vista, la diferencia parecía mínima: apenas unos pocos puntos por encima del límite de advertencia establecido en el gráfico de Levey-Jennings. Sin embargo, al comparar los datos actuales con los registros históricos del mes anterior, la imagen fue mucho más preocupante: la tendencia se repetía desde hacía cinco días consecutivos, siempre en la misma dirección.",
      "La supervisora del turno decidió pausar la emisión de resultados y reunir al equipo para hacer una revisión sistemática. Examinaron con detalle los materiales de control utilizados, incluyendo los viales abiertos y los lotes en stock. Revisaron las curvas de calibración recientes para verificar si había habido algún cambio significativo en los últimos días. También inspeccionaron los lotes de reactivos en uso, comparando sus códigos con los registros de recepción.",
      "Después de analizar toda esa información, concluyeron que la causa más probable era una combinación entre una variación dentro del lote del reactivo principal y una calibración que ya no representaba con suficiente precisión el desempeño real del método en las condiciones actuales. Esta es una situación más difícil de detectar que una falla obvia, pero también más frecuente en la práctica diaria del laboratorio.",
      "Como medida preventiva inmediata, suspendieron la liberación de los resultados de ese analito correspondientes a las últimas doce horas. Repitieron las corridas con material de control fresco proveniente de un vial diferente y realizaron una recalibración completa del equipo.",
      "El caso fue documentado como un incidente de calidad y se presentó en la reunión mensual del equipo como ejemplo de buena práctica. Se decidió actualizar el procedimiento de control interno para incluir una alerta automática cuando tres puntos consecutivos superen el límite de advertencia en la misma dirección.",
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
      { question: "¿Cómo se comunicaron los resultados fuera de rango al repetirlos?", options: ["No se comunicaron", "Directamente al médico solicitante con explicación", "Por correo electrónico al día siguiente", "Solo se registraron internamente"], answer: "Directamente al médico solicitante con explicación" },
      { question: "¿Qué mejora preventiva se implementó en el procedimiento?", options: ["Eliminar los controles internos", "Alerta cuando tres puntos consecutivos superen el límite en la misma dirección", "Reducir la frecuencia de los controles", "Cambiar de proveedor de reactivos"], answer: "Alerta cuando tres puntos consecutivos superen el límite en la misma dirección" },
      { question: "¿Por qué es importante identificar tendencias antes del límite de rechazo?", options: ["Para reducir reuniones", "Para evitar errores mayores antes de que ocurran y proteger la calidad", "Para eliminar controles", "Para justificar más personal"], answer: "Para evitar errores mayores antes de que ocurran y proteger la calidad" },
    ],
    dictation: "El equipo detectó una desviación en los controles internos y suspendió la liberación de resultados para proteger la calidad del proceso.",
  },
  {
    id: "westgard", title: "Reglas de Westgard", level: "Intermedio", category: "Laboratorio", emoji: "📊",
    description: "Análisis de reglas y toma de decisiones estadísticas en el laboratorio.",
    readingTitle: "Una alerta en el turno de la mañana",
    reading: [
      "Un lunes a las siete de la mañana, durante la revisión inicial de los controles internos del turno, una analista con varios años de experiencia notó algo que la detuvo. Los valores del control de nivel medio no estaban fuera de rango, pero al mirar la secuencia de los últimos seis puntos en el gráfico de Levey-Jennings, todos caían por debajo de la media, aunque dentro de los límites de advertencia. Ese patrón, conocido como regla 6x, indica que algo está cambiando de forma sistemática en el proceso analítico.",
      "Las reglas de Westgard son un conjunto de criterios estadísticos desarrollados por el Dr. James Westgard en los años setenta para ayudar a los laboratorios a distinguir entre dos tipos de variación: la aleatoria, que es inherente a todo proceso de medición, y la sistemática, que indica un problema real que debe investigarse.",
      "Entre las reglas más utilizadas se encuentran la 1₃ₛ, que es una regla de advertencia cuando un control supera tres desviaciones estándar; la 2₂ₛ, que rechaza la corrida cuando dos controles consecutivos superan dos desviaciones estándar en la misma dirección; la R₄ₛ, que detecta errores aleatorios grandes; y la 4₁ₛ, que señala errores sistemáticos.",
      "En el caso del turno de la mañana, la analista aplicó correctamente la regla 6x y decidió investigar la causa antes de continuar. Repitió los controles con material de un vial diferente del mismo lote y encontró un registro de temperatura que mostraba una leve variación durante la noche.",
      "Comprender las reglas de Westgard no es solo una obligación técnica: es una herramienta de razonamiento analítico que permite actuar con criterio en lugar de reaccionar de forma mecánica.",
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
      { question: "¿Qué indica la regla 2₂ₛ?", options: ["Un control supera 3 desviaciones estándar", "Dos controles consecutivos superan 2 desviaciones en la misma dirección", "Cuatro puntos del mismo lado de la media", "La diferencia entre dos controles supera 4 desviaciones"], answer: "Dos controles consecutivos superan 2 desviaciones en la misma dirección" },
      { question: "¿Qué tipo de error detecta la regla R₄ₛ?", options: ["Error sistemático", "Error aleatorio grande", "Tendencia sostenida", "Error de calibración"], answer: "Error aleatorio grande" },
      { question: "¿Qué hizo la analista antes de decidir sobre la corrida?", options: ["La rechazó inmediatamente sin investigar", "Investigó repitiendo con vial diferente y verificando temperatura", "Llamó al proveedor del reactivo", "Esperó al día siguiente"], answer: "Investigó repitiendo con vial diferente y verificando temperatura" },
      { question: "¿Qué encontraron al investigar la causa del patrón?", options: ["El reactivo estaba vencido", "Una fluctuación de temperatura durante la noche", "Un error del operador", "Una calibración incorrecta"], answer: "Una fluctuación de temperatura durante la noche" },
      { question: "¿Qué valor aporta aplicar correctamente las reglas de Westgard?", options: ["Permite trabajar sin controles", "Demuestra madurez técnica y permite justificar decisiones ante auditorías", "Reduce el tiempo de procesamiento", "Elimina la necesidad de calibrar"], answer: "Demuestra madurez técnica y permite justificar decisiones ante auditorías" },
    ],
    dictation: "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras y a justificar técnicamente cada acción del laboratorio.",
  },
  {
    id: "hemograma", title: "Hemograma completo", level: "Intermedio", category: "Laboratorio", emoji: "🩸",
    description: "Interpretación clínica y comunicación de resultados hematológicos.",
    readingTitle: "Los números que cuentan la historia",
    reading: [
      "El hemograma completo es uno de los análisis más solicitados en cualquier laboratorio clínico. Proporciona datos sobre tres grandes líneas celulares de la sangre: los eritrocitos, cuya función principal es transportar oxígeno; los leucocitos, que son los principales actores del sistema inmune; y las plaquetas, responsables de la hemostasia primaria.",
      "Cuando el analista revisa un hemograma, no solo verifica si los valores individuales están dentro del rango de referencia. También evalúa la coherencia interna del informe: ¿son consistentes entre sí el hematocrito, la hemoglobina y el recuento de glóbulos rojos?",
      "Un aspecto crítico es la detección de hallazgos que requieren acción inmediata, conocidos como valores de pánico. Un recuento de glóbulos blancos extremadamente elevado con morfología anormal puede orientar hacia una leucemia aguda y requiere comunicación urgente al médico.",
      "Los factores preanalíticos son otra fuente importante de variación. La hemólisis de la muestra puede elevar falsamente la hemoglobina libre. Una muestra con microcoágulos invisibles puede dar un recuento de plaquetas falsamente bajo.",
      "Comunicar un hemograma de forma útil al médico implica saber identificar cuáles hallazgos son clínicamente relevantes, cuáles son urgentes y cuáles pueden incluirse como observación en el informe escrito.",
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
    ],
    dictation: "El analista debe identificar los resultados críticos del hemograma y comunicarlos al médico antes de liberar el informe formal.",
  },
  {
    id: "preanalítica", title: "Fase preanalítica", level: "Básico", category: "Laboratorio", emoji: "🩺",
    description: "El origen de la mayoría de los errores: todo lo que ocurre antes del análisis.",
    readingTitle: "El error que ocurrió antes de llegar al laboratorio",
    reading: [
      "Estudios realizados en diferentes países coinciden en un dato sorprendente: entre el sesenta y el setenta por ciento de todos los errores en el laboratorio clínico ocurren durante la fase preanalítica, es decir, antes de que la muestra llegue al analizador.",
      "La fase preanalítica comienza en el momento en que el médico decide solicitar un análisis. Incluye la solicitud médica, la preparación del paciente, la extracción de la muestra, el transporte y la recepción en el laboratorio.",
      "Uno de los errores preanalíticos más frecuentes es la hemólisis, la ruptura de los glóbulos rojos durante o después de la extracción. La hemólisis libera el contenido intracelular al plasma, elevando falsamente marcadores como la potasemia, la LDH y la hemoglobina libre.",
      "El orden de llenado de los tubos es otro aspecto crítico. Si se llena primero un tubo con anticoagulante antes de uno sin anticoagulante, puede producirse contaminación cruzada que afecta los estudios de coagulación.",
      "La gestión de la fase preanalítica requiere una visión sistémica que incluye la formación continua del personal, el diseño de formularios para reducir errores y la instalación de sistemas de trazabilidad como el código de barras.",
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
    ],
    dictation: "Entre el sesenta y el setenta por ciento de los errores del laboratorio ocurren en la fase preanalítica, antes de que la muestra llegue al analizador.",
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
      { question: "¿Cuántos casos de retraso grave se detectaban por semana?", options: ["Más de veinte", "Dos o tres casos con retrasos mayores a cuatro horas", "Ninguno según el indicador global", "Solo uno al mes"], answer: "Dos o tres casos con retrasos mayores a cuatro horas" },
      { question: "¿En qué categorías propuso desagregar el indicador la coordinación?", options: ["Por analista responsable y por turno", "Muestras de rutina, urgentes de ambulatorio y urgentes de internación", "Solo por tipo de análisis solicitado", "Por cliente y por mes"], answer: "Muestras de rutina, urgentes de ambulatorio y urgentes de internación" },
      { question: "¿Por qué un indicador siempre en verde puede ser problemático?", options: ["Nunca es problemático si está en verde", "Puede indicar que se mide lo incorrecto o que el umbral está mal definido", "Indica que el laboratorio funciona perfectamente", "Solo es problema si el cliente se queja"], answer: "Puede indicar que se mide lo incorrecto o que el umbral está mal definido" },
      { question: "¿Cuál es el verdadero valor de un indicador de calidad?", options: ["Estar siempre dentro del rango aceptable", "Orientar decisiones concretas y detectar problemas antes de que sean crisis", "Cumplir formalmente con los requisitos de la norma", "Mostrar resultados positivos al directorio"], answer: "Orientar decisiones concretas y detectar problemas antes de que sean crisis" },
      { question: "¿Quiénes deben participar en la selección de indicadores?", options: ["Solo el área de calidad", "Los profesionales que conocen el proceso desde adentro", "Solo la dirección del laboratorio", "Solo los auditores externos"], answer: "Los profesionales que conocen el proceso desde adentro" },
      { question: "¿Qué estructura de seguimiento se acordó implementar?", options: ["Revisar indicadores solo si hay quejas", "Responsables por indicador, metas específicas, análisis de causa y fechas de revisión", "Solo un informe anual de resultados", "Revisar mensualmente sin asignar responsables"], answer: "Responsables por indicador, metas específicas, análisis de causa y fechas de revisión" },
      { question: "¿Qué transforma a un indicador en una herramienta real de mejora?", options: ["Publicarlo en la cartelera", "La estructura de seguimiento con responsables, fechas y análisis concretos", "Calcularlo con mayor frecuencia", "Compararlo con indicadores de otros laboratorios"], answer: "La estructura de seguimiento con responsables, fechas y análisis concretos" },
    ],
    dictation: "Los indicadores de calidad son útiles solo si se interpretan en contexto, se desagregan correctamente y se usan para tomar decisiones reales de mejora.",
  },
  {
    id: "no-conformidades", title: "No conformidades y CAPA", level: "Intermedio", category: "Gestión", emoji: "⚠️",
    description: "Detección, análisis de causa raíz y acciones correctivas y preventivas.",
    readingTitle: "El mismo error dos veces",
    reading: [
      "El área de calidad registró una nueva no conformidad relacionada con un error en el etiquetado de muestras durante el proceso de recepción. Al revisar el historial, el equipo encontró un incidente casi idéntico registrado seis meses antes, cerrado con una nota de 'informado al personal' pero sin ninguna acción correctiva formal.",
      "La situación planteaba una pregunta necesaria: ¿por qué el mismo error había ocurrido dos veces en el mismo proceso? La respuesta estaba en el tipo de cierre. Informar verbalmente al personal puede generar conciencia momentánea, pero sin un cambio en el proceso, el sistema sigue siendo igualmente vulnerable.",
      "Esta vez, el equipo decidió aplicar un análisis formal de causa raíz usando la técnica de los '5 Por qué'. La causa raíz identificada fue que el procedimiento escrito estaba desactualizado y no reflejaba el flujo real del proceso.",
      "Con la causa raíz identificada, el equipo diseñó una CAPA que incluía la actualización del procedimiento y un control de doble verificación antes de que la muestra avance al siguiente paso.",
      "A los treinta días de implementadas las acciones, se realizó la verificación de eficacia. El indicador de no conformidades relacionadas con el proceso de recepción mostró una reducción del ochenta por ciento.",
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
      { question: "¿Qué tipo de error generó la no conformidad?", options: ["Un resultado incorrecto que fue liberado", "Un tubo asignado al número de solicitud equivocado durante la recepción", "Una muestra perdida durante el proceso", "Un informe enviado con retraso"], answer: "Un tubo asignado al número de solicitud equivocado durante la recepción" },
      { question: "¿Cuándo había ocurrido un incidente similar anteriormente?", options: ["Nunca había ocurrido antes", "Seis meses antes, cerrado sin acción correctiva real", "Un año antes con acción correctiva documentada", "La semana anterior"], answer: "Seis meses antes, cerrado sin acción correctiva real" },
      { question: "¿Por qué informar verbalmente no es suficiente como acción correctiva?", options: ["Porque el personal no escucha", "Sin un cambio en el proceso el sistema sigue siendo igualmente vulnerable", "Porque no queda documentado", "Porque no involucra a la dirección"], answer: "Sin un cambio en el proceso el sistema sigue siendo igualmente vulnerable" },
      { question: "¿Qué técnica de análisis de causa raíz usó el equipo?", options: ["Diagrama de Ishikawa", "Los 5 Por qué", "Análisis de modo de falla", "Diagrama de Pareto"], answer: "Los 5 Por qué" },
      { question: "¿Cuál fue la causa raíz identificada?", options: ["Un error puntual del operador", "El procedimiento escrito estaba desactualizado y no reflejaba el flujo real", "El sistema informático tenía un error", "La capacitación inicial había sido insuficiente"], answer: "El procedimiento escrito estaba desactualizado y no reflejaba el flujo real" },
      { question: "¿Qué acción correctiva se implementó?", options: ["Contratar más personal", "Separación física de solicitudes y control de doble verificación", "Cambiar completamente el sistema informático", "Reducir las solicitudes simultáneas aceptadas"], answer: "Separación física de solicitudes y control de doble verificación" },
      { question: "¿Qué resultado mostró la verificación de eficacia a los 30 días?", options: ["No hubo mejora significativa", "Reducción del 80% en no conformidades relacionadas con el proceso de recepción", "El indicador empeoró con las nuevas medidas", "Los resultados no fueron concluyentes"], answer: "Reducción del 80% en no conformidades relacionadas con el proceso de recepción" },
      { question: "¿Qué uso final se dio al caso dentro del laboratorio?", options: ["Se archivó y nunca se volvió a mencionar", "Se incluyó como ejemplo positivo en el programa de inducción de nuevos analistas", "Se reportó como sanción disciplinaria", "Se usó para justificar una inversión en tecnología"], answer: "Se incluyó como ejemplo positivo en el programa de inducción de nuevos analistas" },
    ],
    dictation: "Una acción correctiva real debe identificar la causa raíz, cambiar el proceso y verificar la eficacia de las acciones implementadas.",
  },
  {
    id: "atencion-cliente", title: "Atención técnica al cliente", level: "Intermedio", category: "Comunicación", emoji: "📞",
    description: "Español profesional para explicar resultados y gestionar consultas técnicas.",
    readingTitle: "Una llamada que exigía claridad",
    reading: [
      "A media mañana, una analista del área de atención al cliente recibió una llamada de un médico clínico que estaba confundido porque el informe de laboratorio de uno de sus pacientes mostraba un valor de creatinina diferente al del mes anterior.",
      "La analista escuchó el planteo completo sin interrumpir. Luego pidió al médico que le confirmara el número de solicitud y el nombre del paciente para poder acceder al historial.",
      "Al revisar el historial, la analista encontró la explicación: el laboratorio había implementado un nuevo método para la determinación de creatinina el mes anterior, con una calibración trazable a un estándar de referencia diferente.",
      "La analista explicó la situación con claridad, describió el cambio de método, la razón del cambio y el impacto clínico real. También se disculpó por no haber comunicado el cambio proactivamente.",
      "La llamada terminó con el médico agradecido. El laboratorio estableció un procedimiento formal para comunicar cualquier cambio de método con al menos quince días de anticipación.",
    ],
    vocab: [
      { es: "duda / consulta", pt: "dúvida / consulta" },
      { es: "informe", pt: "relatório" },
      { es: "validado", pt: "validado" },
      { es: "trazabilidad metrológica", pt: "rastreabilidade metrológica" },
      { es: "transmitir confianza", pt: "transmitir confiança" },
      { es: "comunicación proactiva", pt: "comunicação proativa" },
    ],
    quiz: [
      { question: "¿Por qué llamó el médico al laboratorio?", options: ["Para cambiar de proveedor", "Por una diferencia aparente en el valor de creatinina entre dos meses consecutivos", "Por un error en la factura", "Para solicitar un análisis urgente"], answer: "Por una diferencia aparente en el valor de creatinina entre dos meses consecutivos" },
      { question: "¿Qué hizo la analista mientras buscaba información en el sistema?", options: ["Puso al médico en espera en silencio", "Verbalizó en voz alta lo que estaba haciendo para transmitir atención y profesionalismo", "Le pidió que llamara más tarde", "Le transfirió la llamada"], answer: "Verbalizó en voz alta lo que estaba haciendo para transmitir atención y profesionalismo" },
      { question: "¿Cuál era la causa real de la diferencia en los valores?", options: ["Un error analítico", "Un cambio de método con calibración trazable a un estándar diferente", "Una muestra hemolizada", "Un error de identificación del paciente"], answer: "Un cambio de método con calibración trazable a un estándar diferente" },
      { question: "¿Era clínicamente significativa la diferencia encontrada?", options: ["Sí, requería tratamiento inmediato", "No, la diferencia estaba dentro de la variación biológica normal para ese analito", "Sí, indicaba daño renal progresivo", "No se pudo determinar sin más análisis"], answer: "No, la diferencia estaba dentro de la variación biológica normal para ese analito" },
      { question: "¿Qué ofreció la analista al finalizar la llamada?", options: ["Solo una disculpa verbal", "Enviar una carta técnica con información completa sobre el cambio de método ese mismo día", "Repetir el análisis gratuitamente", "Revertir al método anterior"], answer: "Enviar una carta técnica con información completa sobre el cambio de método ese mismo día" },
      { question: "¿Cuál fue el error que el laboratorio reconoció?", options: ["Que el cambio de método no había sido validado", "Que no había comunicado proactivamente el cambio de método a los médicos", "Que el resultado estaba incorrecto", "Que el médico no había recibido el informe"], answer: "Que no había comunicado proactivamente el cambio de método a los médicos" },
      { question: "¿Qué procedimiento formal se implementó como mejora preventiva?", options: ["Volver a usar siempre el mismo método", "Comunicar a los médicos cualquier cambio de método con al menos 15 días de anticipación", "Solo notificar a los médicos que llamen a preguntar", "Publicar los cambios en el portal"], answer: "Comunicar a los médicos cualquier cambio de método con al menos 15 días de anticipación" },
      { question: "¿Qué lección central transmite este caso?", options: ["Que los médicos deben conocer mejor los métodos analíticos", "Que en atención técnica es necesario anticiparse a las dudas y comunicar proactivamente", "Que los cambios de método deben evitarse", "Que el teléfono es mejor que el correo para comunicar cambios"], answer: "Que en atención técnica es necesario anticiparse a las dudas y comunicar proactivamente" },
    ],
    dictation: "En atención técnica, no alcanza con tener razón: también es necesario comunicar proactivamente para evitar que las dudas se conviertan en problemas.",
  },
  {
    id: "ser-estar", title: "Ser vs. Estar", level: "Básico", category: "Gramática", emoji: "🔄",
    description: "La distinción más importante entre español y portugués: ser y estar.",
    readingTitle: "¿Es o está? La diferencia que cambia el significado",
    reading: [
      "La distinción entre 'ser' y 'estar' es probablemente el aspecto gramatical que más confunde a los hablantes de portugués cuando aprenden español. La regla más general: 'ser' se usa para características que se perciben como permanentes o esenciales, mientras que 'estar' se usa para estados o condiciones temporales.",
      "En el contexto del laboratorio, esta distinción aparece constantemente. 'El reactivo es vencido' es incorrecto: el vencimiento es un estado temporal, por lo que la forma correcta es 'el reactivo está vencido'. De la misma manera, 'el equipo está en mantenimiento' usa estar porque es una condición temporal.",
      "Los adjetivos que funcionan de forma diferente con 'ser' y 'estar' son una fuente constante de confusión. 'El analista es aburrido' significa que tiene una personalidad aburrida como característica permanente. 'El analista está aburrido' significa que en este momento se siente aburrido.",
      "La ubicación y las condiciones físicas o emocionales van casi siempre con 'estar': 'las muestras están en el refrigerador', 'el resultado está validado'. La excepción son los eventos: 'La reunión es en la sala de conferencias'.",
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
    ],
    dictation: "El equipo está en mantenimiento, el resultado está validado y el reactivo está vencido: todos son estados temporales que usan estar, no ser.",
  },
  {
    id: "controllab-historia", title: "Historia de Controllab", level: "Básico", category: "Controllab", emoji: "🏛️",
    description: "Origen, crecimiento y misión de Controllab en el ecosistema de calidad analítica.",
    readingTitle: "De Rio de Janeiro al mundo",
    reading: [
      "Controllab nació en Rio de Janeiro, Brasil, con una visión clara: ayudar a los laboratorios a medir mejor. Desde sus primeros años, la empresa se especializó en el diseño y distribución de programas de control de calidad externo para laboratorios clínicos.",
      "A lo largo de los años, Controllab fue expandiendo su oferta de servicios: incorporó la producción de materiales de referencia, el desarrollo de programas de ensayos de aptitud y la organización de actividades educativas como cursos técnicos, workshops y congresos.",
      "La expansión geográfica de Controllab fue gradual pero sostenida. Partiendo de una base de clientes principalmente brasileños, la empresa fue construyendo presencia en los países hispanohablantes de Latinoamérica, incluyendo Argentina, Chile, Colombia y México.",
      "El foco de Controllab siempre estuvo en la ciencia y en la mejora práctica del laboratorio. Sus programas de ensayos de aptitud están diseñados no solo para evaluar el desempeño de los laboratorios participantes, sino también para educarlos.",
      "Hoy Controllab atiende a miles de laboratorios en toda Latinoamérica, en sectores que van desde la clínica hasta la industria alimentaria, farmacéutica, ambiental y universitaria.",
    ],
    vocab: [
      { es: "ensayo de aptitud", pt: "ensaio de aptidão / proficiência" },
      { es: "control externo de calidad", pt: "controle externo de qualidade" },
      { es: "material de referencia", pt: "material de referência" },
      { es: "metrología", pt: "metrologia" },
      { es: "laboratorio participante", pt: "laboratório participante" },
      { es: "expansión regional", pt: "expansão regional" },
    ],
    quiz: [
      { question: "¿Dónde nació Controllab?", options: ["São Paulo, Brasil", "Rio de Janeiro, Brasil", "Buenos Aires, Argentina", "Bogotá, Colombia"], answer: "Rio de Janeiro, Brasil" },
      { question: "¿Cuál fue el primer foco de especialización de Controllab?", options: ["Producción de materiales de referencia", "Programas de control de calidad externo para laboratorios clínicos", "Consultoría en sistemas de gestión", "Organización de congresos científicos"], answer: "Programas de control de calidad externo para laboratorios clínicos" },
      { question: "¿Qué servicios incorporó Controllab en su expansión?", options: ["Solo control externo de calidad", "Materiales de referencia, ensayos de aptitud y actividades educativas", "Solo consultoría empresarial", "Solo distribución de reactivos"], answer: "Materiales de referencia, ensayos de aptitud y actividades educativas" },
      { question: "¿En qué sectores opera Controllab actualmente?", options: ["Solo laboratorios clínicos", "Clínica, industria alimentaria, farmacéutica, ambiental y universitaria", "Solo industria farmacéutica", "Solo laboratorios universitarios"], answer: "Clínica, industria alimentaria, farmacéutica, ambiental y universitaria" },
      { question: "¿Qué caracteriza la filosofía pedagógica de los informes de Controllab?", options: ["Solo muestran si el laboratorio aprobó o no", "Incluyen análisis estadísticos, comparaciones con pares y recomendaciones de mejora", "Son confidenciales y no incluyen retroalimentación", "Solo muestran el puntaje final"], answer: "Incluyen análisis estadísticos, comparaciones con pares y recomendaciones de mejora" },
      { question: "¿Qué requirió la expansión de Controllab a países hispanohablantes?", options: ["Solo traducir los materiales al español", "Adaptar materiales, comunicaciones y servicios a particularidades de cada mercado", "Abrir oficinas en todos los países de la región", "Solo contratar personal local"], answer: "Adaptar materiales, comunicaciones y servicios a particularidades de cada mercado" },
      { question: "¿Qué combina el equipo profesional de Controllab?", options: ["Solo experiencia técnica sin orientación al cliente", "Experiencia técnica en bioquímica, estadística y metrología con vocación de servicio y educación", "Solo habilidades comerciales y de marketing", "Solo conocimiento en gestión empresarial"], answer: "Experiencia técnica en bioquímica, estadística y metrología con vocación de servicio y educación" },
      { question: "¿Qué distingue a Controllab de un simple proveedor de insumos?", options: ["Sus precios más bajos del mercado", "Su enfoque en la mejora práctica del laboratorio a través de ciencia y educación", "Su cobertura geográfica exclusivamente brasileña", "Su especialización en un solo tipo de laboratorio"], answer: "Su enfoque en la mejora práctica del laboratorio a través de ciencia y educación" },
    ],
    dictation: "Controllab nació en Rio de Janeiro y se expandió por toda Latinoamérica ofreciendo ensayos de aptitud, materiales de referencia y capacitación técnica.",
  },
  {
    id: "controllab-ensayos", title: "Ensayos de aptitud (PT)", level: "Intermedio", category: "Controllab", emoji: "🔬",
    description: "Cómo funcionan los programas de proficiency testing de Controllab.",
    readingTitle: "¿Cómo sabe un laboratorio si sus resultados son correctos?",
    reading: [
      "Un laboratorio enfrenta una pregunta fundamental: ¿cómo sé que mis resultados son correctos? El control interno le dice si el método es reproducible dentro de su propio sistema, pero no le dice si sus valores están alineados con los que obtendrían otros laboratorios procesando la misma muestra. Esa pregunta es la que responde el ensayo de aptitud.",
      "Un ensayo de aptitud consiste en que un organismo coordinador, como Controllab, distribuye muestras idénticas a múltiples laboratorios participantes. Cada laboratorio analiza la muestra con sus propios métodos y reporta sus resultados al coordinador.",
      "El indicador central del desempeño es el z-score. Se calcula dividiendo la diferencia entre el resultado del laboratorio y el valor de referencia del programa por la desviación estándar del grupo. Un z-score entre -2 y +2 indica desempeño satisfactorio.",
      "Cuando un laboratorio obtiene un resultado insatisfactorio, la respuesta correcta es la investigación sistemática: ¿el problema está en la calibración, en el lote de reactivo, en el procedimiento o en la ejecución?",
      "Los ensayos de aptitud de Controllab cubren bioquímica clínica, hematología, coagulación, microbiología, uroanálisis, inmunología, toxicología, alimentos, agua, suelos y más.",
    ],
    vocab: [
      { es: "ensayo de aptitud / proficiency testing", pt: "ensaio de aptidão / proficiência" },
      { es: "z-score / puntaje z", pt: "z-score / escore z" },
      { es: "organismo coordinador", pt: "organismo coordenador" },
      { es: "valor de referencia", pt: "valor de referência" },
      { es: "desempeño satisfactorio / insatisfactorio", pt: "desempenho satisfatório / insatisfatório" },
      { es: "muestra de aptitud", pt: "amostra de proficiência" },
    ],
    quiz: [
      { question: "¿Qué pregunta responde un ensayo de aptitud?", options: ["¿El equipo está calibrado correctamente?", "¿Los resultados del laboratorio están alineados con los de otros laboratorios que miden lo mismo?", "¿El personal está capacitado adecuadamente?", "¿El control interno está dentro de los límites?"], answer: "¿Los resultados del laboratorio están alineados con los de otros laboratorios que miden lo mismo?" },
      { question: "¿Qué hace el organismo coordinador en un ensayo de aptitud?", options: ["Distribuye reactivos a los laboratorios", "Distribuye muestras idénticas, compila resultados, analiza estadísticamente y emite informes", "Realiza el análisis de las muestras por cada laboratorio", "Solo emite el certificado de participación"], answer: "Distribuye muestras idénticas, compila resultados, analiza estadísticamente y emite informes" },
      { question: "¿Qué indica un z-score entre -2 y +2?", options: ["Desempeño insatisfactorio que requiere investigación", "Desempeño satisfactorio dentro de los límites aceptables", "Señal de alerta que debe monitorearse", "Error grave en el método analítico"], answer: "Desempeño satisfactorio dentro de los límites aceptables" },
      { question: "¿Qué indica un z-score mayor a 3 en valor absoluto?", options: ["Desempeño excelente, mejor que el promedio", "Señal de alerta que debe monitorearse pero no es urgente", "Desempeño insatisfactorio que requiere investigación y acción correctiva", "Resultado dentro del rango aceptable"], answer: "Desempeño insatisfactorio que requiere investigación y acción correctiva" },
      { question: "¿Cuál es la respuesta correcta ante un resultado insatisfactorio en un PT?", options: ["Ignorarlo si el control interno estaba bien", "Investigación sistemática de la causa raíz con documentación y verificación de acciones correctivas", "Repetir el ensayo hasta obtener un resultado satisfactorio", "Cambiar de proveedor del programa de PT"], answer: "Investigación sistemática de la causa raíz con documentación y verificación de acciones correctivas" },
      { question: "¿Qué diferencia al ensayo de aptitud del control interno?", options: ["El control interno es más costoso y complejo", "El control interno evalúa reproducibilidad interna; el PT compara con otros laboratorios externos", "Son exactamente lo mismo con distinto nombre", "El PT solo aplica a laboratorios grandes"], answer: "El control interno evalúa reproducibilidad interna; el PT compara con otros laboratorios externos" },
      { question: "¿Qué sectores cubren los programas de aptitud de Controllab?", options: ["Solo laboratorios clínicos en Brasil", "Bioquímica, hematología, microbiología, alimentos, agua, suelos y más sectores", "Solo análisis de alimentos y medio ambiente", "Solo los requeridos por ISO 17025"], answer: "Bioquímica, hematología, microbiología, alimentos, agua, suelos y más sectores" },
      { question: "¿Cómo se calcula el z-score?", options: ["Dividiendo el resultado del laboratorio por el valor de referencia", "Dividiendo la diferencia entre el resultado y el valor de referencia por la desviación estándar del grupo", "Multiplicando el sesgo por la precisión del método", "Restando el resultado del laboratorio del promedio del grupo"], answer: "Dividiendo la diferencia entre el resultado y el valor de referencia por la desviación estándar del grupo" },
    ],
    dictation: "El z-score es el indicador central del ensayo de aptitud: valores entre menos dos y más dos indican desempeño satisfactorio del laboratorio.",
  },
];

// ─── Students ─────────────────────────────────────────────────────────────────
const defaultStudents: Student[] = [
  { id: "marilia",   name: "Marília",   code: "MARILIA"  },
  { id: "claudio",   name: "Claudio",   code: "CLAUDIO"  },
  { id: "juliana",   name: "Juliana",   code: "JULIANA"  },
  { id: "thamiris",  name: "Thamiris",  code: "THAMIRIS" },
  { id: "livia",     name: "Livia",     code: "LIVIA"    },
  { id: "adriana",   name: "Adriana",   code: "ADRIANA"  },
  { id: "rafael",    name: "Rafael",    code: "RAFAEL"   },
  { id: "jessica",   name: "Jessica",   code: "JESSICA"  },
  { id: "luiza",     name: "Luiza",     code: "LUIZA"    },
  { id: "ana-paula", name: "Ana Paula", code: "ANAPAULA" },
  { id: "lucas",     name: "Lucas",     code: "LUCAS"    },
  { id: "katia",     name: "Katia",     code: "KATIA"    },
  { id: "vinicius",  name: "Vinicius",  code: "VINICIUS" },
  { id: "thiago",    name: "Thiago",    code: "THIAGO"   },
];

const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática", "Controllab"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function strSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h;
}
function shuffleOpts(opts: string[], seed: number): string[] {
  const arr = [...opts];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s = s >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function normalize(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}
function createInitialState(): AppState {
  return { students: defaultStudents, currentStudentId: null, progress: {}, dictations: {} };
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

  // ── Derived state ──
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

  // ── Speech ──
  const speak = (text: string, rate = 0.9) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = rate;
    const v = window.speechSynthesis.getVoices().find(x => x.lang.startsWith("es"));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  };
  const stopSpeak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  // ── Bootstrap ──
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
            setLoadStatus("ready");
            return;
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

  // ── Persist ──
  useEffect(() => {
    if (loadStatus !== "ready") return;
    const LSKEY = "aula-controllab-v7";
    const t = setTimeout(async () => {
      try { localStorage.setItem(LSKEY, JSON.stringify(appState)); } catch {}
      if (supabase) { try { await saveRemoteState(appState); } catch {} }
    }, 500);
    return () => clearTimeout(t);
  }, [appState, loadStatus]);

  // ── Reset on module change ──
  useEffect(() => {
    stopSpeak();
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setSubmitted(false);
    setDictationText("");
    setDictationResult(null);
    setQuizAnswers({});
    setActiveSection("reading");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModuleId, appState.currentStudentId]);

  // ── Actions ──
  const logout = () => {
    stopSpeak();
    setAppState(prev => ({ ...prev, currentStudentId: null }));
    setSelectedModuleId(MODULES[0].id);
    setShowProfessorPanel(false);
    setProfessorUnlocked(false);
  };

  const login = () => {
    const found = appState.students.find(s => normalize(s.name) === normalize(loginName) && normalize(s.code) === normalize(loginCode));
    if (!found) { setLoginError("Usuario o contraseña incorrectos."); return; }
    setAppState(prev => ({ ...prev, currentStudentId: found.id }));
    setLoginError(""); setLoginName(""); setLoginCode("");
  };

  const changePassword = () => {
    if (!newPassword.trim()) { setPasswordMsg("Escribí una contraseña nueva."); return; }
    if (newPassword.trim().length < 4) { setPasswordMsg("La contraseña debe tener al menos 4 caracteres."); return; }
    if (newPassword.trim() !== confirmPassword.trim()) { setPasswordMsg("Las contraseñas no coinciden."); return; }
    if (!currentStudent) return;
    setAppState(prev => ({ ...prev, students: prev.students.map(s => s.id === currentStudent.id ? { ...s, code: newPassword.trim().toUpperCase() } : s) }));
    setPasswordMsg("✓ Contraseña actualizada correctamente.");
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
    if (!window.confirm(`¿Reiniciar el módulo "${selectedModule.title}" para ${currentStudent.name}?`)) return;
    setAppState(prev => {
      const newP = { ...(prev.progress[currentStudent.id] || {}) };
      const newD = { ...(prev.dictations[currentStudent.id] || {}) };
      delete newP[selectedModuleId]; delete newD[selectedModuleId];
      return { ...prev, progress: { ...prev.progress, [currentStudent.id]: newP }, dictations: { ...prev.dictations, [currentStudent.id]: newD } };
    });
    setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false);
    setQuizAnswers({}); setDictationText(""); setDictationResult(null); setActiveSection("reading");
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
    if (!window.confirm(`¿Reiniciar TODOS los módulos de ${studentName}?`)) return;
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
    setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false); setQuizAnswers({}); setActiveSection("reading");
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

  // ── Professor rows ──
  const professorRows = useMemo(() => appState.students.map(student => {
    const progress = appState.progress[student.id] || {};
    const dictations = appState.dictations[student.id] || {};
    const completedMods = Object.keys(progress).length;
    const bestScore = MODULES.reduce((sum, m) => sum + (progress[m.id]?.score || 0), 0);
    const dictScores = MODULES.map(m => dictations[m.id]?.score).filter((v): v is number => typeof v === "number");
    const dictAvg = dictScores.length ? Math.round(dictScores.reduce((a, b) => a + b, 0) / dictScores.length) : null;
    return { ...student, completedMods, bestScore, dictAvg };
  }), [appState]);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (loadStatus === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, fontFamily: FONT }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚗️</div>
          <div style={{ color: TEXT_MID, fontSize: 15 }}>Cargando Aula Controllab...</div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (!currentStudent) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔬</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>Aula Controllab</h1>
            <p style={{ color: TEXT_MID, fontSize: 14, marginTop: 8 }}>Español técnico para profesionales del laboratorio</p>
          </div>

          {/* Login card */}
          <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 24, margin: "0 0 24px" }}>Iniciar sesión</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Tu nombre" style={input} onKeyDown={e => e.key === "Enter" && login()} />
              <input value={loginCode} onChange={e => setLoginCode(e.target.value)} placeholder="Contraseña" type="password" style={input} onKeyDown={e => e.key === "Enter" && login()} />
              {loginError && <div style={{ color: "#fb7185", fontSize: 13 }}>{loginError}</div>}
              <button onClick={login} style={{ ...btnAccent, width: "100%", textAlign: "center" }}>Entrar →</button>
            </div>
          </div>

          {/* Professor button */}
          <button onClick={handleProfessorClick} style={{ marginTop: 16, width: "100%", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 16px", color: TEXT_DIM, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>
            👨‍🏫 Panel del profesor
          </button>

          {/* Professor panel */}
          {showProfessorPanel && professorUnlocked && (
            <div style={{ ...glass, borderRadius: 24, padding: 24, marginTop: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {(["progress", "students", "dictations"] as const).map(t => (
                  <button key={t} onClick={() => setTeacherTab(t)} style={{ borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: teacherTab === t ? TEAL : "rgba(255,255,255,0.06)", color: teacherTab === t ? "#042f2e" : TEXT_MID, fontFamily: FONT }}>
                    {t === "progress" ? "📊 Progreso" : t === "students" ? "👥 Alumnos" : "🎙 Dictados"}
                  </button>
                ))}
                <button onClick={resetAllStudents} style={{ borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: "rgba(251,113,133,0.15)", color: "#fb7185", fontFamily: FONT, marginLeft: "auto" }}>
                  🗑 Borrar todo
                </button>
              </div>

              {teacherTab === "progress" && (
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  {professorRows.map(row => (
                    <div key={row.id} style={{ ...glassDark, borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: TEXT, fontFamily: FONT }}>{row.name}</div>
                        <div style={{ fontSize: 11, color: TEXT_DIM, fontFamily: MONO }}>{row.completedMods}/{MODULES.length} módulos</div>
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: TEAL }}>{row.bestScore}pts</div>
                      <button onClick={() => resetStudentAll(row.id, row.name)} style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>Reset</button>
                    </div>
                  ))}
                </div>
              )}

              {teacherTab === "dictations" && (
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  {professorRows.map(row => (
                    <div key={row.id} style={{ ...glassDark, borderRadius: 14, padding: "12px 16px", marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: TEXT, fontFamily: FONT, marginBottom: 6 }}>{row.name}</div>
                      {MODULES.filter(m => appState.dictations[row.id]?.[m.id]).map(m => {
                        const d = appState.dictations[row.id][m.id];
                        return (
                          <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: TEXT_MID, fontFamily: FONT, flex: 1 }}>{m.emoji} {m.title}</span>
                            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: d.score >= 80 ? "#34d399" : d.score >= 50 ? "#fbbf24" : "#fb7185" }}>{d.score}%</span>
                            <button onClick={() => resetStudentModule(row.id, m.id)} style={{ background: "rgba(251,113,133,0.1)", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>×</button>
                          </div>
                        );
                      })}
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
                    <button onClick={addStudent} style={{ ...btnAccent, padding: "0 16px", whiteSpace: "nowrap" }}>+ Agregar</button>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {appState.students.map(s => (
                      <div key={s.id} style={{ ...glassDark, borderRadius: 12, padding: "10px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, fontSize: 14, color: TEXT, fontFamily: FONT }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: MONO }}>{s.code}</div>
                        <button onClick={() => removeStudent(s.id)} style={{ background: "transparent", border: "none", color: "#fb7185", cursor: "pointer", fontSize: 16 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN APP
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: FONT }}>

      {/* Header */}
      <header style={{ ...glass, borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 20 }}>🔬</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>Aula Controllab</span>
          <div style={{ flex: 1 }} />

          {/* Category filter */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: activeCategory === cat ? TEAL : "rgba(255,255,255,0.06)", color: activeCategory === cat ? "#042f2e" : TEXT_MID, fontFamily: FONT, whiteSpace: "nowrap" }}>
                {cat}
              </button>
            ))}
          </div>

          {/* User area */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => { setShowChangePassword(v => !v); setShowProfessorPanel(false); }} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "6px 12px", fontSize: 12, color: TEXT_MID, cursor: "pointer", fontFamily: FONT }}>
              🔑 Clave
            </button>
            <button onClick={handleProfessorClick} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "6px 12px", fontSize: 12, color: TEXT_MID, cursor: "pointer", fontFamily: FONT }}>
              👨‍🏫
            </button>
            <div style={{ ...glassDark, borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600 }}>
              {currentStudent.name}
            </div>
            <button onClick={logout} style={{ background: "rgba(251,113,133,0.15)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 10, padding: "6px 12px", fontSize: 12, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Change password panel */}
      {showChangePassword && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px 0" }}>
          <div style={{ ...glass, borderRadius: 20, padding: 24, maxWidth: 420 }}>
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

      {/* Professor panel (in-app) */}
      {showProfessorPanel && professorUnlocked && currentStudent && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px 0" }}>
          <div style={{ ...glass, borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {(["progress", "students", "dictations"] as const).map(t => (
                <button key={t} onClick={() => setTeacherTab(t)} style={{ borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: teacherTab === t ? TEAL : "rgba(255,255,255,0.06)", color: teacherTab === t ? "#042f2e" : TEXT_MID, fontFamily: FONT }}>
                  {t === "progress" ? "📊 Progreso" : t === "students" ? "👥 Alumnos" : "🎙 Dictados"}
                </button>
              ))}
              <button onClick={resetAllStudents} style={{ borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: "rgba(251,113,133,0.15)", color: "#fb7185", fontFamily: FONT, marginLeft: "auto" }}>
                🗑 Borrar todo
              </button>
            </div>

            {teacherTab === "progress" && (
              <div style={{ display: "grid", gap: 8, maxHeight: 360, overflowY: "auto" }}>
                {professorRows.map(row => (
                  <div key={row.id} style={{ ...glassDark, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: TEXT, fontFamily: FONT }}>{row.name}</div>
                      <div style={{ fontSize: 11, color: TEXT_DIM, fontFamily: MONO }}>{row.completedMods}/{MODULES.length} módulos · {row.bestScore} pts</div>
                    </div>
                    <button onClick={() => resetStudentAll(row.id, row.name)} style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>Reset todo</button>
                  </div>
                ))}
              </div>
            )}

            {teacherTab === "dictations" && (
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {professorRows.map(row => (
                  <div key={row.id} style={{ ...glassDark, borderRadius: 14, padding: "12px 16px", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: TEXT, fontFamily: FONT, marginBottom: 6 }}>{row.name} {row.dictAvg !== null && <span style={{ fontFamily: MONO, fontSize: 12, color: TEAL }}>avg {row.dictAvg}%</span>}</div>
                    {MODULES.filter(m => appState.dictations[row.id]?.[m.id]).map(m => {
                      const d = appState.dictations[row.id][m.id];
                      return (
                        <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: TEXT_MID, fontFamily: FONT, flex: 1 }}>{m.emoji} {m.title}</span>
                          <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: d.score >= 80 ? "#34d399" : d.score >= 50 ? "#fbbf24" : "#fb7185" }}>{d.score}%</span>
                          <button onClick={() => resetStudentModule(row.id, m.id)} style={{ background: "rgba(251,113,133,0.1)", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>×</button>
                        </div>
                      );
                    })}
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
                  <button onClick={addStudent} style={{ ...btnAccent, padding: "0 16px", whiteSpace: "nowrap" }}>+ Agregar</button>
                </div>
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {appState.students.map(s => (
                    <div key={s.id} style={{ ...glassDark, borderRadius: 12, padding: "10px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, fontSize: 14, color: TEXT, fontFamily: FONT }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: MONO }}>{s.code}</div>
                      <button onClick={() => removeStudent(s.id)} style={{ background: "transparent", border: "none", color: "#fb7185", cursor: "pointer", fontSize: 16 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>

        {/* Module header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 40 }}>{selectedModule.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{selectedModule.title}</h2>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.07)", color: catColor(selectedModule.category), fontFamily: MONO }}>{selectedModule.category}</span>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: TEXT_DIM, fontFamily: MONO }}>{selectedModule.level}</span>
              </div>
              <p style={{ color: TEXT_MID, fontSize: 14, margin: 0 }}>{selectedModule.description}</p>
            </div>
            <button onClick={resetCurrentModule} style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 12, padding: "8px 14px", fontSize: 12, color: "#fb7185", cursor: "pointer", fontFamily: FONT }}>
              🔄 Reiniciar módulo
            </button>
          </div>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 20, flexWrap: "wrap" }}>
            {(["reading", "vocab", "quiz", "dictation"] as const).map(sec => {
              const labels: Record<string, string> = { reading: "📖 Lectura", vocab: "📝 Vocabulario", quiz: "🧠 Quiz", dictation: "🎙 Dictado" };
              const active = activeSection === sec;
              return (
                <button key={sec} onClick={() => setActiveSection(sec)} style={{ borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 600, border: `1px solid ${active ? BORDER_A : BORDER}`, cursor: "pointer", background: active ? "rgba(45,212,191,0.1)" : "rgba(255,255,255,0.04)", color: active ? TEAL : TEXT_MID, fontFamily: FONT, transition: "all 0.15s" }}>
                  {labels[sec]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

          {/* Left column */}
          <div>
            {/* READING */}
            {activeSection === "reading" && (
              <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap" as const, gap: 12 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: FONT }}>{selectedModule.readingTitle}</h3>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => speak(selectedModule.reading.join(" "), 0.9)} style={{ ...glass, borderRadius: 12, padding: "9px 16px", fontSize: 13, color: TEXT_MID, border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: FONT }}>
                      🔊 Escuchar
                    </button>
                    <button onClick={stopSpeak} style={{ borderRadius: 12, padding: "9px 16px", fontSize: 13, fontWeight: 600, background: "rgba(244,63,94,0.15)", color: "#fda4af", border: "1px solid rgba(244,63,94,0.3)", cursor: "pointer", fontFamily: FONT }}>
                      ⏹ Stop
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {selectedModule.reading.map((para, i) => (
                    <p key={i} style={{ lineHeight: 1.9, color: "#cbd5e1", fontSize: 15, margin: 0, fontFamily: FONT }}>{para}</p>
                  ))}
                </div>
                <button onClick={() => setActiveSection("quiz")} style={{ ...btnAccent, marginTop: 32, display: "inline-block" }}>Ir al quiz →</button>
              </div>
            )}

            {/* QUIZ */}
            {activeSection === "quiz" && (
              <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap" as const, gap: 12 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: FONT }}>Comprensión</h3>
                  <div style={{ ...glass, borderRadius: 12, padding: "8px 16px", fontFamily: MONO, fontSize: 14, fontWeight: 700, color: TEAL }}>{currentQuestionIndex + 1}/{selectedModule.quiz.length}</div>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 28, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${((currentQuestionIndex + (submitted ? 1 : 0)) / selectedModule.quiz.length) * 100}%`, background: `linear-gradient(90deg,${TEAL},#67e8f9)`, transition: "width 0.4s ease", borderRadius: 99 }} />
                </div>
                <div style={{ ...glassDark, borderRadius: 20, padding: 24 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.6, fontFamily: FONT }}>{currentQuestion.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {shuffledOpts.map(option => {
                      const sel = selectedOption === option;
                      const correct = submitted && option === currentQuestion.answer;
                      const wrong = submitted && sel && option !== currentQuestion.answer;
                      return (
                        <button key={option} onClick={() => !submitted && setAnswerMemory(option)} disabled={submitted} style={optBtn(sel, correct, wrong)}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 16 }}>
                  <div style={{ fontSize: 14, fontFamily: FONT }}>
                    {submitted
                      ? isCorrect
                        ? <span style={{ color: "#34d399", fontWeight: 600 }}>✓ ¡Correcto!</span>
                        : <span style={{ color: "#fb7185" }}>✗ Respuesta: <strong style={{ color: TEXT }}>{currentQuestion.answer}</strong></span>
                      : <span style={{ color: TEXT_MID }}>Elegí una opción.</span>
                    }
                  </div>
                  {!submitted
                    ? <button onClick={handleSubmit} disabled={!selectedOption} style={{ ...btnAccent, opacity: selectedOption ? 1 : 0.4 }}>Comprobar</button>
                    : <button onClick={handleNext} style={btnAccent}>{currentQuestionIndex < selectedModule.quiz.length - 1 ? "Siguiente →" : "Finalizar ✓"}</button>
                  }
                </div>
              </div>
            )}

            {/* DICTATION */}
            {activeSection === "dictation" && (
              <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap" as const, gap: 12 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: FONT }}>🎙 Dictado</h3>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => speak(selectedModule.dictation, 0.75)} style={{ ...glass, borderRadius: 12, padding: "9px 16px", fontSize: 13, color: TEXT_MID, border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: FONT }}>
                      🔊 Reproducir
                    </button>
                    <button onClick={stopSpeak} style={{ borderRadius: 12, padding: "9px 16px", fontSize: 13, fontWeight: 600, background: "rgba(244,63,94,0.15)", color: "#fda4af", border: "1px solid rgba(244,63,94,0.3)", cursor: "pointer", fontFamily: FONT }}>
                      ⏹ Stop
                    </button>
                  </div>
                </div>
                <p style={{ color: TEXT_MID, fontSize: 14, marginBottom: 20, lineHeight: 1.6, fontFamily: FONT }}>
                  Escuchá el audio y escribí la frase en español. Podés repetirlo varias veces.
                </p>
                <textarea
                  value={dictationText}
                  onChange={e => setDictationText(e.target.value)}
                  rows={4}
                  placeholder="Escribí lo que escuchaste..."
                  style={{ ...input, resize: "none" as const, lineHeight: 1.7, borderRadius: 16, padding: "16px 20px" }}
                />
                <button onClick={checkDictation} style={{ ...btnAccent, marginTop: 16, display: "inline-block" }}>
                  Corregir dictado
                </button>
                {(dictationResult || currentDictation) && (() => {
                  const r = dictationResult || currentDictation!;
                  return (
                    <div style={{ ...glassDark, borderRadius: 20, padding: 20, marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, color: r.score >= 80 ? "#34d399" : r.score >= 50 ? "#fbbf24" : "#fb7185" }}>
                          {r.score}%
                        </div>
                        <div style={{ fontSize: 14, color: TEXT_MID, fontFamily: FONT }}>
                          {r.score === 100 ? "¡Perfecto! 🎉" : r.score >= 80 ? "¡Muy bien!" : r.score >= 50 ? "Buen intento" : "Seguí practicando"}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontFamily: FONT }}>
                        <span style={{ color: TEXT_MID }}>Frase modelo: </span>
                        <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>{r.expected}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* VOCAB */}
            {activeSection === "vocab" && (
              <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, fontFamily: FONT }}>📝 Vocabulario clave</h3>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
                  {selectedModule.vocab.map(item => (
                    <div key={item.es} style={{ ...glassDark, borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, fontFamily: FONT }}>{item.es}</div>
                        <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2, fontFamily: FONT }}>Español</div>
                      </div>
                      <div style={{ textAlign: "right" as const }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: TEAL, fontFamily: FONT }}>{item.pt}</div>
                        <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2, fontFamily: FONT }}>Portugués</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Progress card */}
            <div style={{ ...glass, borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: TEXT_DIM, marginBottom: 16, fontFamily: MONO }}>MI PROGRESO</div>
              <div style={{ fontSize: 52, fontWeight: 800, color: TEAL, fontFamily: MONO, lineHeight: 1 }}>{overallPercent}%</div>
              <div style={{ color: TEXT_MID, fontSize: 13, marginTop: 4, fontFamily: FONT }}>completado</div>
              <div style={{ marginTop: 16, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${overallPercent}%`, background: `linear-gradient(90deg,${TEAL},#67e8f9)`, boxShadow: "0 0 12px rgba(45,212,191,0.35)", transition: "width 0.7s ease" }} />
              </div>
              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[{ n: completedModules, l: "Módulos" }, { n: totalBestScore, l: "Puntos", c: TEAL }].map(x => (
                  <div key={x.l} style={{ ...glassDark, borderRadius: 14, padding: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: MONO, color: x.c || TEXT }}>{x.n}</div>
                    <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 2, fontFamily: FONT }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module list */}
            <div style={{ ...glass, borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: TEXT_DIM, marginBottom: 16, fontFamily: MONO }}>MÓDULOS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
                {filteredModules.map(m => {
                  const p = studentProgress[m.id];
                  const isA = m.id === selectedModuleId;
                  return (
                    <button key={m.id} onClick={() => setSelectedModuleId(m.id)} style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, padding: "10px 12px", background: isA ? "rgba(45,212,191,0.08)" : "transparent", border: `1px solid ${isA ? BORDER_A : "transparent"}`, cursor: "pointer", textAlign: "left" as const, transition: "all 0.15s", width: "100%" }}>
                      <span style={{ fontSize: 16 }}>{m.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: isA ? 700 : 500, color: isA ? TEXT : "#94a3b8", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: catColor(m.category), marginTop: 1, fontFamily: MONO }}>{m.category}</div>
                      </div>
                      {p ? <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: TEAL, whiteSpace: "nowrap" as const }}>{p.score}/{p.total}</span> : <span style={{ color: TEXT_DIM, fontSize: 12 }}>—</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tip */}
            <div style={{ ...glass, borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: TEXT_DIM, marginBottom: 12, fontFamily: MONO }}>CONSEJO DEL DÍA</div>
              <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, margin: 0, fontFamily: FONT }}>
                💡 Cuando uses términos técnicos con un cliente, la <span style={{ color: TEAL, fontWeight: 600 }}>claridad</span> siempre es más importante que la complejidad del vocabulario.
              </p>
            </div>

            {/* Spotify */}
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