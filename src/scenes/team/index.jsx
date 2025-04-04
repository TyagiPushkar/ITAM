import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  TextField,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Header from "../../components/Header";

const Team = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    EmpId: "",
    Name: "",
    Mobile: "",
    Email: "",
    Role: "",
    Functions: "",
    Status: "",
  });

  // Fetch data from the API
  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/users/get_users.php"
      );
      const data = await response.json();

      // Standardize DateOfJoining format to dd-mm-yyyy
      const formattedData = data.records.map((item) => ({
        ...item,
        DateOfJoining: formatDate(item.DateOfJoining),
      }));

      setTeamData(formattedData); // Use formatted data
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const normalizedDateString = dateString.replace(/\//g, "-");
    const dateParts = normalizedDateString.split("-");
    if (dateParts[0].length === 4) {
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
    return normalizedDateString;
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleEditClick = (rowData) => {
    setEditData(rowData);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/users/edit_user.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );
      const result = await response.json();
      if (result.message.includes("User details were updated")) {
        alert("Employee updated successfully.");
        fetchTeamData();
        setOpenEditDialog(false);
      } else {
        alert("Failed to update employee.");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleRowClick = (params) => {
    navigate(`/employee/${params.row.EmpId}`);
  };

  const handleToggleUserStatus = (empId, isCurrentlyActive) => {
    const data = { EmpId: empId };
    fetch(
      "https://namami-infotech.com/ITAM/api/users/deactivate_user.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.message.includes("User status updated")) {
          alert(result.message);
          fetchTeamData();
        } else {
          alert("Failed to update user status.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      });
  };

  const filteredTeamData = teamData.filter((item) => {
    const name = item.Name || ""; // Default to an empty string if null
    const mobile = item.Mobile || ""; // Default to an empty string if null
    const email = item.Email || ""; // Default to an empty string if null
    const role = item.Role || ""; // Default to an empty string if null
    const functions = item.Functions || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      functions.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    { field: "EmpId", headerName: "EmpId", width: 100 },
    { field: "Name", headerName: "Name", flex: 1 },
    { field: "Mobile", headerName: "Mobile", flex: 1 },
    { field: "Email", headerName: "Email", flex: 1 },
    { field: "Role", headerName: "Designation", flex: 1 },
    { field: "Status", headerName: "Status", flex: 1 },
    { field: "DateOfJoining", headerName: "Date of Joining", flex: 1 },
    {
      field: "Actions",
      headerName: "Actions",
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleRowClick(params)}>
            <VisibilityOutlinedIcon style={{ color: colors.blueAccent[500] }} />
          </IconButton>
          <IconButton onClick={() => handleEditClick(params.row)}>
            <EditOutlinedIcon style={{ color: colors.greenAccent[500] }} />
          </IconButton>
          <Switch
            checked={params.row.Status === "Active"}
            onChange={() =>
              handleToggleUserStatus(
                params.row.EmpId,
                params.row.Status === "Active"
              )
            }
            style={{ color: "#3DA58A" }}
          />
        </>
      ),
      width: 200,
    },
  ];

  return (
    <Box m="20px">
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
      <Box
        m="10px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
          },
        }}
      >
        <DataGrid
          rows={filteredTeamData.map((item, index) => ({
            ...item,
            id: index + 1,
          }))}
          columns={columns}
          loading={loading}
          sx={{ cursor: "pointer" }}
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editData.Name}
            onChange={(e) => setEditData({ ...editData, Name: e.target.value })}
          />
          <TextField
            label="Mobile"
            fullWidth
            margin="dense"
            value={editData.Mobile}
            onChange={(e) =>
              setEditData({ ...editData, Mobile: e.target.value })
            }
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={editData.Email}
            onChange={(e) =>
              setEditData({ ...editData, Email: e.target.value })
            }
          />
          <TextField
            label="Designation"
            fullWidth
            margin="dense"
            value={editData.Role}
            onChange={(e) => setEditData({ ...editData, Role: e.target.value })}
          />
          <TextField
            label="Department"
            fullWidth
            margin="dense"
            value={editData.Functions}
            onChange={(e) =>
              setEditData({ ...editData, Functions: e.target.value })
            }
          />
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSubmit}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Team;
