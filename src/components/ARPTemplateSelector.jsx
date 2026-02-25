import React from "react";

function ARPTemplateSelector({ onSelect }) {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold text-gray-900 mb-2">
					How would you like to create the ARP template?
				</h2>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<button
					onClick={() => onSelect("Agile Release Plan")}
					className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition">
					<div className="w-full h-28 bg-gray-100 rounded mb-4 flex items-center justify-center">
						{/* illustration placeholder */}
						<div className="w-20 h-10 bg-pink-200 rounded"></div>
					</div>
					<div className="text-sm text-gray-700">Agile Release Plan</div>
				</button>

				<button
					onClick={() => onSelect("Waterfall Release Plan")}
					className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition">
					<div className="w-full h-28 bg-gray-100 rounded mb-4 flex items-center justify-center">
						<div className="w-20 h-10 bg-pink-200 rounded"></div>
					</div>
					<div className="text-sm text-gray-700">Waterfall Release Plan</div>
				</button>
			</div>
		</div>
	);
}

export default ARPTemplateSelector;
