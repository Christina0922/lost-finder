import React from "react";
import Banner from "./components/Banner";

function App() {
  return (
    <div style={{ padding: "10px" }}>
      {/* 쿠팡 배너 */}
      <Banner />

      {/* 나머지 페이지 내용 */}
      <h1>LostFinder 메인 페이지</h1>
    </div>
  );
}

export default App;
