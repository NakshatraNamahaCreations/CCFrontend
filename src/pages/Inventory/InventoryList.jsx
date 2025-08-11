import React, { useEffect, useState } from "react";
import { Button, Card, Form, Container } from "react-bootstrap";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import { IoSearch } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import DynamicPagination from "../DynamicPagination";

const InventoryCard = ({ inventory }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);

  const imageSrc =
    inventory.image && !imageError
      ? `http://localhost:5000/${inventory.image.replace(/\\/g, "/")}`
      : "https://via.placeholder.com/80?text=No+Image";

  return (
    <div className="col-md-4 col-sm-6 col-xs-12">
      <Card className="shadow rounded-3 mb-3 p-2 border-0">
        <p className="text-muted" style={{ fontSize: "14px" }}>
          <strong>{inventory.equipmentName}</strong>
        </p>
        <div className="d-flex flex-row">
          <div>
            <img
              src={imageSrc}
              alt="inventory"
              className="rounded-3 shadow"
              style={{ width: "80px", height: "100px", objectFit: "cover" }}
              onError={handleImageError}
            />
          </div>
          <div className="d-flex p-3 gap-3" style={{ lineHeight: ".4", fontSize: "12px" }}>
            <div>
              <p><strong>Sensor</strong></p>
              <p><strong>Processor</strong></p>
              <p><strong>Autofocus</strong></p>
              <p><strong>ISO</strong></p>
            </div>
            <div>
              <p>{inventory.sensor || "N/A"}</p>
              <p>{inventory.processor || "N/A"}</p>
              <p>{inventory.autofocus || "N/A"}</p>
              <p>{inventory.isoRange || "N/A"}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const InventoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInventories = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/inventory", {
        params: { page, limit: 6, search: searchValue },
      });
      if (response.data.success) {
        setInventoryList(response.data.data);
        setTotalPages(response.data.totalPages);
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

  useEffect(() => {
    fetchInventories(currentPage, search);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInventories(1, search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    fetchInventories(1, "");
  };

  const handleAddInventory = () => {
    navigate(`/inventory/add-inventory`, { state: { from: location.pathname, refresh: true } });
  };

  if (loading) {
    return <Container className="text-center py-5">Loading...</Container>;
  }

  if (error) {
    return <Container className="text-center py-5 text-danger">{error}</Container>;
  }

  return (
    <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
      <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
        <div className="d-flex gap-2 align-items-center w-50">
          {/* Search UI */}
          <div className="w-100 bg-white d-flex align-items-center px-2 rounded">
            <IoSearch size={16} className="text-muted" />
            <Form.Control
              type="text"
              placeholder="Enter Equipment name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: "4px",
                border: "none",
                outline: "none",
                boxShadow: "none",
                fontSize: "14px",
              }}
            />
            {search ? (
              <Button
                variant="dark"
                className="px-3 py-1"
                onClick={handleSearch}
              >
                Search
              </Button>
            ) : (
              <Button
                variant="dark"
                className="px-3 py-1"
                disabled
              >
                Search
              </Button>
            )}
            {search && (
              <Button
                variant="light"
                className="px-3 py-1 ms-1 border"
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            )}
          </div>

          <img
            src={sortIcon}
            alt="sortIcon"
            style={{ width: "25px", cursor: "pointer" }}
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
          onClick={handleAddInventory}
        >
          Add Inventory
        </Button>
      </div>

      {/* Inventory Cards */}
      <div className="row mt-4">
        {inventoryList.length === 0 ? (
          <Container className="text-center py-5">No inventory items found.</Container>
        ) : (
          inventoryList.map((inventory) => (
            <InventoryCard inventory={inventory} key={inventory.id} />
          ))
        )}
      </div>

      {/* Pagination */}
      <DynamicPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default InventoryList;
