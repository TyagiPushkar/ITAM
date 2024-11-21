import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login/Login";
import Asset from "./scenes/asset";
import AssetDetail from "./scenes/asset/AssetDetail";
import AddAsset from "./scenes/form/AddAsset";
import ProtectedRoute from "./ProtectedRoute"; // Import the ProtectedRoute component
import EmployeeDetails from "./scenes/team/EmployeeDetails";
import IssueAsset from "./scenes/asset/IssueAsset";
import IssuedAssets from "./scenes/asset/IssuedAssets";
import Support from "./scenes/support";
import RaiseTicket from "./scenes/support/RaiseTicket";
import TicketDetail from "./scenes/support/TicketDetail";
import Profile from "./scenes/team/Profile";
import Report from "./scenes/report/Report";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <div className="app">
          <Routes>
            {/* Public Route: Login Page */}
            <Route path="/login" element={<Login />} />

            {/* All other routes render Sidebar and Topbar */}
            <Route
              path="*"
              element={
                <>
                  <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
                    <Sidebar isSidebar={isSidebarCollapsed} setIsSidebar={setIsSidebarCollapsed} />
                  </div>
                  <main className="content" style={{ marginBottom: "50px" }}>
                    <Topbar setIsSidebar={setIsSidebarCollapsed} />
                    <Routes>
                      {/* Public Routes */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute adminOnly>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/team" 
                        element={
                          <ProtectedRoute adminOnly>
                            <Team />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/employee/:EmpId" element={<ProtectedRoute adminOnly><EmployeeDetails /></ProtectedRoute>} />

                      {/* Admin-Only Routes */}
                      <Route 
                        path="/asset" 
                        element={
                          <ProtectedRoute adminOnly>
                            <Asset />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/asset/:assetId" 
                        element={
                          <ProtectedRoute adminOnly>
                            <AssetDetail />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/issue-asset" 
                        element={
                          <ProtectedRoute adminOnly>
                            <IssuedAssets />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/issue-new-asset" 
                        element={
                          <ProtectedRoute adminOnly>
                            <IssueAsset />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/support-ticket" 
                        element={
                          <ProtectedRoute>
                            <Support />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/raise-ticket" 
                        element={
                          <ProtectedRoute>
                            <RaiseTicket />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/support/:id" element={<TicketDetail />} />
                      <Route 
                        path="/add-employee" 
                        element={
                          <ProtectedRoute adminOnly>
                            <Form />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/add-asset" 
                        element={
                          <ProtectedRoute adminOnly>
                            <AddAsset />
                          </ProtectedRoute>
                        } 
                      />
                       <Route 
                        path="/reports" 
                        element={
                          <ProtectedRoute adminOnly>
                          <Report/>
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
