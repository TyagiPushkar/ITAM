import React, { useState, useEffect } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Devices from "@mui/icons-material/Devices";
import Header from "../../components/Header";
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import SummarizeIcon from '@mui/icons-material/Summarize';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';

const Support = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user details from localStorage
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const isAdmin = userDetails?.Role === 'Admin';
  const empId = userDetails?.EmpId;

  // Fetch data from the API
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        let url = "https://namami-infotech.com/ITAM/api/support/get_ticket.php";
        if (!isAdmin) {
          // If not admin, fetch only the tickets for the specific employee
          url += `?EmpId=${empId}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setTicketData(data); // Assuming the tickets data is returned as an array
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [isAdmin, empId]);

  const columns = [
    { field: "id", headerName: "Ticket ID", width: 120 },
    {
      field: "EmpId",
      headerName: "Employee ID",
      width: 150,
    },
    {
      field: "Category",
      headerName: "Category",
      flex: 1,
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "DateTime",
      headerName: "Date Created",
      flex: 1,
    },
    {
      field: "UpdateDateTime",
      headerName: "Last Updated",
      flex: 1,
    },
  ];

  const handleRowClick = (params) => {
    navigate(`/support/${params.row.id}`); // Navigating to the detail page with Ticket ID
  };

  const handleCreateTicket = () => {
    navigate("/raise-ticket"); // Redirect to the form route for adding a new support ticket
  };

  // Function to export ticket data as CSV
  const exportCSV = () => {
    const csvData = ticketData.map(ticket => ({
      "Ticket ID": ticket.id,
      "Employee ID": ticket.EmpId,
      "Category": ticket.Category,
      "Status": ticket.Status,
      "Date Created": ticket.DateTime,
      "Last Updated": ticket.UpdateDateTime,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'support_tickets_report.csv');
  };

  return (
    <Box m="20px">
      {/* Header and Add New button */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Support Tickets" subtitle="Managing Support Tickets" />
        
        <Box display="flex" gap="10px">
          <Box
           
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={colors.greenAccent[600]}
            borderRadius="4px"
            sx={{ cursor: "pointer" }}
            onClick={handleCreateTicket}
          >
            <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
              Raise Ticket
            </Typography>
            <LiveHelpIcon sx={{ color: colors.grey[100] }} />
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
          rows={ticketData} // Use the actual ticket data
          columns={columns}
          loading={loading}
          onRowClick={handleRowClick}
          sx={{cursor:"pointer"}}
        />
      </Box>
    </Box>
  );
};

export default Support;
