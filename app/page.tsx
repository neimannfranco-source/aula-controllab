"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wsrmdtblnhvgindxrxbq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzcm1kdGJsbmh2Z2luZHhyeGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzQ2OTEsImV4cCI6MjA4OTU1MDY5MX0.isDKYbv_kjdDZJF8l_x19ZC9PGr55wAp--_y7FJ7K4c";
const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const DB_ROW_ID = "global-app-state";
const PROFESSOR_PASSWORD = "marinas2025";

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
  // ══ BIENVENIDA ══
  {
    id: "huesped-brasileno", title: "El huésped brasileño", level: "Básico", category: "Bienvenida", emoji: "🇧🇷",
    description: "Cultura, expectativas y perfil del turista brasileño en la Patagonia.",
    readingTitle: "Entender al huésped para atenderlo mejor",
    reading: [
      "Brasil es uno de los mercados emisores de turismo más importantes para la Argentina y para la Patagonia en particular. Los brasileños que viajan a Villa La Angostura suelen pertenecer a segmentos medios y altos, con alto poder adquisitivo, experiencia viajera internacional y expectativas de servicio muy elevadas. Entender quiénes son y qué valoran es el primer paso para atenderlos con excelencia.",
      "El turista brasileño valora profundamente la calidez humana en el trato. A diferencia de algunos mercados donde la distancia formal es esperada, el brasileño aprecia el contacto cercano, la sonrisa genuina y la disposición para conversar. Sin embargo, esa calidez no debe confundirse con informalidad: el tratamiento de senhor y senhora es un estándar de cortesía que el turista de perfil alto espera y aprecia.",
      "El idioma es una barrera que genera ansiedad en muchos turistas brasileños al viajar a Argentina. Un colaborador que hace el esfuerzo de comunicarse en portugués, aunque sea con errores, genera una impresión extraordinariamente positiva. Ese esfuerzo es percibido como respeto y valoración del huésped.",
      "Los brasileños tienen hábitos gastronómicos específicos que conviene conocer. El desayuno es una comida muy importante y los huéspedes esperan variedad y abundancia. El café es central y su preparación importa. La carne argentina es muy valorada y frecuentemente mencionada como uno de los atractivos del viaje.",
      "El huésped brasileño es muy activo en redes sociales y plataformas de reseñas. Una experiencia positiva puede convertirse en contenido viral que beneficia al hotel enormemente. La forma en que el equipo gestiona las situaciones difíciles es tan importante como la calidad del servicio habitual.",
    ],
    vocab: [
      { es: "huésped / turista", pt: "hóspede / turista" },
      { es: "bienvenida / bienvenido", pt: "boas-vindas / bem-vindo" },
      { es: "atención personalizada", pt: "atendimento personalizado" },
      { es: "experiencia del huésped", pt: "experiência do hóspede" },
      { es: "calidez en el trato", pt: "cordialidade no atendimento" },
      { es: "reseña / opinión", pt: "avaliação / opinião" },
    ],
    quiz: [
      { question: "¿Qué valora especialmente el turista brasileño en el trato?", options: ["La distancia formal", "La calidez humana, la sonrisa genuina y la disposición para conversar", "La rapidez por encima de todo", "El silencio y la discreción"], answer: "La calidez humana, la sonrisa genuina y la disposición para conversar" },
      { question: "¿Qué efecto tiene hablar portugués aunque sea con errores?", options: ["Genera impresión negativa por los errores", "Genera una impresión extraordinariamente positiva percibida como respeto", "No tiene ningún efecto", "Solo importa si el portugués es perfecto"], answer: "Genera una impresión extraordinariamente positiva percibida como respeto" },
      { question: "¿Cómo es el perfil típico del turista brasileño en Villa La Angostura?", options: ["Mochileros de bajo presupuesto", "Segmentos medios y altos con alto poder adquisitivo y experiencia viajera", "Grupos escolares", "Turismo de aventura extrema"], answer: "Segmentos medios y altos con alto poder adquisitivo y experiencia viajera" },
      { question: "¿Qué aspecto gastronómico es central para el turista brasileño?", options: ["Solo los jugos", "La calidad del café y la abundancia en el desayuno", "Solo la variedad de quesos", "Las frutas exóticas"], answer: "La calidad del café y la abundancia en el desayuno" },
      { question: "¿Por qué las redes sociales son relevantes en la atención al huésped brasileño?", options: ["Solo para publicidad", "Una experiencia positiva puede ser viral y una negativa amplificarse enormemente", "Los brasileños no usan redes", "Solo para huéspedes jóvenes"], answer: "Una experiencia positiva puede ser viral y una negativa amplificarse enormemente" },
      { question: "¿Qué tratamiento formal espera el turista brasileño?", options: ["Tuteo informal desde el inicio", "El tratamiento de senhor y senhora como estándar de cortesía", "Solo el nombre de pila", "El você en todos los contextos"], answer: "El tratamiento de senhor y senhora como estándar de cortesía" },
      { question: "¿Cómo se dice 'atención personalizada' en portugués?", options: ["Atención especial", "Atendimento personalizado", "Servicio exclusivo", "Cuidado especial"], answer: "Atendimento personalizado" },
      { question: "¿Cómo se dice 'reseña / opinión' en portugués?", options: ["Comentario", "Avaliação / opinião", "Nota del huésped", "Feedback"], answer: "Avaliação / opinião" },
    ],
    dictation: "Bem-vindo ao Hotel Marinas Alto Manzano, senhor. É um prazer recebê-lo. Esperamos que sua estadia seja uma experiência inesquecível.",
  },
  {
    id: "portugues-brasil", title: "Portugués de Brasil", level: "Básico", category: "Bienvenida", emoji: "🗣️",
    description: "Diferencias clave del portugués brasileño y expresiones esenciales para el hotel.",
    readingTitle: "El idioma del huésped",
    reading: [
      "El portugués que hablan los turistas que llegan al Hotel Marinas es el portugués brasileño. La diferencia más notable respecto al europeo es la pronunciación: el brasileño es más abierto y vocal, con vocales más claras y sostenidas. Para el equipo del hotel esto es una buena noticia: el portugués brasileño es más fácil de imitar y entender para un hispanohablante.",
      "El vocabulario específico que el equipo debe dominar: quarto o apartamento para la habitación, banheiro para el baño, café da manhã para el desayuno, cardápio para el menú, conta para la cuenta, celular para el teléfono. Conocer estas palabras evita confusiones y demuestra preparación.",
      "El tratamiento formal usa o senhor y a senhora, con el verbo en tercera persona: 'O senhor deseja algo?' Para el hotel, la regla es clara: siempre o senhor y a senhora en el primer contacto y en situaciones formales. Solo se cambia a você si el huésped da señales de preferir trato más cercano.",
      "Frases cotidianas esenciales: 'Como posso ajudá-lo?' (¿En qué puedo ayudarle?), 'Com muito prazer' (Con mucho gusto), 'Às suas ordens' (A sus órdenes), 'Um momento, por favor' (Un momento por favor), 'Fico feliz em ajudar' (Con gusto le ayudo). Estas frases cubren la mayoría de las situaciones.",
      "Los falsos cognados más importantes: borracha en portugués es una goma de borrar, polvo es una palabra vulgar que debe evitarse absolutamente, escritório significa oficina, embaraçada significa avergonzada (no embarazada). Conocer estos falsos amigos evita situaciones embarazosas en el trabajo diario.",
    ],
    vocab: [
      { es: "habitación", pt: "quarto / apartamento" },
      { es: "baño", pt: "banheiro" },
      { es: "desayuno", pt: "café da manhã" },
      { es: "menú / carta", pt: "cardápio / carta" },
      { es: "cuenta", pt: "conta" },
      { es: "¿en qué puedo ayudarle?", pt: "como posso ajudá-lo?" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'habitación' en portugués brasileño?", options: ["Habitación", "Quarto / apartamento", "Cuarto", "Dormitório"], answer: "Quarto / apartamento" },
      { question: "¿Cómo se dice 'desayuno' en portugués?", options: ["Pequeño almuerzo", "Café da manhã", "Primera refeição", "Desjejum"], answer: "Café da manhã" },
      { question: "¿Cómo se dice '¿en qué puedo ayudarle?' en portugués?", options: ["Puedo ayudarte?", "Como posso ajudá-lo?", "O que você quer?", "Precisa de algo?"], answer: "Como posso ajudá-lo?" },
      { question: "¿Cuál es el tratamiento formal correcto?", options: ["Você en todos los contextos", "O senhor / a senhora con verbo en tercera persona", "Solo el nombre de pila", "Tu informal siempre"], answer: "O senhor / a senhora con verbo en tercera persona" },
      { question: "¿Cómo se dice 'con mucho gusto' en portugués?", options: ["Con gusto", "Com muito prazer", "De nada", "Tudo bem"], answer: "Com muito prazer" },
      { question: "¿Cómo se dice 'menú / carta' en portugués brasileño?", options: ["Menú", "Cardápio / carta", "Lista de pratos", "Carta do dia"], answer: "Cardápio / carta" },
      { question: "¿Cómo se dice 'baño' en portugués?", options: ["Bañera", "Banheiro", "Ducha", "Lavatorio"], answer: "Banheiro" },
      { question: "¿Cómo se dice 'cuenta' en portugués?", options: ["Factura", "Conta", "Total", "Recibo"], answer: "Conta" },
    ],
    dictation: "Bom dia, senhor. Como posso ajudá-lo hoje? O café da manhã está servido no restaurante do hotel, no térreo.",
  },
  {
    id: "mentalidad-servicio", title: "Mentalidad de servicio de excelencia", level: "Básico", category: "Bienvenida", emoji: "⭐",
    description: "Actitud, presencia y estándares de un servicio hotelero de alto nivel.",
    readingTitle: "La diferencia está en los detalles",
    reading: [
      "Un hotel de alta gama como el Marinas no compite solo por sus instalaciones. Compite por la experiencia humana que ofrece. Lo que diferencia a un equipo ordinario de uno extraordinario no son grandes gestos sino pequeños detalles ejecutados con consistencia: recordar el nombre del huésped, anticipar una necesidad antes de que la exprese, o responder con una sonrisa genuina en el momento menos esperado.",
      "La presencia profesional comienza antes de que el huésped diga la primera palabra. La postura, la expresión facial, el contacto visual y la presentación personal comunican mensajes antes de que el idioma entre en juego. Un colaborador que recibe al huésped con postura erguida, sonrisa natural y contacto visual transmite seguridad y bienvenida.",
      "En el servicio en portugués, la confianza es fundamental. Es natural sentir inseguridad al comunicarse en un idioma que no es el propio. La clave es no disculparse en exceso: un 'Peço desculpas, meu português não é perfeito, mas estou aqui para ajudá-lo' dicho con seguridad genera mucha más confianza que evitar hablar.",
      "El servicio de excelencia implica conocer el producto que se ofrece. Un colaborador que puede describir con detalle y entusiasmo cada categoría de alojamiento, los platos del restaurante y las excursiones disponibles no solo informa: vende, genera expectativa y contribuye a los ingresos del hotel.",
      "La resolución de problemas es el momento de verdad del servicio de excelencia. Cualquier hotel puede ofrecer una experiencia agradable cuando todo funciona. Lo que distingue a los equipos de excelencia es cómo responden cuando algo falla: con rapidez, empatía y una solución concreta sin excusas.",
    ],
    vocab: [
      { es: "excelencia en el servicio", pt: "excelência no atendimento" },
      { es: "anticipar necesidades", pt: "antecipar necessidades" },
      { es: "disculpas", pt: "desculpas" },
      { es: "con mucho gusto", pt: "com muito prazer" },
      { es: "resolver un problema", pt: "resolver um problema" },
      { es: "a sus órdenes", pt: "às suas ordens" },
    ],
    quiz: [
      { question: "¿Qué diferencia a un equipo ordinario de uno extraordinario?", options: ["Las instalaciones más modernas", "Los pequeños detalles ejecutados con consistencia", "El precio más alto", "La cantidad de personal"], answer: "Los pequeños detalles ejecutados con consistencia" },
      { question: "¿Cómo manejar la inseguridad al hablar portugués?", options: ["Evitar hablar y usar gestos", "Disculparse repetidamente", "Decir con seguridad que el portugués no es perfecto pero se está para ayudar", "Derivar siempre a un colega"], answer: "Decir con seguridad que el portugués no es perfecto pero se está para ayudar" },
      { question: "¿Qué comunica un colaborador antes de decir la primera palabra?", options: ["Nada", "Postura, expresión facial, contacto visual y presentación personal", "Solo su nivel de idioma", "Solo la categoría del hotel"], answer: "Postura, expresión facial, contacto visual y presentación personal" },
      { question: "¿Cómo se dice 'a sus órdenes' en portugués?", options: ["Para servirle", "Às suas ordens", "Estou aqui", "Com prazer"], answer: "Às suas ordens" },
      { question: "¿Cuándo se demuestra verdaderamente el servicio de excelencia?", options: ["Cuando todo funciona perfecto", "Cuando algo falla y el equipo responde con rapidez, empatía y solución concreta", "Solo en temporada alta", "Solo en la primera impresión"], answer: "Cuando algo falla y el equipo responde con rapidez, empatía y solución concreta" },
      { question: "¿Cómo se dice 'excelencia en el servicio' en portugués?", options: ["Serviço de qualidade", "Excelência no atendimento", "Bom serviço", "Atendimento premium"], answer: "Excelência no atendimento" },
      { question: "¿Cómo se dice 'resolver un problema' en portugués?", options: ["Arreglar queja", "Resolver um problema", "Solucionar inconveniente", "Tratar situação"], answer: "Resolver um problema" },
      { question: "¿Cómo se dice 'anticipar necesidades' en portugués?", options: ["Prever problemas", "Antecipar necessidades", "Adelantarse al huésped", "Preparar de antemano"], answer: "Antecipar necessidades" },
    ],
    dictation: "Com muito prazer, senhora. Estou aqui para ajudá-la com qualquer necessidade durante sua estadia no Hotel Marinas.",
  },
  // ══ RECEPCIÓN ══
  {
    id: "saludos-recepcion", title: "Saludos y primera impresión", level: "Básico", category: "Recepción", emoji: "🤝",
    description: "Cómo saludar y recibir al huésped brasileño desde el primer momento.",
    readingTitle: "Los primeros treinta segundos",
    reading: [
      "La primera impresión se forma en los primeros treinta segundos de contacto. En el contexto hotelero, ocurre cuando el huésped entra al lobby y se dirige a la recepción. El colaborador tiene ese breve instante para transmitir calidez, profesionalismo y bienvenida al mismo tiempo.",
      "El saludo formal en portugués brasileño: Bom dia hasta las 12:00, Boa tarde desde las 12:00 hasta las 18:00, y Boa noite desde las 18:00. En el hotel siempre debe seguir el tratamiento formal: 'Bom dia, senhor' o 'Boa tarde, senhora'. Si se conoce el nombre: 'Bom dia, senhor Oliveira. Seja bem-vindo ao Marinas.'",
      "La frase 'Seja bem-vindo' (o 'Seja bem-vinda' para mujer, 'Sejam bem-vindos' para grupo) es la bienvenida formal estándar. Es más elegante que un simple 'Bem-vindo' y transmite que el huésped era esperado. Debe pronunciarse mirando al huésped a los ojos.",
      "Después del saludo, la secuencia incluye: preguntar si tiene reserva ('O senhor tem uma reserva conosco?'), solicitar el nombre ('Poderia me informar o seu nome, por favor?'), y confirmar los datos manteniendo el contacto visual. Cada pausa para mirar la pantalla debe compensarse con una frase.",
      "Los momentos de espera son oportunidades para construir relación. Una pregunta simple sobre el viaje ('Como foi a viagem, senhor?') o un comentario sobre el clima ('O tempo está lindo hoje na região') transforman una espera burocrática en una conversación agradable.",
    ],
    vocab: [
      { es: "buenos días / buenas tardes / buenas noches", pt: "bom dia / boa tarde / boa noite" },
      { es: "sea bienvenido/a", pt: "seja bem-vindo / seja bem-vinda" },
      { es: "¿tiene una reserva?", pt: "o senhor tem uma reserva?" },
      { es: "¿podría decirme su nombre?", pt: "poderia me informar o seu nome?" },
      { es: "un momento por favor", pt: "um momento, por favor" },
      { es: "¿cómo estuvo el viaje?", pt: "como foi a viagem?" },
    ],
    quiz: [
      { question: "¿Cómo se saluda formalmente hasta las 12:00?", options: ["Boa tarde", "Bom dia, senhor", "Boa noite", "Olá"], answer: "Bom dia, senhor" },
      { question: "¿Cuál es la bienvenida formal más elegante?", options: ["Bem-vindo informal", "Seja bem-vindo / Seja bem-vinda", "Olá, tudo bem?", "Como vai?"], answer: "Seja bem-vindo / Seja bem-vinda" },
      { question: "¿Cómo se pregunta si el huésped tiene reserva?", options: ["Você tem reserva?", "O senhor tem uma reserva conosco?", "Tem reserva aqui?", "Precisa de quarto?"], answer: "O senhor tem uma reserva conosco?" },
      { question: "¿Cómo se pide el nombre formalmente?", options: ["Qual é o seu nome?", "Poderia me informar o seu nome, por favor?", "Me diz seu nome?", "Como você se chama?"], answer: "Poderia me informar o seu nome, por favor?" },
      { question: "¿Hasta qué hora se usa 'boa tarde'?", options: ["Hasta las 15:00", "Hasta las 18:00 aproximadamente", "Hasta las 20:00", "Todo el día"], answer: "Hasta las 18:00 aproximadamente" },
      { question: "¿Cómo se dice 'un momento por favor' en portugués?", options: ["Espera aí", "Um momento, por favor", "Aguarda um pouco", "Só um segundo"], answer: "Um momento, por favor" },
      { question: "¿Cómo se dice 'sea bienvenida' para una mujer?", options: ["Seja bem-vindo", "Seja bem-vinda", "Bem-vinda senhora", "Olá senhora"], answer: "Seja bem-vinda" },
      { question: "¿Cómo se dice '¿cómo estuvo el viaje?' en portugués?", options: ["Como foi o passeio?", "Como foi a viagem?", "A viagem foi boa?", "Viajou bem?"], answer: "Como foi a viagem?" },
    ],
    dictation: "Bom dia, senhora. Seja bem-vinda ao Hotel Marinas Alto Manzano. A senhora tem uma reserva conosco?",
  },
  {
    id: "checkin-documentacion", title: "Check-in y documentación", level: "Intermedio", category: "Recepción", emoji: "🏨",
    description: "Proceso completo de check-in, solicitud de documentos y registro del huésped.",
    readingTitle: "El ingreso que marca el tono de la estadía",
    reading: [
      "El check-in es el momento de transición entre el viaje y la estadía. Un check-in eficiente, cálido y ordenado en portugués establece el tono positivo para toda la experiencia. El proceso comienza con la verificación de identidad: 'Para completar o seu registro, precisaria do seu documento de identidade ou passaporte, por favor.'",
      "Después de registrar los documentos, se confirman los detalles de la reserva en voz alta: categoría de habitación, fechas, servicios incluidos, horarios relevantes. 'O senhor vai ficar conosco por três noites na suíte lago, com café da manhã incluído a partir das sete e meia.' Esta confirmación verifica que todo está correcto.",
      "La solicitud de garantía de pago debe manejarse con naturalidad: 'Precisaria de um cartão de crédito para garantia, é um procedimento padrão do hotel. O cartão não será cobrado agora.' Esta aclaración evita malentendidos sobre cobros no autorizados.",
      "El cierre incluye la entrega de llaves y orientación: número de habitación, cómo llegar, horario del desayuno, número de recepción. 'Aqui estão as chaves do quarto duzentos e oito. O restaurante fica no térreo, café da manhã das sete e meia até as dez e meia. Qualquer coisa, ligue no ramal zero.'",
      "Al finalizar: 'Tem alguma dúvida ou posso ajudá-lo com mais alguma informação antes de acompanhá-lo ao quarto?' Esta pregunta abierta demuestra disposición y da al huésped la oportunidad de expresar necesidades antes de dirigirse a la habitación.",
    ],
    vocab: [
      { es: "documento de identidad / pasaporte", pt: "documento de identidade / passaporte" },
      { es: "tarjeta de crédito / garantía", pt: "cartão de crédito / garantia" },
      { es: "llave / tarjeta del cuarto", pt: "chave / cartão do quarto" },
      { es: "planta baja", pt: "térreo" },
      { es: "incluido en la tarifa", pt: "incluído na diária" },
      { es: "procedimiento estándar", pt: "procedimento padrão" },
    ],
    quiz: [
      { question: "¿Cómo se solicita el documento de forma educada?", options: ["Deme su pasaporte", "Para completar o seu registro, precisaria do seu documento de identidade, por favor", "Documento, por favor", "Preciso ver seu documento"], answer: "Para completar o seu registro, precisaria do seu documento de identidade, por favor" },
      { question: "¿Cómo se solicita la tarjeta sin generar desconfianza?", options: ["Necesito su tarjeta ahora", "Precisaria de um cartão de crédito para garantia, é um procedimento padrão", "La tarjeta es obligatoria", "¿Tiene tarjeta?"], answer: "Precisaria de um cartão de crédito para garantia, é um procedimento padrão" },
      { question: "¿Por qué aclarar que la tarjeta no será cobrada?", options: ["Por exigencia legal", "Para evitar malentendidos sobre cobros no autorizados", "Solo si el huésped lo pregunta", "No es necesario"], answer: "Para evitar malentendidos sobre cobros no autorizados" },
      { question: "¿Cómo se dice 'incluido en la tarifa'?", options: ["Grátis", "Incluído na diária", "Sem custo", "Está pago"], answer: "Incluído na diária" },
      { question: "¿Cómo se dice 'planta baja' en portugués?", options: ["Piso zero", "Térreo", "Planta baixa", "Primeiro andar"], answer: "Térreo" },
      { question: "¿Qué debe incluir el cierre del check-in?", options: ["Solo el número de habitación", "Número de habitación, cómo llegar, horario de desayuno y número de recepción", "Solo el horario de desayuno", "Solo las políticas del hotel"], answer: "Número de habitación, cómo llegar, horario de desayuno y número de recepción" },
      { question: "¿Cómo se dice 'llave del cuarto'?", options: ["Llave de habitación", "Chave / cartão do quarto", "Entrada do quarto", "Acceso habitación"], answer: "Chave / cartão do quarto" },
      { question: "¿Cómo se dice 'procedimiento estándar'?", options: ["Regla del hotel", "Procedimento padrão", "Protocolo normal", "Norma vigente"], answer: "Procedimento padrão" },
    ],
    dictation: "Para completar o seu registro, precisaria do seu documento de identidade e de um cartão de crédito para garantia, que é um procedimento padrão do hotel.",
  },
  {
    id: "checkout-facturacion", title: "Check-out y facturación", level: "Intermedio", category: "Recepción", emoji: "💳",
    description: "Proceso de salida, revisión de cuenta y despedida profesional del huésped.",
    readingTitle: "La última impresión también importa",
    reading: [
      "El check-out es el último contacto directo. Si la estadía fue buena, puede consolidar fidelidad. Si hubo inconvenientes, es la última oportunidad para revertir una impresión negativa. La cuenta debe presentarse organizada: 'Bom dia, senhor Mendes. Preparei a sua fatura para o check-out. Pode conferir se está tudo correto?'",
      "La revisión puede generar preguntas o discrepancias. El colaborador debe explicar cada cargo con claridad y sin defensividad. Si hay un error, reconocerlo inmediatamente: 'Tem razão, senhora, foi um erro nosso. Vou corrigir imediatamente.' La rapidez y honestidad genera más confianza que la ausencia de errores.",
      "Los medios de pago deben comunicarse con claridad: 'Aceitamos cartão de crédito e débito de todas as bandeiras, dinheiro em pesos argentinos ou dólares. Qual é a sua preferência?' Es importante no asumir el medio de pago del huésped.",
      "Después del pago, preguntar por la experiencia y despedirse con calidez: 'Espero que tenha aproveitado muito a estadia. Vai fazer falta a vista do lago! Esperamos vê-lo em breve, senhor Mendes. Boa viagem!' Esta despedida memorable cierra el ciclo y planta la semilla del regreso.",
      "La devolución de llaves y la entrega del comprobante cierran el proceso. Ofrecer ayuda con el equipaje o la logística de regreso es un gesto muy valorado: 'Posso chamar um táxi para o aeroporto ou ajudá-lo com a bagagem?' Esta pregunta proactiva demuestra que el servicio continúa hasta el último momento.",
    ],
    vocab: [
      { es: "cuenta / factura", pt: "conta / fatura" },
      { es: "revisar la cuenta", pt: "conferir a conta" },
      { es: "medio de pago", pt: "forma de pagamento" },
      { es: "recibo / comprobante", pt: "recibo / comprovante" },
      { es: "buen viaje", pt: "boa viagem" },
      { es: "esperamos verlo pronto", pt: "esperamos vê-lo em breve" },
    ],
    quiz: [
      { question: "¿Cómo se presenta la cuenta al huésped?", options: ["Acá tiene, revísela", "Preparei a sua fatura. Pode conferir se está tudo correto?", "Tiene que pagar esto", "La cuenta está procesada"], answer: "Preparei a sua fatura. Pode conferir se está tudo correto?" },
      { question: "¿Cómo reaccionar ante un error detectado por el huésped?", options: ["Defender el cargo", "Reconocerlo inmediatamente y corregirlo con agilidad", "Pedir que espere", "Ofrecer descuento sin verificar"], answer: "Reconocerlo inmediatamente y corregirlo con agilidad" },
      { question: "¿Cómo se dice 'revisar la cuenta'?", options: ["Verificar a fatura", "Conferir a conta", "Checar o pagamento", "Olhar o recibo"], answer: "Conferir a conta" },
      { question: "¿Cómo se dice 'buen viaje'?", options: ["Buen camino", "Boa viagem", "Viaje seguro", "Até logo"], answer: "Boa viagem" },
      { question: "¿Cómo se dice 'recibo / comprobante'?", options: ["Papel de pago", "Recibo / comprovante", "Factura firmada", "Ticket de salida"], answer: "Recibo / comprovante" },
      { question: "¿Cómo se pregunta por la preferencia de pago?", options: ["¿Cómo va a pagar?", "Qual é a sua preferência de forma de pagamento?", "¿Tiene tarjeta?", "Pagamento em dinheiro?"], answer: "Qual é a sua preferência de forma de pagamento?" },
      { question: "¿Cómo se dice 'esperamos verlo pronto'?", options: ["Volte sempre", "Esperamos vê-lo em breve", "Até a próxima", "Volte logo"], answer: "Esperamos vê-lo em breve" },
      { question: "¿Por qué la despedida es tan importante como la bienvenida?", options: ["No es tan importante", "Es la última impresión y planta la semilla del regreso", "Solo si hubo problemas", "Solo para grupos corporativos"], answer: "Es la última impresión y planta la semilla del regreso" },
    ],
    dictation: "Preparei a sua fatura, senhor. Pode conferir se está tudo correto? Qual é a sua preferência de forma de pagamento? Boa viagem!",
  },
  {
    id: "modificaciones-reserva", title: "Modificaciones y cancelaciones", level: "Intermedio", category: "Recepción", emoji: "📅",
    description: "Gestión de cambios de fechas, upgrades y cancelaciones en portugués.",
    readingTitle: "Cuando los planes cambian",
    reading: [
      "Las modificaciones de reserva son una realidad cotidiana en hotelería. Ante una solicitud de cambio de fechas, el primer paso es verificar disponibilidad con actitud de 'vamos a encontrar una solución': 'Claro, senhor. Vou verificar a disponibilidade para as novas datas. Um momento, por favor.'",
      "Si la modificación es posible, confirmar todos los detalles nuevamente: 'Ótima notícia! Temos disponibilidade. A nova reserva ficaria do dia vinte e cinco ao dia vinte e oito, também na suíte lago. Posso confirmar a alteração?' Si implica diferencia de precio, comunicarlo antes de confirmar.",
      "Las cancelaciones son el escenario más delicado. Siempre intentar retener al huésped con alternativas: cambio de fecha, crédito para futura estadía, reducción de noches o upgrade. 'Entendo que precisa cancelar. Antes de procesarmos, gostaria de oferecer algumas alternativas que talvez sejam do seu interesse.'",
      "Las políticas de cancelación deben comunicarse en lenguaje simple: 'A nossa política estabelece que cancelamentos com menos de quarenta e oito horas têm uma taxa equivalente a uma noite. Como o cancelamento está sendo solicitado com mais de quarenta e oito horas, não haverá cobrança.' Esta claridad evita conflictos.",
      "Los upgrades son una oportunidad de deleitar y de vender categoría superior. Cuando hay disponibilidad: 'Senhor, tenho uma ótima notícia: temos uma categoria superior disponível por uma diferença de valor muito acessível. O senhor teria interesse?' Esta propuesta proactiva es siempre valorada.",
    ],
    vocab: [
      { es: "modificación / cambio", pt: "alteração / mudança" },
      { es: "disponibilidad", pt: "disponibilidade" },
      { es: "cancelación", pt: "cancelamento" },
      { es: "política de cancelación", pt: "política de cancelamento" },
      { es: "upgrade / mejora de categoría", pt: "upgrade / melhoria de categoria" },
      { es: "diferencia de precio", pt: "diferença de valor" },
    ],
    quiz: [
      { question: "¿Cuál es la actitud correcta ante un cambio de fechas?", options: ["Verificar primero si es posible", "Mostrar actitud de encontrar solución desde el primer momento", "Informar restricciones inmediatamente", "Derivar al supervisor"], answer: "Mostrar actitud de encontrar solución desde el primer momento" },
      { question: "¿Cómo se dice 'disponibilidad' en portugués?", options: ["Disponibilidade", "Vagas livres", "Quartos disponíveis", "Capacidade"], answer: "Disponibilidade" },
      { question: "¿Qué hacer antes de procesar una cancelación?", options: ["Procesarla inmediatamente", "Ofrecer alternativas: cambio de fecha, crédito, reducción o upgrade", "Informar penalidades y cancelar", "Pedir al supervisor"], answer: "Ofrecer alternativas: cambio de fecha, crédito, reducción o upgrade" },
      { question: "¿Cuándo comunicar la diferencia de precio en una modificación?", options: ["Después de confirmar", "Antes de confirmar, con claridad", "Solo si el huésped pregunta", "En el check-out"], answer: "Antes de confirmar, con claridad" },
      { question: "¿Cómo se dice 'cancelación'?", options: ["Anulación", "Cancelamento", "Fim da reserva", "Saída antecipada"], answer: "Cancelamento" },
      { question: "¿Cómo se dice 'upgrade'?", options: ["Cambio de cuarto", "Upgrade / melhoria de categoria", "Quarto melhor", "Categoria superior"], answer: "Upgrade / melhoria de categoria" },
      { question: "¿Cómo se dice 'modificación de reserva'?", options: ["Cambio de reserva", "Alteração da reserva", "Modificación da reserva", "Ajuste da reserva"], answer: "Alteração da reserva" },
      { question: "¿Cómo confirmar una modificación al huésped?", options: ["Solo actualizando el sistema", "Confirmando todos los nuevos datos en voz alta y pidiendo validación", "Enviando solo un correo", "Imprimiendo la nueva reserva"], answer: "Confirmando todos los nuevos datos en voz alta y pidiendo validación" },
    ],
    dictation: "Claro, senhor. Vou verificar a disponibilidade para as novas datas. Há uma diferença de valor que vou informar antes de confirmar a alteração.",
  },
  {
    id: "preguntas-orientacion", title: "Preguntas y orientación al huésped", level: "Básico", category: "Recepción", emoji: "🗺️",
    description: "Cómo responder consultas, dar indicaciones y orientar al huésped en portugués.",
    readingTitle: "El huésped que pregunta",
    reading: [
      "Un huésped que hace preguntas es un huésped involucrado y con ganas de aprovechar su estadía. La capacidad de responder con claridad y entusiasmo en el idioma del huésped es una de las competencias más valoradas. Cada pregunta es una oportunidad de agregar valor.",
      "Las preguntas más frecuentes son sobre instalaciones, actividades, transporte, restaurantes locales y horarios. Para cada área conviene tener respuestas preparadas en portugués: 'A piscina aquecida fica no nível inferior, aberta das oito às vinte e duas horas. As toalhas estão disponíveis na entrada.' Respuestas claras y completas con información de valor añadido.",
      "Para dar indicaciones dentro del hotel: 'Siga em frente e vire à direita' (Siga adelante y gire a la derecha), 'Desça pelo elevador até o térreo' (Baje por el ascensor hasta la planta baja), 'Fica logo após a recepção' (Queda justo después de la recepción), 'É o segundo corredor à esquerda' (Es el segundo pasillo a la izquierda).",
      "Cuando no se tiene la respuesta inmediata, nunca decir 'no sé'. Siempre: 'Ótima pergunta, senhor. Deixa eu verificar essa informação para o senhor com certeza. Um momentinho.' Esta respuesta honesta y proactiva mantiene la confianza del huésped.",
      "Las preguntas sobre excursiones son oportunidades de venta: 'O senhor tem interesse em conhecer o Bosque de Arrayanes? É uma das experiências mais especiais da região. Posso fazer uma reserva para amanhã se o senhor quiser.' Transformar una consulta en una venta es una competencia clave.",
    ],
    vocab: [
      { es: "siga adelante / gire a la derecha", pt: "siga em frente / vire à direita" },
      { es: "a la izquierda / a la derecha", pt: "à esquerda / à direita" },
      { es: "ascensor", pt: "elevador" },
      { es: "queda justo después de", pt: "fica logo após" },
      { es: "déjeme verificar", pt: "deixa eu verificar" },
      { es: "¿tiene interés en...?", pt: "o senhor tem interesse em...?" },
    ],
    quiz: [
      { question: "¿Qué representa una pregunta del huésped para el colaborador?", options: ["Una molestia", "Una oportunidad de agregar valor y construir relación", "Solo una obligación de responder", "Un problema a resolver rápido"], answer: "Una oportunidad de agregar valor y construir relación" },
      { question: "¿Cómo se dice 'siga adelante y gire a la derecha'?", options: ["Siga e doble derecha", "Siga em frente e vire à direita", "Vá para frente e depois direita", "Continue e dobra à direita"], answer: "Siga em frente e vire à direita" },
      { question: "¿Qué hacer cuando no se tiene la respuesta inmediata?", options: ["Decir no sé honestamente", "Inventar una respuesta", "Decir 'déjame verificar' y buscar la información correcta", "Derivar inmediatamente"], answer: "Decir 'déjame verificar' y buscar la información correcta" },
      { question: "¿Cómo se dice 'ascensor'?", options: ["Ascensor", "Elevador", "Subidor", "Lift"], answer: "Elevador" },
      { question: "¿Cómo se dice 'a la izquierda'?", options: ["A la izquierda", "À esquerda", "Para a esquerda", "Del lado izquierdo"], answer: "À esquerda" },
      { question: "¿Cómo se dice 'déjame verificar'?", options: ["Voy a buscar", "Deixa eu verificar", "Vou procurar", "Tenho que checar"], answer: "Deixa eu verificar" },
      { question: "¿Cómo se transforma una consulta en una venta?", options: ["Solo respondiendo la pregunta", "Respondiendo con entusiasmo y ofreciendo hacer la reserva directamente", "Dando un folleto", "Derivando al área de tours"], answer: "Respondiendo con entusiasmo y ofreciendo hacer la reserva directamente" },
      { question: "¿Cómo se dice '¿tiene interés en...?'?", options: ["Le gusta...?", "O senhor tem interesse em...?", "O senhor quer...?", "Deseja...?"], answer: "O senhor tem interesse em...?" },
    ],
    dictation: "Siga em frente e vire à direita. O elevador fica logo após a recepção. Qualquer dúvida, estamos à disposição.",
  },
  // ══ HABITACIONES ══
  {
    id: "descripcion-cabanas", title: "Descripción de cabañas", level: "Intermedio", category: "Habitaciones", emoji: "🏡",
    description: "Cómo describir las cabañas del hotel con vocabulario técnico en portugués.",
    readingTitle: "La cabaña que enamora",
    reading: [
      "Las cabañas del Hotel Marinas combinan privacidad total con todos los servicios de alta gama. Describir correctamente una cabaña en portugués no es solo listar características: es construir una imagen mental que genere deseo. La descripción debe seguir un orden lógico de exterior a interior.",
      "'As cabanas estão localizadas entre as árvores, com total privacidade e uma vista deslumbrante para o lago e a cordilheira. Cada chalé tem uma varanda privativa com mobiliário para relaxar ao ar livre.' Este inicio establece el contexto natural y privilegiado de la ubicación.",
      "El interior con adjetivos sensoriales: 'Ao entrar, o senhor vai perceber o calor da lareira de lenha que aquece o ambiente nos dias mais frios de montanha. A decoração combina madeira nativa e pedra, criando uma atmosfera rústica e elegante ao mesmo tempo.' Los detalles de temperatura y ambiente generan conexión emocional.",
      "Las características técnicas como beneficios: 'A cozinha está totalmente equipada com geladeira, fogão, micro-ondas e louças completas. O aquecimento é central e regulável em cada ambiente. A cama king-size tem colchão de alta densidade.' En lugar de listar equipamiento, se explica qué puede hacer el huésped.",
      "'Da varanda, o senhor pode observar os cervos ao amanhecer, ouvir o silêncio da floresta à noite e acordar com uma vista que poucos lugares do mundo podem oferecer.' Este cierre emocional transforma la descripción en experiencia anticipada.",
    ],
    vocab: [
      { es: "cabaña", pt: "chalé" },
      { es: "chimenea a leña", pt: "lareira de lenha" },
      { es: "galería / balcón", pt: "varanda" },
      { es: "vista al lago", pt: "vista para o lago" },
      { es: "cocina equipada", pt: "cozinha equipada" },
      { es: "calefacción central", pt: "aquecimento central" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'cabaña' en portugués hotelero?", options: ["Cabaña", "Chalé", "Casa de campo", "Bungalow"], answer: "Chalé" },
      { question: "¿Qué orden es más efectivo para describir una cabaña?", options: ["Listar características técnicas", "De exterior a interior construyendo imagen mental progresiva", "Empezar por el precio", "Solo mencionar lo diferencial"], answer: "De exterior a interior construyendo imagen mental progresiva" },
      { question: "¿Cómo se dice 'chimenea' en portugués?", options: ["Chimenea", "Lareira", "Fogão a lenha", "Aquecedor"], answer: "Lareira" },
      { question: "¿Cómo se dice 'galería / balcón'?", options: ["Balcón", "Varanda", "Terraza", "Deck"], answer: "Varanda" },
      { question: "¿Por qué describir el equipamiento como beneficios?", options: ["Para hacer la descripción más larga", "Porque explica qué puede hacer el huésped generando valor percibido real", "Solo si el huésped pregunta", "Por requisito de ventas"], answer: "Porque explica qué puede hacer el huésped generando valor percibido real" },
      { question: "¿Cómo se dice 'vista al lago'?", options: ["Vista al lago", "Vista para o lago", "Panorama do lago", "Janela para o lago"], answer: "Vista para o lago" },
      { question: "¿Cómo se dice 'cocina equipada'?", options: ["Cocina completa", "Cozinha equipada", "Cozinha completa", "Área gourmet"], answer: "Cozinha equipada" },
      { question: "¿Cómo se dice 'calefacción central'?", options: ["Calefacción", "Aquecimento central", "Calor central", "Sistema de calor"], answer: "Aquecimento central" },
    ],
    dictation: "As cabanas têm varanda privativa com vista para o lago, lareira de lenha, cozinha equipada e aquecimento central regulável.",
  },
  {
    id: "descripcion-suites", title: "Descripción de loft y suites", level: "Intermedio", category: "Habitaciones", emoji: "🛏️",
    description: "Cómo describir los loft y suites del hotel con vocabulario preciso en portugués.",
    readingTitle: "El espacio que sorprende",
    reading: [
      "Los loft y las suites representan el nivel más alto de la oferta de alojamiento del Marinas. Cada categoría tiene características distintivas que deben describirse con precisión y entusiasmo para convertir al huésped indeciso en uno que quiere reservar la categoría superior.",
      "El loft se distingue por su arquitectura de doble altura: 'O loft tem dois andares integrados. No nível inferior, a sala de estar com sofá, televisão e área de trabalho. A área de dormir fica no mezanino superior, com cama king-size e janelas panorâmicas que enquadram a montanha como se fosse uma pintura.'",
      "Las suites se definen por amplitud y servicios adicionales: 'A suíte lago tem cento e vinte metros quadrados com sala de estar separada, jacuzzi privativo na varanda com vista para o lago e serviço de mordomia incluído. A cama é king-size com colchão premium e roupa de cama de algodão egípcio.'",
      "Para parejas: 'O banheiro da suíte conta com banheira de imersão para dois com vista para a natureza. A banheira pode ser preparada com sais aromáticos e pétalas de rosas a pedido, sem custo adicional.' Este detalle convierte la descripción en una invitación romántica.",
      "La comparación estratégica: 'Em relação ao loft standard, a suíte oferece cinquenta metros quadrados adicionais, jacuzzi privativo e serviço de mordomia. Para uma ocasião especial, a diferença de valor é muito acessível considerando a experiência que proporciona.' Este argumento conecta precio con valor de la experiencia.",
    ],
    vocab: [
      { es: "suite / suite lago", pt: "suíte / suíte lago" },
      { es: "loft / mezanino", pt: "loft / mezanino" },
      { es: "jacuzzi / bañera de inmersión", pt: "jacuzzi / banheira de imersão" },
      { es: "servicio de mayordomía", pt: "serviço de mordomia" },
      { es: "metros cuadrados", pt: "metros quadrados" },
      { es: "cama king-size", pt: "cama king-size" },
    ],
    quiz: [
      { question: "¿Qué caracteriza arquitectónicamente al loft?", options: ["Su gran tamaño horizontal", "Su doble altura con mezanino superior donde está el dormitorio", "Su vista exclusiva", "Su cocina completamente equipada"], answer: "Su doble altura con mezanino superior donde está el dormitorio" },
      { question: "¿Cómo se dice 'jacuzzi'?", options: ["Jacuzzi igual", "Jacuzzi / banheira de imersão", "Tina caliente", "Baño especial"], answer: "Jacuzzi / banheira de imersão" },
      { question: "¿Cómo se dice 'servicio de mayordomía'?", options: ["Servicio de habitación", "Serviço de mordomia", "Asistencia personal", "Servicio VIP"], answer: "Serviço de mordomia" },
      { question: "¿Cómo se dice 'metros cuadrados'?", options: ["Metros cuadrados", "Metros quadrados", "M2 portugueses", "Metragem"], answer: "Metros quadrados" },
      { question: "¿Cómo se dice 'mezanino'?", options: ["Planta alta", "Mezanino", "Segundo piso", "Nivel superior"], answer: "Mezanino" },
      { question: "¿Qué detalle romántico puede ofrecerse en la suite?", options: ["Solo el jacuzzi", "Bañera con sales aromáticas y pétalos de rosas a pedido sin cargo", "Cena en la habitación", "Champagne siempre"], answer: "Bañera con sales aromáticas y pétalos de rosas a pedido sin cargo" },
      { question: "¿Cómo se dice 'cama king-size'?", options: ["Cama grande", "Cama king-size", "Cama de casal", "Cama matrimonial"], answer: "Cama king-size" },
      { question: "¿Qué argumento conecta precio con valor en la comparación?", options: ["Que la suite es más grande", "Que la diferencia es accesible considerando la experiencia que proporciona", "Que incluye desayuno", "Que tiene mejor vista"], answer: "Que la diferencia es accesible considerando la experiencia que proporciona" },
    ],
    dictation: "A suíte lago tem jacuzzi privativo na varanda com vista para o lago, sala de estar separada e serviço de mordomia incluído.",
  },
  {
    id: "recomendacion-categoria", title: "Recomendación según perfil", level: "Intermedio", category: "Habitaciones", emoji: "🎯",
    description: "Cómo orientar al huésped hacia la categoría ideal según su perfil y necesidades.",
    readingTitle: "La categoría perfecta para cada huésped",
    reading: [
      "Recomendar la categoría correcta para cada huésped es una de las competencias más valiosas del personal de recepción. Una buena recomendación genera satisfacción y confianza. Una mala puede generar decepción aunque la habitación sea objetivamente buena. La clave está en escuchar antes de recomendar.",
      "Para parejas en viaje romántico o luna de miel: 'Para uma lua de mel, a nossa suíte lago é simplesmente especial. O jacuzzi privativo com vista para o lago ao entardecer é uma experiência que os casais sempre mencionam nas avaliações. Posso reservar para o senhor?' Esta recomendación específica es mucho más efectiva que una descripción genérica.",
      "Para familias con niños, las cabañas son ideales: 'Para famílias com crianças, os nossos chalés são perfeitos. Têm dois quartos, cozinha equipada, e as crianças adoram a varanda e o jardim privativo. Fica num ambiente mais reservado dentro do hotel.' La cocina, el espacio y la privacidad son los argumentos clave.",
      "Para estadías prolongadas o huéspedes que trabajan remotamente, el loft: 'Para estadías mais longas, o loft é ideal. Tem área de trabalho separada com internet de alta velocidade, cozinha completa e sala de estar independente. Muitos de nossos hóspedes que trabalham remotamente preferem o loft.'",
      "La técnica de la pregunta abierta es fundamental: '¿Quantas pessoas vão se hospedar? É uma viagem de trabalho ou lazer? Tem alguma preferência especial, como vista para o lago ou mais privacidade?' Con esta información se puede hacer una recomendación genuinamente personalizada.",
    ],
    vocab: [
      { es: "luna de miel / aniversario", pt: "lua de mel / aniversário" },
      { es: "familia con niños", pt: "família com crianças" },
      { es: "estadía prolongada", pt: "estadia prolongada" },
      { es: "trabajo remoto", pt: "trabalho remoto" },
      { es: "según el perfil del huésped", pt: "de acordo com o perfil do hóspede" },
      { es: "la opción ideal", pt: "a opção ideal" },
    ],
    quiz: [
      { question: "¿Qué es fundamental hacer antes de recomendar una categoría?", options: ["Ofrecer siempre la más cara", "Escuchar al huésped y hacer preguntas abiertas", "Describir todas las categorías sin distinción", "Esperar que el huésped elija solo"], answer: "Escuchar al huésped y hacer preguntas abiertas" },
      { question: "¿Qué categoría es ideal para una luna de miel?", options: ["La habitación más barata", "La suíte lago con jacuzzi privativo y vista al lago", "Cualquier habitación con cama king", "La cabaña por la privacidad"], answer: "La suíte lago con jacuzzi privativo y vista al lago" },
      { question: "¿Por qué las cabañas son ideales para familias con niños?", options: ["Son más baratas", "Tienen dos cuartos, cocina equipada, jardín privado y ambiente reservado", "Están más cerca del restaurante", "Tienen piscina privada"], answer: "Tienen dos cuartos, cocina equipada, jardín privado y ambiente reservado" },
      { question: "¿Qué hace ideal al loft para estadías largas?", options: ["Es el más grande", "Tiene área de trabajo separada, internet rápido y cocina completa", "Está más cerca de la recepción", "Tiene más ventanas"], answer: "Tiene área de trabajo separada, internet rápido y cocina completa" },
      { question: "¿Cómo se dice 'luna de miel'?", options: ["Luna de miel", "Lua de mel", "Viaje romántico", "Aniversário de casamento"], answer: "Lua de mel" },
      { question: "¿Cómo se dice 'familia con niños'?", options: ["Familia completa", "Família com crianças", "Grupo familiar", "Família grande"], answer: "Família com crianças" },
      { question: "¿Cómo se dice 'trabajo remoto'?", options: ["Trabajo a distancia", "Trabalho remoto", "Home office", "Trabalho fora"], answer: "Trabalho remoto" },
      { question: "¿Cómo se dice 'estadía prolongada'?", options: ["Estancia larga", "Estadia prolongada", "Estadía extendida", "Longa permanência"], answer: "Estadia prolongada" },
    ],
    dictation: "Para uma lua de mel, a nossa suíte lago é especial. O jacuzzi privativo com vista para o lago ao entardecer é uma experiência inesquecível.",
  },
  // ══ RESTAURANTE ══
  {
    id: "recepcion-mesa", title: "Recepción y asignación de mesa", level: "Básico", category: "Restaurante", emoji: "🍽️",
    description: "Cómo recibir al huésped en el restaurante y asignar la mesa correctamente.",
    readingTitle: "La primera impresión en el restaurante",
    reading: [
      "La recepción en el restaurante establece el tono de toda la experiencia gastronómica. La secuencia estándar: saludo formal ('Boa noite, sejam bem-vindos ao restaurante'), consulta de reserva ('Têm uma reserva?'), y acompañamiento ('Por favor, sigam-me. Vou acompanhá-los até a mesa').",
      "La asignación de mesa debe considerar las preferencias del huésped: vista al lago, interior o exterior, mesa romántica para pareja o amplia para grupo. 'Temos uma mesa com vista para o lago disponível. Seria do seu agrado?' Ofrecer opciones genera percepción de atención personalizada.",
      "Al acompañar a la mesa se puede hacer conversación breve: '¿É a primeira vez que jantam conosco?' o 'Estão aproveitando a estadia no hotel?' Al llegar, presentar la silla y ofrecer la carta.",
      "'Aqui estão os cardápios. Posso trazer alguma bebida enquanto escolhem? Temos uma seleção de vinhos argentinos de excelente qualidade que posso recomendar se desejarem.' Esta oferta proactiva de bebidas agiliza el servicio y potencia las ventas.",
      "Si no hay reserva, verificar disponibilidad con disposición: 'Deixa eu verificar a disponibilidade para esta noite. Quantas pessoas são? Têm alguma preferência de mesa?' Esta actitud de servicio, incluso ante la incertidumbre, genera confianza.",
    ],
    vocab: [
      { es: "mesa / reserva de mesa", pt: "mesa / reserva de mesa" },
      { es: "menú / carta", pt: "cardápio / carta" },
      { es: "¿tienen reserva?", pt: "têm uma reserva?" },
      { es: "por favor, sígame", pt: "por favor, sigam-me" },
      { es: "vista al lago / mesa exterior", pt: "vista para o lago / mesa do lado de fora" },
      { es: "¿cuántas personas son?", pt: "quantas pessoas são?" },
    ],
    quiz: [
      { question: "¿Cómo se saluda al recibir huéspedes en el restaurante por la noche?", options: ["Hola, buenas", "Boa noite, sejam bem-vindos ao restaurante", "Olá, podem entrar", "Bom dia"], answer: "Boa noite, sejam bem-vindos ao restaurante" },
      { question: "¿Cómo se pregunta si tienen reserva?", options: ["¿Tienen reserva?", "Têm uma reserva?", "Reservaram mesa?", "Têm reservação?"], answer: "Têm uma reserva?" },
      { question: "¿Cómo se invita a seguir hacia la mesa?", options: ["Vayan por allá", "Por favor, sigam-me. Vou acompanhá-los até a mesa", "La mesa está allá", "Siéntense donde quieran"], answer: "Por favor, sigam-me. Vou acompanhá-los até a mesa" },
      { question: "¿Cómo se dice '¿cuántas personas son?'?", options: ["Cuántos son?", "Quantas pessoas são?", "Quantos vocês são?", "Para quantas pessoas?"], answer: "Quantas pessoas são?" },
      { question: "¿Cómo se dice 'menú / carta' en portugués?", options: ["Menú", "Cardápio / carta", "Lista de pratos", "Programa do jantar"], answer: "Cardápio / carta" },
      { question: "¿Qué se ofrece proactivamente al sentar al huésped?", options: ["Solo el menú", "Bebidas mientras eligen, especialmente vinos argentinos", "El postre del día", "La cuenta anticipada"], answer: "Bebidas mientras eligen, especialmente vinos argentinos" },
      { question: "¿Cómo se ofrece una mesa con vista al lago?", options: ["La mesa está ahí nomás", "Temos uma mesa com vista para o lago. Seria do seu agrado?", "¿Quiere ver el lago?", "Hay mesa con vista"], answer: "Temos uma mesa com vista para o lago. Seria do seu agrado?" },
      { question: "¿Cómo se dice 'mesa exterior'?", options: ["Mesa afuera", "Mesa do lado de fora / mesa externa", "Mesa no exterior", "Mesa ao ar livre"], answer: "Mesa do lado de fora / mesa externa" },
    ],
    dictation: "Boa noite, sejam bem-vindos. Têm uma reserva? Por favor, sigam-me. Temos uma mesa com vista para o lago disponível.",
  },
  {
    id: "toma-pedido", title: "Toma de pedido estructurada", level: "Intermedio", category: "Restaurante", emoji: "📝",
    description: "Cómo tomar el pedido profesionalmente con tiempos de cocción y preferencias.",
    readingTitle: "El arte de tomar el pedido",
    reading: [
      "Tomar el pedido es mucho más que anotar lo que el huésped elige. Es escucha activa, clarificación de preferencias, sugerencia profesional y confirmación precisa. Un pedido tomado correctamente evita errores, reduce el tiempo de servicio y genera experiencia de atención personalizada.",
      "La secuencia profesional: primero bebidas, luego platos en orden: entrada, plato principal, postre. 'Já decidiram as bebidas? Posso sugerir um Malbec da região de Mendoza que harmoniza muito bem com as carnes grelhadas.' Tomar bebidas primero agiliza el servicio.",
      "Los puntos de cocción de la carne: 'Ao ponto' (a punto/medium), 'Mal passado' (jugoso/medium rare), 'Bem passado' (muy hecho/well done). 'Como o senhor prefere o bife? Ao ponto, mal passado ou bem passado?' Esta pregunta precisa es fundamental para el turista brasileño.",
      "Las modificaciones deben recibirse con naturalidad: 'Com certeza, posso pedir para preparar sem molho. Alguma outra preferência?' El colaborador nunca debe hacer sentir al huésped que sus modificaciones son una complicación.",
      "La confirmación del pedido antes de ir a la cocina: 'Então para o senhor: entrada de burrata, o bife de chorizo ao ponto com fritas, e para a senhora, o salmão com purê. Correto? Em alguns minutos estou de volta com as bebidas.' Esta confirmación previene errores.",
    ],
    vocab: [
      { es: "a punto / jugoso / muy hecho", pt: "ao ponto / mal passado / bem passado" },
      { es: "entrada / plato principal / postre", pt: "entrada / prato principal / sobremesa" },
      { es: "con / sin salsa", pt: "com / sem molho" },
      { es: "¿cómo prefiere la carne?", pt: "como o senhor prefere a carne?" },
      { es: "confirmación del pedido", pt: "confirmação do pedido" },
      { es: "en unos minutos", pt: "em alguns minutos" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'a punto' (medium) en portugués?", options: ["A punto", "Ao ponto", "Médio", "Na medida"], answer: "Ao ponto" },
      { question: "¿Cómo se dice 'jugoso' (medium rare)?", options: ["Jugoso", "Mal passado", "Poco cocido", "Quase cru"], answer: "Mal passado" },
      { question: "¿Cómo se dice 'muy hecho' (well done)?", options: ["Muy cocido", "Bem passado", "Muito cozido", "Completamente assado"], answer: "Bem passado" },
      { question: "¿Cómo se pregunta la preferencia de cocción?", options: ["¿Cómo lo quiere?", "Como o senhor prefere a carne?", "Bien o poco cocido?", "Ao ponto ou mal passado?"], answer: "Como o senhor prefere a carne?" },
      { question: "¿Cómo se dice 'sin salsa'?", options: ["Sin salsa", "Sem molho", "Sin aderezo", "Sem tempero"], answer: "Sem molho" },
      { question: "¿Por qué confirmar el pedido antes de ir a la cocina?", options: ["Solo para parecer profesional", "Para prevenir errores y transmitir atención al detalle", "Por exigencia del reglamento", "Solo si el pedido es complicado"], answer: "Para prevenir errores y transmitir atención al detalle" },
      { question: "¿Cómo se dice 'postre'?", options: ["Postre", "Sobremesa", "Dulce final", "Doce"], answer: "Sobremesa" },
      { question: "¿Cómo se dice 'en unos minutos'?", options: ["Pronto", "Em alguns minutos", "Ya vuelvo", "Em breve"], answer: "Em alguns minutos" },
    ],
    dictation: "Como o senhor prefere a carne? Ao ponto, mal passado ou bem passado? Posso também sugerir o acompanhamento da casa.",
  },
  {
    id: "descripcion-platos", title: "Platos y vinos argentinos", level: "Avanzado", category: "Restaurante", emoji: "🍷",
    description: "Vocabulario sensorial para describir platos y recomendar vinos patagónicos.",
    readingTitle: "Las palabras que hacen agua la boca",
    reading: [
      "Describir un plato en un restaurante de alta gama no es recitar ingredientes: es crear una experiencia sensorial anticipada. Un colaborador que describe los platos con vocabulario preciso y evocador en portugués no solo informa: genera deseo y agrega valor a la experiencia gastronómica.",
      "Los adjetivos sensoriales son la herramienta central. Para texturas: 'crocante' (crujiente), 'cremoso' (cremoso), 'suculento' (jugoso), 'macio' (tierno). Para sabores: 'defumado' (ahumado), 'levemente adocicado' (levemente dulce), 'levemente ácido'. Para temperatura: 'quente na hora' (caliente al momento).",
      "El bife de chorizo: 'O bife de chorizo é um corte nobre com uma camada de gordura que derrete durante o preparo e confere um sabor único. Servimos ao ponto com fritas artesanais e chimichurri da casa, feito com ervas frescas e azeite extra virgem.' Esta descripción precisa y apetitosa facilita la decisión.",
      "Los vinos argentinos: 'A Argentina é o quinto maior produtor de vinhos do mundo. O Malbec é a nossa uva insignia, que encontrou no terroir de Mendoza condições únicas para produzir vinhos com corpo, taninos sedosos e perfil frutado intenso. Para as carnes, recomendamos especialmente o nosso Malbec Gran Reserva.'",
      "La armonización: 'Para o salmão grelhado, sugiro o nosso Chardonnay patagônico, que tem acidez equilibrada e notas de frutas brancas que complementam perfeitamente o peixe. Para as carnes vermelhas, o Malbec ou o Cabernet Sauvignon são escolhas clássicas e seguras.'",
    ],
    vocab: [
      { es: "jugoso / tierno / crocante", pt: "suculento / macio / crocante" },
      { es: "ahumado", pt: "defumado" },
      { es: "bife de chorizo", pt: "bife de chorizo" },
      { es: "Malbec / Chardonnay", pt: "Malbec / Chardonnay" },
      { es: "armonización de vinos", pt: "harmonização de vinhos" },
      { es: "cuerpo / taninos", pt: "corpo / taninos" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'jugoso / suculento'?", options: ["Jugoso", "Suculento", "Com suco", "Molhado"], answer: "Suculento" },
      { question: "¿Cómo se dice 'ahumado'?", options: ["Ahumado", "Defumado", "Con humo", "Quemado"], answer: "Defumado" },
      { question: "¿Cómo se dice 'crocante / crujiente'?", options: ["Duro", "Crocante", "Firme", "Sólido"], answer: "Crocante" },
      { question: "¿Cuál es la uva insignia de Argentina?", options: ["Cabernet Sauvignon", "Malbec", "Chardonnay", "Torrontés"], answer: "Malbec" },
      { question: "¿Qué vino se recomienda para el salmón?", options: ["Malbec tinto", "Chardonnay patagónico con acidez equilibrada", "Vino rosado", "Champagne siempre"], answer: "Chardonnay patagónico con acidez equilibrada" },
      { question: "¿Qué vino se recomienda para carnes rojas?", options: ["Chardonnay", "Malbec o Cabernet Sauvignon", "Vino blanco siempre", "Solo vino rosado"], answer: "Malbec o Cabernet Sauvignon" },
      { question: "¿Cómo se dice 'tierno' (de la carne)?", options: ["Suave", "Macio", "Delicado", "Blando"], answer: "Macio" },
      { question: "¿Qué es la armonización de vinos?", options: ["Mezclar diferentes vinos", "El arte de recomendar el vino correcto para cada plato", "Servir a temperatura correcta", "Presentar la carta de vinos"], answer: "El arte de recomendar el vino correcto para cada plato" },
    ],
    dictation: "O bife de chorizo é suculento e macio, servido ao ponto com fritas artesanais. Para harmonizar, recomendo o nosso Malbec Gran Reserva.",
  },
  {
    id: "desayuno-buffet", title: "Desayuno buffet", level: "Básico", category: "Restaurante", emoji: "🍳",
    description: "Organización, presentación y atención del desayuno buffet en portugués.",
    readingTitle: "El desayuno que marca el día",
    reading: [
      "El desayuno tiene un peso desproporcionado en la percepción global de la estadía. Para el turista brasileño, el café da manhã es culturalmente muy importante: se espera abundancia, variedad y calidad. Un desayuno memorable puede compensar pequeñas imperfecciones anteriores.",
      "Al recibir al huésped: 'Bom dia, senhor. O buffet está disponível ao longo da sala. Temos pães artesanais recém-saídos do forno, frutas frescas da temporada, frios e queijos, ovos preparados na hora e sucos naturais. Posso trazer um café ou cappuccino?' Esta presentación orienta al huésped y genera expectativa positiva.",
      "El café es especialmente importante para el turista brasileño: 'Como o senhor prefere o café? Temos café coado, espresso, cappuccino, café com leite. O leite pode ser integral, desnatado ou de aveia.' Esta atención al detalle en el café comunica que el hotel entiende las preferencias del mercado brasileño.",
      "La reposición del buffet debe ser proactiva y silenciosa: el huésped no debe esperar a que se agote un producto. 'Vou trazer mais pão fresco do forno em um momento' antes de que el cesto esté vacío es el estándar de excelencia.",
      "Las restricciones alimentarias identificadas en el check-in deben trasladarse al equipo de desayuno: si un huésped celíaco llega al buffet, el colaborador debe poder guiarlo directamente: 'Bom dia, senhor. Sei que o senhor é celíaco. Temos pães sem glúten nesta cesta separada e as frutas e os ovos são naturalmente seguros.'",
    ],
    vocab: [
      { es: "buffet de desayuno", pt: "buffet / café da manhã em buffet" },
      { es: "recién horneado", pt: "recém-saído do forno" },
      { es: "jugos naturales", pt: "sucos naturais" },
      { es: "café / cappuccino / café con leche", pt: "café / cappuccino / café com leite" },
      { es: "leche entera / descremada", pt: "leite integral / desnatado" },
      { es: "¿cómo prefiere el café?", pt: "como o senhor prefere o café?" },
    ],
    quiz: [
      { question: "¿Por qué el desayuno es tan importante para el turista brasileño?", options: ["Es la comida más barata", "El café da manhã es culturalmente muy importante y tiene gran peso en la percepción global", "Es el único momento donde se ve al personal", "Solo por la calidad del café"], answer: "El café da manhã es culturalmente muy importante y tiene gran peso en la percepción global" },
      { question: "¿Cómo se dice 'recién salido del horno'?", options: ["Reciente del horno", "Recém-saído do forno", "Fresquinho do forno", "Acabado de hornear"], answer: "Recém-saído do forno" },
      { question: "¿Cómo se dice '¿cómo prefiere el café?'?", options: ["¿Cómo lo quiere?", "Como o senhor prefere o café?", "Café como?", "Que tipo de café?"], answer: "Como o senhor prefere o café?" },
      { question: "¿Cómo se dice 'jugos naturales'?", options: ["Jugos frescos", "Sucos naturais", "Bebidas de frutas", "Zumos naturales"], answer: "Sucos naturais" },
      { question: "¿Cómo se dice 'leche entera'?", options: ["Leche completa", "Leite integral", "Leite gordo", "Leche entera"], answer: "Leite integral" },
      { question: "¿Cómo se dice 'café con leche'?", options: ["Café cortado", "Café com leite", "Café latte", "Café claro"], answer: "Café com leite" },
      { question: "¿Cuándo debe reponerse el buffet?", options: ["Cuando se agota completamente", "Proactivamente, antes de que se agote visualmente", "Solo cuando el huésped lo solicita", "En horarios fijos"], answer: "Proactivamente, antes de que se agote visualmente" },
      { question: "¿Cómo se dice 'cappuccino' en portugués?", options: ["Café con espuma", "Cappuccino igual", "Café espumado", "Café cremoso"], answer: "Cappuccino igual" },
    ],
    dictation: "Bom dia, senhora. O buffet está disponível. Temos pães recém-saídos do forno e sucos naturais. Como a senhora prefere o café?",
  },
  // ══ EXCURSIONES ══
  {
    id: "bosque-arrayanes", title: "Bosque de Arrayanes", level: "Intermedio", category: "Excursiones", emoji: "🌳",
    description: "Cómo describir y recomendar el Bosque de Arrayanes en portugués.",
    readingTitle: "El bosque que inspiró a Disney",
    reading: [
      "El Bosque de Arrayanes es el mayor bosque de arrayanes del mundo, con árboles de corteza anaranjada y troncos retorcidos que forman un bosque de cuento de hadas que inspiró el diseño artístico de Bambi de Disney. Describir este lugar en portugués es una de las competencias más valiosas para el equipo del hotel.",
      "'O Bosque de Arrayanes é uma experiência única no mundo. Tem árvores com casca cor de laranja, quase luminosa, e troncos esculpidos pelo tempo que parecem saídos de um conto de fadas. Walt Disney se inspirou neste bosque para criar os cenários de Bambi.' Esta introducción genera inmediata curiosidad y deseo.",
      "La experiencia práctica: 'O passeio se faz de barco pelo Lago Nahuel Huapi, uma travessia de aproximadamente uma hora com paisagens deslumbrantes. Ao chegar ao bosque, uma trilha de madeira elevada percorre o interior durante quarenta e cinco minutos.' La información práctica permite al huésped visualizar la experiencia.",
      "La mejor época: 'O melhor período para visitar é o outono, de março a maio, quando as folhas ficam douradas e a luz entre as árvores cria reflexos mágicos. No inverno, a neve sobre as arrayanhas cria uma paisagem igualmente impressionante. Em qualquer época, o bosque tem uma energia especial.'",
      "Cierre proactivo: 'Posso reservar o passeio para o senhor amanhã de manhã? O horário de saída é às nove horas. Inclui o translado do hotel, o passeio de barco e a guia local em português. É uma experiência que os nossos hóspedes brasileiros sempre mencionam como o momento mais especial da estadia.'",
    ],
    vocab: [
      { es: "bosque / selva", pt: "bosque / floresta" },
      { es: "árbol / corteza / tronco", pt: "árvore / casca / tronco" },
      { es: "paseo en barco / travesía", pt: "passeio de barco / travessia" },
      { es: "sendero / camino de madera", pt: "trilha / passarela de madeira" },
      { es: "paisaje / montaña nevada", pt: "paisagem / montanha nevada" },
      { es: "guía en portugués", pt: "guia em português" },
    ],
    quiz: [
      { question: "¿Por qué el Bosque de Arrayanes es único en el mundo?", options: ["Es el más antiguo de Argentina", "Es el mayor bosque de arrayanes del mundo con árboles de corteza anaranjada únicos", "Solo por la conexión con Disney", "Por ser privado y exclusivo"], answer: "Es el mayor bosque de arrayanes del mundo con árboles de corteza anaranjada únicos" },
      { question: "¿Quién se inspiró en el Bosque de Arrayanes?", options: ["Jorge Luis Borges", "Walt Disney para los escenarios de Bambi", "Pablo Neruda para sus poemas", "Los pintores impresionistas"], answer: "Walt Disney para los escenarios de Bambi" },
      { question: "¿Cómo se llega al Bosque de Arrayanes?", options: ["En auto por ruta", "En barco por el Lago Nahuel Huapi durante aproximadamente una hora", "En trekking desde el pueblo", "En teleférico"], answer: "En barco por el Lago Nahuel Huapi durante aproximadamente una hora" },
      { question: "¿Cuál es la mejor época para visitar?", options: ["Solo en verano", "El otoño de marzo a mayo cuando las hojas son doradas", "Solo en invierno con nieve", "Cualquier época es igual"], answer: "El otoño de marzo a mayo cuando las hojas son doradas" },
      { question: "¿Cómo se dice 'bosque' en portugués?", options: ["Bosque", "Bosque / floresta", "Selva", "Mata"], answer: "Bosque / floresta" },
      { question: "¿Cómo se dice 'paseo en barco'?", options: ["Viaje en bote", "Passeio de barco", "Excursión acuática", "Tour de lancha"], answer: "Passeio de barco" },
      { question: "¿Cómo se dice 'sendero / camino de madera'?", options: ["Camino de madera", "Trilha / passarela de madeira", "Pista elevada", "Caminhada"], answer: "Trilha / passarela de madeira" },
      { question: "¿Qué información práctica debe incluir la recomendación?", options: ["Solo la descripción visual", "Horario de salida, duración, traslado incluido y guía en portugués", "Solo el precio", "Solo la historia de Disney"], answer: "Horario de salida, duración, traslado incluido y guía en portugués" },
    ],
    dictation: "O Bosque de Arrayanes é o maior do mundo, com árvores de casca cor de laranja que inspiraram o filme Bambi. O passeio de barco dura uma hora.",
  },
  {
    id: "circuito-chico", title: "Circuito Chico y Villa La Angostura", level: "Intermedio", category: "Excursiones", emoji: "🚗",
    description: "Cómo describir el Circuito Chico y los atractivos de la región en portugués.",
    readingTitle: "La ruta que enamora",
    reading: [
      "El Circuito Chico es uno de los recorridos panorámicos más famosos de la Patagonia. Desde Villa La Angostura, recorre aproximadamente setenta kilómetros por caminos que alternan vista al lago, bosques nativos de araucarias y miradores panorámicos. Para el turista brasileño es frecuentemente el primer contacto visual con la Patagonia andina.",
      "'O Circuito Chico é um passeio panorâmico de aproximadamente três horas que percorre os arredores de Villa La Angostura. O senhor vai passar por mirantes com vistas do Lago Nahuel Huapi e da Cordilheira dos Andes, atravessar bosques nativos de araucárias centenárias e chegar a pequenos portos pesqueiros com encanto único.'",
      "Los miradores más importantes: el Mirador Belvedere con vista a la Villa y al lago, la Bahía Mansa con aguas tranquilas ideales para fotografiar, y el Puerto Manzano con restaurantes frente al lago. Estos puntos específicos dan concreción a la recomendación.",
      "Las opciones logísticas: 'O senhor prefere fazer o circuito de carro com roteiro independente ou com guia local que vai contar a história e a ecologia de cada ponto? Com guia, a experiência é muito mais rica.' Esta pregunta orienta al huésped y puede aumentar el valor de la excursión.",
      "Villa La Angostura como destino: 'Villa La Angostura é um dos povoados mais charmosos da Patagônia. O centro comercial tem ótimas lojas de artesanato local, chocolates artesanais e restaurantes com vista para o lago. Uma hora de caminhada pela vila completa perfeitamente o circuito.'",
    ],
    vocab: [
      { es: "circuito / recorrido panorámico", pt: "circuito / passeio panorâmico" },
      { es: "mirador / punto panorámico", pt: "mirante / ponto panorâmico" },
      { es: "araucaria / bosque nativo", pt: "araucária / floresta nativa" },
      { es: "puerto lacustre / bahía", pt: "porto lacustre / baía" },
      { es: "artesanía / chocolates artesanales", pt: "artesanato / chocolates artesanais" },
      { es: "guía local", pt: "guia local" },
    ],
    quiz: [
      { question: "¿Cuántos kilómetros tiene el Circuito Chico?", options: ["30 km", "70 km", "150 km", "200 km"], answer: "70 km" },
      { question: "¿Cómo se dice 'mirador'?", options: ["Mirador", "Mirante / ponto panorâmico", "Vista panorámica", "Balcón natural"], answer: "Mirante / ponto panorâmico" },
      { question: "¿Cómo se dice 'circuito panorámico'?", options: ["Tour panorámico", "Circuito / passeio panorâmico", "Ruta turística", "Viagem panorâmica"], answer: "Circuito / passeio panorâmico" },
      { question: "¿Cuánto dura el Circuito Chico?", options: ["Una hora", "Tres horas aproximadamente", "Todo el día", "Media hora"], answer: "Tres horas aproximadamente" },
      { question: "¿Cómo se dice 'artesanía local'?", options: ["Arte local", "Artesanato local", "Handicraft", "Productos regionales"], answer: "Artesanato local" },
      { question: "¿Qué opción agrega más valor al Circuito Chico?", options: ["Hacerlo solo en auto", "Con guía local que cuenta la historia y ecología de cada punto", "En bicicleta", "Con mapa del hotel"], answer: "Con guía local que cuenta la historia y ecología de cada punto" },
      { question: "¿Cómo se dice 'chocolates artesanales'?", options: ["Chocolates caseros", "Chocolates artesanais", "Chocolates locales", "Doces regionais"], answer: "Chocolates artesanais" },
      { question: "¿Cómo se dice 'guía local'?", options: ["Guía turístico", "Guia local", "Acompañante regional", "Monitor local"], answer: "Guia local" },
    ],
    dictation: "O Circuito Chico é um passeio panorâmico de três horas com mirantes do Lago Nahuel Huapi e bosques nativos de araucárias centenárias.",
  },
  {
    id: "cerro-bayo", title: "Cerro Bayo: ski e invierno", level: "Intermedio", category: "Excursiones", emoji: "⛷️",
    description: "Cómo describir y recomendar el Cerro Bayo y sus actividades invernales.",
    readingTitle: "La montaña blanca",
    reading: [
      "El Cerro Bayo es el centro de ski más cercano a Villa La Angostura, a solo doce kilómetros del hotel. Con vista al Lago Nahuel Huapi desde sus pistas y con una atmósfera íntima y familiar, es una experiencia de invierno patagónico de primer nivel. Para el turista brasileño, muchos de los cuales nunca han esquiado, puede ser transformadora.",
      "'O Cerro Bayo fica a doze quilômetros do hotel, uma das vantagens de se hospedar no Marinas. O centro tem trinta e seis pistas para todos os níveis, desde iniciantes até avançados. A altitude máxima é de mil oitocentos metros e o mirante no topo oferece uma vista de trezentos e sessenta graus sobre o lago e a cordilheira.'",
      "Para quien no esquía: 'Para quem não pratica esqui, o centro oferece passeios de snowboard, trenós, passeios de snowmobile e um restaurante panorâmico no topo da montanha. A simples subida no teleférico já vale a visita pela vista.' Estas alternativas amplían el atractivo a todos los perfiles.",
      "Las clases para principiantes: 'Para quem quer experimentar o esqui pela primeira vez, oferecemos pacotes de aulas com instrutores certificados que falam português. A primeira aula dura duas horas e inclui equipamento completo. Muitos de nossos hóspedes brasileiros se apaixonam pelo esqui depois da primeira aula.'",
      "La logística práctica: 'O hotel oferece transfer para o Cerro Bayo todos os dias às oito e meia da manhã, com retorno às dezesseis horas. O aluguel de equipamentos está disponível no centro. Posso reservar o transfer e as aulas para o senhor?'",
    ],
    vocab: [
      { es: "pista de ski / snowboard", pt: "pista de esqui / snowboard" },
      { es: "teleférico / telesilla", pt: "teleférico" },
      { es: "clase de esqui / instructor", pt: "aula de esqui / instrutor" },
      { es: "alquiler de equipos", pt: "aluguel de equipamentos" },
      { es: "nivel principiante / avanzado", pt: "nível iniciante / avançado" },
      { es: "traslado al cerro", pt: "translado ao cerro / transfer" },
    ],
    quiz: [
      { question: "¿A qué distancia del hotel está el Cerro Bayo?", options: ["30 km", "12 km", "5 km", "50 km"], answer: "12 km" },
      { question: "¿Cuántas pistas tiene el Cerro Bayo?", options: ["10 pistas", "36 pistas para todos los niveles", "100 pistas", "Solo 5 pistas"], answer: "36 pistas para todos los niveles" },
      { question: "¿Cómo se dice 'clase de esqui'?", options: ["Clase de ski", "Aula de esqui", "Lección de nieve", "Corso de ski"], answer: "Aula de esqui" },
      { question: "¿Qué alternativa tiene quien no quiere esquiar?", options: ["No tiene nada que hacer", "Snowboard, trineos, snowmobile y restaurante panorámico en la cima", "Solo puede ver desde abajo", "Solo el restaurante en la base"], answer: "Snowboard, trineos, snowmobile y restaurante panorámico en la cima" },
      { question: "¿Cómo se dice 'alquiler de equipos'?", options: ["Renta de equipos", "Aluguel de equipamentos", "Préstamo de material", "Locação de ski"], answer: "Aluguel de equipamentos" },
      { question: "¿Cómo se dice 'nivel principiante'?", options: ["Nivel básico", "Nível iniciante", "Nivel cero", "Primer nivel"], answer: "Nível iniciante" },
      { question: "¿Qué argumento elimina la barrera de idioma para las clases?", options: ["Que son gratuitas", "Que los instructores certificados hablan portugués", "Que el cerro es muy fácil", "Que los carteles son en portugués"], answer: "Que los instructores certificados hablan portugués" },
      { question: "¿Cómo se dice 'traslado al cerro'?", options: ["Viaje a la montaña", "Translado ao cerro / transfer", "Transporte al ski", "Subida al cerro"], answer: "Translado ao cerro / transfer" },
    ],
    dictation: "O Cerro Bayo fica a doze quilômetros do hotel e tem trinta e seis pistas para todos os níveis. Posso reservar o transfer e as aulas em português?",
  },
  {
    id: "lago-actividades", title: "Lago Nahuel Huapi y paseos náuticos", level: "Básico", category: "Excursiones", emoji: "⛵",
    description: "Cómo describir los paseos en el lago y las actividades acuáticas en portugués.",
    readingTitle: "El lago que conquista",
    reading: [
      "El Lago Nahuel Huapi es el corazón natural de Villa La Angostura. Sus aguas azul profundo, enmarcadas por montañas nevadas y bosques nativos, ofrecen un escenario que pocos turistas contemplan sin emoción. Para el turista brasileño acostumbrado al mar y a los lagos tropicales, la transparencia y temperatura del agua patagónica son una sorpresa.",
      "'O Lago Nahuel Huapi tem duzentos e cinquenta e seis quilômetros quadrados de extensão. A água é cristalina e tem uma cor azul profunda única, resultado da pureza glacial e da altitude. No verão, a temperatura permite banho, embora fresca: entre dezesseis e dezoito graus.'",
      "Los paseos náuticos disponibles: paseo en catamarán al Bosque de Arrayanes, alquiler de kayak para explorar independientemente la costa, paseos en lancha a motor con guía para miradores lacustres, y pesca deportiva con mosca. 'Há opções para todos os gostos e níveis de atividade física.'",
      "El atardecer en el lago es especialmente recomendable: 'O pôr do sol sobre o Lago Nahuel Huapi é um dos espetáculos naturais mais bonitos da Patagônia. Podemos organizar um passeio de barco ao entardecer com champagne e queijos da região. É uma experiência romântica que nossos hóspedes adoram.'",
      "La pesca con mosca: 'Villa La Angostura é um dos destinos de pesca com mosca mais procurados do mundo. Os rios da região têm trutas de tamanho excepcional. Trabalhamos com guias certificados que organizam saídas de meio dia ou dia inteiro, com todo o equipamento incluído.'",
    ],
    vocab: [
      { es: "lago / costa / ribera", pt: "lago / costa / margem" },
      { es: "paseo en catamarán / lancha", pt: "passeio de catamarã / lancha" },
      { es: "kayak", pt: "caiaque" },
      { es: "pesca con mosca", pt: "pesca com mosca" },
      { es: "atardecer / amanecer", pt: "pôr do sol / amanhecer" },
      { es: "aguas cristalinas", pt: "águas cristalinas" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'aguas cristalinas'?", options: ["Agua clara", "Águas cristalinas", "Água transparente", "Agua pura"], answer: "Águas cristalinas" },
      { question: "¿Cómo se dice 'paseo en lancha'?", options: ["Viaje en barco", "Passeio de lancha", "Tour acuático", "Excursión en bote"], answer: "Passeio de lancha" },
      { question: "¿Cómo se dice 'atardecer'?", options: ["Tarde", "Pôr do sol", "Fin del día", "Crepúsculo"], answer: "Pôr do sol" },
      { question: "¿Cómo se dice 'kayak' en portugués?", options: ["Kayak igual", "Caiaque", "Bote de remo", "Canoa"], answer: "Caiaque" },
      { question: "¿Cómo se dice 'pesca con mosca'?", options: ["Pesca especial", "Pesca com mosca", "Fly fishing", "Pesca de trucha"], answer: "Pesca com mosca" },
      { question: "¿Cuál es la temperatura del agua en verano?", options: ["30 grados como el mar", "Entre 16 y 18 grados, fresca pero bañable", "Menos de 10 grados siempre", "25 grados en temporada alta"], answer: "Entre 16 y 18 grados, fresca pero bañable" },
      { question: "¿Cómo se dice 'amanecer'?", options: ["Mañana temprana", "Amanhecer", "Alba", "Madrugada"], answer: "Amanhecer" },
      { question: "¿Cómo se dice 'paseo en catamarán'?", options: ["Viaje en barco grande", "Passeio de catamarã", "Tour en velero", "Excursión náutica"], answer: "Passeio de catamarã" },
    ],
    dictation: "O Lago Nahuel Huapi tem águas cristalinas de cor azul profunda. O pôr do sol sobre o lago é um dos espetáculos mais bonitos da Patagônia.",
  },
  // ══ COMUNICACIÓN ESCRITA ══
  {
    id: "correo-formal", title: "Correo formal en portugués", level: "Intermedio", category: "Comunicación Escrita", emoji: "✉️",
    description: "Estructura y redacción de correos formales en portugués para el hotel.",
    readingTitle: "El correo que genera confianza",
    reading: [
      "La comunicación escrita en portugués con los huéspedes brasileños es una competencia clave para el equipo del hotel. Un correo bien redactado genera confianza antes de la llegada, clarifica expectativas y reduce preguntas durante la estadía. Un correo mal redactado puede generar confusión o una impresión negativa antes de que el huésped llegue.",
      "La estructura de un correo formal en portugués: asunto claro y descriptivo, saludo formal con el nombre del destinatario ('Prezado senhor Oliveira,' o 'Cara senhora Mendes,'), cuerpo organizado en párrafos cortos, y cierre cordial ('Atenciosamente,' o 'Com os nossos melhores cumprimentos,'). Esta estructura refleja profesionalismo.",
      "El correo de confirmación de reserva es el más frecuente: 'Prezado senhor Oliveira, confirmamos com prazer a sua reserva no Hotel Marinas Alto Manzano. A seguir, os detalhes da sua reserva:' seguido de los datos organizados. Al final: 'Ficamos à disposição para qualquer dúvida. Esperamos recebê-lo em breve.'",
      "El correo previo a la llegada es una oportunidad de construir relación y generar expectativa: 'Faltam apenas três dias para a sua chegada ao Marinas. Estamos preparando tudo para que a sua estadia seja perfeita. O tempo em Villa La Angostura esta semana está previsto para...' Esta comunicación proactiva es muy valorada.",
      "El correo de respuesta a consultas debe ser completo pero conciso. Responder todas las preguntas del huésped en un solo correo evita intercambios innecesarios. 'Em resposta à sua consulta, informamos que:' seguido de respuestas numeradas o en bullets. Cerrar siempre con oferta de ayuda adicional: 'Qualquer outra dúvida, estamos à disposição.'",
    ],
    vocab: [
      { es: "estimado / querido", pt: "prezado / caro" },
      { es: "confirmamos con placer", pt: "confirmamos com prazer" },
      { es: "atentamente / con los mejores saludos", pt: "atenciosamente / com os nossos melhores cumprimentos" },
      { es: "quedamos a disposición", pt: "ficamos à disposição" },
      { es: "esperamos recibirlo pronto", pt: "esperamos recebê-lo em breve" },
      { es: "en respuesta a su consulta", pt: "em resposta à sua consulta" },
    ],
    quiz: [
      { question: "¿Cómo se saluda formalmente al inicio de un correo en portugués?", options: ["Hola señor", "Prezado senhor Oliveira, / Cara senhora Mendes,", "Estimado señor", "Bom dia,"], answer: "Prezado senhor Oliveira, / Cara senhora Mendes," },
      { question: "¿Cómo se dice 'confirmamos con placer'?", options: ["Confirmamos felizmente", "Confirmamos com prazer", "Estamos confirmando", "Con gusto confirmamos"], answer: "Confirmamos com prazer" },
      { question: "¿Cómo se dice 'atentamente' en cierre de correo?", options: ["Con cariño", "Atenciosamente", "Saludos cordiales", "Con respeto"], answer: "Atenciosamente" },
      { question: "¿Cómo se dice 'quedamos a disposición'?", options: ["Estamos disponibles", "Ficamos à disposição", "Estamos aquí", "Para lo que necesite"], answer: "Ficamos à disposição" },
      { question: "¿Cómo se dice 'en respuesta a su consulta'?", options: ["Respondiendo su pregunta", "Em resposta à sua consulta", "Aquí está la respuesta", "Sobre su consulta"], answer: "Em resposta à sua consulta" },
      { question: "¿Qué estructura debe tener un correo formal en portugués?", options: ["Solo el cuerpo del mensaje", "Asunto claro, saludo con nombre, cuerpo en párrafos cortos y cierre cordial", "Solo saludo y despedida", "Solo la información esencial sin formato"], answer: "Asunto claro, saludo con nombre, cuerpo en párrafos cortos y cierre cordial" },
      { question: "¿Cómo se dice 'esperamos recibirlo pronto'?", options: ["Hasta pronto", "Esperamos recebê-lo em breve", "Nos veremos", "Lo esperamos"], answer: "Esperamos recebê-lo em breve" },
      { question: "¿Qué ventaja tiene responder todas las preguntas en un solo correo?", options: ["El correo queda más largo", "Evita intercambios innecesarios y genera percepción de eficiencia", "Solo por comodidad del equipo", "No tiene ventaja particular"], answer: "Evita intercambios innecesarios y genera percepción de eficiencia" },
    ],
    dictation: "Prezado senhor Oliveira, confirmamos com prazer a sua reserva. Ficamos à disposição para qualquer dúvida. Esperamos recebê-lo em breve.",
  },
  {
    id: "mensaje-previa-llegada", title: "Mensaje previo a la llegada", level: "Básico", category: "Comunicación Escrita", emoji: "📲",
    description: "Cómo redactar mensajes de bienvenida anticipada y comunicaciones pre-estadía.",
    readingTitle: "El primer contacto antes de llegar",
    reading: [
      "El mensaje previo a la llegada es una oportunidad de oro para generar expectativa positiva y de construir relación antes de que el huésped cruce la puerta del hotel. Un mensaje bien redactado en portugués transforma la espera del viaje en anticipación y comunica que el hotel ya está pensando en ese huésped específico.",
      "El mensaje debe ser cálido pero profesional: 'Bom dia, senhor Ferreira! Faltam apenas dois dias para a sua chegada ao Hotel Marinas Alto Manzano. Toda a nossa equipe está ansiosa para recebê-lo. Preparamos a sua suíte lago com todos os detalhes.' El uso del nombre del huésped y la referencia a su categoría específica comunican personalización.",
      "Incluir información práctica útil agrega valor: 'Para facilitar a sua chegada: o check-in é a partir das quatorze horas, mas caso o senhor chegue antes, podemos guardar a sua bagagem e o senhor pode usar as áreas comuns do hotel. Para chegar ao hotel saindo de Bariloche, siga pela Ruta 231 em direção a Villa La Angostura, são aproximadamente oitenta quilômetros.'",
      "Anticipar el clima es una información muy valorada para viajeros que vienen a hacer actividades: 'O tempo esta semana na região está previsto com sol e temperaturas entre doze e dezoito graus durante o dia. Ideal para trilhas e passeios ao lago. Se o senhor tiver interesse, posso pré-reservar algumas atividades para os dias da sua estadia.'",
      "Cerrar con una invitación al contacto: 'Qualquer dúvida ou pedido especial, pode responder diretamente a este mensagem ou ligar para nosso número de WhatsApp disponível vinte e quatro horas. Até em breve, senhor Ferreira!' Este cierre cálido y con canal de contacto claro reduce la ansiedad del viajero.",
    ],
    vocab: [
      { es: "mensaje previo a la llegada", pt: "mensagem de pré-chegada" },
      { es: "falta / faltan X días", pt: "falta / faltam X dias" },
      { es: "toda la equipa / todo el equipo", pt: "toda a equipe" },
      { es: "guardar el equipaje", pt: "guardar a bagagem" },
      { es: "condiciones climáticas", pt: "condições climáticas / tempo" },
      { es: "hasta pronto", pt: "até em breve" },
    ],
    quiz: [
      { question: "¿Cuál es el objetivo del mensaje previo a la llegada?", options: ["Recordar al huésped que tiene una reserva", "Generar expectativa positiva y construir relación antes de la llegada", "Confirmar el método de pago", "Solicitar documentos anticipadamente"], answer: "Generar expectativa positiva y construir relación antes de la llegada" },
      { question: "¿Cómo se dice 'faltan dos días para su llegada'?", options: ["Dos días para llegar", "Faltam apenas dois dias para a sua chegada", "En dos días llegará", "Pronto llega al hotel"], answer: "Faltam apenas dois dias para a sua chegada" },
      { question: "¿Cómo se dice 'toda la equipa / todo el equipo'?", options: ["Todo el personal", "Toda a equipe", "Todos los colaboradores", "El personal completo"], answer: "Toda a equipe" },
      { question: "¿Cómo se dice 'guardar el equipaje'?", options: ["Dejar las maletas", "Guardar a bagagem", "Poner las valijas", "Almacenar el equipaje"], answer: "Guardar a bagagem" },
      { question: "¿Por qué anticipar el clima es información valiosa?", options: ["Solo para cumplir el protocolo", "Porque permite al huésped planificar su equipaje y actividades antes de llegar", "Solo en invierno", "Solo para huéspedes que hacen deportes"], answer: "Porque permite al huésped planificar su equipaje y actividades antes de llegar" },
      { question: "¿Cómo se dice 'hasta pronto'?", options: ["Hasta luego", "Até em breve", "Nos vemos", "Tchau"], answer: "Até em breve" },
      { question: "¿Qué hace más efectivo un mensaje previo a la llegada?", options: ["Ser muy largo y detallado", "Usar el nombre del huésped y referencia a su categoría específica", "Incluir todos los precios de los servicios", "Ser lo más breve posible"], answer: "Usar el nombre del huésped y referencia a su categoría específica" },
      { question: "¿Cómo se dice 'condiciones del tiempo'?", options: ["Estado del clima", "Condições climáticas / tempo", "Previsão do tempo", "Situación metereológica"], answer: "Condições climáticas / tempo" },
    ],
    dictation: "Bom dia, senhor Ferreira! Faltam apenas dois dias para a sua chegada ao Marinas. Toda a nossa equipe está ansiosa para recebê-lo.",
  },
  // ══ SITUACIONES DIFÍCILES ══
  {
    id: "gestion-reclamos", title: "Gestión de reclamos presenciales", level: "Avanzado", category: "Situaciones Difíciles", emoji: "🚨",
    description: "Cómo manejar quejas y reclamos del huésped brasileño con empatía y solución.",
    readingTitle: "El momento de verdad",
    reading: [
      "La gestión de reclamos es el momento de verdad del servicio de excelencia. Un reclamo mal manejado puede arruinar una estadía hasta ese momento perfecta y generar una reseña negativa viral. Un reclamo bien manejado puede convertirse en la razón por la que el huésped regresa y lo recomienda. La diferencia está en la actitud y en las palabras que se usan.",
      "El protocolo estándar de gestión de reclamos tiene cuatro pasos. Primero, escuchar sin interrumpir: 'Entendo, senhor. Pode me contar com mais detalhes o que aconteceu?' Segundo, validar la emoción sin confirmar el error: 'Compreendo como isso pode ter sido frustrante.' Tercero, tomar responsabilidad: 'Em nome do hotel, peço desculpas pelo inconveniente.' Cuarto, proponer una solución concreta.",
      "La propuesta de solución debe ser específica y con tiempo definido: 'Vou resolver isso imediatamente. Em vinte minutos, um técnico vai ao seu quarto para corrigir o problema. O senhor pode aguardar no lobby enquanto isso? Vou servir um café ou algo de sua preferência.' Esta propuesta mueve la conversación del problema a la solución.",
      "Los errores más frecuentes en la gestión de reclamos son: interrumpir al huésped antes de que termine de explicar, ponerse defensivo y justificar el error, prometer soluciones que no se pueden cumplir, y no hacer seguimiento después de resolver el problema. 'Quero me certificar de que o problema foi resolvido de forma satisfatória. O senhor está confortável agora?'",
      "El cierre del reclamo debe incluir un gesto de compensación proporcional: 'Como demonstração do nosso compromisso com a sua satisfação, gostaríamos de oferecer um jantar no restaurante por conta do hotel esta noite.' Este gesto no necesita ser costoso pero debe ser proporcional al inconveniente y comunicarse con genuina calidez.",
    ],
    vocab: [
      { es: "reclamo / queja", pt: "reclamação / queixa" },
      { es: "pido disculpas / lo siento", pt: "peço desculpas / sinto muito" },
      { es: "entiendo / comprendo", pt: "entendo / compreendo" },
      { es: "voy a resolverlo inmediatamente", pt: "vou resolver isso imediatamente" },
      { es: "compensación / gesto de cortesía", pt: "compensação / gesto de cortesia" },
      { es: "¿está cómodo ahora?", pt: "o senhor está confortável agora?" },
    ],
    quiz: [
      { question: "¿Cuál es el primer paso al recibir un reclamo?", options: ["Justificar el error", "Escuchar sin interrumpir, invitando al huésped a contar con detalle", "Proponer una solución inmediatamente", "Llamar al supervisor"], answer: "Escuchar sin interrumpir, invitando al huésped a contar con detalle" },
      { question: "¿Cómo se dice 'pido disculpas' en portugués?", options: ["Lo siento", "Peço desculpas", "Perdón", "Me desculpe"], answer: "Peço desculpas" },
      { question: "¿Cómo se dice 'entiendo / comprendo'?", options: ["Claro", "Entendo / compreendo", "Sé lo que pasó", "Está bien"], answer: "Entendo / compreendo" },
      { question: "¿Cómo se dice 'voy a resolverlo inmediatamente'?", options: ["Voy a ver qué pasó", "Vou resolver isso imediatamente", "Vamos a arreglarlo", "Llamamos al técnico"], answer: "Vou resolver isso imediatamente" },
      { question: "¿Qué error frecuente debe evitarse en la gestión de reclamos?", options: ["Escuchar demasiado al huésped", "Ponerse defensivo y justificar el error", "Proponer una compensación", "Llamar al supervisor"], answer: "Ponerse defensivo y justificar el error" },
      { question: "¿Qué debe incluir la propuesta de solución?", options: ["Solo la disculpa", "Solución específica con tiempo definido y seguimiento", "Solo el tiempo estimado", "Solo la compensación económica"], answer: "Solución específica con tiempo definido y seguimiento" },
      { question: "¿Cómo se hace el seguimiento después de resolver el problema?", options: ["No es necesario si el problema fue resuelto", "Preguntando al huésped si está cómodo y si el problema fue resuelto satisfactoriamente", "Solo si el huésped lo solicita", "Al momento del check-out"], answer: "Preguntando al huésped si está cómodo y si el problema fue resuelto satisfactoriamente" },
      { question: "¿Qué convierte un reclamo en una oportunidad?", options: ["Que el error sea pequeño", "Una gestión empática, rápida y con solución concreta que puede generar más fidelidad que si no hubiera ocurrido el problema", "Ofrecer siempre una noche gratis", "Que el huésped sea frecuente"], answer: "Una gestión empática, rápida y con solución concreta que puede generar más fidelidad que si no hubiera ocurrido el problema" },
    ],
    dictation: "Entendo, senhor. Peço desculpas pelo inconveniente. Vou resolver isso imediatamente. Em vinte minutos, um técnico vai ao seu quarto.",
  },
  {
    id: "problemas-habitacion", title: "Problemas técnicos en la habitación", level: "Intermedio", category: "Situaciones Difíciles", emoji: "🔧",
    description: "Cómo gestionar problemas técnicos en la habitación comunicándolos en portugués.",
    readingTitle: "Cuando algo no funciona",
    reading: [
      "Los problemas técnicos en la habitación son una de las situaciones más frecuentes en hotelería: calefacción que no funciona, internet lento, televisión sin señal, jacuzzi que no calienta, falta de agua caliente. Cada uno de estos problemas tiene su propio protocolo de comunicación y su propio vocabulario en portugués.",
      "Cuando el huésped llama a reportar un problema técnico, la respuesta debe ser inmediata y empática: 'Entendo, senhor. Lamento pelo inconveniente. Vou enviar nossa equipe de manutenção imediatamente. Em quanto tempo o senhor vai estar no quarto?' Este cierre con pregunta sobre disponibilidad del huésped coordina la solución de forma eficiente.",
      "El vocabulario técnico de la habitación en portugués: 'aquecimento' (calefacción), 'ar-condicionado' (aire acondicionado), 'televisão' (televisión), 'internet / wifi' (internet / wifi), 'chuveiro' (ducha), 'agua quente' (agua caliente), 'luz / iluminação' (luz / iluminación), 'fechadura' (cerradura), 'janela' (ventana).",
      "Si el problema no puede resolverse de inmediato y el huésped está incómodo, la mejor solución es ofrecer una reubicación temporal o definitiva: 'Senhor, infelizmente a manutenção vai demorar algumas horas para resolver o problema. Temos uma suíte disponível de mesma categoria. Gostaria de se mudar temporariamente enquanto resolvemos?' Esta proactividad convierte un problema en un servicio.",
      "El seguimiento después de la reparación es fundamental: 'Gostaria de confirmar que o problema no aquecimento do seu quarto foi resolvido. A equipe de manutenção verificou e está tudo funcionando normalmente. O senhor pode confirmar se está confortável?' Esta llamada de seguimiento transmite que el hotel se preocupa por la comodidad del huésped incluso después de resolver el problema.",
    ],
    vocab: [
      { es: "calefacción / aire acondicionado", pt: "aquecimento / ar-condicionado" },
      { es: "ducha / agua caliente", pt: "chuveiro / água quente" },
      { es: "internet / wifi", pt: "internet / wifi" },
      { es: "televisión", pt: "televisão" },
      { es: "cerradura / llave", pt: "fechadura / chave" },
      { es: "mantenimiento", pt: "manutenção" },
    ],
    quiz: [
      { question: "¿Cómo responder cuando el huésped llama a reportar un problema técnico?", options: ["Decir que se enviará alguien después", "Responder con empatía inmediata y preguntar cuándo estará disponible para la visita del técnico", "Pedir que espere hasta el día siguiente", "Explicar que no es un problema grave"], answer: "Responder con empatía inmediata y preguntar cuándo estará disponible para la visita del técnico" },
      { question: "¿Cómo se dice 'calefacción' en portugués?", options: ["Calefacción", "Aquecimento", "Calor central", "Sistema de calor"], answer: "Aquecimento" },
      { question: "¿Cómo se dice 'ducha' en portugués?", options: ["Ducha", "Chuveiro", "Regadera", "Duche"], answer: "Chuveiro" },
      { question: "¿Cómo se dice 'mantenimiento' en portugués?", options: ["Mantenimiento igual", "Manutenção", "Reparaciones", "Técnicos"], answer: "Manutenção" },
      { question: "¿Qué ofrecer si el problema no puede resolverse rápidamente?", options: ["Pedir al huésped que espere", "Ofrecer proactivamente una reubicación temporal a habitación de misma categoría", "Solo disculparse repetidamente", "Esperar que el huésped lo solicite"], answer: "Ofrecer proactivamente una reubicación temporal a habitación de misma categoría" },
      { question: "¿Cómo se dice 'cerradura' en portugués?", options: ["Llave", "Fechadura", "Cierre", "Tranca"], answer: "Fechadura" },
      { question: "¿Cómo se dice 'televisión' en portugués?", options: ["Televisión", "Televisão", "TV set", "Monitor"], answer: "Televisão" },
      { question: "¿Por qué es importante el seguimiento después de resolver un problema técnico?", options: ["Solo por protocolo", "Transmite que el hotel se preocupa por la comodidad incluso después de resolver el problema", "Solo si el huésped lo solicita", "Solo en problemas graves"], answer: "Transmite que el hotel se preocupa por la comodidad incluso después de resolver el problema" },
    ],
    dictation: "Entendo, senhor. Lamento pelo inconveniente com o aquecimento. Vou enviar a manutenção imediatamente. Em quanto tempo o senhor vai estar no quarto?",
  },
  {
    id: "situaciones-emergencia", title: "Situaciones médicas y emergencias", level: "Avanzado", category: "Situaciones Difíciles", emoji: "🏥",
    description: "Vocabulario y protocolos para gestionar emergencias y situaciones médicas en portugués.",
    readingTitle: "Cuando el tiempo importa",
    reading: [
      "Las situaciones de emergencia en el hotel, aunque poco frecuentes, requieren preparación específica. El colaborador que enfrenta una emergencia médica con un huésped brasileño necesita poder comunicarse con claridad en portugués, coordinar la ayuda necesaria y mantener la calma transmitiendo seguridad al huésped y a su acompañante.",
      "El vocabulario médico de emergencia más importante: 'médico' (médico), 'ambulância' (ambulancia), 'hospital' (hospital), 'dor' (dolor), 'tontura' (mareo), 'febre' (fiebre), 'alergia' (alergia), 'medicamento' (medicamento), 'seguro de saúde' (seguro médico). Estas palabras pueden ser literalmente vitales en una situación de emergencia.",
      "La secuencia de respuesta ante una emergencia médica: primero, llamar al número de emergencias (107 en Argentina) o coordinar el traslado al hospital más cercano. Segundo, comunicarlo al supervisor y al huésped: 'Estou chamando uma ambulância agora mesmo. Por favor, fique calmo/a. Alguém da equipe vai ficar com o senhor até chegarem.' Tercero, acompañar al huésped o coordinar quién lo hace.",
      "Para situaciones de menor urgencia como mareos o fiebre, el hotel debe tener un protocolo básico: 'O senhor está se sentindo bem? Posso trazer algum medicamento da nossa farmacinha ou prefere que chamemos um médico? Temos convênio com um médico local que pode vir ao hotel.' Esta pregunta abierta da al huésped el control de la situación.",
      "La documentación post-emergencia es importante: registrar lo ocurrido, las acciones tomadas, el nombre del médico o ambulancia que atendió y el estado del huésped al momento del traslado o de la recuperación. Esta documentación protege al hotel y al huésped por igual y es especialmente importante cuando intervienen seguros de viaje internacionales.",
    ],
    vocab: [
      { es: "médico / ambulancia / hospital", pt: "médico / ambulância / hospital" },
      { es: "dolor / fiebre / mareo", pt: "dor / febre / tontura" },
      { es: "medicamento / farmacia", pt: "medicamento / farmácia" },
      { es: "seguro médico / de viaje", pt: "seguro de saúde / seguro viagem" },
      { es: "llame una ambulancia", pt: "chame uma ambulância" },
      { es: "quédese tranquilo/a", pt: "fique calmo/a" },
    ],
    quiz: [
      { question: "¿Cuál es el número de emergencias en Argentina?", options: ["911", "107", "100", "112"], answer: "107" },
      { question: "¿Cómo se dice 'ambulancia' en portugués?", options: ["Ambulancia", "Ambulância", "Vehículo de emergencia", "Autobús médico"], answer: "Ambulância" },
      { question: "¿Cómo se dice 'quédese tranquilo/a'?", options: ["Cálmese", "Fique calmo/a", "No se preocupe", "Respire"], answer: "Fique calmo/a" },
      { question: "¿Cómo se dice 'dolor' en portugués?", options: ["Dolor igual", "Dor", "Duele", "Mal"], answer: "Dor" },
      { question: "¿Cómo se dice 'fiebre'?", options: ["Fiebre igual", "Febre", "Calor corporal", "Temperatura"], answer: "Febre" },
      { question: "¿Cómo se dice 'medicamento'?", options: ["Medicina igual", "Medicamento", "Pastilla", "Remédio"], answer: "Medicamento" },
      { question: "¿Cómo se dice 'seguro de viaje'?", options: ["Seguro de turista", "Seguro viagem", "Cobertura de viaje", "Asistencia viajera"], answer: "Seguro viagem" },
      { question: "¿Por qué es importante documentar una emergencia?", options: ["Solo por protocolo burocrático", "Protege al hotel y al huésped, especialmente cuando intervienen seguros internacionales", "Solo si hubo error del hotel", "Solo si el huésped lo solicita"], answer: "Protege al hotel y al huésped, especialmente cuando intervienen seguros internacionales" },
    ],
    dictation: "Estou chamando uma ambulância agora mesmo. Por favor, fique calmo. Alguém da nossa equipe vai ficar com o senhor até chegarem.",
  },
  // ══ GRAMÁTICA HOTELERA ══
  {
    id: "senhor-senhora", title: "Senhor / Senhora: el tratamiento formal", level: "Básico", category: "Gramática Hotelera", emoji: "🎩",
    description: "Cómo usar correctamente los tratamientos formales en portugués hotelero.",
    readingTitle: "La forma que marca la diferencia",
    reading: [
      "El uso correcto del tratamiento formal en portugués es uno de los aspectos que más diferencia a un profesional hotelero preparado de uno que no lo está. En el portugués brasileño de alta gama, o senhor y a senhora son el estándar de cortesía para el primer contacto y para situaciones formales, equivalentes al usted argentino pero con una diferencia fundamental: el verbo va en tercera persona.",
      "La diferencia gramatical clave: en español decimos 'usted necesita algo?' con la misma conjugación que 'él necesita'. En portugués, el senhor usa la tercera persona: 'O senhor precisa de algo?' (literalmente: 'El señor precisa de algo?'). Esta construcción puede sentirse extraña al principio pero es la correcta y el huésped brasileño la espera y la aprecia.",
      "Las frases más frecuentes con o senhor / a senhora: 'O senhor tem uma reserva?' (¿Tiene usted una reserva?), 'A senhora prefere a suíte lago?' (¿Prefiere usted la suite lago?), 'O senhor pode me informar?' (¿Puede usted informarme?), 'A senhora está confortável?' (¿Está usted cómoda?). El verbo siempre en tercera persona singular.",
      "Cuando el huésped indica que prefiere un trato más cercano (ya sea por su tono o porque lo solicita explícitamente), se puede pasar a você: 'Claro, você prefere o chalé ou o loft?' Con você el verbo también va en tercera persona en el portugués brasileño estándar, aunque en el habla coloquial a veces se usa segunda persona.",
      "Los plurales: para un grupo o pareja se usa os senhores o as senhoras, o la forma mixta o senhor e a senhora para una pareja. 'Os senhores já decidiram o que vão pedir?' (¿Ustedes ya decidieron qué van a pedir?). En la práctica cotidiana del hotel, manejar estas formas con naturalidad transmite un nivel de preparación que el huésped brasileño distingue y valora.",
    ],
    vocab: [
      { es: "usted (formal masculino)", pt: "o senhor" },
      { es: "usted (formal femenino)", pt: "a senhora" },
      { es: "ustedes (grupo)", pt: "os senhores / as senhoras" },
      { es: "¿tiene usted...?", pt: "o senhor tem...?" },
      { es: "¿prefiere usted...?", pt: "o senhor / a senhora prefere...?" },
      { es: "¿está cómodo/a?", pt: "o senhor / a senhora está confortável?" },
    ],
    quiz: [
      { question: "¿Con qué persona del verbo se usa 'o senhor'?", options: ["Segunda persona como el vos", "Tercera persona singular", "Primera persona", "Segunda persona como el tú"], answer: "Tercera persona singular" },
      { question: "¿Cómo se dice '¿tiene usted una reserva?' en portugués?", options: ["Você tem uma reserva?", "O senhor tem uma reserva?", "Tem uma reserva?", "El señor tiene reserva?"], answer: "O senhor tem uma reserva?" },
      { question: "¿Cuándo se puede pasar de 'o senhor' a 'você'?", options: ["Nunca, siempre se usa o senhor", "Cuando el huésped indica que prefiere trato más cercano", "Después del check-in siempre", "Con huéspedes jóvenes siempre"], answer: "Cuando el huésped indica que prefiere trato más cercano" },
      { question: "¿Cómo se dice '¿prefiere usted la suite lago?' formalmente?", options: ["Você prefere a suíte lago?", "A senhora prefere a suíte lago?", "Prefere a suíte lago?", "Quer a suíte lago?"], answer: "A senhora prefere a suíte lago?" },
      { question: "¿Cómo se dirige a una pareja formalmente?", options: ["Vocês os dois", "O senhor e a senhora", "Os dois senhores", "Usted y usted"], answer: "O senhor e a senhora" },
      { question: "¿Cómo se dice '¿están cómodos?' para un grupo?", options: ["Vocês estão bem?", "Os senhores estão confortáveis?", "Tudo bem com vocês?", "Estão ok?"], answer: "Os senhores estão confortáveis?" },
      { question: "¿Cómo se dice '¿puede usted informarme?' en portugués formal?", options: ["Você pode me informar?", "O senhor pode me informar?", "Pode informar?", "Me conta?"], answer: "O senhor pode me informar?" },
      { question: "¿Qué transmite el uso correcto del tratamiento formal al huésped brasileño?", options: ["Que el colaborador es brasileño", "Un nivel de preparación y profesionalismo que el huésped distingue y valora", "Solo formalidad innecesaria", "Que el hotel es muy caro"], answer: "Un nivel de preparación y profesionalismo que el huésped distingue y valora" },
    ],
    dictation: "O senhor tem uma reserva conosco? A senhora prefere a mesa com vista para o lago? Os senhores estão confortáveis?",
  },
  {
    id: "frases-cortesia", title: "Frases de cortesía y cierre", level: "Básico", category: "Gramática Hotelera", emoji: "💬",
    description: "Las frases de cortesía más importantes del portugués hotelero para el trabajo diario.",
    readingTitle: "Las palabras que construyen la experiencia",
    reading: [
      "La cortesía en el portugués hotelero no es solo una cuestión de vocabulario: es una actitud que se expresa con palabras precisas en el momento correcto. Hay un conjunto de frases que el colaborador del hotel debe dominar hasta que salgan de forma natural, porque son las que más impactan en la percepción del servicio por parte del huésped brasileño.",
      "Las frases de apertura y disposición: 'Com muito prazer' (Con mucho gusto), 'Às suas ordens' (A sus órdenes), 'Fico feliz em ajudar' (Con gusto le ayudo), 'É um prazer recebê-lo' (Es un placer recibirlo), 'Estou à disposição para o que precisar' (Estoy a disposición para lo que necesite). Estas frases transmiten actitud de servicio genuina.",
      "Las frases de cortesía durante la interacción: 'Com certeza' (Por supuesto / Claro que sí), 'Claro, sem problema' (Claro, sin problema), 'Imediatamente' (Inmediatamente), 'Em um momento' (En un momento), 'Muito obrigado pela compreensão' (Muchas gracias por su comprensión). Cada una de estas frases suaviza la interacción.",
      "Las frases de disculpa y gestión de inconvenientes: 'Peço desculpas pelo inconveniente' (Pido disculpas por el inconveniente), 'Lamento muito' (Lo siento mucho), 'Vou resolver imediatamente' (Voy a resolver inmediatamente), 'Obrigado por nos avisar' (Gracias por avisarnos). La última frase transforma la queja en una contribución.",
      "Las frases de cierre y despedida: 'Foi um prazer atendê-lo' (Fue un placer atenderlo), 'Esperamos vê-lo em breve' (Esperamos verlo pronto), 'Boa viagem' (Buen viaje), 'Tenha um ótimo dia' (Que tenga un excelente día), 'Até a próxima' (Hasta la próxima). Estas frases de cierre son la última impresión y deben pronunciarse siempre con genuina calidez.",
    ],
    vocab: [
      { es: "con mucho gusto", pt: "com muito prazer" },
      { es: "por supuesto / claro", pt: "com certeza / claro" },
      { es: "pido disculpas por el inconveniente", pt: "peço desculpas pelo inconveniente" },
      { es: "fue un placer atenderlo", pt: "foi um prazer atendê-lo" },
      { es: "que tenga un excelente día", pt: "tenha um ótimo dia" },
      { es: "gracias por avisarnos", pt: "obrigado por nos avisar" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'con mucho gusto'?", options: ["Com gusto", "Com muito prazer", "De nada", "Tudo bem"], answer: "Com muito prazer" },
      { question: "¿Cómo se dice 'por supuesto / claro que sí'?", options: ["Sí, claro", "Com certeza / claro", "Okay", "Pode ser"], answer: "Com certeza / claro" },
      { question: "¿Cómo se dice 'pido disculpas por el inconveniente'?", options: ["Lo siento mucho", "Peço desculpas pelo inconveniente", "Perdón", "Me desculpe"], answer: "Peço desculpas pelo inconveniente" },
      { question: "¿Cómo se dice 'fue un placer atenderlo'?", options: ["Que bueno que vino", "Foi um prazer atendê-lo", "Gracias por venir", "Hasta luego"], answer: "Foi um prazer atendê-lo" },
      { question: "¿Cómo se dice 'que tenga un excelente día'?", options: ["Buen día", "Tenha um ótimo dia", "Que le vaya bien", "Hasta mañana"], answer: "Tenha um ótimo dia" },
      { question: "¿Por qué 'obrigado por nos avisar' es una frase poderosa ante una queja?", options: ["Solo es cortesía vacía", "Transforma la queja del huésped en una contribución valiosa al hotel", "Solo para hacer sentir mejor al huésped", "Es una obligación del protocolo"], answer: "Transforma la queja del huésped en una contribución valiosa al hotel" },
      { question: "¿Cómo se dice 'a sus órdenes'?", options: ["Para servirle", "Às suas ordens", "Estou aqui", "Com prazer"], answer: "Às suas ordens" },
      { question: "¿Cómo se dice 'inmediatamente'?", options: ["Pronto", "Imediatamente", "Ya mismo", "Ahora"], answer: "Imediatamente" },
    ],
    dictation: "Com muito prazer, senhora. Peço desculpas pelo inconveniente. Foi um prazer atendê-la. Tenha um ótimo dia e boa viagem!",
  },
  {
    id: "vocabulario-instalaciones", title: "Vocabulario de instalaciones del hotel", level: "Básico", category: "Gramática Hotelera", emoji: "🏊",
    description: "El vocabulario esencial para describir las instalaciones y servicios del hotel en portugués.",
    readingTitle: "Las palabras del hotel",
    reading: [
      "Para orientar al huésped dentro del hotel y describir sus instalaciones correctamente en portugués, el colaborador necesita dominar el vocabulario específico de cada área. Este vocabulario no es difícil para un hispanohablante porque muchas palabras son similares al español, pero hay diferencias importantes que conviene conocer.",
      "Las áreas comunes del hotel: 'recepção' (recepción), 'lobby / saguão' (lobby), 'restaurante' (restaurante), 'piscina' (piscina), 'academia' (gimnasio), 'spa' (spa), 'jardim' (jardín), 'estacionamento' (estacionamiento), 'lavanderia' (lavandería). Conocer estas palabras permite dar indicaciones precisas.",
      "Los servicios incluidos y adicionales: 'café da manhã incluído' (desayuno incluido), 'estacionamento gratuito' (estacionamiento gratuito), 'wifi gratuito' (wifi gratuito), 'serviço de quarto' (servicio a la habitación), 'lavanderia' (lavandería), 'traslado ao aeroporto' (traslado al aeropuerto). Comunicar con claridad qué está incluido y qué tiene cargo adicional evita malentendidos.",
      "Los equipos e instalaciones de la habitación: 'frigobar / minibar' (minibar), 'cofre de segurança' (caja de seguridad), 'secador de cabelo' (secador de pelo), 'roupão de banho' (bata de baño), 'chinelos' (pantuflas), 'amenities' (amenities), 'televisão a cabo' (televisión por cable), 'ar-condicionado' (aire acondicionado).",
      "Los horarios de servicio son información que el huésped necesita desde el primer momento: 'O café da manhã é servido das sete e meia às dez e meia. O restaurante abre para o jantar a partir das dezenove horas. A recepção funciona vinte e quatro horas. A piscina fica aberta das oito às vinte e duas horas. Para qualquer serviço fora desses horários, pode nos contactar pela recepção.'",
    ],
    vocab: [
      { es: "recepción / lobby", pt: "recepção / lobby / saguão" },
      { es: "gimnasio / piscina / spa", pt: "academia / piscina / spa" },
      { es: "estacionamiento", pt: "estacionamento" },
      { es: "minibar / caja de seguridad", pt: "frigobar / cofre de segurança" },
      { es: "bata de baño / pantuflas", pt: "roupão de banho / chinelos" },
      { es: "traslado al aeropuerto", pt: "traslado ao aeroporto" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'gimnasio' en portugués?", options: ["Gimnasio", "Academia", "Fitness", "Centro deportivo"], answer: "Academia" },
      { question: "¿Cómo se dice 'estacionamiento'?", options: ["Parking", "Estacionamento", "Garaje", "Cochera"], answer: "Estacionamento" },
      { question: "¿Cómo se dice 'caja de seguridad'?", options: ["Caja fuerte", "Cofre de segurança", "Cajita personal", "Safe"], answer: "Cofre de segurança" },
      { question: "¿Cómo se dice 'bata de baño'?", options: ["Bata hotelera", "Roupão de banho", "Toalla grande", "Ropa de baño"], answer: "Roupão de banho" },
      { question: "¿Cómo se dice 'pantuflas'?", options: ["Zapatillas", "Chinelos", "Slippers", "Sandalias"], answer: "Chinelos" },
      { question: "¿Cómo se dice 'lobby'?", options: ["Entrada", "Lobby / saguão", "Recibidor", "Hall"], answer: "Lobby / saguão" },
      { question: "¿Cómo se dice 'traslado al aeropuerto'?", options: ["Transporte al aero", "Traslado ao aeroporto", "Transfer aeroportuario", "Viaje al aeropuerto"], answer: "Traslado ao aeroporto" },
      { question: "¿Cómo se dice 'minibar' en portugués?", options: ["Minibar igual", "Frigobar", "Pequeña heladera", "Bar del cuarto"], answer: "Frigobar" },
    ],
    dictation: "A piscina fica no nível inferior, aberta das oito às vinte e duas horas. O estacionamento é gratuito para todos os hóspedes.",
  },
  {
    id: "numeros-fechas", title: "Números, fechas y precios en portugués", level: "Básico", category: "Gramática Hotelera", emoji: "🔢",
    description: "Cómo comunicar números, fechas, precios y horarios en portugués hotelero.",
    readingTitle: "Los números que importan",
    reading: [
      "Los números, fechas y precios son información crítica en hotelería: una fecha de reserva mal comunicada, un precio incomprendido o un horario confuso pueden generar problemas reales. En portugués, los números se pronuncian de forma similar al español pero con algunas diferencias que conviene conocer.",
      "Los números del 1 al 10 en portugués: um/uma (1), dois/duas (2), três (3), quatro (4), cinco (5), seis (6), sete (7), oito (8), nove (9), dez (10). Los números 11 al 20: onze, doze, treze, quatorze, quinze, dezesseis, dezessete, dezoito, dezenove, vinte. Las decenas: trinta (30), quarenta (40), cinquenta (50), sessenta (60), setenta (70), oitenta (80), noventa (90), cem/cento (100).",
      "Las fechas en portugués siguen el mismo orden que en español: día/mes/año. Los meses: janeiro, fevereiro, março, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro. Para decir una fecha: 'A sua reserva é para o dia vinte de julho' (Su reserva es para el veinte de julio). Sin artículo antes del número en la fecha hablada.",
      "Los horarios en portugués: 'às sete e meia' (a las siete y media), 'às nove horas' (a las nueve horas), 'ao meio-dia' (al mediodía), 'às catorze horas' (a las catorce horas), 'às dezoito e trinta' (a las dieciocho y treinta). En hotelería se usa formato de 24 horas en los horarios de servicio.",
      "Los precios en portugués siguen la misma lógica numérica. 'Trezentos pesos' (300 pesos), 'dois mil e quinhentos pesos' (2500 pesos), 'quinhentos dólares' (500 dólares). Siempre confirmar el precio en voz alta y pedir confirmación del huésped: 'O valor total é de oitocentos pesos por noite. Está de acordo?'",
    ],
    vocab: [
      { es: "los meses del año", pt: "janeiro, fevereiro, março, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro" },
      { es: "a las siete y media", pt: "às sete e meia" },
      { es: "mediodía / medianoche", pt: "meio-dia / meia-noite" },
      { es: "¿está de acuerdo con el precio?", pt: "está de acordo com o valor?" },
      { es: "el valor total es de...", pt: "o valor total é de..." },
      { es: "por noche / por persona", pt: "por noite / por pessoa" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'treinta' en portugués?", options: ["Treinta", "Trinta", "Trenta", "Treta"], answer: "Trinta" },
      { question: "¿Cómo se dice 'julio' en portugués?", options: ["Julio", "Julho", "Julhi", "Julío"], answer: "Julho" },
      { question: "¿Cómo se dice 'a las siete y media'?", options: ["A las siete treinta", "Às sete e meia", "Sete e trinta", "A las siete y media"], answer: "Às sete e meia" },
      { question: "¿Cómo se dice 'el valor total es de...'?", options: ["El precio es...", "O valor total é de...", "Le cobra...", "El costo es..."], answer: "O valor total é de..." },
      { question: "¿Cómo se dice 'por noche'?", options: ["Por noche igual", "Por noite", "Cada noche", "Per noite"], answer: "Por noite" },
      { question: "¿Cómo se dice 'mediodía'?", options: ["Medio día", "Meio-dia", "Doze horas", "Mitad del día"], answer: "Meio-dia" },
      { question: "¿Cómo se dice '¿está de acuerdo con el precio?'?", options: ["¿Le parece bien el precio?", "Está de acordo com o valor?", "¿Acepta el precio?", "¿El precio está bien?"], answer: "Está de acordo com o valor?" },
      { question: "¿Cómo se dice 'diciembre' en portugués?", options: ["Diciembre", "Dezembro", "Deciembre", "Dezembro"], answer: "Dezembro" },
    ],
    dictation: "A sua reserva é para o dia vinte de julho. O valor total é de oitocentos pesos por noite. Está de acordo com o valor?",
  },
  // ══ RECEPCIÓN adicional ══
  {
    id: "llegadas-tardias", title: "Llegadas tardías y early check-in", level: "Básico", category: "Recepción", emoji: "🌙",
    description: "Cómo gestionar llegadas fuera de horario y solicitudes de ingreso anticipado.",
    readingTitle: "Horarios que no siempre coinciden",
    reading: [
      "Las llegadas tardías y los early check-in son situaciones frecuentes. Un huésped que llega a las dos de la madrugada tiene necesidades muy diferentes a uno que llega a las tres de la tarde. La clave es tener un protocolo de guardia nocturna que garantice una recepción cálida independientemente de la hora.",
      "Si el hotel sabe que el huésped llega tarde, puede anticiparse: 'Boa noite, senhor Ferreira. Soubemos que o senhor chega em voo tardio. Nossa equipe estará aguardando até as três da manhã. Qualquer demora adicional, por favor nos avise.' Este mensaje transmite que el hotel está preparado.",
      "Cuando el huésped llega de madrugada, el proceso debe ser eficiente sin sacrificar la calidez: 'Bem-vindo, senhor. Sei que foi uma viagem longa. Vou fazer o seu check-in rapidamente para que o senhor possa descansar.' La brevedad y el énfasis en el descanso son las prioridades.",
      "Para el early check-in, si la habitación está disponible: 'Senhor, a sua suíte já está disponível. Com muito prazer, podemos fazer o check-in agora mesmo sem custo adicional.' Si no está disponible: guardar el equipaje, acceso a áreas comunes y notificación cuando esté lista.",
      "'Podemos guardar a sua bagagem com segurança e avisamos assim que o quarto estiver pronto. Enquanto isso, o senhor pode relaxar no lobby e tomar um café.' Este servicio simple resuelve una situación de estrés y es muy valorado.",
    ],
    vocab: [
      { es: "llegada tardía", pt: "chegada tardia" },
      { es: "guardar el equipaje", pt: "guardar a bagagem" },
      { es: "habitación disponible", pt: "quarto disponível / pronto" },
      { es: "sin cargo adicional", pt: "sem custo adicional" },
      { es: "avisamos cuando esté listo", pt: "avisamos assim que estiver pronto" },
      { es: "sabemos que llega en vuelo tardío", pt: "soubemos que chega em voo tardio" },
    ],
    quiz: [
      { question: "¿Cuál es la prioridad en el check-in de madrugada?", options: ["Completar todo el protocolo estándar", "Ser eficiente priorizando el descanso del huésped", "Hacer una bienvenida larga", "Explicar todas las instalaciones"], answer: "Ser eficiente priorizando el descanso del huésped" },
      { question: "¿Cómo se dice 'guardar el equipaje'?", options: ["Dejar las maletas", "Guardar a bagagem", "Poner las valijas", "Almacenar el equipaje"], answer: "Guardar a bagagem" },
      { question: "¿Cómo se ofrece el early check-in con habitación disponible?", options: ["Cobrar siempre media noche adicional", "Ofrecerlo sin cargo adicional como gesto de servicio", "Solo si el huésped lo pide insistentemente", "Siempre derivar al supervisor"], answer: "Ofrecerlo sin cargo adicional como gesto de servicio" },
      { question: "¿Qué alternativa se ofrece cuando la habitación no está lista?", options: ["Pedirle que vuelva en horario estándar", "Guardar el equipaje, acceso a áreas comunes y notificación cuando esté lista", "Solo esperar en el lobby sin servicio", "Cambiar la categoría de habitación"], answer: "Guardar el equipaje, acceso a áreas comunes y notificación cuando esté lista" },
      { question: "¿Cómo se dice 'sin cargo adicional'?", options: ["Grátis para você", "Sem custo adicional", "De graça", "Incluído no preço"], answer: "Sem custo adicional" },
      { question: "¿Cómo se dice 'habitación disponible / lista'?", options: ["Quarto livre", "Quarto disponível / pronto", "Habitação aberta", "Suite liberada"], answer: "Quarto disponível / pronto" },
      { question: "¿Por qué la comunicación previa ante llegadas tardías es importante?", options: ["Solo para organizar el turno", "Transmite que el hotel está preparado y que el huésped es esperado, reduciendo ansiedad", "Solo por protocolo del sistema", "Para cobrar el suplemento"], answer: "Transmite que el hotel está preparado y que el huésped es esperado, reduciendo ansiedad" },
      { question: "¿Cómo se dice 'avisamos cuando esté listo'?", options: ["Te llamamos", "Avisamos assim que estiver pronto", "Notificamos cuando disponible", "Le informamos"], answer: "Avisamos assim que estiver pronto" },
    ],
    dictation: "Bem-vindo, senhor. Sei que foi uma viagem longa. Vou fazer o seu check-in rapidamente para que o senhor possa descansar.",
  },
  // ══ RESTAURANTE adicional ══
  {
    id: "restricciones-alergias", title: "Alergias y restricciones alimentarias", level: "Intermedio", category: "Restaurante", emoji: "⚠️",
    description: "Cómo manejar alergias e intolerancias alimentarias con seguridad en portugués.",
    readingTitle: "La seguridad alimentaria primero",
    reading: [
      "La gestión de alergias e intolerancias es una responsabilidad de primer orden en gastronomía. Una alergia severa mal gestionada puede tener consecuencias médicas graves. El colaborador necesita el vocabulario correcto en portugués y debe entender la importancia de comunicarlo correctamente a la cocina.",
      "Las alergias más frecuentes en portugués: 'alergia a glúten' (celiaquía), 'alergia a lactose' (intolerancia a la lactosa), 'alergia a frutos do mar' (mariscos), 'alergia a amendoim' (maní), 'alergia a ovos' (huevos). La pregunta estándar al sentar: 'Antes de apresentar o cardápio, o senhor tem alguma restrição alimentar ou alergia?'",
      "Cuando el huésped informa una alergia, responder con total disposición: 'Claro, muito obrigado por nos informar. Vou avisar imediatamente a cozinha sobre a sua alergia. Posso também sugerir os pratos que são naturalmente sem esse ingrediente.' Esta respuesta combina agradecimiento, acción y propuesta.",
      "La comunicación a la cocina debe ser formal y visible. La alergia debe marcarse en el comprobante de pedido con claridad. El colaborador debe conocer y aplicar el protocolo de alergia del hotel que incluye utensilios dedicados y supervisión del plato.",
      "Las restricciones por elección (vegetariano, vegano) se manejan con la misma disposición: 'O senhor é vegetariano? Com prazer. Temos três opções vegetarianas deliciosas no cardápio que posso apresentar.' Esta respuesta normaliza la restricción y presenta soluciones positivas.",
    ],
    vocab: [
      { es: "alergia / intolerancia", pt: "alergia / intolerância" },
      { es: "sin gluten / celíaco", pt: "sem glúten / celíaco" },
      { es: "sin lactosa", pt: "sem lactose" },
      { es: "mariscos / maní / huevos", pt: "frutos do mar / amendoim / ovos" },
      { es: "vegetariano / vegano", pt: "vegetariano / vegano" },
      { es: "restricción alimentaria", pt: "restrição alimentar" },
    ],
    quiz: [
      { question: "¿Cuándo preguntar por restricciones alimentarias?", options: ["Solo si el huésped lo menciona", "Antes de presentar el menú, proactivamente", "Solo para grupos grandes", "Al pagar la cuenta"], answer: "Antes de presentar el menú, proactivamente" },
      { question: "¿Cómo se dice 'alergia al gluten'?", options: ["Sin trigo", "Alergia a glúten / celíaco", "Intolerância ao trigo", "Dieta especial"], answer: "Alergia a glúten / celíaco" },
      { question: "¿Cómo se dice 'mariscos'?", options: ["Mariscos igual", "Frutos do mar", "Pescados del mar", "Crustáceos"], answer: "Frutos do mar" },
      { question: "¿Qué hacer al recibir información de una alergia?", options: ["Anotarla y continuar", "Agradecer, avisar inmediatamente a la cocina y sugerir platos seguros", "Derivar al supervisor", "Verificar si es alergia real"], answer: "Agradecer, avisar inmediatamente a la cocina y sugerir platos seguros" },
      { question: "¿Cómo se dice 'vegetariano'?", options: ["Verdurista", "Vegetariano", "Sin carne", "Herbívoro"], answer: "Vegetariano" },
      { question: "¿Cómo se dice 'sin lactosa'?", options: ["Sin leche", "Sem lactose", "Sin dairy", "Sem leite"], answer: "Sem lactose" },
      { question: "¿Cómo se dice 'restricción alimentaria'?", options: ["Dieta especial", "Restrição alimentar", "Preferência de comida", "Límite de alimentos"], answer: "Restrição alimentar" },
      { question: "¿Por qué la comunicación de alergias a la cocina debe ser formal?", options: ["Por exigencia del certificado", "Porque las alergias severas pueden tener consecuencias médicas graves", "Solo para restaurantes de cinco estrellas", "Por protocolo de presentación"], answer: "Porque las alergias severas pueden tener consecuencias médicas graves" },
    ],
    dictation: "Antes de apresentar o cardápio, o senhor tem alguma restrição alimentar ou alergia que devamos saber para garantir sua segurança?",
  },
  {
    id: "room-service", title: "Servicio a la habitación", level: "Intermedio", category: "Restaurante", emoji: "🛎️",
    description: "Cómo gestionar pedidos de room service en portugués con precisión y calidez.",
    readingTitle: "El servicio que llega a la puerta",
    reading: [
      "El servicio a la habitación es uno de los momentos más íntimos y valorados en hotelería de alta gama. El huésped está en su espacio privado y la comunicación requiere eficiencia, calidez y precisión: quiere saber exactamente qué va a llegar y cuándo.",
      "La toma del pedido por teléfono: 'Serviço de quarto, bom dia. Fala [nombre]. Em que posso ajudá-lo?' Escuchar el pedido completo antes de confirmar. La confirmación debe ser especialmente precisa porque no hay posibilidad de corrección visual.",
      "'Então para o quarto duzentos e oito: um café da manhã completo com suco de laranja, pão tostado, ovos mexidos e um café com leite. Está correto? Vou entregar em aproximadamente trinta minutos.' La precisión evita entregas incorrectas y la comunicación del tiempo gestiona la expectativa.",
      "La entrega tiene su protocolo: tocar el timbre suavemente dos veces, anunciarse ('Serviço de quarto'), esperar que el huésped abra y confirmar: 'Bom dia, senhor. O seu pedido. Pode conferir se está tudo conforme solicitado? Bom apetite!'",
      "Los pedidos de celebración merecen atención adicional: 'O senhor mencionou que é aniversário da senhora. Gostaríamos de incluir um petit gâteau de chocolate com vela e uma mensagem de parabéns, com os nossos cumprimentos.' Este tipo de atención anticipada genera el tipo de sorpresa que se comparte en redes sociales.",
    ],
    vocab: [
      { es: "servicio a la habitación", pt: "serviço de quarto" },
      { es: "tiempo de entrega", pt: "tempo de entrega" },
      { es: "¿está todo conforme solicitado?", pt: "está tudo conforme solicitado?" },
      { es: "buen provecho", pt: "bom apetite" },
      { es: "en aproximadamente 30 minutos", pt: "em aproximadamente trinta minutos" },
      { es: "con nuestros cumplidos", pt: "com os nossos cumprimentos" },
    ],
    quiz: [
      { question: "¿Cómo se identifica al atender el teléfono de room service?", options: ["Hola, ¿qué necesita?", "Serviço de quarto, bom dia. Fala [nombre]. Em que posso ajudá-lo?", "Room service, diga", "Habitaciones, buenas"], answer: "Serviço de quarto, bom dia. Fala [nombre]. Em que posso ajudá-lo?" },
      { question: "¿Por qué la confirmación en room service debe ser especialmente precisa?", options: ["Por protocolo", "Porque no hay posibilidad de corrección visual al entregar en la habitación", "Solo para pedidos complejos", "Solo si el huésped lo solicita"], answer: "Porque no hay posibilidad de corrección visual al entregar en la habitación" },
      { question: "¿Cómo se dice 'buen provecho'?", options: ["Buena comida", "Bom apetite", "Disfrute su comida", "Bon appétit"], answer: "Bom apetite" },
      { question: "¿Cómo preguntar si el pedido está correcto en la entrega?", options: ["¿Está todo bien?", "Está tudo conforme solicitado?", "¿Falta algo?", "¿Es lo que pidió?"], answer: "Está tudo conforme solicitado?" },
      { question: "¿Cómo se dice 'servicio a la habitación'?", options: ["Servicio de room", "Serviço de quarto", "Entrega en cuarto", "Servicio privado"], answer: "Serviço de quarto" },
      { question: "¿Cómo se dice 'tiempo de entrega'?", options: ["Tiempo de llegada", "Tempo de entrega", "Prazo de entrega", "Demora de entrega"], answer: "Tempo de entrega" },
      { question: "¿Cuál es el protocolo correcto al llegar con el pedido?", options: ["Golpear fuerte y esperar", "Tocar el timbre suavemente, anunciarse y esperar que abran", "Dejar el pedido en la puerta", "Entrar con la llave maestra"], answer: "Tocar el timbre suavemente, anunciarse y esperar que abran" },
      { question: "¿Cómo se dice 'con nuestros cumplidos'?", options: ["De parte del hotel", "Com os nossos cumprimentos", "Con nuestros saludos", "De regalo"], answer: "Com os nossos cumprimentos" },
    ],
    dictation: "Serviço de quarto, bom dia. Vou entregar em aproximadamente trinta minutos. Está tudo conforme solicitado? Bom apetite, senhor.",
  },
  // ══ EXCURSIONES adicional ══
  {
    id: "excursiones-verano", title: "Actividades de verano y trekking", level: "Intermedio", category: "Excursiones", emoji: "🥾",
    description: "Trekking, senderismo y actividades estivales en portugués técnico turístico.",
    readingTitle: "La montaña en verde",
    reading: [
      "El verano patagónico, de diciembre a marzo, transforma completamente la región. Los bosques nativos se llenan de color y los senderos de montaña se abren para caminatas de distintos niveles. Para el turista brasileño que visita en verano, la oferta de actividades al aire libre es uno de los principales atractivos.",
      "El Cerro Bayo en verano: 'No verão, o Cerro Bayo se transforma. As pistas de esqui se tornam trilhas de montanha com vistas deslumbrantes. O teleférico continua operando e leva o senhor até o mirante a mil e oitocentos metros em poucos minutos. De lá, pode fazer uma caminhada de uma hora com vista para o lago em cada direção.'",
      "Las caminatas en el Parque Nacional: 'O Parque Nacional tem trilhas para todos os níveis. Para iniciantes, a trilha até a Cascada Inacayal tem quarenta e cinco minutos de caminhada fácil. Para os mais aventureiros, o trekking até o Cerro Bayo com paisagens de tirar o fôlego dura aproximadamente seis horas.'",
      "Las actividades acuáticas en verano son ideales: 'O verão é a melhor época para caiaque no lago. As águas ficam mais calmas e a temperatura permite passeios prolongados. Trabalhamos com operadoras que oferecem caiaque guiado, windsurf e até mergulho nos pontos mais transparentes do lago.'",
      "La bicicleta es una opción muy popular: 'Villa La Angostura tem excelentes ciclovias e caminhos para mountain bike. Alugamos bicicletas no hotel, com capacetes e mapas da região incluídos. O passeio de bicicleta pelo Circuito Chico é uma das experiências favoritas dos nossos hóspedes no verão.'",
    ],
    vocab: [
      { es: "sendero / caminata", pt: "trilha / caminhada" },
      { es: "trekking / senderismo", pt: "trekking / trilhamento" },
      { es: "cascada / parque nacional", pt: "cascata / parque nacional" },
      { es: "bicicleta / ciclismo", pt: "bicicleta / ciclismo" },
      { es: "alquiler de bicicletas", pt: "aluguel de bicicletas" },
      { es: "nivel fácil / difícil", pt: "nível fácil / difícil" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'sendero / caminata' en portugués?", options: ["Camino de montaña", "Trilha / caminhada", "Ruta de trekking", "Paseo de montaña"], answer: "Trilha / caminhada" },
      { question: "¿Cómo se dice 'cascada' en portugués?", options: ["Cascada igual", "Cascata", "Catarata", "Chorro de agua"], answer: "Cascata" },
      { question: "¿Cómo se dice 'bicicleta' en portugués?", options: ["Bicicleta igual", "Bicicleta", "Bike", "Velocípedo"], answer: "Bicicleta" },
      { question: "¿Cómo se dice 'alquiler de bicicletas'?", options: ["Renta de bici", "Aluguel de bicicletas", "Préstamo de bicicletas", "Servicio de bike"], answer: "Aluguel de bicicletas" },
      { question: "¿Cuánto dura la caminata hasta la Cascada Inacayal?", options: ["3 horas", "45 minutos", "Todo el día", "2 horas"], answer: "45 minutos" },
      { question: "¿Cómo se dice 'parque nacional' en portugués?", options: ["Parque nacional igual", "Parque nacional", "Reserva natural", "Área protegida"], answer: "Parque nacional" },
      { question: "¿Qué actividad acuática es ideal en verano?", options: ["Ski acuático solo", "Caiaque / kayak guiado, windsurf y actividades en el lago", "Solo natación en piscina", "Paseos en barco solamente"], answer: "Caiaque / kayak guiado, windsurf y actividades en el lago" },
      { question: "¿Cómo se dice 'nivel fácil' en portugués?", options: ["Nível simple", "Nível fácil", "Nivel básico", "Fácil para todos"], answer: "Nível fácil" },
    ],
    dictation: "No verão, o Parque Nacional tem trilhas para todos os níveis. A trilha até a cascata tem quarenta e cinco minutos de caminhada fácil com vista linda.",
  },
  // ══ SITUACIONES DIFÍCILES adicional ══
  {
    id: "habitacion-no-disponible", title: "Habitación no disponible al llegar", level: "Avanzado", category: "Situaciones Difíciles", emoji: "🚪",
    description: "Cómo gestionar el error de overbooking o habitación no lista al check-in.",
    readingTitle: "Cuando el cuarto no está listo",
    reading: [
      "Una de las situaciones más delicadas en hotelería es cuando el huésped llega y su habitación no está disponible por overbooking, retraso en la limpieza o un problema técnico. Esta situación, si se gestiona mal, puede arruinar toda la estadía. Si se gestiona bien, puede generar una impresión positiva.",
      "La transparencia inmediata es fundamental: nunca hacer esperar al huésped sin explicación. 'Senhor Ferreira, peço desculpas pelo inconveniente. A sua suíte ainda está sendo preparada. Vai estar pronta em aproximadamente trinta minutos.' Esta comunicación honesta y con tiempo estimado es mucho mejor que el silencio.",
      "Mientras el huésped espera, ofrecer alternativas concretas: 'Enquanto aguarda, gostaríamos de convidá-lo para um welcome drink no nosso bar com os cumprimentos do hotel. Podemos também guardar a sua bagagem para que fique com as mãos livres.' Estas alternativas transforman la espera en un servicio.",
      "Si el problema es overbooking y no hay solución en el mismo hotel: la alternativa es reubicar al huésped en un hotel de categoría igual o superior, con todos los gastos cubiertos por el hotel. 'Senhor, infelizmente tivemos um problema com as reservas. Já organizamos hospedagem para o senhor em um hotel equivalente, com todos os custos cobertos por nós.' Esta solución debe ofrecerse con genuina disculpa.",
      "El seguimiento después de resolver la situación es clave: 'Quero garantir pessoalmente que tudo está ao seu gosto agora. Como podemos compensar o inconveniente da chegada?' Esta pregunta abierta permite al huésped expresar qué tipo de gesto de compensación sería significativo para él.",
    ],
    vocab: [
      { es: "la habitación aún se está preparando", pt: "o quarto ainda está sendo preparado" },
      { es: "en aproximadamente 30 minutos", pt: "em aproximadamente trinta minutos" },
      { es: "welcome drink / copa de bienvenida", pt: "welcome drink / bebida de boas-vindas" },
      { es: "todos los gastos cubiertos por nosotros", pt: "todos os custos cobertos por nós" },
      { es: "garantizar personalmente", pt: "garantir pessoalmente" },
      { es: "compensar el inconveniente", pt: "compensar o inconveniente" },
    ],
    quiz: [
      { question: "¿Cuál es la primera acción ante una habitación no disponible?", options: ["Pedir al huésped que espere sin explicación", "Comunicar con transparencia el problema y el tiempo estimado de solución", "Llamar al supervisor antes de hablar con el huésped", "Ofrecer un descuento inmediatamente"], answer: "Comunicar con transparencia el problema y el tiempo estimado de solución" },
      { question: "¿Cómo se dice 'el cuarto aún se está preparando'?", options: ["El cuarto no está listo", "O quarto ainda está sendo preparado", "La habitación está ocupada", "Estamos limpiando"], answer: "O quarto ainda está sendo preparado" },
      { question: "¿Qué se ofrece al huésped mientras espera?", options: ["Solo una silla en el lobby", "Welcome drink, guardar el equipaje y alternativas de confort", "Solo disculpas repetidas", "Solo el tiempo estimado de espera"], answer: "Welcome drink, guardar el equipaje y alternativas de confort" },
      { question: "¿Cómo se dice 'todos los gastos cubiertos por nosotros'?", options: ["De gratis", "Todos os custos cobertos por nós", "Sin costo para usted", "Pagado por el hotel"], answer: "Todos os custos cobertos por nós" },
      { question: "¿Cómo se dice 'welcome drink'?", options: ["Bebida gratis", "Welcome drink / bebida de boas-vindas", "Copa de llegada", "Bebida de cortesía"], answer: "Welcome drink / bebida de boas-vindas" },
      { question: "¿Qué debe incluir el seguimiento después de resolver la situación?", options: ["Solo verificar que el huésped está en la habitación", "Preguntar qué compensación sería significativa para el huésped", "Enviar un correo de disculpa", "Solo verificar en el check-out"], answer: "Preguntar qué compensación sería significativa para el huésped" },
      { question: "¿Cómo se dice 'compensar el inconveniente'?", options: ["Resolver el problema", "Compensar o inconveniente", "Dar algo gratis", "Hacer algo por el huésped"], answer: "Compensar o inconveniente" },
      { question: "¿Qué convierte la espera por la habitación en un momento de servicio?", options: ["Disculparse repetidamente", "Ofrecer alternativas concretas que demuestran que el hotel cuida al huésped mientras espera", "Hacer el check-in más rápido", "Dar acceso a la habitación antes de tiempo"], answer: "Ofrecer alternativas concretas que demuestran que el hotel cuida al huésped mientras espera" },
    ],
    dictation: "Senhor, peço desculpas pelo inconveniente. O seu quarto ainda está sendo preparado e ficará pronto em aproximadamente trinta minutos.",
  },
  {
    id: "huespedes-frecuentes", title: "Huéspedes frecuentes y fidelización", level: "Intermedio", category: "Recepción", emoji: "🌟",
    description: "Cómo reconocer, tratar y fidelizar al huésped que regresa al hotel.",
    readingTitle: "El huésped que vuelve",
    reading: [
      "Un huésped que regresa es la mejor señal de que algo se hizo bien. Ese huésped tiene expectativas más altas porque ya conoce el hotel. Si la segunda estadía no supera la primera, la decepción es mayor. Reconocer al huésped frecuente y hacerlo sentir especial es una inversión que se paga sola.",
      "El reconocimiento comienza antes de la llegada. El sistema debe registrar las preferencias: tipo de habitación preferida, gastronómicas, alergias, fechas especiales. 'Bom dia, senhor Oliveira. Que bom tê-lo de volta! Preparamos a sua suíte favorita com vista para o lago, como da última vez.'",
      "Los detalles personalizados transforman una estadía en un recuerdo. Una preferencia por almohadas firmes registrada de la primera estadía y atendida en la segunda sin que el huésped lo solicite comunica que fue escuchado. 'Lembramos que o senhor prefere travesseiros firmes, já deixamos no quarto.'",
      "La conversación puede ser más personal: hacer referencia a estadías anteriores, preguntar por cómo estuvo desde la última visita, mencionar novedades del hotel. Esta continuidad narrativa convierte un servicio en una experiencia memorable.",
      "La fidelización incluye beneficios concretos: upgrade cuando hay disponibilidad, late check-out sin cargo, descuento en la siguiente reserva. 'Como agradecimento pela sua fidelidade, gostaríamos de oferecer-lhe um late check-out até as catorze horas sem custo adicional.' Estos gestos no necesitan ser costosos.",
    ],
    vocab: [
      { es: "huésped frecuente", pt: "hóspede frequente" },
      { es: "qué bueno tenerlo de vuelta", pt: "que bom tê-lo de volta" },
      { es: "recordamos que prefiere...", pt: "lembramos que o senhor prefere..." },
      { es: "late check-out", pt: "late check-out / saída tardia" },
      { es: "obsequio de cortesía", pt: "brinde / cortesia" },
      { es: "como agradecimiento por su fidelidad", pt: "como agradecimento pela sua fidelidade" },
    ],
    quiz: [
      { question: "¿Cómo saluda a un huésped frecuente?", options: ["Bom dia, como vai?", "Bom dia, senhor. Que bom tê-lo de volta!", "Hola, bienvenido otra vez", "Olá, você voltou!"], answer: "Bom dia, senhor. Que bom tê-lo de volta!" },
      { question: "¿Cómo se comunica que se recordó una preferencia?", options: ["El huésped lo descubrirá solo", "Lembramos que o senhor prefere travesseiros firmes, já deixamos no quarto", "Solo si el huésped pregunta", "Enviando un correo"], answer: "Lembramos que o senhor prefere travesseiros firmes, já deixamos no quarto" },
      { question: "¿Cómo se ofrece un late check-out de fidelización?", options: ["Solo si el huésped lo pide", "Como agradecimento pela sua fidelidade, gostaríamos de oferecer um late check-out sem custo", "Cobrándolo a precio especial", "Solo en baja temporada"], answer: "Como agradecimento pela sua fidelidade, gostaríamos de oferecer um late check-out sem custo" },
      { question: "¿Necesitan ser costosos los gestos de fidelización?", options: ["Sí, solo los costosos son valorados", "No, el impacto viene de la personalización, no del costo", "Depende del segmento", "Solo los obsequios físicos tienen impacto"], answer: "No, el impacto viene de la personalización, no del costo" },
      { question: "¿Cómo se dice 'obsequio de cortesía'?", options: ["Regalo de bienvenida", "Brinde / cortesia", "Presente do hotel", "Souvenir"], answer: "Brinde / cortesia" },
      { question: "¿Cómo se dice 'qué bueno tenerlo de vuelta'?", options: ["Bienvenido de nuevo", "Que bom tê-lo de volta", "Voltou, que ótimo", "Estamos felizes"], answer: "Que bom tê-lo de volta" },
      { question: "¿Cómo se dice 'como agradecimiento por su fidelidad'?", options: ["Por ser buen cliente", "Como agradecimento pela sua fidelidade", "Por volver siempre", "Como gesto del hotel"], answer: "Como agradecimento pela sua fidelidade" },
      { question: "¿Qué convierte una estadía en un recuerdo memorable para el huésped frecuente?", options: ["Los precios más bajos", "Los detalles personalizados que demuestran que fue recordado", "La calidad estándar de instalaciones", "La cantidad de actividades"], answer: "Los detalles personalizados que demuestran que fue recordado" },
    ],
    dictation: "Que bom tê-lo de volta, senhor Oliveira. Preparamos a sua suíte favorita e lembramos de todas as suas preferências.",
  },
  {
    id: "recomendaciones-temporada", title: "Actividades según temporada", level: "Básico", category: "Excursiones", emoji: "🌦️",
    description: "Cómo orientar al huésped en la elección de actividades según la temporada en portugués.",
    readingTitle: "La Patagonia en cada estación",
    reading: [
      "La Patagonia andina tiene cuatro estaciones muy marcadas que transforman completamente el paisaje. Saber comunicar esto al huésped en portugués es fundamental para ayudarlo a planificar y para gestionar sus expectativas si las condiciones climáticas cambian durante la estadía.",
      "El verano (diciembre-marzo) es la temporada más activa: días largos, temperaturas de 15 a 25 grados, ideal para trekking, kayak y bicicleta. 'No verão a região está em plena atividade. Os dias são longos e as trilhas estão todas abertas. É a melhor época para atividades ao ar livre.'",
      "El otoño (marzo-mayo) es la temporada más fotogénica: los bosques se tiñen de rojo, naranja y amarillo. 'O outono é, para muitos, a estação mais bonita da Patagônia. As folhas dos bosques se transformam em uma paleta de cores douradas e avermelhadas. É a época ideal para fotografar e para visitar o Bosque de Arrayanes.'",
      "El invierno (junio-septiembre) es la temporada del ski: el Cerro Bayo opera con todas sus pistas. 'No inverno, Villa La Angostura se transforma em um destino de neve. O Cerro Bayo está em plena temporada de esqui e o centro da cidade tem um charme especial com as casas cobertas de neve.'",
      "La primavera (octubre-noviembre) es la temporada de las flores: los arrayanes florecen, las cascadas están caudalosas. 'Na primavera a região desperta com flores e cachoeiras exuberantes. É uma época pouco conhecida pelos turistas mas com um charme especial e menos movimento.'",
    ],
    vocab: [
      { es: "verano / otoño / invierno / primavera", pt: "verão / outono / inverno / primavera" },
      { es: "temporada alta / baja", pt: "alta temporada / baixa temporada" },
      { es: "paisaje nevado", pt: "paisagem nevada" },
      { es: "colores del otoño", pt: "cores do outono" },
      { es: "días largos / cortos", pt: "dias longos / curtos" },
      { es: "ideal para actividades al aire libre", pt: "ideal para atividades ao ar livre" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'verano'?", options: ["Verano igual", "Verão", "Estio", "Calor"], answer: "Verão" },
      { question: "¿Cómo se dice 'otoño'?", options: ["Otoño igual", "Outono", "Autumn", "Temporada dorada"], answer: "Outono" },
      { question: "¿Cómo se dice 'invierno'?", options: ["Invierno igual", "Inverno", "Frio", "Temporada blanca"], answer: "Inverno" },
      { question: "¿Cuál es la temporada más fotogénica?", options: ["El verano por los días largos", "El otoño con los colores dorados y rojizos", "El invierno por la nieve", "La primavera por las flores"], answer: "El otoño con los colores dorados y rojizos" },
      { question: "¿Cómo se dice 'paisaje nevado'?", options: ["Paisaje con nieve", "Paisagem nevada", "Paisaje blanco", "Vista nevada"], answer: "Paisagem nevada" },
      { question: "¿Cómo se dice 'alta temporada'?", options: ["Temporada llena", "Alta temporada", "Temporada pico", "Época alta"], answer: "Alta temporada" },
      { question: "¿Cómo se dice 'primavera'?", options: ["Primavera igual", "Primavera", "Floración", "Desperta"], answer: "Primavera" },
      { question: "¿Qué caracteriza la primavera en Villa La Angostura?", options: ["Es la más turística", "Flores, cascadas exuberantes y menos turismo", "Es cuando opera el Cerro Bayo", "Es la más barata"], answer: "Flores, cascadas exuberantes y menos turismo" },
    ],
    dictation: "No outono, os bosques se transformam em uma paleta de cores douradas. É a época ideal para fotografar e visitar o Bosque de Arrayanes.",
  },
  {
    id: "respuesta-reclamos-escrito", title: "Respuesta a reclamos por escrito", level: "Avanzado", category: "Comunicación Escrita", emoji: "📧",
    description: "Cómo redactar respuestas empáticas y profesionales a quejas de huéspedes en portugués.",
    readingTitle: "La respuesta que recupera al huésped",
    reading: [
      "Una respuesta escrita a un reclamo es una oportunidad de recuperar la confianza. A diferencia de la respuesta presencial, la respuesta escrita queda registrada, puede releerse y compartirse. Requiere especial cuidado en el tono, la estructura y las palabras elegidas.",
      "La estructura: primero, agradecer el contacto y reconocer el inconveniente. Segundo, validar la experiencia sin excusas. Tercero, explicar las medidas tomadas. Cuarto, ofrecer compensación. 'Prezado senhor Ferreira, agradecemos o seu contato e lamentamos profundamente o inconveniente que o senhor viveu com o aquecimento do seu quarto.'",
      "'Entendemos que isso comprometeu o seu conforto, e isso não é aceitável para nós.' Esta frase valida la experiencia del huésped sin excusas y con genuina empatía. Nunca debe incluirse una justificación o explicación de por qué ocurrió el problema antes de reconocerlo.",
      "La explicación de medidas: 'Após a sua saída, revisamos todo o sistema de aquecimento da suíte e identificamos a causa do problema, que já foi corrigida. Implementamos também um protocolo de verificação prévia em todas as acomodações.' Esta comunicación muestra responsabilidad y acción concreta.",
      "El cierre: 'Como demonstração do nosso compromisso, gostaríamos de oferecer-lhe um desconto de vinte por cento na sua próxima estadia. Esperamos ter a oportunidade de recebê-lo novamente e de demonstrar o padrão de excelência que o Marinas representa. Atenciosamente.'",
    ],
    vocab: [
      { es: "lamentamos profundamente", pt: "lamentamos profundamente" },
      { es: "no es aceptable para nosotros", pt: "não é aceitável para nós" },
      { es: "ya fue corregido", pt: "já foi corrigido" },
      { es: "para evitar que esto se repita", pt: "para evitar que isso se repita" },
      { es: "como demostración de nuestro compromiso", pt: "como demonstração do nosso compromisso" },
      { es: "esperamos recibirlo nuevamente", pt: "esperamos recebê-lo novamente" },
    ],
    quiz: [
      { question: "¿Cuál es el primer paso en una respuesta escrita a un reclamo?", options: ["Explicar por qué ocurrió", "Agradecer el contacto y reconocer el inconveniente con empatía", "Ofrecer la compensación inmediatamente", "Pedir disculpas repetidamente"], answer: "Agradecer el contacto y reconocer el inconveniente con empatía" },
      { question: "¿Cómo se dice 'lamentamos profundamente'?", options: ["Lo sentimos mucho", "Lamentamos profundamente", "Pedimos perdón", "Nos disculpamos"], answer: "Lamentamos profundamente" },
      { question: "¿Cómo se dice 'ya fue corregido'?", options: ["Ya está arreglado", "Já foi corrigido", "Lo solucionamos", "Está resuelto"], answer: "Já foi corrigido" },
      { question: "¿Qué incluye la explicación de medidas tomadas?", options: ["Solo disculpas adicionales", "La causa identificada y acciones concretas para evitar que se repita", "Solo el nombre del responsable", "Solo la garantía de que no pasará"], answer: "La causa identificada y acciones concretas para evitar que se repita" },
      { question: "¿Cómo se dice 'para evitar que esto se repita'?", options: ["Para que no pase de nuevo", "Para evitar que isso se repita", "Para prevenir futuros problemas", "Para no repetir el error"], answer: "Para evitar que isso se repita" },
      { question: "¿Cómo se dice 'como demostración de nuestro compromiso'?", options: ["Como muestra de buena voluntad", "Como demonstração do nosso compromisso", "Como gesto del hotel", "Como compensación"], answer: "Como demonstração do nosso compromisso" },
      { question: "¿Por qué el cierre debe mantener la relación abierta?", options: ["Por protocolo formal", "Porque el objetivo es recuperar al huésped para una futura estadía", "Solo si el huésped es frecuente", "Por el sistema de reseñas"], answer: "Porque el objetivo es recuperar al huésped para una futura estadía" },
      { question: "¿Cómo se dice 'esperamos recibirlo nuevamente'?", options: ["Esperamos verlo pronto", "Esperamos recebê-lo novamente", "Ojalá vuelva", "Lo esperamos de vuelta"], answer: "Esperamos recebê-lo novamente" },
    ],
    dictation: "Prezado senhor, lamentamos profundamente o ocorrido. Já foi corrigido e implementamos medidas para evitar que isso se repita. Esperamos recebê-lo novamente.",
  },
  // ══ GRAMÁTICA adicional ══
  {
    id: "verbos-servicio", title: "Verbos de servicio más usados", level: "Básico", category: "Gramática Hotelera", emoji: "🔄",
    description: "Los verbos más importantes del portugués hotelero conjugados correctamente.",
    readingTitle: "Las acciones del servicio",
    reading: [
      "Los verbos son el núcleo de la comunicación en el servicio hotelero. Saber conjugar los verbos más frecuentes en portugués brasileño con o senhor y a senhora es la diferencia entre una comunicación fluida y una torpe. La buena noticia es que los verbos más útiles en hotelería son relativamente pocos y muy repetibles.",
      "Los verbos más importantes del servicio hotelero y su conjugación con o senhor: 'precisar' (necesitar): 'O senhor precisa de algo?' 'querer' (querer): 'O senhor quer um café?' 'preferir' (preferir): 'O senhor prefere a mesa com vista?' 'poder' (poder): 'O senhor pode me informar?' 'desejar' (desear): 'O senhor deseja mais alguma coisa?'",
      "Verbos de acción del colaborador: 'trazer' (traer): 'Vou trazer o cardápio', 'verificar' (verificar): 'Vou verificar a disponibilidade', 'preparar' (preparar): 'Vou preparar o quarto', 'confirmar' (confirmar): 'Vou confirmar a reserva', 'resolver' (resolver): 'Vou resolver imediatamente'. Todos siguen el patrón 'Vou + infinitivo' para el futuro inmediato.",
      "El presente continuo en portugués se forma con 'estar + gerúndio': 'O quarto está sendo preparado' (la habitación se está preparando), 'O senhor está sendo atendido' (usted está siendo atendido), 'Estamos verificando' (estamos verificando). Esta construcción es muy frecuente en situaciones de servicio activo.",
      "Las frases de oferta y propuesta usan el condicional: 'Gostaria de um upgrade?' (¿Le gustaría un upgrade?), 'Posso sugerir o nosso Malbec?' (¿Puedo sugerir nuestro Malbec?), 'Precisaria de mais alguma coisa?' (¿Necesitaría algo más?). El condicional suaviza la propuesta y la hace más elegante.",
    ],
    vocab: [
      { es: "necesitar / querer / preferir", pt: "precisar / querer / preferir" },
      { es: "traer / verificar / confirmar", pt: "trazer / verificar / confirmar" },
      { es: "voy a traer / voy a preparar", pt: "vou trazer / vou preparar" },
      { es: "¿necesita algo más?", pt: "precisa de mais alguma coisa?" },
      { es: "¿desea algo más?", pt: "deseja mais alguma coisa?" },
      { es: "estamos preparando", pt: "estamos preparando" },
    ],
    quiz: [
      { question: "¿Cómo se dice '¿necesita algo?' con o senhor?", options: ["Você precisa de algo?", "O senhor precisa de algo?", "Precisa algo?", "Tem necessidade?"], answer: "O senhor precisa de algo?" },
      { question: "¿Cómo se dice 'voy a traer el menú'?", options: ["Traigo el menú", "Vou trazer o cardápio", "Trago o cardápio", "Vou buscar o cardápio"], answer: "Vou trazer o cardápio" },
      { question: "¿Cómo se dice 'voy a verificar'?", options: ["Verifico", "Vou verificar", "Estou verificando", "Verificarei"], answer: "Vou verificar" },
      { question: "¿Cómo se dice 'la habitación se está preparando'?", options: ["O quarto está pronto", "O quarto está sendo preparado", "Preparamos o quarto", "O quarto foi preparado"], answer: "O quarto está sendo preparado" },
      { question: "¿Cómo se dice '¿desea algo más?'?", options: ["Quer mais algo?", "Deseja mais alguma coisa?", "Tem mais pedido?", "Mais alguma coisa?"], answer: "Deseja mais alguma coisa?" },
      { question: "¿Cómo se dice 'voy a confirmar la reserva'?", options: ["Confirmo a reserva", "Vou confirmar a reserva", "A reserva está confirmada", "Confirmarei a reserva"], answer: "Vou confirmar a reserva" },
      { question: "¿Cómo se dice '¿prefiere la mesa con vista?'?", options: ["Você prefere a mesa com vista?", "O senhor prefere a mesa com vista?", "Quer mesa com vista?", "Gosta de vista para o lago?"], answer: "O senhor prefere a mesa com vista?" },
      { question: "¿Qué patrón se usa para el futuro inmediato en portugués?", options: ["Infinitivo solo", "Vou + infinitivo", "Estar + gerúndio", "Vai + infinitivo"], answer: "Vou + infinitivo" },
    ],
    dictation: "O senhor precisa de algo mais? Vou trazer o cardápio imediatamente e vou verificar a disponibilidade da sua suíte preferida.",
  },
  {
    id: "preguntas-abiertas", title: "Preguntas abiertas en hotelería", level: "Intermedio", category: "Gramática Hotelera", emoji: "❓",
    description: "Cómo formular preguntas abiertas efectivas para conectar con el huésped en portugués.",
    readingTitle: "La pregunta que construye relación",
    reading: [
      "La diferencia entre una pregunta cerrada y una abierta puede transformar una interacción transaccional en una conversación genuina. Una pregunta cerrada obtiene un sí o un no. Una pregunta abierta invita al huésped a expresarse, genera información valiosa sobre sus preferencias y construye relación. En portugués, dominar las preguntas abiertas es una competencia de excelencia.",
      "Las preguntas abiertas más útiles en recepción: 'Como foi a viagem, senhor?' (¿Cómo estuvo el viaje?), 'É a primeira vez que nos visita?' (¿Es la primera vez que nos visita?), 'O que o senhor tem planejado para os dias de estadia?' (¿Qué tiene planeado para los días de estadía?), 'Tem alguma preferência especial que possamos preparar?' (¿Tiene alguna preferencia especial que podamos preparar?)",
      "En el restaurante: 'O que o senhor costuma preferir: carnes ou peixes?' (¿Qué suele preferir: carnes o pescados?), 'É uma ocasião especial?' (¿Es una ocasión especial?), 'O senhor tem algum prato favorito da culinária argentina que gostaria de experimentar?' (¿Tiene algún plato favorito de la cocina argentina que le gustaría probar?)",
      "Para recomendaciones de excursiones: 'O senhor prefere atividades mais activas como trekking e esqui, ou mais tranquilas como passeios de barco e degustação de vinhos?' (¿Prefiere actividades más activas o más tranquilas?). Esta pregunta de contraste facilita enormemente la recomendación posterior.",
      "El cierre de cada interacción con una pregunta abierta: 'Tem mais alguma coisa em que eu possa ajudá-lo antes de acompanhá-lo ao quarto?' (¿Hay algo más en que pueda ayudarle?), 'Como posso tornar a sua estadia ainda mais especial?' (¿Cómo puedo hacer su estadía aún más especial?). Estas preguntas finales transmiten genuino interés y frecuentemente generan oportunidades de venta.",
    ],
    vocab: [
      { es: "¿cómo estuvo el viaje?", pt: "como foi a viagem?" },
      { es: "¿es la primera vez que nos visita?", pt: "é a primeira vez que nos visita?" },
      { es: "¿tiene algo planeado?", pt: "o senhor tem algo planejado?" },
      { es: "¿es una ocasión especial?", pt: "é uma ocasião especial?" },
      { es: "¿prefiere actividades activas o tranquilas?", pt: "prefere atividades mais ativas ou mais tranquilas?" },
      { es: "¿en qué más puedo ayudarle?", pt: "em que mais posso ajudá-lo?" },
    ],
    quiz: [
      { question: "¿Qué diferencia principal tiene una pregunta abierta respecto a una cerrada?", options: ["Es más larga", "Invita al huésped a expresarse y genera información valiosa sobre sus preferencias", "Es más difícil de responder", "Solo se usa en situaciones formales"], answer: "Invita al huésped a expresarse y genera información valiosa sobre sus preferencias" },
      { question: "¿Cómo se dice '¿cómo estuvo el viaje?'?", options: ["O viaje foi bom?", "Como foi a viagem?", "Viajou bem?", "Chegou bem?"], answer: "Como foi a viagem?" },
      { question: "¿Cómo se dice '¿es la primera vez que nos visita?'?", options: ["Já esteve aqui?", "É a primeira vez que nos visita?", "Conhece o hotel?", "Veio antes?"], answer: "É a primeira vez que nos visita?" },
      { question: "¿Cómo se dice '¿es una ocasión especial?'?", options: ["¿Están de celebración?", "É uma ocasião especial?", "¿Hay algo para festejar?", "É um evento?"], answer: "É uma ocasião especial?" },
      { question: "¿Cómo se dice '¿en qué más puedo ayudarle?'?", options: ["¿Necesita algo?", "Em que mais posso ajudá-lo?", "Tem mais pedidos?", "Posso fazer mais?"], answer: "Em que mais posso ajudá-lo?" },
      { question: "¿Por qué la pregunta de contraste (activo vs. tranquilo) facilita la recomendación?", options: ["Solo porque es más corta", "Porque permite identificar el perfil del huésped antes de recomendar", "Solo para excursiones de aventura", "Por protocolo de ventas"], answer: "Porque permite identificar el perfil del huésped antes de recomendar" },
      { question: "¿Cómo se dice '¿tiene algo planeado para su estadía?'?", options: ["¿Qué va a hacer?", "O senhor tem algo planejado para os dias de estadia?", "¿Tiene planes?", "Vai sair?"], answer: "O senhor tem algo planejado para os dias de estadia?" },
      { question: "¿Qué generan frecuentemente las preguntas abiertas al cierre de una interacción?", options: ["Solo más trabajo para el colaborador", "Oportunidades de venta adicional y demuestran genuino interés", "Solo alargan la conversación", "Confunden al huésped"], answer: "Oportunidades de venta adicional y demuestran genuino interés" },
    ],
    dictation: "Como foi a viagem, senhor? É a primeira vez que nos visita? Tem alguma preferência especial que possamos preparar para a sua estadia?",
  },
  {
    id: "pronunciacion-clave", title: "Pronunciación clave para argentinos", level: "Básico", category: "Gramática Hotelera", emoji: "🎯",
    description: "Los sonidos del portugués brasileño más importantes para hablantes de español rioplatense.",
    readingTitle: "Suena diferente pero es cercano",
    reading: [
      "El portugués brasileño y el español rioplatense son idiomas cercanos con muchas similitudes pero también diferencias fonéticas importantes que conviene conocer. La buena noticia para el equipo del Hotel Marinas es que el portugués brasileño es considerado por los lingüistas como la variedad de portugués más accesible para hispanohablantes, especialmente para los del Río de la Plata.",
      "Las vocales en portugués brasileño son más abiertas que en español, especialmente en las sílabas tónicas. La 'a' suena más abierta y clara: 'amanhã' (mañana), 'apartamento' (apartamento). La 'e' y la 'o' átonas al final de palabra tienden a reducirse: 'nome' suena casi como 'nomi', 'leite' suena como 'leichi'. Este fenómeno puede sorprender al principio.",
      "Las consonantes más diferentes respecto al español: la 'd' ante 'i' y la 't' ante 'i' se convierten en sonidos palatalizados similares al 'dj' y 'tch' del inglés. 'Dia' suena como 'djia', 'tio' suena como 'tchiu', 'grande' suena como 'grandjie'. Este es el rasgo fonético más característico del portugués brasileño y el más importante para reconocer.",
      "Las vocales nasales son una característica central del portugués que no existe en español. Se forman haciendo pasar el aire por la nariz al pronunciar la vocal. La tilde (~) sobre 'ã' y 'õ' indica nasalidad: 'manhã' (mañana), 'são' (son), 'não' (no). También hay nasalidad ante 'm' y 'n': 'bom' (bueno), 'bem' (bien), 'tem' (tiene). Practicar estas vocales es fundamental.",
      "Las palabras clave del hotel que presentan estas dificultades: 'quarto' (cuarto) — la 'u' antes de vocal a veces no se pronuncia; 'obrigado' (gracias) — la última 'o' se reduce; 'banheiro' (baño) — la 'nh' suena como la 'ñ' española; 'até logo' (hasta luego) — la 'e' final se reduce. Practicar estas palabras en voz alta con el audio del módulo acelera la adquisición.",
    ],
    vocab: [
      { es: "buenas noches / hasta luego", pt: "boa noite / até logo" },
      { es: "gracias / de nada", pt: "obrigado/a / de nada" },
      { es: "sí / no", pt: "sim / não" },
      { es: "mañana / hoy", pt: "amanhã / hoje" },
      { es: "bien / muy bien", pt: "bem / muito bem" },
      { es: "todo bien / ¿cómo está?", pt: "tudo bem / como vai?" },
    ],
    quiz: [
      { question: "¿Cómo se dice 'gracias' en portugués?", options: ["Gracias", "Obrigado / obrigada", "Merci", "Agradecido"], answer: "Obrigado / obrigada" },
      { question: "¿Cómo se dice 'de nada' en portugués?", options: ["De nada igual", "De nada", "Com prazer también se usa", "Não foi nada"], answer: "De nada" },
      { question: "¿Cómo se dice 'sí' en portugués?", options: ["Si igual", "Sim", "Sí con acento", "Claro"], answer: "Sim" },
      { question: "¿Cómo se dice 'no' en portugués?", options: ["No igual", "Não", "Nao", "Ne"], answer: "Não" },
      { question: "¿Cómo se dice 'mañana' en portugués?", options: ["Mañana igual", "Amanhã", "Manhã", "Mañá"], answer: "Amanhã" },
      { question: "¿Cómo se dice 'todo bien' en portugués?", options: ["Todo bien igual", "Tudo bem", "Tudo bueno", "Todo ótimo"], answer: "Tudo bem" },
      { question: "¿Cómo se dice 'hasta luego' en portugués?", options: ["Hasta luego igual", "Até logo", "Até mais", "Xau"], answer: "Até logo" },
      { question: "¿Qué consonante del portugués suena como 'dj' ante la letra 'i'?", options: ["La letra 'b'", "La letra 'd'", "La letra 'g'", "La letra 'j'"], answer: "La letra 'd'" },
    ],
    dictation: "Obrigado, senhor. Tudo bem com a sua estadia? Boa noite e até amanhã. Qualquer coisa, estamos à disposição.",
  },
  {
    id: "falsos-cognados-hotel", title: "Falsos cognados en hotelería", level: "Intermedio", category: "Gramática Hotelera", emoji: "⚠️",
    description: "Las palabras engañosas entre español y portugués que todo colaborador debe conocer.",
    readingTitle: "Las palabras que parecen iguales pero no lo son",
    reading: [
      "Los falsos cognados, también llamados falsos amigos, son palabras que se parecen en forma escrita o sonora entre el español y el portugués pero tienen significados diferentes. En el contexto del hotel, conocer estos falsos amigos es esencial para evitar situaciones embarazosas o malentendidos que pueden afectar la percepción del servicio.",
      "Los falsos cognados más importantes en el contexto hotelero: 'borracha' en portugués es una goma de borrar (nunca una persona ebria). 'Polvo' en portugués es una palabra vulgar que debe evitarse absolutamente en cualquier contexto formal. 'Embaraçada' en portugués significa avergonzada, no embarazada (embarazada es 'grávida'). 'Constipado' en portugués significa resfriado, no estreñido.",
      "Más falsos cognados relevantes para el hotel: 'escritório' significa oficina o lugar de trabajo, no escritorio (que se dice 'escrivaninha'). 'Poltrona' es un sillón cómodo, no algo negativo. 'Bordar' en portugués significa hacer bordados con agujas, no bordear o rodear. 'Vaso' en portugués es un florero o jarrón, no un vaso para beber (que se dice 'copo').",
      "En el área gastronómica también hay falsos amigos importantes: 'sobremesa' en portugués es el postre, no el momento de conversación después de comer (que se dice 'papo' o 'conversa após o jantar'). 'Presunto' en portugués es jamón, no presunto (que se dice 'suposto'). 'Borrego' en portugués es cordero, igual que en español pero menos usado en el habla cotidiana brasileña.",
      "La estrategia más efectiva para evitar confusiones por falsos cognados es escuchar atentamente el contexto de lo que dice el huésped antes de responder. Si hay dudas sobre el significado de lo que el huésped está pidiendo, siempre es mejor preguntar: 'Desculpe, para garantir que entendi corretamente: o senhor está se referindo a...?' Esta pregunta de clarificación nunca es percibida negativamente.",
    ],
    vocab: [
      { es: "embarazada (grávida en portugués)", pt: "embaraçada = avergonzada / grávida = embarazada" },
      { es: "escritorio (escrivaninha en portugués)", pt: "escritório = oficina" },
      { es: "postre (sobremesa en portugués)", pt: "sobremesa (pt) = postre / sobremesa (es) = conversación post-comida" },
      { es: "jamón (presunto en portugués)", pt: "presunto = jamón" },
      { es: "vaso (copo en portugués)", pt: "vaso (pt) = florero / copo = vaso para beber" },
      { es: "para asegurarme que entendí correctamente", pt: "para garantir que entendi corretamente" },
    ],
    quiz: [
      { question: "¿Qué significa 'embaraçada' en portugués?", options: ["Embarazada / grávida", "Avergonzada", "Confundida", "Enferma"], answer: "Avergonzada" },
      { question: "¿Cómo se dice 'embarazada' (grávida) en portugués?", options: ["Embarazada igual", "Grávida", "Embaraçada", "Prenada"], answer: "Grávida" },
      { question: "¿Qué significa 'escritório' en portugués?", options: ["Escritorio / mueble", "Oficina / lugar de trabajo", "Escritura", "Área de trabajo"], answer: "Oficina / lugar de trabajo" },
      { question: "¿Qué significa 'sobremesa' en portugués?", options: ["El momento de conversación post-comida", "El postre", "La mesa del restaurante", "El mantel"], answer: "El postre" },
      { question: "¿Qué significa 'presunto' en portugués?", options: ["Supuesto / presunto (como en español)", "Jamón", "Embutido genérico", "Carne de cerdo"], answer: "Jamón" },
      { question: "¿Qué significa 'vaso' en portugués?", options: ["Vaso para beber", "Florero / jarrón", "Copa de vino", "Recipiente"], answer: "Florero / jarrón" },
      { question: "¿Cómo se dice 'vaso para beber' en portugués?", options: ["Vaso", "Copo", "Copa", "Taça"], answer: "Copo" },
      { question: "¿Cuál es la estrategia correcta ante una duda de significado?", options: ["Asumir el significado más probable", "Preguntar al huésped para clarificar, nunca es percibido negativamente", "Ignorar la palabra dudosa", "Usar gestos en lugar de palabras"], answer: "Preguntar al huésped para clarificar, nunca es percibido negativamente" },
    ],
    dictation: "Desculpe, para garantir que entendi corretamente: o senhor está se referindo à sobremesa do cardápio ou a algo do quarto?",
  },
];

const defaultStudents: Student[] = [];

const CATEGORIES = ["Todos", "Bienvenida", "Recepción", "Habitaciones", "Restaurante", "Excursiones", "Comunicación Escrita", "Situaciones Difíciles", "Gramática Hotelera"];

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

function createInitialState(): AppState {
  return { students: defaultStudents, currentStudentId: null, progress: {}, dictations: {} };
}

function normalize(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

async function loadRemoteState(sb: SupabaseClient): Promise<AppState | null> {
  const { data, error } = await sb.from("aula_marinas_state").select("data").eq("id", DB_ROW_ID).maybeSingle();
  if (error) throw error;
  return (data?.data as AppState) || null;
}

async function saveRemoteState(sb: SupabaseClient, state: AppState): Promise<void> {
  const { error } = await sb.from("aula_marinas_state").upsert({ id: DB_ROW_ID, data: state, updated_at: new Date().toISOString() }, { onConflict: "id" });
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

  useEffect(() => {
    let mounted = true;
    const LSKEY = "aula-marinas-v1";
    const bootstrap = async () => {
      try {
        if (supabase) {
          const remote = await loadRemoteState(supabase);
          if (!mounted) return;
          if (remote) {
            setAppState({ students: Array.isArray(remote.students) ? remote.students : defaultStudents, currentStudentId: null, progress: remote.progress || {}, dictations: remote.dictations || {} });
            setLoadStatus("ready"); return;
          }
        }
      } catch {}
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
    const LSKEY = "aula-marinas-v1";
    const timeout = setTimeout(async () => {
      try { localStorage.setItem(LSKEY, JSON.stringify(appState)); } catch {}
      if (supabase) {
        try { await saveRemoteState(supabase, appState); setSaveError(""); }
        catch { setSaveError("⚠️ Sin conexión a la nube. Guardado localmente."); }
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

  const changePassword = () => {
    if (!newPassword.trim()) { setPasswordMsg("Escribí una contraseña nueva."); return; }
    if (newPassword.trim().length < 4) { setPasswordMsg("Mínimo 4 caracteres."); return; }
    if (newPassword.trim() !== confirmPassword.trim()) { setPasswordMsg("Las contraseñas no coinciden."); return; }
    if (!currentStudent) return;
    setAppState(prev => ({ ...prev, students: prev.students.map(s => s.id === currentStudent.id ? { ...s, code: newPassword.trim().toUpperCase() } : s) }));
    setPasswordMsg("✓ Contraseña actualizada.");
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
    const ok = window.confirm(`¿Reiniciar "${selectedModule.title}"?`);
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
    if (!window.confirm(`¿Eliminar a ${student?.name}?`)) return;
    setAppState(prev => {
      const newStudents = prev.students.filter(s => s.id !== studentId);
      const newP = { ...prev.progress }; const newD = { ...prev.dictations };
      delete newP[studentId]; delete newD[studentId];
      return { ...prev, students: newStudents, progress: newP, dictations: newD };
    });
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string, rate: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "pt-BR"; u.rate = rate;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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

  // ─── STYLE TOKENS ────────────────────────────────────────────────────────────
  const BG = "#0a0f1a";
  const GOLD = "#D4A843";
  const GOLD_DIM = "rgba(212,168,67,0.1)";
  const SURFACE = "rgba(20,28,48,0.8)";
  const SURFACE_D = "rgba(8,12,24,0.9)";
  const BORDER = "rgba(255,255,255,0.08)";
  const BORDER_A = "rgba(212,168,67,0.4)";
  const TEXT = "#E8DCC8";
  const TEXT_MID = "#8A7B6A";
  const TEXT_DIM = "#4A3D30";
  const FONT = "'Plus Jakarta Sans',system-ui,sans-serif";
  const MONO = "'DM Mono',monospace";

  const glass = { background: SURFACE, border: `1px solid ${BORDER}`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" };
  const glassDark = { background: SURFACE_D, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" };
  const card = (active: boolean) => ({ ...glass, borderRadius: 16, padding: 16, textAlign: "left" as const, cursor: "pointer", transition: "all 0.2s ease", border: `1px solid ${active ? GOLD : BORDER}`, background: active ? "linear-gradient(135deg,rgba(212,168,67,0.13),rgba(180,140,50,0.04))" : SURFACE, boxShadow: active ? `0 0 0 1px rgba(212,168,67,0.15), 0 0 28px rgba(212,168,67,0.12)` : "none", width: "100%" });
  const btnAccent = { background: `linear-gradient(135deg,${GOLD},#b8922e)`, color: "#0a0f1a", fontWeight: 700, borderRadius: 14, border: "none", cursor: "pointer", padding: "11px 22px", fontSize: 14, fontFamily: FONT, letterSpacing: "0.01em", boxShadow: "0 4px 20px rgba(212,168,67,0.25)", transition: "all 0.2s ease" };
  const tab = (active: boolean) => ({ borderRadius: 10, padding: "7px 15px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.18s", fontFamily: FONT, background: active ? GOLD : "rgba(255,255,255,0.06)", color: active ? "#0a0f1a" : TEXT_MID, boxShadow: active ? "0 4px 14px rgba(212,168,67,0.3)" : "none", whiteSpace: "nowrap" as const });
  const inputStyle = { background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, color: TEXT, padding: "12px 16px", width: "100%", fontSize: 14, fontFamily: FONT, outline: "none" };
  const levelBadge = (l: string) => ({ borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: FONT, background: l==="Básico"?"rgba(52,211,153,0.12)":l==="Intermedio"?"rgba(212,168,67,0.12)":"rgba(251,113,133,0.12)", color: l==="Básico"?"#34d399":l==="Intermedio"?GOLD:"#fb7185" });
  const catColor = (c: string) => {
    const map: Record<string,string> = { "Bienvenida":"#60a5fa","Recepción":GOLD,"Habitaciones":"#a78bfa","Restaurante":"#fb923c","Excursiones":"#34d399","Comunicación Escrita":"#f472b6","Situaciones Difíciles":"#fb7185","Gramática Hotelera":"#94a3b8" };
    return map[c] || GOLD;
  };
  const optBtn = (sel: boolean, correct: boolean, wrong: boolean) => ({ transition: "all 0.15s", border: `1.5px solid ${correct?GOLD:wrong?"#fb7185":sel?GOLD:BORDER}`, borderRadius: 14, padding: "14px 18px", textAlign: "left" as const, width: "100%", background: correct?"rgba(212,168,67,0.15)":wrong?"rgba(251,113,133,0.1)":sel?GOLD_DIM:"rgba(255,255,255,0.03)", color: correct?GOLD:wrong?"#fb7185":TEXT, cursor: "pointer", fontSize: 14, lineHeight: 1.55, fontFamily: FONT, fontWeight: correct?700:400 });
  const mainBg = { background: `radial-gradient(ellipse 80% 50% at 50% -5%, rgba(212,168,67,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(96,165,250,0.03) 0%, transparent 50%), ${BG}`, minHeight: "100vh", color: TEXT, fontFamily: FONT };

  if (loadStatus === "loading") return (
    <div style={{...mainBg, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:22,fontWeight:700,fontFamily:FONT,color:GOLD}}>Cargando Aula Marinas...</div>
        <div style={{color:TEXT_MID,marginTop:8,fontSize:14,fontFamily:FONT}}>Sincronizando progreso ☁️</div>
      </div>
    </div>
  );

  if (!currentStudent) return (
    <div style={{...mainBg, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 16px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap'); input:focus{border-color:${GOLD}!important;box-shadow:0 0 0 3px rgba(212,168,67,0.15)!important;outline:none!important;}`}</style>
      <div style={{width:"100%",maxWidth:960}}>
        <div style={{display:"grid",gap:32,gridTemplateColumns:"repeat(auto-fit,minmax(380px,1fr))"}}>
          <div style={{...glass,borderRadius:28,padding:"40px 40px",boxShadow:"0 0 60px rgba(212,168,67,0.06)"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>HOTEL MARINAS · ES-PT</div>
            <h1 style={{fontSize:44,fontWeight:800,lineHeight:1.1,fontFamily:FONT,margin:0}}>
              Aula<br/><span style={{color:GOLD}}>Marinas</span>
            </h1>
            <p style={{marginTop:16,color:TEXT_MID,lineHeight:1.7,fontFamily:FONT}}>Portugués profesional para el equipo del Hotel Marinas Alto Manzano. Capacitación orientada al huésped brasileño.</p>
            <div style={{marginTop:32,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[{n:MODULES.length,l:"Módulos",s:"Bienvenida · Recepción · Restaurante"},{n:"☁️",l:"Progreso",s:"Guardado en la nube"},{n:"🇧🇷",l:"Portugués",s:"Variedad brasileña"},{n:"🎧",l:"Audio TTS",s:"Pronunciación nativa"}].map(i=>(
                <div key={i.l} style={{...glass,borderRadius:16,padding:16}}>
                  <div style={{fontSize:24,fontWeight:800,color:GOLD,fontFamily:MONO}}>{i.n}</div>
                  <div style={{fontSize:13,fontWeight:700,color:TEXT,marginTop:4,fontFamily:FONT}}>{i.l}</div>
                  <div style={{fontSize:11,color:TEXT_DIM,marginTop:2,fontFamily:FONT}}>{i.s}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{...glass,borderRadius:28,padding:"40px 40px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>INGRESO</div>
            <h2 style={{fontSize:26,fontWeight:800,fontFamily:FONT,margin:0}}>Entrar como colaborador</h2>
            <p style={{marginTop:8,color:TEXT_MID,fontSize:14,fontFamily:FONT}}>El progreso queda guardado aunque entres desde otro dispositivo.</p>
            <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{display:"block",fontSize:13,color:"#cbd5e1",marginBottom:8,fontWeight:500,fontFamily:FONT}}>Usuario</label>
                <input style={inputStyle} value={loginName} onChange={e=>setLoginName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Tu nombre"/>
              </div>
              <div>
                <label style={{display:"block",fontSize:13,color:"#cbd5e1",marginBottom:8,fontWeight:500,fontFamily:FONT}}>Contraseña</label>
                <input style={{...inputStyle,fontFamily:MONO}} type="password" value={loginCode} onChange={e=>setLoginCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Tu contraseña"/>
              </div>
              {loginError&&<p style={{color:"#fb7185",fontSize:13,fontFamily:FONT}}>{loginError}</p>}
              {saveError&&<p style={{color:"#fbbf24",fontSize:13,fontFamily:FONT}}>{saveError}</p>}
              <button style={btnAccent} onClick={login}>Ingresar →</button>
            </div>
            <div style={{...glass,borderRadius:20,padding:20,marginTop:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:12,fontFamily:MONO}}>PANEL DEL PROFESOR</div>
              <button onClick={handleProfessorClick} style={{background:"none",border:"none",color:TEXT_MID,cursor:"pointer",fontSize:14,fontFamily:FONT,width:"100%",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>🔐 Acceso al panel de gestión</span><span style={{color:TEXT_DIM}}>{showProfessorPanel?"▲":"▼"}</span>
              </button>
              {showProfessorPanel&&professorUnlocked&&(
                <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
                  <input style={inputStyle} value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Nombre del colaborador"/>
                  <input style={{...inputStyle,fontFamily:MONO}} value={newStudentCode} onChange={e=>setNewStudentCode(e.target.value)} placeholder="Contraseña"/>
                  <button onClick={addStudent} style={{...btnAccent,textAlign:"center"}}>+ Agregar colaborador</button>
                  <button onClick={resetAllStudents} style={{background:"rgba(251,113,133,0.1)",border:"1px solid rgba(251,113,133,0.3)",color:"#fb7185",borderRadius:12,padding:"10px 16px",cursor:"pointer",fontSize:13,fontFamily:FONT}}>Reset total de todos</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={mainBg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{font-family:'Plus Jakarta Sans',system-ui,sans-serif!important;box-sizing:border-box} .mono-f{font-family:'DM Mono',monospace!important} input:focus,textarea:focus{border-color:${GOLD}!important;box-shadow:0 0 0 3px rgba(212,168,67,0.15)!important;outline:none!important} ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}`}</style>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:50,...glassDark,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:1600,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" as const}}>
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,fontFamily:MONO}}>MARINAS · PT-ES</div>
              <div style={{fontWeight:700,fontSize:17,lineHeight:1.2}}>Hola, <span style={{color:GOLD}}>{currentStudent.name}</span> 👋</div>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
              {[{l:"Progreso",v:`${overallPercent}%`,c:GOLD},{l:"Puntaje",v:`${totalBestScore}/${totalQuestions}`,c:TEXT},{l:"Módulos",v:`${completedModules}/${MODULES.length}`,c:TEXT}].map(x=>(
                <div key={x.l} style={{...glass,borderRadius:12,padding:"7px 14px",fontSize:13}}>
                  <span style={{color:TEXT_MID}}>{x.l} </span><span style={{fontWeight:700,color:x.c,fontFamily:MONO}}>{x.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
            {[{l:"🔑 Mi contraseña",fn:()=>setShowChangePassword(v=>!v),c:"#a78bfa"},{l:showProfessorPanel?"✕ Panel":"📊 Panel",fn:handleProfessorClick,c:TEXT_MID},{l:"Salir →",fn:logout,c:TEXT_MID}].map(b=>(
              <button key={b.l} onClick={b.fn} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:b.c,border:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:FONT,fontWeight:600}}>{b.l}</button>
            ))}
          </div>
        </div>
        <div style={{height:3,background:"rgba(255,255,255,0.05)"}}>
          <div style={{height:"100%",width:`${overallPercent}%`,background:`linear-gradient(90deg,${GOLD},#f0c55a)`,boxShadow:"0 0 10px rgba(212,168,67,0.4)",transition:"width 0.7s ease"}}/>
        </div>
      </div>

      <div style={{maxWidth:1600,margin:"0 auto",padding:"32px 24px"}}>
        {saveError&&<div style={{marginBottom:16,borderRadius:16,border:"1px solid rgba(251,191,36,0.3)",background:"rgba(251,191,36,0.08)",color:"#fbbf24",padding:"12px 16px",fontSize:13,fontFamily:FONT}}>{saveError}</div>}

        {/* CAMBIAR CONTRASEÑA */}
        {showChangePassword&&(
          <div style={{...glass,borderRadius:24,padding:24,marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h3 style={{fontSize:18,fontWeight:700,margin:0,fontFamily:FONT}}>🔑 Cambiar contraseña</h3>
              <button onClick={()=>{setShowChangePassword(false);setPasswordMsg("");setNewPassword("");setConfirmPassword("");}} style={{background:"none",border:"none",color:TEXT_MID,cursor:"pointer",fontSize:20}}>✕</button>
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
              <button onClick={changePassword} style={{...btnAccent,padding:"12px 20px",textAlign:"center" as const}}>Guardar</button>
            </div>
            {passwordMsg&&<div style={{marginTop:12,fontSize:13,fontFamily:FONT,color:passwordMsg.startsWith("✓")?"#34d399":"#fb7185"}}>{passwordMsg}</div>}
          </div>
        )}

        {/* PROFESSOR PANEL */}
        {showProfessorPanel&&professorUnlocked&&(
          <div style={{...glass,borderRadius:24,padding:24,marginBottom:32}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap" as const,gap:16}}>
              <h2 style={{fontSize:20,fontWeight:700,margin:0,fontFamily:FONT}}>Panel del Profesor — Marinas</h2>
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                {(["progress","students","dictations"] as const).map(t=>(
                  <button key={t} onClick={()=>setTeacherTab(t)} style={tab(teacherTab===t)}>{t==="progress"?"📊 Progreso":t==="students"?"👥 Colaboradores":"🎙 Dictados"}</button>
                ))}
                <button onClick={resetAllStudents} style={{borderRadius:12,padding:"7px 15px",fontSize:13,fontWeight:600,background:"rgba(251,113,133,0.12)",color:"#fb7185",border:"1px solid rgba(251,113,133,0.2)",cursor:"pointer",fontFamily:FONT}}>Reset total</button>
              </div>
            </div>

            {teacherTab==="progress"&&(
              <div style={{overflowX:"auto" as const,borderRadius:16,border:`1px solid ${BORDER}`}}>
                <table style={{width:"100%",fontSize:13,borderCollapse:"collapse" as const,fontFamily:FONT}}>
                  <thead><tr style={{background:"rgba(255,255,255,0.04)",color:TEXT_MID}}>
                    <th style={{textAlign:"left",padding:"12px 16px",fontWeight:600}}>Colaborador</th>
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
                          {p?<button onClick={()=>{if(window.confirm(`¿Reiniciar ${m.title} de ${row.name}?`))resetStudentModule(row.id,m.id);}} style={{background:"none",border:"none",color:GOLD,fontWeight:700,fontFamily:MONO,fontSize:12,cursor:"pointer"}}>{p.score}/{p.total}</button>:<span style={{color:TEXT_DIM}}>—</span>}
                        </td>);})}
                      <td style={{textAlign:"center",padding:"10px 16px",fontWeight:700,color:GOLD,fontFamily:MONO}}>{row.bestScore}/{totalQuestions}</td>
                      <td style={{textAlign:"center",padding:"10px 16px"}}>
                        <span style={{fontSize:12,fontWeight:700,padding:"3px 8px",borderRadius:99,background:row.completedMods===MODULES.length?"rgba(52,211,153,0.12)":row.completedMods>0?"rgba(212,168,67,0.12)":"rgba(71,85,105,0.3)",color:row.completedMods===MODULES.length?"#34d399":row.completedMods>0?GOLD:TEXT_MID}}>{Math.round((row.completedMods/MODULES.length)*100)}%</span>
                      </td>
                      <td style={{textAlign:"center",padding:"8px 16px"}}>
                        <button onClick={()=>resetStudentAll(row.id,row.name)} style={{background:"none",border:"none",color:"#fb7185",fontSize:12,cursor:"pointer",fontFamily:FONT}}>🗑️ Todo</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {teacherTab==="students"&&(
              <div style={{display:"grid",gap:24,gridTemplateColumns:"1fr 1fr"}}>
                <div style={{...glassDark,borderRadius:20,padding:20}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>AGREGAR COLABORADOR</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <input style={inputStyle} value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Nombre"/>
                    <input style={{...inputStyle,fontFamily:MONO}} value={newStudentCode} onChange={e=>setNewStudentCode(e.target.value)} placeholder="Contraseña"/>
                    <button onClick={addStudent} style={{...btnAccent,textAlign:"center",padding:"11px 16px"}}>+ Agregar</button>
                  </div>
                </div>
                <div style={{...glassDark,borderRadius:20,padding:20}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>COLABORADORES REGISTRADOS</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:320,overflowY:"auto" as const}}>
                    {appState.students.length === 0 ? <p style={{color:TEXT_DIM,fontSize:13,fontFamily:FONT}}>No hay colaboradores aún. Agregá el primero.</p> :
                    appState.students.map(s=>(
                      <div key={s.id} style={{...glass,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div><div style={{fontWeight:600,fontSize:14,color:TEXT}}>{s.name}</div><div style={{fontSize:12,color:TEXT_DIM,fontFamily:MONO}}>{s.code}</div></div>
                        <button onClick={()=>removeStudent(s.id)} style={{background:"none",border:"none",color:"#fb7185",cursor:"pointer",fontSize:12,fontFamily:FONT}}>Eliminar</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {teacherTab==="dictations"&&(
              <div style={{overflowX:"auto" as const,borderRadius:16,border:`1px solid ${BORDER}`}}>
                <table style={{width:"100%",fontSize:13,borderCollapse:"collapse" as const,fontFamily:FONT}}>
                  <thead><tr style={{background:"rgba(255,255,255,0.04)",color:TEXT_MID}}>
                    <th style={{textAlign:"left",padding:"12px 16px",fontWeight:600}}>Colaborador</th>
                    {MODULES.map(m=><th key={m.id} style={{textAlign:"center",padding:"12px 4px",fontSize:12}} title={m.title}>{m.emoji}</th>)}
                    <th style={{textAlign:"center",padding:"12px 16px",fontWeight:600}}>Promedio</th>
                  </tr></thead>
                  <tbody>{professorRows.map((row,i)=>(
                    <tr key={row.id} style={{borderTop:`1px solid rgba(255,255,255,0.05)`,background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                      <td style={{padding:"10px 16px",fontWeight:500}}>{row.name}</td>
                      {MODULES.map(m=>{const d=(appState.dictations[row.id]||{})[m.id];return<td key={m.id} style={{textAlign:"center",padding:"8px 4px"}}>{d!=null?<span style={{fontFamily:MONO,fontSize:12,fontWeight:700,color:d.score>=80?"#34d399":d.score>=50?GOLD:"#fb7185"}}>{d.score}%</span>:<span style={{color:TEXT_DIM}}>—</span>}</td>;})}
                      <td style={{textAlign:"center",padding:"10px 16px",fontWeight:700,color:GOLD,fontFamily:MONO}}>{row.dictAvg!=null?`${row.dictAvg}%`:"—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
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
                  <span style={{fontFamily:MONO,fontSize:12,fontWeight:700,color:prog?GOLD:TEXT_DIM}}>{prog?`${prog.score}/${prog.total}`:"—"}</span>
                </div>
                {prog&&(
                  <div style={{marginTop:10,height:4,borderRadius:99,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${GOLD},#f0c55a)`,width:`${Math.round((prog.score/prog.total)*100)}%`,transition:"width 0.7s ease"}}/>
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
                    <span style={{color:TEXT_MID}}>Mejor: </span><span style={{fontWeight:700,color:GOLD,fontFamily:MONO}}>{moduleProgress.score}/{moduleProgress.total}</span>
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
                  <button onClick={()=>speak(selectedModule.reading.join(" "),0.9)} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:TEXT_MID,border:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:8}}>🔊 Escuchar en portugués</button>
                  {isSpeaking&&<button onClick={stopSpeaking} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:"#fb7185",border:"1px solid rgba(251,113,133,0.3)",cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:8}}>⏹ Detener</button>}
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
                  <div style={{...glass,borderRadius:12,padding:"8px 16px",fontFamily:MONO,fontSize:14,fontWeight:700,color:GOLD}}>{currentQuestionIndex+1}/{selectedModule.quiz.length}</div>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99,marginBottom:28,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${((currentQuestionIndex+(submitted?1:0))/selectedModule.quiz.length)*100}%`,background:`linear-gradient(90deg,${GOLD},#f0c55a)`,transition:"width 0.4s ease",borderRadius:99}}/>
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
                  <h3 style={{fontSize:20,fontWeight:700,margin:0,fontFamily:FONT}}>🎙 Dictado en portugués</h3>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>speak(selectedModule.dictation,0.75)} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:TEXT_MID,border:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:FONT}}>🔊 Lento</button>
                    <button onClick={()=>speak(selectedModule.dictation,1.0)} style={{...glass,borderRadius:12,padding:"9px 16px",fontSize:13,color:TEXT_MID,border:`1px solid ${BORDER}`,cursor:"pointer",fontFamily:FONT}}>▶ Normal</button>
                    {isSpeaking&&<button onClick={stopSpeaking} style={{borderRadius:12,padding:"9px 16px",fontSize:13,color:"#fb7185",border:"1px solid rgba(251,113,133,0.3)",background:"rgba(251,113,133,0.08)",cursor:"pointer",fontFamily:FONT,fontWeight:600}}>⏹ Detener</button>}
                  </div>
                </div>
                <p style={{color:TEXT_MID,fontSize:14,marginBottom:20,lineHeight:1.6,fontFamily:FONT}}>Escuchá el audio en portugués y escribí la frase tal como la escuchaste. Podés repetirlo varias veces.</p>
                <textarea value={dictationText} onChange={e=>setDictationText(e.target.value)} rows={4} placeholder="Escribí lo que escuchaste en portugués..." style={{...inputStyle,resize:"none" as const,lineHeight:1.7,borderRadius:16,padding:"16px 20px"}}/>
                <button onClick={checkDictation} style={{...btnAccent,marginTop:16,display:"inline-block"}}>Corregir dictado</button>
                {(dictationResult||currentDictation)&&(()=>{const r=dictationResult||currentDictation!;return(
                  <div style={{...glassDark,borderRadius:20,padding:20,marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{fontSize:32,fontWeight:800,fontFamily:MONO,color:r.score>=80?"#34d399":r.score>=50?GOLD:"#fb7185"}}>{r.score}%</div>
                      <div style={{fontSize:14,color:TEXT_MID,fontFamily:FONT}}>{r.score===100?"¡Perfeito! 🎉":r.score>=80?"¡Muito bem!":r.score>=50?"Bom progresso":"Continue praticando"}</div>
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
                      <div><div style={{fontWeight:600,fontSize:14,fontFamily:FONT,color:TEXT}}>{item.es}</div><div style={{fontSize:11,color:TEXT_DIM,marginTop:2,fontFamily:FONT}}>Español</div></div>
                      <div style={{textAlign:"right" as const}}><div style={{fontWeight:600,fontSize:14,color:GOLD,fontFamily:FONT}}>{item.pt}</div><div style={{fontSize:11,color:TEXT_DIM,marginTop:2,fontFamily:FONT}}>Portugués 🇧🇷</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{...glass,borderRadius:24,padding:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>MI PROGRESO</div>
              <div style={{fontSize:52,fontWeight:800,color:GOLD,fontFamily:MONO,lineHeight:1}}>{overallPercent}%</div>
              <div style={{color:TEXT_MID,fontSize:13,marginTop:4,fontFamily:FONT}}>completado</div>
              <div style={{marginTop:16,height:6,borderRadius:99,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,width:`${overallPercent}%`,background:`linear-gradient(90deg,${GOLD},#f0c55a)`,boxShadow:"0 0 12px rgba(212,168,67,0.35)",transition:"width 0.7s ease"}}/>
              </div>
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[{n:completedModules,l:"Módulos"},{n:totalBestScore,l:"Puntos",c:GOLD}].map(x=>(
                  <div key={x.l} style={{...glassDark,borderRadius:14,padding:14}}>
                    <div style={{fontSize:20,fontWeight:800,fontFamily:MONO,color:(x as any).c||TEXT}}>{x.n}</div>
                    <div style={{fontSize:12,color:TEXT_DIM,marginTop:2,fontFamily:FONT}}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{...glass,borderRadius:24,padding:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:TEXT_DIM,marginBottom:16,fontFamily:MONO}}>MÓDULOS</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:480,overflowY:"auto" as const,paddingRight:4}}>
                {MODULES.map(m=>{const p=studentProgress[m.id]; const isA=m.id===selectedModuleId; return(
                  <button key={m.id} onClick={()=>setSelectedModuleId(m.id)} style={{display:"flex",alignItems:"center",gap:12,borderRadius:12,padding:"10px 12px",background:isA?"rgba(212,168,67,0.08)":"transparent",border:`1px solid ${isA?BORDER_A:"transparent"}`,cursor:"pointer",textAlign:"left" as const,transition:"all 0.15s",width:"100%"}}>
                    <span style={{fontSize:16}}>{m.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:isA?700:500,color:isA?TEXT:"#94a3b8",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{m.title}</div>
                      <div style={{fontSize:11,color:catColor(m.category),marginTop:1,fontFamily:MONO}}>{m.category}</div>
                    </div>
                    {p?<span style={{fontFamily:MONO,fontSize:12,fontWeight:700,color:GOLD,whiteSpace:"nowrap" as const}}>{p.score}/{p.total}</span>:<span style={{color:TEXT_DIM,fontSize:12}}>—</span>}
                  </button>
                );})}
              </div>
            </div>

            <div style={{...glass,borderRadius:24,padding:24}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:TEXT_DIM,marginBottom:12,fontFamily:MONO}}>FRASE DEL DÍA 🇧🇷</div>
              <p style={{fontSize:14,color:"#cbd5e1",lineHeight:1.7,margin:0,fontFamily:FONT}}>💡 <span style={{color:GOLD,fontWeight:600}}>'Com muito prazer'</span> — la frase más importante del servicio de excelencia. Decila con una sonrisa genuina y transforma cada interacción.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}