import { MermaidDiagramInfo } from '../types/mermaid';

/**
 * Predefined example Mermaid diagrams for users to get started quickly
 */

export const EXAMPLE_DIAGRAMS: MermaidDiagramInfo[] = [
  {
    type: 'flowchart',
    syntax: 'flowchart TD',
    description: 'A simple flowchart showing a decision process',
    example: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`
  },
  {
    type: 'sequence',
    syntax: 'sequenceDiagram',
    description: 'Sequence diagram showing API interaction',
    example: `sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Submit form
    Frontend->>API: POST /api/data
    API->>Database: INSERT query
    Database-->>API: Success
    API-->>Frontend: 201 Created
    Frontend-->>User: Success message`
  },
  {
    type: 'class',
    syntax: 'classDiagram',
    description: 'Class diagram showing object relationships',
    example: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +move()
    }
    
    class Dog {
        +String breed
        +bark()
        +fetch()
    }
    
    class Cat {
        +String color
        +meow()
        +purr()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`
  },
  {
    type: 'state',
    syntax: 'stateDiagram-v2',
    description: 'State diagram showing application states',
    example: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : start
    Loading --> Success : data received
    Loading --> Error : error occurred
    Success --> Idle : reset
    Error --> Idle : retry
    Error --> [*] : give up`
  },
  {
    type: 'er',
    syntax: 'erDiagram',
    description: 'Entity relationship diagram for database design',
    example: `erDiagram
    USER {
        int id PK
        string username
        string email
        datetime created_at
    }
    
    POST {
        int id PK
        int user_id FK
        string title
        text content
        datetime created_at
    }
    
    COMMENT {
        int id PK
        int post_id FK
        int user_id FK
        text content
        datetime created_at
    }
    
    USER ||--o{ POST : creates
    POST ||--o{ COMMENT : has
    USER ||--o{ COMMENT : writes`
  },
  {
    type: 'gantt',
    syntax: 'gantt',
    description: 'Gantt chart for project timeline',
    example: `gantt
    title Project Development Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements    :done, req, 2024-01-01, 2024-01-05
    Design         :done, design, after req, 5d
    section Development
    Backend        :active, backend, 2024-01-10, 10d
    Frontend       :frontend, after backend, 8d
    Testing        :test, after frontend, 5d
    section Deployment
    Staging        :staging, after test, 2d
    Production     :prod, after staging, 1d`
  },
  {
    type: 'pie',
    syntax: 'pie',
    description: 'Pie chart showing data distribution',
    example: `pie title Programming Languages Used
    "JavaScript" : 35
    "TypeScript" : 25
    "Python" : 20
    "Java" : 10
    "Other" : 10`
  },
  {
    type: 'gitgraph',
    syntax: 'gitgraph',
    description: 'Git branch visualization',
    example: `gitgraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add login feature"
    branch feature/auth
    checkout feature/auth
    commit id: "Implement OAuth"
    commit id: "Add tests"
    checkout develop
    merge feature/auth
    checkout main
    merge develop
    commit id: "Release v1.0"`
  },
  {
    type: 'mindmap',
    syntax: 'mindmap',
    description: 'Mind map for project planning',
    example: `mindmap
  root((Project))
    Frontend
      React
      TypeScript
      Tailwind CSS
    Backend
      Node.js
      Express
      Database
        PostgreSQL
        Redis
    DevOps
      Docker
      CI/CD
      Monitoring`
  },
  {
    type: 'journey',
    syntax: 'journey',
    description: 'User journey mapping',
    example: `journey
    title User Registration Journey
    section Discovery
      Visit website     : 5: User
      Browse features   : 4: User
    section Registration
      Click sign up     : 3: User
      Fill form        : 2: User
      Verify email     : 3: User
    section Onboarding
      Complete profile : 4: User
      Tutorial         : 5: User
      First action     : 5: User`
  }
];

// Helper function to get example by type
export function getExampleByType(type: string): MermaidDiagramInfo | undefined {
  return EXAMPLE_DIAGRAMS.find(example => example.type === type);
}

// Helper function to get all example types
export function getExampleTypes(): string[] {
  return EXAMPLE_DIAGRAMS.map(example => example.type);
}

// Default diagram for new projects
export const DEFAULT_DIAGRAM = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`;

// Tutorial diagrams for getting started
export const TUTORIAL_DIAGRAMS = {
  beginner: `flowchart LR
    A[Welcome to Mermaid!] --> B[Create diagrams with text]
    B --> C[Real-time preview]
    C --> D[Export when ready]`,
    
  intermediate: `sequenceDiagram
    participant You
    participant Editor
    participant AI
    
    You->>Editor: Type diagram description
    Editor->>AI: "Add a database step"
    AI->>Editor: Updated diagram code
    Editor->>You: Real-time preview`,
    
  advanced: `graph TB
    subgraph "Mermaid Editor Features"
        A[Monaco Editor] --> B[Syntax Highlighting]
        A --> C[Auto-completion]
        A --> D[Error Detection]
    end
    
    subgraph "AI Assistant"
        E[Natural Language] --> F[Code Generation]
        F --> G[Diagram Updates]
    end
    
    subgraph "Export Options"
        H[SVG]
    end
    
    B --> E
    G --> H`
};