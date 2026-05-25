import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Bot, MessagesSquare, BarChart3, Fingerprint } from "lucide-react";


const capabilities = [
  {
    title: "Agentic-AI Integration & Automation",
    desc: "Seamlessly integrates with legacy systems with minimal changes. Agile delivery to meet your workflow needs. Automatically executes manual tasks in human-like fashion.",
    icon: Bot,
  },
  {
    title: "Context-Aware Collaboration",
    desc: "Chat to analyze, act, collaborate. AI understands Insurance terms. Learns from past conversation & contextualizes next actions.",
    icon: MessagesSquare,
  },
  {
    title: "Customized Risk Insights",
    desc: "Intuitive correlated insights with narratives. Recommended action at every step. Access to detailed data at any time.",
    icon: BarChart3,
  },
  {
    title: "Insurance Sensitive Architecture",
    desc: "Agents orchestrated with deterministic & probabilistic components. Fallback mechanisms & guardrails built native to the workflow.",
    icon: Layers,
  },
];

export default function Index() {
  const { user } = useAuth();

  const firstName = user?.name
    ? user.name
      .replace(/\./g, " ")
      .trim()
      .split(/\s+/)[0]
      .replace(/^./, (c) => c.toUpperCase())
    : "User";

  return (
    <div className="flex-1 h-full w-full overflow-y-auto bg-background text-foreground pt-12 pb-24">
      {/* Subtle background orbs — uses theme‑transparent colours so they work in both light/dark */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── Header / Greeting ── */}
        <header
          className="flex justify-between items-center mb-20 animate-fade-in opacity-0"
          style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Fingerprint className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">Sense</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Welcome back,{" "}
            <span className="text-foreground font-medium">{firstName}</span>
          </span>
        </header>

        {/* ── Hero ── */}
        <section
          className="max-w-4xl pt-10 pb-24 animate-fade-in opacity-0"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <h1 className="text-5xl lg:text-7xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
            One{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
              Super AI
            </span>{" "}
            <br />
            for all Insurance Functions.
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl font-light mb-10 leading-relaxed">
            Deploy once — Run everywhere. Bringing the AI Era directly to
            Commercial and Specialty Insurance.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg group"
            >
              Try Sense Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/grounding-module"
              className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-muted transition-colors shadow-sm"
            >
              Knowledge Base
            </Link>
          </div>
        </section>

        {/* ── Capabilities ── */}
        <section
          className="py-5 border-border animate-fade-in opacity-0"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
        >
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left */}
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Ask anything.<br />Do everything.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Break rigid workflows, supercharge analysis, and deliver
                hyper-personalization. Create sustainable competitive advantage
                with your own AI IP.
              </p>
              <div className="bg-primary/5 border-l-2 border-primary p-6 rounded-r-2xl">
                <p className="text-foreground font-medium">
                  "AI that is almost 'Sense-tient', that's why we call it Sense."
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              {capabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-2xl border border-border bg-background hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <cap.icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground mb-1">
                      {cap.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}