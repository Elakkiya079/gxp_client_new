import React from "react";
import { useNavigate } from "react-router-dom";
import takedaLogo from "../assets/takeda_logo.svg";

function Header({ onLogoClick }) {
	const navigate = useNavigate();

	const handleLogoClick = () => {
		// Clear session storage (chat history, etc.)
		sessionStorage.clear();
		// Call parent callback to clear chat state
		if (onLogoClick) onLogoClick();
		// Optionally, redirect to /chat (if not already there)
		navigate("/chat", { replace: true });
	};

	return (
		<div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 h-16 flex items-center px-8">
			{/* Left: Logo */}
			<div className="flex items-center gap-2 flex-1">
				<img
					src={takedaLogo}
					alt="Analytics Dashboard"
					className="max-w-lg object-contain cursor-pointer"
					onClick={handleLogoClick}
					title="Clear session and go to chat"
				/>
			</div>

			{/* Right: Notification & User */}
			{/* <div className="flex items-center gap-6">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8  rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: "#ED1C24" }}>
						TU
					</div>
				</div>
			</div> */}
			{/* Right: Notification & User */}
<div className="flex items-center gap-6">
  <div className="flex items-center gap-3">
    
    {/* User Name */}
    <span className="text-sm font-medium text-gray-700">
      Test User
    </span>

    {/* Avatar */}
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
      style={{ backgroundColor: "#ED1C24" }}
    >
      TU
    </div>

  </div>
</div>
		</div>
	);
}

export default Header;
