import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AIQueryService from "../services/AIQueryService";
import Header from "../components/Header";

const EDITABLE_HEADINGS = new Set(["Document Guidelines", "Purpose", "Scope"]);

export default function DocumentGenerator() {
	const navigate = useNavigate();
	const location = useLocation();
	const selectedTemplate = location.state?.template || "Agile Release Plan";
	const [arpDocument, setArpDocument] = useState(null);
	const [artifacts, setArtifacts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [sectionEditState, setSectionEditState] = useState({});
	const [isGlobalEditing, setIsGlobalEditing] = useState(false);
	const docScrollRef = useRef(null);

	const backToChat = useCallback(() => {
		navigate(-1);
	}, [navigate]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				// For ARP we pass a template key understood by the backend
				const templateKey =
					selectedTemplate && selectedTemplate.toLowerCase().includes("agile") ?
						"arp"
					:	selectedTemplate;

				const result = await AIQueryService.getStoryArtifacts(templateKey);

				if (!result.success) {
					setError(result.error || "Failed to retrieve document");
					setArpDocument(null);
					setArtifacts([]);
					return;
				}

				const payload = result.data;

				// ARP JSON shape: { status, template, data: { document_metadata, sections } }
				if (payload?.data?.sections && Array.isArray(payload.data.sections)) {
					setArpDocument(payload.data);
					setArtifacts([]);
					return;
				}

				// Fallback to legacy artifacts shape used earlier (Story / Defect artifacts tables)
				const legacyData = Array.isArray(payload?.data) ? payload.data : [];
				setArtifacts(legacyData);
				setArpDocument(null);
			} catch (e) {
				setError(e?.message || "Unexpected error while loading document");
				setArpDocument(null);
				setArtifacts([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [selectedTemplate]);

	// Initialise editable content state when ARP document is loaded
	useEffect(() => {
		if (!arpDocument?.sections) return;

		const next = {};
		arpDocument.sections.forEach((section) => {
			if (section?.heading && EDITABLE_HEADINGS.has(section.heading)) {
				const content =
					typeof section.content === "string" ? section.content : "";
				next[section.heading] = {
					isEditing: false,
					value: content,
				};
			}
		});
		setSectionEditState(next);
	}, [arpDocument]);

	const handleGlobalEdit = useCallback(() => {
		setIsGlobalEditing(true);
		setSectionEditState((prev) => {
			const next = { ...prev };
			Object.keys(next).forEach((heading) => {
				next[heading] = { ...next[heading], isEditing: true };
			});
			return next;
		});
	}, []);

	const handleSave = useCallback(() => {
		if (!arpDocument?.sections) return;

		const updatedSections = arpDocument.sections.map((section) => {
			if (
				section?.heading &&
				EDITABLE_HEADINGS.has(section.heading) &&
				sectionEditState[section.heading]
			) {
				return {
					...section,
					content: sectionEditState[section.heading].value,
				};
			}
			return section;
		});

		setArpDocument((prev) =>
			prev ?
				{
					...prev,
					sections: updatedSections,
				}
			:	prev,
		);

		setSectionEditState((prev) => {
			const next = { ...prev };
			Object.keys(next).forEach((heading) => {
				next[heading] = { ...next[heading], isEditing: false };
			});
			return next;
		});
		setIsGlobalEditing(false);
	}, [arpDocument, sectionEditState]);

	const toggleSectionEdit = useCallback((heading) => {
		if (!heading) return;
		setSectionEditState((prev) => {
			if (!isGlobalEditing) return prev;
			const current = prev[heading] || { isEditing: false, value: "" };
			return {
				...prev,
				[heading]: { ...current, isEditing: !current.isEditing },
			};
		});
	}, [isGlobalEditing]);

	const updateSectionValue = useCallback((heading, value) => {
		setSectionEditState((prev) => {
			const current = prev[heading] || { isEditing: true, value: "" };
			return {
				...prev,
				[heading]: { ...current, value },
			};
		});
	}, []);

	const handleTocClick = useCallback((sectionId) => {
		const el = document.getElementById(sectionId);
		if (!el) return;

		const container = docScrollRef.current;

		// If the document is inside its own scroll container (preferred), scroll that container.
		if (container) {
			const offset = 24;
			const elRect = el.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			const targetTop =
				elRect.top - containerRect.top + container.scrollTop - offset;
			container.scrollTo({
				top: targetTop < 0 ? 0 : targetTop,
				behavior: "smooth",
			});
			return;
		}

		// Fallback: scroll the window.
		el.scrollIntoView({ behavior: "smooth", block: "start" });
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
	const renderGenericContent = (sectionHeading, content) => {
		if (content == null || content === "") {
			return (
				<p className="text-sm text-gray-500 italic">
					No details documented for this section.
				</p>
			);
		}

		if (typeof content === "string") {
			return <p className="text-sm leading-relaxed text-gray-800">{content}</p>;
		}

		if (Array.isArray(content)) {
			if (!content.length) {
				return (
					<p className="text-sm text-gray-500 italic">
						No entries available.
					</p>
				);
			}

			// Array of strings → bullet list (e.g. Table of Contents)
			if (typeof content[0] === "string") {
				return (
					<ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
						{content.map((item, idx) => (
							<li key={`${sectionHeading}-item-${idx}`}>{item}</li>
						))}
					</ul>
				);
			}

			// Array of objects → table (Story Artifacts, Defect Artifacts, Document Artifacts)
			if (typeof content[0] === "object" && content[0] !== null) {
				const columns = Object.keys(content[0]);

				return (
					<div className="overflow-x-auto border border-gray-200 rounded-lg">
						<table className="min-w-full border-collapse bg-white">
							<thead className="bg-gray-50">
								<tr>
									{columns.map((col) => (
										<th
											key={col}
											className="px-4 py-2 border-b text-xs font-semibold text-gray-700 text-left uppercase tracking-wide">
											{col}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{content.map((row, rowIdx) => (
									<tr
										key={`${sectionHeading}-row-${rowIdx}`}
										className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
										{columns.map((col) => (
											<td
												key={`${sectionHeading}-row-${rowIdx}-${col}`}
												className="px-4 py-2 border-t text-sm text-gray-800 align-top">
												{row[col] ?? ""}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				);
			}
		}

		return null;
	};

	const renderSection = (section, index) => {
		const id =
			section?.heading ?
				section.heading.toLowerCase().replace(/\s+/g, "-")
			:	`section-${index}`;

		const heading = section?.heading || "";
		const isEditableHeading = EDITABLE_HEADINGS.has(heading);
		const editState = isEditableHeading ? sectionEditState[heading] : null;
		const isEditing = Boolean(editState?.isEditing);
		const editableValue =
			editState?.value ??
			(typeof section.content === "string" ? section.content : "");

		if (section?.subsections && Array.isArray(section.subsections)) {
			return (
				<section key={id} id={id} className="mb-10 scroll-mt-8">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						{section.heading}
					</h2>
					<div className="space-y-5">
						{section.subsections.map((sub, subIdx) => (
							<div key={`${id}-sub-${subIdx}`} className="space-y-2">
								<h3 className="text-sm font-semibold text-gray-800">
									{sub.subheading}
								</h3>
								{renderGenericContent(sub.subheading, sub.content)}
							</div>
						))}
					</div>
				</section>
			);
		}

		if (isEditableHeading) {
			return (
				<section key={id} id={id} className="mb-10 scroll-mt-8">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-semibold text-gray-900">
							{heading}
						</h2>
						<button
							type="button"
							onClick={() => toggleSectionEdit(heading)}
							disabled={!isGlobalEditing}
							className={`inline-flex items-center gap-1 text-xs ${
								isGlobalEditing ?
									"text-gray-600 hover:text-red-600"
								:	"text-gray-300 cursor-not-allowed"
							}`}>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M4 21H20"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinecap="round"
								/>
								<path
									d="M15.5 3.5L20.5 8.5L9 20H4V15L15.5 3.5Z"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinejoin="round"
								/>
							</svg>
							<span>{isEditing ? "Done" : "Edit"}</span>
						</button>
					</div>

					{isEditing ?
						<textarea
							value={editableValue}
							onChange={(e) => updateSectionValue(heading, e.target.value)}
							rows={4}
							className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
						/>
					:	<p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
							{editableValue || "No details documented for this section."}
						</p>
					}
				</section>
			);
		}

		return (
			<section key={id} id={id} className="mb-10 scroll-mt-8">
				<h2 className="text-lg font-semibold text-gray-900 mb-3">
					{section.heading}
				</h2>
				{renderGenericContent(section.heading, section.content)}
			</section>
		);
	};

	const tocSections = useMemo(() => {
		if (!arpDocument?.sections) return [];
		return arpDocument.sections.map((section, index) => {
			const id =
				section?.heading ?
					section.heading.toLowerCase().replace(/\s+/g, "-")
				:	`section-${index}`;
			return {
				id,
				title: section.heading || `Section ${index + 1}`,
				number: `${index + 1}.0`,
			};
		});
	}, [arpDocument]);

	return (
		<div className="min-h-screen bg-white flex flex-col">
			<Header />
			{/* Offset for fixed header (h-16) */}
			<div className="pt-16">
				{arpDocument ?
					<div className="h-[calc(100vh-4rem)] flex">
						{/* Full-height left sidebar */}
						<aside className="w-72 border-r border-gray-200 bg-white overflow-y-auto">
							<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
								<h2 className="text-sm font-semibold text-gray-900">
									Table of Contents
								</h2>
								{/*<span className="text-xs text-gray-400">|&lt;-</span>*/}
							</div>

							<nav className="divide-y divide-gray-100">
								{tocSections.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => handleTocClick(item.id)}
										className="w-full flex items-center justify-between px-4 py-3 text-xs text-gray-800 hover:bg-gray-50 hover:text-red-600">
										<span className="flex items-center gap-2">
											<span className="text-[11px] font-medium text-gray-500">
												{item.number}
											</span>
											<span className="text-left">{item.title}</span>
										</span>
										{/*<span className="text-[10px] text-gray-400">▾</span>*/}
									</button>
								))}
							</nav>
						</aside>

						{/* Scrollable document panel */}
						<main ref={docScrollRef} className="flex-1 overflow-y-auto bg-white">
							<div className="max-w-5xl mx-auto px-8 py-8">
								{/*<button
									type="button"
									onClick={backToChat}
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
									Back to chat
								</button>*/}

								{loading ?
									<div className="mt-10 text-gray-500 text-sm">
										Loading document...
									</div>
								: error ?
									<div className="mt-10 text-red-500 text-sm">
										Failed to load document: {error}
									</div>
								:	<>
										{/* Title and actions aligned horizontally */}
										<div className="mt-6 mb-4 flex items-start justify-between gap-4">
											<div>
												<p className="text-xs uppercase tracking-wide text-gray-500">
													Agile Release Plan
												</p>
												<h1 className="text-2xl font-semibold text-gray-900 mt-1">
													{arpDocument.document_metadata?.document_title ||
														"Agile Release Plan"}
												</h1>
											</div>
											<div className="flex items-center gap-3">
												<button
													type="button"
													onClick={handleSave}
													className="px-4 py-2 rounded-md border border-red-600 text-red-600 bg-white hover:bg-red-50 text-xs font-medium">
													Save
												</button>
												<button
													type="button"
													onClick={handleGlobalEdit}
													className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs font-medium">
													Edit
												</button>
											</div>
										</div>

										{/* Document header metadata in table format */}
										<div className="mb-6">
											<div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
												<table className="w-full text-sm">
													<tbody>
														<tr className="border-b border-gray-200">
															<th className="w-40 px-4 py-2 text-left font-semibold text-gray-700 bg-gray-50">
																Document ID
															</th>
															<td className="px-4 py-2 text-gray-900">
																{arpDocument.document_metadata?.document_id || "—"}
															</td>
														</tr>
														<tr className="border-b border-gray-200">
															<th className="px-4 py-2 text-left font-semibold text-gray-700 bg-gray-50">
																Version
															</th>
															<td className="px-4 py-2 text-gray-900">
																{arpDocument.document_metadata?.document_version ||
																	"—"}
															</td>
														</tr>
														<tr>
															<th className="px-4 py-2 text-left font-semibold text-gray-700 bg-gray-50">
																CR Number
															</th>
															<td className="px-4 py-2 text-gray-900">
																{arpDocument.document_metadata?.cr_number || "—"}
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>

										<div className="border border-gray-200 rounded-lg bg-white p-6">
											{arpDocument.sections?.map((section, index) =>
												renderSection(section, index),
											)}
										</div>
									</>
								}
							</div>
						</main>
					</div>
				: loading ?
					<div className="w-full max-w-6xl mx-auto px-8 py-10">
						<div className="mt-10 text-gray-500 text-sm">Loading document...</div>
					</div>
				: error ?
					<div className="w-full max-w-6xl mx-auto px-8 py-10">
						<div className="mt-10 text-red-500 text-sm">
							Failed to load document: {error}
						</div>
					</div>
				: Array.isArray(artifacts) && artifacts.length > 0 ?
					<div className="w-full max-w-6xl mx-auto px-8 py-10">
						<div className="flex items-center justify-between gap-6 mb-6">
							<h1 className="text-2xl font-semibold text-gray-900">
								Story Artifacts
							</h1>
							<div className="flex items-center gap-3">
								<button
									type="button"
									className="px-5 py-2 rounded-md border border-red-600 text-red-600 bg-white hover:bg-red-50 transition text-xs font-medium">
									Edit
								</button>
								<button
									type="button"
									className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-xs font-medium">
									Download
								</button>
							</div>
						</div>

						<div className="space-y-10">
							{artifacts.map((section, index) => {
								const sheetName = section?.sheet_name;
								const rows = Array.isArray(section?.data) ? section.data : [];
								const sampleRow = rows[0];
								const columns = getPreferredColumns(sheetName, sampleRow);
								const hideHeading =
									String(sheetName || "").toLowerCase().trim() ===
									"story artifacts";

								if (!rows.length) return null;

								return (
									<section key={`${sheetName || "section"}-${index}`}>
										{!hideHeading && (
											<h2 className="text-lg font-semibold text-gray-900 mb-4">
												{sheetName}
											</h2>
										)}

										<div className="overflow-x-auto">
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
																	colIdx === columns.length - 1 ?
																		"rounded-r-xl"
																	:	"",
																].join(" ")}>
																{col}
															</th>
														))}
													</tr>
												</thead>
											</table>

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
																const isKey =
																	String(col).toLowerCase() === "key";
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
				:	<div className="w-full max-w-6xl mx-auto px-8 py-10">
						<div className="mt-10 text-gray-500 text-sm">
							No document data available.
						</div>
					</div>
				}
			</div>
		</div>
	);
}
