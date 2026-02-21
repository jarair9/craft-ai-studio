import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    description: "For exploring and personal projects",
    features: ["5 agent messages / day", "1 project", "Community support", "Basic templates"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/mo",
    description: "For builders shipping real products",
    features: [
      "Unlimited agent messages",
      "Unlimited projects",
      "Priority support",
      "Custom domains",
      "Version history",
      "Team collaboration",
    ],
    cta: "Start Building",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams at scale",
    features: [
      "Everything in Pro",
      "SSO & SAML",
      "Dedicated infrastructure",
      "SLA guarantees",
      "Custom integrations",
      "Onboarding support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Scale when you're ready.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 rounded-xl border transition-all ${
                tier.highlight
                  ? "border-primary/40 bg-card glow-border-active"
                  : "border-border bg-card hover:border-primary/20"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Zap className="h-3 w-3" /> Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-1">{tier.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                  {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={tier.highlight ? "default" : "outline"}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
