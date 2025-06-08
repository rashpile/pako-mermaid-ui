/**
 * Example prompts and responses for AI training and user guidance
 */

export interface PromptExample {
  userInput: string;
  expectedOutput: string;
  explanation: string;
  category: string;
}

export const PROMPT_EXAMPLES: PromptExample[] = [
  {
    userInput: "Create a flowchart showing the user login process",
    expectedOutput: `\`\`\`mermaid
flowchart TD
    A[User enters credentials] --> B{Valid credentials?}
    B -->|Yes| C[Generate session]
    B -->|No| D[Show error message]
    C --> E[Redirect to dashboard]
    D --> A
\`\`\`

This flowchart shows a simple user authentication flow with validation and error handling.`,
    explanation: "Converts a general request into a specific flowchart with decision points and error handling",
    category: "Creation"
  },
  
  {
    userInput: "Add a forgot password option to this login diagram",
    expectedOutput: `\`\`\`mermaid
flowchart TD
    A[User enters credentials] --> B{Valid credentials?}
    B -->|Yes| C[Generate session]
    B -->|No| D[Show error message]
    C --> E[Redirect to dashboard]
    D --> F[Forgot password?]
    F -->|Yes| G[Send reset email]
    F -->|No| A
    G --> H[Check email for reset link]
\`\`\`

Added a forgot password flow that branches from the error state, allowing users to recover their accounts.`,
    explanation: "Shows how to modify existing diagrams by adding new branches and maintaining logical flow",
    category: "Modification"
  },

  {
    userInput: "Convert this to a sequence diagram",
    expectedOutput: `\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthService
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>AuthService: Validate credentials
    AuthService->>Database: Check user data
    Database-->>AuthService: User data
    alt Valid credentials
        AuthService-->>Frontend: Success + token
        Frontend-->>User: Redirect to dashboard
    else Invalid credentials
        AuthService-->>Frontend: Error message
        Frontend-->>User: Show error
    end
\`\`\`

Converted the login flowchart to a sequence diagram showing the interaction between different system components.`,
    explanation: "Demonstrates converting between diagram types while preserving the core logic",
    category: "Conversion"
  },

  {
    userInput: "Make this diagram more detailed with error handling",
    expectedOutput: `\`\`\`mermaid
flowchart TD
    A[User enters credentials] --> B[Validate input format]
    B --> C{Format valid?}
    C -->|No| D[Show format error]
    C -->|Yes| E[Send to authentication service]
    E --> F{Service available?}
    F -->|No| G[Show service error]
    F -->|Yes| H{Credentials valid?}
    H -->|Yes| I[Generate JWT token]
    H -->|No| J[Increment failed attempts]
    I --> K[Set session cookie]
    K --> L[Redirect to dashboard]
    J --> M{Max attempts reached?}
    M -->|Yes| N[Lock account temporarily]
    M -->|No| O[Show error + retry]
    D --> A
    G --> A
    N --> P[Show lockout message]
    O --> A
\`\`\`

Enhanced the diagram with comprehensive error handling including input validation, service availability checks, and account lockout protection.`,
    explanation: "Shows how to add complexity and robustness to simple diagrams",
    category: "Enhancement"
  },

  {
    userInput: "Create a database schema for a blog system",
    expectedOutput: `\`\`\`mermaid
erDiagram
    USER {
        int user_id PK
        string username UK
        string email UK
        string password_hash
        datetime created_at
        datetime updated_at
        boolean is_active
    }
    
    POST {
        int post_id PK
        int author_id FK
        string title
        text content
        string slug UK
        datetime published_at
        datetime created_at
        datetime updated_at
        enum status
    }
    
    CATEGORY {
        int category_id PK
        string name UK
        string description
        string slug UK
    }
    
    TAG {
        int tag_id PK
        string name UK
        string color
    }
    
    COMMENT {
        int comment_id PK
        int post_id FK
        int user_id FK
        text content
        datetime created_at
        boolean is_approved
    }
    
    POST_CATEGORY {
        int post_id FK
        int category_id FK
    }
    
    POST_TAG {
        int post_id FK
        int tag_id FK
    }
    
    USER ||--o{ POST : writes
    POST ||--o{ COMMENT : has
    USER ||--o{ COMMENT : writes
    POST ||--o{ POST_CATEGORY : belongs_to
    CATEGORY ||--o{ POST_CATEGORY : contains
    POST ||--o{ POST_TAG : has
    TAG ||--o{ POST_TAG : labels
\`\`\`

This entity relationship diagram shows a complete blog system schema with users, posts, categories, tags, and comments, including many-to-many relationships.`,
    explanation: "Demonstrates creating domain-specific diagrams with proper relationships and constraints",
    category: "Creation"
  }
];

// Common user intents and how to handle them
export const INTENT_PATTERNS = {
  CREATE: {
    keywords: ['create', 'make', 'build', 'generate', 'new'],
    examples: ['create a flowchart', 'make a sequence diagram', 'build a database schema']
  },
  MODIFY: {
    keywords: ['add', 'remove', 'change', 'update', 'modify', 'edit'],
    examples: ['add a new step', 'remove this connection', 'change the color']
  },
  CONVERT: {
    keywords: ['convert', 'transform', 'change to', 'make it a'],
    examples: ['convert to sequence diagram', 'transform into a class diagram']
  },
  SIMPLIFY: {
    keywords: ['simplify', 'reduce', 'minimize', 'basic'],
    examples: ['simplify this diagram', 'make it more basic', 'reduce complexity']
  },
  ENHANCE: {
    keywords: ['enhance', 'improve', 'detail', 'expand', 'elaborate'],
    examples: ['add more detail', 'enhance with error handling', 'expand this section']
  },
  STYLE: {
    keywords: ['color', 'style', 'theme', 'appearance', 'format'],
    examples: ['change colors', 'apply dark theme', 'make it prettier']
  }
};

// Response templates for different scenarios
export const RESPONSE_TEMPLATES = {
  SUCCESS: (changes: string) => 
    `I've updated the diagram with the following changes: ${changes}. The diagram now includes improved structure and clarity.`,
  
  CLARIFICATION_NEEDED: (aspect: string) =>
    `I need more information about ${aspect}. Could you provide more details about what you'd like to see?`,
  
  SUGGESTION: (suggestion: string) =>
    `Based on your request, I've made the changes and also suggest: ${suggestion}`,
  
  ERROR_RECOVERY: (error: string, solution: string) =>
    `I encountered an issue: ${error}. I've provided an alternative solution: ${solution}`
};

// Helper function to categorize user input
export function categorizeUserIntent(input: string): string {
  const normalizedInput = input.toLowerCase();
  
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.keywords.some(keyword => normalizedInput.includes(keyword))) {
      return intent;
    }
  }
  
  return 'GENERAL';
}

// Helper function to extract diagram type from user input
export function extractDiagramType(input: string): string | null {
  const diagramTypes = [
    'flowchart', 'sequence', 'class', 'state', 'er', 'entity relationship',
    'gantt', 'pie', 'gitgraph', 'git', 'mindmap', 'mind map', 'journey'
  ];
  
  const normalizedInput = input.toLowerCase();
  
  for (const type of diagramTypes) {
    if (normalizedInput.includes(type)) {
      return type;
    }
  }
  
  return null;
}