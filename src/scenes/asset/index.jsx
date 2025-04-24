import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  Modal,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Devices from "@mui/icons-material/Devices";
import Header from "../../components/Header";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { useLocation } from "react-router-dom";

const Asset = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetIdFilter, setAssetIdFilter] = useState("");
  const [assetNameFilter, setAssetNameFilter] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const location = useLocation();
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusQuery = queryParams.get("status");
    const AssetNameQuery = queryParams.get("AssetName");

    if (statusQuery) {
      setStatusFilter(statusQuery);
    }

    if (AssetNameQuery) {
      setAssetNameFilter(AssetNameQuery); // Corrected to set assetNameFilter
    }
  }, [location.search]);

  // Fetch data from the API
  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/ITAM/api/assets/get_assets.php"
        );
        const data = await response.json();
        setAssetData(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching asset data:", error);
        setLoading(false);
      }
    };

    fetchAssetData();
  }, []);

  const columns = [
    { field: "AssetId", headerName: "Asset ID", width: 120 },
    { field: "AssetType", headerName: "Type", flex: 1 },
    { field: "AssetName", headerName: "Name", flex: 1 },
    { field: "AssetCondition", headerName: "Condition", flex: 1 },
    { field: "Make", headerName: "Make", flex: 1 },
    { field: "Model", headerName: "Model", flex: 1 },
    { field: "SerialNo", headerName: "S/No.", flex: 1 },
    { field: "VendorName", headerName: "Vendor", flex: 1 },
    { field: "Status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            onClick={() => handleViewClick(params.row.AssetId)}
            variant="outlined"
            color="secondary"
          >
            View
          </Button>
          <Button
            onClick={() => handleEditClick(params.row)}
            variant="outlined"
            color="secondary"
          >
            Edit
          </Button>
        </Box>
      ),
    },
  ];

  const handleViewClick = (assetId) => {
    navigate(`/asset/${assetId}`); // Navigate to the detail page
  };

  const handleRedirect = () => {
    navigate("/add-asset"); // Redirect to add new asset
  };

  const handleEditClick = (asset) => {
    setSelectedAsset(asset);
    setOpen(true); // Open the edit modal
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelectedAsset(null); // Clear selected asset on close
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedAsset((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateAsset = async () => {
    try {
      const response = await fetch(
        `https://namami-infotech.com/ITAM/api/assets/edit_asset.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedAsset),
        }
      );
      if (response.ok) {
        handleModalClose();
        alert("Asset updated successfully!");
      } else {
        alert("Failed to update asset.");
      }
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };

  const exportCSV = () => {
    const csvData = assetData.map((asset) => ({
      "Asset ID": asset.AssetId,
      Type: asset.AssetType,
      Name: asset.AssetName,
      Condition: asset.AssetCondition,
      Make: asset.Make,
      Model: asset.Model,
      "S/No.": asset.SerialNo,
      Vendor: asset.VendorName,
      InvoiceDate: asset.InvoiceDate,
      Status: asset.Status,
      MacAddress: asset.MacAddress,
      Processor: asset.Processor,
      Warranty: asset.Warranty,
      RAM: asset.RAM,
      Harddisk: asset.Harddisk,
      AddOn: new Date(asset.AddDateTime).toLocaleDateString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "assets_report.csv");
  };

  // Apply multi-filtering logic
  const filteredAssets = assetData.filter(
    (asset) =>
      (asset.AssetId.toString().includes(assetIdFilter) ||
        assetIdFilter === "") &&
      (asset.AssetName.toLowerCase().includes(assetNameFilter.toLowerCase()) ||
        assetNameFilter === "") &&
      (asset.AssetType.toLowerCase().includes(assetTypeFilter.toLowerCase()) ||
        assetTypeFilter === "") &&
      (asset.Status.toLowerCase().includes(statusFilter.toLowerCase()) ||
        statusFilter === "")
  );

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ASSETS" subtitle="Managing the Assets" />
        <Box mt={2} mb={2}>
          {/* <TextField
            label="Search assets..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: {
                color: colors.grey[100],
                backgroundColor: colors.primary[400],
              },
            }}
          /> */}
          <Box display="flex" gap="15px" mt={2}>
            <TextField
              label="Asset ID"
              variant="outlined"
              value={assetIdFilter}
              onChange={(e) => setAssetIdFilter(e.target.value)}
              InputLabelProps={{
                style: { color: colors.grey[100] },
              }}
              InputProps={{
                style: {
                  color: colors.grey[100],
                  backgroundColor: colors.primary[400],
                },
              }}
            />
            <TextField
              label="Asset Name"
              variant="outlined"
              value={assetNameFilter}
              onChange={(e) => setAssetNameFilter(e.target.value)}
              InputLabelProps={{
                style: { color: colors.grey[100] },
              }}
              InputProps={{
                style: {
                  color: colors.grey[100],
                  backgroundColor: colors.primary[400],
                },
              }}
            />
            <TextField
              label="Asset Type"
              variant="outlined"
              value={assetTypeFilter}
              onChange={(e) => setAssetTypeFilter(e.target.value)}
              InputLabelProps={{
                style: { color: colors.grey[100] },
              }}
              InputProps={{
                style: {
                  color: colors.grey[100],
                  backgroundColor: colors.primary[400],
                },
              }}
            />
            <TextField
              label="Status"
              variant="outlined"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              InputLabelProps={{
                style: { color: colors.grey[100] },
              }}
              InputProps={{
                style: {
                  color: colors.grey[100],
                  backgroundColor: colors.primary[400],
                },
              }}
            />
          </Box>
        </Box>
        <Box display="flex" gap="10px">
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
              Add New
            </Typography>
            <Devices sx={{ color: colors.grey[100] }} />
          </Box>
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
          checkboxSelection
          rows={filteredAssets.map((item, index) => ({
            ...item,
            id: index + 1,
          }))}
          columns={columns}
          loading={loading}
          sx={{ cursor: "pointer" }}
        />
      </Box>

      {/* Edit Modal */}
      <Modal open={open} onClose={handleModalClose}>
        <Box
          sx={{
            width: 500,
            bgcolor: colors.primary[500],
            padding: 3,
            borderRadius: 2,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            gap: "10px", // Spacing between inputs
          }}
        >
          <Typography variant="h6" component="h2" color={colors.grey[100]}>
            Edit Asset
          </Typography>
          {selectedAsset && (
            <Grid
              container
              spacing={1}
              sx={{ display: "flex", flexWrap: "wrap" }}
            >
              {Object.keys(selectedAsset).map(
                (key) =>
                  key !== "AssetId" && (
                    <Grid item xs={3} key={key}>
                      {" "}
                      {/* Each field takes up 3 out of 12 columns */}
                      <TextField
                        name={key}
                        label={key}
                        value={selectedAsset[key]}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                          style: { color: colors.grey[100] },
                        }}
                        InputProps={{
                          style: {
                            color: colors.grey[100],
                            backgroundColor: colors.primary[400],
                          },
                        }}
                      />
                    </Grid>
                  )
              )}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateAsset}
                  >
                    Update
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Asset;
