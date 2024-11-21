import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, TextField, Switch } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import Header from "../../components/Header";

const Team = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from the API
  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/users/get_users.php"
      );
      const data = await response.json();
      setTeamData(data.records); // Assuming the data is under "records"
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const columns = [
    { field: "EmpId", headerName: "EmpId", width: 100 },
    {
      field: "Name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "Mobile",
      headerName: "Mobile",
      flex: 1,
    },
    {
      field: "Email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "Role",
      headerName: "Designation",
      flex: 1,
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "DateOfJoining",
      headerName: "Date of Joining",
      flex: 1,
    },
    {
      field: "Actions",
      headerName: "Actions",
      renderCell: (params) => {
        const isUserActive = params.row.Status === "Active";
        return (
          <Switch
            checked={isUserActive}
            onChange={() =>
              handleToggleUserStatus(params.row.EmpId, isUserActive)
            }
            style={{ color: "#3DA58A" }}
          />
        );
      },
      width: 150,
    },
  ];

  // Handle row click to redirect to the employee details page
  const handleRowClick = (params) => {
    navigate(`/employee/${params.row.EmpId}`); // Redirect to employee details route
  };

  // Function to handle activate/deactivate user
  const handleToggleUserStatus = (empId, isCurrentlyActive) => {
    // Prepare data for API call
    const data = { EmpId: empId };

    // API call to toggle the user's status
    fetch("https://namami-infotech.com/ITAM/api/users/deactivate_user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.message.includes("User status updated")) {
          alert(result.message);
          fetchTeamData(); // Reload data after successful toggle
        } else {
          alert("Failed to update user status.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      });
  };

  // Filter team data based on the search term
  const filteredTeamData = teamData.filter(
    (item) =>
      item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box m="20px">
      {/* Wrap Header, Add New button, and search field in a Box */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="TEAM" subtitle="Managing the Team Members" />
        <Box mt={2} mb={2}>
          <TextField
            label="Search team..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputLabelProps={{
              style: { color: colors.grey[100] }, // White text color for label
            }}
            InputProps={{
              style: {
                color: colors.grey[100], // White text color for input
                backgroundColor: colors.primary[400], // Dark background
              },
            }}
          />
        </Box>
        <Box
          width="20%"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={colors.greenAccent[600]}
          borderRadius="4px"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/add-employee")}
        >
          <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
            Add New
          </Typography>
          <PersonOutlinedIcon sx={{ color: colors.grey[100] }} />
        </Box>
      </Box>

      {/* DataGrid */}
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
          "& .name-column--cell": {
            color: colors.greenAccent[300],
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
          rows={filteredTeamData.map((item, index) => ({
            ...item,
            id: index + 1,
          }))}
          columns={columns}
          loading={loading}
          onRowClick={handleRowClick} // Add row click handler
          sx={{ cursor: "pointer" }}
        />
      </Box>
    </Box>
  );
};

export default Team;
