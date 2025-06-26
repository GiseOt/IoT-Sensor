import React, { useState, useEffect } from "react";
import {
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Box,
} from "@mui/material";

type SensorFiltersProps = {
	onFilterChange: (filters: {
		search: string;
		type: string;
		status: string;
	}) => void;
	sensors: { type: string; status: boolean }[];
};

const SensorFilters: React.FC<SensorFiltersProps> = ({
	onFilterChange,
	sensors,
}) => {
	const [search, setSearch] = useState("");
	const [type, setType] = useState("");
	const [status, setStatus] = useState("");

	const uniqueTypes = Array.from(new Set(sensors.map((s) => s.type)));
	const statusOptions = [
		{ label: "Activo", value: "true" },
		{ label: "Inactivo", value: "false" },
	];

	// Filtrar los sensores por tipo y estado
	useEffect(() => {
		onFilterChange({ search, type, status });
	}, [search, type, status, onFilterChange]);

	return (
		<Box
			sx={{
				display: "flex",
				gap: 2,
				mb: 2,
				maxWidth: 950,
				margin: "0 auto",
				paddingLeft: 2,
				paddingRight: 2,
			}}
		>
			<TextField
				label="Buscar (id, nombre, tipo)"
				variant="outlined"
				size="small"
				fullWidth
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<FormControl size="small" sx={{ minWidth: 120 }}>
				<InputLabel>Tipo</InputLabel>
				<Select
					value={type}
					label="Tipo"
					onChange={(e) => setType(e.target.value)}
				>
					<MenuItem value="">Todos</MenuItem>
					{uniqueTypes.map((t) => (
						<MenuItem key={t} value={t}>
							{t.charAt(0).toUpperCase() + t.slice(1)}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<FormControl size="small" sx={{ minWidth: 120 }}>
				<InputLabel>Estado</InputLabel>
				<Select
					value={status}
					label="Estado"
					onChange={(e) => setStatus(e.target.value)}
				>
					<MenuItem value="">Todos</MenuItem>
					{statusOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</Box>
	);
};

export default SensorFilters;
