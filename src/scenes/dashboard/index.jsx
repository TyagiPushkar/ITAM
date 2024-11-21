import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import PieChart from "../../components/PieChart";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [dashboardData, setDashboardData] = useState({
    assetStats: {},
    ticketStats: {},
    assetDetails: [],
    ticketDetails: [],
  });
  const [selectedAssetName, setSelectedAssetName] = useState("");
  const [pieChartData, setPieChartData] = useState([]);
  const navigate = useNavigate();

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
          "In Stock": 0,
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
      "In Stock": 0,
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
        <StatBox
          title={dashboardData.assetStats.totalAssets || 0}
          subtitle="Total Assets"
          icon={
            <PointOfSaleIcon
              sx={{ color: colors.greenAccent[600], fontSize: 30 }}
            />
          }
        />
        <StatBox
          title={dashboardData.assetStats.liveAssets || 0}
          subtitle="Live Assets"
          icon={
            <PointOfSaleIcon
              sx={{ color: colors.greenAccent[600], fontSize: 30 }}
            />
          }
        />
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
            <PieChart pieData={pieChartData} />
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
            title={dashboardData.ticketStats.totalTickets || 0}
            subtitle="Total Tickets"
            icon={
              <EmailIcon
                sx={{ color: colors.greenAccent[600], fontSize: 40 }}
              />
            }
          />
          <StatBox
            title={dashboardData.ticketStats.openTickets || 0}
            subtitle="Open Tickets"
            icon={
              <EmailIcon
                sx={{ color: colors.greenAccent[600], fontSize: 40 }}
              />
            }
          />
          <StatBox
            title={dashboardData.ticketStats.resolvedTickets || 0}
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
