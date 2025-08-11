import React, { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { IoChevronForward, IoSearch } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import axios from "axios";
import { toast } from "react-hot-toast";

const Maintenance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/inventory/maintenance");
        if (response.data.success) {
          setMaintenanceList(response.data.data);
          setFilteredList(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch maintenance records");
        }
      } catch (err) {
        console.error("Error fetching maintenance:", err);
        setError(err.message || "Failed to fetch maintenance records");
        toast.error(err.message || "Failed to fetch maintenance records");
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, [location.state?.refresh]);

  const handleAddMaintenance = () => {
    navigate(`/inventory/add-maintenance`, { state: { from: location.pathname } });
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = maintenanceList.filter(
      (item) => item.equipmentName.toLowerCase().includes(searchTerm)
    );
    setFilteredList(filtered);
  };

  const handleSort = () => {
    const sorted = [...filteredList].sort((a, b) =>
      a.equipmentName.localeCompare(b.equipmentName)
    );
    setFilteredList(sorted);
  };

  if (loading) {
    return <div className="container text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="container text-center py-5 text-danger">{error}</div>;
  }

  return (
    <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
      <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
        <div className="d-flex gap-2 align-items-center w-50">
          <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
            <IoSearch size={16} className="text-muted" />
            <Form className="d-flex flex-grow-1">
              <Form.Group className="w-100">
                <Form.Control
                  type="text"
                  placeholder="Enter Equipment name"
                  style={{
                    paddingLeft: "4px",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    fontSize: "14px",
                  }}
                  onChange={handleSearch}
                />
              </Form.Group>
            </Form>
          </div>
          <img
            src={sortIcon}
            alt="sortIcon"
            style={{ width: "25px", cursor: "pointer" }}
            onClick={handleSort}
          />
          <img
            src={filterIcon}
            alt="filterIcon"
            style={{ width: "25px", cursor: "pointer" }}
          />
        </div>

        <Button
          variant="light-gray"
          className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
          style={{ fontSize: "12px", width: "200px" }}
          onClick={handleAddMaintenance}
        >
          Add Maintenance
        </Button>
      </div>

      <div className="table-responsive bg-white mt-3" style={{ maxHeight: "65vh", overflowY: "auto" }}>
        <Table className="table table-hover align-middle">
          <thead className="text-white text-center sticky-top" style={{ background: "#343a40" }}>
            <tr className="text-start" style={{ fontSize: "14px" }}>
              <th>Sl.No</th>
              <th>Product</th>
              <th>Code</th>
              <th>Sent Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, idx) => (
              <tr
                key={item._id}
                style={{ fontSize: "12px" }}
                className="fw-semibold"
                onClick={() =>
                  navigate(`/inventory/equipment-details/${item._id}`, {
                    state: { from: location.pathname },
                  })
                }
              >
                <td>{String(idx + 1).padStart(2, "0")}</td>
                <td className="d-flex gap-2 align-items-center">
                  <img
                    src={
                      item.inventoryId?.image
                        ? `http://localhost:5000/${item.inventoryId.image}`
                        : "https://via.placeholder.com/40?text=No+Image"
                    }
                    alt="inventory"
                    className="rounded-3 shadow"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/40?text=No+Image")}
                  />
                  <p>{item.equipmentName}</p>
                </td>
                <td>{item.inventoryId.slice(-6)}</td>
                <td>{new Date(item.sendDate).toLocaleDateString()}</td>
                <td>{item.status}</td>
                <td style={{ cursor: "pointer" }}>
                  <IoChevronForward size={20} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Maintenance;