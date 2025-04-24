import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const RaiseTicket = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Fetch user details from local storage
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const EmpId = userDetails ? userDetails.EmpId : ""; // Fallback to empty if not found
  const Name = userDetails ? userDetails.Name : "";
  const Email = userDetails ? userDetails.Email : "";

  // Form state
  const [formData, setFormData] = useState({
    Category: "",
    Remark: "",
    Image: null,
    Status: "Open", // Default to "Open"
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image file upload
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the first file
    setFormData({ ...formData, Image: file });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state

    const formDataToSend = new FormData(); // Use FormData for file uploads
    formDataToSend.append("EmpId", EmpId); // Append EmpId to the FormData
    formDataToSend.append("Category", formData.Category);
    formDataToSend.append("Remark", formData.Remark);
    if (formData.Image) {
      formDataToSend.append("Image", formData.Image);
    }
    formDataToSend.append("Status", formData.Status);

    try {
      const response = await fetch("https://namami-infotech.com/ITAM/api/support/raise_ticket.php", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Ticket raised successfully.");
        setError(null);
        setFormData({
          Category: "",
          Remark: "",
          Image: null, // Reset the form
          Status: "Open",
        });
      } else {
        setError(data.message || "Error raising ticket");
        setSuccess(null);
      }
    } catch (err) {
      setError("Failed to raise ticket. Please try again.");
      setSuccess(null);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Box m="20px">
      <Header title="Raise Support Ticket" subtitle="Create a new support ticket" />

      <form onSubmit={handleSubmit}>
        <Box display="grid" gridTemplateColumns="auto auto" gap="20px" width="80%">
          <FormControl fullWidth required>
            <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
              Category
            </InputLabel>
            <Select
              label="Category"
              name="Category"
              value={formData.Category}
              onChange={handleChange}
              sx={{
                color: 'white', 
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.greenAccent[500] },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.greenAccent[600] },
              }}
            >
              <MenuItem value="Hardware">Hardware</MenuItem>
              <MenuItem value="Software">Software</MenuItem>
              {/* Add more categories as needed */}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            variant="outlined"
            label="Problem Description"
            name="Remark"
            value={formData.Remark}
            onChange={handleChange}
            required
            multiline
            rows={4}
            sx={{
              gridColumn: "span 2",
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'white',
              },
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: colors.greenAccent[500],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.greenAccent[600],
                },
              },
            }}
          />

          <Box>
            <InputLabel sx={{ color: 'white' }}>Upload Image (optional)</InputLabel>
            <input
              type="file"
              name="Image"
              onChange={handleImageChange}
              accept="image/*"
              style={{ color: 'white' }}
            />
            {formData.Image && <Typography variant="body2" sx={{ color: 'white' }}>{formData.Image.name}</Typography>}
          </Box>
        </Box>

        {/* Error & Success Messages */}
        {error && (
          <Typography color="error" variant="body2" mt="10px">
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="primary" variant="body2" mt="10px">
            {success}
          </Typography>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            mt: "20px",
            backgroundColor: colors.greenAccent[600],
            ":hover": {
              backgroundColor: colors.greenAccent[700],
            },
          }}
          disabled={loading} // Disable button while loading
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Ticket"}
        </Button>
      </form>
    </Box>
  );
};

export default RaiseTicket;
