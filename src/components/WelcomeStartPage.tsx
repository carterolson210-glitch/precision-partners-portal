import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Building2,
  Zap,
  Users,
  BarChart3,
  FileText,
  Calendar,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
  Cpu,
  Globe,
  Lock,
} from "lucide-react";

// Particle System Component
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    pulsePhase: number;
    pulseSpeed: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.5 + 0.1,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.015 + 0.005,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulsePhase += p.pulseSpeed;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulsePhase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(58, 139, 217, ${currentOpacity})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(58, 139, 217, ${0.08 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      createParticles();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

// Grid Background Component
const GridBackground = () => {
  return (
    <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "gridPan 60s linear infinite",
        }}
      />
      <style>{`
        @keyframes gridPan {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-60px, -60px); }
        }
      `}</style>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  gradient: string;
}

const FeatureCard = ({ icon, title, description, delay, gradient }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm" />
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="relative p-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Main Welcome Start Page Component
const WelcomeStartPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  const features = [
    {
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      title: "AI-Powered Calculations",
      description: "Automated load calculations and structural analysis with code compliance checks.",
      delay: 0.1,
      gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      title: "Smart Scheduling",
      description: "Intelligent project timelines with automatic conflict detection and resource allocation.",
      delay: 0.2,
      gradient: "from-purple-500/20 to-pink-500/10",
    },
    {
      icon: <Users className="w-5 h-5 text-blue-400" />,
      title: "Team Collaboration",
      description: "Real-time workspace for engineers, PMs, and clients to stay aligned.",
      delay: 0.3,
      gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      title: "Document Management",
      description: "Centralized storage for drawings, specs, and project documentation.",
      delay: 0.4,
      gradient: "from-green-500/20 to-emerald-500/10",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
      title: "Analytics Dashboard",
      description: "Track project health, team productivity, and business metrics in real-time.",
      delay: 0.5,
      gradient: "from-red-500/20 to-rose-500/10",
    },
    {
      icon: <Shield className="w-5 h-5 text-blue-400" />,
      title: "Enterprise Security",
      description: "SOC 2 compliant with end-to-end encryption and role-based access.",
      delay: 0.6,
      gradient: "from-indigo-500/20 to-violet-500/10",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <GridBackground />
      <ParticleField />

      {/* Gradient Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-slate-950/70 border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Simpli-Engineering</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/onboarding")}>
                Complete Setup
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/register")}>
                Start Free Trial
              </Button>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-slate-300">AI-powered for engineering firms</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            The Engineering Platform{" "}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Built for Precision
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            From load calculations to client scheduling — one platform your engineering firm actually uses.
            Built for structural, civil, and MEP engineers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg group"
              onClick={() => navigate(user ? "/dashboard" : "/register")}
            >
              {user ? "Go to Dashboard" : "Start Free Trial"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-600 text-slate-300 hover:bg-white/5 px-8 py-6 text-lg"
              onClick={() => navigate("/features")}
            >
              See How It Works
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>SOC 2 Compliant</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Scale Your Practice
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Powerful tools designed specifically for engineering workflows, from calculation to client delivery.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent" />
            <div className="absolute inset-0 backdrop-blur-3xl" />

            <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-3xl p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
                  <div className="text-slate-400">Engineering Firms</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">10k+</div>
                  <div className="text-slate-400">Projects Completed</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
                  <div className="text-slate-400">Uptime SLA</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-purple-600/20" />
            <div className="absolute inset-0 backdrop-blur-2xl" />

            <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-3xl p-12 md:p-16">
              <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Engineering Practice?
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of engineering firms already using Simpli-Engineering to streamline their workflows and grow their business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                  onClick={() => navigate(user ? "/dashboard" : "/register")}
                >
                  {user ? "Go to Dashboard" : "Start Free Trial"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-white/5 px-8 py-6 text-lg"
                  onClick={() => navigate("/pricing")}
                >
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-400 text-sm">© 2026 Simpli-Engineering. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/security" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomeStartPage;