// src/app/new/page.js
import { FlowchartEditor } from '@/components/flowchart/Editor';

export default function NewFlowchartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FlowchartEditor />
    </div>
  );
}