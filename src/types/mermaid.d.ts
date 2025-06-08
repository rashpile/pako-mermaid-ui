// Type declarations for Mermaid.js integration

declare module 'mermaid' {
  export interface MermaidConfig {
    startOnLoad?: boolean;
    theme?: 'default' | 'neutral' | 'dark' | 'forest' | 'base';
    themeVariables?: Record<string, string>;
    fontFamily?: string;
    fontSize?: string;
    securityLevel?: 'strict' | 'loose' | 'antiscript' | 'sandbox';
    deterministicIds?: boolean;
    deterministicIDSeed?: string;
  }

  export interface RenderResult {
    svg: string;
    bindFunctions?: (element: Element) => void;
  }

  export interface ParseError {
    str: string;
    hash: {
      text: string;
      token: string;
      line: number;
      loc: {
        first_line: number;
        last_line: number;
        first_column: number;
        last_column: number;
      };
      expected: string[];
    };
  }

  export function initialize(config: MermaidConfig): void;
  export function render(id: string, definition: string, svgContainingElement?: Element): Promise<RenderResult>;
  export function parse(definition: string): boolean;
  export function mermaidAPI: {
    initialize(config: MermaidConfig): void;
    render(id: string, definition: string): Promise<RenderResult>;
    parse(definition: string): boolean;
    parseError?: ParseError;
  };
}

// Mermaid diagram types
export type MermaidDiagramType = 
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'state'
  | 'er'
  | 'journey'
  | 'gantt'
  | 'pie'
  | 'requirement'
  | 'gitgraph'
  | 'mindmap'
  | 'timeline'
  | 'sankey'
  | 'c4'
  | 'quadrant';

export interface MermaidDiagramInfo {
  type: MermaidDiagramType;
  syntax: string;
  description: string;
  example: string;
}

// Mermaid parsing and validation
export interface MermaidValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
  warnings?: string[];
}

// Mermaid rendering options
export interface MermaidRenderOptions {
  theme: 'default' | 'neutral' | 'dark' | 'forest' | 'base';
  backgroundColor?: string;
  width?: number;
  height?: number;
  scale?: number;
}