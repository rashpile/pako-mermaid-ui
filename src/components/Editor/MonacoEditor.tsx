import { useRef, useEffect, useCallback, memo } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useDiagram } from '../../hooks/useDiagram';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';

interface MonacoEditorProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  readOnly?: boolean;
  onMount?: (editor: Monaco) => void;
}

function MonacoEditorComponent({
  className = '',
  readOnly = false,
  onMount
}: MonacoEditorProps) {
  const { content, updateContent, isValid, error } = useDiagram();
  const { resolvedTheme } = useTheme();
  const { settings } = useSettingsStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);


  // Configure Monaco for Mermaid syntax highlighting
  const configureMonaco = useCallback((monaco: Monaco) => {
    monacoRef.current = monaco;

    // Register Mermaid language if not already registered
    if (!monaco.languages.getLanguages().find(lang => lang.id === 'mermaid')) {
      monaco.languages.register({ id: 'mermaid' });

      // Define Mermaid language tokens
      monaco.languages.setMonarchTokensProvider('mermaid', {
        tokenizer: {
          root: [
            // Diagram types
            [/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitgraph|mindmap|journey)\b/, 'keyword'],
            
            // Direction keywords
            [/\b(TD|TB|BT|RL|LR)\b/, 'keyword'],
            
            // Node shapes and connections
            [/-->|---|-\.-|==>|===|==|--|\|/, 'operator'],
            [/\[|\]|\(|\)|\{|\}|\|\|/, 'bracket'],
            
            // String literals
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/'/, 'string', '@string_single'],
            
            // Comments
            [/%%.*$/, 'comment'],
            
            // Numbers
            [/\d+/, 'number'],
            
            // Identifiers
            [/[a-zA-Z_]\w*/, 'identifier'],
            
            // Whitespace
            [/[ \t\r\n]+/, 'white'],
          ],
          
          string: [
            [/[^\\"]+/, 'string'],
            [/"/, 'string', '@pop']
          ],
          
          string_single: [
            [/[^\\']+/, 'string'],
            [/'/, 'string', '@pop']
          ]
        }
      });

      // Define Mermaid language configuration
      monaco.languages.setLanguageConfiguration('mermaid', {
        comments: {
          lineComment: '%%'
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string'] }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ]
      });

      // Define theme colors for Mermaid
      monaco.editor.defineTheme('mermaid-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
          { token: 'operator', foreground: 'FF6600' },
          { token: 'string', foreground: '008000' },
          { token: 'comment', foreground: '008000', fontStyle: 'italic' },
          { token: 'number', foreground: '0000FF' },
          { token: 'identifier', foreground: '000000' }
        ],
        colors: {}
      });

      monaco.editor.defineTheme('mermaid-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
          { token: 'operator', foreground: 'FF8C00' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'identifier', foreground: 'D4D4D4' }
        ],
        colors: {}
      });
    }

    // Call onMount callback if provided
    if (onMount) {
      onMount(monaco);
    }
  }, [onMount]);

  // Update error decorations based on validation result
  const updateErrorDecorations = useCallback(() => {
    try {
      if (!editorRef.current || !monacoRef.current) return;

      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const model = editor.getModel();
      
      if (!model) return;

      // Clear existing decorations
      const decorations = editor.getModel()?.getAllDecorations() || [];
      const errorDecorations = decorations.filter((d: monaco.editor.IModelDecoration) => d.options.className?.includes('error'));
      
      if (errorDecorations.length > 0) {
        editor.removeDecorations(errorDecorations.map((d: monaco.editor.IModelDecoration) => d.id));
      }

      // Add error decoration if there's an error
      if (!isValid && error) {
        const lineCount = model.getLineCount();
        editor.deltaDecorations([], [{
          range: new monaco.Range(1, 1, lineCount, 1),
          options: {
            className: 'monaco-error-decoration',
            hoverMessage: { value: error },
            glyphMarginClassName: 'monaco-error-glyph'
          }
        }]);
      }
    } catch (error) {
      console.debug('Monaco decoration error (ignored):', error);
    }
  }, [isValid, error]);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    try {
      editorRef.current = editor;
      configureMonaco(monaco);

      // Set language to Mermaid
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, 'mermaid');
      }

      // Focus the editor
      editor.focus();

      // Set up error decorations
      updateErrorDecorations();
    } catch (error) {
      console.debug('Monaco editor mount error (ignored):', error);
    }
  }, [configureMonaco, updateErrorDecorations]);

  // Update decorations when validation changes
  useEffect(() => {
    try {
      updateErrorDecorations();
    } catch (error) {
      console.debug('Monaco decoration update error (ignored):', error);
    }
  }, [updateErrorDecorations]);


  // Handle content changes
  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      updateContent(value);
    }
  }, [updateContent]);


  // Get current theme for Monaco
  const getMonacoTheme = useCallback(() => {
    if (resolvedTheme === 'dark') {
      return 'mermaid-dark';
    }
    return 'mermaid-light';
  }, [resolvedTheme]);

  // Cleanup effect for proper editor disposal
  useEffect(() => {
    return () => {
      // Use a timeout to ensure all async operations complete
      setTimeout(() => {
        try {
          if (editorRef.current) {
            const editor = editorRef.current;
            // Check if editor is still valid before disposing
            if (typeof editor.dispose === 'function') {
              editor.dispose();
            }
            editorRef.current = null;
          }
          monacoRef.current = null;
        } catch (error) {
          // Silently handle disposal errors as they're often benign
          console.debug('Monaco cleanup error (ignored):', error);
        }
      }, 0);
    };
  }, []);

  return (
    <div className={`monaco-editor-container ${className}`}>
      <Editor
        height="100%"
        width="100%"
        language="mermaid"
        theme={getMonacoTheme()}
        value={content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: settings.fontSize,
          fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
          lineNumbers: settings.showLineNumbers ? 'on' : 'off',
          wordWrap: settings.wordWrap ? 'on' : 'off',
          minimap: { enabled: settings.minimap },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          },
          suggest: {
            showKeywords: true,
            showSnippets: true
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false
          },
          // Performance optimizations
          renderControlCharacters: false,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on'
        }}
      />
      
      {/* Custom styles for error decorations */}
      <style>{`
        .monaco-editor-container {
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
          height: 100%;
          width: 100%;
          min-height: 200px;
        }
        
        .monaco-error-decoration {
          background-color: rgba(255, 0, 0, 0.1);
          border-bottom: 2px wavy red;
        }
        
        .monaco-error-glyph {
          background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjgiIGZpbGw9IiNGRjAwMDAiLz4KPHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYgMkw2IDdNNiA5TDYgMTAiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+) center center no-repeat;
        }
      `}</style>
    </div>
  );
}

export const MonacoEditor = memo(MonacoEditorComponent);