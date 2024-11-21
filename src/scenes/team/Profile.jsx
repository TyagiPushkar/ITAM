import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
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
  const [anchorEl, setAnchorEl] = useState(null); // For handling the menu
  const [currentAsset, setCurrentAsset] = useState(null); // To keep track of the selected asset

  // Fetch EmpId from local storage
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const EmpId = userDetails ? userDetails.EmpId : ""; // Fallback to empty if not found

  // Fetch employee data by EmpId
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

  // Handle menu open
  const handleMenuClick = (event, asset) => {
    setAnchorEl(event.currentTarget);
    setCurrentAsset(asset); // Store the selected asset
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentAsset(null);
  };

  // Function to handle status update
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
        // Update the asset status in the state
        const updatedAssets = assetsData.map((asset) =>
          asset.AssetID === currentAsset.AssetID
            ? { ...asset, Status: newStatus }
            : asset
        );
        setAssetsData(updatedAssets);
        handleMenuClose(); // Close the menu after status update
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

      {/* Issued Assets Section */}
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
                        Accepted / Rejected Date: {asset.AcceptedDate}
                      </Typography>
                      <Typography variant="subtitle1">
                        Remark: {asset.Remark}
                      </Typography>
                    </div>
                    {asset.Status === "Issued" && (
                      <IconButton
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={(event) => handleMenuClick(event, asset)}
                        style={{ marginBottom: "100px" }}
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

      {/* Menu for Accept/Reject options */}
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
    </Box>
  );
};

export default Profile;
