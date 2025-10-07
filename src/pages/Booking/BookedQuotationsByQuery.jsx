import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_URL } from "../../utils/api";

const BookedQuotationsByQuery = () => {
  const { queryId } = useParams();
  const [bookedQuotations, setBookedQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("customer");

  useEffect(() => {
    const fetchBookedQuotations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/quotations/booked-by-query/${queryId}`
        );

        if (response.data.success) {
          setBookedQuotations(response.data.data || []);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch booked quotations"
        );
        console.error("Error fetching booked quotations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (queryId) {
      fetchBookedQuotations();
    }
  }, [queryId]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-dark" role="status"></div></div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container-fluid py-4">
      {bookedQuotations.map((quotation) => (
        <div key={quotation._id} className="card shadow-lg mb-4">
          {/* Header Section */}
          <div className="card-header bg-dark text-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{quotation.quotationId}</h4>
                <h5 className="mb-0">{quotation.quoteTitle}</h5>
                <p className="mb-0">{quotation.quoteDescription}</p>
              </div>
              <div>
                <span className={`badge ${quotation.bookingStatus === 'Booked' ? 'bg-success' : 'bg-warning'} fs-6`}>
                  {quotation.bookingStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="card-header bg-light">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'customer' ? 'active' : ''}`}
                  onClick={() => setActiveTab('customer')}
                >
                  <i className="fas fa-user me-2"></i>Customer
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'package' ? 'active' : ''}`}
                  onClick={() => setActiveTab('package')}
                >
                  <i className="fas fa-box me-2"></i>Package
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'albums' ? 'active' : ''}`}
                  onClick={() => setActiveTab('albums')}
                >
                  <i className="fas fa-images me-2"></i>Albums
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payment')}
                >
                  <i className="fas fa-credit-card me-2"></i>Payment
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  <i className="fas fa-file-invoice me-2"></i>Summary
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body">
            {/* Customer Details */}
            {activeTab === 'customer' && (
              <div className="tab-content">
                <h5 className="card-title text-dark mb-4">
                  <i className="fas fa-user-circle me-2"></i>Customer Information
                </h5>
                <div className="row">
                  {quotation.leadId.persons.map((person, index) => (
                    <div key={index} className="col-md-6">
                      <div className="card mb-3">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">Primary Contact</h6>
                        </div>
                        <div className="card-body">
                          <div className="row mb-2">
                            <div className="col-sm-4 fw-bold">Name:</div>
                            <div className="col-sm-8">{person.name}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4 fw-bold">Phone:</div>
                            <div className="col-sm-8">{person.phoneNo}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4 fw-bold">WhatsApp:</div>
                            <div className="col-sm-8">{person.whatsappNo}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4 fw-bold">Email:</div>
                            <div className="col-sm-8">{person.email}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4 fw-bold">Profession:</div>
                            <div className="col-sm-8">{person.profession}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Lead Information</h6>
                      </div>
                      <div className="card-body">
                        <div className="row mb-2">
                          <div className="col-sm-4 fw-bold">Reference:</div>
                          <div className="col-sm-8 text-capitalize">{quotation.leadId.referenceForm}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-4 fw-bold">Created:</div>
                          <div className="col-sm-8">{new Date(quotation.leadId.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-4 fw-bold">Last Updated:</div>
                          <div className="col-sm-8">{new Date(quotation.leadId.updatedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Package Details */}
            {activeTab === 'package' && (
              <div className="tab-content">
                <h5 className="card-title text-dark mb-4">
                  <i className="fas fa-box-open me-2"></i>Package Details
                </h5>
                {quotation.packages.map((pkg, pkgIndex) => (
                  <div key={pkgIndex} className="card mb-4">
                    <div className="card-header bg-secondary text-white">
                      <h5 className="mb-0">{pkg.categoryName} - {pkg.packageType} Package</h5>
                    </div>
                    <div className="card-body" style={{fontSize:"14px"}}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p><strong>Event Date:</strong> {new Date(pkg.eventStartDate).toLocaleDateString()}</p>
                          <p><strong>Time Slot:</strong> {pkg.slot}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Venue:</strong> {pkg.venueName}</p>
                          <p><strong>Address:</strong> {pkg.venueAddress}</p>
                        </div>
                      </div>
                      
                      <h6 className="border-bottom pb-2">Services</h6>
                      <div className="table-responsive">
                        <table className="table table-striped" style={{fontSize:"14px"}}>
                          <thead>
                            <tr>
                              <th>Service</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Vendors</th>
                              <th>Assistants</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pkg.services.map((service, sIndex) => (
                              <tr key={sIndex}>
                                <td>{service.serviceName}</td>
                                <td>{service.qty}</td>
                                <td>₹{service.price.toLocaleString()}</td>
                                <td>
                                  {service.assignedVendors.filter(v => v).map((vendor, vIndex) => (
                                    <>
                                    <span key={vIndex} className="badge bg-secondary me-1">
                                      {vendor.vendorName} ({vendor.category})
                                    </span>
                                    <br/>
                                    </>
                                  ))}
                                  {service.assignedVendors.filter(v => v).length === 0 && 'Not assigned'}
                                </td>
                                <td>
                                  {service.assignedAssistants.filter(a => a).map((assistant, aIndex) => (
                                    <span key={aIndex} className="badge bg-light text-dark me-1">
                                      {assistant.assistantName}
                                    </span>
                                  ))}
                                  {service.assignedAssistants.filter(a => a).length === 0 && 'Not assigned'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="card-footer bg-light">
                      <div className="d-flex justify-content-end">
                        <strong>Package Total: ₹{quotation.totalPackageAmt.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Album Details */}
            {activeTab === 'albums' && (
              <div className="tab-content">
                <h5 className="card-title text-dark mb-4">
                  <i className="fas fa-images me-2"></i>Album Details
                </h5>
                <div className="row">
                  {quotation.albums.map((album, index) => (
                    <div key={index} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100">
                        <div className={`card-header ${album.type === 'quote' ? 'bg-primary' : 'bg-success'} text-white`}>
                          <h6 className="mb-0">{album.type === 'quote' ? 'Included Album' : 'Addon Album'}</h6>
                        </div>
                        <div className="card-body">
                          <h6 className="card-title">{album.snapshot.templateLabel}</h6>
                          <div className="mb-2">
                            <small className="text-muted">{album.snapshot.boxLabel}</small>
                          </div>
                          <div className="row">
                            <div className="col-6">
                              <p className="mb-0"><strong>Qty:</strong> {album.qty}</p>
                              <p className="mb-0"><strong>Sheets:</strong> {album.snapshot.baseSheets + (album.extras.shared.std + album.extras.shared.special + album.extras.shared.embossed)}</p>
                            </div>
                            <div className="col-6">
                              <p className="mb-0"><strong>Photos:</strong> {album.snapshot.basePhotos}</p>
                              <p className="mb-0"><strong>Extra Sheets:</strong> {album.extraSheets}</p>
                            </div>
                          </div>
                          {album.extras.shared.std > 0 || album.extras.shared.special > 0 || album.extras.shared.embossed > 0 ? (
                            <div className="mt-2">
                              <h6 className="border-bottom pb-1">Extra Sheets</h6>
                              <div className="row">
                                {album.extras.shared.std > 0 && (
                                  <div className="col-4">
                                    <small>Standard: {album.extras.shared.std}</small>
                                  </div>
                                )}
                                {album.extras.shared.special > 0 && (
                                  <div className="col-4">
                                    <small>Special: {album.extras.shared.special}</small>
                                  </div>
                                )}
                                {album.extras.shared.embossed > 0 && (
                                  <div className="col-4">
                                    <small>Embossed: {album.extras.shared.embossed}</small>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="card-footer bg-white">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Price:</span>
                            <span className="fs-5 text-dark">₹{album.suggested.finalTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-light rounded">
                  <div className="d-flex justify-content-end">
                    <h5 className="mb-0">Total Album Amount: ₹{quotation.totalAlbumAmount.toLocaleString()}</h5>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            {activeTab === 'payment' && (
              <div className="tab-content">
                <h5 className="card-title text-dark mb-4">
                  <i className="fas fa-credit-card me-2"></i>Payment Schedule
                </h5>
                <div className="row">
                  {quotation.installments.map((installment, index) => (
                    <div key={index} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">Installment {installment.installmentNumber}</h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Due Date:</span>
                            <span>{installment.dueDate || 'Not specified'}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Payment Mode:</span>
                            <span>{installment.paymentMode || 'Not specified'}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Percentage:</span>
                            <span>{installment.paymentPercentage}%</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Amount:</span>
                            <span>₹{installment.paymentAmount.toLocaleString()}</span>
                          </div>
                          <div className="progress mb-2" style={{height: '10px'}}>
                            <div 
                              className={`progress-bar ${installment.status === 'Partial Paid' ? 'bg-warning' : installment.status === 'Paid' ? 'bg-success' : 'bg-danger'}`} 
                              role="progressbar" 
                              style={{width: `${(installment.paidAmount / installment.paymentAmount) * 100}%`}}
                              aria-valuenow={(installment.paidAmount / installment.paymentAmount) * 100}
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            >
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-success">Paid: ₹{installment.paidAmount.toLocaleString()}</span>
                            <span className="text-danger">Pending: ₹{installment.pendingAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="card-footer">
                          <span className={`badge ${installment.status === 'Partial Paid' ? 'bg-warning' : installment.status === 'Paid' ? 'bg-success' : 'bg-danger'}`}>
                            {installment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Details */}
            {activeTab === 'summary' && (
              <div className="tab-content">
                <h5 className="card-title text-dark mb-4">
                  <i className="fas fa-file-invoice-dollar me-2"></i>Financial Summary
                </h5>
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Amount Breakdown</h6>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Package Amount:</span>
                          <span>₹{quotation.totalPackageAmt.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Album Amount:</span>
                          <span>₹{quotation.totalAlbumAmount.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Subtotal:</span>
                          <span>₹{(quotation.totalPackageAmt + quotation.totalAlbumAmount).toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Discount ({quotation.discountPercent}%):</span>
                          <span className="text-success">-₹{quotation.discountValue.toLocaleString()}</span>
                        </div>
                        {quotation.gstApplied && (
                          <div className="d-flex justify-content-between border-bottom py-2">
                            <span>GST:</span>
                            <span>₹{quotation.gstValue.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between pt-2">
                          <strong>Total Amount:</strong>
                          <strong className="text-dark">₹{quotation.totalAmount.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Payment Summary</h6>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Total Amount:</span>
                          <span>₹{quotation.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Total Paid:</span>
                          <span className="text-success">₹{quotation.installments.reduce((sum, inst) => sum + inst.paidAmount, 0).toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Total Pending:</span>
                          <span className="text-danger">₹{quotation.installments.reduce((sum, inst) => sum + inst.pendingAmount, 0).toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between pt-2">
                          <strong>Margin Amount:</strong>
                          <strong className="text-success">₹{quotation.marginAmount.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Important Dates</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Quotation Created:</span>
                          <span>{new Date(quotation.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between border-bottom py-2">
                          <span>Last Updated:</span>
                          <span>{new Date(quotation.updatedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {bookedQuotations.length === 0 && (
        <div className="alert alert-info text-center">
          <h5>No booked quotations found for this query.</h5>
        </div>
      )}
    </div>
  );
};

export default BookedQuotationsByQuery;