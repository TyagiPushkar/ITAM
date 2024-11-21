import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, useTheme } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const TicketDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams(); // Get the ticket ID from URL parameters
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateRemark, setUpdateRemark] = useState("");

  // Set the status to "Resolved" by default
  const status = "Resolved";

  // Fetch user details from local storage
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  // Fetch ticket details based on ticket ID
  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        const response = await fetch(
          `https://namami-infotech.com/ITAM/api/support/get_ticket.php?id=${id}`
        );
        const data = await response.json();

        if (response.ok) {
          // If the user is not an admin and this ticket doesn't belong to them, show an error or redirect
          if (
            userDetails.Role !== "Admin" &&
            data.EmpId !== userDetails.EmpId
          ) {
            setError("You are not authorized to view this ticket.");
          } else {
            setTicket(data);
          }
        } else {
          setError(data.message || "Error fetching ticket details");
        }
      } catch (error) {
        setError("Failed to fetch ticket details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
  }, [id, userDetails.EmpId, userDetails.Role]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const handleImageOpen = () => {
    if (ticket.Image) {
      window.open(ticket.Image, "_blank"); // Open image in a new tab
    }
  };

  // Handle update submission
  const handleUpdateSubmit = async () => {
    try {
      const response = await fetch(
        `https://namami-infotech.com/ITAM/api/support/update_ticket.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: ticket.id,
            Status: "Resolved", // Always set to "Resolved"
            Update_remark: updateRemark,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTicket((prevTicket) => ({
          ...prevTicket,
          Status: status,
          UpdateDateTime: new Date().toISOString(),
        }));
        alert("Ticket resolved successfully.");
        setUpdateRemark("");
      } else {
        alert(data.message || "Failed to resolve the ticket.");
      }
    } catch (error) {
      alert("Failed to resolve the ticket. Please try again.");
    }
  };

  return (
    <Box m="20px">
      <Header title={`Ticket ID: ${ticket.id}`} subtitle="Ticket Details" />

      <Box mt="20px">
        <Typography variant="h6">Employee ID: {ticket.EmpId}</Typography>
        <Typography variant="h6">Category: {ticket.Category}</Typography>
        <Typography variant="h6">Remark: {ticket.Remark}</Typography>
        <Typography variant="h6">Status: {ticket.Status}</Typography>
        <Typography variant="h6">
          Date Created: {new Date(ticket.DateTime).toLocaleString()}
        </Typography>
        <Typography variant="h6">
          Update Remark: {ticket.Update_remark}
        </Typography>
        <Typography variant="h6">
          Last Updated: {new Date(ticket.UpdateDateTime).toLocaleString()}
        </Typography>
      </Box>

      <Box mt="20px">
        {ticket.Image && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleImageOpen}
            sx={{ backgroundColor: colors.greenAccent[600] }}
          >
            View Image
          </Button>
        )}
      </Box>

      {/* Update form for Admins */}
      {userDetails.Role === "Admin" && ticket.Status == "Open" && (
        <Box mt="20px">
          <Typography variant="h6" gutterBottom>
            Resolve Ticket
          </Typography>
          {/* <TextField
            label="Status"
            variant="outlined"
            fullWidth
            value={status}
            disabled // Prevent editing of the status field
            sx={{ mb: 2 }}
          /> */}
          <TextField
            label="Update Remark"
            variant="outlined"
            fullWidth
            value={updateRemark}
            onChange={(e) => setUpdateRemark(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateSubmit}
            sx={{ backgroundColor: colors.blueAccent[600] }}
          >
            Mark as Resolved
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TicketDetail;
