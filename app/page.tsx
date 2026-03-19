"use client";
import { useEffect, useMemo, useState } from "react";

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
      "La conjugación de los verbos regulares en presente sigue patrones predecibles según la terminación del infinitivo. Los verbos terminados en -ar forman el presente con las terminaciones -o, -as, -a, -amos, -áis, -an. Por ejemplo: analizar → analizo, analizas, analiza, analizamos, analizáis, analizan. Los verbos terminados en -er usan -o, -es, -e, -emos, -éis, -en. Por ejemplo: leer → leo, lees, lee, leemos, leéis, leen. Los verbos terminados en -ir usan las mismas terminaciones que los -er, excepto en la primera y segunda persona del plural. Por ejemplo: escribir → escribo, escribes, escribe, escribimos, escribís, escriben.",
      "Sin embargo, muchos de los verbos más frecuentes en el lenguaje técnico del laboratorio son irregulares y deben memorizarse. El verbo ser se conjuga: soy, eres, es, somos, sois, son. El verbo estar: estoy, estás, está, estamos, estáis, están. El verbo tener: tengo, tienes, tiene, tenemos, tenéis, tienen. El verbo hacer: hago, haces, hace, hacemos, hacéis, hacen. El verbo poder: puedo, puedes, puede, podemos, podéis, pueden. El verbo ir: voy, vas, va, vamos, vais, van. Estos verbos aparecen constantemente en procedimientos, correos y conversaciones técnicas, por lo que su manejo fluido es fundamental.",
      "Una diferencia importante entre el español y el portugués en el uso del presente es la frecuencia con que el español recurre a este tiempo donde el portugués preferiría usar el gerundio o una perífrasis verbal. En español es completamente natural decir 'el equipo procesa las muestras' para referirse a una acción que está ocurriendo ahora mismo, mientras que en portugués sería más frecuente decir 'o equipamento está processando as amostras'. Esta diferencia puede generar errores de transferencia en hablantes de portugués que aprenden español, porque tienden a construir frases con 'estar + gerundio' más frecuentemente de lo que la norma española lo requiere.",
      "En los procedimientos operativos estándar del laboratorio, el presente de indicativo es el tiempo dominante porque describe acciones que se repiten igual en cada ejecución del procedimiento. 'El operador enciende el equipo y espera la secuencia de inicialización. Verifica que los reactivos estén correctamente instalados. Introduce los controles de calidad en el orden establecido. Registra los resultados en el sistema antes de procesar las muestras de pacientes.' Ese uso imperativo del presente terciopelado, que suena más formal que el imperativo directo, es una característica del lenguaje técnico en español que conviene conocer y manejar con fluidez.",
    ],
    vocab: [
      { es: "verificar", pt: "verificar" }, { es: "registrar", pt: "registrar" },
      { es: "procesar", pt: "processar" }, { es: "analizar", pt: "analisar" },
      { es: "comunicar", pt: "comunicar" }, { es: "liberar resultados", pt: "liberar resultados" },
    ],
    quiz: [
      { question: "¿Para qué se usa el presente de indicativo en contextos técnicos?", options: ["Solo para hablar del futuro inmediato", "Acciones habituales, hechos generales, situaciones actuales e instrucciones de procedimientos", "Solo para el pasado reciente", "Solo para preguntas formales"], answer: "Acciones habituales, hechos generales, situaciones actuales e instrucciones de procedimientos" },
      { question: "¿Cómo se conjuga 'analizar' en primera persona del singular?", options: ["analiza", "analizamos", "analizo", "analizas"], answer: "analizo" },
      { question: "¿Cuáles son las terminaciones del presente para verbos terminados en -er?", options: ["-o, -as, -a, -amos, -áis, -an", "-o, -es, -e, -emos, -éis, -en", "-o, -is, -e, -imos, -ís, -en", "-o, -as, -e, -amos, -éis, -an"], answer: "-o, -es, -e, -emos, -éis, -en" },
      { question: "¿Cómo se conjuga 'hacer' en primera persona del singular?", options: ["hace", "hacemos", "hago", "haces"], answer: "hago" },
      { question: "¿Cómo se conjuga 'poder' en segunda persona del singular?", options: ["podo", "puede", "puedes", "podemos"], answer: "puedes" },
      { question: "¿Cuál es la diferencia de uso del presente entre español y portugués?", options: ["No hay ninguna diferencia de uso", "En español se usa el presente simple donde el portugués prefiere 'estar + gerundio'", "En español el presente solo se usa para el pasado", "En portugués el presente se usa más frecuentemente"], answer: "En español se usa el presente simple donde el portugués prefiere 'estar + gerundio'" },
      { question: "¿Cuál de estos verbos es completamente irregular en presente?", options: ["trabajar", "leer", "escribir", "ser"], answer: "ser" },
      { question: "¿Para qué se usa el presente en los procedimientos operativos estándar?", options: ["Solo como título del documento", "Para describir acciones que se repiten igual en cada ejecución del procedimiento", "Para indicar las fechas de vencimiento de reactivos", "Para señalar los responsables del proceso"], answer: "Para describir acciones que se repiten igual en cada ejecución del procedimiento" },
    ],
    dictation: "El analista verifica los controles, registra los resultados y comunica cualquier desviación al área responsable antes de liberar los informes.",
  },
  {
    id: "pasado", title: "Pretérito perfecto e indefinido", level: "Intermedio", category: "Gramática", emoji: "📅",
    description: "Cómo hablar del pasado con precisión en informes y comunicaciones técnicas.",
    readingTitle: "Lo que ocurrió y lo que ha ocurrido",
    reading: [
      "En español existen dos tiempos verbales principales para expresar acciones pasadas, y la elección entre uno y otro no es arbitraria: refleja una diferencia de perspectiva sobre la relación entre esa acción pasada y el momento presente. El pretérito perfecto compuesto, formado con el auxiliar 'haber' más el participio del verbo principal (he verificado, ha detectado, hemos implementado), se usa cuando la acción pasada tiene algún tipo de conexión o relevancia con el presente: el resultado de esa acción aún importa, el período en el que ocurrió aún no ha terminado, o el hablante lo percibe como cercano o relacionado con el ahora.",
      "El pretérito indefinido, también llamado pretérito perfecto simple, se usa para acciones que el hablante percibe como completamente terminadas y desconectadas del presente. 'Ayer el analista procesó cuarenta y ocho muestras' usa el indefinido porque 'ayer' define un período claramente terminado. 'Esta semana el equipo implementó el nuevo procedimiento' podría usar el indefinido o el perfecto compuesto dependiendo de si el hablante considera que la semana sigue siendo relevante o ya está cerrada. En los informes técnicos, la elección entre estos dos tiempos puede cambiar sutilmente el significado de lo que se comunica.",
      "Para los hablantes de portugués brasileño, esta distinción es especialmente desafiante porque en el portugués de Brasil el pretérito perfeito composto tiene un uso muy restringido y particular, diferente del uso del pretérito perfecto compuesto en español. En portugués, 'tenho trabalhado' (pretérito perfeito composto) indica una acción que se ha repetido múltiples veces desde el pasado hasta ahora, mientras que en español 'he trabajado' puede usarse tanto para una acción puntual reciente como para una acción repetida. Esta diferencia hace que los hablantes de portugués brasileño frecuentemente usen el presente simple en español donde la norma requeriría el pretérito perfecto compuesto.",
      "En los informes de no conformidades, auditorías y acciones correctivas del laboratorio, el uso correcto de estos tiempos verbales tiene importancia práctica. 'Se detectó una desviación' (indefinido) indica que esa detección ocurrió en un momento puntual del pasado. 'Se ha detectado una desviación' (perfecto compuesto) implica que esa detección es reciente y sus consecuencias aún se están gestionando. 'El equipo corrigió el procedimiento' indica que la corrección está completamente terminada. 'El equipo ha corregido el procedimiento' implica que la corrección es reciente y probablemente aún está siendo verificada.",
      "Una estrategia práctica para los hablantes de portugués que aprenden español es asociar el pretérito perfecto compuesto con las palabras y expresiones que frecuentemente lo acompañan: hoy, esta semana, este mes, este año, últimamente, nunca, siempre (referido a la vida), recientemente, todavía no, ya (para afirmar que algo ocurrió). Y el indefinido con expresiones de tiempo claramente delimitado: ayer, el lunes pasado, el mes pasado, el año pasado, hace tres días, en 2022, en el turno de la mañana. Esa asociación no cubre todos los casos, pero cubre la mayoría de las situaciones del lenguaje técnico cotidiano.",
    ],
    vocab: [
      { es: "pretérito perfecto compuesto", pt: "pretérito perfeito composto" }, { es: "pretérito indefinido", pt: "pretérito perfeito simples" },
      { es: "ayer / la semana pasada", pt: "ontem / a semana passada" }, { es: "recientemente / últimamente", pt: "recentemente / ultimamente" },
      { es: "ha detectado / ha implementado", pt: "detectou / implementou (recente)" }, { es: "ocurrió / procesó", pt: "ocorreu / processou" },
    ],
    quiz: [
      { question: "¿Cuándo se usa el pretérito perfecto compuesto en español?", options: ["Para acciones completamente terminadas en el pasado lejano", "Cuando la acción pasada tiene conexión o relevancia con el momento presente", "Solo con la palabra 'ayer'", "Para acciones futuras inciertas"], answer: "Cuando la acción pasada tiene conexión o relevancia con el momento presente" },
      { question: "¿Cuál es correcto con el marcador temporal 'ayer'?", options: ["He procesado ayer cuarenta muestras", "Ayer procesé cuarenta muestras", "Ayer proceso cuarenta muestras", "Ayer he procesado cuarenta muestras"], answer: "Ayer procesé cuarenta muestras" },
      { question: "¿Qué implica 'el equipo ha detectado una desviación'?", options: ["Que la detección ocurrió hace mucho tiempo", "Que la detección es reciente y sus consecuencias siguen siendo relevantes ahora", "Que el equipo no detectó nada todavía", "Que la detección ocurrió exactamente ayer"], answer: "Que la detección es reciente y sus consecuencias siguen siendo relevantes ahora" },
      { question: "¿Con qué expresiones temporales va bien el pretérito indefinido?", options: ["Hoy, esta semana, recientemente", "Ayer, el lunes pasado, el mes pasado, hace tres días", "Últimamente, todavía no, ya", "Este año, esta mañana, hoy temprano"], answer: "Ayer, el lunes pasado, el mes pasado, hace tres días" },
      { question: "¿Qué diferencia tiene el pretérito perfeito composto del portugués brasileño respecto al español?", options: ["Son exactamente iguales en su uso", "En portugués indica acción repetida desde el pasado; en español tiene uso más amplio", "En español no existe ese tiempo verbal", "En portugués se usa con mucha más frecuencia"], answer: "En portugués indica acción repetida desde el pasado; en español tiene uso más amplio" },
      { question: "¿Qué error cometen frecuentemente los hablantes de portugués brasileño en español?", options: ["Usar el subjuntivo en lugar del indicativo", "Usar el presente simple donde el español requiere el pretérito perfecto compuesto", "Usar demasiado el imperfecto de indicativo", "Confundir ser y estar constantemente"], answer: "Usar el presente simple donde el español requiere el pretérito perfecto compuesto" },
      { question: "¿Qué diferencia de matiz hay entre 'corrigió' y 'ha corregido'?", options: ["No hay ninguna diferencia real entre ambas formas", "'Corrigió' indica acción terminada; 'ha corregido' implica que es reciente y aún se verifica", "Solo es una diferencia de registro formal versus informal", "'Ha corregido' es incorrecto en textos técnicos formales"], answer: "'Corrigió' indica acción terminada; 'ha corregido' implica que es reciente y aún se verifica" },
      { question: "¿Cuál es la estrategia práctica recomendada para aprender estos tiempos?", options: ["Memorizar todas las reglas gramaticales en abstracto", "Asociar cada tiempo con las expresiones temporales que lo acompañan frecuentemente en contextos reales", "Solo practicar con ejercicios formales de gramática", "Evitar el pretérito perfecto compuesto para simplificar"], answer: "Asociar cada tiempo con las expresiones temporales que lo acompañan frecuentemente en contextos reales" },
    ],
    dictation: "Ayer el analista procesó cuarenta muestras y detectó una desviación que ha sido comunicada al área de calidad esta mañana.",
  },
  {
    id: "ser-estar", title: "Ser vs. Estar", level: "Básico", category: "Gramática", emoji: "🔄",
    description: "La distinción más importante entre español y portugués: ser y estar.",
    readingTitle: "¿Es o está? La diferencia que cambia el significado",
    reading: [
      "La distinción entre 'ser' y 'estar' es probablemente el aspecto gramatical que más confunde a los hablantes de portugués cuando aprenden español. En portugués también existen ambos verbos, pero su distribución no coincide exactamente con la del español, lo que genera errores sistemáticos de transferencia. La regla más general que funciona como punto de partida es la siguiente: 'ser' se usa para características que se perciben como permanentes, esenciales o definitivas (identidad, origen, material, características inherentes), mientras que 'estar' se usa para estados, condiciones o situaciones que son temporales o percibidas como no definitivas.",
      "En el contexto del laboratorio, esta distinción aparece constantemente y tiene consecuencias prácticas reales. Decir 'el reactivo es vencido' es incorrecto en español: el vencimiento es un estado temporal en el que ha entrado el reactivo, no una característica permanente de su identidad, por lo que la forma correcta es 'el reactivo está vencido'. De la misma manera, 'el resultado es incorrecto' y 'el resultado está incorrecto' pueden usarse en español, pero con matices diferentes: 'es incorrecto' implica que es inherentemente defectuoso, mientras que 'está incorrecto' implica que en este momento tiene un error que podría corregirse.",
      "Los adjetivos que funcionan de forma diferente con 'ser' y 'estar' son una fuente constante de confusión y requieren práctica sistemática. 'El analista es aburrido' significa que la persona tiene una personalidad aburrida como característica permanente. 'El analista está aburrido' significa que en este momento se siente aburrido, sin implicar nada sobre su carácter habitual. 'El reactivo es malo' implica que es de mala calidad por naturaleza. 'El reactivo está malo' implica que en este momento no está en condiciones de uso, pero podría haberse deteriorado por alguna causa externa. Estas diferencias son sutiles pero importantes en la comunicación técnica precisa.",
      "La ubicación y las condiciones físicas o emocionales van casi siempre con 'estar'. 'El laboratorio está en el tercer piso.' 'Las muestras están en el refrigerador de cuatro grados.' 'El equipo está en mantenimiento.' 'El resultado está validado.' Estas son situaciones o condiciones que caracterizan el estado actual de algo, no su identidad permanente. La excepción son los eventos, que van con 'ser' aunque expresen una ubicación: 'La reunión es en la sala de conferencias' usa 'ser' porque el evento en sí es lo que se está describiendo, no la condición del lugar.",
      "Para los hablantes de portugués, una dificultad adicional es que algunas expresiones que en portugués usan 'ser' en español usan 'estar' y viceversa. 'Estou com fome' (tengo hambre, literalmente 'estoy con hambre') se traduce al español como 'tengo hambre', no como 'estoy hambriento' aunque ambas formas son posibles. 'É casado' (es casado) en portugués equivale a 'está casado' en español, porque el matrimonio se percibe como un estado más que como una característica identitaria permanente en el español estándar. La práctica constante con ejemplos del contexto laboral real es la mejor estrategia para internalizar estas diferencias.",
    ],
    vocab: [
      { es: "ser (identidad/permanente)", pt: "ser (identidade/permanente)" }, { es: "estar (estado/temporal)", pt: "estar (estado/temporário)" },
      { es: "el reactivo está vencido", pt: "o reagente está vencido" }, { es: "el resultado está validado", pt: "o resultado está validado" },
      { es: "el equipo está en mantenimiento", pt: "o equipamento está em manutenção" }, { es: "ella es analista", pt: "ela é analista" },
    ],
    quiz: [
      { question: "¿Cuál es la regla general para usar 'ser' en español?", options: ["Para estados y condiciones temporales", "Para características que se perciben como permanentes, esenciales o de identidad", "Para indicar ubicación siempre", "Para describir cómo está alguien en un momento específico"], answer: "Para características que se perciben como permanentes, esenciales o de identidad" },
      { question: "¿Cuál es correcto en español para el estado de un reactivo?", options: ["El reactivo es vencido", "El reactivo está vencido", "El reactivo fue vencido siempre", "El reactivo ser vencido hoy"], answer: "El reactivo está vencido" },
      { question: "¿Qué significa 'el analista está aburrido'?", options: ["Que es una persona aburrida por naturaleza y carácter permanente", "Que en este momento se siente aburrido sin implicar nada sobre su carácter habitual", "Que fue aburrido en el pasado laboral", "Que aburre permanentemente a sus compañeros de trabajo"], answer: "Que en este momento se siente aburrido sin implicar nada sobre su carácter habitual" },
      { question: "¿Cuál es la diferencia entre 'el reactivo es malo' y 'el reactivo está malo'?", options: ["No hay ninguna diferencia real entre ambas frases", "'Es malo' implica mala calidad inherente; 'está malo' implica que actualmente no está en condiciones de uso", "Solo una diferencia de registro formal vs informal", "'Está malo' es siempre incorrecto en español técnico"], answer: "'Es malo' implica mala calidad inherente; 'está malo' implica que actualmente no está en condiciones de uso" },
      { question: "¿Por qué 'la reunión es en la sala de conferencias' usa 'ser'?", options: ["Por una excepción gramatical sin explicación lógica", "Porque se describe el evento en sí mismo, no la condición de un lugar", "Porque las salas son características permanentes del edificio", "Porque es una expresión fija que no sigue las reglas generales"], answer: "Porque se describe el evento en sí mismo, no la condición de un lugar" },
      { question: "¿Qué equivale en portugués a 'está casado' en español?", options: ["'Está casado' también en portugués", "'É casado' con el verbo ser", "'Foi casado' en el pasado", "'Fica casado' con verbo diferente"], answer: "'É casado' con el verbo ser" },
      { question: "¿Cuál es correcto para describir la ubicación de los reactivos?", options: ["Los reactivos son en el refrigerador", "Los reactivos están en el refrigerador", "Los reactivos serán en el refrigerador siempre", "Los reactivos estuvieron en el refrigerador siempre"], answer: "Los reactivos están en el refrigerador" },
      { question: "¿Cuál es la mejor estrategia para internalizar ser y estar?", options: ["Memorizar todas las reglas abstractas de una vez", "Practicar con ejemplos del contexto laboral real y corregir errores en el momento", "Usar siempre 'estar' para evitar errores con 'ser'", "Traducir literalmente del portugués en cada situación"], answer: "Practicar con ejemplos del contexto laboral real y corregir errores en el momento" },
    ],
    dictation: "El equipo está en mantenimiento, el resultado está validado y el reactivo está vencido: todos son estados temporales que usan estar, no ser.",
  },
  {
    id: "subjuntivo", title: "Subjuntivo básico", level: "Avanzado", category: "Gramática", emoji: "🌀",
    description: "El subjuntivo en recomendaciones, necesidades y comunicaciones técnicas formales.",
    readingTitle: "Lo que recomendamos que hagan",
    reading: [
      "El subjuntivo es uno de los aspectos gramaticales del español que más dificultades genera para los hablantes de otras lenguas, incluido el portugués. Aunque el subjuntivo también existe en portugués (el subjuntivo presente: que eu faça, que ele verifique), su uso en español es más frecuente y abarca contextos que en portugués a veces se resuelven de otras formas. En el contexto técnico del laboratorio, el subjuntivo aparece con regularidad en tres situaciones principales: al expresar recomendaciones o necesidades ('es necesario que el analista verifique'), al expresar dudas o incertidumbre ('no es seguro que el resultado sea correcto') y en ciertas construcciones temporales que refieren al futuro ('cuando el equipo termine la calibración').",
      "La estructura más frecuente del subjuntivo en el lenguaje técnico es la que combina un verbo de influencia, emoción, deseo o duda en la oración principal con 'que' y un verbo en subjuntivo en la oración subordinada. Ejemplos de verbos que desencadenan el subjuntivo: es importante que, es necesario que, es fundamental que, recomendamos que, sugerimos que, pedimos que, esperamos que, es posible que, dudamos que, no creemos que. En todos estos casos, el verbo de la oración subordinada debe conjugarse en subjuntivo, no en indicativo.",
      "La conjugación del presente de subjuntivo para los verbos regulares se forma a partir de la primera persona del singular del presente de indicativo, eliminando la -o final y añadiendo las terminaciones opuestas: los verbos en -ar toman terminaciones de -er (-e, -es, -e, -emos, -éis, -en) y los verbos en -er e -ir toman terminaciones de -ar (-a, -as, -a, -amos, -áis, -an). Por ejemplo: verificar (verifico en indicativo) → verifique, verifiques, verifique, verifiquemos, verifiquéis, verifiquen. Documentar (documento) → documente, documentes, documente, documentemos, documentéis, documenten.",
      "Para los verbos irregulares en la primera persona del presente de indicativo, esa irregularidad se traslada a todo el subjuntivo. Tener (tengo) → tenga, tengas, tenga, tengamos, tengáis, tengan. Hacer (hago) → haga, hagas, haga, hagamos, hagáis, hagan. Poner (pongo) → ponga, pongas, ponga, pongamos, pongáis, pongan. Los verbos ser, ir, haber, estar y saber tienen formas de subjuntivo completamente irregulares que deben memorizarse: sea, vaya, haya, esté, sepa.",
      "En los documentos técnicos del laboratorio, el subjuntivo aparece frecuentemente en las secciones de recomendaciones de los informes de auditoría ('Se recomienda que el área actualice el procedimiento antes del próximo trimestre'), en las instrucciones de los protocolos de acción correctiva ('Es fundamental que el responsable verifique la eficacia de las acciones implementadas'), y en las comunicaciones formales con clientes ('Le solicitamos que nos confirme la recepción de este informe'). Reconocer y usar correctamente el subjuntivo en esos contextos es una marca de competencia lingüística técnica que distingue a un profesional que domina el español formal del que solo lo habla de forma coloquial.",
    ],
    vocab: [
      { es: "es importante que", pt: "é importante que" }, { es: "recomendamos que", pt: "recomendamos que" },
      { es: "es necesario que", pt: "é necessário que" }, { es: "verifique / documente", pt: "verifique / documente" },
      { es: "cuando termine (futuro)", pt: "quando terminar (futuro)" }, { es: "es posible que", pt: "é possível que" },
    ],
    quiz: [
      { question: "¿En cuáles situaciones principales aparece el subjuntivo en el lenguaje técnico?", options: ["Preguntas, órdenes y descripciones únicamente", "Recomendaciones y necesidades, dudas, y construcciones temporales futuras", "Solo en documentos formales escritos", "Solo en recomendaciones escritas de auditoría"], answer: "Recomendaciones y necesidades, dudas, y construcciones temporales futuras" },
      { question: "¿Cómo se forma el presente de subjuntivo de un verbo regular en -ar?", options: ["Con las mismas terminaciones del indicativo", "Desde la primera persona del indicativo eliminando la -o y añadiendo terminaciones de -er", "Con las terminaciones del imperativo directo", "Con el prefijo 'sub-' más el infinitivo del verbo"], answer: "Desde la primera persona del indicativo eliminando la -o y añadiendo terminaciones de -er" },
      { question: "¿Cuál es correcto en español técnico?", options: ["Es importante que verificas los controles cada día", "Es importante verificando los controles regularmente", "Es importante que verifiques los controles cada día", "Es importante verificar tú los controles directamente"], answer: "Es importante que verifiques los controles cada día" },
      { question: "¿Qué tipo de verbos desencadenan el subjuntivo en la subordinada?", options: ["Verbos de movimiento como ir y venir", "Verbos de influencia, deseo, emoción o duda como 'es necesario que' y 'recomendamos que'", "Verbos de percepción como ver y oír", "Solo la expresión 'es importante que'"], answer: "Verbos de influencia, deseo, emoción o duda como 'es necesario que' y 'recomendamos que'" },
      { question: "¿Cómo se conjuga 'tener' en presente de subjuntivo, primera persona?", options: ["tengo", "tenga", "tenes", "tiene"], answer: "tenga" },
      { question: "¿Cómo se conjuga 'hacer' en presente de subjuntivo, primera persona?", options: ["hago", "haga", "hace", "haiga"], answer: "haga" },
      { question: "¿Cómo se usa el subjuntivo en construcciones temporales futuras?", options: ["Con 'cuando' más presente de indicativo", "Con 'cuando' más presente de subjuntivo para acciones futuras", "Con 'cuando' más futuro simple de indicativo", "Con 'cuando' más infinitivo del verbo"], answer: "Con 'cuando' más presente de subjuntivo para acciones futuras" },
      { question: "¿Qué distingue al profesional que domina el subjuntivo técnico?", options: ["Que nunca comete errores gramaticales", "Que demuestra competencia lingüística técnica propia del español formal", "Que puede hablar más rápido en reuniones", "Que escribe documentos más largos y detallados"], answer: "Que demuestra competencia lingüística técnica propia del español formal" },
    ],
    dictation: "Es fundamental que el analista verifique los controles y es necesario que documente cada resultado antes de liberar los informes.",
  },
  {
    id: "conectores", title: "Conectores y cohesión", level: "Intermedio", category: "Gramática", emoji: "🔗",
    description: "Conectores para textos técnicos: informes, hallazgos y comunicaciones formales.",
    readingTitle: "El informe que fluía",
    reading: [
      "Un informe técnico de laboratorio es, ante todo, un texto que debe comunicar información compleja de forma clara, organizada y convincente. Para lograrlo, no basta con tener los datos correctos: también es necesario que esos datos estén conectados entre sí mediante una lógica explícita que el lector pueda seguir sin esfuerzo. Los conectores son las palabras y expresiones que hacen ese trabajo: guían al lector de una idea a la siguiente, señalan relaciones lógicas entre los datos y le indican cuándo se está agregando información, cuándo se está contrastando, cuándo se está explicando una causa o cuándo se está presentando una consecuencia.",
      "Los conectores de adición son los más simples y los más utilizados: sirven para agregar información nueva que refuerza o complementa lo anterior. Los principales son: además, también, asimismo, igualmente, del mismo modo, por otra parte (cuando introduce un elemento adicional, no un contraste), y en este sentido. Por ejemplo: 'El control de nivel bajo fue rechazado. Además, el control de nivel alto mostró una tendencia descendente en los últimos cinco días. Asimismo, el reagente utilizado correspondía a un lote diferente al del período anterior.' Cada conector indica que lo que sigue es una pieza adicional del mismo rompecabezas.",
      "Los conectores de contraste son fundamentales en los informes técnicos porque permiten presentar información que va en una dirección diferente o inesperada sin generar confusión en el lector. Los principales son: sin embargo, no obstante, aunque, a pesar de que, por el contrario, en cambio. Por ejemplo: 'Los resultados del control de nivel bajo fueron aceptables. Sin embargo, el control de nivel alto presentó valores fuera del rango de aceptación durante tres corridas consecutivas. A pesar de las acciones correctivas implementadas, la situación no mostró mejora en las primeras cuarenta y ocho horas.' El contraste señala que la realidad es más compleja que una tendencia simple.",
      "Los conectores de causa y consecuencia son esenciales para explicar por qué ocurrió algo y qué efectos tuvo. Los principales conectores causales son: porque, ya que, dado que, debido a que, puesto que. Los conectores de consecuencia son: por lo tanto, en consecuencia, como resultado, por ende, así que, de modo que. Por ejemplo: 'Dado que el switch de red falló durante el turno vespertino, los equipos analíticos no pudieron transferir los resultados al LIMS. Por lo tanto, el personal procedió a registrar manualmente todos los resultados en las planillas de contingencia. Como resultado, ningún resultado fue perdido, aunque la entrega de informes se retrasó aproximadamente dos horas.'",
      "El dominio de los conectores no solo mejora la calidad de los textos técnicos escritos: también mejora la claridad de la comunicación oral en reuniones, presentaciones y llamadas con clientes. Quien puede organizar su discurso con conectores explícitos transmite mayor claridad de pensamiento y genera más confianza en su interlocutor. Para los profesionales del laboratorio que trabajan en un contexto bilingüe español-portugués, muchos conectores tienen equivalentes directos entre ambas lenguas, lo que facilita el aprendizaje. Pero algunos tienen matices diferentes o usos más restringidos en uno u otro idioma, por lo que la práctica en contextos reales sigue siendo la mejor estrategia de aprendizaje.",
    ],
    vocab: [
      { es: "sin embargo / no obstante", pt: "no entanto / porém" }, { es: "además / asimismo", pt: "além disso / igualmente" },
      { es: "por lo tanto / en consecuencia", pt: "portanto / consequentemente" }, { es: "dado que / ya que", pt: "dado que / uma vez que" },
      { es: "aunque / a pesar de que", pt: "embora / apesar de que" }, { es: "por el contrario / en cambio", pt: "pelo contrário / em vez disso" },
    ],
    quiz: [
      { question: "¿Por qué son importantes los conectores en un texto técnico?", options: ["Para hacer el texto más largo y completo", "Porque guían al lector entre ideas y señalan las relaciones lógicas entre los datos", "Para complicar la lectura y demostrar conocimiento avanzado", "Solo por razones estéticas del texto"], answer: "Porque guían al lector entre ideas y señalan las relaciones lógicas entre los datos" },
      { question: "¿Qué tipo de relación expresa el conector 'por lo tanto'?", options: ["Adición de información nueva al argumento", "Contraste con lo expresado anteriormente", "Consecuencia lógica de lo que se dijo antes", "Causa de lo que se expresará después"], answer: "Consecuencia lógica de lo que se dijo antes" },
      { question: "¿Cuál de estos conectores expresa contraste?", options: ["Además", "Asimismo", "Sin embargo", "Dado que"], answer: "Sin embargo" },
      { question: "¿Qué conectores sirven para indicar causa?", options: ["Sin embargo, aunque, a pesar de que", "Porque, ya que, dado que, debido a que", "Además, también, asimismo, igualmente", "Por lo tanto, en consecuencia, así que"], answer: "Porque, ya que, dado que, debido a que" },
      { question: "¿Qué diferencia hay entre 'además' y 'sin embargo'?", options: ["Son sinónimos perfectos en español técnico", "'Además' añade en la misma dirección; 'sin embargo' introduce una idea contraria o inesperada", "'Sin embargo' es más formal que 'además' siempre", "Solo se diferencian en el nivel de registro usado"], answer: "'Además' añade en la misma dirección; 'sin embargo' introduce una idea contraria o inesperada" },
      { question: "¿Cuál es el conector adecuado para una consecuencia formal en un informe técnico?", options: ["Pero, como conector más simple", "En consecuencia, como conector más formal", "Y además, para agregar información", "O sea, para reformular"], answer: "En consecuencia, como conector más formal" },
      { question: "¿Los conectores mejoran solo la comunicación escrita?", options: ["Sí, exclusivamente para textos escritos", "No, también mejoran la claridad del discurso oral en reuniones y presentaciones", "Solo son útiles para correos electrónicos formales", "Solo son útiles en informes de auditoría"], answer: "No, también mejoran la claridad del discurso oral en reuniones y presentaciones" },
      { question: "¿Qué transmite quien organiza su discurso con conectores explícitos?", options: ["Que conoce muchas palabras en español técnico", "Mayor claridad de pensamiento y más confianza en el interlocutor", "Que estudió gramática avanzada en la universidad", "Que habla más lento de lo necesario en las reuniones"], answer: "Mayor claridad de pensamiento y más confianza en el interlocutor" },
    ],
    dictation: "El control presentó una desviación; sin embargo, el equipo actuó rápidamente y, por lo tanto, no fue necesario rechazar la corrida analítica.",
  },
  {
    id: "vocabulario-general", title: "Vocabulario del trabajo", level: "Básico", category: "Gramática", emoji: "📖",
    description: "Vocabulario esencial para el entorno profesional y los falsos cognados más frecuentes.",
    readingTitle: "Las palabras que parecen iguales pero no lo son",
    reading: [
      "Aprender el vocabulario del español técnico del laboratorio no significa solo memorizar los términos científicos equivalentes al portugués. También implica dominar el vocabulario del entorno laboral cotidiano: las palabras que se usan en reuniones, correos, llamadas telefónicas, conversaciones de pasillo y documentos internos. Muchas de esas palabras son fáciles porque son iguales o muy similares en ambos idiomas. Pero otras son engañosas precisamente por esa similitud: se llaman 'falsos cognados' o 'falsos amigos', y son una de las fuentes más frecuentes de malentendidos humorísticos o embarazosos entre hablantes de español y portugués.",
      "Los falsos cognados son palabras que se parecen en la forma escrita o sonora, pero tienen significados diferentes o parcialmente diferentes en cada idioma. Algunos ejemplos muy frecuentes en el contexto laboral: 'embarazada' en español significa 'pregnant' (embaraçada en portugués significa 'avergonzada', y a la inversa, 'grávida' en portugués significa 'embarazada' en español). 'Borracha' en portugués es 'goma de borrar' o 'caucho', mientras que en español es una mujer que está ebria por el alcohol. 'Salada' en portugués significa 'ensalada', pero en español también puede significar 'con mucha sal'. 'Exquisito' en español significa algo de calidad extraordinaria o muy refinado; en portugués 'esquisito' significa 'extraño' o 'raro'.",
      "En el contexto técnico del laboratorio, también existen falsos cognados que pueden generar confusión. 'Comprometido' en español puede significar 'involucrado' o 'afectado' (la muestra está comprometida por la hemólisis), pero también 'prometido en matrimonio', lo que puede generar confusión si un colega portugués espera que signifique solo lo primero. 'Polvo' en español significa 'polvillo' o 'partícula fina' (pó en portugués), pero 'polvo' en portugués es una palabra vulgar que debe evitarse absolutamente en contextos formales. 'Constipado' en español significa 'resfriado' (resfriado/gripado en portugués), mientras que en portugués 'constipado' significa 'con problemas de estreñimiento'.",
      "Más allá de los falsos cognados, el vocabulario del entorno laboral en español incluye muchas expresiones y frases hechas que no tienen traducción literal directa y que deben aprenderse como unidades. 'Estar al tanto' significa estar informado de algo. 'Ponerse al día' significa actualizarse sobre lo que ha ocurrido. 'Dar de alta' a un paciente significa darlo de alta del hospital. 'Dar de baja' a un reactivo significa retirarlo del uso activo. 'Sacar turno' significa pedir un turno médico. 'Dar el visto bueno' significa dar la aprobación final a algo. Estas expresiones aparecen constantemente en la comunicación profesional y su comprensión es fundamental para participar plenamente en las conversaciones del equipo.",
      "La mejor estrategia para ampliar el vocabulario en un contexto real como el del laboratorio es practicar activamente en situaciones concretas, no solo estudiar listas de palabras en abstracto. Leer los procedimientos operativos estándar del laboratorio en español, participar en las reuniones de equipo aunque sea de forma pasiva al principio, escuchar y repetir mentalmente cómo los colegas más experimentados describen los procesos, y usar conscientemente las palabras nuevas en conversaciones reales son las actividades que más rápidamente consolidan el vocabulario activo. El error forma parte del proceso: cometer un error de vocabulario delante de un colega comprensivo y corregirlo en el momento es una de las formas más efectivas de no volver a cometerlo.",
    ],
    vocab: [
      { es: "reunión", pt: "reunião" }, { es: "correo electrónico", pt: "e-mail" },
      { es: "embarazada (= grávida)", pt: "grávida (embaraçada = avergonzada)" },
      { es: "constipado (= resfriado)", pt: "resfriado (constipado = estreñimiento)" },
      { es: "dar el visto bueno", pt: "dar o sinal verde / aprovar" },
      { es: "estar al tanto", pt: "estar a par / estar informado" },
    ],
    quiz: [
      { question: "¿Qué son los falsos cognados o falsos amigos?", options: ["Palabras idénticas en español y portugués", "Palabras que se parecen en forma pero tienen significados diferentes en cada idioma", "Sinónimos técnicos entre los dos idiomas", "Palabras que solo existen en un idioma pero no en el otro"], answer: "Palabras que se parecen en forma pero tienen significados diferentes en cada idioma" },
      { question: "¿Qué significa 'embarazada' en español?", options: ["Avergonzada por algo", "Con náuseas", "Grávida, con un bebé en el vientre", "Muy cansada y agotada"], answer: "Grávida, con un bebé en el vientre" },
      { question: "¿Qué significa 'constipado' en español?", options: ["Con estreñimiento o problema intestinal", "Resfriado, con síntomas de gripe común", "Muy cansado y sin energía", "Con dolor de cabeza intenso"], answer: "Resfriado, con síntomas de gripe común" },
      { question: "¿Qué significa 'exquisito' en español?", options: ["Extraño o raro, poco común", "De calidad extraordinaria o muy refinado y elegante", "Difícil de entender o comprender", "Demasiado elaborado para ser práctico"], answer: "De calidad extraordinaria o muy refinado y elegante" },
      { question: "¿Qué significa la expresión 'dar el visto bueno'?", options: ["Ver algo por primera vez con agrado", "Dar la aprobación final a algo", "Mirar con buenos ojos a una persona específica", "Confirmar que algo fue recibido correctamente"], answer: "Dar la aprobación final a algo" },
      { question: "¿Qué significa 'estar al tanto' en el contexto laboral?", options: ["Estar esperando hace mucho tiempo", "Estar informado de algo relevante", "Estar de acuerdo con alguna decisión", "Estar muy atento durante la reunión"], answer: "Estar informado de algo relevante" },
      { question: "¿Qué significa 'ponerse al día' en el contexto laboral?", options: ["Trabajar durante todo el día sin descanso", "Actualizarse sobre lo que ha ocurrido en el trabajo", "Llegar temprano al laboratorio siempre", "Completar todas las tareas pendientes del período"], answer: "Actualizarse sobre lo que ha ocurrido en el trabajo" },
      { question: "¿Cuál es la mejor estrategia para consolidar el vocabulario activo en español técnico?", options: ["Memorizar listas de palabras en abstracto", "Practicar activamente en situaciones laborales reales y usar conscientemente las palabras nuevas", "Solo leer libros de gramática española avanzada", "Ver películas en español sin subtítulos como única actividad"], answer: "Practicar activamente en situaciones laborales reales y usar conscientemente las palabras nuevas" },
    ],
    dictation: "Los falsos cognados son palabras parecidas en español y portugués con significados diferentes, y son una fuente frecuente de malentendidos profesionales.",
  },

  // ══════════════════════════════════════════
  // LABORATORIO NUEVO
  // ══════════════════════════════════════════
  {
    id: "coagulacion", title: "Coagulación y hemostasia", level: "Avanzado", category: "Laboratorio", emoji: "🩹",
    description: "Estudios de coagulación, hemostasia primaria y secundaria en el laboratorio.",
    readingTitle: "Cuando la sangre no se detiene",
    reading: [
      "La hemostasia es el conjunto de mecanismos que el organismo activa para detener un sangrado cuando se produce una lesión vascular. Este proceso se divide en dos grandes fases: la hemostasia primaria, que involucra a las plaquetas y forma un tapón provisional en el sitio de la lesión, y la hemostasia secundaria o coagulación, que consolida ese tapón mediante una red de fibrina formada a través de una cascada enzimática compleja.",
      "El laboratorio de coagulación evalúa este sistema mediante pruebas específicas. El tiempo de protrombina (TP) y su expresión estandarizada como INR evalúan la vía extrínseca de la coagulación, utilizada principalmente para monitorear el tratamiento con anticoagulantes orales como warfarina o acenocumarol. El KPTT o tiempo de tromboplastina parcial activado evalúa la vía intrínseca, y es fundamental para monitorear el tratamiento con heparina y para el diagnóstico de deficiencias de factores como el VIII, IX o XII.",
      "Una de las particularidades del laboratorio de coagulación es que los resultados son especialmente sensibles a los factores preanalíticos. La proporción correcta entre la sangre y el anticoagulante citrato presente en el tubo azul es crítica: si el tubo no está completamente llenado hasta la marca indicada, la relación sangre-citrato se altera y el resultado puede ser falsamente prolongado. Asimismo, una muestra hemolizada, con coágulos o con temperatura de conservación inadecuada puede generar resultados completamente erróneos.",
      "El dímero D es otro marcador que el laboratorio de coagulación determina con frecuencia. Este producto de degradación de la fibrina se eleva cuando hay formación y lisis de coágulos en el organismo, y se utiliza principalmente para descartar tromboembolismo venoso, incluyendo trombosis venosa profunda y embolismo pulmonar. Sin embargo, el dímero D tiene alta sensibilidad pero baja especificidad: se eleva en muchas situaciones como inflamación, embarazo o postoperatorio, por lo que un resultado positivo requiere confirmación con estudios de imagen.",
      "La comunicación de resultados críticos de coagulación es una responsabilidad de primer orden. Un TP o KPTT extremadamente prolongados pueden indicar riesgo inminente de sangrado severo. Un INR muy elevado en un paciente anticoagulado puede requerir intervención médica urgente. El laboratorio debe tener establecidos los valores de pánico para cada prueba de coagulación y el procedimiento para comunicarlos al médico de forma inmediata, documentada y verificada.",
    ],
    vocab: [
      { es: "coagulación", pt: "coagulação" }, { es: "hemostasia", pt: "hemostasia" },
      { es: "tiempo de protrombina", pt: "tempo de protrombina" }, { es: "anticoagulante", pt: "anticoagulante" },
      { es: "dímero D", pt: "dímero D" }, { es: "trombosis", pt: "trombose" },
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
    ],
    dictation: "El tiempo de protrombina evalúa la vía extrínseca de la coagulación y se expresa como INR para monitorear el tratamiento anticoagulante oral.",
  },
  {
    id: "inmunologia", title: "Inmunología y serología", level: "Intermedio", category: "Laboratorio", emoji: "🛡️",
    description: "Anticuerpos, marcadores inflamatorios y pruebas serológicas en el laboratorio.",
    readingTitle: "El sistema de defensa bajo la lupa",
    reading: [
      "La inmunología clínica es el área del laboratorio que estudia la respuesta inmune del organismo: cómo produce anticuerpos frente a agentes infecciosos, cómo se autodefiende, y en ocasiones, cómo esa defensa se vuelve contra el propio organismo en las enfermedades autoinmunes. Las pruebas serológicas permiten detectar anticuerpos específicos contra virus, bacterias u otros antígenos, y son fundamentales para el diagnóstico de infecciones pasadas o presentes.",
      "Entre las pruebas serológicas más solicitadas se encuentran las de detección de anticuerpos contra el virus de la inmunodeficiencia humana (VIH), la hepatitis B y C, Toxoplasma gondii, Treponema pallidum (sífilis) y numerosos virus respiratorios. En muchos casos, la interpretación requiere distinguir entre anticuerpos IgM, que indican infección reciente o activa, e IgG, que pueden indicar infección pasada, vacunación o inmunidad adquirida.",
      "Los marcadores inflamatorios son otro grupo importante dentro de la inmunología clínica. La proteína C reactiva (PCR) es el marcador de fase aguda más utilizado y se eleva rápidamente en respuesta a infecciones bacterianas, inflamación tisular y algunos procesos oncológicos. La eritrosedimentación (ESD o VSG) es un marcador más inespecífico que puede elevarse en infecciones, enfermedades inflamatorias crónicas y anemia. El factor reumatoide y los anticuerpos antinucleares (ANA) son importantes en el diagnóstico de enfermedades reumatológicas.",
      "La zona de prozona es un fenómeno que puede causar resultados falsamente negativos en pruebas serológicas cuando la concentración de anticuerpos en la muestra es extremadamente alta. En esa situación, el exceso de anticuerpos satura todos los sitios de unión del antígeno y no se produce la reacción visible que indica un resultado positivo. Para detectar este fenómeno, se realizan diluciones seriadas de la muestra. Es un ejemplo de cómo un resultado negativo no siempre significa ausencia de enfermedad.",
      "La interpretación de los resultados serológicos requiere siempre el contexto clínico del paciente. Un resultado positivo para anticuerpos IgG contra toxoplasma en una mujer embarazada tiene un significado completamente diferente del mismo resultado en un adulto sano no embarazado. La comunicación eficaz entre el laboratorio y el médico es especialmente crítica en inmunología, donde los resultados a menudo requieren correlación con la historia clínica, el cuadro clínico actual y otros estudios complementarios.",
    ],
    vocab: [
      { es: "anticuerpo", pt: "anticorpo" }, { es: "antígeno", pt: "antígeno" },
      { es: "serología", pt: "sorologia" }, { es: "proteína C reactiva", pt: "proteína C reativa" },
      { es: "inmunoglobulina IgM / IgG", pt: "imunoglobulina IgM / IgG" }, { es: "autoinmune", pt: "autoimune" },
    ],
    quiz: [
      { question: "¿Qué indica la presencia de anticuerpos IgM?", options: ["Infección pasada o vacunación", "Infección reciente o activa", "Inmunidad permanente", "Ausencia de respuesta inmune"], answer: "Infección reciente o activa" },
      { question: "¿Qué evalúa la proteína C reactiva (PCR)?", options: ["La función renal", "La presencia de inflamación o infección aguda", "La cantidad de glóbulos rojos", "El nivel de glucosa"], answer: "La presencia de inflamación o infección aguda" },
      { question: "¿Qué es la zona de prozona?", options: ["Un área del laboratorio", "Un fenómeno donde exceso de anticuerpos genera resultado falsamente negativo", "Una región geográfica de estudio", "El rango normal de anticuerpos"], answer: "Un fenómeno donde exceso de anticuerpos genera resultado falsamente negativo" },
      { question: "¿Cómo se detecta el fenómeno de prozona?", options: ["Repitiendo el análisis igual", "Realizando diluciones seriadas de la muestra", "Usando un equipo diferente", "Cambiando el reactivo de lote"], answer: "Realizando diluciones seriadas de la muestra" },
      { question: "¿Qué son los anticuerpos ANA?", options: ["Anticuerpos contra bacterias", "Anticuerpos antinucleares usados en diagnóstico reumatológico", "Anticuerpos contra virus", "Anticuerpos de defensa normal"], answer: "Anticuerpos antinucleares usados en diagnóstico reumatológico" },
      { question: "¿Por qué importa el contexto clínico en serología?", options: ["No importa, los resultados son absolutos", "El mismo resultado puede tener significado completamente diferente según el paciente", "Solo importa en enfermedades raras", "Solo importa para el facturador"], answer: "El mismo resultado puede tener significado completamente diferente según el paciente" },
      { question: "¿Qué diferencia hay entre IgM e IgG en una serología?", options: ["IgG es más moderna que IgM", "IgM indica infección activa/reciente; IgG indica exposición pasada o inmunidad", "IgM solo aparece en niños", "No hay diferencia clínica"], answer: "IgM indica infección activa/reciente; IgG indica exposición pasada o inmunidad" },
      { question: "¿Qué marcadores son importantes en enfermedades reumatológicas?", options: ["Glucosa y creatinina", "Factor reumatoide y anticuerpos antinucleares ANA", "Hemoglobina y hematocrito", "TGO y TGP únicamente"], answer: "Factor reumatoide y anticuerpos antinucleares ANA" },
    ],
    dictation: "En serología, la presencia de IgM indica infección reciente o activa, mientras que la IgG puede indicar infección pasada o inmunidad adquirida.",
  },
  {
    id: "orina", title: "Análisis de orina", level: "Básico", category: "Laboratorio", emoji: "🔬",
    description: "Uroanálisis completo: físico, químico y sedimento urinario.",
    readingTitle: "Lo que la orina puede revelar",
    reading: [
      "El análisis de orina o uroanálisis es uno de los estudios más solicitados en el laboratorio clínico y, a pesar de su aparente simplicidad, aporta una enorme cantidad de información sobre la función renal, el estado metabólico del organismo y la presencia de infecciones o inflamaciones del tracto urinario. Se compone de tres partes fundamentales: el examen físico, el examen químico y el examen microscópico del sedimento.",
      "El examen físico evalúa el color, que puede variar del amarillo pálido al oscuro según el nivel de hidratación; la transparencia, que normalmente debe ser clara y puede volverse turbia por presencia de leucocitos, bacterias, moco o cristales; y la densidad o gravedad específica, que refleja la capacidad del riñón para concentrar la orina y puede estar disminuida en insuficiencia renal o diabetes insípida.",
      "El examen químico mediante tira reactiva detecta una gran variedad de parámetros: glucosuria (glucosa en orina, que en condiciones normales no debería estar presente), proteinuria (proteínas, cuya presencia puede indicar daño renal o proteinuria de esfuerzo), hematuria (sangre, que puede ser macroscópica o solo detectable por la tira), cetonuria (cuerpos cetónicos, elevados en diabetes descompensada o ayuno prolongado), leucocituria (leucocitos, indicativa de infección o inflamación) y nitritos (producidos por bacterias, altamente específicos de infección urinaria).",
      "El sedimento urinario es el componente más informativo y complejo del uroanálisis. Se obtiene por centrifugación de la muestra y se examina al microscopio. Los elementos que pueden observarse incluyen: glóbulos rojos (cuya morfología puede indicar si son de origen glomerular o de las vías bajas), glóbulos blancos, células epiteliales, cilindros de diferentes tipos (hialinos, granulosos, eritrocitarios, leucocitarios, granulares), bacterias, levaduras y cristales de diversas composiciones.",
      "La correcta recolección de la muestra es fundamental para obtener un sedimento confiable. La muestra debe ser de la primera orina de la mañana, recolectada en la mitad del chorro (muestra de chorro medio) en un recipiente estéril, y procesada dentro de los primeros noventa minutos de recolección. Una muestra contaminada o procesada tardíamente puede tener sedimento completamente diferente al real, generando errores diagnósticos importantes. El laboratorio debe informar al paciente las instrucciones de recolección con claridad.",
    ],
    vocab: [
      { es: "uroanálisis", pt: "urinálise" }, { es: "sedimento urinario", pt: "sedimento urinário" },
      { es: "proteinuria", pt: "proteinúria" }, { es: "hematuria", pt: "hematúria" },
      { es: "cilindro", pt: "cilindro" }, { es: "leucocituria", pt: "leucocitúria" },
    ],
    quiz: [
      { question: "¿Cuáles son las tres partes del uroanálisis?", options: ["Color, densidad y pH", "Examen físico, químico y microscópico del sedimento", "Glucosa, proteínas y nitritos", "Peso, volumen y temperatura"], answer: "Examen físico, químico y microscópico del sedimento" },
      { question: "¿Qué indica la presencia de nitritos en la tira reactiva?", options: ["Inflamación renal crónica", "Infección bacteriana del tracto urinario", "Diabetes mellitus", "Deshidratación severa"], answer: "Infección bacteriana del tracto urinario" },
      { question: "¿Qué indica la glucosuria en condiciones normales?", options: ["Es normal en todas las personas", "No debería estar presente: puede indicar diabetes u otras condiciones", "Solo indica buena hidratación", "Es normal después de comer"], answer: "No debería estar presente: puede indicar diabetes u otras condiciones" },
      { question: "¿Cómo se obtiene el sedimento urinario?", options: ["Filtrando la orina con papel", "Por centrifugación de la muestra y observación al microscopio", "Añadiendo reactivos químicos", "Dejando reposar la orina 24 horas"], answer: "Por centrifugación de la muestra y observación al microscopio" },
      { question: "¿Cuál es la muestra ideal para el uroanálisis?", options: ["Cualquier muestra del día", "Primera orina de la mañana, chorro medio, recipiente estéril", "Muestra de 24 horas completas", "Solo la última orina del día"], answer: "Primera orina de la mañana, chorro medio, recipiente estéril" },
      { question: "¿En cuánto tiempo debe procesarse la muestra de orina?", options: ["Puede esperar hasta el día siguiente", "Dentro de los primeros noventa minutos de recolección", "En 6 horas como máximo", "No importa el tiempo si está refrigerada"], answer: "Dentro de los primeros noventa minutos de recolección" },
      { question: "¿Qué indica la presencia de cilindros eritrocitarios en el sedimento?", options: ["Infección bacteriana", "Daño glomerular con hematuria de origen renal", "Deshidratación normal", "Solo contaminación de la muestra"], answer: "Daño glomerular con hematuria de origen renal" },
      { question: "¿Qué puede causar un sedimento falso o alterado?", options: ["Usar recipiente de plástico", "Muestra contaminada o procesada tardíamente", "Primer orina del día", "Muestra de chorro medio"], answer: "Muestra contaminada o procesada tardíamente" },
    ],
    dictation: "El uroanálisis incluye examen físico, químico y microscópico del sedimento, y la muestra debe procesarse dentro de los noventa minutos de recolección.",
  },

  // ══════════════════════════════════════════
  // GRAMÁTICA NUEVA
  // ══════════════════════════════════════════
  {
    id: "imperativo", title: "Imperativo y órdenes", level: "Básico", category: "Gramática", emoji: "📢",
    description: "Cómo dar instrucciones, órdenes y recomendaciones en español técnico.",
    readingTitle: "Las palabras que mueven a la acción",
    reading: [
      "El imperativo es el modo verbal que se usa para dar órdenes, instrucciones, recomendaciones o pedidos directos. En el contexto del laboratorio, es el tiempo más utilizado en los procedimientos operativos estándar, en las instrucciones de equipos y en las indicaciones al personal: 'centrifugue la muestra durante diez minutos', 'verifique el nivel de reactivo antes de iniciar la corrida', 'documente el resultado inmediatamente después de validar'.",
      "En español existen formas diferentes de imperativo según el pronombre de tratamiento que se use. El imperativo de 'tú' (segunda persona informal) se forma generalmente igual que la tercera persona del presente de indicativo: verifica, centrifuga, registra. El imperativo de 'usted' (segunda persona formal) utiliza la misma forma que el presente de subjuntivo: verifique, centrifugue, registre. En Argentina y otros países del Río de la Plata, el 'vos' tiene sus propias formas del imperativo: verificá, centrifugá, registrá.",
      "Para los hablantes de portugués, una diferencia importante es que el imperativo afirmativo del español puede usarse de forma más directa que en portugués sin que resulte descortés, especialmente en procedimientos escritos. En los manuales técnicos y procedimientos operativos, el imperativo impersonal con 'usted' ('verifique', 'registre', 'comunique') es el estándar profesional en la mayoría de los países hispanohablantes.",
      "El imperativo negativo, usado para prohibiciones o advertencias, funciona de forma diferente al afirmativo. Para todas las personas, el imperativo negativo usa la forma del presente de subjuntivo: 'no mezcle los reactivos sin verificar la compatibilidad', 'no libere el resultado sin revisión del supervisor', 'no descarte la muestra hasta confirmar que el análisis fue completado correctamente'. Esta forma es fundamental en las instrucciones de seguridad del laboratorio.",
      "Suavizar una orden directa es una habilidad comunicativa importante, especialmente en contextos jerárquicos o con clientes. Para una orden más amable, se pueden usar fórmulas como 'por favor, verifique...', 'le pido que revise...', 'sería importante que registre...'. Estas construcciones combinan el imperativo o el subjuntivo con marcadores de cortesía que reducen la impresión de mandato directo y resultan más apropiadas en situaciones de atención al cliente o comunicación entre pares.",
    ],
    vocab: [
      { es: "verifique / verificá", pt: "verifique" }, { es: "registre / registrá", pt: "registre" },
      { es: "centrifugue", pt: "centrifugue" }, { es: "no descarte", pt: "não descarte" },
      { es: "por favor, revise", pt: "por favor, revise" }, { es: "documente inmediatamente", pt: "documente imediatamente" },
    ],
    quiz: [
      { question: "¿Para qué se usa el imperativo en el laboratorio?", options: ["Solo para preguntas", "Para dar instrucciones, órdenes y recomendaciones directas", "Solo para el pasado", "Solo para descripciones"], answer: "Para dar instrucciones, órdenes y recomendaciones directas" },
      { question: "¿Cuál es el imperativo de 'usted' para el verbo 'verificar'?", options: ["verifica", "verificás", "verifique", "verificar"], answer: "verifique" },
      { question: "¿Cuál es el imperativo de 'vos' para el verbo 'registrar'?", options: ["registra", "registrá", "registre", "registro"], answer: "registrá" },
      { question: "¿Cómo se forma el imperativo negativo en español?", options: ["Con 'no' más el infinitivo", "Con 'no' más el presente de subjuntivo", "Con 'no' más el imperativo afirmativo", "Con 'no' más el presente de indicativo"], answer: "Con 'no' más el presente de subjuntivo" },
      { question: "¿Cuál es correcto como imperativo negativo formal?", options: ["No verificar el resultado", "No verifica el resultado", "No verifique el resultado sin revisión", "No verificando el resultado"], answer: "No verifique el resultado sin revisión" },
      { question: "¿Cómo se puede suavizar una orden directa?", options: ["Usando solo el infinitivo", "Con fórmulas de cortesía como 'por favor, verifique' o 'le pido que revise'", "Usando solo el subjuntivo impersonal", "No es posible suavizar órdenes en español"], answer: "Con fórmulas de cortesía como 'por favor, verifique' o 'le pido que revise'" },
      { question: "¿En qué persona se usa el imperativo en los procedimientos operativos?", options: ["Primera persona singular", "Imperativo de 'usted' como estándar profesional", "Solo en segunda persona informal", "Solo en plural"], answer: "Imperativo de 'usted' como estándar profesional" },
      { question: "¿Qué diferencia al imperativo del 'tú' del de 'usted'?", options: ["No hay diferencia", "El 'tú' usa tercera persona del indicativo; el 'usted' usa el presente de subjuntivo", "El 'tú' siempre lleva tilde; el 'usted' no", "El 'usted' es más corto siempre"], answer: "El 'tú' usa tercera persona del indicativo; el 'usted' usa el presente de subjuntivo" },
    ],
    dictation: "Verifique el nivel del reactivo, centrifugue la muestra durante diez minutos y no libere el resultado sin la revisión del supervisor.",
  },
  {
    id: "condicional", title: "Condicional y hipótesis", level: "Intermedio", category: "Gramática", emoji: "💭",
    description: "El condicional para hipótesis, recomendaciones y situaciones técnicas.",
    readingTitle: "Lo que haría si ocurriera",
    reading: [
      "El condicional simple es el tiempo verbal que se usa para expresar acciones que ocurrirían bajo ciertas condiciones o en situaciones hipotéticas. Se forma añadiendo al infinitivo del verbo las terminaciones -ía, -ías, -ía, -íamos, -íais, -ían. Por ejemplo: verificaría, procesaría, comunicaría. En el contexto técnico del laboratorio, el condicional aparece frecuentemente en protocolos de contingencia, análisis de riesgos y recomendaciones técnicas.",
      "Una de las funciones más importantes del condicional en el lenguaje técnico es expresar recomendaciones de forma cortés y menos impositiva que el imperativo. 'Sería conveniente actualizar el procedimiento antes de la próxima auditoría' es más diplomático que 'actualice el procedimiento'. 'Convendría revisar los controles del turno anterior' sugiere una acción sin imponer. 'Debería documentarse cada desviación al momento de detectarla' expresa obligación de forma más suave que el imperativo directo.",
      "El condicional también se usa para describir qué ocurriría en situaciones hipotéticas que se usan en la planificación de contingencias. 'Si el servidor fallara, el personal registraría los resultados manualmente.' 'Si se detectara una contaminación cruzada, se suspendería la corrida y se investigaría la causa.' Estas construcciones condicionales (si + imperfecto de subjuntivo + condicional simple) son fundamentales en los planes de contingencia y en el análisis de escenarios de riesgo.",
      "Para los hablantes de portugués, el condicional simple del español (hablaría, haría, tendría) corresponde al futuro do pretérito del portugués (falaria, faria, teria). La correspondencia es bastante directa en la mayoría de los casos, lo que facilita el aprendizaje. Sin embargo, en el habla coloquial del español rioplatense es frecuente sustituir el condicional por el imperfecto de indicativo ('si venía, te avisaba' en lugar de 'si viniera, te avisaría'), un uso que se acepta en contextos informales pero que no es apropiado en comunicaciones técnicas escritas formales.",
      "En los informes de auditoría y en las comunicaciones de calidad, el condicional se usa también para expresar lo que debería hacerse o lo que hubiera sido preferible hacer. 'El resultado debería haber sido retenido hasta la revisión' o 'hubiera sido apropiado consultar al supervisor antes de liberar' son fórmulas que el auditor usa para señalar una desviación sin acusar directamente. Dominar el condicional en español abre la posibilidad de comunicarse con mayor matiz y precisión en contextos profesionales formales.",
    ],
    vocab: [
      { es: "sería conveniente", pt: "seria conveniente" }, { es: "convendría", pt: "conviria" },
      { es: "debería documentarse", pt: "deveria ser documentado" }, { es: "si fallara... procesaría", pt: "se falhasse... processaria" },
      { es: "hubiera sido apropiado", pt: "teria sido apropriado" }, { es: "en ese caso", pt: "nesse caso" },
    ],
    quiz: [
      { question: "¿Cómo se forma el condicional simple?", options: ["Con el auxiliar 'haber' más participio", "Añadiendo -ía, -ías, -ía, -íamos, -íais, -ían al infinitivo", "Con el auxiliar 'ser' más participio", "Igual que el futuro pero con tilde"], answer: "Añadiendo -ía, -ías, -ía, -íamos, -íais, -ían al infinitivo" },
      { question: "¿Para qué se usa el condicional en textos técnicos?", options: ["Solo para el pasado", "Hipótesis, recomendaciones corteses y situaciones condicionales", "Solo para preguntas formales", "Solo para el futuro cercano"], answer: "Hipótesis, recomendaciones corteses y situaciones condicionales" },
      { question: "¿Cuál de estas frases usa el condicional de forma cortés?", options: ["Actualice el procedimiento ahora", "Sería conveniente actualizar el procedimiento", "Actualiza el procedimiento hoy", "El procedimiento se actualiza"], answer: "Sería conveniente actualizar el procedimiento" },
      { question: "¿Qué estructura se usa para situaciones hipotéticas de contingencia?", options: ["Si + presente + futuro", "Si + imperfecto de subjuntivo + condicional simple", "Si + infinitivo + condicional", "Si + presente + condicional"], answer: "Si + imperfecto de subjuntivo + condicional simple" },
      { question: "¿Cuál es el equivalente del condicional español en portugués?", options: ["Futuro do presente", "Futuro do pretérito", "Pretérito imperfeito", "Pretérito perfeito composto"], answer: "Futuro do pretérito" },
      { question: "¿Cómo se expresa 'debería' para una obligación suave?", options: ["Tenés que", "Debería + infinitivo", "Hay que + infinitivo solamente", "Tiene que + infinitivo en todos los casos"], answer: "Debería + infinitivo" },
      { question: "¿Es apropiado en español formal escrito usar el imperfecto en lugar del condicional?", options: ["Sí, siempre es correcto", "No, en comunicaciones técnicas escritas formales se prefiere el condicional", "Solo en informes de auditoría", "Solo si lo usa el director técnico"], answer: "No, en comunicaciones técnicas escritas formales se prefiere el condicional" },
      { question: "¿Cómo señala el auditor una desviación usando el condicional?", options: ["Diciendo que el analista se equivocó", "Con frases como 'hubiera sido apropiado' o 'debería haberse consultado'", "Solo con el imperativo negativo", "Con preguntas directas al personal"], answer: "Con frases como 'hubiera sido apropiado' o 'debería haberse consultado'" },
    ],
    dictation: "Sería conveniente actualizar el procedimiento antes de la auditoría y convendría documentar cada desviación al momento de detectarla.",
  },
  {
    id: "voz-pasiva", title: "Voz pasiva y construcciones impersonales", level: "Avanzado", category: "Gramática", emoji: "🔀",
    description: "La voz pasiva y el se impersonal en documentos y comunicaciones técnicas.",
    readingTitle: "Cuando el sujeto queda en segundo plano",
    reading: [
      "La voz pasiva es una construcción gramatical en la que el objeto de la acción se convierte en el sujeto gramatical de la oración. En lugar de 'el analista validó el resultado' (voz activa), se dice 'el resultado fue validado por el analista' (voz pasiva). Esta construcción es muy frecuente en el lenguaje técnico y científico porque permite enfocarse en el proceso o el objeto, más que en el agente que lo ejecuta.",
      "En español existen dos tipos de pasiva. La pasiva con 'ser' (pasiva perifrástica) usa el verbo ser más el participio del verbo principal: 'la muestra fue procesada', 'el resultado fue comunicado', 'el procedimiento fue actualizado'. El participio concuerda en género y número con el sujeto. La pasiva con 'se' (pasiva refleja o se impersonal) es mucho más frecuente en el español actual y se usa sin mencionar al agente: 'se procesaron las muestras', 'se comunicó el resultado', 'se actualizó el procedimiento'.",
      "Para los hablantes de portugués, la pasiva con 'se' en español tiene un comportamiento diferente al del portugués. En portugués, 'se processaram as amostras' concuerda con el sujeto gramatical (amostras, plural). En español, lo mismo ocurre en la norma estándar: 'se procesaron las muestras'. Sin embargo, en el habla coloquial y a veces en escritura informal, es frecuente encontrar la construcción sin concordancia: 'se procesó las muestras', que es considerada incorrecta en español estándar aunque muy extendida.",
      "El se impersonal es otra construcción muy utilizada en los procedimientos y documentos técnicos del laboratorio. Se forma con 'se' más el verbo en tercera persona singular: 'se debe verificar', 'se recomienda documentar', 'se prohíbe el acceso sin autorización'. Esta construcción tiene la ventaja de que no especifica quién debe realizar la acción, lo cual es apropiado en procedimientos que aplican a cualquier persona que realice el proceso.",
      "En los informes de no conformidades y las acciones correctivas, la voz pasiva y el se impersonal son herramientas comunicativas importantes porque permiten describir lo que ocurrió sin señalar directamente a una persona como responsable de un error. 'Se omitió el registro de recepción' es menos acusatorio que 'el analista omitió el registro'. Esta objetividad del lenguaje técnico no implica que las responsabilidades no sean claras internamente: es simplemente una forma de comunicar que pone el foco en el proceso y no en la persona.",
    ],
    vocab: [
      { es: "fue validado / fue procesado", pt: "foi validado / foi processado" }, { es: "se procesaron las muestras", pt: "as amostras foram processadas" },
      { es: "se recomienda documentar", pt: "recomenda-se documentar" }, { es: "se debe verificar", pt: "deve-se verificar" },
      { es: "se omitió el registro", pt: "o registro foi omitido" }, { es: "fue comunicado por el analista", pt: "foi comunicado pelo analista" },
    ],
    quiz: [
      { question: "¿Qué es la voz pasiva?", options: ["Una forma de hablar más lento", "Construcción donde el objeto se convierte en sujeto gramatical", "Una forma de evitar el subjuntivo", "El uso de verbos en pasado únicamente"], answer: "Construcción donde el objeto se convierte en sujeto gramatical" },
      { question: "¿Cuáles son los dos tipos de pasiva en español?", options: ["Pasiva formal e informal", "Pasiva con 'ser' y pasiva con 'se'", "Pasiva presente y pasiva pasada", "Pasiva activa y pasiva reflexiva"], answer: "Pasiva con 'ser' y pasiva con 'se'" },
      { question: "¿Cuál es la pasiva con 'se' de 'procesaron las muestras'?", options: ["Se procesó las muestras", "Se procesaron las muestras", "Las muestras se procesa", "Las muestras se procesaba"], answer: "Se procesaron las muestras" },
      { question: "¿Qué es el se impersonal?", options: ["Una forma de hablar sin sujeto definido usando 'se' más tercera persona singular", "El uso de 'se' reflexivo como en 'se lava'", "Una forma de plural exclusiva", "Solo se usa en publicaciones científicas"], answer: "Una forma de hablar sin sujeto definido usando 'se' más tercera persona singular" },
      { question: "¿Por qué se usa la voz pasiva en informes técnicos?", options: ["Para hacer el texto más largo", "Enfoca en el proceso sin señalar directamente a una persona", "Es obligatorio por norma", "Para evitar el imperativo"], answer: "Enfoca en el proceso sin señalar directamente a una persona" },
      { question: "¿Cuál es la forma correcta en español estándar?", options: ["Se procesó las muestras", "Se procesaron las muestras", "Se procesa las muestras siempre", "Muestras se procesaron"], answer: "Se procesaron las muestras" },
      { question: "¿Cuál de estas usa el se impersonal correctamente?", options: ["Se debo verificar", "Se debe verificar la calibración antes de iniciar", "Se deben verificar yo", "Verificar se debe"], answer: "Se debe verificar la calibración antes de iniciar" },
      { question: "¿Por qué 'se omitió el registro' es preferible en un informe de no conformidad?", options: ["Porque es más corto", "Porque enfoca en el proceso sin señalar directamente a una persona como culpable", "Porque es gramaticalmente más simple", "Porque evita el pasado"], answer: "Porque enfoca en el proceso sin señalar directamente a una persona como culpable" },
    ],
    dictation: "Se procesaron las muestras, se verificaron los controles y se comunicó el resultado al médico solicitante dentro del tiempo establecido.",
  },

  // ══════════════════════════════════════════
  // SITUACIONES REALES
  // ══════════════════════════════════════════
  {
    id: "llamada-urgente", title: "Llamada urgente al médico", level: "Intermedio", category: "Comunicación", emoji: "📱",
    description: "Cómo comunicar un resultado crítico por teléfono de forma clara y profesional.",
    readingTitle: "La llamada que no podía esperar",
    reading: [
      "Comunicar un resultado crítico por teléfono es una de las situaciones más exigentes en la comunicación técnica del laboratorio. Requiere claridad absoluta, vocabulario preciso, manejo de la presión y la capacidad de verificar que el médico haya entendido correctamente la información. Un error en esa comunicación puede tener consecuencias clínicas graves para el paciente.",
      "El protocolo estándar para la comunicación de un resultado crítico por teléfono incluye los siguientes pasos: identificarse como profesional del laboratorio y dar el nombre del laboratorio; solicitar hablar con el médico tratante o responsable del paciente; confirmar la identidad del interlocutor; comunicar el resultado con el nombre del análisis, el valor numérico y la unidad, y el rango de referencia o valor de pánico; indicar el nombre y número de identificación del paciente; y solicitar al médico que repita la información para confirmar que fue recibida correctamente.",
      "En español, algunas frases útiles para esta situación son: 'Buenos días, habla [nombre] del Laboratorio Controllab. Necesito comunicar un resultado crítico. ¿Podría hablar con el médico responsable del paciente [apellido]?' Una vez en línea con el médico: 'Doctor/Doctora, le llamo para informar un resultado crítico del paciente [nombre]. El potasio es de 6.8 mEq/L, con valor de pánico superior a 6.5. ¿Podría confirmarme que recibió esta información?' El cierre: 'Gracias, queda documentado. Mi nombre es [nombre] y el número de solicitud es [número].'",
      "La documentación de la llamada es parte inseparable del proceso. Después de cada comunicación de resultado crítico, el analista debe registrar en el sistema: la hora exacta de la llamada, el nombre del médico que recibió la información, la confirmación verbal del médico y el nombre del analista que realizó la comunicación. Si no es posible comunicarse con el médico tratante, debe dejarse registro de los intentos y escalarse a través de la cadena de responsabilidad definida en el procedimiento.",
      "Una dificultad adicional en la comunicación oral técnica es el deletreo de nombres y apellidos, especialmente cuando hay interferencias en la línea. En español se puede deletrear usando palabras de referencia: A de Argentina, B de Bolivia, C de Colombia, D de Denmark, E de España... Este recurso, aunque informal, es muy práctico en situaciones donde la claridad es crítica y debe conocerse para usarlo con fluidez cuando la situación lo requiera.",
    ],
    vocab: [
      { es: "resultado crítico", pt: "resultado crítico" }, { es: "habla [nombre] del laboratorio", pt: "fala [nome] do laboratório" },
      { es: "valor de pánico", pt: "valor de pânico" }, { es: "¿podría confirmarme?", pt: "poderia me confirmar?" },
      { es: "queda documentado", pt: "fica registrado / documentado" }, { es: "médico responsable", pt: "médico responsável" },
    ],
    quiz: [
      { question: "¿Cuál es el primer paso al llamar para comunicar un resultado crítico?", options: ["Dar el resultado directamente", "Identificarse con nombre y nombre del laboratorio", "Preguntar si el médico está ocupado", "Enviar el informe por correo primero"], answer: "Identificarse con nombre y nombre del laboratorio" },
      { question: "¿Por qué se pide al médico que repita la información?", options: ["Por protocolo burocrático", "Para confirmar que la información fue recibida y comprendida correctamente", "Para que el médico tome notas", "Para registrar la llamada automáticamente"], answer: "Para confirmar que la información fue recibida y comprendida correctamente" },
      { question: "¿Qué debe quedar documentado después de la llamada?", options: ["Solo el valor crítico", "Hora, nombre del médico, confirmación verbal y nombre del analista", "Solo el nombre del paciente", "Solo si el médico acepta el resultado"], answer: "Hora, nombre del médico, confirmación verbal y nombre del analista" },
      { question: "¿Qué se hace si no se puede comunicar con el médico tratante?", options: ["Se espera hasta que llame", "Se registran los intentos y se escala según el procedimiento", "Se envía solo por correo", "Se libera el resultado sin comunicar"], answer: "Se registran los intentos y se escala según el procedimiento" },
      { question: "¿Para qué se usa el deletreo con palabras de referencia?", options: ["Para hablar más despacio", "Para asegurar claridad cuando hay interferencias al comunicar nombres", "Es obligatorio en todas las llamadas", "Solo para apellidos extranjeros"], answer: "Para asegurar claridad cuando hay interferencias al comunicar nombres" },
      { question: "¿Qué información debe incluirse al comunicar el resultado crítico?", options: ["Solo el valor numérico", "Nombre del análisis, valor numérico, unidad, rango de pánico y nombre del paciente", "Solo el diagnóstico probable", "Solo el nombre del paciente y el valor"], answer: "Nombre del análisis, valor numérico, unidad, rango de pánico y nombre del paciente" },
      { question: "¿Cuál de estas frases es apropiada para iniciar la llamada crítica?", options: ["Hola, tengo un resultado raro", "Buenos días, habla [nombre] del Laboratorio. Necesito comunicar un resultado crítico.", "¿Está el doctor? Tengo algo urgente", "Doctor, su paciente tiene un problema"], answer: "Buenos días, habla [nombre] del Laboratorio. Necesito comunicar un resultado crítico." },
      { question: "¿Por qué es tan exigente la comunicación oral de resultados críticos?", options: ["Porque dura mucho tiempo", "Porque requiere claridad absoluta, vocabulario preciso y verificación de comprensión con consecuencias clínicas directas", "Porque el médico no entiende el laboratorio", "Porque se hace en un idioma extranjero siempre"], answer: "Porque requiere claridad absoluta, vocabulario preciso y verificación de comprensión con consecuencias clínicas directas" },
    ],
    dictation: "Buenos días, habla el analista del laboratorio. Le llamo para comunicar un resultado crítico del potasio del paciente García, número de solicitud cinco cuatro tres dos.",
  },

  // ══ LABORATORIO EXTRA ══
  {
    id: "uremia-electrolitos", title: "Electrolitos y función renal", level: "Intermedio", category: "Laboratorio", emoji: "💧",
    description: "Sodio, potasio, cloro y su interpretación clínica en laboratorio.",
    readingTitle: "El equilibrio que el riñón mantiene",
    reading: [
      "Los electrolitos son iones cargados eléctricamente que cumplen funciones vitales en el organismo: regulan el equilibrio hídrico, participan en la conducción nerviosa y muscular, y mantienen el equilibrio ácido-base. Los principales electrolitos medidos en el laboratorio clínico son el sodio (Na+), el potasio (K+), el cloro (Cl-) y el bicarbonato (HCO3-).",
      "El sodio es el electrolito más abundante en el líquido extracelular y es el principal regulador de la osmolaridad plasmática. Una hiponatremia (sodio bajo) puede causar síntomas neurológicos graves como convulsiones. Una hipernatremia (sodio elevado) indica deshidratación o pérdida de agua libre. El potasio, en cambio, es el principal catión intracelular y su concentración en plasma es muy pequeña pero clínicamente crítica: variaciones mínimas pueden causar arritmias cardíacas potencialmente fatales.",
      "Los valores de pánico para electrolitos son especialmente importantes en la práctica de laboratorio. Un potasio mayor de 6.5 mEq/L o menor de 2.5 mEq/L, o un sodio mayor de 160 mEq/L o menor de 120 mEq/L, son situaciones que requieren comunicación inmediata al médico. Estos valores pueden reflejar emergencias médicas reales que requieren intervención urgente.",
      "Una fuente frecuente de error en la determinación de potasio es la hemólisis de la muestra. Los glóbulos rojos contienen una concentración de potasio intracelular muy superior a la del plasma. Si la muestra se hemoliza durante la extracción o el transporte, el potasio intracelular se libera al plasma, generando una hiperpotasemia artificiosa que puede llevar a decisiones clínicas incorrectas. El analista debe siempre verificar el índice de hemólisis antes de liberar un resultado de potasio elevado.",
      "El anión gap es un cálculo derivado de los electrolitos que el laboratorio puede reportar junto con los resultados de ionograma. Se calcula como sodio menos la suma de cloro y bicarbonato, y su valor normal es de 8 a 12 mEq/L. Un anión gap elevado indica la presencia de ácidos no medidos en el plasma y es útil en el diagnóstico diferencial de la acidosis metabólica. Saber explicar este cálculo al médico solicitante es un ejemplo de cómo el laboratorio puede agregar valor interpretativo a los resultados.",
    ],
    vocab: [
      { es: "electrolito", pt: "eletrólito" }, { es: "sodio / potasio", pt: "sódio / potássio" },
      { es: "hiponatremia", pt: "hiponatremia" }, { es: "hiperpotasemia", pt: "hiperpotassemia" },
      { es: "anión gap", pt: "ânion gap" }, { es: "osmolaridad", pt: "osmolaridade" },
    ],
    quiz: [
      { question: "¿Cuál es el principal electrolito del líquido extracelular?", options: ["Potasio", "Sodio", "Cloro", "Bicarbonato"], answer: "Sodio', explanation: 'El sodio es el catión más abundante en el espacio extracelular y regula la osmolaridad plasmática." },
      { question: "¿Por qué es clínicamente crítico el potasio?", options: ["Porque regula la sed", "Porque variaciones mínimas pueden causar arritmias cardíacas fatales", "Porque determina el color de la orina", "Porque regula la temperatura"], answer: "Porque variaciones mínimas pueden causar arritmias cardíacas fatales', explanation: 'El potasio tiene un rango normal muy estrecho (3.5-5.0 mEq/L) y pequeñas desviaciones afectan directamente la conducción cardíaca." },
      { question: "¿Qué causa un potasio falsamente elevado en la muestra?", options: ["Alta temperatura ambiente", "Hemólisis: el potasio intracelular se libera al plasma", "Muestra muy fresca", "Anticoagulante incorrecto"], answer: "Hemólisis: el potasio intracelular se libera al plasma', explanation: 'Los eritrocitos contienen concentraciones de potasio muy superiores al plasma. La hemólisis contamina el plasma con ese potasio intracelular." },
      { question: "¿Qué indica un anión gap elevado?", options: ["Exceso de bicarbonato", "Presencia de ácidos no medidos en el plasma", "Deshidratación severa", "Función renal normal"], answer: "Presencia de ácidos no medidos en el plasma', explanation: 'El anión gap aumentado sugiere acidosis metabólica por acumulación de ácidos como lactato, cetoácidos o tóxicos." },
      { question: "¿Cómo se calcula el anión gap?", options: ["Na + K - Cl", "Na - (Cl + HCO3)", "Cl + HCO3 - Na", "Na + Cl - HCO3"], answer: "Na - (Cl + HCO3)', explanation: 'El anión gap = Sodio - (Cloro + Bicarbonato). El rango normal es 8-12 mEq/L." },
      { question: "¿Cuál es el valor de pánico para el potasio?", options: ["Mayor de 5.5 mEq/L", "Mayor de 6.5 o menor de 2.5 mEq/L", "Mayor de 4.0 mEq/L", "Cualquier valor fuera de rango"], answer: "Mayor de 6.5 o menor de 2.5 mEq/L', explanation: 'Estos valores extremos representan riesgo vital inminente y requieren comunicación inmediata al médico." },
      { question: "¿Qué indica una hiponatremia severa?", options: ["Deshidratación leve", "Puede causar síntomas neurológicos graves como convulsiones", "Solo deshidratación", "Es siempre un error analítico"], answer: "Puede causar síntomas neurológicos graves como convulsiones', explanation: 'Un sodio menor de 120 mEq/L puede causar edema cerebral, convulsiones y coma." },
      { question: "¿Qué debe verificar el analista antes de liberar un potasio elevado?", options: ["Solo el nombre del paciente", "El índice de hemólisis de la muestra", "El color del tubo", "La temperatura de almacenamiento"], answer: "El índice de hemólisis de la muestra', explanation: 'La hemólisis es la causa más frecuente de hiperpotasemia artefactual. Verificarla evita alarmar innecesariamente al médico." },
    ],
    dictation: "Un potasio mayor de seis punto cinco o menor de dos punto cinco mEq por litro es un valor de pánico que requiere comunicación inmediata al médico.",
  },
  {
    id: "marcadores-cardiacos", title: "Marcadores cardíacos", level: "Avanzado", category: "Laboratorio", emoji: "❤️",
    description: "Troponina, CK-MB y BNP en el diagnóstico de eventos cardiovasculares.",
    readingTitle: "Cuando el corazón habla a través de la sangre",
    reading: [
      "Los marcadores cardíacos son proteínas o enzimas que se liberan al torrente sanguíneo cuando las células del músculo cardíaco sufren daño. Su determinación en el laboratorio es fundamental en el diagnóstico del infarto agudo de miocardio y otras condiciones cardíacas. El tiempo es crítico en estos casos: un resultado rápido y confiable puede ser determinante para que el médico tome la decisión de activar el protocolo de revascularización urgente.",
      "La troponina cardíaca (troponina I o troponina T de alta sensibilidad) es actualmente el marcador de elección para el diagnóstico de infarto de miocardio. Se eleva en las primeras horas después del daño miocárdico, alcanza su pico entre 12 y 24 horas y puede permanecer elevada durante varios días. Los ensayos de alta sensibilidad permiten detectar elevaciones muy pequeñas, lo que mejora el diagnóstico temprano pero también requiere interpretación cuidadosa para distinguir entre daño miocárdico de origen isquémico y otras causas de elevación como miocarditis, insuficiencia renal o sepsis.",
      "La CK-MB (creatinquinasa fracción MB) fue durante muchos años el marcador de referencia para el infarto. Aunque ha sido desplazada por la troponina en muchos protocolos, sigue siendo útil para detectar reinfartos y para el monitoreo postoperatorio cardíaco, porque su elevación y normalización son más rápidas que las de la troponina.",
      "El péptido natriurético cerebral (BNP) y su precursor NT-proBNP son marcadores del estrés de la pared ventricular. Se elevan en la insuficiencia cardíaca y son útiles tanto para el diagnóstico como para el seguimiento y la evaluación de la respuesta al tratamiento. Su interpretación debe considerar factores como la edad, el sexo y la función renal del paciente, que afectan los valores de referencia.",
      "La comunicación de resultados críticos de marcadores cardíacos es una responsabilidad especialmente importante. Una troponina significativamente elevada en un paciente con dolor torácico puede implicar la activación inmediata del equipo de hemodinamia. El laboratorio debe tener establecido un tiempo de respuesta máximo para estos marcadores, generalmente de sesenta minutos desde la recepción de la muestra, y comunicar el resultado de forma verbal además del informe digital.",
    ],
    vocab: [
      { es: "troponina", pt: "troponina" }, { es: "infarto de miocardio", pt: "infarto do miocárdio" },
      { es: "CK-MB", pt: "CK-MB" }, { es: "BNP / NT-proBNP", pt: "BNP / NT-proBNP" },
      { es: "insuficiencia cardíaca", pt: "insuficiência cardíaca" }, { es: "revascularización", pt: "revascularização" },
    ],
    quiz: [
      { question: "¿Qué marcador es actualmente de elección para el diagnóstico de infarto?", options: ["CK-MB", "Troponina cardíaca de alta sensibilidad", "BNP", "LDH"], answer: "Troponina cardíaca de alta sensibilidad', explanation: 'La troponina de alta sensibilidad permite detectar daño miocárdico muy temprano, incluso antes de las 3 horas del inicio del dolor." },
      { question: "¿Cuándo alcanza su pico la troponina después del infarto?", options: ["A los 30 minutos", "Entre 12 y 24 horas", "A los 5 días", "Inmediatamente al inicio del dolor"], answer: "Entre 12 y 24 horas', explanation: 'La troponina comienza a elevarse en las primeras 2-4 horas, alcanza su pico a las 12-24 horas y puede permanecer elevada 7-14 días." },
      { question: "¿Para qué sigue siendo útil la CK-MB?", options: ["Es el marcador principal actualmente", "Para detectar reinfartos y monitoreo postoperatorio por su cinética más rápida", "Solo para diagnóstico de insuficiencia cardíaca", "No tiene utilidad actual"], answer: "Para detectar reinfartos y monitoreo postoperatorio por su cinética más rápida', explanation: 'La CK-MB se normaliza más rápido que la troponina, lo que permite detectar una nueva elevación indicativa de reinfarto." },
      { question: "¿Qué indica un BNP elevado?", options: ["Infarto agudo de miocardio", "Estrés de la pared ventricular e insuficiencia cardíaca", "Infección viral cardíaca", "Arritmia"], answer: "Estrés de la pared ventricular e insuficiencia cardíaca', explanation: 'El BNP se libera cuando el ventrículo está sometido a mayor presión o volumen, como en la insuficiencia cardíaca." },
      { question: "¿Qué tiempo máximo de respuesta suele establecerse para marcadores cardíacos urgentes?", options: ["24 horas", "6 horas", "60 minutos desde la recepción de la muestra", "Solo durante el día"], answer: "60 minutos desde la recepción de la muestra', explanation: 'En síndromes coronarios agudos, cada minuto de demora en el diagnóstico puede significar mayor daño miocárdico irreversible." },
      { question: "¿Puede elevarse la troponina sin infarto de miocardio?", options: ["No, es exclusiva del infarto", "Sí, también en miocarditis, insuficiencia renal o sepsis", "Solo en personas mayores", "Solo con CK-MB también elevada"], answer: "Sí, también en miocarditis, insuficiencia renal o sepsis', explanation: 'La troponina de alta sensibilidad es muy sensible pero no específica: cualquier daño miocárdico o reducción de su excreción puede elevarla." },
      { question: "¿Cómo afecta la función renal al BNP?", options: ["No tiene ningún efecto", "La insuficiencia renal puede elevar los niveles de NT-proBNP independientemente de la función cardíaca", "La mejora renal elimina el BNP", "Solo afecta a la CK-MB"], answer: "La insuficiencia renal puede elevar los niveles de NT-proBNP independientemente de la función cardíaca', explanation: 'El NT-proBNP se excreta por el riñón, por lo que su reducción causa acumulación plasmática incluso sin insuficiencia cardíaca." },
      { question: "¿Por qué es especialmente importante comunicar una troponina elevada?", options: ["Solo por protocolo", "Porque puede implicar activación inmediata del equipo de hemodinamia para salvar al paciente", "Para registrar en el sistema", "Solo si el médico lo solicita"], answer: "Porque puede implicar activación inmediata del equipo de hemodinamia para salvar al paciente', explanation: 'En infarto con elevación del ST, la revascularización percutánea en menos de 90 minutos mejora dramáticamente el pronóstico." },
    ],
    dictation: "La troponina cardíaca de alta sensibilidad es el marcador de elección para el infarto de miocardio y debe reportarse dentro de los sesenta minutos de recibida la muestra.",
  },

  // ══ GESTIÓN EXTRA ══
  {
    id: "iso-15189", title: "Norma ISO 15189", level: "Avanzado", category: "Gestión", emoji: "📜",
    description: "Requisitos de la norma ISO 15189 para laboratorios clínicos.",
    readingTitle: "La norma que define la excelencia",
    reading: [
      "La ISO 15189 es la norma internacional específica para laboratorios de análisis clínicos. Establece los requisitos de competencia técnica y de gestión que un laboratorio debe cumplir para garantizar la calidad y confiabilidad de sus resultados. A diferencia de otras normas ISO, la 15189 fue diseñada específicamente para el entorno clínico, considerando el impacto directo que los resultados del laboratorio tienen sobre la salud de los pacientes.",
      "La norma organiza sus requisitos en dos grandes bloques: los requisitos de gestión, que abordan aspectos como la organización, la gestión de documentos, la gestión de no conformidades, las auditorías internas y la revisión por la dirección; y los requisitos técnicos, que cubren la competencia del personal, las instalaciones y condiciones ambientales, el equipamiento, los procedimientos pre y postanalíticos, el aseguramiento de la calidad de los resultados y los informes.",
      "Uno de los conceptos clave de la ISO 15189 es la trazabilidad metrológica: los valores de los resultados deben poder vincularse a referencias nacionales o internacionales reconocidas mediante una cadena ininterrumpida de calibraciones. Esto garantiza que un resultado de creatinina de 1.0 mg/dL en un laboratorio de Buenos Aires sea comparable con el mismo resultado en un laboratorio de Río de Janeiro o Madrid.",
      "La norma también pone énfasis en la comunicación con los usuarios del laboratorio: los médicos y los pacientes. Requiere que el laboratorio tenga mecanismos para recibir y responder consultas técnicas, para comunicar resultados críticos, para gestionar las quejas de los usuarios y para evaluar periódicamente la satisfacción de sus clientes. Esta dimensión comunicativa reconoce que el laboratorio no termina su trabajo cuando libera el resultado: también es responsable de que ese resultado sea comprendido y utilizado correctamente.",
      "La acreditación bajo ISO 15189 es el reconocimiento formal por parte de un organismo acreditador de que el laboratorio cumple con los requisitos de la norma. En la práctica, implica superar una auditoría inicial y auditorías de seguimiento periódicas. Para muchos laboratorios, el proceso de preparación para la acreditación es tan valioso como la acreditación en sí misma: obliga a revisar, documentar y mejorar todos los procesos, generando una cultura de calidad que beneficia a los pacientes.",
    ],
    vocab: [
      { es: "acreditación", pt: "acreditação" }, { es: "trazabilidad metrológica", pt: "rastreabilidade metrológica" },
      { es: "requisito técnico", pt: "requisito técnico" }, { es: "revisión por la dirección", pt: "revisão pela direção" },
      { es: "competencia del personal", pt: "competência do pessoal" }, { es: "organismo acreditador", pt: "organismo acreditador" },
    ],
    quiz: [
      { question: "¿Para qué tipo de laboratorios es específica la ISO 15189?", options: ["Laboratorios industriales", "Laboratorios de análisis clínicos", "Solo laboratorios hospitalarios", "Laboratorios ambientales"], answer: "Laboratorios de análisis clínicos', explanation: 'La ISO 15189 fue diseñada específicamente para el laboratorio clínico, considerando su impacto directo en la salud de los pacientes." },
      { question: "¿Cuáles son los dos grandes bloques de requisitos de la ISO 15189?", options: ["Técnicos y financieros", "Requisitos de gestión y requisitos técnicos", "Administrativos y científicos", "Nacionales e internacionales"], answer: "Requisitos de gestión y requisitos técnicos', explanation: 'La norma separa los requisitos organizacionales y de gestión de calidad de los requisitos específicamente técnicos del proceso analítico." },
      { question: "¿Qué garantiza la trazabilidad metrológica?", options: ["Que los resultados sean siempre normales", "Que los resultados sean comparables entre laboratorios de diferentes países", "Que el equipo no falle nunca", "Que los reactivos sean siempre del mismo lote"], answer: "Que los resultados sean comparables entre laboratorios de diferentes países', explanation: 'La trazabilidad metrológica permite que un mismo resultado tenga el mismo significado clínico en cualquier laboratorio acreditado del mundo." },
      { question: "¿Qué reconoce la acreditación ISO 15189?", options: ["Que el laboratorio tiene los equipos más modernos", "Que el laboratorio cumple formalmente los requisitos de competencia y calidad de la norma", "Que el laboratorio es el más grande del país", "Que el laboratorio no ha tenido errores en el último año"], answer: "Que el laboratorio cumple formalmente los requisitos de competencia y calidad de la norma', explanation: 'La acreditación es una evaluación independiente y periódica realizada por un organismo externo reconocido." },
      { question: "¿Qué aspecto comunicativo enfatiza la ISO 15189?", options: ["Solo la comunicación interna entre analistas", "Comunicación con médicos y pacientes: consultas, resultados críticos y gestión de quejas", "Solo la comunicación con proveedores", "Solo los informes escritos"], answer: "Comunicación con médicos y pacientes: consultas, resultados críticos y gestión de quejas', explanation: 'La norma reconoce que el ciclo del laboratorio incluye la comunicación efectiva del resultado y su comprensión por parte del usuario." },
      { question: "¿Cuándo termina el trabajo del laboratorio según la ISO 15189?", options: ["Cuando libera el resultado digital", "No termina al liberar el resultado: también es responsable de que sea comprendido y utilizado", "Cuando el médico firma el informe", "Cuando el paciente retira su resultado"], answer: "No termina al liberar el resultado: también es responsable de que sea comprendido y utilizado', explanation: 'La norma incluye requisitos de comunicación post-analítica y gestión de consultas que extienden la responsabilidad del laboratorio más allá del informe." },
      { question: "¿Cuál es el valor del proceso de preparación para la acreditación?", options: ["Solo obtener el certificado", "Obliga a revisar y mejorar todos los procesos generando una cultura de calidad", "Solo es burocrático sin beneficio real", "Solo beneficia al área de calidad"], answer: "Obliga a revisar y mejorar todos los procesos generando una cultura de calidad', explanation: 'Muchos laboratorios reportan que la mayor transformación ocurre durante el proceso de preparación, antes de la auditoría de acreditación." },
      { question: "¿Qué implica la acreditación una vez obtenida?", options: ["Es permanente para siempre", "Requiere auditorías de seguimiento periódicas para mantener la acreditación", "Solo se renueva cada 10 años", "Solo aplica al director técnico"], answer: "Requiere auditorías de seguimiento periódicas para mantener la acreditación', explanation: 'La acreditación no es un logro estático: requiere demostrar continuamente el mantenimiento y mejora del sistema de gestión de calidad." },
    ],
    dictation: "La ISO quince mil ciento ochenta y nueve establece los requisitos técnicos y de gestión que un laboratorio clínico debe cumplir para garantizar la calidad de sus resultados.",
  },

  // ══ COMUNICACIÓN EXTRA ══
  {
    id: "informe-escrito", title: "Redacción de informes técnicos", level: "Intermedio", category: "Comunicación", emoji: "📄",
    description: "Cómo estructurar y redactar informes técnicos claros en español.",
    readingTitle: "El informe que se entiende solo",
    reading: [
      "Un informe técnico bien redactado es uno de los documentos más valiosos que puede producir un profesional del laboratorio. Es la evidencia escrita de un proceso, una decisión o un hallazgo, y puede ser consultado semanas, meses o años después de haber sido elaborado. Por eso, debe ser claro, preciso, completo y comprensible para cualquier persona calificada que lo lea, no solo para quien lo escribió.",
      "La estructura básica de un informe técnico incluye: un encabezado con la identificación del laboratorio, la fecha y el autor; un resumen ejecutivo o conclusión principal al inicio; el desarrollo con los datos, el análisis y la evidencia que sostiene las conclusiones; y un cierre con las recomendaciones o acciones propuestas. Esta estructura responde a la lógica de la pirámide invertida: lo más importante primero, los detalles después.",
      "El lenguaje del informe técnico en español tiene características específicas. Predomina la voz pasiva o el se impersonal para dar objetividad: 'se detectó una desviación', 'fue comunicado al médico', 'se implementaron las acciones correctivas'. Los tiempos verbales más frecuentes son el pretérito indefinido para hechos pasados y el condicional o el subjuntivo para recomendaciones. Las oraciones deben ser cortas y directas, evitando la ambigüedad.",
      "Los errores más frecuentes en la redacción de informes técnicos son: usar lenguaje excesivamente técnico sin definir los términos para el lector previsto, mezclar hechos con opiniones sin distinguirlos claramente, omitir información relevante asumiendo que el lector ya la conoce, y escribir conclusiones que no se sostienen con los datos presentados. Un buen informe es aquel en el que cada afirmación puede rastrearse hasta la evidencia concreta que la fundamenta.",
      "En el contexto bilingüe español-portugués del equipo Controllab, la redacción de informes en español requiere prestar atención especial a las diferencias de registro y formalidad entre ambos idiomas. Algunas estructuras que suenan naturales en portugués resultan demasiado coloquiales en español formal, y viceversa. La práctica constante de leer informes en español, recibir retroalimentación sobre la propia escritura y revisar modelos de referencia es la mejor estrategia para desarrollar esta competencia.",
    ],
    vocab: [
      { es: "informe técnico", pt: "relatório técnico" }, { es: "resumen ejecutivo", pt: "resumo executivo" },
      { es: "evidencia", pt: "evidência" }, { es: "recomendación", pt: "recomendação" },
      { es: "conclusión", pt: "conclusão" }, { es: "retroalimentación", pt: "feedback / retorno" },
    ],
    quiz: [
      { question: "¿Qué estructura responde al principio de pirámide invertida en un informe?", options: ["Detalles primero, conclusión al final", "Conclusión principal al inicio, detalles después", "Solo datos sin conclusión", "Solo recomendaciones sin datos"], answer: "Conclusión principal al inicio, detalles después', explanation: 'La pirámide invertida pone la información más importante al principio para que el lector comprenda el mensaje principal desde el inicio." },
      { question: "¿Qué voz predomina en el lenguaje de informes técnicos en español?", options: ["Primera persona singular activa", "Voz pasiva o se impersonal para dar objetividad", "Segunda persona informal", "Solo el imperativo"], answer: "Voz pasiva o se impersonal para dar objetividad', explanation: 'La voz pasiva permite enfocarse en el proceso y los hechos sin personalizar la acción, dando mayor objetividad al informe." },
      { question: "¿Cuál es un error frecuente en la redacción de informes técnicos?", options: ["Usar demasiados datos", "Mezclar hechos con opiniones sin distinguirlos claramente", "Ser demasiado preciso", "Incluir demasiadas recomendaciones"], answer: "Mezclar hechos con opiniones sin distinguirlos claramente', explanation: 'Un informe confiable diferencia claramente lo que ocurrió (hechos) de lo que el autor interpreta o recomienda (opiniones/juicios)." },
      { question: "¿Cuál es la característica más importante de una conclusión bien escrita?", options: ["Que sea larga y detallada", "Que cada afirmación pueda rastrearse a la evidencia concreta que la fundamenta", "Que use vocabulario técnico avanzado", "Que cite muchas fuentes externas"], answer: "Que cada afirmación pueda rastrearse a la evidencia concreta que la fundamenta', explanation: 'Una conclusión sin respaldo en los datos presentados no es una conclusión técnica válida, sino una opinión no sustentada." },
      { question: "¿Qué tiempos verbales predominan en informes técnicos en español?", options: ["Presente e imperativo", "Pretérito indefinido para hechos y condicional o subjuntivo para recomendaciones", "Solo el futuro simple", "Solo el presente de indicativo"], answer: "Pretérito indefinido para hechos y condicional o subjuntivo para recomendaciones', explanation: 'El indefinido describe lo que ocurrió; el condicional o subjuntivo expresa lo que debería hacerse con mayor cortesía y precisión." },
      { question: "¿Qué debe incluir el encabezado de un informe técnico?", options: ["Solo el título del informe", "Identificación del laboratorio, fecha y autor como mínimo", "Solo la firma del director técnico", "Solo el número de solicitud"], answer: "Identificación del laboratorio, fecha y autor como mínimo', explanation: 'El encabezado permite identificar de forma inequívoca quién emitió el informe, cuándo y en qué contexto institucional." },
      { question: "¿Cuál es la mejor estrategia para mejorar la redacción técnica en español?", options: ["Solo estudiar gramática abstracta", "Leer informes en español, recibir retroalimentación y revisar modelos de referencia constantemente", "Solo traducir del portugués al español", "Solo escribir mucho sin revisar"], answer: "Leer informes en español, recibir retroalimentación y revisar modelos de referencia constantemente', explanation: 'La competencia en escritura técnica se desarrolla con práctica activa y retroalimentación, no solo con conocimiento teórico de la gramática." },
      { question: "¿Por qué un informe debe ser comprensible para cualquier persona calificada?", options: ["Por razones estéticas", "Porque puede ser consultado mucho tiempo después por personas que no estuvieron involucradas", "Solo porque lo exige la norma", "Solo para los auditores externos"], answer: "Porque puede ser consultado mucho tiempo después por personas que no estuvieron involucradas', explanation: 'Un informe técnico es un documento de largo plazo. Su claridad debe ser independiente del contexto inmediato en que fue escrito." },
    ],
    dictation: "Un informe técnico bien redactado presenta la conclusión principal al inicio, sostiene cada afirmación con evidencia concreta y usa la voz pasiva para dar objetividad.",
  },

  // ══ GRAMÁTICA EXTRA ══
  {
    id: "pronunciacion", title: "Pronunciación y fonología", level: "Básico", category: "Gramática", emoji: "🗣️",
    description: "Sonidos del español que difieren del portugués y estrategias para mejorar.",
    readingTitle: "Los sonidos que cambian el significado",
    reading: [
      "La pronunciación es una de las dimensiones del aprendizaje de idiomas que más influye en la comprensión oral y en la credibilidad del hablante, y al mismo tiempo es una de las que más frecuentemente se descuida en la enseñanza formal. Para los hablantes de portugués brasileño que aprenden español, la mayoría de los sonidos son similares o idénticos, lo que facilita enormemente la comunicación. Sin embargo, existen diferencias fonológicas específicas que conviene conocer y trabajar sistemáticamente.",
      "Una de las diferencias más notables es la pronunciación de la letra 'll' y la 'y'. En el español estándar, ambas se pronuncian como un sonido similar al de la 'y' francesa o inglesa (como en 'yellow'). En el Río de la Plata, tanto la 'll' como la 'y' se pronuncian como 'sh' (como en 'she') o 'zh' (sonido sonoro), dando el característico acento porteño. En el contexto del laboratorio, palabras como 'llevar', 'llave', 'inyección' o 'rayos' tendrán pronunciaciones diferentes según el país hispanohablante del interlocutor.",
      "Las vocales del español son más breves y uniformes que las del portugués. El portugués tiene vocales largas, nasalizadas (ã, õ) y reducidas que no existen en español. En español, todas las vocales tienen una duración y apertura más pareja. Para el hablante de portugués brasileño, esto significa que debe evitar nasalizar las vocales en palabras como 'análisis', 'función' o 'condición', que en portugués tendrían una pronunciación diferente.",
      "La 'r' es otro sonido que genera diferencias importantes. El español tiene dos sonidos de 'r': la 'r' simple (como en 'pero') y la 'r' vibrante múltiple o 'rr' (como en 'perro'). Esta distinción es fonémica en español: 'pero' y 'perro' son palabras completamente diferentes. En portugués, la 'r' en posición inicial o doble se pronuncia de forma más aspirada o gutural, similar a la 'j' española, lo que puede generar confusión en palabras técnicas como 'resultado', 'reactivo' o 'referencia'.",
      "La mejor estrategia para mejorar la pronunciación no es estudiar reglas fonéticas en abstracto, sino escuchar activamente el español técnico en contextos reales: podcasts de divulgación médica en español, videos de formación de laboratorio, o simplemente las lecturas de audio de esta plataforma. La imitación consciente de los patrones de entonación y pronunciación de hablantes nativos, seguida de práctica en voz alta, es lo que transforma el conocimiento fonético en una habilidad comunicativa real.",
    ],
    vocab: [
      { es: "pronunciación", pt: "pronúncia" }, { es: "vocal / consonante", pt: "vogal / consoante" },
      { es: "sílaba tónica", pt: "sílaba tônica" }, { es: "entonación", pt: "entonação" },
      { es: "r vibrante múltiple", pt: "r vibrante múltiplo (rr)" }, { es: "acento", pt: "acento" },
    ],
    quiz: [
      { question: "¿Cómo se pronuncian 'll' e 'y' en el español rioplatense (Argentina)?", options: ["Como la 'y' inglesa en 'yes'", "Como 'sh' o 'zh', el acento porteño característico", "Como la 'l' normal", "Como la 'j' española"], answer: "Como 'sh' o 'zh', el acento porteño característico', explanation: 'El yeísmo rehilado es la pronunciación característica del Río de la Plata, diferente al español estándar de España o México." },
      { question: "¿Qué diferencia existe entre 'pero' y 'perro' en español?", options: ["Son sinónimos con diferente ortografía", "Son palabras completamente diferentes: 'r' simple vs 'rr' vibrante múltiple", "Solo se diferencian en el acento gráfico", "No hay diferencia en pronunciación"], answer: "Son palabras completamente diferentes: 'r' simple vs 'rr' vibrante múltiple', explanation: 'La distinción entre r simple y rr vibrante es fonémica en español: cambia el significado de la palabra." },
      { question: "¿Qué característica tienen las vocales del español comparadas con el portugués?", options: ["Son más largas y nasalizadas", "Son más breves, uniformes y sin nasalización", "Son idénticas al portugués", "Tienen más variedad de sonidos"], answer: "Son más breves, uniformes y sin nasalización', explanation: 'El español tiene 5 vocales puras sin nasalización ni reducción, a diferencia del portugués que tiene vocales nasales y reducidas." },
      { question: "¿Cómo puede pronunciarse incorrectamente 'resultado' por influencia del portugués?", options: ["Con acento en la primera sílaba", "Con la 'r' inicial pronunciada de forma gutural o aspirada como en portugués", "Sin pronunciar la 'd' final", "Con la 'u' muy prolongada"], answer: "Con la 'r' inicial pronunciada de forma gutural o aspirada como en portugués', explanation: 'En portugués brasileño, la 'r' inicial se pronuncia como 'j' española. En español, la 'r' inicial es vibrante múltiple, no gutural." },
      { question: "¿Cuál es la mejor estrategia para mejorar la pronunciación?", options: ["Solo estudiar reglas fonéticas en libros", "Escuchar español técnico real e imitar conscientemente la pronunciación de hablantes nativos", "Practicar solo palabras sueltas", "Evitar hablar hasta dominar todas las reglas"], answer: "Escuchar español técnico real e imitar conscientemente la pronunciación de hablantes nativos', explanation: 'La pronunciación es una habilidad motriz que se desarrolla con práctica activa y exposición al input real, no solo con conocimiento teórico." },
      { question: "¿Qué error de pronunciación es común en hablantes de portugués brasileño?", options: ["Pronunciar las consonantes finales", "Nasalizar vocales en palabras como 'función' o 'condición'", "Alargar las consonantes", "Pronunciar la 'h' con sonido"], answer: "Nasalizar vocales en palabras como 'función' o 'condición'', explanation: 'En portugués, la terminación -ção es nasal. En español, la terminación -ción se pronuncia sin nasalización de la vocal." },
      { question: "¿Qué son los pares mínimos en fonología?", options: ["Palabras que se escriben igual pero significan distinto", "Palabras que solo se diferencian en un sonido como 'pero/perro' o 'casa/caza'", "Palabras con la misma pronunciación", "Sinónimos exactos"], answer: "Palabras que solo se diferencian en un sonido como 'pero/perro' o 'casa/caza'', explanation: 'Los pares mínimos demuestran que un sonido es fonémico, es decir, que distingue significados en esa lengua." },
      { question: "¿Por qué la pronunciación influye en la credibilidad del hablante?", options: ["Solo por razones estéticas superficiales", "Porque facilita la comprensión y reduce malentendidos en contextos técnicos de alta responsabilidad", "Solo importa en conversaciones sociales", "Solo en presentaciones formales"], answer: "Porque facilita la comprensión y reduce malentendidos en contextos técnicos de alta responsabilidad', explanation: 'En contextos médicos y técnicos, una pronunciación clara puede ser crítica para evitar errores de comunicación con consecuencias clínicas." },
    ],
    dictation: "En español rioplatense, las letras ll e y se pronuncian como sh, mientras que la r inicial como en resultado es vibrante y diferente de la r del portugués brasileño.",
  },
];

