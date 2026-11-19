import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users2,
  GitFork,
  Search,
  HeartPulse,
  ShieldCheck,
  FolderArchive,
  ArrowRight,
  Sparkles,
  TreePine,
  CheckCircle2,
  Calendar,
  Building,
  Lock,
} from "lucide-react";
import { checkSetupStatus } from "@/lib/auth";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { setupCompleted, settings } = await checkSetupStatus();
  const session = await getSession();

  const appTitle = settings?.appName || "Genealogical Search and Record System";
  const orgTitle = settings?.familyOrOrgName || "Family Heritage & Lineage Archive";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-emerald-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-emerald-950/90 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <TreePine className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-emerald-950 dark:text-white tracking-tight flex items-center gap-2">
                GSRS
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                  Health & Heritage
                </span>
              </span>
              <p className="text-xs text-slate-500 dark:text-emerald-400/80 truncate max-w-xs">
                {orgTitle}
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-emerald-200">
            <a href="#about" className="hover:text-emerald-600 transition-colors">
              About GSRS
            </a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Core Capabilities
            </a>
            <a href="#health" className="hover:text-emerald-600 transition-colors">
              Generational Health
            </a>
            <a href="#heritage" className="hover:text-emerald-600 transition-colors">
              Nasarawa Heritage
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : setupCompleted ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Portal Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/setup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>First-Time Setup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20 px-4 sm:px-8 border-b border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950 dark:via-emerald-950/80 dark:to-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300/40">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Digital Lineage & Hereditary Health Preservation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-950 dark:text-white leading-[1.12]">
              Preserve Family History, Lineage & Generational Well-Being.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              The <strong>Genealogical Search and Record System (GSRS)</strong> is a
              secure, local-first platform designed to document ancestral relationships,
              chart interactive family trees, chronicle historical documents, and safeguard
              generational health records for families across Nasarawa State and Nigeria.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>Open Family Archive</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : setupCompleted ? (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>Sign In to System</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/setup"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>Run Initial Setup Wizard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}

              <Link
                href="/family-tree"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-base font-semibold transition-all shadow-sm"
              >
                <GitFork className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Explore Family Tree</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-100 dark:border-emerald-900/60 max-w-lg text-xs">
              <div>
                <span className="block font-bold text-lg text-emerald-900 dark:text-emerald-200">
                  100%
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Local-First & Offline
                </span>
              </div>
              <div>
                <span className="block font-bold text-lg text-emerald-900 dark:text-emerald-200">
                  Multi-Gen
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Pedigree Trees
                </span>
              </div>
              <div>
                <span className="block font-bold text-lg text-emerald-900 dark:text-emerald-200">
                  SQLite
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Secure Private Storage
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Family Members Photo Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-emerald-800/80 bg-gradient-to-tr from-emerald-100/40 to-teal-50/20">
              <Image
                src="/images/family-portrait.jpg"
                alt="Family of 4 portrait representing genealogical heritage, family bond, and generational health"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover object-top transform hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient lighting overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent pointer-events-none" />

              {/* Floating pill badge 1: Generations */}
              <div className="absolute top-4 left-4 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950 dark:text-white leading-tight">
                    Healthy Lineage
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-emerald-300">
                    Generations Connected
                  </p>
                </div>
              </div>

              {/* Floating pill badge 2: Confidentiality */}
              <div className="absolute bottom-4 right-4 bg-emerald-900/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xl border border-emerald-700/60 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-semibold">
                  Private on Your Laptop
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: What is GSRS & Generational Health? */}
      <section id="health" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Vital Hereditary Insight
          </span>
          <h2 className="text-3xl font-extrabold text-emerald-950 dark:text-white mt-1">
            Why Family Lineage & Generational Health Records Matter
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            Beyond traditional name registries, documenting family lineage preserves vital knowledge about longevity, generational well-being, and historical roots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-emerald-900/30 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/70 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Hereditary Health & Longevity
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Recording birth dates, lifespans, and genealogical health milestones gives descendants essential insight into family longevity, hereditary traits, and historical wellness patterns.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-50 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hereditary history preservation</span>
            </div>
          </div>

          <div className="bg-white dark:bg-emerald-900/30 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/70 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center">
                <GitFork className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Interactive Multi-Gen Tree
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dynamically render great-grandparents, grandparents, parents, children, and siblings with seamless horizontal and vertical pedigree tree zooming and panning.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-50 dark:border-emerald-900/60 text-xs text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Visual lineage relationships</span>
            </div>
          </div>

          <div className="bg-white dark:bg-emerald-900/30 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/70 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <FolderArchive className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Historical Vault & Certificates
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Securely store birth certificates, marriage records, death certificates, and historical family portraits locally with instant preview, downloads, and PDF dossiers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-50 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Digital preservation vault</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Nasarawa State & Community Heritage */}
      <section id="heritage" className="py-14 px-4 sm:px-8 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Community Heritage In Focus
            </span>
            <h2 className="text-3xl font-bold mt-1">
              Preserving Families in Nasarawa State & Beyond
            </h2>
            <p className="mt-3 text-sm text-emerald-100 leading-relaxed">
              From the historic dynasties of Keffi, Lafia, and Akwanga to communities across
              Nasarawa State and Nigeria, GSRS ensures that clan histories, oral testimonies,
              chieftaincy pedigrees, and family lineages are never lost to time.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-emerald-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Support for clan communities, local government areas (LGAs), and ancestral homesteads</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Captures traditional titles, occupations, cultural milestones, and biographies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Runs 100% without internet access in local communities</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-800 backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Independent & Confidential Local Database</span>
            </h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Every GSRS installation creates its own standalone SQLite database.
              Your family records never get uploaded to paid clouds or third-party servers.
              You can easily export full backups to a flash drive to transfer to other family members.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <span>Launch Archive Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 sm:px-8 border-t border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-emerald-950 text-xs text-slate-500 dark:text-emerald-400/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800 dark:text-white">
              Genealogical Search and Record System (GSRS)
            </span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
          <p>© {new Date().getFullYear()} GSRS. Dedicated to Nigerian family heritage & generational health.</p>
        </div>
      </footer>
    </div>
  );
}
