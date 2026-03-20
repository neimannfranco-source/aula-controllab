"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjufnjnijkzypnktdxql.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdWZuam5pamt6eXBua3RkeHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzUyMjgsImV4cCI6MjA4OTUxMTIyOH0.VWEtmhvSB8Crtjf2vcoFMJaIiDQ5ejkaQB1B2zEBnbw";
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
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

const MODULES: ModuleType[] = [
  // ══ LABORATORIO ══
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
      "Un lunes a las siete de la mañana, durante la revisión inicial de los controles internos del turno, una analista con varios años de experiencia notó algo que la detuvo. Los valores del control de nivel medio no estaban fuera de rango, pero al mirar la secuencia de los últimos seis puntos en el gráfico de Levey-Jennings, todos caían por debajo de la media, aunque dentro de los límites de advertencia. Ese patrón, conocido como regla 6x, indica que algo está cambiando de forma sistemática en el proceso analítico, aunque todavía no sea urgente.",
      "Las reglas de Westgard son un conjunto de criterios estadísticos desarrollados por el Dr. James Westgard en los años setenta para ayudar a los laboratorios a distinguir entre dos tipos de variación: la aleatoria, que es inherente a todo proceso de medición y no requiere acción, y la sistemática, que indica un problema real que debe investigarse. Cada regla tiene un nombre que combina un número y una letra: el número indica la cantidad de observaciones involucradas y la letra indica el tipo de criterio.",
      "Entre las reglas más utilizadas se encuentran la 1₃ₛ, que es una regla de advertencia cuando un control supera tres desviaciones estándar; la 2₂ₛ, que rechaza la corrida cuando dos controles consecutivos superan dos desviaciones estándar en la misma dirección; la R₄ₛ, que detecta errores aleatorios grandes cuando la diferencia entre dos controles en la misma corrida supera cuatro desviaciones; y la 4₁ₛ, que señala errores sistemáticos cuando cuatro puntos consecutivos están del mismo lado de la media a más de una desviación estándar.",
      "En el caso del turno de la mañana, la analista aplicó correctamente la regla 6x y decidió no rechazar la corrida de inmediato, pero sí investigar la causa antes de continuar. Repitió los controles con material de un vial diferente del mismo lote. Los nuevos valores seguían el mismo patrón, lo que descartó que el problema fuera del vial específico. Luego verificó si la temperatura del equipo había fluctuado durante la noche y encontró un registro que mostraba una leve variación. Eso explicaba el desplazamiento sistemático observado.",
      "Comprender las reglas de Westgard no es solo una obligación técnica: es una herramienta de razonamiento analítico que permite actuar con criterio en lugar de reaccionar de forma mecánica. Un laboratorio que aplica estas reglas correctamente demuestra madurez técnica y capacidad para justificar sus decisiones frente a auditorías, organismos acreditadores y consultas de clientes o médicos. La formación continua del equipo en el uso e interpretación de estas reglas es una inversión directa en la calidad del resultado final.",
    ],
    vocab: [
      { es: "regla de advertencia", pt: "regra de alerta" }, { es: "media", pt: "média" },
      { es: "precisión", pt: "precisão" }, { es: "rechazar la corrida", pt: "rejeitar a corrida" },
      { es: "error sistemático", pt: "erro sistemático" }, { es: "variación aleatoria", pt: "variação aleatória" },
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
      "El hemograma completo es uno de los análisis más solicitados en cualquier laboratorio clínico y, al mismo tiempo, uno de los que más información concentra en un solo informe. Proporciona datos sobre tres grandes líneas celulares de la sangre: los eritrocitos o glóbulos rojos, cuya función principal es transportar oxígeno a los tejidos; los leucocitos o glóbulos blancos, que son los principales actores del sistema inmune; y las plaquetas o trombocitos, responsables de la hemostasia primaria.",
      "Cuando el analista revisa un hemograma, no solo verifica si los valores individuales están dentro del rango de referencia establecido para la edad y el sexo del paciente. También evalúa la coherencia interna del informe: ¿son consistentes entre sí el hematocrito, la hemoglobina y el recuento de glóbulos rojos? ¿El volumen corpuscular medio y la hemoglobina corpuscular media son compatibles con el tipo de anemia que se sospecha? Esta lectura integrada es lo que distingue un procesamiento mecánico de una interpretación analítica de calidad.",
      "Un aspecto crítico es la detección de hallazgos que requieren acción inmediata, conocidos como valores de pánico o resultados críticos. Un recuento de glóbulos blancos extremadamente elevado, especialmente con morfología anormal en el frotis, puede orientar hacia una leucemia aguda y requiere comunicación urgente al médico. Un valor de plaquetas muy bajo, por debajo de veinte mil por microlitro, indica riesgo de sangrado espontáneo grave.",
      "Los factores preanalíticos son otra fuente importante de variación que el analista debe conocer. La hemólisis de la muestra puede elevar falsamente la hemoglobina libre y alterar el recuento de glóbulos rojos. La lipemia severa interfiere con la medición fotométrica de la hemoglobina. Una muestra con microcoágulos invisibles a simple vista puede dar un recuento de plaquetas falsamente bajo, lo que podría llevar a decisiones clínicas incorrectas.",
      "Comunicar un hemograma de forma útil al médico va más allá de entregar el papel impreso con los valores y sus rangos de referencia. Implica saber identificar cuáles hallazgos son clínicamente relevantes, cuáles son urgentes y requieren llamado telefónico, y cuáles pueden incluirse como observación en el informe escrito. En un laboratorio de calidad, el analista es un profesional capaz de agregar valor interpretativo al resultado.",
    ],
    vocab: [
      { es: "hemograma", pt: "hemograma" }, { es: "glóbulo rojo / eritrocito", pt: "glóbulo vermelho / eritrócito" },
      { es: "glóbulo blanco / leucocito", pt: "glóbulo branco / leucócito" }, { es: "plaqueta", pt: "plaqueta" },
      { es: "valor crítico / pánico", pt: "valor crítico / pânico" }, { es: "frotis de sangre", pt: "esfregaço de sangue" },
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
    id: "bioquimica", title: "Bioquímica clínica", level: "Intermedio", category: "Laboratorio", emoji: "⚗️",
    description: "Glucosa, perfil lipídico, función renal y hepática en contexto clínico.",
    readingTitle: "El perfil que habla por el paciente",
    reading: [
      "La bioquímica clínica es una de las áreas más amplias y frecuentemente solicitadas del laboratorio. Abarca una gran variedad de análisis diseñados para evaluar el funcionamiento de órganos y sistemas: la glucosa y la hemoglobina glicosilada para el control del metabolismo de los hidratos de carbono; el colesterol total, el HDL, el LDL y los triglicéridos para el perfil lipídico cardiovascular; la creatinina, la urea y la tasa de filtración glomerular estimada para la función renal; las transaminasas TGO y TGP, la bilirrubina, la fosfatasa alcalina y la GGT para la función hepática.",
      "Cuando el médico solicita un perfil metabólico completo, el analista enfrenta el desafío de garantizar no solo que cada valor individual sea correcto, sino también que el conjunto sea coherente y tenga sentido clínico. Por ejemplo, un aumento de creatinina acompañado de una disminución de la tasa de filtración glomerular estimada y un aumento de la urea refuerza significativamente la sospecha de compromiso renal.",
      "La interpretación clínica de los resultados bioquímicos requiere conocer el contexto del paciente. Una glucosa de 180 mg/dL tiene un significado completamente diferente en un paciente diabético conocido en tratamiento que en una persona sin antecedentes que no había ayunado antes del análisis. Una creatinina de 1.5 mg/dL puede ser normal en un hombre joven con mucha masa muscular y ser un indicador de daño renal significativo en una mujer adulta mayor.",
      "El control de calidad en bioquímica tiene sus propias particularidades. Muchos de los equipos automatizados modernos procesan varios cientos de muestras por hora y corren los controles de forma intercalada con las muestras de pacientes. Si un control falla durante la corrida, el analista debe determinar qué muestras de pacientes se vieron potencialmente afectadas, retener esos resultados, investigar la causa del fallo y repetir tanto los controles como las muestras comprometidas.",
      "En la comunicación con el médico, el lenguaje técnico accesible es una habilidad clave. Explicar por qué dos resultados de creatinina de una misma semana son aparentemente diferentes sin que haya un error analítico, o por qué la bilirrubina elevada en una muestra hemolizada puede no reflejar la concentración real en el paciente, requiere claridad conceptual y capacidad de síntesis. Un laboratorio que sabe comunicar bien sus resultados genera confianza y fidelidad en sus clientes.",
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
      { question: "¿Por qué importa el contexto clínico del paciente en bioquímica?", options: ["No importa, los valores son absolutos", "El mismo valor puede tener significados muy distintos según el paciente", "Solo importa para la facturación", "Solo para pacientes diabéticos"], answer: "El mismo valor puede tener significados muy distintos según el paciente" },
      { question: "¿Qué hace el analista si un control falla durante la corrida?", options: ["Libera todos los resultados igual", "Retiene resultados afectados, investiga y repite muestras comprometidas", "Solo repite el control fallido", "Avisa al médico y sigue procesando"], answer: "Retiene resultados afectados, investiga y repite muestras comprometidas" },
      { question: "¿Por qué la bilirrubina en una muestra hemolizada puede ser engañosa?", options: ["Porque siempre indica daño hepático real", "Porque la hemólisis libera contenido intracelular que no refleja el nivel real del paciente", "Porque la bilirrubina no se ve afectada por hemólisis", "Porque es un valor técnicamente imposible"], answer: "Porque la hemólisis libera contenido intracelular que no refleja el nivel real del paciente" },
      { question: "¿Por qué la creatinina puede interpretarse diferente en dos pacientes con el mismo valor?", options: ["Porque los equipos dan resultados distintos", "Porque la masa muscular, el sexo y la edad influyen en la interpretación", "Porque los rangos de referencia son incorrectos", "Porque depende del método analítico"], answer: "Porque la masa muscular, el sexo y la edad influyen en la interpretación" },
      { question: "¿Qué genera confianza y fidelidad en los clientes del laboratorio?", options: ["Tener los equipos más modernos", "Saber comunicar bien los resultados con claridad y contexto clínico", "Tener los precios más bajos", "Procesar más muestras por día"], answer: "Saber comunicar bien los resultados con claridad y contexto clínico" },
    ],
    dictation: "La bioquímica clínica evalúa el funcionamiento de órganos a través de marcadores como glucosa, creatinina y perfil lipídico, siempre en contexto clínico.",
  },
  {
    id: "microbiologia", title: "Microbiología básica", level: "Avanzado", category: "Laboratorio", emoji: "🦠",
    description: "Cultivos, antibiogramas y comunicación de resultados microbiológicos.",
    readingTitle: "El cultivo que tardó tres días",
    reading: [
      "La microbiología es el área del laboratorio clínico con los tiempos de respuesta más largos y, al mismo tiempo, con algunos de los resultados de mayor impacto sobre las decisiones terapéuticas. A diferencia de la bioquímica o la hematología, donde los resultados pueden estar disponibles en minutos u horas, un cultivo microbiológico puede tardar entre veinticuatro y setenta y dos horas en mostrar crecimiento visible, y la identificación completa del microorganismo más el antibiograma pueden extender el proceso varios días adicionales.",
      "El proceso comienza con la siembra de la muestra en medios de cultivo seleccionados según el tipo de microorganismo que se sospecha y el origen anatómico de la muestra. Una muestra de orina se siembra en medios diferentes a una muestra de esputo o de herida quirúrgica. Después de la incubación, el analista examina las placas buscando crecimiento de colonias, evalúa su morfología, realiza la coloración de Gram y procede a la identificación formal del microorganismo.",
      "El antibiograma es el componente del informe microbiológico de mayor relevancia clínica directa: informa al médico qué antibióticos son eficaces contra el microorganismo identificado y cuáles no lo son. Los resultados se expresan como sensible, intermedio o resistente para cada antibiótico evaluado. La detección de un Staphylococcus aureus resistente a meticilina (MRSA) o de una enterobacteria productora de carbapenemasas cambia completamente el esquema de tratamiento.",
      "Durante el período de espera del cultivo, el médico frecuentemente necesita información parcial para iniciar un tratamiento empírico. El laboratorio puede colaborar informando los resultados de la tinción de Gram como resultado preliminar. La observación de cocos grampositivos en una muestra de sangre puede orientar hacia un tratamiento inicial mientras se espera el resultado definitivo. Esa comunicación preliminar debe ser acompañada de una indicación clara de que se trata de un resultado provisorio.",
      "La resistencia bacteriana es hoy uno de los desafíos de salud pública más urgentes a nivel global. El uso excesivo e inadecuado de antibióticos ha favorecido la selección de cepas resistentes. El laboratorio de microbiología juega un papel clave: informar correctamente los perfiles de sensibilidad, alertar cuando se detectan mecanismos de resistencia emergentes y participar activamente en los programas de vigilancia epidemiológica son acciones que contribuyen a la salud de la comunidad.",
    ],
    vocab: [
      { es: "cultivo", pt: "cultura" }, { es: "antibiograma", pt: "antibiograma" },
      { es: "microorganismo", pt: "micro-organismo" }, { es: "resultado preliminar", pt: "resultado preliminar" },
      { es: "resistencia bacteriana", pt: "resistência bacteriana" }, { es: "tratamiento empírico", pt: "tratamento empírico" },
    ],
    quiz: [
      { question: "¿Cuánto puede tardar un cultivo microbiológico completo?", options: ["Solo minutos", "Entre 24 y 72 horas y el antibiograma puede extenderse más días", "Exactamente 1 hora", "Solo 6 horas en laboratorios acreditados"], answer: "Entre 24 y 72 horas y el antibiograma puede extenderse más días" },
      { question: "¿Por qué se siembra en diferentes medios de cultivo?", options: ["Por razones estéticas", "Porque distintos medios favorecen el crecimiento de diferentes microorganismos", "Para ahorrar reactivos", "Por exigencia normativa únicamente"], answer: "Porque distintos medios favorecen el crecimiento de diferentes microorganismos" },
      { question: "¿Qué información proporciona el antibiograma al médico?", options: ["La cantidad de bacterias presentes", "Qué antibióticos son sensibles, intermedios o resistentes para el microorganismo identificado", "El origen anatómico de la infección", "El tiempo de evolución de la infección"], answer: "Qué antibióticos son sensibles, intermedios o resistentes para el microorganismo identificado" },
      { question: "¿Qué es un tratamiento empírico?", options: ["Un tratamiento basado en experiencia personal sin evidencia", "Un tratamiento basado en probabilidad estadística mientras se espera el cultivo", "Un tratamiento sin medicamentos", "El tratamiento definitivo confirmado por el cultivo"], answer: "Un tratamiento basado en probabilidad estadística mientras se espera el cultivo" },
      { question: "¿Qué información preliminar puede dar el laboratorio antes del cultivo definitivo?", options: ["El antibiograma completo estimado", "Los resultados de la coloración de Gram como orientación inicial", "El nombre exacto del microorganismo probable", "La concentración mínima inhibitoria"], answer: "Los resultados de la coloración de Gram como orientación inicial" },
      { question: "¿Qué debe acompañar siempre a un resultado microbiológico preliminar?", options: ["El tratamiento antibiótico recomendado", "La indicación clara de que es provisorio y el definitivo está en proceso", "La firma del director técnico", "El precio del análisis"], answer: "La indicación clara de que es provisorio y el definitivo está en proceso" },
      { question: "¿Qué caracteriza a una cepa MRSA?", options: ["Es resistente a absolutamente todos los antibióticos", "Es un Staphylococcus aureus resistente a meticilina que cambia el esquema de tratamiento", "Es una bacteria exclusivamente hospitalaria", "Es una bacteria de baja patogenicidad"], answer: "Es un Staphylococcus aureus resistente a meticilina que cambia el esquema de tratamiento" },
      { question: "¿Qué papel tiene el laboratorio frente a la resistencia bacteriana?", options: ["Ninguno, es un problema exclusivo de los médicos", "Informar perfiles de sensibilidad, alertar sobre resistencias emergentes y participar en vigilancia epidemiológica", "Solo procesar los cultivos más rápido", "Reducir el número de cultivos procesados"], answer: "Informar perfiles de sensibilidad, alertar sobre resistencias emergentes y participar en vigilancia epidemiológica" },
    ],
    dictation: "El laboratorio debe comunicar los resultados microbiológicos preliminares con claridad, indicando que son provisorios y que el informe definitivo está en proceso.",
  },
  {
    id: "preanalítica", title: "Fase preanalítica", level: "Básico", category: "Laboratorio", emoji: "🩺",
    description: "El origen de la mayoría de los errores: todo lo que ocurre antes del análisis.",
    readingTitle: "El error que ocurrió antes de llegar al laboratorio",
    reading: [
      "Estudios realizados en diferentes países y tipos de laboratorios coinciden en un dato sorprendente: entre el sesenta y el setenta por ciento de todos los errores en el laboratorio clínico ocurren durante la fase preanalítica, es decir, antes de que la muestra llegue al analizador. Estos errores incluyen desde la identificación incorrecta del paciente en el momento de la solicitud médica, pasando por la extracción en el tubo equivocado o en el orden incorrecto de llenado, hasta el transporte a temperatura inadecuada.",
      "La fase preanalítica comienza en el momento en que el médico decide solicitar un análisis. Incluye la solicitud médica, la preparación del paciente (¿ayunó el tiempo suficiente? ¿tomó algún medicamento que puede interferir?), la extracción de la muestra (¿se usó el tubo correcto, el anticoagulante adecuado, la técnica apropiada?), el transporte y la recepción en el laboratorio.",
      "Uno de los errores preanalíticos más frecuentes es la hemólisis, la ruptura de los glóbulos rojos durante o después de la extracción. La hemólisis libera el contenido intracelular de los eritrocitos al plasma, elevando falsamente marcadores como la potasemia, la LDH y la hemoglobina libre. En muchos casos, la muestra hemolizada debe rechazarse y solicitar una nueva extracción.",
      "El orden de llenado de los tubos es otro aspecto crítico. Si se llena primero un tubo con anticoagulante antes de uno sin anticoagulante, puede producirse contaminación cruzada que afecta los estudios de coagulación. El orden estandarizado internacionalmente establece una secuencia específica según el tipo de tubo y su contenido. Ese orden tiene un fundamento científico que protege la calidad del resultado.",
      "La gestión de la fase preanalítica requiere una visión sistémica que va más allá del laboratorio. Incluye la formación continua del personal de enfermería que realiza las extracciones, el diseño de formularios de solicitud para reducir errores de transcripción, la instalación de sistemas de trazabilidad como el código de barras desde el momento de la extracción, y la comunicación fluida entre el laboratorio y los diferentes servicios del hospital.",
    ],
    vocab: [
      { es: "fase preanalítica", pt: "fase pré-analítica" }, { es: "hemólisis", pt: "hemólise" },
      { es: "anticoagulante", pt: "anticoagulante" }, { es: "centrifugado", pt: "centrifugação" },
      { es: "orden de llenado", pt: "ordem de coleta" }, { es: "solicitud médica", pt: "pedido médico" },
    ],
    quiz: [
      { question: "¿Qué porcentaje de los errores del laboratorio ocurren en la fase preanalítica?", options: ["10 a 20%", "60 a 70%", "Menos del 5%", "Exactamente el 50%"], answer: "60 a 70%" },
      { question: "¿Cuándo comienza realmente la fase preanalítica?", options: ["Cuando la muestra llega al laboratorio", "Cuando el médico decide solicitar el análisis", "Cuando se centrifuga la muestra", "Cuando el analista recibe el tubo"], answer: "Cuando el médico decide solicitar el análisis" },
      { question: "¿Qué es la hemólisis?", options: ["Una infección bacteriana de la muestra", "La ruptura de glóbulos rojos durante o después de la extracción", "Un reactivo analítico vencido", "Una temperatura muy baja durante el transporte"], answer: "La ruptura de glóbulos rojos durante o después de la extracción" },
      { question: "¿Qué marcadores se ven elevados falsamente por hemólisis?", options: ["Glucosa y colesterol", "Potasemia, LDH y hemoglobina libre", "Creatinina y urea exclusivamente", "TGO y bilirrubina directa solamente"], answer: "Potasemia, LDH y hemoglobina libre" },
      { question: "¿Por qué es crítico el orden de llenado de los tubos?", options: ["Solo por razones estéticas", "Para evitar contaminación cruzada entre anticoagulantes que afecta los estudios de coagulación", "Porque lo exige la norma sin razón científica", "Solo es importante en los tubos de coagulación"], answer: "Para evitar contaminación cruzada entre anticoagulantes que afecta los estudios de coagulación" },
      { question: "¿Qué aspectos incluye la fase preanalítica?", options: ["Solo la extracción de sangre", "Solicitud médica, preparación del paciente, extracción, transporte y recepción", "Solo el transporte de las muestras", "Solo la recepción en el laboratorio"], answer: "Solicitud médica, preparación del paciente, extracción, transporte y recepción" },
      { question: "¿Qué herramienta de trazabilidad se menciona para mejorar la fase preanalítica?", options: ["Solo los formularios de papel", "Sistemas de código de barras desde el momento de la extracción", "Solo la supervisión visual del proceso", "Solo la capacitación periódica"], answer: "Sistemas de código de barras desde el momento de la extracción" },
      { question: "¿Qué implica gestionar bien la fase preanalítica?", options: ["Contratar más analistas", "Reducir el mayor porcentaje de errores mediante trabajo colaborativo y trazabilidad", "Comprar equipos más costosos", "Aumentar la velocidad de procesamiento"], answer: "Reducir el mayor porcentaje de errores mediante trabajo colaborativo y trazabilidad" },
    ],
    dictation: "Entre el sesenta y el setenta por ciento de los errores del laboratorio ocurren en la fase preanalítica, antes de que la muestra llegue al analizador.",
  },
  {
    id: "muestras", title: "Manejo de muestras", level: "Básico", category: "Laboratorio", emoji: "🧪",
    description: "Recepción, identificación, conservación y rechazo de muestras.",
    readingTitle: "La muestra que llegó sin identificar",
    reading: [
      "Un martes a las siete de la mañana, el área de recepción del laboratorio recibió un lote de muestras provenientes de un hospital con el que acababan de firmar un nuevo convenio. La mayoría llegó correctamente identificada con etiqueta de código de barras y remito completo. Sin embargo, tres tubos venían completamente sin etiqueta y otros dos tenían información incompleta. La analista de recepción tuvo que actuar rápidamente porque había un médico esperando algunos de esos resultados para decidir un tratamiento.",
      "Según el protocolo de recepción vigente, una muestra sin identificación completa no puede procesarse bajo ninguna circunstancia. La razón es simple pero fundamental: si un resultado se asigna a un paciente equivocado, las consecuencias pueden ser gravísimas, desde un diagnóstico erróneo hasta un tratamiento inadecuado. Los tres tubos sin etiqueta fueron colocados en cuarentena y se notificó al hospital de inmediato.",
      "Para los tubos con información incompleta, el analista llamó directamente al hospital para obtener los datos faltantes. En uno de los casos, el número de historia clínica pudo confirmarse en menos de diez minutos. En el otro, la fecha y hora de extracción eran relevantes para interpretar correctamente el resultado de un análisis de coagulación, por lo que la muestra fue retenida hasta que la información llegó por correo formal.",
      "El episodio fue también una oportunidad para revisar el protocolo de rechazo de muestras. Se detectó que el formulario de rechazo no incluía un campo para registrar si el cliente había sido notificado telefónicamente o solo por correo. Se actualizó el formulario y se agregó un campo de observaciones. También se revisaron los criterios de aceptación para otros parámetros: temperatura de transporte, tipo de anticoagulante y tiempo máximo desde la extracción.",
      "El laboratorio organizó una reunión técnica con el equipo de enfermería del hospital para revisar en conjunto el proceso de extracción, identificación y empaque de las muestras. Se creó un instructivo visual específico para el servicio, con imágenes del etiquetado correcto, ejemplos de errores frecuentes y un número de contacto directo. Ese tipo de trabajo colaborativo entre instituciones mejora la calidad desde su origen.",
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
      { question: "¿Cuáles son los criterios de aceptación de una muestra?", options: ["Solo la identificación del paciente", "Identificación, volumen mínimo, tipo de tubo, temperatura y tiempo desde extracción", "Solo el tipo de tubo y el volumen", "Solo la temperatura de transporte"], answer: "Identificación, volumen mínimo, tipo de tubo, temperatura y tiempo desde extracción" },
      { question: "¿Qué se agregó al formulario de rechazo actualizado?", options: ["Se simplificó eliminando campos", "Campo para registrar si el cliente fue notificado y un campo de observaciones", "Se cambió a formato solo digital", "Se agregó la firma del director técnico"], answer: "Campo para registrar si el cliente fue notificado y un campo de observaciones" },
      { question: "¿Qué se creó para el hospital como mejora preventiva?", options: ["Un contrato de penalidades por errores", "Un instructivo visual con imágenes del etiquetado correcto y número de contacto", "Un sistema de penalidades económicas", "Un formulario adicional de solicitud"], answer: "Un instructivo visual con imágenes del etiquetado correcto y número de contacto" },
    ],
    dictation: "Cuando una muestra no cumple los criterios de recepción, el analista debe comunicarlo de forma profesional y documentar el motivo del rechazo.",
  },
  {
    id: "coagulacion", title: "Coagulación y hemostasia", level: "Avanzado", category: "Laboratorio", emoji: "🩹",
    description: "Estudios de coagulación, hemostasia primaria y secundaria en el laboratorio.",
    readingTitle: "Cuando la sangre no se detiene",
    reading: [
      "La hemostasia es el conjunto de mecanismos que el organismo activa para detener un sangrado cuando se produce una lesión vascular. Este proceso se divide en dos grandes fases: la hemostasia primaria, que involucra a las plaquetas y forma un tapón provisional en el sitio de la lesión, y la hemostasia secundaria o coagulación, que consolida ese tapón mediante una red de fibrina formada a través de una cascada enzimática compleja.",
      "El laboratorio de coagulación evalúa este sistema mediante pruebas específicas. El tiempo de protrombina (TP) y su expresión estandarizada como INR evalúan la vía extrínseca de la coagulación, utilizada principalmente para monitorear el tratamiento con anticoagulantes orales como warfarina. El KPTT o tiempo de tromboplastina parcial activado evalúa la vía intrínseca, y es fundamental para monitorear el tratamiento con heparina.",
      "Una de las particularidades del laboratorio de coagulación es que los resultados son especialmente sensibles a los factores preanalíticos. La proporción correcta entre la sangre y el anticoagulante citrato presente en el tubo azul es crítica: si el tubo no está completamente llenado hasta la marca indicada, la relación sangre-citrato se altera y el resultado puede ser falsamente prolongado. Asimismo, una muestra hemolizada o con coágulos puede generar resultados completamente erróneos.",
      "El dímero D es otro marcador que el laboratorio de coagulación determina con frecuencia. Este producto de degradación de la fibrina se eleva cuando hay formación y lisis de coágulos en el organismo, y se utiliza principalmente para descartar tromboembolismo venoso. Sin embargo, el dímero D tiene alta sensibilidad pero baja especificidad: se eleva en muchas situaciones como inflamación, embarazo o postoperatorio.",
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
  // ══ GESTIÓN ══
  {
    id: "indicadores", title: "Indicadores de calidad", level: "Intermedio", category: "Gestión", emoji: "📈",
    description: "Interpretar, discutir y gestionar indicadores, metas y desvíos operativos.",
    readingTitle: "Cuando el indicador no cuenta toda la historia",
    reading: [
      "En la reunión mensual de revisión de indicadores, el equipo presentó el informe de desempeño del período. A primera vista, los números parecían buenos: el tiempo medio de respuesta se mantenía dentro del objetivo, el porcentaje de muestras rechazadas había disminuido respecto al mes anterior, y el índice de satisfacción de clientes había subido dos puntos. Sin embargo, cuando la coordinadora comenzó a hacer preguntas más específicas, la imagen empezó a complicarse.",
      "Una analista señaló que el tiempo medio de respuesta como número global era engañoso. Si bien el promedio estaba dentro del objetivo, existían dos o tres casos por semana en los que muestras urgentes de pacientes internados llegaban con retrasos superiores a cuatro horas. Esos casos no movían el promedio porque representaban un porcentaje pequeño del total, pero tenían un impacto clínico desproporcionado.",
      "La coordinación propuso desagregar los indicadores de tiempo de respuesta en al menos tres categorías distintas: muestras de rutina, muestras urgentes de ambulatorio y muestras urgentes de internación. Ese nivel de desagregación permitiría monitorear de forma independiente los segmentos de mayor impacto clínico. También propusieron analizar los tiempos por franja horaria.",
      "Los indicadores de calidad son herramientas de gestión, no fines en sí mismos. Su valor radica en la capacidad de orientar decisiones y detectar problemas antes de que se conviertan en crisis. Un indicador que siempre está verde puede ser una buena noticia o puede ser señal de que se está midiendo lo incorrecto. Por eso, la selección de qué indicadores usar y cómo interpretarlos es una decisión estratégica.",
      "La reunión terminó con un acuerdo concreto: durante los próximos dos meses, el equipo implementaría los indicadores desagregados propuestos, definiría metas específicas para cada categoría y presentaría un análisis de causa para los casos que superaran el límite establecido. Se asignaron responsables para cada indicador y se fijó una fecha de revisión. Esa estructura de seguimiento es lo que transforma un indicador en una herramienta real de mejora continua.",
    ],
    vocab: [
      { es: "indicador", pt: "indicador" }, { es: "desagregar datos", pt: "desagregar dados" },
      { es: "no conformidad", pt: "não conformidade" }, { es: "promedio / media", pt: "média" },
      { es: "meta / objetivo", pt: "meta / objetivo" }, { es: "mejora continua", pt: "melhoria contínua" },
    ],
    quiz: [
      { question: "¿Por qué era engañoso el tiempo medio de respuesta como indicador global?", options: ["Porque era demasiado alto", "Porque ocultaba retrasos graves en muestras urgentes de pacientes críticos", "Porque no se medía correctamente", "Porque no era el indicador adecuado"], answer: "Porque ocultaba retrasos graves en muestras urgentes de pacientes críticos" },
      { question: "¿Cuántos casos de retraso grave se detectaban por semana?", options: ["Más de veinte", "Dos o tres casos con retrasos mayores a cuatro horas", "Ninguno según el indicador global", "Solo uno al mes"], answer: "Dos o tres casos con retrasos mayores a cuatro horas" },
      { question: "¿En qué categorías propuso desagregar el indicador la coordinación?", options: ["Por analista responsable y por turno", "Muestras de rutina, urgentes de ambulatorio y urgentes de internación", "Solo por tipo de análisis solicitado", "Por cliente y por mes"], answer: "Muestras de rutina, urgentes de ambulatorio y urgentes de internación" },
      { question: "¿Por qué un indicador siempre en verde puede ser problemático?", options: ["Nunca es problemático si está en verde", "Puede indicar que se mide lo incorrecto o que el umbral está mal definido", "Indica que el laboratorio funciona perfectamente", "Solo es problema si el cliente se queja"], answer: "Puede indicar que se mide lo incorrecto o que el umbral está mal definido" },
      { question: "¿Cuál es el verdadero valor de un indicador de calidad?", options: ["Estar siempre dentro del rango aceptable", "Orientar decisiones concretas y detectar problemas antes de que sean crisis", "Cumplir formalmente con los requisitos de la norma", "Mostrar resultados positivos al directorio"], answer: "Orientar decisiones concretas y detectar problemas antes de que sean crisis" },
      { question: "¿Quiénes deben participar en la selección y definición de indicadores?", options: ["Solo el área de calidad", "Los profesionales que conocen el proceso desde adentro", "Solo la dirección del laboratorio", "Solo los auditores externos"], answer: "Los profesionales que conocen el proceso desde adentro" },
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
      "El área de calidad registró una nueva no conformidad relacionada con un error en el etiquetado de muestras durante el proceso de recepción. Un tubo de sangre había sido asignado al número de solicitud equivocado, lo que podría haber resultado en un informe enviado al paciente incorrecto si el error no se hubiera detectado durante la revisión previa a la liberación. Al revisar el historial, el equipo encontró un incidente casi idéntico registrado seis meses antes, cerrado con una nota de 'informado al personal' pero sin ninguna acción correctiva formal.",
      "La situación planteaba una pregunta necesaria: ¿por qué el mismo error había ocurrido dos veces en el mismo proceso? La respuesta estaba en el tipo de cierre que se le había dado al primer incidente. Informar verbalmente al personal sobre un error puede generar conciencia momentánea, pero sin un cambio en el proceso, el sistema sigue siendo igualmente vulnerable al mismo tipo de fallo.",
      "Esta vez, el equipo decidió aplicar un análisis formal de causa raíz usando la técnica de los '5 Por qué'. El primer por qué: ¿por qué se asignó mal el tubo? Porque el operador confundió dos solicitudes que llegaron al mismo tiempo. El segundo por qué: ¿por qué llegaron dos solicitudes al mismo tiempo sin separación? Porque no había un procedimiento explícito para la recepción de múltiples solicitudes simultáneas. El tercer por qué: ¿por qué no existía ese procedimiento? Porque el proceso había crecido con los años y el flujo real ya no correspondía al procedimiento escrito.",
      "Con la causa raíz identificada, el equipo diseñó una CAPA que abordaba el problema de forma sistémica. La acción correctiva incluyó la actualización del procedimiento de recepción para incluir un paso explícito de separación física y visual de las solicitudes antes de comenzar el proceso de etiquetado. También se agregó un control de doble verificación: el operador que etiqueta un tubo debe confirmarlo con otro analista antes de que la muestra avance al siguiente paso.",
      "A los treinta días de implementadas las acciones, se realizó la verificación de eficacia. Se revisaron los registros de recepción del período y no se detectaron incidentes de etiquetado incorrecto. El indicador de no conformidades relacionadas con el proceso de recepción mostró una reducción del ochenta por ciento. La no conformidad fue cerrada formalmente con toda la documentación. El caso fue incluido como ejemplo en el programa de inducción de nuevos analistas.",
    ],
    vocab: [
      { es: "no conformidad", pt: "não conformidade" }, { es: "acción correctiva", pt: "ação corretiva" },
      { es: "acción preventiva", pt: "ação preventiva" }, { es: "causa raíz", pt: "causa raiz" },
      { es: "verificación de eficacia", pt: "verificação de eficácia" }, { es: "CAPA", pt: "CAPA" },
    ],
    quiz: [
      { question: "¿Qué tipo de error generó la no conformidad?", options: ["Un resultado incorrecto que fue liberado", "Un tubo asignado al número de solicitud equivocado durante la recepción", "Una muestra perdida durante el proceso", "Un informe enviado con retraso"], answer: "Un tubo asignado al número de solicitud equivocado durante la recepción" },
      { question: "¿Cuándo había ocurrido un incidente similar anteriormente?", options: ["Nunca había ocurrido antes", "Seis meses antes, cerrado sin acción correctiva real", "Un año antes con acción correctiva documentada", "La semana anterior"], answer: "Seis meses antes, cerrado sin acción correctiva real" },
      { question: "¿Por qué informar verbalmente no es suficiente como acción correctiva?", options: ["Porque el personal no escucha", "Sin un cambio en el proceso el sistema sigue siendo igualmente vulnerable", "Porque no queda documentado", "Porque no involucra a la dirección"], answer: "Sin un cambio en el proceso el sistema sigue siendo igualmente vulnerable" },
      { question: "¿Qué técnica de análisis de causa raíz usó el equipo?", options: ["Diagrama de Ishikawa", "Los 5 Por qué", "Análisis de modo de falla", "Diagrama de Pareto"], answer: "Los 5 Por qué" },
      { question: "¿Cuál fue la causa raíz identificada?", options: ["Un error puntual del operador", "El procedimiento escrito estaba desactualizado y no reflejaba el flujo real", "El sistema informático tenía un error", "La capacitación inicial había sido insuficiente"], answer: "El procedimiento escrito estaba desactualizado y no reflejaba el flujo real" },
      { question: "¿Qué acción correctiva se implementó en el proceso de recepción?", options: ["Contratar más personal", "Separación física de solicitudes y control de doble verificación antes de avanzar", "Cambiar completamente el sistema informático", "Reducir las solicitudes simultáneas aceptadas"], answer: "Separación física de solicitudes y control de doble verificación antes de avanzar" },
      { question: "¿Qué resultado mostró la verificación de eficacia a los 30 días?", options: ["No hubo mejora significativa", "Reducción del 80% en no conformidades relacionadas con el proceso de recepción", "El indicador empeoró con las nuevas medidas", "Los resultados no fueron concluyentes"], answer: "Reducción del 80% en no conformidades relacionadas con el proceso de recepción" },
      { question: "¿Qué uso final se dio al caso dentro del laboratorio?", options: ["Se archivó y nunca se volvió a mencionar", "Se incluyó como ejemplo positivo en el programa de inducción de nuevos analistas", "Se reportó como sanción disciplinaria", "Se usó para justificar una inversión en tecnología"], answer: "Se incluyó como ejemplo positivo en el programa de inducción de nuevos analistas" },
    ],
    dictation: "Una acción correctiva real debe identificar la causa raíz, cambiar el proceso y verificar la eficacia de las acciones implementadas.",
  },
  {
    id: "auditorias", title: "Auditorías internas", level: "Avanzado", category: "Gestión", emoji: "🔍",
    description: "Planificación, ejecución y seguimiento de auditorías del sistema de calidad.",
    readingTitle: "El día de la auditoría",
    reading: [
      "Una auditoría interna bien concebida no debería ser una instancia que el personal teme o percibe como una amenaza. Su propósito no es encontrar culpables ni demostrar que algo está mal: es verificar de forma objetiva y sistemática que los procesos se ejecutan de acuerdo con lo documentado, identificar brechas entre lo que el sistema dice que se hace y lo que realmente ocurre, y generar oportunidades concretas de mejora.",
      "La planificación de la auditoría es tan importante como su ejecución. El auditor, que debe ser una persona diferente de la que trabaja habitualmente en el proceso auditado, prepara un plan de auditoría que incluye los objetivos específicos, el alcance, los criterios de auditoría, el programa de actividades y la lista de verificación de los puntos que se van a evaluar. Esa preparación evita que la auditoría se convierta en una revisión superficial.",
      "Durante la ejecución, el auditor combina tres tipos de actividades: revisión de registros (verificar que la documentación esté completa, actualizada y accesible), observación directa de los procesos en tiempo real, y entrevistas con el personal. Cada hallazgo debe registrarse con evidencia objetiva: una cita del registro revisado, una foto del proceso observado o la transcripción de la respuesta del entrevistado.",
      "Los hallazgos se clasifican según su impacto en el sistema de calidad. Una no conformidad mayor es una falla sistémica que compromete seriamente la calidad del resultado o incumple un requisito crítico de la norma. Una no conformidad menor es una falla puntual que no compromete el resultado general pero debe corregirse. Una observación es un aspecto donde el sistema funciona correctamente pero podría hacerlo mejor.",
      "El valor real de una auditoría se mide en el seguimiento que se hace de sus hallazgos. Si los planes de acción se presentan pero nunca se verifica su implementación efectiva, la auditoría pierde su razón de ser. El programa de auditorías debe incluir auditorías de seguimiento, en las que se verifica que las acciones comprometidas se han implementado y han producido la mejora esperada.",
    ],
    vocab: [
      { es: "auditoría", pt: "auditoria" }, { es: "hallazgo", pt: "achado / constatação" },
      { es: "evidencia objetiva", pt: "evidência objetiva" }, { es: "mejora continua", pt: "melhoria contínua" },
      { es: "plan de acción", pt: "plano de ação" }, { es: "no conformidad mayor", pt: "não conformidade maior" },
    ],
    quiz: [
      { question: "¿Cuál es el verdadero propósito de una auditoría interna?", options: ["Encontrar culpables y aplicar sanciones", "Verificar que los procesos se ejecutan como documentado e identificar oportunidades de mejora", "Demostrar que el laboratorio cumple todas las normas", "Reducir los costos operativos"], answer: "Verificar que los procesos se ejecutan como documentado e identificar oportunidades de mejora" },
      { question: "¿Quién debe realizar la auditoría de un proceso?", options: ["El mismo responsable habitual del proceso", "Una persona diferente de quien trabaja habitualmente en ese proceso", "El director técnico exclusivamente", "Un auditor externo en todos los casos"], answer: "Una persona diferente de quien trabaja habitualmente en ese proceso" },
      { question: "¿Qué incluye un plan de auditoría bien elaborado?", options: ["Solo la fecha y el nombre del auditor", "Objetivos, alcance, criterios, programa de actividades y lista de verificación", "Solo los hallazgos que se espera encontrar", "Solo los procesos que se sospecha que tienen problemas"], answer: "Objetivos, alcance, criterios, programa de actividades y lista de verificación" },
      { question: "¿Cuáles son las tres actividades del auditor durante la ejecución?", options: ["Encuestas, mediciones y cálculos estadísticos", "Revisión de registros, observación directa y entrevistas al personal", "Solo revisión exhaustiva de documentos", "Mediciones de equipos, entrevistas y verificación de stocks"], answer: "Revisión de registros, observación directa y entrevistas al personal" },
      { question: "¿Qué es una no conformidad mayor?", options: ["Un problema pequeño que debe monitorearse", "Una falla sistémica que compromete seriamente la calidad o incumple un requisito crítico", "Una oportunidad de mejora sin urgencia real", "Un hallazgo que ya fue corregido antes de la auditoría"], answer: "Una falla sistémica que compromete seriamente la calidad o incumple un requisito crítico" },
      { question: "¿Qué diferencia a una observación de una no conformidad?", options: ["La observación no requiere documentación", "La observación es donde el sistema funciona pero podría mejorar; la no conformidad es un incumplimiento", "Solo la puede hacer el auditor externo", "No hay diferencia real entre ambas"], answer: "La observación es donde el sistema funciona pero podría mejorar; la no conformidad es un incumplimiento" },
      { question: "¿Dónde se mide el valor real de una auditoría interna?", options: ["En el número total de hallazgos identificados", "En el seguimiento y verificación de que los planes de acción se implementaron efectivamente", "En la duración total de la auditoría", "En la satisfacción del equipo auditado"], answer: "En el seguimiento y verificación de que los planes de acción se implementaron efectivamente" },
      { question: "¿Qué completa el ciclo de mejora continua en el contexto de auditorías?", options: ["Publicar los resultados en el informe anual", "Planificación, ejecución, plan de acción y verificación de su implementación efectiva", "Contratar más auditores", "Comprar software especializado de gestión de calidad"], answer: "Planificación, ejecución, plan de acción y verificación de su implementación efectiva" },
    ],
    dictation: "El valor de una auditoría se mide en el seguimiento que se hace de sus hallazgos y en la implementación efectiva de los planes de acción.",
  },
  // ══ COMUNICACIÓN ══
  {
    id: "atencion-cliente", title: "Atención técnica al cliente", level: "Intermedio", category: "Comunicación", emoji: "📞",
    description: "Español profesional para explicar resultados y gestionar consultas técnicas.",
    readingTitle: "Una llamada que exigía claridad",
    reading: [
      "A media mañana, una analista del área de atención al cliente recibió una llamada de un médico clínico que atendía pacientes en una clínica privada. El médico estaba confundido porque el informe de laboratorio de uno de sus pacientes mostraba un valor de creatinina que parecía diferente al del mes anterior, a pesar de que el paciente no había tenido ningún cambio clínico significativo. El médico quería saber si había habido un error en el laboratorio.",
      "La analista escuchó el planteo completo sin interrumpir. Luego pidió al médico que le confirmara el número de solicitud y el nombre del paciente para poder acceder al historial. Mientras revisaba los datos en el sistema, fue explicando en voz alta lo que estaba haciendo, para que el médico supiera que su consulta estaba siendo atendida. Esa práctica simple transmite profesionalismo y genera confianza incluso antes de dar la respuesta.",
      "Al revisar el historial, la analista encontró la explicación: el laboratorio había implementado un nuevo método para la determinación de creatinina el mes anterior, con una calibración trazable a un estándar de referencia diferente. El nuevo método era más exacto, pero generaba valores sistemáticamente un poco más altos que el método anterior, lo cual era esperado y estaba documentado. El médico no había recibido ninguna comunicación sobre ese cambio.",
      "La analista explicó la situación con claridad, usando un lenguaje técnico pero accesible: describió el cambio de método, la razón del cambio, el tipo de diferencia que podía esperarse en los valores y el impacto clínico real, que era mínimo. También se disculpó por no haber comunicado el cambio proactivamente y ofreció enviar una carta técnica con la información completa por correo ese mismo día.",
      "La llamada terminó con el médico agradecido. La situación generó una acción de mejora interna: el laboratorio estableció un procedimiento formal para comunicar a los médicos de referencia cualquier cambio de método que pudiera afectar la interpretación de los resultados, con un tiempo mínimo de anticipación de quince días. En atención técnica, no alcanza con tener razón: también es necesario anticiparse a las dudas y comunicar proactivamente.",
    ],
    vocab: [
      { es: "duda / consulta", pt: "dúvida / consulta" }, { es: "informe", pt: "relatório" },
      { es: "validado", pt: "validado" }, { es: "trazabilidad metrológica", pt: "rastreabilidade metrológica" },
      { es: "transmitir confianza", pt: "transmitir confiança" }, { es: "comunicación proactiva", pt: "comunicação proativa" },
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
    id: "correo-tecnico", title: "Correo técnico profesional", level: "Básico", category: "Comunicación", emoji: "✉️",
    description: "Estructura y redacción de correos técnicos claros y profesionales en español.",
    readingTitle: "Un correo que generó confusión",
    reading: [
      "El área de soporte técnico del laboratorio enviaba regularmente comunicaciones por correo electrónico a sus clientes. Un martes, el coordinador del área recibió una respuesta inusualmente negativa de un cliente importante luego de enviar un correo informando un cambio en el horario de retiro de muestras. El cliente respondió diciendo que el correo era 'confuso e incomprensible' y que había tenido que llamar por teléfono para entender de qué se trataba.",
      "Al releer el correo enviado, el equipo notó varios problemas. Comenzaba directamente con los detalles técnicos sin ningún saludo ni contexto previo. El asunto del correo decía simplemente 'Actualización', sin indicar de qué se trataba. Las oraciones eran largas y estaban cargadas de términos técnicos sin explicación. No había ninguna indicación de qué debía hacer el cliente con esa información ni a quién contactar si tenía dudas.",
      "La estructura de un correo técnico profesional efectivo tiene elementos bien definidos. El asunto debe ser específico y descriptivo, anticipando el contenido del mensaje. El saludo debe ser cordial y mencionar el nombre del destinatario cuando sea posible. El párrafo inicial debe contextualizar brevemente el motivo del correo. El cuerpo debe presentar la información de forma organizada, en oraciones cortas y lenguaje accesible.",
      "El equipo reescribió el correo aplicando esa estructura. El nuevo asunto decía: 'Cambio en horario de retiro de muestras: a partir del lunes 15'. El correo comenzaba con un saludo personalizado, seguía con una frase de contexto, presentaba la información concreta en tres líneas claras, indicaba a quién contactar para coordinar y cerraba con una firma completa con nombre, cargo y número de teléfono.",
      "El cliente respondió al nuevo correo agradeciéndolo y diciendo que ahora entendía perfectamente la situación. La experiencia fue aprovechada por el área para revisar todos los templates de comunicación existentes y actualizarlos. También se organizó un taller interno sobre redacción de comunicaciones técnicas para todo el personal. La forma en que se comunica la información técnica refleja el nivel de profesionalismo del laboratorio.",
    ],
    vocab: [
      { es: "redacción", pt: "redação" }, { es: "asunto del correo", pt: "assunto do e-mail" },
      { es: "cierre cordial", pt: "encerramento cordial" }, { es: "próximos pasos", pt: "próximos passos" },
      { es: "destinatario", pt: "destinatário" }, { es: "firma", pt: "assinatura" },
    ],
    quiz: [
      { question: "¿Cuál fue el problema principal del primer correo enviado?", options: ["Tenía errores técnicos en la información", "Le faltaba estructura, contexto, claridad y datos de contacto", "Fue enviado al destinatario equivocado", "Era demasiado extenso"], answer: "Le faltaba estructura, contexto, claridad y datos de contacto" },
      { question: "¿Qué decía el asunto del correo problemático?", options: ["No tenía asunto definido", "Solo 'Actualización', sin indicar de qué se trataba", "Un asunto muy largo y confuso", "Solo una fecha sin descripción"], answer: "Solo 'Actualización', sin indicar de qué se trataba" },
      { question: "¿Cómo debe redactarse el asunto de un correo técnico efectivo?", options: ["Con solo una palabra clave", "De forma específica y descriptiva, anticipando el contenido para el receptor", "Con la fecha y el número de referencia interno", "Con el nombre completo del remitente"], answer: "De forma específica y descriptiva, anticipando el contenido para el receptor" },
      { question: "¿Qué elementos debe tener un correo técnico profesional?", options: ["Solo la información técnica relevante", "Asunto claro, saludo, contexto inicial, información organizada, próximos pasos y firma", "Solo saludo y despedida formal", "Asunto, información técnica y fecha únicamente"], answer: "Asunto claro, saludo, contexto inicial, información organizada, próximos pasos y firma" },
      { question: "¿Cómo respondió el cliente al correo reescrito?", options: ["Negativamente, pidiendo más detalles", "Agradeciéndolo y confirmando que ahora entendía perfectamente", "Sin responder al correo", "Con otra queja"], answer: "Agradeciéndolo y confirmando que ahora entendía perfectamente" },
      { question: "¿Qué se revisó en el laboratorio después de esta experiencia?", options: ["Solo el correo específico que causó el problema", "Todos los templates de comunicación existentes, actualizándolos", "Solo los correos del área técnica", "Nada, fue considerado un caso aislado"], answer: "Todos los templates de comunicación existentes, actualizándolos" },
      { question: "¿Qué actividad de formación se organizó para el personal?", options: ["Un curso de informática básica", "Un taller sobre redacción de comunicaciones técnicas para todo el personal", "Una capacitación sobre el nuevo horario de atención", "Una reunión informativa de 15 minutos"], answer: "Un taller sobre redacción de comunicaciones técnicas para todo el personal" },
      { question: "¿Por qué la forma de comunicar información técnica no es un detalle menor?", options: ["Porque es obligatorio por la norma de calidad", "Porque refleja el profesionalismo del laboratorio y afecta la percepción de calidad del servicio", "Solo porque los clientes lo exigen en el contrato", "Porque mejora la velocidad de respuesta"], answer: "Porque refleja el profesionalismo del laboratorio y afecta la percepción de calidad del servicio" },
    ],
    dictation: "Un correo técnico profesional necesita un asunto claro, contexto inicial, información organizada, próximos pasos y una firma completa.",
  },
  {
    id: "reuniones", title: "Reuniones efectivas", level: "Básico", category: "Comunicación", emoji: "🗣️",
    description: "Vocabulario y estrategias para participar activamente en reuniones en español.",
    readingTitle: "La reunión que no terminaba",
    reading: [
      "El equipo del laboratorio tenía una reunión semanal de coordinación que, en teoría, duraba una hora. En la práctica, rara vez terminaba antes de las dos horas y, generalmente concluía sin que quedara claro qué habían decidido exactamente, quién era responsable de cada acción y para cuándo. Al día siguiente, era frecuente que dos personas tuvieran recuerdos diferentes sobre lo que se había acordado.",
      "Una consultora externa que visitó el laboratorio identificó tres problemas principales. Primero: no había una agenda previamente distribuida, por lo que los participantes llegaban sin saber qué temas se tratarían ni cuánto tiempo se destinaría a cada uno. Segundo: no había un moderador claro, lo que permitía que cualquier participante introdujera temas nuevos en cualquier momento. Tercero: no existía ningún mecanismo para registrar las decisiones tomadas ni para hacer seguimiento de los compromisos asumidos.",
      "Con esas observaciones como punto de partida, el coordinador implementó tres cambios simples pero poderosos. Una semana antes de cada reunión, enviaba por correo la agenda con los temas a tratar, el objetivo de la reunión y el tiempo asignado a cada punto. Durante la reunión, asumía el rol de moderador activo: presentaba cada tema, facilitaba la discusión, controlaba los tiempos y cerraba cada punto con una síntesis explícita.",
      "La participación activa en reuniones también requiere habilidades lingüísticas específicas. Pedir la palabra de forma respetuosa ('¿Puedo agregar algo?', 'Si me permiten, quisiera comentar algo al respecto'), expresar acuerdo ('Estoy de acuerdo con lo que planteó'), manifestar desacuerdo de forma constructiva ('Entiendo el punto, pero me preocupa que...') son competencias comunicativas que marcan la diferencia entre una reunión productiva y una donde se habla mucho pero se decide poco.",
      "A los dos meses de implementados los cambios, el equipo evaluó la nueva dinámica. Las reuniones pasaron a durar en promedio cincuenta minutos. El porcentaje de compromisos cumplidos en el plazo acordado aumentó significativamente. Y lo más importante: los participantes reportaron sentirse más involucrados y más satisfechos con los resultados. Una reunión efectiva no es la que termina antes: es la que logra sus objetivos, respeta el tiempo y genera compromisos concretos que se cumplen.",
    ],
    vocab: [
      { es: "agenda / orden del día", pt: "pauta / agenda" }, { es: "moderador", pt: "moderador" },
      { es: "acta de reunión", pt: "ata de reunião" }, { es: "pedir la palabra", pt: "pedir a palavra" },
      { es: "compromiso", pt: "compromisso" }, { es: "plazo", pt: "prazo" },
    ],
    quiz: [
      { question: "¿Cuáles eran los tres problemas principales de las reuniones?", options: ["Duración, temperatura y ruido", "Sin agenda previa, sin moderador claro y sin registro formal de decisiones", "Demasiados participantes, pocos temas y poco tiempo", "Horario inconveniente, sala pequeña y muchas interrupciones"], answer: "Sin agenda previa, sin moderador claro y sin registro formal de decisiones" },
      { question: "¿Cuándo debe enviarse la agenda de la reunión?", options: ["El mismo día de la reunión", "Una semana antes con temas, objetivo y tiempo asignado a cada punto", "Solo si los participantes la solicitan", "Al finalizar la reunión anterior"], answer: "Una semana antes con temas, objetivo y tiempo asignado a cada punto" },
      { question: "¿Cuál es el rol del moderador activo durante la reunión?", options: ["Solo tomar nota de lo que se dice", "Presentar temas, facilitar discusión, controlar tiempos y cerrar cada punto con síntesis explícita", "Hablar la mayor parte del tiempo", "Solo controlar el tiempo de cada participante"], answer: "Presentar temas, facilitar discusión, controlar tiempos y cerrar cada punto con síntesis explícita" },
      { question: "¿En cuánto tiempo debe enviarse el acta de reunión?", options: ["En la semana siguiente", "En menos de veinticuatro horas", "Solo si alguien lo solicita", "Al final del mes"], answer: "En menos de veinticuatro horas" },
      { question: "¿Cómo se expresa desacuerdo de forma constructiva en una reunión?", options: ["Interrumpiendo al orador", "Con frases como 'Entiendo el punto, pero me preocupa que...'", "Saliendo de la reunión como señal de protesta", "Enviando un correo después"], answer: "Con frases como 'Entiendo el punto, pero me preocupa que...'" },
      { question: "¿Cómo se pide la palabra de forma respetuosa en español?", options: ["Levantando la voz", "Con frases como '¿Puedo agregar algo?' o 'Si me permiten, quisiera comentar algo'", "Interrumpiendo cuando hay una breve pausa", "Enviando un mensaje por el chat"], answer: "Con frases como '¿Puedo agregar algo?' o 'Si me permiten, quisiera comentar algo'" },
      { question: "¿Qué resultado cuantitativo se obtuvo después de implementar los cambios?", options: ["Las reuniones duraron igual pero fueron más intensas", "Las reuniones bajaron a 50 minutos promedio y los compromisos cumplidos aumentaron significativamente", "Las reuniones se hicieron más largas pero más productivas", "No hubo cambios significativos"], answer: "Las reuniones bajaron a 50 minutos promedio y los compromisos cumplidos aumentaron significativamente" },
      { question: "¿Qué define una reunión verdaderamente efectiva?", options: ["Que termina antes del tiempo asignado", "Que logra sus objetivos, respeta el tiempo y genera compromisos concretos que se cumplen", "Que todos los participantes hablan por igual tiempo", "Que el moderador habla la mayor parte del tiempo"], answer: "Que logra sus objetivos, respeta el tiempo y genera compromisos concretos que se cumplen" },
    ],
    dictation: "Una reunión efectiva necesita agenda previa, un moderador activo y un acta con compromisos, responsables y fechas límite.",
  },
  // ══ TECNOLOGÍA ══
  {
    id: "helpdesk", title: "Soporte técnico (Helpdesk)", level: "Básico", category: "Tecnología", emoji: "💻",
    description: "Vocabulario y comunicación efectiva para el soporte técnico interno.",
    readingTitle: "El sistema que no abría",
    reading: [
      "Un lunes por la mañana, cuando el laboratorio estaba en plena actividad de inicio de turno, comenzaron a llegar reportes de varios analistas diciendo que el sistema de gestión no respondía. Los equipos analíticos funcionaban normalmente y las muestras seguían llegando, pero nadie podía acceder al sistema para registrar recepciones, asignar análisis ni verificar el estado de los pedidos. En cuestión de minutos, el área de TI recibió más de diez tickets simultáneos.",
      "El primer paso del equipo de TI fue clasificar el incidente antes de actuar. ¿Era un problema que afectaba a todos los usuarios o solo a algunos? ¿Era un problema de acceso al sistema o el sistema en sí no estaba funcionando? Esa clasificación inicial es fundamental porque determina dónde buscar la causa: un problema que afecta a todos los usuarios apunta hacia el servidor o la red, mientras que un problema selectivo puede indicar un conflicto en la configuración de un equipo específico.",
      "Después de verificar que el problema era generalizado y que el servidor principal seguía en línea pero no respondía a las solicitudes de conexión, el técnico revisó los registros del servidor y encontró que una actualización automática de seguridad programada para las tres de la madrugada había generado un conflicto con un módulo crítico del sistema de gestión. La actualización había modificado una librería compartida. El problema fue identificado y resuelto en menos de noventa minutos.",
      "Mientras el técnico trabajaba en la resolución, otro miembro del equipo de TI se encargó de la comunicación con los usuarios. Envió un mensaje por el canal interno informando que se había identificado el problema, que estaba siendo trabajado activamente y que estimaban una resolución en aproximadamente una hora. Esa comunicación, aunque no resolvía el problema técnico, redujo significativamente la ansiedad del personal y evitó decenas de llamadas que hubieran distraído al técnico.",
      "La experiencia generó dos mejoras inmediatas en el procedimiento del área de TI. La primera fue establecer una ventana de mantenimiento definida para las actualizaciones automáticas, con un ambiente de prueba donde validar la compatibilidad de cada actualización antes de aplicarla en producción. La segunda fue crear un protocolo de comunicación de incidentes que establecía los mensajes mínimos que debían enviarse a los usuarios en los primeros quince minutos, a los treinta minutos y al momento de la resolución.",
    ],
    vocab: [
      { es: "ticket / incidente", pt: "chamado / incidente" }, { es: "servidor", pt: "servidor" },
      { es: "actualización", pt: "atualização" }, { es: "librería / módulo", pt: "biblioteca / módulo" },
      { es: "usuario", pt: "usuário" }, { es: "ventana de mantenimiento", pt: "janela de manutenção" },
    ],
    quiz: [
      { question: "¿Qué reportaron los analistas el lunes por la mañana?", options: ["Resultados incorrectos en los equipos", "El sistema de gestión no respondía y no podían acceder", "Los equipos analíticos no funcionaban", "Los reactivos estaban vencidos"], answer: "El sistema de gestión no respondía y no podían acceder" },
      { question: "¿Cuántos tickets recibió TI simultáneamente?", options: ["Dos o tres tickets", "Cinco tickets", "Más de diez tickets", "Solo un ticket general"], answer: "Más de diez tickets" },
      { question: "¿Cuál fue el primer paso estratégico del equipo de TI?", options: ["Reiniciar inmediatamente todos los servidores", "Clasificar el incidente para entender si era generalizado o afectaba solo a algunos", "Llamar al proveedor del sistema", "Pedir al personal que volviera más tarde"], answer: "Clasificar el incidente para entender si era generalizado o afectaba solo a algunos" },
      { question: "¿Qué causó el problema en el sistema de gestión?", options: ["Un ataque de virus", "Una actualización automática de seguridad que conflictuó con el sistema", "Un usuario borró archivos críticos", "El disco duro del servidor estaba lleno"], answer: "Una actualización automática de seguridad que conflictuó con el sistema" },
      { question: "¿Por qué la comunicación proactiva durante el incidente fue valiosa?", options: ["Para cumplir con un requisito de la norma", "Redujo la ansiedad del personal y evitó llamadas que hubieran distraído al técnico", "Para demostrar que TI siempre está trabajando", "Solo para registrar el incidente"], answer: "Redujo la ansiedad del personal y evitó llamadas que hubieran distraído al técnico" },
      { question: "¿En cuánto tiempo se resolvió el problema desde la detección?", options: ["Quince minutos exactos", "Treinta minutos", "Menos de noventa minutos", "Varias horas con múltiples intervenciones"], answer: "Menos de noventa minutos" },
      { question: "¿Qué mejora se implementó para las futuras actualizaciones del sistema?", options: ["Desactivarlas completamente", "Definir un ambiente de prueba para validar compatibilidad antes de aplicarlas en producción", "Aplicarlas solo manualmente una vez por año", "Contratar un especialista externo"], answer: "Definir un ambiente de prueba para validar compatibilidad antes de aplicarlas en producción" },
      { question: "¿Qué protocolo de comunicación de incidentes se creó?", options: ["Solo un correo de disculpas posterior", "Mensajes mínimos a los 15 minutos, a los 30 minutos y al momento de la resolución", "Un informe técnico solo para la dirección", "Solo comunicar cuando el problema esté completamente resuelto"], answer: "Mensajes mínimos a los 15 minutos, a los 30 minutos y al momento de la resolución" },
    ],
    dictation: "Documentar los incidentes técnicos y aprender de ellos es lo que transforma un problema puntual en una mejora sistémica del área de TI.",
  },
  {
    id: "seguridad-datos", title: "Seguridad de datos", level: "Intermedio", category: "Tecnología", emoji: "🔒",
    description: "Protección de datos, accesos, contraseñas y buenas prácticas en sistemas.",
    readingTitle: "Una contraseña compartida",
    reading: [
      "Durante una auditoría de seguridad informática realizada por un consultor externo, se descubrió algo que nadie en el laboratorio había pensado que era un problema: cuatro analistas del área de bioquímica compartían la misma contraseña de acceso al sistema de gestión. La práctica había comenzado años atrás de forma informal, cuando un analista nuevo no recordaba su contraseña y otro le prestó la suya temporalmente. Con el tiempo, varios miembros del equipo habían adoptado la misma práctica por comodidad.",
      "El auditor explicó con claridad el problema de fondo. Si todos los usuarios comparten la misma credencial de acceso, el registro de auditoría del sistema, que debería permitir rastrear quién hizo qué y cuándo, se vuelve completamente inútil. Si alguien modifica un resultado, libera una muestra antes de tiempo o accede a información confidencial, es imposible saber quién fue. Eso no solo compromete la integridad del sistema: también puede tener consecuencias legales.",
      "El área de TI implementó inmediatamente varias medidas urgentes. Primero, restableció contraseñas individuales únicas para cada usuario del sistema, con requisitos mínimos de complejidad: longitud de al menos ocho caracteres, combinación de letras mayúsculas y minúsculas, números y caracteres especiales. Segundo, configuró el sistema para que las contraseñas expiraran cada noventa días. Tercero, activó el registro de auditoría detallado en el sistema de gestión.",
      "Para los módulos más críticos del sistema, como la liberación de resultados y el acceso a datos históricos de pacientes, se implementó autenticación de doble factor: además de la contraseña, el usuario debía confirmar su identidad mediante un código enviado a su teléfono. Si bien esta medida generó algunas resistencias iniciales por la fricción adicional que representa, el área de TI explicó el fundamento con ejemplos concretos de incidentes de seguridad.",
      "La seguridad de los datos en un laboratorio clínico no es solo una cuestión tecnológica: es también una responsabilidad ética y legal. Los datos de los pacientes, sus diagnósticos y sus historiales clínicos son información sensible que debe ser protegida con el mismo rigor con el que se protegen los resultados analíticos. Una brecha de seguridad que exponga datos de pacientes puede tener consecuencias graves para el laboratorio y dañar de forma irreparable la reputación de la institución.",
    ],
    vocab: [
      { es: "contraseña", pt: "senha" }, { es: "doble factor de autenticación", pt: "autenticação de dois fatores" },
      { es: "registro de auditoría", pt: "registro de auditoria" }, { es: "credencial", pt: "credencial" },
      { es: "brecha de seguridad", pt: "brecha de segurança" }, { es: "integridad de datos", pt: "integridade de dados" },
    ],
    quiz: [
      { question: "¿Qué práctica de riesgo descubrió la auditoría?", options: ["El servidor no tenía contraseña", "Cuatro analistas compartían la misma contraseña de acceso al sistema", "Los datos se almacenaban sin cifrado", "El sistema no tenía copias de seguridad"], answer: "Cuatro analistas compartían la misma contraseña de acceso al sistema" },
      { question: "¿Por qué compartir contraseñas inutiliza el registro de auditoría?", options: ["Porque el sistema falla cuando hay muchos usuarios activos", "Porque es imposible saber quién realizó cada acción si todos usan la misma credencial", "Porque las contraseñas compartidas se vencen más rápido", "Porque viola automáticamente la norma ISO"], answer: "Porque es imposible saber quién realizó cada acción si todos usan la misma credencial" },
      { question: "¿Cuáles son los requisitos mínimos de complejidad de contraseña implementados?", options: ["Solo 4 caracteres numéricos", "Al menos 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales", "Solo letras y números sin mayúsculas", "Sin requisitos especiales"], answer: "Al menos 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales" },
      { question: "¿Cada cuánto tiempo deben renovarse las contraseñas?", options: ["Cada año", "Cada noventa días", "Cada seis meses", "Solo cuando el usuario lo decide"], answer: "Cada noventa días" },
      { question: "¿Qué es el doble factor de autenticación?", options: ["Tener dos contraseñas diferentes", "Confirmar la identidad con un segundo método además de la contraseña, como un código al teléfono", "Usar contraseñas del doble de longitud", "Que dos personas autorizan cada acción"], answer: "Confirmar la identidad con un segundo método además de la contraseña, como un código al teléfono" },
      { question: "¿Para qué módulos se implementó el doble factor?", options: ["Para todos los módulos sin excepción", "Para los módulos más críticos: liberación de resultados y acceso a datos históricos de pacientes", "Solo para el módulo de facturación", "Para ninguno, quedó como propuesta"], answer: "Para los módulos más críticos: liberación de resultados y acceso a datos históricos de pacientes" },
      { question: "¿Por qué algunos analistas mostraron resistencia al doble factor?", options: ["Por razones políticas internas", "Porque genera fricción adicional al proceso habitual de acceso", "Porque no entendían su funcionamiento técnico", "Porque creían que su contraseña individual era suficiente"], answer: "Porque genera fricción adicional al proceso habitual de acceso" },
      { question: "¿Por qué la seguridad de datos es una responsabilidad ética en el laboratorio?", options: ["Solo porque lo exige la norma", "Porque los datos de los pacientes son información sensible cuya exposición tiene consecuencias legales y daña la confianza", "Solo para proteger los datos económicos del laboratorio", "Porque los organismos acreditadores lo auditan"], answer: "Porque los datos de los pacientes son información sensible cuya exposición tiene consecuencias legales y daña la confianza" },
    ],
    dictation: "La seguridad de los datos en un laboratorio es una responsabilidad ética y legal: los datos de los pacientes deben protegerse con el máximo rigor.",
  },
  {
    id: "lims", title: "Sistema LIMS", level: "Intermedio", category: "Tecnología", emoji: "🖥️",
    description: "Gestión digital del laboratorio: flujo de muestras, trazabilidad y reportes automáticos.",
    readingTitle: "El flujo digital de una muestra",
    reading: [
      "Cuando una muestra ingresa al laboratorio, en ese mismo instante comienza a dejar un rastro digital en el LIMS, el Sistema de Información del Laboratorio. El número de recepción, el nombre y el código de barras del paciente, los análisis solicitados, el analista que recibió la muestra, la fecha y hora de ingreso: todo queda registrado y vinculado de forma automática. A medida que la muestra avanza por el proceso, cada paso agrega una nueva capa de información.",
      "Esa cadena de información es lo que permite al laboratorio responder con precisión y rapidez cuando un cliente solicita información sobre el estado de su análisis o cuando un médico necesita verificar un resultado histórico. Sin el LIMS, esa búsqueda requeriría revisar registros en papel en varios archivos físicos, lo que podría llevar horas o días. Con el LIMS, la información está disponible en segundos.",
      "El LIMS también permite automatizar gran parte del proceso de generación de informes. Una vez que el analista valida un resultado en el sistema, el LIMS puede generar automáticamente el informe en el formato específico del cliente, aplicar los rangos de referencia correspondientes a la edad y el sexo del paciente, señalar los resultados fuera de rango con marcadores visuales, e incluso enviar el informe por correo electrónico al cliente.",
      "La integración del LIMS con los equipos analíticos mediante interfaces bidireccionales es otro aspecto crítico. Una interfaz bidireccional significa que el LIMS puede enviar automáticamente las solicitudes de análisis al equipo y recibir automáticamente los resultados del equipo. Cuando esa bidireccionalidad funciona correctamente, reduce el tiempo de procesamiento y prácticamente elimina los errores de transcripción.",
      "La implementación de un nuevo LIMS es un proyecto complejo que requiere planificación cuidadosa, formación del personal, validación del sistema y un plan de contingencia para los primeros días de operación. Un LIMS mal configurado puede generar más problemas de los que resuelve. Por eso, la participación activa del equipo técnico del laboratorio en la definición de los requerimientos y la validación de los resultados es tan importante como la calidad del software en sí mismo.",
    ],
    vocab: [
      { es: "LIMS", pt: "LIMS" }, { es: "interfaz bidireccional", pt: "interface bidirecional" },
      { es: "trazabilidad digital", pt: "rastreabilidade digital" }, { es: "informe automático", pt: "relatório automático" },
      { es: "validación del sistema", pt: "validação do sistema" }, { es: "transcripción manual", pt: "transcrição manual" },
    ],
    quiz: [
      { question: "¿Qué información queda registrada automáticamente en el LIMS desde el ingreso?", options: ["Solo el resultado final validado", "Número de recepción, paciente, análisis, analista, instrumento y resultado", "Solo el nombre del paciente y el análisis pedido", "Solo el resultado y la fecha de entrega"], answer: "Número de recepción, paciente, análisis, analista, instrumento y resultado" },
      { question: "¿Cómo responde el LIMS ante una solicitud de revisión histórica?", options: ["Requiere buscar en archivos físicos", "Recupera toda la información de trazabilidad en segundos con todos sus datos", "Solo puede recuperar los últimos 30 días", "Necesita intervención manual del administrador"], answer: "Recupera toda la información de trazabilidad en segundos con todos sus datos" },
      { question: "¿Qué puede hacer el LIMS automáticamente después de que el analista valida un resultado?", options: ["Solo guardarlo en la base de datos", "Generar el informe con rangos de referencia, marcadores y enviarlo al cliente sin intervención manual", "Solo imprimir el resultado en papel", "Solo notificar al médico por teléfono"], answer: "Generar el informe con rangos de referencia, marcadores y enviarlo al cliente sin intervención manual" },
      { question: "¿Qué es una interfaz bidireccional entre el LIMS y el equipo analítico?", options: ["Una interfaz que solo recibe datos del equipo", "Una interfaz que envía solicitudes al equipo Y recibe resultados automáticamente", "Una conexión que funciona en ambos turnos del día", "Una interfaz que conecta dos laboratorios diferentes"], answer: "Una interfaz que envía solicitudes al equipo Y recibe resultados automáticamente" },
      { question: "¿Qué error elimina prácticamente la interfaz bidireccional?", options: ["Los errores de calibración del equipo", "Los errores de transcripción manual de resultados", "Los errores de identificación de pacientes", "Los errores de control de calidad analítico"], answer: "Los errores de transcripción manual de resultados" },
      { question: "¿Qué requiere la implementación exitosa de un nuevo LIMS?", options: ["Solo comprar el software más moderno", "Planificación cuidadosa, formación del personal, validación y plan de contingencia", "Solo migrar los datos del sistema anterior", "Solo capacitar al área de TI"], answer: "Planificación cuidadosa, formación del personal, validación y plan de contingencia" },
      { question: "¿Por qué es fundamental la participación del equipo técnico en la implementación?", options: ["Para ahorrar costos de consultoría", "Porque conocen los flujos de trabajo reales y pueden garantizar que el sistema se configure correctamente", "Solo para aprobar el sistema ante el organismo acreditador", "Para justificar el presupuesto"], answer: "Porque conocen los flujos de trabajo reales y pueden garantizar que el sistema se configure correctamente" },
      { question: "¿Qué puede ocurrir con un LIMS mal configurado?", options: ["Funciona igual que uno bien configurado", "Puede generar más problemas de los que resuelve en la operación diaria", "Solo afecta la velocidad de procesamiento", "Solo afecta la estética de los informes"], answer: "Puede generar más problemas de los que resuelve en la operación diaria" },
    ],
    dictation: "El LIMS registra toda la cadena de información de cada muestra y permite automatizar la generación de informes, reduciendo errores de transcripción.",
  },
  // ══ GRAMÁTICA ══
  {
    id: "ser-estar", title: "Ser vs. Estar", level: "Básico", category: "Gramática", emoji: "🔄",
    description: "La distinción más importante entre español y portugués: ser y estar.",
    readingTitle: "¿Es o está? La diferencia que cambia el significado",
    reading: [
      "La distinción entre 'ser' y 'estar' es probablemente el aspecto gramatical que más confunde a los hablantes de portugués cuando aprenden español. En portugués también existen ambos verbos, pero su distribución no coincide exactamente con la del español. La regla más general que funciona como punto de partida es la siguiente: 'ser' se usa para características que se perciben como permanentes, esenciales o definitivas (identidad, origen, material, características inherentes), mientras que 'estar' se usa para estados, condiciones o situaciones que son temporales o percibidas como no definitivas.",
      "En el contexto del laboratorio, esta distinción aparece constantemente y tiene consecuencias prácticas reales. Decir 'el reactivo es vencido' es incorrecto en español: el vencimiento es un estado temporal en el que ha entrado el reactivo, no una característica permanente de su identidad, por lo que la forma correcta es 'el reactivo está vencido'. De la misma manera, 'el equipo es en mantenimiento' es incorrecto; debe decirse 'el equipo está en mantenimiento'.",
      "Los adjetivos que funcionan de forma diferente con 'ser' y 'estar' son una fuente constante de confusión. 'El analista es aburrido' significa que la persona tiene una personalidad aburrida como característica permanente. 'El analista está aburrido' significa que en este momento se siente aburrido, sin implicar nada sobre su carácter habitual. 'El reactivo es malo' implica que es de mala calidad por naturaleza. 'El reactivo está malo' implica que en este momento no está en condiciones de uso.",
      "La ubicación y las condiciones físicas o emocionales van casi siempre con 'estar'. 'El laboratorio está en el tercer piso.' 'Las muestras están en el refrigerador de cuatro grados.' 'El resultado está validado.' Estas son situaciones o condiciones que caracterizan el estado actual de algo, no su identidad permanente. La excepción son los eventos, que van con 'ser' aunque expresen una ubicación: 'La reunión es en la sala de conferencias'.",
      "Para los hablantes de portugués, una dificultad adicional es que algunas expresiones que en portugués usan 'ser' en español usan 'estar' y viceversa. 'É casado' en portugués equivale a 'está casado' en español, porque el matrimonio se percibe como un estado más que como una característica identitaria permanente en el español estándar. La práctica constante con ejemplos del contexto laboral real es la mejor estrategia para internalizar estas diferencias.",
    ],
    vocab: [
      { es: "ser (identidad/permanente)", pt: "ser (identidade/permanente)" }, { es: "estar (estado/temporal)", pt: "estar (estado/temporário)" },
      { es: "el reactivo está vencido", pt: "o reagente está vencido" }, { es: "el resultado está validado", pt: "o resultado está validado" },
      { es: "el equipo está en mantenimiento", pt: "o equipamento está em manutenção" }, { es: "ella es analista", pt: "ela é analista" },
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
    id: "conectores", title: "Conectores y cohesión", level: "Intermedio", category: "Gramática", emoji: "🔗",
    description: "Conectores para textos técnicos: informes, hallazgos y comunicaciones formales.",
    readingTitle: "El informe que fluía",
    reading: [
      "Un informe técnico de laboratorio es, ante todo, un texto que debe comunicar información compleja de forma clara, organizada y convincente. Para lograrlo, no basta con tener los datos correctos: también es necesario que esos datos estén conectados entre sí mediante una lógica explícita que el lector pueda seguir sin esfuerzo. Los conectores son las palabras y expresiones que hacen ese trabajo: guían al lector de una idea a la siguiente y señalan relaciones lógicas entre los datos.",
      "Los conectores de adición son los más simples y los más utilizados: sirven para agregar información nueva que refuerza o complementa lo anterior. Los principales son: además, también, asimismo, igualmente, del mismo modo, por otra parte, y en este sentido. Por ejemplo: 'El control de nivel bajo fue rechazado. Además, el control de nivel alto mostró una tendencia descendente en los últimos cinco días.'",
      "Los conectores de contraste son fundamentales en los informes técnicos porque permiten presentar información que va en una dirección diferente o inesperada. Los principales son: sin embargo, no obstante, aunque, a pesar de que, por el contrario, en cambio. Por ejemplo: 'Los resultados del control de nivel bajo fueron aceptables. Sin embargo, el control de nivel alto presentó valores fuera del rango de aceptación durante tres corridas consecutivas.'",
      "Los conectores de causa y consecuencia son esenciales para explicar por qué ocurrió algo y qué efectos tuvo. Los principales conectores causales son: porque, ya que, dado que, debido a que, puesto que. Los conectores de consecuencia son: por lo tanto, en consecuencia, como resultado, por ende, así que. Por ejemplo: 'Dado que el switch de red falló durante el turno vespertino, los equipos analíticos no pudieron transferir los resultados al LIMS. Por lo tanto, el personal procedió a registrar manualmente todos los resultados.'",
      "El dominio de los conectores no solo mejora la calidad de los textos técnicos escritos: también mejora la claridad de la comunicación oral en reuniones, presentaciones y llamadas con clientes. Quien puede organizar su discurso con conectores explícitos transmite mayor claridad de pensamiento y genera más confianza en su interlocutor. Para los profesionales del laboratorio que trabajan en un contexto bilingüe, muchos conectores tienen equivalentes directos entre ambas lenguas, lo que facilita el aprendizaje.",
    ],
    vocab: [
      { es: "sin embargo / no obstante", pt: "no entanto / porém" }, { es: "además / asimismo", pt: "além disso / igualmente" },
      { es: "por lo tanto / en consecuencia", pt: "portanto / consequentemente" }, { es: "dado que / ya que", pt: "dado que / uma vez que" },
      { es: "aunque / a pesar de que", pt: "embora / apesar de que" }, { es: "por el contrario / en cambio", pt: "pelo contrário / em vez disso" },
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
    ],
    dictation: "El control presentó una desviación; sin embargo, el equipo actuó rápidamente y, por lo tanto, no fue necesario rechazar la corrida analítica.",
  },
  {
    id: "presente-indicativo", title: "Presente de indicativo", level: "Básico", category: "Gramática", emoji: "✏️",
    description: "Conjugación y uso del presente en contextos técnicos del laboratorio.",
    readingTitle: "Lo que hacemos todos los días",
    reading: [
      "El presente de indicativo es el tiempo verbal más utilizado en las comunicaciones técnicas del laboratorio. Se usa para describir acciones habituales y rutinarias que se repiten regularmente ('el analista verifica los controles cada mañana'), para expresar hechos o verdades generales que no cambian con el tiempo ('la hemoglobina transporta oxígeno en los glóbulos rojos'), y para dar instrucciones o procedimientos en voz activa.",
      "La conjugación de los verbos regulares en presente sigue patrones predecibles según la terminación del infinitivo. Los verbos terminados en -ar forman el presente con las terminaciones -o, -as, -a, -amos, -áis, -an. Por ejemplo: analizar → analizo, analizas, analiza, analizamos, analizáis, analizan. Los verbos terminados en -er usan -o, -es, -e, -emos, -éis, -en.",
      "Sin embargo, muchos de los verbos más frecuentes en el lenguaje técnico del laboratorio son irregulares y deben memorizarse. El verbo ser se conjuga: soy, eres, es, somos, sois, son. El verbo estar: estoy, estás, está, estamos, estáis, están. El verbo tener: tengo, tienes, tiene, tenemos, tenéis, tienen. El verbo hacer: hago, haces, hace, hacemos, hacéis, hacen. Estos verbos aparecen constantemente en procedimientos, correos y conversaciones técnicas.",
      "Una diferencia importante entre el español y el portugués en el uso del presente es la frecuencia con que el español recurre a este tiempo donde el portugués preferiría usar el gerundio o una perífrasis verbal. En español es completamente natural decir 'el equipo procesa las muestras' para referirse a una acción que está ocurriendo ahora mismo, mientras que en portugués sería más frecuente decir 'o equipamento está processando as amostras'.",
      "En los procedimientos operativos estándar del laboratorio, el presente de indicativo es el tiempo dominante porque describe acciones que se repiten igual en cada ejecución del procedimiento. 'El operador enciende el equipo y espera la secuencia de inicialización. Verifica que los reactivos estén correctamente instalados. Introduce los controles de calidad en el orden establecido. Registra los resultados en el sistema antes de procesar las muestras de pacientes.' Este uso es una característica del lenguaje técnico en español que conviene conocer y manejar con fluidez.",
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
      { question: "¿Cómo se conjuga 'tener' en tercera persona del singular?", options: ["teno", "tiene", "tenemos", "tenés"], answer: "tiene" },
      { question: "¿Cuál es la diferencia de uso del presente entre español y portugués?", options: ["No hay ninguna diferencia de uso", "En español se usa el presente simple donde el portugués prefiere 'estar + gerundio'", "En español el presente solo se usa para el pasado", "En portugués el presente se usa más frecuentemente"], answer: "En español se usa el presente simple donde el portugués prefiere 'estar + gerundio'" },
      { question: "¿Cuál de estos verbos es completamente irregular en presente?", options: ["trabajar", "leer", "escribir", "ser"], answer: "ser" },
      { question: "¿Para qué se usa el presente en los procedimientos operativos estándar?", options: ["Solo como título del documento", "Para describir acciones que se repiten igual en cada ejecución del procedimiento", "Para indicar las fechas de vencimiento de reactivos", "Para señalar los responsables del proceso"], answer: "Para describir acciones que se repiten igual en cada ejecución del procedimiento" },
    ],
    dictation: "El analista verifica los controles, registra los resultados y comunica cualquier desviación al área responsable antes de liberar los informes.",
  },
  {
    id: "vocabulario-general", title: "Vocabulario del trabajo", level: "Básico", category: "Gramática", emoji: "📖",
    description: "Vocabulario esencial para el entorno profesional y los falsos cognados más frecuentes.",
    readingTitle: "Las palabras que parecen iguales pero no lo son",
    reading: [
      "Aprender el vocabulario del español técnico del laboratorio no significa solo memorizar los términos científicos equivalentes al portugués. También implica dominar el vocabulario del entorno laboral cotidiano: las palabras que se usan en reuniones, correos, llamadas telefónicas y documentos internos. Muchas de esas palabras son fáciles porque son iguales o muy similares en ambos idiomas. Pero otras son engañosas precisamente por esa similitud: se llaman 'falsos cognados' o 'falsos amigos'.",
      "Los falsos cognados son palabras que se parecen en la forma escrita o sonora, pero tienen significados diferentes en cada idioma. Algunos ejemplos muy frecuentes en el contexto laboral: 'embarazada' en español significa 'grávida' (embaraçada en portugués significa 'avergonzada'). 'Constipado' en español significa 'resfriado' (resfriado/gripado en portugués), mientras que en portugués 'constipado' significa 'con problemas de estreñimiento'. 'Exquisito' en español significa algo de calidad extraordinaria; en portugués 'esquisito' significa 'extraño' o 'raro'.",
      "En el contexto técnico del laboratorio, también existen falsos cognados. 'Comprometido' en español puede significar 'involucrado' o 'afectado' (la muestra está comprometida por la hemólisis). 'Polvo' en español significa 'polvillo' o 'partícula fina' (pó en portugués), pero 'polvo' en portugués es una palabra vulgar que debe evitarse absolutamente en contextos formales.",
      "Más allá de los falsos cognados, el vocabulario del entorno laboral en español incluye muchas expresiones y frases hechas que deben aprenderse como unidades. 'Estar al tanto' significa estar informado de algo. 'Ponerse al día' significa actualizarse sobre lo que ha ocurrido. 'Dar de alta' a un paciente significa darlo de alta del hospital. 'Dar de baja' a un reactivo significa retirarlo del uso activo. 'Dar el visto bueno' significa dar la aprobación final a algo.",
      "La mejor estrategia para ampliar el vocabulario en un contexto real como el del laboratorio es practicar activamente en situaciones concretas. Leer los procedimientos operativos estándar del laboratorio en español, participar en las reuniones de equipo, escuchar y repetir mentalmente cómo los colegas más experimentados describen los procesos, y usar conscientemente las palabras nuevas en conversaciones reales son las actividades que más rápidamente consolidan el vocabulario activo.",
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
      { question: "¿Qué significa 'embarazada' en español?", options: ["Avergonzada por algo", "Con náuseas", "Grávida, con un bebé en el vientre", "Muy cansada"], answer: "Grávida, con un bebé en el vientre" },
      { question: "¿Qué significa 'constipado' en español?", options: ["Con estreñimiento o problema intestinal", "Resfriado, con síntomas de gripe común", "Muy cansado y sin energía", "Con dolor de cabeza intenso"], answer: "Resfriado, con síntomas de gripe común" },
      { question: "¿Qué significa 'exquisito' en español?", options: ["Extraño o raro, poco común", "De calidad extraordinaria o muy refinado y elegante", "Difícil de entender", "Demasiado elaborado para ser práctico"], answer: "De calidad extraordinaria o muy refinado y elegante" },
      { question: "¿Qué significa la expresión 'dar el visto bueno'?", options: ["Ver algo por primera vez con agrado", "Dar la aprobación final a algo", "Mirar con buenos ojos a una persona", "Confirmar que algo fue recibido"], answer: "Dar la aprobación final a algo" },
      { question: "¿Qué significa 'estar al tanto' en el contexto laboral?", options: ["Estar esperando hace mucho tiempo", "Estar informado de algo relevante", "Estar de acuerdo con alguna decisión", "Estar muy atento durante la reunión"], answer: "Estar informado de algo relevante" },
      { question: "¿Qué significa 'ponerse al día' en el contexto laboral?", options: ["Trabajar durante todo el día sin descanso", "Actualizarse sobre lo que ha ocurrido en el trabajo", "Llegar temprano al laboratorio siempre", "Completar todas las tareas pendientes"], answer: "Actualizarse sobre lo que ha ocurrido en el trabajo" },
      { question: "¿Cuál es la mejor estrategia para consolidar el vocabulario activo en español técnico?", options: ["Memorizar listas de palabras en abstracto", "Practicar activamente en situaciones laborales reales y usar conscientemente las palabras nuevas", "Solo leer libros de gramática española", "Ver películas en español sin subtítulos"], answer: "Practicar activamente en situaciones laborales reales y usar conscientemente las palabras nuevas" },
    ],
    dictation: "Los falsos cognados son palabras parecidas en español y portugués con significados diferentes, y son una fuente frecuente de malentendidos profesionales.",
  },
  // ══ LABORATORIO (nuevos) ══
  {
    id: "urinalisis", title: "Análisis de orina", level: "Básico", category: "Laboratorio", emoji: "🔭",
    description: "Examen físico, químico y microscópico del sedimento urinario.",
    readingTitle: "Lo que revela una muestra de orina",
    reading: [
      "El uroanálisis o análisis completo de orina es uno de los análisis más informativos y económicos de la medicina de laboratorio. Con una sola muestra y un proceso relativamente sencillo, permite obtener datos sobre el funcionamiento del riñón, el estado de hidratación, la presencia de infección urinaria, alteraciones metabólicas como diabetes o cetosis, y patologías renales como glomerulonefritis o síndrome nefrótico.",
      "El análisis se divide en tres componentes complementarios. El examen físico evalúa características observables a simple vista: el color, la transparencia o turbidez y el olor. Una orina muy oscura y concentrada puede indicar deshidratación o daño hepático. Una orina turbia sugiere presencia de bacterias, leucocitos o cristales. El examen químico se realiza mediante tiras reactivas que detectan glucosa, proteínas, sangre, leucocitos, nitritos, cetonas, bilirrubina, urobilinógeno y pH.",
      "El examen microscópico del sedimento es el más informativo pero también el más técnico. Después de centrifugar la muestra, se deposita el sedimento en un portaobjetos y se examina al microscopio. Los elementos que pueden observarse incluyen eritrocitos, leucocitos, células epiteliales de distintos orígenes, cilindros renales de diferentes tipos, cristales de diversas composiciones, bacterias, levaduras y parásitos.",
      "Los cilindros renales merecen especial atención porque son elementos exclusivos del riñón: se forman en los túbulos renales y su presencia indica que algo está ocurriendo a nivel renal. Los cilindros hialinos pueden aparecer en condiciones normales o con deshidratación leve. Los cilindros granulosos o céreos sugieren daño renal significativo. Los cilindros eritrocitarios son altamente específicos de glomerulonefritis activa.",
      "La fase preanalítica del uroanálisis tiene sus propias particularidades. La muestra debe procesarse dentro de las dos horas posteriores a la recolección, porque después de ese tiempo los elementos celulares comienzan a degradarse, el pH cambia por crecimiento bacteriano y los resultados pueden ser completamente diferentes. La primera orina de la mañana es la más concentrada y la más representativa para detectar proteinuria, glucosuria y elementos celulares.",
    ],
    vocab: [
      { es: "sedimento urinario", pt: "sedimento urinário" }, { es: "cilindro renal", pt: "cilindro renal" },
      { es: "proteinuria", pt: "proteinúria" }, { es: "glucosuria", pt: "glicosúria" },
      { es: "tira reactiva", pt: "fita reagente" }, { es: "turbidez", pt: "turbidez" },
    ],
    quiz: [
      { question: "¿Qué tres componentes tiene el análisis completo de orina?", options: ["Solo físico y químico", "Físico, químico y microscópico del sedimento", "Solo microscópico y químico", "Solo físico y microscópico"], answer: "Físico, químico y microscópico del sedimento" },
      { question: "¿Qué puede indicar una orina muy oscura y concentrada?", options: ["Buena hidratación", "Deshidratación o daño hepático", "Infección bacteriana", "Solo un artefacto del recipiente"], answer: "Deshidratación o daño hepático" },
      { question: "¿Qué detectan las tiras reactivas?", options: ["Solo glucosa y proteínas", "Glucosa, proteínas, sangre, leucocitos, nitritos, cetonas, bilirrubina y pH", "Solo bacterias y levaduras", "Solo pH y color"], answer: "Glucosa, proteínas, sangre, leucocitos, nitritos, cetonas, bilirrubina y pH" },
      { question: "¿Por qué los cilindros renales son clínicamente importantes?", options: ["Son normales y no tienen significado", "Son exclusivos del riñón e indican que algo ocurre a nivel renal", "Solo aparecen en personas sanas", "Son artefactos del proceso analítico"], answer: "Son exclusivos del riñón e indican que algo ocurre a nivel renal" },
      { question: "¿Qué indica la presencia de cilindros eritrocitarios?", options: ["Infección bacteriana", "Glomerulonefritis activa", "Deshidratación leve", "Diabetes no controlada"], answer: "Glomerulonefritis activa" },
      { question: "¿Cuánto tiempo máximo puede pasar antes de procesar la muestra?", options: ["24 horas refrigerada", "Dos horas desde la recolección", "Solo 30 minutos", "Hasta 6 horas a temperatura ambiente"], answer: "Dos horas desde la recolección" },
      { question: "¿Por qué se prefiere la primera orina de la mañana?", options: ["Por ser más fácil de obtener", "Es la más concentrada y representativa para detectar alteraciones", "Tiene menos bacterias contaminantes", "Es más fácil de centrifugar"], answer: "Es la más concentrada y representativa para detectar alteraciones" },
      { question: "¿Qué sugiere una orina turbia?", options: ["Buena hidratación", "Presencia de bacterias, leucocitos o cristales", "Alta concentración de glucosa", "Ausencia de elementos celulares"], answer: "Presencia de bacterias, leucocitos o cristales" },
    ],
    dictation: "El análisis de orina evalúa características físicas, químicas y microscópicas y debe procesarse dentro de las dos horas de recolección.",
  },
  {
    id: "inmunologia", title: "Inmunología y serología", level: "Intermedio", category: "Laboratorio", emoji: "🛡️",
    description: "Anticuerpos, antígenos y técnicas inmunoserológicas en el laboratorio.",
    readingTitle: "El sistema que guarda memoria",
    reading: [
      "La inmunología de laboratorio estudia la respuesta inmune del organismo y la utiliza como herramienta diagnóstica. Cuando el cuerpo entra en contacto con un agente extraño, ya sea un virus, una bacteria o una proteína anormal, desarrolla una respuesta que incluye la producción de anticuerpos específicos. Esos anticuerpos persisten en la sangre durante meses o años y pueden detectarse mediante técnicas serológicas.",
      "El principio fundamental de la mayoría de las técnicas inmunoserológicas es la reacción antígeno-anticuerpo. Esta reacción es altamente específica: un anticuerpo reconoce y se une a un antígeno particular con gran selectividad. Las técnicas de laboratorio aprovechan esa especificidad para detectar la presencia de anticuerpos específicos contra un agente infeccioso o la presencia de antígenos de ese agente en la muestra del paciente.",
      "Entre las técnicas más utilizadas se encuentran el ELISA, que usa enzimas unidas al anticuerpo o al antígeno para generar una señal colorimétrica medible; la inmunofluorescencia, que usa fluorocromos para visualizar la unión antígeno-anticuerpo al microscopio; la quimioluminiscencia, que es la base de los analizadores automáticos modernos de alta sensibilidad; y las pruebas rápidas de inmunocromatografía, que son las tiras reactivas de resultado visible a simple vista en pocos minutos.",
      "La interpretación de los resultados serológicos requiere comprender el concepto de ventana inmunológica: el período que transcurre desde la infección hasta que el organismo produce suficientes anticuerpos como para ser detectados. Durante ese período, la persona está infectada pero su resultado serológico puede ser negativo. Por eso, una serología negativa en un paciente con sospecha clínica fuerte no siempre descarta la infección.",
      "Los marcadores serológicos también permiten distinguir una infección aguda de una pasada o una reinfección. Las inmunoglobulinas de clase IgM son las primeras en aparecer después de un contacto antigénico y desaparecen en semanas o meses. Las IgG son las de memoria y persisten durante años. Un resultado IgM positivo con IgG negativo sugiere infección aguda reciente, mientras que IgG positivo con IgM negativo sugiere exposición pasada.",
    ],
    vocab: [
      { es: "anticuerpo", pt: "anticorpo" }, { es: "antígeno", pt: "antígeno" },
      { es: "ELISA", pt: "ELISA" }, { es: "ventana inmunológica", pt: "janela imunológica" },
      { es: "IgM / IgG", pt: "IgM / IgG" }, { es: "sensibilidad / especificidad", pt: "sensibilidade / especificidade" },
    ],
    quiz: [
      { question: "¿Cuál es el principio fundamental de las técnicas inmunoserológicas?", options: ["La reacción enzima-sustrato", "La reacción antígeno-anticuerpo altamente específica", "La precipitación de proteínas", "La centrifugación diferencial"], answer: "La reacción antígeno-anticuerpo altamente específica" },
      { question: "¿Qué técnica usa enzimas para generar una señal colorimétrica?", options: ["Inmunofluorescencia", "ELISA", "Inmunocromatografía", "Quimioluminiscencia"], answer: "ELISA" },
      { question: "¿Qué es la ventana inmunológica?", options: ["El período de mayor contagiosidad", "El tiempo desde la infección hasta que los anticuerpos son detectables", "El período de recuperación clínica", "El tiempo de vida de los anticuerpos en sangre"], answer: "El tiempo desde la infección hasta que los anticuerpos son detectables" },
      { question: "¿Qué sugiere un resultado IgM positivo con IgG negativo?", options: ["Infección pasada con inmunidad", "Infección aguda reciente", "Ausencia de contacto previo", "Resultado indeterminado sin significado"], answer: "Infección aguda reciente" },
      { question: "¿Qué sugiere IgG positivo con IgM negativo?", options: ["Infección activa aguda", "Exposición pasada con memoria inmunológica", "Falla del sistema inmune", "Contaminación de la muestra"], answer: "Exposición pasada con memoria inmunológica" },
      { question: "¿Por qué una serología negativa no siempre descarta infección?", options: ["Porque los equipos son poco sensibles", "Porque el paciente puede estar en ventana inmunológica", "Porque los anticuerpos no se detectan en sangre", "Porque la muestra puede ser de orina"], answer: "Porque el paciente puede estar en ventana inmunológica" },
      { question: "¿Qué ventaja tienen las pruebas rápidas de inmunocromatografía?", options: ["Mayor sensibilidad que ELISA", "Resultado visible a simple vista en pocos minutos sin equipos especiales", "Cuantificación precisa del anticuerpo", "Menor costo por unidad que otras técnicas"], answer: "Resultado visible a simple vista en pocos minutos sin equipos especiales" },
      { question: "¿Cuánto tiempo persisten las IgG en sangre?", options: ["Solo días tras la infección", "Semanas o hasta dos meses", "Años, son los anticuerpos de memoria", "Exactamente seis meses"], answer: "Años, son los anticuerpos de memoria" },
    ],
    dictation: "Las IgM indican infección aguda reciente mientras que las IgG representan memoria inmunológica de exposiciones pasadas.",
  },
  {
    id: "marcadores-cardiacos", title: "Marcadores cardíacos", level: "Avanzado", category: "Laboratorio", emoji: "❤️",
    description: "Troponina, CK-MB y BNP en el diagnóstico de eventos cardiovasculares.",
    readingTitle: "Cuando el corazón deja huella en la sangre",
    reading: [
      "Los marcadores cardíacos son proteínas o enzimas que normalmente se encuentran dentro de las células del músculo cardíaco y que se liberan al torrente sanguíneo cuando esas células sufren daño. Su detección en sangre a concentraciones elevadas es una señal de lesión miocárdica y tiene un rol central en el diagnóstico del infarto agudo de miocardio y otras patologías cardíacas.",
      "La troponina cardíaca, en sus formas T e I, es actualmente el marcador de elección para el diagnóstico de infarto agudo de miocardio. Su alta especificidad por el tejido cardíaco la hace superior a marcadores anteriores. Las troponinas comienzan a elevarse entre tres y seis horas después del inicio del daño miocárdico, alcanzan su pico entre doce y veinticuatro horas y pueden permanecer elevadas hasta catorce días. Las generaciones más nuevas de troponina de alta sensibilidad permiten detectar elevaciones mínimas mucho antes.",
      "La CK-MB, una isoenzima de la creatinquinasa, fue el marcador estándar antes de la troponina. Aunque ha sido desplazada para el diagnóstico de infarto, sigue siendo útil para detectar reinfartos, porque sus niveles vuelven a la normalidad más rápidamente que la troponina. También se usa para estimar el tamaño del infarto a través del análisis de su curva de elevación y descenso.",
      "El BNP o péptido natriurético cerebral y su precursor NT-proBNP son marcadores de estrés mecánico del ventrículo. Se elevan cuando el corazón trabaja bajo una presión o volumen excesivos, como ocurre en la insuficiencia cardíaca. Su medición es útil tanto para el diagnóstico de insuficiencia cardíaca como para evaluar la respuesta al tratamiento y estratificar el riesgo en pacientes con disnea.",
      "La interpretación de los marcadores cardíacos siempre debe realizarse en el contexto clínico del paciente y en función del tiempo transcurrido desde el inicio de los síntomas. Una troponina normal en las primeras dos horas de síntomas no descarta infarto. La estrategia diagnóstica actual incluye mediciones seriadas en el tiempo para evaluar la cinética del marcador. El laboratorio tiene la responsabilidad de comunicar los resultados críticos de forma inmediata y documentada.",
    ],
    vocab: [
      { es: "troponina", pt: "troponina" }, { es: "infarto agudo de miocardio", pt: "infarto agudo do miocárdio" },
      { es: "CK-MB", pt: "CK-MB" }, { es: "BNP / NT-proBNP", pt: "BNP / NT-proBNP" },
      { es: "insuficiencia cardíaca", pt: "insuficiência cardíaca" }, { es: "marcador de daño miocárdico", pt: "marcador de dano miocárdico" },
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
    ],
    dictation: "La troponina cardíaca es el marcador de elección para el diagnóstico de infarto y debe medirse de forma seriada en el tiempo.",
  },
  // ══ GESTIÓN (nuevos) ══
  {
    id: "iso15189", title: "ISO 15189", level: "Avanzado", category: "Gestión", emoji: "🏅",
    description: "Requisitos de la norma internacional para laboratorios clínicos.",
    readingTitle: "El estándar que define la excelencia",
    reading: [
      "La norma ISO 15189 es el estándar internacional que establece los requisitos específicos de calidad y competencia para los laboratorios clínicos. Fue desarrollada por la Organización Internacional de Normalización y está diseñada específicamente para el contexto del laboratorio médico, a diferencia de la ISO 17025, que es más amplia y aplica a laboratorios de ensayo en general. Su implementación y la certificación basada en ella es reconocida como la referencia de excelencia a nivel mundial.",
      "La norma está estructurada en dos grandes bloques de requisitos: los requisitos de gestión y los requisitos técnicos. Los requisitos de gestión incluyen aspectos como la organización, el sistema de gestión de la calidad, el control de documentos y registros, la gestión de no conformidades, las acciones correctivas y preventivas, las auditorías internas y la revisión por la dirección. Los requisitos técnicos abordan el personal, las instalaciones, los equipos, los procesos preanalíticos, analíticos y postanalíticos, y la garantía de calidad.",
      "Uno de los conceptos centrales de la ISO 15189 es el enfoque en el paciente. El laboratorio no es solo un proveedor de datos numéricos: es un actor clave en la cadena de atención al paciente. La norma exige que el laboratorio establezca canales de comunicación efectivos con los médicos, que informe resultados críticos de manera oportuna y que asegure que el informe final sea comprensible y útil para la toma de decisiones clínicas.",
      "La acreditación bajo ISO 15189 es un proceso formal en el que un organismo evaluador independiente verifica que el laboratorio cumple con todos los requisitos de la norma. Es diferente de la certificación ISO 9001, que evalúa el sistema de gestión pero no la competencia técnica específica. La acreditación ISO 15189 implica una evaluación de pares: los evaluadores son profesionales con experiencia en laboratorio clínico.",
      "Implementar ISO 15189 no es solo cumplir con una lista de requisitos formales. Es adoptar una cultura de mejora continua en la que cada proceso es documentado, medido, evaluado y mejorado de manera sistemática. Los laboratorios que han recorrido ese camino reportan mejoras concretas en la calidad de sus resultados, en la satisfacción de sus clientes y en la motivación de su personal. La norma es un medio, no un fin.",
    ],
    vocab: [
      { es: "acreditación", pt: "acreditação" }, { es: "norma ISO 15189", pt: "norma ISO 15189" },
      { es: "requisito técnico", pt: "requisito técnico" }, { es: "revisión por la dirección", pt: "análise crítica pela direção" },
      { es: "mejora continua", pt: "melhoria contínua" }, { es: "evaluación de pares", pt: "avaliação por pares" },
    ],
    quiz: [
      { question: "¿Para qué tipo de laboratorio fue diseñada específicamente la ISO 15189?", options: ["Para laboratorios industriales de control de calidad", "Para laboratorios clínicos médicos específicamente", "Para laboratorios ambientales", "Para cualquier tipo de laboratorio de ensayo"], answer: "Para laboratorios clínicos médicos específicamente" },
      { question: "¿Cuáles son los dos grandes bloques de requisitos de la ISO 15189?", options: ["Recursos humanos y equipamiento", "Requisitos de gestión y requisitos técnicos", "Documentación y control de calidad", "Procesos analíticos y postanalíticos"], answer: "Requisitos de gestión y requisitos técnicos" },
      { question: "¿Cuál es el concepto central de la ISO 15189 diferenciador?", options: ["La rentabilidad del laboratorio", "El enfoque en el paciente como actor clave de la cadena de atención", "La velocidad de procesamiento", "La reducción de costos operativos"], answer: "El enfoque en el paciente como actor clave de la cadena de atención" },
      { question: "¿Qué diferencia la acreditación ISO 15189 de la certificación ISO 9001?", options: ["Son equivalentes y se usan indistintamente", "La 15189 evalúa competencia técnica específica; la 9001 solo el sistema de gestión", "La 9001 es más exigente técnicamente", "Solo difieren en el costo del proceso"], answer: "La 15189 evalúa competencia técnica específica; la 9001 solo el sistema de gestión" },
      { question: "¿Quiénes son los evaluadores en una acreditación ISO 15189?", options: ["Auditores financieros generales", "Profesionales con experiencia en laboratorio clínico", "Funcionarios del gobierno de salud", "Solo personal del organismo acreditador sin experiencia técnica"], answer: "Profesionales con experiencia en laboratorio clínico" },
      { question: "¿Qué exige la norma respecto a los resultados críticos?", options: ["Incluirlos solo en el informe impreso", "Informarlos de manera oportuna al médico", "Solo documentarlos internamente", "Repetirlos antes de comunicarlos"], answer: "Informarlos de manera oportuna al médico" },
      { question: "¿Qué reportan los laboratorios que implementan ISO 15189?", options: ["Solo mejoras en documentación formal", "Mejoras en calidad, satisfacción del cliente y motivación del personal", "Solo reducción de costos operativos", "Solo mejoras en tiempos de respuesta"], answer: "Mejoras en calidad, satisfacción del cliente y motivación del personal" },
      { question: "¿La ISO 15189 es un fin en sí misma?", options: ["Sí, cumplirla es el objetivo principal", "No, es un medio para adoptar una cultura de mejora continua", "Sí, el certificado es lo que importa", "Depende del tipo de laboratorio"], answer: "No, es un medio para adoptar una cultura de mejora continua" },
    ],
    dictation: "La ISO 15189 establece requisitos de calidad y competencia para laboratorios clínicos con enfoque en el paciente y en la mejora continua.",
  },
  {
    id: "gestion-riesgos", title: "Gestión de riesgos", level: "Avanzado", category: "Gestión", emoji: "⚡",
    description: "Identificación, evaluación y mitigación de riesgos en el laboratorio.",
    readingTitle: "Antes de que ocurra",
    reading: [
      "La gestión de riesgos en el laboratorio clínico es el conjunto de actividades sistemáticas para identificar qué puede salir mal, evaluar qué tan probable y grave sería si ocurriera, y decidir qué hacer para reducir esa probabilidad o ese impacto. No se trata de eliminar todos los riesgos, porque eso sería imposible: se trata de gestionarlos de forma consciente y priorizada.",
      "El proceso comienza con la identificación de riesgos. Esta actividad debe involucrar al personal que trabaja directamente en los procesos, porque son ellos quienes conocen los puntos donde algo puede fallar. Algunas técnicas útiles son la lluvia de ideas estructurada, el análisis de incidentes pasados, el análisis de modo de falla y efecto (AMFE) y la revisión de alertas de seguridad de proveedores y organismos reguladores.",
      "Una vez identificados los riesgos, se los evalúa en dos dimensiones: probabilidad de ocurrencia y severidad del impacto. El producto de ambas dimensiones da una estimación del nivel de riesgo. Los riesgos de alta probabilidad y alto impacto son prioritarios e inaceptables sin controles. Los de baja probabilidad y bajo impacto pueden monitorearse sin acción inmediata. La matriz de riesgo es la herramienta visual más utilizada para esta evaluación.",
      "Para cada riesgo significativo se definen controles o barreras. Un control puede ser preventivo, si actúa reduciendo la probabilidad de que el evento ocurra, o mitigador, si actúa reduciendo el impacto cuando ya ocurrió. Lo ideal es tener controles en ambas dimensiones. Por ejemplo, ante el riesgo de error de identificación de muestras, un control preventivo es el sistema de código de barras; un control mitigador es la revisión de coherencia antes de liberar resultados.",
      "La gestión de riesgos no es un evento puntual: es un proceso continuo que debe revisarse periódicamente y actualizarse cuando se incorporan nuevos procesos, equipos o personal. Los eventos adversos y los incidentes casi adversos son fuentes de información muy valiosas porque revelan dónde fallaron los controles existentes. Un laboratorio que aprende de sus incidentes y actualiza su mapa de riesgos en consecuencia está practicando gestión de riesgos de verdad.",
    ],
    vocab: [
      { es: "riesgo", pt: "risco" }, { es: "probabilidad de ocurrencia", pt: "probabilidade de ocorrência" },
      { es: "severidad del impacto", pt: "severidade do impacto" }, { es: "matriz de riesgo", pt: "matriz de risco" },
      { es: "control preventivo", pt: "controle preventivo" }, { es: "AMFE", pt: "AMFE (Análise de Modo de Falha e Efeito)" },
    ],
    quiz: [
      { question: "¿Cuál es el objetivo de la gestión de riesgos?", options: ["Eliminar absolutamente todos los riesgos posibles", "Gestionar los riesgos de forma consciente y priorizada", "Solo documentar los incidentes ocurridos", "Reducir los costos del laboratorio"], answer: "Gestionar los riesgos de forma consciente y priorizada" },
      { question: "¿Por qué debe involucrar al personal operativo la identificación de riesgos?", options: ["Por requisito formal de la norma", "Porque conocen directamente los puntos donde algo puede fallar", "Para motivarlos con actividades nuevas", "Solo para cumplir con el procedimiento"], answer: "Porque conocen directamente los puntos donde algo puede fallar" },
      { question: "¿Qué dos dimensiones evalúa la matriz de riesgo?", options: ["Costo y tiempo de resolución", "Probabilidad de ocurrencia y severidad del impacto", "Frecuencia histórica y personal involucrado", "Tipo de proceso y área responsable"], answer: "Probabilidad de ocurrencia y severidad del impacto" },
      { question: "¿Qué tipo de control actúa reduciendo la probabilidad del evento?", options: ["Control mitigador", "Control preventivo", "Control correctivo", "Control detectivo"], answer: "Control preventivo" },
      { question: "¿Qué tipo de control actúa reduciendo el impacto cuando el evento ya ocurrió?", options: ["Control preventivo", "Control mitigador", "Control documental", "Control de calibración"], answer: "Control mitigador" },
      { question: "¿Qué es el AMFE?", options: ["Una norma de acreditación", "Análisis de modo de falla y efecto para identificar riesgos sistemáticamente", "Un indicador de calidad", "Un tipo de auditoría externa"], answer: "Análisis de modo de falla y efecto para identificar riesgos sistemáticamente" },
      { question: "¿Cuándo debe revisarse el mapa de riesgos?", options: ["Solo cuando ocurre un incidente grave", "Periódicamente y cuando se incorporan nuevos procesos, equipos o personal", "Solo una vez al año en la revisión por la dirección", "Solo cuando lo pide el organismo acreditador"], answer: "Periódicamente y cuando se incorporan nuevos procesos, equipos o personal" },
      { question: "¿Qué revelan los incidentes casi adversos?", options: ["Que el sistema de calidad no funciona", "Dónde fallaron los controles existentes, siendo fuente de mejora", "Que el personal no está capacitado", "Solo estadísticas de seguridad"], answer: "Dónde fallaron los controles existentes, siendo fuente de mejora" },
    ],
    dictation: "La gestión de riesgos evalúa la probabilidad y el impacto de cada evento para priorizar controles preventivos y mitigadores.",
  },
  {
    id: "documentacion", title: "Documentación y procedimientos", level: "Básico", category: "Gestión", emoji: "📝",
    description: "Gestión documental, procedimientos operativos y control de versiones.",
    readingTitle: "Si no está escrito, no existe",
    reading: [
      "En un sistema de calidad, hay una premisa fundamental: si algo no está documentado, desde el punto de vista de la calidad, no existe. Esto no significa que el conocimiento no exista en la cabeza del analista más experimentado, sino que ese conocimiento no es transferible, verificable ni reproducible de forma confiable por otras personas o en otras circunstancias. La documentación transforma el conocimiento individual en conocimiento institucional.",
      "Los documentos de un sistema de calidad se organizan en una jerarquía. En el nivel superior están los documentos estratégicos como el manual de calidad, que describe los compromisos y políticas generales de la organización. En el nivel intermedio están los procedimientos, que describen cómo se realiza cada proceso de forma general. En el nivel operativo están las instrucciones de trabajo, que describen paso a paso cómo ejecutar una tarea específica.",
      "Los procedimientos operativos estándar, conocidos como POE o SOP por sus siglas en inglés, son el corazón de la documentación técnica del laboratorio. Un POE bien redactado debe responder claramente a las siguientes preguntas: ¿qué se hace?, ¿quién lo hace?, ¿cuándo se hace?, ¿con qué materiales y equipos?, ¿cómo se hace paso a paso?, ¿qué se hace cuando algo sale mal? y ¿cómo se registra?",
      "El control de versiones es un aspecto crítico de la gestión documental. Cuando un procedimiento se actualiza, la versión anterior debe retirarse de circulación y archivarse como documento obsoleto. Si un analista sigue trabajando con una versión desactualizada, puede estar siguiendo instrucciones que ya no corresponden al proceso actual, lo que genera un riesgo real de error. El sistema documental debe garantizar que siempre esté disponible solo la versión vigente.",
      "La aprobación y revisión periódica de los documentos es otro requisito clave. Cada documento debe tener asignado un propietario responsable de mantenerlo actualizado. La frecuencia de revisión depende del tipo de documento y de la estabilidad del proceso que describe, pero en general los POE técnicos deben revisarse al menos cada dos años o cuando ocurre un cambio significativo en el proceso.",
    ],
    vocab: [
      { es: "procedimiento operativo estándar (POE)", pt: "procedimento operacional padrão (POP)" },
      { es: "control de versiones", pt: "controle de versão" }, { es: "documento obsoleto", pt: "documento obsoleto" },
      { es: "manual de calidad", pt: "manual da qualidade" }, { es: "instrucción de trabajo", pt: "instrução de trabalho" },
      { es: "aprobación de documentos", pt: "aprovação de documentos" },
    ],
    quiz: [
      { question: "¿Por qué se dice 'si no está escrito no existe' en calidad?", options: ["Por exigencia burocrática solamente", "Porque el conocimiento no documentado no es transferible ni verificable", "Porque los auditores no ven lo que no está escrito", "Solo aplica a resultados de análisis"], answer: "Porque el conocimiento no documentado no es transferible ni verificable" },
      { question: "¿Qué describe el manual de calidad?", options: ["Los pasos específicos de cada análisis", "Los compromisos y políticas generales de la organización", "Las instrucciones de mantenimiento de equipos", "Los registros de control interno"], answer: "Los compromisos y políticas generales de la organización" },
      { question: "¿Qué preguntas debe responder un POE bien redactado?", options: ["Solo qué se hace y quién lo hace", "Qué, quién, cuándo, con qué, cómo, qué hacer si falla y cómo registrar", "Solo cómo se hace paso a paso", "Solo quién lo hace y cuándo"], answer: "Qué, quién, cuándo, con qué, cómo, qué hacer si falla y cómo registrar" },
      { question: "¿Qué debe ocurrir con la versión anterior cuando se actualiza un procedimiento?", options: ["Puede seguir usándose hasta que se agote", "Debe retirarse de circulación y archivarse como documento obsoleto", "Solo debe anotarse la fecha de cambio", "Puede mantenerse como referencia paralela"], answer: "Debe retirarse de circulación y archivarse como documento obsoleto" },
      { question: "¿Qué riesgo genera trabajar con un procedimiento desactualizado?", options: ["Solo problemas de archivo documental", "Seguir instrucciones que ya no corresponden al proceso actual y generar errores", "Solo inconvenientes formales en auditorías", "Ningún riesgo real si el analista es experimentado"], answer: "Seguir instrucciones que ya no corresponden al proceso actual y generar errores" },
      { question: "¿Con qué frecuencia deben revisarse los POE técnicos como mínimo?", options: ["Cada cinco años o cuando se recuerde", "Al menos cada dos años o cuando ocurre un cambio significativo", "Solo cuando hay una auditoría programada", "Cada mes sin excepción"], answer: "Al menos cada dos años o cuando ocurre un cambio significativo" },
      { question: "¿Qué diferencia hay entre un procedimiento y una instrucción de trabajo?", options: ["Son sinónimos usados indistintamente", "El procedimiento describe el proceso general; la instrucción detalla paso a paso una tarea específica", "La instrucción es más estratégica que el procedimiento", "Solo difieren en el formato del documento"], answer: "El procedimiento describe el proceso general; la instrucción detalla paso a paso una tarea específica" },
      { question: "¿Qué transforma la documentación según el texto?", options: ["El conocimiento individual en conocimiento institucional transferible", "Los procedimientos en resultados analíticos", "Los errores en oportunidades de mejora", "Los datos en información clínica"], answer: "El conocimiento individual en conocimiento institucional transferible" },
    ],
    dictation: "Un procedimiento operativo estándar bien redactado responde qué se hace, quién lo hace, cómo se hace y qué se hace cuando algo sale mal.",
  },
  // ══ COMUNICACIÓN (nuevos) ══
  {
    id: "llamada-urgente", title: "Llamada urgente al médico", level: "Intermedio", category: "Comunicación", emoji: "🚨",
    description: "Protocolo y lenguaje para comunicar resultados críticos por teléfono.",
    readingTitle: "La llamada que no puede esperar",
    reading: [
      "Hay resultados de laboratorio que no pueden esperar a que el médico revise el informe en el sistema. Son los llamados valores críticos o de pánico: resultados tan extremos que indican una amenaza inmediata para la vida del paciente y que requieren comunicación verbal directa con el médico o con el responsable del cuidado del paciente. El protocolo de comunicación de valores críticos es uno de los procedimientos más importantes del laboratorio.",
      "La lista de valores críticos varía según el tipo de laboratorio, la población que atiende y las guías de las sociedades científicas relevantes. Algunos ejemplos universalmente aceptados son: glucosa menor a 40 mg/dL o mayor a 500 mg/dL, potasio menor a 2.5 o mayor a 6.5 mEq/L, hemoglobina menor a 7 g/dL en adultos, recuento de plaquetas menor a 20.000 o mayor a un millón por microlitro, y troponina muy elevada en contexto agudo.",
      "El procedimiento estándar para comunicar un valor crítico implica varios pasos específicos. El analista debe verificar el resultado antes de llamar, confirmando la identidad de la muestra y descartando errores preanalíticos como hemólisis que puedan explicar falsamente el valor. Luego llama al médico solicitante o, si no está disponible, al médico responsable del paciente o al servicio de guardia. Debe identificarse con nombre y cargo.",
      "Durante la llamada, el analista comunica el nombre del paciente, el número de muestra o solicitud, el análisis y el resultado, indica que se trata de un valor crítico, y espera confirmación verbal de que el médico recibió y entendió la información. Esa confirmación es fundamental: no alcanza con dejar un mensaje en el contestador ni enviar un correo. La comunicación debe ser en tiempo real y verificada.",
      "Todo el proceso debe quedar documentado en el registro de valores críticos: fecha y hora de detección, resultado, nombre del analista que llamó, nombre del médico que recibió la llamada, hora de la llamada y confirmación de recepción. Si no se puede contactar al médico después de varios intentos, debe escalarse siguiendo el procedimiento establecido. La trazabilidad de esa comunicación puede tener consecuencias legales y asistenciales.",
    ],
    vocab: [
      { es: "valor crítico / de pánico", pt: "valor crítico / de pânico" }, { es: "protocolo de comunicación", pt: "protocolo de comunicação" },
      { es: "escalar", pt: "escalar / acionar" }, { es: "confirmar recepción", pt: "confirmar recebimento" },
      { es: "guardia / servicio de urgencias", pt: "plantão / pronto-socorro" }, { es: "trazabilidad de comunicación", pt: "rastreabilidade da comunicação" },
    ],
    quiz: [
      { question: "¿Por qué existen los protocolos de valores críticos?", options: ["Por exigencia burocrática solamente", "Porque ciertos resultados indican amenaza inmediata para la vida y no pueden esperar", "Para reducir la carga de trabajo del analista", "Solo para cumplir con la acreditación"], answer: "Porque ciertos resultados indican amenaza inmediata para la vida y no pueden esperar" },
      { question: "¿Qué debe verificar el analista antes de llamar?", options: ["Que el médico esté en su consultorio", "El resultado y la identidad de la muestra descartando errores preanalíticos", "Solo que el resultado esté fuera de rango", "Que el sistema registró el resultado"], answer: "El resultado y la identidad de la muestra descartando errores preanalíticos" },
      { question: "¿Es suficiente dejar un mensaje de voz o correo para comunicar un valor crítico?", options: ["Sí, si queda registrado", "No, la comunicación debe ser en tiempo real y verificada verbalmente", "Sí, si es fuera del horario habitual", "Solo si el médico no tiene disponibilidad inmediata"], answer: "No, la comunicación debe ser en tiempo real y verificada verbalmente" },
      { question: "¿Qué información debe comunicar el analista durante la llamada?", options: ["Solo el resultado y el nombre del paciente", "Nombre del paciente, número de muestra, análisis, resultado y confirmación de que es valor crítico", "Solo el análisis y el resultado numérico", "Solo el nombre del paciente y su diagnóstico previo"], answer: "Nombre del paciente, número de muestra, análisis, resultado y confirmación de que es valor crítico" },
      { question: "¿Qué debe documentarse en el registro de valores críticos?", options: ["Solo la fecha y el resultado", "Fecha, hora, resultado, analista, médico contactado, hora de llamada y confirmación", "Solo el nombre del médico y el resultado", "Solo si el médico hizo algún cambio en el tratamiento"], answer: "Fecha, hora, resultado, analista, médico contactado, hora de llamada y confirmación" },
      { question: "¿Qué se hace si no se puede contactar al médico solicitante?", options: ["Se deja el resultado en el sistema y se espera", "Se escala siguiendo el procedimiento: médico responsable, guardia o supervisor", "Se cancela el resultado hasta que el médico llame", "Se informa al día siguiente en el informe"], answer: "Se escala siguiendo el procedimiento: médico responsable, guardia o supervisor" },
      { question: "¿Es un valor crítico de glucosa 300 mg/dL?", options: ["Sí, siempre es crítico", "No, el rango crítico típico es menor a 40 o mayor a 500 mg/dL", "Depende solo de la edad del paciente", "Sí, cualquier glucosa elevada es crítica"], answer: "No, el rango crítico típico es menor a 40 o mayor a 500 mg/dL" },
      { question: "¿Por qué la trazabilidad de la comunicación puede tener consecuencias legales?", options: ["Solo por requisito de la norma de calidad", "Porque documenta si se actuó correctamente ante una emergencia clínica", "Solo si el paciente hace una queja formal", "No tiene consecuencias legales reales"], answer: "Porque documenta si se actuó correctamente ante una emergencia clínica" },
    ],
    dictation: "La comunicación de valores críticos debe ser verbal, en tiempo real, verificada y documentada con nombre, hora y confirmación del médico.",
  },
  {
    id: "presentaciones", title: "Presentaciones técnicas", level: "Intermedio", category: "Comunicación", emoji: "📊",
    description: "Estructura y lenguaje para presentar datos e informes técnicos en español.",
    readingTitle: "Los datos que hablan solos",
    reading: [
      "Una presentación técnica es mucho más que mostrar diapositivas con datos y gráficos. Es la oportunidad de transformar información compleja en una narrativa clara que guíe al oyente desde el problema hasta la solución, desde los datos hasta las conclusiones, desde el análisis hasta la acción. El español técnico tiene sus propias convenciones para estructurar este tipo de comunicación.",
      "La estructura básica de una presentación técnica efectiva sigue una lógica narrativa de cuatro partes. La primera es el contexto: ¿por qué existe esta presentación? ¿Qué problema o pregunta motiva el análisis? La segunda es el desarrollo: los datos, el análisis y los hallazgos. La tercera es la conclusión: ¿qué dicen los datos? ¿Qué respuesta dan a la pregunta inicial? La cuarta es la recomendación o próximo paso: ¿qué debería hacerse con esta información?",
      "El lenguaje de las presentaciones técnicas en español tiene fórmulas específicas que conviene conocer. Para introducir el tema: 'El objetivo de esta presentación es...', 'Voy a presentarles los resultados de...'. Para presentar datos: 'Como puede observarse en este gráfico...', 'Los datos muestran que...', 'Cabe destacar que...'. Para transitar entre secciones: 'Pasando ahora a...', 'En cuanto a...', 'A continuación veremos...'. Para concluir: 'En resumen...', 'Como conclusión...', 'Esto nos lleva a recomendar...'.",
      "Los gráficos y tablas son herramientas poderosas si se usan bien. Cada elemento visual debe tener un título claro, fuentes identificadas si los datos son externos, y los ejes o columnas perfectamente etiquetados. Antes de mostrar un gráfico, el presentador debe anticipar al oyente qué está a punto de ver y qué debe buscar. Después de mostrarlo, debe señalar explícitamente el hallazgo principal, sin asumir que el oyente lo identificó solo.",
      "El manejo de preguntas es una de las partes más desafiantes de una presentación técnica en un segundo idioma. Algunas frases útiles para ganar tiempo: 'Es una pregunta muy pertinente...', 'Déjenme asegurarme de entender bien la pregunta...'. Para pedir aclaración: '¿Podría reformular la pregunta?', '¿Se refiere específicamente a...?'. Para respuestas que requieren más información: 'No tengo ese dato aquí pero puedo verificarlo y enviarlo después de la reunión.'",
    ],
    vocab: [
      { es: "diapositiva", pt: "slide" }, { es: "hallazgo", pt: "achado / constatação" },
      { es: "gráfico / tabla", pt: "gráfico / tabela" }, { es: "conclusión", pt: "conclusão" },
      { es: "próximo paso", pt: "próximo passo" }, { es: "cabe destacar", pt: "cabe destacar / vale ressaltar" },
    ],
    quiz: [
      { question: "¿Cuáles son las cuatro partes de una presentación técnica efectiva?", options: ["Introducción, datos, cierre y preguntas", "Contexto, desarrollo, conclusión y recomendación", "Objetivo, metodología, resultados y bibliografía", "Problema, solución, evidencia y resumen"], answer: "Contexto, desarrollo, conclusión y recomendación" },
      { question: "¿Cómo se introduce el tema en una presentación en español?", options: ["Comenzando directamente con los datos", "Con frases como 'El objetivo de esta presentación es...' o 'Voy a presentarles...'", "Con un agradecimiento al público siempre", "Con una pregunta retórica obligatoriamente"], answer: "Con frases como 'El objetivo de esta presentación es...' o 'Voy a presentarles...'" },
      { question: "¿Cómo se anticipa un gráfico correctamente?", options: ["Solo mostrándolo sin comentario previo", "Diciendo al oyente qué está a punto de ver y qué debe buscar", "Leyendo todos los datos del gráfico en voz alta", "Solo con un título grande en la diapositiva"], answer: "Diciendo al oyente qué está a punto de ver y qué debe buscar" },
      { question: "¿Qué frase sirve para transitar entre secciones?", options: ["'En resumen...' o 'Como conclusión...'", "'Pasando ahora a...' o 'En cuanto a...' o 'A continuación veremos...'", "'El objetivo es...' o 'Voy a presentar...'", "'Como puede observarse...' o 'Los datos muestran...'"], answer: "'Pasando ahora a...' o 'En cuanto a...' o 'A continuación veremos...'" },
      { question: "¿Cómo se puede ganar tiempo al recibir una pregunta difícil?", options: ["Respondiendo directamente aunque no se sepa", "Con frases como 'Es una pregunta muy pertinente...' o 'Déjenme asegurarme de entender bien...'", "Ignorando la pregunta y continuando", "Diciendo que el tiempo se acabó"], answer: "Con frases como 'Es una pregunta muy pertinente...' o 'Déjenme asegurarme de entender bien...'" },
      { question: "¿Qué debe incluir un gráfico técnico bien elaborado?", options: ["Solo los datos más importantes", "Título claro, fuentes identificadas y ejes perfectamente etiquetados", "Solo el título y los colores del laboratorio", "Solo los números sin contexto visual"], answer: "Título claro, fuentes identificadas y ejes perfectamente etiquetados" },
      { question: "¿Qué se dice cuando no se tiene el dato que pidieron?", options: ["Se inventa un dato aproximado", "'No tengo ese dato aquí pero puedo verificarlo y enviarlo después'", "'Esa pregunta no corresponde a esta presentación'", "Se ignora la pregunta"], answer: "'No tengo ese dato aquí pero puedo verificarlo y enviarlo después'" },
      { question: "¿Qué transforma una presentación de datos en una narrativa efectiva?", options: ["Usar muchas diapositivas y colores llamativos", "Una estructura lógica que guía desde el problema hasta la acción", "Hablar rápido para cubrir más información", "Leer exactamente lo que dice cada diapositiva"], answer: "Una estructura lógica que guía desde el problema hasta la acción" },
    ],
    dictation: "Una presentación técnica efectiva tiene contexto, desarrollo, conclusión y recomendación, y usa fórmulas específicas del español formal.",
  },
  // ══ TECNOLOGÍA (nuevos) ══
  {
    id: "backup", title: "Backup y recuperación", level: "Intermedio", category: "Tecnología", emoji: "💾",
    description: "Estrategias de respaldo de datos y planes de recuperación ante desastres.",
    readingTitle: "El día que todo se borró",
    reading: [
      "Un viernes por la tarde, después de una tormenta eléctrica que afectó la zona industrial donde estaba ubicado el laboratorio, el servidor principal dejó de responder. Cuando el técnico de TI llegó al día siguiente, confirmó lo que todos temían: el disco duro del servidor había fallado por una sobretensión y los datos de las últimas tres semanas, incluyendo todos los resultados de pacientes del período, habían sido perdidos. El laboratorio no tenía una estrategia de backup actualizada.",
      "Un backup o copia de seguridad es una copia de los datos críticos almacenada en un lugar diferente al original, de manera que si el original falla o se corrompe, los datos pueden recuperarse. La frecuencia del backup, el tipo de backup y el lugar donde se almacena la copia son los tres parámetros fundamentales de cualquier estrategia de respaldo.",
      "Existen tres tipos principales de backup. El backup completo copia todos los datos seleccionados en cada ejecución: es el más sencillo de restaurar pero el que más espacio y tiempo consume. El backup incremental copia solo los datos que cambiaron desde el último backup (completo o incremental): es rápido pero la restauración requiere aplicar todos los incrementales en orden. El backup diferencial copia todo lo que cambió desde el último backup completo: equilibra velocidad y simplicidad de restauración.",
      "La regla 3-2-1 es el estándar de buenas prácticas en backup: mantener tres copias de los datos, en dos tipos de medios diferentes, con una copia en una ubicación geográfica diferente. Hoy en día, esa tercera copia en ubicación diferente suele ser la nube. Los servicios de almacenamiento en la nube para entornos empresariales ofrecen redundancia, cifrado y acceso desde cualquier lugar.",
      "Pero un backup sin prueba de recuperación no es un backup confiable. Es habitual que los laboratorios realicen backups regularmente y descubran que no pueden restaurarlos cuando los necesitan, porque el proceso de restauración nunca fue probado. Las pruebas periódicas de recuperación, en las que se restaura el backup en un ambiente de prueba y se verifica la integridad de los datos, son tan importantes como el backup mismo.",
    ],
    vocab: [
      { es: "copia de seguridad / backup", pt: "backup / cópia de segurança" }, { es: "restauración", pt: "restauração" },
      { es: "backup incremental", pt: "backup incremental" }, { es: "regla 3-2-1", pt: "regra 3-2-1" },
      { es: "almacenamiento en la nube", pt: "armazenamento em nuvem" }, { es: "integridad de datos", pt: "integridade de dados" },
    ],
    quiz: [
      { question: "¿Qué es un backup?", options: ["Un sistema de antivirus", "Una copia de los datos críticos almacenada en un lugar diferente al original", "Un programa para acelerar el servidor", "Un tipo de base de datos especial"], answer: "Una copia de los datos críticos almacenada en un lugar diferente al original" },
      { question: "¿Qué copia el backup incremental?", options: ["Todos los datos en cada ejecución", "Solo los datos que cambiaron desde el último backup", "Solo los datos del último mes", "Una muestra aleatoria de los datos"], answer: "Solo los datos que cambiaron desde el último backup" },
      { question: "¿Qué establece la regla 3-2-1?", options: ["3 servidores, 2 técnicos, 1 contraseña", "3 copias en 2 tipos de medios con 1 copia en ubicación geográfica diferente", "3 backups diarios, 2 semanales, 1 mensual", "Backup cada 3 horas, revisión cada 2 días, restauración cada mes"], answer: "3 copias en 2 tipos de medios con 1 copia en ubicación geográfica diferente" },
      { question: "¿Qué diferencia hay entre backup incremental y diferencial?", options: ["Son exactamente iguales", "El incremental copia desde el último backup de cualquier tipo; el diferencial desde el último completo", "El diferencial es más lento de realizar", "Solo difieren en el medio de almacenamiento"], answer: "El incremental copia desde el último backup de cualquier tipo; el diferencial desde el último completo" },
      { question: "¿Por qué un backup sin prueba de recuperación no es confiable?", options: ["Porque los datos se corrompen automáticamente", "Porque puede ser imposible restaurarlo cuando se necesita sin haberlo probado antes", "Porque los auditores lo exigen", "Solo por una cuestión de procedimiento formal"], answer: "Porque puede ser imposible restaurarlo cuando se necesita sin haberlo probado antes" },
      { question: "¿Qué tipo de backup es más sencillo de restaurar?", options: ["El incremental", "El diferencial", "El completo", "El basado en snapshots"], answer: "El completo" },
      { question: "¿Qué ventaja ofrece la nube como destino de backup?", options: ["Es siempre más barata que los medios físicos", "Ofrece redundancia, cifrado y acceso desde cualquier lugar", "Elimina la necesidad de backups locales", "Solo sirve para datos no críticos"], answer: "Ofrece redundancia, cifrado y acceso desde cualquier lugar" },
      { question: "¿Cuándo se descubrió que no había backup actualizado en el caso del texto?", options: ["Durante la auditoría anual", "Cuando el servidor falló y se perdieron los datos de tres semanas", "Antes del incidente por una alerta preventiva", "Durante una prueba de recuperación rutinaria"], answer: "Cuando el servidor falló y se perdieron los datos de tres semanas" },
    ],
    dictation: "La regla 3-2-1 establece mantener tres copias de los datos en dos tipos de medios con una copia en ubicación geográfica diferente.",
  },
  {
    id: "redes", title: "Redes y conectividad", level: "Intermedio", category: "Tecnología", emoji: "🌐",
    description: "Infraestructura de red, conectividad de equipos y resolución de problemas.",
    readingTitle: "Cuando los equipos no se hablan",
    reading: [
      "La infraestructura de red es el sistema nervioso del laboratorio moderno. Sin una red estable y bien configurada, los equipos analíticos no pueden enviar resultados al LIMS, los analistas no pueden acceder al sistema de gestión, y los clientes no pueden recibir sus informes. A pesar de su importancia crítica, la red suele ser un componente invisible que solo recibe atención cuando falla.",
      "Una red de laboratorio típica incluye varios componentes físicos y lógicos. Los switches conectan los dispositivos dentro del laboratorio y gestionan el tráfico de datos entre ellos. El router conecta la red interna del laboratorio con el exterior, ya sea internet o la red del hospital. Los cables de red o las conexiones inalámbricas son el medio físico de transmisión. Los firewalls protegen la red de accesos no autorizados desde el exterior.",
      "La segmentación de la red es una práctica importante en laboratorios con equipos médicos conectados. Consiste en dividir la red en zonas separadas según el tipo de dispositivo y el nivel de seguridad requerido. Los equipos analíticos críticos pueden estar en un segmento separado del resto de la red administrativa, lo que limita el impacto de un incidente de seguridad en un segmento sobre el otro.",
      "Cuando un analista reporta que un equipo no puede conectarse al LIMS, el diagnóstico comienza con preguntas básicas: ¿el problema afecta a todos los equipos o solo a uno? ¿El cable está conectado físicamente? ¿El equipo tiene dirección IP asignada correctamente? ¿El servidor del LIMS está accesible desde otros dispositivos? Este proceso de descarte sistemático es mucho más eficiente que intentar soluciones al azar.",
      "El monitoreo proactivo de la red es una práctica que permite detectar problemas antes de que afecten a los usuarios. Herramientas de monitoreo de red pueden alertar automáticamente cuando un dispositivo pierde conectividad, cuando el uso del ancho de banda supera un umbral o cuando la latencia entre dos puntos aumenta de forma anormal. Esas alertas tempranas permiten actuar antes de que el problema sea percibido por el personal de laboratorio.",
    ],
    vocab: [
      { es: "red / infraestructura de red", pt: "rede / infraestrutura de rede" }, { es: "switch / router", pt: "switch / roteador" },
      { es: "dirección IP", pt: "endereço IP" }, { es: "firewall", pt: "firewall" },
      { es: "ancho de banda", pt: "largura de banda" }, { es: "latencia", pt: "latência" },
    ],
    quiz: [
      { question: "¿Por qué la red es el 'sistema nervioso' del laboratorio moderno?", options: ["Porque es el componente más caro", "Porque sin ella los equipos no pueden comunicarse con el LIMS ni los clientes recibir informes", "Porque es lo más visible de la infraestructura", "Solo por una metáfora técnica sin implicaciones reales"], answer: "Porque sin ella los equipos no pueden comunicarse con el LIMS ni los clientes recibir informes" },
      { question: "¿Qué hace un switch en la red del laboratorio?", options: ["Conecta el laboratorio con internet", "Conecta los dispositivos internos y gestiona el tráfico de datos entre ellos", "Protege contra accesos no autorizados", "Asigna direcciones IP automáticamente"], answer: "Conecta los dispositivos internos y gestiona el tráfico de datos entre ellos" },
      { question: "¿Qué es la segmentación de red?", options: ["Dividir el ancho de banda entre usuarios", "Separar la red en zonas según tipo de dispositivo y nivel de seguridad", "Instalar múltiples routers en paralelo", "Limitar la velocidad de ciertos dispositivos"], answer: "Separar la red en zonas según tipo de dispositivo y nivel de seguridad" },
      { question: "¿Cuál es el primer paso diagnóstico ante un problema de conectividad?", options: ["Reiniciar todos los equipos de la red", "Determinar si el problema afecta a todos o solo a un dispositivo específico", "Llamar al proveedor de internet", "Reinstalar el software de red"], answer: "Determinar si el problema afecta a todos o solo a un dispositivo específico" },
      { question: "¿Qué protege el firewall?", options: ["Los datos ante fallos del disco duro", "La red de accesos no autorizados desde el exterior", "Los equipos de sobretensiones eléctricas", "Los cables de daños físicos"], answer: "La red de accesos no autorizados desde el exterior" },
      { question: "¿Qué ventaja tiene el monitoreo proactivo de red?", options: ["Elimina la necesidad de técnicos de TI", "Permite detectar problemas antes de que afecten a los usuarios", "Aumenta automáticamente el ancho de banda", "Reemplaza al firewall en la seguridad"], answer: "Permite detectar problemas antes de que afecten a los usuarios" },
      { question: "¿Qué verifica el técnico al diagnosticar un problema de conectividad?", options: ["Solo que el cable esté conectado", "Cable físico, dirección IP correcta y accesibilidad del servidor desde otros dispositivos", "Solo que el LIMS esté funcionando", "Solo la configuración del firewall"], answer: "Cable físico, dirección IP correcta y accesibilidad del servidor desde otros dispositivos" },
      { question: "¿Por qué la red suele recibir atención solo cuando falla?", options: ["Porque es un componente secundario del laboratorio", "Porque es un componente invisible cuando funciona correctamente", "Porque es muy difícil de monitorear de forma proactiva", "Porque el personal de TI tiene otras prioridades"], answer: "Porque es un componente invisible cuando funciona correctamente" },
    ],
    dictation: "La infraestructura de red conecta los equipos analíticos con el LIMS y debe monitorearse proactivamente para detectar problemas antes de que afecten al laboratorio.",
  },
  {
    id: "base-datos", title: "Base de datos del laboratorio", level: "Avanzado", category: "Tecnología", emoji: "🗄️",
    description: "Gestión, consultas y mantenimiento de bases de datos en entornos de laboratorio.",
    readingTitle: "El orden detrás de los datos",
    reading: [
      "Cada resultado que produce el laboratorio forma parte de una base de datos. Detrás de la interfaz visual del LIMS o del sistema de gestión existe una estructura de tablas relacionadas que almacena millones de registros: pacientes, muestras, análisis, resultados, controles, usuarios, equipos y registros de auditoría. Entender los conceptos básicos de cómo funciona esa base de datos es fundamental para cualquier profesional que trabaje con sistemas de información en el laboratorio.",
      "Las bases de datos relacionales, que son las más usadas en sistemas de laboratorio, organizan los datos en tablas con filas y columnas. Cada tabla almacena un tipo específico de información: una tabla de pacientes, una tabla de muestras, una tabla de resultados. Las tablas se relacionan entre sí mediante claves: la clave primaria identifica de forma única cada registro dentro de su tabla, y la clave foránea establece la relación con otra tabla.",
      "El lenguaje SQL (Structured Query Language) es la herramienta estándar para interactuar con bases de datos relacionales. Con SQL se pueden hacer consultas para extraer datos, inserciones para agregar registros nuevos, actualizaciones para modificar datos existentes y eliminaciones. Una consulta SQL básica para obtener los resultados de un paciente específico podría ser: SELECT análisis, resultado, fecha FROM resultados WHERE paciente_id = 12345.",
      "El mantenimiento de la base de datos incluye actividades como la depuración de registros duplicados, el archivado de datos históricos para mantener el rendimiento del sistema, la verificación de la integridad referencial (que no existan resultados sin muestra asociada, por ejemplo), y las actualizaciones periódicas del sistema gestor.",
      "La seguridad de la base de datos tiene múltiples capas. A nivel de red, el servidor de base de datos no debería estar accesible directamente desde internet. A nivel de aplicación, cada usuario del sistema debería tener solo los permisos necesarios para su rol. A nivel de datos, la información sensible de los pacientes debería estar cifrada en reposo. Y a nivel de auditoría, todas las operaciones de lectura, escritura y modificación deberían quedar registradas con usuario y marca de tiempo.",
    ],
    vocab: [
      { es: "base de datos relacional", pt: "banco de dados relacional" }, { es: "tabla / registro", pt: "tabela / registro" },
      { es: "clave primaria", pt: "chave primária" }, { es: "consulta SQL", pt: "consulta SQL" },
      { es: "integridad referencial", pt: "integridade referencial" }, { es: "cifrado en reposo", pt: "criptografia em repouso" },
    ],
    quiz: [
      { question: "¿Cómo se organizan los datos en una base de datos relacional?", options: ["En archivos de texto plano", "En tablas con filas y columnas relacionadas entre sí por claves", "En documentos XML independientes", "En carpetas jerárquicas por fecha"], answer: "En tablas con filas y columnas relacionadas entre sí por claves" },
      { question: "¿Qué es la clave primaria?", options: ["La contraseña del administrador", "El identificador único de cada registro dentro de su tabla", "El nombre del campo más importante", "El primer campo de cada tabla"], answer: "El identificador único de cada registro dentro de su tabla" },
      { question: "¿Qué lenguaje se usa para interactuar con bases de datos relacionales?", options: ["HTML", "Python exclusivamente", "SQL (Structured Query Language)", "XML"], answer: "SQL (Structured Query Language)" },
      { question: "¿Qué hace la instrucción SELECT en SQL?", options: ["Elimina registros de la tabla", "Extrae y muestra datos que cumplen una condición", "Crea una nueva tabla", "Actualiza registros existentes"], answer: "Extrae y muestra datos que cumplen una condición" },
      { question: "¿Qué verifica la integridad referencial?", options: ["Que las contraseñas sean seguras", "Que no existan registros huérfanos sin su referencia obligatoria", "Que los datos estén cifrados", "Que los backups estén actualizados"], answer: "Que no existan registros huérfanos sin su referencia obligatoria" },
      { question: "¿Por qué el servidor de base de datos no debería ser accesible directamente desde internet?", options: ["Por razones de velocidad de conexión", "Para proteger los datos sensibles de los pacientes de accesos externos no autorizados", "Porque los servidores no tienen conexión a internet", "Solo por requisito formal de seguridad"], answer: "Para proteger los datos sensibles de los pacientes de accesos externos no autorizados" },
      { question: "¿Qué incluye el mantenimiento de la base de datos?", options: ["Solo hacer backups periódicos", "Depuración de duplicados, archivado histórico, verificación de integridad y actualizaciones", "Solo actualizar el sistema operativo del servidor", "Solo verificar que el espacio en disco sea suficiente"], answer: "Depuración de duplicados, archivado histórico, verificación de integridad y actualizaciones" },
      { question: "¿Qué debe quedar registrado en la auditoría de base de datos?", options: ["Solo los errores del sistema", "Todas las operaciones de lectura, escritura y modificación con usuario y marca de tiempo", "Solo las modificaciones de datos de pacientes", "Solo las consultas del administrador"], answer: "Todas las operaciones de lectura, escritura y modificación con usuario y marca de tiempo" },
    ],
    dictation: "Las bases de datos relacionales organizan los datos en tablas conectadas por claves y se consultan mediante el lenguaje SQL.",
  },
  // ══ GRAMÁTICA (nuevos) ══
  {
    id: "preterito", title: "Pretérito perfecto e indefinido", level: "Intermedio", category: "Gramática", emoji: "⏰",
    description: "Los dos pasados más importantes del español y cuándo usar cada uno.",
    readingTitle: "Lo que ya ocurrió: ¿cuándo y cómo contarlo?",
    reading: [
      "El español tiene dos tiempos verbales que expresan acciones pasadas y que a menudo generan confusión en hablantes de portugués: el pretérito perfecto compuesto (he hecho, ha ocurrido, hemos revisado) y el pretérito perfecto simple o indefinido (hice, ocurrió, revisamos). En portugués también existen ambas formas, pero su uso no coincide exactamente con el español, lo que genera errores frecuentes.",
      "El pretérito perfecto compuesto (con haber + participio) se usa para acciones pasadas que tienen una conexión con el presente. Puede ser porque ocurrieron en un período de tiempo que todavía no ha terminado ('Esta semana hemos recibido tres muestras rechazadas'), porque sus resultados o efectos siguen siendo relevantes ahora ('El equipo ha fallado dos veces este mes'), o porque el hablante las siente como cercanas al momento presente.",
      "El pretérito indefinido se usa para acciones pasadas que el hablante percibe como terminadas y separadas del presente. Se usa con marcadores temporales de tiempo cerrado: 'ayer', 'la semana pasada', 'en 2022', 'hace tres meses'. Por ejemplo: 'Ayer el control falló en el turno de la tarde' o 'El mes pasado implementamos el nuevo procedimiento de recepción'.",
      "Hay una diferencia geográfica importante que conviene conocer: en España se usa el pretérito perfecto compuesto con mucha frecuencia para acciones recientes, incluso con marcadores como 'hoy' o 'esta mañana'. En Latinoamérica, incluida Argentina, el indefinido se usa mucho más ampliamente, incluso para acciones muy recientes. Por eso, en el contexto laboral del laboratorio en Argentina, es completamente natural decir 'hoy llegué tarde' en lugar de 'hoy he llegado tarde'.",
      "En el lenguaje técnico del laboratorio, el indefinido es el tiempo dominante para narrar incidentes y hallazgos: 'El control superó el límite de advertencia', 'El analista detectó una inconsistencia', 'El equipo rechazó la calibración'. El perfecto compuesto se usa más para informar estados actuales derivados de acciones pasadas: 'El equipo ha sido recalibrado', 'Los resultados han sido validados', 'El procedimiento ha sido actualizado'.",
    ],
    vocab: [
      { es: "pretérito perfecto compuesto", pt: "pretérito perfeito composto" }, { es: "pretérito indefinido", pt: "pretérito perfeito simples" },
      { es: "el control falló", pt: "o controle falhou" }, { es: "hemos recibido", pt: "recebemos / temos recebido" },
      { es: "fue detectado", pt: "foi detectado" }, { es: "ha sido validado", pt: "foi validado / tem sido validado" },
    ],
    quiz: [
      { question: "¿Cuándo se usa el pretérito perfecto compuesto en España?", options: ["Solo para acciones muy antiguas", "Para acciones recientes o con conexión al presente, incluso con 'hoy'", "Solo con marcadores de tiempo cerrado", "Para acciones que ocurrirán en el futuro"], answer: "Para acciones recientes o con conexión al presente, incluso con 'hoy'" },
      { question: "¿Con qué marcadores temporales se usa el indefinido?", options: ["Hoy, esta semana, este mes", "Ayer, la semana pasada, hace tres meses, en 2022", "Siempre, normalmente, a veces", "Mañana, después, en el futuro"], answer: "Ayer, la semana pasada, hace tres meses, en 2022" },
      { question: "¿Cuál es la forma correcta del pretérito indefinido de 'fallar' en tercera persona?", options: ["ha fallado", "falló", "fallaba", "falla"], answer: "falló" },
      { question: "¿Qué frase usa correctamente el pretérito perfecto compuesto?", options: ["Ayer el equipo ha fallado", "El equipo ha sido recalibrado esta mañana", "La semana pasada hemos implementado el procedimiento", "Hace un mes el control ha superado el límite"], answer: "El equipo ha sido recalibrado esta mañana" },
      { question: "¿En Latinoamérica cómo se prefiere expresar acciones recientes?", options: ["Con el pretérito perfecto compuesto siempre", "Con el indefinido, incluso para acciones del mismo día", "Con el imperfecto", "Con el presente de indicativo"], answer: "Con el indefinido, incluso para acciones del mismo día" },
      { question: "¿Qué tiempo domina en la narración de incidentes técnicos?", options: ["El presente de indicativo", "El pretérito indefinido para narrar lo que ocurrió", "El imperfecto para describir el contexto", "El futuro para indicar consecuencias"], answer: "El pretérito indefinido para narrar lo que ocurrió" },
      { question: "¿Cuál es la forma de 'haber' en pretérito perfecto para 'nosotros'?", options: ["hemos", "habemos", "habremos", "habíamos"], answer: "hemos" },
      { question: "¿Qué frase expresa un estado actual resultado de una acción pasada?", options: ["El control falló ayer", "Los resultados han sido validados", "Ayer recibimos las muestras", "La semana pasada implementamos el cambio"], answer: "Los resultados han sido validados" },
    ],
    dictation: "El pretérito indefinido narra acciones pasadas cerradas mientras que el perfecto compuesto expresa estados actuales derivados de acciones pasadas.",
  },
  {
    id: "subjuntivo", title: "Subjuntivo básico", level: "Avanzado", category: "Gramática", emoji: "🎯",
    description: "El modo subjuntivo en contextos técnicos: deseos, dudas y recomendaciones.",
    readingTitle: "El modo de lo que podría ser",
    reading: [
      "El subjuntivo es el aspecto gramatical del español que más desafíos presenta para los hablantes de portugués, no porque no exista en portugués (el subjuntivo portugués es muy rico), sino porque los contextos de uso no siempre coinciden exactamente. El subjuntivo expresa contenidos que no son afirmaciones directas sobre la realidad: deseos, dudas, posibilidades, recomendaciones, emociones y negaciones de hechos.",
      "En el contexto técnico del laboratorio, el subjuntivo aparece constantemente en recomendaciones y procedimientos. 'Se recomienda que el operador verifique los controles antes de comenzar la corrida.' 'Es necesario que la muestra llegue refrigerada.' 'Es importante que el resultado sea comunicado al médico de guardia.' La estructura es siempre la misma: una expresión impersonal o de recomendación en indicativo, seguida de 'que' y un verbo en subjuntivo.",
      "Las expresiones impersonales que exigen subjuntivo son muy frecuentes en el lenguaje técnico: es necesario que, es importante que, es conveniente que, es fundamental que, se recomienda que, se requiere que, es posible que, es probable que. Cada una de estas expresiones requiere que el verbo de la cláusula siguiente esté en subjuntivo presente.",
      "El subjuntivo también aparece con verbos de comunicación usados en forma negativa: 'No creo que el reactivo esté vencido' (duda), 'No es seguro que el resultado sea correcto' (incertidumbre). Y con expresiones temporales que hacen referencia a eventos futuros: 'Cuando llegue la muestra, verifique la temperatura', 'Hasta que el control no sea aceptable, no libere los resultados'.",
      "Un error muy frecuente de los hablantes de portugués es usar el infinitivo personal de portugués donde el español requiere el subjuntivo. En portugués es correcto decir 'é necessário verificarmos os controles', con infinitivo flexionado. En español la estructura equivalente es 'es necesario que verifiquemos los controles', con subjuntivo. El infinitivo no flexionado también existe en español ('es necesario verificar'), pero cuando hay un sujeto explícito de la acción, el subjuntivo es obligatorio.",
    ],
    vocab: [
      { es: "es necesario que + subjuntivo", pt: "é necessário que + subjuntivo" },
      { es: "se recomienda que + subjuntivo", pt: "recomenda-se que + subjuntivo" },
      { es: "cuando llegue (subjuntivo)", pt: "quando chegar (subjuntivo futuro)" },
      { es: "no creo que + subjuntivo", pt: "não acho que + subjuntivo" },
      { es: "es posible que + subjuntivo", pt: "é possível que + subjuntivo" },
      { es: "hasta que no sea", pt: "até que não seja" },
    ],
    quiz: [
      { question: "¿Cuándo se usa el subjuntivo en español?", options: ["Solo para el futuro", "Para deseos, dudas, posibilidades, recomendaciones y negaciones de hechos", "Solo en preguntas formales", "Para describir acciones pasadas"], answer: "Para deseos, dudas, posibilidades, recomendaciones y negaciones de hechos" },
      { question: "¿Qué estructura exige subjuntivo en contextos técnicos?", options: ["Expresión en indicativo + que + verbo en subjuntivo", "Solo con el verbo 'recomendar' en primera persona", "Con cualquier verbo seguido de 'que'", "Solo en oraciones negativas"], answer: "Expresión en indicativo + que + verbo en subjuntivo" },
      { question: "¿Cuál de estas expresiones exige subjuntivo?", options: ["El analista verifica que...", "Es necesario que...", "El resultado muestra que...", "El médico confirma que..."], answer: "Es necesario que..." },
      { question: "¿Cómo se dice correctamente en español 'é necessário verificarmos os controles'?", options: ["Es necesario verificaremos los controles", "Es necesario que verifiquemos los controles", "Es necesario verificar los controles nosotros", "Es necesario verificamos los controles"], answer: "Es necesario que verifiquemos los controles" },
      { question: "¿Por qué 'no creo que el reactivo esté vencido' usa subjuntivo?", options: ["Porque es una negación que expresa duda, no afirmación de un hecho", "Porque 'creer' siempre exige subjuntivo", "Solo porque es una oración negativa", "Por ninguna razón gramatical específica"], answer: "Porque es una negación que expresa duda, no afirmación de un hecho" },
      { question: "¿Cuándo usa subjuntivo la expresión temporal 'cuando'?", options: ["Siempre, en todos los contextos", "Cuando hace referencia a un evento futuro o hipotético", "Solo cuando el sujeto es diferente en las dos oraciones", "Nunca, siempre usa indicativo"], answer: "Cuando hace referencia a un evento futuro o hipotético" },
      { question: "¿Cómo se conjuga 'verificar' en subjuntivo presente para 'el analista'?", options: ["verifica", "verificará", "verifique", "verificase"], answer: "verifique" },
      { question: "¿Qué diferencia al subjuntivo del indicativo fundamentalmente?", options: ["El tiempo al que refieren", "El indicativo afirma realidades; el subjuntivo expresa subjetividad, posibilidad o dependencia", "Solo el nivel de formalidad", "El sujeto de la oración"], answer: "El indicativo afirma realidades; el subjuntivo expresa subjetividad, posibilidad o dependencia" },
    ],
    dictation: "Es necesario que el analista verifique los controles antes de procesar las muestras y que comunique cualquier desviación al supervisor.",
  },
  {
    id: "imperativo", title: "Imperativo y órdenes", level: "Intermedio", category: "Gramática", emoji: "📢",
    description: "Cómo dar instrucciones, órdenes y recomendaciones en español técnico.",
    readingTitle: "Instrucciones que se entienden",
    reading: [
      "El imperativo es el modo verbal que se usa para dar órdenes, instrucciones y recomendaciones directas. En el contexto del laboratorio, aparece constantemente en procedimientos operativos, instrucciones de equipos, protocolos de seguridad y comunicaciones internas. Saber usar el imperativo correctamente es fundamental para redactar procedimientos claros y para comunicar instrucciones de forma efectiva.",
      "En español, el imperativo tiene formas distintas según el nivel de formalidad. Para instrucciones técnicas formales, como las de un POE o una instrucción de seguridad, se usa la forma de 'usted' (tercera persona del singular) o 'ustedes' (tercera persona del plural). Estas formas son iguales al subjuntivo presente: 'Verifique el nivel del reactivo antes de comenzar', 'Coloque la muestra en posición vertical', 'Etiqueten los tubos inmediatamente'.",
      "Para instrucciones más informales o directas entre colegas, se usa la forma de 'tú' (segunda persona del singular). Esta forma es diferente para cada verbo: verbos en -ar forman el imperativo quitando la -r del infinitivo (verificar → verifica), y verbos en -er/-ir forman el imperativo igual que la tercera persona del presente de indicativo (leer → lee, escribir → escribe). Hay irregulares frecuentes: decir → di, hacer → haz, ir → ve, poner → pon.",
      "Una dificultad específica para hablantes de portugués es el uso de los pronombres con el imperativo. En español, con el imperativo afirmativo, el pronombre va siempre después del verbo y unido a él (enclítico): 'Escríbalo en el registro', 'Comuníqueselo al médico', 'Verifíquelos antes de procesar'. Con el imperativo negativo, el pronombre va antes del verbo: 'No lo escriba aún', 'No se lo comunique por correo'.",
      "En los procedimientos operativos del laboratorio, el imperativo de 'usted' en tercera persona es la convención estándar. Esto crea un texto impersonal y formal que no identifica a ningún operador específico pero da instrucciones precisas: 'Encienda el equipo y espere la señal de listo. Introduzca los controles en el orden establecido. Registre los resultados antes de continuar. Si el control falla, suspenda la corrida y consulte el procedimiento de no conformidades.'",
    ],
    vocab: [
      { es: "verificar → verifique (usted)", pt: "verificar → verifique (você)" },
      { es: "registrar → registre", pt: "registrar → registre" },
      { es: "comunicar → comuníqueselo", pt: "comunicar → comunique-o" },
      { es: "no lo procese aún", pt: "não o processe ainda" },
      { es: "coloque / etiquete", pt: "coloque / etiquete" },
      { es: "imperativo de cortesía (usted)", pt: "imperativo de cortesia (você/senhor)" },
    ],
    quiz: [
      { question: "¿Qué forma del imperativo se usa en los POE técnicos formales?", options: ["La forma de 'tú' informal", "La forma de 'usted' (tercera persona), igual al subjuntivo presente", "Solo el infinitivo sin flexión", "La forma de 'vosotros'"], answer: "La forma de 'usted' (tercera persona), igual al subjuntivo presente" },
      { question: "¿Cómo se forma el imperativo de 'verificar' para 'usted'?", options: ["verifica", "verificas", "verifique", "verificará"], answer: "verifique" },
      { question: "¿Cómo se forma el imperativo de 'hacer' para 'tú'?", options: ["hace", "haz", "hazas", "haces"], answer: "haz" },
      { question: "¿Dónde va el pronombre con el imperativo afirmativo?", options: ["Antes del verbo siempre", "Después del verbo, unido a él (enclítico)", "Separado del verbo por una coma", "Al principio de la oración"], answer: "Después del verbo, unido a él (enclítico)" },
      { question: "¿Dónde va el pronombre con el imperativo negativo?", options: ["Después del verbo igual que en el afirmativo", "Antes del verbo", "Al final de la oración", "No se puede usar pronombre con imperativo negativo"], answer: "Antes del verbo" },
      { question: "¿Cómo se dice correctamente 'escríbelo' en forma de cortesía (usted)?", options: ["escribe lo", "escríbalo", "lo escriba", "escríbelo siempre"], answer: "escríbalo" },
      { question: "¿Cómo se forma el imperativo de 'ir' para 'tú'?", options: ["iras", "ves", "ve", "ira"], answer: "ve" },
      { question: "¿Por qué el imperativo de 'usted' es igual al subjuntivo presente?", options: ["Por coincidencia histórica sin regla", "Porque el imperativo de cortesía se deriva del subjuntivo en español", "Solo para verbos irregulares", "No son iguales, es un error frecuente"], answer: "Porque el imperativo de cortesía se deriva del subjuntivo en español" },
    ],
    dictation: "En los procedimientos técnicos se usa el imperativo de usted: verifique, registre, comunique y coloque son las formas más frecuentes.",
  },
  {
    id: "voz-pasiva", title: "Voz pasiva", level: "Avanzado", category: "Gramática", emoji: "🔃",
    description: "Voz pasiva con ser y pasiva refleja con se en textos técnicos.",
    readingTitle: "Cuando el sujeto no importa tanto",
    reading: [
      "La voz pasiva es una construcción gramatical que permite presentar una acción sin especificar quién la realiza, poniendo el foco en el objeto que recibe la acción. En el lenguaje técnico del laboratorio, es extremadamente frecuente porque muchas veces lo que importa es qué se hizo, no quién lo hizo: 'La muestra fue procesada', 'Los controles fueron validados', 'El procedimiento fue actualizado'. Esta objetividad impersonal es una característica del lenguaje científico y técnico.",
      "En español existen dos formas principales de construir la voz pasiva. La primera es la pasiva con ser: sujeto + ser (conjugado) + participio. Por ejemplo: 'La muestra fue analizada por el analista del turno mañana.' El participio concuerda en género y número con el sujeto: 'El resultado fue validado' (masculino singular), 'Las muestras fueron procesadas' (femenino plural). El agente puede mencionarse o no con la preposición 'por'.",
      "La segunda forma es la pasiva refleja con se, que es mucho más frecuente en el español hablado y escrito de uso cotidiano, especialmente cuando no se menciona al agente. Se forma con se + verbo en tercera persona. 'Se procesaron las muestras', 'Se validó el resultado', 'Se detectó una desviación'. Esta construcción es equivalente a la pasiva con ser pero más natural y fluida.",
      "Una diferencia importante con el portugués es que en español la pasiva con ser es menos frecuente en el habla cotidiana que en el lenguaje escrito formal. En el lenguaje técnico de informes y procedimientos, la pasiva con ser es completamente apropiada. En cambio, en comunicaciones más informales como correos o conversaciones, la pasiva refleja con se es más natural.",
      "Los errores más frecuentes de hablantes de portugués con la voz pasiva en español incluyen: no hacer concordar el participio con el sujeto ('las muestras fue analizado' en lugar de 'fueron analizadas'), confundir la pasiva con ser con la construcción estar + participio (que expresa estado resultante y no acción), y usar 'tener' como auxiliar de pasiva, que existe en portugués informal pero no en español estándar.",
    ],
    vocab: [
      { es: "fue analizado / fueron analizadas", pt: "foi analisado / foram analisadas" },
      { es: "se procesaron las muestras", pt: "as amostras foram processadas" },
      { es: "fue detectado por el equipo", pt: "foi detectado pela equipe" },
      { es: "está validado (estado)", pt: "está validado (estado)" },
      { es: "fue validado (acción)", pt: "foi validado (ação)" },
      { es: "se recomienda / se requiere", pt: "recomenda-se / requer-se" },
    ],
    quiz: [
      { question: "¿Por qué la voz pasiva es frecuente en el lenguaje técnico?", options: ["Por ser más fácil de conjugar", "Porque pone el foco en qué se hizo, no en quién lo hizo, dando objetividad", "Por exigencia de la norma ISO", "Solo por convención histórica sin razón funcional"], answer: "Porque pone el foco en qué se hizo, no en quién lo hizo, dando objetividad" },
      { question: "¿Cómo se construye la pasiva con ser?", options: ["se + verbo en tercera persona", "sujeto + ser + participio (que concuerda con el sujeto)", "sujeto + estar + participio", "solo con verbos en infinitivo"], answer: "sujeto + ser + participio (que concuerda con el sujeto)" },
      { question: "¿Cuál es correcta para 'las muestras' en pasiva con ser?", options: ["Las muestras fue procesada", "Las muestras fueron procesadas", "Las muestras fue procesadas", "Las muestras fueron procesado"], answer: "Las muestras fueron procesadas" },
      { question: "¿Cómo se construye la pasiva refleja?", options: ["ser + participio sin sujeto", "se + verbo en tercera persona", "estar + participio + por", "haber + participio"], answer: "se + verbo en tercera persona" },
      { question: "¿Qué diferencia hay entre 'fue validado' y 'está validado'?", options: ["Son exactamente iguales en significado", "'Fue validado' expresa la acción; 'está validado' expresa el estado resultante", "'Está validado' es más formal", "Solo difieren en el tiempo verbal"], answer: "'Fue validado' expresa la acción; 'está validado' expresa el estado resultante" },
      { question: "¿En qué contexto es más natural la pasiva con ser?", options: ["En conversaciones informales cotidianas", "En lenguaje escrito técnico y formal como informes y procedimientos", "En mensajes por WhatsApp", "En presentaciones orales ante clientes"], answer: "En lenguaje escrito técnico y formal como informes y procedimientos" },
      { question: "¿Cómo se menciona al agente en la pasiva con ser?", options: ["Con la preposición 'de'", "Con la preposición 'por'", "Con la preposición 'con'", "No se puede mencionar el agente en la pasiva"], answer: "Con la preposición 'por'" },
      { question: "¿Qué error es muy frecuente de hablantes de portugués con la voz pasiva?", options: ["Usar demasiado la pasiva refleja", "No concordar el participio en género y número con el sujeto", "Usar ser cuando corresponde estar siempre", "Omitir el agente innecesariamente"], answer: "No concordar el participio en género y número con el sujeto" },
    ],
    dictation: "En los informes técnicos se usa frecuentemente la voz pasiva: los resultados fueron validados, las muestras fueron procesadas y la desviación fue documentada.",
  },
  // ══ LABORATORIO (adicionales) ══
  {
    id: "electrolitos", title: "Electrolitos y función renal", level: "Intermedio", category: "Laboratorio", emoji: "⚡",
    description: "Sodio, potasio, cloro y su relación con el equilibrio hidroelectrolítico.",
    readingTitle: "El equilibrio que mantiene la vida",
    reading: [
      "Los electrolitos son iones con carga eléctrica que se encuentran disueltos en los líquidos del organismo y que cumplen funciones esenciales: mantienen el equilibrio osmótico entre los compartimentos corporales, participan en la conducción nerviosa y muscular, regulan el pH sanguíneo y son cofactores de numerosas enzimas. Los principales electrolitos medidos en el laboratorio clínico son el sodio, el potasio, el cloro y el bicarbonato.",
      "El sodio es el catión predominante en el espacio extracelular y el principal determinante de la osmolaridad plasmática. Una hiponatremia, es decir, un sodio bajo, puede ser consecuencia de una retención de agua, de una pérdida de sodio o de una combinación de ambas. Los síntomas van desde náuseas y cefalea en casos leves hasta convulsiones y coma en casos graves. Su corrección debe ser gradual para evitar complicaciones neurológicas.",
      "El potasio es el catión predominante en el espacio intracelular y tiene un rol crítico en la excitabilidad de las células musculares y cardíacas. Una hipopotasemia o hipocalemia puede causar debilidad muscular, calambres y arritmias cardíacas. Una hiperpotasemia es potencialmente más peligrosa aún, especialmente en pacientes con insuficiencia renal, porque puede producir arritmias graves e incluso paro cardíaco.",
      "La creatinina y la urea son los principales marcadores de función renal determinados en conjunto con los electrolitos. La creatinina es un producto del metabolismo muscular que se elimina casi exclusivamente por filtración glomerular, lo que la convierte en un marcador muy específico de la función del riñón. La tasa de filtración glomerular estimada (TFGe) se calcula a partir de la creatinina, la edad, el sexo y la etnia del paciente.",
      "En la práctica del laboratorio, la medición de electrolitos se realiza en equipos de bioquímica automatizados mediante electrodos selectivos de iones. La muestra puede ser suero, plasma o en algunos casos sangre entera. Los factores preanalíticos más importantes son la hemólisis, que libera potasio intracelular y eleva falsamente la potasemia, y el tiempo de contacto de la muestra con el coágulo antes de centrifugar, que también afecta al potasio.",
    ],
    vocab: [
      { es: "sodio / hiponatremia", pt: "sódio / hiponatremia" }, { es: "potasio / hipopotasemia", pt: "potássio / hipopotassemia" },
      { es: "electrolito", pt: "eletrólito" }, { es: "osmolaridad", pt: "osmolaridade" },
      { es: "filtración glomerular", pt: "filtração glomerular" }, { es: "equilibrio ácido-base", pt: "equilíbrio ácido-base" },
    ],
    quiz: [
      { question: "¿Cuál es el catión predominante en el espacio extracelular?", options: ["Potasio", "Sodio", "Cloro", "Bicarbonato"], answer: "Sodio" },
      { question: "¿Qué riesgo presenta una hiperpotasemia grave?", options: ["Hipertensión arterial", "Arritmias cardíacas graves y paro cardíaco", "Insuficiencia hepática", "Anemia severa"], answer: "Arritmias cardíacas graves y paro cardíaco" },
      { question: "¿Por qué la creatinina es un marcador específico de función renal?", options: ["Porque solo la produce el riñón", "Porque se elimina casi exclusivamente por filtración glomerular", "Porque su valor no varía con la dieta", "Porque es el único marcador no afectado por hemólisis"], answer: "Porque se elimina casi exclusivamente por filtración glomerular" },
      { question: "¿Qué factor preanalítico eleva falsamente la potasemia?", options: ["La lipemia", "La hemólisis que libera potasio intracelular", "El ayuno prolongado", "La temperatura de transporte elevada"], answer: "La hemólisis que libera potasio intracelular" },
      { question: "¿Qué método se usa para medir electrolitos en equipos automatizados?", options: ["Espectrofotometría", "Electrodos selectivos de iones", "Cromatografía líquida", "Inmunoensayo"], answer: "Electrodos selectivos de iones" },
      { question: "¿Por qué la corrección de hiponatremia debe ser gradual?", options: ["Para ahorrar reactivos", "Para evitar complicaciones neurológicas graves", "Por exigencia del protocolo de calidad", "Para reducir el tiempo de hospitalización"], answer: "Para evitar complicaciones neurológicas graves" },
      { question: "¿Qué variables se usan para calcular la TFGe?", options: ["Solo creatinina y edad", "Creatinina, edad, sexo y etnia del paciente", "Urea, creatinina y sodio", "Solo la creatinina y el peso corporal"], answer: "Creatinina, edad, sexo y etnia del paciente" },
      { question: "¿En qué espacio corporal predomina el potasio?", options: ["Espacio extracelular", "Espacio intracelular", "Líquido cefalorraquídeo", "Líquido sinovial"], answer: "Espacio intracelular" },
    ],
    dictation: "Los electrolitos como el sodio y el potasio son esenciales para el equilibrio osmótico y la función cardíaca y deben interpretarse siempre en contexto clínico.",
  },
  {
    id: "validacion-metodo", title: "Validación del método", level: "Avanzado", category: "Laboratorio", emoji: "✅",
    description: "Validación, precisión, exactitud y robustez de métodos analíticos.",
    readingTitle: "Antes de implementar el nuevo método",
    reading: [
      "Antes de implementar un nuevo método analítico en el laboratorio, el equipo necesitaba demostrar que su desempeño era adecuado para el uso previsto. No bastaba con que el procedimiento fuera rápido o práctico: también debía mostrar precisión, exactitud y estabilidad en diferentes condiciones. La validación es el proceso sistemático que permite obtener evidencia documentada de que el método cumple con esos requisitos.",
      "La precisión es la capacidad del método de dar resultados reproducibles cuando se mide la misma muestra repetidamente. Se evalúa en dos niveles: la repetibilidad, que evalúa la variación dentro de una misma corrida analítica, y la precisión intermedia, que evalúa la variación entre diferentes corridas, analistas, días y lotes de reactivos. Ambos niveles son importantes porque representan diferentes fuentes de variabilidad del proceso.",
      "La exactitud es la concordancia entre el resultado del método y el valor verdadero o de referencia. Se evalúa comparando los resultados del método bajo validación con un método de referencia o con materiales de referencia certificados de valor conocido. Un sesgo sistemático en la exactitud puede pasar desapercibido en la evaluación de precisión si siempre se mide el mismo error.",
      "El límite de detección es la concentración mínima de analito que el método puede distinguir del ruido de fondo con un nivel de confianza estadístico determinado. El límite de cuantificación es la concentración mínima a partir de la cual el método puede medir con una precisión y exactitud aceptables. Ambos son parámetros críticos para métodos que deben detectar concentraciones muy bajas, como en toxicología o en marcadores de enfermedades.",
      "La verificación es diferente de la validación completa: es el proceso simplificado que realizan los laboratorios cuando implementan un método ya validado por el fabricante o por otro laboratorio de referencia. Consiste en confirmar, con un número limitado de experimentos, que el método funciona correctamente en las condiciones específicas del laboratorio. La norma ISO 15189 establece que todo método debe ser verificado o validado antes de su uso clínico.",
    ],
    vocab: [
      { es: "validación", pt: "validação" }, { es: "precisión / repetibilidad", pt: "precisão / repetibilidade" },
      { es: "exactitud / sesgo", pt: "exatidão / viés" }, { es: "límite de detección", pt: "limite de detecção" },
      { es: "verificación", pt: "verificação" }, { es: "material de referencia certificado", pt: "material de referência certificado" },
    ],
    quiz: [
      { question: "¿Qué evalúa la precisión de un método analítico?", options: ["La concordancia con el valor verdadero", "La reproducibilidad de los resultados al medir la misma muestra repetidamente", "La velocidad de procesamiento", "La robustez frente a interferencias"], answer: "La reproducibilidad de los resultados al medir la misma muestra repetidamente" },
      { question: "¿Qué diferencia hay entre repetibilidad y precisión intermedia?", options: ["Son sinónimos exactos", "La repetibilidad evalúa variación dentro de una corrida; la intermedia entre corridas, días y analistas", "La precisión intermedia solo evalúa diferentes analistas", "La repetibilidad es siempre mejor que la precisión intermedia"], answer: "La repetibilidad evalúa variación dentro de una corrida; la intermedia entre corridas, días y analistas" },
      { question: "¿Cómo se evalúa la exactitud de un método?", options: ["Comparando resultados repetidos de la misma muestra", "Comparando con un método de referencia o material certificado de valor conocido", "Calculando el coeficiente de variación", "Evaluando la estabilidad a diferentes temperaturas"], answer: "Comparando con un método de referencia o material certificado de valor conocido" },
      { question: "¿Qué es el límite de cuantificación?", options: ["La concentración máxima que el método puede medir", "La concentración mínima medible con precisión y exactitud aceptables", "El umbral de decisión clínica para el analito", "El valor más bajo del rango de referencia normal"], answer: "La concentración mínima medible con precisión y exactitud aceptables" },
      { question: "¿Qué diferencia a la verificación de la validación completa?", options: ["Son exactamente lo mismo con distinto nombre", "La verificación es un proceso simplificado para confirmar que un método ya validado funciona en las condiciones del laboratorio", "La verificación solo la hace el fabricante", "La validación es más rápida que la verificación"], answer: "La verificación es un proceso simplificado para confirmar que un método ya validado funciona en las condiciones del laboratorio" },
      { question: "¿Qué establece la ISO 15189 sobre la validación?", options: ["Solo los métodos nuevos requieren validación", "Todo método debe ser verificado o validado antes de su uso clínico", "Solo los métodos complejos requieren validación formal", "La validación es opcional si el fabricante ya la realizó"], answer: "Todo método debe ser verificado o validado antes de su uso clínico" },
      { question: "¿Un método preciso es siempre exacto?", options: ["Sí, precisión y exactitud son inseparables", "No, un método puede ser preciso pero con sesgo sistemático", "Sí, si los resultados son reproducibles también son exactos", "Depende del tipo de analito medido"], answer: "No, un método puede ser preciso pero con sesgo sistemático" },
      { question: "¿Para qué tipo de métodos son críticos los límites de detección?", options: ["Para todos los métodos por igual", "Para métodos que deben detectar concentraciones muy bajas como en toxicología", "Solo para métodos de bioquímica general", "Solo para métodos inmunológicos"], answer: "Para métodos que deben detectar concentraciones muy bajas como en toxicología" },
    ],
    dictation: "La validación de un método evalúa su precisión, exactitud y límites analíticos antes de implementarlo para uso clínico.",
  },
  // ══ GESTIÓN (adicional) ══
  {
    id: "satisfaccion-cliente", title: "Satisfacción del cliente", level: "Básico", category: "Gestión", emoji: "⭐",
    description: "Medición, análisis y mejora de la satisfacción de clientes y médicos.",
    readingTitle: "La queja que mejoró todo",
    reading: [
      "Un laboratorio puede tener excelentes resultados analíticos y, al mismo tiempo, clientes insatisfechos. La satisfacción del cliente va más allá de la calidad técnica del resultado: incluye la experiencia completa de interacción con el servicio, desde la solicitud del análisis hasta la recepción y comprensión del informe. Un cliente satisfecho regresa, recomienda el servicio y perdona errores ocasionales. Un cliente insatisfecho se va sin decir nada, y eso es lo más peligroso.",
      "La medición de la satisfacción del cliente puede realizarse mediante encuestas periódicas, grupos focales, análisis de quejas y reclamos, y monitoreo de indicadores como el tiempo de respuesta y la tasa de errores en informes. Cada uno de estos instrumentos aporta información diferente y complementaria. Las encuestas miden percepciones generales. Las quejas revelan problemas específicos. Los indicadores muestran tendencias.",
      "Una queja bien gestionada puede convertirse en una oportunidad de mejora y en un refuerzo de la relación con el cliente. El primer paso es escuchar sin interrumpir y sin justificarse. El segundo es agradecer que el cliente haya comunicado el problema en lugar de simplemente abandonar el servicio. El tercero es investigar la causa con seriedad y comunicar los hallazgos. El cuarto es implementar una acción correctiva y verificar su eficacia.",
      "Los médicos que solicitan análisis son clientes especiales del laboratorio: son profesionales técnicos que valoran especialmente la precisión, la rapidez y la capacidad del laboratorio de comunicar información útil para sus decisiones clínicas. Gestionar bien la relación con los médicos requiere un enfoque proactivo: comunicar cambios de métodos, informar los valores críticos de forma oportuna, y estar disponible para consultas técnicas.",
      "El Net Promoter Score (NPS) es una métrica ampliamente usada para medir la satisfacción y la lealtad del cliente en una sola pregunta: '¿Qué tan probable es que recomiende este servicio a un colega o conocido?' Las respuestas permiten clasificar a los clientes en promotores, pasivos y detractores. Un programa de mejora de la satisfacción del cliente que usa el NPS de forma regular puede identificar tendencias antes de que se conviertan en pérdida de clientes.",
    ],
    vocab: [
      { es: "satisfacción del cliente", pt: "satisfação do cliente" }, { es: "queja / reclamo", pt: "reclamação / queixa" },
      { es: "encuesta de satisfacción", pt: "pesquisa de satisfação" }, { es: "NPS", pt: "NPS" },
      { es: "fidelización", pt: "fidelização" }, { es: "cliente interno / externo", pt: "cliente interno / externo" },
    ],
    quiz: [
      { question: "¿Por qué un cliente insatisfecho que no se queja es peligroso?", options: ["Porque puede hacer una denuncia legal", "Porque se va sin dar oportunidad de mejorar y el laboratorio no sabe por qué perdió el cliente", "Porque puede afectar negativamente al personal", "Porque reduce los ingresos inmediatamente"], answer: "Porque se va sin dar oportunidad de mejorar y el laboratorio no sabe por qué perdió el cliente" },
      { question: "¿Qué instrumentos sirven para medir la satisfacción del cliente?", options: ["Solo encuestas formales anuales", "Encuestas, grupos focales, análisis de quejas e indicadores operativos", "Solo el análisis de quejas y reclamos", "Solo los indicadores de tiempo de respuesta"], answer: "Encuestas, grupos focales, análisis de quejas e indicadores operativos" },
      { question: "¿Cuál es el primer paso ante una queja del cliente?", options: ["Justificar y explicar por qué ocurrió", "Escuchar sin interrumpir y sin justificarse", "Ofrecer un descuento inmediatamente", "Derivar a otro responsable"], answer: "Escuchar sin interrumpir y sin justificarse" },
      { question: "¿Por qué se agradece al cliente que realizó una queja?", options: ["Por protocolo formal únicamente", "Porque comunicar el problema en lugar de simplemente irse es una oportunidad de mejora valiosa", "Para reducir la tensión de la situación", "Por exigencia de la norma ISO"], answer: "Porque comunicar el problema en lugar de simplemente irse es una oportunidad de mejora valiosa" },
      { question: "¿Qué valoran especialmente los médicos como clientes del laboratorio?", options: ["Los precios más bajos del mercado", "La precisión, rapidez y capacidad de comunicar información útil para decisiones clínicas", "Las instalaciones modernas", "La variedad de análisis disponibles"], answer: "La precisión, rapidez y capacidad de comunicar información útil para decisiones clínicas" },
      { question: "¿Qué mide el Net Promoter Score (NPS)?", options: ["La cantidad de análisis realizados por mes", "La probabilidad de que un cliente recomiende el servicio a otros", "La velocidad de respuesta del laboratorio", "El porcentaje de resultados correctos"], answer: "La probabilidad de que un cliente recomiende el servicio a otros" },
      { question: "¿Qué tres grupos clasifica el NPS?", options: ["Satisfechos, neutrales e insatisfechos", "Promotores, pasivos y detractores", "Leales, ocasionales y perdidos", "Internos, externos y potenciales"], answer: "Promotores, pasivos y detractores" },
      { question: "¿Qué diferencia a los médicos de otros clientes del laboratorio?", options: ["Pagan más por los servicios", "Son profesionales técnicos que requieren un enfoque proactivo y comunicación especializada", "Solo les interesa la velocidad", "Son menos exigentes que los pacientes"], answer: "Son profesionales técnicos que requieren un enfoque proactivo y comunicación especializada" },
    ],
    dictation: "Una queja bien gestionada se convierte en oportunidad de mejora: hay que escuchar, agradecer, investigar e implementar acciones correctivas.",
  },
  // ══ COMUNICACIÓN (adicionales) ══
  {
    id: "redaccion-informes", title: "Redacción de informes técnicos", level: "Intermedio", category: "Comunicación", emoji: "📄",
    description: "Estructura y lenguaje para redactar informes técnicos en español.",
    readingTitle: "El informe que nadie entendió",
    reading: [
      "Un informe técnico de laboratorio tiene una función muy específica: comunicar hallazgos, análisis y conclusiones a una audiencia determinada de forma que esa información pueda usarse para tomar decisiones. Sin embargo, muchos informes técnicos fallan en esa misión porque están escritos para el redactor, no para el lector. Están llenos de jerga técnica sin contexto, de datos sin interpretación y de conclusiones sin recomendaciones.",
      "La estructura estándar de un informe técnico en español incluye las siguientes secciones: resumen ejecutivo o síntesis, que permite al lector entender la conclusión principal sin leer todo el documento; introducción o contexto, que explica por qué se realizó el análisis; metodología, que describe cómo se obtuvo la información; resultados, que presenta los hallazgos de forma organizada; análisis e interpretación, que explica qué significan los resultados; conclusiones y recomendaciones.",
      "El lenguaje del informe técnico debe adaptarse a la audiencia. Un informe dirigido a otros analistas puede usar terminología técnica específica. Un informe dirigido a la dirección del laboratorio debe usar un lenguaje más accesible, con énfasis en el impacto operativo y las decisiones que se desprenden de los hallazgos. Un informe dirigido a un organismo regulador debe ser preciso, documentado y referenciado.",
      "El resumen ejecutivo es la parte más importante del informe porque es la que más personas van a leer completa. Debe poder entenderse de forma independiente del resto del documento y debe responder, en no más de media página, a las siguientes preguntas: ¿por qué se hizo este análisis?, ¿qué se encontró?, ¿qué significa?, ¿qué se recomienda hacer?",
      "Los errores más frecuentes en la redacción de informes técnicos en español son: usar la voz pasiva en exceso cuando la activa sería más clara, mezclar tiempos verbales inconsistentemente, incluir datos sin analizarlos, presentar conclusiones sin evidencia que las sostenga, y no incluir recomendaciones concretas y accionables. Un informe que termina con 'se observan áreas de mejora' sin especificar cuáles y cómo abordarlas no ha cumplido su función.",
    ],
    vocab: [
      { es: "resumen ejecutivo", pt: "resumo executivo" }, { es: "hallazgos", pt: "achados / resultados" },
      { es: "metodología", pt: "metodologia" }, { es: "recomendación", pt: "recomendação" },
      { es: "audiencia / destinatario", pt: "público-alvo / destinatário" }, { es: "conclusión accionable", pt: "conclusão acionável" },
    ],
    quiz: [
      { question: "¿Cuál es la función principal de un informe técnico?", options: ["Demostrar el conocimiento técnico del redactor", "Comunicar hallazgos y análisis para que el lector pueda tomar decisiones", "Cumplir con un requisito burocrático", "Documentar el proceso completo en detalle"], answer: "Comunicar hallazgos y análisis para que el lector pueda tomar decisiones" },
      { question: "¿Qué incluye la estructura estándar de un informe técnico?", options: ["Solo resultados y conclusiones", "Resumen, introducción, metodología, resultados, análisis, conclusiones y recomendaciones", "Solo la metodología y los resultados", "Solo el resumen ejecutivo y las recomendaciones"], answer: "Resumen, introducción, metodología, resultados, análisis, conclusiones y recomendaciones" },
      { question: "¿Por qué el resumen ejecutivo es la parte más importante?", options: ["Es la más larga del informe", "Es la parte que más personas van a leer completa y debe poder entenderse de forma independiente", "Es la que primero revisan los auditores", "Es donde se presentan los datos más técnicos"], answer: "Es la parte que más personas van a leer completa y debe poder entenderse de forma independiente" },
      { question: "¿Cómo debe adaptarse el lenguaje del informe?", options: ["Siempre con máxima tecnicidad", "Según la audiencia: técnica para analistas, accesible para directivos, precisa para reguladores", "Siempre simple para todos los públicos", "Siempre formal independientemente del destinatario"], answer: "Según la audiencia: técnica para analistas, accesible para directivos, precisa para reguladores" },
      { question: "¿Qué debe responder el resumen ejecutivo?", options: ["Todos los detalles técnicos del proceso", "Por qué, qué se encontró, qué significa y qué se recomienda hacer", "Solo el problema planteado", "Solo las conclusiones sin contexto"], answer: "Por qué, qué se encontró, qué significa y qué se recomienda hacer" },
      { question: "¿Qué error tiene un informe que termina con 'se observan áreas de mejora'?", options: ["Ninguno, es una conclusión válida", "No especifica cuáles son las áreas ni cómo abordarlas, por lo que no es accionable", "Es demasiado técnico para la audiencia", "Usa un tiempo verbal incorrecto"], answer: "No especifica cuáles son las áreas ni cómo abordarlas, por lo que no es accionable" },
      { question: "¿Cuál es un error frecuente de redacción en informes técnicos?", options: ["Usar demasiados gráficos", "Incluir datos sin analizarlos y presentar conclusiones sin evidencia", "Hacer el informe demasiado breve", "Usar demasiados sinónimos"], answer: "Incluir datos sin analizarlos y presentar conclusiones sin evidencia" },
      { question: "¿Qué caracteriza a una recomendación bien formulada?", options: ["Que sea general para aplicar en muchos contextos", "Que sea concreta, específica y accionable por quien la recibe", "Que use lenguaje técnico avanzado", "Que sea breve, de no más de una línea"], answer: "Que sea concreta, específica y accionable por quien la recibe" },
    ],
    dictation: "Un informe técnico efectivo adapta su lenguaje a la audiencia y termina con conclusiones concretas y recomendaciones accionables.",
  },
  {
    id: "negociacion-tecnica", title: "Negociación técnica", level: "Avanzado", category: "Comunicación", emoji: "🤝",
    description: "Estrategias y lenguaje para negociar en contextos técnicos y profesionales.",
    readingTitle: "Cuando los números no alcanzan",
    reading: [
      "En el entorno laboral del laboratorio clínico, la negociación aparece en muchos contextos: la discusión de plazos para implementar correcciones con el responsable de calidad, la justificación de recursos adicionales ante la dirección, la definición de niveles de servicio con los clientes, y la resolución de desacuerdos técnicos entre especialistas. En todos esos casos, negociar bien requiere combinar argumentos técnicos sólidos con habilidades de comunicación efectivas.",
      "El primer principio de una negociación técnica efectiva es separar los intereses de las posiciones. Una posición es lo que alguien dice que quiere: 'necesito el resultado en dos horas'. Un interés es la razón detrás de esa posición: 'necesito el resultado antes de que el médico de guardia tome una decisión terapéutica'. Cuando se trabaja sobre los intereses y no sobre las posiciones, el espacio para encontrar soluciones mutuamente aceptables es mucho mayor.",
      "En español técnico, hay frases específicas que facilitan la negociación constructiva. Para explorar los intereses del otro: '¿Podría ayudarme a entender por qué esto es importante para usted?', 'Si entiendo bien, lo que más le preocupa es...'. Para proponer alternativas: 'Una opción que podría funcionar sería...', '¿Qué le parecería si...?'. Para manejar el desacuerdo sin confrontación: 'Entiendo su punto, aunque desde nuestra perspectiva...', 'Compartimos el objetivo, aunque diferimos en el camino'.",
      "La preparación previa es un factor determinante del éxito en cualquier negociación. Antes de una reunión donde se va a negociar, es importante identificar cuál es el resultado ideal, cuál es el resultado aceptable mínimo, y cuál es la alternativa si no se llega a un acuerdo. También es importante anticipar los argumentos del otro lado y preparar respuestas fundamentadas.",
      "Un aspecto específico del contexto técnico es que los argumentos deben estar respaldados por datos. En una negociación donde se discute el plazo para implementar una corrección identificada en una auditoría, presentar datos sobre el impacto de la no conformidad y un plan de acción detallado es mucho más efectivo que simplemente pedir más tiempo. Los datos dan credibilidad y orientan la discusión hacia los hechos y no hacia las percepciones.",
    ],
    vocab: [
      { es: "negociación", pt: "negociação" }, { es: "interés vs posición", pt: "interesse vs posição" },
      { es: "acuerdo mutuamente beneficioso", pt: "acordo mutuamente benéfico" }, { es: "alternativa", pt: "alternativa" },
      { es: "concesión", pt: "concessão" }, { es: "punto de partida / límite", pt: "ponto de partida / limite" },
    ],
    quiz: [
      { question: "¿En qué contextos aparece la negociación en el laboratorio?", options: ["Solo con clientes externos", "Plazos, recursos, niveles de servicio y desacuerdos técnicos internos y externos", "Solo con organismos reguladores", "Solo al momento de renovar contratos"], answer: "Plazos, recursos, niveles de servicio y desacuerdos técnicos internos y externos" },
      { question: "¿Qué diferencia hay entre posición e interés?", options: ["Son sinónimos en el contexto de negociación", "La posición es lo que alguien dice querer; el interés es la razón real detrás de esa demanda", "El interés es siempre económico; la posición es técnica", "La posición cambia; el interés es siempre fijo"], answer: "La posición es lo que alguien dice querer; el interés es la razón real detrás de esa demanda" },
      { question: "¿Por qué conviene trabajar sobre intereses y no posiciones?", options: ["Porque las posiciones no son negociables", "Porque amplía el espacio para encontrar soluciones mutuamente aceptables", "Porque los intereses siempre son más razonables", "Para ahorrar tiempo en la discusión"], answer: "Porque amplía el espacio para encontrar soluciones mutuamente aceptables" },
      { question: "¿Qué frase sirve para explorar los intereses del otro?", options: ["'Le propongo que acepte mi posición'", "'¿Podría ayudarme a entender por qué esto es importante para usted?'", "'Necesito que decida ahora'", "'Este es mi límite final'"], answer: "'¿Podría ayudarme a entender por qué esto es importante para usted?'" },
      { question: "¿Qué tres elementos deben definirse en la preparación de una negociación?", options: ["El tiempo, el lugar y los participantes", "El resultado ideal, el mínimo aceptable y la alternativa si no hay acuerdo", "Las concesiones posibles, el precio y los plazos", "El equipo negociador, los argumentos y los datos"], answer: "El resultado ideal, el mínimo aceptable y la alternativa si no hay acuerdo" },
      { question: "¿Por qué los datos son especialmente importantes en negociaciones técnicas?", options: ["Porque impresionan más al interlocutor", "Porque dan credibilidad y orientan la discusión hacia hechos y no hacia percepciones", "Porque son obligatorios por norma", "Porque reducen el tiempo de la negociación"], answer: "Porque dan credibilidad y orientan la discusión hacia hechos y no hacia percepciones" },
      { question: "¿Cómo se expresa desacuerdo sin confrontación en español técnico?", options: ["Diciendo directamente 'no estoy de acuerdo'", "Con frases como 'Entiendo su punto, aunque desde nuestra perspectiva...'", "Evitando responder directamente", "Cambiando el tema de la conversación"], answer: "Con frases como 'Entiendo su punto, aunque desde nuestra perspectiva...'" },
      { question: "¿Qué hace más efectiva una propuesta en una negociación técnica?", options: ["Ser presentada primero antes de escuchar al otro", "Estar respaldada por datos y un plan concreto", "Ser lo más simple posible", "Incluir concesiones grandes desde el inicio"], answer: "Estar respaldada por datos y un plan concreto" },
    ],
    dictation: "En una negociación técnica es importante separar los intereses de las posiciones y respaldar cada propuesta con datos concretos.",
  },
  // ══ TECNOLOGÍA (adicional) ══
  {
    id: "automatizacion", title: "Automatización del laboratorio", level: "Avanzado", category: "Tecnología", emoji: "🤖",
    description: "Sistemas de automatización, robótica y flujo de trabajo en el laboratorio moderno.",
    readingTitle: "El laboratorio que no para",
    reading: [
      "La automatización del laboratorio clínico ha transformado radicalmente la forma en que se procesan las muestras. Los sistemas de automatización total o parcial integran múltiples instrumentos analíticos en una línea continua de procesamiento: desde la recepción y descongelación de muestras, pasando por el centrifugado, la alicuotación, la carga de los tubos en los analizadores, hasta el almacenamiento refrigerado de las muestras procesadas. Todo este flujo puede ocurrir con una intervención mínima del personal.",
      "Los beneficios de la automatización son múltiples y bien documentados. La estandarización del proceso reduce la variabilidad introducida por el factor humano, especialmente en tareas repetitivas como el pipeteo o la manipulación de tubos. La trazabilidad es total: el sistema registra automáticamente quién hizo qué, con qué instrumento, a qué hora y con qué resultado de control. La capacidad de procesamiento aumenta significativamente sin aumentar el personal en la misma proporción.",
      "Sin embargo, la automatización también introduce nuevos desafíos técnicos y de gestión. Los sistemas automatizados son más costosos de adquirir y mantener. Requieren personal técnico especializado para su operación y mantenimiento preventivo. Cuando fallan, pueden afectar a todo el flujo de trabajo simultáneamente, lo que hace que la planificación de contingencias sea especialmente importante.",
      "La interfaz entre el sistema de automatización y el LIMS es un componente crítico. Los errores en esa interfaz pueden generar resultados asignados a muestras incorrectas, dobles registros o pérdida de información. Antes de activar cualquier nueva interfaz, el laboratorio debe realizar una validación exhaustiva con muestras de control y verificar que toda la cadena de información funciona correctamente de extremo a extremo.",
      "El rol del analista en un laboratorio automatizado es diferente al rol tradicional, pero no menos importante. El analista deja de realizar tareas manuales repetitivas para asumir responsabilidades de supervisión del sistema, verificación de la calidad de los resultados, gestión de las excepciones y alertas, y mantenimiento de los controles de calidad analítica. Esa transición requiere formación específica y una reconceptualización del perfil profesional del analista de laboratorio.",
    ],
    vocab: [
      { es: "automatización total", pt: "automação total" }, { es: "línea de procesamiento", pt: "linha de processamento" },
      { es: "alicuotación automática", pt: "aliquotagem automática" }, { es: "trazabilidad total", pt: "rastreabilidade total" },
      { es: "mantenimiento preventivo", pt: "manutenção preventiva" }, { es: "plan de contingencia", pt: "plano de contingência" },
    ],
    quiz: [
      { question: "¿Qué integran los sistemas de automatización total del laboratorio?", options: ["Solo los analizadores bioquímicos", "Recepción, centrifugado, alicuotación, análisis y almacenamiento en una línea continua", "Solo el LIMS y los analizadores", "Solo los procesos preanalíticos"], answer: "Recepción, centrifugado, alicuotación, análisis y almacenamiento en una línea continua" },
      { question: "¿Cuál es un beneficio documentado de la automatización?", options: ["Elimina completamente los errores del laboratorio", "Estandariza el proceso y reduce la variabilidad del factor humano", "Hace innecesario el control de calidad", "Reduce el costo de cada análisis a la mitad"], answer: "Estandariza el proceso y reduce la variabilidad del factor humano" },
      { question: "¿Qué desafío introduce la automatización respecto a las fallas?", options: ["Las fallas son más frecuentes que en el trabajo manual", "Una falla puede afectar a todo el flujo de trabajo simultáneamente", "Las fallas son siempre fáciles de detectar", "Las fallas solo afectan a un instrumento aislado"], answer: "Una falla puede afectar a todo el flujo de trabajo simultáneamente" },
      { question: "¿Por qué es crítica la interfaz entre el sistema de automatización y el LIMS?", options: ["Por razones estéticas de la interfaz visual", "Errores en ella pueden generar resultados asignados incorrectamente o pérdida de información", "Solo porque lo exige la norma ISO", "Para mejorar la velocidad de procesamiento"], answer: "Errores en ella pueden generar resultados asignados incorrectamente o pérdida de información" },
      { question: "¿Qué debe hacerse antes de activar una nueva interfaz?", options: ["Solo verificar la velocidad de transferencia de datos", "Una validación exhaustiva con muestras de control de extremo a extremo", "Actualizar el LIMS a la última versión", "Capacitar a todo el personal en el nuevo sistema"], answer: "Una validación exhaustiva con muestras de control de extremo a extremo" },
      { question: "¿Cómo cambia el rol del analista en un laboratorio automatizado?", options: ["El analista ya no es necesario", "Pasa de tareas manuales repetitivas a supervisión, gestión de excepciones y control de calidad", "Sus tareas se simplifican sin cambio de habilidades", "Solo debe operar el software del LIMS"], answer: "Pasa de tareas manuales repetitivas a supervisión, gestión de excepciones y control de calidad" },
      { question: "¿Qué tipo de mantenimiento es esencial en sistemas automatizados?", options: ["Solo el mantenimiento correctivo cuando algo falla", "El mantenimiento preventivo programado regularmente", "Solo la limpieza diaria de los equipos", "Solo el mantenimiento anual del fabricante"], answer: "El mantenimiento preventivo programado regularmente" },
      { question: "¿Qué requiere la transición del analista al rol en laboratorio automatizado?", options: ["Solo aprender a usar el software nuevo", "Formación específica y reconceptualización del perfil profesional", "Reducción de la carga de trabajo total", "Solo supervisión durante los primeros días"], answer: "Formación específica y reconceptualización del perfil profesional" },
    ],
    dictation: "La automatización del laboratorio estandariza el proceso y aumenta la trazabilidad, pero requiere planificación de contingencias ante posibles fallas del sistema.",
  },
  // ══ GRAMÁTICA (adicionales) ══
  {
    id: "preposiciones", title: "Preposiciones técnicas", level: "Intermedio", category: "Gramática", emoji: "🔧",
    description: "Las preposiciones más frecuentes del español técnico y sus diferencias con el portugués.",
    readingTitle: "Las pequeñas palabras que cambian el sentido",
    reading: [
      "Las preposiciones son palabras pequeñas pero fundamentales: conectan elementos de la oración e indican relaciones de tiempo, lugar, causa, modo, destino y otras. En español técnico, el uso correcto de las preposiciones es esencial para la claridad del mensaje. Un error preposicional puede cambiar completamente el sentido de una frase o crear ambigüedad donde debería haber precisión.",
      "La preposición 'en' tiene usos muy amplios en español. Indica lugar ('las muestras están en el refrigerador'), tiempo ('en el turno de la mañana'), modo ('en condiciones de ayuno'), y medio ('en papel', 'en formato digital'). En portugués, muchos de estos usos se expresan con 'no/na', 'em' o 'de', lo que genera confusiones frecuentes.",
      "La preposición 'de' expresa origen, pertenencia, material, contenido y muchas otras relaciones. 'El informe de laboratorio', 'la muestra de sangre', 'el tubo de coagulación', 'los resultados de control'. Un error muy frecuente de hablantes de portugués es omitir la 'de' en construcciones como 'análisis de orina' (en lugar de decir 'análisis orina' como en algunas construcciones del portugués coloquial).",
      "La preposición 'por' y 'para' son una fuente clásica de dificultad. 'Por' indica causa ('se rechazó la muestra por hemólisis'), agente en voz pasiva ('fue detectado por el analista'), duración ('el equipo estuvo en mantenimiento por tres horas') e intercambio. 'Para' indica destino o finalidad ('el resultado es para el médico de guardia'), propósito ('se calibró para mejorar la precisión'), y plazo ('el informe debe estar listo para el viernes').",
      "Las locuciones preposicionales son combinaciones de palabras que funcionan como una sola preposición. Son muy frecuentes en el lenguaje técnico: 'a partir de' (a partir del lunes, a partir de esta concentración), 'en función de' (en función del resultado, en función de la edad del paciente), 'de acuerdo con' (de acuerdo con el procedimiento, de acuerdo con los resultados), 'en relación con' (en relación con el mes anterior). Memorizar estas locuciones mejora significativamente la fluidez en la escritura técnica.",
    ],
    vocab: [
      { es: "en ayunas / en condiciones de ayuno", pt: "em jejum" }, { es: "de acuerdo con", pt: "de acordo com" },
      { es: "a partir de", pt: "a partir de" }, { es: "por / para (distinción)", pt: "por / para (distinção)" },
      { es: "en función de", pt: "em função de" }, { es: "en relación con", pt: "em relação a" },
    ],
    quiz: [
      { question: "¿Qué relaciones puede expresar la preposición 'en' en español técnico?", options: ["Solo lugar", "Lugar, tiempo, modo y medio entre otras relaciones", "Solo tiempo y modo", "Solo pertenencia y origen"], answer: "Lugar, tiempo, modo y medio entre otras relaciones" },
      { question: "¿Cuál es un error frecuente con 'de' en hablantes de portugués?", options: ["Usarla demasiado frecuentemente", "Omitirla en construcciones como 'análisis de orina'", "Confundirla con 'desde'", "Usarla donde corresponde 'en'"], answer: "Omitirla en construcciones como 'análisis de orina'" },
      { question: "¿Qué expresa 'por' en 'se rechazó la muestra por hemólisis'?", options: ["Destino o finalidad", "Causa del rechazo", "Agente en voz pasiva", "Duración del proceso"], answer: "Causa del rechazo" },
      { question: "¿Cuándo se usa 'para' en lugar de 'por'?", options: ["Para indicar causa de algo que ocurrió", "Para indicar destino, finalidad o plazo", "Para indicar duración de una acción", "Para indicar el agente de la voz pasiva"], answer: "Para indicar destino, finalidad o plazo" },
      { question: "¿Qué es una locución preposicional?", options: ["Una preposición simple muy frecuente", "Una combinación de palabras que funciona como una sola preposición", "Una preposición de origen latino", "Un sinónimo de preposición compuesta"], answer: "Una combinación de palabras que funciona como una sola preposición" },
      { question: "¿Cómo se usa 'a partir de' en contexto técnico?", options: ["Solo para indicar personas", "Para indicar un punto de inicio en tiempo o en concentración", "Solo en textos formales escritos", "Como sinónimo de 'hasta'"], answer: "Para indicar un punto de inicio en tiempo o en concentración" },
      { question: "¿Cómo se expresa 'de acordo com o procedimento' en español?", options: ["Según el procedimiento / De acuerdo con el procedimiento", "Con el procedimiento / Por el procedimiento", "Sobre el procedimiento / En el procedimiento", "Dentro del procedimiento / Bajo el procedimiento"], answer: "Según el procedimiento / De acuerdo con el procedimiento" },
      { question: "¿Cuál es la preposición correcta en 'el resultado __ el médico de guardia'?", options: ["de", "por", "en", "para"], answer: "para" },
    ],
    dictation: "Las preposiciones por y para expresan relaciones diferentes: por indica causa o agente, mientras que para indica destino, finalidad o plazo.",
  },
  {
    id: "condicional", title: "Condicional y hipótesis", level: "Avanzado", category: "Gramática", emoji: "💭",
    description: "El condicional para formular hipótesis, recomendaciones y situaciones posibles.",
    readingTitle: "Lo que haríamos si...",
    reading: [
      "El condicional es el tiempo verbal que se usa en español para hablar de situaciones hipotéticas, posibles o imaginadas, y para formular recomendaciones con un tono más atenuado y cortés que el imperativo. En el contexto técnico del laboratorio, aparece constantemente en la formulación de hipótesis diagnósticas, en las discusiones sobre qué hacer en situaciones que todavía no han ocurrido, y en las recomendaciones formales de los informes.",
      "El condicional simple, que en español se forma añadiendo las terminaciones -ía, -ías, -ía, -íamos, -íais, -ían al infinitivo, expresa lo que ocurriría en una situación hipotética. 'Si el control fallara, detendríamos la corrida.' 'Con ese resultado, el médico probablemente modificaría el tratamiento.' 'En esas condiciones, la muestra sería inutilizable.' Esta forma es muy frecuente en las discusiones técnicas y en la redacción de protocolos de contingencia.",
      "El condicional también se usa para hacer recomendaciones de forma cortés y atenuada, que es una estrategia comunicativa importante en el entorno laboral. 'Sería conveniente revisar el procedimiento antes de implementar el cambio.' 'Convendría comunicar este hallazgo al área de calidad antes del viernes.' 'Habría que considerar la posibilidad de una calibración adicional.' Estas frases son mucho más suaves que las equivalentes en imperativo.",
      "La diferencia entre el condicional simple y el compuesto es importante para la precisión temporal. El condicional compuesto (habría + participio) se refiere a situaciones que habrían ocurrido en el pasado si las condiciones hubieran sido diferentes: 'Si hubiéramos detectado la desviación antes, habríamos evitado el error.' Esta forma aparece frecuentemente en el análisis retrospectivo de incidentes y no conformidades.",
      "Para los hablantes de portugués, el condicional simple del español es relativamente familiar porque tiene una forma similar al futuro do pretérito del portugués. Sin embargo, en el portugués hablado coloquial, el futuro do pretérito frecuentemente se sustituye por el imperfeito (en portugués: 'se o controle falhasse, parávamos a corrida'). En español formal y técnico, el condicional simple es la forma correcta y esperada en estos contextos.",
    ],
    vocab: [
      { es: "condicional simple (haría)", pt: "futuro do pretérito (faria)" },
      { es: "sería conveniente", pt: "seria conveniente" },
      { es: "convendría / habría que", pt: "conviria / seria necessário" },
      { es: "si + imperfecto subjuntivo + condicional", pt: "se + imperfeito subjuntivo + futuro do pretérito" },
      { es: "habría ocurrido (condicional compuesto)", pt: "teria ocorrido (condicional composto)" },
      { es: "hipótesis / situación hipotética", pt: "hipótese / situação hipotética" },
    ],
    quiz: [
      { question: "¿Para qué se usa el condicional en español técnico?", options: ["Solo para el futuro inmediato", "Para situaciones hipotéticas, recomendaciones atenuadas y protocolos de contingencia", "Solo en el lenguaje coloquial informal", "Solo para acciones del pasado reciente"], answer: "Para situaciones hipotéticas, recomendaciones atenuadas y protocolos de contingencia" },
      { question: "¿Cómo se forma el condicional simple?", options: ["Con 'haber' + participio", "Añadiendo -ía, -ías, -ía, -íamos, -ían al infinitivo", "Igual que el futuro simple", "Con el auxiliar 'ir' + infinitivo"], answer: "Añadiendo -ía, -ías, -ía, -íamos, -ían al infinitivo" },
      { question: "¿Por qué se usa el condicional para hacer recomendaciones?", options: ["Porque es gramaticalmente obligatorio", "Porque atenúa el tono y lo hace más cortés que el imperativo directo", "Porque es más formal que el imperativo", "Solo por convención académica"], answer: "Porque atenúa el tono y lo hace más cortés que el imperativo directo" },
      { question: "¿Cuál de estas frases usa el condicional correctamente?", options: ["Mañana revisamos el procedimiento", "Sería conveniente revisar el procedimiento antes de implementar el cambio", "Revisad el procedimiento antes del cambio", "Hay que revisar el procedimiento"], answer: "Sería conveniente revisar el procedimiento antes de implementar el cambio" },
      { question: "¿Cuándo se usa el condicional compuesto (habría + participio)?", options: ["Para situaciones futuras posibles", "Para situaciones que habrían ocurrido en el pasado si las condiciones hubieran sido diferentes", "Como sinónimo del condicional simple", "Solo en el lenguaje escrito muy formal"], answer: "Para situaciones que habrían ocurrido en el pasado si las condiciones hubieran sido diferentes" },
      { question: "¿En qué contexto laboral es frecuente el condicional compuesto?", options: ["En la redacción de procedimientos futuros", "En el análisis retrospectivo de incidentes y no conformidades", "En las comunicaciones cotidianas con clientes", "En los informes de resultados analíticos"], answer: "En el análisis retrospectivo de incidentes y no conformidades" },
      { question: "¿Cómo se expresa 'sería necessário' en español?", options: ["Sería necesario / habría que / convendría", "Es necesario / se necesita / hay que", "Será necesario / habrá que", "Fue necesario / hubo que"], answer: "Sería necesario / habría que / convendría" },
      { question: "¿Cómo expresa el español coloquial la hipótesis que el portugués coloquial hace con imperfeito?", options: ["Con el mismo imperfeito también", "Con el condicional simple, que es la forma correcta en español técnico formal", "Con el futuro simple", "Con el presente de indicativo"], answer: "Con el condicional simple, que es la forma correcta en español técnico formal" },
    ],
    dictation: "Si el control fallara, detendríamos la corrida y sería conveniente investigar la causa antes de continuar con el procesamiento.",
  },
  // ══ LABORATORIO (+4) ══
  {
    id: "gasometria", title: "Gasometría arterial", level: "Avanzado", category: "Laboratorio", emoji: "💨",
    description: "pH, pO2, pCO2 y equilibrio ácido-base en situaciones críticas.",
    readingTitle: "Lo que respira nos dice la sangre",
    reading: [
      "La gasometría arterial es uno de los análisis más informativos y urgentes del laboratorio. Se obtiene de sangre arterial, generalmente de la arteria radial, y es más inestable que la venosa, lo que hace críticos los factores preanalíticos. Debe procesarse en minutos desde la extracción.",
      "Los parámetros principales son el pH, que indica acidez o alcalinidad; la pCO2, que refleja la función ventilatoria; la pO2, que indica la oxigenación; el bicarbonato (HCO3-), el tampón metabólico principal; y la saturación de oxígeno. Juntos permiten evaluar el equilibrio ácido-base del organismo.",
      "Los cuatro trastornos primarios son: acidosis respiratoria por retención de CO2; alcalosis respiratoria por eliminación excesiva; acidosis metabólica por acumulación de ácidos o pérdida de bicarbonato; y alcalosis metabólica por pérdida de ácidos. En pacientes críticos pueden coexistir varios trastornos simultáneamente.",
      "La temperatura es un factor preanalítico crítico porque los gases cambian su solubilidad con la temperatura. Una muestra calentada pierde CO2 y O2 falsamente. Debe procesarse en 15 a 30 minutos desde la extracción, o mantenerse en hielo si hay algún retraso.",
      "En urgencias, la gasometría orienta decisiones terapéuticas inmediatas. Un pH menor a 7.20 puede requerir corrección con bicarbonato. Una hipoxemia severa puede indicar ventilación mecánica. La comunicación del resultado al médico de guardia siempre es prioritaria.",
    ],
    vocab: [
      { es: "gasometría arterial", pt: "gasometria arterial" }, { es: "pH / acidosis / alcalosis", pt: "pH / acidose / alcalose" },
      { es: "pCO2 / pO2", pt: "pCO2 / pO2" }, { es: "bicarbonato", pt: "bicarbonato" },
      { es: "equilibrio ácido-base", pt: "equilíbrio ácido-base" }, { es: "saturación de oxígeno", pt: "saturação de oxigênio" },
    ],
    quiz: [
      { question: "¿Por qué la gasometría se realiza en sangre arterial?", options: ["Por convención histórica sin fundamento", "Porque refleja directamente el estado de oxigenación y ventilación del organismo", "Porque es más fácil de obtener", "Porque tiene menos interferencias analíticas"], answer: "Porque refleja directamente el estado de oxigenación y ventilación del organismo" },
      { question: "¿Qué refleja la pCO2?", options: ["La oxigenación arterial", "La función ventilatoria de los pulmones", "El estado metabólico del organismo", "La capacidad de transporte de oxígeno"], answer: "La función ventilatoria de los pulmones" },
      { question: "¿Cuáles son los cuatro trastornos primarios del equilibrio ácido-base?", options: ["Hipoxia, hipercapnia, acidemia, alcalemia", "Acidosis respiratoria, alcalosis respiratoria, acidosis metabólica, alcalosis metabólica", "Solo acidosis y alcalosis respiratoria", "pH alto, pH bajo, CO2 alto, CO2 bajo"], answer: "Acidosis respiratoria, alcalosis respiratoria, acidosis metabólica, alcalosis metabólica" },
      { question: "¿Qué causa la acidosis respiratoria?", options: ["Pérdida de bicarbonato renal", "Retención de CO2 por hipoventilación", "Acumulación de ácidos metabólicos", "Pérdida de ácidos por vómitos"], answer: "Retención de CO2 por hipoventilación" },
      { question: "¿Por qué la temperatura afecta la muestra de gasometría?", options: ["Solo afecta al pH", "Los gases cambian su solubilidad con la temperatura alterando los resultados", "La temperatura no tiene efecto si se extrae correctamente", "Solo si se calienta más de 10 grados"], answer: "Los gases cambian su solubilidad con la temperatura alterando los resultados" },
      { question: "¿Cuánto tiempo máximo antes de procesar una gasometría?", options: ["24 horas refrigerada", "15 a 30 minutos desde la extracción", "Solo 5 minutos exactos", "Hasta 2 horas en hielo siempre"], answer: "15 a 30 minutos desde la extracción" },
      { question: "¿Qué pH indica acidosis severa que puede requerir corrección urgente?", options: ["pH menor a 7.35", "pH menor a 7.20", "pH menor a 7.40", "Solo pH menor a 7.00"], answer: "pH menor a 7.20" },
      { question: "¿Por qué la gasometría en urgencias tiene prioridad de comunicación?", options: ["Por exigencia normativa solamente", "Porque sus resultados orientan decisiones terapéuticas urgentes como ventilación o corrección de acidosis", "Porque es el análisis más costoso", "Porque requiere más tiempo de procesamiento"], answer: "Porque sus resultados orientan decisiones terapéuticas urgentes como ventilación o corrección de acidosis" },
    ],
    dictation: "La gasometría arterial evalúa el pH, la pCO2, la pO2 y el bicarbonato y debe procesarse en 15 a 30 minutos desde la extracción.",
  },
  {
    id: "toxicologia", title: "Toxicología clínica", level: "Avanzado", category: "Laboratorio", emoji: "☠️",
    description: "Drogas, fármacos y tóxicos: detección, cuantificación y comunicación urgente.",
    readingTitle: "La sustancia que no debería estar",
    reading: [
      "La toxicología clínica detecta y cuantifica sustancias dañinas: drogas de abuso, fármacos tóxicos, metales pesados y alcoholes. En urgencias, identificar correctamente la sustancia es decisivo para elegir el antídoto. El laboratorio de toxicología trabaja bajo alta presión temporal y clínica.",
      "Las pruebas de tamizaje en orina usan inmunoensayos que detectan grupos de sustancias por encima de un umbral. Son rápidas (minutos) y detectan cocaína, opiáceos, cannabinoides, anfetaminas y benzodiacepinas. Tienen limitaciones: pueden dar falsos positivos por reactividad cruzada con medicamentos legítimos.",
      "Un resultado positivo en el tamizaje debe confirmarse con cromatografía acoplada a espectrometría de masas (GC-MS o LC-MS/MS). Esta técnica identifica la sustancia de forma definitiva y puede cuantificarla. Solo un resultado confirmado por cromatografía tiene valor en contextos médico-legales.",
      "El monitoreo terapéutico de fármacos mide la concentración de un medicamento en sangre para verificar que esté en rango terapéutico: eficaz pero no tóxico. Los más monitoreados incluyen antiepilépticos, inmunosupresores, vancomicina, aminoglucósidos y digoxina.",
      "Los informes toxicológicos deben especificar si el resultado es de tamizaje o está confirmado por cromatografía. Los valores críticos, como paracetamol en rango de hepatotoxicidad, se comunican al médico de forma inmediata. Las consecuencias legales de un positivo requieren máxima precisión.",
    ],
    vocab: [
      { es: "toxicología clínica", pt: "toxicologia clínica" }, { es: "tamizaje toxicológico", pt: "triagem toxicológica" },
      { es: "falso positivo / reactividad cruzada", pt: "falso positivo / reatividade cruzada" },
      { es: "cromatografía / espectrometría", pt: "cromatografia / espectrometria" },
      { es: "monitoreo terapéutico", pt: "monitoramento terapêutico" }, { es: "rango terapéutico", pt: "faixa terapêutica" },
    ],
    quiz: [
      { question: "¿Qué detectan las pruebas de tamizaje toxicológico en orina?", options: ["Sustancias específicas con alta precisión", "Grupos de sustancias por encima de un umbral mediante inmunoensayo", "Solo drogas de abuso ilegales", "Solo medicamentos prescritos en dosis tóxicas"], answer: "Grupos de sustancias por encima de un umbral mediante inmunoensayo" },
      { question: "¿Qué limitación tienen las pruebas de tamizaje?", options: ["Son muy lentas para urgencias", "Pueden dar falsos positivos por reactividad cruzada con medicamentos legítimos", "Solo detectan una sustancia a la vez", "No pueden usarse en orina"], answer: "Pueden dar falsos positivos por reactividad cruzada con medicamentos legítimos" },
      { question: "¿Qué técnica confirma un positivo de tamizaje?", options: ["Repetir el mismo inmunoensayo", "Cromatografía acoplada a espectrometría de masas (GC-MS o LC-MS/MS)", "Análisis macroscópico de la muestra", "Prueba rápida de segunda generación"], answer: "Cromatografía acoplada a espectrometría de masas (GC-MS o LC-MS/MS)" },
      { question: "¿Por qué la confirmación por cromatografía tiene valor médico-legal?", options: ["Porque es más cara", "Porque identifica la sustancia de forma definitiva e inequívoca", "Por convención judicial solamente", "Porque es la única técnica acreditada"], answer: "Porque identifica la sustancia de forma definitiva e inequívoca" },
      { question: "¿Qué es el monitoreo terapéutico de fármacos?", options: ["Controlar que el paciente tome su medicación", "Medir la concentración en sangre para verificar eficacia y seguridad dentro del rango terapéutico", "Detectar drogas de abuso en pacientes tratados", "Verificar la calidad del medicamento dispensado"], answer: "Medir la concentración en sangre para verificar eficacia y seguridad dentro del rango terapéutico" },
      { question: "¿Qué fármacos se monitorean frecuentemente?", options: ["Solo antibióticos", "Antiepilépticos, inmunosupresores, vancomicina, aminoglucósidos y digoxina entre otros", "Solo medicamentos oncológicos", "Solo fármacos con ventana terapéutica amplia"], answer: "Antiepilépticos, inmunosupresores, vancomicina, aminoglucósidos y digoxina entre otros" },
      { question: "¿Qué debe especificar el informe toxicológico?", options: ["Solo el nombre de la sustancia", "Si es resultado de tamizaje no confirmado o confirmado por cromatografía", "Solo la concentración encontrada", "Solo si hay riesgo para la salud"], answer: "Si es resultado de tamizaje no confirmado o confirmado por cromatografía" },
      { question: "¿Qué valor crítico requiere comunicación inmediata?", options: ["Cualquier resultado positivo de tamizaje", "Paracetamol en rango de hepatotoxicidad, entre otros valores críticos establecidos", "Solo drogas ilegales", "Solo si el paciente está hospitalizado"], answer: "Paracetamol en rango de hepatotoxicidad, entre otros valores críticos establecidos" },
    ],
    dictation: "En toxicología clínica los resultados de tamizaje deben confirmarse por cromatografía antes de usarse en contextos médico-legales.",
  },
  {
    id: "parasitologia", title: "Parasitología básica", level: "Intermedio", category: "Laboratorio", emoji: "🦟",
    description: "Diagnóstico de parásitos intestinales y hematológicos en el laboratorio.",
    readingTitle: "El huésped invisible",
    reading: [
      "La parasitología de laboratorio estudia organismos parásitos como protozoos y helmintos. Aunque menos frecuentes en países de altos ingresos, siguen siendo causa importante de enfermedad en personas que viajan o migran desde zonas endémicas. El laboratorio juega un papel esencial en su diagnóstico.",
      "El examen coproparasitológico es la prueba más usada para parásitos intestinales. La muestra debe procesarse dentro de las dos horas o conservarse en fijador especial. El análisis incluye examen directo en fresco, técnicas de concentración y tinciones específicas según el caso.",
      "Los parásitos intestinales más frecuentes incluyen Giardia intestinalis, que causa diarrea crónica; Cryptosporidium, especialmente importante en inmunocomprometidos; Entamoeba histolytica, que puede causar disentería y absceso hepático; y helmintos como Áscaris, que causan anemia y desnutrición en niños.",
      "El diagnóstico de malaria requiere visualizar el parásito Plasmodium en extendido de sangre periférica teñido con Giemsa. Las pruebas rápidas de antígenos son más accesibles pero pueden tener menor sensibilidad. En pacientes con fiebre y viaje a zona endémica, el diagnóstico debe descartarse de forma urgente.",
      "La identificación correcta de parásitos requiere formación específica y experiencia, porque muchos tienen morfologías similares o pueden confundirse con artefactos del huésped. Los programas de control de calidad externo con láminas de referencia son especialmente importantes en esta área.",
    ],
    vocab: [
      { es: "parásito / parasitología", pt: "parasita / parasitologia" }, { es: "coproparasitológico", pt: "coproparasitológico" },
      { es: "protozoo / helminto", pt: "protozoário / helminto" }, { es: "Giardia / Entamoeba", pt: "Giardia / Entamoeba" },
      { es: "malaria / Plasmodium", pt: "malária / Plasmodium" }, { es: "extendido de sangre", pt: "esfregaço de sangue" },
    ],
    quiz: [
      { question: "¿Qué es el examen coproparasitológico?", options: ["Un análisis de orina para detectar parásitos", "El examen de materia fecal para diagnosticar parásitos intestinales", "Una prueba de sangre para parásitos sistémicos", "Una tinción especial de tejido intestinal"], answer: "El examen de materia fecal para diagnosticar parásitos intestinales" },
      { question: "¿Cuánto tiempo máximo antes de procesar la muestra fecal?", options: ["24 horas a temperatura ambiente", "Dentro de las dos horas o en fijador especial", "Solo 30 minutos exactos", "Hasta 6 horas refrigerada"], answer: "Dentro de las dos horas o en fijador especial" },
      { question: "¿Qué parásito es especialmente importante en inmunocomprometidos?", options: ["Áscaris lumbricoides", "Cryptosporidium", "Trichuris trichiura", "Entamoeba coli no patógena"], answer: "Cryptosporidium" },
      { question: "¿Qué coloración se usa para el diagnóstico de malaria?", options: ["Hematoxilina-eosina", "Giemsa en extendido de sangre periférica", "Gram modificado", "Papanicolaou"], answer: "Giemsa en extendido de sangre periférica" },
      { question: "¿Por qué el diagnóstico de malaria es urgente?", options: ["Por exigencia normativa", "Puede ser una emergencia médica en pacientes con fiebre y viaje a zona endémica", "Porque el parásito se degrada en la muestra rápidamente", "Solo si el paciente está hospitalizado"], answer: "Puede ser una emergencia médica en pacientes con fiebre y viaje a zona endémica" },
      { question: "¿Qué pueden causar los helmintos intestinales como Áscaris?", options: ["Solo molestias digestivas leves", "Anemia y desnutrición especialmente en niños", "Fiebre alta y sepsis", "Daño hepático severo siempre"], answer: "Anemia y desnutrición especialmente en niños" },
      { question: "¿Por qué la identificación de parásitos requiere formación específica?", options: ["Por exigencia normativa", "Porque muchos tienen morfologías similares o pueden confundirse con artefactos", "Solo requiere el microscopio correcto", "Se aprende en una sesión de práctica"], answer: "Porque muchos tienen morfologías similares o pueden confundirse con artefactos" },
      { question: "¿Qué puede causar la Entamoeba histolytica?", options: ["Solo diarrea leve autolimitada", "Disentería amebiana y absceso hepático", "Anemia por deficiencia de hierro", "Infecciones respiratorias recurrentes"], answer: "Disentería amebiana y absceso hepático" },
    ],
    dictation: "El examen coproparasitológico debe procesarse dentro de las dos horas de recolección para preservar la morfología de los parásitos intestinales.",
  },
  {
    id: "citologia", title: "Citología y anatomía patológica", level: "Avanzado", category: "Laboratorio", emoji: "🧬",
    description: "Procesamiento de muestras citológicas e histológicas y comunicación de resultados.",
    readingTitle: "La célula que lo dice todo",
    reading: [
      "La citología y la anatomía patológica estudian células y tejidos para detectar cambios morfológicos que indiquen enfermedad. A diferencia de la bioquímica que mide concentraciones, la patología evalúa estructuras: forma celular, tamaño, organización del tejido y presencia de células anormales. Esta información es frecuentemente decisiva en el diagnóstico de cáncer.",
      "La citología estudia células individuales obtenidas sin biopsia quirúrgica. La citología exfoliativa estudia células desprendidas espontáneamente, como el test de Papanicolaou que examina células cervicales para detección precoz de lesiones. La punción-aspiración con aguja fina (PAAF) obtiene células directamente de masas mediante una aguja fina.",
      "La histología estudia cortes de tejido obtenidos por biopsia. El tejido se fija en formalina para preservar su arquitectura, se procesa en parafina, se corta en secciones de pocos micrómetros y se tiñe. La tinción estándar es hematoxilina-eosina, que tiñe los núcleos de azul y el citoplasma de rosa.",
      "Los informes de anatomía patológica incluyen descripción macroscópica, descripción microscópica y diagnóstico final. Para muestras oncológicas se incluyen también grado histológico, márgenes de resección y estadio patológico, imprescindibles para las decisiones del equipo oncológico.",
      "El tiempo de respuesta en patología varía significativamente. Un diagnóstico intraoperatorio urgente puede darse en 30 minutos. Un histológico estándar toma 3 a 5 días hábiles. Estudios especiales como inmunohistoquímica añaden días. El laboratorio debe comunicar estos tiempos con claridad al médico.",
    ],
    vocab: [
      { es: "citología", pt: "citologia" }, { es: "biopsia / histología", pt: "biópsia / histologia" },
      { es: "Papanicolaou / PAP", pt: "Papanicolaou / PAP" }, { es: "diagnóstico histológico", pt: "diagnóstico histológico" },
      { es: "inmunohistoquímica", pt: "imuno-histoquímica" }, { es: "grado histológico", pt: "grau histológico" },
    ],
    quiz: [
      { question: "¿Qué diferencia a la citología de la histología?", options: ["No hay diferencia práctica", "La citología estudia células individuales; la histología estudia cortes de tejido completo", "La citología siempre requiere cirugía", "La histología es menos específica"], answer: "La citología estudia células individuales; la histología estudia cortes de tejido completo" },
      { question: "¿Qué estudia el test de Papanicolaou?", options: ["Células de la mucosa gástrica", "Células exfoliadas de la mucosa cervical para detección precoz de lesiones", "Bacterias de infecciones genitales", "Células de la mucosa bronquial"], answer: "Células exfoliadas de la mucosa cervical para detección precoz de lesiones" },
      { question: "¿Para qué se usa la formalina en histología?", options: ["Para teñir los núcleos celulares", "Para fijar el tejido y preservar su arquitectura antes del procesamiento", "Para disolver el tejido conectivo", "Para acelerar el procesamiento en parafina"], answer: "Para fijar el tejido y preservar su arquitectura antes del procesamiento" },
      { question: "¿Qué coloración histológica es la estándar?", options: ["PAS y Giemsa", "Hematoxilina-eosina", "Gram y Ziehl-Neelsen", "Papanicolaou y May-Grünwald"], answer: "Hematoxilina-eosina" },
      { question: "¿Qué información adicional incluyen los informes oncológicos?", options: ["Solo el diagnóstico final", "Grado histológico, márgenes de resección y estadio patológico", "Solo la descripción macroscópica", "Solo si la muestra fue adecuada o no"], answer: "Grado histológico, márgenes de resección y estadio patológico" },
      { question: "¿Cuánto tarda un diagnóstico histológico estándar?", options: ["30 minutos como la citología urgente", "Entre 3 y 5 días hábiles", "Exactamente 24 horas", "Solo 2 horas con equipos modernos"], answer: "Entre 3 y 5 días hábiles" },
      { question: "¿Qué es la inmunohistoquímica?", options: ["Una tinción estándar de rutina", "Un estudio especial que detecta proteínas específicas en el tejido mediante anticuerpos marcados", "Un método para obtener muestras sin biopsia", "Una técnica de citología exfoliativa"], answer: "Un estudio especial que detecta proteínas específicas en el tejido mediante anticuerpos marcados" },
      { question: "¿Qué debe comunicar el laboratorio sobre los tiempos en patología?", options: ["Solo avisar cuando el resultado esté listo", "Los tiempos esperados para cada tipo de estudio porque varían significativamente", "Que todos los resultados tardan lo mismo", "Solo si hay retrasos imprevistos"], answer: "Los tiempos esperados para cada tipo de estudio porque varían significativamente" },
    ],
    dictation: "La anatomía patológica evalúa células y tejidos con tiempos de respuesta que varían desde 30 minutos en urgencias intraoperatorias hasta 5 días en estudios especiales.",
  },
  // ══ GESTIÓN (+3) ══
  {
    id: "planificacion-calidad", title: "Planificación de la calidad", level: "Intermedio", category: "Gestión", emoji: "🗺️",
    description: "Objetivos SMART, ciclo PDCA y revisión por la dirección.",
    readingTitle: "Empezar por el final",
    reading: [
      "La planificación de la calidad define qué se quiere lograr y cómo. No es un evento anual sino una actividad continua que conecta los objetivos estratégicos con las acciones del día a día. Cuando funciona bien, cada analista entiende cómo su trabajo contribuye a los objetivos del sistema de gestión.",
      "El ciclo PDCA (Plan-Do-Check-Act) de Deming es el marco más utilizado. Plan: identificar el problema y diseñar la intervención. Do: implementarla a pequeña escala. Check: medir los resultados. Act: estandarizar lo que funcionó o ajustar y repetir. Es una herramienta de mejora continua aplicable a cualquier proceso.",
      "Los objetivos SMART deben ser Específicos, Medibles, Alcanzables, Relevantes y con Tiempo definido. 'Reducir el tiempo de respuesta de muestras urgentes en un 20% durante el primer trimestre' es SMART. 'Mejorar la calidad del servicio' no lo es, porque no puede gestionarse ni evaluarse.",
      "El plan de calidad anual organiza los objetivos del período con sus indicadores, acciones, responsables y recursos necesarios. Cuando está bien elaborado es la hoja de ruta del año: orienta prioridades y facilita la asignación de recursos y la evaluación del desempeño.",
      "La revisión por la dirección es una actividad formal de la ISO 15189 donde la alta dirección evalúa el desempeño del sistema. Analiza auditorías, indicadores, acciones correctivas, cambios organizacionales y recomendaciones de mejora. Las decisiones resultantes deben quedar documentadas.",
    ],
    vocab: [
      { es: "ciclo PDCA / Deming", pt: "ciclo PDCA / Deming" }, { es: "objetivo SMART", pt: "objetivo SMART" },
      { es: "plan de calidad", pt: "plano de qualidade" }, { es: "revisión por la dirección", pt: "análise crítica pela direção" },
      { es: "mejora continua", pt: "melhoria contínua" }, { es: "indicador de desempeño", pt: "indicador de desempenho" },
    ],
    quiz: [
      { question: "¿Qué es la planificación de la calidad?", options: ["Una auditoría anual del sistema", "El proceso de definir qué se quiere lograr en calidad y cómo lograrlo de forma continua", "Solo la elaboración de procedimientos", "El análisis de no conformidades del período"], answer: "El proceso de definir qué se quiere lograr en calidad y cómo lograrlo de forma continua" },
      { question: "¿Qué representa la fase 'Check' del PDCA?", options: ["Definir el problema y diseñar la solución", "Medir los resultados de la intervención y compararlos con lo esperado", "Implementar la solución a pequeña escala", "Estandarizar lo que funcionó"], answer: "Medir los resultados de la intervención y compararlos con lo esperado" },
      { question: "¿Qué significa la 'M' de SMART?", options: ["Motivador para el equipo", "Medible con un indicador definido", "Mínimamente viable", "Modificable si es necesario"], answer: "Medible con un indicador definido" },
      { question: "¿Qué incluye un plan de calidad anual?", options: ["Solo los objetivos sin detalles de implementación", "Objetivos, indicadores, acciones, responsables y recursos necesarios", "Solo las no conformidades del año anterior", "Solo el presupuesto del área de calidad"], answer: "Objetivos, indicadores, acciones, responsables y recursos necesarios" },
      { question: "¿Para qué sirve la revisión por la dirección?", options: ["Para auditar el trabajo del personal", "Para que la alta dirección evalúe el desempeño del sistema de calidad a intervalos planificados", "Para aprobar el presupuesto del laboratorio", "Solo para preparar auditorías externas"], answer: "Para que la alta dirección evalúe el desempeño del sistema de calidad a intervalos planificados" },
      { question: "¿Qué se analiza en la revisión por la dirección?", options: ["Solo los resultados económicos del período", "Auditorías, indicadores, acciones correctivas, cambios y recomendaciones de mejora", "Solo las quejas de los clientes", "Solo el estado del equipamiento"], answer: "Auditorías, indicadores, acciones correctivas, cambios y recomendaciones de mejora" },
      { question: "¿Cuándo un objetivo de calidad no es útil?", options: ["Cuando es demasiado ambicioso", "Cuando no cumple los criterios SMART y no puede gestionarse ni evaluarse", "Cuando involucra a muchos responsables", "Cuando requiere recursos adicionales"], answer: "Cuando no cumple los criterios SMART y no puede gestionarse ni evaluarse" },
      { question: "¿Qué fase del PDCA estandariza lo que funcionó?", options: ["Plan", "Do", "Check", "Act"], answer: "Act" },
    ],
    dictation: "Los objetivos de calidad deben ser SMART: específicos, medibles, alcanzables, relevantes y con tiempo definido para ser verdaderamente útiles.",
  },
  {
    id: "gestion-equipos", title: "Gestión de equipos e insumos", level: "Intermedio", category: "Gestión", emoji: "🔧",
    description: "Mantenimiento, control de stock y gestión de proveedores en el laboratorio.",
    readingTitle: "Cuando falta el reactivo",
    reading: [
      "La gestión de equipos e insumos es crítica: un equipo que falla sin plan de contingencia puede detener diagnósticos urgentes. Un reactivo agotado puede retrasar tratamientos. Una calibración vencida puede generar resultados incorrectos. La gestión proactiva es tan importante como el control de calidad analítico.",
      "El mantenimiento tiene tres niveles. El preventivo incluye limpieza, lubricación, reemplazo programado y verificaciones según el manual del fabricante. El correctivo es la reparación ante fallas. El predictivo monitorea parámetros del equipo para anticipar fallas antes de que ocurran.",
      "El control de stock equilibra dos riesgos opuestos: quedarse sin reactivos, que paraliza el procesamiento, y acumular demasiado, que puede llevar a que los reactivos venzan. El punto de reorden, la cantidad mínima a partir de la cual se genera un pedido, es el parámetro central del inventario.",
      "La gestión de proveedores va más allá del precio. Incluye evaluar calidad y soporte técnico, diversificar proveedores para reducir riesgo de desabastecimiento, negociar contratos de servicio para equipos críticos, y monitorear el desempeño del proveedor. Los proveedores críticos son los cuya falla impacta directamente el servicio.",
      "La trazabilidad de lotes es requisito de la ISO 15189: cada lote de reactivo, calibrador o control debe quedar registrado. Si se detecta un problema con un lote, el laboratorio debe poder identificar qué muestras se procesaron con ese lote y tomar las medidas correspondientes.",
    ],
    vocab: [
      { es: "mantenimiento preventivo", pt: "manutenção preventiva" }, { es: "punto de reorden", pt: "ponto de reposição" },
      { es: "stock / inventario", pt: "estoque / inventário" }, { es: "proveedor crítico", pt: "fornecedor crítico" },
      { es: "trazabilidad de lotes", pt: "rastreabilidade de lotes" }, { es: "calibrador / material de control", pt: "calibrador / material de controle" },
    ],
    quiz: [
      { question: "¿Por qué la gestión de equipos es crítica para la calidad?", options: ["Por exigencia burocrática normativa", "Porque un equipo que falla o un reactivo agotado puede detener diagnósticos urgentes", "Solo porque los equipos son costosos", "Solo por seguridad del personal"], answer: "Porque un equipo que falla o un reactivo agotado puede detener diagnósticos urgentes" },
      { question: "¿Qué incluye el mantenimiento preventivo?", options: ["Solo la reparación ante fallas", "Limpieza, lubricación, reemplazo programado y verificaciones según el manual", "Solo la calibración del equipo", "Solo la limpieza diaria"], answer: "Limpieza, lubricación, reemplazo programado y verificaciones según el manual" },
      { question: "¿Qué dos riesgos equilibra el control de stock?", options: ["Costo alto vs calidad baja", "Quedarse sin reactivos vs acumular hasta que venzan antes de usarse", "Comprar mucho vs comprar poco siempre", "Proveedor caro vs barato"], answer: "Quedarse sin reactivos vs acumular hasta que venzan antes de usarse" },
      { question: "¿Qué es el punto de reorden?", options: ["El precio máximo aceptable para un reactivo", "La cantidad mínima de stock a partir de la cual se genera un pedido", "El nivel de stock óptimo mensual", "La fecha de vencimiento del reactivo en uso"], answer: "La cantidad mínima de stock a partir de la cual se genera un pedido" },
      { question: "¿Qué incluye una gestión completa de proveedores?", options: ["Solo comparar precios", "Evaluación de calidad, diversificación, contratos de servicio y seguimiento del desempeño", "Solo verificar tiempos de entrega", "Solo asegurar certificaciones"], answer: "Evaluación de calidad, diversificación, contratos de servicio y seguimiento del desempeño" },
      { question: "¿Por qué la trazabilidad de lotes es importante?", options: ["Solo por requisito documental", "Permite identificar qué muestras se procesaron con un lote problemático y actuar", "Para facilitar la facturación", "Solo durante auditorías"], answer: "Permite identificar qué muestras se procesaron con un lote problemático y actuar" },
      { question: "¿Qué diferencia el mantenimiento predictivo del preventivo?", options: ["Son exactamente iguales", "El predictivo monitorea parámetros para anticipar fallas antes de que ocurran", "El preventivo es más sofisticado", "El predictivo solo aplica a equipos nuevos"], answer: "El predictivo monitorea parámetros para anticipar fallas antes de que ocurran" },
      { question: "¿Qué define a un proveedor como crítico?", options: ["Que tiene el precio más alto", "Que su falla puede impactar directamente la calidad o continuidad del servicio", "Que provee más del 50% de los insumos", "Que tiene contrato firmado"], answer: "Que su falla puede impactar directamente la calidad o continuidad del servicio" },
    ],
    dictation: "La gestión proactiva de equipos e insumos es tan importante como el control analítico porque previene interrupciones que afectan la calidad del servicio.",
  },
  {
    id: "formacion-personal", title: "Formación y competencia del personal", level: "Intermedio", category: "Gestión", emoji: "👨‍🏫",
    description: "Evaluación de competencias, inducción y desarrollo del equipo de laboratorio.",
    readingTitle: "El analista más valioso",
    reading: [
      "La ISO 15189 establece que todo el personal analítico debe poder demostrar en la práctica y de forma documentada que ejecuta correctamente sus procedimientos. Tener el título no es suficiente: se requiere evidencia de competencia. La gestión de competencias es un proceso continuo a lo largo de toda la vida laboral.",
      "La evaluación de competencias cubre: conocimiento teórico de los procedimientos; habilidades prácticas evaluadas por observación directa; capacidad de identificar y resolver problemas; manejo correcto del sistema informático; y comprensión de los requisitos de calidad y seguridad del área.",
      "La inducción de un analista nuevo es crítica. Incluye información general del laboratorio, conocimiento de instalaciones y seguridad, revisión de procedimientos operativos y un período de entrenamiento supervisado antes de trabajar de forma autónoma. Debe estar documentada y firmada.",
      "La evaluación continua verifica periódicamente que el personal mantiene su competencia. Incluye evaluación del desempeño en controles de calidad, participación en evaluación externa, observación directa y análisis de muestras ciegas, es decir, muestras de identidad desconocida para el analista.",
      "El desarrollo profesional continuo incluye congresos, cursos, grupos de trabajo, lectura científica e implementación de nuevas técnicas. Un laboratorio que invierte en su personal retiene mejor a los buenos profesionales y mejora constantemente su capacidad técnica.",
    ],
    vocab: [
      { es: "competencia / evaluación de competencias", pt: "competência / avaliação de competências" },
      { es: "inducción", pt: "integração / indução" }, { es: "entrenamiento supervisado", pt: "treinamento supervisionado" },
      { es: "evaluación continua", pt: "avaliação contínua" }, { es: "desarrollo profesional", pt: "desenvolvimento profissional" },
      { es: "muestra ciega", pt: "amostra cega" },
    ],
    quiz: [
      { question: "¿Qué establece la ISO 15189 sobre la competencia del personal?", options: ["Solo que tengan el título académico", "Que demuestren en la práctica y documentadamente que ejecutan correctamente sus procedimientos", "Solo que hayan completado la inducción", "Que tengan más de dos años de experiencia"], answer: "Que demuestren en la práctica y documentadamente que ejecutan correctamente sus procedimientos" },
      { question: "¿Qué aspectos cubre la evaluación de competencias?", options: ["Solo el conocimiento teórico", "Teoría, habilidades prácticas, resolución de problemas, manejo informático y comprensión de calidad", "Solo la observación directa del trabajo", "Solo los resultados de controles de calidad"], answer: "Teoría, habilidades prácticas, resolución de problemas, manejo informático y comprensión de calidad" },
      { question: "¿Qué debe ocurrir antes de que un analista nuevo trabaje de forma autónoma?", options: ["Solo leer los procedimientos", "Completar una inducción con entrenamiento supervisado documentado y firmado", "Realizar solo una prueba escrita", "Trabajar solo el primer día sin supervisión"], answer: "Completar una inducción con entrenamiento supervisado documentado y firmado" },
      { question: "¿Qué diferencia la evaluación continua de la inducción?", options: ["Son lo mismo con distinto nombre", "La evaluación continua verifica periódicamente que se mantiene la competencia con el tiempo", "La inducción es más completa que la evaluación continua", "La evaluación continua solo aplica en los primeros seis meses"], answer: "La evaluación continua verifica periódicamente que se mantiene la competencia con el tiempo" },
      { question: "¿Qué es una muestra ciega en la evaluación de competencias?", options: ["Una muestra sin etiqueta por error", "Una muestra de identidad desconocida para el analista usada para evaluar su desempeño real", "Una muestra con resultados muy bajos", "Un control de calidad normal"], answer: "Una muestra de identidad desconocida para el analista usada para evaluar su desempeño real" },
      { question: "¿Qué incluye el desarrollo profesional continuo?", options: ["Solo cursos obligatorios con certificado", "Congresos, cursos, grupos de trabajo, lectura científica e implementación de nuevas técnicas", "Solo las evaluaciones de desempeño anuales", "Solo actividades pagadas por el laboratorio"], answer: "Congresos, cursos, grupos de trabajo, lectura científica e implementación de nuevas técnicas" },
      { question: "¿Cuándo se realiza la gestión de competencias?", options: ["Solo al contratar personal nuevo", "Es un proceso continuo durante toda la vida laboral del analista en el laboratorio", "Solo antes de una auditoría de acreditación", "Solo cuando hay quejas sobre el desempeño"], answer: "Es un proceso continuo durante toda la vida laboral del analista en el laboratorio" },
      { question: "¿Por qué invertir en desarrollo profesional ayuda a retener al personal?", options: ["Porque aumenta los salarios automáticamente", "Porque los profesionales valoran el crecimiento y el reconocimiento de su desarrollo", "Solo por un requisito normativo", "Porque reduce la carga de trabajo individual"], answer: "Porque los profesionales valoran el crecimiento y el reconocimiento de su desarrollo" },
    ],
    dictation: "La competencia del personal debe evaluarse continuamente mediante observación directa, controles de calidad y participación en programas de evaluación externa.",
  },
  // ══ COMUNICACIÓN (+3) ══
  {
    id: "comunicacion-crisis", title: "Comunicación en crisis", level: "Avanzado", category: "Comunicación", emoji: "🚒",
    description: "Gestión de la comunicación durante incidentes, fallas y situaciones de emergencia.",
    readingTitle: "Cuando todo falla al mismo tiempo",
    reading: [
      "Las crisis en el laboratorio pueden ser fallas tecnológicas masivas, incidentes de seguridad, resultados mal comunicados con daño al paciente, o auditorías que detectan problemas graves. En todas ellas, la forma en que se comunica determina en gran medida el impacto final del evento.",
      "El principio fundamental es la transparencia rápida. Esperar a tener toda la información genera un vacío que se llena de rumores y pérdida de confianza. Comunicar pronto con lo que se sabe, aunque sea parcial, y comprometerse a actualizar cuando haya más información, es más efectivo.",
      "La comunicación interna debe seguir la cadena jerárquica de inmediato: analista al supervisor, supervisor al director técnico, director a la dirección institucional y áreas afectadas. Saltear eslabones genera problemas adicionales. Cada nivel tiene su propio rol y decisiones.",
      "La comunicación externa requiere un portavoz designado y un mensaje coherente. Si un médico llama durante una falla, la respuesta debe incluir qué ocurrió, qué se está haciendo, cuándo se espera la resolución y qué hacer mientras tanto. Mensajes contradictorios generan desconfianza.",
      "Después de resolver la crisis, el cierre formal incluye comunicar que el problema fue resuelto, su causa, lo que se hizo y las medidas para que no se repita. Ese cierre transforma una crisis en una demostración de madurez institucional.",
    ],
    vocab: [
      { es: "comunicación en crisis", pt: "comunicação em crise" }, { es: "portavoz", pt: "porta-voz" },
      { es: "transparencia rápida", pt: "transparência rápida" }, { es: "cadena de comunicación", pt: "cadeia de comunicação" },
      { es: "cierre de incidente", pt: "encerramento de incidente" }, { es: "mensaje coherente", pt: "mensagem coerente" },
    ],
    quiz: [
      { question: "¿Cuál es el principio fundamental de la comunicación en crisis?", options: ["Esperar a tener toda la información antes de comunicar", "Transparencia rápida: comunicar pronto con lo que se sabe y comprometerse a actualizar", "Minimizar el problema para reducir el impacto", "Solo comunicar a las autoridades reguladoras"], answer: "Transparencia rápida: comunicar pronto con lo que se sabe y comprometerse a actualizar" },
      { question: "¿Qué genera el silencio durante una crisis?", options: ["Tranquilidad en los afectados", "Un vacío que se llena de rumores y pérdida de confianza", "Tiempo para resolver sin presión", "Respeto por la gravedad de la situación"], answer: "Un vacío que se llena de rumores y pérdida de confianza" },
      { question: "¿Cómo debe fluir la comunicación interna durante una crisis?", options: ["Directamente a la dirección salteando supervisores", "Siguiendo la cadena: analista, supervisor, director, institución y áreas afectadas", "Solo entre los directamente involucrados", "A través del sistema informático únicamente"], answer: "Siguiendo la cadena: analista, supervisor, director, institución y áreas afectadas" },
      { question: "¿Por qué se designa un portavoz para la comunicación externa?", options: ["Para reducir la carga del director técnico", "Para asegurar un mensaje coherente y evitar información contradictoria", "Por exigencia normativa solamente", "Para que el resto del personal no deba comunicar nada"], answer: "Para asegurar un mensaje coherente y evitar información contradictoria" },
      { question: "¿Qué debe incluir la respuesta a un médico durante una falla del sistema?", options: ["Solo que hay un problema técnico en resolución", "Qué ocurrió, qué se está haciendo, cuándo se resuelve y qué hacer mientras tanto", "Solo el tiempo estimado de resolución", "Redirigirlo al área de soporte técnico"], answer: "Qué ocurrió, qué se está haciendo, cuándo se resuelve y qué hacer mientras tanto" },
      { question: "¿Por qué la comunicación post-crisis es importante?", options: ["Es solo un formalismo innecesario", "Demuestra madurez institucional y puede fortalecer la relación con los afectados", "Solo es necesaria si hubo consecuencias graves", "Solo para cumplir requisitos documentales"], answer: "Demuestra madurez institucional y puede fortalecer la relación con los afectados" },
      { question: "¿Qué incluye el cierre formal de una crisis?", options: ["Solo la disculpa formal por los inconvenientes", "Que el problema se resolvió, la causa, lo que se hizo y las medidas para que no se repita", "Solo el informe técnico para el archivo", "Solo la comunicación a organismos reguladores"], answer: "Que el problema se resolvió, la causa, lo que se hizo y las medidas para que no se repita" },
      { question: "¿Qué tipos de crisis pueden ocurrir en un laboratorio?", options: ["Solo fallas tecnológicas", "Fallas tecnológicas, incidentes de seguridad, resultados mal comunicados y problemas de auditoría", "Solo incidentes que afectan a los pacientes directamente", "Solo problemas internos sin impacto externo"], answer: "Fallas tecnológicas, incidentes de seguridad, resultados mal comunicados y problemas de auditoría" },
    ],
    dictation: "Durante una crisis comunicar rápido con la información disponible y comprometerse a actualizar es más efectivo que esperar el cuadro completo.",
  },
  {
    id: "espanol-numeros", title: "Números y datos en español", level: "Básico", category: "Comunicación", emoji: "🔢",
    description: "Cómo leer, expresar y comunicar números, fechas y datos técnicos en español.",
    readingTitle: "Los números que confunden",
    reading: [
      "Los números son el corazón de la comunicación técnica del laboratorio: valores de resultados, rangos de referencia, concentraciones, fechas y horarios. Comunicarlos correctamente en español es una habilidad práctica esencial, con diferencias importantes respecto al portugués y al inglés.",
      "En español la coma es el separador decimal: 5,4 mg/dL. El punto separa los miles: 1.250.000. En contextos científicos con software en inglés puede aparecer el punto decimal, generando confusiones. El analista debe estar atento a qué convención usa cada sistema.",
      "Las fechas siguen el orden día/mes/año, igual que en portugués, pero la pronunciación es diferente: 'el quince de marzo de dos mil veinticinco'. Los días y meses se escriben con minúscula en español. Los porcentajes se escriben con espacio: 35 % entre número y símbolo.",
      "Las horas en contextos técnicos se expresan en formato de 24 horas: 'a las catorce horas y treinta minutos' o simplemente '14:30'. Los años se dicen 'dos mil veinticinco', nunca 'veinte veinticinco' como en inglés. Los identificadores numéricos se leen dígito a dígito.",
      "Las fracciones se expresan como 'tres de ocho', 'tres sobre ocho' o '3/8'. Las proporciones en informes técnicos se expresan como 'dos de cada tres pacientes' o '67 %'. Conocer estas convenciones evita errores y malentendidos en la comunicación de datos.",
    ],
    vocab: [
      { es: "coma decimal / punto de miles", pt: "vírgula decimal / ponto de milhar" },
      { es: "el quince de marzo", pt: "quinze de março" }, { es: "por ciento / porcentaje", pt: "por cento / percentagem" },
      { es: "a las 14:30 horas", pt: "às 14h30" }, { es: "dos mil veinticinco", pt: "dois mil e vinte e cinco" },
      { es: "rango de referencia", pt: "valor de referência" },
    ],
    quiz: [
      { question: "¿Cómo se escribe el separador decimal en español?", options: ["Con punto: 5.4", "Con coma: 5,4", "Con guión: 5-4", "Sin separador: 54"], answer: "Con coma: 5,4" },
      { question: "¿Cómo se escribe el porcentaje en español formal?", options: ["35% sin espacio", "35 % con espacio entre número y símbolo", "%35 antes del número", "Treinta y cinco% siempre con letras"], answer: "35 % con espacio entre número y símbolo" },
      { question: "¿Cómo se leen las fechas en español?", options: ["Mes/día/año como en inglés", "Día/mes/año: el quince de marzo de dos mil veinticinco", "Año/mes/día como formato ISO", "Solo con números: 15-03-2025"], answer: "Día/mes/año: el quince de marzo de dos mil veinticinco" },
      { question: "¿Se escriben los meses con mayúscula en español?", options: ["Sí, siempre con mayúscula", "No, los meses se escriben con minúscula en español", "Solo cuando inician una oración", "Depende del contexto formal o informal"], answer: "No, los meses se escriben con minúscula en español" },
      { question: "¿Cómo se expresa el año 2025 en español?", options: ["Veinte veinticinco como en inglés", "Dos mil veinticinco", "Dos mil y veinticinco", "Veinte y veinticinco"], answer: "Dos mil veinticinco" },
      { question: "¿Cómo se expresan las horas en contextos técnicos?", options: ["En formato 12 horas con AM/PM", "En formato 24 horas: a las catorce horas treinta o 14:30", "Solo con la hora sin minutos", "Solo en formato digital"], answer: "En formato 24 horas: a las catorce horas treinta o 14:30" },
      { question: "¿Qué puede causar confusión con los decimales en el laboratorio?", options: ["El tamaño de los números", "Que algunos sistemas usan punto decimal (inglés) mientras el español usa coma", "La cantidad de cifras significativas", "El orden de los dígitos"], answer: "Que algunos sistemas usan punto decimal (inglés) mientras el español usa coma" },
      { question: "¿Cómo se expresa 'dos tercios' como porcentaje aproximado?", options: ["El 50 %", "El 67 %", "El 75 %", "El 33 %"], answer: "El 67 %" },
    ],
    dictation: "En español técnico la coma es el separador decimal y el punto separa los miles a diferencia del inglés donde se usan al revés.",
  },
  {
    id: "feedback-tecnico", title: "Dar y recibir feedback técnico", level: "Intermedio", category: "Comunicación", emoji: "💬",
    description: "Comunicar observaciones, correcciones y reconocimientos en el entorno laboral.",
    readingTitle: "La conversación que mejora el equipo",
    reading: [
      "El feedback es una de las herramientas más valiosas y más evitadas en el entorno laboral. Darlo requiere superar la incomodidad de hablar sobre el desempeño de otra persona. Recibirlo requiere apertura para escuchar información difícil. Cuando ambas habilidades están presentes en un equipo, la mejora continua se vuelve posible.",
      "El feedback constructivo sobre un error técnico tiene estructura clara. Primero, describir el comportamiento observado de forma específica y objetiva, sin juicios de valor: 'En las últimas tres corridas el control superó el límite sin que se registrara ninguna acción'. Segundo, describir el impacto. Tercero, solicitar un cambio específico.",
      "El feedback positivo es tan importante como el correctivo y frecuentemente se subestima. Un reconocimiento efectivo es específico (qué hizo bien exactamente), oportuno (cercano al momento) y genuino. 'Hoy manejaste muy bien la situación con el médico: escuchaste, explicaste con calma y resolviste' es efectivo. 'Buen trabajo' sola no lo es.",
      "En español para introducir feedback correctivo: 'Quiero comentarte algo que observé', 'Me gustaría darte una devolución sobre...'. Para reconocer buen desempeño: 'Quiero reconocer cómo manejaste...'. Para pedir aclaración al recibir: '¿Podés darme un ejemplo específico?', '¿Qué hubieras hecho diferente en mi lugar?'.",
      "Recibir feedback en una segunda lengua agrega complejidad. Estrategias útiles: escuchar completo sin interrumpir, confirmar comprensión preguntando '¿Entiendo bien que te referís a...?', agradecer aunque sea difícil, y pedir tiempo para reflexionar si es necesario.",
    ],
    vocab: [
      { es: "feedback / retroalimentación", pt: "feedback / retroalimentação" }, { es: "devolución constructiva", pt: "devolutiva construtiva" },
      { es: "reconocimiento / elogio", pt: "reconhecimento / elogio" }, { es: "comportamiento observable", pt: "comportamento observável" },
      { es: "dar una devolución", pt: "dar um feedback" }, { es: "solicitar aclaración", pt: "pedir esclarecimento" },
    ],
    quiz: [
      { question: "¿Cuál es la estructura del feedback constructivo sobre un error?", options: ["Criticar directamente el error y sus consecuencias", "Describir el comportamiento, describir el impacto y solicitar un cambio específico", "Solo pedir que no se repita el error", "Escribir un correo formal con copia a supervisores"], answer: "Describir el comportamiento, describir el impacto y solicitar un cambio específico" },
      { question: "¿Por qué el feedback debe ser objetivo sin juicios?", options: ["Para evitar conflictos legales", "Porque los juicios de valor generan defensividad; los hechos facilitan la conversación", "Por exigencia del protocolo de recursos humanos", "Para que quede documentado en el legajo"], answer: "Porque los juicios de valor generan defensividad; los hechos facilitan la conversación" },
      { question: "¿Qué hace efectivo un reconocimiento positivo?", options: ["Que sea largo y muy detallado", "Que sea específico, oportuno y genuino", "Que se dé siempre en público frente al equipo", "Que incluya comparación con otros colegas"], answer: "Que sea específico, oportuno y genuino" },
      { question: "¿Por qué 'buen trabajo' sola no es un reconocimiento efectivo?", options: ["Porque es demasiado informal", "Porque no describe qué se hizo bien exactamente", "Porque puede generar envidia en el equipo", "Porque no queda registrado formalmente"], answer: "Porque no describe qué se hizo bien exactamente" },
      { question: "¿Cómo se introduce feedback correctivo en español de forma respetuosa?", options: ["'Estás haciendo todo mal'", "'Quiero comentarte algo que observé' o 'Me gustaría darte una devolución sobre...'", "'Tenés que mejorar urgentemente'", "'El procedimiento dice que deberías...'"], answer: "'Quiero comentarte algo que observé' o 'Me gustaría darte una devolución sobre...'" },
      { question: "¿Qué estrategia ayuda al recibir feedback en una segunda lengua?", options: ["Responder inmediatamente para mostrar comprensión", "Escuchar completo, confirmar comprensión y pedir tiempo para reflexionar si es necesario", "Aceptar todo sin preguntar para evitar malentendidos", "Pedir que lo escriban en lugar de hablar"], answer: "Escuchar completo, confirmar comprensión y pedir tiempo para reflexionar si es necesario" },
      { question: "¿Cómo se pide aclaración al recibir feedback?", options: ["Diciendo que no se entiende el idioma", "'¿Entiendo bien que te referís a...?' o '¿Podés darme un ejemplo específico?'", "Repitiendo exactamente lo que dijo el otro", "Cambiando el tema de la conversación"], answer: "'¿Entiendo bien que te referís a...?' o '¿Podés darme un ejemplo específico?'" },
      { question: "¿Por qué el feedback se evita con frecuencia en el entorno laboral?", options: ["Por falta de tiempo en la rutina", "Por la incomodidad natural de hablar directamente sobre el desempeño de otra persona", "Porque no tiene impacto real en el desempeño", "Porque requiere formación especializada en recursos humanos"], answer: "Por la incomodidad natural de hablar directamente sobre el desempeño de otra persona" },
    ],
    dictation: "Un feedback efectivo describe el comportamiento observado explica su impacto y solicita un cambio específico sin juicios de valor sobre la persona.",
  },
  // ══ TECNOLOGÍA (+3) ══
  {
    id: "ciberseguridad", title: "Ciberseguridad en el laboratorio", level: "Avanzado", category: "Tecnología", emoji: "🛡️",
    description: "Amenazas cibernéticas, protección de sistemas y buenas prácticas de seguridad.",
    readingTitle: "El ataque que nadie esperaba",
    reading: [
      "Los hospitales y laboratorios clínicos se han convertido en objetivos frecuentes de ataques cibernéticos. El ransomware cifra los datos y exige rescate económico, llegando a paralizar operaciones durante días con impacto directo sobre la atención a los pacientes.",
      "Las principales amenazas son: ransomware; phishing (correos fraudulentos que engañan para revelar credenciales o descargar malware); ataques de fuerza bruta contra contraseñas débiles; vulnerabilidades en sistemas sin actualizar; y amenazas internas, tanto intencionales como accidentales del propio personal.",
      "La defensa no depende solo de TI sino de cada usuario. El eslabón más débil es frecuentemente el propio personal. Buenas prácticas básicas: no hacer clic en enlaces no solicitados, no descargar adjuntos desconocidos, usar contraseñas fuertes y únicas, bloquear la pantalla al alejarse y reportar comportamientos sospechosos.",
      "La segmentación de la red limita el impacto de los ataques. Si los equipos analíticos están en un segmento separado de la red administrativa, un ataque en un equipo de trabajo no se propaga fácilmente hacia los instrumentos. Esta separación es una medida de defensa en profundidad.",
      "El plan de respuesta a incidentes establece qué hacer durante un ataque: quién se notifica primero, cómo se aíslan los sistemas afectados, cómo se evalúa el alcance, cómo se restaura desde backups y cómo se comunica el incidente. Tenerlo elaborado y practicado es la diferencia entre una recuperación ordenada y el caos.",
    ],
    vocab: [
      { es: "ciberseguridad", pt: "cibersegurança" }, { es: "ransomware / malware", pt: "ransomware / malware" },
      { es: "phishing", pt: "phishing" }, { es: "vulnerabilidad", pt: "vulnerabilidade" },
      { es: "plan de respuesta a incidentes", pt: "plano de resposta a incidentes" }, { es: "amenaza interna", pt: "ameaça interna" },
    ],
    quiz: [
      { question: "¿Qué es el ransomware?", options: ["Un virus que borra archivos permanentemente", "Malware que cifra los datos y exige rescate económico para recuperarlos", "Un ataque que roba contraseñas", "Un programa espía que registra las teclas"], answer: "Malware que cifra los datos y exige rescate económico para recuperarlos" },
      { question: "¿Qué es el phishing?", options: ["Un ataque de fuerza bruta contra contraseñas", "Correos fraudulentos que engañan para revelar credenciales o descargar malware", "Un tipo de ransomware específico", "Un ataque desde dentro de la organización"], answer: "Correos fraudulentos que engañan para revelar credenciales o descargar malware" },
      { question: "¿Cuál es el eslabón más débil en ciberseguridad?", options: ["El firewall perimetral", "El propio usuario con sus comportamientos cotidianos", "El servidor de base de datos", "El sistema operativo sin actualizar"], answer: "El propio usuario con sus comportamientos cotidianos" },
      { question: "¿Qué buena práctica debe seguir todo usuario?", options: ["Compartir contraseñas solo con colegas de confianza", "No hacer clic en enlaces no solicitados y reportar comportamientos sospechosos", "Cambiar la contraseña solo cuando el sistema lo obligue", "Descargar software útil aunque sea de fuente desconocida"], answer: "No hacer clic en enlaces no solicitados y reportar comportamientos sospechosos" },
      { question: "¿Cómo ayuda la segmentación de red ante un ataque?", options: ["Acelera la detección del ataque", "Limita la propagación del ataque entre segmentos de la red", "Elimina completamente el riesgo de ransomware", "Permite recuperar datos sin necesidad de backups"], answer: "Limita la propagación del ataque entre segmentos de la red" },
      { question: "¿Para qué sirve el plan de respuesta a incidentes?", options: ["Para cumplir normativas de protección de datos", "Para establecer qué hacer durante un ataque: notificaciones, aislamiento, evaluación y restauración", "Solo para asegurar que los backups estén actualizados", "Para comunicar el incidente a los medios"], answer: "Para establecer qué hacer durante un ataque: notificaciones, aislamiento, evaluación y restauración" },
      { question: "¿Qué diferencia una recuperación ordenada de un caos?", options: ["El tipo de antivirus instalado", "Tener el plan de respuesta elaborado y practicado previamente", "La velocidad de la conexión a internet", "El número de técnicos en el equipo de TI"], answer: "Tener el plan de respuesta elaborado y practicado previamente" },
      { question: "¿Qué incluyen las amenazas internas en ciberseguridad?", options: ["Solo ataques externos camuflados como internos", "Tanto acciones intencionales como accidentales del propio personal", "Solo exempleados descontentos", "Solo errores de configuración del administrador"], answer: "Tanto acciones intencionales como accidentales del propio personal" },
    ],
    dictation: "La ciberseguridad depende de cada usuario: contraseñas fuertes, no hacer clic en enlaces sospechosos y reportar anomalías son hábitos esenciales.",
  },
  {
    id: "cloud-computing", title: "Nube y servicios en la nube", level: "Intermedio", category: "Tecnología", emoji: "☁️",
    description: "Cloud computing aplicado al laboratorio: SaaS, privacidad y consideraciones prácticas.",
    readingTitle: "Cuando los datos viven en otro lugar",
    reading: [
      "La computación en la nube provee servicios informáticos a través de internet desde infraestructura gestionada por un proveedor externo. Los recursos no residen en servidores locales del laboratorio. Muchos laboratorios han migrado a la nube buscando escalabilidad, accesibilidad y reducción de costos de mantenimiento.",
      "Los tres modelos principales son IaaS (infraestructura virtualizada), PaaS (plataforma para desarrollar aplicaciones) y SaaS (software como servicio). El SaaS es el más común en laboratorios: el proveedor gestiona todo y el laboratorio accede por navegador. Los LIMS basados en la nube son un ejemplo creciente.",
      "Las ventajas del LIMS en la nube incluyen acceso desde cualquier dispositivo con internet, actualizaciones automáticas siempre en la versión más reciente, backups gestionados por el proveedor y eliminación de la necesidad de servidores locales. La desventaja principal es la dependencia de la conectividad.",
      "La privacidad es la principal preocupación al migrar a la nube. Antes de firmar deben responderse: ¿dónde están físicamente los datos?, ¿qué legislación aplica?, ¿qué ocurre ante un incidente de seguridad del proveedor?, ¿qué pasa con los datos si termina el contrato?",
      "Para laboratorios con datos de salud, las regulaciones son especialmente estrictas. El proveedor debe cumplir regulaciones locales de privacidad, ofrecer cifrado en tránsito y en reposo, tener certificaciones de seguridad reconocidas y proporcionar contratos de procesamiento de datos claros. Esto no es opcional: es una obligación legal y ética.",
    ],
    vocab: [
      { es: "nube / cloud computing", pt: "nuvem / computação em nuvem" }, { es: "SaaS / IaaS / PaaS", pt: "SaaS / IaaS / PaaS" },
      { es: "cifrado en tránsito / en reposo", pt: "criptografia em trânsito / em repouso" },
      { es: "soberanía de datos", pt: "soberania de dados" }, { es: "escalabilidad", pt: "escalabilidade" },
      { es: "proveedor de nube", pt: "provedor de nuvem" },
    ],
    quiz: [
      { question: "¿Qué es el cloud computing?", options: ["Software instalado en cada equipo del laboratorio", "Servicios informáticos a través de internet desde infraestructura gestionada externamente", "Una red local de alta velocidad", "Un sistema de backup automático local"], answer: "Servicios informáticos a través de internet desde infraestructura gestionada externamente" },
      { question: "¿Qué modelo de nube es más común en laboratorios?", options: ["IaaS con infraestructura virtualizada", "SaaS donde el proveedor gestiona todo y el laboratorio accede por navegador", "PaaS para desarrollar aplicaciones propias", "Nube privada exclusivamente en servidores propios"], answer: "SaaS donde el proveedor gestiona todo y el laboratorio accede por navegador" },
      { question: "¿Cuál es una ventaja clave de un LIMS basado en la nube?", options: ["Mayor velocidad de procesamiento analítico", "Acceso desde cualquier dispositivo y actualizaciones automáticas siempre vigentes", "Eliminación completa del riesgo de pérdida de datos", "Mayor control de seguridad que con servidores locales"], answer: "Acceso desde cualquier dispositivo y actualizaciones automáticas siempre vigentes" },
      { question: "¿Cuál es la principal desventaja de los servicios en la nube?", options: ["El costo siempre es más alto que servidores locales", "La dependencia de la conectividad a internet y las consideraciones de privacidad", "La imposibilidad de hacer backups", "La necesidad de más personal técnico especializado"], answer: "La dependencia de la conectividad a internet y las consideraciones de privacidad" },
      { question: "¿Qué preguntas clave deben responderse antes de firmar con un proveedor de nube?", options: ["Solo el precio mensual del servicio", "Dónde están los datos, qué legislación aplica, qué ocurre ante incidentes y al terminar el contrato", "Solo la velocidad de acceso garantizada", "Solo las condiciones de soporte técnico"], answer: "Dónde están los datos, qué legislación aplica, qué ocurre ante incidentes y al terminar el contrato" },
      { question: "¿Qué significa cifrado en reposo?", options: ["Los datos están cifrados mientras viajan por internet", "Los datos están cifrados cuando están almacenados en los servidores del proveedor", "El servidor está apagado y cifrado", "Los datos solo se cifran durante los backups"], answer: "Los datos están cifrados cuando están almacenados en los servidores del proveedor" },
      { question: "¿Por qué elegir bien el proveedor de nube no es opcional para datos de salud?", options: ["Por preferencia técnica del equipo de TI", "Porque es una obligación legal y ética cumplir con las regulaciones de privacidad de datos de pacientes", "Solo porque los pacientes lo prefieren", "Solo para obtener la acreditación ISO 15189"], answer: "Porque es una obligación legal y ética cumplir con las regulaciones de privacidad de datos de pacientes" },
      { question: "¿Qué es la escalabilidad en el contexto de la nube?", options: ["La capacidad de conectar múltiples laboratorios", "Aumentar o disminuir recursos según necesidades sin grandes inversiones de infraestructura", "La velocidad de transferencia de datos", "La compatibilidad con múltiples sistemas operativos"], answer: "Aumentar o disminuir recursos según necesidades sin grandes inversiones de infraestructura" },
    ],
    dictation: "Los servicios en la nube ofrecen escalabilidad y accesibilidad pero requieren verificar que el proveedor cumpla las regulaciones de privacidad de datos de pacientes.",
  },
  {
    id: "ia-laboratorio", title: "IA en el laboratorio", level: "Avanzado", category: "Tecnología", emoji: "🤖",
    description: "Aplicaciones de inteligencia artificial y machine learning en el laboratorio clínico.",
    readingTitle: "La máquina que aprende a ver",
    reading: [
      "La inteligencia artificial está transformando el laboratorio clínico. Las aplicaciones van desde algoritmos que detectan valores atípicos en controles de calidad hasta redes neuronales que clasifican imágenes de morfología celular con precisión comparable a la de un especialista. Esta transformación es acelerada y el analista del futuro deberá comprender estas herramientas.",
      "En el control de calidad, los algoritmos de IA detectan tendencias con mayor sensibilidad que las reglas de Westgard. Pueden identificar patrones sutiles de deriva antes de que los controles superen los límites de advertencia, correlacionar parámetros de mantenimiento con el desempeño analítico y generar alertas predictivas.",
      "En morfología hematológica, los sistemas de IA realizan el recuento diferencial de leucocitos con una precisión que se aproxima a la del especialista. No reemplazan al analista: presentan una clasificación preliminar que él verifica, especialmente en casos anómalos. El resultado es mayor productividad sin pérdida de calidad.",
      "La interpretación integrada de resultados es otra área promisoria. Algoritmos entrenados con millones de historiales identifican combinaciones inusuales, alertan sobre diagnósticos posibles y predicen riesgo de complicaciones. Actúan como soporte a la decisión clínica, no como reemplazo del juicio médico.",
      "La implementación de IA plantea desafíos: la validación es más compleja (debe evaluarse en diferentes poblaciones y contextos), la transparencia del algoritmo es crucial en contextos médicos, y la responsabilidad legal ante errores donde contribuyó la IA sigue siendo una pregunta sin respuesta definitiva.",
    ],
    vocab: [
      { es: "inteligencia artificial / IA", pt: "inteligência artificial / IA" }, { es: "machine learning", pt: "aprendizado de máquina" },
      { es: "red neuronal", pt: "rede neural" }, { es: "soporte a la decisión clínica", pt: "apoio à decisão clínica" },
      { es: "validación de algoritmos", pt: "validação de algoritmos" }, { es: "algoritmo predictivo", pt: "algoritmo preditivo" },
    ],
    quiz: [
      { question: "¿Cómo mejora la IA el control de calidad analítico?", options: ["Eliminando la necesidad de controles de calidad", "Detectando tendencias y patrones de deriva antes de que superen los límites tradicionales", "Reemplazando completamente las reglas de Westgard", "Calibrando los equipos automáticamente"], answer: "Detectando tendencias y patrones de deriva antes de que superen los límites tradicionales" },
      { question: "¿Qué hace la IA en morfología hematológica?", options: ["Reemplaza completamente al analista en todos los casos", "Presenta una clasificación preliminar que el analista verifica, especialmente en casos anómalos", "Solo cuenta el número total de células sin clasificar", "Toma la decisión final sin intervención humana"], answer: "Presenta una clasificación preliminar que el analista verifica, especialmente en casos anómalos" },
      { question: "¿Qué resultado produce la combinación de IA y analista en morfología?", options: ["Menor calidad por la dependencia tecnológica", "Mayor productividad sin pérdida de calidad", "Igual productividad con menor costo", "Solo beneficios en laboratorios grandes"], answer: "Mayor productividad sin pérdida de calidad" },
      { question: "¿Qué hace la IA en la interpretación integrada de resultados?", options: ["Emite diagnósticos definitivos sin revisión médica", "Identifica combinaciones inusuales como soporte a la decisión, sin reemplazar el juicio médico", "Solo organiza los resultados en el informe", "Detecta errores de transcripción únicamente"], answer: "Identifica combinaciones inusuales como soporte a la decisión, sin reemplazar el juicio médico" },
      { question: "¿Por qué validar algoritmos de IA es más complejo?", options: ["Porque la IA siempre falla en casos poco frecuentes", "Debe evaluarse en diferentes poblaciones, equipos y contextos, no solo en condiciones estándar", "Porque no existen normas para validar IA en salud", "Porque los algoritmos cambian constantemente solos"], answer: "Debe evaluarse en diferentes poblaciones, equipos y contextos, no solo en condiciones estándar" },
      { question: "¿Qué plantea la IA respecto a la responsabilidad legal?", options: ["Siempre es responsable el fabricante del algoritmo", "Es un desafío no resuelto: quién responde ante un error donde contribuyó la IA", "El médico nunca es responsable si usó IA", "Solo hay responsabilidad si el algoritmo no estaba validado"], answer: "Es un desafío no resuelto: quién responde ante un error donde contribuyó la IA" },
      { question: "¿Qué es la transparencia de un algoritmo de IA?", options: ["Que el código fuente sea público", "La capacidad de explicar por qué el algoritmo tomó una determinada decisión", "Que funcione igual en todos los laboratorios", "Que sus resultados sean siempre positivos o negativos sin grises"], answer: "La capacidad de explicar por qué el algoritmo tomó una determinada decisión" },
      { question: "¿Cómo describe el texto el rol de la IA respecto al analista?", options: ["La IA reemplaza al analista en tareas rutinarias", "Asiste al analista aumentando productividad sin reemplazar su juicio en casos complejos", "El analista solo opera la IA", "Trabajan de forma completamente independiente"], answer: "Asiste al analista aumentando productividad sin reemplazar su juicio en casos complejos" },
    ],
    dictation: "La inteligencia artificial en el laboratorio asiste al analista detectando patrones y alertas pero no reemplaza su juicio profesional en los casos complejos.",
  },
  // ══ GRAMÁTICA (+3) ══
  {
    id: "gerundio", title: "Gerundio y perífrasis verbales", level: "Intermedio", category: "Gramática", emoji: "⚙️",
    description: "Uso del gerundio y las perífrasis más frecuentes del español técnico.",
    readingTitle: "La acción que continúa",
    reading: [
      "El gerundio termina en -ando (verbos en -ar) o -iendo (verbos en -er/-ir). A diferencia del portugués donde tiene usos muy amplios como forma progresiva principal, en español su uso es más restringido. El empleo excesivo o incorrecto del gerundio es uno de los errores más frecuentes de los hablantes de portugués en español.",
      "El gerundio en español se usa para acciones simultáneas al verbo principal: 'El analista realizó la calibración verificando los controles'. Para expresar modo: 'Explicó el procedimiento mostrando cada paso'. Y en perífrasis con estar, seguir, continuar: 'El equipo está procesando las muestras urgentes'.",
      "Un error muy frecuente es usar gerundio donde el español requiere infinitivo. 'Necesito ayuda para entender el resultado' (correcto), no 'para entendiendo'. 'Al llegar las muestras' (correcto), no 'al llegando'. 'Antes de procesar' (correcto), no 'antes de procesando'.",
      "Las perífrasis verbales combinan un auxiliar con infinitivo o gerundio: 'hay que + infinitivo' (hay que verificar los controles), 'tener que + infinitivo' (tenemos que comunicar el resultado), 'deber + infinitivo' (debe documentar), 'acabar de + infinitivo' (acabamos de recalibrar), 'volver a + infinitivo' (hay que volver a repetir).",
      "La distinción entre presente simple y progresivo es importante en el laboratorio. 'El equipo procesa las muestras' (habitual, en general) es diferente de 'El equipo está procesando' (en este momento específico). En el lenguaje técnico del laboratorio, el presente simple es mucho más frecuente que la perífrasis progresiva.",
    ],
    vocab: [
      { es: "gerundio (-ando, -iendo)", pt: "gerúndio (-ando, -endo)" }, { es: "estar procesando", pt: "estar processando" },
      { es: "hay que / tener que / deber", pt: "há que / ter que / dever" }, { es: "acabar de + infinitivo", pt: "acabar de + infinitivo" },
      { es: "volver a + infinitivo", pt: "voltar a + infinitivo" }, { es: "perífrasis verbal", pt: "perífrase verbal" },
    ],
    quiz: [
      { question: "¿Cuáles son las terminaciones del gerundio en español?", options: ["-endo para todos los verbos", "-ando para -ar y -iendo para -er/-ir", "-iendo para todos los verbos", "-ando para -ar y -endo para -er/-ir"], answer: "-ando para -ar y -iendo para -er/-ir" },
      { question: "¿Para qué se usa el gerundio en español?", options: ["Como forma progresiva principal igual que en portugués", "Para acciones simultáneas, modo y perífrasis con estar/seguir/continuar", "Solo en textos formales escritos", "Para acciones futuras inciertas"], answer: "Para acciones simultáneas, modo y perífrasis con estar/seguir/continuar" },
      { question: "¿Cuál es correcto en español?", options: ["Necesito ayuda para entendiendo el resultado", "Necesito ayuda para entender el resultado", "Necesito ayuda por entender el resultado", "Necesito ayuda entendiendo el resultado"], answer: "Necesito ayuda para entender el resultado" },
      { question: "¿Qué expresa 'acabar de + infinitivo'?", options: ["Que una acción comenzará muy pronto", "Que una acción se completó muy recientemente", "Que una acción no pudo completarse", "Que una acción se repite con frecuencia"], answer: "Que una acción se completó muy recientemente" },
      { question: "¿Qué diferencia 'el equipo procesa' de 'está procesando'?", options: ["No hay diferencia real entre las dos formas", "'Procesa' es habitual/general; 'está procesando' es en este momento específico", "'Está procesando' es más formal que 'procesa'", "'Procesa' es pasado y 'está procesando' es presente"], answer: "'Procesa' es habitual/general; 'está procesando' es en este momento específico" },
      { question: "¿Qué expresa 'hay que + infinitivo'?", options: ["Una acción futura planificada", "Una obligación impersonal sin sujeto específico", "Una acción recién completada", "Una recomendación sin obligación"], answer: "Una obligación impersonal sin sujeto específico" },
      { question: "¿Qué expresa 'volver a + infinitivo'?", options: ["Que la acción es por primera vez", "Que la acción se repite o se realiza de nuevo", "Que la acción se completó finalmente", "Que la acción fue interrumpida"], answer: "Que la acción se repite o se realiza de nuevo" },
      { question: "¿En qué difiere el gerundio entre español y portugués?", options: ["Son exactamente iguales en ambos idiomas", "En portugués el gerundio es más amplio como progresivo; en español se prefiere el presente simple", "En español el gerundio es obligatorio en frases progresivas", "En portugués solo se usa en textos formales"], answer: "En portugués el gerundio es más amplio como progresivo; en español se prefiere el presente simple" },
    ],
    dictation: "Hay que verificar los controles antes de comenzar y si el equipo está procesando muestras urgentes hay que esperar a que termine la corrida.",
  },
  {
    id: "cortesia-formal", title: "Cortesía y registro formal", level: "Básico", category: "Gramática", emoji: "🎩",
    description: "Niveles de formalidad, tratamiento de usted y expresiones de cortesía en español.",
    readingTitle: "El tono que abre puertas",
    reading: [
      "El español tiene un sistema de tratamiento muy marcado: la diferencia entre 'tú' y 'usted' es social y gramatical. En el laboratorio clínico, usar 'usted' con los médicos, clientes y directivos es la norma estándar, especialmente en el primer contacto o en situaciones formales.",
      "'Usted' requiere conjugar en tercera persona singular: '¿Usted tiene el número de solicitud?'. Para más de una persona formal, se usa 'ustedes' con verbo en tercera persona plural. En Argentina y gran parte de Latinoamérica, 'vosotros' prácticamente no se usa en el habla cotidiana.",
      "Las fórmulas formales escritas más usadas: 'Estimado doctor García:', 'De mi mayor consideración:', 'Quedo a su disposición para cualquier consulta', 'Saludo a usted atentamente'. En conversación formal: 'Buenos días, soy... del laboratorio, ¿podría hablar con el doctor García?'.",
      "Las expresiones de disculpa y agradecimiento formales: 'Le pido disculpas por el retraso en los resultados' es más profesional que un simple 'perdón'. 'Le agradezco su paciencia durante el tiempo de espera' transmite mayor profesionalismo. 'Quedamos a su entera disposición para cualquier consulta adicional' es el cierre estándar.",
      "En Argentina el 'vos' informal reemplaza al 'tú' peninsular entre colegas del mismo nivel jerárquico. 'Vos' tiene conjugaciones propias: sabés, tenés, podés. El cambio entre 'vos' y 'usted' con la misma persona según el contexto es natural y esperado en el entorno laboral argentino.",
    ],
    vocab: [
      { es: "usted / ustedes (formal)", pt: "o senhor / a senhora (formal)" }, { es: "vos (informal Argentina)", pt: "você (informal Brasil)" },
      { es: "estimado / de mi consideración", pt: "estimado / prezado" }, { es: "quedo a su disposición", pt: "fico à sua disposição" },
      { es: "le pido disculpas", pt: "peço desculpas" }, { es: "le agradezco", pt: "agradeço-lhe" },
    ],
    quiz: [
      { question: "¿Con qué persona del verbo se conjuga 'usted'?", options: ["Segunda persona del singular (tú)", "Tercera persona del singular", "Primera persona del plural", "Segunda persona del plural"], answer: "Tercera persona del singular" },
      { question: "¿Cuándo se usa 'usted' en el laboratorio?", options: ["Solo con personas mayores de 60 años", "Con médicos, clientes y directivos, especialmente en primer contacto y situaciones formales", "Solo en documentos escritos formales", "Con cualquier persona que no conozcas"], answer: "Con médicos, clientes y directivos, especialmente en primer contacto y situaciones formales" },
      { question: "¿Cómo se saluda formalmente en un correo a un médico?", options: ["'Hola doctor García:'", "'Estimado doctor García:'", "'Sr. García,'", "'Para el doctor García:'"], answer: "'Estimado doctor García:'" },
      { question: "¿Qué cierre es apropiado para un correo formal?", options: ["'Chau, hasta pronto'", "'Quedo a su disposición para cualquier consulta. Saluda atentamente'", "'Espero tu respuesta pronto'", "'Te mando un saludo'"], answer: "'Quedo a su disposición para cualquier consulta. Saluda atentamente'" },
      { question: "¿Cómo se conjuga 'saber' con 'vos' en Argentina?", options: ["vos sabes", "vos sabés", "vos sabe", "vos sabéis"], answer: "vos sabés" },
      { question: "¿Cuál es una disculpa profesional apropiada ante un retraso?", options: ["'Perdón por el retraso, no fue mi culpa'", "'Le pido disculpas por el retraso en los resultados'", "'Sorry por la demora'", "'El retraso no es grave, no se preocupe'"], answer: "'Le pido disculpas por el retraso en los resultados'" },
      { question: "¿El 'vos' informal argentino es aceptable entre colegas del mismo nivel?", options: ["No, siempre debe usarse 'usted' en el trabajo", "Sí, entre pares en contextos informales el cambio entre 'vos' y 'usted' es natural", "Solo si ambas personas son de Argentina", "Solo fuera del horario laboral"], answer: "Sí, entre pares en contextos informales el cambio entre 'vos' y 'usted' es natural" },
      { question: "¿Qué transmite 'le agradezco su paciencia' vs un simple 'gracias'?", options: ["Son equivalentes en contenido y registro", "Mayor profesionalismo y reconocimiento específico del esfuerzo del interlocutor", "Solo una variante regional sin diferencia real", "Es menos sincero porque es más formal"], answer: "Mayor profesionalismo y reconocimiento específico del esfuerzo del interlocutor" },
    ],
    dictation: "En el contexto profesional se usa usted con médicos y clientes: estimado doctor le agradezco su atención y quedo a su disposición.",
  },
  {
    id: "sintagmas-tecnicos", title: "Colocaciones técnicas", level: "Intermedio", category: "Gramática", emoji: "🔤",
    description: "Combinaciones de palabras frecuentes en el español del laboratorio clínico.",
    readingTitle: "Las palabras que van juntas",
    reading: [
      "Las colocaciones son combinaciones habituales de palabras que suenan naturales en el idioma. No son reglas gramaticales sino usos convencionales. Conocerlas marca la diferencia entre un hablante fluido y uno que suena artificial. En el laboratorio clínico hay colocaciones muy específicas que conviene aprender como unidades.",
      "Verbos frecuentes con sus colocaciones: 'procesar muestras' (no 'analizar muestras' en ese sentido), 'liberar resultados', 'rechazar muestras o corridas', 'detectar desviaciones o tendencias', 'emitir informes', 'realizar calibraciones', 'validar métodos'. Estas combinaciones son las más frecuentes en la comunicación técnica diaria.",
      "El verbo 'fazer/hacer' muy amplio en portugués se reemplaza por verbos más específicos en el español técnico formal: 'realizar' (una calibración, un mantenimiento), 'efectuar' (un cambio), 'llevar a cabo' (un procedimiento complejo), 'ejecutar' (un protocolo). Esta especificidad es característica del registro técnico.",
      "Los sustantivos también tienen combinaciones preferidas: 'resultado de análisis', 'solicitud de análisis', 'informe de resultados', 'validación del método', 'recepción de muestras', 'programa de control'. Aprender estas combinaciones completas es más eficiente que memorizar palabras sueltas.",
      "Las preposiciones forman parte de las colocaciones y generan errores frecuentes. En español: 'responsable de calidad' (no 'por calidad'), 'a cargo de' (el analista a cargo del turno), 'en conformidad con la norma', 'de acuerdo con el procedimiento'. Memorizar la colocación completa con su preposición es la estrategia correcta.",
    ],
    vocab: [
      { es: "colocación / sintagma fijo", pt: "colocação / sintagma fixo" }, { es: "procesar muestras", pt: "processar amostras" },
      { es: "liberar / validar / emitir resultados", pt: "liberar / validar / emitir resultados" },
      { es: "llevar a cabo / realizar / efectuar", pt: "realizar / efetuar / levar a cabo" },
      { es: "responsable de calidad", pt: "responsável pela qualidade" }, { es: "en conformidad con", pt: "em conformidade com" },
    ],
    quiz: [
      { question: "¿Qué son las colocaciones técnicas?", options: ["Reglas gramaticales obligatorias del idioma", "Combinaciones habituales de palabras que suenan naturales en el idioma", "Palabras técnicas con un solo significado posible", "Expresiones que solo se usan en textos muy formales"], answer: "Combinaciones habituales de palabras que suenan naturales en el idioma" },
      { question: "¿Qué verbo se combina naturalmente con 'muestras' en sentido técnico específico?", options: ["analizar muestras únicamente", "procesar muestras como colocación técnica", "hacer muestras como traducción del portugués", "trabajar muestras en sentido amplio"], answer: "procesar muestras como colocación técnica" },
      { question: "¿Cuál suena más natural en el lenguaje técnico formal?", options: ["hacer una calibración", "realizar una calibración", "efectuar una calibración siempre", "llevar a cabo una calibración nunca"], answer: "realizar una calibración" },
      { question: "¿Cómo se dice correctamente en español técnico?", options: ["responsable por calidad", "responsable de calidad", "responsable en calidad", "responsable para calidad"], answer: "responsable de calidad" },
      { question: "¿Qué expresa 'en conformidad con la norma'?", options: ["bajo la norma", "en cumplimiento de la norma / de acuerdo con la norma", "por la norma", "según la norma únicamente"], answer: "en cumplimiento de la norma / de acuerdo con la norma" },
      { question: "¿Por qué aprender colocaciones completas es más eficiente?", options: ["Porque reduce el número de palabras a memorizar", "Porque permite construir frases naturales sin pensar en cada combinación individual", "Porque las colocaciones son siempre más cortas", "Porque son iguales en todos los idiomas"], answer: "Porque permite construir frases naturales sin pensar en cada combinación individual" },
      { question: "¿Cuál NO es colocación natural con 'resultados' en español técnico?", options: ["liberar resultados", "validar resultados", "cocinar resultados", "emitir resultados"], answer: "cocinar resultados" },
      { question: "¿Cuál es la expresión correcta para la tarea del analista de turno?", options: ["analista por cargo del turno", "analista a cargo del turno", "analista en cargo del turno", "analista con cargo del turno"], answer: "analista a cargo del turno" },
    ],
    dictation: "El analista a cargo del turno debe realizar la calibración, procesar las muestras en conformidad con el procedimiento y liberar los resultados validados.",
  },
  // ══ CONTROLLAB — EMPRESA ══
  {
    id: "controllab-historia", title: "Historia de Controllab", level: "Básico", category: "Controllab", emoji: "🏛️",
    description: "Origen, crecimiento y misión de Controllab en el ecosistema de calidad analítica.",
    readingTitle: "De Rio de Janeiro al mundo",
    reading: [
      "Controllab nació en Rio de Janeiro, Brasil, con una visión clara: ayudar a los laboratorios a medir mejor. Desde sus primeros años, la empresa se especializó en el diseño y distribución de programas de control de calidad externo para laboratorios clínicos, un nicho técnico que en Latinoamérica estaba poco desarrollado y que representaba una necesidad real del sector.",
      "A lo largo de los años, Controllab fue expandiendo su oferta de servicios más allá del control externo de calidad. Incorporó la producción de materiales de referencia, el desarrollo de programas de ensayos de aptitud para diferentes matrices y analitos, y la organización de actividades educativas como cursos técnicos, workshops y congresos. Esa diversificación le permitió consolidarse como una empresa de referencia en calidad analítica para toda la región.",
      "La expansión geográfica de Controllab fue gradual pero sostenida. Partiendo de una base de clientes principalmente brasileños, la empresa fue construyendo presencia en los países hispanoablantes de Latinoamérica, incluyendo Argentina, Chile, Colombia, México y otros. Esa expansión requirió adaptar materiales, comunicaciones y servicios a las particularidades de cada mercado, incluyendo el idioma y las regulaciones locales.",
      "El foco de Controllab siempre estuvo en la ciencia y en la mejora práctica del laboratorio. Sus programas de ensayos de aptitud están diseñados no solo para evaluar el desempeño de los laboratorios participantes, sino también para educarlos: cada informe incluye análisis estadísticos, comparaciones con los pares y recomendaciones para mejorar. Esa filosofía pedagógica es parte del ADN de la empresa.",
      "Hoy Controllab atiende a miles de laboratorios en toda Latinoamérica, en sectores que van desde la clínica hasta la industria alimentaria, farmacéutica, ambiental y universitaria. Su equipo de profesionales combina experiencia técnica en áreas como bioquímica, estadística, metrología y gestión de calidad con una vocación de servicio y de educación continua del sector.",
    ],
    vocab: [
      { es: "ensayo de aptitud", pt: "ensaio de aptidão / proficiência" }, { es: "control externo de calidad", pt: "controle externo de qualidade" },
      { es: "material de referencia", pt: "material de referência" }, { es: "metrología", pt: "metrologia" },
      { es: "laboratorio participante", pt: "laboratório participante" }, { es: "expansión regional", pt: "expansão regional" },
    ],
    quiz: [
      { question: "¿Dónde nació Controllab?", options: ["São Paulo, Brasil", "Rio de Janeiro, Brasil", "Buenos Aires, Argentina", "Bogotá, Colombia"], answer: "Rio de Janeiro, Brasil" },
      { question: "¿Cuál fue el primer foco de especialización de Controllab?", options: ["Producción de materiales de referencia", "Programas de control de calidad externo para laboratorios clínicos", "Consultoría en sistemas de gestión", "Organización de congresos científicos"], answer: "Programas de control de calidad externo para laboratorios clínicos" },
      { question: "¿Qué servicios incorporó Controllab en su expansión?", options: ["Solo control externo de calidad", "Materiales de referencia, ensayos de aptitud y actividades educativas", "Solo consultoría empresarial", "Solo distribución de reactivos"], answer: "Materiales de referencia, ensayos de aptitud y actividades educativas" },
      { question: "¿En qué sectores opera Controllab actualmente?", options: ["Solo laboratorios clínicos", "Clínica, industria alimentaria, farmacéutica, ambiental y universitaria", "Solo industria farmacéutica", "Solo laboratorios universitarios"], answer: "Clínica, industria alimentaria, farmacéutica, ambiental y universitaria" },
      { question: "¿Qué caracteriza la filosofía pedagógica de los informes de Controllab?", options: ["Solo muestran si el laboratorio aprobó o no", "Incluyen análisis estadísticos, comparaciones con pares y recomendaciones de mejora", "Son confidenciales y no incluyen retroalimentación", "Solo muestran el puntaje final"], answer: "Incluyen análisis estadísticos, comparaciones con pares y recomendaciones de mejora" },
      { question: "¿Qué requirió la expansión de Controllab a países hispanohablantes?", options: ["Solo traducir los materiales al español", "Adaptar materiales, comunicaciones y servicios a particularidades de cada mercado incluyendo idioma y regulaciones", "Abrir oficinas en todos los países de la región", "Solo contratar personal local"], answer: "Adaptar materiales, comunicaciones y servicios a particularidades de cada mercado incluyendo idioma y regulaciones" },
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
      "Un laboratorio que procesa muestras de pacientes o de productos industriales todos los días enfrenta una pregunta fundamental: ¿cómo sé que mis resultados son correctos? El control interno le dice si el método es reproducible dentro de su propio sistema, pero no le dice si sus valores están alineados con los que obtendrían otros laboratorios procesando la misma muestra. Esa pregunta es la que responde el ensayo de aptitud.",
      "Un ensayo de aptitud, también llamado programa de proficiency testing o PT, consiste en que un organismo coordinador, como Controllab, distribuye muestras idénticas a múltiples laboratorios participantes. Cada laboratorio analiza la muestra con sus propios métodos, equipos y reactivos, y reporta sus resultados al coordinador. El coordinador compila todos los resultados, los analiza estadísticamente y emite un informe de desempeño para cada participante.",
      "El indicador central del desempeño en un ensayo de aptitud es el z-score o puntaje z. Se calcula dividiendo la diferencia entre el resultado del laboratorio y el valor de referencia del programa por la desviación estándar del grupo. Un z-score entre -2 y +2 indica desempeño satisfactorio. Un z-score entre 2 y 3 (en valor absoluto) es una señal de alerta. Un z-score mayor a 3 indica desempeño insatisfactorio.",
      "Cuando un laboratorio obtiene un resultado insatisfactorio en un ensayo de aptitud, la respuesta correcta no es el pánico sino la investigación sistemática. ¿El problema está en la calibración? ¿En el lote de reactivo? ¿En el procedimiento de medición? ¿En la forma en que el personal ejecuta el análisis? La investigación de la causa raíz debe documentarse y las acciones correctivas implementadas deben verificarse en el siguiente ciclo del programa.",
      "Los ensayos de aptitud de Controllab cubren una gran variedad de analitos y matrices: bioquímica clínica, hematología, coagulación, microbiología, uroanálisis, inmunología, toxicología, alimentos, agua, suelos y más. Esa diversidad le permite atender a laboratorios de muy diferentes sectores con programas específicamente diseñados para sus necesidades analíticas y para los requisitos de las normas de acreditación aplicables.",
    ],
    vocab: [
      { es: "ensayo de aptitud / proficiency testing", pt: "ensaio de aptidão / proficiência" }, { es: "z-score / puntaje z", pt: "z-score / escore z" },
      { es: "organismo coordinador", pt: "organismo coordenador" }, { es: "valor de referencia", pt: "valor de referência" },
      { es: "desempeño satisfactorio / insatisfactorio", pt: "desempenho satisfatório / insatisfatório" }, { es: "muestra de aptitud", pt: "amostra de proficiência" },
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
  {
    id: "controllab-sigma", title: "Métricas Sigma en el laboratorio", level: "Avanzado", category: "Controllab", emoji: "📊",
    description: "Cómo aplicar el Six Sigma al desempeño analítico con las herramientas de Controllab.",
    readingTitle: "El sigma que evalúa la excelencia",
    reading: [
      "El concepto de Six Sigma proviene de la industria manufacturera, donde fue desarrollado por Motorola en los años ochenta para medir y mejorar la calidad de los procesos productivos. En el laboratorio clínico, este concepto fue adaptado por el Dr. James Westgard y sus colaboradores para evaluar el desempeño de los métodos analíticos. La métrica sigma del laboratorio combina información de precisión y exactitud del método con los requisitos de calidad del analito.",
      "La fórmula de la métrica sigma es: Sigma = (TEa - |sesgo|) / CV, donde TEa es el error total admisible para ese analito (el máximo error que puede tener el resultado sin afectar la decisión clínica), el sesgo es el error sistemático del método (obtenido del ensayo de aptitud o de la comparación con un método de referencia), y el CV es el coeficiente de variación (que representa la imprecisión del método).",
      "La interpretación de la métrica sigma tiene valores de referencia bien establecidos. Un sigma mayor a 6 indica un método de desempeño excelente: puede usar reglas de control muy simples y baja frecuencia de controles sin perder calidad. Un sigma entre 4 y 6 es bueno: requiere reglas de Westgard estándar. Un sigma entre 3 y 4 es marginal: necesita reglas más estrictas y mayor frecuencia de controles. Un sigma menor a 3 indica desempeño inaceptable que requiere mejora del método.",
      "Controllab integra el cálculo de métricas sigma en sus programas de ensayos de aptitud. A partir de los resultados de sesgo obtenidos en el PT y combinándolos con los datos de CV del propio laboratorio, los informes de desempeño permiten calcular la métrica sigma de cada analito. Esa información es extremadamente valiosa para el responsable de calidad del laboratorio porque orienta de forma objetiva las prioridades de mejora.",
      "El diagrama de Método de Decisión OPSpecs, también desarrollado por Westgard y disponible en las herramientas de Controllab, permite visualizar la relación entre el desempeño analítico (sesgo y CV) y las reglas de control recomendadas. Es una herramienta gráfica que simplifica la toma de decisiones sobre qué reglas de Westgard aplicar a cada método en función de su desempeño real medido.",
    ],
    vocab: [
      { es: "métrica sigma", pt: "métrica sigma" }, { es: "error total admisible (TEa)", pt: "erro total admissível (ETa)" },
      { es: "sesgo / imprecisión", pt: "viés / imprecisão" }, { es: "coeficiente de variación (CV)", pt: "coeficiente de variação (CV)" },
      { es: "Six Sigma", pt: "Seis Sigma" }, { es: "diagrama OPSpecs", pt: "diagrama OPSpecs" },
    ],
    quiz: [
      { question: "¿De dónde proviene el concepto de Six Sigma aplicado al laboratorio?", options: ["De la norma ISO 15189 específicamente", "De la industria manufacturera, adaptado al laboratorio clínico por el Dr. Westgard", "Del sistema sanitario europeo", "Del programa de acreditación de la OMS"], answer: "De la industria manufacturera, adaptado al laboratorio clínico por el Dr. Westgard" },
      { question: "¿Cuál es la fórmula de la métrica sigma del laboratorio?", options: ["Sigma = sesgo / CV", "Sigma = (TEa - |sesgo|) / CV", "Sigma = CV / TEa", "Sigma = TEa × CV"], answer: "Sigma = (TEa - |sesgo|) / CV" },
      { question: "¿Qué representa el TEa en la fórmula de sigma?", options: ["El coeficiente de variación del método", "El error total admisible: el máximo error sin afectar la decisión clínica", "El sesgo medido en el ensayo de aptitud", "La desviación estándar del grupo de laboratorios"], answer: "El error total admisible: el máximo error sin afectar la decisión clínica" },
      { question: "¿Qué indica un sigma mayor a 6?", options: ["Desempeño inaceptable que requiere mejora urgente", "Desempeño marginal que necesita reglas estrictas", "Desempeño excelente con reglas simples y baja frecuencia de controles", "Desempeño bueno con reglas estándar de Westgard"], answer: "Desempeño excelente con reglas simples y baja frecuencia de controles" },
      { question: "¿Qué indica un sigma menor a 3?", options: ["Desempeño excelente que no requiere controles", "Desempeño inaceptable que requiere mejora del método analítico", "Desempeño bueno con reglas simples", "Señal de alerta que puede ignorarse si el PT es satisfactorio"], answer: "Desempeño inaceptable que requiere mejora del método analítico" },
      { question: "¿Cómo integra Controllab el sigma en sus programas?", options: ["Solo lo menciona en sus materiales educativos", "Combina el sesgo del PT con el CV del laboratorio para calcular sigma en los informes de desempeño", "El sigma lo calcula el laboratorio de forma independiente", "Solo aplica a laboratorios con acreditación ISO 17025"], answer: "Combina el sesgo del PT con el CV del laboratorio para calcular sigma en los informes de desempeño" },
      { question: "¿Para qué sirve el diagrama OPSpecs?", options: ["Para calcular el z-score de cada ensayo de aptitud", "Para visualizar la relación entre desempeño y reglas de control recomendadas de forma gráfica", "Para determinar el valor de referencia del programa", "Para registrar los resultados de control interno"], answer: "Para visualizar la relación entre desempeño y reglas de control recomendadas de forma gráfica" },
      { question: "¿Qué valor práctico tiene la métrica sigma para el responsable de calidad?", options: ["Solo cumple con un requisito formal de la norma", "Orienta de forma objetiva las prioridades de mejora del laboratorio", "Solo sirve para comunicar resultados al directorio", "Es solo un indicador académico sin aplicación práctica"], answer: "Orienta de forma objetiva las prioridades de mejora del laboratorio" },
    ],
    dictation: "La métrica sigma combina el error total admisible, el sesgo del ensayo de aptitud y el coeficiente de variación para evaluar el desempeño analítico.",
  },
  {
    id: "controllab-materiales", title: "Materiales de referencia", level: "Intermedio", category: "Controllab", emoji: "🧪",
    description: "Qué son, para qué sirven y cómo se usan los materiales de referencia de Controllab.",
    readingTitle: "El patrón que todo laboratorio necesita",
    reading: [
      "Un material de referencia es una sustancia o mezcla con propiedades suficientemente homogéneas y estables para ser usada en la calibración de equipos, la validación de métodos o el control de calidad del proceso analítico. A diferencia de los reactivos comerciales comunes, los materiales de referencia tienen valores de propiedades determinados con alta precisión mediante procedimientos metrológicos rigurosos.",
      "Controllab produce y distribuye materiales de referencia para distintos sectores analíticos. Los materiales de referencia certificados (MRC) tienen un certificado que especifica los valores de las propiedades junto con su incertidumbre de medición, determinados mediante procedimientos metrológicamente trazables. Esa trazabilidad es lo que les da autoridad analítica y es un requisito de normas como ISO 17025 e ISO 15189.",
      "En el laboratorio clínico, los materiales de referencia se usan para tres propósitos principales. El primero es la calibración de los equipos analíticos: el material de referencia tiene un valor conocido que el equipo debe medir correctamente para que su calibración sea aceptada. El segundo es la validación de métodos: se mide el material de referencia para verificar que el método da resultados exactos. El tercero es el control interno de calidad: se usan como controles de desempeño del sistema.",
      "La trazabilidad metrológica es el concepto que conecta el resultado de una medición con un patrón de referencia internacional a través de una cadena ininterrumpida de calibraciones. Cuando un laboratorio usa un material de referencia certificado trazable al Sistema Internacional de Unidades (SI), sus resultados son comparables con los de cualquier otro laboratorio del mundo que use el mismo estándar. Esa comparabilidad es esencial para la interpretación clínica de los resultados.",
      "Los materiales de referencia de Controllab cubren matrices diversas: suero, plasma, orina, agua, alimentos, suelos y otros. Para cada matriz, los materiales están formulados para simular las condiciones reales de las muestras de pacientes o de los productos analizados. La estabilidad del material durante el período de uso declarado en el certificado es un parámetro crítico que Controllab evalúa y garantiza.",
    ],
    vocab: [
      { es: "material de referencia certificado (MRC)", pt: "material de referência certificado (MRC)" },
      { es: "trazabilidad metrológica", pt: "rastreabilidade metrológica" }, { es: "incertidumbre de medición", pt: "incerteza de medição" },
      { es: "calibración trazable", pt: "calibração rastreável" }, { es: "comparabilidad de resultados", pt: "comparabilidade de resultados" },
      { es: "matriz del material", pt: "matriz do material" },
    ],
    quiz: [
      { question: "¿Qué es un material de referencia?", options: ["Un reactivo comercial de alta calidad", "Una sustancia con propiedades determinadas con alta precisión para calibración, validación o control de calidad", "Un estándar solo usado en investigación académica", "Un control de calidad interno sin certificación"], answer: "Una sustancia con propiedades determinadas con alta precisión para calibración, validación o control de calidad" },
      { question: "¿Qué diferencia a un MRC de un material de referencia sin certificar?", options: ["Solo el precio más alto del MRC", "El MRC tiene certificado con valores e incertidumbre determinados por procedimientos metrológicamente trazables", "El MRC es producido por organismos gubernamentales únicamente", "El MRC no requiere condiciones especiales de almacenamiento"], answer: "El MRC tiene certificado con valores e incertidumbre determinados por procedimientos metrológicamente trazables" },
      { question: "¿Cuáles son los tres usos principales de los materiales de referencia en el laboratorio clínico?", options: ["Calibración, diagnóstico clínico y facturación", "Calibración de equipos, validación de métodos y control interno de calidad", "Solo calibración y validación de métodos", "Control interno, ensayos de aptitud y certificación"], answer: "Calibración de equipos, validación de métodos y control interno de calidad" },
      { question: "¿Qué es la trazabilidad metrológica?", options: ["El registro histórico de todas las calibraciones del equipo", "La cadena ininterrumpida que conecta una medición con un patrón de referencia internacional", "El proceso de verificar que el material no está vencido", "El conjunto de normas que regulan el uso de materiales de referencia"], answer: "La cadena ininterrumpida que conecta una medición con un patrón de referencia internacional" },
      { question: "¿Por qué la trazabilidad es esencial para la comparabilidad de resultados?", options: ["Por exigencia burocrática de la norma únicamente", "Porque permite que los resultados de diferentes laboratorios sean comparables entre sí en todo el mundo", "Solo porque lo requieren los organismos acreditadores", "Porque reduce los costos de producción de los materiales"], answer: "Porque permite que los resultados de diferentes laboratorios sean comparables entre sí en todo el mundo" },
      { question: "¿Qué matrices cubren los materiales de referencia de Controllab?", options: ["Solo suero y plasma para laboratorio clínico", "Suero, plasma, orina, agua, alimentos, suelos y otras matrices", "Solo matrices de laboratorio clínico", "Solo matrices industriales sin aplicación clínica"], answer: "Suero, plasma, orina, agua, alimentos, suelos y otras matrices" },
      { question: "¿Qué parámetro crítico garantiza Controllab respecto a sus materiales?", options: ["La velocidad de entrega al laboratorio", "La estabilidad del material durante el período de uso declarado en el certificado", "El precio más bajo del mercado", "La cantidad mínima de viales por pedido"], answer: "La estabilidad del material durante el período de uso declarado en el certificado" },
      { question: "¿Qué normas requieren el uso de materiales de referencia trazables?", options: ["Solo la ISO 9001 de gestión general", "ISO 17025 e ISO 15189 entre otras normas de acreditación de laboratorios", "Solo la legislación sanitaria de cada país", "No hay normas específicas que lo requieran"], answer: "ISO 17025 e ISO 15189 entre otras normas de acreditación de laboratorios" },
    ],
    dictation: "Los materiales de referencia certificados tienen trazabilidad metrológica y se usan para calibración, validación de métodos y control interno de calidad.",
  },
  {
    id: "controllab-acreditacion", title: "Acreditación ISO 17025 e ISO 17043", level: "Avanzado", category: "Controllab", emoji: "🏅",
    description: "Las normas de acreditación más relevantes para el trabajo de Controllab y sus clientes.",
    readingTitle: "El sello que da confianza",
    reading: [
      "La acreditación es el proceso formal mediante el cual un organismo evaluador independiente verifica que una organización cumple con los requisitos de una norma internacional específica y que es competente para realizar las actividades que declara. En el ecosistema de la calidad analítica donde opera Controllab, las dos normas más relevantes son la ISO 17025 para laboratorios de ensayo y calibración, y la ISO 17043 para proveedores de ensayos de aptitud.",
      "La norma ISO 17025 establece los requisitos generales de competencia para laboratorios de ensayo y calibración. Es la norma de referencia para cualquier laboratorio que quiera demostrar que opera con competencia técnica y produce resultados válidos y fiables. Abarca requisitos de gestión (documentación, no conformidades, auditorías) y requisitos técnicos (personal, equipos, métodos, trazabilidad metrológica, informe de resultados).",
      "La ISO 17043 es la norma específica para los proveedores de ensayos de aptitud, como Controllab. Establece los requisitos para el diseño, la organización y la operación de los programas de PT. Incluye requisitos sobre la homogeneidad y estabilidad de las muestras distribuidas, el procesamiento estadístico de los resultados, la emisión de los informes de desempeño y la confidencialidad de los datos de los participantes.",
      "Para los laboratorios clientes de Controllab, participar en programas de PT acreditados bajo ISO 17043 tiene un valor adicional: el resultado es reconocido por los organismos acreditadores de sus países como evidencia válida de competencia. Eso significa que cuando un laboratorio acreditado bajo ISO 17025 presenta su participación en un PT de Controllab a su organismo acreditador, el evaluador reconoce esa evidencia como válida.",
      "La preparación para una auditoría de acreditación es una de las consultoría más demandadas de Controllab. El laboratorio que quiere acreditarse bajo ISO 17025 necesita demostrar, entre otras cosas, que participa regularmente en ensayos de aptitud, que usa materiales de referencia trazables, que tiene implementado un sistema de control interno de calidad con criterios estadísticos claros, y que gestiona sus no conformidades de forma sistemática. Controllab ofrece los programas y materiales necesarios para cumplir todos esos requisitos.",
    ],
    vocab: [
      { es: "acreditación", pt: "acreditação" }, { es: "ISO 17025 / ISO 17043", pt: "ISO 17025 / ISO 17043" },
      { es: "organismo acreditador", pt: "organismo acreditador" }, { es: "competencia técnica", pt: "competência técnica" },
      { es: "evidencia de competencia", pt: "evidência de competência" }, { es: "proveedor de ensayos de aptitud", pt: "provedor de ensaios de aptidão" },
    ],
    quiz: [
      { question: "¿Qué es la acreditación?", options: ["Un certificado de participación en un curso", "El proceso formal donde un organismo independiente verifica que una organización cumple una norma y es competente", "Un contrato entre el laboratorio y su proveedor", "Un registro de los equipos del laboratorio"], answer: "El proceso formal donde un organismo independiente verifica que una organización cumple una norma y es competente" },
      { question: "¿Qué establece la ISO 17025?", options: ["Requisitos para laboratorios clínicos específicamente", "Requisitos generales de competencia para laboratorios de ensayo y calibración", "Requisitos para proveedores de ensayos de aptitud", "Requisitos para sistemas de gestión de calidad en general"], answer: "Requisitos generales de competencia para laboratorios de ensayo y calibración" },
      { question: "¿Qué norma aplica específicamente a Controllab como proveedor de PT?", options: ["ISO 15189", "ISO 9001", "ISO 17043", "ISO 17025"], answer: "ISO 17043" },
      { question: "¿Qué incluyen los requisitos de la ISO 17043 para proveedores de PT?", options: ["Solo los requisitos de confidencialidad de datos", "Homogeneidad de muestras, procesamiento estadístico, emisión de informes y confidencialidad", "Solo los requisitos de personal técnico", "Solo los requisitos de documentación interna"], answer: "Homogeneidad de muestras, procesamiento estadístico, emisión de informes y confidencialidad" },
      { question: "¿Qué valor adicional tiene para un laboratorio participar en un PT acreditado bajo ISO 17043?", options: ["Solo recibir un informe más detallado", "El resultado es reconocido por organismos acreditadores como evidencia válida de competencia", "Un descuento en futuros programas de PT", "Acceso a materiales de referencia gratuitos"], answer: "El resultado es reconocido por organismos acreditadores como evidencia válida de competencia" },
      { question: "¿Qué debe demostrar un laboratorio para acreditarse bajo ISO 17025?", options: ["Solo que tiene equipos modernos y calibrados", "Participación en PT, uso de materiales trazables, control interno con criterios estadísticos y gestión de no conformidades", "Solo que cumple con la legislación sanitaria local", "Solo que tiene personal certificado"], answer: "Participación en PT, uso de materiales trazables, control interno con criterios estadísticos y gestión de no conformidades" },
      { question: "¿Qué servicio relacionado con acreditación ofrece Controllab?", options: ["Emitir directamente los certificados de acreditación", "Consultoría para preparación de auditorías de acreditación con programas y materiales necesarios", "Realizar las auditorías de acreditación en lugar del organismo oficial", "Solo vender los materiales de referencia requeridos"], answer: "Consultoría para preparación de auditorías de acreditación con programas y materiales necesarios" },
      { question: "¿En qué se diferencia la ISO 17025 de la ISO 15189?", options: ["Son exactamente iguales", "La ISO 17025 aplica a laboratorios de ensayo y calibración en general; la ISO 15189 es específica para laboratorios clínicos", "La ISO 15189 es más reciente y reemplazó a la ISO 17025", "La ISO 17025 solo aplica a laboratorios industriales"], answer: "La ISO 17025 aplica a laboratorios de ensayo y calibración en general; la ISO 15189 es específica para laboratorios clínicos" },
    ],
    dictation: "La ISO 17025 certifica la competencia técnica de laboratorios de ensayo y calibración, mientras que la ISO 17043 regula a los proveedores de ensayos de aptitud como Controllab.",
  },
  {
    id: "controllab-incertidumbre", title: "Incertidumbre de medición", level: "Avanzado", category: "Controllab", emoji: "📏",
    description: "Qué es la incertidumbre, cómo se estima y por qué es clave en la calidad analítica.",
    readingTitle: "Ninguna medición es exacta",
    reading: [
      "Una de las afirmaciones más importantes de la metrología moderna es que ninguna medición es perfectamente exacta. Todo resultado analítico tiene asociado un rango de valores dentro del cual se estima que se encuentra el valor verdadero de la propiedad medida. Ese rango es la incertidumbre de medición, y expresarla junto con el resultado es un requisito de las normas ISO 17025 e ISO 15189 y una práctica fundamental de la ciencia analítica de calidad.",
      "La incertidumbre de medición no debe confundirse con el error de medición. El error es la diferencia entre el resultado obtenido y el valor verdadero; como el valor verdadero generalmente no se conoce con exactitud, tampoco se conoce el error exacto. La incertidumbre es una estimación cuantitativa del rango de valores que podría tomar ese error, calculada a partir de fuentes de variabilidad conocidas y cuantificadas.",
      "Las fuentes de incertidumbre en un análisis de laboratorio son múltiples. Entre las principales se encuentran: la imprecisión del método (evaluada por el CV), el sesgo del método (evaluado por comparación con un método de referencia o material certificado), la incertidumbre del material de referencia usado para la calibración, la variabilidad de las condiciones ambientales, la variabilidad introducida por diferentes operadores y la variabilidad del proceso de preparación de la muestra.",
      "Controllab ofrece herramientas y capacitación específica para la estimación de la incertidumbre de medición en laboratorios analíticos. Una de las aproximaciones más utilizadas y promovidas es el enfoque basado en los datos del control de calidad interno y del ensayo de aptitud, que permite estimar la incertidumbre de forma práctica sin necesidad de estudios exhaustivos adicionales. Este enfoque es especialmente adecuado para laboratorios clínicos.",
      "La incertidumbre de medición tiene implicaciones directas en la toma de decisiones clínicas. Cuando el resultado de un paciente está muy cerca de un valor de decisión clínica (como un umbral de diagnóstico o un límite terapéutico), la incertidumbre del resultado determina si el laboratorio puede afirmar con confianza si el valor está por encima o por debajo de ese umbral. Un laboratorio que conoce su incertidumbre toma mejores decisiones y comunica sus resultados con mayor precisión.",
    ],
    vocab: [
      { es: "incertidumbre de medición", pt: "incerteza de medição" }, { es: "fuentes de incertidumbre", pt: "fontes de incerteza" },
      { es: "valor verdadero", pt: "valor verdadeiro" }, { es: "intervalo de confianza", pt: "intervalo de confiança" },
      { es: "error sistemático / aleatorio", pt: "erro sistemático / aleatório" }, { es: "valor de decisión clínica", pt: "valor de decisão clínica" },
    ],
    quiz: [
      { question: "¿Qué es la incertidumbre de medición?", options: ["El error exacto cometido en la medición", "El rango de valores dentro del cual se estima que se encuentra el valor verdadero de la propiedad medida", "La diferencia entre dos mediciones consecutivas", "El límite de detección del método analítico"], answer: "El rango de valores dentro del cual se estima que se encuentra el valor verdadero de la propiedad medida" },
      { question: "¿Qué diferencia hay entre error e incertidumbre?", options: ["Son sinónimos en el contexto analítico", "El error es la diferencia exacta con el valor verdadero; la incertidumbre es la estimación cuantitativa de ese rango", "La incertidumbre siempre es mayor que el error", "El error solo aplica a métodos manuales y la incertidumbre a métodos automáticos"], answer: "El error es la diferencia exacta con el valor verdadero; la incertidumbre es la estimación cuantitativa de ese rango" },
      { question: "¿Cuáles son fuentes de incertidumbre en un análisis de laboratorio?", options: ["Solo la imprecisión del equipo analítico", "Imprecisión, sesgo, incertidumbre del calibrador, variabilidad ambiental, operadores y preparación de muestra", "Solo el sesgo del método comparado con el de referencia", "Solo la variabilidad entre diferentes lotes de reactivo"], answer: "Imprecisión, sesgo, incertidumbre del calibrador, variabilidad ambiental, operadores y preparación de muestra" },
      { question: "¿Qué exigen ISO 17025 e ISO 15189 respecto a la incertidumbre?", options: ["Solo mencionarla en los procedimientos internos", "Expresarla junto con el resultado analítico como parte del informe de ensayo", "Calcularla solo cuando el resultado sea inusual", "Solo tenerla documentada para auditorías"], answer: "Expresarla junto con el resultado analítico como parte del informe de ensayo" },
      { question: "¿Qué enfoque para estimar incertidumbre promueve Controllab?", options: ["Estudios exhaustivos de múltiples fuentes independientes", "El basado en datos del control de calidad interno y del ensayo de aptitud, práctico sin estudios adicionales", "Solo la comparación con materiales de referencia primarios", "El enfoque teórico basado en modelos matemáticos complejos"], answer: "El basado en datos del control de calidad interno y del ensayo de aptitud, práctico sin estudios adicionales" },
      { question: "¿Cuándo la incertidumbre tiene mayor impacto clínico?", options: ["Cuando el resultado es muy diferente del valor de referencia normal", "Cuando el resultado está muy cerca de un valor de decisión clínica (umbral diagnóstico o terapéutico)", "Siempre tiene el mismo impacto independientemente del resultado", "Solo cuando el paciente tiene síntomas muy marcados"], answer: "Cuando el resultado está muy cerca de un valor de decisión clínica (umbral diagnóstico o terapéutico)" },
      { question: "¿Por qué un laboratorio que conoce su incertidumbre toma mejores decisiones?", options: ["Porque puede reducir sus costos operativos", "Porque puede afirmar con mayor confianza si un resultado está por encima o por debajo de un umbral crítico", "Porque puede acreditarse más fácilmente", "Porque puede procesar más muestras por hora"], answer: "Porque puede afirmar con mayor confianza si un resultado está por encima o por debajo de un umbral crítico" },
      { question: "¿La incertidumbre elimina la utilidad del resultado analítico?", options: ["Sí, un resultado con incertidumbre no es confiable", "No, cuantificarla mejora la calidad de la información y permite tomar decisiones más informadas", "Solo si la incertidumbre supera el 10% del resultado", "Depende del tipo de analito medido"], answer: "No, cuantificarla mejora la calidad de la información y permite tomar decisiones más informadas" },
    ],
    dictation: "La incertidumbre de medición estima el rango de valores dentro del cual se encuentra el valor verdadero y debe expresarse junto con cada resultado analítico.",
  },
  {
    id: "controllab-informe", title: "Leer un informe de PT de Controllab", level: "Intermedio", category: "Controllab", emoji: "📋",
    description: "Cómo interpretar correctamente un informe de desempeño del ensayo de aptitud.",
    readingTitle: "El informe que orienta la mejora",
    reading: [
      "Recibir el informe de desempeño de un ensayo de aptitud de Controllab es el momento clave del programa: es cuando el laboratorio descubre cómo fue su desempeño comparado con el resto de los participantes y qué información puede usar para mejorar. Sin embargo, un informe de PT solo es útil si se sabe leerlo correctamente. Mal interpretado, puede generar falsas alarmas o, peor, pasar por alto problemas reales.",
      "La primera sección que el laboratorio debe revisar es el resumen ejecutivo del ciclo, que muestra cuántos laboratorios participaron, qué métodos se usaron, cuál fue el valor de referencia del programa y cuál fue la dispersión del grupo (expresada como desviación estándar o coeficiente de variación del grupo). Ese contexto es esencial para interpretar el resultado individual del laboratorio.",
      "El resultado individual del laboratorio aparece con su z-score y, en muchos programas de Controllab, con una representación gráfica que muestra dónde se ubica el resultado del laboratorio respecto a la distribución del grupo. Un resultado cercano al centro de la distribución es bueno. Un resultado en la periferia, aunque todavía dentro del límite aceptable, puede ser señal de que algo está cambiando.",
      "Uno de los aspectos más valiosos del informe de Controllab es la comparación por método. El informe muestra cómo se desempeñaron los diferentes grupos de métodos: por ejemplo, cómo estuvieron los laboratorios que usaron método A versus método B para el mismo analito. Si el laboratorio obtuvo un resultado insatisfactorio y descubre que todos los laboratorios que usan el mismo método también tuvieron resultados similares, la causa es probablemente del método en sí, no de la ejecución del laboratorio.",
      "El seguimiento histórico es otro componente fundamental. Un informe que muestra que el laboratorio lleva tres ciclos consecutivos con z-scores que se alejan progresivamente del centro, aunque todavía dentro del límite aceptable, es mucho más preocupante que un resultado puntualmente alejado seguido de una recuperación. Las tendencias en el tiempo revelan problemas sistémicos que los controles internos pueden no haber detectado aún.",
    ],
    vocab: [
      { es: "informe de desempeño", pt: "relatório de desempenho" }, { es: "valor de referencia del programa", pt: "valor de referência do programa" },
      { es: "dispersión del grupo", pt: "dispersão do grupo" }, { es: "comparación por método", pt: "comparação por método" },
      { es: "seguimiento histórico", pt: "acompanhamento histórico" }, { es: "tendencia en el tiempo", pt: "tendência ao longo do tempo" },
    ],
    quiz: [
      { question: "¿Cuál es la primera sección que debe revisar el laboratorio al recibir un informe de PT?", options: ["El z-score individual del laboratorio únicamente", "El resumen ejecutivo del ciclo con contexto del grupo: participantes, métodos, valor de referencia y dispersión", "Solo los resultados insatisfactorios del ciclo", "La sección de recomendaciones al final del informe"], answer: "El resumen ejecutivo del ciclo con contexto del grupo: participantes, métodos, valor de referencia y dispersión" },
      { question: "¿Por qué es importante conocer la dispersión del grupo antes de interpretar el resultado individual?", options: ["Solo para comparar con otros laboratorios", "Porque el z-score se calcula usando esa dispersión, por lo que el contexto del grupo determina la interpretación", "Para calcular el costo del programa de PT", "Para determinar si el programa fue bien diseñado"], answer: "Porque el z-score se calcula usando esa dispersión, por lo que el contexto del grupo determina la interpretación" },
      { question: "¿Qué valor adicional aporta la comparación por método en el informe de Controllab?", options: ["Solo muestra cuál es el método más usado", "Permite distinguir si un resultado insatisfactorio es del laboratorio o es compartido por todos los que usan el mismo método", "Solo es útil para los fabricantes de equipos", "No aporta información adicional respecto al z-score"], answer: "Permite distinguir si un resultado insatisfactorio es del laboratorio o es compartido por todos los que usan el mismo método" },
      { question: "¿Qué puede revelar el seguimiento histórico de z-scores?", options: ["Solo confirma que el laboratorio siempre estuvo bien", "Tendencias sistémicas que los controles internos pueden no haber detectado aún", "Solo muestra si el laboratorio mejoró o empeoró en el último ciclo", "No tiene utilidad práctica adicional al resultado del ciclo actual"], answer: "Tendencias sistémicas que los controles internos pueden no haber detectado aún" },
      { question: "¿Qué significa que todos los laboratorios con el mismo método obtuvieron resultados similares e insatisfactorios?", options: ["Que todos los laboratorios cometieron el mismo error operativo", "Que la causa probable es del método en sí, no de la ejecución específica del laboratorio", "Que el valor de referencia del programa es incorrecto", "Que ese método debe abandonarse de inmediato"], answer: "Que la causa probable es del método en sí, no de la ejecución específica del laboratorio" },
      { question: "¿Cuándo es más preocupante un resultado en la periferia del rango aceptable?", options: ["Nunca, si está dentro del límite es siempre aceptable", "Cuando forma parte de una tendencia de tres o más ciclos alejándose progresivamente del centro", "Solo cuando el z-score supera 1.5", "Solo si el mismo analito también falló en el control interno"], answer: "Cuando forma parte de una tendencia de tres o más ciclos alejándose progresivamente del centro" },
      { question: "¿Qué riesgo tiene interpretar mal un informe de PT?", options: ["Solo perder tiempo en reuniones", "Generar falsas alarmas innecesarias o, peor, pasar por alto problemas reales", "Retrasar la renovación del programa de PT", "Solo afectar la relación con el coordinador del programa"], answer: "Generar falsas alarmas innecesarias o, peor, pasar por alto problemas reales" },
      { question: "¿Qué tipo de representación gráfica incluyen muchos informes de Controllab?", options: ["Solo tablas de números sin gráficos", "Una representación que muestra dónde se ubica el resultado del laboratorio respecto a la distribución del grupo", "Solo el gráfico de control interno del laboratorio", "Solo la comparación histórica sin referencia al grupo actual"], answer: "Una representación que muestra dónde se ubica el resultado del laboratorio respecto a la distribución del grupo" },
    ],
    dictation: "Un informe de PT de Controllab debe leerse analizando el contexto del grupo, el z-score individual, la comparación por método y la tendencia histórica.",
  },
  {
    id: "controllab-educacion", title: "Oferta educativa de Controllab", level: "Básico", category: "Controllab", emoji: "🎓",
    description: "Cursos, workshops y congresos que ofrece Controllab para la capacitación técnica.",
    readingTitle: "Aprender para mejorar",
    reading: [
      "La educación y la capacitación técnica son uno de los pilares fundamentales de Controllab. La empresa reconoce que ofrecer programas de ensayos de aptitud y materiales de referencia de alta calidad no es suficiente si los profesionales del laboratorio no tienen los conocimientos para interpretarlos y usarlos correctamente. Por eso, la oferta educativa de Controllab está diseñada para complementar sus productos y servicios con formación práctica y aplicada.",
      "Los cursos técnicos de Controllab cubren una amplia variedad de temas: control de calidad analítico y reglas de Westgard, interpretación de resultados de ensayos de aptitud, estimación de incertidumbre de medición, validación de métodos, estadística aplicada al laboratorio, métricas sigma, gestión de no conformidades y preparación para auditorías de acreditación. Cada curso está diseñado para ser directamente aplicable en la práctica diaria del laboratorio.",
      "Los workshops son actividades prácticas de menor duración que los cursos, diseñadas para resolver problemas específicos o para practicar habilidades concretas. Pueden ser presenciales o virtuales y frecuentemente incluyen ejercicios con datos reales, análisis de casos y discusión grupal. El formato interactivo de los workshops es especialmente valorado por los profesionales que buscan aprendizaje aplicado.",
      "Los congresos y jornadas que organiza o apoya Controllab son espacios de encuentro de la comunidad de laboratoristas de la región. Reúnen a profesionales de diferentes países, sectores y especialidades para compartir experiencias, presentar investigaciones y debatir los desafíos actuales de la calidad analítica. Para los profesionales del laboratorio, participar en estos espacios es también una oportunidad de networking y actualización.",
      "La expansión de Controllab hacia los países hispanohablantes de Latinoamérica trajo consigo la necesidad de ofrecer sus actividades educativas en español. Esa adaptación va más allá de la simple traducción: implica localizar los ejemplos, los casos y las referencias normativas al contexto específico de cada país o región. Es exactamente en ese punto donde la capacitación en español técnico para los profesionales del equipo Controllab cobra un valor estratégico directo.",
    ],
    vocab: [
      { es: "oferta educativa", pt: "oferta educacional" }, { es: "workshop / taller", pt: "workshop / oficina" },
      { es: "congreso / jornada", pt: "congresso / jornada" }, { es: "capacitación técnica", pt: "capacitação técnica" },
      { es: "aprendizaje aplicado", pt: "aprendizado aplicado" }, { es: "networking", pt: "networking" },
    ],
    quiz: [
      { question: "¿Por qué Controllab considera la educación un pilar fundamental?", options: ["Solo para generar ingresos adicionales", "Porque los productos de calidad solo son útiles si los profesionales saben interpretarlos y usarlos", "Solo para diferenciarse de la competencia", "Porque es un requisito de la norma ISO 17043"], answer: "Porque los productos de calidad solo son útiles si los profesionales saben interpretarlos y usarlos" },
      { question: "¿Qué temas cubren los cursos técnicos de Controllab?", options: ["Solo control de calidad y reglas de Westgard", "Control de calidad, ensayos de aptitud, incertidumbre, validación de métodos, estadística, sigma y acreditación", "Solo estadística aplicada al laboratorio", "Solo preparación para auditorías de acreditación"], answer: "Control de calidad, ensayos de aptitud, incertidumbre, validación de métodos, estadística, sigma y acreditación" },
      { question: "¿Qué caracteriza el formato de los workshops de Controllab?", options: ["Son largos y teóricos igual que los cursos", "Son prácticos, con ejercicios de datos reales y discusión grupal, presenciales o virtuales", "Son exclusivamente presenciales y de larga duración", "Solo se hacen con grupos de más de 50 personas"], answer: "Son prácticos, con ejercicios de datos reales y discusión grupal, presenciales o virtuales" },
      { question: "¿Qué oportunidades ofrecen los congresos de Controllab?", options: ["Solo recibir materiales impresos actualizados", "Encuentro con la comunidad regional, intercambio de experiencias, investigaciones y networking", "Solo asistir a conferencias sin interacción", "Solo para directivos de laboratorios grandes"], answer: "Encuentro con la comunidad regional, intercambio de experiencias, investigaciones y networking" },
      { question: "¿Qué implica adaptar la oferta educativa a los países hispanohablantes?", options: ["Solo traducir los materiales del portugués al español", "Localizar ejemplos, casos y referencias normativas al contexto específico de cada país o región", "Solo cambiar el idioma del material sin modificar el contenido", "Contratar profesores locales sin modificar el currículo"], answer: "Localizar ejemplos, casos y referencias normativas al contexto específico de cada país o región" },
      { question: "¿Qué valor estratégico directo tiene la capacitación en español técnico para el equipo Controllab?", options: ["Solo facilita la comunicación interna del equipo", "Permite a los profesionales capacitar a los clientes hispanohablantes de la región de forma efectiva y localizada", "Solo mejora el nivel cultural del equipo", "Es un requisito administrativo sin impacto en el negocio"], answer: "Permite a los profesionales capacitar a los clientes hispanohablantes de la región de forma efectiva y localizada" },
      { question: "¿Cuál es el enfoque pedagógico central de la oferta educativa de Controllab?", options: ["Formación teórica extensa sin aplicación práctica", "Formación práctica y aplicada directamente usable en el trabajo diario del laboratorio", "Solo certificación académica formal", "Solo contenido en formato video pregrabado"], answer: "Formación práctica y aplicada directamente usable en el trabajo diario del laboratorio" },
      { question: "¿A quiénes van dirigidas las actividades educativas de Controllab?", options: ["Solo a directivos y responsables de calidad", "A profesionales del laboratorio de diferentes países, sectores y especialidades", "Solo a laboratorios con acreditación ISO 17025", "Solo a laboratorios clínicos de Brasil"], answer: "A profesionales del laboratorio de diferentes países, sectores y especialidades" },
    ],
    dictation: "La oferta educativa de Controllab incluye cursos, workshops y congresos diseñados para que los profesionales apliquen directamente lo aprendido en su laboratorio.",
  },
  {
    id: "controllab-clientes", title: "Sectores clientes de Controllab", level: "Básico", category: "Controllab", emoji: "🌎",
    description: "Los diferentes tipos de laboratorios y sectores que trabajan con Controllab.",
    readingTitle: "Un cliente muy diverso",
    reading: [
      "Uno de los aspectos más distintivos de Controllab es la diversidad de sus clientes. Aunque la empresa comenzó con un foco principal en los laboratorios clínicos, a lo largo de los años fue desarrollando programas y materiales específicamente diseñados para otros sectores donde la calidad analítica es igualmente crítica: la industria alimentaria, la industria farmacéutica, el sector ambiental y las instituciones universitarias y de investigación.",
      "Los laboratorios clínicos son el sector más tradicional de Controllab. Procesan muestras de sangre, orina y otros fluidos biológicos para apoyar el diagnóstico y el seguimiento de enfermedades en pacientes. La calidad de sus resultados tiene impacto directo sobre la salud de las personas. Para estos laboratorios, Controllab ofrece programas de PT en bioquímica, hematología, coagulación, microbiología, inmunología, uroanálisis y otros analitos de uso clínico frecuente.",
      "Los laboratorios de la industria alimentaria analizan alimentos y bebidas para verificar su composición, su seguridad microbiológica y su cumplimiento con las regulaciones sanitarias. Un resultado incorrecto en ese contexto puede tener consecuencias graves para la salud pública. Controllab ofrece programas de PT específicos para matrices alimentarias: leche, agua, alimentos procesados, bebidas y otros productos de consumo masivo.",
      "La industria farmacéutica requiere análisis de altísima precisión para garantizar que los medicamentos tienen la concentración correcta de principio activo, que no contienen impurezas peligrosas y que cumplen con las farmacopeas nacionales e internacionales. Los laboratorios de control de calidad de la industria farmacéutica son clientes exigentes de Controllab porque operan bajo regulaciones muy estrictas, incluyendo las de la ANVISA en Brasil y las de las agencias reguladoras de los países donde se comercializan los medicamentos.",
      "El sector ambiental incluye laboratorios que analizan agua potable, aguas residuales, suelos y aire para verificar el cumplimiento de límites regulatorios de contaminantes. Esos análisis son críticos para la protección de la salud pública y del medio ambiente. Las instituciones universitarias y de investigación también participan en los programas de Controllab como una forma de verificar la calidad de sus métodos analíticos y de mantener la credibilidad científica de sus resultados.",
    ],
    vocab: [
      { es: "sector clínico / alimentario / ambiental", pt: "setor clínico / alimentar / ambiental" },
      { es: "industria farmacéutica", pt: "indústria farmacêutica" }, { es: "laboratorio de control de calidad", pt: "laboratório de controle de qualidade" },
      { es: "principio activo", pt: "princípio ativo" }, { es: "agencia reguladora (ANVISA)", pt: "agência reguladora (ANVISA)" },
      { es: "contaminante / límite regulatorio", pt: "contaminante / limite regulatório" },
    ],
    quiz: [
      { question: "¿Cuál es el sector más tradicional de clientes de Controllab?", options: ["La industria farmacéutica", "Los laboratorios clínicos", "El sector ambiental", "Las universidades e instituciones de investigación"], answer: "Los laboratorios clínicos" },
      { question: "¿Qué tipo de muestras procesan los laboratorios clínicos?", options: ["Alimentos y bebidas para verificar seguridad", "Sangre, orina y otros fluidos biológicos para apoyar el diagnóstico", "Suelos y agua para detectar contaminantes", "Medicamentos para verificar principio activo"], answer: "Sangre, orina y otros fluidos biológicos para apoyar el diagnóstico" },
      { question: "¿Qué verifica la industria alimentaria con sus análisis?", options: ["Solo la composición nutricional de los alimentos", "Composición, seguridad microbiológica y cumplimiento de regulaciones sanitarias", "Solo la fecha de vencimiento de los productos", "Solo la ausencia de alérgenos"], answer: "Composición, seguridad microbiológica y cumplimiento de regulaciones sanitarias" },
      { question: "¿Por qué los laboratorios farmacéuticos son clientes exigentes?", options: ["Porque tienen más presupuesto que otros sectores", "Porque operan bajo regulaciones muy estrictas de agencias como ANVISA y otras", "Porque procesan el mayor número de muestras por día", "Solo porque sus errores son económicamente costosos"], answer: "Porque operan bajo regulaciones muy estrictas de agencias como ANVISA y otras" },
      { question: "¿Qué analiza el sector ambiental?", options: ["Muestras de pacientes en hospitales", "Agua potable, aguas residuales, suelos y aire para verificar límites de contaminantes", "Alimentos de origen animal exclusivamente", "Medicamentos antes de su comercialización"], answer: "Agua potable, aguas residuales, suelos y aire para verificar límites de contaminantes" },
      { question: "¿Por qué participan las universidades en los programas de Controllab?", options: ["Por requisito de financiamiento académico", "Para verificar la calidad de sus métodos analíticos y mantener la credibilidad científica de sus resultados", "Solo para capacitar a sus estudiantes de forma práctica", "Por exigencia de las agencias reguladoras"], answer: "Para verificar la calidad de sus métodos analíticos y mantener la credibilidad científica de sus resultados" },
      { question: "¿Qué matrices cubre Controllab para la industria alimentaria?", options: ["Solo agua y leche", "Leche, agua, alimentos procesados, bebidas y otros productos de consumo masivo", "Solo alimentos de origen vegetal", "Solo bebidas alcohólicas y refrescos"], answer: "Leche, agua, alimentos procesados, bebidas y otros productos de consumo masivo" },
      { question: "¿Qué consecuencias puede tener un resultado incorrecto en la industria alimentaria?", options: ["Solo consecuencias económicas para la empresa", "Consecuencias graves para la salud pública de los consumidores", "Solo problemas de etiquetado del producto", "Consecuencias solo para el laboratorio, no para los consumidores"], answer: "Consecuencias graves para la salud pública de los consumidores" },
    ],
    dictation: "Controllab atiende a laboratorios clínicos, de industria alimentaria, farmacéutica, ambiental y universitaria en toda Latinoamérica.",
  },
  {
    id: "controllab-comunicacion", title: "Comunicar con clientes de Controllab", level: "Intermedio", category: "Controllab", emoji: "📞",
    description: "Vocabulario y situaciones reales de comunicación con laboratorios clientes en español.",
    readingTitle: "La llamada desde Buenos Aires",
    reading: [
      "Una mañana de lunes, una analista del equipo de Controllab recibió una llamada de un laboratorio clínico en Buenos Aires. El responsable de calidad del laboratorio estaba preocupado: acababa de recibir el informe del último ciclo del programa de bioquímica y su resultado de glucosa aparecía con un z-score de 2.8, lo que lo colocaba en zona de alerta. Quería entender si debía activar una investigación o si el resultado podía considerarse aceptable.",
      "La analista escuchó el planteo completo antes de responder. Luego revisó el informe en el sistema y confirmó que el z-score era efectivamente de 2.8, lo que colocaba al laboratorio en la zona de señal de alerta, aunque todavía fuera del límite de rechazo. Le explicó al cliente que ese resultado, aunque preocupante, no implicaba automáticamente un problema grave, pero que sí justificaba una revisión interna de los factores que podrían haber influido.",
      "La conversación fue un ejercicio práctico de comunicación técnica en español. La analista tuvo que explicar conceptos como z-score, sesgo, valor de referencia del programa y comparación por método, usando un lenguaje claro y accesible pero sin perder precisión técnica. También tuvo que manejar la ansiedad del cliente sin minimizar la importancia del hallazgo: validar su preocupación y al mismo tiempo transmitir calma y un plan de acción concreto.",
      "La analista sugirió al laboratorio revisar tres aspectos: primero, el lote de calibrador vigente durante el ciclo del PT; segundo, los resultados del control interno del mismo período para verificar si había habido alguna tendencia; tercero, si otros laboratorios que usaban el mismo método habían tenido resultados similares, revisando la comparación por método del informe. Al final de la llamada, el laboratorio tenía un plan claro y la analista había documentado la consulta en el sistema.",
      "Ese tipo de interacción es el núcleo de la relación entre Controllab y sus clientes hispanohablantes. No se trata solo de distribuir materiales y esperar resultados: se trata de acompañar al laboratorio en la interpretación de esos resultados y en la mejora de su desempeño. Esa relación de soporte técnico requiere un dominio sólido del español técnico del laboratorio, tanto del vocabulario específico como de las habilidades comunicativas para manejar situaciones de consulta complejas.",
    ],
    vocab: [
      { es: "zona de alerta / señal de alerta", pt: "zona de alerta / sinal de alerta" },
      { es: "responsable de calidad del laboratorio", pt: "responsável pela qualidade do laboratório" },
      { es: "lote de calibrador", pt: "lote de calibrador" }, { es: "plan de acción concreto", pt: "plano de ação concreto" },
      { es: "documentar la consulta", pt: "documentar a consulta" }, { es: "soporte técnico", pt: "suporte técnico" },
    ],
    quiz: [
      { question: "¿Por qué llamó el responsable de calidad del laboratorio de Buenos Aires?", options: ["Para cancelar su participación en el programa de PT", "Porque su z-score de glucosa estaba en 2.8, en zona de alerta, y quería orientación", "Porque no recibió el informe del ciclo en tiempo y forma", "Para solicitar un nuevo ciclo de análisis gratuito"], answer: "Porque su z-score de glucosa estaba en 2.8, en zona de alerta, y quería orientación" },
      { question: "¿Qué hizo la analista antes de responder al cliente?", options: ["Le envió directamente el protocolo de investigación por correo", "Escuchó el planteo completo y revisó el informe en el sistema antes de responder", "Le pidió que enviara los datos por correo electrónico", "Le indicó que el resultado era inaceptable sin revisar el contexto"], answer: "Escuchó el planteo completo y revisó el informe en el sistema antes de responder" },
      { question: "¿Un z-score de 2.8 requiere activar automáticamente una investigación como si fuera un rechazo?", options: ["Sí, cualquier valor mayor a 2 es equivalente a un rechazo", "No, es zona de alerta que justifica revisión pero no es automáticamente un rechazo", "Solo si el mismo analito falló en el control interno también", "Sí, siempre debe suspenderse la liberación de resultados"], answer: "No, es zona de alerta que justifica revisión pero no es automáticamente un rechazo" },
      { question: "¿Qué tres aspectos sugirió revisar la analista al laboratorio?", options: ["El equipo, el reactivo y el personal", "El lote de calibrador, los controles internos del período y la comparación por método del informe", "Solo los resultados de los controles internos", "Solo la calibración del equipo analítico"], answer: "El lote de calibrador, los controles internos del período y la comparación por método del informe" },
      { question: "¿Qué desafío comunicacional enfrentó la analista durante la llamada?", options: ["Explicar por qué el resultado era completamente inaceptable", "Manejar la ansiedad del cliente sin minimizar el hallazgo, transmitiendo calma y un plan concreto", "Convencer al cliente de cambiar de programa de PT", "Explicar el procedimiento de facturación del programa"], answer: "Manejar la ansiedad del cliente sin minimizar el hallazgo, transmitiendo calma y un plan concreto" },
      { question: "¿Qué refleja ese tipo de interacción sobre la relación de Controllab con sus clientes?", options: ["Que Controllab solo distribuye materiales y espera resultados", "Que Controllab acompaña al laboratorio en la interpretación de resultados y en la mejora del desempeño", "Que el soporte técnico es solo por correo electrónico", "Que la relación es exclusivamente comercial sin soporte técnico"], answer: "Que Controllab acompaña al laboratorio en la interpretación de resultados y en la mejora del desempeño" },
      { question: "¿Qué requiere el soporte técnico a clientes hispanohablantes del equipo Controllab?", options: ["Solo conocer el sistema informático de gestión de clientes", "Dominio sólido del español técnico del laboratorio: vocabulario específico y habilidades comunicativas", "Solo hablar español a nivel básico conversacional", "Solo conocer los productos del catálogo de Controllab"], answer: "Dominio sólido del español técnico del laboratorio: vocabulario específico y habilidades comunicativas" },
      { question: "¿Qué hizo la analista al finalizar la llamada?", options: ["Solo cerró la llamada sin registro adicional", "Documentó la consulta en el sistema con el plan de acción acordado", "Envió un correo de seguimiento al directorio del laboratorio", "Solicitó al laboratorio que repitiera el análisis"], answer: "Documentó la consulta en el sistema con el plan de acción acordado" },
    ],
    dictation: "El soporte técnico a clientes hispanohablantes de Controllab requiere explicar conceptos como z-score y sesgo con claridad, calma y un plan de acción concreto.",
  },
  {
    id: "controllab-vocabulario", title: "Vocabulario específico de Controllab", level: "Básico", category: "Controllab", emoji: "📖",
    description: "Los términos técnicos propios de Controllab que todo profesional del equipo debe dominar.",
    readingTitle: "El idioma de la calidad analítica",
    reading: [
      "Trabajar en Controllab significa operar en un entorno donde el vocabulario técnico es muy específico y donde los mismos términos pueden tener matices diferentes según el sector del cliente (clínico, alimentario, farmacéutico o ambiental). Dominar ese vocabulario no es solo una cuestión de comunicación interna: es fundamental para comunicarse con credibilidad y precisión con los clientes y con la comunidad científica de la región.",
      "El término 'ensayo de aptitud' es la traducción al español del inglés 'proficiency testing' (PT) y del portugués 'ensaio de aptidão'. En el contexto de Controllab, este término siempre se refiere al programa en el que el coordinador distribuye muestras y evalúa el desempeño de los laboratorios participantes. Es importante no confundirlo con 'control externo de calidad' (aunque son conceptos relacionados) ni con 'validación del método' (que es un proceso diferente).",
      "El 'valor asignado' o 'valor de referencia' es el valor que el programa establece como el mejor estimado del valor verdadero de la propiedad en la muestra de aptitud. Puede determinarse por diferentes métodos: consenso de los participantes, método de referencia primario, combinación de laboratorios de referencia o valor certificado. La forma en que se determina el valor asignado es crítica porque afecta el cálculo de todos los z-scores del ciclo.",
      "La 'desviación estándar del programa' (σp en la fórmula del z-score) es la desviación estándar que el coordinador establece como referencia para el programa. Puede ser calculada a partir de los datos del ciclo (desviación estándar robusta del grupo) o fijada a priori como un porcentaje del valor asignado basado en los requisitos de calidad del analito. Esta elección metodológica afecta directamente la sensibilidad del programa para detectar resultados no conformes.",
      "El 'ciclo' en el contexto de los programas de Controllab es una ronda completa del programa: distribución de muestras, análisis por los participantes, reporte de resultados, procesamiento estadístico y emisión del informe. Los programas pueden tener diferentes frecuencias de ciclos: algunos son mensuales, otros bimensuales, otros anuales, según el analito, la dificultad analítica y las necesidades regulatorias del sector. Conocer la frecuencia del programa es importante para planificar el calendario de calidad del laboratorio.",
    ],
    vocab: [
      { es: "ensayo de aptitud / proficiency testing", pt: "ensaio de aptidão / proficiência" },
      { es: "valor asignado / valor de referencia", pt: "valor atribuído / valor de referência" },
      { es: "desviación estándar del programa", pt: "desvio padrão do programa" },
      { es: "ciclo del programa", pt: "rodada do programa" }, { es: "laboratorio participante / coordinador", pt: "laboratório participante / coordenador" },
      { es: "resultado no conforme", pt: "resultado não conforme" },
    ],
    quiz: [
      { question: "¿Cuál es la traducción al español de 'proficiency testing'?", options: ["Control interno de calidad", "Ensayo de aptitud", "Validación del método analítico", "Control externo de desempeño"], answer: "Ensayo de aptitud" },
      { question: "¿Qué es el valor asignado en un programa de PT?", options: ["El resultado que obtuvo el mejor laboratorio del ciclo", "El mejor estimado del valor verdadero de la propiedad en la muestra de aptitud, establecido por el coordinador", "El promedio de todos los resultados del ciclo sin exclusiones", "El valor que el laboratorio declara como resultado"], answer: "El mejor estimado del valor verdadero de la propiedad en la muestra de aptitud, establecido por el coordinador" },
      { question: "¿Por qué es crítica la forma en que se determina el valor asignado?", options: ["Solo afecta la imagen del coordinador del programa", "Porque afecta el cálculo de todos los z-scores del ciclo", "Solo importa cuando hay resultados insatisfactorios", "Porque determina el precio del programa para los participantes"], answer: "Porque afecta el cálculo de todos los z-scores del ciclo" },
      { question: "¿Qué es la desviación estándar del programa (σp)?", options: ["La desviación estándar del control interno del laboratorio", "La referencia que establece el coordinador para calcular los z-scores del ciclo", "El coeficiente de variación del método analítico del laboratorio", "El rango de aceptación definido por las reglas de Westgard"], answer: "La referencia que establece el coordinador para calcular los z-scores del ciclo" },
      { question: "¿Qué es un 'ciclo' en los programas de Controllab?", options: ["El período anual de renovación del contrato con el laboratorio", "Una ronda completa: distribución, análisis, reporte, procesamiento estadístico e informe", "Solo la distribución de las muestras de aptitud", "El período entre dos calibraciones del equipo analítico"], answer: "Una ronda completa: distribución, análisis, reporte, procesamiento estadístico e informe" },
      { question: "¿Por qué es importante conocer la frecuencia de ciclos de un programa?", options: ["Solo para calcular el costo anual del programa", "Para planificar el calendario de calidad del laboratorio y asegurar la participación en cada ciclo", "Solo para saber cuándo renovar los reactivos", "Por requisito formal de la norma ISO 17043"], answer: "Para planificar el calendario de calidad del laboratorio y asegurar la participación en cada ciclo" },
      { question: "¿Cómo se diferencia el ensayo de aptitud de la validación del método?", options: ["Son términos intercambiables en el laboratorio moderno", "El PT evalúa el desempeño del laboratorio comparándolo con otros; la validación demuestra que el método cumple sus requisitos", "La validación del método siempre la hace el coordinador externo", "El PT solo aplica a laboratorios clínicos y la validación a todos los sectores"], answer: "El PT evalúa el desempeño del laboratorio comparándolo con otros; la validación demuestra que el método cumple sus requisitos" },
      { question: "¿A quiénes va dirigido el dominio del vocabulario específico de Controllab?", options: ["Solo al personal de ventas y marketing", "A todo el equipo que interactúa con clientes y con la comunidad científica de la región", "Solo al equipo técnico que diseña los programas de PT", "Solo a los directivos de la empresa"], answer: "A todo el equipo que interactúa con clientes y con la comunidad científica de la región" },
    ],
    dictation: "En Controllab el ensayo de aptitud evalúa el desempeño de los laboratorios participantes mediante el z-score calculado con el valor asignado y la desviación estándar del programa.",
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
  { id: "ana-paula", name: "Ana Paula", code: "ANAPAULA" },
  { id: "lucas", name: "Lucas", code: "LUCAS" },
  { id: "katia", name: "Katia", code: "KATIA" },
  { id: "vinicius", name: "Vinicius", code: "VINICIUS" },
  { id: "thiago", name: "Thiago", code: "THIAGO" },
];

const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática", "Controllab"];

// ─── Shuffle options with deterministic seed (stable per module+question) ────
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
// ─────────────────────────────────────────────────────────────────────────────


const LEVEL_COLOR: Record<string, string> = {
  Básico: "lvl-basico",
  Intermedio: "lvl-intermedio",
  Avanzado: "lvl-avanzado",
};

function createInitialState(): AppState {
  return { students: defaultStudents, currentStudentId: null, progress: {}, dictations: {} };
}

function normalize(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

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
  const [saveError, setSaveError] = useState("");
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

  const currentStudent = appState.students.find((s) => s.id === appState.currentStudentId) ?? null;
  const selectedModule = MODULES.find((m) => m.id === selectedModuleId) ?? MODULES[0];

  const speak = (text: string, rate: number = 0.9) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = rate;

    const voices = synth.getVoices();
    const spanishVoice = voices.find((v) => v.lang.startsWith("es"));
    if (spanishVoice) utterance.voice = spanishVoice;

    synth.speak(utterance);
  };

  const logout = () => {
  stopSpeak();
  setAppState((prev) => ({ ...prev, currentStudentId: null }));
  setSelectedModuleId(MODULES[0].id);
  setShowProfessorPanel(false);
};

  useEffect(() => {
    let mounted = true;
    const LSKEY = "aula-controllab-v7";
    const bootstrap = async () => {
      // Try Supabase first, fall back to localStorage silently
      try {
        if (supabase) {
          const remote = await loadRemoteState();
          if (!mounted) return;
          if (remote) {
            setAppState({ students: Array.isArray(remote.students) && remote.students.length ? remote.students : defaultStudents, currentStudentId: null, progress: remote.progress || {}, dictations: remote.dictations || {} });
            setLoadStatus("ready"); return;
          }
        }
      } catch { /* Supabase failed, fall through to localStorage */ }
      // Fallback: localStorage
      if (!mounted) return;
      try {
        const saved = localStorage.getItem(LSKEY);
        if (saved) { const parsed = JSON.parse(saved); setAppState({ ...createInitialState(), ...parsed, currentStudentId: null }); }
        else { setAppState(createInitialState()); }
      } catch { setAppState(createInitialState()); }
      setLoadStatus("ready");
    };
    bootstrap();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loadStatus !== "ready") return;
    const LSKEY = "aula-controllab-v7";
    const timeout = setTimeout(async () => {
      // Always save to localStorage
      try { localStorage.setItem(LSKEY, JSON.stringify(appState)); } catch {}
      // Try Supabase silently
      if (supabase) {
        try { await saveRemoteState(appState); setSaveError(""); }
        catch { /* silently ignore, localStorage is the backup */ }
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [appState, loadStatus]);

  const currentStudent = appState.students.find(s => s.id === appState.currentStudentId) ?? null;
  const selectedModule = MODULES.find(m => m.id === selectedModuleId) ?? MODULES[0];
  const studentProgress = currentStudent ? appState.progress[currentStudent.id] || {} : {};
  const studentDictations = currentStudent ? appState.dictations[currentStudent.id] || {} : {};
  const moduleProgress: ModuleProgress = studentProgress[selectedModuleId] || { completed: false, score: 0, total: selectedModule.quiz.length, attempts: 0 };
  const currentQuestion = selectedModule.quiz[currentQuestionIndex];
  const shuffledOpts = shuffleOpts(currentQuestion.options, strSeed(selectedModule.id + String(currentQuestionIndex)));
  const isCorrect = submitted && selectedOption === currentQuestion.answer;
  const currentDictation = studentDictations[selectedModuleId] || null;
  const filteredModules = activeCategory === "Todos" ? MODULES : MODULES.filter(m => m.category === activeCategory);

  useEffect(() => {
  stopSpeak();
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
    if (!found) { setLoginError("Usuario o contraseña incorrectos."); return; }
    setAppState(prev => ({ ...prev, currentStudentId: found.id }));
    setLoginError(""); setLoginName(""); setLoginCode("");
  };

  const logout = () => { setAppState(prev => ({ ...prev, currentStudentId: null })); setSelectedModuleId(MODULES[0].id); setShowProfessorPanel(false); setProfessorUnlocked(false); };

  const changePassword = () => {
    if (!newPassword.trim()) { setPasswordMsg("Escribí una contraseña nueva."); return; }
    if (newPassword.trim().length < 4) { setPasswordMsg("La contraseña debe tener al menos 4 caracteres."); return; }
    if (newPassword.trim() !== confirmPassword.trim()) { setPasswordMsg("Las contraseñas no coinciden."); return; }
    if (!currentStudent) return;
    setAppState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === currentStudent.id ? { ...s, code: newPassword.trim().toUpperCase() } : s)
    }));
    setPasswordMsg("✓ Contraseña actualizada correctamente.");
    setNewPassword(""); setConfirmPassword("");
    setTimeout(() => { setShowChangePassword(false); setPasswordMsg(""); }, 1500);
  };

  const handleProfessorClick = () => {
    if (professorUnlocked) { setShowProfessorPanel(v => !v); return; }
    const pwd = window.prompt("Contraseña del profesor:");
    if (pwd === PROFESSOR_PASSWORD) { setProfessorUnlocked(true); setShowProfessorPanel(true); }
    else if (pwd !== null) { alert("Contraseña incorrecta."); }
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
    const ok = window.confirm(`¿Reiniciar el módulo "${selectedModule.title}" para ${currentStudent.name}?`);
    if (!ok) return;
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

  const setAnswerMemory = (value: string) => { setSelectedOption(value); setQuizAnswers(prev => ({ ...prev, [currentQuestionIndex]: value })); };

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

const speak = (text: string, rate: number = 0.9) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;

  // corta cualquier audio anterior
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = rate;

  // opcional: elegir voz en español si existe
  const voices = synth.getVoices();
  const spanishVoice = voices.find((v) => v.lang.startsWith("es"));
  if (spanishVoice) utterance.voice = spanishVoice;

  synth.speak(utterance);
};

const stopSpeak = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
};

const checkDictation = () => {
  if (!currentStudent) return;

  const expected = normalize(selectedModule.dictation);
  const written = normalize(dictationText);
  const expWords = expected.split(" ").filter(Boolean);
  const wrtWords = written.split(" ").filter(Boolean);
  const matches = wrtWords.filter((w, i) => w === expWords[i]).length;
  const score = expWords.length ? Math.round((matches / expWords.length) * 100) : 0;

  const result: DictationResult = {
    exact: expected === written,
    score,
    written: dictationText,
    expected: selectedModule.dictation,
    updatedAt: new Date().toLocaleString(),
  };

  setDictationResult(result);

  setAppState((prev) => ({
    ...prev,
    dictations: {
      ...prev.dictations,
      [currentStudent.id]: {
        ...(prev.dictations[currentStudent.id] || {}),
        [selectedModuleId]: result,
      },
    },
  }));
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  html, body { background: #060b14 !important; }
  * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
  .mono { font-family: 'DM Mono', monospace !important; }
`;

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    html, body { background: #060b14 !important; }
    * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .mono { font-family: 'DM Mono', monospace !important; }

    /* GLASS */
    .glass { background: rgba(14,22,40,0.7) !important; border: 1px solid rgba(255,255,255,0.08) !important; backdrop-filter: blur(24px) !important; -webkit-backdrop-filter: blur(24px) !important; }
    .glass-dark { background: rgba(5,10,20,0.8) !important; border: 1px solid rgba(255,255,255,0.05) !important; backdrop-filter: blur(20px) !important; }

    /* ACCENT */
    .accent { color: #2DD4BF !important; }

    /* BUTTON */
    .btn-accent { background: linear-gradient(135deg, #2DD4BF, #0ea5a0) !important; color: #021010 !important; font-weight: 700 !important; border-radius: 14px !important; transition: all 0.2s cubic-bezier(.4,0,.2,1) !important; box-shadow: 0 4px 20px rgba(45,212,191,0.2) !important; letter-spacing: 0.01em !important; border: none !important; }
    .btn-accent:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px rgba(45,212,191,0.35) !important; opacity: 1 !important; }

    /* INPUTS */
    input, textarea { outline: none !important; transition: all 0.2s !important; }
    input:focus, textarea:focus { border-color: #2DD4BF !important; box-shadow: 0 0 0 3px rgba(45,212,191,0.12) !important; }

    /* MODULE CARDS */
    .module-card { transition: all 0.22s cubic-bezier(.4,0,.2,1) !important; }
    .module-card:hover { border-color: rgba(45,212,191,0.45) !important; transform: translateY(-3px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important; }
    .module-card.active { background: linear-gradient(135deg, rgba(45,212,191,0.13), rgba(14,165,160,0.05)) !important; border-color: #2DD4BF !important; box-shadow: 0 0 0 1px rgba(45,212,191,0.15), 0 0 32px rgba(45,212,191,0.18) !important; }

    /* PROGRESS */
    .progress-bar { height: 3px !important; border-radius: 0 !important; background: rgba(255,255,255,0.06) !important; overflow: hidden !important; }
    .progress-fill { height: 100% !important; border-radius: 99px !important; background: linear-gradient(90deg, #2DD4BF, #67e8f9) !important; transition: width 0.7s cubic-bezier(.4,0,.2,1) !important; box-shadow: 0 0 10px rgba(45,212,191,0.4) !important; }
    .progress-bar-card { height: 4px !important; border-radius: 99px !important; background: rgba(255,255,255,0.07) !important; overflow: hidden !important; margin-top: 10px !important; }
    .progress-fill-card { height: 100% !important; border-radius: 99px !important; background: linear-gradient(90deg, #2DD4BF, #67e8f9) !important; transition: width 0.7s ease !important; }

    /* TABS */
    .section-tab { transition: all 0.18s !important; cursor: pointer !important; border-radius: 10px !important; padding: 7px 15px !important; font-size: 13px !important; font-weight: 600 !important; letter-spacing: 0.01em !important; white-space: nowrap !important; }
    .section-tab.active { background: #2DD4BF !important; color: #021010 !important; box-shadow: 0 4px 14px rgba(45,212,191,0.3) !important; }
    .section-tab:not(.active) { color: #94a3b8 !important; }
    .section-tab:not(.active):hover { color: #fff !important; background: rgba(255,255,255,0.08) !important; }

    /* QUIZ OPTIONS */
    .option-btn { transition: all 0.15s !important; border: 1.5px solid rgba(255,255,255,0.09) !important; border-radius: 14px !important; padding: 14px 18px !important; text-align: left !important; width: 100% !important; background: rgba(255,255,255,0.03) !important; color: #e2e8f0 !important; cursor: pointer !important; font-size: 14px !important; line-height: 1.55 !important; }
    .option-btn:hover:not(:disabled) { border-color: rgba(45,212,191,0.45) !important; background: rgba(45,212,191,0.08) !important; }
    .option-btn.selected { border-color: #2DD4BF !important; background: rgba(45,212,191,0.1) !important; }
    .option-btn.correct { border-color: #2DD4BF !important; background: rgba(45,212,191,0.15) !important; color: #2DD4BF !important; font-weight: 600 !important; }
    .option-btn.wrong { border-color: #fb7185 !important; background: rgba(251,113,133,0.1) !important; color: #fb7185 !important; }

    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 4px !important; }
    ::-webkit-scrollbar-track { background: transparent !important; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08) !important; border-radius: 99px !important; }

    /* READING */
    .reading-p { line-height: 1.9 !important; color: #cbd5e1 !important; font-size: 15px !important; }

    /* LEVEL BADGES */
    .lvl-basico { background: rgba(52,211,153,0.12) !important; color: #34d399 !important; border-radius: 99px !important; padding: 3px 10px !important; font-size: 11px !important; font-weight: 700 !important; }
    .lvl-intermedio { background: rgba(251,191,36,0.12) !important; color: #fbbf24 !important; border-radius: 99px !important; padding: 3px 10px !important; font-size: 11px !important; font-weight: 700 !important; }
    .lvl-avanzado { background: rgba(251,113,133,0.12) !important; color: #fb7185 !important; border-radius: 99px !important; padding: 3px 10px !important; font-size: 11px !important; font-weight: 700 !important; }

    /* CATEGORY COLORS */
    .cat-lab { color: #2DD4BF !important; } .cat-ges { color: #fbbf24 !important; } .cat-com { color: #a78bfa !important; } .cat-tec { color: #60a5fa !important; } .cat-gra { color: #fb7185 !important; }

    /* ANIMATIONS */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .ani { animation: fadeUp 0.28s ease both; }
  `;


  // ─── STYLE TOKENS ───────────────────────────────────────────────────────────
  const BG = "#060b14";
  const TEAL = "#2DD4BF";
  const TEAL_DIM = "rgba(45,212,191,0.1)";
  const SURFACE = "rgba(14,22,40,0.75)";
  const SURFACE_D = "rgba(5,10,20,0.85)";
  const BORDER = "rgba(255,255,255,0.08)";
  const BORDER_A = "rgba(45,212,191,0.35)";
  const TEXT = "#E2E8F0";
  const TEXT_MID = "#94A3B8";
  const TEXT_DIM = "#475569";
  const FONT = "'Plus Jakarta Sans',system-ui,sans-serif";
  const MONO = "'DM Mono',monospace";

  const glass = { background: SURFACE, border: `1px solid ${BORDER}`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" };
  const glassDark = { background: SURFACE_D, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" };
  const card = (active: boolean) => ({ ...glass, borderRadius: 16, padding: 16, textAlign: "left" as const, cursor: "pointer", transition: "all 0.2s ease", border: `1px solid ${active ? TEAL : BORDER}`, background: active ? "linear-gradient(135deg,rgba(45,212,191,0.13),rgba(14,165,160,0.04))" : SURFACE, boxShadow: active ? `0 0 0 1px rgba(45,212,191,0.15), 0 0 28px rgba(45,212,191,0.15)` : "none", width: "100%" });
  const btnAccent = { background: `linear-gradient(135deg,${TEAL},#0ea5a0)`, color: "#021010", fontWeight: 700, borderRadius: 14, border: "none", cursor: "pointer", padding: "11px 22px", fontSize: 14, fontFamily: FONT, letterSpacing: "0.01em", boxShadow: "0 4px 20px rgba(45,212,191,0.2)", transition: "all 0.2s ease" };
  const tab = (active: boolean) => ({ borderRadius: 10, padding: "7px 15px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.18s", fontFamily: FONT, background: active ? TEAL : "rgba(255,255,255,0.06)", color: active ? "#021010" : TEXT_MID, boxShadow: active ? "0 4px 14px rgba(45,212,191,0.28)" : "none", whiteSpace: "nowrap" as const });
  const input = { background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, color: TEXT, padding: "12px 16px", width: "100%", fontSize: 14, fontFamily: FONT, outline: "none" };
  const inputStyle = input;
  const levelBadge = (l: string) => ({ borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: FONT, background: l==="Básico"?"rgba(52,211,153,0.12)":l==="Intermedio"?"rgba(251,191,36,0.12)":"rgba(251,113,133,0.12)", color: l==="Básico"?"#34d399":l==="Intermedio"?"#fbbf24":"#fb7185" });
  const catColor = (c: string) => c==="Laboratorio"?TEAL:c==="Gestión"?"#fbbf24":c==="Comunicación"?"#a78bfa":c==="Tecnología"?"#60a5fa":c==="Controllab"?"#f97316":"#fb7185";
  const optBtn = (sel: boolean, correct: boolean, wrong: boolean) => ({ transition: "all 0.15s", border: `1.5px solid ${correct?TEAL:wrong?"#fb7185":sel?TEAL:BORDER}`, borderRadius: 14, padding: "14px 18px", textAlign: "left" as const, width: "100%", background: correct?"rgba(45,212,191,0.15)":wrong?"rgba(251,113,133,0.1)":sel?TEAL_DIM:"rgba(255,255,255,0.03)", color: correct?TEAL:wrong?"#fb7185":TEXT, cursor: "pointer", fontSize: 14, lineHeight: 1.55, fontFamily: FONT, fontWeight: correct?700:400 });

  const mainBg = { background: `radial-gradient(ellipse 80% 50% at 50% -5%, rgba(45,212,191,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(96,165,250,0.04) 0%, transparent 50%), ${BG}`, minHeight: "100vh", color: TEXT, fontFamily: FONT };

  if (loadStatus === "loading") return (
    <div style={{...mainBg, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:22,fontWeight:700,fontFamily:FONT}}>Cargando Aula Controllab...</div>
        <div style={{color:TEXT_MID,marginTop:8,fontSize:14,fontFamily:FONT}}>Sincronizando progreso en la nube ☁️</div>
      </div>
    </div>
  );

  if (loadStatus === "error") return (
    <div style={{...mainBg, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 24px"}}>
      <div style={{maxWidth:480,textAlign:"center"}}>
        <div style={{fontSize:22,fontWeight:700,color:"#fb7185",fontFamily:FONT}}>Error al cargar los datos</div>
        <p style={{color:"#cbd5e1",marginTop:12,fontFamily:FONT}}>Revisá las variables de Supabase y la tabla <code>aula_controllab_state</code>.</p>
      </div>
    </div>
  );

  if (!currentStudent) return (
    <div style={{...mainBg, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 16px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap'); input:focus{border-color:${TEAL}!important;box-shadow:0 0 0 3px rgba(45,212,191,0.12)!important;outline:none!important;}`}</style>
      <div style={{width:"100%",maxWidth:960}}>
        <div style={{display:"grid",gap:32,gridTemplateColumns:"repeat(auto-fit,minmax(380px,1fr))"}}>
          {/* LEFT */}
          <div style={{...glass,borderRadius:28,padding:"40px 40px",boxShadow:"0 0 60px rgba(45,212,191,0.08)"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>CONTROLLAB · ES-PT</div>
            <h1 style={{fontSize:48,fontWeight:800,lineHeight:1.1,fontFamily:FONT,margin:0}}>
              Aula<br/><span style={{color:TEAL}}>Controllab</span>
            </h1>
            <p style={{marginTop:16,color:"#94a3b8",lineHeight:1.7,fontFamily:FONT}}>Plataforma de español técnico para el equipo Controllab. El progreso queda guardado en la nube.</p>
            <div style={{marginTop:32,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[{n:MODULES.length,l:"Módulos",s:"Lab · Gestión · TI · Com. · Gram."},{n:appState.students.length,l:"Alumnos",s:"Guardados en nube"},{n:"☁️",l:"Progreso",s:"Multidispositivo"},{n:"🎧",l:"Audio TTS",s:"Lectura y dictado"}].map(i=>(
                <div key={i.l} style={{...glass,borderRadius:16,padding:16}}>
                  <div style={{fontSize:24,fontWeight:800,color:TEXT,fontFamily:MONO}}>{i.n}</div>
                  <div style={{fontSize:13,fontWeight:700,color:TEXT,marginTop:4,fontFamily:FONT}}>{i.l}</div>
                  <div style={{fontSize:11,color:TEXT_DIM,marginTop:2,fontFamily:FONT}}>{i.s}</div>
                </div>
              ))}
            </div>
          </div>
          {/* RIGHT */}
          <div style={{...glass,borderRadius:28,padding:"40px 40px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>INGRESO</div>
            <h2 style={{fontSize:26,fontWeight:800,fontFamily:FONT,margin:0}}>Entrar como alumno</h2>
            <p style={{marginTop:8,color:TEXT_MID,fontSize:14,fontFamily:FONT}}>El avance queda guardado aunque entres desde otro dispositivo.</p>
            <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{display:"block",fontSize:13,color:"#cbd5e1",marginBottom:8,fontWeight:500,fontFamily:FONT}}>Usuario</label>
                <input style={input} value={loginName} onChange={e=>setLoginName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Ej: Marília"/>
              </div>
              <div>
                <label style={{display:"block",fontSize:13,color:"#cbd5e1",marginBottom:8,fontWeight:500,fontFamily:FONT}}>Contraseña</label>
                <input style={{...input,fontFamily:MONO}} value={loginCode} onChange={e=>setLoginCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Tu contraseña"/>
              </div>
              {loginError&&<p style={{color:"#fb7185",fontSize:13,fontFamily:FONT}}>{loginError}</p>}
              {saveError&&<p style={{color:"#fbbf24",fontSize:13,fontFamily:FONT}}>{saveError}</p>}
              <button style={btnAccent} onClick={login}>Ingresar →</button>
            </div>
            <div style={{...glass,borderRadius:20,padding:20,marginTop:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:12,fontFamily:MONO}}>PANEL DEL PROFE</div>
              <button onClick={handleProfessorClick} style={{background:"none",border:"none",color:TEXT_MID,cursor:"pointer",fontSize:14,fontFamily:FONT,width:"100%",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>🔐 Acceso al panel de gestión</span><span style={{color:TEXT_DIM}}>{showProfessorPanel?"▲":"▼"}</span>
              </button>
              {showProfessorPanel&&professorUnlocked&&(
                <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
                  <input style={input} value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Nombre del alumno"/>
                  <input style={{...input,fontFamily:MONO}} value={newStudentCode} onChange={e=>setNewStudentCode(e.target.value)} placeholder="Contraseña"/>
                  <button onClick={addStudent} style={{...btnAccent,textAlign:"center"}}>+ Agregar alumno</button>
                  <button onClick={resetAllStudents} style={{background:"rgba(251,113,133,0.1)",border:"1px solid rgba(251,113,133,0.3)",color:"#fb7185",borderRadius:12,padding:"10px 16px",cursor:"pointer",fontSize:13,fontFamily:FONT}}>Reset total de todos los alumnos</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <div style={mainBg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{font-family:'Plus Jakarta Sans',system-ui,sans-serif!important;box-sizing:border-box} .mono-f{font-family:'DM Mono',monospace!important} input:focus,textarea:focus{border-color:${TEAL}!important;box-shadow:0 0 0 3px rgba(45,212,191,0.12)!important;outline:none!important} ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}`}</style>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:50,...glassDark,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:1600,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" as const}}>
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,fontFamily:MONO}}>CONTROLLAB</div>
              <div style={{fontWeight:700,fontSize:17,lineHeight:1.2}}>Hola, <span style={{color:TEAL}}>{currentStudent.name}</span> 👋</div>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
              {[{l:"Progreso",v:`${overallPercent}%`,c:TEAL},{l:"Puntaje",v:`${totalBestScore}/${totalQuestions}`,c:TEXT},{l:"Módulos",v:`${completedModules}/${MODULES.length}`,c:TEXT}].map(x=>(
                <div key={x.l} style={{...glass,borderRadius:12,padding:"7px 14px",fontSize:13}}>
                  <span style={{color:TEXT_MID}}>{x.l} </span><span style={{fontWeight:700,color:x.c,fontFamily:MONO}}>{x.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
            {[{l:"🔑 Mi contraseña",fn:()=>setShowChangePassword(v=>!v),c:"#a78bfa"},{l:showProfessorPanel?"✕ Panel":"📊 Panel profe",fn:handleProfessorClick,c:TEXT_MID},{l:"Salir →",fn:logout,c:TEXT_MID}].map(b=>(
              <button key={b.l} onClick={b.fn} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:b.c,border:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:FONT,fontWeight:600}}>{b.l}</button>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{height:3,background:"rgba(255,255,255,0.05)"}}>
          <div style={{height:"100%",width:`${overallPercent}%`,background:`linear-gradient(90deg,${TEAL},#67e8f9)`,boxShadow:"0 0 10px rgba(45,212,191,0.4)",transition:"width 0.7s ease"}}/>
        </div>
      </div>

      <div style={{maxWidth:1600,margin:"0 auto",padding:"32px 24px"}}>
        {saveError&&<div style={{marginBottom:16,borderRadius:16,border:"1px solid rgba(251,191,36,0.3)",background:"rgba(251,191,36,0.08)",color:"#fbbf24",padding:"12px 16px",fontSize:13,fontFamily:FONT}}>{saveError}</div>}

        {/* CAMBIAR CONTRASEÑA */}
        {showChangePassword&&(
          <div style={{...glass,borderRadius:24,padding:24,marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:TEXT_DIM,marginBottom:4,fontFamily:MONO}}>MI CUENTA</div>
                <h3 style={{fontSize:18,fontWeight:700,margin:0,fontFamily:FONT}}>🔑 Cambiar contraseña</h3>
              </div>
              <button onClick={()=>{setShowChangePassword(false);setPasswordMsg("");setNewPassword("");setConfirmPassword("");}} style={{background:"none",border:"none",color:TEXT_MID,cursor:"pointer",fontSize:20,fontFamily:FONT}}>✕</button>
            </div>
            <div style={{display:"grid",gap:12,gridTemplateColumns:"1fr 1fr 1fr",alignItems:"end"}}>
              <div>
                <label style={{display:"block",fontSize:13,color:"#cbd5e1",marginBottom:6,fontFamily:FONT}}>Nueva contraseña</label>
                <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&changePassword()} placeholder="Mínimo 4 caracteres" style={{...inputStyle,width:"100%"}}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:13,color:"#cbd5e1",marginBottom:6,fontFamily:FONT}}>Confirmar contraseña</label>
                <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&changePassword()} placeholder="Repetí la contraseña" style={{...inputStyle,width:"100%"}}/>
              </div>
              <button onClick={changePassword} style={{...btnAccent,padding:"12px 20px",textAlign:"center" as const}}>Guardar cambio</button>
            </div>
            {passwordMsg&&<div style={{marginTop:12,fontSize:13,fontFamily:FONT,color:passwordMsg.startsWith("✓")?"#34d399":"#fb7185"}}>{passwordMsg}</div>}
          </div>
        )}

        {/* PROFESSOR PANEL */}
        {showProfessorPanel&&professorUnlocked&&(
          <div style={{...glass,borderRadius:24,padding:24,marginBottom:32}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap" as const,gap:16}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:4,fontFamily:MONO}}>PANEL DEL PROFESOR</div>
                <h2 style={{fontSize:20,fontWeight:700,margin:0,fontFamily:FONT}}>Gestión y seguimiento</h2>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                {(["progress","students","dictations"] as const).map(t=>(
                  <button key={t} onClick={()=>setTeacherTab(t)} style={tab(teacherTab===t)}>{t==="progress"?"📊 Progreso":t==="students"?"👥 Alumnos":"🎙 Dictados"}</button>
                ))}
                <button onClick={resetAllStudents} style={{borderRadius:12,padding:"7px 15px",fontSize:13,fontWeight:600,background:"rgba(251,113,133,0.12)",color:"#fb7185",border:"1px solid rgba(251,113,133,0.2)",cursor:"pointer",fontFamily:FONT}}>Reset total</button>
              </div>
            </div>

            {teacherTab==="progress"&&(
              <div style={{overflowX:"auto" as const,borderRadius:16,border:`1px solid ${BORDER}`}}>
                <table style={{width:"100%",fontSize:13,borderCollapse:"collapse" as const,fontFamily:FONT}}>
                  <thead><tr style={{background:"rgba(255,255,255,0.04)",color:TEXT_MID}}>
                    <th style={{textAlign:"left",padding:"12px 16px",fontWeight:600}}>Alumno</th>
                    {MODULES.map(m=><th key={m.id} style={{textAlign:"center",padding:"12px 4px",fontSize:12,fontWeight:600}} title={m.title}>{m.emoji}</th>)}
                    <th style={{textAlign:"center",padding:"12px 16px",fontWeight:600}}>Total</th>
                    <th style={{textAlign:"center",padding:"12px 16px",fontWeight:600}}>%</th>
                    <th style={{textAlign:"center",padding:"12px 16px",fontWeight:600}}>Reset</th>
                  </tr></thead>
                  <tbody>{professorRows.map((row,i)=>(
                    <tr key={row.id} style={{borderTop:`1px solid rgba(255,255,255,0.05)`,background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                      <td style={{padding:"10px 16px",fontWeight:500}}>{row.name}</td>
                      {MODULES.map(m=>{const p=(appState.progress[row.id]||{})[m.id];return(
                        <td key={m.id} style={{textAlign:"center",padding:"8px 4px"}}>
                          {p?<button onClick={()=>{if(window.confirm(`¿Reiniciar ${m.title} de ${row.name}?`))resetStudentModule(row.id,m.id);}} style={{background:"none",border:"none",color:TEAL,fontWeight:700,fontFamily:MONO,fontSize:12,cursor:"pointer"}}>{p.score}/{p.total}</button>:<span style={{color:TEXT_DIM}}>—</span>}
                        </td>);})}
                      <td style={{textAlign:"center",padding:"10px 16px",fontWeight:700,color:TEAL,fontFamily:MONO}}>{row.bestScore}/{totalQuestions}</td>
                      <td style={{textAlign:"center",padding:"10px 16px"}}>
                        <span style={{fontSize:12,fontWeight:700,padding:"3px 8px",borderRadius:99,background:row.completedMods===MODULES.length?"rgba(52,211,153,0.12)":row.completedMods>0?"rgba(251,191,36,0.12)":"rgba(71,85,105,0.3)",color:row.completedMods===MODULES.length?"#34d399":row.completedMods>0?"#fbbf24":TEXT_MID}}>{Math.round((row.completedMods/MODULES.length)*100)}%</span>
                      </td>
                      <td style={{textAlign:"center",padding:"8px 16px"}}>
                        <button onClick={()=>resetStudentAll(row.id,row.name)} style={{background:"none",border:"none",color:"#fb7185",fontSize:12,cursor:"pointer",fontFamily:FONT}}>🗑️ Todo</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
                <div style={{padding:"8px 16px",fontSize:12,color:TEXT_DIM,fontFamily:FONT}}>💡 Clic en cualquier puntaje para reiniciar ese módulo</div>
              </div>
            )}

            {teacherTab==="dictations"&&(
              <div style={{overflowX:"auto" as const,borderRadius:16,border:`1px solid ${BORDER}`}}>
                <table style={{width:"100%",fontSize:13,borderCollapse:"collapse" as const,fontFamily:FONT}}>
                  <thead><tr style={{background:"rgba(255,255,255,0.04)",color:TEXT_MID}}>
                    <th style={{textAlign:"left",padding:"12px 16px",fontWeight:600}}>Alumno</th>
                    {MODULES.map(m=><th key={m.id} style={{textAlign:"center",padding:"12px 4px",fontSize:12}} title={m.title}>{m.emoji}</th>)}
                    <th style={{textAlign:"center",padding:"12px 16px",fontWeight:600}}>Promedio</th>
                  </tr></thead>
                  <tbody>{professorRows.map((row,i)=>(
                    <tr key={row.id} style={{borderTop:`1px solid rgba(255,255,255,0.05)`,background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                      <td style={{padding:"10px 16px",fontWeight:500}}>{row.name}</td>
                      {MODULES.map(m=>{const d=(appState.dictations[row.id]||{})[m.id];return<td key={m.id} style={{textAlign:"center",padding:"8px 4px"}}>{d!=null?<span style={{fontFamily:MONO,fontSize:12,fontWeight:700,color:d.score>=80?"#34d399":d.score>=50?"#fbbf24":"#fb7185"}}>{d.score}%</span>:<span style={{color:TEXT_DIM}}>—</span>}</td>;})}
                      <td style={{textAlign:"center",padding:"10px 16px",fontWeight:700,color:TEAL,fontFamily:MONO}}>{row.dictAvg!=null?`${row.dictAvg}%`:"—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {teacherTab==="students"&&(
              <div style={{display:"grid",gap:24,gridTemplateColumns:"1fr 1fr"}}>
                <div style={{...glassDark,borderRadius:20,padding:20}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>AGREGAR ALUMNO</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <input style={input} value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Nombre"/>
                    <input style={{...input,fontFamily:MONO}} value={newStudentCode} onChange={e=>setNewStudentCode(e.target.value)} placeholder="Contraseña"/>
                    <button onClick={addStudent} style={{...btnAccent,textAlign:"center",padding:"11px 16px"}}>+ Agregar</button>
                    <button onClick={resetAllStudents} style={{background:"rgba(251,113,133,0.1)",border:"1px solid rgba(251,113,133,0.3)",color:"#fb7185",borderRadius:12,padding:"10px 16px",cursor:"pointer",fontSize:13,fontFamily:FONT}}>Resetear todos</button>
                  </div>
                </div>
                <div style={{...glassDark,borderRadius:20,padding:20}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>ALUMNOS REGISTRADOS</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:320,overflowY:"auto" as const}}>
                    {appState.students.map(s=>(
                      <div key={s.id} style={{...glass,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div><div style={{fontWeight:600,fontSize:14}}>{s.name}</div><div style={{fontSize:12,color:TEXT_DIM,fontFamily:MONO}}>{s.code}</div></div>
                        {!defaultStudents.some(d=>d.id===s.id)?<button onClick={()=>removeStudent(s.id)} style={{background:"none",border:"none",color:"#fb7185",cursor:"pointer",fontSize:12,fontFamily:FONT}}>Eliminar</button>:<span style={{fontSize:12,color:TEXT_DIM}}>Base</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORY TABS */}
        <div style={{display:"flex",gap:8,marginBottom:24,overflowX:"auto" as const,paddingBottom:4}}>
          {CATEGORIES.map(cat=><button key={cat} onClick={()=>setActiveCategory(cat)} style={tab(activeCategory===cat)}>{cat}</button>)}
        </div>

        {/* MODULE GRID */}
        <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",marginBottom:32}}>
          {filteredModules.map(module=>{
            const prog=studentProgress[module.id]; const active=module.id===selectedModuleId;
            return(
              <button key={module.id} onClick={()=>setSelectedModuleId(module.id)} style={card(active)}>
                <div style={{fontSize:22,marginBottom:8}}>{module.emoji}</div>
                <div style={{fontSize:11,fontWeight:700,color:catColor(module.category),marginBottom:4,fontFamily:MONO,letterSpacing:"0.05em",textTransform:"uppercase" as const}}>{module.category}</div>
                <div style={{fontWeight:700,fontSize:13,lineHeight:1.3,color:TEXT}}>{module.title}</div>
                <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={levelBadge(module.level)}>{module.level}</span>
                  <span style={{fontFamily:MONO,fontSize:12,fontWeight:700,color:prog?TEAL:TEXT_DIM}}>{prog?`${prog.score}/${prog.total}`:"—"}</span>
                </div>
                {prog&&(
                  <div style={{marginTop:10,height:4,borderRadius:99,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${TEAL},#67e8f9)`,width:`${Math.round((prog.score/prog.total)*100)}%`,transition:"width 0.7s ease"}}/>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <div style={{display:"grid",gap:24,gridTemplateColumns:"1fr 360px",alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>

            {/* MODULE HEADER */}
            <div style={{...glass,borderRadius:24,padding:24}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap" as const}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:catColor(selectedModule.category),marginBottom:6,fontFamily:MONO,textTransform:"uppercase" as const}}>{selectedModule.category}</div>
                  <h2 style={{fontSize:28,fontWeight:800,margin:0,fontFamily:FONT}}>{selectedModule.emoji} {selectedModule.title}</h2>
                  <p style={{marginTop:8,color:TEXT_MID,fontSize:14,fontFamily:FONT}}>{selectedModule.description}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const}}>
                  <span style={levelBadge(selectedModule.level)}>{selectedModule.level}</span>
                  <div style={{...glass,borderRadius:12,padding:"8px 14px",fontSize:13}}>
                    <span style={{color:TEXT_MID}}>Mejor: </span><span style={{fontWeight:700,color:TEAL,fontFamily:MONO}}>{moduleProgress.score}/{moduleProgress.total}</span>
                  </div>
                  {moduleProgress.attempts>0&&<div style={{...glass,borderRadius:12,padding:"8px 14px",fontSize:13}}>
                    <span style={{color:TEXT_MID}}>Intentos: </span><span style={{fontWeight:700,fontFamily:MONO}}>{moduleProgress.attempts}</span>
                  </div>}
                  {!!studentProgress[selectedModuleId]&&(
                    <button onClick={resetCurrentModule} style={{borderRadius:12,padding:"8px 14px",fontSize:13,fontWeight:600,background:"rgba(251,113,133,0.1)",color:"#fb7185",border:"1px solid rgba(251,113,133,0.2)",cursor:"pointer",fontFamily:FONT}}>🔄 Reiniciar</button>
                  )}
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:24,flexWrap:"wrap" as const}}>
                {(["reading","quiz","dictation","vocab"] as const).map(sec=>(
                  <button key={sec} onClick={()=>setActiveSection(sec)} style={tab(activeSection===sec)}>
                    {sec==="reading"?"📖 Lectura":sec==="quiz"?"✏️ Quiz":sec==="dictation"?"🎙 Dictado":"📝 Vocabulario"}
                  </button>
                ))}
              </div>
            </div>

            {/* READING */}
            {activeSection==="reading"&&(
              <div style={{...glass,borderRadius:24,padding:32}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap" as const,gap:12}}>
                  <h3 style={{fontSize:20,fontWeight:700,margin:0,fontFamily:FONT}}>{selectedModule.readingTitle}</h3>
                  )} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:TEXT_MID,border:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:8}}>🔊 Escuchar</button>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
  <button
    onClick={()=>speak(selectedModule.reading.join(" "),0.9)}
    style={{
      ...glass,
      borderRadius:12,
      padding:"9px 16px",
      fontSize:13,
      color:TEXT_MID,
      border:`1px solid ${BORDER}`,
      cursor:"pointer",
      fontFamily:FONT,
      display:"flex",
      alignItems:"center",
      gap:8
    }}
  >
    🔊 Escuchar
  </button>

  <button
    onClick={stopSpeak}
    style={{
      borderRadius:12,
      padding:"9px 16px",
      fontSize:13,
      fontWeight:600,
      background:"rgba(244,63,94,0.15)",
      color:"#fda4af",
      border:"1px solid rgba(244,63,94,0.3)",
      cursor:"pointer",
      fontFamily:FONT
    }}
  >
    ⏹ Stop
  </button>
</div>
                <div style={{display:"flex",flexDirection:"column",gap:20}}>
                  {selectedModule.reading.map((para,i)=><p key={i} style={{lineHeight:1.9,color:"#cbd5e1",fontSize:15,margin:0,fontFamily:FONT}}>{para}</p>)}
                </div>
                <button onClick={()=>setActiveSection("quiz")} style={{...btnAccent,marginTop:32,display:"inline-block"}}>Ir al quiz →</button>
              </div>
            )}

            {/* QUIZ */}
            {activeSection==="quiz"&&(
              <div style={{...glass,borderRadius:24,padding:32}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap" as const,gap:12}}>
                  <h3 style={{fontSize:20,fontWeight:700,margin:0,fontFamily:FONT}}>Comprensión</h3>
                  <div style={{...glass,borderRadius:12,padding:"8px 16px",fontFamily:MONO,fontSize:14,fontWeight:700,color:TEAL}}>{currentQuestionIndex+1}/{selectedModule.quiz.length}</div>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99,marginBottom:28,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${((currentQuestionIndex+(submitted?1:0))/selectedModule.quiz.length)*100}%`,background:`linear-gradient(90deg,${TEAL},#67e8f9)`,transition:"width 0.4s ease",borderRadius:99}}/>
                </div>
                <div style={{...glassDark,borderRadius:20,padding:24}}>
                  <p style={{fontSize:16,fontWeight:600,marginBottom:20,lineHeight:1.6,fontFamily:FONT}}>{currentQuestion.question}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {shuffledOpts.map(option=>{
                      const sel=selectedOption===option; const correct=submitted&&option===currentQuestion.answer; const wrong=submitted&&sel&&option!==currentQuestion.answer;
                      return <button key={option} onClick={()=>!submitted&&setAnswerMemory(option)} disabled={submitted} style={optBtn(sel,correct,wrong)}>{option}</button>;
                    })}
                  </div>
                </div>
                <div style={{marginTop:24,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap" as const,gap:16}}>
                  <div style={{fontSize:14,fontFamily:FONT}}>
                    {submitted?(isCorrect?<span style={{color:"#34d399",fontWeight:600}}>✓ ¡Correcto!</span>:<span style={{color:"#fb7185"}}>✗ Respuesta: <strong style={{color:TEXT}}>{currentQuestion.answer}</strong></span>):<span style={{color:TEXT_MID}}>Elegí una opción.</span>}
                  </div>
                  {!submitted?<button onClick={handleSubmit} disabled={!selectedOption} style={{...btnAccent,opacity:selectedOption?1:0.4}}>Comprobar</button>
                  :<button onClick={handleNext} style={btnAccent}>{currentQuestionIndex<selectedModule.quiz.length-1?"Siguiente →":"Finalizar ✓"}</button>}
                </div>
              </div>
            )}

            {/* DICTATION */}
            {activeSection==="dictation"&&(
              <div style={{...glass,borderRadius:24,padding:32}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap" as const,gap:12}}>
                  <h3 style={{fontSize:20,fontWeight:700,margin:0,fontFamily:FONT}}>🎙 Dictado</h3>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
  <button
    onClick={()=>speak(selectedModule.dictation,0.75)}
    style={{
      ...glass,
      borderRadius:12,
      padding:"9px 16px",
      fontSize:13,
      color:TEXT_MID,
      border:`1px solid ${BORDER}`,
      cursor:"pointer",
      fontFamily:FONT,
      display:"flex",
      alignItems:"center",
      gap:8
    }}
  >
    🔊 Reproducir
  </button>

  <button
    onClick={stopSpeak}
    style={{
      borderRadius:12,
      padding:"9px 16px",
      fontSize:13,
      fontWeight:600,
      background:"rgba(244,63,94,0.15)",
      color:"#fda4af",
      border:"1px solid rgba(244,63,94,0.3)",
      cursor:"pointer",
      fontFamily:FONT
    }}
  >
    ⏹ Stop
  </button>
</div>
                </div>
                <p style={{color:TEXT_MID,fontSize:14,marginBottom:20,lineHeight:1.6,fontFamily:FONT}}>Escuchá el audio y escribí la frase en español. Podés repetirlo varias veces.</p>
                <textarea value={dictationText} onChange={e=>setDictationText(e.target.value)} rows={4} placeholder="Escribí lo que escuchaste..." style={{...input,resize:"none" as const,lineHeight:1.7,borderRadius:16,padding:"16px 20px"}}/>
                <button onClick={checkDictation} style={{...btnAccent,marginTop:16,display:"inline-block"}}>Corregir dictado</button>
                {(dictationResult||currentDictation)&&(()=>{const r=dictationResult||currentDictation!;return(
                  <div style={{...glassDark,borderRadius:20,padding:20,marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{fontSize:32,fontWeight:800,fontFamily:MONO,color:r.score>=80?"#34d399":r.score>=50?"#fbbf24":"#fb7185"}}>{r.score}%</div>
                      <div style={{fontSize:14,color:TEXT_MID,fontFamily:FONT}}>{r.score===100?"¡Perfecto! 🎉":r.score>=80?"¡Muy bien!":r.score>=50?"Buen intento":"Seguí practicando"}</div>
                    </div>
                    <div style={{fontSize:14,fontFamily:FONT}}><span style={{color:TEXT_MID}}>Frase modelo: </span><span style={{color:"#cbd5e1",fontStyle:"italic"}}>{r.expected}</span></div>
                  </div>
                );})()}
              </div>
            )}

            {/* VOCAB */}
            {activeSection==="vocab"&&(
              <div style={{...glass,borderRadius:24,padding:32}}>
                <h3 style={{fontSize:20,fontWeight:700,marginBottom:24,fontFamily:FONT}}>📝 Vocabulario clave</h3>
                <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))"}}>
                  {selectedModule.vocab.map(item=>(
                    <div key={item.es} style={{...glassDark,borderRadius:16,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
                      <div><div style={{fontWeight:600,fontSize:14,fontFamily:FONT}}>{item.es}</div><div style={{fontSize:11,color:TEXT_DIM,marginTop:2,fontFamily:FONT}}>Español</div></div>
                      <div style={{textAlign:"right" as const}}><div style={{fontWeight:600,fontSize:14,color:TEAL,fontFamily:FONT}}>{item.pt}</div><div style={{fontSize:11,color:TEXT_DIM,marginTop:2,fontFamily:FONT}}>Portugués</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Progress card */}
            <div style={{...glass,borderRadius:24,padding:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>MI PROGRESO</div>
              <div style={{fontSize:52,fontWeight:800,color:TEAL,fontFamily:MONO,lineHeight:1}}>{overallPercent}%</div>
              <div style={{color:TEXT_MID,fontSize:13,marginTop:4,fontFamily:FONT}}>completado</div>
              <div style={{marginTop:16,height:6,borderRadius:99,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,width:`${overallPercent}%`,background:`linear-gradient(90deg,${TEAL},#67e8f9)`,boxShadow:"0 0 12px rgba(45,212,191,0.35)",transition:"width 0.7s ease"}}/>
              </div>
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[{n:completedModules,l:"Módulos"},{n:totalBestScore,l:"Puntos",c:TEAL}].map(x=>(
                  <div key={x.l} style={{...glassDark,borderRadius:14,padding:14}}>
                    <div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:x.c||TEXT}}>{x.n}</div>
                    <div style={{fontSize:12,color:TEXT_DIM,marginTop:2,fontFamily:FONT}}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module list */}
            <div style={{...glass,borderRadius:24,padding:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>MÓDULOS</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:480,overflowY:"auto" as const,paddingRight:4}}>
                {MODULES.map(m=>{const p=studentProgress[m.id]; const isA=m.id===selectedModuleId; return(
                  <button key={m.id} onClick={()=>setSelectedModuleId(m.id)} style={{display:"flex",alignItems:"center",gap:12,borderRadius:12,padding:"10px 12px",background:isA?"rgba(45,212,191,0.08)":"transparent",border:`1px solid ${isA?BORDER_A:"transparent"}`,cursor:"pointer",textAlign:"left" as const,transition:"all 0.15s",width:"100%"}}>
                    <span style={{fontSize:16}}>{m.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:isA?700:500,color:isA?TEXT:"#94a3b8",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{m.title}</div>
                      <div style={{fontSize:11,color:catColor(m.category),marginTop:1,fontFamily:MONO}}>{m.category}</div>
                    </div>
                    {p?<span style={{fontFamily:MONO,fontSize:12,fontWeight:700,color:TEAL,whiteSpace:"nowrap" as const}}>{p.score}/{p.total}</span>:<span style={{color:TEXT_DIM,fontSize:12}}>—</span>}
                  </button>
                );})}
              </div>
            </div>

            {/* Tip */}
            <div style={{...glass,borderRadius:24,padding:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:TEXT_DIM,marginBottom:12,fontFamily:MONO}}>CONSEJO DEL DÍA</div>
              <p style={{fontSize:14,color:"#cbd5e1",lineHeight:1.7,margin:0,fontFamily:FONT}}>💡 Cuando uses términos técnicos con un cliente, la <span style={{color:TEAL,fontWeight:600}}>claridad</span> siempre es más importante que la complejidad del vocabulario.</p>
            </div>

            {/* Spotify */}
            <div style={{borderRadius:24,overflow:"hidden",border:"1px solid rgba(30,215,96,0.2)",background:"linear-gradient(135deg,rgba(30,215,96,0.07),rgba(6,11,20,0.95))"}}>
              <div style={{padding:"16px 20px 8px",display:"flex",alignItems:"center",gap:8}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                <span style={{fontSize:13,fontWeight:600,color:TEXT,fontFamily:FONT}}>Escuchá mientras estudiás</span>
              </div>
              <iframe style={{borderRadius:"0 0 24px 24px",display:"block"}} src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcOFHFBj89A5?utm_source=generator&theme=0" width="100%" height="152" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}