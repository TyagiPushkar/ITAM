import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Grid, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";

const AssetDetail = () => {
  const { assetId } = useParams(); // Get assetId from the URL
  const [assetDetail, setAssetDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issueHistory, setIssueHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchAssetDetail();
    fetchIssueHistory();
  }, [assetId]);
  const fetchAssetDetail = async () => {
    try {
      const response = await fetch(
        `https://namami-infotech.com/ITAM/api/assets/get_assets.php?AssetId=${assetId}`
      );
      const data = await response.json();
      setAssetDetail(data.data[0]); // Assuming the detail data is under "data"
      console.log(data.data[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching asset detail:", error);
      setLoading(false);
    }
  };
  const fetchIssueHistory = async () => {
    try {
      const response = await fetch(
        `https://namami-infotech.com/ITAM/api/assets/get_asset_issue_history.php?AssetID=${assetId}`
      );
      const data = await response.json();
      setIssueHistory(data.records || []); // Assuming history data is under "records"
      console.log(data.records);
      setHistoryLoading(false);
    } catch (error) {
      console.error("Error fetching asset issue history:", error);
      setHistoryLoading(false);
    }
  };
  const updateStatusToInStock = async () => {
    setUpdateLoading(true);
    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/assets/update_status.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            AssetID: assetDetail.AssetId,
            Status: "Faulty",
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setAssetDetail((prev) => ({ ...prev, Status: "In stock" }));
        fetchAssetDetail();
        fetchIssueHistory();
      } else {
        fetchAssetDetail();
        fetchIssueHistory();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!assetDetail) {
    return <Typography variant="h4">Asset not found</Typography>;
  }

  return (
    <Box m="20px">
      <Header
        title={`${assetDetail.AssetName} - ${assetDetail.AssetId}`}
        subtitle="Detailed Information"
      />

      <Box mt="10px">
        <Grid container spacing={1}>
          {/* Asset Detail Fields */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Asset Type: {assetDetail.AssetType}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Asset Name: {assetDetail.AssetName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Condition: {assetDetail.AssetCondition}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Make: {assetDetail.Make}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Model: {assetDetail.Model || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Serial No.: {assetDetail.SerialNo}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Processor: {assetDetail.Processor}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Hard Disk: {assetDetail.Harddisk}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">RAM: {assetDetail.RAM}</Typography>
          </Grid>
          {/* <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Quantity: {assetDetail.Quantity}</Typography>
          </Grid> */}

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Status: {assetDetail.Status}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Vendor Name: {assetDetail.VendorName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Invoice No.: {assetDetail.InvoiceNo}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Invoice Date: {assetDetail.InvoiceDate}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Warranty: {assetDetail.Warranty}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              MacAddress: {assetDetail.MacAddress}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Added On: {assetDetail.AddDateTime}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Button to Update Status */}
      <Box mt="20px">
        <Button
          variant="contained"
          color="primary"
          onClick={updateStatusToInStock}
          disabled={assetDetail.Status != "In stock"}
        >
          {updateLoading ? "Updating..." : "Mark as Faulty"}
        </Button>
      </Box>

      {/* Asset Issue History Section */}
      <Box mt="20px">
        <Typography variant="h5">Issue History</Typography>
        {historyLoading ? (
          <Box display="flex" justifyContent="center" mt="20px">
            <CircularProgress />
          </Box>
        ) : issueHistory.length > 0 ? (
          <Box mt="10px">
            <Grid container spacing={2}>
              {issueHistory.map((history, index) => (
                <Grid item xs={6} key={index}>
                  <Box border={1} p="10px" borderRadius="8px">
                    <Typography variant="body1">
                      <strong>Issue ID:</strong> {history.IssueID}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Employee ID:</strong> {history.EmpId}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Issue Date:</strong> {history.IssueDate}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Accepted Date:</strong>{" "}
                      {history.AcceptedDate || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Return Date:</strong>{" "}
                      {history.ReturnDate || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Status:</strong> {history.Status}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Remark:</strong> {history.Remark || "N/A"}
                    </Typography>
                    {history.IsCurrentHolder && (
                      <Typography variant="body1" color="green">
                        <strong>Currently Held by this Employee</strong>
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Typography variant="body1">
            No issue history found for this asset.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AssetDetail;