const ALL_ACHIEVEMENTS = [
  { id: "first-module", title: "Primer paso", emoji: "🌱", condition: (cm: number, _score: number, _dicts: number, streak: number) => cm >= 1 },
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
const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática"];
const LEVEL_COLOR: Record<string, string> = {
  "Básico": "bg-emerald-900 text-emerald-300",
  "Intermedio": "bg-amber-900 text-amber-300",
  "Avanzado": "bg-rose-900 text-rose-300",
};
const QUIZ_TIME = 30;

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
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
  .ani{animation:fadeIn .35s cubic-bezier(.4,0,.2,1);}
  .pop{animation:pop .3s cubic-bezier(.4,0,.2,1);}
  .m1{color:#FFD700;}.m2{color:#C0C0C0;}.m3{color:#CD7F32;}
  ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:99px;}
  .reading-text{font-size:15px;line-height:1.85;color:#cbd5e1;}
  .reading-text strong{color:#fff;font-weight:600;}
  .section-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(99,202,183,.2),transparent);margin:8px 0;}
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
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setAppState({ ...createInitialState(), ...JSON.parse(s) }); } catch { }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); } catch { }
  }, [appState]);
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

  // REVIEW MODE: modules where score < 100% or never attempted
  const reviewModules = MODULES.filter(m => {
    const p = sp[m.id];
    if (!p) return true; // never done
    return p.score < p.total; // has errors
  });

  // EXAM MODE logic
  const examModules = MODULES;
  const currentExamMod = examModules[examModuleIdx] ?? examModules[0];
  const examTotalQ = examModules.reduce((s, m) => s + m.quiz.length, 0);
  const examAnsweredQ = Object.values(examAnswers).reduce((s, a) => s + Object.keys(a).length, 0);
  const examProgress = Math.round((examAnsweredQ / examTotalQ) * 100);

  const startExam = () => {
    setExamAnswers({});
    setExamModuleIdx(0);
    setExamFinished(false);
    setQIdx(0);
    setSelectedOption("");
    setSubmitted(false);
    setAnswers({});
    setTimeLeft(QUIZ_TIME);
    setTimerOn(true);
    setExamMode(true);
  };

  const finishExam = () => {
    let totalCorrect = 0;
    examModules.forEach(m => {
      const ans = examAnswers[m.id] || {};
      m.quiz.forEach((q, i) => { if (ans[i] === q.answer) totalCorrect++; });
    });
    saveProg(0, 0); // just trigger save
    setExamFinished(true);
    setTimerOn(false);
  };

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
    if (!found) { setLoginError("Nombre o código incorrecto. Si cambiaste tu contraseña, usá la nueva."); return; }
    setAppState(p => ({ ...p, currentStudentId: found.id }));
    setLoginError(""); setLoginName(""); setLoginCode(""); setShowWelcome(true);
  };
  const logout = () => { setAppState(p => ({ ...p, currentStudentId: null })); setShowPanel(false); setShowChangePass(false); };

  const changePassword = () => {
    if (!student) return;
    if (newPass.trim().length < 4) { setPassMsg("La contraseña debe tener al menos 4 caracteres."); return; }
    if (newPass !== newPassConfirm) { setPassMsg("Las contraseñas no coinciden."); return; }
    setAppState(p => ({
      ...p,
      students: p.students.map(s => s.id === student.id ? { ...s, password: newPass.trim(), passwordChanged: true } : s)
    }));
    setPassMsg("✓ Contraseña actualizada correctamente.");
    setNewPass(""); setNewPassConfirm("");
    setTimeout(() => { setShowChangePass(false); setPassMsg(""); }, 1500);
  };

  const resetStudentPassword = (studentId: string) => {
    setAppState(p => ({
      ...p,
      students: p.students.map(s => s.id === studentId ? { ...s, password: undefined, passwordChanged: false } : s)
    }));
  };
  const saveProg = (score: number, total: number) => {
    if (!student) return;
    setAppState(p => {
      const ps = p.progress[student.id] || {};
      const pm = ps[selectedModuleId] || { completed: false, score: 0, total, attempts: 0 };
      return { ...p, progress: { ...p.progress, [student.id]: { ...ps, [selectedModuleId]: { completed: true, score: Math.max(pm.score, score), total, attempts: pm.attempts + 1 } } } };
    });
  };
  const checkAchievements = (studentId: string) => {
    const p = appState.progress[studentId] || {};
    const d = appState.dictations[studentId] || {};
    const cm = Object.keys(p).length;
    const bestScore = Math.max(...Object.values(p).map(mp => mp.score), 0);
    const dictScores = Object.values(d).map(dr => dr.score);
    const bestDict = dictScores.length ? Math.max(...dictScores) : 0;
    const streak = appState.streaks[studentId]?.count || 0;
    const labDone = MODULES.filter(m => m.category === "Laboratorio" && p[m.id]).length;
    const existing = (appState.achievements[studentId] || []).map(a => a.id);
    const unlocked = ALL_ACHIEVEMENTS.filter(a =>
      !existing.includes(a.id) && a.condition(cm, bestScore, bestDict, streak, labDone)
    );
    if (unlocked.length > 0) {
      const now = new Date().toLocaleString();
      const newOnes = unlocked.map(a => ({ id: a.id, title: a.title, emoji: a.emoji, unlockedAt: now }));
      setNewAchievements(newOnes);
      setAppState(prev => ({
        ...prev,
        achievements: { ...prev.achievements, [studentId]: [...(prev.achievements[studentId] || []), ...newOnes] }
      }));
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
    const week = today.slice(0, 7);
    setAppState(prev => ({
      ...prev,
      streaks: { ...prev.streaks, [studentId]: { count: newCount, lastDate: today } },
      weeklyActivity: {
        ...prev.weeklyActivity,
        [studentId]: { ...(prev.weeklyActivity[studentId] || {}), [today]: (prev.weeklyActivity[studentId]?.[today] || 0) + 1 }
      }
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
      const translated = data[0].map((item: [string]) => item[0]).join("");
      setTransResult(translated || "No se pudo traducir.");
    } catch { setTransResult("Error de conexion. Verifica tu internet."); }
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

  // LOGIN
  if (!student) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 overflow-x-hidden">
      <style>{STYLES}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,202,183,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,202,183,0.08) 0%, transparent 70%)" }} />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10 ani">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs mono tracking-widest text-slate-400 mb-6">
            <span className="w-2 h-2 rounded-full accent-bg inline-block" />
            CONTROLLAB · PLATAFORMA DE ESPAÑOL TÉCNICO
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">Aula<br /><span className="accent" style={{ textShadow: "0 0 60px rgba(99,202,183,0.4)" }}>Controllab</span></h1>
          <p className="mt-5 text-slate-300 text-lg max-w-xl mx-auto leading-7">Español técnico para el equipo Controllab.<br /><span className="accent font-semibold">{MODULES.length} módulos</span> · laboratorio · gestión · TI · comunicación · gramática</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 ani">
          {[{ icon: "🧪", n: MODULES.length, l: "Módulos", sub: "Lecciones completas" }, { icon: "👥", n: defaultStudents.length, l: "Alumnos", sub: "Equipo Controllab" }, { icon: "📚", n: "6", l: "Áreas", sub: "Lab · TI · Gestión · más" }, { icon: "🏆", n: "Top 5", l: "Ranking", sub: "Competencia entre colegas" }].map(x => (
            <div key={x.l} className="glass rounded-2xl p-4 text-center" style={{ borderColor: "rgba(99,202,183,0.1)" }}>
              <div className="text-2xl mb-1">{x.icon}</div>
              <div className="text-2xl font-black mono text-white">{x.n}</div>
              <div className="text-sm font-bold text-white mt-0.5">{x.l}</div>
              <div className="text-xs text-slate-500 mt-1">{x.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="mono text-xs text-slate-400 tracking-widest">🏆 RANKING ACTUAL</div>
                <div className="text-xs text-slate-500">Top 5</div>
              </div>
              {loginRanking.filter(r => r.pts > 0).length === 0 ? (
                <div className="text-center py-6"><div className="text-3xl mb-2">🚀</div><div className="text-slate-400 text-sm">¡Nadie ha completado módulos todavía! Sé el primero.</div></div>
              ) : (
                <div className="space-y-2">{loginRanking.map((r, i) => (
                  <div key={r.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${i === 0 ? "bg-yellow-500/10 border border-yellow-500/20" : "glass"}`}>
                    <span className={`text-lg w-7 ${i === 0 ? "m1" : i === 1 ? "m2" : i === 2 ? "m3" : "text-slate-500"}`}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}.`}</span>
                    <span className="flex-1 font-semibold text-sm">{r.name}</span>
                    <span className="text-xs text-slate-400">{r.cm} mód.</span>
                    <span className="mono text-sm font-black accent">{r.pts} pts</span>
                  </div>
                ))}</div>
              )}
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">📚 MÓDULOS DISPONIBLES</div>
              <div className="grid grid-cols-4 gap-2">
                {MODULES.map(m => (
                  <div key={m.id} className="glass rounded-xl p-2.5 text-center" title={m.title}>
                    <div className="text-xl">{m.emoji}</div>
                    <div className="text-slate-400 mt-1 truncate" style={{ fontSize: "9px" }}>{m.title}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">👥 ALUMNOS</div>
              <div className="flex flex-wrap gap-2">{defaultStudents.map(s => <span key={s.id} className="glass text-slate-200 text-xs px-3 py-1.5 rounded-full font-medium">{s.name}</span>)}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-3xl p-7" style={{ boxShadow: "0 0 40px rgba(99,202,183,0.12)", borderColor: "rgba(99,202,183,0.15)" }}>
              <div className="mono text-xs tracking-widest text-slate-400 mb-1">INGRESO</div>
              <h2 className="text-2xl font-bold text-white mb-1">Entrar como alumno</h2>
              <p className="text-slate-400 text-sm mb-6">Usá tu nombre y el código que te dio el profe.</p>
              <div className="space-y-4">
                <div><label className="block text-sm text-slate-300 mb-2 font-medium">Nombre</label>
                  <input value={loginName} onChange={e => setLoginName(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Ej: Marília" className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3.5" /></div>
                <div><label className="block text-sm text-slate-300 mb-2 font-medium">Código de acceso</label>
                  <input value={loginCode} onChange={e => setLoginCode(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Ej: MARILIA" className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3.5 mono" /></div>
                {loginError && <p className="text-rose-400 text-sm">{loginError}</p>}
                <button onClick={login} className="btn-accent w-full px-5 py-4 text-sm">Ingresar a la plataforma →</button>
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
            <div className="glass rounded-3xl p-5" style={{ borderColor: "rgba(99,202,183,0.15)" }}>
              <div className="flex items-center justify-between mb-4">
                <div><div className="mono text-xs text-slate-400 tracking-widest mb-0.5">🌐 TRADUCTOR RÁPIDO</div><div className="text-sm font-semibold text-white">Español ↔ Portugués</div></div>
                <button onClick={() => setTransDir(d => d === "es-pt" ? "pt-es" : "es-pt")} className="glass rounded-xl px-3 py-2 text-xs font-bold accent hover:border-[#63CAB7] transition">{transDir === "es-pt" ? "ES → PT" : "PT → ES"} ⇄</button>
              </div>
              <textarea value={transInput} onChange={e => setTransInput(e.target.value)} rows={3} placeholder={transDir === "es-pt" ? "Escribí en español..." : "Escreva em português..."} className="w-full rounded-2xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3 text-sm leading-6 resize-none" />
              <button onClick={translate} disabled={transLoading || !transInput.trim()} className="btn-accent w-full mt-3 py-3 text-sm">{transLoading ? "Traduciendo..." : "Traducir"}</button>
              {transInput.trim() && <button onClick={openGoogleTranslate} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-white transition text-center">Abrir en Google Translate ↗</button>}
              {transResult && (<div className="mt-3 glass-dark rounded-2xl p-4 ani">
                <div className="text-xs text-slate-400 mono mb-2 tracking-widest">{transDir === "es-pt" ? "PORTUGUÉS" : "ESPAÑOL"}</div>
                <p className="text-slate-100 text-sm leading-6">{transResult}</p>
                <button onClick={() => speak(transResult, 0.85)} className="mt-2 text-xs text-slate-400 hover:text-white transition">🔊 Escuchar</button>
              </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  // EXAM MODE SCREEN
  if (examMode && !examFinished) {
    const emod = examModules[examModuleIdx];
    const eQ = emod.quiz[qIdx];
    const eAnswers = examAnswers[emod.id] || {};
    const isEOk = submitted && selectedOption === eQ.answer;
    const allModDone = Object.keys(eAnswers).length >= emod.quiz.length && submitted;

    const handleExamNext = () => {
      const newAnswers = { ...examAnswers, [emod.id]: { ...(examAnswers[emod.id] || {}), [qIdx]: selectedOption } };
      setExamAnswers(newAnswers);
      if (qIdx < emod.quiz.length - 1) {
        setQIdx(i => i + 1); setSelectedOption(""); setSubmitted(false); setTimeLeft(QUIZ_TIME); setTimerOn(true);
      } else if (examModuleIdx < examModules.length - 1) {
        setExamModuleIdx(i => i + 1); setQIdx(0); setSelectedOption(""); setSubmitted(false); setTimeLeft(QUIZ_TIME); setTimerOn(true);
      } else {
        finishExam();
      }
    };
    const handleExamSubmit = () => {
      if (!selectedOption) return;
      setExamAnswers(prev => ({ ...prev, [emod.id]: { ...(prev[emod.id] || {}), [qIdx]: selectedOption } }));
      setSubmitted(true); setTimerOn(false);
    };

    const totalAnswered = Object.values(examAnswers).reduce((s, a) => s + Object.keys(a).length, 0) + (submitted ? 0 : 0);

    return (
      <div className="min-h-screen exam-bg text-white px-4 py-6">
        <style>{STYLES}</style>
        <div className="max-w-3xl mx-auto">
          {/* Exam header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="badge badge-purple mb-2">⚡ MODO EXAMEN</div>
              <div className="text-sm text-slate-400">Módulo {examModuleIdx + 1} de {examModules.length} · Pregunta {qIdx + 1} de {emod.quiz.length}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke={timeLeft <= 10 ? "#f87171" : "#a78bfa"} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={`${2 * Math.PI * 24 * (1 - timeLeft / QUIZ_TIME)}`}
                    style={{ transition: "stroke-dashoffset 0.5s linear" }} strokeLinecap="round" />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center mono text-sm font-black ${timeLeft <= 10 ? "text-rose-400" : "text-purple-300"}`}>{timeLeft}</div>
              </div>
              <button onClick={() => { setExamMode(false); setTimerOn(false); }} className="glass rounded-xl px-4 py-2 text-xs text-slate-300 hover:text-white transition">✕ Salir</button>
            </div>
          </div>

          {/* Overall progress */}
          <div className="glass rounded-2xl px-5 py-3 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Progreso del examen</span>
              <span className="mono text-xs accent2">{Object.values(examAnswers).reduce((s, a) => s + Object.keys(a).length, 0) + (submitted ? 1 : 0)}/{examTotalQ}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill-purple" style={{ width: `${Math.round((Object.values(examAnswers).reduce((s, a) => s + Object.keys(a).length, 0) + (submitted ? 1 : 0)) / examTotalQ * 100)}%` }} /></div>
          </div>

          {/* Module name */}
          <div className="glass rounded-2xl px-5 py-3 mb-5 flex items-center gap-3">
            <span className="text-2xl">{emod.emoji}</span>
            <div>
              <div className="font-bold">{emod.title}</div>
              <div className="text-xs text-slate-400">{emod.category}</div>
            </div>
            <div className="ml-auto progress-bar w-24"><div className="progress-fill-purple" style={{ width: `${Math.round((qIdx + (submitted ? 1 : 0)) / emod.quiz.length * 100)}%` }} /></div>
          </div>

          {/* Question */}
          <div className="glass rounded-3xl p-6 ani">
            <p className="text-lg font-semibold mb-5 leading-7">{eQ.question}</p>
            <div className="space-y-3">
              {eQ.options.map(opt => {
                const sel = selectedOption === opt;
                const ok = submitted && opt === eQ.answer;
                const bad = submitted && sel && opt !== eQ.answer;
                return <button key={opt} onClick={() => !submitted && setSelectedOption(opt)} disabled={submitted}
                  className={`opt ${ok ? "ok" : bad ? "bad" : sel ? "sel" : ""}`}>{opt}</button>;
              })}
            </div>
            <div className="mt-5 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm">{submitted ? (isEOk ? <span className="text-emerald-400 font-semibold">✓ ¡Correcto!</span> : <span className="text-rose-400">✗ Correcto: <strong className="text-white">{eQ.answer}</strong></span>) : <span className="text-slate-500">Sin ayudas — modo examen.</span>}</div>
              {!submitted
                ? <button onClick={handleExamSubmit} disabled={!selectedOption} className="btn-purple px-6 py-3 text-sm">Responder</button>
                : <button onClick={handleExamNext} className="btn-purple px-6 py-3 text-sm">
                  {examModuleIdx < examModules.length - 1 || qIdx < emod.quiz.length - 1 ? "Siguiente →" : "Finalizar examen ✓"}
                </button>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EXAM FINISHED SCREEN
  if (examMode && examFinished) {
    return (
      <div className="min-h-screen exam-bg flex items-center justify-center px-4 py-10">
        <style>{STYLES}</style>
        <div className="cert glow-purple max-w-2xl w-full text-center pop" style={{ borderColor: "#a78bfa" }}>
          <div className="text-6xl mb-4">{examScore / examTotalQ >= 0.9 ? "🏆" : examScore / examTotalQ >= 0.7 ? "🎯" : "📚"}</div>
          <div className="badge badge-purple mb-4">⚡ RESULTADO DEL EXAMEN</div>
          <h1 className="text-3xl font-bold text-white mt-2">{examScore / examTotalQ >= 0.9 ? "¡Excelente!" : examScore / examTotalQ >= 0.7 ? "¡Muy bien!" : "Seguí practicando"}</h1>
          <h2 className="text-xl font-bold mt-2" style={{ color: "#a78bfa" }}>{student.name}</h2>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4"><div className="text-3xl font-black mono" style={{ color: "#a78bfa" }}>{examScore}</div><div className="text-xs text-slate-400 mt-1">Correctas</div></div>
            <div className="glass rounded-2xl p-4"><div className="text-3xl font-black mono text-white">{examTotalQ}</div><div className="text-xs text-slate-400 mt-1">Total</div></div>
            <div className="glass rounded-2xl p-4"><div className="text-3xl font-black mono" style={{ color: examScore / examTotalQ >= 0.7 ? "#63CAB7" : "#f87171" }}>{Math.round((examScore / examTotalQ) * 100)}%</div><div className="text-xs text-slate-400 mt-1">Puntaje</div></div>
          </div>
          <div className="mt-6 glass rounded-2xl p-4">
            <div className="text-xs text-slate-400 mono mb-3 tracking-widest">MÓDULOS CON ERRORES</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {examModules.filter(m => {
                const ans = examAnswers[m.id] || {};
                return m.quiz.some((q, i) => ans[i] !== q.answer);
              }).map(m => <span key={m.id} className="badge badge-red">{m.emoji} {m.title}</span>)}
              {examModules.every(m => { const a = examAnswers[m.id] || {}; return m.quiz.every((q, i) => a[i] === q.answer); }) && <span className="badge badge-green">✓ ¡Sin errores!</span>}
            </div>
          </div>
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            <button onClick={startExam} className="btn-purple px-6 py-3 text-sm">🔄 Repetir examen</button>
            <button onClick={() => { setExamMode(false); setExamFinished(false); setReviewMode(true); }} className="glass rounded-xl px-6 py-3 text-sm text-yellow-300 hover:text-white transition">🔁 Ir al repaso</button>
            <button onClick={() => { setExamMode(false); setExamFinished(false); }} className="glass rounded-xl px-6 py-3 text-sm text-slate-300 hover:text-white transition">← Volver a la app</button>
          </div>
        </div>
      </div>
    );
  }

  // WELCOME SCREEN
  if (showWelcome && student) {
    const streak = appState.streaks[student.id];
    const today = new Date().toISOString().split("T")[0];
    const isStreakActive = streak?.lastDate === today;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "¡Buenos días" : hour < 18 ? "¡Buenas tardes" : "¡Buenas noches";
    const completedToday = Object.values(appState.weeklyActivity[student.id] || {}).reduce((s, v) => s + v, 0);
    const suggestedMod = MODULES.find(m => !sp[m.id]) || MODULES.find(m => sp[m.id] && sp[m.id].score < sp[m.id].total) || MODULES[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
        <style>{STYLES}</style>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,202,183,0.1) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-2xl w-full ani">
          <div className="glass rounded-3xl p-8 glow-teal text-center" style={{ borderColor: "rgba(99,202,183,0.2)" }}>
            <div className="text-6xl mb-4">{hour < 12 ? "🌅" : hour < 18 ? "☀️" : "🌙"}</div>
            <div className="mono text-xs tracking-widest text-slate-400 mb-3">AULA CONTROLLAB</div>
            <h1 className="text-3xl md:text-4xl font-black text-white">{greeting}, <span className="accent">{student.name}</span>!</h1>
            <p className="text-slate-300 mt-3 text-lg">Bienvenido/a a tu espacio de español técnico.</p>

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
                  <div className="flex-1">
                    <div className="font-bold text-white">{suggestedMod.title}</div>
                    <div className="text-xs text-slate-400">{suggestedMod.category} · {suggestedMod.level}</div>
                  </div>
                  <button onClick={() => { setShowWelcome(false); setSelectedModuleId(suggestedMod.id); }} className="btn-accent px-4 py-2 text-xs">Ir →</button>
                </div>
              </div>
            )}

            <button onClick={() => setShowWelcome(false)} className="btn-accent w-full mt-6 py-4 text-sm font-bold">
              Entrar a la plataforma →
            </button>
            <button onClick={logout} className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition">No soy {student.name} — Salir</button>
          </div>
        </div>
      </div>
    );
  }

  // CERTIFICATE
  if (showCert) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
      <style>{STYLES}</style>
      <div className="cert ani max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">🎓</div>
        <div className="mono text-xs text-slate-400 tracking-widest mb-2">CERTIFICADO DE COMPLETACIÓN</div>
        <h1 className="text-3xl font-bold text-white mt-4">¡Felicitaciones!</h1>
        <h2 className="text-2xl font-bold accent mt-2">{student.name}</h2>
        <p className="mt-4 text-slate-300 leading-7">Completaste todos los <strong className="text-white">{MODULES.length} módulos</strong> de <strong className="accent">Aula Controllab</strong>.</p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-4"><div className="text-2xl font-black mono accent">{totalScore}</div><div className="text-xs text-slate-400 mt-1">Puntos</div></div>
          <div className="glass rounded-2xl p-4"><div className="text-2xl font-black mono">{MODULES.length}</div><div className="text-xs text-slate-400 mt-1">Módulos</div></div>
          <div className="glass rounded-2xl p-4"><div className="text-2xl font-black mono accent">100%</div><div className="text-xs text-slate-400 mt-1">Completado</div></div>
        </div>
        <div className="mt-6 text-slate-500 text-sm mono">{new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</div>
        <button onClick={() => setShowCert(false)} className="btn-accent mt-8 px-8 py-3 text-sm">← Volver a la app</button>
      </div>
    </div>
  );

  // MAIN APP
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <style>{STYLES}</style>

      {/* ACHIEVEMENT TOAST */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2 ani">
          {newAchievements.map(a => (
            <div key={a.id} className="glass-accent rounded-2xl px-5 py-4 flex items-center gap-3 pop" style={{ borderColor: "rgba(99,202,183,.4)", boxShadow: "0 0 30px rgba(99,202,183,.3)" }}>
              <span className="text-3xl">{a.emoji}</span>
              <div>
                <div className="text-xs mono tracking-widest text-slate-400 mb-0.5">🏅 LOGRO DESBLOQUEADO</div>
                <div className="font-bold text-white">{a.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <header className="sticky top-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div>
              <div className="mono text-xs text-slate-500 tracking-widest">CONTROLLAB</div>
              <div className="font-bold text-base">Hola, <span className="accent">{student.name}</span> 👋</div>
            </div>
            <div className="hidden md:flex items-center gap-2 ml-2">
              <div className="glass rounded-xl px-3 py-1.5 text-xs"><span className="text-slate-400">Progreso </span><span className="font-bold accent">{pct}%</span></div>
              <div className="glass rounded-xl px-3 py-1.5 text-xs"><span className="text-slate-400">Puntos </span><span className="font-bold">{totalScore}/{totalQ}</span></div>
              <div className="glass rounded-xl px-3 py-1.5 text-xs"><span className="text-slate-400">Módulos </span><span className="font-bold">{completedMods}/{MODULES.length}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {allDone && <button onClick={() => setShowCert(true)} className="btn-accent px-3 py-2 text-xs">🎓 Certificado</button>}
            <button onClick={() => setShowAchievements(a => !a)} className={`glass rounded-xl px-3 py-2 text-xs transition ${showAchievements ? "accent" : "text-slate-300 hover:text-white"}`}>
              🏅 {(appState.achievements[student?.id || ""] || []).length}/{ALL_ACHIEVEMENTS.length}
            </button>
            <button onClick={startExam} className="btn-purple px-3 py-2 text-xs">⚡ Examen</button>
            {reviewModules.length > 0 && <button onClick={() => { setReviewMode(r => !r); setActiveCategory("Todos"); }} className={`glass rounded-xl px-3 py-2 text-xs transition font-semibold ${reviewMode ? "text-yellow-300 border-yellow-500/50" : "text-slate-300 hover:text-white"}`}>🔁 Repaso {reviewMode ? "ON" : `(${reviewModules.length})`}</button>}
            <button onClick={() => setShowTranslator(t => !t)} className={`glass rounded-xl px-3 py-2 text-xs transition ${showTranslator ? "accent" : "text-slate-300 hover:text-white"}`}>🌐 Traductor</button>
            <button onClick={openPanel} className="glass rounded-xl px-3 py-2 text-xs text-slate-300 hover:text-white transition">{showPanel ? "✕ Panel" : "📊 Panel profe"}</button>
            <button onClick={() => setShowChangePass(c => !c)} className={`glass rounded-xl px-3 py-2 text-xs transition ${showChangePass ? "accent" : "text-slate-300 hover:text-white"}`}>🔑 Contraseña</button>
            <button onClick={logout} className="glass rounded-xl px-3 py-2 text-xs text-slate-300 hover:text-white transition">Salir →</button>
          </div>
        </div>
        <div className="progress-bar mx-4 mb-2" style={{ borderRadius: 0 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* TRANSLATOR */}
        {showTranslator && (
          <div className="glass rounded-3xl p-5 mb-6 ani">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div><div className="mono text-xs text-slate-400 tracking-widest mb-0.5">🌐 TRADUCTOR</div><div className="text-sm font-semibold text-white">Español ↔ Portugués</div></div>
              <button onClick={() => setTransDir(d => d === "es-pt" ? "pt-es" : "es-pt")} className="glass rounded-xl px-4 py-2 text-sm font-bold accent hover:border-[#63CAB7] transition">{transDir === "es-pt" ? "ES → PT" : "PT → ES"} ⇄</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400 mono mb-2">{transDir === "es-pt" ? "ESPAÑOL" : "PORTUGUÉS"}</div>
                <textarea value={transInput} onChange={e => setTransInput(e.target.value)} rows={4} placeholder={transDir === "es-pt" ? "Escribí en español..." : "Escreva em português..."} className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm leading-6 resize-none" />
                <button onClick={translate} disabled={transLoading || !transInput.trim()} className="btn-accent w-full mt-2 py-2.5 text-sm">{transLoading ? "Traduciendo..." : "Traducir →"}</button>
                {transInput.trim() && <button onClick={openGoogleTranslate} className="w-full mt-1.5 py-2 text-xs text-slate-400 hover:text-white transition text-center">Abrir en Google Translate ↗</button>}
              </div>
              <div>
                <div className="text-xs text-slate-400 mono mb-2">{transDir === "es-pt" ? "PORTUGUÉS" : "ESPAÑOL"}</div>
                <div className="w-full rounded-2xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm leading-6 min-h-[104px] text-slate-100">
                  {transLoading ? <span className="text-slate-500">Traduciendo...</span> : transResult || <span className="text-slate-600">La traducción aparece aquí...</span>}
                </div>
                {transResult && <button onClick={() => speak(transResult, 0.85)} className="mt-2 text-xs text-slate-400 hover:text-white transition">🔊 Escuchar</button>}
              </div>
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS & STATS PANEL */}
        {showAchievements && student && (
          <div className="glass rounded-3xl p-5 mb-6 ani">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="mono text-xs text-slate-400 tracking-widest mb-1">MIS ESTADÍSTICAS</div>
                <h2 className="text-xl font-bold">Progreso de <span className="accent">{student.name}</span></h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setWeekTab("weekly")} className={`tab ${weekTab === "weekly" ? "active" : ""}`}>📊 Actividad</button>
                <button onClick={() => setWeekTab("achievements")} className={`tab ${weekTab === "achievements" ? "active" : ""}`}>🏅 Logros</button>
              </div>
            </div>

            {weekTab === "weekly" && (() => {
              const today = new Date();
              const days = Array.from({length: 7}, (_, i) => {
                const d = new Date(today); d.setDate(d.getDate() - (6 - i));
                return d.toISOString().split("T")[0];
              });
              const activity = appState.weeklyActivity[student.id] || {};
              const streak = appState.streaks[student.id];
              const maxVal = Math.max(1, ...days.map(d => activity[d] || 0));
              const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
              return (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: "🔥", val: streak?.count || 0, label: "Días de racha", sub: streak?.lastDate === new Date().toISOString().split("T")[0] ? "Activa hoy" : "Sin actividad hoy" },
                      { icon: "✅", val: completedMods, label: "Módulos", sub: `de ${MODULES.length} totales` },
                      { icon: "⭐", val: totalScore, label: "Puntos", sub: `de ${totalQ} posibles` },
                      { icon: "📝", val: `${pct}%`, label: "Completado", sub: allDone ? "¡Todo listo!" : "En progreso" },
                    ].map(s => (
                      <div key={s.label} className="glass-dark rounded-2xl p-4 text-center">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-2xl font-black mono accent">{s.val}</div>
                        <div className="text-xs font-semibold text-white mt-0.5">{s.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-dark rounded-2xl p-5">
                    <div className="mono text-xs text-slate-400 tracking-widest mb-4">ACTIVIDAD ÚLTIMOS 7 DÍAS</div>
                    <div className="flex items-end gap-2 h-24">
                      {days.map((d, i) => {
                        const val = activity[d] || 0;
                        const h = Math.max(4, Math.round((val / maxVal) * 80));
                        const isToday = d === new Date().toISOString().split("T")[0];
                        const dayName = dayNames[new Date(d + "T12:00:00").getDay()];
                        return (
                          <div key={d} className="flex-1 flex flex-col items-center gap-1">
                            <div className="text-xs mono accent font-bold">{val > 0 ? val : ""}</div>
                            <div className="w-full rounded-lg transition-all" style={{ height: `${h}px`, background: isToday ? "#63CAB7" : val > 0 ? "rgba(99,202,183,0.4)" : "rgba(255,255,255,0.06)" }} />
                            <div className={`text-xs ${isToday ? "accent font-bold" : "text-slate-500"}`}>{dayName}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="glass-dark rounded-2xl p-5">
                    <div className="mono text-xs text-slate-400 tracking-widest mb-3">PROGRESO POR ÁREA</div>
                    <div className="space-y-3">
                      {["Laboratorio","Gestión","Comunicación","Tecnología","Gramática"].map(cat => {
                        const catMods = MODULES.filter(m => m.category === cat);
                        const done = catMods.filter(m => sp[m.id]).length;
                        const pctCat = Math.round((done / catMods.length) * 100);
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-xs mb-1"><span className="text-slate-300 font-medium">{cat}</span><span className="mono accent">{done}/{catMods.length}</span></div>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${pctCat}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {weekTab === "achievements" && (() => {
              const unlocked = appState.achievements[student.id] || [];
              const unlockedIds = unlocked.map(a => a.id);
              return (
                <div className="grid gap-3 md:grid-cols-2">
                  {ALL_ACHIEVEMENTS.map(a => {
                    const isUnlocked = unlockedIds.includes(a.id);
                    const data = unlocked.find(u => u.id === a.id);
                    return (
                      <div key={a.id} className={`rounded-2xl px-5 py-4 flex items-center gap-4 transition ${isUnlocked ? "glass-accent" : "glass-dark opacity-50"}`}>
                        <span className="text-3xl">{isUnlocked ? a.emoji : "🔒"}</span>
                        <div className="flex-1">
                          <div className={`font-bold text-sm ${isUnlocked ? "text-white" : "text-slate-500"}`}>{a.title}</div>
                          {isUnlocked && data && <div className="text-xs text-slate-400 mt-0.5">Desbloqueado {data.unlockedAt}</div>}
                          {!isUnlocked && <div className="text-xs text-slate-600 mt-0.5">Sigue practicando...</div>}
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

        {/* CHANGE PASSWORD PANEL */}
        {showChangePass && (
          <div className="glass rounded-3xl p-5 mb-6 ani glow-teal">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="mono text-xs text-slate-400 tracking-widest mb-1">🔑 CAMBIAR CONTRASEÑA</div>
                <div className="text-sm text-white font-semibold">Nueva contraseña para <span className="accent">{student?.name}</span></div>
              </div>
              <button onClick={() => { setShowChangePass(false); setPassMsg(""); setNewPass(""); setNewPassConfirm(""); }} className="glass rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white transition">✕</button>
            </div>
            {student && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Nueva contraseña (mín. 4 caracteres)</label>
                    <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                      placeholder="Nueva contraseña..." className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Confirmar contraseña</label>
                    <input type="password" value={newPassConfirm} onChange={e => setNewPassConfirm(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && changePassword()}
                      placeholder="Repetí la contraseña..." className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                  </div>
                  <button onClick={changePassword} disabled={!newPass || !newPassConfirm} className="btn-accent w-full py-3 text-sm">Guardar nueva contraseña</button>
                  {passMsg && <p className={`text-sm font-medium ${passMsg.startsWith("✓") ? "accent" : "text-rose-400"}`}>{passMsg}</p>}
                </div>
                <div className="glass-dark rounded-2xl p-4">
                  <div className="text-xs text-slate-400 mono tracking-widest mb-3">ℹ️ INFORMACIÓN</div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>• Tu contraseña actual es tu <strong className="text-white">código de acceso</strong> {student.passwordChanged ? "personalizado" : `(${student.code})`}.</p>
                    <p>• Solo vos conocés tu nueva contraseña.</p>
                    <p>• Si olvidás tu contraseña, pedile al profe que la resetee.</p>
                    <p>• El profe puede restablecer tu código original pero <strong className="text-white">no puede ver tu nueva contraseña</strong>.</p>
                  </div>
                  {student.passwordChanged && (
                    <div className="mt-3 glass rounded-xl px-3 py-2">
                      <span className="badge badge-green">✓ Contraseña personalizada activa</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL */}
        {showPanel && (
          <div className="glass rounded-3xl p-5 mb-6 ani">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div><div className="mono text-xs text-slate-400 tracking-widest mb-1">PANEL DEL PROFESOR</div><h2 className="text-xl font-bold">Gestión y seguimiento</h2></div>
              <div className="flex gap-2 flex-wrap">
                {(["ranking", "progress", "dictations", "students"] as const).map(t => (
                  <button key={t} onClick={() => setTeacherTab(t)} className={`tab ${teacherTab === t ? "active" : ""}`}>
                    {t === "ranking" ? "🏆 Ranking" : t === "progress" ? "📊 Quiz" : t === "dictations" ? "🎙 Dictados" : "👥 Alumnos"}
                  </button>
                ))}
              </div>
            </div>
            {teacherTab === "ranking" && (
              <div className="space-y-3">{ranking.map((r, i) => (
                <div key={r.id} className={`glass rounded-2xl px-5 py-4 flex items-center gap-4 ${i === 0 ? "border border-yellow-500/30" : ""}`}>
                  <div className={`text-2xl font-black w-8 ${i === 0 ? "m1" : i === 1 ? "m2" : i === 2 ? "m3" : "text-slate-500"}`}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}</div>
                  <div className="flex-1"><div className="font-bold">{r.name}</div><div className="text-xs text-slate-400">{r.cm}/{MODULES.length} mód · dictado {r.da}%</div></div>
                  <div className="text-right"><div className="text-2xl font-black mono accent">{r.pts}</div><div className="text-xs text-slate-500">pts</div></div>
                </div>
              ))}</div>
            )}
            {teacherTab === "progress" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-slate-400"><th className="text-left px-4 py-3">Alumno</th>{MODULES.map(m => <th key={m.id} className="text-center px-1 py-3 text-xs" title={m.title}>{m.emoji}</th>)}<th className="text-center px-4 py-3">%</th></tr></thead>
                  <tbody>{ranking.map((r, i) => (
                    <tr key={r.id} className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                      <td className="px-4 py-2 font-medium text-sm">{r.name}</td>
                      {MODULES.map(m => { const p = (appState.progress[r.id] || {})[m.id]; return <td key={m.id} className="text-center px-1 py-2">{p ? <span className="accent font-bold mono text-xs">{p.score}/{p.total}</span> : <span className="text-slate-600 text-xs">—</span>}</td>; })}
                      <td className="text-center px-4 py-2"><span className={`text-xs font-bold px-2 py-1 rounded-full ${r.cm === MODULES.length ? "bg-emerald-900 text-emerald-300" : r.cm > 0 ? "bg-amber-900 text-amber-300" : "bg-slate-700 text-slate-400"}`}>{Math.round((r.cm / MODULES.length) * 100)}%</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {teacherTab === "dictations" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-slate-400"><th className="text-left px-4 py-3">Alumno</th>{MODULES.map(m => <th key={m.id} className="text-center px-1 py-3 text-xs" title={m.title}>{m.emoji}</th>)}<th className="text-center px-4 py-3">Prom.</th></tr></thead>
                  <tbody>{ranking.map((r, i) => (
                    <tr key={r.id} className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                      <td className="px-4 py-2 font-medium text-sm">{r.name}</td>
                      {MODULES.map(m => { const d = (appState.dictations[r.id] || {})[m.id]; return <td key={m.id} className="text-center px-1 py-2">{d != null ? <span className={`mono text-xs font-bold ${d.score >= 80 ? "text-emerald-400" : d.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>{d.score}%</span> : <span className="text-slate-600 text-xs">—</span>}</td>; })}
                      <td className="text-center px-4 py-2 font-bold mono accent text-sm">{r.da > 0 ? `${r.da}%` : "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {teacherTab === "students" && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="glass-dark rounded-2xl p-5">
                  <div className="mono text-xs text-slate-400 tracking-widest mb-4">AGREGAR ALUMNO</div>
                  <div className="space-y-3">
                    <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Nombre" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                    <input value={newStudentCode} onChange={e => setNewStudentCode(e.target.value)} placeholder="Código" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm mono" />
                    <button onClick={addStudent} className="btn-accent w-full px-4 py-3 text-sm">+ Agregar</button>
                  </div>
                </div>
                <div className="glass-dark rounded-2xl p-5">
                  <div className="mono text-xs text-slate-400 tracking-widest mb-4">ALUMNOS ({appState.students.length})</div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">{appState.students.map(s => (
                    <div key={s.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">{s.name} {s.passwordChanged && <span className="badge badge-green" style={{fontSize:"9px"}}>🔑 pass propia</span>}</div>
                        <div className="mono text-xs text-slate-500">{s.code}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.passwordChanged && <button onClick={() => { if (window.confirm("Resetear la contraseña de " + s.name + " al código original?")) resetStudentPassword(s.id); }} className="text-yellow-400 text-xs hover:text-yellow-300 transition">Resetear</button>}
                        {!defaultStudents.some(d => d.id === s.id) && <button onClick={() => removeStudent(s.id)} className="text-rose-400 text-xs hover:text-rose-300">Eliminar</button>}
                      </div>
                    </div>
                  ))}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map(c => <button key={c} onClick={() => setActiveCategory(c)} className={`tab whitespace-nowrap ${activeCategory === c ? "active" : ""}`}>{c}</button>)}
        </div>

        {/* REVIEW MODE BANNER */}
        {reviewMode && (
          <div className="glass-accent rounded-2xl px-5 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap ani">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔁</span>
              <div>
                <div className="font-bold text-sm text-yellow-300">Modo Repaso Inteligente</div>
                <div className="text-xs text-slate-400">{reviewModules.length} módulo{reviewModules.length !== 1 ? "s" : ""} para repasar · Los módulos amarillos necesitan práctica</div>
              </div>
            </div>
            <button onClick={() => setReviewMode(false)} className="glass rounded-xl px-4 py-2 text-xs text-slate-300 hover:text-white transition">✕ Salir del repaso</button>
          </div>
        )}

        {/* MODULE GRID */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 mb-6">
          {filtered.map(m => {
            const p = sp[m.id]; const active = m.id === selectedModuleId;
            return (
              <button key={m.id} onClick={() => setSelectedModuleId(m.id)} className={`module-card glass rounded-2xl p-3 text-left border ${active ? "active" : reviewMode && reviewModules.some(r => r.id === m.id) ? "needs-review border-yellow-500/30" : "border-white/5"}`}>
                <div className="text-xl mb-1">{m.emoji}</div>
                <div className="text-xs text-slate-400 mb-0.5">{m.category}</div>
                <div className="font-bold text-xs leading-tight">{m.title}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${LEVEL_COLOR[m.level]}`} style={{ fontSize: "9px" }}>{m.level}</span>
                  <span className={`mono text-xs font-bold ${p ? "accent" : "text-slate-600"}`}>{p ? `${p.score}/${p.total}` : "—"}</span>
                </div>
                {p && <div className="mt-1.5 progress-bar"><div className="progress-fill" style={{ width: `${Math.round((p.score / p.total) * 100)}%` }} /></div>}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="glass rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-green">{mod.category}</span>
                    <span className={`badge ${mod.level === "Básico" ? "badge-green" : mod.level === "Intermedio" ? "badge-yellow" : "badge-red"}`}>{mod.level}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{mod.emoji} {mod.title}</h2>
                  <p className="mt-1 text-slate-400 text-sm">{mod.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">

                  <div className="glass rounded-xl px-3 py-1.5 text-xs"><span className="text-slate-400">Mejor: </span><span className="font-bold accent mono">{mp.score}/{mp.total}</span></div>
                  {mp.attempts > 0 && <div className="glass rounded-xl px-3 py-1.5 text-xs"><span className="text-slate-400">Intentos: </span><span className="font-bold mono">{mp.attempts}</span></div>}
                </div>
              </div>
              <div className="flex gap-2 mt-5 flex-wrap">
                {(["reading", "quiz", "dictation", "vocab", "flashcards"] as const).map(s => (
                  <button key={s} onClick={() => s === "quiz" ? startQuiz() : setSection(s)} className={`tab ${section === s ? "active" : ""}`}>
                    {s === "reading" ? "📖 Lectura" : s === "quiz" ? "✏️ Quiz" : s === "dictation" ? "🎙 Dictado" : s === "vocab" ? "📝 Vocab" : "🃏 Flashcards"}
                  </button>
                ))}
              </div>
            </div>

            {section === "reading" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">{mod.readingTitle}</h3>
                  <button onClick={() => speak(mod.reading.join(" "), 0.9)} className="glass rounded-xl px-4 py-2 text-sm text-slate-300 hover:text-white transition">🔊 Escuchar</button>
                </div>
                <div className="space-y-6">
                  {mod.reading.map((p, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full accent-bg flex items-center justify-center text-xs font-black text-slate-900 mt-1">{i + 1}</div>
                      <p className="reading-text flex-1">{p}</p>
                    </div>
                  ))}
                </div>
                <button onClick={startQuiz} className="btn-accent mt-6 px-6 py-3 text-sm">Ir al quiz →</button>
              </div>
            )}

            {section === "quiz" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">Quiz de comprensión</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke={timeLeft <= 10 ? "#f87171" : "#63CAB7"} strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - timeLeft / QUIZ_TIME)}`}
                          style={{ transition: "stroke-dashoffset 0.5s linear" }} strokeLinecap="round" />
                      </svg>
                      <div className={`absolute inset-0 flex items-center justify-center mono text-xs font-bold ${timeLeft <= 10 ? "text-rose-400" : "accent"}`}>{timeLeft}</div>
                    </div>
                    <div className="glass rounded-xl px-4 py-2 mono text-sm font-bold accent">{qIdx + 1}/{mod.quiz.length}</div>
                  </div>
                </div>
                <div className="progress-bar mb-5"><div className="progress-fill" style={{ width: `${((qIdx + (submitted ? 1 : 0)) / mod.quiz.length) * 100}%` }} /></div>
                <div className="glass-dark rounded-2xl p-5">
                  <p className="text-lg font-semibold mb-4">{q.question}</p>
                  <div className="space-y-3">
                    {q.options.map(opt => {
                      const sel = selectedOption === opt; const ok = submitted && opt === q.answer; const bad = submitted && sel && opt !== q.answer;
                      return <button key={opt} onClick={() => !submitted && setAns(opt)} disabled={submitted} className={`opt ${ok ? "ok" : bad ? "bad" : sel ? "sel" : ""}`}>{opt}</button>;
                    })}
                  </div>
                </div>
                {submitted && (
                  <div className={`mt-4 rounded-2xl px-5 py-4 ani ${isOk ? "bg-emerald-900/30 border border-emerald-500/30" : "bg-rose-900/30 border border-rose-500/30"}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{isOk ? "✅" : "❌"}</span>
                      <div>
                        <div className={`font-bold text-sm ${isOk ? "text-emerald-300" : "text-rose-300"}`}>
                          {isOk ? "¡Correcto!" : `Respuesta correcta: ${q.answer}`}
                        </div>
                        {q.explanation && <div className="text-slate-300 text-sm mt-1 leading-6">{q.explanation}</div>}
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm">{!submitted && <span className="text-slate-500">Elegí antes de que el tiempo se acabe.</span>}</div>
                  {!submitted ? <button onClick={handleSubmit} disabled={!selectedOption} className="btn-accent px-6 py-3 text-sm">Comprobar</button>
                    : <button onClick={handleNext} className="btn-accent px-6 py-3 text-sm">{qIdx < mod.quiz.length - 1 ? "Siguiente →" : "Finalizar ✓"}</button>}
                </div>
              </div>
            )}

            {section === "dictation" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">🎙 Dictado</h3>
                  <button onClick={() => speak(mod.dictation, 0.75)} className="glass rounded-xl px-4 py-2 text-sm text-slate-300 hover:text-white transition">🔊 Reproducir</button>
                </div>
                <p className="text-slate-400 text-sm mb-4">Escuchá el audio y escribí la frase completa en español.</p>
                <textarea value={dictText} onChange={e => setDictText(e.target.value)} rows={4} placeholder="Escribí lo que escuchaste..." className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-white px-5 py-4 text-sm leading-7 resize-none" />
                <button onClick={checkDict} className="btn-accent mt-4 px-6 py-3 text-sm">Corregir</button>
                {(dictResult || curDict) && (() => { const r = dictResult || curDict!; return (
                  <div className="mt-5 glass-dark rounded-2xl p-5 space-y-3 ani">
                    <div className="flex items-center gap-3">
                      <div className={`text-4xl font-black mono ${r.score >= 80 ? "text-emerald-400" : r.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>{r.score}%</div>
                      <div className="text-sm text-slate-400">{r.score === 100 ? "¡Perfecto! 🎉" : r.score >= 80 ? "¡Muy bien! 🌟" : r.score >= 50 ? "Buen intento 💪" : "Seguí practicando 📚"}</div>
                    </div>
                    <div className="text-sm"><span className="text-slate-400">Frase modelo: </span><span className="text-slate-200 italic">{r.expected}</span></div>
                  </div>
                ); })()}
              </div>
            )}

            {section === "vocab" && (
              <div className="glass rounded-3xl p-6 ani">
                <h3 className="text-xl font-bold mb-5">📝 Vocabulario clave</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {mod.vocab.map(v => (
                    <div key={v.es} className="glass-dark rounded-2xl px-5 py-4 hover-lift" style={{ cursor: "default" }}>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="font-bold text-white">{v.es}</div>
                          <div className="text-xs text-slate-500 mt-1 mono tracking-wider">🇦🇷 ESPAÑOL</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold accent">{v.pt}</div>
                          <div className="text-xs text-slate-500 mt-1 mono tracking-wider">🇧🇷 PORTUGUÊS</div>
                        </div>
                      </div>
                      <button onClick={() => speak(v.es, 0.85)} className="mt-3 text-xs text-slate-500 hover:accent transition">🔊 Escuchar en español</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === "flashcards" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold">🃏 Flashcards</h3>
                  <div className="glass rounded-xl px-4 py-2 mono text-sm accent">{fcIdx + 1}/{mod.vocab.length}</div>
                </div>
                <p className="text-slate-400 text-sm mb-5">Tocá la tarjeta para ver la traducción.</p>
                <div className="fc" onClick={() => setFcFlipped(f => !f)}>
                  <div className={`fc-inner ${fcFlipped ? "flip" : ""}`}>
                    <div className="fc-face fc-front">{mod.vocab[fcIdx].es}</div>
                    <div className="fc-face fc-back">{mod.vocab[fcIdx].pt}</div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5 justify-center">
                  <button onClick={() => { setFcIdx(i => Math.max(0, i - 1)); setFcFlipped(false); }} disabled={fcIdx === 0} className="btn-accent px-5 py-3 text-sm">← Anterior</button>
                  <button onClick={() => { setFcIdx(i => Math.min(mod.vocab.length - 1, i + 1)); setFcFlipped(false); }} disabled={fcIdx === mod.vocab.length - 1} className="btn-accent px-5 py-3 text-sm">Siguiente →</button>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4">
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">MI PROGRESO</div>
              <div className="text-5xl font-black accent mono">{pct}%</div>
              <div className="text-slate-400 text-sm mt-1">completado</div>
              <div className="mt-4 progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="glass-dark rounded-2xl p-3"><div className="mono text-lg font-black">{completedMods}</div><div className="text-xs text-slate-400">Módulos</div></div>
                <div className="glass-dark rounded-2xl p-3"><div className="mono text-lg font-black accent">{totalScore}</div><div className="text-xs text-slate-400">Puntos</div></div>
              </div>
              {allDone && <button onClick={() => setShowCert(true)} className="btn-accent w-full mt-4 py-3 text-sm">🎓 Ver certificado</button>}
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">🏆 RANKING</div>
              <div className="space-y-2">
                {ranking.slice(0, 5).map((r, i) => (
                  <div key={r.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.id === student.id ? "bg-white/10" : ""}`}>
                    <span className={`text-sm font-bold w-6 ${i === 0 ? "m1" : i === 1 ? "m2" : i === 2 ? "m3" : "text-slate-500"}`}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}</span>
                    <span className={`text-sm flex-1 ${r.id === student.id ? "text-white font-semibold" : "text-slate-300"}`}>{r.name}</span>
                    <span className="mono text-xs font-bold accent">{r.pts}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">MÓDULOS</div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {MODULES.map(m => {
                  const p = sp[m.id]; const isActive = m.id === selectedModuleId;
                  return (
                    <button key={m.id} onClick={() => setSelectedModuleId(m.id)} className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left transition ${isActive ? "bg-white/10" : "hover:bg-white/5"}`}>
                      <span className="text-sm">{m.emoji}</span>
                      <div className="flex-1 min-w-0"><div className={`text-xs font-medium truncate ${isActive ? "text-white" : "text-slate-300"}`}>{m.title}</div></div>
                      {p ? <span className="mono text-xs font-bold accent">{p.score}/{p.total}</span> : <span className="text-slate-600 text-xs">—</span>}
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