import {
  Box,
  Typography,
  useTheme,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import PieChart from "../../components/PieChart";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    assetStats: {},
    ticketStats: {},
    assetDetails: [],
    ticketDetails: [],
  });
  const [selectedAssetName, setSelectedAssetName] = useState("");
  const [pieChartData, setPieChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/ITAM/api/Dashboard/dashboard.php"
        );
        const data = await response.json();
        setDashboardData(data);

        const defaultAssetName = "Laptop";
        setSelectedAssetName(defaultAssetName);

        const filteredAssets = data.assetDetails.filter(
          (asset) => asset.AssetName === defaultAssetName
        );

        const statusCounts = {
          Live: 0,
          Faulty: 0,
        };

        filteredAssets.forEach((asset) => {
          statusCounts[asset.Status] = (statusCounts[asset.Status] || 0) + 1;
        });

        const pieData = Object.entries(statusCounts).map(([key, value]) => ({
          id: key,
          label: `${key} (${value})`,
          value,
        }));

        setPieChartData(pieData);
      } catch (error) {
        console.error("Error fetching the dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAssetNameChange = (event) => {
    const selectedName = event.target.value;
    setSelectedAssetName(selectedName);

    const filteredAssets = dashboardData.assetDetails.filter(
      (asset) => asset.AssetName === selectedName
    );

    const statusCounts = {
      Live: 0,
      Faulty: 0,
    };

    filteredAssets.forEach((asset) => {
      statusCounts[asset.Status] = (statusCounts[asset.Status] || 0) + 1;
    });

    const pieData = Object.entries(statusCounts).map(([key, value]) => ({
      id: key,
      label: `${key} (${value})`,
      value,
    }));

    setPieChartData(pieData);
  };

  const assetNames = [
    ...new Set(dashboardData.assetDetails.map((asset) => asset.AssetName)),
  ];

  const openTickets = dashboardData.ticketDetails.filter(
    (ticket) => ticket.Status === "Open"
  );

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* Summary Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        gap="20px"
        mt="20px"
      >
        <Box onClick={() => navigate("/asset")} sx={{ cursor: "pointer" }}>
          <StatBox
            title={dashboardData.assetStats.totalAssets || 0}
            subtitle="Total Assets"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: 30 }}
              />
            }
          />
        </Box>
        <Box
          onClick={() => navigate("/asset?status=Live")}
          sx={{ cursor: "pointer" }}
        >
          <StatBox
            title={dashboardData.assetStats.liveAssets || 0}
            subtitle="Live Assets"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: 30 }}
              />
            }
          />
        </Box>
        <Box
          onClick={() => navigate("/asset?status=In Stock")}
          sx={{ cursor: "pointer" }}
        >
          <StatBox
            title={dashboardData.assetStats.inStockAssets || 0}
            subtitle="In Stock Assets"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: 30 }}
              />
            }
          />
        </Box>
        <Box
          onClick={() => navigate("/asset?status=Faulty")}
          sx={{ cursor: "pointer" }}
        >
          <StatBox
            title={dashboardData.assetStats.faultyAssets || 0}
            subtitle="Faulty Assets"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: 30 }}
              />
            }
          />
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="120px"
        gap="20px"
        mt="20px"
      >
        <Box
          gridColumn="span 8"
          gridRow="span 3"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Asset Distribution
              </Typography>
              <Select
                value={selectedAssetName}
                onChange={handleAssetNameChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Asset Name
                </MenuItem>
                {assetNames.length > 0 ? (
                  assetNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Asset Names Available</MenuItem>
                )}
              </Select>
            </Box>
          </Box>
          <Box height="300px" m="-20px 0 0 0">
            <PieChart
              pieData={pieChartData}
              assetDetails={dashboardData.assetDetails}
            />
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 3"
          backgroundColor={colors.primary[400]}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Tickets
            </Typography>
          </Box>
          <StatBox
            title={
              <Link
                to="/support-ticket"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {dashboardData.ticketStats.totalTickets || 0}
              </Link>
            }
            subtitle="Total Tickets"
            icon={
              <EmailIcon
                sx={{ color: colors.greenAccent[600], fontSize: 40 }}
              />
            }
          />
          <StatBox
            title={
              <Link
                to="/support-ticket?status=Open"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {dashboardData.ticketStats.openTickets || 0}
              </Link>
            }
            subtitle="Open Tickets"
            icon={
              <EmailIcon
                sx={{ color: colors.greenAccent[600], fontSize: 40 }}
              />
            }
          />
          <StatBox
            title={
              <Link
                to="/support-ticket?status=Resolved"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {dashboardData.ticketStats.resolvedTickets || 0}
              </Link>
            }
            subtitle="Resolved Tickets"
            icon={
              <EmailIcon
                sx={{ color: colors.greenAccent[600], fontSize: 40 }}
              />
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
