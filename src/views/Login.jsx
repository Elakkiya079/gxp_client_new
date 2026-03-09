import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";
import logo from "../assets/takeda_logo.svg";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
	const { instance } = useMsal();
	const isAuthenticated = useIsAuthenticated();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
				<div className="flex justify-center mb-6">
					<img src={logo} alt="Logo" className="h-10 object-contain" />
				</div>
				<button
					className="w-full h-11 border border-takeda-red text-takeda-red rounded-lg font-semibold hover:bg-gray-200"
					onClick={() => instance.loginRedirect(loginRequest)}>
					Login with SSO
				</button>
				<p className="text-xs text-gray-400 text-center mt-6">© 2026 Takeda</p>
			</div>
		</div>
	);
}
