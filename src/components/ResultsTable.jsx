import React from "react";

function ResultsTable({
	sources,
	onFileNameClick,
	onSourceLinkClick,
	isChangeRequest,
	userQuery = "",
}) {
	// Check if "elluminate" is in the query
	const isElluminate = userQuery.toLowerCase().includes("elluminate");

	// Determine table columns based on data type
	const isDocumentDetailFormat =
		sources.length > 0 && sources[0].documentID && sources[0].sourceSystem;
	const isChangeRequestFormat =
		!isDocumentDetailFormat &&
		(isChangeRequest || (sources.length > 0 && sources[0].changeRequestId));

	// Detect "No Data Found" response
	const isNoDataResponse =
		sources.length === 1 &&
		(sources[0].documentType === "No Data Found" ||
			sources[0].message ||
			sources[0].documentId === "N/A");
	return (
		<>
		{isNoDataResponse ? (
			<div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
				<h3 className="text-lg font-semibold text-gray-800 mb-2">
					No Results Found
				</h3>
				<p className="text-sm text-gray-600">
					{sources[0].message ||
						"No data found for this Change Request."}
				</p>
			</div>
		):(
		<>
			<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
				{/* Table Header */}
				<div
					className={`grid gap-4 bg-gray-50 px-6 py-4 border-b border-gray-200 font-semibold text-sm text-gray-700 ${
						isChangeRequestFormat ?
							isElluminate ? "grid-cols-6"
							:	"grid-cols-10"
						: isDocumentDetailFormat ? "grid-cols-12"
						: "grid-cols-12"
					}`}>
					{isDocumentDetailFormat ?
						<>
							<div className="col-span-3">Change Request ID</div>
							<div className="col-span-2">Source System</div>
							<div className="col-span-2">Document ID</div>
							<div className="col-span-2">Document Type</div>
							<div className="col-span-3">Status</div>
						</>
					: isChangeRequestFormat ?
						isElluminate ?
							<>
								<div className="col-span-2">Change Request ID</div>
								<div className="col-span-2">Document Title</div>
								<div className="col-span-2">Document Source</div>
							</>
						:	<>
								<div className="col-span-2">Document Id</div>
								<div className="col-span-2">Application/Document</div>
								<div className="col-span-2">Document Source</div>
								<div className="col-span-2">Document Type</div>
								<div className="col-span-2">Document Link</div>
							</>

					:	<>
							<div className="col-span-3">File Name</div>
							<div className="col-span-2">Type</div>
							<div className="col-span-2">Source</div>
							<div className="col-span-2">Status</div>
						</>
					}
				</div>

				{/* Table Rows */}
				<div>
					{sources.map((source, idx) => (
						<div
							key={idx}
							className={`grid gap-4 px-6 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition ${
								isChangeRequestFormat ?
									isElluminate ? "grid-cols-6"
									:	"grid-cols-10"
								: isDocumentDetailFormat ? "grid-cols-12"
								: "grid-cols-12"
							}`}>
							{isDocumentDetailFormat ?
								<>
									<div className="col-span-3 text-sm text-gray-700">
										{source.changeRequestId}
									</div>
									<div className="col-span-2 text-sm text-gray-700">
										{source.document_source}
									</div>
									<div className="col-span-2 text-sm">{source.document_type}</div>
									<div className="col-span-2 text-sm text-gray-700">
										{source.documentType}
									</div>
									<div className="col-span-3 text-sm">
										{source.status && source.status.startsWith("http") ?
											<a
												href={source.status}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800 hover:underline">
												View
											</a>
										:	<span className="text-gray-600">{source.status}</span>}
									</div>
								</>
							: isChangeRequestFormat ?
								isElluminate ?
									<>
										<div className="col-span-2 text-sm">
											<button
												onClick={() => onFileNameClick(source.changeRequestId)}
												className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium">
												{source.changeRequestId}
											</button>
										</div>
										<div className="col-span-2 text-sm text-gray-700">
											{source.title}
										</div>
										<div className="col-span-2 text-sm text-gray-700">
											{source.source}
										</div>
									</>
								:	<>
										{/* <div className="col-span-2 text-sm">
											<button
												onClick={() => onFileNameClick(source.changeRequestId)}
												className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium">
												{source.changeRequestId}
											</button>
										</div> */}
										<div className="col-span-2 text-sm">
  {source.changeRequestId ? (
    <button
      onClick={() => onFileNameClick(source.changeRequestId)}
      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
    >
      {source.changeRequestId}
    </button>
  ) : (
    <span className="text-gray-700 font-medium">
      {source.document_id}
    </span>
  )}
</div>
										<div className="col-span-2 text-sm text-gray-700">
											{source.title}
										</div>
										<div className="col-span-2 text-sm text-gray-700">
											{source.document_source}
										</div>
										<div className="col-span-2 text-sm text-gray-700">
											{source.document_type}
										</div>
										<div className="col-span-2 text-sm">
											{source.hyperlink || source.url ?
												<a
													href={source.hyperlink || source.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:text-blue-800 hover:underline">
													View Link
												</a>
											:	<span className="text-gray-400">-</span>}
										</div>
									</>

							:	<>
									<div className="col-span-3 text-sm">
										<button
											onClick={() => onFileNameClick(source.file_name)}
											className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium">
											{source.file_name}
										</button>
									</div>
									<div className="col-span-2 text-sm text-gray-700">
										{source.type}
									</div>
									<div className="col-span-2 text-sm text-gray-700">
										{source.source_system}
									</div>
									<div className="col-span-2 text-sm">
										<button
											onClick={() =>
												source.access && onSourceLinkClick(source.source_link)
											}
											disabled={!source.access}
											className={`font-medium text-sm transition ${
												source.access ?
													"text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
												:	"text-gray-400 cursor-not-allowed"
											}`}>
											Document Link
										</button>
									</div>
									<div className="col-span-2">
										<button
											disabled={!source.access}
											className={`font-medium text-sm transition border border-blue-600 px-2 py-1 rounded ${
												source.access ?
													"text-blue-600 hover:text-blue-800 cursor-pointer hover:bg-blue-50"
												:	"text-gray-400 cursor-not-allowed border-gray-300"
											}`}>
											Request Access
										</button>
									</div>
								</>
							}
						</div>
					))}
				</div>
			</div>
			{/* Access Required panel for document-detail format and change-request (Document Id) table */}
			{(isDocumentDetailFormat || (isChangeRequestFormat && !isElluminate)) && (
				<div className="fixed bottom-0 mt-4 mb-4">
					<div className="w-full border rounded-lg bg-white shadow-sm grid grid-cols-12 items-center gap-4 px-6 py-4">
						<div className="col-span-10">
							<h3 className="font-semibold text-sm">Access Required</h3>
							<p className="text-sm text-gray-600 mt-2">
								If you don't currently have permission to view one or more
								documents, please request access to continue.
							</p>
						</div>
						<div className="col-span-2 text-right">
							<button className="bg-[#E31937] text-sm text-white px-4 py-2 rounded hover:bg-[#c9142f] transition">
								Request Access
							</button>
						</div>
					</div>
				</div>
			)}
		</>
		)
	}
	</>
	);
}

export default ResultsTable;
