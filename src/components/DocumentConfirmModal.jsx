import React from "react";

function DocumentConfirmModal({ show, docTypeLabel, onConfirm, onCancel }) {
	if (!show) return null;

	return (
		<div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50 rounded-lg border border-[#DEDBDB]">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
				<div className="px-6 py-4 border-b">
					<h3 className="text-sm font-medium text-gray-700">
						Choose the document type to generate
					</h3>
				</div>
				<div className="p-8">
					<p className="text-gray-700">
						Are you sure you want to proceed creating <b>{docTypeLabel}</b>{" "}
						Document?
					</p>

					<div className="flex justify-end gap-4 mt-6">
						<button onClick={onCancel} className="text-red-600">
							Cancel
						</button>
						<button
							onClick={onConfirm}
							className="bg-[#E31937] text-white px-4 py-2 rounded">
							yes
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DocumentConfirmModal;
