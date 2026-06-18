import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Zap, 
  Shield, 
  Code2, 
  Sparkles,
  CheckCircle2,
  ChevronRight,
  MessageSquare
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="h-16 border-b flex items-center justify-between px-6 lg:px-12 backdrop-blur-md bg-background/80 fixed top-0 w-full z-50">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <Bot className="text-primary h-6 w-6" />
          <span>NexusAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 py-24 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles size={14} />
            <span>Now featuring GPT-4 Omni</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-balance">
            Your intelligent assistant for <span className="text-primary">deep work</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl text-balance leading-relaxed">
            Experience the next generation of AI chat. Designed for professionals who demand speed, precision, and privacy.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base group">
                Start Chatting Free
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                View Features
              </Button>
            </Link>
          </div>
          
          <div className="mt-20 w-full max-w-5xl rounded-xl border bg-card/50 backdrop-blur shadow-2xl overflow-hidden ring-1 ring-border/50">
            <div className="h-12 border-b bg-muted/30 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
            </div>
            <div className="p-8 flex flex-col gap-6 text-left">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium">U</span>
                </div>
                <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-tl-sm max-w-md">
                  Write a python script to parse a CSV and insert it into a Postgres database using asyncpg.
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tr-sm max-w-2xl">
                  Here's a complete async Python script using `asyncpg` to stream CSV data efficiently into your database...
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-muted/50 border-y">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for velocity</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to work faster and smarter, without the bloat.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-6 w-6 text-amber-500" />,
                  title: "Lightning Fast",
                  description: "Real-time streaming responses mean you never wait. Get answers the moment you ask."
                },
                {
                  icon: <Code2 className="h-6 w-6 text-blue-500" />,
                  title: "Native Code Support",
                  description: "Beautiful syntax highlighting and one-click copying for dozens of programming languages."
                },
                {
                  icon: <Shield className="h-6 w-6 text-emerald-500" />,
                  title: "Enterprise Security",
                  description: "Your data is encrypted at rest and in transit. We never use your private data to train our models."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "$0",
                description: "Perfect for casual use and testing.",
                features: ["GPT-3.5 access", "Standard response speed", "100 messages/day", "Community support"],
                cta: "Start Free",
                href: "/sign-up"
              },
              {
                name: "Pro",
                price: "$20",
                period: "/month",
                description: "For professionals who need maximum capability.",
                features: ["GPT-4 access", "Fastest response times", "Unlimited messages", "Priority support", "API access"],
                cta: "Upgrade to Pro",
                href: "/sign-up",
                highlight: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For teams requiring security and scale.",
                features: ["Everything in Pro", "SSO & SAML", "Custom data retention", "Dedicated account manager", "Custom models"],
                cta: "Contact Sales",
                href: "mailto:sales@example.com"
              }
            ].map((tier, i) => (
              <div key={i} className={`flex flex-col p-8 rounded-3xl border ${tier.highlight ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' : 'bg-card'}`}>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period && <span className={tier.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}>{tier.period}</span>}
                </div>
                <p className={`mb-6 ${tier.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {tier.description}
                </p>
                <div className="flex-1 flex flex-col gap-4 mb-8">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className={tier.highlight ? 'text-primary-foreground' : 'text-primary'} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={tier.href}>
                  <Button variant={tier.highlight ? "secondary" : "outline"} className="w-full h-12">
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="text-primary h-5 w-5" />
            <span>NexusAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NexusAI. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
