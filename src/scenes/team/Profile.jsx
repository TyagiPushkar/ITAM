import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const Profile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [employeeData, setEmployeeData] = useState(null);
  const [assetsData, setAssetsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentAsset, setCurrentAsset] = useState(null); // Track selected asset
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [assetDetails, setAssetDetails] = useState(null); // Details for modal

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const EmpId = userDetails ? userDetails.EmpId : "";

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!EmpId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://namami-infotech.com/ITAM/api/users/get_users.php?EmpId=${EmpId}`
        );
        const data = await response.json();
        setEmployeeData(data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAssetsData = async () => {
      if (!EmpId) {
        setAssetsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://namami-infotech.com/ITAM/api/assets/get_asset_issue.php?EmpId=${EmpId}`
        );
        const data = await response.json();
        setAssetsData(data.records || []);
      } catch (error) {
        console.error("Error fetching asset data:", error);
      } finally {
        setAssetsLoading(false);
      }
    };

    fetchEmployeeData();
    fetchAssetsData();
  }, [EmpId]);

  // Fetch asset details for modal
  const fetchAssetDetails = async (assetId) => {
    try {
      const response = await fetch(
        `https://namami-infotech.com/ITAM/api/assets/get_assets.php?AssetId=${assetId}`
      );
      const data = await response.json();
      setAssetDetails(data.data[0]);
    } catch (error) {
      console.error("Error fetching asset details:", error);
    }
  };

  // Open modal and fetch details
  const handleAssetClick = (assetId) => {
    setIsModalOpen(true);
    fetchAssetDetails(assetId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAssetDetails(null);
  };

  const handleMenuClick = (event, asset) => {
    setAnchorEl(event.currentTarget);
    setCurrentAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentAsset(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentAsset) return;

    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/assets/update_issue_status.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            AssetID: currentAsset.AssetID,
            Status: newStatus,
          }),
        }
      );
      const data = await response.json();
      if (data.message) {
        console.log("Status updated:", data.message);
        const updatedAssets = assetsData.map((asset) =>
          asset.AssetID === currentAsset.AssetID
            ? { ...asset, Status: newStatus }
            : asset
        );
        setAssetsData(updatedAssets);
        handleMenuClose();
      } else {
        console.error("Error updating status:", data.message);
      }
    } catch (error) {
      console.error("Failed to update asset status:", error);
    }
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
        <Typography variant="h6">Name: {employeeData.Name}</Typography>
        <Typography variant="h6">Mobile: {employeeData.Mobile}</Typography>
        <Typography variant="h6">Email: {employeeData.Email}</Typography>
        <Typography variant="h6">Designation: {employeeData.Role}</Typography>
        <Typography variant="h6">Status: {employeeData.Status}</Typography>
        <Typography variant="h6">
          Date of Joining: {employeeData.DateOfJoining}
        </Typography>
      </Box>

      <Box mt="20px">
        <Typography variant="h6" mb="10px">
          Issued Assets
        </Typography>

        {assetsLoading ? (
          <Typography>Loading assets data...</Typography>
        ) : assetsData.length > 0 ? (
          <Grid container spacing={3}>
            {assetsData.map((asset, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  p="20px"
                  backgroundColor={colors.blueAccent[700]}
                  borderRadius="8px"
                  style={{ cursor: "pointer", position: "relative" }}
                  onClick={() => handleAssetClick(asset.AssetID)} // Open modal for asset details
                >
                  <Box display="flex" justifyContent="space-between">
                    <div>
                      <Typography variant="subtitle1">
                        Asset ID: {asset.AssetID}
                      </Typography>
                      <Typography variant="subtitle1">
                        Asset Name: {asset.AssetName}
                      </Typography>
                      <Typography variant="subtitle1">
                        Status: {asset.Status}
                      </Typography>
                      <Typography variant="subtitle1">
                        Issue Date: {asset.IssueDate}
                      </Typography>
                      <Typography variant="subtitle1">
                        Remark: {asset.Remark}
                      </Typography>
                    </div>
                    {asset.Status === "Issued" && (
                      <IconButton
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={(event) => {
                          event.stopPropagation(); // Prevent modal opening
                          handleMenuClick(event, asset);
                        }}
                      >
                        <MoreVertIcon sx={{ color: colors.grey[100] }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No assets issued to this employee.</Typography>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => handleStatusChange("Accepted")}
          disabled={currentAsset?.Status !== "Issued"}
        >
          Accept
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange("Rejected")}
          disabled={currentAsset?.Status !== "Issued"}
        >
          Reject
        </MenuItem>
      </Menu>

      {/* Modal for asset details */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          m="auto"
          mt="100px"
          p="20px"
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          maxWidth="600px"
        >
          {assetDetails ? (
            <>
              <Typography variant="h6">Asset Details</Typography>
              <Typography>Asset ID: {assetDetails.AssetId}</Typography>
              <Typography>Asset Name: {assetDetails.AssetName}</Typography>
              <Typography>Type: {assetDetails.AssetType}</Typography>
              <Typography>Condition: {assetDetails.AssetCondition}</Typography>
              <Typography>Make: {assetDetails.Make}</Typography>
              <Typography>Model: {assetDetails.Model}</Typography>
              <Typography>Serial No: {assetDetails.SerialNo}</Typography>
              <Typography>Processor: {assetDetails.Processor}</Typography>
              <Typography>RAM: {assetDetails.RAM}</Typography>
              <Typography>Harddisk: {assetDetails.Harddisk}</Typography>
              <Typography>Status: {assetDetails.Status}</Typography>
            </>
          ) : (
            <Typography>Loading asset details...</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile;
