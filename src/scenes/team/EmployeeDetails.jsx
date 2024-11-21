import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link, useParams } from "react-router-dom";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const EmployeeDetails = () => {
  const { EmpId } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [employeeData, setEmployeeData] = useState(null);
  const [assetsData, setAssetsData] = useState([]);
  const [assetDetail, setAssetDetail] = useState(null); // State to store asset detail
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch employee data by EmpId
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(
          `https://namami-infotech.com/ITAM/api/users/get_users.php?EmpId=${EmpId}`
        );
        const data = await response.json();
        setEmployeeData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setLoading(false);
      }
    };

    fetchEmployeeData();
    fetchAssetsData();
  }, [EmpId]);
  const fetchAssetsData = async () => {
    try {
      const response = await fetch(
        `https://namami-infotech.com/ITAM/api/assets/get_asset_issue.php?EmpId=${EmpId}`
      );
      const data = await response.json();
      const filteredAssets =
        data.records?.filter(
          (asset) => asset.Status === "Accepted" || asset.Status === "Issued"
        ) || [];
      setAssetsData(filteredAssets);
      setAssetsLoading(false);
    } catch (error) {
      console.error("Error fetching asset data:", error);
      setAssetsLoading(false);
    }
  };
  // Fetch asset detail by assetId
  const fetchAssetDetail = async (assetId) => {
    try {
      const response = await fetch(
        `https://namami-infotech.com/ITAM/api/assets/get_assets.php?AssetId=${assetId}`
      );
      const data = await response.json();
      setAssetDetail(data.data[0]); // Assuming asset detail is under "data"
    } catch (error) {
      console.error("Error fetching asset detail:", error);
    }
  };

  // Function to open menu for asset
  const handleMenuOpen = (event, assetId) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssetId(assetId);
    fetchAssetDetail(assetId); // Fetch asset detail when menu opens
  };

  // Function to close menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAssetId(null);
  };

  const updateStatusToInStockAndReturned = async () => {
    setUpdateLoading(true);

    // First API call: Update the asset's main status to "In stock"
    const updateInStockStatus = async () => {
      try {
        const inStockResponse = await fetch(
          "https://namami-infotech.com/ITAM/api/assets/update_status.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              AssetID: selectedAssetId,
              Status: "In stock",
            }),
          }
        );
        const inStockData = await inStockResponse.json();
        if (inStockData.message) {
          // alert(inStockData.message);
        }
      } catch (error) {
        console.error("Error updating to In stock:", error);
        // alert("Failed to update asset main status to In stock.");
      }
    };

    // Second API call: Update the asset's issue status to "Returned"
    const updateIssueStatusToReturned = async () => {
      try {
        const returnedResponse = await fetch(
          "https://namami-infotech.com/ITAM/api/assets/update_issue_status.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              AssetID: selectedAssetId,
              Status: "Returned",
            }),
          }
        );
        const returnedData = await returnedResponse.json();
        if (returnedData.message) {
          // alert(returnedData.message);
        }
        fetchAssetsData();
        // Update local state only for "Returned" status
        if (returnedData.success) {
          setAssetsData((prevAssets) =>
            prevAssets.map((asset) =>
              asset.AssetID === selectedAssetId
                ? { ...asset, Status: "Returned" }
                : asset
            )
          );
        } else {
          // alert("Failed to update issue status to Returned.");
        }
      } catch (error) {
        console.error("Error updating to Returned:", error);
        // alert("Failed to update issue status to Returned.");
      }
    };

    // Execute both updates independently
    await Promise.all([updateInStockStatus(), updateIssueStatusToReturned()]);

    setUpdateLoading(false);
    handleMenuClose();
  };

  if (loading) {
    return <Typography>Loading employee data...</Typography>;
  }

  if (!employeeData) {
    return <Typography>No data found for EmpId: {EmpId}</Typography>;
  }

  return (
    <Box m="20px">
      <Header
        title="Employee Details"
        subtitle={`Details for EmpId: ${EmpId}`}
      />
      <Box
        mt="20px"
        p="20px"
        backgroundColor={colors.primary[400]}
        borderRadius="8px"
      >
        <Typography variant="h6">
          Name: <b style={{ color: "green" }}> {employeeData.Name}</b>
        </Typography>
        <Typography variant="h6">
          Mobile: <b style={{ color: "green" }}> {employeeData.Mobile}</b>
        </Typography>
        <Typography variant="h6">
          Email: <b style={{ color: "green" }}> {employeeData.Email}</b>
        </Typography>
        <Typography variant="h6">
          Designation: <b style={{ color: "green" }}> {employeeData.Role}</b>
        </Typography>
        <Typography variant="h6">
          Status: <b style={{ color: "green" }}> {employeeData.Status}</b>
        </Typography>
        <Typography variant="h6">
          Date of Joining:{" "}
          <b style={{ color: "green" }}>{employeeData.DateOfJoining}</b>
        </Typography>
      </Box>

      <Box mt="20px">
        <Typography variant="h6" mb="10px">
          Issued Assets
        </Typography>

        {assetsLoading ? (
          <Typography>Loading assets data...</Typography>
        ) : assetsData.length > 0 ? (
          <Box
            p="20px"
            backgroundColor={colors.primary[400]}
            borderRadius="8px"
          >
            <Grid container spacing={3}>
              {assetsData.map((asset) => (
                <Grid item xs={12} sm={6} md={4} key={asset.AssetID}>
                  <Box
                    mb="15px"
                    p="10px"
                    backgroundColor={colors.blueAccent[700]}
                    borderRadius="8px"
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <Typography variant="subtitle1">
                        Asset ID:{" "}
                        <Link
                          style={{ textDecoration: "none", color: "white" }}
                          to={`/asset/${asset.AssetID}`}
                        >
                          {asset.AssetID}
                        </Link>
                      </Typography>
                      <Typography variant="subtitle1">
                        Asset Name: {assetDetail?.AssetName || asset.AssetName}
                      </Typography>
                      <Typography variant="subtitle1">
                        Status: {asset.Status}
                      </Typography>
                      <Typography variant="subtitle1">
                        Issue Date: {asset.IssueDate}
                      </Typography>
                      <Typography variant="subtitle1">
                        Accepted Date: {asset.AcceptedDate}
                      </Typography>
                      <Typography variant="subtitle1">
                        Remark: {asset.Remark}
                      </Typography>
                    </div>
                    <IconButton
                      aria-controls="asset-menu"
                      aria-haspopup="true"
                      onClick={(e) => handleMenuOpen(e, asset.AssetID)}
                    >
                      <MoreVertIcon style={{ color: "white" }} />
                    </IconButton>
                    <Menu
                      id="asset-menu"
                      anchorEl={anchorEl}
                      open={Boolean(
                        anchorEl && selectedAssetId === asset.AssetID
                      )}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={updateStatusToInStockAndReturned}
                        disabled={updateLoading}
                      >
                        Return Asset
                      </MenuItem>
                    </Menu>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Typography>No assets issued to this employee.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeDetails;
