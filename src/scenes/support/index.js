import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import SummarizeIcon from '@mui/icons-material/Summarize';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import { useLocation } from "react-router-dom";

const Support = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(true);
const location = useLocation(); // Get current location
  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get("status"); // Extract 'status' query parameter

  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const isErpAdmin = userDetails?.Role === 'ERPADMIN';
  const isAdmin = userDetails?.Role === 'Admin';
  const empId = userDetails?.EmpId;

 useEffect(() => {
    const fetchTicketData = async () => {
      try {
        let url = "https://namami-infotech.com/ITAM/api/support/get_ticket.php";
       if (isErpAdmin) {
          url += `?Role=ERPADMIN`; // <-- NEW: Filter by ERP365 tickets on backend
        }
        else if (!isAdmin) {
          url += `?EmpId=${empId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();

        // Filter tickets if statusFilter is applied
        const filteredData = statusFilter
          ? data.filter((ticket) => ticket.Status === statusFilter)
          : data;

        setTicketData(filteredData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [isAdmin, empId, statusFilter]);

  const columns = [
    { field: "id", headerName: "Ticket ID", width: 120 },
    {
      field: "EmpId",
      headerName: "Employee ID",
      width: 150,
    },

    {
      field: "Name",
      headerName: "Employee Name",
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
      "Employee Name": ticket.Name,
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
          rows={ticketData} 
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
