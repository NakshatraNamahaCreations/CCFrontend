// import { useState } from "react";
// import Sidebar from "../components/sidebar"; 
// import Header from "./Header";

// const Layout = ({ children }) => {
//   return (
//     <>
//       <div className="d-flex hide-scrollbar ">
//         <div className="col-md-2">
//           <Sidebar />
//         </div>
//         <div className="col-md-10">
//           <div className="flex-grow-1 ms-4" style={{ marginLeft: "250px" }}>
//             <Header />
//             <div className="px-4">{children}</div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Layout;


import Sidebar from "../components/sidebar";
import Header from "./Header";

const Layout = ({ children, handleLogout }) => {
  return (
    <div className="d-flex hide-scrollbar">
      <div className="col-md-2">
        <Sidebar />
      </div>
      <div className="col-md-10">
        <div className="flex-grow-1 ms-4" style={{ marginLeft: "250px" }}>
          {/* Pass logout to Header */}
          <Header handleLogout={handleLogout} />
          <div className="px-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
