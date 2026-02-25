import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserService } from "../services/UserService";
import takedaLogo from "../assets/takeda_logo.svg";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSignIn = async (e) => {
		e.preventDefault();

		// Validation
		if (!email || !password) {
			toast.error("Please enter both email and password");
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		setLoading(true);

		try {
			const result = await UserService.login(email, password);

			if (result.approved) {
				toast.success("Authentication successful!");
				// Store user info (optional)
				localStorage.setItem("user", JSON.stringify(result.user));
				localStorage.setItem("token", result.token);
				// Navigate to chat screen after short delay for toast visibility
				setTimeout(() => {
					navigate("/chat");
				}, 500);
			} else {
				toast.error("Authentication failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Authentication failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="flex justify-center mb-8">
					<img src={takedaLogo} alt="Takeda Logo" className="h-12" />
				</div>

				{/* Card */}
				<div className="bg-white rounded-lg shadow-lg p-8">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Welcome Back
						</h1>
						<p className="text-gray-600">Sign in to access GXP Chat</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSignIn} className="space-y-6">
						{/* Email Input */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
								disabled={loading}
							/>
						</div>

						{/* Password Input */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
								disabled={loading}
							/>
						</div>

						{/* Sign In Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
							{loading ?
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									Signing In...
								</>
							:	"Sign In"}
						</button>
					</form>

					{/* Footer */}
					{/*<div className="mt-8 text-center text-sm text-gray-600">
						<p>Demo credentials for testing available upon request</p>
					</div>*/}
				</div>
			</div>
		</div>
	);
}

export default Login;
