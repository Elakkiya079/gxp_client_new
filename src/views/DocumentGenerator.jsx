import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DocumentConfirmModal from "../components/DocumentConfirmModal";
import  AIQueryService  from "../services/AIQueryService";
import Header from "../components/Header";
export default function DocumentGenerator() {
	const navigate = useNavigate();
	const location = useLocation();
	const [docType, setDocType] = useState("");
	const [pendingDocType, setPendingDocType] = useState("");
	const [showConfirm, setShowConfirm] = useState(false);

	// we may receive AI response in location.state.aiResponse
	const aiResponse = location.state?.aiResponse;

	const handleCancel = () => {
		navigate(-1);
	};

	const handleProceed = (type) => {
		const chosen = type || docType;
		// set the confirmed type and navigate back for now
		setDocType(chosen);
		setShowConfirm(false);
		navigate(-1);
	};

	const handleSelectChange = (e) => {
		setDocType(e.target.value);
	};

	const handleCancelConfirm = () => {
		setPendingDocType("");
		setShowConfirm(false);
	};

	const [artifacts, setArtifacts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchArtifacts = async () => {
			setLoading(true);
			const result = await AIQueryService.getStoryArtifacts();
			if (result.success) {
				const data = Array.isArray(result.data.data) ? result.data.data : [];
				setArtifacts(data);
				setError(null);
			} else {
				setError(result.error);
				setArtifacts([]);
			}
			setLoading(false);
		};
		fetchArtifacts();
	}, []);

	const getPreferredColumns = (sheetName, sampleRow) => {
		const available = sampleRow ? Object.keys(sampleRow) : [];
		const normalized = String(sheetName || "").toLowerCase();

		const desired =
			normalized.includes("story") ? ["Key", "Summary", "Regulation", "Testing Activities", "Status"]
			: normalized.includes("defects introduced") ?
				["Key", "Summary", "T", "Status", "Environment"]
			: normalized.includes("defect") ? ["Key", "Summary", "T", "Status", "Environment"]
			: available;

		const set = new Set(available);
		const preferred = desired.filter((c) => set.has(c));
		const remaining = available.filter((c) => !preferred.includes(c));
		return [...preferred, ...remaining];
	};

	const getColumnWidthPct = (sheetName, column) => {
		const normalized = String(sheetName || "").toLowerCase();
		const col = String(column || "").toLowerCase();

		if (normalized.includes("story")) {
			if (col === "key") return 16;
			if (col === "summary") return 26;
			if (col === "regulation") return 10;
			if (col === "testing activities") return 36;
			if (col === "status") return 12;
			return undefined;
		}

		// defect + defects introduced
		if (col === "key") return 16;
		if (col === "summary") return 44;
		if (col === "t") return 8;
		if (col === "status") return 14;
		if (col === "environment") return 18;
		return undefined;
	};

	const renderEnvironmentCell = (sheetName, value) => {
		const normalized = String(sheetName || "").toLowerCase();
		if (!normalized.includes("defects introduced")) return <>{value}</>;

		return (
			<div className="flex items-center gap-2">
				<input
					readOnly
					value={value ?? ""}
					className="w-full max-w-[220px] bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
				/>
				<button
					type="button"
					className="w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-50"
					aria-label="Open environment item">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M7 3H14L18 7V21H7V3Z"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinejoin="round"
						/>
						<path
							d="M14 3V7H18"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinejoin="round"
						/>
						<path
							d="M9 12H16"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
						/>
						<path
							d="M9 16H16"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
						/>
					</svg>
				</button>
			</div>
		);
	};
	if (loading) {
		return <div className="p-4 text-gray-500">Loading artifacts...</div>;
	}

	if (error) {
		return (
			<div className="p-4 text-red-500">Error loading artifacts: {error}</div>
		);
	}

	if (!loading && (!artifacts || artifacts.length === 0)) {
		return <div className="p-4 text-gray-500">No artifacts found</div>;
	}

	return (
		<div className="min-h-screen bg-white flex flex-col">
			<Header />
			{/*<div className="flex flex-1 items-center justify-center px-4">
				<div className="w-full max-w-lg bg-white border rounded-lg shadow-sm">
					<div className="px-6 py-4 border-b">
						<h3 className="text-sm font-medium text-gray-700">
							Choose the document type to generate
						</h3>
					</div>
					<div className="p-6">
						<select
							className="w-full border rounded px-3 py-2 text-sm"
							value={docType}
							onChange={handleSelectChange}>
							<option value="">Choose the type</option>
							<option value="Agile Release Plan">Agile Release Plan</option>
							<option value="Waterfall Release Plan">
								Waterfall Release Plan
							</option>
						</select>

						<div className="flex justify-end gap-4 mt-6">
							<button className="text-red-600" onClick={handleCancel}>
								Cancel
							</button>
							<button
								className="bg-pink-400 text-white px-4 py-2 rounded"
								onClick={() => {
									if (!docType) return; // optional safety
									setPendingDocType(docType);
									setShowConfirm(true);
								}}>
								Proceed
							</button>
						</div>

						<DocumentConfirmModal
							show={showConfirm}
							docTypeLabel={pendingDocType || docType || "Document"}
							onConfirm={() => handleProceed(pendingDocType || docType)}
							onCancel={handleCancelConfirm}
						/>
					</div>
				</div>
			</div>*/}
			<div className="w-full max-w-6xl mx-auto px-8 py-20">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M15 18L9 12L15 6"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					back
				</button>

				<div className="mt-4 flex items-center justify-between gap-6">
					<h1 className="text-3xl font-semibold text-gray-900">Story Artifacts</h1>
					<div className="flex items-center gap-3">
						<button
							type="button"
							className="px-5 py-2 rounded-md border border-red-600 text-red-600 bg-white hover:bg-red-50 transition">
							Edit
						</button>
						<button
							type="button"
							className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition">
							Download
						</button>
					</div>
				</div>

				<div className="mt-8 space-y-10">
					{Array.isArray(artifacts) &&
						artifacts.map((section, index) => {
							const sheetName = section?.sheet_name;
							const rows = Array.isArray(section?.data) ? section.data : [];
							const sampleRow = rows[0];
							const columns = getPreferredColumns(sheetName, sampleRow);
							const hideHeading =
								String(sheetName || "").toLowerCase().trim() === "story artifacts";

							if (!rows.length) return null;

							return (
								<section key={`${sheetName || "section"}-${index}`}>
									{!hideHeading && (
										<h2 className="text-2xl font-semibold text-gray-900 mb-4">
											{sheetName}
										</h2>
									)}

									<div className="overflow-x-auto">
										{/* Header row (rounded gray bar) */}
										<table className="w-full table-fixed">
											<colgroup>
												{columns.map((col) => (
													<col
														key={`h-${col}`}
														style={{
															width:
																getColumnWidthPct(sheetName, col) ?
																	`${getColumnWidthPct(sheetName, col)}%`
																:	undefined,
														}}
													/>
												))}
											</colgroup>
											<thead>
												<tr>
													{columns.map((col, colIdx) => (
														<th
															key={col}
															scope="col"
															className={[
																"bg-gray-100 text-gray-700 text-sm font-semibold text-left px-6 py-4",
																colIdx === 0 ? "rounded-l-xl" : "",
																colIdx === columns.length - 1 ? "rounded-r-xl" : "",
															].join(" ")}>
															{col}
														</th>
													))}
												</tr>
											</thead>
										</table>

										{/* Body */}
										<table className="w-full table-fixed border-collapse">
											<colgroup>
												{columns.map((col) => (
													<col
														key={`b-${col}`}
														style={{
															width:
																getColumnWidthPct(sheetName, col) ?
																	`${getColumnWidthPct(sheetName, col)}%`
																:	undefined,
														}}
													/>
												))}
											</colgroup>
											<tbody className="divide-y divide-gray-200">
												{rows.map((item, rowIndex) => (
													<tr key={rowIndex} className="bg-white">
														{columns.map((col) => {
															const value = item?.[col];
															const isKey = String(col).toLowerCase() === "key";
															const isEnvironment =
																String(col).toLowerCase() === "environment";

															return (
																<td
																	key={`${rowIndex}-${col}`}
																	className={[
																		"px-6 py-5 text-sm text-gray-700 align-middle",
																		isKey ? "font-medium text-gray-900" : "",
																	].join(" ")}>
																	{isEnvironment ?
																		renderEnvironmentCell(sheetName, value)
																	:	value}
																</td>
															);
														})}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</section>
							);
						})}
				</div>
			</div>
		</div>
	);
}
