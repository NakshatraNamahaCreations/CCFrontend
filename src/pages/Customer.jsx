import React, { useState } from "react";
import { Button, Form, } from "react-bootstrap";
import { IoSearch } from "react-icons/io5";
import sortIcon from "../assets/icons/sort.png"
import filterIcon from "../assets/icons/filter.png"
import Newleads from "./Customer/Newleads";
import Customers from "./Customer/Customers";
import { useNavigate } from "react-router-dom";

const Customer = () => {
  const [activeTab, setActiveTab] = useState("Newleads");
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case "Newleads":
        return <Newleads />;
      case "customers":
        return <Customers />;
      default:
        return <Newleads />;
    }
  };

  return (
    <div className="container py-2 rounded vh-100" style={{ background: "#F4F4F4" }}>
      <div className=" d-flex gap-2 align-items-center justify-content-end p-2 rounded">

        <div className="">
          <Button onClick={() => navigate("/customer/addLeads")}
            variant="light-gray" className="btn rounded-5 bg-white border-2 fw-bold shadow-sm" style={{ fontSize: "14px" }}>
            + Add Leads
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="d-flex gap-3 my-2">
        <p
          className={` text-center ${activeTab === "Newleads" ? "fw-bold text-dark border-bottom border-3 border-dark" : "text-muted"}`}
          onClick={() => setActiveTab("Newleads")}
          style={{ fontSize: "14px", cursor: "pointer" }}
        >
          New Leads
        </p>
        <p
          className={` text-center ${activeTab === "customers" ? "fw-bold text-dark border-bottom border-3 border-dark" : "text-muted"}`}
          onClick={() => setActiveTab("customers")}
          style={{ fontSize: "14px", cursor: "pointer" }}
        >
          Customers
        </p>

      </div>

      {/* Render Active Tab Content */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default Customer;
