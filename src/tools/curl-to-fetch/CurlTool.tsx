import { Globe, History, Sparkles } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { Segmented } from '../../components/ui/Segmented';
import { HistoryPanel } from './HistoryPanel';
import { RequestPanel } from './RequestPanel';
import { SaveWorkflowDialog } from './SaveWorkflowDialog';
import { useApiTester } from './useApiTester';
import { WorkflowsPanel } from './WorkflowsPanel';

export default function CurlTool() {
  const api = useApiTester();
  return (
    <ToolLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Scrolls sideways on phones instead of overflowing (#23) */}
        <div className="rail">
          <Segmented
            label="API Tester section"
            value={api.mainTab}
            onChange={api.setMainTab}
            options={[
              { value: 'testing', label: 'Request', icon: <Globe size={14} /> },
              { value: 'workflows', label: `Workflows (${api.savedRequests.length})`, icon: <Sparkles size={14} /> },
              { value: 'history', label: 'History', icon: <History size={14} /> },
            ]}
          />
        </div>
        {api.mainTab === 'testing' && <RequestPanel api={api} />}
        {api.mainTab === 'workflows' && <WorkflowsPanel api={api} />}
        {api.mainTab === 'history' && <HistoryPanel api={api} />}
      </div>
      <SaveWorkflowDialog api={api} />
    </ToolLayout>
  );
}
