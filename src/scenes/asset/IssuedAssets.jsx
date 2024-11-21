import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Devices } from "@mui/icons-material";
import SummarizeIcon from "@mui/icons-material/Summarize";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const IssuedAssets = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [issuedAssets, setIssuedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch data from the API
  useEffect(() => {
    const fetchIssuedAssets = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/ITAM/api/assets/get_asset_issue.php"
        );
        const data = await response.json();
        setIssuedAssets(data.records); // Assuming the issued assets data is under "records"
        setLoading(false);
      } catch (error) {
        console.error("Error fetching issued assets:", error);
        setLoading(false);
      }
    };

    fetchIssuedAssets();
  }, []);

  const columns = [
    { field: "EmpId", headerName: "Employee ID", width: 150 },
    { field: "EmployeeName", headerName: "Employee Name", width: 200 }, // Added column for Employee Name
    { field: "AssetID", headerName: "Asset ID", width: 150 },
    { field: "AssetName", headerName: "Asset Name", width: 200 }, // Added column for Asset Name
    { field: "AssetType", headerName: "Asset Type", width: 150 }, // Added column for Asset Type
    {
      field: "Status",
      headerName: "Status",
      width: 150,
    },
    {
      field: "IssueDate",
      headerName: "Issue Date",
      width: 150,
    },
    {
      field: "AcceptedDate",
      headerName: "Accepted Date",
      width: 150,
    },
  ];

  const handleRedirect = () => {
    navigate("/issue-new-asset"); // Redirect to the /form route for adding new assets
  };

  // Function to export issued assets data as CSV
  const exportCSV = () => {
    const csvData = issuedAssets.map((issue) => ({
      EmpId: issue.EmpId,
      EmployeeName: issue.EmployeeName, // Include Employee Name in CSV
      AssetID: issue.AssetID,
      AssetName: issue.AssetName, // Include Asset Name in CSV
      AssetType: issue.AssetType, // Include Asset Type in CSV
      Status: issue.Status,
      Remark: issue.Remark,
      IssueDate: issue.IssueDate,
      AcceptedDate: issue.AcceptedDate,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "issued_assets_report.csv");
  };

  return (
    <Box m="20px">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ISSUED ASSETS" subtitle="List of Issued Assets" />

        <Box display="flex" justifyContent="space-between" gap="10px">
          <Box
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={colors.greenAccent[600]}
            borderRadius="4px"
            sx={{ cursor: "pointer" }}
            onClick={handleRedirect}
          >
            <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
              Issue Asset
            </Typography>
            <Devices sx={{ color: colors.grey[100] }} />
          </Box>

          {/* Export CSV Button */}
          <Box
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={colors.greenAccent[600]}
            borderRadius="4px"
            sx={{ cursor: "pointer" }}
            onClick={exportCSV}
          >
            <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
              Export CSV
            </Typography>
            <SummarizeIcon sx={{ color: colors.grey[100] }} />
          </Box>
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
          rows={
            Array.isArray(issuedAssets) && issuedAssets.length > 0
              ? issuedAssets.map((item, index) => ({
                  ...item,
                  id: index + 1,
                }))
              : []
          }
          columns={columns}
          loading={loading}
          components={{
            NoRowsOverlay: () => (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Typography>No issued assets available.</Typography>
              </Box>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default IssuedAssets;
