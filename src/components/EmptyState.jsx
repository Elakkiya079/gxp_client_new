import React from "react";
import takedaGif from "../assets/search_loader.gif";
import "../App.css";

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center mt-24">
			{/* Search Loader */}
			{/*<div
				className="w-[150px] h-[150px] aspect-square rounded-full bg-no-repeat"
				style={{
					backgroundImage: `url(${takedaGif})`,
					backgroundSize: "194.175% 145.631%",
					backgroundPosition: "-70.631px -34.223px",
					backgroundColor: "transparent",
				}}
			/>*/}
			<div className="imgLoad">
				<div id="bg"></div>
			</div>

			{/* Greeting text */}
			<h2 className="mt-6 text-center text-red-600 text-lg font-light max-w-md">
				Hello! I'm your Data Intelligence assistant, ready to help
				<br />
				you find the files you need.
			</h2>
		</div>
	);
}

export default EmptyState;
