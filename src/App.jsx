import { BrowserRouter as Router } from 'react-router-dom';
import NavRoute from './routes/Routes.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <NavRoute />
      </div>
    </Router>
  );
}

export default App;

