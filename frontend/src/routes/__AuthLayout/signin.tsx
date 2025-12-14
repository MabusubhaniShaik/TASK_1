import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { apiService } from "@/services/api.service";
import { jwtDecode } from "jwt-decode";
import { formatExpiry } from "@/utilis/timeFormatter";

export const Route = createFileRoute("/__AuthLayout/signin")({
  component: SigninComponent,
});

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

function SigninComponent() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = { user_id: userId, password };
      const response = await apiService({
        url: "auth/token",
        method: "POST",
        payload,
        requireAuth: false,
      });

      if (!response.access_token) {
        throw new Error("No access token received from server");
      }

      // Decode access token
      const decoded: DecodedToken = jwtDecode(response.access_token);

      // Flatten the `user` object if present
      const userInfo = decoded.user
        ? { ...decoded.user, iat: decoded.iat, exp: decoded.exp }
        : decoded;

      const expiresAtFormatted = formatExpiry(decoded.exp);

      // Store in sessionStorage
      sessionStorage.setItem("access_token", response.access_token);
      if (response.refresh_token) {
        sessionStorage.setItem("refresh_token", response.refresh_token);
      }
      sessionStorage.setItem("user_info", JSON.stringify(userInfo));
      sessionStorage.setItem("expires_at", expiresAtFormatted);

      setError(null);
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 500);
    } catch (error: any) {
      console.error("Login error details:", error);
      if (error.isNetworkError) {
        setError(
          "Cannot connect to server. Please check if backend is running."
        );
        setIsServerOnline(false);
      } else if (error.status === 401) {
        setError("Invalid User ID or password. Please try again.");
      } else if (error.status === 404) {
        setError("Authentication service not found.");
      } else if (error.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = () => {
    setIsServerOnline(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20">
      <Card className="bg-black text-white border-gray-800">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-2xl font-bold">DMS Portal</CardTitle>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </CardHeader>

        <CardContent>
          {isServerOnline === false && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-sm text-yellow-300">
                  Server connection failed. Ensure backend is running on port
                  9009.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full bg-yellow-900/20 border-yellow-800 text-yellow-300 hover:bg-yellow-900/30"
                onClick={retryConnection}
                disabled={isLoading}
              >
                Retry Connection
              </Button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="userId" className="text-sm font-medium">
                User ID
              </Label>
              <Input
                id="userId"
                type="text"
                placeholder="Enter your User ID"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setError(null);
                }}
                required
                disabled={isLoading || isServerOnline === false}
                className="h-10 text-white placeholder-gray-400 bg-black border-gray-700 focus-visible:ring-gray-600 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  required
                  disabled={isLoading || isServerOnline === false}
                  className="h-10 text-white placeholder-gray-400 bg-black border-gray-700 focus-visible:ring-gray-600 pr-10 disabled:opacity-50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isServerOnline === false}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-white text-black font-medium hover:bg-gray-200 hover:text-black mt-6 disabled:opacity-50"
              disabled={isLoading || isServerOnline === false}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
