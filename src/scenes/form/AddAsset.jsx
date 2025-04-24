import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const AddAsset = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [assetNames, setAssetNames] = useState([]);
  const [filteredAssetNames, setFilteredAssetNames] = useState([]);
  const [fieldNames, setFieldNames] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [loading, setLoading] = useState(false);
const navigate = useNavigate(); 
  const [formValues, setFormValues] = useState({
    assetType: "",
    assetName: "",
    assetCondition: "New", // Default value for Asset Condition
    make: "",
    model: "",
    serialNo: "",
    harddisk: "",
    ram: "",
    quantity: "",
    invoiceNo: "",
    invoiceDate: "",
    vendorName: "",
    invoiceAttach: null,
    status: "In stock",
  });

  useEffect(() => {
    const fetchAssetNames = async () => {
      try {
        const response = await axios.get(
          "https://namami-infotech.com/ITAM/api/assets/get_asset_names.php"
        );
        if (response.data.data && Array.isArray(response.data.data)) {
          setAssetNames(response.data.data);
          setFilteredAssetNames(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching asset names:", error);
      }
    };
    fetchAssetNames();
  }, []);

  const fetchFieldNames = async (checkpoints) => {
    try {
      const response = await axios.get(
        `https://namami-infotech.com/ITAM/api/assets/get_checkpoints.php?checkpoints=${checkpoints.join(
          ","
        )}`
      );
      if (response.data.data && Array.isArray(response.data.data)) {
        setFieldNames(response.data.data);
      } else {
        setFieldNames([]);
      }
    } catch (error) {
      console.error("Error fetching field names:", error);
      setFieldNames([]);
    }
  };

  const handleAssetTypeChange = (event) => {
    const assetType = event.target.value;
    setFormValues((prevValues) => ({
      ...prevValues,
      assetType,
    }));

    const filteredAssets = assetNames.filter(
      (asset) => asset.type === assetType
    );
    setFilteredAssetNames(filteredAssets);
    setFormValues((prevValues) => ({
      ...prevValues,
      assetName: "",
    }));
    setFieldNames([]);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFileChange = (event) => {
    setFormValues({ ...formValues, invoiceAttach: event.target.files[0] });
  };

  const handleAssetNameChange = async (event) => {
    const selectedAsset = assetNames.find(
      (asset) => asset.name === event.target.value
    );
    setFormValues({ ...formValues, assetName: event.target.value });

    // Ensure that the selectedAsset exists before accessing its properties
    if (selectedAsset) {
      setSelectedAssetId(selectedAsset.id);

      if (selectedAsset.checkpoints) {
        const checkpoints = selectedAsset.checkpoints
          .split(",")
          .map((id) => parseInt(id, 10));
        await fetchFieldNames(checkpoints);
      } else {
        setFieldNames([]);
      }
    } else {
      setSelectedAssetId("");
      setFieldNames([]);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);

      // Create an object to hold the form values, including selectedAssetId
      const payload = {
        AssetType: formValues.assetType || "",
        AssetName: formValues.assetName || "",
        AssetId: selectedAssetId || "",
        AssetCondition: formValues.assetCondition || "New",
        Status: formValues.status || "In stock",
      };

      // Append only the fields that come from checkpoints
      fieldNames.forEach((field) => {
        const fieldValue = formValues[field.field_name] || "";
        payload[field.field_name] = fieldValue;
      });

      console.log("Payload being sent:", payload);

      // Make the API request using axios with JSON
      const response = await axios.post(
        "https://namami-infotech.com/ITAM/api/assets/add_asset.php",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);
      alert(response.data.message);
    } catch (error) {
      console.error("Error adding asset:", error);
      alert("Failed to add asset");
    } finally {
      setLoading(false);
      navigate("/asset"); 
    }
  };

  return (
    <Box m="20px">
      <Header title="ADD NEW ASSET" subtitle="Add a New Asset" />

      <Box
        display="grid"
        gap="30px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 2" },
        }}
      >
        <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
          <InputLabel id="asset-type-label">Asset Type</InputLabel>
          <Select
            labelId="asset-type-label"
            name="assetType"
            value={formValues.assetType}
            onChange={handleAssetTypeChange}
          >
            <MenuItem value="Hardware">Hardware</MenuItem>
            <MenuItem value="Software">Software</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
          <InputLabel id="asset-name-label">Asset Name</InputLabel>
          <Select
            labelId="asset-name-label"
            name="assetName"
            value={formValues.assetName}
            onChange={handleAssetNameChange}
          >
            {filteredAssetNames.map((asset) => (
              <MenuItem key={asset.id} value={asset.name}>
                {asset.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {fieldNames.length > 0 &&
          fieldNames.map((field) =>
            // Render AssetCondition as a dropdown if the field name is "AssetCondition"
            field.field_name === "AssetCondition" ? (
              <FormControl
                key={field.id}
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel id="asset-condition-label">
                  Asset Condition
                </InputLabel>
                <Select
                  labelId="asset-condition-label"
                  name="assetCondition"
                  value={formValues.assetCondition}
                  onChange={handleInputChange}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Refurbished">Refurbished</MenuItem>
                </Select>
              </FormControl>
            ) : // Render file upload input if field_type is "BLOB"
            field.field_type === "BLOB" ? (
              <FormControl
                key={field.id}
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <input
                  accept="image/*" // To accept only image files
                  id={`upload-${field.field_name}`}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(event) =>
                    handleFileChange(event, field.field_name)
                  }
                />
                <label htmlFor={`upload-${field.field_name}`}>
                  <Button
                    variant="contained"
                    component="span"
                    color="primary"
                    fullWidth
                  >
                    {formValues[field.field_name]
                      ? "File Selected"
                      : "Invoice Attachment"}
                  </Button>
                </label>
              </FormControl>
            ) : (
              // Render regular text fields for other types
              <TextField
                key={field.id}
                fullWidth
                variant="filled"
                label={field.field_name}
                name={field.field_name}
                type={field.field_type || "text"}
                value={formValues[field.field_name] || ""}
                onChange={handleInputChange}
                sx={{ gridColumn: "span 2" }}
              />
            )
          )}

        <Box mt="20px" sx={{ gridColumn: "span 2" }}>
          <Button
            disabled={loading}
            onClick={handleFormSubmit}
            variant="contained"
            color="primary"
            sx={{ width: "100%" }}
          >
            {loading ? "Adding..." : "Add Asset"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddAsset;
