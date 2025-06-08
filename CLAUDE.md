PROJECT_REQUEST
Build a web-based Mermaid diagram editor with real-time side-by-side preview functionality and AI-powered chat assistant. Users should be able to write Mermaid syntax in a text editor and see the rendered diagram update in real-time in an adjacent preview pane. Additionally, users can interact with an AI chat interface to describe desired changes to their diagram, and the AI will automatically update the Mermaid code based on natural language prompts.

PROJECT_RULES
- Use modern web technologies and best practices
- Ensure responsive design that works on desktop and tablet
- Prioritize performance with debounced updates
- Include proper error handling for invalid Mermaid syntax
- Follow accessibility guidelines
- Use TypeScript for type safety
- Implement clean, maintainable code structure
- Always use plan form PLAN.md file, when step is done mark it in PLAN.md

TECHNICAL_SPECIFICATION
**Core Features:**
- Split-pane layout with resizable divider
- Monaco Editor with Mermaid syntax highlighting
- Real-time preview using Mermaid.js
- Debounced updates (300ms) to prevent excessive re-rendering
- Error display for invalid syntax
- Export functionality (PNG, SVG, PDF)
- Save/load diagrams to/from local storage
- Example diagram templates
- Zoom controls for preview pane
- Light/dark theme toggle
- AI-powered chat interface for diagram modification
- Natural language processing for Mermaid code generation
- OpenAI API integration for intelligent diagram updates

**Tech Stack:**
- React 18 + TypeScript
- Vite for build tooling
- Monaco Editor for code editing
- Mermaid.js for diagram rendering
- Tailwind CSS for styling
- React Split Pane for layout
- html2canvas for PNG export
- jsPDF for PDF export
- OpenAI API for AI chat functionality
- Axios for API requests
- React Query for API state management
- Zustand for global state management

**File Structure:**
- `/src/components/` - React components
- `/src/hooks/` - Custom hooks
- `/src/utils/` - Utility functions
- `/src/types/` - TypeScript type definitions
- `/src/constants/` - Constants and example diagrams
- `/src/styles/` - Global styles
- `/src/services/` - API services and OpenAI integration
- `/src/store/` - Zustand state management
- `/src/prompts/` - AI prompt templates

**Key Components:**
- Editor component (Monaco wrapper)
- Preview component (Mermaid renderer)
- Toolbar component (export, save, load, examples)
- Split layout container
- Error boundary and error display
- AI Chat component (conversation interface)
- Chat message components (user/AI messages)
- API key configuration component
- AI response processing and code integration

STARTER_TEMPLATE
React + TypeScript + Vite template with the following initial setup:
- Vite configuration with React
- TypeScript configuration
- Tailwind CSS setup
- ESLint and Prettier configuration
- Basic project structure with components folder 