import React from 'react';
import { ShieldCheck, Clock, User, Activity, RefreshCw } from 'lucide-react';
import { AuditLogItem } from '../types';

interface AdminAuditLogsTabProps {
  logs: AuditLogItem[];
  onRefresh: () => void;
}

export const AdminAuditLogsTab: React.FC<AdminAuditLogsTabProps> = ({ logs, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#322A2E]">
            Security & System Audit Log
          </h2>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Immutable log record of authentication events, catalog changes, order updates, and administrative modifications.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="divide-y divide-gray-100">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-xs font-bold text-gray-400">
              No audit logs registered yet.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4 text-[#EF2A39]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#322A2E]">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[#322A2E] text-[10px] font-bold">
                        by {log.admin}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-gray-400 font-semibold block">
                    {log.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
