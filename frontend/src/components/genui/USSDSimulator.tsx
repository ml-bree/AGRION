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
            <div className="text-harvest mb-2 text-sm font-medium">Welcome to AgriConnect Nigeria</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-gray-400">1.</span> Hausa</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">2.</span> Yoruba</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">3.</span> Igbo</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">4.</span> English</div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Enter option:</div>
          </>
        );
      case 1:
        return (
          <>
            <div className="text-harvest mb-2 text-sm font-medium">Zaɓi amfanin gona (Select crop)</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-gray-400">1.</span> Masara (Maize)</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">2.</span> Shinkafa (Rice)</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">3.</span> Rogo (Cassava)</div>
              <div className="flex items-center gap-2 text-gray-500"><span className="text-gray-400">0.</span> Koma (Back)</div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Shigar zaɓi:</div>
          </>
        );
      case 2:
        return (
          <>
            <div className="text-harvest mb-2 text-sm font-medium">Zaɓi jihar ka (Select state)</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-gray-400">1.</span> Kano</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">2.</span> Kaduna</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">3.</span> Kebbi</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">4.</span> Lagos</div>
              <div className="flex items-center gap-2 text-gray-500"><span className="text-gray-400">0.</span> Koma</div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Shigar zaɓi:</div>
          </>
        );
      case 3:
        return (
          <>
            <div className="text-harvest mb-2 text-sm font-medium">Menene marhalar noma ka? (Farm stage?)</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-gray-400">1.</span> Pre-planting</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">2.</span> Planting</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">3.</span> Growing</div>
              <div className="flex items-center gap-2"><span className="text-gray-400">4.</span> Harvest</div>
              <div className="flex items-center gap-2 text-gray-500"><span className="text-gray-400">0.</span> Koma</div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Shigar zaɓi:</div>
          </>
        );
      case 4:
        return (
          <>
            <div className="text-harvest mb-2 text-sm font-medium">NASIHA / ADVISORY</div>
            <div className="text-sm leading-relaxed space-y-2">
              <p>{block.advisory}</p>
              <div className="bg-harvest/10 border border-harvest/30 rounded p-2 text-xs">
                {block.action}
              </div>
              <p className="text-xs text-gray-400">SMS an aika ✓</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-soil flex items-center gap-2">
          <Phone className="w-5 h-5 text-harvest" />
          USSD Flow Simulator
        </h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">*384#</span>
      </div>

      {/* Step Tracker */}
      <div className="flex items-center justify-between mb-6 relative">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <button
              onClick={() => handleStepClick(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${index <= currentStep 
                  ? 'bg-harvest text-white cursor-pointer hover:bg-harvest/80' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              disabled={index > currentStep}
            >
              {step.icon}
            </button>
            <span className={`text-[10px] mt-1 ${index <= currentStep ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Phone Screen */}
      <div className="bg-gray-900 rounded-lg p-4 text-white font-mono text-sm min-h-[200px]">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>*384#</span>
          <span>Step {currentStep + 1} of {block.totalSteps}</span>
        </div>
        {getStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-3">
        <button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={() => setCurrentStep(Math.min(block.totalSteps - 1, currentStep + 1))}
          className="flex-1 bg-harvest hover:bg-harvest/80 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
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