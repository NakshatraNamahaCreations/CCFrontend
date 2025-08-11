import { Card } from "react-bootstrap";
import { AiOutlineUser, AiOutlinePhone, AiOutlineDollarCircle, AiOutlineCalendar, AiOutlineTool } from "react-icons/ai";
import { FaUsers, FaWarehouse, FaTruckLoading, FaIndustry, FaUserCog, FaCheckCircle, FaPencilAlt, FaMoneyCheckAlt, FaBoxOpen } from "react-icons/fa";

const Dashboard = () => {
  const preProductionData = [
    { title: "New Lead", count: 45, subtitle: "Enquiries", icon: <AiOutlineUser size={20} /> },
    { title: "Follow Up", count: 10, subtitle: "Clients", icon: <AiOutlinePhone size={20} /> },
    { title: "Vendor", count: 25, subtitle: "(Not Assigned)", icon: <FaUsers size={20} /> },
    { title: "Payments", count: 89, subtitle: "(Token advance)", icon: <AiOutlineDollarCircle size={20} /> },
  ];

  const productionData = [
    { title: "Inventory Check In", count: 25, subtitle: "Equipment's", icon: <FaWarehouse size={20} /> },
    { title: "Inventory Check Out", count: 40, subtitle: "Equipment's", icon: <FaTruckLoading size={20} /> },
    { title: "Today's Event", count: 15, subtitle: "Venue", icon: <AiOutlineCalendar size={20} /> },
    { title: "Inhouse Vendor", count: 15, subtitle: "(Assigned)", icon: <FaIndustry size={20} /> },
    { title: "Third Party Vendor", count: 22, subtitle: "(Assigned)", icon: <FaUserCog size={20} /> },
    { title: "Maintenance", count: "00", subtitle: "(Inventory)", icon: <AiOutlineTool size={20} /> },
  ];

  const postProductionData = [
    { title: "Event Completed", count: 10, subtitle: "ceremonies", icon: <FaCheckCircle size={20} /> },
    { title: "Vendor on editing", count: 15, subtitle: "Vendors", icon: <FaPencilAlt size={20} /> },
    { title: "Pending payments", count: 5, subtitle: "Clients", icon: <FaMoneyCheckAlt size={20} /> },
    { title: "Project Delivery", count: 2, subtitle: "Clients", icon: <FaBoxOpen size={20} /> },
  ];

  return (
    <div className="container p-4 rounded " style={{ background: "#F4F4F4",  }} >

      <h5 className="mt-3 fw-bold">Pre Production</h5>
      <div className="row mt-4 justify-content-start">
        {preProductionData.map((item, index) => (
          <div className="col-md-2 col-sm-4 col-6 mb-2 px-1" key={index}>
            <Card className="shadow border-0 p-2 text-center " style={{ width: "100%", height: "140px" }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="mb-1">{item.icon}</div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "12px" }}>{item.title}</h6>
                <p className="fw-bold mb-0" style={{ fontSize: "18px" }}>{item.count}</p>
                <small className="text-muted" style={{ fontSize: "10px" }}>{item.subtitle}</small>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>



      <h5 className="mt-4 fw-bold">Production</h5>
      <div className="row mt-4">
        {productionData.map((item, index) => (
          <div className="col-md-2 col-sm-6 mb-3" key={index}>
            <Card className="shadow border-0 p-2 text-center" style={{ width: "100%", height: "140px" }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="mb-1">{item.icon}</div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "12px" }}>{item.title}</h6>
                <p className="fw-bold mb-0" style={{ fontSize: "18px" }}>{item.count}</p>
                <small className="text-muted" style={{ fontSize: "10px" }}>{item.subtitle}</small>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <h5 className="mt-4 fw-bold">Post Production</h5>
      <div className="row mt-4 justify-content-start">
        {postProductionData.map((item, index) => (
          <div className="col-md-2 col-sm-4 col-6 mb-2 px-1" key={index}>
            <Card className="shadow border-0 p-2 text-center" style={{ width: "100%", height: "140px" }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="mb-1">{item.icon}</div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "12px" }}>{item.title}</h6>
                <p className="fw-bold mb-0" style={{ fontSize: "18px" }}>{item.count}</p>
                <small className="text-muted" style={{ fontSize: "10px" }}>{item.subtitle}</small>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
