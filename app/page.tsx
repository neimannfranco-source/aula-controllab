"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bjufnjnijkzypnktdxql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdWZuam5pamt6eXBua3RkeHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzUyMjgsImV4cCI6MjA4OTUxMTIyOH0.VWEtmhvSB8Crtjf2vcoFMJaIiDQ5ejkaQB1B2zEBnbw";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type VocabItem = { es: string; pt: string };
type QuizQuestion = { question: string; options: string[]; answer: string; explanation?: string; };
type ModuleType = {
  id: string; title: string; level: string; category: string; emoji: string;
  description: string; readingTitle: string; reading: string[];
  vocab: VocabItem[]; quiz: QuizQuestion[]; dictation: string;
};
type Student = { id: string; name: string; code: string; password?: string; passwordChanged?: boolean };
type ModuleProgress = { completed: boolean; score: number; total: number; attempts: number };
type DictationResult = { exact: boolean; score: number; written: string; expected: string; updatedAt: string };
type Achievement = { id: string; title: string; emoji: string; unlockedAt: string };
type AppState = {
  students: Student[]; currentStudentId: string | null;
  progress: Record<string, Record<string, ModuleProgress>>;
  dictations: Record<string, Record<string, DictationResult>>;
  achievements: Record<string, Achievement[]>;
  streaks: Record<string, { count: number; lastDate: string }>;
  weeklyActivity: Record<string, Record<string, number>>;
};



