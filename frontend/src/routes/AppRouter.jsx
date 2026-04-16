import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { AppShell } from "../layouts/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { LandingPage } from "../pages/LandingPage";
import { DashboardPage } from "../pages/DashboardPage";
import { CodeReviewPage } from "../pages/CodeReviewPage";
import { GitHubAnalysisPage } from "../pages/GitHubAnalysisPage";
import { FileUploadPage } from "../pages/FileUploadPage";
import { OAuthCallbackPage } from "../pages/OAuthCallbackPage";

export function AppRouter() {
  const { isAuthenticated } = useApp();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/oauth2/success" element={<OAuthCallbackPage />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LandingPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="review" element={<CodeReviewPage />} />
          <Route path="github" element={<GitHubAnalysisPage />} />
          <Route path="upload" element={<FileUploadPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
