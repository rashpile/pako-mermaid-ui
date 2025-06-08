import { AppProvider } from './components/App/AppProvider';
import { App as MermaidApp } from './components/App/App';
import './App.css';

function App() {
  return (
    <AppProvider>
      <MermaidApp />
    </AppProvider>
  );
}

export default App;