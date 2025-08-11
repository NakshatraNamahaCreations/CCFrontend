import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Card,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import { IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import DynamicPagination from "../DynamicPagination";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch payments with pagination, search, and date filter
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payments/completed?page=${currentPage}&limit=10&search=${search}&startDate=${startDate}&endDate=${endDate}`
      );
      const paymentsData = response.data.data || [];

      const paymentList = paymentsData.map((p, index) => ({
        id: `payment-${p.quotationId}-${index}`,
        quotationId: p.quotationId,
        name: p.firstPersonName,
        phone: p.firstPersonPhone,
        paymentId: `INST-${p.totalCompletedInstallments}`,
        amount: `₹${p.completedInstallments
          .reduce((sum, i) => sum + (i.amount || 0), 0)
          .toLocaleString("en-IN")}`,
        status: p.totalCompletedInstallments > 0 ? "Completed" : "Pending",
        date: p.completedInstallments.length
          ? new Date(
              p.completedInstallments[
                p.completedInstallments.length - 1
              ].dueDate
            ).toLocaleDateString("en-GB")
          : "N/A",
      }));

      setPayments(paymentList);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch payments";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, search, startDate, endDate]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  // Fetch full report for Excel download
  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payments/completed?search=${search}&startDate=${startDate}&endDate=${endDate}&all=true`
      );
      const fullData = response.data.data || [];

      const worksheetData = fullData.map((p) => ({
        "Quotation ID": p.quotationId,
        "Lead ID": p.leadId,
        "Query ID": p.queryId,
        "Customer Name": p.firstPersonName,
        Phone: p.firstPersonPhone,
        "Total Installments Completed": p.totalCompletedInstallments,
        "Total Amount Paid": p.completedInstallments.reduce(
          (sum, i) => sum + (i.amount || 0),
          0
        ),
        "Last Payment Date": p.completedInstallments.length
          ? new Date(
              p.completedInstallments[
                p.completedInstallments.length - 1
              ].dueDate
            ).toLocaleDateString("en-GB")
          : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
      XLSX.writeFile(workbook, "CompletedPaymentsReport.xlsx");

      toast.success("Excel downloaded successfully");
    } catch (err) {
      toast.error("Failed to download Excel");
    }
  };

  return (
    <div
      className="container py-2 rounded vh-100"
      style={{ background: "#F4F4F4" }}
    >
      {/* Search and Date Filters */}
      <div className="mb-3 d-flex flex-wrap justify-content-between">
        <Form
          onSubmit={handleSearch}
          className="mb-2"
          style={{ width: "350px" }}
        >
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by name or phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={loading}
            />
            <Button variant="dark" type="submit" disabled={loading}>
              Search
            </Button>
            {search && (
              <Button
                variant="outline-secondary"
                onClick={handleClearSearch}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </Form>

        {/* Date Filter */}
        <Row className="">
          <Col md={4}>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              style={{ fontSize: "12px" }}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              style={{ fontSize: "12px" }}
            />
          </Col>
          <Col>
            <Button
              variant="secondary"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              style={{ fontSize: "12px" }}
            >
              Clear Dates
            </Button>
          </Col>
        </Row>
      </div>

      {/* Top Right Actions */}
      <div className="d-flex justify-content-end mb-2 gap-2">
       <Button
          variant="light-gray"
          className="btn rounded-5 bg-white border-2 shadow-sm"
          style={{ fontSize: "14px" }}
          onClick={handleDownloadExcel}
        >
          Download Excel
        </Button>
      
      </div>

      {/* Table */}
      <Card className="border-0 p-3 my-3">
        {error && <p className="text-danger">{error}</p>}
        {loading && <p>Loading...</p>}
        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead
              className="text-white text-center sticky-top"
              style={{ backgroundColor: "#343a40" }}
            >
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.No</th>
                <th>Name</th>
                <th>Phone No</th>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody
              style={{ fontSize: "12px", textAlign: "center" }}
              className="fw-semibold"
            >
              {payments.length === 0 && !loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(
                        `/payment/installment-details/${payment.quotationId}`
                      )
                    }
                  >
                    <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                    <td>{payment.name}</td>
                    <td>{payment.phone}</td>
                    <td>{payment.paymentId}</td>
                    <td>{payment.amount}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          payment.status === "Completed" ? "success" : "warning"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td>{payment.date}</td>
                    <td>
                      <IoChevronForward size={20} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <DynamicPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default PaymentPage;
