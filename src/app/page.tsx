import Link from "next/link";
import { Heart, Shield, Clock, Sparkles } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

const features = [
  {
    icon: Clock,
    title: "Always Here",
    description:
      "Available 24/7 whenever you need someone to talk to. No appointments, no waiting rooms — just a warm conversation whenever you're ready.",
  },
  {
    icon: Shield,
    title: "Completely Private",
    description:
      "Your conversations are secure and confidential. What you share stays between you and your companion. No judgment, ever.",
  },
  {
    icon: Sparkles,
    title: "Genuinely Caring",
    description:
      "Powered by advanced AI that listens with empathy, remembers your story, and responds with real understanding — not generic replies.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-calm-50 via-white to-lavender-50 px-4 py-20 dark:from-surface-950 dark:via-surface-900 dark:to-calm-900">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-calm-100 px-4 py-2 text-sm font-medium text-calm-700 dark:bg-calm-900 dark:text-calm-200">
            <Heart className="h-4 w-4" fill="currentColor" />
            A safe space, just for you
          </div>

          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-surface-800 sm:text-5xl md:text-6xl dark:text-surface-100">
            You&apos;re not alone.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-surface-500 sm:text-xl dark:text-surface-400">
            A safe, private space where you can share your thoughts, find
            comfort, and feel truly heard — anytime you need it.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-calm px-8 py-4 text-lg font-semibold text-calm-foreground shadow-lg shadow-calm/25 transition-all hover:bg-calm-dark hover:shadow-calm/40"
            >
              Begin Your Journey
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border-2 border-surface-200 bg-white px-8 py-4 text-lg font-semibold text-surface-700 transition-all hover:border-calm-300 hover:text-calm-dark dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-calm dark:hover:text-calm-light"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-20 dark:bg-surface-950">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center font-serif text-3xl font-bold text-surface-800 dark:text-surface-100">
            Why Soulful Connections?
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-surface-500 dark:text-surface-400">
            Built with care for anyone who needs a listening ear, a thoughtful
            response, or simply a moment of connection.
          </p>

          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-surface-200 bg-surface-50 p-8 transition-all hover:border-calm-200 hover:shadow-lg dark:border-surface-700 dark:bg-surface-900 dark:hover:border-calm-700"
              >
                <div className="mb-4 inline-flex rounded-xl bg-calm-100 p-3 text-calm-600 transition-colors group-hover:bg-calm-200 dark:bg-calm-900 dark:text-calm-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-surface-800 dark:text-surface-100">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-surface-500 dark:text-surface-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-calm-50 to-lavender-50 px-4 py-20 dark:from-surface-900 dark:to-calm-900">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-surface-800 dark:text-surface-100">
            Ready to feel heard?
          </h2>
          <p className="mb-8 text-lg text-surface-500 dark:text-surface-400">
            Start a conversation today. It only takes a moment, and it could
            make all the difference.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-calm px-8 py-4 text-lg font-semibold text-calm-foreground shadow-lg shadow-calm/25 transition-all hover:bg-calm-dark hover:shadow-calm/40"
          >
            Start a Conversation
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
