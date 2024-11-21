import {
  Box,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Modal,
  TextField,
  Button,
} from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null); // State for dropdown menu
  const [openModal, setOpenModal] = useState(false); // State for modal visibility
  const [newPassword, setNewPassword] = useState(""); // New password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const userDetails = JSON.parse(localStorage.getItem("userDetails")) || {};
  const EmpId = userDetails.EmpId; // Get EmpId from localStorage

  // Function to handle menu opening
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to handle menu closing
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.clear(); // Clear local storage
    navigate("/login"); // Redirect to login
  };

  const handleProfile = () => {
    navigate("/"); // Redirect to profile page
  };

  const handleChangePassword = () => {
    // Ensure passwords match
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Prepare data for API call
    const data = {
      EmpId,
      Password: newPassword,
    };

    // API call to update password
    fetch("https://namami-infotech.com/ITAM/api/users/update_password.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.message === "Password updated successfully.") {
          alert("Password updated successfully.");
          setOpenModal(false); // Close modal on success
        } else {
          alert("Failed to update password.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      });
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        {/* <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton> */}
      </Box>

      {/* ICONS */}
      <Box display="flex">
        {/* <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton> */}

        <IconButton onClick={handleMenuClick}>
          <PersonOutlinedIcon />
        </IconButton>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleProfile}>Profile</MenuItem>
          <MenuItem onClick={() => setOpenModal(true)}>
            Change Password
          </MenuItem>
          {/* <MenuItem onClick={handleLogout}>Logout</MenuItem> */}
        </Menu>
        <IconButton onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* Modal for Change Password */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="change-password-modal"
        aria-describedby="modal-to-change-password"
      >
        <Box
          sx={{
            width: 400,
            backgroundColor: "black",
            padding: 4,
            borderRadius: 2,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <h2>Change Password</h2>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
            >
              Update Password
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Topbar;
