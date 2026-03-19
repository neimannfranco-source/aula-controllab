"use client";

import { useEffect, useMemo, useState } from "react";

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

const MODULES: ModuleType[] = [
  // LABORATORIO
  {
    id: "control-interno", title: "Control interno", level: "Intermedio", category: "Laboratorio", emoji: "🔬",
    description: "Monitoreo analítico, tendencias y decisiones preventivas.",
    readingTitle: "Una desviación que parecía pequeña",
    reading: [
      "Durante una revisión de rutina, el equipo técnico detectó una desviación en los controles internos de uno de los analitos más procesados. La diferencia parecía pequeña, pero al comparar con los registros históricos observaron que la tendencia se repetía desde hacía varios días.",
      "La supervisora reunió al equipo para revisar materiales de control, curvas de calibración, lotes de reactivos y condiciones de almacenamiento. Concluyeron que la causa era una combinación entre una variación del reactivo y una calibración desactualizada.",
      "Como medida preventiva, suspendieron temporalmente la liberación de algunos resultados y repitieron las corridas. El caso reforzó la importancia de identificar tendencias antes de que aparezca un error mayor.",
    ],
    vocab: [
      { es: "control interno", pt: "controle interno" }, { es: "desviación", pt: "desvio" },
      { es: "liberación de resultados", pt: "liberação de resultados" }, { es: "reactivo", pt: "reagente" },
      { es: "tendencia", pt: "tendência" }, { es: "corrida analítica", pt: "corrida analítica" },
    ],
    quiz: [
      { question: "¿Qué detectó el equipo técnico?", options: ["Un error en la facturación", "Una desviación en los controles internos", "Una falla en el refrigerador"], answer: "Una desviación en los controles internos" },
      { question: "¿Qué hicieron como medida preventiva?", options: ["Cambiaron al personal", "Suspendieron la liberación de algunos resultados", "Descartaron el equipamiento"], answer: "Suspendieron la liberación de algunos resultados" },
      { question: "¿Por qué es importante identificar tendencias?", options: ["Para reducir reuniones", "Para evitar errores mayores y proteger la calidad", "Para eliminar controles"], answer: "Para evitar errores mayores y proteger la calidad" },
    ],
    dictation: "El equipo detectó una desviación en los controles internos y suspendió la liberación de resultados para proteger la calidad del proceso.",
  },
  {
    id: "westgard", title: "Reglas de Westgard", level: "Intermedio", category: "Laboratorio", emoji: "📊",
    description: "Análisis de reglas y toma de decisiones en el laboratorio.",
    readingTitle: "Una alerta en el turno de la mañana",
    reading: [
      "En el turno de la mañana, una analista observó que uno de los niveles de control presentaba un comportamiento inusual. El valor no estaba muy alejado de la media, pero notó un patrón compatible con una regla de advertencia.",
      "Antes de continuar, el equipo verificó si el comportamiento era una variación aleatoria o un problema sistemático. Compararon ambos niveles de control y revisaron la precisión reciente del método.",
      "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras y a justificar técnicamente cada acción frente a auditorías o consultas de clientes.",
    ],
    vocab: [
      { es: "regla de advertencia", pt: "regra de alerta" }, { es: "media", pt: "média" },
      { es: "precisión", pt: "precisão" }, { es: "rechazar la corrida", pt: "rejeitar a corrida" },
      { es: "problema sistemático", pt: "problema sistemático" }, { es: "variación aleatoria", pt: "variação aleatória" },
    ],
    quiz: [
      { question: "¿Qué observó la analista?", options: ["Un comportamiento inusual", "Una caída del sistema", "Una pérdida de datos"], answer: "Un comportamiento inusual" },
      { question: "¿Qué quiso determinar el equipo?", options: ["Si el problema era aleatorio o sistemático", "Si había que cambiar de laboratorio", "Si el cliente aceptaría"], answer: "Si el problema era aleatorio o sistemático" },
      { question: "Las reglas de Westgard ayudan a...", options: ["Evitar todo control", "Tomar decisiones seguras y justificarlas", "Trabajar sin registros"], answer: "Tomar decisiones seguras y justificarlas" },
    ],
    dictation: "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras y a justificar técnicamente cada acción del laboratorio.",
  },
  {
    id: "trazabilidad", title: "Trazabilidad y registros", level: "Intermedio", category: "Laboratorio", emoji: "📋",
    description: "Registros, documentación y seguimiento operativo.",
    readingTitle: "Cuando faltaba una parte del historial",
    reading: [
      "Durante una auditoría interna, el equipo encontró una inconsistencia en el historial de una muestra. El resultado final estaba documentado, pero faltaban registros intermedios del proceso.",
      "La coordinadora recordó que la trazabilidad no es solo una exigencia documental. También es una herramienta para reconstruir decisiones y verificar responsabilidades.",
      "Después del análisis, el área actualizó su checklist operativo y reforzó la importancia de registrar cada etapa con precisión.",
    ],
    vocab: [
      { es: "trazabilidad", pt: "rastreabilidade" }, { es: "registro", pt: "registro" },
      { es: "recorrido del proceso", pt: "percurso do processo" }, { es: "checklist", pt: "checklist" },
      { es: "inconsistencia", pt: "inconsistência" }, { es: "responsabilidad", pt: "responsabilidade" },
    ],
    quiz: [
      { question: "¿Qué problema apareció?", options: ["Faltaban registros intermedios", "Se cortó la luz", "No había clientes"], answer: "Faltaban registros intermedios" },
      { question: "¿Para qué sirve la trazabilidad?", options: ["Solo para cumplir documentos", "Para reconstruir decisiones y verificar responsabilidades", "Para reducir reuniones"], answer: "Para reconstruir decisiones y verificar responsabilidades" },
      { question: "¿Qué hizo el área después?", options: ["Actualizó su checklist", "Cerró el sector", "Eliminó registros"], answer: "Actualizó su checklist" },
    ],
    dictation: "La trazabilidad permite reconstruir decisiones, verificar responsabilidades y reducir el riesgo de errores no detectados.",
  },
  {
    id: "validacion", title: "Validación del método", level: "Avanzado", category: "Laboratorio", emoji: "✅",
    description: "Validación, precisión, exactitud y robustez de métodos analíticos.",
    readingTitle: "Antes de implementar el nuevo método",
    reading: [
      "Antes de implementar un nuevo método, el equipo necesitaba demostrar que su desempeño era adecuado para el uso previsto. Debía mostrar precisión, exactitud y estabilidad en diferentes condiciones.",
      "Durante la validación, compararon resultados, revisaron repeticiones y evaluaron posibles interferencias. Cada dato debía interpretarse con criterio técnico.",
      "Validar no es solo llenar una planilla. Es comprender cómo responde el método, cuáles son sus límites y en qué condiciones ofrece resultados consistentes.",
    ],
    vocab: [
      { es: "validación", pt: "validação" }, { es: "exactitud", pt: "exatidão" },
      { es: "robustez", pt: "robustez" }, { es: "interferencia", pt: "interferência" },
      { es: "desempeño", pt: "desempenho" }, { es: "uso previsto", pt: "uso pretendido" },
    ],
    quiz: [
      { question: "¿Qué debía demostrar el equipo?", options: ["Que el método era adecuado", "Que el laboratorio era el mayor", "Que no hacía falta revisar"], answer: "Que el método era adecuado" },
      { question: "¿Qué evaluaron?", options: ["Solo velocidad", "Resultados, repeticiones e interferencias", "Solo costo"], answer: "Resultados, repeticiones e interferencias" },
      { question: "Validar significa...", options: ["Llenar una planilla", "Comprender el método y sus límites", "Trabajar sin criterios"], answer: "Comprender el método y sus límites" },
    ],
    dictation: "Validar un método significa comprender cómo responde, cuáles son sus límites y en qué condiciones ofrece resultados consistentes.",
  },
  {
    id: "muestras", title: "Manejo de muestras", level: "Básico", category: "Laboratorio", emoji: "🧪",
    description: "Recepción, identificación, conservación y rechazo de muestras.",
    readingTitle: "La muestra que llegó sin identificar",
    reading: [
      "Una mañana llegaron varias muestras de un hospital nuevo, algunas sin etiqueta o con información incompleta. El equipo debió decidir cuáles procesar y cuáles rechazar.",
      "El protocolo establece criterios claros: volumen mínimo, tipo de tubo, temperatura y datos obligatorios. Cuando una muestra no cumple estos requisitos, el analista debe comunicarlo profesionalmente.",
      "El episodio impulsó al equipo a mejorar la comunicación con el hospital y crear un instructivo de preparación de muestras.",
    ],
    vocab: [
      { es: "muestra", pt: "amostra" }, { es: "recepción", pt: "recepção" },
      { es: "etiqueta", pt: "etiqueta / rótulo" }, { es: "rechazo", pt: "rejeição" },
      { es: "conservación", pt: "conservação" }, { es: "criterio", pt: "critério" },
    ],
    quiz: [
      { question: "¿Qué problema tenían las muestras?", options: ["Estaban congeladas", "Sin etiqueta o información incompleta", "Tipo equivocado"], answer: "Sin etiqueta o información incompleta" },
      { question: "¿Qué establece el protocolo?", options: ["Que toda muestra se procesa", "Criterios claros para aceptar o rechazar", "Que el cliente no se equivoca"], answer: "Criterios claros para aceptar o rechazar" },
      { question: "¿Qué hizo el equipo después?", options: ["Ignoró el problema", "Mejoró la comunicación y creó un instructivo", "Rechazó a todos los clientes"], answer: "Mejoró la comunicación y creó un instructivo" },
    ],
    dictation: "Cuando una muestra no cumple los criterios de recepción, el analista debe comunicarlo de forma profesional y registrar el motivo del rechazo.",
  },
  {
    id: "hemograma", title: "Hemograma completo", level: "Intermedio", category: "Laboratorio", emoji: "🩸",
    description: "Interpretación y comunicación de resultados hematológicos.",
    readingTitle: "Los números que cuentan la historia",
    reading: [
      "El hemograma completo es uno de los análisis más solicitados. Proporciona información sobre glóbulos rojos, blancos y plaquetas, y puede reflejar desde infecciones hasta anemias.",
      "Cuando un resultado se aleja de los valores de referencia, el analista evalúa si es una variación clínicamente significativa o una interferencia técnica. La hemólisis, lipemia o muestra coagulada pueden alterar resultados.",
      "La comunicación de un resultado crítico es fundamental. El laboratorio debe contactar al médico de forma rápida, clara y documentada.",
    ],
    vocab: [
      { es: "hemograma", pt: "hemograma" }, { es: "glóbulo rojo", pt: "glóbulo vermelho" },
      { es: "glóbulo blanco", pt: "glóbulo branco / leucócito" }, { es: "plaqueta", pt: "plaqueta" },
      { es: "valor de referencia", pt: "valor de referência" }, { es: "resultado crítico", pt: "resultado crítico" },
    ],
    quiz: [
      { question: "¿Qué información da el hemograma?", options: ["Solo glucosa", "Glóbulos rojos, blancos y plaquetas", "Solo colesterol"], answer: "Glóbulos rojos, blancos y plaquetas" },
      { question: "¿Qué puede alterar resultados?", options: ["El color del tubo", "Hemólisis, lipemia o muestra coagulada", "El nombre del paciente"], answer: "Hemólisis, lipemia o muestra coagulada" },
      { question: "Un resultado crítico debe comunicarse...", options: ["Al día siguiente", "De forma rápida, clara y documentada", "Solo por correo"], answer: "De forma rápida, clara y documentada" },
    ],
    dictation: "Un resultado crítico debe comunicarse al médico solicitante de forma rápida, clara y documentada.",
  },
  {
    id: "bioquimica", title: "Bioquímica clínica", level: "Intermedio", category: "Laboratorio", emoji: "⚗️",
    description: "Glucosa, perfil lipídico, función renal y hepática.",
    readingTitle: "El perfil que habla por el paciente",
    reading: [
      "La bioquímica clínica abarca análisis que evalúan el funcionamiento de órganos: glucosa, perfil lipídico, marcadores de función renal como creatinina y urea, y hepáticos como TGO y TGP.",
      "Cuando el médico solicita un perfil completo, el analista debe garantizar que cada resultado sea coherente. Un aumento de creatinina con disminución de la filtración refuerza la sospecha de compromiso renal.",
      "Explicar estos resultados con claridad al área médica es una habilidad clave. Un lenguaje técnico pero accesible facilita la toma de decisiones clínicas.",
    ],
    vocab: [
      { es: "glucosa", pt: "glicose" }, { es: "creatinina", pt: "creatinina" },
      { es: "perfil lipídico", pt: "perfil lipídico" }, { es: "función hepática", pt: "função hepática" },
      { es: "filtración glomerular", pt: "filtração glomerular" }, { es: "marcador", pt: "marcador" },
    ],
    quiz: [
      { question: "¿Qué evalúa la bioquímica clínica?", options: ["Solo la sangre", "El funcionamiento de órganos y sistemas", "Solo el hígado"], answer: "El funcionamiento de órganos y sistemas" },
      { question: "¿Qué indica un aumento de creatinina?", options: ["Problema hepático", "Posible compromiso renal", "Infección viral"], answer: "Posible compromiso renal" },
      { question: "¿Qué facilita el lenguaje técnico accesible?", options: ["Confundir al médico", "La toma de decisiones clínicas", "Reducir análisis"], answer: "La toma de decisiones clínicas" },
    ],
    dictation: "La bioquímica clínica evalúa el funcionamiento de órganos a través de marcadores como glucosa, creatinina y perfil lipídico.",
  },
  {
    id: "microbiologia", title: "Microbiología básica", level: "Avanzado", category: "Laboratorio", emoji: "🦠",
    description: "Cultivos, antibiogramas y comunicación de resultados microbiológicos.",
    readingTitle: "El cultivo que tardó tres días",
    reading: [
      "Los resultados microbiológicos requieren tiempo. Un cultivo puede tardar entre 24 y 72 horas, y la identificación del microorganismo y el antibiograma pueden extender el proceso varios días más.",
      "Durante ese tiempo, el médico puede necesitar información parcial para iniciar tratamiento empírico. El laboratorio debe comunicar resultados preliminares claramente, indicando que son provisorios.",
      "La resistencia bacteriana es uno de los temas más críticos. Comunicar correctamente un perfil de sensibilidad puede influir directamente en el tratamiento del paciente.",
    ],
    vocab: [
      { es: "cultivo", pt: "cultura" }, { es: "antibiograma", pt: "antibiograma" },
      { es: "microorganismo", pt: "micro-organismo" }, { es: "resultado preliminar", pt: "resultado preliminar" },
      { es: "resistencia bacteriana", pt: "resistência bacteriana" }, { es: "tratamiento empírico", pt: "tratamento empírico" },
    ],
    quiz: [
      { question: "¿Cuánto puede tardar un cultivo?", options: ["Minutos", "24 a 72 horas o más", "Exactamente 1 hora"], answer: "24 a 72 horas o más" },
      { question: "¿Qué debe indicar el resultado preliminar?", options: ["Que es definitivo", "Que es provisorio y el informe sigue en proceso", "Que no sirve"], answer: "Que es provisorio y el informe sigue en proceso" },
      { question: "¿Qué puede influir en el tratamiento?", options: ["El color del tubo", "Comunicar correctamente el perfil de sensibilidad", "El nombre del analista"], answer: "Comunicar correctamente el perfil de sensibilidad" },
    ],
    dictation: "El laboratorio debe comunicar los resultados preliminares de manera clara, indicando que son provisorios y que el informe definitivo está en proceso.",
  },
  // GESTIÓN
  {
    id: "indicadores", title: "Indicadores de calidad", level: "Intermedio", category: "Gestión", emoji: "📈",
    description: "Interpretar y discutir indicadores, metas y desvíos operativos.",
    readingTitle: "Cuando el indicador no cuenta toda la historia",
    reading: [
      "En la reunión mensual, revisaron los principales indicadores. El tiempo medio de respuesta parecía estable y las no conformidades habían disminuido. Sin embargo, algunos retrasos críticos no eran visibles en el promedio.",
      "La coordinación propuso desagregar los datos por tipo de cliente, franja horaria y complejidad del ensayo. Eso permitió identificar procesos especiales que generaban impactos mayores.",
      "Un indicador aislado puede ser útil, pero no siempre explica el contexto. Es fundamental cruzar datos y comparar tendencias antes de tomar decisiones.",
    ],
    vocab: [
      { es: "indicador", pt: "indicador" }, { es: "desagregar datos", pt: "desagregar dados" },
      { es: "no conformidad", pt: "não conformidade" }, { es: "promedio general", pt: "média geral" },
      { es: "toma de decisiones", pt: "tomada de decisão" }, { es: "tendencia", pt: "tendência" },
    ],
    quiz: [
      { question: "¿Qué parecía estable?", options: ["El tiempo medio de respuesta", "La rotación de personal", "El presupuesto"], answer: "El tiempo medio de respuesta" },
      { question: "¿Qué propuso la coordinación?", options: ["Eliminar indicadores", "Desagregar los datos", "Suspender reuniones"], answer: "Desagregar los datos" },
      { question: "La idea principal es que...", options: ["Un indicador siempre es suficiente", "El contexto importa para interpretar números", "Los informes deben eliminarse"], answer: "El contexto importa para interpretar números" },
    ],
    dictation: "Para una buena gestión, es fundamental cruzar datos, comparar tendencias y discutir el significado operativo de cada número.",
  },
  {
    id: "no-conformidades", title: "No conformidades y CAPA", level: "Intermedio", category: "Gestión", emoji: "⚠️",
    description: "Detección, registro y acciones correctivas y preventivas.",
    readingTitle: "El mismo error dos veces",
    reading: [
      "El área de calidad registró una no conformidad por error en etiquetado de muestras. No era la primera vez. Al revisar, encontraron que un episodio similar había sido cerrado sin acción correctiva real.",
      "Esta vez aplicaron análisis de causa raíz e identificaron que el procedimiento escrito estaba desactualizado.",
      "Se implementó una CAPA: actualizar el procedimiento, capacitar al personal y definir un indicador de seguimiento. Se programó una verificación de eficacia a los 30 días.",
    ],
    vocab: [
      { es: "no conformidad", pt: "não conformidade" }, { es: "acción correctiva", pt: "ação corretiva" },
      { es: "acción preventiva", pt: "ação preventiva" }, { es: "causa raíz", pt: "causa raiz" },
      { es: "verificación de eficacia", pt: "verificação de eficácia" }, { es: "CAPA", pt: "CAPA" },
    ],
    quiz: [
      { question: "¿Por qué se repitió el problema?", options: ["Falta de muestras", "La acción correctiva anterior no fue real", "Error del cliente"], answer: "La acción correctiva anterior no fue real" },
      { question: "¿Qué encontraron en la causa raíz?", options: ["Error individual", "Procedimiento desactualizado", "Faltaban reactivos"], answer: "Procedimiento desactualizado" },
      { question: "¿Qué se programó a los 30 días?", options: ["Reunión social", "Verificación de eficacia", "Nueva auditoría"], answer: "Verificación de eficacia" },
    ],
    dictation: "Una acción correctiva debe incluir el análisis de causa raíz, la actualización del procedimiento y una verificación de eficacia posterior.",
  },
  {
    id: "auditorias", title: "Auditorías internas", level: "Avanzado", category: "Gestión", emoji: "🔍",
    description: "Planificación, ejecución y seguimiento de auditorías.",
    readingTitle: "El día de la auditoría",
    reading: [
      "Una auditoría interna bien planificada no debería ser una sorpresa. Su objetivo no es encontrar culpables sino identificar mejoras y verificar que los procesos se ejecutan según lo documentado.",
      "El auditor revisa registros, observa procesos y realiza entrevistas. Cada hallazgo se documenta con evidencia objetiva y se clasifica: no conformidad mayor, menor u observación.",
      "Al finalizar, el equipo auditado recibe un informe y tiene un plazo para presentar su plan de acción. El seguimiento es parte del ciclo de mejora continua.",
    ],
    vocab: [
      { es: "auditoría", pt: "auditoria" }, { es: "hallazgo", pt: "achado / constatação" },
      { es: "evidencia objetiva", pt: "evidência objetiva" }, { es: "mejora continua", pt: "melhoria contínua" },
      { es: "plan de acción", pt: "plano de ação" }, { es: "no conformidad mayor", pt: "não conformidade maior" },
    ],
    quiz: [
      { question: "¿Cuál es el objetivo de una auditoría?", options: ["Encontrar culpables", "Identificar mejoras y verificar procesos", "Reducir personal"], answer: "Identificar mejoras y verificar procesos" },
      { question: "¿Cómo se clasifica un hallazgo?", options: ["Por nombre del auditor", "Según su impacto: mayor, menor u observación", "Por fecha"], answer: "Según su impacto: mayor, menor u observación" },
      { question: "¿Qué recibe el equipo al final?", options: ["Un premio", "Un informe con plazo para plan de acción", "Nada"], answer: "Un informe con plazo para plan de acción" },
    ],
    dictation: "El objetivo de una auditoría no es encontrar culpables sino identificar oportunidades de mejora y verificar que los procesos se ejecutan correctamente.",
  },
  {
    id: "gestion-riesgos", title: "Gestión de riesgos", level: "Avanzado", category: "Gestión", emoji: "⚖️",
    description: "Identificación, evaluación y control de riesgos en el laboratorio.",
    readingTitle: "El riesgo que nadie había mapeado",
    reading: [
      "Durante una revisión anual, el equipo identificó un riesgo nunca documentado: dependencia de un único proveedor para un reactivo crítico. Si ese proveedor fallaba, no habría alternativa inmediata.",
      "La gestión de riesgos implica identificar qué puede salir mal, estimar probabilidad e impacto, y definir controles o planes de contingencia.",
      "El laboratorio incorporó un proveedor alternativo y actualizó su matriz de riesgos. La transparencia en la gestión genera confianza en todo el sistema.",
    ],
    vocab: [
      { es: "riesgo", pt: "risco" }, { es: "matriz de riesgos", pt: "matriz de riscos" },
      { es: "plan de contingencia", pt: "plano de contingência" }, { es: "proveedor", pt: "fornecedor" },
      { es: "probabilidad", pt: "probabilidade" }, { es: "impacto", pt: "impacto" },
    ],
    quiz: [
      { question: "¿Qué riesgo identificaron?", options: ["Reactivo vencido", "Dependencia de un único proveedor", "Equipo roto"], answer: "Dependencia de un único proveedor" },
      { question: "¿Qué implica gestionar un riesgo?", options: ["Ignorarlo", "Identificarlo, estimarlo y definir controles", "Eliminarlo siempre"], answer: "Identificarlo, estimarlo y definir controles" },
      { question: "¿Qué hizo el laboratorio?", options: ["Cerró el área", "Incorporó proveedor alternativo y actualizó la matriz", "Nada"], answer: "Incorporó proveedor alternativo y actualizó la matriz" },
    ],
    dictation: "La gestión de riesgos implica identificar qué puede salir mal, estimar la probabilidad e impacto, y definir planes de contingencia.",
  },
  // COMUNICACIÓN
  {
    id: "atencion-cliente", title: "Atención técnica al cliente", level: "Intermedio", category: "Comunicación", emoji: "📞",
    description: "Español profesional para explicar resultados y gestionar dudas.",
    readingTitle: "Una llamada que exigía claridad",
    reading: [
      "Un cliente llamó porque no entendía una diferencia en el informe más reciente. Aunque el resultado estaba validado, necesitaba una explicación clara.",
      "La analista escuchó la duda completa, confirmó qué información tenía el cliente y explicó paso a paso usando un lenguaje técnico pero accesible.",
      "En atención técnica, no alcanza con tener razón: también es necesario explicar con claridad, transmitir confianza y verificar que el cliente haya entendido.",
    ],
    vocab: [
      { es: "duda", pt: "dúvida" }, { es: "informe", pt: "relatório" },
      { es: "validado", pt: "validado" }, { es: "con cautela", pt: "com cautela" },
      { es: "transmitir confianza", pt: "transmitir confiança" }, { es: "explicar paso a paso", pt: "explicar passo a passo" },
    ],
    quiz: [
      { question: "¿Por qué llamó el cliente?", options: ["Para cambiar de proveedor", "No entendía una diferencia en el informe", "Perdió la contraseña"], answer: "No entendía una diferencia en el informe" },
      { question: "¿Qué hizo primero la analista?", options: ["Cortó la llamada", "Escuchó la duda completa", "Envió un correo"], answer: "Escuchó la duda completa" },
      { question: "En atención técnica también hay que...", options: ["Hablar rápido", "Transmitir claridad y confianza", "Usar solo términos complejos"], answer: "Transmitir claridad y confianza" },
    ],
    dictation: "En atención técnica no alcanza con tener razón: también es necesario explicar con claridad y transmitir confianza.",
  },
  {
    id: "correo-tecnico", title: "Correo técnico profesional", level: "Básico", category: "Comunicación", emoji: "✉️",
    description: "Redactar correos técnicos claros y profesionales en español.",
    readingTitle: "Un correo que generó confusión",
    reading: [
      "Después de enviar un correo técnico, el área recibió una respuesta negativa. Al releerlo, notaron que la información era correcta pero la redacción era poco clara.",
      "Un correo técnico efectivo tiene estructura: saludo profesional, contexto breve, información principal, próximos pasos y cierre cordial.",
      "Después de reescribir con esa estructura, el cliente respondió positivamente. La forma en que se comunica la información técnica afecta la percepción del servicio.",
    ],
    vocab: [
      { es: "redacción", pt: "redação" }, { es: "saludo", pt: "saudação" },
      { es: "cierre cordial", pt: "encerramento cordial" }, { es: "próximos pasos", pt: "próximos passos" },
      { es: "percepción", pt: "percepção" }, { es: "estructura", pt: "estrutura" },
    ],
    quiz: [
      { question: "¿Por qué el correo generó confusión?", options: ["Errores técnicos", "La redacción era poco clara", "Lo envió mal"], answer: "La redacción era poco clara" },
      { question: "¿Qué incluye la estructura de un buen correo?", options: ["Solo la información", "Saludo, contexto, información, próximos pasos y cierre", "Solo el problema"], answer: "Saludo, contexto, información, próximos pasos y cierre" },
      { question: "¿Cómo respondió el cliente al nuevo correo?", options: ["Negativamente", "Positivamente y agradeció la claridad", "No respondió"], answer: "Positivamente y agradeció la claridad" },
    ],
    dictation: "Un correo técnico efectivo tiene saludo profesional, contexto breve, información clara, próximos pasos y cierre cordial.",
  },
  {
    id: "reuniones", title: "Reuniones efectivas", level: "Básico", category: "Comunicación", emoji: "🗣️",
    description: "Vocabulario y estrategias para participar en reuniones en español.",
    readingTitle: "La reunión que no terminaba",
    reading: [
      "El equipo tenía reuniones semanales que se extendían mucho. Los temas se mezclaban, las decisiones no quedaban claras y al día siguiente nadie recordaba lo acordado.",
      "La coordinadora propuso implementar agenda previa, moderador rotativo y registro de decisiones. Con esos cambios, las reuniones se volvieron más cortas y productivas.",
      "Participar en reuniones requiere habilidades lingüísticas: saber pedir la palabra, expresar acuerdo o desacuerdo con respeto y resumir lo discutido.",
    ],
    vocab: [
      { es: "orden del día / agenda", pt: "pauta / agenda" }, { es: "moderador", pt: "moderador" },
      { es: "acuerdo", pt: "acordo" }, { es: "pedir la palabra", pt: "pedir a palavra" },
      { es: "acta de reunión", pt: "ata de reunião" }, { es: "toma de decisiones", pt: "tomada de decisão" },
    ],
    quiz: [
      { question: "¿Cuál era el problema de las reuniones?", options: ["Eran muy cortas", "Se extendían y las decisiones no eran claras", "No asistía nadie"], answer: "Se extendían y las decisiones no eran claras" },
      { question: "¿Qué propuso la coordinadora?", options: ["Cancelar reuniones", "Agenda, moderador y registro de decisiones", "Reuniones más largas"], answer: "Agenda, moderador y registro de decisiones" },
      { question: "Participar en reuniones requiere...", options: ["Solo escuchar", "Habilidades lingüísticas como pedir la palabra", "Hablar todo el tiempo"], answer: "Habilidades lingüísticas como pedir la palabra" },
    ],
    dictation: "Una reunión efectiva necesita agenda previa, un moderador y un registro claro de las decisiones tomadas.",
  },
  {
    id: "presentaciones", title: "Presentaciones técnicas", level: "Intermedio", category: "Comunicación", emoji: "🎤",
    description: "Cómo presentar datos e informes técnicos con claridad.",
    readingTitle: "Cuando los datos confunden en vez de explicar",
    reading: [
      "Una analista presentó los resultados del trimestre con muchas diapositivas y tablas. Al terminar, los directivos tenían más preguntas que al principio.",
      "El problema no eran los datos: era la forma de presentarlos. Una buena presentación técnica comienza con la conclusión principal, luego los datos que la soportan y finalmente acciones concretas.",
      "La estructura lógica, gráficos claros y lenguaje adaptado al público son las tres claves de una presentación que realmente comunica.",
    ],
    vocab: [
      { es: "diapositiva", pt: "slide" }, { es: "conclusión", pt: "conclusão" },
      { es: "gráfico", pt: "gráfico" }, { es: "público", pt: "público / audiência" },
      { es: "propuesta", pt: "proposta" }, { es: "estructura lógica", pt: "estrutura lógica" },
    ],
    quiz: [
      { question: "¿Por qué la presentación no funcionó?", options: ["Faltaban datos", "La forma de presentarlos era confusa", "Era muy corta"], answer: "La forma de presentarlos era confusa" },
      { question: "¿Cómo debe comenzar una buena presentación?", options: ["Con el índice", "Con la conclusión principal", "Con los antecedentes"], answer: "Con la conclusión principal" },
      { question: "Las tres claves son...", options: ["Velocidad, volumen y color", "Estructura lógica, gráficos claros y lenguaje adaptado", "Muchas diapositivas"], answer: "Estructura lógica, gráficos claros y lenguaje adaptado" },
    ],
    dictation: "Una buena presentación técnica comienza con la conclusión principal, muestra los datos que la soportan y propone acciones concretas.",
  },
  // TECNOLOGÍA
  {
    id: "helpdesk", title: "Soporte técnico (Helpdesk)", level: "Básico", category: "Tecnología", emoji: "💻",
    description: "Vocabulario y comunicación para el soporte técnico interno.",
    readingTitle: "El sistema que no abría",
    reading: [
      "Un lunes, varios analistas reportaron que el sistema no respondía. TI recibió múltiples tickets al mismo tiempo. La primera tarea fue clasificar: ¿problema generalizado o local?",
      "El técnico revisó el servidor, verificó accesos y detectó que una actualización automática había generado un conflicto. El problema fue resuelto en menos de una hora.",
      "La experiencia reforzó la importancia de documentar incidentes y comunicar el estado de la resolución a los usuarios afectados.",
    ],
    vocab: [
      { es: "ticket", pt: "chamado / ticket" }, { es: "servidor", pt: "servidor" },
      { es: "actualización", pt: "atualização" }, { es: "incidente", pt: "incidente" },
      { es: "usuario", pt: "usuário" }, { es: "soporte técnico", pt: "suporte técnico" },
    ],
    quiz: [
      { question: "¿Cuál fue el primer paso del técnico?", options: ["Reinstalar el sistema", "Clasificar si era generalizado o local", "Llamar al proveedor"], answer: "Clasificar si era generalizado o local" },
      { question: "¿Qué causó el problema?", options: ["Error del usuario", "Actualización automática con conflicto", "Muestra mal procesada"], answer: "Actualización automática con conflicto" },
      { question: "¿Qué reforzó la experiencia?", options: ["Que los sistemas no fallan", "Documentar y comunicar incidentes", "Que el soporte no es necesario"], answer: "Documentar y comunicar incidentes" },
    ],
    dictation: "Es importante documentar los incidentes técnicos y comunicar el estado de la resolución a todos los usuarios afectados.",
  },
  {
    id: "seguridad-datos", title: "Seguridad de datos", level: "Intermedio", category: "Tecnología", emoji: "🔒",
    description: "Protección de datos, accesos y buenas prácticas en sistemas.",
    readingTitle: "Una contraseña compartida",
    reading: [
      "En una auditoría de seguridad, se descubrió que varios usuarios compartían la misma contraseña. Si alguien modificaba un resultado, sería imposible saber quién.",
      "TI implementó accesos individuales, contraseñas seguras y autenticación con doble factor para los módulos más sensibles.",
      "La seguridad de los datos no es solo una exigencia regulatoria: protege la integridad de los resultados y la confianza del cliente.",
    ],
    vocab: [
      { es: "contraseña", pt: "senha" }, { es: "acceso", pt: "acesso" },
      { es: "doble factor", pt: "duplo fator" }, { es: "auditoría de seguridad", pt: "auditoria de segurança" },
      { es: "integridad de datos", pt: "integridade de dados" }, { es: "registro de auditoría", pt: "registro de auditoria" },
    ],
    quiz: [
      { question: "¿Qué práctica de riesgo se descubrió?", options: ["Apagaban servidores", "Varios usuarios compartían contraseña", "No usaban el sistema"], answer: "Varios usuarios compartían contraseña" },
      { question: "¿Qué implementó TI?", options: ["Solo cambiar contraseñas", "Accesos individuales, contraseñas seguras y doble factor", "Cerrar el acceso"], answer: "Accesos individuales, contraseñas seguras y doble factor" },
      { question: "La seguridad de datos protege...", options: ["El servidor físico", "La integridad de resultados y la confianza del cliente", "El presupuesto"], answer: "La integridad de resultados y la confianza del cliente" },
    ],
    dictation: "La seguridad de los datos protege la integridad de los resultados y la confianza del cliente, y no es solo una exigencia regulatoria.",
  },
  {
    id: "lims", title: "Sistema LIMS", level: "Intermedio", category: "Tecnología", emoji: "🖥️",
    description: "Gestión de información de laboratorio: flujo, trazabilidad y reportes.",
    readingTitle: "El flujo digital de una muestra",
    reading: [
      "Desde que llega al laboratorio, cada muestra deja un rastro digital en el LIMS: recepción, analista, instrumento y resultado, todo registrado y vinculado.",
      "Cuando un cliente solicita una revisión histórica, el LIMS recupera toda la información en segundos, demostrando que el proceso fue controlado en cada etapa.",
      "Un LIMS bien configurado reduce errores de transcripción, facilita la trazabilidad y permite generar informes automáticos.",
    ],
    vocab: [
      { es: "LIMS", pt: "LIMS" }, { es: "rastro digital", pt: "rastro digital" },
      { es: "transcripción", pt: "transcrição" }, { es: "informe automático", pt: "relatório automático" },
      { es: "vinculado", pt: "vinculado" }, { es: "recuperar información", pt: "recuperar informação" },
    ],
    quiz: [
      { question: "¿Qué queda en el LIMS?", options: ["Solo el resultado", "Recepción, analista, instrumento y resultado", "Solo el nombre"], answer: "Recepción, analista, instrumento y resultado" },
      { question: "¿Qué permite el LIMS?", options: ["Nada", "Recuperar información rápidamente", "Reiniciar el proceso"], answer: "Recuperar información rápidamente" },
      { question: "Un LIMS bien configurado...", options: ["Reemplaza al analista", "Reduce errores y facilita la trazabilidad", "Solo sirve para facturación"], answer: "Reduce errores y facilita la trazabilidad" },
    ],
    dictation: "Un LIMS bien configurado reduce errores de transcripción, facilita la trazabilidad y permite generar informes automáticos.",
  },
  {
    id: "redes", title: "Redes y conectividad", level: "Básico", category: "Tecnología", emoji: "🌐",
    description: "Vocabulario de redes, conectividad y problemas comunes en TI.",
    readingTitle: "Sin red no hay laboratorio",
    reading: [
      "Una tarde, el laboratorio perdió conectividad con el servidor. Los equipos analíticos funcionaban, pero los resultados no podían enviarse al sistema ni imprimirse los informes.",
      "El técnico identificó que un switch había fallado. Mientras se reemplazaba, activaron un plan de contingencia: registro manual y comunicación directa con los médicos.",
      "La infraestructura de red es tan crítica como los equipos del laboratorio. Un mapa actualizado y un plan de contingencia son herramientas indispensables.",
    ],
    vocab: [
      { es: "red", pt: "rede" }, { es: "servidor", pt: "servidor" },
      { es: "switch", pt: "switch" }, { es: "conectividad", pt: "conectividade" },
      { es: "plan de contingencia", pt: "plano de contingência" }, { es: "infraestructura", pt: "infraestrutura" },
    ],
    quiz: [
      { question: "¿Qué problema ocurrió?", options: ["Se rompió un equipo", "El laboratorio perdió conectividad", "Se venció un reactivo"], answer: "El laboratorio perdió conectividad" },
      { question: "¿Qué causó el problema?", options: ["Un virus", "Un switch fallido", "El usuario apagó el servidor"], answer: "Un switch fallido" },
      { question: "¿Qué demuestra la experiencia?", options: ["Que la red no importa", "Que la red es tan crítica como los equipos", "Que el papel es mejor"], answer: "Que la red es tan crítica como los equipos" },
    ],
    dictation: "Un mapa actualizado de la red y un plan de contingencia son herramientas indispensables para el laboratorio.",
  },
  {
    id: "backup", title: "Backup y recuperación", level: "Intermedio", category: "Tecnología", emoji: "💾",
    description: "Estrategias de respaldo, recuperación y continuidad operativa.",
    readingTitle: "El día que perdimos los datos",
    reading: [
      "Un fallo en el disco provocó pérdida de acceso a los datos del día. El backup más reciente tenía 48 horas. Se perdieron dos días de registros.",
      "El laboratorio implementó backup diario automático con copia en servidor externo y otra en la nube. También definió un procedimiento de recuperación con tiempos máximos aceptables.",
      "El backup no es un gasto: es una inversión en la continuidad del negocio y la protección de los datos de los pacientes.",
    ],
    vocab: [
      { es: "backup / respaldo", pt: "backup / cópia de segurança" }, { es: "recuperación de datos", pt: "recuperação de dados" },
      { es: "nube", pt: "nuvem" }, { es: "continuidad operativa", pt: "continuidade operacional" },
      { es: "disco", pt: "disco" }, { es: "política de backup", pt: "política de backup" },
    ],
    quiz: [
      { question: "¿Qué causó la pérdida?", options: ["Un virus", "Un fallo en el disco", "Error del usuario"], answer: "Un fallo en el disco" },
      { question: "¿Cuánto tenía el backup más reciente?", options: ["1 hora", "48 horas", "1 semana"], answer: "48 horas" },
      { question: "¿Qué implementó el laboratorio?", options: ["Nada", "Backup diario con copia externa y en la nube", "Solo backup semanal"], answer: "Backup diario con copia externa y en la nube" },
    ],
    dictation: "El backup no es un gasto: es una inversión en la continuidad del negocio y en la protección de los datos de los pacientes.",
  },
  {
    id: "base-datos", title: "Base de datos", level: "Avanzado", category: "Tecnología", emoji: "🗄️",
    description: "Conceptos clave de bases de datos en el contexto de laboratorio.",
    readingTitle: "Los datos bien organizados",
    reading: [
      "Una base de datos bien diseñada permite almacenar, relacionar y recuperar información eficientemente. Cada tabla tiene una función: pacientes, muestras, análisis, resultados, usuarios.",
      "Cuando se busca el historial de un paciente, el sistema cruza varias tablas en milisegundos gracias a las relaciones entre ellas.",
      "La integridad depende de reglas bien definidas: campos obligatorios, tipos de datos correctos y restricciones que eviten duplicaciones.",
    ],
    vocab: [
      { es: "base de datos", pt: "banco de dados" }, { es: "tabla", pt: "tabela" },
      { es: "campo", pt: "campo" }, { es: "consulta", pt: "consulta / query" },
      { es: "integridad", pt: "integridade" }, { es: "duplicación", pt: "duplicação" },
    ],
    quiz: [
      { question: "¿Qué permite una base de datos bien diseñada?", options: ["Solo almacenar", "Almacenar, relacionar y recuperar eficientemente", "Reemplazar al analista"], answer: "Almacenar, relacionar y recuperar eficientemente" },
      { question: "¿De qué depende la integridad?", options: ["Del color de la interfaz", "De reglas bien definidas", "Del tamaño del servidor"], answer: "De reglas bien definidas" },
      { question: "¿Qué pasa si las relaciones están mal?", options: ["Nada", "La búsqueda puede ser lenta o incorrecta", "El sistema mejora"], answer: "La búsqueda puede ser lenta o incorrecta" },
    ],
    dictation: "La integridad de los datos depende de reglas bien definidas: campos obligatorios, tipos correctos y restricciones que eviten duplicaciones.",
  },
  // GRAMÁTICA
  {
    id: "presente-indicativo", title: "Presente de indicativo", level: "Básico", category: "Gramática", emoji: "✏️",
    description: "Conjugación y uso del presente en contextos técnicos.",
    readingTitle: "Lo que hacemos todos los días",
    reading: [
      "El presente de indicativo se usa para acciones habituales, hechos generales y situaciones actuales. En el laboratorio: 'el analista verifica', 'el sistema registra', 'el equipo procesa'.",
      "Los verbos regulares siguen patrones según su terminación: -ar (trabajar → trabajo), -er (leer → leo), -ir (escribir → escribo).",
      "Algunos verbos comunes son irregulares: ser, estar, tener, ir, hacer, poder. Estos aparecen en casi todas las conversaciones técnicas.",
    ],
    vocab: [
      { es: "verificar", pt: "verificar" }, { es: "registrar", pt: "registrar" },
      { es: "procesar", pt: "processar" }, { es: "informar", pt: "informar" },
      { es: "analizar", pt: "analisar" }, { es: "comunicar", pt: "comunicar" },
    ],
    quiz: [
      { question: "¿Para qué se usa el presente?", options: ["Solo el futuro", "Acciones habituales y situaciones actuales", "Solo el pasado"], answer: "Acciones habituales y situaciones actuales" },
      { question: "¿Cómo se conjuga 'trabajar' en primera persona?", options: ["trabajo", "trabaja", "trabajamos"], answer: "trabajo" },
      { question: "¿Cuál es irregular?", options: ["trabajar", "leer", "tener"], answer: "tener" },
    ],
    dictation: "El analista verifica los controles, registra los resultados y comunica cualquier desviación al área responsable.",
  },
  {
    id: "pasado", title: "Pretérito perfecto e indefinido", level: "Intermedio", category: "Gramática", emoji: "📅",
    description: "Cómo hablar del pasado en informes y comunicaciones técnicas.",
    readingTitle: "Lo que ocurrió y lo que ha ocurrido",
    reading: [
      "En español hay dos tiempos para el pasado: el pretérito perfecto (he hecho, ha detectado) y el indefinido (hice, detectó). En contextos técnicos, la elección puede cambiar el significado.",
      "El perfecto se usa cuando la acción pasada sigue siendo relevante: 'el equipo ha detectado una desviación'. El indefinido para acciones terminadas: 'ayer el analista procesó 40 muestras'.",
      "Un error frecuente en hablantes de portugués es usar solo el presente donde el español requiere el pretérito.",
    ],
    vocab: [
      { es: "pretérito perfecto", pt: "pretérito perfeito composto" }, { es: "pretérito indefinido", pt: "pretérito perfeito simples" },
      { es: "ayer", pt: "ontem" }, { es: "ha detectado", pt: "detectou / tem detectado" },
      { es: "ocurrió", pt: "ocorreu" }, { es: "informe", pt: "relatório" },
    ],
    quiz: [
      { question: "¿Cuándo se usa el pretérito perfecto?", options: ["Para acciones sin relación actual", "Cuando la acción pasada sigue siendo relevante", "Solo en el futuro"], answer: "Cuando la acción pasada sigue siendo relevante" },
      { question: "¿Cuál es correcto para 'ayer'?", options: ["He procesado ayer", "Ayer procesé", "Ayer proceso"], answer: "Ayer procesé" },
      { question: "¿Qué error es frecuente en hablantes de portugués?", options: ["Usar demasiado el pasado", "Usar el presente donde se necesita el pretérito", "No usar verbos"], answer: "Usar el presente donde se necesita el pretérito" },
    ],
    dictation: "Ayer el analista procesó cuarenta muestras y detectó una desviación que ha sido comunicada al área de calidad.",
  },
  {
    id: "ser-estar", title: "Ser vs. Estar", level: "Básico", category: "Gramática", emoji: "🔄",
    description: "Una de las mayores diferencias entre español y portugués.",
    readingTitle: "¿Es o está?",
    reading: [
      "Una diferencia clave entre español y portugués es el uso de 'ser' y 'estar'. En español, 'ser' es para características permanentes: 'el laboratorio es grande', 'ella es analista'.",
      "'Estar' es para estados temporales o ubicación: 'el resultado está validado', 'el equipo está en mantenimiento'.",
      "En contexto técnico: 'el reactivo es vencido' (incorrecto) vs. 'el reactivo está vencido' (correcto, porque el vencimiento es un estado).",
    ],
    vocab: [
      { es: "ser", pt: "ser" }, { es: "estar", pt: "estar" },
      { es: "permanente", pt: "permanente" }, { es: "temporal", pt: "temporário" },
      { es: "validado", pt: "validado" }, { es: "en mantenimiento", pt: "em manutenção" },
    ],
    quiz: [
      { question: "¿Cuándo se usa 'ser'?", options: ["Estados temporales", "Características permanentes o identidad", "Ubicación"], answer: "Características permanentes o identidad" },
      { question: "¿Cuál es correcto?", options: ["El reactivo es vencido", "El reactivo está vencido", "El reactivo fue vencido siempre"], answer: "El reactivo está vencido" },
      { question: "¿Cuál es correcto?", options: ["Ella está analista", "Ella es analista", "Ella fue analista siempre"], answer: "Ella es analista" },
    ],
    dictation: "El equipo está en mantenimiento y el resultado está validado, pero el procedimiento es el mismo de siempre.",
  },
  {
    id: "subjuntivo", title: "Subjuntivo básico", level: "Avanzado", category: "Gramática", emoji: "🌀",
    description: "Uso del subjuntivo en recomendaciones y comunicaciones técnicas.",
    readingTitle: "Lo que recomendamos que hagan",
    reading: [
      "El subjuntivo se usa para deseos, recomendaciones, dudas o situaciones hipotéticas.",
      "En contexto técnico aparece frecuentemente: 'es importante que el analista verifique los controles', 'es necesario que se documente cada etapa'.",
      "La estructura más común: verbo de influencia + 'que' + subjuntivo. Reconocer este patrón ayuda enormemente a entender documentos y conversaciones técnicas.",
    ],
    vocab: [
      { es: "es importante que", pt: "é importante que" }, { es: "recomendamos que", pt: "recomendamos que" },
      { es: "es necesario que", pt: "é necessário que" }, { es: "verifique", pt: "verifique" },
      { es: "revise", pt: "revise" }, { es: "documente", pt: "documente" },
    ],
    quiz: [
      { question: "¿Para qué se usa el subjuntivo?", options: ["Solo el pasado", "Deseos, recomendaciones, dudas o hipótesis", "Solo preguntas"], answer: "Deseos, recomendaciones, dudas o hipótesis" },
      { question: "¿Cuál es la estructura más común?", options: ["Verbo + infinitivo", "Verbo de influencia + que + subjuntivo", "Solo adjetivos"], answer: "Verbo de influencia + que + subjuntivo" },
      { question: "¿Cuál es correcto?", options: ["Es importante que verificas", "Es importante que verifiques", "Es importante verificando"], answer: "Es importante que verifiques" },
    ],
    dictation: "Es importante que el analista verifique los controles y es necesario que se documente cada etapa del proceso.",
  },
  {
    id: "conectores", title: "Conectores y cohesión", level: "Intermedio", category: "Gramática", emoji: "🔗",
    description: "Palabras clave para conectar ideas en textos e informes técnicos.",
    readingTitle: "El informe que fluía",
    reading: [
      "Un informe bien redactado usa conectores que guían al lector. Sin ellos, el texto parece una lista sin relación. Con ellos, el documento fluye y la lógica es clara.",
      "Conectores útiles: para agregar (además, también), para contrastar (sin embargo, aunque), para indicar causa (porque, dado que), para consecuencia (por lo tanto, en consecuencia).",
      "Dominar estos conectores permite redactar hallazgos, justificar decisiones y comunicar conclusiones de manera profesional.",
    ],
    vocab: [
      { es: "sin embargo", pt: "no entanto / porém" }, { es: "además", pt: "além disso" },
      { es: "por lo tanto", pt: "portanto" }, { es: "dado que", pt: "dado que / uma vez que" },
      { es: "en consecuencia", pt: "em consequência" }, { es: "asimismo", pt: "igualmente" },
    ],
    quiz: [
      { question: "¿Para qué sirven los conectores?", options: ["Para alargar el texto", "Para guiar al lector de una idea a otra", "Para complicar la lectura"], answer: "Para guiar al lector de una idea a otra" },
      { question: "¿Qué conector indica consecuencia?", options: ["Además", "Sin embargo", "Por lo tanto"], answer: "Por lo tanto" },
      { question: "¿Qué conector indica contraste?", options: ["También", "Sin embargo", "Dado que"], answer: "Sin embargo" },
    ],
    dictation: "El control presentó una desviación; sin embargo, el equipo tomó medidas preventivas y, por lo tanto, no fue necesario rechazar la corrida.",
  },
  {
    id: "vocabulario-general", title: "Vocabulario del trabajo", level: "Básico", category: "Gramática", emoji: "📖",
    description: "Palabras y frases esenciales para el día a día profesional en español.",
    readingTitle: "Las palabras que más necesitás",
    reading: [
      "Aprender español técnico no es solo memorizar términos científicos. También implica dominar el vocabulario del entorno laboral: reuniones, correos, instrucciones y conversaciones cotidianas.",
      "Algunas palabras parecidas en español y portugués tienen significados diferentes: los 'falsos cognados'. Por ejemplo: 'borracha' en portugués significa 'goma de borrar', pero en español significa 'mujer ebria'.",
      "La mejor estrategia es practicar con contextos reales: leer correos, escuchar conversaciones técnicas y usar las palabras nuevas en el trabajo.",
    ],
    vocab: [
      { es: "reunión", pt: "reunião" }, { es: "correo electrónico", pt: "e-mail" },
      { es: "colega", pt: "colega" }, { es: "falso cognado", pt: "falso cognato" },
      { es: "contexto", pt: "contexto" }, { es: "ampliar", pt: "ampliar" },
    ],
    quiz: [
      { question: "¿Qué son los 'falsos cognados'?", options: ["Palabras iguales en ambos idiomas", "Palabras parecidas con significados diferentes", "Sinónimos"], answer: "Palabras parecidas con significados diferentes" },
      { question: "¿Qué significa 'borracha' en español?", options: ["Goma de borrar", "Mujer ebria", "Botella"], answer: "Mujer ebria" },
      { question: "¿Cuál es la mejor estrategia?", options: ["Solo diccionarios", "Practicar con contextos reales", "Memorizar listas"], answer: "Practicar con contextos reales" },
    ],
    dictation: "La mejor estrategia para aprender español técnico es practicar con contextos reales del trabajo diario.",
  },
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

const STORAGE_KEY = "aula-controllab-v4";
const PROFESSOR_PASSWORD = "controllab2025";
const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática"];
const LEVEL_COLOR: Record<string, string> = {
  "Básico": "bg-emerald-900 text-emerald-300",
  "Intermedio": "bg-amber-900 text-amber-300",
  "Avanzado": "bg-rose-900 text-rose-300",
};
const QUIZ_TIME = 30;

function createInitialState(): AppState {
  return { students: defaultStudents, currentStudentId: null, progress: {}, dictations: {} };
}
function normalize(v: string): string {
  return v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *{font-family:'Sora',sans-serif;box-sizing:border-box;}
  .mono{font-family:'JetBrains Mono',monospace;}
  .glass{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(20px);}
  .glass-dark{background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(20px);}
  .accent{color:#63CAB7;}.accent-bg{background:#63CAB7;}
  .btn-accent{background:linear-gradient(135deg,#63CAB7,#4aab97);color:#0f1923;font-weight:700;border-radius:12px;transition:all .2s;cursor:pointer;}
  .btn-accent:hover{opacity:.9;transform:translateY(-1px);}
  .btn-accent:disabled{opacity:.4;cursor:not-allowed;transform:none;}
  input,textarea{outline:none;transition:all .2s;}
  input:focus,textarea:focus{border-color:#63CAB7!important;box-shadow:0 0 0 3px rgba(99,202,183,.15);}
  .module-card{transition:all .2s;cursor:pointer;}
  .module-card:hover{border-color:rgba(99,202,183,.4)!important;transform:translateY(-2px);}
  .module-card.active{background:linear-gradient(135deg,rgba(99,202,183,.15),rgba(74,171,151,.1));border-color:#63CAB7!important;}
  .progress-bar{height:6px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;}
  .progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#63CAB7,#4aab97);transition:width .6s ease;}
  .tab{transition:all .2s;cursor:pointer;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:600;}
  .tab.active{background:#63CAB7;color:#0f1923;}
  .tab:not(.active){color:#94a3b8;}
  .tab:not(.active):hover{color:#fff;background:rgba(255,255,255,.08);}
  .opt{transition:all .18s;border:1.5px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 16px;text-align:left;width:100%;background:rgba(255,255,255,.04);color:#e2e8f0;cursor:pointer;}
  .opt:hover:not(:disabled){border-color:rgba(99,202,183,.5);background:rgba(99,202,183,.07);}
  .opt.sel{border-color:#63CAB7;background:rgba(99,202,183,.1);}
  .opt.ok{border-color:#63CAB7;background:rgba(99,202,183,.2);color:#63CAB7;font-weight:600;}
  .opt.bad{border-color:#f87171;background:rgba(248,113,113,.1);color:#f87171;}
  .fc{perspective:1000px;cursor:pointer;}
  .fc-inner{position:relative;width:100%;height:180px;transition:transform .6s;transform-style:preserve-3d;}
  .fc-inner.flip{transform:rotateY(180deg);}
  .fc-face{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;padding:20px;text-align:center;}
  .fc-front{background:rgba(99,202,183,.1);border:1.5px solid #63CAB7;color:#63CAB7;}
  .fc-back{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.2);color:#fff;transform:rotateY(180deg);}
  .cert{background:linear-gradient(135deg,#0f172a,#1e293b);border:2px solid #63CAB7;border-radius:24px;padding:40px;}
  @keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  .ani{animation:fadeIn .3s ease;}
  .m1{color:#FFD700;}.m2{color:#C0C0C0;}.m3{color:#CD7F32;}
  ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px;}
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

  const openPanel = () => {
    if (showPanel) { setShowPanel(false); return; }
    const pwd = prompt("🔐 Contraseña del profesor:");
    if (pwd === PROFESSOR_PASSWORD) setShowPanel(true);
    else if (pwd !== null) alert("Contraseña incorrecta.");
  };

  const login = () => {
    const found = appState.students.find(s => normalize(s.name) === normalize(loginName) && normalize(s.code) === normalize(loginCode));
    if (!found) { setLoginError("Nombre o código incorrecto."); return; }
    setAppState(p => ({ ...p, currentStudentId: found.id }));
    setLoginError(""); setLoginName(""); setLoginCode("");
  };
  const logout = () => { setAppState(p => ({ ...p, currentStudentId: null })); setShowPanel(false); };
  const saveProg = (score: number, total: number) => {
    if (!student) return;
    setAppState(p => {
      const ps = p.progress[student.id] || {};
      const pm = ps[selectedModuleId] || { completed: false, score: 0, total, attempts: 0 };
      return { ...p, progress: { ...p.progress, [student.id]: { ...ps, [selectedModuleId]: { completed: true, score: Math.max(pm.score, score), total, attempts: pm.attempts + 1 } } } };
    });
  };
  const handleSubmit = () => { if (!selectedOption) return; setSubmitted(true); setTimerOn(false); };
  const handleNext = () => {
    if (qIdx < mod.quiz.length - 1) {
      setQIdx(i => i + 1); setSelectedOption(answers[qIdx + 1] || ""); setSubmitted(false); setTimeLeft(QUIZ_TIME); setTimerOn(true); return;
    }
    const correct = mod.quiz.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
    saveProg(correct, mod.quiz.length);
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
    const from = transDir === "es-pt" ? "español" : "portugués";
    const to = transDir === "es-pt" ? "portugués" : "español";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 300,
          messages: [{ role: "user", content: `Traducí este texto de ${from} a ${to} en contexto técnico de laboratorio clínico. Respondé SOLO con la traducción, sin explicaciones:\n\n${transInput}` }]
        })
      });
      const data = await res.json();
      setTransResult(data.content?.[0]?.text || "No se pudo traducir.");
    } catch { setTransResult("Error de conexión."); }
    setTransLoading(false);
  };

  // LOGIN
  const loginRanking = appState.students.map(s => {
    const p = appState.progress[s.id] || {};
    const pts = MODULES.reduce((x, m) => x + (p[m.id]?.score || 0), 0) * 10;
    const cm = Object.keys(p).length;
    return { ...s, pts, cm };
  }).sort((a, b) => b.pts - a.pts).slice(0, 5);

  if (!student) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 overflow-x-hidden">
      <style>{STYLES}</style>

      {/* BG blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,202,183,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,202,183,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,171,151,0.06) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* HERO */}
        <div className="text-center mb-10 ani">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs mono tracking-widest text-slate-400 mb-6">
            <span className="w-2 h-2 rounded-full accent-bg inline-block" style={{ animation: "pulse 2s infinite" }} />
            CONTROLLAB · PLATAFORMA DE ESPAÑOL TÉCNICO
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
            Aula<br /><span className="accent" style={{ textShadow: "0 0 60px rgba(99,202,183,0.4)" }}>Controllab</span>
          </h1>
          <p className="mt-5 text-slate-300 text-lg max-w-xl mx-auto leading-7">
            Español técnico para el equipo Controllab.<br />
            <span className="accent font-semibold">{MODULES.length} módulos</span> · laboratorio · gestión · TI · comunicación · gramática
          </p>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 ani">
          {[
            { icon: "🧪", n: MODULES.length, l: "Módulos", sub: "32 lecciones completas" },
            { icon: "👥", n: defaultStudents.length, l: "Alumnos", sub: "Equipo Controllab" },
            { icon: "📚", n: "6", l: "Áreas", sub: "Lab · TI · Gestión · más" },
            { icon: "🏆", n: "Top 5", l: "Ranking", sub: "Competencia entre colegas" },
          ].map(x => (
            <div key={x.l} className="glass rounded-2xl p-4 text-center" style={{ borderColor: "rgba(99,202,183,0.1)" }}>
              <div className="text-2xl mb-1">{x.icon}</div>
              <div className="text-2xl font-black mono text-white">{x.n}</div>
              <div className="text-sm font-bold text-white mt-0.5">{x.l}</div>
              <div className="text-xs text-slate-500 mt-1">{x.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

          {/* LEFT: ranking preview + alumnos + módulos preview */}
          <div className="space-y-4">

            {/* Ranking preview */}
            <div className="glass rounded-3xl p-5" style={{ boxShadow: "0 0 30px rgba(99,202,183,0.08)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="mono text-xs text-slate-400 tracking-widest">🏆 RANKING ACTUAL</div>
                <div className="text-xs text-slate-500">Top 5 alumnos</div>
              </div>
              {loginRanking.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">🚀</div>
                  <div className="text-slate-400 text-sm">¡Nadie ha completado módulos todavía! Sé el primero.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {loginRanking.map((r, i) => (
                    <div key={r.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${i === 0 ? "bg-yellow-500/10 border border-yellow-500/20" : "glass"}`}>
                      <span className={`text-lg w-7 ${i === 0 ? "m1" : i === 1 ? "m2" : i === 2 ? "m3" : "text-slate-500"}`}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}.`}</span>
                      <span className="flex-1 font-semibold text-sm">{r.name}</span>
                      <span className="text-xs text-slate-400">{r.cm} mód.</span>
                      <span className="mono text-sm font-black accent">{r.pts} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Módulos preview */}
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">📚 MÓDULOS DISPONIBLES</div>
              <div className="grid grid-cols-4 gap-2">
                {MODULES.map(m => (
                  <div key={m.id} className="glass rounded-xl p-2.5 text-center" title={m.title}>
                    <div className="text-xl">{m.emoji}</div>
                    <div className="text-xs text-slate-400 mt-1 truncate" style={{ fontSize: "9px" }}>{m.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alumnos */}
            <div className="glass rounded-3xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">👥 ALUMNOS</div>
              <div className="flex flex-wrap gap-2">
                {defaultStudents.map(s => <span key={s.id} className="glass text-slate-200 text-xs px-3 py-1.5 rounded-full font-medium">{s.name}</span>)}
              </div>
            </div>
          </div>

          {/* RIGHT: login + translator */}
          <div className="space-y-4">
            {/* LOGIN */}
            <div className="glass rounded-3xl p-7" style={{ boxShadow: "0 0 40px rgba(99,202,183,0.12)", borderColor: "rgba(99,202,183,0.15)" }}>
              <div className="mono text-xs tracking-widest text-slate-400 mb-1">INGRESO</div>
              <h2 className="text-2xl font-bold text-white mb-1">Entrar como alumno</h2>
              <p className="text-slate-400 text-sm mb-6">Usá tu nombre y el código que te dio el profe.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2 font-medium">Nombre</label>
                  <input value={loginName} onChange={e => setLoginName(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Ej: Marília" className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3.5" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2 font-medium">Código de acceso</label>
                  <input value={loginCode} onChange={e => setLoginCode(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Ej: MARILIA" className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3.5 mono" />
                </div>
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

            {/* TRANSLATOR */}
            <div className="glass rounded-3xl p-5" style={{ borderColor: "rgba(99,202,183,0.15)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="mono text-xs text-slate-400 tracking-widest mb-0.5">🌐 TRADUCTOR RÁPIDO</div>
                  <div className="text-sm font-semibold text-white">Español ↔ Portugués técnico</div>
                </div>
                <button onClick={() => setTransDir(d => d === "es-pt" ? "pt-es" : "es-pt")}
                  className="glass rounded-xl px-3 py-2 text-xs font-bold accent hover:border-[#63CAB7] transition">
                  {transDir === "es-pt" ? "ES → PT" : "PT → ES"} ⇄
                </button>
              </div>
              <textarea value={transInput} onChange={e => setTransInput(e.target.value)}
                rows={3} placeholder={transDir === "es-pt" ? "Escribí en español..." : "Escreva em português..."}
                className="w-full rounded-2xl bg-slate-800/80 border border-slate-700 text-white px-4 py-3 text-sm leading-6 resize-none" />
              <button onClick={translate} disabled={transLoading || !transInput.trim()} className="btn-accent w-full mt-3 py-3 text-sm">
                {transLoading ? "Traduciendo..." : "Traducir"}
              </button>
              {transResult && (
                <div className="mt-3 glass-dark rounded-2xl p-4 ani">
                  <div className="text-xs text-slate-400 mono mb-2 tracking-widest">{transDir === "es-pt" ? "PORTUGUÉS" : "ESPAÑOL"}</div>
                  <p className="text-slate-100 text-sm leading-6">{transResult}</p>
                  <button onClick={() => speak(transResult, 0.85)} className="mt-2 text-xs text-slate-400 hover:accent transition">🔊 Escuchar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            <button onClick={() => setShowTranslator(t => !t)} className={`glass rounded-xl px-3 py-2 text-xs transition ${showTranslator ? "accent border-[#63CAB7]" : "text-slate-300 hover:text-white"}`}>🌐 Traductor</button>
            <button onClick={openPanel} className="glass rounded-xl px-3 py-2 text-xs text-slate-300 hover:text-white transition">{showPanel ? "✕ Panel" : "📊 Panel profe"}</button>
            <button onClick={logout} className="glass rounded-xl px-3 py-2 text-xs text-slate-300 hover:text-white transition">Salir →</button>
          </div>
        </div>
        <div className="progress-bar mx-4 mb-2" style={{ borderRadius: 0 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-6">

        {/* TRANSLATOR PANEL */}
        {showTranslator && (
          <div className="glass rounded-3xl p-5 mb-6 ani">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="mono text-xs text-slate-400 tracking-widest mb-0.5">🌐 TRADUCTOR RÁPIDO</div>
                <div className="text-sm font-semibold text-white">Español ↔ Portugués técnico · IA</div>
              </div>
              <button onClick={() => setTransDir(d => d === "es-pt" ? "pt-es" : "es-pt")} className="glass rounded-xl px-4 py-2 text-sm font-bold accent hover:border-[#63CAB7] transition">
                {transDir === "es-pt" ? "ES → PT" : "PT → ES"} ⇄
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400 mono mb-2">{transDir === "es-pt" ? "ESPAÑOL" : "PORTUGUÉS"}</div>
                <textarea value={transInput} onChange={e => setTransInput(e.target.value)} rows={4}
                  placeholder={transDir === "es-pt" ? "Escribí en español..." : "Escreva em português..."}
                  className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm leading-6 resize-none" />
                <button onClick={translate} disabled={transLoading || !transInput.trim()} className="btn-accent w-full mt-2 py-2.5 text-sm">
                  {transLoading ? "Traduciendo..." : "Traducir →"}
                </button>
              </div>
              <div>
                <div className="text-xs text-slate-400 mono mb-2">{transDir === "es-pt" ? "PORTUGUÉS" : "ESPAÑOL"}</div>
                <div className="w-full rounded-2xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm leading-6 min-h-[104px] text-slate-100">
                  {transLoading ? <span className="text-slate-500 animate-pulse">Traduciendo...</span> : transResult || <span className="text-slate-600">La traducción aparece aquí...</span>}
                </div>
                {transResult && <button onClick={() => speak(transResult, 0.85)} className="mt-2 text-xs text-slate-400 hover:text-white transition">🔊 Escuchar traducción</button>}
              </div>
            </div>
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
              <div className="space-y-3">
                {ranking.map((r, i) => (
                  <div key={r.id} className={`glass rounded-2xl px-5 py-4 flex items-center gap-4 ${i === 0 ? "border border-yellow-500/30" : i === 1 ? "border border-slate-400/20" : i === 2 ? "border border-amber-700/20" : ""}`}>
                    <div className={`text-2xl font-black w-8 ${i === 0 ? "m1" : i === 1 ? "m2" : i === 2 ? "m3" : "text-slate-500"}`}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}</div>
                    <div className="flex-1"><div className="font-bold">{r.name}</div><div className="text-xs text-slate-400">{r.cm}/{MODULES.length} mód · dictado {r.da}%</div></div>
                    <div className="text-right"><div className="text-2xl font-black mono accent">{r.pts}</div><div className="text-xs text-slate-500">pts</div></div>
                  </div>
                ))}
              </div>
            )}

            {teacherTab === "progress" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-slate-400">
                    <th className="text-left px-4 py-3">Alumno</th>
                    {MODULES.map(m => <th key={m.id} className="text-center px-1 py-3 text-xs" title={m.title}>{m.emoji}</th>)}
                    <th className="text-center px-4 py-3">%</th>
                  </tr></thead>
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
                  <thead><tr className="bg-white/5 text-slate-400">
                    <th className="text-left px-4 py-3">Alumno</th>
                    {MODULES.map(m => <th key={m.id} className="text-center px-1 py-3 text-xs" title={m.title}>{m.emoji}</th>)}
                    <th className="text-center px-4 py-3">Prom.</th>
                  </tr></thead>
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
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {appState.students.map(s => (
                      <div key={s.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                        <div><div className="font-medium text-sm">{s.name}</div><div className="mono text-xs text-slate-500">{s.code}</div></div>
                        {!defaultStudents.some(d => d.id === s.id) && <button onClick={() => removeStudent(s.id)} className="text-rose-400 text-xs hover:text-rose-300">Eliminar</button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map(c => <button key={c} onClick={() => setActiveCategory(c)} className={`tab whitespace-nowrap ${activeCategory === c ? "active" : ""}`}>{c}</button>)}
        </div>

        {/* MODULE GRID */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 mb-6">
          {filtered.map(m => {
            const p = sp[m.id]; const active = m.id === selectedModuleId;
            return (
              <button key={m.id} onClick={() => setSelectedModuleId(m.id)} className={`module-card glass rounded-2xl p-3 text-left border ${active ? "active" : "border-white/5"}`}>
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
            {/* Header + tabs */}
            <div className="glass rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="mono text-xs text-slate-400 tracking-widest mb-1">{mod.category.toUpperCase()}</div>
                  <h2 className="text-2xl font-bold">{mod.emoji} {mod.title}</h2>
                  <p className="mt-1 text-slate-400 text-sm">{mod.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${LEVEL_COLOR[mod.level]}`}>{mod.level}</span>
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

            {/* READING */}
            {section === "reading" && (
              <div className="glass rounded-3xl p-6 ani">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">{mod.readingTitle}</h3>
                  <button onClick={() => speak(mod.reading.join(" "), 0.9)} className="glass rounded-xl px-4 py-2 text-sm text-slate-300 hover:text-white transition">🔊 Escuchar</button>
                </div>
                <div className="space-y-4">{mod.reading.map((p, i) => <p key={i} className="text-slate-200 leading-8 text-[15px]">{p}</p>)}</div>
                <button onClick={startQuiz} className="btn-accent mt-6 px-6 py-3 text-sm">Ir al quiz →</button>
              </div>
            )}

            {/* QUIZ */}
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
                <div className="mt-5 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm">{submitted ? (isOk ? <span className="text-emerald-400 font-semibold">✓ ¡Correcto!</span> : <span className="text-rose-400">✗ Correcto: <strong className="text-white">{q.answer}</strong></span>) : <span className="text-slate-400">Elegí antes de que el tiempo se acabe.</span>}</div>
                  {!submitted ? <button onClick={handleSubmit} disabled={!selectedOption} className="btn-accent px-6 py-3 text-sm">Comprobar</button>
                    : <button onClick={handleNext} className="btn-accent px-6 py-3 text-sm">{qIdx < mod.quiz.length - 1 ? "Siguiente →" : "Finalizar ✓"}</button>}
                </div>
              </div>
            )}

            {/* DICTATION */}
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

            {/* VOCAB */}
            {section === "vocab" && (
              <div className="glass rounded-3xl p-6 ani">
                <h3 className="text-xl font-bold mb-5">📝 Vocabulario clave</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {mod.vocab.map(v => (
                    <div key={v.es} className="glass-dark rounded-2xl px-5 py-4 flex justify-between items-center gap-4">
                      <div><div className="font-semibold">{v.es}</div><div className="text-xs text-slate-500 mt-0.5">Español</div></div>
                      <div className="text-right"><div className="font-semibold accent">{v.pt}</div><div className="text-xs text-slate-500 mt-0.5">Portugués</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FLASHCARDS */}
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
