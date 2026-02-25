import React, { useState, useEffect } from "react";
import { AIQueryService } from "../services/AIQueryService";

/**
 * Story Artifacts Display Component
 * Fetches and displays story and defect artifacts in a tabular format
 */
const StoryArtifactsDisplay = () => {
	const [artifacts, setArtifacts] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchArtifacts = async () => {
			setLoading(true);
			const result = await AIQueryService.getStoryArtifacts();

			if (result.success) {
				setArtifacts(result.data);
				setError(null);
			} else {
				setError(result.error);
				setArtifacts(null);
			}
			setLoading(false);
		};

		fetchArtifacts();
	}, []);

	if (loading) {
		return <div className="p-4 text-gray-500">Loading artifacts...</div>;
	}

	if (error) {
		return (
			<div className="p-4 text-red-500">Error loading artifacts: {error}</div>
		);
	}

	if (!artifacts || artifacts.length === 0) {
		return <div className="p-4 text-gray-500">No artifacts found</div>;
	}

	return (
		<div className="p-6 bg-white rounded-lg shadow">
			<h2 className="text-2xl font-bold mb-6">Story & Defect Artifacts</h2>

			{artifacts.map((section, index) => (
				<div key={index} className="mb-8">
					<h3 className="text-lg font-semibold mb-4 text-blue-600">
						{section.sheet_name}
					</h3>
					<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Edit</button>
					<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Download</button>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse border border-gray-300">
							<thead className="bg-gray-100">
								<tr>
									{section.data.length > 0 &&
										Object.keys(section.data[0]).map((key) => (
											<th
												key={key}
												className="border border-gray-300 px-4 py-2 text-left font-semibold">
												{key}
											</th>
										))}
								</tr>
							</thead>
							<tbody>
								{section.data.map((item, rowIndex) => (
									<tr
										key={rowIndex}
										className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
										{Object.values(item).map((value, cellIndex) => (
											<td
												key={cellIndex}
												className="border border-gray-300 px-4 py-2">
												{value}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			))}
		</div>
	);
};

export default StoryArtifactsDisplay;
