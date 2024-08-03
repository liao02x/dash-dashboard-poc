import { css } from "@emotion/css";
import Dashboard from "./Dashboard";

function App() {
  return (
    <div
      className={css({
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      })}
    >
      <div
        className={css({
          flex: "0 0 15%",
          background: "#00000011",
          minHeight: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        sidebar
      </div>
      <div
        className={css({
          flex: "0 0 85%",
          overflowY: "auto",
          minHeight: "100%",
        })}
      >
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
