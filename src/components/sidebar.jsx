import { Link, useLocation } from "react-router-dom";
import { FaUsers,FaRegWindowRestore,  FaFileInvoice, FaShoppingCart, FaIndustry, FaMoneyBillWave, FaLayerGroup , FaUserCog } from "react-icons/fa";
import { useState, useEffect } from "react";
import logo from "../assets/icons/logo.png";
import { MdOutlineInventory, MdPostAdd  } from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();
  // const [activeLink, setActiveLink] = useState(location.pathname);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: FaLayerGroup },
    { name: "Master", path: "/master", icon: FaRegWindowRestore  },
    { name: "Customer", path: "/customer", icon: FaUsers },
    { name: "Quotation", path: "/quotation", icon: FaFileInvoice },
    { name: "Booking", path: "/booking", icon: FaShoppingCart },
    { name: "Vendors", path: "/vendors", icon: FaIndustry },
    { name: "Inventory", path: "/inventory", icon: MdOutlineInventory },
    { name: "Payment", path: "/payment", icon: FaMoneyBillWave },
    { name: "Post production", path: "/post-production", icon: MdPostAdd  },
    { name: "Settings", path: "/settings", icon: FaUserCog  },

  ];

  // Update activeLink when location.pathname changes (e.g., after a page reload)
  // useEffect(() => {
  //   setActiveLink(location.pathname);
  // }, [location.pathname]);

  // Function to check if the path is active (includes for partial matching)
  const isActiveLink = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="flex-column flex-shrink-0 p-3 vh-100 position-fixed" style={{ width: "250px", background: "#F4F4F4" }}>
      <div className="w-100 d-flex justify-content-center">
        <Link to="/dashboard">
          <img src={logo} alt="logo" style={{ width: "100px" }} className="mx-auto" />
        </Link>
      </div>

      <ul className="nav flex-column mt-2">
        {menuItems.map((item, index) => (
          <li key={index} className="nav-item my-1">
            <Link
              to={item.path}
              className={`${
                isActiveLink(item.path) ? "bg-dark text-white" : ""
              } nav-link d-flex align-items-center text-dark`}
            >
              <item.icon className="me-2" />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
