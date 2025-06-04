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
  const [forwardRemark, setForwardRemark] = useState("");
  const [forwardImage, setForwardImage] = useState(null); // for image upload

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
            userDetails.Role !== "ERPADMIN" &&
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
  const handleForwardToL2 = async () => {
    const formData = new FormData();
    formData.append("id", ticket.id);
    formData.append("Status", "Forward to L2");
    formData.append("Update_remark", forwardRemark);

    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/support/update_status_with_subticket.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Ticket forwarded to L2 successfully.");
        setTicket((prevTicket) => ({
          ...prevTicket,
          Status: "Forward to L2",
          UpdateDateTime: new Date().toISOString(),
          Update_remark: forwardRemark,
        }));
        setForwardRemark("");
        setForwardImage(null);
      } else {
        alert(data.message || "Failed to forward the ticket.");
      }
    } catch (error) {
      alert("Error while forwarding to L2. Try again.");
    }
  };

  return (
    <Box m="20px">
      <Header title={`Ticket ID: ${ticket.id}`} subtitle="Ticket Details" />

      <Box
        mt="20px"
        display="grid"
        gridTemplateColumns="180px 1fr"
        rowGap={2}
        columnGap={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Employee ID:
        </Typography>
        <Typography variant="h6">{ticket.EmpId}</Typography>

        <Typography variant="h6" fontWeight="bold">
          Category:
        </Typography>
        <Typography variant="h6">{ticket.Category}</Typography>

        <Typography variant="h6" fontWeight="bold">
          Remark:
        </Typography>
        <Typography
          variant="h6"
          component="div"
          dangerouslySetInnerHTML={{ __html: ticket.Remark }}
        />

        <Typography variant="h6" fontWeight="bold">
          Status:
        </Typography>
        <Typography variant="h6">{ticket.Status}</Typography>

        <Typography variant="h6" fontWeight="bold">
          Date Created:
        </Typography>
        <Typography variant="h6">
          {new Date(ticket.DateTime).toLocaleString()}
        </Typography>

        <Typography variant="h6" fontWeight="bold">
          Update Remark:
        </Typography>
        <Typography
          variant="h6"
          component="div"
          dangerouslySetInnerHTML={{ __html: ticket.Update_remark || "-" }}
        />

        <Typography variant="h6" fontWeight="bold">
          Last Updated:
        </Typography>
        <Typography variant="h6">
          {new Date(ticket.UpdateDateTime).toLocaleString()}
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

      {((userDetails.Role === "Admin" &&
        (ticket.Category === "Hardware" || ticket.Category === "Software")) ||
        (userDetails.Role === "ERPADMIN" && ticket.Category === "ERP365")) &&
        ticket.Status === "Open" && (
          <Box mt="20px">
            <Typography variant="h6" gutterBottom>
              Resolve Ticket
            </Typography>
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
      {userDetails.Role === "ERPADMIN" && ticket.Status === "Open" && (
        <Box mt="30px">
          <Typography variant="h6" gutterBottom>
            Forward to L2
          </Typography>

          <TextField
            label="Forward Remark"
            variant="outlined"
            fullWidth
            value={forwardRemark}
            onChange={(e) => setForwardRemark(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setForwardImage(e.target.files[0])}
            />
          </Button>

          {forwardImage && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected File: {forwardImage.name}
            </Typography>
          )}

          <Button
            variant="contained"
            color="secondary"
            onClick={handleForwardToL2}
            sx={{ backgroundColor: colors.redAccent[600] }}
          >
            Forward to L2
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TicketDetail;
