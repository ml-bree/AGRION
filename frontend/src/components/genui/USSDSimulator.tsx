import type { USSDSimulatorBlock } from "./types";
import { useState } from "react";
import { 
  Phone, 
  Globe, 
  Sprout, 
  MapPin, 
  CalendarDays,
  Send,
  ArrowLeft,
  CheckCircle
} from "lucide-react";

interface Props {
  block: USSDSimulatorBlock;
}

export function USSDSimulator({ block }: Props) {
  const [currentStep, setCurrentStep] = useState(block.currentStep);

  const steps = [
    { label: "Language", icon: <Globe className="w-4 h-4" /> },
    { label: "Crop", icon: <Sprout className="w-4 h-4" /> },
    { label: "Region", icon: <MapPin className="w-4 h-4" /> },
    { label: "Stage", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Advisory", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const handleStepClick = (index: number) => {
    if (index <= block.currentStep) {
      setCurrentStep(index);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="text-marigold dark:text-dark-accent mb-2 text-sm font-medium">Welcome to AgriConnect Nigeria</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">1.</span> Hausa</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">2.</span> Yoruba</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">3.</span> Igbo</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">4.</span> English</div>
            </div>
            <div className="mt-3 text-xs text-dallas dark:text-dark-text2">Enter option:</div>
          </>
        );
      case 1:
        return (
          <>
            <div className="text-marigold dark:text-dark-accent mb-2 text-sm font-medium">Zaɓi amfanin gona (Select crop)</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">1.</span> Masara (Maize)</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">2.</span> Shinkafa (Rice)</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">3.</span> Rogo (Cassava)</div>
              <div className="flex items-center gap-2 text-dallas/60 dark:text-dark-text2/60"><span className="text-dallas dark:text-dark-text2">0.</span> Koma (Back)</div>
            </div>
            <div className="mt-3 text-xs text-dallas dark:text-dark-text2">Shigar zaɓi:</div>
          </>
        );
      case 2:
        return (
          <>
            <div className="text-marigold dark:text-dark-accent mb-2 text-sm font-medium">Zaɓi jihar ka (Select state)</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">1.</span> Kano</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">2.</span> Kaduna</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">3.</span> Kebbi</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">4.</span> Lagos</div>
              <div className="flex items-center gap-2 text-dallas/60 dark:text-dark-text2/60"><span className="text-dallas dark:text-dark-text2">0.</span> Koma</div>
            </div>
            <div className="mt-3 text-xs text-dallas dark:text-dark-text2">Shigar zaɓi:</div>
          </>
        );
      case 3:
        return (
          <>
            <div className="text-marigold dark:text-dark-accent mb-2 text-sm font-medium">Menene marhalar noma ka? (Farm stage?)</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">1.</span> Pre-planting</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">2.</span> Planting</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">3.</span> Growing</div>
              <div className="flex items-center gap-2"><span className="text-dallas dark:text-dark-text2">4.</span> Harvest</div>
              <div className="flex items-center gap-2 text-dallas/60 dark:text-dark-text2/60"><span className="text-dallas dark:text-dark-text2">0.</span> Koma</div>
            </div>
            <div className="mt-3 text-xs text-dallas dark:text-dark-text2">Shigar zaɓi:</div>
          </>
        );
      case 4:
        return (
          <>
            <div className="text-marigold dark:text-dark-accent mb-2 text-sm font-medium">NASIHA / ADVISORY</div>
            <div className="text-sm leading-relaxed space-y-2">
              <p className="text-thunder dark:text-dark-text">{block.advisory}</p>
              <div className="bg-marigold/10 dark:bg-dark-accent/10 border border-marigold/30 dark:border-dark-accent/30 rounded p-2 text-xs text-thunder dark:text-dark-text">
                {block.action}
              </div>
              <p className="text-xs text-dallas dark:text-dark-text2">SMS an aika ✓</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <Phone className="w-5 h-5 text-marigold dark:text-dark-accent" />
          USSD Flow Simulator
        </h3>
        <span className="text-xs bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 px-2 py-1 rounded font-mono">*384#</span>
      </div>

      <div className="flex items-center justify-between mb-6 relative">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <button
              onClick={() => handleStepClick(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${index <= currentStep 
                  ? 'bg-marigold dark:bg-dark-accent text-white cursor-pointer hover:bg-marigold/80 dark:hover:bg-dark-accent/80' 
                  : 'bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 cursor-not-allowed'
                }`}
              disabled={index > currentStep}
            >
              {step.icon}
            </button>
            <span className={`text-[10px] mt-1 ${index <= currentStep ? 'text-thunder dark:text-dark-text font-medium' : 'text-dallas dark:text-dark-text2'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-ussd-bg dark:bg-ussd-bg rounded-lg p-4 text-white font-mono text-sm min-h-[200px]">
        <div className="flex justify-between text-xs text-ussd-dim dark:text-ussd-dim mb-3">
          <span>*384#</span>
          <span>Step {currentStep + 1} of {block.totalSteps}</span>
        </div>
        {getStepContent()}
      </div>

      <div className="flex gap-2 mt-3">
        <button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          className="flex-1 bg-cream dark:bg-dark-bg2 hover:bg-sand/20 dark:hover:bg-dark-bg3 text-thunder dark:text-dark-text py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={() => setCurrentStep(Math.min(block.totalSteps - 1, currentStep + 1))}
          className="flex-1 bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {currentStep === block.totalSteps - 1 ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Complete
            </>
          ) : (
            <>
              Send
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}