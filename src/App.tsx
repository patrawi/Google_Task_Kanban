import React from "react";
import KanbanBoard from "./components/board/KanbanBoard";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <KanbanBoard />
    </div>
  );
};

export default App;
