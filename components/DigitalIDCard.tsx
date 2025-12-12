import React from 'react';
import { Fingerprint, Shield, QrCode } from 'lucide-react';
import { Tourist } from '../types';

interface Props {
  tourist: Tourist;
}

const DigitalIDCard: React.FC<Props> = ({ tourist }) => {  return (
    <div className="relative w-full aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#4338ca_0%,_#0f172a_70%)] opacity-80"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%)', backgroundSize: '10px 10px' }}></div>
        </div>

        <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold tracking-widest text-sm uppercase text-emerald-400">Sentinel ID</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-wide">BLOCKCHAIN VERIFIED</div>
                </div>
                <Fingerprint className="w-8 h-8 text-indigo-400 opacity-50" />
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs text-slate-400 uppercase mb-1">Identity Hash</p>
                    <p className="font-mono text-xs text-indigo-200 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/30 truncate max-w-[180px]">
                        {tourist.digitalId}
                    </p>
                    <p className="mt-2 font-bold text-lg">{tourist.name}</p>
                    <p className="text-xs text-slate-400">{tourist.nationality} • {tourist.age}yo</p>
                </div>
                
                <div className="bg-white p-1.5 rounded-lg shadow-lg">
                    {/* Simulated QR Code */}
                    <div className="w-16 h-16 bg-slate-900 flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-white" />
                    </div>
                </div>
            </div>
        </div>
        
        {/* Holographic overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default DigitalIDCard;