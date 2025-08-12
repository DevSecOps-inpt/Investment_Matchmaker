import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartupList from './components/StartupList';
import StartupDetail from './components/StartupDetail';
import ChatRoom from './components/ChatRoom';
import CreateStartup from './components/CreateStartup';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>🚀 Investment Matchmaker</h1>
          <p>Connect entrepreneurs with investors</p>
        </header>
        
        <main className="App-main">
          <Routes>
            <Route path="/" element={<StartupList />} />
            <Route path="/startup/:id" element={<StartupDetail />} />
            <Route path="/chat/:roomId" element={<ChatRoom />} />
            <Route path="/create" element={<CreateStartup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
