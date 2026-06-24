import type { MultilingualBlock } from "./types";
import { useState } from "react";
import { 
  Globe, 
  Check, 
  Languages
} from "lucide-react";

interface Props {
  block: MultilingualBlock;
}

export function MultilingualSupport({ block }: Props) {
  const [selected, setSelected] = useState(block.selectedLanguage);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-soil flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-harvest" />
        Multilingual Support
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {block.languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelected(lang.code)}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              selected === lang.code
                ? 'border-harvest bg-harvest/5 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">{lang.flag}</div>
            <div className={`font-medium mt-1 text-sm ${selected === lang.code ? 'text-harvest' : 'text-gray-700'}`}>
              {lang.name}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-mono">{lang.example}</div>
            {selected === lang.code && (
              <div className="mt-2 text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                <Check className="w-3 h-3" />
                Active
              </div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Languages className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-soil">Selected:</span> {block.languages.find(l => l.code === selected)?.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">Welcome message:</span> "{block.languages.find(l => l.code === selected)?.welcome}"
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Auto-detection: Language selected at start → all prompts and responses in that language
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}