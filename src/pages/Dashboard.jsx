import axios from "axios";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import {
  AiOutlineUser,
  AiOutlinePhone,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
  AiOutlineTool,
} from "react-icons/ai";
import {
  FaUsers,
  FaWarehouse,
  FaTruckLoading,
  FaIndustry,
  FaUserCog,
  FaCheckCircle,
  FaPencilAlt,
  FaMoneyCheckAlt,
  FaBoxOpen,
} from "react-icons/fa";
import PaymentStatsChart from "./PaymentStatsChart";
import { API_URL } from "../utils/api";


const Dashboard = () => {
  const [newQueriesCount, setNewQueriesCount] = useState(0);
  const [followupCounts, setFollowupCounts] = useState(0);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
  const [todaysEventsCount, setTodaysEventsCount] = useState(0);
  const [completedQuotationsCount, setCompletedQuotationsCount] = useState(0);
  const [todaysCallFollowupCount, setTodaysCallFollowupCount] = useState(0);

  const fetchNewQueriesCount = async () => {
    // ✅ Remove (req, res) parameters
    try {
      const response = await axios.get(
        `${API_URL}/lead/count?status=Created`
      );
      if (response.data.success) {
        setNewQueriesCount(response.data.count);
      }
    } catch (error) {
      console.log("Error in fetching Queries Count", error); // ✅ Fixed typo: "is" → "in"
    }
  };

  const fetchFollowUpCount = async () => {
    // ✅ Remove (req, res) parameters
    try {
      const response = await axios.get(
        `${API_URL}/lead/count?status=Call Later`
      );
      if (response.data.success) {
        setFollowupCounts(response.data.count);
      }
    } catch (error) {
      console.log("Error in fetching Queries Count", error); // ✅ Fixed typo: "is" → "in"
    }
  };

  const fetchPendingPaymentCount = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/quotations/count/pending-payments`
      );

      if (response.data.success) {
        setPendingPaymentCount(response.data.count);
      }
    } catch (error) {
      console.log("Error in fetching pending payment count", error);
    }
  };

  const fetchTodaysEventsCount = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/quotations/count/todays-events`
      );

      if (response.data.success) {
        setTodaysEventsCount(response.data.count);
      }
    } catch (error) {
      console.log("Error in fetching today's events count", error);
    }
  };

  const fetchCompletedQuotationsCount = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/quotations/count/completed`
      );

      if (response.data.success) {
        setCompletedQuotationsCount(response.data.count);
      }
    } catch (error) {
      console.log("Error in fetching completed quotations count", error);
    }
  };
  const fetchTodaysCallfollowupCount = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/lead/queries/rescheduled/today`
      );

      if (response.data.success) {
        setTodaysCallFollowupCount(response.data.count);
      }
    } catch (error) {
      console.log("Error in fetching completed quotations count", error);
    }
  };

  useEffect(() => {
    fetchNewQueriesCount();
    fetchFollowUpCount();
    fetchPendingPaymentCount();
    fetchTodaysEventsCount();
    fetchCompletedQuotationsCount();
    fetchTodaysCallfollowupCount();
  }, []);

  const preProductionData = [
    {
      title: "New Lead",
      count: newQueriesCount,
      subtitle: "Enquiries",
      icon: <AiOutlineUser size={20} />,
    },
    {
      title: "Payment Follow Up",
      count: followupCounts,
      subtitle: "Clients",
      icon: <AiOutlinePhone size={20} />,
    },
    {
      title: "Today's Follow Up",
      count: todaysCallFollowupCount,
      subtitle: "Call ",
      icon: <AiOutlinePhone size={20} />,
    },
    {
      title: "Vendor",
      count: 25,
      subtitle: "(Not Assigned)",
      icon: <FaUsers size={20} />,
    },
    {
      title: "Pending Payments",
      count: pendingPaymentCount,
      subtitle: "(Taken advance)",
      icon: <AiOutlineDollarCircle size={20} />,
    },
  ];

  const productionData = [
    {
      title: "Inventory Check In",
      count: 25,
      subtitle: "Equipment's",
      icon: <FaWarehouse size={20} />,
    },
    {
      title: "Inventory Check Out",
      count: 40,
      subtitle: "Equipment's",
      icon: <FaTruckLoading size={20} />,
    },
    {
      title: "Today's Event",
      count: todaysEventsCount,
      subtitle: "Venue",
      icon: <AiOutlineCalendar size={20} />,
    },
    {
      title: "Inhouse Vendor",
      count: 15,
      subtitle: "(Assigned)",
      icon: <FaIndustry size={20} />,
    },
    {
      title: "Third Party Vendor",
      count: 22,
      subtitle: "(Assigned)",
      icon: <FaUserCog size={20} />,
    },
    {
      title: "Maintenance",
      count: "00",
      subtitle: "(Inventory)",
      icon: <AiOutlineTool size={20} />,
    },
  ];

  const postProductionData = [
    {
      title: "Event Completed",
      count: 10,
      subtitle: "ceremonies",
      icon: <FaCheckCircle size={20} />,
    },
    // {
    //   title: "Remaining photos to edit",
    //   count: 15,
    //   subtitle: "Vendors",
    //   icon: <FaPencilAlt size={20} />,
    // },
    // {
    //   title: "Remaining Video to edit",
    //   count: 15,
    //   subtitle: "Vendors",
    //   icon: <FaPencilAlt size={20} />,
    // },

    {
      title: "Project Delivery",
      count: completedQuotationsCount,
      subtitle: "Clients",
      icon: <FaBoxOpen size={20} />,
    },
  ];

  return (
    <div className="container p-4 rounded " style={{ background: "#F4F4F4" }}>
      <h5 className="mt-3 fw-bold">Pre Production</h5>
      <div className="row mt-4 justify-content-start">
        {preProductionData.map((item, index) => (
          <div className="col-md-2 col-sm-4 col-6 mb-2 px-1" key={index}>
            <Card
              className="shadow border-0 p-2 text-center "
              style={{ width: "100%", height: "140px" }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="mb-1">{item.icon}</div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "12px" }}>
                  {item.title}
                </h6>
                <p className="fw-bold mb-0" style={{ fontSize: "18px" }}>
                  {item.count}
                </p>
                <small className="text-muted" style={{ fontSize: "10px" }}>
                  {item.subtitle}
                </small>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <h5 className="mt-4 fw-bold">Production</h5>
      <div className="row mt-4">
        {productionData.map((item, index) => (
          <div className="col-md-2 col-sm-6 mb-3" key={index}>
            <Card
              className="shadow border-0 p-2 text-center"
              style={{ width: "100%", height: "140px" }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="mb-1">{item.icon}</div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "12px" }}>
                  {item.title}
                </h6>
                <p className="fw-bold mb-0" style={{ fontSize: "18px" }}>
                  {item.count}
                </p>
                <small className="text-muted" style={{ fontSize: "10px" }}>
                  {item.subtitle}
                </small>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <h5 className="mt-4 fw-bold">Post Production</h5>
      <div className="row mt-4 justify-content-start">
        {postProductionData.map((item, index) => (
          <div className="col-md-2 col-sm-4 col-6 mb-2 px-1" key={index}>
            <Card
              className="shadow border-0 p-2 text-center"
              style={{ width: "100%", height: "140px" }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="mb-1">{item.icon}</div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "12px" }}>
                  {item.title}
                </h6>
                <p className="fw-bold mb-0" style={{ fontSize: "18px" }}>
                  {item.count}
                </p>
                <small className="text-muted" style={{ fontSize: "10px" }}>
                  {item.subtitle}
                </small>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <PaymentStatsChart />


    </div>
  );
};

export default Dashboard;
