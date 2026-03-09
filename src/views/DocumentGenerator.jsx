import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AIQueryService from "../services/AIQueryService";
import Header from "../components/Header";

export default function DocumentGenerator() {
	const navigate = useNavigate();
	const location = useLocation();
	const selectedTemplate = location.state?.template || "Agile Release Plan";

	const [arpDocument, setArpDocument] = useState(null);
	const [artifacts, setArtifacts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isGlobalEditing, setIsGlobalEditing] = useState(false);
	const [metadataEdits, setMetadataEdits] = useState({});

	const docScrollRef = useRef(null);
	const editableRef = useRef(null);

	// ─────────────────────────────────────────────────────────────────────────
	// Data fetching
	// ─────────────────────────────────────────────────────────────────────────
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				const templateKey =
					selectedTemplate && selectedTemplate.toLowerCase().includes("agile") ?
						"arp"
					:	selectedTemplate;

				const result = await AIQueryService.getStoryArtifacts(templateKey);
				console.log("DocumentGenerator result →", result);

				if (!result.success) {
					setError(result.error || "Failed to retrieve document");
					setArpDocument(null);
					setArtifacts([]);
					return;
				}

				const payload = result.data;

				// ── NEW payload shape ──────────────────────────────────────────────
				// { status, data: { template_json[], document_metadata, … } }
				if (
					payload?.data?.template_json &&
					Array.isArray(payload.data.template_json)
				) {
					setArpDocument({
						document_metadata: payload.data.document_metadata,
						template_name: payload.data.template_name,
						doc_type: payload.data.doc_type,
						// normalise to `sections` so everything downstream stays uniform
						sections: payload.data.template_json,
					});
					setArtifacts([]);
					return;
				}
				console.log(arpDocument, "arpDocume");
				// ── Legacy: sections[] already present ────────────────────────────
				if (payload?.data?.sections && Array.isArray(payload.data.sections)) {
					setArpDocument(payload.data);
					setArtifacts([]);
					return;
				}

				// ── Oldest legacy: flat array of sheet artifacts ───────────────────
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

	// ─────────────────────────────────────────────────────────────────────────
	// Metadata helper
	// New payload:   document_metadata.fields = [{ label, value, source }]
	// Legacy:        document_metadata.document_id / .document_version / …
	// ─────────────────────────────────────────────────────────────────────────
	const getMetadataValue = useCallback(
		(label) => {
			if (!arpDocument?.document_metadata) return "";
			if (Array.isArray(arpDocument.document_metadata.fields)) {
				const field = arpDocument.document_metadata.fields.find(
					(f) => f.label === label,
				);
				return field?.value || "";
			}
			const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
			return arpDocument.document_metadata?.[key] || "";
		},
		[arpDocument],
	);

	// ─────────────────────────────────────────────────────────────────────────
	// Edit / Save  (whole-document contentEditable)
	// ─────────────────────────────────────────────────────────────────────────
	const handleGlobalEdit = useCallback(() => {
		if (!editableRef.current) return;
		setIsGlobalEditing(true);
		setTimeout(() => editableRef.current?.focus(), 0);
	}, []);

	const handleSave = useCallback(() => {
		if (editableRef.current && arpDocument?.sections) {
			const sectionEls = editableRef.current.querySelectorAll(
				"[data-section-heading]",
			);
			const updatedSections = [...arpDocument.sections];
			sectionEls.forEach((el) => {
				const heading = el.getAttribute("data-section-heading");
				const contentEl = el.querySelector("[data-section-content]");
				if (!contentEl) return;
				const idx = updatedSections.findIndex((s) => s.heading === heading);
				if (idx === -1) return;
				if (typeof updatedSections[idx].content === "string") {
					updatedSections[idx] = {
						...updatedSections[idx],
						content: contentEl.innerText,
					};
				}
			});
			setArpDocument((prev) =>
				prev ? { ...prev, sections: updatedSections } : prev,
			);
		}
		setIsGlobalEditing(false);
	}, [arpDocument]);

	// ─────────────────────────────────────────────────────────────────────────
	// Guard: prevent Backspace/Delete/typing from affecting locked nodes
	// Locked nodes: h2 headings, h3 subheadings, th column headers (data-locked)
	// ─────────────────────────────────────────────────────────────────────────
	const handleEditableKeyDown = useCallback(
		(e) => {
			if (!isGlobalEditing) return;

			const sel = window.getSelection();
			if (!sel || sel.rangeCount === 0) return;
			const range = sel.getRangeAt(0);

			// Walk up to check if a node is inside a locked element
			const isInsideLocked = (node) => {
				let n = node;
				while (n && n !== editableRef.current) {
					if (
						n.nodeType === 1 &&
						n.getAttribute &&
						n.getAttribute("data-locked") === "true"
					)
						return true;
					n = n.parentNode;
				}
				return false;
			};

			// If cursor/selection is inside a locked element, block ALL keystrokes
			if (
				isInsideLocked(range.startContainer) ||
				isInsideLocked(range.endContainer)
			) {
				e.preventDefault();
				return;
			}

			// For Backspace/Delete: also check if the adjacent node about to be consumed is locked
			if (e.key !== "Backspace" && e.key !== "Delete") return;

			// If there's a non-collapsed selection, check if it contains a locked node
			if (!range.collapsed) {
				const frag = range.cloneContents();
				if (frag.querySelector("[data-locked='true']")) {
					e.preventDefault();
				}
				return;
			}

			const { startContainer, startOffset } = range;

			// Backspace: cursor at position 0 in its container — the previous sibling may be locked
			if (e.key === "Backspace" && startOffset === 0) {
				// Find what's immediately before the cursor in the DOM
				let prev = startContainer.previousSibling;
				if (
					!prev &&
					startContainer.parentNode &&
					startContainer.parentNode !== editableRef.current
				) {
					prev = startContainer.parentNode.previousSibling;
				}
				if (prev && prev.nodeType === 1) {
					if (
						prev.getAttribute("data-locked") === "true" ||
						prev.querySelector("[data-locked='true']")
					) {
						e.preventDefault();
					}
				}
			}

			// Delete: cursor at end of its text node — the next sibling may be locked
			if (e.key === "Delete") {
				const atEnd =
					startContainer.nodeType === 3 ?
						startOffset === startContainer.length
					:	startOffset === startContainer.childNodes.length;
				if (atEnd) {
					let next = startContainer.nextSibling;
					if (
						!next &&
						startContainer.parentNode &&
						startContainer.parentNode !== editableRef.current
					) {
						next = startContainer.parentNode.nextSibling;
					}
					if (next && next.nodeType === 1) {
						if (
							next.getAttribute("data-locked") === "true" ||
							next.querySelector("[data-locked='true']")
						) {
							e.preventDefault();
						}
					}
				}
			}
		},
		[isGlobalEditing],
	);

	// ─────────────────────────────────────────────────────────────────────────
	// TOC scroll
	// ─────────────────────────────────────────────────────────────────────────
	const handleTocClick = useCallback((sectionId) => {
		const el = document.getElementById(sectionId);
		if (!el) return;
		const container = docScrollRef.current;
		const headerEl = document.querySelector("header");
		const headerHeight =
			headerEl ? headerEl.getBoundingClientRect().height : 64;
		if (container) {
			const offset = headerHeight + 8;
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
		window.scrollTo({
			top: window.scrollY + el.getBoundingClientRect().top - headerHeight - 8,
			behavior: "smooth",
		});
	}, []);

	// ─────────────────────────────────────────────────────────────────────────
	// Content renderer  — handles all section types in the new payload
	// ─────────────────────────────────────────────────────────────────────────
	const renderContent = (heading, section) => {
		const { type, content, columns, rows } = section;

		// ── TABLE ──────────────────────────────────────────────────────────────
		if (type === "table" && Array.isArray(columns) && Array.isArray(rows)) {
			// Hide rows where every cell is "NA" / null / ""
			const visibleRows = rows.filter((row) => {
				const cells = Array.isArray(row) ? row : Object.values(row);
				return !cells.every(
					(c) => c === "NA" || c === null || c === "" || c === undefined,
				);
			});

			if (visibleRows.length === 0) {
				return (
					<p className="text-sm text-gray-500 italic">No entries available.</p>
				);
			}

			return (
				<div className="overflow-x-auto border border-gray-200 rounded-lg">
					<table className="min-w-full border-collapse bg-white">
						<thead className="bg-gray-50">
							<tr>
								{columns.map((col) => (
									<th
										key={col}
										data-locked="true"
										contentEditable={false}
										suppressContentEditableWarning
										className="px-4 py-2 border-b text-xs font-semibold text-gray-700 text-left uppercase tracking-wide whitespace-nowrap">
										{col}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{visibleRows.map((row, rowIdx) => (
								<tr
									key={`${heading}-row-${rowIdx}`}
									className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
									{columns.map((col, colIdx) => {
										// rows can be array-of-arrays OR array-of-objects
										const cell =
											Array.isArray(row) ?
												(row[colIdx] ?? "")
											:	(row[col] ?? "");
										return (
											<td
												key={`${heading}-${rowIdx}-${colIdx}`}
												className="px-4 py-2 border-t text-sm text-gray-800 align-top">
												{cell !== "" && cell !== null ?
													cell
												:	<span className="text-gray-400">—</span>}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		// ── ORDERED LIST ───────────────────────────────────────────────────────
		if (type === "ordered_list") {
			const raw =
				typeof content === "string" ?
					content.split("\n").filter((l) => l.trim())
				: Array.isArray(content) ? content
				: [];

			if (raw.length === 0) {
				return <p className="text-sm text-gray-500 italic">No steps listed.</p>;
			}

			return (
				<ol className="list-decimal list-outside ml-5 space-y-1 text-sm text-gray-800">
					{raw.map((item, idx) => (
						<li key={`${heading}-step-${idx}`}>
							{String(item)
								.replace(/^\d+\.\s*/, "")
								.trim()}
						</li>
					))}
				</ol>
			);
		}

		// ── AUTO TOC (inline, clickable, non-editable) ────────────────────────
		if (type === "auto_toc") {
			const TOC_ITEMS = [
				"Document Guidelines",
				"Document Control",
				"Purpose",
				"Scope",
				"Story Artifacts",
				"Defect Artifacts",
				"Defects/Bugs Introduced in this Release",
				"Document Artifacts",
				"Installation Guide",
				"DOD Activities",
				"Release Summary",
				"Attachments",
			];
			return (
				<ul
					data-locked="true"
					contentEditable={false}
					suppressContentEditableWarning
					className="space-y-1 text-sm">
					{TOC_ITEMS.map((title, idx) => {
						const id = title.toLowerCase().replace(/\s+/g, "-");
						return (
							<li key={id} className="flex items-baseline gap-2">
								<span className="text-gray-500 text-xs w-6 flex-shrink-0 font-medium">
									{idx + 1}.
								</span>
								<button
									type="button"
									onClick={() => handleTocClick(id)}
									className="text-blue-600 hover:underline text-left">
									{title}
								</button>
							</li>
						);
					})}
				</ul>
			);
		}

		// ── ATTACHMENTS ────────────────────────────────────────────────────────
		if (type === "attachments") {
			return (
				<p className="text-sm text-gray-500 italic">
					No attachments available.
				</p>
			);
		}

		// ── TEXT / FALLBACK ────────────────────────────────────────────────────
		if (!content || content === "NA") {
			return (
				<p className="text-sm text-gray-500 italic">
					No details documented for this section.
				</p>
			);
		}

		if (typeof content === "string") {
			return (
				<p
					data-section-content
					className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
					{content}
				</p>
			);
		}

		if (Array.isArray(content) && typeof content[0] === "string") {
			return (
				<ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
					{content.map((item, idx) => (
						<li key={`${heading}-item-${idx}`}>{item}</li>
					))}
				</ul>
			);
		}

		return null;
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Section renderer
	// ─────────────────────────────────────────────────────────────────────────
	const renderSection = (section, index) => {
		const id =
			section?.heading ?
				section.heading.toLowerCase().replace(/\s+/g, "-")
			:	`section-${index}`;
		const heading = section?.heading || "";

		// Section with subsections
		if (Array.isArray(section?.subsections) && section.subsections.length > 0) {
			return (
				<section
					key={id}
					id={id}
					data-section-heading={heading}
					className="mb-10 scroll-mt-16">
					<h2
						data-locked="true"
						contentEditable={false}
						suppressContentEditableWarning
						className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
						{heading}
					</h2>
					{section.description &&
						section.description !== "NA" &&
						section.content &&
						section.content !== "NA" && (
							<p
								contentEditable={false}
								suppressContentEditableWarning
								className="text-sm text-gray-500 italic mb-4">
								{section.description}
							</p>
						)}
					<div className="space-y-6">
						{section.subsections.map((sub, subIdx) => (
							<div key={`${id}-sub-${subIdx}`} className="space-y-2">
								<h3
									data-locked="true"
									contentEditable={false}
									suppressContentEditableWarning
									className="text-sm font-semibold text-gray-800">
									{sub.subheading}
								</h3>
								{sub.description &&
									sub.description !== "NA" &&
									sub.content &&
									sub.content !== "NA" && (
										<p
											contentEditable={false}
											suppressContentEditableWarning
											className="text-sm text-gray-500 italic mb-1">
											{sub.description}
										</p>
									)}
								{renderContent(sub.subheading, sub)}
							</div>
						))}
					</div>
				</section>
			);
		}

		// Leaf section
		return (
			<section
				key={id}
				id={id}
				data-section-heading={heading}
				className="mb-10 scroll-mt-16">
				<h2
					data-locked="true"
					contentEditable={false}
					suppressContentEditableWarning
					className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">
					{heading}
				</h2>
				{section.description &&
					section.description !== "NA" &&
					section.content &&
					section.content !== "NA" && (
						<p
							contentEditable={false}
							suppressContentEditableWarning
							className="text-sm text-gray-500 italic mb-3">
							{section.description}
						</p>
					)}
				{renderContent(heading, section)}
			</section>
		);
	};

	// TOC items — skip the auto_toc entry itself
	const tocSections = useMemo(() => {
		if (!arpDocument?.sections) return [];
		return arpDocument.sections
			.filter((s) => s.type !== "auto_toc")
			.map((section, index) => {
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

	// Legacy artifact table helpers
	const getPreferredColumns = (sheetName, sampleRow) => {
		const available = sampleRow ? Object.keys(sampleRow) : [];
		const normalized = String(sheetName || "").toLowerCase();
		const desired =
			normalized.includes("story") ?
				["Key", "Summary", "Regulation", "Testing Activities", "Status"]
			: (
				normalized.includes("defects introduced") ||
				normalized.includes("defect")
			) ?
				["Key", "Summary", "T", "Status", "Environment"]
			:	available;
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
		}
		if (col === "key") return 16;
		if (col === "summary") return 44;
		if (col === "t") return 8;
		if (col === "status") return 14;
		if (col === "environment") return 18;
		return undefined;
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-white flex flex-col">
			<Header />
			<div className="pt-16">
				{/* ── ARP Document ── */}
				{arpDocument ?
					<div className="h-[calc(100vh-4rem)] flex">
						{/* Sidebar */}
						<aside className="w-72 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
							<div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
								<h2 className="text-sm font-semibold text-gray-900">
									Table of Contents
								</h2>
							</div>
							<nav className="divide-y divide-gray-100">
								{tocSections.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => handleTocClick(item.id)}
										className="w-full flex items-center gap-2 px-4 py-3 text-xs text-gray-800 hover:bg-gray-50 hover:text-red-600 text-left">
										<span className="text-[11px] font-medium text-gray-400 w-8 flex-shrink-0">
											{item.number}
										</span>
										<span>{item.title}</span>
									</button>
								))}
							</nav>
						</aside>

						{/* Document panel */}
						<main
							ref={docScrollRef}
							className="flex-1 overflow-y-auto bg-white">
							<div className="max-w-5xl mx-auto px-8 py-8">
								{loading ?
									<div className="mt-10 text-gray-500 text-sm">
										Loading document...
									</div>
								: error ?
									<div className="mt-10 text-red-500 text-sm">
										Failed to load document: {error}
									</div>
								:	<>
										{/* Title + actions */}
										<div className="mt-6 mb-4 flex items-start justify-between gap-4">
											<div>
												<p className="text-xs uppercase tracking-wide text-gray-500">
													{arpDocument.doc_type || "Agile Release Plan"}
												</p>
												<h1 className="text-2xl font-semibold text-gray-900 mt-1">
													{getMetadataValue("Document Title") ||
														arpDocument.template_name ||
														"Agile Release Plan"}
												</h1>
											</div>
											<div className="flex items-center gap-3 flex-shrink-0">
												{isGlobalEditing ?
													<button
														type="button"
														onClick={handleSave}
														className="px-4 py-2 rounded-md border border-red-600 text-red-600 bg-white hover:bg-red-50 text-xs font-medium">
														Save
													</button>
												:	<button
														type="button"
														onClick={handleGlobalEdit}
														className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs font-medium">
														Edit
													</button>
												}
											</div>
										</div>

										{/* Metadata table — editable Document ID / Version / Title */}
										<div className="mb-8">
											<div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
												<table className="w-full text-sm">
													<tbody>
														{(
															Array.isArray(
																arpDocument.document_metadata?.fields,
															)
														) ?
															arpDocument.document_metadata.fields.map(
																(field) => (
																	<tr
																		key={field.label}
																		className="border-b border-gray-200 last:border-0">
																		<th className="w-44 px-4 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50 whitespace-nowrap">
																			{field.label}
																		</th>
																		<td className="px-4 py-2 text-gray-900 text-sm">
																			{isGlobalEditing ?
																				<input
																					type="text"
																					value={
																						(
																							metadataEdits[field.label] !==
																							undefined
																						) ?
																							metadataEdits[field.label]
																						:	field.value || ""
																					}
																					onChange={(e) =>
																						setMetadataEdits((prev) => ({
																							...prev,
																							[field.label]: e.target.value,
																						}))
																					}
																					placeholder={`Enter ${field.label}`}
																					className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder-gray-400"
																				/>
																			:	<span>
																					{(
																						metadataEdits[field.label] !==
																						undefined
																					) ?
																						metadataEdits[field.label]
																					:	field.value || (
																							<span className="text-gray-400">
																								—
																							</span>
																						)
																					}
																				</span>
																			}
																		</td>
																	</tr>
																),
															)
														:	/* Legacy flat metadata fallback */
															<>
																{[
																	"Document ID",
																	"Document Version",
																	"Document Title",
																].map((label, i, arr) => (
																	<tr
																		key={label}
																		className={
																			i < arr.length - 1 ?
																				"border-b border-gray-200"
																			:	""
																		}>
																		<th className="w-44 px-4 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50">
																			{label}
																		</th>
																		<td className="px-4 py-2 text-gray-900 text-sm">
																			{isGlobalEditing ?
																				<input
																					type="text"
																					value={
																						metadataEdits[label] !== undefined ?
																							metadataEdits[label]
																						:	getMetadataValue(label) || ""
																					}
																					onChange={(e) =>
																						setMetadataEdits((prev) => ({
																							...prev,
																							[label]: e.target.value,
																						}))
																					}
																					placeholder={`Enter ${label}`}
																					className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder-gray-400"
																				/>
																			:	<span>
																					{metadataEdits[label] !== undefined ?
																						metadataEdits[label]
																					:	getMetadataValue(label) || (
																							<span className="text-gray-400">
																								—
																							</span>
																						)
																					}
																				</span>
																			}
																		</td>
																	</tr>
																))}
															</>
														}
													</tbody>
												</table>
											</div>
										</div>

										{/* Document body — contentEditable in edit mode */}
										<div
											ref={editableRef}
											contentEditable={isGlobalEditing}
											suppressContentEditableWarning
											onKeyDown={handleEditableKeyDown}
											className={[
												"border border-gray-200 rounded-lg bg-white p-6 outline-none transition-shadow",
												isGlobalEditing ?
													"ring-2 ring-red-400 ring-offset-1 cursor-text"
												:	"",
											].join(" ")}>
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
						<div className="mt-10 text-gray-500 text-sm">
							Loading document...
						</div>
					</div>
				: error ?
					<div className="w-full max-w-6xl mx-auto px-8 py-10">
						<div className="mt-10 text-red-500 text-sm">
							Failed to load document: {error}
						</div>
					</div>
				: Array.isArray(artifacts) && artifacts.length > 0 ?
					/* ── Legacy sheet-artifacts layout ── */
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
									String(sheetName || "")
										.toLowerCase()
										.trim() === "story artifacts";
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
																const isEnv =
																	String(col).toLowerCase() === "environment";
																return (
																	<td
																		key={`${rowIndex}-${col}`}
																		className={[
																			"px-6 py-5 text-sm text-gray-700 align-middle",
																			isKey ? "font-medium text-gray-900" : "",
																		].join(" ")}>
																		{isEnv ?
																			<input
																				readOnly
																				value={value ?? ""}
																				className="w-full max-w-[220px] bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
																			/>
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
