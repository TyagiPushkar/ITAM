import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { Devices } from "@mui/icons-material";
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SummarizeIcon from '@mui/icons-material/Summarize';
const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};


const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  // Retrieve user data from local storage
  const userDetails = JSON.parse(localStorage.getItem("userDetails")) || {};
  const { Name, Role } = userDetails; // Destructure Name and Role from userDetails
 // Determine the logo based on theme mode
  const logoSrc = theme.palette.mode === 'light' ? '../../assets/LogoLight.png' : '../../assets/Logo.png';

  return (
    <Box
      sx={{
        position: "fixed",
        height: "100vh",
        zIndex: 1000,
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  NIVESHAN
                </Typography>
                
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="150px"
                  src={logoSrc}
                  style={{ cursor: "pointer" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {Name} {/* Displaying user's name */}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {Role} {/* Displaying user's role */}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {/* Public Route */}
           

            {/* Admin-Only Routes */}
            {Role === "Admin" && (

              
              <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
                />
            )}
             <Item
                  title="Profile"
                  to="/"
                  icon={<PersonOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
            {Role === "Admin" && (
              <>
                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{ m: "15px 0 5px 20px" }}
                >
                  Manage
                </Typography>
                <Item
                  title="Team"
                  to="/team"
                  icon={<PeopleOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Assets"
                  to="/asset"
                  icon={<Devices />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Issue Asset"
                  to="/issue-asset"
                  icon={<FormatListNumberedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                 <Item
                  title="Reports"
                  to="/reports"
                  icon={<SummarizeIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
               
                
              </>
            )}
             <Item
                  title="Support Ticket"
                  to="/support-ticket"
                  icon={<LiveHelpIcon />}
                  selected={selected}
                  setSelected={setSelected}
            />
            
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
