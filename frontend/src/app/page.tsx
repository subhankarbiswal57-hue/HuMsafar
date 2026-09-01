"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BrainCircuit, Map, ShieldCheck, Users, ArrowRight, Activity,
  Route, Landmark, TrainFront, Zap, BarChart3, Bell, ChevronRight,
  Github, Globe, Lock, Cpu, Layers, TrendingUp
} from "lucide-react";

/* ─── Animated Counter ─── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <>{count.toLocaleString()}{suffix}</>;
}

/* ─── Floating Orbs Background ─── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary-500/20 blur-[100px] animate-float" />
      <div className="absolute top-1/3 -right-20 h-60 w-60 rounded-full bg-accent-400/15 blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-20 left-1/4 h-72 w-72 rounded-full bg-emerald/10 blur-[90px] animate-float" style={{ animationDelay: "4s" }} />
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary-400/30 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-primary-500/5 card-hover"
    >
      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-400/20 p-3 ring-1 ring-primary-400/20">
        <Icon className="h-6 w-6 text-primary-300" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary-400 opacity-0 transition-opacity group-hover:opacity-100">
        Learn more <ChevronRight className="h-3 w-3" />
      </div>
    </motion.div>
  );
}

/* ─── Stat Pill ─── */
function StatPill({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-5 backdrop-blur-sm">
      <span className="text-3xl font-bold text-white">
        <Counter end={value} suffix={suffix} />
      </span>
      <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}

/* ─── Role Card ─── */
function RoleCard({ icon: Icon, role, abilities, gradient }: { icon: any; role: string; abilities: string[]; gradient: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
    >
      <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h4 className="mb-3 font-semibold text-white">{role}</h4>
      <ul className="space-y-2">
        {abilities.map((a, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
            <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-400" />
            {a}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="relative min-h-screen bg-mesh bg-grid text-white">
      <FloatingOrbs />

      {/* ─── Navbar ─── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-strong shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-400 shadow-lg shadow-primary-500/25">
              <Route className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">HuMsafar</span>
              <span className="ml-2 hidden rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-emerald sm:inline-block">
                <Activity className="mr-1 inline h-3 w-3" />LIVE
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">Features</a>
            <a href="#roles" className="text-sm text-slate-400 transition-colors hover:text-white">Roles</a>
            <a href="#stats" className="text-sm text-slate-400 transition-colors hover:text-white">Metrics</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-primary-500/40 hover:brightness-110"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-300">
            <BrainCircuit className="h-3.5 w-3.5" />
            AI-Powered Infrastructure Intelligence
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
        >
          Smarter Roads.{" "}
          <span className="gradient-text">Resilient</span>{" "}
          Infrastructure.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400"
        >
          Predictive maintenance, real-time GIS mapping, and citizen engagement — all unified in one AI-driven platform
          for road, bridge, and transit infrastructure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary-500/25 transition-all hover:shadow-primary-500/40 hover:brightness-110"
          >
            Launch Platform
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/portal/report"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
          >
            <Bell className="h-4 w-4" />
            Report an Issue
          </Link>
        </motion.div>

        {/* Hero bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-900 to-transparent" />
      </section>

      {/* ─── Stats Strip ─── */}
      <section id="stats" className="relative z-10 -mt-16 px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          <StatPill label="Roads Monitored" value={12480} />
          <StatPill label="Condition Index" value={94} suffix="%" />
          <StatPill label="AI Predictions" value={38700} />
          <StatPill label="Issues Resolved" value={9210} />
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-primary-400">Platform Capabilities</span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything you need for <span className="gradient-text">intelligent infrastructure</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">From AI-driven prediction to citizen grievance redressal, our platform covers the full lifecycle of infrastructure management.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={BrainCircuit} title="AI Predictive Maintenance" desc="RandomForest models predict road deterioration and bridge failure probability before they happen, enabling proactive maintenance scheduling." delay={0} />
          <FeatureCard icon={Map} title="GIS Spatial Mapping" desc="Interactive Leaflet-powered maps with heatmaps, spatial queries, and real-time asset condition overlays across your entire road network." delay={0.1} />
          <FeatureCard icon={Bell} title="Citizen Grievance Portal" desc="Citizens report potholes and hazards with geo-tagged photos. Track resolution status in real-time with transparent governance." delay={0.2} />
          <FeatureCard icon={ShieldCheck} title="Multi-Role Governance" desc="Role-based access for Admin, Municipal Planner, Field Engineer, and Citizen — each with tailored dashboards and permissions." delay={0.3} />
          <FeatureCard icon={BarChart3} title="Analytics Dashboard" desc="Rich visualizations with Recharts — condition distributions, maintenance trends, budget utilization, and AI confidence scores." delay={0.4} />
          <FeatureCard icon={Layers} title="Asset Registry" desc="Comprehensive road, bridge, and transit asset database with inspection history, maintenance logs, and condition assessments." delay={0.5} />
        </div>
      </section>

      {/* ─── Roles ─── */}
      <section id="roles" className="relative z-10 mx-auto max-w-7xl px-6 pb-28">
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent-400">Role-Based Access</span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Built for every <span className="gradient-text-warm">stakeholder</span></h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <RoleCard
            icon={Lock}
            role="Administrator"
            gradient="from-primary-600 to-primary-800"
            abilities={["Full system governance", "User & role management", "Budget allocation", "Audit logs & compliance"]}
          />
          <RoleCard
            icon={TrendingUp}
            role="Municipal Planner"
            gradient="from-accent-500 to-accent-600"
            abilities={["Infrastructure analytics", "AI prediction reviews", "Maintenance scheduling", "GIS spatial planning"]}
          />
          <RoleCard
            icon={Cpu}
            role="Field Engineer"
            gradient="from-emerald to-emerald-dark"
            abilities={["Inspection workflows", "Asset condition updates", "Photo documentation", "Work order management"]}
          />
          <RoleCard
            icon={Users}
            role="Citizen"
            gradient="from-warning to-warning-dark"
            abilities={["Report infrastructure issues", "Track complaint status", "View nearby road conditions", "Rate resolved issues"]}
          />
        </div>
      </section>

      {/* ─── Tech Strip ─── */}
      <section className="relative z-10 border-t border-white/[0.06] py-16">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-6">
          {["Next.js 14", "Express + Prisma", "PostgreSQL", "FastAPI + scikit-learn", "Leaflet GIS", "JWT + OAuth2", "Recharts", "Framer Motion"].map((t) => (
            <span key={t} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-slate-400">{t}</span>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-400">
              <Route className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">HuMsafar</span>
          </div>
          <p className="text-xs text-slate-500">© 2024 HuMsafar. AI-Powered Infrastructure Resilience Platform.</p>
          <div className="flex gap-4">
            <a href="https://github.com/subhankarbiswal57-hue/HuMsafar" target="_blank" rel="noopener noreferrer" className="text-slate-500 transition-colors hover:text-white">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-500 transition-colors hover:text-white">
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
