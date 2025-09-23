// // components/PaymentStatsChart.js
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const PaymentStatsChart = () => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const [clientRes, vendorRes] = await Promise.all([
//           axios.get("http://localhost:5000/api/quotations/stats/client-payments"),
//           axios.get("http://localhost:5000/api/quotations/stats/vendor-payments"),
//         ]);

//         // Merge stats into single dataset
//         const clientData = clientRes.data.data;
//         const vendorData = vendorRes.data.data;

//         const merged = {};

//         clientData.forEach((c) => {
//           merged[c._id] = { year: c._id, clientReceived: c.totalReceived, vendorPaid: 0 };
//         });

//         vendorData.forEach((v) => {
//           if (!merged[v._id]) {
//             merged[v._id] = { year: v._id, clientReceived: 0, vendorPaid: v.totalPaid };
//           } else {
//             merged[v._id].vendorPaid = v.totalPaid;
//           }
//         });

//         setData(Object.values(merged).sort((a, b) => a.year - b.year));
//       } catch (err) {
//         console.error("Error fetching stats:", err);
//       }
//     };

//     fetchStats();
//   }, []);

//   return (
//     <div style={{ width: "100%", height: 400 }}>
//       <h3 className="text-center">Yearly Client vs Vendor Payments</h3>
//       <ResponsiveContainer>
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="year" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="clientReceived" fill="#23408B" name="Client Received" />
//           <Bar dataKey="vendorPaid" fill="#32984D" name="Vendor Paid" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default PaymentStatsChart;


// components/PaymentStatsChart.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from "recharts";

const PaymentStatsChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [clientRes, vendorRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/quotations/stats/client-payments"),
                    axios.get("http://localhost:5000/api/quotations/stats/vendor-payments"),
                ]);

                const clientData = clientRes.data.data;
                const vendorData = vendorRes.data.data;

                const merged = {};
                clientData.forEach((c) => {
                    merged[c._id] = { year: c._id, clientReceived: c.totalReceived, vendorPaid: 0 };
                });

                vendorData.forEach((v) => {
                    if (!merged[v._id]) {
                        merged[v._id] = { year: v._id, clientReceived: 0, vendorPaid: v.totalPaid };
                    } else {
                        merged[v._id].vendorPaid = v.totalPaid;
                    }
                });

                setData(Object.values(merged).sort((a, b) => a.year - b.year));
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };

        fetchStats();
    }, []);

    return (
        <div style={{ width: "100%", height: 420, background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <h3 style={{ textAlign: "center", marginBottom: 20, color: "#23408B" }}>
                Yearly Client vs Vendor Payments
            </h3>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    barCategoryGap="30%"   // ✅ wider spacing between year groups
                    barGap={12}            // ✅ spacing between client/vendor bars
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="year" tick={{ fill: "#555", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#555", fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#f9f9f9", borderRadius: 6 }}
                        formatter={(value) => `₹ ${value.toLocaleString()}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                        dataKey="clientReceived"
                        fill="#23408B"
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                    >
                        <LabelList dataKey="clientReceived" position="top" formatter={(v) => `₹${v}`} />
                    </Bar>
                    <Bar
                        dataKey="vendorPaid"
                        fill="#32984D"
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                    >
                        <LabelList dataKey="vendorPaid" position="top" formatter={(v) => `₹${v}`} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

        </div>
    );
};

export default PaymentStatsChart;
