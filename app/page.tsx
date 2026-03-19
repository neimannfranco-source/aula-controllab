"use client";

import { useEffect, useMemo, useState } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type VocabItem = { es: string; pt: string };
type QuizQuestion = { question: string; options: string[]; answer: string };
type ModuleType = {
  id: string;
  title: string;
  level: string;
  category: string;
  emoji: string;
  description: string;
  readingTitle: string;
  reading: string[];
  vocab: VocabItem[];
  quiz: QuizQuestion[];
  dictation: string;
};
type Student = { id: string; name: string; code: string };
type ModuleProgress = { completed: boolean; score: number; total: number; attempts: number };
type DictationResult = { exact: boolean; score: number; written: string; expected: string; updatedAt: string };
type AppState = {
  students: Student[];
  currentStudentId: string | null;
  progress: Record<string, Record<string, ModuleProgress>>;
  dictations: Record<string, Record<string, DictationResult>>;
};

/* ─────────────────────────────────────────────
   MODULES — LAB + IT + COMUNICACIÓN
───────────────────────────────────────────── */
const MODULES: ModuleType[] = [
  /* ── LABORATORIO ─────────────────────────── */
  {
    id: "control-interno",
    title: "Control interno",
    level: "Intermedio",
    category: "Laboratorio",
    emoji: "🔬",
    description: "Monitoreo analítico, tendencias y decisiones preventivas.",
    readingTitle: "Una desviación que parecía pequeña",
    reading: [
      "Durante una revisión de rutina, el equipo técnico detectó una desviación en los controles internos de uno de los analitos más procesados de la semana. Al principio, la diferencia parecía pequeña, pero al comparar los datos con los registros históricos, observaron que la tendencia se repetía desde hacía varios días.",
      "La supervisora decidió reunir al equipo para revisar materiales de control, curvas de calibración, lotes de reactivos y condiciones de almacenamiento. Concluyeron que la causa más probable era una combinación entre una variación del reactivo y una calibración que ya no representaba de manera precisa el desempeño real del método.",
      "Como medida preventiva, suspendieron temporalmente la liberación de algunos resultados, repitieron las corridas y comunicaron el hallazgo al área responsable. El caso reforzó la importancia de identificar tendencias antes de que aparezca un error mayor.",
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
      { question: "¿Qué detectó primero el equipo técnico?", options: ["Un error en la facturación", "Una desviación en los controles internos", "Una falla en el equipo de refrigeración"], answer: "Una desviación en los controles internos" },
      { question: "¿Qué decisión tomó el equipo como medida preventiva?", options: ["Cambiar a todo el personal", "Suspender temporalmente la liberación de algunos resultados", "Descartar todo el equipamiento"], answer: "Suspender temporalmente la liberación de algunos resultados" },
      { question: "¿Por qué es importante identificar tendencias a tiempo?", options: ["Para reducir reuniones", "Para evitar errores mayores y proteger la calidad", "Para eliminar controles innecesarios"], answer: "Para evitar errores mayores y proteger la calidad" },
    ],
    dictation: "El equipo detectó una desviación en los controles internos y suspendió temporalmente la liberación de resultados para proteger la calidad del proceso.",
  },
  {
    id: "westgard",
    title: "Reglas de Westgard",
    level: "Intermedio",
    category: "Laboratorio",
    emoji: "📊",
    description: "Análisis de reglas y toma de decisiones en el laboratorio.",
    readingTitle: "Una alerta en el turno de la mañana",
    reading: [
      "En el turno de la mañana, una analista observó que uno de los niveles de control presentaba un comportamiento inusual. El valor no estaba extremadamente alejado de la media, pero al revisar la secuencia de resultados notó un patrón compatible con una regla de advertencia.",
      "Antes de continuar con la rutina, el equipo decidió verificar si el comportamiento correspondía a una variación aleatoria o a un problema sistemático. Para eso, compararon ambos niveles de control, revisaron la precisión reciente del método y analizaron si existían cambios de lote, calibración o mantenimiento.",
      "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras y a justificar técnicamente cada acción frente a auditorías o consultas de clientes.",
    ],
    vocab: [
      { es: "regla de advertencia", pt: "regra de alerta" },
      { es: "media", pt: "média" },
      { es: "precisión", pt: "precisão" },
      { es: "rechazar la corrida", pt: "rejeitar a corrida" },
      { es: "problema sistemático", pt: "problema sistemático" },
      { es: "variación aleatoria", pt: "variação aleatória" },
    ],
    quiz: [
      { question: "¿Qué observó la analista en el control?", options: ["Un comportamiento inusual", "Una caída del sistema", "Una pérdida de datos"], answer: "Un comportamiento inusual" },
      { question: "¿Qué quiso determinar el equipo?", options: ["Si el problema era aleatorio o sistemático", "Si había que cambiar de laboratorio", "Si el cliente aceptaría el resultado"], answer: "Si el problema era aleatorio o sistemático" },
      { question: "Las reglas de Westgard ayudan a...", options: ["Evitar todo control", "Tomar decisiones seguras y justificarlas", "Trabajar sin registros"], answer: "Tomar decisiones seguras y justificarlas" },
    ],
    dictation: "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras y a justificar técnicamente cada acción del laboratorio.",
  },
  {
    id: "trazabilidad",
    title: "Trazabilidad y registros",
    level: "Intermedio",
    category: "Laboratorio",
    emoji: "📋",
    description: "Registros, documentación y seguimiento operativo.",
    readingTitle: "Cuando faltaba una parte del historial",
    reading: [
      "Durante una auditoría interna, el equipo encontró una inconsistencia en el historial de una muestra. El resultado final estaba documentado, pero faltaban registros intermedios que explicaran claramente el recorrido completo del proceso.",
      "La coordinadora recordó que la trazabilidad no es solo una exigencia documental. También es una herramienta para reconstruir decisiones, verificar responsabilidades y reducir el riesgo de errores no detectados.",
      "Después del análisis, el área actualizó su checklist operativo y reforzó la importancia de registrar cada etapa con precisión. La mejora no solo ayudó a la auditoría, sino también a la organización diaria del equipo.",
    ],
    vocab: [
      { es: "trazabilidad", pt: "rastreabilidade" },
      { es: "registro", pt: "registro" },
      { es: "recorrido del proceso", pt: "percurso do processo" },
      { es: "checklist", pt: "checklist" },
      { es: "inconsistencia", pt: "inconsistência" },
      { es: "responsabilidad", pt: "responsabilidade" },
    ],
    quiz: [
      { question: "¿Qué problema apareció en la auditoría?", options: ["Faltaban registros intermedios", "Se cortó la luz", "No había clientes"], answer: "Faltaban registros intermedios" },
      { question: "¿Para qué sirve la trazabilidad?", options: ["Solo para cumplir documentos", "Para reconstruir decisiones y verificar responsabilidades", "Para reducir reuniones"], answer: "Para reconstruir decisiones y verificar responsabilidades" },
      { question: "¿Qué hizo el área después del análisis?", options: ["Actualizó su checklist", "Cerró el sector", "Eliminó registros"], answer: "Actualizó su checklist" },
    ],
    dictation: "La trazabilidad permite reconstruir decisiones, verificar responsabilidades y reducir el riesgo de errores no detectados.",
  },
  {
    id: "validacion",
    title: "Validación del método",
    level: "Avanzado",
    category: "Laboratorio",
    emoji: "✅",
    description: "Validación, precisión, exactitud y robustez de métodos analíticos.",
    readingTitle: "Antes de implementar el nuevo método",
    reading: [
      "Antes de implementar un nuevo método, el equipo necesitaba demostrar que su desempeño era adecuado para el uso previsto. No bastaba con que el procedimiento fuera rápido o práctico: también debía mostrar precisión, exactitud y estabilidad en diferentes condiciones.",
      "Durante la validación, compararon resultados, revisaron repeticiones y evaluaron posibles interferencias. Cada dato debía ser interpretado con criterio técnico, porque una conclusión apresurada podía afectar la confiabilidad del proceso completo.",
      "Validar no es solo llenar una planilla. Es comprender cómo responde el método, cuáles son sus límites y en qué condiciones puede ofrecer resultados consistentes.",
    ],
    vocab: [
      { es: "validación", pt: "validação" },
      { es: "exactitud", pt: "exatidão" },
      { es: "robustez", pt: "robustez" },
      { es: "interferencia", pt: "interferência" },
      { es: "desempeño", pt: "desempenho" },
      { es: "uso previsto", pt: "uso pretendido" },
    ],
    quiz: [
      { question: "¿Qué debía demostrar el equipo?", options: ["Que el método era adecuado para el uso previsto", "Que el laboratorio era el más grande", "Que no hacía falta revisar datos"], answer: "Que el método era adecuado para el uso previsto" },
      { question: "¿Qué evaluaron durante la validación?", options: ["Solo la velocidad", "Resultados, repeticiones e interferencias", "Solo el costo"], answer: "Resultados, repeticiones e interferencias" },
      { question: "Validar un método significa...", options: ["Llenar una planilla sin analizar", "Comprender cómo responde y sus límites", "Trabajar sin criterios técnicos"], answer: "Comprender cómo responde y sus límites" },
    ],
    dictation: "Validar un método significa comprender cómo responde, cuáles son sus límites y en qué condiciones ofrece resultados consistentes.",
  },
  {
    id: "muestras",
    title: "Manejo de muestras",
    level: "Básico",
    category: "Laboratorio",
    emoji: "🧪",
    description: "Recepción, identificación, conservación y rechazo de muestras.",
    readingTitle: "La muestra que llegó sin identificar",
    reading: [
      "Una mañana, el área de recepción recibió varias muestras de un hospital nuevo. Algunas venían sin etiqueta o con información incompleta. El equipo tuvo que decidir rápidamente cuáles podían procesarse y cuáles debían ser rechazadas o aclaradas con el cliente.",
      "El protocolo de recepción establece criterios claros: volumen mínimo, tipo de tubo, temperatura de conservación y datos de identificación obligatorios. Cuando una muestra no cumple estos requisitos, el analista debe comunicarlo de manera profesional y registrar el motivo del rechazo.",
      "Ese episodio impulsó al equipo a mejorar la comunicación con el hospital y a crear un instructivo específico para la preparación de muestras antes del envío.",
    ],
    vocab: [
      { es: "muestra", pt: "amostra" },
      { es: "recepción", pt: "recepção" },
      { es: "etiqueta", pt: "etiqueta / rótulo" },
      { es: "rechazo", pt: "rejeição" },
      { es: "conservación", pt: "conservação" },
      { es: "criterio", pt: "critério" },
    ],
    quiz: [
      { question: "¿Qué problema tenían algunas muestras al llegar?", options: ["Estaban congeladas", "Venían sin etiqueta o con información incompleta", "Eran del tipo equivocado de análisis"], answer: "Venían sin etiqueta o con información incompleta" },
      { question: "¿Qué establece el protocolo de recepción?", options: ["Criterios claros para aceptar o rechazar muestras", "Que toda muestra debe procesarse", "Que el cliente nunca se equivoca"], answer: "Criterios claros para aceptar o rechazar muestras" },
      { question: "¿Qué hizo el equipo después del episodio?", options: ["Ignoró el problema", "Mejoró la comunicación y creó un instructivo", "Rechazó a todos los nuevos clientes"], answer: "Mejoró la comunicación y creó un instructivo" },
    ],
    dictation: "Cuando una muestra no cumple los criterios de recepción, el analista debe comunicarlo de forma profesional y registrar el motivo del rechazo.",
  },
  /* ── GESTIÓN / CALIDAD ─────────────────── */
  {
    id: "indicadores",
    title: "Indicadores de calidad",
    level: "Intermedio",
    category: "Gestión",
    emoji: "📈",
    description: "Interpretar y discutir indicadores, metas y desvíos operativos.",
    readingTitle: "Cuando el indicador no cuenta toda la historia",
    reading: [
      "En la reunión mensual, el equipo revisó los principales indicadores del área. A simple vista, el tiempo medio de respuesta parecía estable y la cantidad de no conformidades había disminuido. Sin embargo, una analista señaló que algunos retrasos críticos no estaban siendo suficientemente visibles en el promedio general.",
      "A partir de esa observación, la coordinación propuso desagregar los datos por tipo de cliente, franja horaria y complejidad del ensayo. Esa decisión permitió identificar que ciertos procesos especiales estaban generando impactos mayores que no aparecían en el informe resumido.",
      "Un indicador aislado puede ser útil, pero no siempre explica el contexto completo. Para una buena gestión, es fundamental cruzar datos, comparar tendencias y discutir el significado operativo de cada número.",
    ],
    vocab: [
      { es: "indicador", pt: "indicador" },
      { es: "desagregar datos", pt: "desagregar dados" },
      { es: "no conformidad", pt: "não conformidade" },
      { es: "promedio general", pt: "média geral" },
      { es: "toma de decisiones", pt: "tomada de decisão" },
      { es: "tendencia", pt: "tendência" },
    ],
    quiz: [
      { question: "¿Qué parecía estable al comienzo de la reunión?", options: ["El tiempo medio de respuesta", "La rotación de personal", "El presupuesto anual"], answer: "El tiempo medio de respuesta" },
      { question: "¿Qué propuso la coordinación?", options: ["Eliminar los indicadores", "Desagregar los datos por distintos criterios", "Suspender las reuniones"], answer: "Desagregar los datos por distintos criterios" },
      { question: "La idea principal del texto es que...", options: ["Un indicador aislado siempre es suficiente", "El contexto importa para interpretar los números", "Los informes deben eliminarse"], answer: "El contexto importa para interpretar los números" },
    ],
    dictation: "Para una buena gestión, es fundamental cruzar datos, comparar tendencias y discutir el significado operativo de cada número.",
  },
  {
    id: "no-conformidades",
    title: "No conformidades y CAPA",
    level: "Intermedio",
    category: "Gestión",
    emoji: "⚠️",
    description: "Detección, registro y acciones correctivas y preventivas.",
    readingTitle: "El mismo error dos veces",
    reading: [
      "El área de calidad registró una no conformidad relacionada con un error en el etiquetado de muestras. No era la primera vez que ocurría algo similar. Al revisar los registros, encontraron que un episodio parecido había sido cerrado seis meses antes sin una acción correctiva real.",
      "Esta vez, el equipo decidió aplicar un análisis de causa raíz. Identificaron que el problema no era individual sino estructural: el procedimiento escrito estaba desactualizado y no reflejaba el flujo real de trabajo.",
      "Se implementó una acción correctiva que incluyó actualizar el procedimiento, capacitar al personal y definir un indicador de seguimiento. La CAPA fue documentada y se programó una verificación de eficacia a los 30 días.",
    ],
    vocab: [
      { es: "no conformidad", pt: "não conformidade" },
      { es: "acción correctiva", pt: "ação corretiva" },
      { es: "acción preventiva", pt: "ação preventiva" },
      { es: "causa raíz", pt: "causa raiz" },
      { es: "verificación de eficacia", pt: "verificação de eficácia" },
      { es: "CAPA", pt: "CAPA (ação corretiva e preventiva)" },
    ],
    quiz: [
      { question: "¿Por qué el problema se repitió?", options: ["Por falta de muestras", "Porque la acción correctiva anterior no fue real", "Por un error del cliente"], answer: "Porque la acción correctiva anterior no fue real" },
      { question: "¿Qué encontraron al analizar la causa raíz?", options: ["Que era un error individual", "Que el procedimiento estaba desactualizado", "Que faltaban reactivos"], answer: "Que el procedimiento estaba desactualizado" },
      { question: "¿Qué se programó a los 30 días?", options: ["Una reunión social", "Una verificación de eficacia", "Una nueva auditoría externa"], answer: "Una verificación de eficacia" },
    ],
    dictation: "Una acción correctiva debe incluir el análisis de causa raíz, la actualización del procedimiento y una verificación de eficacia posterior.",
  },
  /* ── COMUNICACIÓN ──────────────────────── */
  {
    id: "atencion-cliente",
    title: "Atención técnica al cliente",
    level: "Intermedio",
    category: "Comunicación",
    emoji: "📞",
    description: "Español profesional para explicar resultados y gestionar dudas.",
    readingTitle: "Una llamada que exigía claridad",
    reading: [
      "Un cliente llamó al área técnica porque no entendía por qué el informe más reciente mostraba una diferencia respecto del mes anterior. Aunque el resultado estaba correctamente validado, el cliente necesitaba una explicación clara y comprensible.",
      "La analista evitó respuestas demasiado rápidas. Primero escuchó la duda completa, confirmó qué información tenía el cliente y después explicó la situación paso a paso, usando un lenguaje técnico pero accesible.",
      "En contextos de atención técnica, no alcanza con tener razón: también es necesario explicar con claridad, transmitir confianza y verificar que el cliente realmente haya entendido.",
    ],
    vocab: [
      { es: "duda", pt: "dúvida" },
      { es: "informe", pt: "relatório" },
      { es: "validado", pt: "validado" },
      { es: "con cautela", pt: "com cautela" },
      { es: "transmitir confianza", pt: "transmitir confiança" },
      { es: "explicar paso a paso", pt: "explicar passo a passo" },
    ],
    quiz: [
      { question: "¿Por qué llamó el cliente?", options: ["Porque no entendía una diferencia en el informe", "Porque quería cambiar de proveedor", "Porque perdió la contraseña"], answer: "Porque no entendía una diferencia en el informe" },
      { question: "¿Qué hizo primero la analista?", options: ["Cortó la llamada", "Escuchó la duda completa", "Envió un correo automático"], answer: "Escuchó la duda completa" },
      { question: "En atención técnica también hay que...", options: ["Hablar rápido", "Transmitir claridad y confianza", "Usar solo términos complejos"], answer: "Transmitir claridad y confianza" },
    ],
    dictation: "En atención técnica no alcanza con tener razón: también es necesario explicar con claridad y transmitir confianza.",
  },
  {
    id: "correo-tecnico",
    title: "Correo técnico profesional",
    level: "Básico",
    category: "Comunicación",
    emoji: "✉️",
    description: "Redactar correos técnicos claros y profesionales en español.",
    readingTitle: "Un correo que generó confusión",
    reading: [
      "El área de soporte recibió una respuesta negativa de un cliente luego de enviar un correo técnico sobre el cambio de metodología. Al releer el mensaje, el equipo notó que la información era correcta pero la redacción era poco clara: oraciones largas, sin saludo inicial y con términos sin explicación.",
      "Un correo técnico efectivo tiene estructura: saludo profesional, contexto breve, información principal, próximos pasos y cierre cordial. Cada parte cumple una función y ayuda al lector a procesar la información sin esfuerzo.",
      "Después de reescribir el correo con esa estructura, el cliente respondió positivamente y agradeció la claridad. La forma en que se comunica la información técnica afecta directamente la percepción del servicio.",
    ],
    vocab: [
      { es: "redacción", pt: "redação" },
      { es: "saludo", pt: "saudação" },
      { es: "cierre cordial", pt: "encerramento cordial" },
      { es: "próximos pasos", pt: "próximos passos" },
      { es: "percepción", pt: "percepção" },
      { es: "estructura", pt: "estrutura" },
    ],
    quiz: [
      { question: "¿Por qué el correo generó confusión?", options: ["Porque tenía errores técnicos", "Porque la redacción era poco clara", "Porque lo envió la persona equivocada"], answer: "Porque la redacción era poco clara" },
      { question: "¿Qué incluye la estructura de un buen correo técnico?", options: ["Solo la información técnica", "Saludo, contexto, información, próximos pasos y cierre", "Solo el problema y la solución"], answer: "Saludo, contexto, información, próximos pasos y cierre" },
      { question: "¿Cómo respondió el cliente al nuevo correo?", options: ["Negativamente", "Positivamente y agradeció la claridad", "No respondió"], answer: "Positivamente y agradeció la claridad" },
    ],
    dictation: "Un correo técnico efectivo tiene saludo profesional, contexto breve, información clara, próximos pasos y cierre cordial.",
  },
  /* ── TI / SISTEMAS ─────────────────────── */
  {
    id: "helpdesk",
    title: "Soporte técnico (Helpdesk)",
    level: "Básico",
    category: "Tecnología",
    emoji: "💻",
    description: "Vocabulario y comunicación para el soporte técnico interno.",
    readingTitle: "El sistema que no abría",
    reading: [
      "Un lunes a la mañana, varios analistas reportaron que el sistema de gestión de laboratorio no respondía. El área de TI recibió múltiples tickets al mismo tiempo. La primera tarea fue clasificar los reportes: ¿era un problema generalizado o afectaba solo a algunos usuarios?",
      "El técnico de soporte revisó el servidor, verificó los accesos y detectó que una actualización automática había generado un conflicto con el módulo de impresión de resultados. El problema fue aislado y resuelto en menos de una hora.",
      "La experiencia reforzó la importancia de tener un canal de reporte claro, documentar los incidentes y comunicar el estado de la resolución a los usuarios afectados.",
    ],
    vocab: [
      { es: "ticket", pt: "chamado / ticket" },
      { es: "servidor", pt: "servidor" },
      { es: "actualización", pt: "atualização" },
      { es: "incidente", pt: "incidente" },
      { es: "usuario", pt: "usuário" },
      { es: "soporte técnico", pt: "suporte técnico" },
    ],
    quiz: [
      { question: "¿Cuál fue el primer paso del técnico de soporte?", options: ["Reinstalar el sistema", "Clasificar si era un problema generalizado o local", "Llamar al proveedor externo"], answer: "Clasificar si era un problema generalizado o local" },
      { question: "¿Qué causó el problema?", options: ["Una muestra mal procesada", "Una actualización automática con conflicto", "Un error del usuario"], answer: "Una actualización automática con conflicto" },
      { question: "¿Qué reforzó la experiencia?", options: ["Que los sistemas nunca fallan", "La importancia de documentar y comunicar incidentes", "Que el soporte no es necesario"], answer: "La importancia de documentar y comunicar incidentes" },
    ],
    dictation: "Es importante documentar los incidentes técnicos y comunicar el estado de la resolución a todos los usuarios afectados.",
  },
  {
    id: "seguridad-datos",
    title: "Seguridad de datos",
    level: "Intermedio",
    category: "Tecnología",
    emoji: "🔒",
    description: "Protección de datos, accesos y buenas prácticas en sistemas.",
    readingTitle: "Una contraseña compartida",
    reading: [
      "Durante una auditoría de seguridad, se descubrió que varios usuarios del laboratorio compartían la misma contraseña para acceder al sistema de resultados. Aunque todos confiaban entre sí, la práctica representaba un riesgo real: si alguien modificaba un resultado, sería imposible saber quién lo había hecho.",
      "El área de TI implementó una política de accesos individuales, contraseñas seguras y autenticación con doble factor para los módulos más sensibles. También se estableció un registro de auditoría que quedaba guardado automáticamente.",
      "La seguridad de los datos no es solo una exigencia regulatoria: es una forma de proteger la integridad de los resultados y la confianza del cliente.",
    ],
    vocab: [
      { es: "contraseña", pt: "senha" },
      { es: "acceso", pt: "acesso" },
      { es: "doble factor", pt: "duplo fator" },
      { es: "auditoría de seguridad", pt: "auditoria de segurança" },
      { es: "integridad de datos", pt: "integridade de dados" },
      { es: "registro de auditoría", pt: "registro de auditoria" },
    ],
    quiz: [
      { question: "¿Qué práctica de riesgo se descubrió?", options: ["Que apagaban los servidores", "Que varios usuarios compartían la misma contraseña", "Que no usaban el sistema"], answer: "Que varios usuarios compartían la misma contraseña" },
      { question: "¿Qué implementó TI para mejorar la seguridad?", options: ["Solo cambiar contraseñas", "Accesos individuales, contraseñas seguras y doble factor", "Cerrar el acceso a todos"], answer: "Accesos individuales, contraseñas seguras y doble factor" },
      { question: "La seguridad de datos protege principalmente...", options: ["El servidor físico", "La integridad de los resultados y la confianza del cliente", "El presupuesto del área"], answer: "La integridad de los resultados y la confianza del cliente" },
    ],
    dictation: "La seguridad de los datos protege la integridad de los resultados y la confianza del cliente, y no es solo una exigencia regulatoria.",
  },
  {
    id: "lims",
    title: "Sistema LIMS",
    level: "Intermedio",
    category: "Tecnología",
    emoji: "🖥️",
    description: "Gestión de información de laboratorio: flujo, trazabilidad y reportes.",
    readingTitle: "El flujo digital de una muestra",
    reading: [
      "Desde que llega al laboratorio, cada muestra deja un rastro digital en el sistema LIMS. El número de recepción, el analista asignado, el instrumento utilizado, los controles de calidad asociados y el resultado final quedan registrados y vinculados entre sí.",
      "Cuando un cliente solicita una revisión de resultados históricos, el LIMS permite recuperar toda esa información en segundos. Esto no solo ahorra tiempo: también demuestra que el proceso fue controlado y documentado en cada etapa.",
      "Un LIMS bien configurado reduce errores de transcripción, facilita la trazabilidad y permite generar informes automáticos. Su correcto uso es parte fundamental del trabajo de todo el equipo.",
    ],
    vocab: [
      { es: "LIMS", pt: "LIMS (Sistema de Gestão de Informação de Laboratório)" },
      { es: "rastro digital", pt: "rastro digital" },
      { es: "transcripción", pt: "transcrição" },
      { es: "informe automático", pt: "relatório automático" },
      { es: "vinculado", pt: "vinculado" },
      { es: "recuperar información", pt: "recuperar informação" },
    ],
    quiz: [
      { question: "¿Qué queda registrado en el LIMS?", options: ["Solo el resultado final", "Recepción, analista, instrumento, controles y resultado", "Solo el nombre del cliente"], answer: "Recepción, analista, instrumento, controles y resultado" },
      { question: "¿Qué permite el LIMS cuando un cliente solicita una revisión?", options: ["Nada, hay que buscar en papel", "Recuperar toda la información rápidamente", "Reiniciar el proceso desde cero"], answer: "Recuperar toda la información rápidamente" },
      { question: "Un LIMS bien configurado...", options: ["Reemplaza al analista", "Reduce errores y facilita la trazabilidad", "Solo sirve para facturación"], answer: "Reduce errores y facilita la trazabilidad" },
    ],
    dictation: "Un LIMS bien configurado reduce errores de transcripción, facilita la trazabilidad y permite generar informes automáticos.",
  },
];