const MODULES: ModuleType[] = [

  // ══════════════════════════════════════════
  // LABORATORIO
  // ══════════════════════════════════════════
  {
    id: "control-interno", title: "Control interno", level: "Intermedio", category: "Laboratorio", emoji: "🔬",
    description: "Monitoreo analítico, tendencias y decisiones preventivas.",
    readingTitle: "Una desviación que parecía pequeña",
    reading: [
      "Durante una revisión de rutina en el laboratorio de bioquímica, el equipo técnico detectó una desviación en los controles internos de uno de los analitos más procesados de la semana. A primera vista, la diferencia parecía mínima: apenas unos pocos puntos por encima del límite de advertencia establecido en el gráfico de Levey-Jennings. Sin embargo, al comparar los datos actuales con los registros históricos del mes anterior, la imagen fue mucho más preocupante: la tendencia se repetía desde hacía cinco días consecutivos, siempre en la misma dirección.",
      "La supervisora del turno decidió pausar la emisión de resultados y reunir al equipo para hacer una revisión sistemática. Examinaron con detalle los materiales de control utilizados, incluyendo los viales abiertos y los lotes en stock. Revisaron las curvas de calibración recientes para verificar si había habido algún cambio significativo en los últimos días. También inspeccionaron los lotes de reactivos en uso, comparando sus códigos con los registros de recepción. Finalmente, revisaron las condiciones de almacenamiento de cada componente: temperatura del refrigerador, tiempo desde la apertura de los viales y posibles exposiciones a luz o humedad.",
      "Después de analizar toda esa información, concluyeron que la causa más probable era una combinación entre una variación dentro del lote del reactivo principal y una calibración que ya no representaba con suficiente precisión el desempeño real del método en las condiciones actuales. No había una falla única y evidente, sino la suma de pequeños factores que, juntos, generaban un desvío sistemático. Esta es una situación más difícil de detectar que una falla obvia, pero también más frecuente en la práctica diaria del laboratorio.",
      "Como medida preventiva inmediata, suspendieron la liberación de los resultados de ese analito correspondientes a las últimas doce horas. Repitieron las corridas con material de control fresco proveniente de un vial diferente y realizaron una recalibración completa del equipo. Todos los resultados repetidos dentro del rango aceptable fueron liberados con una nota interna indicando que habían sido revisados. Los que quedaron fuera del rango fueron informados directamente al médico solicitante con una explicación clara de la situación.",
      "El caso fue documentado como un incidente de calidad y se presentó en la reunión mensual del equipo como ejemplo de buena práctica. Se decidió actualizar el procedimiento de control interno para incluir una alerta automática cuando tres puntos consecutivos superen el límite de advertencia en la misma dirección, incluso si ninguno supera el límite de rechazo. Esta modificación preventiva fue aprobada por el responsable de calidad y quedó registrada como una mejora del sistema. Detectar un desvío antes de que se convierta en un error mayor es, en definitiva, la esencia del control interno bien gestionado.",
    ],
    vocab: [
      { es: "control interno", pt: "controle interno" }, { es: "desviación", pt: "desvio" },
      { es: "liberación de resultados", pt: "liberação de resultados" }, { es: "reactivo", pt: "reagente" },
      { es: "tendencia", pt: "tendência" }, { es: "corrida analítica", pt: "corrida analítica" },
    ],
    quiz: [
      { question: "¿Qué detectó el equipo técnico durante la revisión de rutina?", options: ["Un error en la facturación", "Una desviación en los controles internos", "Una falla en el refrigerador", "Un vial de control vacío"], answer: "Una desviación en los controles internos" },
      { question: "¿Cuántos días llevaba repitiéndose la tendencia?", options: ["Un día", "Dos días", "Cinco días consecutivos", "Todo el mes"], answer: "Cinco días consecutivos" },
      { question: "¿Qué elementos revisó el equipo en la investigación?", options: ["Solo los reactivos", "Reactivos, calibración, controles y almacenamiento", "Solo el equipo analítico", "Solo los registros del mes anterior"], answer: "Reactivos, calibración, controles y almacenamiento" },
      { question: "¿Cuál fue la causa identificada?", options: ["Falla total del equipo", "Variación del reactivo y calibración desactualizada combinadas", "Error del operador", "Muestra contaminada"], answer: "Variación del reactivo y calibración desactualizada combinadas" },
      { question: "¿Qué hicieron como medida preventiva?", options: ["Cambiaron al personal", "Suspendieron la liberación de algunos resultados y repitieron corridas", "Descartaron el equipamiento", "Cerraron el laboratorio"], answer: "Suspendieron la liberación de algunos resultados y repitieron corridas" },
      { question: "¿Cómo quedaron documentadas las acciones tomadas?", options: ["Solo verbalmente", "En el sistema con fecha, hora y nombre del responsable", "En un papel físico", "No quedaron documentadas"], answer: "En el sistema con fecha, hora y nombre del responsable" },
      { question: "¿Qué mejora preventiva se implementó en el procedimiento?", options: ["Eliminar los controles internos", "Alerta cuando tres puntos consecutivos superen el límite en la misma dirección", "Reducir la frecuencia de los controles", "Cambiar de proveedor de reactivos"], answer: "Alerta cuando tres puntos consecutivos superen el límite en la misma dirección" },
      { question: "¿Por qué es importante identificar tendencias?", options: ["Para reducir reuniones", "Para evitar errores mayores antes de que ocurran y proteger la calidad", "Para eliminar controles", "Para justificar más personal"], answer: "Para evitar errores mayores antes de que ocurran y proteger la calidad" },
    ],
    dictation: "El equipo detectó una desviación en los controles internos y suspendió la liberación de resultados para proteger la calidad del proceso.",
  },
  {
    id: "westgard", title: "Reglas de Westgard", level: "Intermedio", category: "Laboratorio", emoji: "📊",
    description: "Análisis de reglas y toma de decisiones estadísticas en el laboratorio.",
    readingTitle: "Una alerta en el turno de la mañana",
    reading: [
      "Un lunes a las siete de la mañana, durante la revisión inicial de los controles internos del turno, una analista con varios años de experiencia notó algo que la detuvo. Los valores del control de nivel medio no estaban fuera de rango, pero al mirar la secuencia de los últimos seis puntos en el gráfico de Levey-Jennings, todos caían por debajo de la media, aunque dentro de los límites de advertencia. Ese patrón, conocido como regla 6x, indica que algo está cambiando de forma sistemática en el proceso analítico, aunque todavía no sea urgente.",
      "Las reglas de Westgard son un conjunto de criterios estadísticos desarrollados por el Dr. James Westgard en los años setenta para ayudar a los laboratorios a distinguir entre dos tipos de variación: la aleatoria, que es inherente a todo proceso de medición y no requiere acción, y la sistemática, que indica un problema real que debe investigarse. Cada regla tiene un nombre que combina un número y una letra: el número indica la cantidad de observaciones involucradas y la letra indica el tipo de criterio (el rango, la desviación estándar, la diferencia, etcétera).",
      "Entre las reglas más utilizadas en la práctica diaria se encuentran la 1₃ₛ, que es una regla de advertencia cuando un control supera tres desviaciones estándar; la 2₂ₛ, que rechaza la corrida cuando dos controles consecutivos superan dos desviaciones estándar en la misma dirección; la R₄ₛ, que detecta errores aleatorios grandes cuando la diferencia entre dos controles en la misma corrida supera cuatro desviaciones; y la 4₁ₛ, que señala errores sistemáticos cuando cuatro puntos consecutivos están del mismo lado de la media a más de una desviación estándar.",
      "En el caso del turno de la mañana, la analista aplicó correctamente la regla 6x y decidió no rechazar la corrida de inmediato, pero sí investigar la causa antes de continuar. Repitió los controles con material de un vial diferente del mismo lote. Los nuevos valores seguían el mismo patrón, lo que descartó que el problema fuera del vial específico. Luego verificó si la temperatura del equipo había fluctuado durante la noche y encontró un registro que mostraba una leve variación. Eso explicaba el desplazamiento sistemático observado.",
      "Comprender las reglas de Westgard no es solo una obligación técnica: es una herramienta de razonamiento analítico que permite actuar con criterio en lugar de reaccionar de forma mecánica. Un laboratorio que aplica estas reglas correctamente demuestra madurez técnica y capacidad para justificar sus decisiones frente a auditorías, organismos acreditadores y consultas de clientes o médicos. La formación continua del equipo en el uso e interpretación de estas reglas es una inversión directa en la calidad del resultado final.",
    ],
    vocab: [
      { es: "regla de advertencia", pt: "regra de alerta" }, { es: "media", pt: "média" },
      { es: "precisión", pt: "precisão" }, { es: "rechazar la corrida", pt: "rejeitar a corrida" },
      { es: "problema sistemático", pt: "problema sistemático" }, { es: "variación aleatoria", pt: "variação aleatória" },
    ],
    quiz: [
      { question: "¿Qué patrón observó la analista en el gráfico de Levey-Jennings?", options: ["Valores fuera del límite de rechazo", "Seis puntos consecutivos por debajo de la media", "Dos valores muy elevados", "Un valor imposiblemente alto"], answer: "Seis puntos consecutivos por debajo de la media" },
      { question: "¿Cómo se llama ese patrón en la terminología de Westgard?", options: ["Regla de rechazo absoluto", "Tendencia o trend", "Error aleatorio máximo", "Desviación estándar crítica"], answer: "Tendencia o trend" },
      { question: "¿Para qué sirven las reglas de Westgard?", options: ["Para eliminar los controles", "Para distinguir entre variación aleatoria y errores sistemáticos", "Para acelerar el procesamiento", "Para reducir costos"], answer: "Para distinguir entre variación aleatoria y errores sistemáticos" },
      { question: "¿Qué indica la regla 2₂ₛ?", options: ["Un control supera 3 desviaciones estándar", "Dos controles consecutivos superan 2 desviaciones en la misma dirección", "Cuatro puntos del mismo lado de la media", "La diferencia entre dos controles supera 4 desviaciones"], answer: "Dos controles consecutivos superan 2 desviaciones en la misma dirección" },
      { question: "¿Qué tipo de error detecta la regla R₄ₛ?", options: ["Error sistemático", "Error aleatorio grande", "Tendencia sostenida", "Error de calibración"], answer: "Error aleatorio grande" },
      { question: "¿Qué hizo el equipo antes de decidir sobre la corrida?", options: ["La rechazaron inmediatamente sin investigar", "Investigaron repitiendo con vial diferente y verificando temperatura", "Llamaron al proveedor del reactivo", "Esperaron al día siguiente"], answer: "Investigaron repitiendo con vial diferente y verificando temperatura" },
      { question: "¿Qué encontraron al investigar la causa del patrón?", options: ["El reactivo estaba vencido", "Una fluctuación de temperatura durante la noche", "Un error del operador", "Una calibración incorrecta"], answer: "Una fluctuación de temperatura durante la noche" },
      { question: "¿Qué valor aporta aplicar correctamente las reglas de Westgard?", options: ["Permite trabajar sin controles", "Demuestra madurez técnica y permite justificar decisiones ante auditorías", "Reduce el tiempo de procesamiento", "Elimina la necesidad de calibrar"], answer: "Demuestra madurez técnica y permite justificar decisiones ante auditorías" },
    ],
    dictation: "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras y a justificar técnicamente cada acción del laboratorio.",
  },
  {
    id: "trazabilidad", title: "Trazabilidad y registros", level: "Intermedio", category: "Laboratorio", emoji: "📋",
    description: "Registros, documentación y seguimiento operativo completo.",
    readingTitle: "Cuando faltaba una parte del historial",
    reading: [
      "Durante una auditoría interna programada para evaluar el cumplimiento del sistema de gestión de calidad, el equipo encontró una inconsistencia en el historial de una muestra de alta complejidad procesada la semana anterior. El resultado final estaba correctamente documentado en el sistema y el informe había sido entregado al cliente en tiempo y forma. Sin embargo, faltaban registros intermedios fundamentales: no había constancia de quién había recibido la muestra en recepción, en qué condiciones de temperatura había llegado, qué instrumento la había procesado ni cuál era el número de la corrida analítica correspondiente.",
      "La coordinadora del área aprovechó la situación para hacer una reflexión con todo el equipo. Les recordó que la trazabilidad no es simplemente una exigencia burocrática de las normas ISO 15189 o de los organismos de acreditación: es también una herramienta concreta y poderosa para reconstruir decisiones en caso de reclamos o disputas con clientes, para verificar responsabilidades cuando algo sale mal, para detectar patrones de error que se repiten en determinadas condiciones, y para demostrar ante cualquier organismo externo que el laboratorio opera con control real en cada etapa del proceso.",
      "El equipo analizó por qué habían faltado esos registros en este caso específico. Encontraron dos causas principales. La primera era cultural: durante los turnos con alta demanda, algunos analistas tendían a omitir el paso de registro asumiendo que 'lo completarían después', lo que generalmente no ocurría. La segunda era técnica: el formulario digital del sistema no estaba configurado para bloquear el avance al siguiente paso si los campos de recepción estaban vacíos, por lo que el sistema aceptaba muestras sin información completa sin generar ninguna alerta.",
      "Como acciones correctivas, el área implementó varias medidas simultáneas. En el sistema informático, se configuraron campos obligatorios que impiden avanzar sin completar la información de recepción. En el procedimiento operativo, se agregó un paso explícito de verificación de registros antes de la liberación de cada resultado. Se realizó una capacitación de treinta minutos con todo el personal del área, con ejemplos reales de situaciones en las que la falta de trazabilidad había generado problemas graves en otros laboratorios. También se definió un indicador mensual de completitud de registros, con una meta del noventa y ocho por ciento.",
      "La trazabilidad completa es lo que permite a un laboratorio responder con confianza y datos concretos cuando alguien pregunta: '¿Cómo saben que este resultado es confiable?' Esa capacidad de respuesta no es solo una ventaja competitiva frente a otros laboratorios: es una responsabilidad ética hacia los pacientes cuyos diagnósticos y tratamientos dependen de la calidad de los resultados. Un registro bien hecho hoy puede ser la diferencia entre resolver un reclamo en minutos y no poder hacerlo en absoluto.",
    ],
    vocab: [
      { es: "trazabilidad", pt: "rastreabilidade" }, { es: "registro", pt: "registro" },
      { es: "recorrido del proceso", pt: "percurso do processo" }, { es: "checklist", pt: "checklist" },
      { es: "inconsistencia", pt: "inconsistência" }, { es: "responsabilidad", pt: "responsabilidade" },
    ],
    quiz: [
      { question: "¿Qué inconsistencia encontró la auditoría?", options: ["El resultado era incorrecto", "Faltaban registros intermedios del proceso de la muestra", "La muestra estaba perdida", "El informe no había sido entregado"], answer: "Faltaban registros intermedios del proceso de la muestra" },
      { question: "¿Qué información específica faltaba en el historial?", options: ["Solo el resultado final", "Quién recibió la muestra, condiciones, instrumento y número de corrida", "Solo el nombre del paciente", "Solo la fecha del análisis"], answer: "Quién recibió la muestra, condiciones, instrumento y número de corrida" },
      { question: "¿Para qué sirve la trazabilidad más allá del cumplimiento documental?", options: ["Solo para cumplir con la ISO", "Reconstruir decisiones, verificar responsabilidades y detectar patrones de error", "Aumentar la velocidad del laboratorio", "Reducir el personal necesario"], answer: "Reconstruir decisiones, verificar responsabilidades y detectar patrones de error" },
      { question: "¿Cuál fue la causa cultural del problema?", options: ["El personal no sabía usar el sistema", "Los analistas omitían registros por presión de tiempo asumiendo que los completarían después", "El sistema no funcionaba correctamente", "La supervisora no pedía los registros"], answer: "Los analistas omitían registros por presión de tiempo asumiendo que los completarían después" },
      { question: "¿Cuál fue la causa técnica del problema?", options: ["El sistema era demasiado lento", "Los campos no eran obligatorios y el sistema aceptaba avanzar sin completarlos", "El servidor estaba caído", "La impresora no funcionaba"], answer: "Los campos no eran obligatorios y el sistema aceptaba avanzar sin completarlos" },
      { question: "¿Qué ajuste se hizo en el sistema informático?", options: ["Se instaló un sistema nuevo", "Se configuraron campos obligatorios que impiden avanzar sin completar la recepción", "Se desactivaron las alertas", "Se redujo la cantidad de campos requeridos"], answer: "Se configuraron campos obligatorios que impiden avanzar sin completar la recepción" },
      { question: "¿Qué indicador se definió para monitorear la mejora?", options: ["Tiempo de procesamiento de muestras", "Indicador mensual de completitud de registros con meta del 98%", "Número de muestras rechazadas", "Satisfacción del cliente"], answer: "Indicador mensual de completitud de registros con meta del 98%" },
      { question: "¿Qué permite al laboratorio tener trazabilidad completa?", options: ["Procesar más rápido", "Responder con confianza y datos concretos ante cualquier consulta o reclamo", "Reducir costos operativos", "Eliminar controles de calidad"], answer: "Responder con confianza y datos concretos ante cualquier consulta o reclamo" },
    ],
    dictation: "La trazabilidad permite reconstruir decisiones, verificar responsabilidades y reducir el riesgo de errores no detectados.",
  },
  {
    id: "validacion", title: "Validación del método", level: "Avanzado", category: "Laboratorio", emoji: "✅",
    description: "Validación, precisión, exactitud y robustez de métodos analíticos.",
    readingTitle: "Antes de implementar el nuevo método",
    reading: [
      "El laboratorio había tomado la decisión estratégica de incorporar un nuevo método automatizado para la determinación de un marcador tumoral de alta demanda clínica. Antes de comenzar a procesar muestras de pacientes reales, el equipo técnico necesitaba demostrar de forma rigurosa y documentada que el desempeño del método era adecuado para el uso previsto en su contexto específico. Eso implicaba mucho más que simplemente seguir las instrucciones del fabricante y obtener resultados que 'parecían razonables'.",
      "El plan de validación incluyó la evaluación sistemática de varios parámetros clave. La precisión fue evaluada en dos niveles: repetibilidad (¿los resultados son consistentes cuando se repite el mismo ensayo en condiciones idénticas?) y precisión intermedia (¿son consistentes cuando se repite en días diferentes, con distintos operadores y distintos lotes de reactivo?). La exactitud fue evaluada comparando los resultados del nuevo método con los de un método de referencia reconocido, utilizando un conjunto de muestras de pacientes con valores conocidos. También se evaluó la linealidad del método a lo largo de todo el rango clínico esperado.",
      "Uno de los aspectos más complejos de la validación fue la evaluación de interferencias. El equipo preparó muestras con concentraciones elevadas de hemoglobina, bilirrubina y triglicéridos para verificar si estos componentes presentes frecuentemente en muestras de calidad deficiente alteraban los resultados del marcador tumoral. También evaluaron el efecto de gancho, un fenómeno que ocurre con algunos marcadores cuando están presentes en concentraciones extremadamente altas y puede generar resultados falsamente bajos si el método no está diseñado para detectarlo.",
      "Los datos obtenidos fueron procesados estadísticamente usando las guías del CLSI (Clinical and Laboratory Standards Institute) y del EP Evaluator, software estándar para este tipo de análisis. Algunos parámetros cumplieron perfectamente los criterios de aceptación predefinidos. En otros, fue necesario ajustar el rango de linealidad declarado y establecer un protocolo de dilución obligatoria para muestras con valores por encima de determinado umbral. Esos ajustes no invalidaban el método: simplemente definían con mayor precisión sus condiciones de uso correcto.",
      "Validar un método es, en última instancia, una promesa técnica. Es el laboratorio diciéndole al médico y al paciente: 'Hemos verificado que este procedimiento produce resultados confiables en estas condiciones específicas, y tenemos los datos para demostrarlo.' Un método implementado sin validación adecuada puede funcionar bien la mayor parte del tiempo, pero sin los datos de validación no hay forma de saber cuándo falla ni por qué. La validación transforma la confianza intuitiva en certeza documentada.",
    ],
    vocab: [
      { es: "validación", pt: "validação" }, { es: "exactitud", pt: "exatidão" },
      { es: "robustez", pt: "robustez" }, { es: "interferencia", pt: "interferência" },
      { es: "desempeño", pt: "desempenho" }, { es: "uso previsto", pt: "uso pretendido" },
    ],
    quiz: [
      { question: "¿Qué debía demostrar el equipo antes de usar el nuevo método?", options: ["Que era más barato", "Que su desempeño era adecuado para el uso previsto con datos formales", "Que el fabricante lo recomendaba", "Que era más rápido que el anterior"], answer: "Que su desempeño era adecuado para el uso previsto con datos formales" },
      { question: "¿Qué evalúa la repetibilidad en la validación?", options: ["Si el método es rápido", "Si los resultados son consistentes cuando se repite en condiciones idénticas", "Si el costo es aceptable", "Si el equipo es fácil de usar"], answer: "Si los resultados son consistentes cuando se repite en condiciones idénticas" },
      { question: "¿Qué es la exactitud en el contexto de validación?", options: ["La velocidad del método", "Qué tan cerca están los resultados del valor de referencia real", "El número de muestras que puede procesar", "La facilidad de uso del sistema"], answer: "Qué tan cerca están los resultados del valor de referencia real" },
      { question: "¿Qué interferencias evaluaron durante la validación?", options: ["Solo la temperatura", "Hemólisis, lipemia, bilirrubina y efecto de gancho", "Solo los reactivos vencidos", "Solo la calibración"], answer: "Hemólisis, lipemia, bilirrubina y efecto de gancho" },
      { question: "¿Qué es el efecto de gancho?", options: ["Una falla del equipo analítico", "Un fenómeno donde concentraciones muy altas generan resultados falsamente bajos", "Una interferencia por hemólisis severa", "Un error de calibración"], answer: "Un fenómeno donde concentraciones muy altas generan resultados falsamente bajos" },
      { question: "¿Qué herramienta usaron para el análisis estadístico?", options: ["Excel básico", "Guías del CLSI y software EP Evaluator", "Solo cálculos manuales", "El sistema del fabricante únicamente"], answer: "Guías del CLSI y software EP Evaluator" },
      { question: "¿Qué ajustes fueron necesarios al finalizar la validación?", options: ["Nada, todo cumplió perfectamente", "Ajustar el rango de linealidad y establecer diluciones para muestras con valores muy altos", "Cambiar de proveedor de reactivos", "Reducir la frecuencia de calibración"], answer: "Ajustar el rango de linealidad y establecer diluciones para muestras con valores muy altos" },
      { question: "¿Qué significa que un método esté validado?", options: ["Que nunca puede fallar", "Que hay datos concretos que demuestran que produce resultados confiables en condiciones definidas", "Que fue aprobado por el fabricante", "Que es el más moderno del mercado"], answer: "Que hay datos concretos que demuestran que produce resultados confiables en condiciones definidas" },
    ],
    dictation: "Validar un método significa demostrar con datos concretos que produce resultados confiables en las condiciones específicas del laboratorio.",
  },
  {
    id: "muestras", title: "Manejo de muestras", level: "Básico", category: "Laboratorio", emoji: "🧪",
    description: "Recepción, identificación, conservación y rechazo de muestras.",
    readingTitle: "La muestra que llegó sin identificar",
    reading: [
      "Un martes a las siete de la mañana, el área de recepción del laboratorio recibió un lote de muestras provenientes de un hospital con el que acababan de firmar un nuevo convenio de derivación. La mayoría llegó correctamente identificada con etiqueta de código de barras y remito completo. Sin embargo, tres tubos venían completamente sin etiqueta y otros dos tenían información incompleta: faltaba la fecha y hora de extracción en uno, y el número de historia clínica en el otro. La analista de recepción tuvo que actuar rápidamente porque había un médico esperando algunos de esos resultados para decidir un tratamiento.",
      "Según el protocolo de recepción vigente en el laboratorio, una muestra sin identificación completa no puede procesarse bajo ninguna circunstancia. La razón es simple pero fundamental: si un resultado se asigna a un paciente equivocado, las consecuencias pueden ser gravísimas, desde un diagnóstico erróneo hasta un tratamiento inadecuado. Ese riesgo no puede aceptarse por ninguna razón, incluso cuando existe presión externa para 'procesar igual y corregir después'. Los tres tubos sin etiqueta fueron colocados en cuarentena y se notificó al hospital de inmediato, solicitando nueva extracción y el envío de los datos identificatorios correctos.",
      "Para los tubos con información incompleta, el analista llamó directamente al hospital para obtener los datos faltantes. En uno de los casos, el número de historia clínica pudo confirmarse en menos de diez minutos. En el otro, la fecha y hora de extracción eran relevantes para interpretar correctamente el resultado de un análisis de coagulación, por lo que la muestra fue retenida hasta que la información llegó por correo formal. Todo el proceso de comunicación quedó documentado en el sistema con nombre del interlocutor, hora y contenido de la conversación.",
      "El episodio fue también una oportunidad para revisar el protocolo de rechazo de muestras. Se detectó que el formulario de rechazo no incluía un campo para registrar si el cliente había sido notificado telefónicamente o solo por correo, lo que dificultaba el seguimiento. Se actualizó el formulario para incluir ese campo y se agregó un campo de observaciones donde el analista puede registrar cualquier circunstancia especial. También se revisaron los criterios de aceptación para otros parámetros: temperatura de transporte, tipo de anticoagulante, relación sangre-anticoagulante y tiempo máximo desde la extracción.",
      "El laboratorio organizó una reunión técnica con el equipo de enfermería del hospital para revisar en conjunto el proceso de extracción, identificación y empaque de las muestras. Se creó un instructivo visual específico para el servicio, con imágenes del etiquetado correcto, ejemplos de errores frecuentes y un número de contacto directo para consultas antes de enviar muestras con dudas. Ese tipo de trabajo colaborativo entre instituciones mejora la calidad del proceso desde su origen y reduce los rechazos que generan demoras e inconvenientes para los pacientes.",
    ],
    vocab: [
      { es: "muestra", pt: "amostra" }, { es: "recepción", pt: "recepção" },
      { es: "etiqueta", pt: "etiqueta / rótulo" }, { es: "rechazo", pt: "rejeição" },
      { es: "conservación", pt: "conservação" }, { es: "criterio de aceptación", pt: "critério de aceitação" },
    ],
    quiz: [
      { question: "¿Cuántos tubos llegaron sin etiqueta en el incidente descrito?", options: ["Uno", "Dos", "Tres", "Cinco"], answer: "Tres" },
      { question: "¿Por qué no puede procesarse una muestra sin identificación completa?", options: ["Es muy costoso procesarla", "El riesgo de asignar un resultado a un paciente equivocado es inaceptable", "El sistema no lo permite técnicamente", "El proveedor lo prohíbe en el contrato"], answer: "El riesgo de asignar un resultado a un paciente equivocado es inaceptable" },
      { question: "¿Qué se hizo con los tres tubos sin etiqueta?", options: ["Se procesaron con nota de advertencia", "Se colocaron en cuarentena y se pidió nueva extracción", "Se descartaron sin avisar al hospital", "Se asignaron al último paciente registrado"], answer: "Se colocaron en cuarentena y se pidió nueva extracción" },
      { question: "¿Por qué era relevante la fecha y hora de extracción en el tubo con datos incompletos?", options: ["Solo era un requisito formal", "Era necesaria para interpretar correctamente un análisis de coagulación", "Por exigencia del sistema informático", "Para calcular el tiempo de transporte"], answer: "Era necesaria para interpretar correctamente un análisis de coagulación" },
      { question: "¿Qué debe quedar documentado cuando se llama al hospital para completar datos?", options: ["Solo el resultado final obtenido", "Quién llamó, con quién habló, qué información se obtuvo y en qué horario", "Solo el nombre del paciente", "Solo la fecha de la llamada"], answer: "Quién llamó, con quién habló, qué información se obtuvo y en qué horario" },
      { question: "¿Cuáles son los criterios de aceptación de una muestra según el protocolo?", options: ["Solo la identificación del paciente", "Identificación, volumen mínimo, tipo de tubo, temperatura y tiempo desde extracción", "Solo el tipo de tubo y el volumen", "Solo la temperatura de transporte"], answer: "Identificación, volumen mínimo, tipo de tubo, temperatura y tiempo desde extracción" },
      { question: "¿Qué se agregó al formulario de rechazo actualizado?", options: ["Se simplificó eliminando campos", "Campo para registrar si el cliente fue notificado y un campo de observaciones", "Se cambió a formato solo digital", "Se agregó la firma del director técnico"], answer: "Campo para registrar si el cliente fue notificado y un campo de observaciones" },
      { question: "¿Qué se creó para el hospital como mejora preventiva?", options: ["Un contrato de penalidades por errores", "Un instructivo visual con imágenes del etiquetado correcto y número de contacto directo", "Un sistema de penalidades económicas", "Un formulario adicional de solicitud"], answer: "Un instructivo visual con imágenes del etiquetado correcto y número de contacto directo" },
    ],
    dictation: "Cuando una muestra no cumple los criterios de recepción, el analista debe comunicarlo de forma profesional y documentar el motivo del rechazo.",
  },
  {
    id: "hemograma", title: "Hemograma completo", level: "Intermedio", category: "Laboratorio", emoji: "🩸",
    description: "Interpretación clínica y comunicación de resultados hematológicos.",
    readingTitle: "Los números que cuentan la historia",
    reading: [
      "El hemograma completo es uno de los análisis más solicitados en cualquier laboratorio clínico y, al mismo tiempo, uno de los que más información concentra en un solo informe. Proporciona datos sobre tres grandes líneas celulares de la sangre: los eritrocitos o glóbulos rojos, cuya función principal es transportar oxígeno a los tejidos; los leucocitos o glóbulos blancos, que son los principales actores del sistema inmune; y las plaquetas o trombocitos, responsables de la hemostasia primaria. Cada uno de estos grupos incluye varios subparámetros que en conjunto permiten orientar hacia diagnósticos muy diferentes, desde infecciones bacterianas o virales hasta anemias de distinto origen, trastornos de coagulación o patologías hematológicas graves.",
      "Cuando el analista revisa un hemograma, no solo verifica si los valores individuales están dentro del rango de referencia establecido para la edad y el sexo del paciente. También evalúa la coherencia interna del informe: ¿son consistentes entre sí el hematocrito, la hemoglobina y el recuento de glóbulos rojos? ¿El volumen corpuscular medio y la hemoglobina corpuscular media son compatibles con el tipo de anemia que se sospecha? ¿El recuento diferencial de leucocitos tiene sentido en el contexto clínico conocido del paciente? Esta lectura integrada es lo que distingue un procesamiento mecánico de una interpretación analítica de calidad.",
      "Un aspecto crítico es la detección de hallazgos que requieren acción inmediata, conocidos como valores de pánico o resultados críticos. Un recuento de glóbulos blancos extremadamente elevado, especialmente con morfología anormal en el frotis, puede orientar hacia una leucemia aguda y requiere comunicación urgente al médico. Un valor de plaquetas muy bajo, por debajo de veinte mil por microlitro, indica riesgo de sangrado espontáneo grave. Una hemoglobina en niveles muy bajos puede implicar la necesidad de transfusión inmediata. En todos estos casos, el laboratorio tiene la obligación ética y regulatoria de contactar al médico tratante antes de liberar el informe formal.",
      "Los factores preanalíticos son otra fuente importante de variación que el analista debe conocer y saber identificar. La hemólisis de la muestra, causada por una extracción dificultosa o un transporte inadecuado, puede elevar falsamente la hemoglobina libre y alterar el recuento de glóbulos rojos. La lipemia severa interfiere con la medición fotométrica de la hemoglobina. Una muestra con microcoágulos invisibles a simple vista puede dar un recuento de plaquetas falsamente bajo, lo que podría llevar a decisiones clínicas incorrectas. Reconocer estas interferencias y actuar en consecuencia, ya sea repitiendo el análisis o reportándola con una observación, es parte fundamental del trabajo del analista.",
      "Comunicar un hemograma de forma útil al médico va mucho más allá de entregar el papel impreso con los valores y sus rangos de referencia. Implica saber identificar cuáles hallazgos son clínicamente relevantes, cuáles son urgentes y requieren llamado telefónico, y cuáles pueden incluirse como observación en el informe escrito. En un laboratorio de calidad, el analista no es solo un operador de equipos: es un profesional capaz de agregar valor interpretativo al resultado, colaborando activamente con el médico en el proceso diagnóstico.",
    ],
    vocab: [
      { es: "hemograma", pt: "hemograma" }, { es: "glóbulo rojo / eritrocito", pt: "glóbulo vermelho / eritrócito" },
      { es: "glóbulo blanco / leucocito", pt: "glóbulo branco / leucócito" }, { es: "plaqueta", pt: "plaqueta" },
      { es: "valor crítico / pánico", pt: "valor crítico / pânico" }, { es: "frotis de sangre", pt: "esfregaço de sangue" },
    ],
    quiz: [
      { question: "¿Qué tres líneas celulares evalúa el hemograma completo?", options: ["Glucosa, colesterol y triglicéridos", "Eritrocitos, leucocitos y plaquetas", "Sodio, potasio y cloro", "TGO, TGP y bilirrubina"], answer: "Eritrocitos, leucocitos y plaquetas" },
      { question: "¿Cuál es la función principal de los eritrocitos?", options: ["Defender contra infecciones", "Transportar oxígeno a los tejidos", "Controlar la coagulación", "Producir anticuerpos"], answer: "Transportar oxígeno a los tejidos" },
      { question: "¿Qué evalúa el analista además de los valores individuales?", options: ["Solo si están dentro del rango", "La coherencia interna y si los parámetros son consistentes con el cuadro clínico", "Solo el recuento total de células", "Solo el resultado más urgente"], answer: "La coherencia interna y si los parámetros son consistentes con el cuadro clínico" },
      { question: "¿Qué puede indicar un recuento de leucocitos muy elevado con morfología anormal?", options: ["Una infección bacteriana común", "Una posible leucemia aguda que requiere comunicación urgente al médico", "Un valor dentro de lo esperado por la edad", "Una hemólisis de la muestra"], answer: "Una posible leucemia aguda que requiere comunicación urgente al médico" },
      { question: "¿Qué puede causar microcoágulos invisibles en la muestra?", options: ["Aumentar la hemoglobina medida", "Un recuento de plaquetas falsamente bajo", "Elevar los glóbulos blancos", "No tienen ningún efecto conocido"], answer: "Un recuento de plaquetas falsamente bajo" },
      { question: "¿Qué efecto tiene la lipemia sobre la medición del hemograma?", options: ["Aumenta falsamente las plaquetas", "Interfiere con la medición fotométrica de la hemoglobina", "Reduce el recuento de glóbulos rojos", "No tiene efectos conocidos"], answer: "Interfiere con la medición fotométrica de la hemoglobina" },
      { question: "¿Cuándo debe comunicarse un resultado crítico al médico?", options: ["Al día siguiente por correo electrónico", "Antes de liberar el informe formal, por teléfono", "Solo si el médico lo solicita expresamente", "Al finalizar el turno de trabajo"], answer: "Antes de liberar el informe formal, por teléfono" },
      { question: "¿Qué distingue a un analista que agrega valor al hemograma?", options: ["Que procesa más muestras por hora", "Que identifica hallazgos relevantes y colabora con el médico en el proceso diagnóstico", "Que usa el equipo más moderno disponible", "Que entrega el informe más rápido"], answer: "Que identifica hallazgos relevantes y colabora con el médico en el proceso diagnóstico" },
    ],
    dictation: "El analista debe identificar los resultados críticos del hemograma y comunicarlos al médico antes de liberar el informe formal.",
  },
  {
    id: "bioquimica", title: "Bioquímica clínica", level: "Intermedio", category: "Laboratorio", emoji: "⚗️",
    description: "Glucosa, perfil lipídico, función renal y hepática en contexto clínico.",
    readingTitle: "El perfil que habla por el paciente",
    reading: [
      "La bioquímica clínica es una de las áreas más amplias y frecuentemente solicitadas del laboratorio. Abarca una gran variedad de análisis diseñados para evaluar el funcionamiento de órganos y sistemas: la glucosa y la hemoglobina glicosilada para el control del metabolismo de los hidratos de carbono; el colesterol total, el HDL, el LDL y los triglicéridos para el perfil lipídico cardiovascular; la creatinina, la urea y la tasa de filtración glomerular estimada para la función renal; las transaminasas TGO y TGP, la bilirrubina, la fosfatasa alcalina y la GGT para la función hepática; entre muchos otros marcadores especializados.",
      "Cuando el médico solicita un perfil metabólico completo, el analista enfrenta el desafío de garantizar no solo que cada valor individual sea correcto, sino también que el conjunto sea coherente y tenga sentido clínico. Por ejemplo, un aumento de creatinina acompañado de una disminución de la tasa de filtración glomerular estimada y un aumento de la urea refuerza significativamente la sospecha de compromiso renal. Por el contrario, si solo uno de esos tres parámetros está alterado sin correspondencia con los demás, puede ser señal de una interferencia analítica o de una condición clínica específica que afecta selectivamente ese marcador.",
      "La interpretación clínica de los resultados bioquímicos requiere también conocer el contexto del paciente. Una glucosa de 180 mg/dL tiene un significado completamente diferente en un paciente diabético conocido en tratamiento que en una persona sin antecedentes que no había ayunado antes del análisis. Una creatinina de 1.5 mg/dL puede ser normal en un hombre joven con mucha masa muscular y ser un indicador de daño renal significativo en una mujer adulta mayor con escasa masa corporal. Por eso, el laboratorio que puede contextualizar sus resultados aporta mucho más valor que aquel que simplemente informa números.",
      "El control de calidad en bioquímica tiene sus propias particularidades. Muchos de los equipos automatizados modernos procesan varios cientos de muestras por hora y corren los controles de forma intercalada con las muestras de pacientes. Si un control falla durante la corrida, el analista debe determinar qué muestras de pacientes se vieron potencialmente afectadas, retener esos resultados, investigar la causa del fallo y repetir tanto los controles como las muestras comprometidas. Ese proceso, cuando se hace bien, puede demandar varias horas pero es indispensable para garantizar la calidad del informe final.",
      "En la comunicación con el médico, el lenguaje técnico accesible es una habilidad clave que no siempre recibe la atención que merece en la formación de los profesionales de laboratorio. Explicar por qué dos resultados de creatinina de una misma semana son aparentemente diferentes sin que haya un error analítico, o por qué la bilirrubina elevada en una muestra hemolizada puede no reflejar la concentración real en el paciente, requiere claridad conceptual y capacidad de síntesis. Un laboratorio que sabe comunicar bien sus resultados es un laboratorio que genera confianza y fidelidad en sus clientes.",
    ],
    vocab: [
      { es: "glucosa", pt: "glicose" }, { es: "creatinina", pt: "creatinina" },
      { es: "perfil lipídico", pt: "perfil lipídico" }, { es: "función hepática", pt: "função hepática" },
      { es: "filtración glomerular", pt: "filtração glomerular" }, { es: "transaminasas", pt: "transaminases" },
    ],
    quiz: [
      { question: "¿Qué marcadores evalúan la función hepática?", options: ["Glucosa y creatinina", "TGO, TGP, bilirrubina, fosfatasa alcalina y GGT", "Colesterol y triglicéridos", "Hemoglobina y hematocrito"], answer: "TGO, TGP, bilirrubina, fosfatasa alcalina y GGT" },
      { question: "¿Qué marcadores evalúan la función renal?", options: ["TGO y TGP", "Creatinina, urea y filtración glomerular estimada", "Glucosa y hemoglobina glicosilada", "Colesterol HDL y LDL"], answer: "Creatinina, urea y filtración glomerular estimada" },
      { question: "¿Qué combinación refuerza la sospecha de compromiso renal?", options: ["Creatinina alta sola", "Creatinina alta más filtración glomerular baja más urea elevada", "Solo filtración glomerular baja", "TGO y TGP elevadas"], answer: "Creatinina alta más filtración glomerular baja más urea elevada" },
      { question: "¿Por qué importa el contexto clínico del paciente en bioquímica?", options: ["No importa, los valores son absolutos", "El mismo valor puede tener significados muy distintos según el paciente y sus características", "Solo importa para la facturación del análisis", "Solo para pacientes diabéticos o renales"], answer: "El mismo valor puede tener significados muy distintos según el paciente y sus características" },
      { question: "¿Qué hace el analista si un control falla durante la corrida de bioquímica?", options: ["Libera todos los resultados igual", "Retiene resultados afectados, investiga la causa y repite muestras comprometidas", "Solo repite el control fallido", "Avisa al médico y sigue procesando"], answer: "Retiene resultados afectados, investiga la causa y repite muestras comprometidas" },
      { question: "¿Por qué la bilirrubina elevada en una muestra hemolizada puede ser engañosa?", options: ["Porque siempre indica daño hepático real", "Porque la hemólisis libera contenido intracelular que puede no reflejar el nivel real del paciente", "Porque la bilirrubina no se ve afectada por hemólisis", "Porque es un valor técnicamente imposible"], answer: "Porque la hemólisis libera contenido intracelular que puede no reflejar el nivel real del paciente" },
      { question: "¿Por qué la creatinina puede ser diferente en dos pacientes con el mismo valor numérico?", options: ["Porque los equipos dan resultados distintos", "Porque la masa muscular y el sexo y la edad influyen en la interpretación clínica del valor", "Porque los rangos de referencia son incorrectos", "Porque depende del método analítico usado"], answer: "Porque la masa muscular y el sexo y la edad influyen en la interpretación clínica del valor" },
      { question: "¿Qué genera confianza y fidelidad en los clientes del laboratorio?", options: ["Tener los equipos más modernos", "Saber comunicar bien los resultados con claridad y contexto clínico apropiado", "Tener los precios más bajos del mercado", "Procesar más muestras por día que la competencia"], answer: "Saber comunicar bien los resultados con claridad y contexto clínico apropiado" },
    ],
    dictation: "La bioquímica clínica evalúa el funcionamiento de órganos a través de marcadores como glucosa, creatinina y perfil lipídico, siempre en contexto clínico.",
  },
  {
    id: "microbiologia", title: "Microbiología básica", level: "Avanzado", category: "Laboratorio", emoji: "🦠",
    description: "Cultivos, antibiogramas y comunicación de resultados microbiológicos.",
    readingTitle: "El cultivo que tardó tres días",
    reading: [
      "La microbiología es el área del laboratorio clínico con los tiempos de respuesta más largos y, al mismo tiempo, con algunos de los resultados de mayor impacto sobre las decisiones terapéuticas. A diferencia de la bioquímica o la hematología, donde los resultados pueden estar disponibles en minutos u horas, un cultivo microbiológico puede tardar entre veinticuatro y setenta y dos horas en mostrar crecimiento visible, y la identificación completa del microorganismo más el antibiograma pueden extender el proceso varios días adicionales.",
      "El proceso comienza con la siembra de la muestra en medios de cultivo seleccionados según el tipo de microorganismo que se sospecha y el origen anatómico de la muestra. Una muestra de orina se siembra en medios diferentes a una muestra de esputo o de herida quirúrgica. Después de la incubación, el analista examina las placas buscando crecimiento de colonias, evalúa su morfología, realiza pruebas de orientación como la coloración de Gram y, si hay crecimiento significativo, procede a la identificación formal del microorganismo mediante sistemas automatizados o pruebas bioquímicas convencionales.",
      "El antibiograma es el componente del informe microbiológico de mayor relevancia clínica directa: informa al médico qué antibióticos son eficaces contra el microorganismo identificado y cuáles no lo son. Los resultados se expresan como sensible, intermedio o resistente para cada antibiótico evaluado. En contextos de resistencia bacteriana creciente, algunos resultados del antibiograma son particularmente críticos: la detección de un Staphylococcus aureus resistente a meticilina (MRSA) o de una enterobacteria productora de carbapenemasas cambia completamente el esquema de tratamiento y activa protocolos de aislamiento en el hospital.",
      "Durante el período de espera del cultivo, el médico frecuentemente necesita información parcial para iniciar un tratamiento empírico, es decir, un tratamiento basado en la probabilidad estadística del microorganismo causante y no en la certeza del cultivo. El laboratorio puede colaborar informando los resultados de la tinción de Gram como resultado preliminar: la observación de cocos grampositivos en una muestra de sangre, por ejemplo, puede orientar hacia un tratamiento inicial mientras se espera el resultado definitivo. Esa comunicación preliminar debe ser siempre acompañada de una indicación clara de que se trata de un resultado provisorio.",
      "La resistencia bacteriana es hoy uno de los desafíos de salud pública más urgentes a nivel global. El uso excesivo e inadecuado de antibióticos en las últimas décadas ha favorecido la selección de cepas resistentes que son difíciles o imposibles de tratar con los antibióticos disponibles. El laboratorio de microbiología juega un papel clave en este contexto: informar correctamente los perfiles de sensibilidad, alertar cuando se detectan mecanismos de resistencia emergentes y participar activamente en los programas de vigilancia epidemiológica son acciones que trascienden el resultado individual y contribuyen a la salud de la comunidad.",
    ],
    vocab: [
      { es: "cultivo", pt: "cultura" }, { es: "antibiograma", pt: "antibiograma" },
      { es: "microorganismo", pt: "micro-organismo" }, { es: "resultado preliminar", pt: "resultado preliminar" },
      { es: "resistencia bacteriana", pt: "resistência bacteriana" }, { es: "tratamiento empírico", pt: "tratamento empírico" },
    ],
    quiz: [
      { question: "¿Cuánto puede tardar un cultivo microbiológico completo?", options: ["Solo minutos", "Entre 24 y 72 horas y el antibiograma puede extenderse más días", "Exactamente 1 hora con equipos modernos", "Solo 6 horas en laboratorios acreditados"], answer: "Entre 24 y 72 horas y el antibiograma puede extenderse más días" },
      { question: "¿Por qué se siembra la muestra en diferentes medios de cultivo?", options: ["Por razones estéticas de presentación", "Porque distintos medios favorecen el crecimiento de diferentes microorganismos según el origen", "Para ahorrar cantidad de reactivos", "Por exigencia de la norma solamente"], answer: "Porque distintos medios favorecen el crecimiento de diferentes microorganismos según el origen" },
      { question: "¿Qué información proporciona el antibiograma al médico?", options: ["La cantidad de bacterias presentes", "Qué antibióticos son sensibles, intermedios o resistentes para el microorganismo identificado", "El origen anatómico de la infección", "El tiempo de evolución estimado de la infección"], answer: "Qué antibióticos son sensibles, intermedios o resistentes para el microorganismo identificado" },
      { question: "¿Qué es un tratamiento empírico en microbiología?", options: ["Un tratamiento basado en experiencia personal del médico sin evidencia", "Un tratamiento basado en probabilidad estadística mientras se espera el cultivo definitivo", "Un tratamiento sin medicamentos probado por años", "El tratamiento definitivo confirmado por el resultado del cultivo"], answer: "Un tratamiento basado en probabilidad estadística mientras se espera el cultivo definitivo" },
      { question: "¿Qué información preliminar puede dar el laboratorio antes del cultivo definitivo?", options: ["El antibiograma completo estimado", "Los resultados de la coloración de Gram como orientación inicial", "El nombre exacto del microorganismo probable", "La concentración mínima inhibitoria"], answer: "Los resultados de la coloración de Gram como orientación inicial" },
      { question: "¿Qué debe acompañar siempre a un resultado microbiológico preliminar?", options: ["El tratamiento antibiótico recomendado", "La indicación clara de que es provisorio y el definitivo está en proceso", "La firma del director técnico del laboratorio", "El precio del análisis"], answer: "La indicación clara de que es provisorio y el definitivo está en proceso" },
      { question: "¿Qué caracteriza a una cepa MRSA?", options: ["Es resistente a absolutamente todos los antibióticos disponibles", "Es un Staphylococcus aureus resistente a meticilina que cambia completamente el esquema de tratamiento", "Es una bacteria exclusivamente hospitalaria sin riesgo comunitario", "Es una bacteria de baja patogenicidad y fácil tratamiento"], answer: "Es un Staphylococcus aureus resistente a meticilina que cambia completamente el esquema de tratamiento" },
      { question: "¿Qué papel tiene el laboratorio frente a la resistencia bacteriana global?", options: ["Ninguno, es un problema exclusivo de los médicos prescriptores", "Informar perfiles de sensibilidad, alertar sobre resistencias emergentes y participar en vigilancia epidemiológica", "Solo procesar los cultivos más rápido para reducir tiempos", "Reducir el número de cultivos procesados para no sobrecargar"], answer: "Informar perfiles de sensibilidad, alertar sobre resistencias emergentes y participar en vigilancia epidemiológica" },
    ],
    dictation: "El laboratorio debe comunicar los resultados microbiológicos preliminares con claridad, indicando que son provisorios y que el informe definitivo está en proceso.",
  },
  {
    id: "preanalítica", title: "Fase preanalítica", level: "Básico", category: "Laboratorio", emoji: "🩺",
    description: "El origen de la mayoría de los errores: todo lo que ocurre antes del análisis.",
    readingTitle: "El error que ocurrió antes de llegar al laboratorio",
    reading: [
      "Estudios realizados en diferentes países y tipos de laboratorios coinciden en un dato sorprendente: entre el sesenta y el setenta por ciento de todos los errores en el laboratorio clínico ocurren durante la fase preanalítica, es decir, antes de que la muestra llegue al analizador. Estos errores incluyen desde la identificación incorrecta del paciente en el momento de la solicitud médica, pasando por la extracción en el tubo equivocado o en el orden incorrecto de llenado, hasta el transporte a temperatura inadecuada o el tiempo de espera excesivo entre la extracción y el centrifugado.",
      "La fase preanalítica comienza en el momento en que el médico decide solicitar un análisis y no en la recepción del laboratorio. Incluye la solicitud médica (¿se pidió el análisis correcto para la pregunta clínica que se quiere responder?), la preparación del paciente (¿ayunó el tiempo suficiente? ¿tomó algún medicamento que puede interferir?), la extracción de la muestra (¿se usó el tubo correcto, el anticoagulante adecuado, la técnica apropiada?), el transporte (¿en qué condiciones de temperatura y tiempo?) y la recepción en el laboratorio (¿la muestra cumple los criterios de aceptación?).",
      "Uno de los errores preanalíticos más frecuentes es la hemólisis, la ruptura de los glóbulos rojos durante o después de la extracción. La hemólisis libera el contenido intracelular de los eritrocitos al plasma, elevando falsamente marcadores como la potasemia, la LDH y la hemoglobina libre. En muchos casos, la muestra hemolizada debe rechazarse y solicitar una nueva extracción. En otros, el laboratorio puede informar el resultado con una advertencia de hemólisis, dependiendo del análisis en cuestión y del grado de hemólisis detectado.",
      "El orden de llenado de los tubos es otro aspecto crítico que no siempre recibe la atención que merece en la formación del personal de extracción. Si se llena primero un tubo con anticoagulante antes de uno sin anticoagulante, puede producirse contaminación cruzada que afecta los estudios de coagulación. El orden estandarizado internacionalmente establece una secuencia específica según el tipo de tubo y su contenido. Ese orden no es una formalidad: tiene un fundamento científico que protege la calidad del resultado.",
      "La gestión de la fase preanalítica requiere una visión sistémica que va más allá del laboratorio en sí mismo. Incluye la formación continua del personal de enfermería que realiza las extracciones, el diseño ergonómico de los formularios de solicitud para reducir errores de transcripción, la instalación de sistemas de trazabilidad como el código de barras desde el momento de la extracción, y la comunicación fluida entre el laboratorio y los diferentes servicios del hospital o clínica. Un laboratorio que invierte en la calidad preanalítica está invirtiendo en la reducción del porcentaje más grande de sus errores.",
    ],
    vocab: [
      { es: "fase preanalítica", pt: "fase pré-analítica" }, { es: "hemólisis", pt: "hemólise" },
      { es: "anticoagulante", pt: "anticoagulante" }, { es: "centrifugado", pt: "centrifugação" },
      { es: "orden de llenado", pt: "ordem de coleta" }, { es: "solicitud médica", pt: "pedido médico" },
    ],
    quiz: [
      { question: "¿Qué porcentaje de los errores del laboratorio ocurren en la fase preanalítica?", options: ["10 a 20%", "60 a 70%", "Menos del 5%", "Exactamente el 50%"], answer: "60 a 70%" },
      { question: "¿Cuándo comienza realmente la fase preanalítica?", options: ["Cuando la muestra llega al laboratorio", "Cuando el médico decide solicitar el análisis", "Cuando se centrifuga la muestra", "Cuando el analista recibe el tubo"], answer: "Cuando el médico decide solicitar el análisis" },
      { question: "¿Qué es la hemólisis y qué la causa?", options: ["Una infección bacteriana de la muestra", "La ruptura de glóbulos rojos durante o después de la extracción", "Un reactivo analítico vencido o en mal estado", "Una temperatura muy baja durante el transporte"], answer: "La ruptura de glóbulos rojos durante o después de la extracción" },
      { question: "¿Qué marcadores se ven elevados falsamente por hemólisis?", options: ["Glucosa y colesterol", "Potasemia, LDH y hemoglobina libre", "Creatinina y urea exclusivamente", "TGO y bilirrubina directa solamente"], answer: "Potasemia, LDH y hemoglobina libre" },
      { question: "¿Por qué es crítico el orden de llenado de los tubos?", options: ["Solo por razones estéticas de organización", "Para evitar contaminación cruzada entre anticoagulantes que afecta los estudios de coagulación", "Porque lo exige la norma sin razón científica demostrada", "Solo es importante en los tubos específicos de coagulación"], answer: "Para evitar contaminación cruzada entre anticoagulantes que afecta los estudios de coagulación" },
      { question: "¿Qué aspectos incluye la fase preanalítica según el texto?", options: ["Solo la extracción de sangre del paciente", "Solicitud médica, preparación del paciente, extracción, transporte y recepción", "Solo el transporte de las muestras hasta el laboratorio", "Solo la recepción en el laboratorio"], answer: "Solicitud médica, preparación del paciente, extracción, transporte y recepción" },
      { question: "¿Qué herramienta de trazabilidad se menciona para mejorar la fase preanalítica?", options: ["Solo los formularios de papel tradicionales", "Sistemas de código de barras desde el momento de la extracción", "Solo la supervisión visual permanente del proceso", "Solo la capacitación periódica del personal"], answer: "Sistemas de código de barras desde el momento de la extracción" },
      { question: "¿Qué implica gestionar bien la fase preanalítica?", options: ["Contratar más analistas de laboratorio", "Reducir el mayor porcentaje de errores mediante trabajo colaborativo entre instituciones y sistemas de trazabilidad", "Comprar equipos más modernos y costosos", "Aumentar la velocidad de procesamiento de muestras"], answer: "Reducir el mayor porcentaje de errores mediante trabajo colaborativo entre instituciones y sistemas de trazabilidad" },
    ],
    dictation: "Entre el sesenta y el setenta por ciento de los errores del laboratorio ocurren en la fase preanalítica, antes de que la muestra llegue al analizador.",
  },

  // ══════════════════════════════════════════
  // GESTIÓN
  // ══════════════════════════════════════════
  {
    id: "indicadores", title: "Indicadores de calidad", level: "Intermedio", category: "Gestión", emoji: "📈",
    description: "Interpretar, discutir y gestionar indicadores, metas y desvíos operativos.",
    readingTitle: "Cuando el indicador no cuenta toda la historia",
    reading: [
      "En la reunión mensual de revisión de indicadores, el equipo presentó el informe de desempeño del período. A primera vista, los números parecían buenos: el tiempo medio de respuesta se mantenía dentro del objetivo, el porcentaje de muestras rechazadas había disminuido respecto al mes anterior, y el índice de satisfacción de clientes había subido dos puntos. Sin embargo, cuando la coordinadora comenzó a hacer preguntas más específicas, la imagen empezó a complicarse.",
      "Una analista señaló que el tiempo medio de respuesta como número global era engañoso. Si bien el promedio estaba dentro del objetivo, existían dos o tres casos por semana en los que muestras urgentes de pacientes internados llegaban con retrasos superiores a cuatro horas. Esos casos no movían el promedio porque representaban un porcentaje pequeño del total, pero tenían un impacto clínico desproporcionado: eran exactamente los casos donde el tiempo era más crítico. El indicador global ocultaba el problema en lugar de revelarlo.",
      "La coordinación propuso desagregar los indicadores de tiempo de respuesta en al menos tres categorías distintas: muestras de rutina, muestras urgentes de ambulatorio y muestras urgentes de internación. Ese nivel de desagregación permitiría monitorear de forma independiente los segmentos de mayor impacto clínico. También propusieron analizar los tiempos por franja horaria, porque sospechaban que los retrasos se concentraban en determinados turnos con menos personal disponible.",
      "Los indicadores de calidad son herramientas de gestión, no fines en sí mismos. Su valor radica en la capacidad de orientar decisiones y detectar problemas antes de que se conviertan en crisis. Un indicador que siempre está verde puede ser una buena noticia o puede ser señal de que se está midiendo lo incorrecto. Por eso, la selección de qué indicadores usar, cómo definirlos, cómo medirlos y cómo interpretarlos es una decisión estratégica que debe involucrar a los profesionales que conocen el proceso desde adentro.",
      "La reunión terminó con un acuerdo concreto: durante los próximos dos meses, el equipo implementaría los indicadores desagregados propuestos, definiría metas específicas para cada categoría y presentaría un análisis de causa para los casos que superaran el límite establecido. Se asignaron responsables para cada indicador y se fijó una fecha de revisión. Esa estructura de seguimiento es lo que transforma un indicador de un número en el papel en una herramienta real de mejora continua.",
    ],
    vocab: [
      { es: "indicador", pt: "indicador" }, { es: "desagregar datos", pt: "desagregar dados" },
      { es: "no conformidad", pt: "não conformidade" }, { es: "promedio / media", pt: "média" },
      { es: "meta / objetivo", pt: "meta / objetivo" }, { es: "mejora continua", pt: "melhoria contínua" },
    ],
    quiz: [
      { question: "¿Por qué era engañoso el tiempo medio de respuesta como indicador global?", options: ["Porque era demasiado alto comparado con la competencia", "Porque ocultaba retrasos graves en muestras urgentes de pacientes críticos", "Porque no se medía correctamente desde el sistema", "Porque no era el indicador adecuado para este laboratorio"], answer: "Porque ocultaba retrasos graves en muestras urgentes de pacientes críticos" },
      { question: "¿Cuántos casos de retraso grave se detectaban por semana?", options: ["Más de veinte casos semanales", "Dos o tres casos con retrasos mayores a cuatro horas", "Ninguno según el indicador global", "Solo uno al mes como máximo"], answer: "Dos o tres casos con retrasos mayores a cuatro horas" },
      { question: "¿En qué categorías propuso desagregar el indicador la coordinación?", options: ["Por analista responsable y por turno", "Muestras de rutina, urgentes de ambulatorio y urgentes de internación", "Solo por tipo de análisis solicitado", "Por cliente y por mes calendario"], answer: "Muestras de rutina, urgentes de ambulatorio y urgentes de internación" },
      { question: "¿Por qué un indicador siempre en verde puede ser problemático?", options: ["Nunca es problemático si está en verde", "Puede indicar que se mide lo incorrecto o que el umbral está mal definido", "Indica que el laboratorio funciona perfectamente sin problemas", "Solo es problema si el cliente se queja formalmente"], answer: "Puede indicar que se mide lo incorrecto o que el umbral está mal definido" },
      { question: "¿Cuál es el verdadero valor de un indicador de calidad?", options: ["Estar siempre dentro del rango aceptable", "Orientar decisiones concretas y detectar problemas antes de que se conviertan en crisis", "Cumplir formalmente con los requisitos de la norma", "Mostrar resultados positivos al directorio de la institución"], answer: "Orientar decisiones concretas y detectar problemas antes de que se conviertan en crisis" },
      { question: "¿Quiénes deben participar en la selección y definición de indicadores?", options: ["Solo el área de calidad del laboratorio", "Los profesionales que conocen el proceso desde adentro", "Solo la dirección del laboratorio o institución", "Solo los auditores externos durante las auditorías"], answer: "Los profesionales que conocen el proceso desde adentro" },
      { question: "¿Qué estructura de seguimiento se acordó implementar?", options: ["Revisar indicadores solo si hay quejas de clientes", "Responsables por indicador, metas específicas, análisis de causa y fechas de revisión", "Solo un informe anual de resultados", "Revisar mensualmente sin asignar responsables específicos"], answer: "Responsables por indicador, metas específicas, análisis de causa y fechas de revisión" },
      { question: "¿Qué transforma a un indicador en una herramienta real de mejora?", options: ["Publicarlo en la cartelera del laboratorio", "La estructura de seguimiento con responsables, fechas y análisis de resultados concretos", "Calcularlo con mayor frecuencia que antes", "Compararlo con indicadores de otros laboratorios del sector"], answer: "La estructura de seguimiento con responsables, fechas y análisis de resultados concretos" },
    ],
    dictation: "Los indicadores de calidad son útiles solo si se interpretan en contexto, se desagregan correctamente y se usan para tomar decisiones reales de mejora.",
  },
  {
    id: "no-conformidades", title: "No conformidades y CAPA", level: "Intermedio", category: "Gestión", emoji: "⚠️",
    description: "Detección, análisis de causa raíz y acciones correctivas y preventivas.",
    readingTitle: "El mismo error dos veces",
    reading: [
      "El área de calidad registró una nueva no conformidad relacionada con un error en el etiquetado de muestras durante el proceso de recepción. Un tubo de sangre había sido asignado al número de solicitud equivocado, lo que podría haber resultado en un informe enviado al paciente incorrecto si el error no se hubiera detectado durante la revisión previa a la liberación. Al revisar el historial del sistema de calidad, el equipo encontró un incidente casi idéntico registrado seis meses antes. Ese episodio anterior había sido cerrado con una nota de 'informado al personal' pero sin ninguna acción correctiva formal documentada.",
      "La situación planteaba una pregunta incómoda pero necesaria: ¿por qué el mismo error había ocurrido dos veces en el mismo proceso? La respuesta estaba en el tipo de cierre que se le había dado al primer incidente. Informar verbalmente al personal sobre un error puede generar conciencia momentánea, pero sin un cambio en el proceso, el sistema sigue siendo igualmente vulnerable al mismo tipo de fallo. El conocimiento de que 'hubo un error antes' no es suficiente para prevenir que ocurra de nuevo.",
      "Esta vez, el equipo decidió aplicar un análisis formal de causa raíz usando la técnica de los '5 Por qué'. El primer por qué: ¿por qué se asignó mal el tubo? Porque el operador confundió dos solicitudes que llegaron al mismo tiempo. El segundo por qué: ¿por qué llegaron dos solicitudes al mismo tiempo sin separación? Porque no había un procedimiento explícito para la recepción de múltiples solicitudes simultáneas. El tercer por qué: ¿por qué no existía ese procedimiento? Porque el proceso había crecido con los años y el flujo real ya no correspondía al procedimiento escrito, que seguía describiendo un proceso más simple y menos concurrido.",
      "Con la causa raíz identificada, el equipo diseñó una CAPA que abordaba el problema de forma sistémica. La acción correctiva incluyó la actualización del procedimiento de recepción para incluir un paso explícito de separación física y visual de las solicitudes antes de comenzar el proceso de etiquetado. También se agregó un control de doble verificación: el operador que etiqueta un tubo debe confirmarlo con otro analista antes de que la muestra avance al siguiente paso. La acción preventiva incluyó la revisión de otros procesos del laboratorio donde pudiera existir una situación similar de múltiples solicitudes concurrentes sin separación formal.",
      "A los treinta días de implementadas las acciones, se realizó la verificación de eficacia. Se revisaron los registros de recepción del período y no se detectaron incidentes de etiquetado incorrecto. El indicador de no conformidades relacionadas con el proceso de recepción mostró una reducción del ochenta por ciento respecto al período equivalente del año anterior. La no conformidad fue cerrada formalmente con toda la documentación de las acciones implementadas y sus resultados. El caso fue incluido como ejemplo en el programa de inducción de nuevos analistas del área.",
    ],
    vocab: [
      { es: "no conformidad", pt: "não conformidade" }, { es: "acción correctiva", pt: "ação corretiva" },
      { es: "acción preventiva", pt: "ação preventiva" }, { es: "causa raíz", pt: "causa raiz" },
      { es: "verificación de eficacia", pt: "verificação de eficácia" }, { es: "CAPA", pt: "CAPA" },
    ],
    quiz: [
      { question: "¿Qué tipo de error generó la no conformidad descrita?", options: ["Un resultado incorrecto que fue liberado", "Un tubo asignado al número de solicitud equivocado durante la recepción", "Una muestra perdida durante el proceso", "Un informe enviado con retraso al cliente"], answer: "Un tubo asignado al número de solicitud equivocado durante la recepción" },
      { question: "¿Cuándo había ocurrido un incidente similar anteriormente?", options: ["Nunca había ocurrido antes", "Seis meses antes, cerrado sin acción correctiva real", "Un año antes con acción correctiva documentada y verificada", "La semana anterior también"], answer: "Seis meses antes, cerrado sin acción correctiva real" },
      { question: "¿Por qué informar verbalmente al personal no es suficiente como acción correctiva?", options: ["Porque el personal no escucha las indicaciones", "Sin un cambio en el proceso el sistema sigue siendo igualmente vulnerable al mismo fallo", "Porque no queda documentado formalmente en el sistema", "Porque no involucra a la dirección del laboratorio"], answer: "Sin un cambio en el proceso el sistema sigue siendo igualmente vulnerable al mismo fallo" },
      { question: "¿Qué técnica de análisis de causa raíz usó el equipo?", options: ["Diagrama de Ishikawa", "Los 5 Por qué", "Análisis de modo de falla y sus efectos", "Diagrama de Pareto para priorizar causas"], answer: "Los 5 Por qué" },
      { question: "¿Cuál fue la causa raíz identificada con los 5 Por qué?", options: ["Un error puntual del operador ese día específico", "El procedimiento escrito estaba desactualizado y no reflejaba el flujo real con múltiples solicitudes simultáneas", "El sistema informático tenía un error de programación", "La capacitación inicial había sido insuficiente"], answer: "El procedimiento escrito estaba desactualizado y no reflejaba el flujo real con múltiples solicitudes simultáneas" },
      { question: "¿Qué acción correctiva se implementó en el proceso físico de recepción?", options: ["Contratar más personal para el área", "Paso explícito de separación física de solicitudes y control de doble verificación antes de avanzar", "Cambiar completamente el sistema informático", "Reducir la cantidad de solicitudes simultáneas aceptadas"], answer: "Paso explícito de separación física de solicitudes y control de doble verificación antes de avanzar" },
      { question: "¿Qué resultado mostró la verificación de eficacia a los 30 días?", options: ["No hubo mejora significativa en el período", "Reducción del 80% en no conformidades relacionadas con el proceso de recepción", "El indicador empeoró con las nuevas medidas", "Los resultados no fueron concluyentes aún"], answer: "Reducción del 80% en no conformidades relacionadas con el proceso de recepción" },
      { question: "¿Qué uso final se dio al caso dentro del laboratorio?", options: ["Se archivó y nunca se volvió a mencionar", "Se incluyó como ejemplo positivo en el programa de inducción de nuevos analistas del área", "Se reportó como sanción disciplinaria formal", "Se usó para justificar una inversión en tecnología"], answer: "Se incluyó como ejemplo positivo en el programa de inducción de nuevos analistas del área" },
    ],
    dictation: "Una acción correctiva real debe identificar la causa raíz, cambiar el proceso y verificar la eficacia de las acciones implementadas.",
  },
  {
    id: "auditorias", title: "Auditorías internas", level: "Avanzado", category: "Gestión", emoji: "🔍",
    description: "Planificación, ejecución y seguimiento de auditorías del sistema de calidad.",
    readingTitle: "El día de la auditoría",
    reading: [
      "Una auditoría interna bien concebida no debería ser una instancia que el personal teme o percibe como una amenaza. Su propósito no es encontrar culpables ni demostrar que algo está mal: es verificar de forma objetiva y sistemática que los procesos se ejecutan de acuerdo con lo documentado, identificar brechas entre lo que el sistema dice que se hace y lo que realmente ocurre, y generar oportunidades concretas de mejora. Un laboratorio que entiende esto organiza sus auditorías como una herramienta de aprendizaje y no como un evento de fiscalización.",
      "La planificación de la auditoría es tan importante como su ejecución. El auditor, que debe ser una persona diferente de la que trabaja habitualmente en el proceso auditado, prepara un plan de auditoría que incluye los objetivos específicos, el alcance (qué procesos o áreas se van a revisar), los criterios de auditoría (contra qué normas o procedimientos se va a comparar la práctica real), el programa de actividades y la lista de verificación de los puntos que se van a evaluar. Esa preparación evita que la auditoría se convierta en una revisión superficial o arbitraria.",
      "Durante la ejecución, el auditor combina tres tipos de actividades: revisión de registros (verificar que la documentación esté completa, actualizada y accesible), observación directa de los procesos en tiempo real (ver cómo se hace realmente lo que el procedimiento dice que se debe hacer), y entrevistas con el personal (preguntar cómo se hacen las cosas, qué se haría ante determinadas situaciones, si se conoce el procedimiento correspondiente). Cada hallazgo debe registrarse con evidencia objetiva: una cita del registro revisado, una foto del proceso observado, la transcripción de la respuesta del entrevistado.",
      "Los hallazgos se clasifican según su impacto en el sistema de calidad. Una no conformidad mayor es una falla sistémica que compromete seriamente la calidad del resultado o incumple un requisito crítico de la norma. Una no conformidad menor es una falla puntual que no compromete el resultado general pero debe corregirse. Una observación u oportunidad de mejora es un aspecto donde el sistema funciona correctamente pero podría hacerlo mejor. Esta clasificación determina los plazos que se le otorgan al área auditada para presentar su plan de acción.",
      "El valor real de una auditoría se mide en el seguimiento que se hace de sus hallazgos. Si los planes de acción se presentan pero nunca se verifica su implementación efectiva, la auditoría pierde su razón de ser. Por eso, el programa de auditorías de un laboratorio debe incluir no solo las auditorías iniciales sino también las auditorías de seguimiento, en las que se verifica específicamente que las acciones comprometidas en el plan se han implementado y han producido la mejora esperada. Ese ciclo completo de planificación, ejecución, plan de acción y verificación es la columna vertebral de la mejora continua.",
    ],
    vocab: [
      { es: "auditoría", pt: "auditoria" }, { es: "hallazgo", pt: "achado / constatação" },
      { es: "evidencia objetiva", pt: "evidência objetiva" }, { es: "mejora continua", pt: "melhoria contínua" },
      { es: "plan de acción", pt: "plano de ação" }, { es: "no conformidad mayor", pt: "não conformidade maior" },
    ],
    quiz: [
      { question: "¿Cuál es el verdadero propósito de una auditoría interna bien concebida?", options: ["Encontrar culpables y aplicar sanciones al personal", "Verificar que los procesos se ejecutan como documentado e identificar oportunidades de mejora", "Demostrar que el laboratorio cumple todas las normas", "Reducir los costos operativos del área auditada"], answer: "Verificar que los procesos se ejecutan como documentado e identificar oportunidades de mejora" },
      { question: "¿Quién debe realizar la auditoría de un proceso?", options: ["El mismo responsable habitual del proceso auditado", "Una persona diferente de quien trabaja habitualmente en ese proceso", "El director técnico del laboratorio exclusivamente", "Un auditor externo en todos los casos sin excepción"], answer: "Una persona diferente de quien trabaja habitualmente en ese proceso" },
      { question: "¿Qué incluye un plan de auditoría bien elaborado?", options: ["Solo la fecha y el nombre del auditor asignado", "Objetivos, alcance, criterios, programa de actividades y lista de verificación", "Solo los hallazgos que se espera encontrar", "Solo los procesos que se sospecha que tienen problemas"], answer: "Objetivos, alcance, criterios, programa de actividades y lista de verificación" },
      { question: "¿Cuáles son las tres actividades del auditor durante la ejecución?", options: ["Encuestas, mediciones y cálculos estadísticos", "Revisión de registros, observación directa de procesos y entrevistas al personal", "Solo revisión exhaustiva de documentos", "Mediciones de equipos, entrevistas y verificación de stocks"], answer: "Revisión de registros, observación directa de procesos y entrevistas al personal" },
      { question: "¿Qué es una no conformidad mayor en el contexto de auditorías?", options: ["Un problema pequeño que debe monitorearse con el tiempo", "Una falla sistémica que compromete seriamente la calidad o incumple un requisito crítico de la norma", "Una oportunidad de mejora sin urgencia real", "Un hallazgo que ya fue corregido antes de la auditoría"], answer: "Una falla sistémica que compromete seriamente la calidad o incumple un requisito crítico de la norma" },
      { question: "¿Qué diferencia a una observación de una no conformidad?", options: ["La observación no requiere ninguna documentación", "La observación es donde el sistema funciona pero podría mejorar; la no conformidad es un incumplimiento", "Solo la puede hacer el auditor externo", "No hay diferencia real entre ambas categorías"], answer: "La observación es donde el sistema funciona pero podría mejorar; la no conformidad es un incumplimiento" },
      { question: "¿Dónde se mide el valor real de una auditoría interna?", options: ["En el número total de hallazgos identificados", "En el seguimiento y verificación de que los planes de acción se implementaron efectivamente", "En la duración total de la auditoría", "En la satisfacción del equipo auditado con el proceso"], answer: "En el seguimiento y verificación de que los planes de acción se implementaron efectivamente" },
      { question: "¿Qué completa el ciclo de mejora continua en el contexto de auditorías?", options: ["Publicar los resultados en el informe anual", "Planificación, ejecución, plan de acción y verificación de su implementación efectiva", "Contratar más auditores internos y externos", "Comprar software especializado de gestión de calidad"], answer: "Planificación, ejecución, plan de acción y verificación de su implementación efectiva" },
    ],
    dictation: "El valor de una auditoría se mide en el seguimiento que se hace de sus hallazgos y en la implementación efectiva de los planes de acción.",
  },
  {
    id: "gestion-riesgos", title: "Gestión de riesgos", level: "Avanzado", category: "Gestión", emoji: "⚖️",
    description: "Identificación, evaluación y control de riesgos en el laboratorio clínico.",
    readingTitle: "El riesgo que nadie había mapeado",
    reading: [
      "Durante una revisión anual del sistema de gestión de calidad, el equipo de calidad del laboratorio detectó algo que nadie había pensado antes en identificar formalmente: el laboratorio dependía exclusivamente de un único proveedor para el reactivo principal de uno de sus análisis de mayor demanda. Si ese proveedor dejara de entregar el reactivo por cualquier razón, desabastecimiento, problemas de calidad en la producción, falla logística o cierre de la empresa, el laboratorio no tendría ninguna alternativa inmediata. El impacto potencial era considerable: imposibilidad de procesar ese análisis durante un período indeterminado, con consecuencias directas sobre los pacientes que dependían de ese resultado para sus tratamientos.",
      "La gestión de riesgos en el laboratorio es un proceso estructurado que consiste en identificar qué puede salir mal en cada proceso o actividad crítica, estimar la probabilidad de que ocurra y el impacto que tendría si ocurriera, y definir controles o planes de contingencia para reducir esa probabilidad o mitigar ese impacto. No todos los riesgos pueden eliminarse, y tampoco es necesario eliminarlos todos: la gestión eficiente consiste en priorizar los riesgos según su nivel de criticidad y asignar recursos donde el beneficio es mayor.",
      "El laboratorio comenzó el proceso de gestión de riesgos construyendo una matriz de riesgos para los procesos críticos. Para cada riesgo identificado, el equipo estimó una puntuación de probabilidad (del uno al cinco) y una puntuación de impacto (del uno al cinco), y multiplicó ambas para obtener el nivel de riesgo combinado. Los riesgos con puntuaciones altas se priorizaron para la definición inmediata de controles y planes de contingencia. El riesgo del proveedor único obtuvo una de las puntuaciones más altas del análisis.",
      "Para mitigar el riesgo del proveedor único, el laboratorio implementó varias acciones en paralelo. En primer lugar, identificó y contactó a dos proveedores alternativos del mismo reactivo, verificó la comparabilidad de sus productos mediante un estudio de correlación y los incorporó al registro de proveedores aprobados. En segundo lugar, definió un stock mínimo de reactivo equivalente a cuatro semanas de consumo, de modo de tener tiempo suficiente para activar el proveedor alternativo si el principal fallara. En tercer lugar, estableció un procedimiento formal de alerta temprana para activar el plan de contingencia ante cualquier señal de riesgo de desabastecimiento.",
      "La gestión de riesgos no es un ejercicio puntual que se hace una vez y se archiva: es un proceso continuo que debe revisarse periódicamente, actualizarse cuando cambian las condiciones del entorno y comunicarse a todo el equipo que trabaja en los procesos involucrados. Un laboratorio que identifica sus riesgos, los gestiona activamente y documenta sus acciones demuestra un nivel de madurez organizacional que va mucho más allá del cumplimiento normativo. La transparencia en la gestión de riesgos genera confianza, tanto interna como externa, en la solidez del sistema de calidad.",
    ],
    vocab: [
      { es: "riesgo", pt: "risco" }, { es: "matriz de riesgos", pt: "matriz de riscos" },
      { es: "plan de contingencia", pt: "plano de contingência" }, { es: "proveedor", pt: "fornecedor" },
      { es: "probabilidad", pt: "probabilidade" }, { es: "impacto", pt: "impacto" },
    ],
    quiz: [
      { question: "¿Qué riesgo crítico identificaron durante la revisión anual?", options: ["Un reactivo vencido en el stock", "Dependencia total de un único proveedor para un reactivo crítico de alta demanda", "Un equipo analítico obsoleto", "Falta de personal capacitado en el área"], answer: "Dependencia total de un único proveedor para un reactivo crítico de alta demanda" },
      { question: "¿Cómo se calcula el nivel de riesgo combinado en una matriz?", options: ["Probabilidad sumada al impacto", "Probabilidad multiplicada por impacto", "Solo por el nivel de impacto potencial", "Solo por la probabilidad de ocurrencia"], answer: "Probabilidad multiplicada por impacto" },
      { question: "¿Qué significa que no todos los riesgos pueden eliminarse?", options: ["Que la gestión de riesgos no es efectiva", "Que el objetivo es priorizar y gestionar los más críticos con los recursos disponibles", "Que solo deben gestionarse los riesgos con consecuencias legales", "Que solo los riesgos técnicos pueden reducirse"], answer: "Que el objetivo es priorizar y gestionar los más críticos con los recursos disponibles" },
      { question: "¿Qué verificaron antes de aprobar los proveedores alternativos?", options: ["Solo el precio más competitivo del mercado", "La comparabilidad de sus productos mediante un estudio de correlación formal", "Solo la disponibilidad de stock inmediato", "Solo las referencias comerciales de otros laboratorios"], answer: "La comparabilidad de sus productos mediante un estudio de correlación formal" },
      { question: "¿Cuántas semanas de stock mínimo de contingencia se definieron?", options: ["Una semana de consumo", "Dos semanas de consumo", "Cuatro semanas de consumo", "Ocho semanas de consumo"], answer: "Cuatro semanas de consumo" },
      { question: "¿Para qué sirve el procedimiento de alerta temprana?", options: ["Para renovar automáticamente el contrato con el proveedor", "Para activar el plan de contingencia ante cualquier señal de riesgo de desabastecimiento", "Para notificar al organismo acreditador", "Para aumentar el stock automáticamente mediante el sistema"], answer: "Para activar el plan de contingencia ante cualquier señal de riesgo de desabastecimiento" },
      { question: "¿Con qué frecuencia debe revisarse la gestión de riesgos?", options: ["Una vez al inicio del programa y nunca más", "Periódicamente y cuando cambian las condiciones del entorno operativo", "Solo cuando ocurre un incidente grave real", "Cada diez años durante las revisiones estratégicas"], answer: "Periódicamente y cuando cambian las condiciones del entorno operativo" },
      { question: "¿Qué demuestra un laboratorio que gestiona sus riesgos activamente?", options: ["Que tiene más problemas que los demás laboratorios", "Un nivel de madurez organizacional que trasciende el cumplimiento normativo y genera confianza", "Que necesita más recursos económicos", "Que no confía en sus proveedores habituales"], answer: "Un nivel de madurez organizacional que trasciende el cumplimiento normativo y genera confianza" },
    ],
    dictation: "La gestión de riesgos es un proceso continuo que identifica qué puede salir mal, estima probabilidad e impacto y define planes de contingencia.",
  },

  // ══════════════════════════════════════════
  // COMUNICACIÓN
  // ══════════════════════════════════════════
  {
    id: "atencion-cliente", title: "Atención técnica al cliente", level: "Intermedio", category: "Comunicación", emoji: "📞",
    description: "Español profesional para explicar resultados y gestionar consultas técnicas.",
    readingTitle: "Una llamada que exigía claridad",
    reading: [
      "A media mañana, una analista del área de atención al cliente recibió una llamada de un médico clínico que atendía pacientes en una clínica privada. El médico estaba confundido porque el informe de laboratorio de uno de sus pacientes mostraba un valor de creatinina que parecía diferente al del mes anterior, a pesar de que el paciente no había tenido ningún cambio clínico significativo. El médico quería saber si había habido un error en el laboratorio.",
      "La analista escuchó el planteo completo sin interrumpir. Luego pidió al médico que le confirmara el número de solicitud y el nombre del paciente para poder acceder al historial. Mientras revisaba los datos en el sistema, fue explicando en voz alta lo que estaba haciendo, para que el médico supiera que su consulta estaba siendo atendida con atención y no con prisa. Esa práctica simple, verbalizar el proceso mientras se investiga, transmite profesionalismo y genera confianza incluso antes de dar la respuesta.",
      "Al revisar el historial, la analista encontró la explicación: el laboratorio había implementado un nuevo método para la determinación de creatinina el mes anterior, con una calibración trazable a un estándar de referencia diferente. El nuevo método era más exacto, pero generaba valores sistemáticamente un poco más altos que el método anterior, lo cual era esperado y estaba documentado. El médico no había recibido ninguna comunicación sobre ese cambio.",
      "La analista explicó la situación con claridad, usando un lenguaje técnico pero accesible: describió el cambio de método, la razón del cambio, el tipo de diferencia que podía esperarse en los valores y el impacto clínico real, que era mínimo dado que la diferencia estaba dentro de la variación biológica normal para ese analito. También se disculpó por no haber comunicado el cambio proactivamente a los médicos solicitantes y ofreció enviar una carta técnica con la información completa por correo electrónico ese mismo día.",
      "La llamada terminó con el médico agradecido y con una mejor comprensión del resultado de su paciente. Pero la situación también generó una acción de mejora interna: el laboratorio estableció un procedimiento formal para comunicar a los médicos de referencia cualquier cambio de método que pudiera afectar la interpretación de los resultados, con un tiempo mínimo de anticipación de quince días. En atención técnica, no alcanza con tener razón: también es necesario anticiparse a las dudas y comunicar proactivamente para evitar que se conviertan en problemas.",
    ],
    vocab: [
      { es: "duda / consulta", pt: "dúvida / consulta" }, { es: "informe", pt: "relatório" },
      { es: "validado", pt: "validado" }, { es: "trazabilidad metrológica", pt: "rastreabilidade metrológica" },
      { es: "transmitir confianza", pt: "transmitir confiança" }, { es: "comunicación proactiva", pt: "comunicação proativa" },
    ],
    quiz: [
      { question: "¿Por qué llamó el médico al laboratorio?", options: ["Para cambiar de proveedor de análisis", "Por una diferencia aparente en el valor de creatinina entre dos meses consecutivos", "Por un error en la factura mensual", "Para solicitar un nuevo análisis urgente del paciente"], answer: "Por una diferencia aparente en el valor de creatinina entre dos meses consecutivos" },
      { question: "¿Qué hizo la analista mientras buscaba información en el sistema?", options: ["Puso al médico en espera en silencio", "Verbalizó en voz alta lo que estaba haciendo para transmitir atención y profesionalismo", "Le pidió que llamara más tarde", "Le transfirió la llamada a otro departamento"], answer: "Verbalizó en voz alta lo que estaba haciendo para transmitir atención y profesionalismo" },
      { question: "¿Cuál era la causa real de la diferencia en los valores?", options: ["Un error analítico en uno de los dos meses", "Un cambio de método con calibración trazable a un estándar diferente", "Una muestra hemolizada en el mes anterior", "Un error de identificación del paciente en el sistema"], answer: "Un cambio de método con calibración trazable a un estándar diferente" },
      { question: "¿Era clínicamente significativa la diferencia encontrada?", options: ["Sí, requería tratamiento inmediato", "No, la diferencia estaba dentro de la variación biológica normal para ese analito", "Sí, indicaba daño renal progresivo del paciente", "No se pudo determinar sin hacer más análisis"], answer: "No, la diferencia estaba dentro de la variación biológica normal para ese analito" },
      { question: "¿Qué ofreció la analista al finalizar la llamada?", options: ["Solo una disculpa verbal por el inconveniente", "Enviar una carta técnica con información completa sobre el cambio de método ese mismo día", "Repetir el análisis gratuitamente para el paciente", "Revertir al método anterior para ese médico"], answer: "Enviar una carta técnica con información completa sobre el cambio de método ese mismo día" },
      { question: "¿Cuál fue el error que el laboratorio reconoció públicamente?", options: ["Que el cambio de método no había sido validado correctamente", "Que no había comunicado proactivamente el cambio de método a los médicos solicitantes", "Que el resultado estaba incorrecto y debía repetirse", "Que el médico no había recibido el informe a tiempo"], answer: "Que no había comunicado proactivamente el cambio de método a los médicos solicitantes" },
      { question: "¿Qué procedimiento formal se implementó como mejora preventiva?", options: ["Volver a usar siempre el mismo método para evitar diferencias", "Comunicar a los médicos cualquier cambio de método con al menos 15 días de anticipación", "Solo notificar a los médicos que llamen a preguntar", "Publicar los cambios en el portal del laboratorio"], answer: "Comunicar a los médicos cualquier cambio de método con al menos 15 días de anticipación" },
      { question: "¿Qué lección central transmite este caso?", options: ["Que los médicos deben conocer mejor los métodos analíticos", "Que en atención técnica es necesario anticiparse a las dudas y comunicar proactivamente", "Que los cambios de método deben evitarse al máximo posible", "Que el teléfono siempre es mejor que el correo para comunicar cambios"], answer: "Que en atención técnica es necesario anticiparse a las dudas y comunicar proactivamente" },
    ],
    dictation: "En atención técnica, no alcanza con tener razón: también es necesario comunicar proactivamente para evitar que las dudas se conviertan en problemas.",
  },
  {
    id: "correo-tecnico", title: "Correo técnico profesional", level: "Básico", category: "Comunicación", emoji: "✉️",
    description: "Estructura y redacción de correos técnicos claros y profesionales en español.",
    readingTitle: "Un correo que generó confusión",
    reading: [
      "El área de soporte técnico del laboratorio enviaba regularmente comunicaciones por correo electrónico a sus clientes informando cambios en procedimientos, actualizaciones de métodos o situaciones operativas relevantes. Un martes, el coordinador del área recibió una respuesta inusualmente negativa de un cliente importante luego de enviar un correo informando un cambio en el horario de retiro de muestras. El cliente respondió diciendo que el correo era 'confuso e incomprensible' y que había tenido que llamar por teléfono para entender de qué se trataba.",
      "Al releer el correo enviado, el equipo notó varios problemas. Comenzaba directamente con los detalles técnicos sin ningún saludo ni contexto previo. El asunto del correo decía simplemente 'Actualización', sin indicar de qué se trataba. Las oraciones eran largas y estaban cargadas de términos técnicos sin explicación, asumiendo un nivel de conocimiento que el receptor no necesariamente tenía. No había ninguna indicación de qué debía hacer el cliente con esa información ni a quién contactar si tenía dudas. Y el correo terminaba abruptamente sin ningún cierre ni firma identificable.",
      "La estructura de un correo técnico profesional efectivo tiene elementos bien definidos que no son opcionales. El asunto debe ser específico y descriptivo, anticipando el contenido del mensaje de forma que el receptor sepa inmediatamente si es relevante para él. El saludo debe ser cordial y mencionar el nombre del destinatario cuando sea posible. El párrafo inicial debe contextualizar brevemente el motivo del correo. El cuerpo debe presentar la información de forma organizada, en oraciones cortas y lenguaje accesible. Al final, deben indicarse claramente los próximos pasos o acciones requeridas y los datos de contacto para consultas.",
      "El equipo reescribió el correo aplicando esa estructura. El nuevo asunto decía: 'Cambio en horario de retiro de muestras: a partir del lunes 15'. El correo comenzaba con un saludo personalizado, seguía con una frase de contexto ('Les comunicamos un cambio operativo que afecta el horario de retiro de muestras'), presentaba la información concreta en tres líneas claras, indicaba a quién contactar para coordinar y cerraba con una firma completa con nombre, cargo y número de teléfono directo.",
      "El cliente respondió al nuevo correo agradeciéndolo y diciendo que ahora entendía perfectamente la situación. La experiencia fue aprovechada por el área para revisar todos los templates de comunicación existentes y actualizarlos siguiendo los mismos criterios. También se organizó un taller interno de media jornada sobre redacción de comunicaciones técnicas para todo el personal del laboratorio. La forma en que se comunica la información técnica no es un detalle menor: refleja el nivel de profesionalismo del laboratorio y afecta directamente la percepción que tienen los clientes sobre la calidad del servicio.",
    ],
    vocab: [
      { es: "redacción", pt: "redação" }, { es: "asunto del correo", pt: "assunto do e-mail" },
      { es: "cierre cordial", pt: "encerramento cordial" }, { es: "próximos pasos", pt: "próximos passos" },
      { es: "destinatario", pt: "destinatário" }, { es: "firma", pt: "assinatura" },
    ],
    quiz: [
      { question: "¿Cuál fue el problema principal del primer correo enviado?", options: ["Tenía errores técnicos en la información", "Le faltaba estructura, contexto, claridad y datos de contacto", "Fue enviado al destinatario equivocado por error", "Era demasiado extenso y detallado"], answer: "Le faltaba estructura, contexto, claridad y datos de contacto" },
      { question: "¿Qué decía el asunto del correo problemático?", options: ["No tenía asunto definido", "Solo 'Actualización', sin indicar de qué se trataba", "Un asunto muy largo y confuso", "Solo una fecha sin ninguna descripción"], answer: "Solo 'Actualización', sin indicar de qué se trataba" },
      { question: "¿Cómo debe redactarse el asunto de un correo técnico efectivo?", options: ["Con solo una palabra clave identificatoria", "De forma específica y descriptiva, anticipando el contenido para el receptor", "Con la fecha y el número de referencia interno", "Con el nombre completo del remitente y su cargo"], answer: "De forma específica y descriptiva, anticipando el contenido para el receptor" },
      { question: "¿Qué elementos debe tener la estructura de un correo técnico profesional?", options: ["Solo la información técnica relevante al tema", "Asunto claro, saludo, contexto inicial, información organizada, próximos pasos y firma", "Solo saludo y despedida formal institucional", "Asunto, información técnica y fecha únicamente"], answer: "Asunto claro, saludo, contexto inicial, información organizada, próximos pasos y firma" },
      { question: "¿Cómo respondió el cliente al correo reescrito con la nueva estructura?", options: ["Negativamente, pidiendo más detalles técnicos", "Agradeciéndolo y confirmando que ahora entendía perfectamente la situación", "Sin responder al correo enviado", "Con otra queja sobre el horario de atención"], answer: "Agradeciéndolo y confirmando que ahora entendía perfectamente la situación" },
      { question: "¿Qué se revisó en el laboratorio después de esta experiencia?", options: ["Solo el correo específico que había causado el problema", "Todos los templates de comunicación existentes, actualizándolos con los nuevos criterios", "Solo los correos del área técnica de atención", "Nada, fue considerado un caso aislado"], answer: "Todos los templates de comunicación existentes, actualizándolos con los nuevos criterios" },
      { question: "¿Qué actividad de formación se organizó para el personal?", options: ["Un curso de informática básica para el equipo", "Un taller de media jornada sobre redacción de comunicaciones técnicas para todo el personal", "Una capacitación sobre el nuevo horario de atención", "Una reunión informativa de 15 minutos sobre el incidente"], answer: "Un taller de media jornada sobre redacción de comunicaciones técnicas para todo el personal" },
      { question: "¿Por qué la forma de comunicar información técnica no es un detalle menor?", options: ["Porque es obligatorio por la norma de calidad", "Porque refleja el profesionalismo del laboratorio y afecta la percepción de calidad del servicio", "Solo porque los clientes lo exigen en el contrato", "Porque mejora la velocidad de respuesta del equipo"], answer: "Porque refleja el profesionalismo del laboratorio y afecta la percepción de calidad del servicio" },
    ],
    dictation: "Un correo técnico profesional necesita un asunto claro, contexto inicial, información organizada, próximos pasos y una firma completa.",
  },
  {
    id: "reuniones", title: "Reuniones efectivas", level: "Básico", category: "Comunicación", emoji: "🗣️",
    description: "Vocabulario y estrategias para participar activamente en reuniones en español.",
    readingTitle: "La reunión que no terminaba",
    reading: [
      "El equipo del laboratorio tenía una reunión semanal de coordinación que, en teoría, duraba una hora. En la práctica, rara vez terminaba antes de las dos horas y, lo que era más preocupante, generalmente concluía sin que quedara claro qué habían decidido exactamente, quién era responsable de cada acción y para cuándo. Al día siguiente, era frecuente que dos personas tuvieran recuerdos diferentes sobre lo que se había acordado, lo que generaba conflictos innecesarios y tareas que nadie hacía porque todos creían que otro las haría.",
      "Una consultora externa que visitó el laboratorio para una auditoría observó la dinámica de una de esas reuniones y al terminar hizo una devolución directa al coordinador. Identificó tres problemas principales. Primero: no había una agenda previamente distribuida, por lo que los participantes llegaban sin saber qué temas se tratarían ni cuánto tiempo se destinaría a cada uno. Segundo: no había un moderador claro, lo que permitía que cualquier participante introdujera temas nuevos en cualquier momento, desviando la reunión de su foco original. Tercero: no existía ningún mecanismo para registrar las decisiones tomadas durante la reunión ni para hacer seguimiento de los compromisos asumidos.",
      "Con esas observaciones como punto de partida, el coordinador implementó tres cambios simples pero poderosos. Una semana antes de cada reunión, enviaba por correo la agenda con los temas a tratar, el objetivo de la reunión y el tiempo asignado a cada punto. Durante la reunión, asumía el rol de moderador activo: presentaba cada tema, facilitaba la discusión, controlaba los tiempos y cerraba cada punto con una síntesis explícita de la decisión tomada y el responsable de implementarla. Al finalizar, enviaba el acta de reunión por correo en menos de veinticuatro horas, con el listado de compromisos, responsables y fechas límite.",
      "La participación activa en reuniones también requiere habilidades lingüísticas específicas que no siempre se enseñan en la formación técnica. Pedir la palabra de forma respetuosa ('¿Puedo agregar algo?', 'Si me permiten, quisiera comentar algo al respecto'), expresar acuerdo ('Estoy de acuerdo con lo que planteó', 'Comparto esa visión'), manifestar desacuerdo de forma constructiva ('Entiendo el punto, pero me preocupa que...', 'Tengo una perspectiva diferente sobre esto'), y resumir lo discutido ('Si entendí bien, lo que acordamos es...') son competencias comunicativas que marcan la diferencia entre una reunión productiva y una donde se habla mucho pero se decide poco.",
      "A los dos meses de implementados los cambios, el equipo evaluó la nueva dinámica. Las reuniones pasaron a durar en promedio cincuenta minutos. El porcentaje de compromisos cumplidos en el plazo acordado aumentó significativamente. Y lo más importante: los participantes reportaron sentirse más involucrados y más satisfechos con los resultados de las reuniones. Una reunión efectiva no es la que termina antes: es la que logra sus objetivos, respeta el tiempo de los participantes y genera compromisos concretos que se cumplen.",
    ],
    vocab: [
      { es: "agenda / orden del día", pt: "pauta / agenda" }, { es: "moderador", pt: "moderador" },
      { es: "acta de reunión", pt: "ata de reunião" }, { es: "pedir la palabra", pt: "pedir a palavra" },
      { es: "compromiso", pt: "compromisso" }, { es: "plazo", pt: "prazo" },
    ],
    quiz: [
      { question: "¿Cuáles eran los tres problemas principales de las reuniones?", options: ["Duración, temperatura y ruido del ambiente", "Sin agenda previa, sin moderador claro y sin registro formal de decisiones", "Demasiados participantes, pocos temas y poco tiempo", "Horario inconveniente, sala pequeña y muchas interrupciones"], answer: "Sin agenda previa, sin moderador claro y sin registro formal de decisiones" },
      { question: "¿Cuándo debe enviarse la agenda de la reunión?", options: ["El mismo día de la reunión", "Una semana antes con temas, objetivo y tiempo asignado a cada punto", "Solo si los participantes la solicitan explícitamente", "Al finalizar la reunión anterior como resumen"], answer: "Una semana antes con temas, objetivo y tiempo asignado a cada punto" },
      { question: "¿Cuál es el rol del moderador activo durante la reunión?", options: ["Solo tomar nota de lo que se dice", "Presentar temas, facilitar discusión, controlar tiempos y cerrar cada punto con síntesis explícita", "Hablar la mayor parte del tiempo disponible", "Solo controlar el tiempo de cada participante"], answer: "Presentar temas, facilitar discusión, controlar tiempos y cerrar cada punto con síntesis explícita" },
      { question: "¿En cuánto tiempo debe enviarse el acta de reunión?", options: ["En la semana siguiente a la reunión", "En menos de veinticuatro horas", "Solo si alguien lo solicita por escrito", "Al final del mes en curso"], answer: "En menos de veinticuatro horas" },
      { question: "¿Cómo se expresa desacuerdo de forma constructiva en una reunión?", options: ["Interrumpiendo al orador cuando comete un error", "Con frases como 'Entiendo el punto, pero me preocupa que...'", "Saliendo de la reunión como señal de protesta", "Enviando un correo después de la reunión"], answer: "Con frases como 'Entiendo el punto, pero me preocupa que...'" },
      { question: "¿Cómo se pide la palabra de forma respetuosa en español?", options: ["Levantando la voz para ser escuchado", "Con frases como '¿Puedo agregar algo?' o 'Si me permiten, quisiera comentar algo'", "Interrumpiendo cuando hay una breve pausa", "Enviando un mensaje por el chat del grupo"], answer: "Con frases como '¿Puedo agregar algo?' o 'Si me permiten, quisiera comentar algo'" },
      { question: "¿Qué resultado cuantitativo se obtuvo después de implementar los cambios?", options: ["Las reuniones duraron igual pero fueron más intensas", "Las reuniones bajaron a 50 minutos promedio y los compromisos cumplidos aumentaron significativamente", "Las reuniones se hicieron más largas pero más productivas", "No hubo cambios significativos en los primeros dos meses"], answer: "Las reuniones bajaron a 50 minutos promedio y los compromisos cumplidos aumentaron significativamente" },
      { question: "¿Qué define una reunión verdaderamente efectiva?", options: ["Que termina antes del tiempo asignado", "Que logra sus objetivos, respeta el tiempo y genera compromisos concretos que se cumplen", "Que todos los participantes hablan por igual tiempo", "Que el moderador habla la mayor parte del tiempo"], answer: "Que logra sus objetivos, respeta el tiempo y genera compromisos concretos que se cumplen" },
    ],
    dictation: "Una reunión efectiva necesita agenda previa, un moderador activo y un acta con compromisos, responsables y fechas límite.",
  },
  {
    id: "presentaciones", title: "Presentaciones técnicas", level: "Intermedio", category: "Comunicación", emoji: "🎤",
    description: "Estructura y comunicación efectiva de datos e informes técnicos.",
    readingTitle: "Cuando los datos confunden en vez de explicar",
    reading: [
      "La directora técnica del laboratorio le encargó a una analista senior presentar los resultados del programa de mejora de la calidad del trimestre ante el comité directivo de la institución. La analista era técnicamente muy competente y conocía los datos en profundidad. Preparó con dedicación una presentación de veintidós diapositivas con gráficos detallados, tablas comparativas, series de tiempo y análisis estadísticos. Cuando terminó de presentar, esperaba preguntas sobre los hallazgos. En cambio, el presidente del comité dijo: 'Muchas gracias, pero no entendí cuál es el punto principal que querían comunicar.'",
      "La analista había cometido el error más frecuente en las presentaciones técnicas: organizar la información de la misma forma en que la había investigado, es decir, desde los datos hacia la conclusión, cuando el receptor necesita exactamente lo contrario. En una presentación técnica efectiva, se comienza con la conclusión principal, la más importante y relevante para la audiencia, y luego se presentan los datos que la soportan. Ese enfoque, conocido en comunicación estratégica como la pirámide invertida, permite que el receptor entienda el mensaje principal desde el primer minuto y luego procese los detalles con ese contexto ya instalado.",
      "Otro error frecuente es diseñar la presentación para una audiencia técnica cuando el receptor real no lo es, o viceversa. El comité directivo de una institución no necesita conocer el método estadístico utilizado para calcular el índice de sigma de un analito: necesita saber si la calidad del laboratorio es adecuada para los estándares exigidos y qué se está haciendo para mejorarla. El nivel de detalle técnico debe calibrarse siempre en función de quién va a recibir la información y para qué la va a usar.",
      "La analista rehizo la presentación aplicando una nueva estructura. La primera diapositiva presentaba la conclusión principal en una sola oración: 'La calidad analítica del laboratorio mejoró un quince por ciento en el trimestre, superando la meta establecida en todos los analitos críticos.' La segunda diapositiva mostraba los tres datos más relevantes que sustentaban esa conclusión. Las siguientes diapositivas profundizaban en los detalles para quien quisiera conocerlos. La última diapositiva presentaba las dos acciones concretas recomendadas para el próximo período.",
      "La segunda presentación duró doce minutos en lugar de los cuarenta de la primera, generó tres preguntas específicas sobre las acciones recomendadas y terminó con una decisión concreta del comité. La diferencia no estaba en la cantidad ni en la calidad de los datos: estaba en la estructura y en el enfoque comunicativo. Una buena presentación técnica no es la que contiene más información: es la que logra que la audiencia correcta tome la decisión correcta con la información necesaria.",
    ],
    vocab: [
      { es: "diapositiva", pt: "slide" }, { es: "conclusión principal", pt: "conclusão principal" },
      { es: "pirámide invertida", pt: "pirâmide invertida" }, { es: "audiencia / público", pt: "audiência / público" },
      { es: "acción recomendada", pt: "ação recomendada" }, { es: "estructura", pt: "estrutura" },
    ],
    quiz: [
      { question: "¿Cuántas diapositivas tenía la primera presentación de la analista?", options: ["Cinco diapositivas", "Diez diapositivas", "Veintidós diapositivas", "Cincuenta diapositivas"], answer: "Veintidós diapositivas" },
      { question: "¿Cuál es el error más frecuente en las presentaciones técnicas?", options: ["Usar demasiados colores llamativos", "Organizar desde los datos hacia la conclusión en lugar de empezar por la conclusión", "Hablar muy rápido durante la presentación", "Usar pocas diapositivas con poco contenido"], answer: "Organizar desde los datos hacia la conclusión en lugar de empezar por la conclusión" },
      { question: "¿Qué es la pirámide invertida en comunicación técnica?", options: ["Un tipo especial de gráfico estadístico", "El enfoque que empieza con la conclusión más importante y luego presenta los datos que la sustentan", "Una técnica de diseño de presentaciones visuales", "Un método para organizar los datos cronológicamente"], answer: "El enfoque que empieza con la conclusión más importante y luego presenta los datos que la sustentan" },
      { question: "¿Qué necesita saber realmente el comité directivo sobre la calidad del laboratorio?", options: ["El método estadístico para calcular el índice de sigma", "Si la calidad es adecuada para los estándares y qué se está haciendo para mejorarla", "Todos los detalles técnicos de cada análisis procesado", "El nombre de todos los equipos y sus fabricantes"], answer: "Si la calidad es adecuada para los estándares y qué se está haciendo para mejorarla" },
      { question: "¿Cómo comenzaba la primera diapositiva de la presentación mejorada?", options: ["Con el índice detallado de contenidos", "Con la conclusión principal en una sola oración clara y directa", "Con los antecedentes históricos del laboratorio", "Con el nombre de todos los analistas involucrados en el trimestre"], answer: "Con la conclusión principal en una sola oración clara y directa" },
      { question: "¿Cuánto duró la presentación mejorada?", options: ["Cuarenta minutos igual que la primera", "Doce minutos en total", "Exactamente cinco minutos", "Treinta minutos"], answer: "Doce minutos en total" },
      { question: "¿Qué generó la segunda presentación que la primera no generó?", options: ["Más preguntas técnicas detalladas del comité", "Tres preguntas específicas sobre acciones y una decisión concreta del comité", "Aplausos entusiastas del comité directivo", "Solicitud de más datos estadísticos para la próxima reunión"], answer: "Tres preguntas específicas sobre acciones y una decisión concreta del comité" },
      { question: "¿Qué define una buena presentación técnica según el texto?", options: ["La que contiene la mayor cantidad de información posible", "La que logra que la audiencia correcta tome la decisión correcta con la información necesaria", "La que dura menos de diez minutos siempre", "La que tiene el diseño visual más atractivo y moderno"], answer: "La que logra que la audiencia correcta tome la decisión correcta con la información necesaria" },
    ],
    dictation: "Una presentación técnica efectiva empieza con la conclusión principal y luego presenta los datos que la soportan, adaptada siempre a la audiencia.",
  },

  // ══════════════════════════════════════════
  // TECNOLOGÍA
  // ══════════════════════════════════════════
  {
    id: "helpdesk", title: "Soporte técnico (Helpdesk)", level: "Básico", category: "Tecnología", emoji: "💻",
    description: "Vocabulario y comunicación efectiva para el soporte técnico interno.",
    readingTitle: "El sistema que no abría",
    reading: [
      "Un lunes por la mañana, cuando el laboratorio estaba en plena actividad de inicio de turno, comenzaron a llegar reportes de varios analistas diciendo que el sistema de gestión no respondía. Los equipos analíticos funcionaban normalmente y las muestras seguían llegando, pero nadie podía acceder al sistema para registrar recepciones, asignar análisis ni verificar el estado de los pedidos. En cuestión de minutos, el área de TI recibió más de diez tickets simultáneos con el mismo problema.",
      "El primer paso del equipo de TI fue clasificar el incidente antes de actuar. ¿Era un problema que afectaba a todos los usuarios o solo a algunos? ¿Era un problema de acceso al sistema o el sistema en sí no estaba funcionando? ¿Había algún usuario que sí pudiera acceder? Esa clasificación inicial es fundamental porque determina dónde buscar la causa: un problema que afecta a todos los usuarios apunta hacia el servidor o la red, mientras que un problema selectivo puede indicar un conflicto en la configuración de un equipo específico o en las credenciales de usuario.",
      "Después de verificar que el problema era generalizado y que el servidor principal seguía en línea pero no respondía a las solicitudes de conexión, el técnico revisó los registros del servidor y encontró que una actualización automática de seguridad programada para las tres de la madrugada había generado un conflicto con un módulo crítico del sistema de gestión. La actualización había modificado una librería compartida que el sistema de gestión necesitaba en una versión específica. El problema fue identificado y resuelto en menos de noventa minutos.",
      "Mientras el técnico trabajaba en la resolución, otro miembro del equipo de TI se encargó de la comunicación con los usuarios. Envió un mensaje por el canal interno informando que se había identificado el problema, que estaba siendo trabajado activamente y que estimaban una resolución en aproximadamente una hora. Esa comunicación, aunque no resolvía el problema técnico, redujo significativamente la ansiedad del personal y evitó decenas de llamadas y mensajes individuales que hubieran distraído al técnico de la resolución.",
      "La experiencia generó dos mejoras inmediatas en el procedimiento del área de TI. La primera fue establecer una ventana de mantenimiento definida para las actualizaciones automáticas, con un ambiente de prueba donde validar la compatibilidad de cada actualización antes de aplicarla en producción. La segunda fue crear un protocolo de comunicación de incidentes que establecía los mensajes mínimos que debían enviarse a los usuarios en los primeros quince minutos de un incidente, a los treinta minutos y al momento de la resolución. Documentar los incidentes y aprender de ellos es lo que transforma un problema puntual en una mejora sistémica.",
    ],
    vocab: [
      { es: "ticket / incidente", pt: "chamado / incidente" }, { es: "servidor", pt: "servidor" },
      { es: "actualización", pt: "atualização" }, { es: "librería / módulo", pt: "biblioteca / módulo" },
      { es: "usuario", pt: "usuário" }, { es: "ventana de mantenimiento", pt: "janela de manutenção" },
    ],
    quiz: [
      { question: "¿Qué reportaron los analistas el lunes por la mañana?", options: ["Resultados incorrectos en los equipos", "El sistema de gestión no respondía y no podían acceder", "Los equipos analíticos no funcionaban", "Los reactivos estaban vencidos"], answer: "El sistema de gestión no respondía y no podían acceder" },
      { question: "¿Cuántos tickets recibió TI simultáneamente?", options: ["Dos o tres tickets", "Cinco tickets", "Más de diez tickets", "Solo un ticket general"], answer: "Más de diez tickets" },
      { question: "¿Cuál fue el primer paso estratégico del equipo de TI?", options: ["Reiniciar inmediatamente todos los servidores", "Clasificar el incidente para entender si era generalizado o afectaba solo a algunos", "Llamar al proveedor del sistema de gestión", "Pedir al personal que volviera más tarde"], answer: "Clasificar el incidente para entender si era generalizado o afectaba solo a algunos" },
      { question: "¿Qué causó el problema en el sistema de gestión?", options: ["Un ataque de virus o malware", "Una actualización automática de seguridad que conflictuó con el sistema", "Un usuario borró archivos críticos del sistema", "El disco duro del servidor estaba lleno"], answer: "Una actualización automática de seguridad que conflictuó con el sistema" },
      { question: "¿Por qué la comunicación proactiva durante el incidente fue valiosa?", options: ["Para cumplir con un requisito de la norma de calidad", "Redujo la ansiedad del personal y evitó llamadas que hubieran distraído al técnico", "Para demostrar que TI siempre está trabajando", "Solo para registrar el incidente en el sistema de tickets"], answer: "Redujo la ansiedad del personal y evitó llamadas que hubieran distraído al técnico" },
      { question: "¿En cuánto tiempo se resolvió el problema desde la detección?", options: ["Quince minutos exactos", "Treinta minutos", "Menos de noventa minutos", "Varias horas con múltiples intervenciones"], answer: "Menos de noventa minutos" },
      { question: "¿Qué mejora se implementó para las futuras actualizaciones del sistema?", options: ["Desactivarlas completamente para siempre", "Definir un ambiente de prueba para validar compatibilidad antes de aplicarlas en producción", "Aplicarlas solo manualmente una vez por año", "Contratar un especialista externo para cada actualización"], answer: "Definir un ambiente de prueba para validar compatibilidad antes de aplicarlas en producción" },
      { question: "¿Qué protocolo de comunicación de incidentes se creó?", options: ["Solo un correo de disculpas posterior al incidente", "Mensajes mínimos a los 15 minutos, a los 30 minutos y al momento de la resolución", "Un informe técnico detallado para la dirección solamente", "Solo comunicar cuando el problema esté completamente resuelto"], answer: "Mensajes mínimos a los 15 minutos, a los 30 minutos y al momento de la resolución" },
    ],
    dictation: "Documentar los incidentes técnicos y aprender de ellos es lo que transforma un problema puntual en una mejora sistémica del área de TI.",
  },
  {
    id: "seguridad-datos", title: "Seguridad de datos", level: "Intermedio", category: "Tecnología", emoji: "🔒",
    description: "Protección de datos, accesos, contraseñas y buenas prácticas en sistemas.",
    readingTitle: "Una contraseña compartida",
    reading: [
      "Durante una auditoría de seguridad informática realizada por un consultor externo, se descubrió algo que nadie en el laboratorio había pensado que era un problema: cuatro analistas del área de bioquímica compartían la misma contraseña de acceso al sistema de gestión. La práctica había comenzado años atrás de forma informal, cuando un analista nuevo no recordaba su contraseña y otro le prestó la suya temporalmente. Con el tiempo, varios miembros del equipo habían adoptado la misma práctica por comodidad.",
      "El auditor explicó con claridad el problema de fondo. Si todos los usuarios comparten la misma credencial de acceso, el registro de auditoría del sistema, que debería permitir rastrear quién hizo qué y cuándo, se vuelve completamente inútil. Si alguien modifica un resultado, libera una muestra antes de tiempo o accede a información confidencial, es imposible saber quién fue. Eso no solo compromete la integridad del sistema: también impide cualquier investigación en caso de incidente, y puede tener consecuencias legales para la organización si hay un reclamo de un paciente.",
      "El área de TI implementó inmediatamente varias medidas de carácter urgente. Primero, restableció contraseñas individuales únicas para cada usuario del sistema, con requisitos mínimos de complejidad: longitud de al menos ocho caracteres, combinación de letras mayúsculas y minúsculas, números y caracteres especiales. Segundo, configuró el sistema para que las contraseñas expiraran cada noventa días y forzaran el cambio al vencimiento. Tercero, activó el registro de auditoría detallado en el sistema de gestión, que hasta ese momento no estaba habilitado por defecto.",
      "Para los módulos más críticos del sistema, como la liberación de resultados y el acceso a datos históricos de pacientes, se implementó autenticación de doble factor: además de la contraseña, el usuario debía confirmar su identidad mediante un código enviado a su teléfono. Si bien esta medida generó algunas resistencias iniciales por la fricción adicional que representa, el área de TI explicó el fundamento con ejemplos concretos de incidentes de seguridad ocurridos en laboratorios de otros países, lo que ayudó a que el personal comprendiera la importancia real del cambio.",
      "La seguridad de los datos en un laboratorio clínico no es solo una cuestión tecnológica: es también una responsabilidad ética y legal. Los datos de los pacientes, sus diagnósticos y sus historiales clínicos son información sensible que debe ser protegida con el mismo rigor con el que se protegen los resultados analíticos. Una brecha de seguridad que exponga datos de pacientes puede tener consecuencias legales graves para el laboratorio, generar pérdida de confianza por parte de los clientes y dañar de forma irreparable la reputación de la institución.",
    ],
    vocab: [
      { es: "contraseña", pt: "senha" }, { es: "doble factor de autenticación", pt: "autenticação de dois fatores" },
      { es: "registro de auditoría", pt: "registro de auditoria" }, { es: "credencial", pt: "credencial" },
      { es: "brecha de seguridad", pt: "brecha de segurança" }, { es: "integridad de datos", pt: "integridade de dados" },
    ],
    quiz: [
      { question: "¿Qué práctica de riesgo descubrió la auditoría de seguridad?", options: ["El servidor no tenía contraseña de acceso", "Cuatro analistas compartían la misma contraseña de acceso al sistema", "Los datos se almacenaban sin cifrado", "El sistema no tenía copias de seguridad activas"], answer: "Cuatro analistas compartían la misma contraseña de acceso al sistema" },
      { question: "¿Por qué compartir contraseñas inutiliza el registro de auditoría?", options: ["Porque el sistema falla cuando hay muchos usuarios activos", "Porque es imposible saber quién realizó cada acción si todos usan la misma credencial", "Porque las contraseñas compartidas se vencen más rápido", "Porque viola automáticamente la norma ISO vigente"], answer: "Porque es imposible saber quién realizó cada acción si todos usan la misma credencial" },
      { question: "¿Cuáles son los requisitos mínimos de complejidad de contraseña implementados?", options: ["Solo 4 caracteres numéricos simples", "Al menos 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales", "Solo letras y números sin mayúsculas obligatorias", "Sin requisitos especiales a elección del usuario"], answer: "Al menos 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales" },
      { question: "¿Cada cuánto tiempo deben renovarse las contraseñas?", options: ["Cada año calendario", "Cada noventa días", "Cada seis meses", "Solo cuando el usuario lo decide voluntariamente"], answer: "Cada noventa días" },
      { question: "¿Qué es el doble factor de autenticación?", options: ["Tener dos contraseñas diferentes para el mismo sistema", "Confirmar la identidad con un segundo método además de la contraseña, como un código al teléfono", "Usar contraseñas de el doble de longitud normal", "Que dos personas autorizan cada acción en el sistema"], answer: "Confirmar la identidad con un segundo método además de la contraseña, como un código al teléfono" },
      { question: "¿Para qué módulos se implementó el doble factor de autenticación?", options: ["Para todos los módulos del sistema sin excepción", "Para los módulos más críticos: liberación de resultados y acceso a datos históricos de pacientes", "Solo para el módulo de facturación y contabilidad", "Para ninguno, quedó solo como propuesta pendiente"], answer: "Para los módulos más críticos: liberación de resultados y acceso a datos históricos de pacientes" },
      { question: "¿Por qué algunos analistas mostraron resistencia al doble factor?", options: ["Por razones políticas internas del área", "Porque genera fricción adicional al proceso habitual de acceso", "Porque no entendían su funcionamiento técnico", "Porque creían que su contraseña individual era suficientemente segura"], answer: "Porque genera fricción adicional al proceso habitual de acceso" },
      { question: "¿Por qué la seguridad de datos es una responsabilidad ética en el laboratorio?", options: ["Solo porque lo exige la norma de calidad vigente", "Porque los datos de los pacientes son información sensible cuya exposición tiene consecuencias legales y daña la confianza", "Solo para proteger los datos económicos del laboratorio", "Porque los organismos acreditadores lo auditan regularmente"], answer: "Porque los datos de los pacientes son información sensible cuya exposición tiene consecuencias legales y daña la confianza" },
    ],
    dictation: "La seguridad de los datos en un laboratorio es una responsabilidad ética y legal: los datos de los pacientes deben protegerse con el máximo rigor.",
  },
  {
    id: "lims", title: "Sistema LIMS", level: "Intermedio", category: "Tecnología", emoji: "🖥️",
    description: "Gestión digital del laboratorio: flujo de muestras, trazabilidad y reportes automáticos.",
    readingTitle: "El flujo digital de una muestra",
    reading: [
      "Cuando una muestra ingresa al laboratorio, en ese mismo instante comienza a dejar un rastro digital en el LIMS, el Sistema de Información del Laboratorio. El número de recepción, el nombre y el código de barras del paciente, los análisis solicitados, el analista que recibió la muestra, la fecha y hora de ingreso: todo queda registrado y vinculado de forma automática. A medida que la muestra avanza por el proceso, cada paso agrega una nueva capa de información: quién la centrifugó, en qué instrumento fue procesada, en qué corrida analítica quedó incluida y cuál fue el resultado validado.",
      "Esa cadena de información es lo que permite al laboratorio responder con precisión y rapidez cuando un cliente solicita información sobre el estado de su análisis o cuando un médico necesita verificar un resultado histórico. Sin el LIMS, esa búsqueda requeriría revisar registros en papel en varios archivos físicos, lo que podría llevar horas o días. Con el LIMS, la información está disponible en segundos, con todos sus datos asociados y con la posibilidad de generar un informe detallado de la trazabilidad completa de la muestra desde su recepción hasta la entrega del resultado.",
      "El LIMS también permite automatizar gran parte del proceso de generación de informes. Una vez que el analista valida un resultado en el sistema, el LIMS puede generar automáticamente el informe en el formato específico del cliente, aplicar los rangos de referencia correspondientes a la edad y el sexo del paciente, señalar los resultados fuera de rango con marcadores visuales, e incluso enviar el informe por correo electrónico o ponerlo a disposición en el portal del cliente, sin ninguna intervención manual adicional. Esa automatización reduce errores de transcripción y libera al personal para tareas de mayor valor analítico.",
      "La integración del LIMS con los equipos analíticos mediante interfaces bidireccionales es otro aspecto crítico de su funcionamiento. Una interfaz bidireccional significa que el LIMS puede enviar automáticamente las solicitudes de análisis al equipo (lo que elimina la carga manual de programación de muestras) y recibir automáticamente los resultados del equipo (lo que elimina la transcripción manual de los valores). Cuando esa bidireccionalidad funciona correctamente, reduce el tiempo de procesamiento y prácticamente elimina los errores de transcripción, que son una fuente importante de errores en los laboratorios que trabajan con interfaces unidireccionales o sin interfaces.",
      "La implementación de un nuevo LIMS o la actualización de uno existente es un proyecto complejo que requiere planificación cuidadosa, formación del personal, validación del sistema y un plan de contingencia para los primeros días de operación. Un LIMS mal configurado puede generar más problemas de los que resuelve. Por eso, la participación activa del equipo técnico del laboratorio en la definición de los requerimientos, la configuración de los flujos de trabajo y la validación de los resultados es tan importante como la calidad del software en sí mismo.",
    ],
    vocab: [
      { es: "LIMS", pt: "LIMS" }, { es: "interfaz bidireccional", pt: "interface bidirecional" },
      { es: "trazabilidad digital", pt: "rastreabilidade digital" }, { es: "informe automático", pt: "relatório automático" },
      { es: "validación del sistema", pt: "validação do sistema" }, { es: "transcripción manual", pt: "transcrição manual" },
    ],
    quiz: [
      { question: "¿Qué información queda registrada automáticamente en el LIMS desde el ingreso?", options: ["Solo el resultado final validado", "Número de recepción, paciente, análisis, analista, instrumento y resultado", "Solo el nombre del paciente y el análisis pedido", "Solo el resultado y la fecha de entrega del informe"], answer: "Número de recepción, paciente, análisis, analista, instrumento y resultado" },
      { question: "¿Cómo responde el LIMS ante una solicitud de revisión histórica?", options: ["Requiere buscar en archivos físicos almacenados", "Recupera toda la información de trazabilidad en segundos con todos sus datos", "Solo puede recuperar los últimos 30 días de actividad", "Necesita intervención manual del administrador del sistema"], answer: "Recupera toda la información de trazabilidad en segundos con todos sus datos" },
      { question: "¿Qué puede hacer el LIMS automáticamente después de que el analista valida un resultado?", options: ["Solo guardarlo en la base de datos local", "Generar el informe con rangos de referencia, marcadores y enviarlo al cliente sin intervención manual", "Solo imprimir el resultado en papel", "Solo notificar al médico por teléfono automáticamente"], answer: "Generar el informe con rangos de referencia, marcadores y enviarlo al cliente sin intervención manual" },
      { question: "¿Qué es una interfaz bidireccional entre el LIMS y el equipo analítico?", options: ["Una interfaz que solo recibe datos del equipo", "Una interfaz que envía solicitudes al equipo Y recibe resultados automáticamente, sin intervención manual", "Una conexión que funciona en ambos turnos del día", "Una interfaz que conecta dos laboratorios diferentes entre sí"], answer: "Una interfaz que envía solicitudes al equipo Y recibe resultados automáticamente, sin intervención manual" },
      { question: "¿Qué error elimina prácticamente la interfaz bidireccional?", options: ["Los errores de calibración del equipo", "Los errores de transcripción manual de resultados", "Los errores de identificación de pacientes en el sistema", "Los errores de control de calidad analítico"], answer: "Los errores de transcripción manual de resultados" },
      { question: "¿Qué requiere la implementación exitosa de un nuevo LIMS?", options: ["Solo comprar el software más moderno disponible", "Planificación cuidadosa, formación del personal, validación y plan de contingencia", "Solo migrar los datos del sistema anterior", "Solo capacitar al área de TI del laboratorio"], answer: "Planificación cuidadosa, formación del personal, validación y plan de contingencia" },
      { question: "¿Por qué es fundamental la participación del equipo técnico en la implementación?", options: ["Para ahorrar costos de consultoría externa", "Porque conocen los flujos de trabajo reales y pueden garantizar que el sistema se configure correctamente", "Solo para aprobar el sistema ante el organismo acreditador", "Para justificar el presupuesto del proyecto ante la dirección"], answer: "Porque conocen los flujos de trabajo reales y pueden garantizar que el sistema se configure correctamente" },
      { question: "¿Qué puede ocurrir con un LIMS mal configurado?", options: ["Funciona igual que uno bien configurado", "Puede generar más problemas de los que resuelve en la operación diaria", "Solo afecta la velocidad de procesamiento del sistema", "Solo afecta la estética visual de los informes generados"], answer: "Puede generar más problemas de los que resuelve en la operación diaria" },
    ],
    dictation: "El LIMS registra toda la cadena de información de cada muestra y permite automatizar la generación de informes, reduciendo errores de transcripción.",
  },
  {
    id: "redes", title: "Redes y conectividad", level: "Básico", category: "Tecnología", emoji: "🌐",
    description: "Infraestructura de red, conectividad y gestión de problemas en TI de laboratorio.",
    readingTitle: "Sin red no hay laboratorio",
    reading: [
      "Un miércoles por la tarde, en pleno turno de alta demanda del laboratorio, todos los equipos analíticos dejaron de comunicarse con el servidor del LIMS simultáneamente. Los instrumentos seguían funcionando y procesando muestras, pero los resultados no podían transferirse al sistema de gestión, los informes no podían generarse y el personal de recepción no podía verificar el estado de los pedidos. En cuestión de minutos, el laboratorio pasó de un flujo de trabajo completamente automatizado a una situación de caos parcial.",
      "El técnico de TI fue convocado de inmediato. Su primera acción fue verificar la conectividad en diferentes puntos de la red: ¿podía accederse al servidor desde su propia computadora? ¿Funcionaba la conexión desde una notebook conectada directamente al switch principal? ¿Desde una computadora de otra área del laboratorio? Esa metodología de diagnóstico sistemático, que consiste en ir descartando posibles causas de mayor a menor nivel de la red, permitió identificar rápidamente que el problema era específico de un switch en el rack de comunicaciones del área analítica. El switch había fallado y dejado sin conexión a todos los equipos conectados a él.",
      "El técnico no tenía un switch de repuesto disponible en el momento, lo que reveló un gap en el inventario de repuestos críticos. Mientras se coordinaba la entrega urgente de un equipo de repuesto por parte del proveedor, el laboratorio activó su plan de contingencia manual: los analistas comenzaron a registrar los resultados en planillas en papel con la fecha, hora y número de muestra correspondientes. Un analista fue asignado específicamente a transcribir esos resultados al sistema en cuanto se restableciera la conectividad.",
      "La situación se resolvió en aproximadamente dos horas y media, entre la detección del problema y el restablecimiento de la conectividad con el switch de reemplazo. Toda la información registrada manualmente fue transcripta al sistema de forma ordenada y verificada por un segundo analista. No se perdió ningún resultado, aunque el retraso en la entrega de algunos informes urgentes requirió comunicación proactiva con los médicos afectados.",
      "El incidente generó varias acciones de mejora en el área de TI. Se incorporó un switch de repuesto al inventario de componentes críticos, con un procedimiento documentado para su reemplazo rápido. Se actualizó el diagrama de red del laboratorio, que no había sido revisado desde hacía más de dos años y no reflejaba los cambios realizados en ese período. Se implementó un sistema de monitoreo de red que genera alertas automáticas cuando algún componente deja de responder, permitiendo al equipo de TI detectar problemas incipientes antes de que se conviertan en incidentes de impacto operativo.",
    ],
    vocab: [
      { es: "red", pt: "rede" }, { es: "switch", pt: "switch" },
      { es: "conectividad", pt: "conectividade" }, { es: "plan de contingencia", pt: "plano de contingência" },
      { es: "infraestructura de red", pt: "infraestrutura de rede" }, { es: "monitoreo", pt: "monitoramento" },
    ],
    quiz: [
      { question: "¿Cuál fue el impacto inmediato de perder la conectividad?", options: ["Los equipos analíticos dejaron de funcionar completamente", "Los resultados no podían transferirse al LIMS ni generarse informes, aunque los equipos funcionaban", "Solo se perdió acceso al correo electrónico interno", "Solo afectó a los equipos del área de bioquímica"], answer: "Los resultados no podían transferirse al LIMS ni generarse informes, aunque los equipos funcionaban" },
      { question: "¿Cómo diagnosticó el técnico el problema sistemáticamente?", options: ["Reiniciando todos los equipos uno por uno", "Verificando conectividad en diferentes puntos de la red para descartar causas", "Llamando inmediatamente al proveedor del LIMS", "Revisando los cables de alimentación eléctrica de los equipos"], answer: "Verificando conectividad en diferentes puntos de la red para descartar causas" },
      { question: "¿Qué componente específico había fallado?", options: ["El servidor principal de base de datos", "Un switch en el rack de comunicaciones del área analítica", "El router de conexión a internet del laboratorio", "El cable principal de fibra óptica del edificio"], answer: "Un switch en el rack de comunicaciones del área analítica" },
      { question: "¿Qué gap de gestión reveló el incidente?", options: ["Falta de personal de TI suficiente", "No había un switch de repuesto en el inventario de componentes críticos", "El proveedor del switch era poco confiable y lento", "No había documentación técnica actualizada del sistema"], answer: "No había un switch de repuesto en el inventario de componentes críticos" },
      { question: "¿Cómo se manejó la información durante la contingencia operativa?", options: ["Se detuvieron todas las operaciones hasta restaurar la red", "Los analistas registraron resultados en planillas de papel para transcribirlos después", "Se procesaron solo las muestras más urgentes de internación", "Se pidió al hospital que no enviara más muestras temporalmente"], answer: "Los analistas registraron resultados en planillas de papel para transcribirlos después" },
      { question: "¿Cuánto tiempo tardó en resolverse el incidente completo?", options: ["Quince minutos desde la detección", "Menos de una hora en total", "Aproximadamente dos horas y media", "Todo el día de trabajo"], answer: "Aproximadamente dos horas y media" },
      { question: "¿Qué se actualizó después del incidente que no había sido revisado en dos años?", options: ["El contrato con el proveedor de internet", "El diagrama de red del laboratorio", "El manual de procedimientos del LIMS", "El inventario de reactivos del área analítica"], answer: "El diagrama de red del laboratorio" },
      { question: "¿Qué herramienta se implementó para detección temprana de futuros problemas?", options: ["Una persona dedicada a monitorear visualmente la red", "Un sistema de monitoreo de red con alertas automáticas cuando un componente deja de responder", "Revisiones manuales semanales de todos los componentes de red", "Un contrato de soporte 24 horas 7 días con el proveedor"], answer: "Un sistema de monitoreo de red con alertas automáticas cuando un componente deja de responder" },
    ],
    dictation: "Un plan de contingencia documentado y un inventario de repuestos críticos son indispensables para minimizar el impacto de fallas en la red del laboratorio.",
  },
  {
    id: "backup", title: "Backup y recuperación", level: "Intermedio", category: "Tecnología", emoji: "💾",
    description: "Estrategias de respaldo, recuperación de datos y continuidad operativa.",
    readingTitle: "El día que perdimos los datos",
    reading: [
      "Un viernes por la tarde, el técnico de TI del laboratorio recibió una alerta crítica del sistema de monitoreo: el disco principal del servidor de base de datos estaba fallando. Los síntomas habían estado presentes durante días, pero habían sido interpretados como lentitud temporal del sistema. Cuando el disco finalmente dejó de funcionar completamente, el laboratorio perdió acceso a todos los datos del día: las solicitudes recibidas, los resultados ya procesados y los informes pendientes de liberación. El backup más reciente disponible tenía cuarenta y ocho horas de antigüedad.",
      "El impacto fue significativo. Los resultados procesados durante las últimas cuarenta y ocho horas tuvieron que ser recuperados de los registros de los equipos analíticos, que afortunadamente guardaban un historial local de las corridas. El proceso de reconstrucción tomó más de seis horas con tres personas trabajando en paralelo. Algunos resultados no pudieron recuperarse completamente y tuvieron que repetirse con las muestras almacenadas. Las muestras ya descartadas significaron la necesidad de una nueva extracción de los pacientes correspondientes, con los costos operativos y el impacto sobre los pacientes que eso implicó.",
      "El análisis post-incidente reveló varios problemas en la política de backup vigente. El backup se realizaba una vez por día, durante la madrugada, lo que generaba una ventana de pérdida potencial de hasta veinticuatro horas. El backup se almacenaba en un disco externo ubicado en la misma sala de servidores, lo que significaba que un incidente físico como un incendio o una inundación podría destruir simultáneamente el servidor y el backup. No existía ningún procedimiento documentado de recuperación, por lo que cuando el incidente ocurrió, el equipo tuvo que improvisar en lugar de seguir un protocolo conocido.",
      "Como resultado del incidente, el laboratorio implementó una nueva política de backup basada en el principio 3-2-1: al menos tres copias de los datos, en al menos dos tipos de soporte diferentes, con al menos una copia fuera de las instalaciones del laboratorio. En la práctica, esto significó implementar backup continuo en tiempo real en un servidor espejo interno, backup diario en un dispositivo NAS ubicado en otra área del edificio, y backup semanal en la nube mediante un servicio contratado. También se definió un objetivo de tiempo de recuperación de dos horas para los sistemas críticos.",
      "La experiencia, aunque costosa en términos de tiempo y recursos, transformó la gestión de la continuidad operativa del laboratorio. Se documentó el procedimiento de recuperación con pasos detallados para cada escenario posible. Se estableció un calendario de pruebas de recuperación, con simulacros semestrales donde el equipo practica el proceso de restauración desde cero para verificar que el procedimiento funciona realmente cuando se necesita. Un backup que nunca se ha probado es solo un backup teórico: la prueba de recuperación es lo que lo convierte en un backup real.",
    ],
    vocab: [
      { es: "backup / copia de seguridad", pt: "backup / cópia de segurança" }, { es: "recuperación de datos", pt: "recuperação de dados" },
      { es: "nube", pt: "nuvem" }, { es: "continuidad operativa", pt: "continuidade operacional" },
      { es: "política de backup", pt: "política de backup" }, { es: "tiempo de recuperación", pt: "tempo de recuperação" },
    ],
    quiz: [
      { question: "¿Qué causó la pérdida de acceso a los datos?", options: ["Un ataque de ransomware externo", "Un fallo en el disco principal del servidor de base de datos", "Un corte de energía eléctrica prolongado", "Un error de configuración del administrador del sistema"], answer: "Un fallo en el disco principal del servidor de base de datos" },
      { question: "¿Cuánto tiempo tenía de antigüedad el backup más reciente disponible?", options: ["Solo 1 hora", "12 horas", "48 horas", "1 semana completa"], answer: "48 horas" },
      { question: "¿Cuánto tiempo llevó la reconstrucción parcial de los datos perdidos?", options: ["Solo treinta minutos de trabajo", "Dos horas con una persona dedicada", "Más de seis horas con tres personas en paralelo", "Solo media jornada laboral"], answer: "Más de seis horas con tres personas en paralelo" },
      { question: "¿Cuáles eran los tres problemas de la política de backup anterior?", options: ["Solo uno: la frecuencia era insuficiente", "Frecuencia insuficiente, almacenamiento en la misma sala del servidor y sin procedimiento de recuperación", "El backup era demasiado lento en ejecutarse", "La capacidad de almacenamiento era insuficiente"], answer: "Frecuencia insuficiente, almacenamiento en la misma sala del servidor y sin procedimiento de recuperación" },
      { question: "¿Qué significa el principio 3-2-1 de backup?", options: ["3 backups por día, 2 empleados responsables, 1 proveedor externo", "3 copias de datos, en 2 tipos de soporte diferentes, con 1 copia fuera de las instalaciones", "3 servidores, 2 discos por servidor, 1 administrador de base de datos", "Backups cada 3, 2 y 1 días respectivamente"], answer: "3 copias de datos, en 2 tipos de soporte diferentes, con 1 copia fuera de las instalaciones" },
      { question: "¿Qué objetivo de tiempo de recuperación se definió para sistemas críticos?", options: ["Cuatro horas máximo", "Dos horas máximo", "Treinta minutos máximo", "Un día hábil máximo"], answer: "Dos horas máximo" },
      { question: "¿Con qué frecuencia se realizan los simulacros de recuperación después del incidente?", options: ["Una vez al año solamente", "Semestralmente", "Solo cuando ocurre un incidente real", "Mensualmente sin excepción"], answer: "Semestralmente" },
      { question: "¿Qué convierte un backup teórico en un backup real y confiable?", options: ["Comprarlo de un proveedor reconocido internacionalmente", "Probarlo regularmente con simulacros que demuestren que funciona cuando realmente se necesita", "Guardarlo en múltiples ubicaciones físicas diferentes", "Que sea gestionado por un proveedor externo especializado"], answer: "Probarlo regularmente con simulacros que demuestren que funciona cuando realmente se necesita" },
    ],
    dictation: "Un backup real se verifica con pruebas periódicas de recuperación: un backup que nunca se ha probado es solo un backup teórico.",
  },
  {
    id: "base-datos", title: "Base de datos", level: "Avanzado", category: "Tecnología", emoji: "🗄️",
    description: "Conceptos de bases de datos relacionales aplicados al contexto de laboratorio.",
    readingTitle: "Los datos bien organizados",
    reading: [
      "Una base de datos de laboratorio bien diseñada es mucho más que un lugar donde se guardan números y nombres. Es una estructura organizada que permite almacenar grandes volúmenes de información de forma eficiente, relacionar datos de diferentes fuentes de manera coherente, recuperar información específica en fracciones de segundo y garantizar que la información sea consistente, íntegra y protegida contra pérdidas o modificaciones no autorizadas. El diseño de esa estructura, aunque invisible para el usuario final, determina en gran medida la velocidad, la confiabilidad y las posibilidades de análisis del sistema.",
      "En una base de datos relacional, la información se organiza en tablas. En el laboratorio, podría haber una tabla de pacientes (con datos personales y de contacto), una tabla de solicitudes (vinculada a los pacientes, con fecha, médico solicitante y prioridad), una tabla de análisis (con los tipos de estudios disponibles y sus parámetros), una tabla de resultados (vinculada a las solicitudes y los análisis, con los valores obtenidos y las fechas de validación) y una tabla de usuarios (con los analistas y sus permisos). Las relaciones entre estas tablas son lo que permite responder preguntas complejas con rapidez.",
      "Cuando el sistema necesita recuperar el historial completo de un paciente, busca en la tabla de pacientes, encuentra todas las solicitudes vinculadas a ese paciente en la tabla de solicitudes, y para cada solicitud recupera los resultados correspondientes de la tabla de resultados. Esa operación, llamada consulta o query, puede devolver cientos de registros de forma organizada en milisegundos, algo imposible de lograr con sistemas basados en papel o en hojas de cálculo. La velocidad y la precisión de esa recuperación dependen directamente de la calidad del diseño de la base de datos.",
      "La integridad de los datos es uno de los aspectos más críticos del diseño de una base de datos. Se logra mediante reglas que el sistema aplica automáticamente: campos obligatorios que no pueden quedar vacíos, tipos de datos que definen qué clase de información puede ingresarse en cada campo (una fecha no puede contener letras, un resultado numérico no puede contener texto), restricciones de unicidad que impiden que el mismo paciente sea registrado dos veces con datos duplicados, y relaciones de integridad referencial que impiden que exista un resultado en la tabla de resultados sin una solicitud correspondiente en la tabla de solicitudes.",
      "El mantenimiento y la optimización de la base de datos son tareas que requieren atención periódica y conocimiento técnico especializado. Con el tiempo, las bases de datos crecen, las consultas pueden volverse lentas si no se crean los índices adecuados, y la acumulación de datos históricos puede afectar el rendimiento del sistema. Un plan de mantenimiento que incluya la reorganización periódica de los índices, el archivado de datos históricos y el monitoreo del rendimiento de las consultas más frecuentes es fundamental para mantener el sistema funcionando con la eficiencia que el laboratorio necesita.",
    ],
    vocab: [
      { es: "base de datos relacional", pt: "banco de dados relacional" }, { es: "tabla", pt: "tabela" },
      { es: "consulta / query", pt: "consulta / query" }, { es: "integridad referencial", pt: "integridade referencial" },
      { es: "índice", pt: "índice" }, { es: "campo obligatorio", pt: "campo obrigatório" },
    ],
    quiz: [
      { question: "¿Cómo se organiza la información en una base de datos relacional?", options: ["En archivos de texto plano separados", "En tablas con relaciones definidas entre ellas", "En hojas de cálculo independientes sin relación", "En documentos Word estructurados jerárquicamente"], answer: "En tablas con relaciones definidas entre ellas" },
      { question: "¿Qué tablas podría tener una base de datos de laboratorio?", options: ["Solo resultados y pacientes", "Pacientes, solicitudes, análisis, resultados y usuarios entre otras", "Solo resultados y facturas de los análisis", "Una sola tabla con toda la información mezclada"], answer: "Pacientes, solicitudes, análisis, resultados y usuarios entre otras" },
      { question: "¿Por qué se puede recuperar el historial de un paciente tan rápidamente?", options: ["Por un sistema de búsqueda por palabras clave", "Las relaciones entre tablas permiten cruzar información en milisegundos mediante consultas", "Por el almacenamiento de copias duplicadas de cada registro", "Por un índice alfabético de todos los pacientes"], answer: "Las relaciones entre tablas permiten cruzar información en milisegundos mediante consultas" },
      { question: "¿Qué garantiza la integridad referencial en la base de datos?", options: ["Que los datos sean correctos clínicamente", "Que no pueda existir un resultado sin una solicitud correspondiente en la tabla de solicitudes", "Que los campos sean siempre obligatorios para el usuario", "Que los usuarios no puedan modificar ningún dato"], answer: "Que no pueda existir un resultado sin una solicitud correspondiente en la tabla de solicitudes" },
      { question: "¿Qué define el tipo de dato de un campo en la base de datos?", options: ["El tamaño máximo permitido del campo", "Qué clase de información puede ingresarse: una fecha no puede tener letras ni un número texto", "El nombre del usuario que creó el campo inicialmente", "La velocidad de búsqueda sobre ese campo"], answer: "Qué clase de información puede ingresarse: una fecha no puede tener letras ni un número texto" },
      { question: "¿Para qué sirven los índices en una base de datos?", options: ["Para listar los datos en orden alfabético automáticamente", "Para acelerar la recuperación de información en las consultas más frecuentes", "Para cifrar los datos sensibles de los pacientes", "Para crear copias de seguridad automáticas del sistema"], answer: "Para acelerar la recuperación de información en las consultas más frecuentes" },
      { question: "¿Qué puede ocurrir si no se crean los índices adecuados con el tiempo?", options: ["Los datos se corrompen gradualmente", "Las consultas se vuelven lentas a medida que la base de datos crece en tamaño", "Los usuarios pierden acceso al sistema", "Los datos históricos se eliminan automáticamente por el sistema"], answer: "Las consultas se vuelven lentas a medida que la base de datos crece en tamaño" },
      { question: "¿Qué incluye un plan de mantenimiento de base de datos?", options: ["Solo hacer backups periódicos del sistema", "Reorganización de índices, archivado de datos históricos y monitoreo del rendimiento", "Solo revisar que el servidor esté encendido y funcionando", "Solo actualizar el software del gestor de base de datos"], answer: "Reorganización de índices, archivado de datos históricos y monitoreo del rendimiento" },
    ],
    dictation: "Una base de datos bien diseñada garantiza que la información sea consistente, íntegra y recuperable en milisegundos mediante consultas bien estructuradas.",
  },

  // ══════════════════════════════════════════
  // GRAMÁTICA
  // ══════════════════════════════════════════
  {
    id: "presente-indicativo", title: "Presente de indicativo", level: "Básico", category: "Gramática", emoji: "✏️",
    description: "Conjugación y uso del presente en contextos técnicos del laboratorio.",
    readingTitle: "Lo que hacemos todos los días",
    reading: [
      "El presente de indicativo es el tiempo verbal más utilizado en las comunicaciones técnicas del laboratorio. Se usa para describir acciones habituales y rutinarias que se repiten regularmente ('el analista verifica los controles cada mañana'), para expresar hechos o verdades generales que no cambian con el tiempo ('la hemoglobina transporta oxígeno en los glóbulos rojos'), para describir situaciones actuales que están ocurriendo en este momento ('el sistema está procesando las solicitudes del turno'), y para dar instrucciones o procedimientos en voz activa ('el operador coloca el tubo en el soporte y selecciona el programa correspondiente').",
      "La conjugación de los verbos regulares en presente sigue patrones predecibles según la terminación del infinitivo. Los verbos terminados en -ar forman el presente con las terminaciones -o, -as, -a, -amos, -áis, -an. Por ejemplo: analizar → analizo, analizas, analiza, analizamos, analizáis, analizan. Los verbos terminados en -er usan -o, -es, -e, -emos, -éis, -en. Por ejemplo: leer → leo, l
const ALL_ACHIEVEMENTS = [
  { id: "first-module", title: "Primer paso", emoji: "🌱", condition: (cm: number) => cm >= 1 },
  { id: "five-modules", title: "En racha", emoji: "🔥", condition: (cm: number) => cm >= 5 },
  { id: "ten-modules", title: "A mitad de camino", emoji: "⭐", condition: (cm: number) => cm >= 10 },
  { id: "twenty-modules", title: "Muy dedicado", emoji: "💪", condition: (cm: number) => cm >= 20 },
  { id: "all-modules", title: "¡Completado!", emoji: "🏆", condition: (cm: number) => cm >= MODULES.length },
  { id: "perfect-quiz", title: "Quiz perfecto", emoji: "🎯", condition: (_cm: number, score: number) => score >= 8 },
  { id: "dictation-80", title: "Buen oído", emoji: "🎙️", condition: (_cm: number, _score: number, dicts: number) => dicts >= 80 },
  { id: "streak-3", title: "3 días seguidos", emoji: "📅", condition: (_cm: number, _s: number, _d: number, streak: number) => streak >= 3 },
  { id: "streak-7", title: "¡Una semana!", emoji: "🗓️", condition: (_cm: number, _s: number, _d: number, streak: number) => streak >= 7 },
  { id: "lab-master", title: "Maestro del Lab", emoji: "🔬", condition: (_cm: number, _s: number, _d: number, _str: number, labDone: number) => labDone >= 8 },
];

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
  { id: "anapaula", name: "Ana Paula", code: "ANAPAULA" },
  { id: "lucas", name: "Lucas", code: "LUCAS" },
  { id: "katia", name: "Katia", code: "KATIA" },
  { id: "vinicius", name: "Vinicius", code: "VINICIUS" },
  { id: "thiago", name: "Thiago", code: "THIAGO" },
];

const STORAGE_KEY = "aula-controllab-v6";
const PROFESSOR_PASSWORD = "controllab2025";

// ─── Supabase sync helpers ────────────────────────────────────────────────────
async function loadProgressFromCloud(studentId: string): Promise<Record<string, ModuleProgress>> {
  try {
    const { data } = await supabase.from("progress").select("*").eq("student_id", studentId);
    if (!data) return {};
    return data.reduce((acc: Record<string, ModuleProgress>, row: any) => {
      acc[row.module_id] = { completed: row.completed ?? false, score: row.score ?? 0, total: row.total ?? 0, attempts: row.attempts ?? 1 };
      return acc;
    }, {});
  } catch { return {}; }
}

async function saveProgressToCloud(studentId: string, moduleId: string, prog: ModuleProgress) {
  try {
    await supabase.from("progress").upsert({
      student_id: studentId, module_id: moduleId,
      score: prog.score, total: prog.total, attempts: prog.attempts, completed: prog.completed,
      updated_at: new Date().toISOString()
    }, { onConflict: "student_id,module_id" });
  } catch {}
}

async function deleteProgressFromCloud(studentId: string, moduleId: string) {
  try {
    await supabase.from("progress").delete().eq("student_id", studentId).eq("module_id", moduleId);
  } catch {}
}

async function loadDictationsFromCloud(studentId: string): Promise<Record<string, DictationResult>> {
  try {
    const { data } = await supabase.from("dictations").select("*").eq("student_id", studentId);
    if (!data) return {};
    return data.reduce((acc: Record<string, DictationResult>, row: any) => {
      acc[row.module_id] = { exact: row.exact, score: row.score, written: row.written, expected: row.expected, updatedAt: row.updated_at };
      return acc;
    }, {});
  } catch { return {}; }
}

async function loadStreakFromCloud(studentId: string): Promise<{ count: number; lastDate: string } | null> {
  try {
    const { data } = await supabase.from("streaks").select("*").eq("student_id", studentId).single();
    if (!data) return null;
    return { count: data.count, lastDate: data.last_date };
  } catch { return null; }
}

async function saveStreakToCloud(studentId: string, count: number, lastDate: string) {
  try {
    await supabase.from("streaks").upsert({ student_id: studentId, count, last_date: lastDate }, { onConflict: "student_id" });
  } catch {}
}

async function loadAchievementsFromCloud(studentId: string): Promise<Achievement[]> {
  try {
    const { data } = await supabase.from("achievements").select("*").eq("student_id", studentId);
    if (!data) return [];
    return data.map((row: any) => ({ id: row.achievement_id, title: row.title, emoji: row.emoji, unlockedAt: row.unlocked_at }));
  } catch { return []; }
}

async function saveAchievementToCloud(studentId: string, achievement: Achievement) {
  try {
    await supabase.from("achievements").upsert({
      student_id: studentId, achievement_id: achievement.id,
      title: achievement.title, emoji: achievement.emoji, unlocked_at: achievement.unlockedAt
    }, { onConflict: "student_id,achievement_id" });
  } catch {}
}

async function loadWeeklyActivityFromCloud(studentId: string): Promise<Record<string, number>> {
  try {
    const { data } = await supabase.from("weekly_activity").select("*").eq("student_id", studentId);
    if (!data) return {};
    return data.reduce((acc: Record<string, number>, row: any) => { acc[row.activity_date] = row.count; return acc; }, {});
  } catch { return {}; }
}
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática"];
const LEVEL_COLOR: Record<string, string> = {
  "Básico": "bg-emerald-900 text-emerald-300",
  "Intermedio": "bg-amber-900 text-amber-300",
  "Avanzado": "bg-rose-900 text-rose-300",
};
const QUIZ_TIME = 30;

// ─── Seed helpers ────────────────────────────────────────────────────────────
function strSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}
function shuffleOpts(options: string[], seed: number): string[] {
  const arr = [...options];
  let s = (seed >>> 0) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// ─────────────────────────────────────────────────────────────────────────────

function createInitialState(): AppState {
  return { students: defaultStudents, currentStudentId: null, progress: {}, dictations: {}, achievements: {}, streaks: {}, weeklyActivity: {} };
}
function normalize(v: string): string {
  return v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *{font-family:'Sora',sans-serif;box-sizing:border-box;}
  .mono{font-family:'JetBrains Mono',monospace;}
  .glass{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);backdrop-filter:blur(24px);}
  .glass-dark{background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(24px);}
  .glass-accent{background:rgba(99,202,183,0.08);border:1px solid rgba(99,202,183,0.25);backdrop-filter:blur(24px);}
  .accent{color:#63CAB7;}.accent-bg{background:#63CAB7;}
  .accent2{color:#a78bfa;}.accent2-bg{background:#a78bfa;}
  .btn-accent{background:linear-gradient(135deg,#63CAB7,#3d9e8a);color:#0a1a16;font-weight:700;border-radius:14px;transition:all .2s;cursor:pointer;letter-spacing:.01em;}
  .btn-accent:hover{opacity:.92;transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,202,183,.25);}
  .btn-accent:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}
  .btn-purple{background:linear-gradient(135deg,#a78bfa,#7c3aed);color:#fff;font-weight:700;border-radius:14px;transition:all .2s;cursor:pointer;}
  .btn-purple:hover{opacity:.92;transform:translateY(-2px);box-shadow:0 8px 24px rgba(167,139,250,.25);}
  .btn-purple:disabled{opacity:.35;cursor:not-allowed;transform:none;}
  input,textarea{outline:none;transition:all .2s;}
  input:focus,textarea:focus{border-color:#63CAB7!important;box-shadow:0 0 0 3px rgba(99,202,183,.18);}
  .module-card{transition:all .22s cubic-bezier(.4,0,.2,1);cursor:pointer;}
  .module-card:hover{border-color:rgba(99,202,183,.5)!important;transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.3);}
  .module-card.active{background:linear-gradient(135deg,rgba(99,202,183,.18),rgba(74,171,151,.08));border-color:#63CAB7!important;box-shadow:0 0 0 1px #63CAB7,0 8px 24px rgba(99,202,183,.12);}
  .module-card.needs-review{border-color:rgba(251,191,36,.4)!important;}
  .progress-bar{height:5px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;}
  .progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#63CAB7,#3d9e8a);transition:width .7s cubic-bezier(.4,0,.2,1);}
  .progress-fill-purple{height:100%;border-radius:99px;background:linear-gradient(90deg,#a78bfa,#7c3aed);transition:width .7s cubic-bezier(.4,0,.2,1);}
  .tab{transition:all .2s;cursor:pointer;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:600;}
  .tab.active{background:#63CAB7;color:#0a1a16;}
  .tab.active-purple{background:#a78bfa;color:#0a0512;}
  .tab:not(.active):not(.active-purple){color:#94a3b8;}
  .tab:not(.active):not(.active-purple):hover{color:#fff;background:rgba(255,255,255,.09);}
  .opt{transition:all .18s;border:1.5px solid rgba(255,255,255,.1);border-radius:14px;padding:13px 18px;text-align:left;width:100%;background:rgba(255,255,255,.04);color:#e2e8f0;cursor:pointer;font-size:14px;line-height:1.5;}
  .opt:hover:not(:disabled){border-color:rgba(99,202,183,.5);background:rgba(99,202,183,.07);}
  .opt.sel{border-color:#63CAB7;background:rgba(99,202,183,.1);}
  .opt.ok{border-color:#63CAB7;background:rgba(99,202,183,.18);color:#a7f3e4;font-weight:600;}
  .opt.bad{border-color:#f87171;background:rgba(248,113,113,.12);color:#fca5a5;}
  .fc{perspective:1000px;cursor:pointer;}
  .fc-inner{position:relative;width:100%;height:190px;transition:transform .65s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d;}
  .fc-inner.flip{transform:rotateY(180deg);}
  .fc-face{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;padding:24px;text-align:center;}
  .fc-front{background:linear-gradient(135deg,rgba(99,202,183,.12),rgba(99,202,183,.06));border:1.5px solid rgba(99,202,183,.4);color:#63CAB7;}
  .fc-back{background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.04));border:1.5px solid rgba(255,255,255,.2);color:#fff;transform:rotateY(180deg);}
  .cert{background:linear-gradient(135deg,#060f0c,#0f1f18);border:2px solid #63CAB7;border-radius:28px;padding:48px;box-shadow:0 0 80px rgba(99,202,183,.2);}
  .exam-bg{background:linear-gradient(135deg,#0a0512,#0f0a1a);}
  .badge{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:4px 10px;font-size:11px;font-weight:700;}
  .badge-green{background:rgba(99,202,183,.15);color:#63CAB7;border:1px solid rgba(99,202,183,.3);}
  .badge-yellow{background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3);}
  .badge-red{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);}
  .badge-purple{background:rgba(167,139,250,.15);color:#a78bfa;border:1px solid rgba(167,139,250,.3);}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
  .ani{animation:fadeIn .35s cubic-bezier(.4,0,.2,1);}
  .pop{animation:pop .3s cubic-bezier(.4,0,.2,1);}
  .m1{color:#FFD700;}.m2{color:#C0C0C0;}.m3{color:#CD7F32;}
  ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:99px;}
  .reading-text{font-size:15px;line-height:1.85;color:#cbd5e1;}
  .hover-lift{transition:all .2s;} .hover-lift:hover{transform:translateY(-2px);}
  .glow-teal{box-shadow:0 0 30px rgba(99,202,183,.15);}
  .glow-purple{box-shadow:0 0 30px rgba(167,139,250,.15);}
`;

export default function Home() {
  const [appState, setAppState] = useState<AppState>(createInitialState);
  const [loginName, setLoginName] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(MODULES[0].id);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [qIdx, setQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentCode, setNewStudentCode] = useState("");
  const [dictText, setDictText] = useState("");
  const [dictResult, setDictResult] = useState<DictationResult | null>(null);
  const [teacherTab, setTeacherTab] = useState<"ranking" | "progress" | "dictations" | "students">("ranking");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [section, setSection] = useState<"reading" | "quiz" | "dictation" | "vocab" | "flashcards">("reading");
  const [fcIdx, setFcIdx] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [timerOn, setTimerOn] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const [transInput, setTransInput] = useState("");
  const [transResult, setTransResult] = useState("");
  const [transDir, setTransDir] = useState<"es-pt" | "pt-es">("es-pt");
  const [transLoading, setTransLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [weekTab, setWeekTab] = useState<"weekly" | "achievements">("weekly");
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [newPassConfirm, setNewPassConfirm] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [examMode, setExamMode] = useState(false);
  const [examModuleIdx, setExamModuleIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, Record<number, string>>>({});
  const [examFinished, setExamFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setAppState({ ...createInitialState(), ...JSON.parse(s) }); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); } catch {}
  }, [appState]);

  // Load from cloud when student logs in
  useEffect(() => {
    if (!appState.currentStudentId) return;
    const studentId = appState.currentStudentId;
    setCloudLoading(true);
    Promise.all([
      loadProgressFromCloud(studentId),
      loadDictationsFromCloud(studentId),
      loadStreakFromCloud(studentId),
      loadAchievementsFromCloud(studentId),
      loadWeeklyActivityFromCloud(studentId),
    ]).then(([progress, dictations, streak, achievements, weeklyAct]) => {
      setAppState(prev => ({
        ...prev,
        progress: { ...prev.progress, [studentId]: { ...(prev.progress[studentId] || {}), ...progress } },
        dictations: { ...prev.dictations, [studentId]: { ...(prev.dictations[studentId] || {}), ...dictations } },
        streaks: streak ? { ...prev.streaks, [studentId]: streak } : prev.streaks,
        achievements: { ...prev.achievements, [studentId]: achievements.length > 0 ? achievements : (prev.achievements[studentId] || []) },
        weeklyActivity: { ...prev.weeklyActivity, [studentId]: { ...(prev.weeklyActivity[studentId] || {}), ...weeklyAct } },
      }));
      setCloudLoading(false);
    }).catch(() => setCloudLoading(false));
  }, [appState.currentStudentId]);

  useEffect(() => {
    if (!timerOn) return;
    if (timeLeft <= 0) { setSubmitted(true); setTimerOn(false); return; }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timerOn, timeLeft]);

  const student = appState.students.find(s => s.id === appState.currentStudentId) ?? null;
  const mod = MODULES.find(m => m.id === selectedModuleId) ?? MODULES[0];
  const sp = student ? appState.progress[student.id] || {} : {};
  const sd = student ? appState.dictations[student.id] || {} : {};
  const mp: ModuleProgress = sp[selectedModuleId] || { completed: false, score: 0, total: mod.quiz.length, attempts: 0 };
  const q = mod.quiz[qIdx];

  // ─── Shuffle options for current question (stable per module+question) ─────
  const shuffledOpts = shuffleOpts(q.options, strSeed(mod.id + String(qIdx)));
  // ─────────────────────────────────────────────────────────────────────────────

  const isOk = submitted && selectedOption === q.answer;
  const curDict = sd[selectedModuleId] || null;
  const filtered = activeCategory === "Todos" ? MODULES : MODULES.filter(m => m.category === activeCategory);
  const totalQ = useMemo(() => MODULES.reduce((s, m) => s + m.quiz.length, 0), []);
  const completedMods = Object.keys(sp).length;
  const totalScore = MODULES.reduce((s, m) => s + (sp[m.id]?.score || 0), 0);
  const pct = Math.round((completedMods / MODULES.length) * 100);
  const allDone = completedMods === MODULES.length;

  useEffect(() => {
    setQIdx(0); setSelectedOption(""); setSubmitted(false); setDictText(""); setDictResult(null);
    setAnswers({}); setSection("reading"); setFcIdx(0); setFcFlipped(false); setTimeLeft(QUIZ_TIME); setTimerOn(false);
  }, [selectedModuleId, appState.currentStudentId]);

  const ranking = appState.students.map(s => {
    const p = appState.progress[s.id] || {};
    const d = appState.dictations[s.id] || {};
    const cm = Object.keys(p).length;
    const bs = MODULES.reduce((x, m) => x + (p[m.id]?.score || 0), 0);
    const ds = MODULES.map(m => d[m.id]?.score).filter((v): v is number => typeof v === "number");
    const da = ds.length ? Math.round(ds.reduce((a, b) => a + b, 0) / ds.length) : 0;
    return { ...s, cm, bs, da, pts: bs * 10 + da };
  }).sort((a, b) => b.pts - a.pts);

  const reviewModules = MODULES.filter(m => { const p = sp[m.id]; if (!p) return true; return p.score < p.total; });
  const examModules = MODULES;
  const examTotalQ = examModules.reduce((s, m) => s + m.quiz.length, 0);

  const startExam = () => {
    setExamAnswers({}); setExamModuleIdx(0); setExamFinished(false);
    setQIdx(0); setSelectedOption(""); setSubmitted(false); setAnswers({});
    setTimeLeft(QUIZ_TIME); setTimerOn(true); setExamMode(true);
  };

  const finishExam = () => { setExamFinished(true); setTimerOn(false); };

  const examScore = examFinished ? (() => {
    let correct = 0;
    examModules.forEach(m => { const a = examAnswers[m.id] || {}; m.quiz.forEach((q, i) => { if (a[i] === q.answer) correct++; }); });
    return correct;
  })() : 0;

  const openPanel = () => {
    if (showPanel) { setShowPanel(false); return; }
    const pwd = prompt("🔐 Contraseña del profesor:");
    if (pwd === PROFESSOR_PASSWORD) setShowPanel(true);
    else if (pwd !== null) alert("Contraseña incorrecta.");
  };

  const login = () => {
    const found = appState.students.find(s => {
      const nameMatch = normalize(s.name) === normalize(loginName);
      const validPass = s.password ? normalize(s.password) === normalize(loginCode) : normalize(s.code) === normalize(loginCode);
      return nameMatch && validPass;
    });
    if (!found) { setLoginError("Nombre o código incorrecto."); return; }
    setAppState(p => ({ ...p, currentStudentId: found.id }));
    setLoginError(""); setLoginName(""); setLoginCode(""); setShowWelcome(true);
  };
  const logout = () => { setAppState(p => ({ ...p, currentStudentId: null })); setShowPanel(false); setShowChangePass(false); };

  const changePassword = () => {
    if (!student) return;
    if (newPass.trim().length < 4) { setPassMsg("La contraseña debe tener al menos 4 caracteres."); return; }
    if (newPass !== newPassConfirm) { setPassMsg("Las contraseñas no coinciden."); return; }
    setAppState(p => ({ ...p, students: p.students.map(s => s.id === student.id ? { ...s, password: newPass.trim(), passwordChanged: true } : s) }));
    setPassMsg("✓ Contraseña actualizada.");
    setNewPass(""); setNewPassConfirm("");
    setTimeout(() => { setShowChangePass(false); setPassMsg(""); }, 1500);
  };

  const resetStudentPassword = (studentId: string) => {
    setAppState(p => ({ ...p, students: p.students.map(s => s.id === studentId ? { ...s, password: undefined, passwordChanged: false } : s) }));
  };

  const saveProg = (score: number, total: number) => {
    if (!student) return;
    setAppState(p => {
      const ps = p.progress[student.id] || {};
      const pm = ps[selectedModuleId] || { completed: false, score: 0, total, attempts: 0 };
      const newProg = { completed: true, score: Math.max(pm.score, score), total, attempts: pm.attempts + 1 };
      // Sync to cloud
      saveProgressToCloud(student.id, selectedModuleId, newProg);
      return { ...p, progress: { ...p.progress, [student.id]: { ...ps, [selectedModuleId]: newProg } } };
    });
  };

  const resetModuleProgress = (studentId: string, moduleId: string) => {
    setAppState(p => {
      const ps = { ...(p.progress[studentId] || {}) };
      delete ps[moduleId];
      deleteProgressFromCloud(studentId, moduleId);
      return { ...p, progress: { ...p.progress, [studentId]: ps } };
    });
  };

  const checkAchievements = (studentId: string) => {
    const p = appState.progress[studentId] || {};
    const d = appState.dictations[studentId] || {};
    const cm = Object.keys(p).length;
    const bestScore = Math.max(...Object.values(p).map((mp: ModuleProgress) => mp.score), 0);
    const dictScores = Object.values(d).map((dr: DictationResult) => dr.score);
    const bestDict = dictScores.length ? Math.max(...dictScores) : 0;
    const streak = appState.streaks[studentId]?.count || 0;
    const labDone = MODULES.filter(m => m.category === "Laboratorio" && p[m.id]).length;
    const existing = (appState.achievements[studentId] || []).map((a: Achievement) => a.id);
    const unlocked = ALL_ACHIEVEMENTS.filter(a => !existing.includes(a.id) && a.condition(cm, bestScore, bestDict, streak, labDone));
    if (unlocked.length > 0) {
      const now = new Date().toLocaleString();
      const newOnes = unlocked.map(a => ({ id: a.id, title: a.title, emoji: a.emoji, unlockedAt: now }));
      setNewAchievements(newOnes);
      setAppState(prev => ({ ...prev, achievements: { ...prev.achievements, [studentId]: [...(prev.achievements[studentId] || []), ...newOnes] } }));
      newOnes.forEach(a => saveAchievementToCloud(studentId, a));
      setTimeout(() => setNewAchievements([]), 4000);
    }
  };

  const updateStreak = (studentId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const streak = appState.streaks[studentId];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newCount = 1;
    if (streak?.lastDate === today) return;
    if (streak?.lastDate === yesterday) newCount = (streak.count || 0) + 1;
    saveStreakToCloud(studentId, newCount, today);
    setAppState(prev => ({
      ...prev,
      streaks: { ...prev.streaks, [studentId]: { count: newCount, lastDate: today } },
      weeklyActivity: { ...prev.weeklyActivity, [studentId]: { ...(prev.weeklyActivity[studentId] || {}), [today]: (prev.weeklyActivity[studentId]?.[today] || 0) + 1 } }
    }));
  };


  const handleSubmit = () => { if (!selectedOption) return; setSubmitted(true); setTimerOn(false); };
  const handleNext = () => {
    if (qIdx < mod.quiz.length - 1) {
      setQIdx(i => i + 1); setSelectedOption(answers[qIdx + 1] || ""); setSubmitted(false); setTimeLeft(QUIZ_TIME); setTimerOn(true); return;
    }
    const correct = mod.quiz.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
    saveProg(correct, mod.quiz.length);
    if (student) { updateStreak(student.id); setTimeout(() => checkAchievements(student.id), 300); }
    setQIdx(0); setSelectedOption(""); setSubmitted(false); setAnswers({}); setTimerOn(false); setSection("reading");
  };
  const setAns = (v: string) => { setSelectedOption(v); setAnswers(p => ({ ...p, [qIdx]: v })); };
  const startQuiz = () => { setSection("quiz"); setTimeLeft(QUIZ_TIME); setTimerOn(true); };
  const addStudent = () => {
    if (!newStudentName.trim() || !newStudentCode.trim()) return;
    const id = `${normalize(newStudentName)}-${Date.now()}`;
    setAppState(p => ({ ...p, students: [...p.students, { id, name: newStudentName.trim(), code: newStudentCode.trim().toUpperCase() }] }));
    setNewStudentName(""); setNewStudentCode("");
  };
  const removeStudent = (id: string) => {
    setAppState(p => {
      const students = p.students.filter(s => s.id !== id);
      const np = { ...p.progress }; const nd = { ...p.dictations }; delete np[id]; delete nd[id];
      return { ...p, students, progress: np, dictations: nd };
    });
  };
  const speak = (text: string, rate: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "es-ES"; u.rate = rate; window.speechSynthesis.speak(u);
  };
  const checkDict = () => {
    if (!student) return;
    const exp = normalize(mod.dictation); const writ = normalize(dictText);
    const ew = exp.split(" ").filter(Boolean); const ww = writ.split(" ").filter(Boolean);
    const matches = ww.filter((w, i) => w === ew[i]).length;
    const score = ew.length ? Math.round((matches / ew.length) * 100) : 0;
    const r: DictationResult = { exact: exp === writ, score, written: dictText, expected: mod.dictation, updatedAt: new Date().toLocaleString() };
    setDictResult(r);
    setAppState(p => ({ ...p, dictations: { ...p.dictations, [student.id]: { ...(p.dictations[student.id] || {}), [selectedModuleId]: r } } }));
  };
  const translate = async () => {
    if (!transInput.trim()) return;
    setTransLoading(true); setTransResult("");
    const from = transDir === "es-pt" ? "es" : "pt";
    const to = transDir === "es-pt" ? "pt" : "es";
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(transInput)}`;
      const res = await fetch(url);
      const data = await res.json();
      setTransResult(data[0].map((item: [string]) => item[0]).join("") || "No se pudo traducir.");
    } catch { setTransResult("Error de conexión."); }
    setTransLoading(false);
  };
  const openGoogleTranslate = () => {
    const from = transDir === "es-pt" ? "es" : "pt";
    const to = transDir === "es-pt" ? "pt" : "es";
    window.open(`https://translate.google.com/?sl=${from}&tl=${to}&text=${encodeURIComponent(transInput)}&op=translate`, "_blank");
  };

  const loginRanking = appState.students.map(s => {
    const p = appState.progress[s.id] || {};
    const pts = MODULES.reduce((x, m) => x + (p[m.id]?.score || 0), 0) * 10;
    const cm = Object.keys(p).length;
    return { ...s, pts, cm };
  }).sort((a, b) => b.pts - a.pts).slice(0, 5);

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  if (!student) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 overflow-x-hidden">
      <style>{STYLES}</style>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10 ani">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">Aula<br /><span className="accent">Controllab</span></h1>
          <p className="mt-5 text-slate-300 text-lg max-w-xl mx-auto leading-7"><span className="accent font-semibold">{MODULES.length} módulos</span> · laboratorio · gestión · TI · comunicación · gramática</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">🏆 RANKING</div>
              {loginRanking.filter(r => r.pts > 0).length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">¡Nadie ha completado módulos todavía! Sé el primero.</div>
              ) : (
                <div className="space-y-2">{loginRanking.map((r, i) => (
                  <div key={r.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${i === 0 ? "bg-yellow-500/10 border border-yellow-500/20" : "glass"}`}>
                    <span className={`text-lg w-7 ${i === 0 ? "m1" : i === 1 ? "m2" : i === 2 ? "m3" : "text-slate-500"}`}>{i < 3 ? ["🥇","🥈","🥉"][i] : `${i+1}.`}</span>
                    <span className="flex-1 font-semibold text-sm">{r.name}</span>
                    <span className="text-xs text-slate-400">{r.cm} mód.</span>
                    <span className="mono text-sm font-black accent">{r.pts} pts</span>
                  </div>
                ))}</div>
              )}
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">👥 ALUMNOS</div>
              <div className="flex flex-wrap gap-2">{defaultStudents.map(s => <span key={s.id} className="glass text-slate-200 text-xs px-3 py-1.5 rounded-full font-medium">{s.name}</span>)}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-3xl p-7" style={{ borderColor: "rgba(99,202,183,0.15)" }}>
              <h2 className="text-2xl font-bold text-white mb-1">Entrar como alumno</h2>
              <p className="text-slate-400 text-sm mb-6">Usá tu nombre y el código que te dio el profe.</p>
              <div className="space-y-4">
                <input value={loginName} onChange={e => setLoginName(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Nombre — Ej: Marília" className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3.5" />
                <input value={loginCode} onChange={e => setLoginCode(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Código — Ej: MARILIA" className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3.5 mono" />
                {loginError && <p className="text-rose-400 text-sm">{loginError}</p>}
                <button onClick={login} className="btn-accent w-full px-5 py-4 text-sm">Ingresar →</button>
              </div>
              <div className="mt-5 glass rounded-2xl p-4">
                <button onClick={openPanel} className="w-full text-left text-sm text-slate-300 hover:text-white transition flex justify-between items-center">
                  <span>🔐 Panel del profesor</span><span className="text-slate-500">{showPanel ? "▲" : "▼"}</span>
                </button>
                {showPanel && <div className="mt-4 space-y-3">
                  <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Nombre" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                  <input value={newStudentCode} onChange={e => setNewStudentCode(e.target.value)} placeholder="Código" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm mono" />
                  <button onClick={addStudent} className="btn-accent w-full px-4 py-2.5 text-sm">+ Agregar alumno</button>
                </div>}
              </div>
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-white">🌐 Traductor ES ↔ PT</div>
                <button onClick={() => setTransDir(d => d === "es-pt" ? "pt-es" : "es-pt")} className="glass rounded-xl px-3 py-2 text-xs font-bold accent">{transDir === "es-pt" ? "ES→PT" : "PT→ES"} ⇄</button>
              </div>
              <textarea value={transInput} onChange={e => setTransInput(e.target.value)} rows={3} placeholder={transDir === "es-pt" ? "Escribí en español..." : "Escreva em português..."} className="w-full rounded-2xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3 text-sm resize-none" />
              <button onClick={translate} disabled={transLoading || !transInput.trim()} className="btn-accent w-full mt-3 py-3 text-sm">{transLoading ? "Traduciendo..." : "Traducir"}</button>
              {transResult && <div className="mt-3 glass-dark rounded-2xl p-4 ani"><p className="text-slate-100 text-sm">{transResult}</p></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── EXAM MODE ────────────────────────────────────────────────────────────────
  if (examMode && !examFinished) {
    const emod = examModules[examModuleIdx];
    const eQ = emod.quiz[qIdx];
    const isEOk = submitted && selectedOption === eQ.answer;
    // Shuffle exam options too
    const shuffledExamOpts = shuffleOpts(eQ.options, strSeed(emod.id + String(qIdx)));

    const handleExamNext = () => {
      const newAnswers = { ...examAnswers, [emod.id]: { ...(examAnswers[emod.id] || {}), [qIdx]: selectedOption } };
      setExamAnswers(newAnswers);
      if (qIdx < emod.quiz.length - 1) {
        setQIdx(i => i + 1); setSelectedOption(""); setSubmitted(false); setTimeLeft(QUIZ_TIME); setTimerOn(true);
      } else if (examModuleIdx < examModules.length - 1) {
        setExamModuleIdx(i => i + 1); setQIdx(0); setSelectedOption(""); setSubmitted(false); setTimeLeft(QUIZ_TIME); setTimerOn(true);
      } else { finishExam(); }
    };
    const handleExamSubmit = () => {
      if (!selectedOption) return;
      setExamAnswers(prev => ({ ...prev, [emod.id]: { ...(prev[emod.id] || {}), [qIdx]: selectedOption } }));
      setSubmitted(true); setTimerOn(false);
    };

    return (
      <div className="min-h-screen exam-bg text-white px-4 py-6">
        <style>{STYLES}</style>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="badge badge-purple mb-2">⚡ MODO EXAMEN</div>
              <div className="text-sm text-slate-400">Módulo {examModuleIdx+1}/{examModules.length} · Pregunta {qIdx+1}/{emod.quiz.length}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke={timeLeft <= 10 ? "#f87171" : "#a78bfa"} strokeWidth="4"
                    strokeDasharray={`${2*Math.PI*24}`} strokeDashoffset={`${2*Math.PI*24*(1-timeLeft/QUIZ_TIME)}`}
                    style={{transition:"stroke-dashoffset 0.5s linear"}} strokeLinecap="round" />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center mono text-sm font-black ${timeLeft<=10?"text-rose-400":"text-purple-300"}`}>{timeLeft}</div>
              </div>
              <button onClick={() => { setExamMode(false); setTimerOn(false); }} className="glass rounded-xl px-4 py-2 text-xs text-slate-300 hover:text-white transition">✕ Salir</button>
            </div>
          </div>
          <div className="glass rounded-2xl px-5 py-3 mb-5 flex items-center gap-3">
            <span className="text-2xl">{emod.emoji}</span>
            <div><div className="font-bold">{emod.title}</div><div className="text-xs text-slate-400">{emod.category}</div></div>
          </div>
          <div className="glass rounded-3xl p-6 ani">
            <p className="text-lg font-semibold mb-5 leading-7">{eQ.question}</p>
            <div className="space-y-3">
              {shuffledExamOpts.map(opt => {
                const sel = selectedOption === opt;
                const ok = submitted && opt === eQ.answer;
                const bad = submitted && sel && opt !== eQ.answer;
                return <button key={opt} onClick={() => !submitted && setSelectedOption(opt)} disabled={submitted}
                  className={`opt ${ok?"ok":bad?"bad":sel?"sel":""}`}>{opt}</button>;
              })}
            </div>
            <div className="mt-5 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm">{submitted ? (isEOk ? <span className="text-emerald-400 font-semibold">✓ ¡Correcto!</span> : <span className="text-rose-400">✗ Correcto: <strong className="text-white">{eQ.answer}</strong></span>) : <span className="text-slate-500">Sin ayudas — modo examen.</span>}</div>
              {!submitted ? <button onClick={handleExamSubmit} disabled={!selectedOption} className="btn-purple px-6 py-3 text-sm">Responder</button>
                : <button onClick={handleExamNext} className="btn-purple px-6 py-3 text-sm">{examModuleIdx < examModules.length-1 || qIdx < emod.quiz.length-1 ? "Siguiente →" : "Finalizar ✓"}</button>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examMode && examFinished) {
    return (
      <div className="min-h-screen exam-bg flex items-center justify-center px-4 py-10">
        <style>{STYLES}</style>
        <div className="cert glow-purple max-w-2xl w-full text-center pop" style={{ borderColor: "#a78bfa" }}>
          <div className="text-6xl mb-4">{examScore/examTotalQ>=0.9?"🏆":examScore/examTotalQ>=0.7?"🎯":"📚"}</div>
          <div className="badge badge-purple mb-4">⚡ RESULTADO DEL EXAMEN</div>
          <h1 className="text-3xl font-bold text-white mt-2">{examScore/examTotalQ>=0.9?"¡Excelente!":examScore/examTotalQ>=0.7?"¡Muy bien!":"Seguí practicando"}</h1>
          <h2 className="text-xl font-bold mt-2" style={{color:"#a78bfa"}}>{student.name}</h2>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4"><div className="text-3xl font-black mono" style={{color:"#a78bfa"}}>{examScore}</div><div className="text-xs text-slate-400 mt-1">Correctas</div></div>
            <div className="glass rounded-2xl p-4"><div className="text-3xl font-black mono text-white">{examTotalQ}</div><div className="text-xs text-slate-400 mt-1">Total</div></div>
            <div className="glass rounded-2xl p-4"><div className="text-3xl font-black mono" style={{color:examScore/examTotalQ>=0.7?"#63CAB7":"#f87171"}}>{Math.round((examScore/examTotalQ)*100)}%</div><div className="text-xs text-slate-400 mt-1">Puntaje</div></div>
          </div>
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            <button onClick={startExam} className="btn-purple px-6 py-3 text-sm">🔄 Repetir</button>
            <button onClick={() => { setExamMode(false); setExamFinished(false); }} className="glass rounded-xl px-6 py-3 text-sm text-slate-300 hover:text-white transition">← Volver</button>
          </div>
        </div>
      </div>
    );
  }

  // ── WELCOME ──────────────────────────────────────────────────────────────────
  if (showWelcome && student) {
    const streak = appState.streaks[student.id];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "¡Buenos días" : hour < 18 ? "¡Buenas tardes" : "¡Buenas noches";
    const suggestedMod = MODULES.find(m => !sp[m.id]) || MODULES.find(m => sp[m.id] && sp[m.id].score < sp[m.id].total) || MODULES[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
        <style>{STYLES}</style>
        <div className="max-w-2xl w-full ani">
          <div className="glass rounded-3xl p-8 glow-teal text-center" style={{ borderColor: "rgba(99,202,183,0.2)" }}>
            <div className="text-6xl mb-4">{hour<12?"🌅":hour<18?"☀️":"🌙"}</div>
            <h1 className="text-3xl md:text-4xl font-black text-white">{greeting}, <span className="accent">{student.name}</span>!</h1>
            <div className="grid grid-cols-3 gap-3 mt-8">
              <div className="glass-dark rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-2xl font-black mono accent">{streak?.count || 0}</div>
                <div className="text-xs text-slate-400 mt-0.5">días de racha</div>
              </div>
              <div className="glass-dark rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-2xl font-black mono">{completedMods}</div>
                <div className="text-xs text-slate-400 mt-0.5">módulos hechos</div>
              </div>
              <div className="glass-dark rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">🏅</div>
                <div className="text-2xl font-black mono accent">{(appState.achievements[student.id] || []).length}</div>
                <div className="text-xs text-slate-400 mt-0.5">logros</div>
              </div>
            </div>
            {suggestedMod && (
              <div className="glass rounded-2xl p-4 mt-6 text-left">
                <div className="mono text-xs text-slate-400 tracking-widest mb-2">💡 SUGERENCIA DE HOY</div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{suggestedMod.emoji}</span>
                  <div className="flex-1"><div className="font-bold text-white">{suggestedMod.title}</div><div className="text-xs text-slate-400">{suggestedMod.category} · {suggestedMod.level}</div></div>
                  <button onClick={() => { setShowWelcome(false); setSelectedModuleId(suggestedMod.id); }} className="btn-accent px-4 py-2 text-xs">Ir →</button>
                </div>
              </div>
            )}
            <button onClick={() => setShowWelcome(false)} className="btn-accent w-full mt-6 py-4 text-sm font-bold">Entrar a la plataforma →</button>
            <button onClick={logout} className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition">No soy {student.name} — Salir</button>
          </div>
        </div>
      </div>
    );
  }

  if (showCert) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
      <style>{STYLES}</style>
      <div className="cert ani max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">🎓</div>
        <h1 className="text-3xl font-bold text-white mt-4">¡Felicitaciones!</h1>
        <h2 className="text-2xl font-bold accent mt-2">{student.name}</h2>
        <p className="mt-4 text-slate-300">Completaste todos los <strong className="text-white">{MODULES.length} módulos</strong> de <strong className="accent">Aula Controllab</strong>.</p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-4"><div className="text-2xl font-black mono accent">{totalScore}</div><div className="text-xs text-slate-400 mt-1">Puntos</div></div>
          <div className="glass rounded-2xl p-4"><div className="text-2xl font-black mono">{MODULES.length}</div><div className="text-xs text-slate-400 mt-1">Módulos</div></div>
          <div className="glass rounded-2xl p-4"><div className="text-2xl font-black mono accent">100%</div><div className="text-xs text-slate-400 mt-1">Completado</div></div>
        </div>
        <button onClick={() => setShowCert(false)} className="btn-accent mt-8 px-8 py-3 text-sm">← Volver</button>
      </div>
    </div>
  );

  // ── MAIN APP ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <style>{STYLES}</style>

      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2 ani">
          {newAchievements.map(a => (
            <div key={a.id} className="glass-accent rounded-2xl px-5 py-4 flex items-center gap-3 pop" style={{borderColor:"rgba(99,202,183,.4)"}}>
              <span className="text-3xl">{a.emoji}</span>
              <div><div className="text-xs mono tracking-widest text-slate-400 mb-0.5">🏅 LOGRO DESBLOQUEADO</div><div className="font-bold text-white">{a.title}</div></div>
            </div>
          ))}
        </div>
      )}

      <header className="sticky top-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div>
              <div className="mono text-xs text-slate-500 tracking-widest">CONTROLLAB</div>
              <div className="font-bold text-base">Hola, <span className="accent">{student.name}</span> 👋 {cloudLoading && <span className="text-xs text-slate-500 font-normal">☁️ sincronizando...</span>}</div>
            </div>
            <div className="hidden md:flex items-center gap-2 ml-2">
              <div className="glass rounded-xl px-3 py-1.5 text-xs"><span className="text-slate-400">Progreso </span><span className="font-bold accent">{pct}%</span></div>
              <div className="glass rounded-xl px-3 py-1.5 text-xs"><span className="text-slate-400">Módulos </span><span className="font-bold">{completedMods}/{MODULES.length}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {allDone && <button onClick={() => setShowCert(true)} className="btn-accent px-3 py-2 text-xs">🎓 Certificado</button>}
            <button onClick={() => setShowAchievements(a => !a)} className={`glass rounded-xl px-3 py-2 text-xs transition ${showAchievements?"accent":"text-slate-300 hover:text-white"}`}>
              🏅 {(appState.achievements[student?.id || ""] || []).length}/{ALL_ACHIEVEMENTS.length}
            </button>
            <button onClick={startExam} className="btn-purple px-3 py-2 text-xs">⚡ Examen</button>
            {reviewModules.length > 0 && <button onClick={() => { setReviewMode(r => !r); setActiveCategory("Todos"); }} className={`glass rounded-xl px-3 py-2 text-xs font-semibold ${reviewMode?"text-yellow-300":"text-slate-300 hover:text-white"}`}>🔁 Repaso ({reviewModules.length})</button>}
            <button onClick={() => setShowTranslator(t => !t)} className={`glass rounded-xl px-3 py-2 text-xs ${showTranslator?"accent":"text-slate-300 hover:text-white"}`}>🌐</button>
            <button onClick={openPanel} className="glass rounded-xl px-3 py-2 text-xs text-slate-300 hover:text-white">{showPanel?"✕ Panel":"📊 Profe"}</button>
            <button onClick={() => setShowChangePass(c => !c)} className={`glass rounded-xl px-3 py-2 text-xs ${showChangePass?"accent":"text-slate-300 hover:text-white"}`}>🔑</button>
            <button onClick={logout} className="glass rounded-xl px-3 py-2 text-xs text-slate-300 hover:text-white">Salir →</button>
          </div>
        </div>
        <div className="progress-bar mx-4 mb-2" style={{borderRadius:0}}><div className="progress-fill" style={{width:`${pct}%`}} /></div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-6">

        {showTranslator && (
          <div className="glass rounded-3xl p-5 mb-6 ani">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="text-sm font-semibold text-white">🌐 Traductor ES ↔ PT</div>
              <button onClick={() => setTransDir(d => d==="es-pt"?"pt-es":"es-pt")} className="glass rounded-xl px-4 py-2 text-sm font-bold accent">{transDir==="es-pt"?"ES→PT":"PT→ES"} ⇄</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <textarea value={transInput} onChange={e => setTransInput(e.target.value)} rows={4} placeholder={transDir==="es-pt"?"Escribí en español...":"Escreva em português..."} className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm resize-none" />
                <button onClick={translate} disabled={transLoading||!transInput.trim()} className="btn-accent w-full mt-2 py-2.5 text-sm">{transLoading?"Traduciendo...":"Traducir →"}</button>
                {transInput.trim() && <button onClick={openGoogleTranslate} className="w-full mt-1.5 py-2 text-xs text-slate-400 hover:text-white text-center">Abrir en Google Translate ↗</button>}
              </div>
              <div>
                <div className="w-full rounded-2xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm min-h-[104px] text-slate-100">
                  {transLoading?<span className="text-slate-500">Traduciendo...</span>:transResult||<span className="text-slate-600">La traducción aparece aquí...</span>}
                </div>
                {transResult && <button onClick={() => speak(transResult, 0.85)} className="mt-2 text-xs text-slate-400 hover:text-white">🔊 Escuchar</button>}
              </div>
            </div>
          </div>
        )}

        {showAchievements && student && (
          <div className="glass rounded-3xl p-5 mb-6 ani">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-xl font-bold">Progreso de <span className="accent">{student.name}</span></h2>
              <div className="flex gap-2">
                <button onClick={() => setWeekTab("weekly")} className={`tab ${weekTab==="weekly"?"active":""}`}>📊 Actividad</button>
                <button onClick={() => setWeekTab("achievements")} className={`tab ${weekTab==="achievements"?"active":""}`}>🏅 Logros</button>
              </div>
            </div>
            {weekTab === "weekly" && (() => {
              const today = new Date();
              const days = Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(6-i));return d.toISOString().split("T")[0];});
              const activity = appState.weeklyActivity[student.id] || {};
              const streak = appState.streaks[student.id];
              const maxVal = Math.max(1,...days.map(d=>activity[d]||0));
              const dayNames = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
              return (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[{icon:"🔥",val:streak?.count||0,label:"Días de racha"},{icon:"✅",val:completedMods,label:`Módulos / ${MODULES.length}`},{icon:"⭐",val:totalScore,label:"Puntos"},{icon:"📝",val:`${pct}%`,label:"Completado"}].map(s=>(
                      <div key={s.label} className="glass-dark rounded-2xl p-4 text-center">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-2xl font-black mono accent">{s.val}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-dark rounded-2xl p-5">
                    <div className="mono text-xs text-slate-400 tracking-widest mb-4">ACTIVIDAD ÚLTIMOS 7 DÍAS</div>
                    <div className="flex items-end gap-2 h-24">
                      {days.map((d,i)=>{
                        const val=activity[d]||0;
                        const h=Math.max(4,Math.round((val/maxVal)*80));
                        const isToday=d===new Date().toISOString().split("T")[0];
                        const dayName=dayNames[new Date(d+"T12:00:00").getDay()];
                        return (<div key={d} className="flex-1 flex flex-col items-center gap-1">
                          <div className="text-xs mono accent font-bold">{val>0?val:""}</div>
                          <div className="w-full rounded-lg" style={{height:`${h}px`,background:isToday?"#63CAB7":val>0?"rgba(99,202,183,0.4)":"rgba(255,255,255,0.06)"}} />
                          <div className={`text-xs ${isToday?"accent font-bold":"text-slate-500"}`}>{dayName}</div>
                        </div>);
                      })}
                    </div>
                  </div>
                  <div className="glass-dark rounded-2xl p-5">
                    <div className="mono text-xs text-slate-400 tracking-widest mb-3">PROGRESO POR ÁREA</div>
                    <div className="space-y-3">
                      {["Laboratorio","Gestión","Comunicación","Tecnología","Gramática"].map(cat=>{
                        const catMods=MODULES.filter(m=>m.category===cat);
                        const done=catMods.filter(m=>sp[m.id]).length;
                        return (<div key={cat}>
                          <div className="flex justify-between text-xs mb-1"><span className="text-slate-300 font-medium">{cat}</span><span className="mono accent">{done}/{catMods.length}</span></div>
                          <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.round((done/catMods.length)*100)}%`}} /></div>
                        </div>);
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
            {weekTab === "achievements" && (() => {
              const unlocked = appState.achievements[student.id] || [];
              const unlockedIds = unlocked.map((a: Achievement) => a.id);
              return (
                <div className="grid gap-3 md:grid-cols-2">
                  {ALL_ACHIEVEMENTS.map(a => {
                    const isUnlocked = unlockedIds.includes(a.id);
                    const data = unlocked.find((u: Achievement) => u.id === a.id);
                    return (
                      <div key={a.id} className={`rounded-2xl px-5 py-4 flex items-center gap-4 ${isUnlocked?"glass-accent":"glass-dark opacity-50"}`}>
                        <span className="text-3xl">{isUnlocked?a.emoji:"🔒"}</span>
                        <div className="flex-1">
                          <div className={`font-bold text-sm ${isUnlocked?"text-white":"text-slate-500"}`}>{a.title}</div>
                          {isUnlocked&&data&&<div className="text-xs text-slate-400 mt-0.5">Desbloqueado {data.unlockedAt}</div>}
                        </div>
                        {isUnlocked && <span className="badge badge-green">✓</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {showChangePass && (
          <div className="glass rounded-3xl p-5 mb-6 ani glow-teal">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-white font-semibold">🔑 Cambiar contraseña — <span className="accent">{student?.name}</span></div>
              <button onClick={() => { setShowChangePass(false); setPassMsg(""); setNewPass(""); setNewPassConfirm(""); }} className="glass rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white">✕</button>
            </div>
            {student && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Nueva contraseña (mín. 4 caracteres)" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                  <input type="password" value={newPassConfirm} onChange={e => setNewPassConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&changePassword()} placeholder="Confirmar contraseña" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                  <button onClick={changePassword} disabled={!newPass||!newPassConfirm} className="btn-accent w-full py-3 text-sm">Guardar</button>
                  {passMsg && <p className={`text-sm font-medium ${passMsg.startsWith("✓")?"accent":"text-rose-400"}`}>{passMsg}</p>}
                </div>
                <div className="glass-dark rounded-2xl p-4 text-sm text-slate-300 space-y-2">
                  <p>• Código actual: <strong className="text-white">{student.passwordChanged ? "personalizado" : student.code}</strong></p>
                  <p>• Solo vos conocés tu nueva contraseña.</p>
                  {student.passwordChanged && <span className="badge badge-green">✓ Contraseña personalizada</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {showPanel && (
          <div className="glass rounded-3xl p-5 mb-6 ani">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-xl font-bold">📊 Panel del Profesor</h2>
              <div className="flex gap-2 flex-wrap">
                {(["ranking","progress","dictations","students"] as const).map(t=>(
                  <button key={t} onClick={()=>setTeacherTab(t)} className={`tab ${teacherTab===t?"active":""}`}>
                    {t==="ranking"?"🏆 Ranking":t==="progress"?"📊 Quiz":t==="dictations"?"🎙 Dictados":"👥 Alumnos"}
                  </button>
                ))}
              </div>
            </div>
            {teacherTab==="ranking" && (
              <div className="space-y-3">{ranking.map((r,i)=>(
                <div key={r.id} className={`glass rounded-2xl px-5 py-4 flex items-center gap-4 ${i===0?"border border-yellow-500/30":""}`}>
                  <div className={`text-2xl font-black w-8 ${i===0?"m1":i===1?"m2":i===2?"m3":"text-slate-500"}`}>{i<3?["🥇","🥈","🥉"][i]:`${i+1}`}</div>
                  <div className="flex-1"><div className="font-bold">{r.name}</div><div className="text-xs text-slate-400">{r.cm}/{MODULES.length} mód · dictado {r.da}%</div></div>
                  <div className="text-right"><div className="text-2xl font-black mono accent">{r.pts}</div><div className="text-xs text-slate-500">pts</div></div>
                </div>
              ))}</div>
            )}
            {teacherTab==="progress" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-slate-400"><th className="text-left px-4 py-3">Alumno</th>{MODULES.map(m=><th key={m.id} className="text-center px-1 py-3 text-xs" title={m.title}>{m.emoji}</th>)}<th className="text-center px-4 py-3">%</th><th className="text-center px-4 py-3">Reset</th></tr></thead>
                  <tbody>{ranking.map((r,i)=>(
                    <tr key={r.id} className={`border-t border-white/5 ${i%2===0?"bg-white/[0.02]":""}`}>
                      <td className="px-4 py-2 font-medium text-sm">{r.name}</td>
                      {MODULES.map(m=>{const p=(appState.progress[r.id]||{})[m.id];return <td key={m.id} className="text-center px-1 py-2">{p?<button onClick={()=>{if(window.confirm(`¿Reiniciar ${m.title} de ${r.name}?`))resetModuleProgress(r.id,m.id);}} className="font-bold mono text-xs hover:text-rose-400 transition cursor-pointer" title="Clic para reiniciar"><span className={p.score===p.total?"text-emerald-400":p.score>0?"accent":"text-amber-400"}>{p.score}/{p.total}</span></button>:<span className="text-slate-700 text-xs">·</span>}</td>;})}
                      <td className="text-center px-4 py-2"><span className={`text-xs font-bold px-2 py-1 rounded-full ${r.cm===MODULES.length?"bg-emerald-900 text-emerald-300":r.cm>0?"bg-amber-900 text-amber-300":"bg-slate-700 text-slate-400"}`}>{Math.round((r.cm/MODULES.length)*100)}%</span></td>
                      <td className="text-center px-4 py-2">
                        <button onClick={()=>{if(window.confirm(`¿Reiniciar TODO el progreso de ${r.name}?`)){MODULES.forEach(m=>resetModuleProgress(r.id,m.id));}}} className="text-rose-400 text-xs hover:text-rose-300 transition" title="Reiniciar todos los módulos">🗑️ Todo</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
                <div className="px-4 py-2 text-xs text-slate-500">💡 Clic en cualquier puntaje para reiniciar ese módulo específico</div>
              </div>
            )}
            {teacherTab==="dictations" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-slate-400"><th className="text-left px-4 py-3">Alumno</th>{MODULES.map(m=><th key={m.id} className="text-center px-1 py-3 text-xs" title={m.title}>{m.emoji}</th>)}<th className="text-center px-4 py-3">Prom.</th></tr></thead>
                  <tbody>{ranking.map((r,i)=>(
                    <tr key={r.id} className={`border-t border-white/5 ${i%2===0?"bg-white/[0.02]":""}`}>
                      <td className="px-4 py-2 font-medium text-sm">{r.name}</td>
                      {MODULES.map(m=>{const d=(appState.dictations[r.id]||{})[m.id];return <td key={m.id} className="text-center px-1 py-2">{d!=null?<span className={`mono text-xs font-bold ${d.score>=80?"text-emerald-400":d.score>=50?"text-amber-400":"text-rose-400"}`}>{d.score}%</span>:<span className="text-slate-700 text-xs">·</span>}</td>;})}
                      <td className="text-center px-4 py-2 font-bold mono accent text-sm">{r.da>0?`${r.da}%`:"—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {teacherTab==="students" && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="glass-dark rounded-2xl p-5">
                  <div className="mono text-xs text-slate-400 tracking-widest mb-4">AGREGAR ALUMNO</div>
                  <div className="space-y-3">
                    <input value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Nombre" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                    <input value={newStudentCode} onChange={e=>setNewStudentCode(e.target.value)} placeholder="Código" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm mono" />
                    <button onClick={addStudent} className="btn-accent w-full px-4 py-3 text-sm">+ Agregar</button>
                  </div>
                </div>
                <div className="glass-dark rounded-2xl p-5">
                  <div className="mono text-xs text-slate-400 tracking-widest mb-4">ALUMNOS ({appState.students.length})</div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">{appState.students.map(s=>(
                    <div key={s.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                      <div>
                        <div className="font-medium text-sm">{s.name} {s.passwordChanged&&<span className="badge badge-green" style={{fontSize:"9px"}}>🔑</span>}</div>
                        <div className="mono text-xs text-slate-500">{s.code}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.passwordChanged&&<button onClick={()=>{if(window.confirm("¿Resetear contraseña de "+s.name+"?"))resetStudentPassword(s.id);}} className="text-yellow-400 text-xs hover:text-yellow-300">Reset</button>}
                        {!defaultStudents.some(d=>d.id===s.id)&&<button onClick={()=>removeStudent(s.id)} className="text-rose-400 text-xs hover:text-rose-300">Eliminar</button>}
                      </div>
                    </div>
                  ))}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map(c=><button key={c} onClick={()=>setActiveCategory(c)} className={`tab whitespace-nowrap ${activeCategory===c?"active":""}`}>{c}</button>)}
        </div>

        {reviewMode && (
          <div className="glass-accent rounded-2xl px-5 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap ani">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔁</span>
              <div><div className="font-bold text-sm text-yellow-300">Modo Repaso</div><div className="text-xs text-slate-400">{reviewModules.length} módulo{reviewModules.length!==1?"s":""} para repasar</div></div>
            </div>
            <button onClick={()=>setReviewMode(false)} className="glass rounded-xl px-4 py-2 text-xs text-slate-300 hover:text-white">✕ Salir</button>
          </div>
        )}

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 mb-6">
          {filtered.map(m=>{
            const p=sp[m.id];const active=m.id===selectedModuleId;
            return (
              <button key={m.id} onClick={()=>setSelectedModuleId(m.id)} className={`module-card glass rounded-2xl p-3 text-left border ${active?"active":reviewMode&&reviewModules.some(r=>r.id===m.id)?"needs-review border-yellow-500/30":"border-white/5"}`}>
                <div className="text-xl mb-1">{m.emoji}</div>
                <div className="text-xs text-slate-400 mb-0.5">{m.category}</div>
                <div className="font-bold text-xs leading-tight">{m.title}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${LEVEL_COLOR[m.level]}`} style={{fontSize:"9px"}}>{m.level}</span>
                  <span className={`mono text-xs font-bold ${p?"accent":"text-slate-600"}`}>{p?`${p.score}/${p.total}`:"—"}</span>
                </div>
                {p&&<div className="mt-1.5 progress-bar"><div className="progress-fill" style={{width:`${Math.round((p.score/p.total)*100)}%`}} /></div>}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="glass rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-green">{mod.category}</span>
                    <span className={`badge ${mod.level==="Básico"?"badge-green":mod.level==="Intermedio"?"badge-yellow":"badge-red"}`}>{mod.level}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{mod.emoji} {mod.title}</h2>
                  <p className="mt-1 text-slate-400 text-sm">{mod.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="glass rounded-xl px-3 py-1.5 text-xs"><span className="text-slate-400">Mejor: </span><span className="font-bold accent mono">{mp.score}/{mp.total}</span></div>
                  {(mp.score > 0 || mp.completed || mp.attempts > 0) && (
                    <button onClick={() => {
                      if (window.confirm(`¿Reiniciar "${mod.title}"?\nPuntaje actual: ${mp.score}/${mp.total}\nEsto no se puede deshacer.`)) {
                        resetModuleProgress(student!.id, selectedModuleId);
                      }
                    }} className="glass rounded-xl px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition border border-rose-500/20 hover:border-rose-500/50">
                      🔄 Reiniciar
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-5 flex-wrap">
                {(["reading","quiz","dictation","vocab","flashcards"] as const).map(s=>(
                  <button key={s} onClick={()=>s==="quiz"?startQuiz():setSection(s)} className={`tab ${section===s?"active":""}`}>
                    {s==="reading"?"📖 Lectura":s==="quiz"?"✏️ Quiz":s==="dictation"?"🎙 Dictado":s==="vocab"?"📝 Vocab":"🃏 Flashcards"}
                  </button>
                ))}
              </div>
            </div>

            {section==="reading" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">{mod.readingTitle}</h3>
                  <button onClick={()=>speak(mod.reading.join(" "),0.9)} className="glass rounded-xl px-4 py-2 text-sm text-slate-300 hover:text-white">🔊 Escuchar</button>
                </div>
                <div className="space-y-6">
                  {mod.reading.map((p,i)=>(
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full accent-bg flex items-center justify-center text-xs font-black text-slate-900 mt-1">{i+1}</div>
                      <p className="reading-text flex-1">{p}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  <button onClick={startQuiz} className="btn-accent px-6 py-3 text-sm">Ir al quiz →</button>
                </div>
              </div>
            )}

            {section==="quiz" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">Quiz de comprensión</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke={timeLeft<=10?"#f87171":"#63CAB7"} strokeWidth="4"
                          strokeDasharray={`${2*Math.PI*20}`} strokeDashoffset={`${2*Math.PI*20*(1-timeLeft/QUIZ_TIME)}`}
                          style={{transition:"stroke-dashoffset 0.5s linear"}} strokeLinecap="round" />
                      </svg>
                      <div className={`absolute inset-0 flex items-center justify-center mono text-xs font-bold ${timeLeft<=10?"text-rose-400":"accent"}`}>{timeLeft}</div>
                    </div>
                    <div className="glass rounded-xl px-4 py-2 mono text-sm font-bold accent">{qIdx+1}/{mod.quiz.length}</div>
                  </div>
                </div>
                <div className="progress-bar mb-5"><div className="progress-fill" style={{width:`${((qIdx+(submitted?1:0))/mod.quiz.length)*100}%`}} /></div>
                <div className="glass-dark rounded-2xl p-5">
                  <p className="text-lg font-semibold mb-4">{q.question}</p>
                  <div className="space-y-3">
                    {shuffledOpts.map(opt=>{
                      const sel=selectedOption===opt;const ok=submitted&&opt===q.answer;const bad=submitted&&sel&&opt!==q.answer;
                      return <button key={opt} onClick={()=>!submitted&&setAns(opt)} disabled={submitted} className={`opt ${ok?"ok":bad?"bad":sel?"sel":""}`}>{opt}</button>;
                    })}
                  </div>
                </div>
                {submitted && (
                  <div className={`mt-4 rounded-2xl px-5 py-4 ani ${isOk?"bg-emerald-900/30 border border-emerald-500/30":"bg-rose-900/30 border border-rose-500/30"}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{isOk?"✅":"❌"}</span>
                      <div>
                        <div className={`font-bold text-sm ${isOk?"text-emerald-300":"text-rose-300"}`}>{isOk?"¡Correcto!": `Respuesta correcta: ${q.answer}`}</div>
                        {q.explanation && <div className="text-slate-300 text-sm mt-1 leading-6">{q.explanation}</div>}
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm">{!submitted && <span className="text-slate-500">Elegí antes de que el tiempo se acabe.</span>}</div>
                  {!submitted?<button onClick={handleSubmit} disabled={!selectedOption} className="btn-accent px-6 py-3 text-sm">Comprobar</button>
                    :<button onClick={handleNext} className="btn-accent px-6 py-3 text-sm">{qIdx<mod.quiz.length-1?"Siguiente →":"Finalizar ✓"}</button>}
                </div>
              </div>
            )}

            {section==="dictation" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">🎙 Dictado</h3>
                  <button onClick={()=>speak(mod.dictation,0.75)} className="glass rounded-xl px-4 py-2 text-sm text-slate-300 hover:text-white">🔊 Reproducir</button>
                </div>
                <p className="text-slate-400 text-sm mb-4">Escuchá el audio y escribí la frase completa en español.</p>
                <textarea value={dictText} onChange={e=>setDictText(e.target.value)} rows={4} placeholder="Escribí lo que escuchaste..." className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-white px-5 py-4 text-sm leading-7 resize-none" />
                <button onClick={checkDict} className="btn-accent mt-4 px-6 py-3 text-sm">Corregir</button>
                {(dictResult||curDict)&&(()=>{const r=dictResult||curDict!;return(
                  <div className="mt-5 glass-dark rounded-2xl p-5 space-y-3 ani">
                    <div className="flex items-center gap-3">
                      <div className={`text-4xl font-black mono ${r.score>=80?"text-emerald-400":r.score>=50?"text-amber-400":"text-rose-400"}`}>{r.score}%</div>
                      <div className="text-sm text-slate-400">{r.score===100?"¡Perfecto! 🎉":r.score>=80?"¡Muy bien! 🌟":r.score>=50?"Buen intento 💪":"Seguí practicando 📚"}</div>
                    </div>
                    <div className="text-sm"><span className="text-slate-400">Frase modelo: </span><span className="text-slate-200 italic">{r.expected}</span></div>
                  </div>
                );})()}
              </div>
            )}

            {section==="vocab" && (
              <div className="glass rounded-3xl p-6 ani">
                <h3 className="text-xl font-bold mb-5">📝 Vocabulario clave</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {mod.vocab.map(v=>(
                    <div key={v.es} className="glass-dark rounded-2xl px-5 py-4 hover-lift">
                      <div className="flex justify-between items-start gap-4">
                        <div><div className="font-bold text-white">{v.es}</div><div className="text-xs text-slate-500 mt-1 mono">🇦🇷 ESPAÑOL</div></div>
                        <div className="text-right"><div className="font-bold accent">{v.pt}</div><div className="text-xs text-slate-500 mt-1 mono">🇧🇷 PORTUGUÊS</div></div>
                      </div>
                      <button onClick={()=>speak(v.es,0.85)} className="mt-3 text-xs text-slate-500 hover:text-white">🔊 Escuchar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section==="flashcards" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold">🃏 Flashcards</h3>
                  <div className="glass rounded-xl px-4 py-2 mono text-sm accent">{fcIdx+1}/{mod.vocab.length}</div>
                </div>
                <p className="text-slate-400 text-sm mb-5">Tocá la tarjeta para ver la traducción.</p>
                <div className="fc" onClick={()=>setFcFlipped(f=>!f)}>
                  <div className={`fc-inner ${fcFlipped?"flip":""}`}>
                    <div className="fc-face fc-front">{mod.vocab[fcIdx].es}</div>
                    <div className="fc-face fc-back">{mod.vocab[fcIdx].pt}</div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5 justify-center">
                  <button onClick={()=>{setFcIdx(i=>Math.max(0,i-1));setFcFlipped(false);}} disabled={fcIdx===0} className="btn-accent px-5 py-3 text-sm">← Anterior</button>
                  <button onClick={()=>{setFcIdx(i=>Math.min(mod.vocab.length-1,i+1));setFcFlipped(false);}} disabled={fcIdx===mod.vocab.length-1} className="btn-accent px-5 py-3 text-sm">Siguiente →</button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">MI PROGRESO</div>
              <div className="text-5xl font-black accent mono">{pct}%</div>
              <div className="mt-4 progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="glass-dark rounded-2xl p-3"><div className="mono text-lg font-black">{completedMods}</div><div className="text-xs text-slate-400">Módulos</div></div>
                <div className="glass-dark rounded-2xl p-3"><div className="mono text-lg font-black accent">{totalScore}</div><div className="text-xs text-slate-400">Puntos</div></div>
              </div>
              {allDone && <button onClick={()=>setShowCert(true)} className="btn-accent w-full mt-4 py-3 text-sm">🎓 Certificado</button>}
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">🏆 RANKING</div>
              <div className="space-y-2">
                {ranking.slice(0,5).map((r,i)=>(
                  <div key={r.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.id===student.id?"bg-white/10":""}`}>
                    <span className={`text-sm font-bold w-6 ${i===0?"m1":i===1?"m2":i===2?"m3":"text-slate-500"}`}>{i<3?["🥇","🥈","🥉"][i]:`${i+1}`}</span>
                    <span className={`text-sm flex-1 ${r.id===student.id?"text-white font-semibold":"text-slate-300"}`}>{r.name}</span>
                    <span className="mono text-xs font-bold accent">{r.pts}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">MÓDULOS</div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {MODULES.map(m=>{
                  const p=sp[m.id];const isActive=m.id===selectedModuleId;
                  return (
                    <button key={m.id} onClick={()=>setSelectedModuleId(m.id)} className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left transition ${isActive?"bg-white/10":"hover:bg-white/5"}`}>
                      <span className="text-sm">{m.emoji}</span>
                      <div className="flex-1 min-w-0"><div className={`text-xs font-medium truncate ${isActive?"text-white":"text-slate-300"}`}>{m.title}</div></div>
                      {p?<span className="mono text-xs font-bold accent">{p.score}/{p.total}</span>:<span className="text-slate-600 text-xs">—</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
