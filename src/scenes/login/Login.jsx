import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirecting
import "./Login.css"; // Import the CSS file for styling

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // State for managing loading
  const [message, setMessage] = useState(""); // State for managing success/error messages
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle forgot password mode
  const navigate = useNavigate(); // Initialize useNavigate

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true when submission starts
    setMessage(""); // Clear any previous messages
    console.log("Submitting login with:", { email, password });

    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/auth/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const textResponse = await response.text(); // Get response as text

      try {
        const data = JSON.parse(textResponse); // Attempt to parse JSON
        console.log("Response data:", data); // Log the received data

        if (response.ok) {
          // Handle successful login
          localStorage.setItem(
            "userDetails",
            JSON.stringify({
              EmpId: data.EmpId,
              Name: data.Name,
              Email: data.Email,
              Role: data.Role,
            })
          );
          setMessage("Login successful! Redirecting...");
          setTimeout(() => {
            navigate("/dashboard"); // Redirect to dashboard after a short delay
          }, 1000);
        } else {
          // Handle errors from the server
          setMessage(data.message || "Login failed. Please try again.");
          console.error("Login failed:", data.message);
        }
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        setMessage("Unexpected response from server. Please try again.");
        console.log("Received non-JSON response:", textResponse);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage(
        "Error during login. Please check your connection and try again."
      );
    } finally {
      setLoading(false); // Set loading state to false when submission ends
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://namami-infotech.com/ITAM/api/users/forget_password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Password reset successful! Please check your email for the new password."
        );
      } else {
        setMessage(data.message || "Password reset failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      setMessage(
        "Error during password reset. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img
          src="../../assets/Logo1.png"
          alt="Logo"
          style={{
            display: "block",
            margin: "0 auto",
            width: "200px",
          }}
        />

        <h2>{isForgotPassword ? "Forgot Password" : "Login"}</h2>

        {!isForgotPassword ? (
          // Login form
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p
              className="forgot-password"
              onClick={() => setIsForgotPassword(true)}
              style={{ cursor: "pointer" }}
            >
              Forgot Password?
            </p>
          </form>
        ) : (
          // Forgot Password form
          <div>
            <div className="form-group">
              <label>Enter your email to reset password</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              onClick={handlePasswordReset}
              className="login-button"
              disabled={loading}
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
            <p
              className="back-to-login"
              onClick={() => setIsForgotPassword(false)}
              style={{ cursor: "pointer" }}
            >
              Back to Login
            </p>
          </div>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
