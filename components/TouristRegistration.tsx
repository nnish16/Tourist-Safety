import React, { useState, useEffect } from 'react';
import { Tourist } from '../types';
import { User, Phone, Globe, ChevronRight, Shield, CheckCircle, Loader2, Sparkles, ArrowRight, Wallet } from 'lucide-react';
import DigitalIDCard from './DigitalIDCard';

interface Props {
  onRegister: (t: Partial<Tourist>) => void;
  onBack: () => void;
}

const TouristRegistration: React.FC<Props> = ({ onRegister, onBack }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    nationality: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    relation: 'Family'
  });

  // Demo Data Auto-Fill
  const fillDemoData = () => {
    setFormData({
      name: "Alex Wanderer",
      age: "29",
      nationality: "United Kingdom",
      emergencyContactName: "Sarah Wanderer",
      emergencyContactPhone: "+44 7700 900077",
      relation: "Sister"
    });
  };

  const handleNext = () => setStep(prev => prev + 1);
  
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate Blockchain Generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    onRegister({
      name: formData.name,
      age: parseInt(formData.age),
      nationality: formData.nationality,
      contacts: [{ name: formData.emergencyContactName, relation: formData.relation, phone: formData.emergencyContactPhone }]
    });
  };

  // Step 3: Generation View
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-pulse"></div>
            <Shield className="w-24 h-24 text-emerald-400 relative z-10 animate-bounce" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Minting Digital Identity</h2>
        <p className="text-slate-400 mb-8 max-w-sm">Encrypting personal data and generating zero-knowledge proof for blockchain verification...</p>
        
        <div className="w-full max-w-xs bg-slate-900 rounded-full h-2 mb-2 overflow-hidden border border-slate-800">
            <div className="h-full bg-indigo-500 animate-[width_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
        </div>
        <div className="flex gap-2 text-xs font-mono text-indigo-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>0x7f...3a92 written to ledger</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Side / Top Header */}
        <div className="bg-indigo-900/20 p-8 md:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-r border-indigo-500/10">
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-8 h-8 text-indigo-400" />
                    <span className="font-bold text-white tracking-wide">SENTINEL</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    {step === 1 && "Identity"}
                    {step === 2 && "Emergency"}
                    {step === 3 && "Review"}
                </h2>
                <p className="text-indigo-200 text-sm leading-relaxed">
                    {step === 1 && "Basic profile information for your secure digital ID."}
                    {step === 2 && "Who should we contact in case of a confirmed SOS?"}
                    {step === 3 && "Verify your details before writing to the ledger."}
                </p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex md:flex-col gap-2 mt-6 md:mt-0">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 md:h-1 md:w-full w-full rounded-full transition-all duration-500 ${step >= i ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                ))}
            </div>
        </div>

        {/* Form Area */}
        <div className="p-8 md:w-2/3 relative">
            <button 
                type="button" 
                onClick={fillDemoData} 
                className="absolute top-6 right-6 text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-400 px-3 py-1 rounded-full border border-slate-700 transition-colors flex items-center gap-1"
            >
                <Sparkles className="w-3 h-3" /> Demo Fill
            </button>

            <form onSubmit={handleFinalSubmit} className="h-full flex flex-col">
                
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <div className="relative">
                                <User className="absolute top-3.5 left-3 w-5 h-5 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="e.g. Alex Wanderer"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/3 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                                <input 
                                    type="number" 
                                    placeholder="25"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                    value={formData.age}
                                    onChange={e => setFormData({...formData, age: e.target.value})}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nationality</label>
                                <div className="relative">
                                    <Globe className="absolute top-3.5 left-3 w-5 h-5 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Select Country"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                        value={formData.nationality}
                                        onChange={e => setFormData({...formData, nationality: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: EMERGENCY */}
                {step === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Contact Name</label>
                            <div className="relative">
                                <User className="absolute top-3.5 left-3 w-5 h-5 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="e.g. Sarah Wanderer"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                    value={formData.emergencyContactName}
                                    onChange={e => setFormData({...formData, emergencyContactName: e.target.value})}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute top-3.5 left-3 w-5 h-5 text-slate-500" />
                                <input 
                                    type="tel" 
                                    placeholder="+1 555 000 0000"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                    value={formData.emergencyContactPhone}
                                    onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: REVIEW */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                             <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Name</span>
                                <span className="text-white font-medium">{formData.name}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Nationality</span>
                                <span className="text-white font-medium">{formData.nationality}</span>
                             </div>
                             <div className="flex justify-between pt-1">
                                <span className="text-slate-500">Emergency</span>
                                <span className="text-white font-medium">{formData.emergencyContactName}</span>
                             </div>
                        </div>
                        
                        <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20 flex items-start gap-3">
                            <Wallet className="w-5 h-5 text-indigo-400 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-indigo-300">Wallet Connect</h4>
                                <p className="text-xs text-indigo-200/70">A temporary wallet will be generated to hold your digital credentials.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="mt-auto pt-8 flex gap-3">
                    {step > 1 && (
                        <button 
                            type="button" 
                            onClick={() => setStep(prev => prev - 1)}
                            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                        >
                            Back
                        </button>
                    )}
                    
                    {step < 3 ? (
                        <button 
                            type="button"
                            onClick={handleNext} 
                            disabled={!formData.name}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            Continue <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            type="submit"
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            Create ID & Launch <CheckCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default TouristRegistration;