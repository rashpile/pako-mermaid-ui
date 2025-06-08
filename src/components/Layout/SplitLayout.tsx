import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useSettingsStore } from '../../store/settingsStore';

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
  const { layoutSettings, updateLayoutSettings } = useSettingsStore();
  const [isResizing, setIsResizing] = useState(false);

  // Handle panel resize events
  const handlePanelResize = (sizes: number[]) => {
    if (sizes.length >= 3) {
      updateLayoutSettings({
        leftPanelSize: sizes[0],
        centerPanelSize: sizes[1],
        rightPanelSize: sizes[2]
      });
    }
  };

  // Handle resize start/end for visual feedback
  const handleResizeStart = () => setIsResizing(true);
  const handleResizeEnd = () => setIsResizing(false);

  return (
    <div className={`h-full w-full ${className}`}>
      <PanelGroup
        direction="horizontal"
        onLayout={handlePanelResize}
        className="h-full"
      >
        {/* Left Panel (Editor) */}
        <Panel
          defaultSize={layoutSettings.leftPanelSize}
          minSize={20}
          maxSize={60}
          className="flex flex-col"
          id="editor-panel"
        >
          <div className="h-full border-r border-gray-200 dark:border-gray-700">
            {leftPanel}
          </div>
        </Panel>

        {/* First Resize Handle */}
        <PanelResizeHandle
          onDragging={setIsResizing}
          className={`
            w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600
            transition-colors duration-200 relative
            ${isResizing ? 'bg-blue-500 dark:bg-blue-600' : ''}
          `}
        >
          <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-3 flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-400 dark:bg-gray-500 rounded opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </PanelResizeHandle>

        {/* Center Panel (Preview) */}
        <Panel
          defaultSize={layoutSettings.centerPanelSize}
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
        <PanelResizeHandle
          onDragging={setIsResizing}
          className={`
            w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600
            transition-colors duration-200 relative
            ${isResizing ? 'bg-blue-500 dark:bg-blue-600' : ''}
          `}
        >
          <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-3 flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-400 dark:bg-gray-500 rounded opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </PanelResizeHandle>

        {/* Right Panel (Chat) */}
        <Panel
          defaultSize={layoutSettings.rightPanelSize}
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

      {/* Resize indicator overlay */}
      {isResizing && (
        <div className="fixed inset-0 pointer-events-none z-50 bg-blue-500/5" />
      )}
    </div>
  );
}