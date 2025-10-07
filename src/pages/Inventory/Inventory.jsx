import React, { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { IoChevronForward, IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import updownarrow from "../../assets/icons/updownarrow.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_URL } from "../../utils/api";

const Inventory = () => {
  const navigate = useNavigate();
  const [inventoryList, setInventoryList] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        if (response.data.success) {
          setInventoryList(response.data.data);
          setFilteredInventory(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch inventory");
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError(err.message || "Failed to fetch inventory");
        toast.error(err.message || "Failed to fetch inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, []);

  const handleCategoryToggle = () => {
    const categories = ["All", "Camera", "Video Camera"];
    const currentIndex = categories.indexOf(categoryFilter);
    const nextIndex = (currentIndex + 1) % categories.length;
    setCategoryFilter(categories[nextIndex]);
  };

  useEffect(() => {
    if (categoryFilter === "All") {
      setFilteredInventory(inventoryList);
    } else {
      const filtered = inventoryList.filter(item => item.category.toLowerCase() === categoryFilter.toLowerCase());
      setFilteredInventory(filtered);
    }
  }, [categoryFilter, inventoryList]);

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
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filtered = inventoryList.filter(item =>
                      item.name.toLowerCase().includes(searchTerm)
                    );
                    setFilteredInventory(filtered);
                  }}
                />
              </Form.Group>
            </Form>
          </div>
          <img
            src={sortIcon}
            alt="sortIcon"
            style={{ width: "25px", cursor: "pointer" }}
            onClick={() => {
              const sorted = [...filteredInventory].sort((a, b) =>
                a.name.localeCompare(b.name)
              );
              setFilteredInventory(sorted);
            }}
          />
          <img
            src={filterIcon}
            alt="filterIcon"
            style={{ width: "25px", cursor: "pointer" }}
          />
        </div>
        <div className="d-flex gap-4 w-50">
          <Button
            variant="light-gray"
            className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
            style={{ fontSize: "14px", width: "200px" }}
            onClick={() => navigate("/inventory/inventory-list")}
          >
            Inventory List
          </Button>
          <Button
            variant="light-gray"
            className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
            style={{ fontSize: "14px", width: "200px" }}
            onClick={() => navigate("/inventory/maintenance")}
          >
            Maintenance
          </Button>
        </div>
      </div>
      <div className="table-responsive bg-white mt-3" style={{ maxHeight: "75vh", overflowY: "auto" }}>
        <Table className="table table-hover align-middle">
          <thead className="text-white text-center sticky-top" style={{ background: "#343a40" }}>
            <tr style={{ fontSize: "14px" }}>
              <th>Sl.No</th>
              <th>Name</th>
              <th>
                Category
                <button
                  onClick={handleCategoryToggle}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                >
                  <img src={updownarrow} alt="filter" style={{ width: "9px" }} />
                </button>
              </th>
              <th>Total Stock</th>
              <th>Assigned Stock</th>
              <th>Maintenance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item, idx) => (
              <tr key={item.id} style={{ fontSize: "12px" }} className="fw-semibold text-center">
                <td>{String(idx + 1).padStart(2, "0")}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.totalStock}</td>
                <td>{item.assignedStock}</td>
                <td>{item.maintenance}</td>
                <td style={{ cursor: "pointer" }}>
                  <IoChevronForward size={20} onClick={() => navigate(`/inventory/details/${item.id}`)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Inventory;