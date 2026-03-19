"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
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

const LEVEL_COLOR: Record<string, string> = {
  Básico: "bg-emerald-100 text-emerald-800",
  Intermedio: "bg-amber-100 text-amber-800",
  Avanzado: "bg-rose-100 text-rose-800",
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
    const bootstrap = async () => {
      try {
        if (!supabase) { setAppState(createInitialState()); setLoadStatus("ready"); return; }
        const remote = await loadRemoteState();
        if (!mounted) return;
        if (remote) {
          setAppState({ students: Array.isArray(remote.students) && remote.students.length ? remote.students : defaultStudents, currentStudentId: null, progress: remote.progress || {}, dictations: remote.dictations || {} });
        } else {
          const initial = createInitialState();
          setAppState(initial);
          await saveRemoteState(initial);
        }
        setLoadStatus("ready");
      } catch { if (!mounted) return; setLoadStatus("error"); }
    };
    bootstrap();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loadStatus !== "ready" || !supabase) return;
    const timeout = setTimeout(async () => {
      try { await saveRemoteState(appState); setSaveError(""); }
      catch { setSaveError("No se pudo guardar en la nube."); }
    }, 350);
    return () => clearTimeout(timeout);
  }, [appState, loadStatus]);

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
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); }
    .glass-dark { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px); }
    .accent { color: #63CAB7; }
    .btn-accent { background: linear-gradient(135deg,#63CAB7,#4aab97); color: #0f1923; font-weight:700; border-radius:12px; transition:all 0.2s; }
    .btn-accent:hover { opacity:0.9; transform:translateY(-1px); }
    input,textarea { outline:none; transition:all 0.2s; }
    input:focus,textarea:focus { border-color:#63CAB7!important; box-shadow:0 0 0 3px rgba(99,202,183,0.15); }
    .module-card:hover { border-color:rgba(99,202,183,0.4)!important; transform:translateY(-2px); }
    .module-card { transition:all 0.2s; }
    .module-card.active { background:linear-gradient(135deg,rgba(99,202,183,0.15),rgba(74,171,151,0.1)); border-color:#63CAB7!important; }
    .progress-bar { height:6px; border-radius:99px; background:rgba(255,255,255,0.1); overflow:hidden; }
    .progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#63CAB7,#4aab97); transition:width 0.6s ease; }
    .section-tab { transition:all 0.2s; cursor:pointer; border-radius:10px; padding:8px 16px; font-size:13px; font-weight:600; }
    .section-tab.active { background:#63CAB7; color:#0f1923; }
    .section-tab:not(.active) { color:#94a3b8; }
    .section-tab:not(.active):hover { color:#fff; background:rgba(255,255,255,0.08); }
    .option-btn { transition:all 0.18s; border:1.5px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 16px; text-align:left; width:100%; background:rgba(255,255,255,0.04); color:#e2e8f0; cursor:pointer; }
    .option-btn:hover:not(:disabled) { border-color:rgba(99,202,183,0.5); background:rgba(99,202,183,0.07); }
    .option-btn.selected { border-color:#63CAB7; background:rgba(99,202,183,0.1); }
    .option-btn.correct { border-color:#63CAB7; background:rgba(99,202,183,0.2); color:#63CAB7; font-weight:600; }
    .option-btn.wrong { border-color:#f87171; background:rgba(248,113,113,0.1); color:#f87171; }
    ::-webkit-scrollbar { width:6px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
  `;

  if (loadStatus === "loading") return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center"><div className="text-2xl font-bold">Cargando Aula Controllab...</div><div className="text-slate-400 mt-2 text-sm">Sincronizando progreso en la nube ☁️</div></div>
    </div>
  );

  if (loadStatus === "error") return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center"><div className="text-2xl font-bold text-rose-400">Error al cargar los datos</div><p className="text-slate-300 mt-3">Revisá las variables de Supabase y la tabla <code>aula_controllab_state</code>.</p></div>
    </div>
  );

  if (!currentStudent) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
      <style>{CSS + `
        .btn-primary { background:linear-gradient(135deg,#63CAB7,#4aab97); color:#0f1923; font-weight:600; }
        .btn-primary:hover { opacity:0.9; transform:translateY(-1px); }
        .glow { box-shadow:0 0 40px rgba(99,202,183,0.15); }
      `}</style>
      <div className="w-full max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="glass rounded-3xl p-8 md:p-10 glow">
            <div className="mono text-xs tracking-widest text-slate-400 mb-4">CONTROLLAB · ES-PT</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">Aula<br/><span className="accent">Controllab</span></h1>
            <p className="mt-4 text-slate-300 leading-7">Plataforma de español técnico para el equipo Controllab. El progreso queda guardado en la nube.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[{num:MODULES.length,label:"Módulos",sub:"Lab · Gestión · TI · Com. · Gram."},{num:appState.students.length,label:"Alumnos",sub:"Guardados en nube"},{num:"☁️",label:"Progreso",sub:"Multidispositivo"},{num:"🎧",label:"Audio TTS",sub:"Lectura y dictado"}].map(item=>(
                <div key={item.label} className="glass rounded-2xl p-4">
                  <div className="text-2xl font-bold text-white mono">{item.num}</div>
                  <div className="text-sm font-semibold text-white mt-1">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="mono text-xs tracking-widest text-slate-400 mb-4">INGRESO</div>
            <h2 className="text-2xl font-bold text-white">Entrar como alumno</h2>
            <p className="mt-2 text-slate-400 text-sm">El avance queda guardado aunque entres desde otro dispositivo.</p>
            <div className="mt-8 space-y-4">
              <div><label className="block text-sm text-slate-300 mb-2 font-medium">Usuario</label>
                <input value={loginName} onChange={e=>setLoginName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Ej: Marília" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 transition"/></div>
              <div><label className="block text-sm text-slate-300 mb-2 font-medium">Contraseña</label>
                <input value={loginCode} onChange={e=>setLoginCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Tu contraseña" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 mono transition"/></div>
              {loginError && <p className="text-rose-400 text-sm">{loginError}</p>}
              {saveError && <p className="text-amber-400 text-sm">{saveError}</p>}
              <button onClick={login} className="btn-primary w-full rounded-xl px-5 py-3.5 text-sm transition">Ingresar →</button>
            </div>
            <div className="mt-6 glass rounded-2xl p-5">
              <div className="mono text-xs text-slate-400 tracking-widest mb-3">PANEL DEL PROFE</div>
              <button onClick={handleProfessorClick} className="w-full text-left text-sm text-slate-300 hover:text-white transition flex justify-between items-center">
                <span>🔐 Acceso al panel de gestión</span><span className="text-slate-500">{showProfessorPanel?"▲":"▼"}</span>
              </button>
              {showProfessorPanel && professorUnlocked && (
                <div className="mt-4 space-y-3">
                  <input value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Nombre del alumno" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm"/>
                  <input value={newStudentCode} onChange={e=>setNewStudentCode(e.target.value)} placeholder="Contraseña" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm mono"/>
                  <button onClick={addStudent} className="w-full rounded-xl border border-slate-600 text-slate-200 px-4 py-2.5 text-sm hover:bg-slate-700 transition">+ Agregar alumno</button>
                  <button onClick={resetAllStudents} className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 px-4 py-2.5 text-sm hover:bg-rose-500/20 transition">Reset total de todos los alumnos</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <style>{CSS}</style>
      <header className="sticky top-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="mono text-xs text-slate-500 tracking-widest">CONTROLLAB</div>
              <div className="font-bold text-lg leading-tight">Hola, <span className="accent">{currentStudent.name}</span> 👋</div>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-4">
              <div className="glass rounded-xl px-4 py-2 text-sm"><span className="text-slate-400">Progreso </span><span className="font-bold accent">{overallPercent}%</span></div>
              <div className="glass rounded-xl px-4 py-2 text-sm"><span className="text-slate-400">Puntaje </span><span className="font-bold">{totalBestScore}<span className="text-slate-500">/{totalQuestions}</span></span></div>
              <div className="glass rounded-xl px-4 py-2 text-sm"><span className="text-slate-400">Módulos </span><span className="font-bold">{completedModules}<span className="text-slate-500">/{MODULES.length}</span></span></div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button onClick={resetCurrentModule} className="glass rounded-xl px-4 py-2.5 text-sm text-amber-300 hover:bg-white/10 transition">🔄 Reset módulo</button>
            <button onClick={handleProfessorClick} className="glass rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition">{showProfessorPanel?"✕ Panel":"📊 Panel profe"}</button>
            <button onClick={logout} className="glass rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition">Salir →</button>
          </div>
        </div>
        <div className="progress-bar mx-6 mb-3" style={{borderRadius:0}}><div className="progress-fill" style={{width:`${overallPercent}%`}}/></div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {saveError && <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 px-4 py-3 text-sm">{saveError}</div>}

        {showProfessorPanel && professorUnlocked && (
          <div className="glass rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div><div className="mono text-xs text-slate-400 tracking-widest mb-1">PANEL DEL PROFESOR</div><h2 className="text-xl font-bold">Gestión y seguimiento</h2></div>
              <div className="flex gap-2 flex-wrap">
                {(["progress","students","dictations"] as const).map(tab=>(
                  <button key={tab} onClick={()=>setTeacherTab(tab)} className={`section-tab ${teacherTab===tab?"active":""}`}>
                    {tab==="progress"?"📊 Progreso":tab==="students"?"👥 Alumnos":"🎙 Dictados"}
                  </button>
                ))}
                <button onClick={resetAllStudents} className="rounded-xl px-4 py-2 text-sm font-semibold bg-rose-500/15 text-rose-300 border border-rose-400/20 hover:bg-rose-500/25 transition">Reset total</button>
              </div>
            </div>

            {teacherTab==="progress" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-slate-400">
                    <th className="text-left px-4 py-3 font-semibold">Alumno</th>
                    {MODULES.map(m=><th key={m.id} className="text-center px-1 py-3 font-semibold text-xs" title={m.title}>{m.emoji}</th>)}
                    <th className="text-center px-4 py-3 font-semibold">Total</th>
                    <th className="text-center px-4 py-3 font-semibold">%</th>
                    <th className="text-center px-4 py-3 font-semibold">Reset</th>
                  </tr></thead>
                  <tbody>{professorRows.map((row,i)=>(
                    <tr key={row.id} className={`border-t border-white/5 ${i%2===0?"bg-white/[0.02]":""}`}>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      {MODULES.map(m=>{const p=(appState.progress[row.id]||{})[m.id];return(
                        <td key={m.id} className="text-center px-1 py-2">
                          {p?<button onClick={()=>{if(window.confirm(`¿Reiniciar ${m.title} de ${row.name}?`))resetStudentModule(row.id,m.id);}} className="accent font-bold mono text-xs hover:text-rose-400 transition" title="Clic para reiniciar">{p.score}/{p.total}</button>:<span className="text-slate-600">—</span>}
                        </td>);})}
                      <td className="text-center px-4 py-3 font-bold accent mono">{row.bestScore}/{totalQuestions}</td>
                      <td className="text-center px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${row.completedMods===MODULES.length?"bg-emerald-900 text-emerald-300":row.completedMods>0?"bg-amber-900 text-amber-300":"bg-slate-700 text-slate-400"}`}>{Math.round((row.completedMods/MODULES.length)*100)}%</span></td>
                      <td className="text-center px-4 py-2"><button onClick={()=>resetStudentAll(row.id,row.name)} className="text-rose-400 text-xs hover:text-rose-300 transition">🗑️ Todo</button></td>
                    </tr>
                  ))}</tbody>
                </table>
                <div className="px-4 py-2 text-xs text-slate-500">💡 Clic en cualquier puntaje para reiniciar ese módulo específico</div>
              </div>
            )}

            {teacherTab==="dictations" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead><tr className="bg-white/5 text-slate-400">
                    <th className="text-left px-4 py-3 font-semibold">Alumno</th>
                    {MODULES.map(m=><th key={m.id} className="text-center px-1 py-3 font-semibold text-xs" title={m.title}>{m.emoji}</th>)}
                    <th className="text-center px-4 py-3 font-semibold">Promedio</th>
                  </tr></thead>
                  <tbody>{professorRows.map((row,i)=>(
                    <tr key={row.id} className={`border-t border-white/5 ${i%2===0?"bg-white/[0.02]":""}`}>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      {MODULES.map(m=>{const d=(appState.dictations[row.id]||{})[m.id];return<td key={m.id} className="text-center px-1 py-2">{d!=null?<span className={`mono text-xs font-bold ${d.score>=80?"text-emerald-400":d.score>=50?"text-amber-400":"text-rose-400"}`}>{d.score}%</span>:<span className="text-slate-600">—</span>}</td>;})}
                      <td className="text-center px-4 py-3 font-bold mono accent">{row.dictAvg!=null?`${row.dictAvg}%`:"—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {teacherTab==="students" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-dark rounded-2xl p-5">
                  <div className="mono text-xs text-slate-400 tracking-widest mb-4">AGREGAR ALUMNO</div>
                  <div className="space-y-3">
                    <input value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Nombre" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm"/>
                    <input value={newStudentCode} onChange={e=>setNewStudentCode(e.target.value)} placeholder="Contraseña" className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm mono"/>
                    <button onClick={addStudent} className="btn-accent w-full px-4 py-3 text-sm">+ Agregar</button>
                    <button onClick={resetAllStudents} className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 px-4 py-3 text-sm hover:bg-rose-500/20 transition">Resetear todos</button>
                  </div>
                </div>
                <div className="glass-dark rounded-2xl p-5">
                  <div className="mono text-xs text-slate-400 tracking-widest mb-4">ALUMNOS REGISTRADOS</div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {appState.students.map(s=>(
                      <div key={s.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                        <div><div className="font-medium text-sm">{s.name}</div><div className="mono text-xs text-slate-500">{s.code}</div></div>
                        {!defaultStudents.some(d=>d.id===s.id)?<button onClick={()=>removeStudent(s.id)} className="text-rose-400 hover:text-rose-300 text-xs transition">Eliminar</button>:<span className="text-xs text-slate-500">Base</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(cat=><button key={cat} onClick={()=>setActiveCategory(cat)} className={`section-tab whitespace-nowrap ${activeCategory===cat?"active":""}`}>{cat}</button>)}
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 mb-8">
          {filteredModules.map(module=>{
            const prog=studentProgress[module.id]; const active=module.id===selectedModuleId;
            return(
              <button key={module.id} onClick={()=>setSelectedModuleId(module.id)} className={`module-card glass rounded-2xl p-4 text-left border ${active?"active":"border-white/5"}`}>
                <div className="text-2xl mb-2">{module.emoji}</div>
                <div className="text-xs text-slate-400 mb-1 font-medium">{module.category}</div>
                <div className="font-bold text-sm leading-tight">{module.title}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${active?"bg-white/20 text-white":"bg-white/5 text-slate-400"}`}>{module.level}</span>
                  <span className={`mono text-xs font-bold ${prog?"accent":"text-slate-600"}`}>{prog?`${prog.score}/${prog.total}`:"—"}</span>
                </div>
                {prog&&<div className="mt-2 progress-bar"><div className="progress-fill" style={{width:`${Math.round((prog.score/prog.total)*100)}%`}}/></div>}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="glass rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="mono text-xs text-slate-400 tracking-widest mb-1">{selectedModule.category.toUpperCase()}</div>
                  <h2 className="text-3xl font-bold">{selectedModule.emoji} {selectedModule.title}</h2>
                  <p className="mt-2 text-slate-400 text-sm">{selectedModule.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${LEVEL_COLOR[selectedModule.level]}`}>{selectedModule.level}</span>
                  <div className="glass rounded-xl px-4 py-2 text-sm"><span className="text-slate-400">Mejor: </span><span className="font-bold accent mono">{moduleProgress.score}/{moduleProgress.total}</span></div>
                  {moduleProgress.attempts>0&&<div className="glass rounded-xl px-4 py-2 text-sm"><span className="text-slate-400">Intentos: </span><span className="font-bold mono">{moduleProgress.attempts}</span></div>}
                  {!!studentProgress[selectedModuleId]&&(
                    <button onClick={resetCurrentModule} className="rounded-xl px-4 py-2 text-sm font-semibold bg-rose-500/15 text-rose-300 border border-rose-400/20 hover:bg-rose-500/25 transition">🔄 Reiniciar</button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-6 flex-wrap">
                {(["reading","quiz","dictation","vocab"] as const).map(sec=>(
                  <button key={sec} onClick={()=>setActiveSection(sec)} className={`section-tab ${activeSection===sec?"active":""}`}>
                    {sec==="reading"?"📖 Lectura":sec==="quiz"?"✏️ Quiz":sec==="dictation"?"🎙 Dictado":"📝 Vocabulario"}
                  </button>
                ))}
              </div>
            </div>

            {activeSection==="reading"&&(
              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">{selectedModule.readingTitle}</h3>
                  <button onClick={()=>speak(selectedModule.reading.join(" "),0.9)} className="glass rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-2">🔊 <span>Escuchar</span></button>
                </div>
                <div className="space-y-5">
                  {selectedModule.reading.map((para,i)=><p key={i} className="text-slate-200 leading-8 text-[15px]">{para}</p>)}
                </div>
                <button onClick={()=>setActiveSection("quiz")} className="btn-accent mt-8 px-6 py-3 text-sm">Ir al quiz →</button>
              </div>
            )}

            {activeSection==="quiz"&&(
              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">Comprensión</h3>
                  <div className="glass rounded-xl px-4 py-2 mono text-sm font-bold accent">{currentQuestionIndex+1}/{selectedModule.quiz.length}</div>
                </div>
                <div className="progress-bar mb-6"><div className="progress-fill" style={{width:`${((currentQuestionIndex+(submitted?1:0))/selectedModule.quiz.length)*100}%`}}/></div>
                <div className="glass-dark rounded-2xl p-6">
                  <p className="text-lg font-semibold mb-5 leading-7">{currentQuestion.question}</p>
                  <div className="space-y-3">
                    {currentQuestion.options.map(option=>{
                      const sel=selectedOption===option; const correct=submitted&&option===currentQuestion.answer; const wrong=submitted&&sel&&option!==currentQuestion.answer;
                      return <button key={option} onClick={()=>!submitted&&setAnswerMemory(option)} disabled={submitted} className={`option-btn ${correct?"correct":wrong?"wrong":sel?"selected":""}`}>{option}</button>;
                    })}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm">
                    {submitted?(isCorrect?<span className="text-emerald-400 font-semibold">✓ ¡Correcto!</span>:<span className="text-rose-400">✗ Respuesta correcta: <strong className="text-white">{currentQuestion.answer}</strong></span>):<span className="text-slate-400">Elegí una opción.</span>}
                  </div>
                  {!submitted?<button onClick={handleSubmit} disabled={!selectedOption} className="btn-accent px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Comprobar</button>
                  :<button onClick={handleNext} className="btn-accent px-6 py-3 text-sm">{currentQuestionIndex<selectedModule.quiz.length-1?"Siguiente →":"Finalizar ✓"}</button>}
                </div>
              </div>
            )}

            {activeSection==="dictation"&&(
              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h3 className="text-xl font-bold">🎙 Dictado</h3>
                  <button onClick={()=>speak(selectedModule.dictation,0.75)} className="glass rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-2">🔊 Reproducir</button>
                </div>
                <p className="text-slate-400 text-sm mb-5 leading-6">Escuchá el audio y escribí la frase en español. Podés repetirlo varias veces.</p>
                <textarea value={dictationText} onChange={e=>setDictationText(e.target.value)} rows={4} placeholder="Escribí lo que escuchaste..." className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-white px-5 py-4 text-sm leading-7 resize-none"/>
                <button onClick={checkDictation} className="btn-accent mt-4 px-6 py-3 text-sm">Corregir dictado</button>
                {(dictationResult||currentDictation)&&(()=>{const r=dictationResult||currentDictation!;return(
                  <div className="mt-6 glass-dark rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl font-black mono ${r.score>=80?"text-emerald-400":r.score>=50?"text-amber-400":"text-rose-400"}`}>{r.score}%</div>
                      <div className="text-sm text-slate-400">{r.score===100?"¡Perfecto! 🎉":r.score>=80?"¡Muy bien!":r.score>=50?"Buen intento":"Seguí practicando"}</div>
                    </div>
                    <div className="text-sm"><span className="text-slate-400">Frase modelo: </span><span className="text-slate-200 italic">{r.expected}</span></div>
                  </div>
                );})()}
              </div>
            )}

            {activeSection==="vocab"&&(
              <div className="glass rounded-3xl p-6 md:p-8">
                <h3 className="text-xl font-bold mb-6">📝 Vocabulario clave</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedModule.vocab.map(item=>(
                    <div key={item.es} className="glass-dark rounded-2xl px-5 py-4 flex justify-between items-center gap-4">
                      <div><div className="font-semibold">{item.es}</div><div className="text-xs text-slate-500 mt-0.5">Español</div></div>
                      <div className="text-right"><div className="font-semibold accent">{item.pt}</div><div className="text-xs text-slate-500 mt-0.5">Portugués</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="glass rounded-3xl p-6">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">MI PROGRESO</div>
              <div className="text-5xl font-black accent mono">{overallPercent}%</div>
              <div className="text-slate-400 text-sm mt-1">completado</div>
              <div className="mt-5 progress-bar"><div className="progress-fill" style={{width:`${overallPercent}%`}}/></div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="glass-dark rounded-2xl p-3"><div className="mono text-lg font-black">{completedModules}</div><div className="text-xs text-slate-400 mt-0.5">Módulos</div></div>
                <div className="glass-dark rounded-2xl p-3"><div className="mono text-lg font-black accent">{totalBestScore}</div><div className="text-xs text-slate-400 mt-0.5">Puntos</div></div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">MÓDULOS</div>
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {MODULES.map(m=>{const p=studentProgress[m.id]; const isA=m.id===selectedModuleId; return(
                  <button key={m.id} onClick={()=>setSelectedModuleId(m.id)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${isA?"bg-white/10":"hover:bg-white/5"}`}>
                    <span className="text-lg">{m.emoji}</span>
                    <div className="flex-1 min-w-0"><div className={`text-sm font-medium truncate ${isA?"text-white":"text-slate-300"}`}>{m.title}</div><div className="text-xs text-slate-500">{m.category}</div></div>
                    {p?<span className="mono text-xs font-bold accent whitespace-nowrap">{p.score}/{p.total}</span>:<span className="text-slate-600 text-xs">—</span>}
                  </button>
                );})}
              </div>
            </div>
            <div className="glass rounded-3xl p-6">
              <div className="mono text-xs text-slate-400 tracking-widest mb-4">CONSEJO DEL DÍA</div>
              <p className="text-sm text-slate-300 leading-6">💡 Cuando uses términos técnicos con un cliente, la <span className="accent font-semibold">claridad</span> siempre es más importante que la complejidad del vocabulario.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
