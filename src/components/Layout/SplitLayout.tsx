import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}

export function SplitLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  className = ''
}: SplitLayoutProps) {

  return (
    <div className={`h-full w-full ${className}`}>
      <PanelGroup
        direction="horizontal"
        className="h-full"
      >
        {/* Left Panel (Editor) */}
        <Panel
          defaultSize={35}
          minSize={25}
          maxSize={60}
          className="flex flex-col"
          id="editor-panel"
        >
          <div className="h-full border-r border-gray-200 dark:border-gray-700">
            {leftPanel}
          </div>
        </Panel>

        {/* First Resize Handle */}
        <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600" />

        {/* Center Panel (Preview) */}
        <Panel
          defaultSize={40}
          minSize={25}
          maxSize={70}
          className="flex flex-col"
          id="preview-panel"
        >
          <div className="h-full border-r border-gray-200 dark:border-gray-700">
            {centerPanel}
          </div>
        </Panel>

        {/* Second Resize Handle */}
        <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600" />

        {/* Right Panel (Chat) */}
        <Panel
          defaultSize={25}
          minSize={20}
          maxSize={50}
          className="flex flex-col"
          id="chat-panel"
        >
          <div className="h-full">
            {rightPanel}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}