import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tutor from './pages/Tutor';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
