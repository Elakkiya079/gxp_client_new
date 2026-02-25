import React from "react";

function LinkConfirmationModal({ show, selectedLink, onProceed, onCancel }) {
	if (!show) return null;

	return (
		<div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-bold text-gray-900">
						Alert Confirmation
					</h2>
					<button
						onClick={onCancel}
						className="text-gray-400 hover:text-gray-600 text-2xl">
						×
					</button>
				</div>

				<p className="text-gray-700 mb-8">
					You are being redirected to the source system to view this document.
					<br />
					Do you want to proceed?
				</p>

				<div className="flex gap-4 justify-center">
					<button
						onClick={onCancel}
						className="px-6 py-2 text-red-600 font-semibold hover:bg-red-50 rounded transition">
						Cancel
					</button>
					<button
						onClick={onProceed}
						className="px-6 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition">
						Yes, Proceed
					</button>
				</div>
			</div>
		</div>
	);
}

export default LinkConfirmationModal;
