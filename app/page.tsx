"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
type DictationResult = {
  exact: boolean;
  score: number;
  written: string;
  expected: string;
  updatedAt: string;
};

type AppState = {
  students: Student[];
  currentStudentId: string | null;
  progress: Record<string, Record<string, ModuleProgress>>;
  dictations: Record<string, Record<string, DictationResult>>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const DB_ROW_ID = "global-app-state";

const MODULES: ModuleType[] = [
  {
    id: "control-interno",
    title: "Control interno",
    level: "Intermedio",
    category: "Laboratorio",
    emoji: "🔬",
    description: "Monitoreo analítico, tendencias y decisiones preventivas.",
    readingTitle: "Una desviación que parecía pequeña",
    reading: [
      "Durante una revisión de rutina, el equipo técnico detectó una desviación en los controles internos de uno de los analitos más procesados de la semana.",
      "Al principio, la diferencia parecía pequeña, pero al comparar los datos con los registros históricos, observaron que la tendencia se repetía desde hacía varios días.",
      "Como medida preventiva, suspendieron temporalmente la liberación de algunos resultados, repitieron las corridas y comunicaron el hallazgo al área responsable."
    ],
    vocab: [
      { es: "control interno", pt: "controle interno" },
      { es: "desviación", pt: "desvio" },
      { es: "reactivo", pt: "reagente" },
      { es: "tendencia", pt: "tendência" }
    ],
    quiz: [
      {
        question: "¿Qué detectó primero el equipo técnico?",
        options: [
          "Una falla en la refrigeración",
          "Una desviación en los controles internos",
          "Un error de facturación"
        ],
        answer: "Una desviación en los controles internos"
      },
      {
        question: "¿Qué hicieron como medida preventiva?",
        options: [
          "Suspendieron temporalmente algunos resultados",
          "Cambiaron a todo el personal",
          "Descartaron el equipamiento"
        ],
        answer: "Suspendieron temporalmente algunos resultados"
      },
      {
        question: "¿Por qué es importante identificar tendencias?",
        options: [
          "Para reducir reuniones",
          "Para evitar errores mayores",
          "Para eliminar controles"
        ],
        answer: "Para evitar errores mayores"
      }
    ],
    dictation:
      "El equipo detectó una desviación en los controles internos y suspendió temporalmente la liberación de resultados."
  },
  {
    id: "westgard",
    title: "Reglas de Westgard",
    level: "Intermedio",
    category: "Laboratorio",
    emoji: "📊",
    description: "Análisis de reglas y toma de decisiones.",
    readingTitle: "Una alerta en el turno de la mañana",
    reading: [
      "En el turno de la mañana, una analista observó que uno de los niveles de control presentaba un comportamiento inusual.",
      "El equipo decidió verificar si el comportamiento correspondía a una variación aleatoria o a un problema sistemático.",
      "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras y a justificar técnicamente cada acción."
    ],
    vocab: [
      { es: "media", pt: "média" },
      { es: "precisión", pt: "precisão" },
      { es: "variación aleatoria", pt: "variação aleatória" },
      { es: "problema sistemático", pt: "problema sistemático" }
    ],
    quiz: [
      {
        question: "¿Qué observó la analista?",
        options: [
          "Una pérdida de datos",
          "Un comportamiento inusual",
          "Una caída del sistema"
        ],
        answer: "Un comportamiento inusual"
      },
      {
        question: "¿Qué quiso determinar el equipo?",
        options: [
          "Si el problema era aleatorio o sistemático",
          "Si debían cambiar de laboratorio",
          "Si el cliente aceptaría el resultado"
        ],
        answer: "Si el problema era aleatorio o sistemático"
      },
      {
        question: "Las reglas de Westgard ayudan a...",
        options: [
          "Trabajar sin registros",
          "Evitar todo control",
          "Tomar decisiones seguras"
        ],
        answer: "Tomar decisiones seguras"
      }
    ],
    dictation:
      "Comprender las reglas de Westgard ayuda a tomar decisiones más seguras en el laboratorio."
  }
];

const defaultStudents: Student[] = [
  { id: "franco", name: "Franco", code: "FRANCO" }
];

function createInitialState(): AppState {
  return {
    students: defaultStudents,
    currentStudentId: null,
    progress: {},
    dictations: {}
  };
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const CATEGORIES = ["Todos", "Laboratorio", "Gestión", "Comunicación", "Tecnología"];

async function loadRemoteState(): Promise<AppState | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("aula_controllab_state")
    .select("data")
    .eq("id", DB_ROW_ID)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return (data?.data as AppState) || null;
}

async function saveRemoteState(state: AppState): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from("aula_controllab_state").upsert(
    {
      id: DB_ROW_ID,
      data: state,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>(createInitialState);
  const [loading, setLoading] = useState(true);
  const [loginName, setLoginName] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(MODULES[0].id);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dictationText, setDictationText] = useState("");
  const [dictationResult, setDictationResult] = useState<DictationResult | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [activeSection, setActiveSection] = useState<"reading" | "quiz" | "dictation" | "vocab">("reading");

  useEffect(() => {
    const init = async () => {
      try {
        const remote = await loadRemoteState();
        if (remote) {
          setAppState({
            students: remote.students?.length ? remote.students : defaultStudents,
            currentStudentId: null,
            progress: remote.progress || {},
            dictations: remote.dictations || {}
          });
        } else {
          const initial = createInitialState();
          setAppState(initial);
          await saveRemoteState(initial);
        }
      } catch {
        setAppState(createInitialState());
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      saveRemoteState(appState).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [appState, loading]);

  const currentStudent =
    appState.students.find((s) => s.id === appState.currentStudentId) ?? null;

  const selectedModule =
    MODULES.find((m) => m.id === selectedModuleId) ?? MODULES[0];

  const studentProgress = currentStudent ? appState.progress[currentStudent.id] || {} : {};
  const studentDictations = currentStudent ? appState.dictations[currentStudent.id] || {} : {};
  const moduleProgress =
    studentProgress[selectedModuleId] || {
      completed: false,
      score: 0,
      total: selectedModule.quiz.length,
      attempts: 0
    };

  const currentQuestion = selectedModule.quiz[currentQuestionIndex];
  const currentDictation = studentDictations[selectedModuleId] || null;

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setSubmitted(false);
    setQuizAnswers({});
    setDictationText("");
    setDictationResult(null);
    setActiveSection("reading");
  }, [selectedModuleId, appState.currentStudentId]);

  const filteredModules =
    activeCategory === "Todos"
      ? MODULES
      : MODULES.filter((m) => m.category === activeCategory);

  const totalQuestions = useMemo(
    () => MODULES.reduce((sum, m) => sum + m.quiz.length, 0),
    []
  );
  const completedModules = Object.keys(studentProgress).length;
  const totalBestScore = MODULES.reduce(
    (sum, m) => sum + (studentProgress[m.id]?.score || 0),
    0
  );
  const overallPercent = Math.round((completedModules / MODULES.length) * 100);

  const login = () => {
    const found = appState.students.find(
      (s) =>
        normalize(s.name) === normalize(loginName) &&
        normalize(s.code) === normalize(loginCode)
    );

    if (!found) {
      setLoginError("Usuario o contraseña incorrectos.");
      return;
    }

    setAppState((prev) => ({ ...prev, currentStudentId: found.id }));
    setLoginError("");
    setLoginName("");
    setLoginCode("");
  };

  const logout = () => {
    setAppState((prev) => ({ ...prev, currentStudentId: null }));
  };

  const saveProgress = (scoreValue: number, totalValue: number) => {
    if (!currentStudent) return;

    setAppState((prev) => {
      const prevSP = prev.progress[currentStudent.id] || {};
      const prevMod = prevSP[selectedModuleId] || {
        completed: false,
        score: 0,
        total: totalValue,
        attempts: 0
      };

      return {
        ...prev,
        progress: {
          ...prev.progress,
          [currentStudent.id]: {
            ...prevSP,
            [selectedModuleId]: {
              completed: true,
              score: Math.max(prevMod.score || 0, scoreValue),
              total: totalValue,
              attempts: (prevMod.attempts || 0) + 1
            }
          }
        }
      };
    });
  };

  const resetCurrentModule = () => {
    if (!currentStudent) return;

    setAppState((prev) => {
      const newProgress = { ...(prev.progress[currentStudent.id] || {}) };
      const newDictations = { ...(prev.dictations[currentStudent.id] || {}) };

      delete newProgress[selectedModuleId];
      delete newDictations[selectedModuleId];

      return {
        ...prev,
        progress: { ...prev.progress, [currentStudent.id]: newProgress },
        dictations: { ...prev.dictations, [currentStudent.id]: newDictations }
      };
    });

    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setSubmitted(false);
    setQuizAnswers({});
    setDictationText("");
    setDictationResult(null);
    setActiveSection("reading");
  };

  const resetAllStudentsEverything = () => {
    setAppState((prev) => ({
      ...prev,
      progress: {},
      dictations: {}
    }));
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < selectedModule.quiz.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(quizAnswers[nextIndex] || "");
      setSubmitted(false);
      return;
    }

    const correctCount = selectedModule.quiz.reduce(
      (sum, q, i) => sum + (quizAnswers[i] === q.answer ? 1 : 0),
      0
    );

    saveProgress(correctCount, selectedModule.quiz.length);
    setCurrentQuestionIndex(0);
    setSelectedOption("");
    setSubmitted(false);
    setQuizAnswers({});
    setActiveSection("reading");
  };

  const setAnswerMemory = (value: string) => {
    setSelectedOption(value);
    setQuizAnswers((prev) => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const checkDictation = () => {
    if (!currentStudent) return;

    const expected = normalize(selectedModule.dictation);
    const written = normalize(dictationText);
    const expectedWords = expected.split(" ").filter(Boolean);
    const writtenWords = written.split(" ").filter(Boolean);
    const matches = writtenWords.filter((w, i) => w === expectedWords[i]).length;
    const score = expectedWords.length
      ? Math.round((matches / expectedWords.length) * 100)
      : 0;

    const result: DictationResult = {
      exact: expected === written,
      score,
      written: dictationText,
      expected: selectedModule.dictation,
      updatedAt: new Date().toLocaleString()
    };

    setDictationResult(result);

    setAppState((prev) => ({
      ...prev,
      dictations: {
        ...prev.dictations,
        [currentStudent.id]: {
          ...(prev.dictations[currentStudent.id] || {}),
          [selectedModuleId]: result
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h1 className="text-3xl font-bold mb-2">Aula Controllab</h1>
          <p className="text-slate-400 mb-6">Usuario: Franco · Contraseña: Franco</p>

          <div className="space-y-4">
            <input
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="Usuario"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3"
            />
            <input
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3"
            />
            {loginError && <p className="text-rose-400 text-sm">{loginError}</p>}
            <button
              onClick={login}
              className="w-full rounded-xl bg-emerald-400 text-slate-900 font-bold px-4 py-3"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Hola, {currentStudent.name}</h1>
            <p className="text-slate-400">
              Progreso: {overallPercent}% · Puntaje: {totalBestScore}/{totalQuestions}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={resetCurrentModule}
              className="rounded-xl px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-400/20"
            >
              Reset módulo
            </button>
            <button
              onClick={resetAllStudentsEverything}
              className="rounded-xl px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-400/20"
            >
              Reset total
            </button>
            <button
              onClick={logout}
              className="rounded-xl px-4 py-2 bg-slate-800 border border-slate-700"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl border ${
                activeCategory === cat
                  ? "bg-emerald-400 text-slate-900 border-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {filteredModules.map((module) => {
            const prog = studentProgress[module.id];
            return (
              <button
                key={module.id}
                onClick={() => setSelectedModuleId(module.id)}
                className={`text-left rounded-2xl p-4 border ${
                  module.id === selectedModuleId
                    ? "bg-emerald-400/10 border-emerald-400"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <div className="text-2xl mb-2">{module.emoji}</div>
                <div className="text-sm text-slate-400">{module.category}</div>
                <div className="font-bold">{module.title}</div>
                <div className="text-xs text-slate-500 mt-2">
                  {prog ? `${prog.score}/${prog.total}` : "—"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-start gap-4 flex-wrap mb-6">
            <div>
              <div className="text-slate-400 text-sm">{selectedModule.category}</div>
              <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
              <p className="text-slate-400 mt-2">{selectedModule.description}</p>
            </div>
            <div className="text-sm text-slate-300">
              Mejor: {moduleProgress.score}/{moduleProgress.total} · Intentos: {moduleProgress.attempts}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {(["reading", "quiz", "dictation", "vocab"] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`px-4 py-2 rounded-xl ${
                  activeSection === sec ? "bg-emerald-400 text-slate-900" : "bg-slate-800 text-slate-300"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {activeSection === "reading" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{selectedModule.readingTitle}</h3>
              {selectedModule.reading.map((para, i) => (
                <p key={i} className="text-slate-200 leading-7">
                  {para}
                </p>
              ))}
            </div>
          )}

          {activeSection === "quiz" && (
            <div>
              <h3 className="text-xl font-bold mb-4">
                Pregunta {currentQuestionIndex + 1} de {selectedModule.quiz.length}
              </h3>
              <p className="mb-4 text-lg">{currentQuestion.question}</p>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const sel = selectedOption === option;
                  const correct = submitted && option === currentQuestion.answer;
                  const wrong = submitted && sel && option !== currentQuestion.answer;

                  return (
                    <button
                      key={option}
                      onClick={() => !submitted && setAnswerMemory(option)}
                      disabled={submitted}
                      className={`w-full text-left rounded-xl px-4 py-3 border ${
                        correct
                          ? "border-emerald-400 bg-emerald-400/10"
                          : wrong
                          ? "border-rose-400 bg-rose-400/10"
                          : sel
                          ? "border-emerald-400"
                          : "border-slate-700 bg-slate-800"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className="rounded-xl px-5 py-3 bg-emerald-400 text-slate-900 font-bold disabled:opacity-40"
                  >
                    Comprobar
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="rounded-xl px-5 py-3 bg-emerald-400 text-slate-900 font-bold"
                  >
                    {currentQuestionIndex < selectedModule.quiz.length - 1
                      ? "Siguiente"
                      : "Finalizar"}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeSection === "dictation" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Dictado</h3>
              <textarea
                value={dictationText}
                onChange={(e) => setDictationText(e.target.value)}
                rows={4}
                placeholder="Escribí lo que escuchaste..."
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-white px-4 py-4"
              />
              <button
                onClick={checkDictation}
                className="mt-4 rounded-xl px-5 py-3 bg-emerald-400 text-slate-900 font-bold"
              >
                Corregir
              </button>

              {(dictationResult || currentDictation) && (
                <div className="mt-6 rounded-2xl bg-slate-800 border border-slate-700 p-4">
                  <div className="text-2xl font-bold mb-2">
                    {(dictationResult || currentDictation)?.score}%
                  </div>
                  <div className="text-slate-300">
                    Frase modelo: {(dictationResult || currentDictation)?.expected}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "vocab" && (
            <div className="grid md:grid-cols-2 gap-3">
              {selectedModule.vocab.map((item) => (
                <div key={item.es} className="rounded-xl bg-slate-800 border border-slate-700 p-4">
                  <div className="font-bold">{item.es}</div>
                  <div className="text-emerald-400">{item.pt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}