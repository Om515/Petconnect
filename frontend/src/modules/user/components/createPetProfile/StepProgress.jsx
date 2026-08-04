import React from "react";
import {
  PawPrint,
  Heart,
  Activity,
  Home,
  History,
  Image as ImageIcon,
  FileCheck,
  Eye,
  Check,
} from "lucide-react";

const steps = [
  { id: 1, label: "Basic Info", icon: PawPrint },
  { id: 2, label: "Personality", icon: Heart },
  { id: 3, label: "Health", icon: Activity },
  { id: 4, label: "Lifestyle", icon: Home },
  { id: 5, label: "History", icon: History },
  { id: 6, label: "Media", icon: ImageIcon },
  { id: 7, label: "Documents", icon: FileCheck },
  { id: 8, label: "Preview", icon: Eye },
];

const StepProgress = ({ currentStep, onStepClick }) => {
  const progressPercent = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className="w-full bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-cyan-100 mb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Step {currentStep} of {steps.length}
          </span>
          <h3 className="text-lg md:text-xl font-extrabold text-cyan-900">
            {steps[currentStep - 1].label}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-cyan-700">{progressPercent}% Completed</span>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full bg-cyan-50 h-3 rounded-full overflow-hidden mb-6 border border-cyan-100">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500 ease-out rounded-full shadow-sm"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Step Indicators Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isCompleted && onStepClick(step.id)}
              disabled={!isCompleted && !isCurrent}
              className={`flex flex-col items-center p-2 rounded-xl text-center transition-all duration-200 ${
                isCurrent
                  ? "bg-cyan-600 text-white shadow-md scale-105"
                  : isCompleted
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                  isCurrent
                    ? "bg-white text-cyan-700"
                    : isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className="text-[11px] font-semibold tracking-tight hidden sm:block truncate w-full">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
