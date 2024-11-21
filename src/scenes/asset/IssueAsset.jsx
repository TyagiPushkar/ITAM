import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Autocomplete,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";

const IssueAsset = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetType, setAssetType] = useState("");
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [formData, setFormData] = useState({
    EmpId: "",
    AssetID: "",
    Status: "Issued",
    Remark: "",
    IssueDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch employee and asset data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/ITAM/api/users/get_users.php"
        );
        const data = await response.json();

        // Sort employees alphabetically by name
        const sortedEmployees = (data.records || []).sort((a, b) =>
          a.Name.localeCompare(b.Name)
        );
        setEmployees(sortedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchAssets = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/ITAM/api/assets/get_assets.php"
        );
        const data = await response.json();
        setAssets(data.data || []);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchEmployees();
    fetchAssets();
    setLoading(false);
  }, []);

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAssetTypeChange = (e) => {
    const selectedType = e.target.value;
    setAssetType(selectedType);

    // Filter assets based on the selected asset type and 'In Stock' status
    const filtered = assets.filter(
      (asset) => asset.AssetType === selectedType && asset.Status === "In stock"
    );
    setFilteredAssets(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/assets/asset_issue.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const result = await response.json();
      alert(result.message || "Asset issued successfully");

      setFormData({
        EmpId: "",
        AssetID: "",
        Status: "Issued",
        Remark: "",
        IssueDate: new Date().toISOString().split("T")[0],
      });
      setAssetType("");
      setFilteredAssets([]);
    } catch (error) {
      console.error("Error issuing asset:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h4" mb="20px">
        Issue Asset to Employee
      </Typography>

      {loading ? (
        <Typography>Loading data...</Typography>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "auto auto",
          }}
        >
          <Autocomplete
            options={employees}
            getOptionLabel={(option) => `${option.Name} (${option.EmpId})`}
            onChange={(event, newValue) =>
              handleChange("EmpId", newValue ? newValue.EmpId : "")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Employee"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    color: "white",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "white",
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "white",
                    },
                    "&:hover fieldset": {
                      borderColor: colors.greenAccent[500],
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.greenAccent[600],
                    },
                  },
                }}
              />
            )}
          />

          <FormControl sx={{ width: "400px" }}>
            <InputLabel>Asset Type</InputLabel>
            <Select
              value={assetType}
              onChange={handleAssetTypeChange}
              required
              sx={{
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor:
                    theme.palette.mode === "dark"
                      ? colors.grey[500]
                      : "inherit",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.greenAccent[500],
                },
              }}
            >
              <MenuItem value="Hardware">Hardware</MenuItem>
              <MenuItem value="Software">Software</MenuItem>
            </Select>
          </FormControl>

          <Autocomplete
            options={filteredAssets}
            getOptionLabel={(option) =>
              `${option.AssetName} (${option.AssetId})`
            }
            onChange={(event, newValue) =>
              handleChange("AssetID", newValue ? newValue.AssetId : "")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Asset"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    color: "white",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "white",
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "white",
                    },
                    "&:hover fieldset": {
                      borderColor: colors.greenAccent[500],
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.greenAccent[600],
                    },
                  },
                }}
              />
            )}
          />

          <TextField
            label="Remark"
            name="Remark"
            value={formData.Remark}
            onChange={(e) => handleChange("Remark", e.target.value)}
            required
            multiline
            rows={3}
            sx={{
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: colors.greenAccent[500],
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.greenAccent[600],
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitLoading}
          >
            {submitLoading ? "Issuing..." : "Issue Asset"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default IssueAsset;
