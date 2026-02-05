import React from 'react';
import { X, Calendar, Search } from 'lucide-react';
import { SearchSession, Lead } from '../lib/types';
import { LeadsTable } from './LeadsTable';

interface HistoryModalProps {
  session: SearchSession | null;
  onClose: () => void;
  onViewMessage: (lead: Lead) => void;
}

export function HistoryModal({ session, onClose, onViewMessage }: HistoryModalProps) {
  if (!session) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-background border border-border w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
               <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Resultados de Búsqueda</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                 <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {session.date.toLocaleDateString()}</span>
                 <span>•</span>
                 <span className="font-medium text-primary">"{session.query}"</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background/50">
           <LeadsTable leads={session.leads} onViewMessage={onViewMessage} />
        </div>
      </div>
    </div>
  );
}
