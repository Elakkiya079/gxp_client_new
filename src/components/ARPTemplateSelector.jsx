import React from "react";
import Frame from "../assets/Frame.svg";
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
					className="
    group
    bg-white
    rounded-xl
    border border-[#DEDBDB]
    p-6
    flex flex-col
    transition-all duration-300
    hover:shadow-xl
    hover:-translate-y-1
    hover:border-red-500
  ">
					{/* Image Container */}
					<div className="w-full mb-4 flex items-center justify-center">
						<img
							src={Frame}
							alt="Agile Release Plan"
							className="
      w-full
      h-36
      object-contain
      transition-all duration-300
      group-hover:scale-105
    "
						/>
					</div>

					{/* Title */}
					<div
						className="
      text-base
      font-medium
      text-gray-800
      group-hover:text-red-600
      transition
    ">
						Agile Release Plan
					</div>
				</button>

				{/*<button
					onClick={() => onSelect("Waterfall Release Plan")}
					className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition">
					<div className="w-full h-28 bg-gray-100 rounded mb-4 flex items-center justify-center">
						<div className="w-20 h-10 bg-[#E31937] rounded"></div>
					</div>
					<div className="text-sm text-gray-700">Waterfall Release Plan</div>
				</button>*/}
			</div>
		</div>
	);
}

export default ARPTemplateSelector;
