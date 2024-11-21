import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import SummarizeIcon from "@mui/icons-material/Summarize";

const Report = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [assetIssues, setAssetIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch Asset Issues Data
  const fetchAssetIssues = async () => {
    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/assets/get_asset_issue.php"
      );
      const data = await response.json();
      setAssetIssues(data.records);
    } catch (error) {
      console.error("Error fetching asset issues:", error);
    } finally {
      setLoading(false); // Set loading to false here
    }
  };

  // Fetch asset issues when component mounts
  useEffect(() => {
    fetchAssetIssues();
  }, []);

  // Function to filter data based on date range
  const filterByDateRange = (data) => {
    if (!fromDate && !toDate) return data;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return data.filter((item) => {
      const itemDate = new Date(item.IssueDate); // Assuming IssueDate is in YYYY-MM-DD format
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
  };

  // Export the asset issues data as CSV
  const exportCSV = () => {
    // Apply date filtering to the assetIssues before exporting
    const filteredAssetIssues = filterByDateRange(assetIssues);

    const csvData = filteredAssetIssues.map((issue) => ({
      EmpId: issue.EmpId,
      EmployeeName: issue.EmployeeName, // Added EmployeeName to CSV
      AssetID: issue.AssetID,
      AssetName: issue.AssetName, // Added AssetName to CSV
      AssetType: issue.AssetType, // Added AssetType to CSV
      Status: issue.Status,
      IssueDate: issue.IssueDate,
      AcceptedDate: issue.AcceptedDate,
    }));

    if (csvData.length === 0) {
      alert("No data available for the selected date range.");
      return; // Prevent exporting if no data is found
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "asset_issues_report.csv");
  };

  const assetIssueColumns = [
    { field: "EmpId", headerName: "Employee ID", width: 150 },
    { field: "EmployeeName", headerName: "Employee Name", width: 200 },
    { field: "AssetID", headerName: "Asset ID", width: 150 },
    { field: "AssetName", headerName: "Asset Name", width: 200 },
    { field: "AssetType", headerName: "Asset Type", width: 150 },
    { field: "Status", headerName: "Status", width: 150 },
    { field: "IssueDate", headerName: "Issue Date", width: 150 },
    { field: "AcceptedDate", headerName: "Accepted Date", width: 150 },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Asset Issues Report"
          subtitle="Download Asset Issues Report"
        />

        {/* Date Filters */}
        <Box display="flex" gap="10px">
          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Export Button */}
        <Box
          width="20%"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={colors.greenAccent[600]}
          borderRadius="4px"
          sx={{ cursor: "pointer" }}
          onClick={exportCSV}
        >
          <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
            Export Report as CSV
          </Typography>
          <SummarizeIcon sx={{ color: colors.grey[100] }} />
        </Box>
      </Box>

      {/* Data Grid */}
      <Box
        m="10px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={filterByDateRange(assetIssues).map((item, index) => ({
            ...item,
            id: index + 1,
          }))} // Set unique ID for rows
          columns={assetIssueColumns}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Report;
