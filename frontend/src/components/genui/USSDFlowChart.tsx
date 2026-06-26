import type { USSDFlowChartBlock } from "./types";
import { useState } from "react";
import { 
  Phone, 
  Globe, 
  Sprout, 
  MapPin, 
  CalendarDays,
  CheckCircle,
  ChevronRight,
  CreditCard
} from "lucide-react";

interface Props {
  block: USSDFlowChartBlock;
}
export function USSDFlowChart({ block: _block }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { 
      number: "1", 
      label: "Language Select", 
      icon: <Globe className="w-5 h-5" />,
      description: "Hausa · Igbo · Yoruba · English",
      detail: "System switches ALL screens to chosen language from here",
    },
    { 
      number: "2", 
      label: "Crop Select", 
      icon: <Sprout className="w-5 h-5" />,
      description: "Maize · Rice · Cassava · Soya",
      detail: "Farmer selects their primary crop",
    },
    { 
      number: "3", 
      label: "Region / State", 
      icon: <MapPin className="w-5 h-5" />,
      description: "Kano · Kaduna · Kebbi · Lagos · Oyo · Enugu",
      detail: "Farmer selects their location",
    },
    { 
      number: "4", 
      label: "Farm Stage", 
      icon: <CalendarDays className="w-5 h-5" />,
      description: "Pre-planting · Planting · Growing · Harvest",
      detail: "Farmer identifies current season stage",
    },
    { 
      number: "5", 
      label: "Advisory + CashCard", 
      icon: <CreditCard className="w-5 h-5" />,
      description: "SMS sent · Session ends",
      detail: "Personalized advisory + financial nudge",
    },
  ];

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <Phone className="w-5 h-5 text-marigold dark:text-dark-accent" />
          USSD Flow · *384#
        </h3>
        <span className="text-xs bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 px-2 py-1 rounded font-mono">
          Farmer dials *384#
        </span>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all ${
                  activeStep === index 
                    ? 'bg-marigold dark:bg-dark-accent text-white'
                    : activeStep > index
                    ? 'bg-green-500 text-white'
                    : 'bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 border border-sand dark:border-dark-border'
                }`}
                onClick={() => setActiveStep(index)}
              >
                {activeStep > index ? <CheckCircle className="w-5 h-5" /> : step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-8 ${
                  activeStep > index 
                    ? 'bg-green-500' 
                    : activeStep === index 
                    ? 'bg-marigold dark:bg-dark-accent' 
                    : 'bg-sand dark:bg-dark-border'
                }`} />
              )}
            </div>

            <div className="flex-1 pb-4">
              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  activeStep === index 
                    ? 'border-marigold dark:border-dark-accent bg-marigold/5 dark:bg-dark-accent/5'
                    : activeStep > index
                    ? 'border-green-500/30 bg-green-50/30 dark:bg-green-900/10'
                    : 'border-sand/30 dark:border-dark-border/30'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-dallas dark:text-dark-text2">{step.icon}</span>
                  <span className={`text-sm font-medium flex-1 ${
                    activeStep === index 
                      ? 'text-marigold dark:text-dark-accent' 
                      : 'text-thunder dark:text-dark-text'
                  }`}>
                    {step.label}
                  </span>
                  {activeStep === index && (
                    <ChevronRight className="w-4 h-4 text-marigold dark:text-dark-accent" />
                  )}
                  {activeStep > index && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="mt-1 text-xs text-dallas dark:text-dark-text2">
                  {step.description}
                </div>
                {activeStep === index && (
                  <div className="mt-2 text-xs text-thunder dark:text-dark-text bg-cream dark:bg-dark-bg2 p-2 rounded">
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-cream dark:bg-dark-bg2 rounded-lg border border-sand dark:border-dark-border">
        <div className="flex items-center gap-2 text-xs text-dallas dark:text-dark-text2">
          <Phone className="w-3 h-3 text-marigold dark:text-dark-accent" />
          <span>Farmers dial *384# → Navigate 5 steps → Receive personalized advisory + SMS + CashCard nudge</span>
        </div>
      </div>
    </div>
  );
}