/* ─────────────────────────────────────────────
   STUDENTS
───────────────────────────────────────────── */
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
  { id: "anapaulа", name: "Ana Paula", code: "ANAPAULA" },
  { id: "lucas", name: "Lucas", code: "LUCAS" },
  { id: "katia", name: "Katia", code: "KATIA" },
  { id: "vinicius", name: "Vinicius", code: "VINICIUS" },
  { id: "thiago", name: "Thiago", code: "THIAGO" },
];

const STORAGE_KEY = "aula-controllab-v3";

function createInitialState(): AppState {
  return { students: defaultStudents, currentStudentId: null, progress: {}, dictations: {} };
}

function normalize(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología"];
const LEVEL_COLOR: Record<string, string> = {
  "Básico": "bg-emerald-100 text-emerald-800",
  "Intermedio": "bg-amber-100 text-amber-800",
  "Avanzado": "bg-rose-100 text-rose-800",
};

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function Home() {
  const [appState, setAppState] = useState<AppState>(createInitialState);
  const [loginName, setLoginName] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(MODULES[0].id);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showProfessorPanel, setShowProfessorPanel] = useState(false);
  const PROFESSOR_PASSWORD = "controllab2025";
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentCode, setNewStudentCode] = useState("");
  const [dictationText, setDictationText] = useState("");
  const [dictationResult, setDictationResult] = useState<DictationResult | null>(null);
  const [teacherTab, setTeacherTab] = useState<"students" | "progress" | "dictations">("progress");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [activeSection, setActiveSection] = useState<"reading" | "quiz" | "dictation" | "vocab">("reading");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAppState({ ...createInitialState(), ...JSON.parse(saved) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); } catch { /* ignore */ }
  }, [appState]);

  const currentStudent = appState.students.find(s => s.id === appState.currentStudentId) ?? null;
  const selectedModule = MODULES.find(m => m.id === selectedModuleId) ?? MODULES[0];
  const studentProgress = currentStudent ? appState.progress[currentStudent.id] || {} : {};
  const studentDictations = currentStudent ? appState.dictations[currentStudent.id] || {} : {};
  const moduleProgress: ModuleProgress = studentProgress[selectedModuleId] || { completed: false, score: 0, total: selectedModule.quiz.length, attempts: 0 };
  const currentQuestion = selectedModule.quiz[currentQuestionIndex];
  const isCorrect = submitted && selectedOption === currentQuestion.answer;
  const currentDictation = studentDictations[selectedModuleId] || null;

  const filteredModules = activeCategory === "Todos" ? MODULES : MODULES.filter(m => m.category === activeCategory);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setSubmitted(false);
    setDictationText("");
    setDictationResult(null);
    setQuizAnswers({});
    setActiveSection("reading");
  }, [selectedModuleId, appState.currentStudentId]);

  const totalQuestions = useMemo(() => MODULES.reduce((sum, m) => sum + m.quiz.length, 0), []);
  const completedModules = Object.keys(studentProgress).length;
  const totalBestScore = MODULES.reduce((sum, m) => sum + (studentProgress[m.id]?.score || 0), 0);
  const overallPercent = Math.round((completedModules / MODULES.length) * 100);

  const professorRows = appState.students.map(student => {
    const progress = appState.progress[student.id] || {};
    const dictations = appState.dictations[student.id] || {};
    const completedMods = Object.keys(progress).length;
    const bestScore = MODULES.reduce((sum, m) => sum + (progress[m.id]?.score || 0), 0);
    const dictScores = MODULES.map(m => dictations[m.id]?.score).filter((v): v is number => typeof v === "number");
    const dictAvg = dictScores.length ? Math.round(dictScores.reduce((a, b) => a + b, 0) / dictScores.length) : null;
    return { ...student, completedMods, bestScore, dictAvg };
  });

  const login = () => {
    const found = appState.students.find(s => normalize(s.name) === normalize(loginName) && normalize(s.code) === normalize(loginCode));
    if (!found) { setLoginError("Nombre o código incorrecto. Verificá con tu profe."); return; }
    setAppState(prev => ({ ...prev, currentStudentId: found.id }));
    setLoginError("");
    setLoginName("");
    setLoginCode("");
  };

  const logout = () => {
    setAppState(prev => ({ ...prev, currentStudentId: null }));
    setSelectedModuleId(MODULES[0].id);
    setShowProfessorPanel(false);
  };

  const saveProgress = (scoreValue: number, totalValue: number) => {
    if (!currentStudent) return;
    setAppState(prev => {
      const prevSP = prev.progress[currentStudent.id] || {};
      const prevMod = prevSP[selectedModuleId] || { completed: false, score: 0, total: totalValue, attempts: 0 };
      return {
        ...prev,
        progress: { ...prev.progress, [currentStudent.id]: { ...prevSP, [selectedModuleId]: { completed: true, score: Math.max(prevMod.score || 0, scoreValue), total: totalValue, attempts: (prevMod.attempts || 0) + 1 } } },
      };
    });
  };

  const handleSubmit = () => { if (!selectedOption) return; setSubmitted(true); };

  const handleNext = () => {
    if (currentQuestionIndex < selectedModule.quiz.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedOption(quizAnswers[currentQuestionIndex + 1] || "");
      setSubmitted(false);
      return;
    }
    const correctCount = selectedModule.quiz.reduce((sum, q, i) => sum + (quizAnswers[i] === q.answer ? 1 : 0), 0);
    saveProgress(correctCount, selectedModule.quiz.length);
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setSubmitted(false);
    setQuizAnswers({});
    setActiveSection("reading");
  };

  const setAnswerMemory = (value: string) => {
    setSelectedOption(value);
    setQuizAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const addStudent = () => {
    if (!newStudentName.trim() || !newStudentCode.trim()) return;
    const id = `${normalize(newStudentName)}-${Date.now()}`;
    setAppState(prev => ({ ...prev, students: [...prev.students, { id, name: newStudentName.trim(), code: newStudentCode.trim().toUpperCase() }] }));
    setNewStudentName("");
    setNewStudentCode("");
  };

  const removeStudent = (studentId: string) => {
    setAppState(prev => {
      const newStudents = prev.students.filter(s => s.id !== studentId);
      const newProgress = { ...prev.progress };
      const newDictations = { ...prev.dictations };
      delete newProgress[studentId];
      delete newDictations[studentId];
      return { ...prev, students: newStudents, progress: newProgress, dictations: newDictations };
    });
  };

  const speak = (text: string, rate: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = rate;
    window.speechSynthesis.speak(u);
  };

  const checkDictation = () => {
    if (!currentStudent) return;
    const expected = normalize(selectedModule.dictation);
    const written = normalize(dictationText);
    const expectedWords = expected.split(" ").filter(Boolean);
    const writtenWords = written.split(" ").filter(Boolean);
    const matches = writtenWords.filter((w, i) => w === expectedWords[i]).length;
    const score = expectedWords.length ? Math.round((matches / expectedWords.length) * 100) : 0;
    const result: DictationResult = { exact: expected === written, score, written: dictationText, expected: selectedModule.dictation, updatedAt: new Date().toLocaleString() };
    setDictationResult(result);
    setAppState(prev => ({ ...prev, dictations: { ...prev.dictations, [currentStudent.id]: { ...(prev.dictations[currentStudent.id] || {}), [selectedModuleId]: result } } }));
  };

  /* ── LOGIN SCREEN ───────────────────────── */
  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
          * { font-family: 'Sora', sans-serif; }
          .mono { font-family: 'JetBrains Mono', monospace; }
          .glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); }
          .glow { box-shadow: 0 0 40px rgba(99,202,183,0.15); }
          .accent { color: #63CAB7; }
          .btn-primary { background: linear-gradient(135deg, #63CAB7, #4aab97); color: #0f1923; font-weight: 600; }
          .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
          input:focus { outline: none; border-color: #63CAB7 !important; box-shadow: 0 0 0 3px rgba(99,202,183,0.2); }
          .tag { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }
        `}</style>
        <div className="w-full max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* LEFT */}
            <div className="glass rounded-3xl p-8 md:p-10 glow">
              <div className="mono text-xs tracking-widest text-slate-400 mb-4">CONTROLLAB · ES-PT</div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Aula<br /><span className="accent">Controllab</span>
              </h1>
              <p className="mt-4 text-slate-300 leading-7">
                Plataforma de español técnico para el equipo Controllab. Módulos de laboratorio, calidad, TI y comunicación — diseñados para vos.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { num: MODULES.length, label: "Módulos", sub: "Lab · Gestión · TI · Com." },
                  { num: defaultStudents.length, label: "Alumnos", sub: "Todos registrados" },
                  { num: "4", label: "Áreas", sub: "Lab · Gestión · TI · Com." },
                  { num: "🎧", label: "Audio TTS", sub: "Lectura y dictado" },
                ].map(item => (
                  <div key={item.label} className="glass rounded-2xl p-4">
                    <div className="text-2xl font-bold text-white mono">{item.num}</div>
                    <div className="text-sm font-semibold text-white mt-1">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 glass rounded-2xl p-5">
                <div className="text-xs mono text-slate-400 mb-3 tracking-widest">ALUMNOS REGISTRADOS</div>
                <div className="flex flex-wrap gap-2">
                  {defaultStudents.map(s => (
                    <span key={s.id} className="glass text-slate-200 text-xs px-3 py-1 rounded-full">{s.name}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="glass rounded-3xl p-8 md:p-10">
              <div className="mono text-xs tracking-widest text-slate-400 mb-4">INGRESO</div>
              <h2 className="text-2xl font-bold text-white">Entrar como alumno</h2>
              <p className="mt-2 text-slate-400 text-sm">Usá tu nombre y el código que te dio el profe.</p>
              <div className="mt-8 space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2 font-medium">Nombre</label>
                  <input value={loginName} onChange={e => setLoginName(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Ej: Marília" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 transition" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2 font-medium">Código de acceso</label>
                  <input value={loginCode} onChange={e => setLoginCode(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Ej: MARILIA" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 mono transition" />
                </div>
                {loginError && <p className="text-rose-400 text-sm">{loginError}</p>}
                <button onClick={login} className="btn-primary w-full rounded-xl px-5 py-3.5 text-sm transition">
                  Ingresar →
                </button>
              </div>
              <div className="mt-8 glass rounded-2xl p-5">
                <div className="mono text-xs text-slate-400 tracking-widest mb-3">PANEL DEL PROFE</div>
                <button onClick={() => {
                  if (showProfessorPanel) {
                    setShowProfessorPanel(false);
                  } else {
                    const pwd = prompt("Contraseña del profesor:");
                    if (pwd === PROFESSOR_PASSWORD) {
                      setShowProfessorPanel(true);
                    } else if (pwd !== null) {
                      alert("Contraseña incorrecta.");
                    }
                  }
                }} className="w-full text-left text-sm text-slate-300 hover:text-white transition flex justify-between items-center">
                  <span>Agregar / gestionar alumnos</span>
                  <span className="text-slate-500">{showProfessorPanel ? "▲" : "▼"}</span>
                </button>
                {showProfessorPanel && (
                  <div className="mt-4 space-y-3">
                    <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Nombre del alumno" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                    <input value={newStudentCode} onChange={e => setNewStudentCode(e.target.value)} placeholder="Código" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm mono" />
                    <button onClick={addStudent} className="w-full rounded-xl border border-slate-600 text-slate-200 px-4 py-2.5 text-sm hover:bg-slate-700 transition">
                      + Agregar alumno
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN APP ───────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); }
        .glass-dark { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px); }
        .accent { color: #63CAB7; }
        .accent-bg { background-color: #63CAB7; }
        .btn-accent { background: linear-gradient(135deg, #63CAB7, #4aab97); color: #0f1923; font-weight: 700; border-radius: 12px; transition: all 0.2s; }
        .btn-accent:hover { opacity: 0.9; transform: translateY(-1px); }
        input, textarea { outline: none; transition: all 0.2s; }
        input:focus, textarea:focus { border-color: #63CAB7 !important; box-shadow: 0 0 0 3px rgba(99,202,183,0.15); }
        .module-card:hover { border-color: rgba(99,202,183,0.4) !important; transform: translateY(-2px); }
        .module-card { transition: all 0.2s; }
        .module-card.active { background: linear-gradient(135deg, rgba(99,202,183,0.15), rgba(74,171,151,0.1)); border-color: #63CAB7 !important; }
        .progress-bar { height: 6px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #63CAB7, #4aab97); transition: width 0.6s ease; }
        .section-tab { transition: all 0.2s; cursor: pointer; border-radius: 10px; padding: 8px 16px; font-size: 13px; font-weight: 600; }
        .section-tab.active { background: #63CAB7; color: #0f1923; }
        .section-tab:not(.active) { color: #94a3b8; }
        .section-tab:not(.active):hover { color: #fff; background: rgba(255,255,255,0.08); }
        .option-btn { transition: all 0.18s; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 16px; text-align: left; width: 100%; background: rgba(255,255,255,0.04); color: #e2e8f0; cursor: pointer; }
        .option-btn:hover:not(:disabled) { border-color: rgba(99,202,183,0.5); background: rgba(99,202,183,0.07); }
        .option-btn.selected { border-color: #63CAB7; background: rgba(99,202,183,0.1); }
        .option-btn.correct { border-color: #63CAB7; background: rgba(99,202,183,0.2); color: #63CAB7; font-weight: 600; }
        .option-btn.wrong { border-color: #f87171; background: rgba(248,113,113,0.1); color: #f87171; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="mono text-xs text-slate-500 tracking-widest">CONTROLLAB</div>
              <div className="font-bold text-lg leading-tight">
                Hola, <span className="accent">{currentStudent.name}</span> 👋
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-4">
              <div className="glass rounded-xl px-4 py-2 text-sm">
                <span className="text-slate-400">Progreso </span>
                <span className="font-bold accent">{overallPercent}%</span>
              </div>
              <div className="glass rounded-xl px-4 py-2 text-sm">
                <span className="text-slate-400">Puntaje </span>
                <span className="font-bold">{totalBestScore}<span className="text-slate-500">/{totalQuestions}</span></span>
              </div>
              <div className="glass rounded-xl px-4 py-2 text-sm">
                <span className="text-slate-400">Módulos </span>
                <span className="font-bold">{completedModules}<span className="text-slate-500">/{MODULES.length}</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              if (showProfessorPanel) {
                setShowProfessorPanel(false);
              } else {
                const pwd = prompt("Contraseña del profesor:");
                if (pwd === PROFESSOR_PASSWORD) {
                  setShowProfessorPanel(true);
                } else if (pwd !== null) {
                  alert("Contraseña incorrecta.");
                }
              }
            }} className="glass rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition">
              {showProfessorPanel ? "✕ Panel" : "📊 Panel profe"}
            </button>
            <button onClick={logout} className="glass rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition">
              Salir →
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="progress-bar mx-6 mb-3 rounded-none" style={{ borderRadius: 0 }}>
          <div className="progress-fill" style={{ width: `${overallPercent}%` }} />
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {/* PROFESSOR PANEL */}
        {showProfessorPanel && (
          <div className="glass rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="mono text-xs text-slate-400 tracking-widest mb-1">PANEL DEL PROFESOR</div>
                <h2 className="text-xl font-bold">Gestión y seguimiento de alumnos</h2>
              </div>
              <div className="flex gap-2">
                {(["progress", "students", "dictations"] as const).map(tab => (
                  <button key={tab} onClick={() => setTeacherTab(tab)} className={`section-tab ${teacherTab === tab ? "active" : ""}`}>
                    {tab === "progress" ? "📊 Progreso" : tab === "students" ? "👥 Alumnos" : "🎙 Dictados"}
                  </button>
                ))}
              </div>
            </div>

            {teacherTab === "progress" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-slate-400">
                      <th className="text-left px-4 py-3 font-semibold">Alumno</th>
                      {MODULES.map(m => <th key={m.id} className="text-center px-2 py-3 font-semibold text-xs" title={m.title}>{m.emoji}</th>)}
                      <th className="text-center px-4 py-3 font-semibold">Total</th>
                      <th className="text-center px-4 py-3 font-semibold">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professorRows.map((row, i) => (
                      <tr key={row.id} className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        {MODULES.map(m => {
                          const p = (appState.progress[row.id] || {})[m.id];
                          return <td key={m.id} className="text-center px-2 py-3">
                            {p ? <span className="accent font-bold mono text-xs">{p.score}/{p.total}</span> : <span className="text-slate-600">—</span>}
                          </td>;
                        })}
                        <td className="text-center px-4 py-3 font-bold accent mono">{row.bestScore}/{totalQuestions}</td>
                        <td className="text-center px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.completedMods === MODULES.length ? "bg-emerald-900 text-emerald-300" : row.completedMods > 0 ? "bg-amber-900 text-amber-300" : "bg-slate-700 text-slate-400"}`}>
                            {Math.round((row.completedMods / MODULES.length) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {teacherTab === "dictations" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-slate-400">
                      <th className="text-left px-4 py-3 font-semibold">Alumno</th>
                      {MODULES.map(m => <th key={m.id} className="text-center px-2 py-3 font-semibold text-xs" title={m.title}>{m.emoji}</th>)}
                      <th className="text-center px-4 py-3 font-semibold">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professorRows.map((row, i) => (
                      <tr key={row.id} className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        {MODULES.map(m => {
                          const d = (appState.dictations[row.id] || {})[m.id];
                          return <td key={m.id} className="text-center px-2 py-3">
                            {d != null ? <span className={`mono text-xs font-bold ${d.score >= 80 ? "text-emerald-400" : d.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>{d.score}%</span> : <span className="text-slate-600">—</span>}
                          </td>;
                        })}
                        <td className="text-center px-4 py-3 font-bold mono accent">{row.dictAvg != null ? `${row.dictAvg}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {teacherTab === "students" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-dark rounded-2xl p-5">
                  <div className="mono text-xs text-slate-400 tracking-widest mb-4">AGREGAR ALUMNO</div>
                  <div className="space-y-3">
                    <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Nombre" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm" />
                    <input value={newStudentCode} onChange={e => setNewStudentCode(e.target.value)} placeholder="Código de acceso" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm mono" />
                    <button onClick={addStudent} className="btn-accent w-full px-4 py-3 text-sm">+ Agregar</button>
                  </div>
                </div>
                <div className="glass-dark rounded-2xl p-5">
                  <div className="mono text-xs text-slate-400 tracking-widest mb-4">ALUMNOS REGISTRADOS</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {appState.students.map(s => (
                      <div key={s.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                        <div>
                          <div className="font-medium text-sm">{s.name}</div>
                          <div className="mono text-xs text-slate-500">{s.code}</div>
                        </div>
                        {!defaultStudents.some(d => d.id === s.id) && (
                          <button onClick={() => removeStudent(s.id)} className="text-rose-400 hover:text-rose-300 text-xs transition">Eliminar</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORY FILTER */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`section-tab whitespace-nowrap ${activeCategory === cat ? "active" : ""}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* MODULE GRID */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mb-8">
          {filteredModules.map(module => {
            const prog = studentProgress[module.id];
            const active = module.id === selectedModuleId;
            return (
              <button key={module.id} onClick={() => setSelectedModuleId(module.id)} className={`module-card glass rounded-2xl p-4 text-left border ${active ? "active" : "border-white/5"}`}>
                <div className="text-2xl mb-2">{module.emoji}</div>
                <div className="text-xs text-slate-400 mb-1 font-medium">{module.category}</div>
                <div className="font-bold text-sm leading-tight">{module.title}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${active ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"}`}>{module.level}</span>
                  <span className={`mono text-xs font-bold ${prog ? "accent" : "text-slate-600"}`}>
                    {prog ? `${prog.score}/${prog.total}` : "—"}
                  </span>
                </div>
                {prog && (
                  <div className="mt-2 progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.round((prog.score / prog.total) * 100)}%` }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Module header */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="mono text-xs text-slate-400 tracking-widest mb-1">{selectedModule.category.toUpperCase()}</div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <span>{selectedModule.emoji}</span> {selectedModule.title}
                  </h2>
                  <p className="mt-2 text-slate-400 text-sm">{selectedModule.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${LEVEL_COLOR[selectedModule.level]}`}>{selectedModule.level}</span>
                  <div className="glass rounded-xl px-4 py-2 text-sm">
                    <span className="text-slate-400">Mejor: </span>
                    <span className="font-bold accent mono">{moduleProgress.score}/{moduleProgress.total}</span>
                  </div>
                  {moduleProgress.attempts > 0 && (
                    <div className="glass rounded-xl px-4 py-2 text-sm">
                      <span className="text-slate-400">Intentos: </span>
                      <span className="font-bold mono">{moduleProgress.attempts}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section tabs */}
              <div className="flex gap-2 mt-6 flex-wrap">
                {(["reading", "quiz", "dictation", "vocab"] as const).map(sec => (
                  <button key={sec} onClick={() => setActiveSection(sec)} className={`section-tab ${activeSection === sec ? "active" : ""}`}>
                    {sec === "reading" ? "📖 Lectura" : sec === "quiz" ? "✏️ Quiz" : sec === "dictation" ? "🎙 Dictado" : "📝 Vocabulario"}
                  </button>
                ))}
              </div>
            </div>

            {/* READING */}
            {activeSection === "reading" && (
              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">{selectedModule.readingTitle}</h3>
                  <button onClick={() => speak(selectedModule.reading.join(" "), 0.9)} className="glass rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-2">
                    🔊 <span>Escuchar lectura</span>
                  </button>
                </div>
                <div className="space-y-5">
                  {selectedModule.reading.map((para, i) => (
                    <p key={i} className="text-slate-200 leading-8 text-[15px]">{para}</p>
                  ))}
                </div>
                <button onClick={() => setActiveSection("quiz")} className="btn-accent mt-8 px-6 py-3 text-sm">
                  Ir al quiz →
                </button>
              </div>
            )}

            {/* QUIZ */}
            {activeSection === "quiz" && (
              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">Comprensión de lectura</h3>
                  <div className="glass rounded-xl px-4 py-2 mono text-sm font-bold accent">
                    {currentQuestionIndex + 1} / {selectedModule.quiz.length}
                  </div>
                </div>
                <div className="progress-bar mb-6">
                  <div className="progress-fill" style={{ width: `${((currentQuestionIndex + (submitted ? 1 : 0)) / selectedModule.quiz.length) * 100}%` }} />
                </div>
                <div className="glass-dark rounded-2xl p-6">
                  <p className="text-lg font-semibold mb-5 leading-7">{currentQuestion.question}</p>
                  <div className="space-y-3">
                    {currentQuestion.options.map(option => {
                      const sel = selectedOption === option;
                      const correct = submitted && option === currentQuestion.answer;
                      const wrong = submitted && sel && option !== currentQuestion.answer;
                      return (
                        <button key={option} onClick={() => !submitted && setAnswerMemory(option)} disabled={submitted}
                          className={`option-btn ${correct ? "correct" : wrong ? "wrong" : sel ? "selected" : ""}`}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm">
                    {submitted ? (
                      isCorrect
                        ? <span className="text-emerald-400 font-semibold">✓ Correcto. ¡Muy bien!</span>
                        : <span className="text-rose-400">✗ La respuesta correcta es: <strong className="text-white">{currentQuestion.answer}</strong></span>
                    ) : (
                      <span className="text-slate-400">Elegí una opción y comprobá tu respuesta.</span>
                    )}
                  </div>
                  {!submitted
                    ? <button onClick={handleSubmit} disabled={!selectedOption} className="btn-accent px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Comprobar</button>
                    : <button onClick={handleNext} className="btn-accent px-6 py-3 text-sm">
                      {currentQuestionIndex < selectedModule.quiz.length - 1 ? "Siguiente →" : "Finalizar módulo ✓"}
                    </button>
                  }
                </div>
              </div>
            )}

            {/* DICTATION */}
            {activeSection === "dictation" && (
              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">🎙 Dictado</h3>
                  <button onClick={() => speak(selectedModule.dictation, 0.75)} className="glass rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-2">
                    🔊 <span>Reproducir</span>
                  </button>
                </div>
                <p className="text-slate-400 text-sm mb-5 leading-6">Escuchá el audio y escribí la frase completa en español. Podés reproducirlo las veces que quieras.</p>
                <textarea value={dictationText} onChange={e => setDictationText(e.target.value)} rows={4} placeholder="Escribí lo que escuchaste..." className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-white px-5 py-4 text-sm leading-7 resize-none" />
                <button onClick={checkDictation} className="btn-accent mt-4 px-6 py-3 text-sm">Corregir dictado</button>
                {(dictationResult || currentDictation) && (() => {
                  const r = dictationResult || currentDictation!;
                  return (
                    <div className="mt-6 glass-dark rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`text-3xl font-black mono ${r.score >= 80 ? "text-emerald-400" : r.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>{r.score}%</div>
                        <div className="text-sm text-slate-400">{r.score === 100 ? "¡Perfecto! 🎉" : r.score >= 80 ? "¡Muy bien!" : r.score >= 50 ? "Buen intento" : "Seguí practicando"}</div>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Frase modelo: </span>
                        <span className="text-slate-200 italic">{r.expected}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* VOCAB */}
            {activeSection === "vocab" && (
              <div className="glass rounded-3xl p-6 md:p-8">
                <h3 className="text-xl font-bold mb-6">📝 Vocabulario clave</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedModule.vocab.map(item => (
                    <div key={item.es} className="glass-dark rounded-2xl px-5 py-4 flex justify-between items-center gap-4">
                      <div>
                        <div className="font-semibold">{item.es}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Español</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold accent">{item.pt}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Portugués</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5">
            {/* My progress */}
            <div className="glass rounded-3xl p-6">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">MI PROGRESO</div>
              <div className="text-5xl font-black accent mono">{overallPercent}%</div>
              <div className="text-slate-400 text-sm mt-1">completado</div>
              <div className="mt-5 progress-bar">
                <div className="progress-fill" style={{ width: `${overallPercent}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="glass-dark rounded-2xl p-3">
                  <div className="mono text-lg font-black">{completedModules}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Módulos</div>
                </div>
                <div className="glass-dark rounded-2xl p-3">
                  <div className="mono text-lg font-black accent">{totalBestScore}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Puntos totales</div>
                </div>
              </div>
            </div>

            {/* All modules mini-list */}
            <div className="glass rounded-3xl p-6">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">TODOS LOS MÓDULOS</div>
              <div className="space-y-2">
                {MODULES.map(m => {
                  const p = studentProgress[m.id];
                  const isActive = m.id === selectedModuleId;
                  return (
                    <button key={m.id} onClick={() => setSelectedModuleId(m.id)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${isActive ? "bg-white/10" : "hover:bg-white/5"}`}>
                      <span className="text-lg">{m.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-slate-300"}`}>{m.title}</div>
                        <div className="text-xs text-slate-500">{m.category}</div>
                      </div>
                      {p ? (
                        <span className="mono text-xs font-bold accent whitespace-nowrap">{p.score}/{p.total}</span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="glass rounded-3xl p-6">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">CONSEJO DEL DÍA</div>
              <p className="text-sm text-slate-300 leading-6">
                💡 Cuando uses términos técnicos en español con un cliente, recordá que la <span className="accent font-semibold">claridad</span> siempre es más importante que la complejidad del vocabulario.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}