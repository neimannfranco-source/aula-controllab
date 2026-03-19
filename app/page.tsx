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

const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología", "Gramática"];

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
    setCurrentQuestionIndex(0); setSelectedOption(""); setSubmitted(false);
    setDictationText(""); setDictationResult(null); setQuizAnswers({}); setActiveSection("reading");
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

  const speak = (text: string, rate: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "es-ES"; u.rate = rate;
    window.speechSynthesis.speak(u);
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
  const levelBadge = (l: string) => ({ borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: FONT, background: l==="Básico"?"rgba(52,211,153,0.12)":l==="Intermedio"?"rgba(251,191,36,0.12)":"rgba(251,113,133,0.12)", color: l==="Básico"?"#34d399":l==="Intermedio"?"#fbbf24":"#fb7185" });
  const catColor = (c: string) => c==="Laboratorio"?TEAL:c==="Gestión"?"#fbbf24":c==="Comunicación"?"#a78bfa":c==="Tecnología"?"#60a5fa":"#fb7185";
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
            {[{l:"🔄 Reset módulo",fn:resetCurrentModule,c:"#fbbf24"},{l:showProfessorPanel?"✕ Panel":"📊 Panel profe",fn:handleProfessorClick,c:TEXT_MID},{l:"Salir →",fn:logout,c:TEXT_MID}].map(b=>(
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
                  <button onClick={()=>speak(selectedModule.reading.join(" "),0.9)} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:TEXT_MID,border:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:8}}>🔊 Escuchar</button>
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
                  <button onClick={()=>speak(selectedModule.dictation,0.75)} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:TEXT_MID,border:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:8}}>🔊 Reproducir</button>
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
              <iframe style={{borderRadius:"0 0 24px 24px",display:"block"}} src="https://open.spotify.com/embed/playlist/37i9dQZF1DX3LyU02BhDVu?utm_source=generator&theme=0" width="100%" height="152" frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}